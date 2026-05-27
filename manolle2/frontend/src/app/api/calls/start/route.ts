import { type NextRequest, NextResponse } from "next/server";
import { requireTenantSession } from "@/lib/auth";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { normalizeIndianPhone, type LeadRow } from "@/lib/server/calling";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function checkUsageLimits(orgId: string) {
  const supabase = createAdminSupabase();
  const { data: org } = await supabase
    .from("organizations")
    .select("is_active,calls_limit,expires_at")
    .eq("id", orgId)
    .maybeSingle();

  if (!org?.is_active) throw new Error("Account suspended. Contact support.");
  if (org.expires_at && new Date(org.expires_at) <= new Date()) {
    throw new Error("Subscription expired. Please renew.");
  }

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const { count } = await supabase
    .from("call_logs")
    .select("id", { count: "exact", head: true })
    .eq("org_id", orgId)
    .gte("created_at", monthStart);

  if ((count || 0) >= org.calls_limit) {
    throw new Error("Monthly call limit reached. Please upgrade.");
  }
}

export async function POST(request: NextRequest) {
  const session = await requireTenantSession();
  const { leadId } = await request.json().catch(() => ({ leadId: null }));

  if (!leadId || typeof leadId !== "string") {
    return NextResponse.json({ error: "Lead id is required" }, { status: 400 });
  }

  try {
    await checkUsageLimits(session.organization.id);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Usage limit reached" }, { status: 403 });
  }

  let vapiPrivateKey: string;
  try {
    vapiPrivateKey = requiredEnv("VAPI_PRIVATE_KEY");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Vapi is not configured" },
      { status: 500 }
    );
  }

  const assistantId = session.organization.vapi_assistant_id || process.env.VAPI_ASSISTANT_ID;
  const phoneNumberId = session.organization.vapi_phone_number_id || process.env.VAPI_PHONE_NUMBER_ID;
  if (!assistantId || !phoneNumberId) {
    return NextResponse.json({ error: "Vapi assistant or phone number is not configured for this client" }, { status: 500 });
  }

  const supabase = createAdminSupabase();
  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("id,user_id,org_id,organization_id,name,phone,email,source,campaign_id")
    .eq("id", leadId)
    .eq("org_id", session.organization.id)
    .maybeSingle();

  if (leadError) return NextResponse.json({ error: leadError.message }, { status: 500 });
  if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

  const row = lead as LeadRow & { org_id?: string | null };
  const phoneNumber = normalizeIndianPhone(row.phone);

  const callPayload = {
    assistantId,
    phoneNumberId,
    customer: {
      number: phoneNumber,
      name: row.name,
      email: row.email || undefined,
      numberE164CheckEnabled: false,
    },
    metadata: {
      leadId: row.id,
      userId: session.user.id,
      organizationId: session.organization.id,
      orgId: session.organization.id,
      campaignId: row.campaign_id || null,
      source: "manolle_dashboard",
    },
    assistantOverrides: {
      variableValues: {
        leadName: row.name,
        leadPhone: phoneNumber,
        leadEmail: row.email || "",
        leadSource: row.source || "Website lead",
      },
    },
  };

  const vapiResponse = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      authorization: `Bearer ${vapiPrivateKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(callPayload),
  }).catch((error) => error as Error);

  if (vapiResponse instanceof Error) {
    return NextResponse.json({ error: "Vapi call trigger failed", detail: vapiResponse.message }, { status: 502 });
  }

  const result = await vapiResponse.json().catch(async () => ({
    detail: await vapiResponse.text().catch(() => ""),
  }));

  if (!vapiResponse.ok) {
    return NextResponse.json({ error: `Vapi call trigger failed (${vapiResponse.status})`, detail: result }, { status: 502 });
  }

  const vapiCallId =
    typeof result?.id === "string" ? result.id : typeof result?.call?.id === "string" ? result.call.id : null;

  const { error: callLogError } = await supabase.from("call_logs").insert({
    user_id: session.user.id,
    lead_id: row.id,
    org_id: session.organization.id,
    organization_id: session.organization.id,
    status: "in_progress",
    transcript: "",
    summary: "Call started. Waiting for Vapi to send the end-of-call report.",
    vapi_call_id: vapiCallId,
    vapi_payload: result,
  });

  if (callLogError) {
    return NextResponse.json({ error: "Call started, but call log could not be saved", detail: callLogError.message }, { status: 500 });
  }

  await supabase.from("leads").update({ status: "contacted" }).eq("id", row.id).eq("org_id", session.organization.id);

  return NextResponse.json({ ok: true, leadId: row.id, phoneNumber, vapiCallId, webhookUrl: `${siteUrl()}/api/vapi/webhook` });
}
