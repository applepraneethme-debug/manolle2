import "server-only";

import { addMonths } from "date-fns";
import { createAdminSupabase } from "@/lib/supabase/admin";
import { generateTemporaryPassword, hashPassword } from "@/lib/auth";

const planDefaults = {
  starter: { calls_limit: 500, leads_limit: 200, max_users: 1 },
  pro: { calls_limit: 2000, leads_limit: 1000, max_users: 5 },
  enterprise: { calls_limit: 10000, leads_limit: 10000, max_users: 25 },
} as const;

function promptFor(type: string, businessName: string) {
  const focus =
    type === "salon"
      ? "booking appointments, answering service questions, and reducing no-shows"
      : type === "clinic"
      ? "helping patients with appointments, reminders, and basic clinic information"
      : type === "realestate"
      ? "qualifying property leads, asking budget questions, and booking site visits"
      : "qualifying leads and booking appointments";

  return `You are the AI calling assistant for ${businessName}. Focus on ${focus}. Be concise, warm, and collect clear next steps.`;
}

async function maybeCreateVapiAssistant(input: { businessName: string; businessType: string }) {
  if (!process.env.VAPI_PRIVATE_KEY) return null;

  const response = await fetch("https://api.vapi.ai/assistant", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: `${input.businessName} Assistant`,
      model: {
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: promptFor(input.businessType, input.businessName) }],
      },
    }),
  }).catch(() => null);

  if (!response?.ok) return null;
  const data = await response.json().catch(() => ({}));
  return typeof data.id === "string" ? data.id : null;
}

async function maybeSendWelcomeEmail(input: {
  email: string;
  businessName: string;
  clientId: string;
  password: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[maybeSendWelcomeEmail] RESEND_API_KEY not set — skipping welcome email");
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || "Manolle AI <onboarding@manolle.ai>",
      to: input.email,
      subject: "Your Manolle AI account is ready",
      text: `Welcome to Manolle AI.\n\nBusiness: ${input.businessName}\nClient ID: ${input.clientId}\nLogin: ${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/login\nEmail: ${input.email}\nTemporary password: ${input.password}\n\nPlease change your password after logging in.`,
    }),
  }).catch((err) => {
    console.error("[maybeSendWelcomeEmail] Fetch error:", err);
    return null;
  });

  if (res && !res.ok) {
    const body = await res.json().catch(() => ({}));
    console.error("[maybeSendWelcomeEmail] Resend error:", body);
    // Do NOT throw — email failure should never block client creation
  }
}

export async function onboardClient(input: {
  businessName: string;
  businessType: "salon" | "clinic" | "realestate" | "other";
  email: string;
  plan: "starter" | "pro" | "enterprise";
  durationMonths: number;
}) {
  const supabase = createAdminSupabase();
  const password = generateTemporaryPassword();
  const passwordHash = await hashPassword(password);
  const defaults = planDefaults[input.plan];

  // Generate client ID — fall back to timestamp-based ID if RPC fails
  let clientId: string;
  const { data: clientIdData, error: clientIdError } = await supabase.rpc("next_client_id");
  if (clientIdError || !clientIdData) {
    console.error("[onboardClient] next_client_id RPC failed:", clientIdError?.message);
    // Fallback: generate a unique client ID without relying on DB function
    const year = new Date().getFullYear();
    const suffix = Date.now().toString().slice(-4);
    clientId = `MAN-${year}-${suffix}`;
  } else {
    clientId = clientIdData as string;
  }

  // Vapi assistant creation is optional — never blocks client creation
  const assistantId = await maybeCreateVapiAssistant(input).catch(() => null);

  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .insert({
      client_id: clientId,
      business_name: input.businessName,
      business_type: input.businessType,
      name: input.businessName,
      plan: input.plan,
      is_active: true,
      ...defaults,
      expires_at: addMonths(new Date(), input.durationMonths).toISOString(),
      vapi_assistant_id: assistantId,
    })
    .select("*")
    .single();

  if (orgError) {
    console.error("[onboardClient] Organization insert failed:", orgError);
    throw new Error(`Failed to create organization: ${orgError.message}`);
  }

  const { data: user, error: userError } = await supabase
    .from("org_users")
    .insert({
      org_id: organization.id,
      email: input.email.toLowerCase(),
      password_hash: passwordHash,
      role: "owner",
    })
    .select("id,email,role")
    .single();

  if (userError) {
    console.error("[onboardClient] User insert failed:", userError);
    // Roll back the organization we just created
    await supabase.from("organizations").delete().eq("id", organization.id);
    throw new Error(`Failed to create user: ${userError.message}`);
  }

  // Email is sent AFTER everything is saved — failure here does NOT block the response
  await maybeSendWelcomeEmail({
    email: input.email,
    businessName: input.businessName,
    clientId,
    password,
  });

  return { organization, user, password };
}
