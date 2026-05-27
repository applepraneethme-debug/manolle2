"use client";

import { useEffect, useMemo, useRef } from "react";
import { parseCallSummary } from "@/lib/call-summary";
import {
  type DbAppointment,
  type DbCallLog,
  type DbLead,
  useAppointments,
  useCallLogs,
  useLeads,
} from "@/hooks/useSupabaseData";

function hasExistingVisit(
  call: DbCallLog,
  lead: DbLead,
  appointments: DbAppointment[],
  date: string,
  time: string
) {
  return appointments.some((appointment) => {
    const sameLead = appointment.lead_id === lead.id;
    const sameSlot =
      appointment.appointment_date === date &&
      appointment.appointment_time?.slice(0, 5) === time;
    const fromSameCall = appointment.notes?.includes(`Call ID: ${call.id}`);
    return fromSameCall || (sameLead && sameSlot);
  });
}

export function useCallSummaryAppointments() {
  const { data: callLogs } = useCallLogs();
  const { data: leads, update: updateLead } = useLeads();
  const { data: appointments, insert: insertAppointment } = useAppointments();
  const processedRef = useRef<Set<string>>(new Set());

  const leadsById = useMemo(
    () => new Map(leads.map((lead) => [lead.id, lead])),
    [leads]
  );

  useEffect(() => {
    let cancelled = false;

    async function syncAppointments() {
      for (const call of callLogs) {
        if (!call.lead_id || processedRef.current.has(call.id)) continue;

        const lead = leadsById.get(call.lead_id);
        if (!lead) continue;

        const parsed = parseCallSummary(call, lead);
        if (!parsed.hasSiteVisit || !parsed.siteVisitDate || !parsed.siteVisitTime) continue;

        if (
          hasExistingVisit(
            call,
            lead,
            appointments,
            parsed.siteVisitDate,
            parsed.siteVisitTime
          )
        ) {
          processedRef.current.add(call.id);
          continue;
        }

        processedRef.current.add(call.id);

        try {
          await insertAppointment({
            lead_id: lead.id,
            title: `Site visit - ${parsed.name || lead.name}`,
            appointment_date: parsed.siteVisitDate,
            appointment_time: parsed.siteVisitTime,
            type: "site_visit",
            status: "scheduled",
            notes: [
              parsed.summary,
              parsed.phone ? `Phone: ${parsed.phone}` : "",
              `Call ID: ${call.id}`,
            ]
              .filter(Boolean)
              .join("\n"),
          });

          if (lead.status !== "booked") {
            await updateLead(lead.id, { status: "booked" });
          }
        } catch (error) {
          processedRef.current.delete(call.id);
          console.error("Unable to create appointment from call summary", error);
        }

        if (cancelled) return;
      }
    }

    syncAppointments();

    return () => {
      cancelled = true;
    };
  }, [appointments, callLogs, insertAppointment, leadsById, updateLead]);
}
