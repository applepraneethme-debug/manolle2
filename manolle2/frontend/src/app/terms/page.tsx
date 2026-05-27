import Link from "next/link";

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By creating an account, using Manolle AI, or accessing any dashboard, automation, AI calling, transcript, lead, appointment, or billing feature, you agree to these Terms. If you use Manolle AI for a business, you confirm that you are authorised to accept these Terms for that business.",
  },
  {
    title: "2. Service Description",
    body: "Manolle AI provides AI voice calling tools for lead qualification, appointment booking, site-visit scheduling, call summaries, call transcripts, analytics, and business workflow automation. The service may connect with third-party providers including Supabase, Vapi, Stripe, Vercel, telephony providers, and related infrastructure services.",
  },
  {
    title: "3. Account Responsibilities",
    body: "You are responsible for keeping your login credentials secure, maintaining accurate account information, and controlling who can access your workspace. You must promptly notify us if you suspect unauthorised access or misuse of your account.",
  },
  {
    title: "4. Customer Data and Leads",
    body: "You are responsible for ensuring that leads, phone numbers, customer details, scripts, and campaign data uploaded to Manolle AI were collected lawfully and may be used for calling, follow-up, and appointment workflows. You must not upload data you do not have the right to process.",
  },
  {
    title: "5. Calling Compliance",
    body: "You are responsible for complying with applicable telecom, privacy, consent, do-not-disturb, anti-spam, and consumer-protection rules in every region where you call leads. You must not use Manolle AI for harassment, fraud, impersonation, illegal sales activity, emergency services, deceptive calling, or calls without required consent.",
  },
  {
    title: "6. AI Output",
    body: "AI-generated conversations, summaries, classifications, and appointment suggestions may be incomplete or inaccurate. You are responsible for reviewing important outputs and deciding how to use them. Manolle AI does not guarantee any specific lead conversion, appointment, revenue, or business result.",
  },
  {
    title: "7. Subscriptions and Payments",
    body: "Paid plans, usage limits, renewals, taxes, upgrades, downgrades, cancellations, and failed payments are handled according to the plan selected at checkout or in the billing dashboard. Access may be limited, paused, or cancelled if payment fails, usage limits are exceeded, or the service is misused.",
  },
  {
    title: "8. Third-Party Services",
    body: "Manolle AI depends on third-party services for authentication, hosting, payments, telephony, AI calling, workflow automation, and storage. We are not responsible for outages, policy changes, data handling, or failures caused by those third-party providers.",
  },
  {
    title: "9. Prohibited Use",
    body: "You may not reverse engineer the service, bypass usage limits, attack the platform, share access unlawfully, upload malicious content, scrape data, violate another person's rights, or use Manolle AI for unlawful, harmful, misleading, or abusive activity.",
  },
  {
    title: "10. Suspension and Termination",
    body: "We may suspend or terminate access if we believe your use creates legal, security, payment, operational, or reputational risk. You may stop using the service at any time, subject to any active billing terms.",
  },
  {
    title: "11. Limitation of Liability",
    body: "To the maximum extent permitted by law, Manolle AI is provided on an as-is and as-available basis. We are not liable for indirect, incidental, special, consequential, punitive, or lost-profit damages arising from your use of the service.",
  },
  {
    title: "12. Changes to Terms",
    body: "We may update these Terms as the product, legal requirements, or business model changes. Continued use after an update means you accept the revised Terms.",
  },
  {
    title: "13. Contact",
    body: "For questions about these Terms, contact us at applepraneethme@gmail.com until an official Manolle AI support address is added.",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white px-6 py-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="text-sm text-[#00F0FF] hover:text-[#00F0FF]/80">
          Back to Manolle AI
        </Link>
        <div className="mt-8 mb-10">
          <p className="text-xs uppercase tracking-widest text-[#00F0FF] mb-3">
            Legal
          </p>
          <h1 className="font-outfit text-4xl font-semibold mb-3">
            Terms & Conditions
          </h1>
          <p className="text-[#A1A1AA]">
            Last updated: May 20, 2026
          </p>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100 mb-8">
          This page is a practical business template and is not legal advice.
          Please have a qualified lawyer review it before accepting real
          customers or payments.
        </div>

        <div className="space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-outfit text-xl font-semibold mb-2">
                {section.title}
              </h2>
              <p className="text-[#C4C4CC] leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
