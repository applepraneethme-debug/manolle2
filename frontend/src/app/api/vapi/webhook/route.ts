import { type NextRequest, NextResponse } from "next/server";
import {
  createServiceSupabase,
  extractAppointment,
  buildFeedbackSummary,
  getCallId,
  getDurationSeconds,
  getNestedString,
  getRecordingUrl,
  getStructuredData,
  getSummary,
  getTranscript,
  mapVapiStatus,
  type VapiMessage,
} from "@/lib/server/calling";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const expected = process.env.VAPI_WEBHOOK_SECRET;
  if (!expected) return true;

  const authorization = request.headers.get("authorization") || "";
  const vapiSecret = request.headers.get("x-vapi-secret") || "";
  const querySecret = request.nextUrl.searchParams.get("secret") || "";
  return (
    authorization === `Bearer ${expected}` ||
    vapiSecret === expected ||
    querySecret === expected
  );
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const message = (body?.message || body || {}) as VapiMessage;
  const type = message.type || "";

  if (type !== "end-of-call-report") {
    return NextResponse.json({ ok: true, ignored: type || "unknown" });
  }

  const vapiCallId = getCallId(message);
  const leadId =
    getNestedString(message, ["call", "metadata", "leadId"]) ||
    getNestedString(message, ["call", "metadata", "lead_id"]);
  const userId =
    getNestedString(message, ["call", "metadata", "userId"]) ||
    getNestedString(message, ["call", "metadata", "user_id"]);
  const organizationId =
    getNestedString(message, ["call", "metadata", "organizationId"]) ||
    getNestedString(message, ["call", "metadata", "organization_id"]) ||
    getNestedString(message, ["call", "metadata", "orgId"]) ||
    getNestedString(message, ["call", "metadata", "org_id"]);
  const assistantId =
    getNestedString(message, ["call", "assistantId"]) ||
    getNestedString(message, ["call", "assistant", "id"]) ||
    getNestedString(message, ["assistantId"]);
  const campaignId =
    getNestedString(message, ["call", "metadata", "campaignId"]) ||
    getNestedString(message, ["call", "metadata", "campaign_id"]);

  if (!vapiCallId && !leadId) {
    return NextResponse.json(
      { error: "Webhook did not include a Vapi call id or lead id" },
      { status: 400 }
    );
  }

  const supabase = createServiceSupabase();
  let resolvedOrgId = organizationId || null;
  if (!resolvedOrgId && assistantId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("vapi_assistant_id", assistantId)
      .maybeSingle();
    resolvedOrgId = org?.id || null;
  }

  const transcript = getTranscript(message);
  const structuredData = getStructuredData(message);
  const appointment = extractAppointment(
    structuredData,
    `${getSummary(message)}\n${transcript}`
  );
  const summary = buildFeedbackSummary(
    getSummary(message),
    transcript,
    structuredData,
    appointment
  );
  const status = mapVapiStatus(message);
  const duration = getDurationSeconds(message);
  const recordingUrl = getRecordingUrl(message);

  const updatePayload = {
    user_id: userId,
    lead_id: leadId,
    organization_id: resolvedOrgId,
    org_id: resolvedOrgId,
    duration,
    status,
    transcript,
    recording_url: recordingUrl || null,
    summary,
    vapi_call_id: vapiCallId || null,
    vapi_payload: body,
  };

  const cleanedUpdate = Object.fromEntries(
    Object.entries(updatePayload).filter(([, value]) => value !== undefined)
  );

  let callLogId: string | undefined;
  if (vapiCallId) {
    const { data: updated, error: updateError } = await supabase
      .from("call_logs")
      .update(cleanedUpdate)
      .eq("vapi_call_id", vapiCallId)
      .select("id")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    callLogId = updated?.id;
  }

  if (!callLogId && userId) {
    const { data: inserted, error: insertError } = await supabase
      .from("call_logs")
      .insert(cleanedUpdate)
      .select("id")
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    callLogId = inserted.id;
  }

  if (leadId) {
    await supabase
      .from("leads")
      .update({ status: status === "completed" ? "qualified" : "contacted" })
      .eq("id", leadId);
  }

  if (appointment.booked && appointment.date && appointment.time && leadId && userId) {
    const { data: lead } = await supabase
      .from("leads")
      .select("name,phone")
      .eq("id", leadId)
      .maybeSingle();

    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("lead_id", leadId)
      .eq("appointment_date", appointment.date)
      .eq("appointment_time", appointment.time)
      .maybeSingle();

    if (!existing) {
      await supabase.from("appointments").insert({
        user_id: userId,
        organization_id: resolvedOrgId,
        org_id: resolvedOrgId,
        lead_id: leadId,
        title: `${appointment.type === "clinic" ? "Clinic visit" : appointment.type === "consultation" ? "Consultation" : appointment.type === "demo" ? "Demo" : "Appointment"} - ${lead?.name || "Lead"}`,
        appointment_date: appointment.date,
        appointment_time: appointment.time,
        type: appointment.type,
        status: "scheduled",
        notes: [
          summary,
          lead?.phone ? `Phone: ${lead.phone}` : "",
          callLogId ? `Call ID: ${callLogId}` : "",
          vapiCallId ? `Vapi Call ID: ${vapiCallId}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });
    }

    await supabase.from("leads").update({ status: "booked" }).eq("id", leadId);

    if (campaignId) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("appointments_booked")
        .eq("id", campaignId)
        .maybeSingle();

      if (campaign) {
        await supabase
          .from("campaigns")
          .update({ appointments_booked: (campaign.appointments_booked || 0) + 1 })
          .eq("id", campaignId);
      }
    }
  }

  if (resolvedOrgId && userId) {
    await supabase.from("usage_events").insert({
      organization_id: resolvedOrgId,
      user_id: userId,
      event_type: status === "completed" ? "call_completed" : "call_failed",
      quantity: 1,
      metadata: { lead_id: leadId, call_log_id: callLogId, vapi_call_id: vapiCallId },
    });

    if (duration > 0) {
      await supabase.from("usage_events").insert({
        organization_id: resolvedOrgId,
        user_id: userId,
        event_type: "minute_used",
        quantity: Math.max(1, Math.ceil(duration / 60)),
        metadata: { lead_id: leadId, call_log_id: callLogId, vapi_call_id: vapiCallId },
      });
    }
  }

  return NextResponse.json({ ok: true, callLogId });
}
