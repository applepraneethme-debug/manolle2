import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export type LeadRow = {
  id: string;
  user_id: string;
  organization_id?: string | null;
  org_id?: string | null;
  name: string;
  phone: string;
  email?: string | null;
  source?: string | null;
  campaign_id?: string | null;
};

export type VapiMessage = {
  type?: string;
  call?: Record<string, unknown>;
  artifact?: Record<string, unknown>;
  analysis?: Record<string, unknown>;
  endedReason?: string;
  durationSeconds?: number;
  duration?: number;
  status?: string;
  transcript?: string;
  summary?: string;
  structuredData?: Record<string, unknown>;
  customer?: Record<string, unknown>;
};

type VapiArtifactMessage = {
  role?: string;
  message?: string;
  originalMessage?: string;
  speakerLabel?: string;
};

export function normalizeIndianPhone(phone: string) {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return trimmed;
}

export function createServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service role is not configured");
  }

  return createSupabaseClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function getNestedString(source: unknown, path: string[]) {
  let current = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return getString(current);
}

export function getNestedRecord(source: unknown, path: string[]) {
  let current = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current && typeof current === "object"
    ? (current as Record<string, unknown>)
    : undefined;
}

export function getCallId(message: VapiMessage) {
  return (
    getNestedString(message, ["call", "id"]) ||
    getNestedString(message, ["call", "callId"]) ||
    getNestedString(message, ["call", "sid"])
  );
}

export function getTranscript(message: VapiMessage) {
  const artifactMessages =
    Array.isArray(message.artifact?.messages)
      ? (message.artifact.messages as VapiArtifactMessage[])
      : Array.isArray(getNestedRecord(message, ["call", "artifact"])?.messages)
      ? (getNestedRecord(message, ["call", "artifact"])?.messages as VapiArtifactMessage[])
      : [];

  const messageTranscript = artifactMessages
    .map((item) => {
      const text = item.message || item.originalMessage;
      if (!text) return "";
      const speaker = item.speakerLabel || item.role || "speaker";
      return `${speaker}: ${text}`;
    })
    .filter(Boolean)
    .join("\n");

  return (
    getString(message.transcript) ||
    getNestedString(message, ["artifact", "transcript"]) ||
    getNestedString(message, ["call", "artifact", "transcript"]) ||
    getNestedString(message, ["artifact", "messages", "transcript"]) ||
    messageTranscript ||
    ""
  );
}

export function getRecordingUrl(message: VapiMessage) {
  return (
    getNestedString(message, ["artifact", "recordingUrl"]) ||
    getNestedString(message, ["artifact", "recording", "url"]) ||
    getNestedString(message, ["artifact", "recording", "mono", "combinedUrl"]) ||
    getNestedString(message, ["artifact", "recording", "stereoUrl"]) ||
    getNestedString(message, ["call", "artifact", "recordingUrl"])
  );
}

export function getStructuredData(message: VapiMessage) {
  return (
    getNestedRecord(message, ["analysis", "structuredData"]) ||
    getNestedRecord(message, ["structuredData"]) ||
    getNestedRecord(message, ["call", "analysis", "structuredData"]) ||
    {}
  );
}

export function getSummary(message: VapiMessage) {
  return (
    getString(message.summary) ||
    getNestedString(message, ["analysis", "summary"]) ||
    getNestedString(message, ["call", "analysis", "summary"]) ||
    getNestedString(message, ["artifact", "summary"]) ||
    ""
  );
}

export function getDurationSeconds(message: VapiMessage) {
  const direct = getNumber(message.durationSeconds) || getNumber(message.duration);
  if (direct !== undefined) return Math.round(direct);

  const startedAt = getNestedString(message, ["call", "startedAt"]);
  const endedAt = getNestedString(message, ["call", "endedAt"]);
  if (startedAt && endedAt) {
    const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime();
    if (Number.isFinite(diff) && diff > 0) return Math.round(diff / 1000);
  }

  return 0;
}

export function mapVapiStatus(message: VapiMessage) {
  const endedReason = `${message.endedReason || ""}`.toLowerCase();
  const status = `${message.status || getNestedString(message, ["call", "status"]) || ""}`.toLowerCase();

  if (endedReason.includes("busy")) return "busy";
  if (endedReason.includes("voicemail")) return "voicemail";
  if (endedReason.includes("no-answer") || endedReason.includes("no_answer")) return "no_answer";
  if (endedReason.includes("failed") || status.includes("failed")) return "failed";
  return "completed";
}

