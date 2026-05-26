"use client";

import type { DbCallLog, DbLead } from "@/hooks/useSupabaseData";

export type ParsedCallSummary = {
  name?: string;
  phone?: string;
  summary?: string;
  siteVisitDate?: string;
  siteVisitTime?: string;
  hasSiteVisit: boolean;
};

const DATE_KEY_RE = /(?:siteVisitDate|site_visit_date|visitDate|appointmentDate|date)\s*[:=-]\s*["']?([^"',\n]+)/i;
const TIME_KEY_RE = /(?:siteVisitTime|site_visit_time|visitTime|appointmentTime|time)\s*[:=-]\s*["']?([^"',\n]+)/i;
const PHONE_RE = /(?:\+?\d[\d\s().-]{7,}\d)/;
const ISO_DATE_RE = /\b(20\d{2})-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])\b/;
const SLASH_DATE_RE = /\b(0?[1-9]|[12]\d|3[01])[/.-](0?[1-9]|1[0-2])[/.-](20\d{2})\b/;
const TIME_RE = /\b(0?[1-9]|1[0-2]|2[0-3])(?::([0-5]\d))?\s*(am|pm|AM|PM)?\b/;

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function normalizeDate(value?: string) {
  if (!value) return undefined;
  const cleaned = value.trim().replace(/[. ]+$/, "");
  const iso = cleaned.match(ISO_DATE_RE);
  if (iso) {
    const [, y, m, d] = iso;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  const slash = cleaned.match(SLASH_DATE_RE);
  if (slash) {
    const [, d, m, y] = slash;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  return undefined;
}

function normalizeTime(value?: string) {
  if (!value) return undefined;
  const match = value.trim().match(TIME_RE);
  if (!match) return undefined;

  let hour = Number(match[1]);
  const minute = match[2] || "00";
  const meridiem = match[3]?.toLowerCase();
  if (!match[2] && !meridiem) return undefined;

  if (meridiem === "pm" && hour < 12) hour += 12;
  if (meridiem === "am" && hour === 12) hour = 0;
  if (hour > 23) return undefined;

  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function tryParseJson(text: string) {
  const trimmed = text.trim();
  const candidates = [
    trimmed,
    trimmed.match(/\{[\s\S]*\}/)?.[0],
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Plain text summaries are expected too.
    }
  }

  return null;
}

function valueFromObject(obj: Record<string, unknown> | null, keys: string[]) {
  if (!obj) return undefined;
  for (const key of keys) {
    const direct = getString(obj[key]);
    if (direct) return direct;
  }
  return undefined;
}

function extractKeyedValue(text: string, pattern: RegExp) {
  return text.match(pattern)?.[1]?.trim();
}

export function parseCallSummary(call?: DbCallLog, lead?: DbLead): ParsedCallSummary {
  const source = [call?.summary, call?.transcript].filter(Boolean).join("\n");
  const json = source ? tryParseJson(source) : null;
  const plainSummary =
    valueFromObject(json, ["summary", "basicSummary", "callSummary", "notes"]) ||
    call?.summary ||
    "";

  const name =
    valueFromObject(json, ["name", "leadName", "customerName"]) ||
    lead?.name;
  const phone =
    valueFromObject(json, ["phone", "phoneNumber", "customerPhone"]) ||
    source.match(PHONE_RE)?.[0]?.trim() ||
    lead?.phone;

  const siteVisitDate = normalizeDate(
    valueFromObject(json, [
      "siteVisitDate",
      "site_visit_date",
      "visitDate",
      "appointmentDate",
      "date",
    ]) || extractKeyedValue(source, DATE_KEY_RE)
  ) || normalizeDate(source);

  const siteVisitTime = normalizeTime(
    valueFromObject(json, [
      "siteVisitTime",
      "site_visit_time",
      "visitTime",
      "appointmentTime",
      "time",
    ]) || extractKeyedValue(source, TIME_KEY_RE)
  ) || normalizeTime(source);

  const hasSiteVisit =
    Boolean(siteVisitDate && siteVisitTime) &&
    /(site\s*visit|visit|appointment|scheduled|booked)/i.test(source);

  return {
    name,
    phone,
    summary: plainSummary,
    siteVisitDate,
    siteVisitTime,
    hasSiteVisit,
  };
}

export function formatVisitDateTime(parsed: ParsedCallSummary) {
  if (!parsed.siteVisitDate || !parsed.siteVisitTime) return "Not scheduled";
  const date = new Date(`${parsed.siteVisitDate}T${parsed.siteVisitTime}:00`);
  if (Number.isNaN(date.getTime())) {
    return `${parsed.siteVisitDate}, ${parsed.siteVisitTime}`;
  }
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