const ISO_DATE_RE = /\b(20\d{2})-(0?[1-9]|1[0-2])-(0?[1-9]|[12]\d|3[01])\b/;
const SLASH_DATE_RE = /\b(0?[1-9]|[12]\d|3[01])[/.-](0?[1-9]|1[0-2])[/.-](20\d{2})\b/;
const TIME_RE = /\b(0?[1-9]|1[0-2]|2[0-3])(?::([0-5]\d))?\s*(am|pm|AM|PM)\b|\b(1[3-9]|2[0-3]):([0-5]\d)\b/;

function normalizeDate(value?: string) {
  if (!value) return undefined;
  const cleaned = value.trim().replace(/[. ]+$/, "").toLowerCase();

  const now = new Date();
  if (cleaned === "today") return now.toISOString().slice(0, 10);
  if (cleaned === "tomorrow") {
    const t = new Date(now); t.setDate(t.getDate() + 1); return t.toISOString().slice(0, 10);
  }
  if (cleaned === "day after tomorrow") {
    const t = new Date(now); t.setDate(t.getDate() + 2); return t.toISOString().slice(0, 10);
  }
  const nextDay = cleaned.match(/^next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i);
  if (nextDay) {
    const days = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
    const target = days.indexOf(nextDay[1].toLowerCase());
    const t = new Date(now);
    const diff = (target - t.getDay() + 7) % 7 || 7;
    t.setDate(t.getDate() + diff);
    return t.toISOString().slice(0, 10);
  }

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
  // Search full text for explicit am/pm first - PM takes priority
  const pmMatch = value.match(/\b(0?[1-9]|1[0-2])(?::([0-5]\d))?\s*(?:pm)\b/i);
  const amMatch = value.match(/\b(0?[1-9]|1[0-2])(?::([0-5]\d))?\s*(?:am)\b/i);
  const preferred = pmMatch || amMatch;

  if (preferred) {
    let hour = Number(preferred[1]);
    const minute = preferred[2] || "00";
    const meridiem = pmMatch ? "pm" : "am";
    if (meridiem === "pm" && hour < 12) hour += 12;
    if (meridiem === "am" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${minute}`;
  }

  // Fallback: plain number with no am/pm context
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

function valueFromObject(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const direct = getString(obj[key]);
    if (direct) return direct;
  }
  return undefined;
}

function booleanFromObject(obj: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (["true", "yes", "y", "booked", "scheduled"].includes(normalized)) return true;
      if (["false", "no", "n", "not booked", "not scheduled"].includes(normalized)) return false;
    }
  }
  return undefined;
}

function compactSentence(text: string, max = 220) {
  const cleaned = text
    .replace(/\s+/g, " ")
    .replace(/\b(assistant|ai|agent|user|customer):/gi, "")
    .trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trim()}…`;
}

function inferInterest(text: string) {
  if (/(not interested|don't need|do not need|stop calling|wrong number|not required|no thanks)/i.test(text)) {
    return "Not interested";
  }
  if (/(book|appointment|schedule|visit|meet|available|come in|consultation|demo)/i.test(text)) {
    return "Interested";
  }
  if (/(maybe|later|send details|whatsapp|email|think about|call back)/i.test(text)) {
    return "Warm follow-up";
  }
  return "Unclear";
}

function inferNeed(text: string) {
  const patterns = [
    /\b(?:needs?|wants?|looking for|interested in|asking about|asked about)\s+([^.!?\n]{8,120})/i,
    /\b(?:problem|issue|pain|concern)\s*(?:is|:|-)?\s*([^.!?\n]{8,120})/i,
    /\b(?:tooth pain|bleeding gums|braces|implant|root canal|cleaning|whitening|checkup|consultation|site visit|demo|pricing|budget|availability)\b[^.!?\n]*/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern)?.[0];
    if (match) return compactSentence(match, 150);
  }

  return undefined;
}

export function buildFeedbackSummary(
  summary: string,
  transcript: string,
  structuredData: Record<string, unknown>,
  appointment?: { booked?: boolean; date?: string; time?: string }
) {
  const directSummary =
    summary ||
    valueFromObject(structuredData, [
      "feedback",
      "callFeedback",
      "customerFeedback",
      "summary",
      "basicSummary",
      "callSummary",
      "notes",
    ]) ||
    "";

  const interest =
    valueFromObject(structuredData, [
      "interestLevel",
      "interest",
      "leadInterest",
      "customerInterest",
      "qualification",
    ]) ||
    (booleanFromObject(structuredData, ["interested", "isInterested"]) === true
      ? "Interested"
      : booleanFromObject(structuredData, ["interested", "isInterested"]) === false
      ? "Not interested"
      : undefined) ||
    inferInterest(`${directSummary}\n${transcript}`);

  const interestedIn =
    valueFromObject(structuredData, [
      "interestedIn",
      "serviceInterest",
      "productInterest",
      "treatment",
      "service",
      "requirement",
    ]) || inferNeed(`${directSummary}\n${transcript}`);

  const problem =
    valueFromObject(structuredData, [
      "problem",
      "painPoint",
      "customerProblem",
      "need",
      "needs",
      "requirement",
      "reason",
    ]);

  const nextStep =
    valueFromObject(structuredData, ["nextStep", "followUp", "actionItem", "outcome"]) ||
    (appointment?.booked && appointment.date && appointment.time
      ? `Appointment booked for ${appointment.date} at ${appointment.time}.`
      : undefined);

  const lines = [
    `Interest: ${interest}.`,
    interestedIn ? `Interested in / need: ${compactSentence(interestedIn, 160)}.` : "",
    problem ? `Problem: ${compactSentence(problem, 160)}.` : "",
    directSummary ? `Call feedback: ${compactSentence(directSummary, 260)}.` : "",
    nextStep ? `Next step: ${compactSentence(nextStep, 180)}` : "",
  ].filter(Boolean);

  if (lines.length > 1) return lines.join("\n");
  if (transcript.trim()) return `Interest: ${interest}.\nCall feedback: ${compactSentence(transcript, 360)}.`;
  return "Call completed. No transcript was received from Vapi.";
}

function extractDateFromText(text: string): string | undefined {
  // Match patterns like "tomorrow at 9 AM", "today at 3pm", "next monday", "26th May", etc.
  const patterns = [
    /\b(tomorrow)\b/i,
    /\b(today)\b/i,
    /\b(day after tomorrow)\b/i,
    /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/,
    /\b(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/,
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return normalizeDate(match[0]);
  }
  return undefined;
}

function extractTimeFromText(text: string): string | undefined {
  // Match patterns like "9 AM", "9:00 AM", "3pm", "15:00"
  const match = text.match(/\b(0?[1-9]|1[0-2])(?::([0-5]\d))?\s*(am|pm)\b/i) ||
    text.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  if (match) return normalizeTime(match[0]);
  return undefined;
}

export function extractAppointment(
  structuredData: Record<string, unknown>,
  text: string
) {
  // Try structured data first, then fall back to parsing from text
  const structuredDate =
    valueFromObject(structuredData, ["appointmentDate", "siteVisitDate", "site_visit_date", "visitDate", "date"]) ||
    getNestedString(structuredData, ["appointment", "date"]) ||
    getNestedString(structuredData, ["booking", "date"]);

  const structuredTime =
    valueFromObject(structuredData, ["appointmentTime", "siteVisitTime", "site_visit_time", "visitTime", "time"]) ||
    getNestedString(structuredData, ["appointment", "time"]) ||
    getNestedString(structuredData, ["booking", "time"]);

  const date = normalizeDate(structuredDate) || extractDateFromText(text);
  const time = normalizeTime(structuredTime) || extractTimeFromText(text);
  const type =
    valueFromObject(structuredData, ["appointmentType", "type"]) || "site_visit";
  const booked =
    Boolean(date && time) &&
    (booleanFromObject(structuredData, [
      "appointmentBooked",
      "booked",
      "isBooked",
      "meetingBooked",
      "scheduled",
    ]) === true ||
      /(site\s*visit|visit|appointment|scheduled|booked|meeting)/i.test(text));

  return {
    booked,
    date,
    time,
    type: ["site_visit", "clinic", "consultation", "demo", "other"].includes(type)
      ? type
      : "other",
  };
}
