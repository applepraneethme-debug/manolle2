import Link from "next/link";

const sections = [
  {
    title: "1. Overview",
    body: "This Privacy Policy explains how Manolle AI collects, uses, stores, and shares information when businesses use our AI voice calling SaaS for lead qualification, appointments, site visits, call transcripts, and dashboards.",
  },
  {
    title: "2. Information We Collect",
    body: "We may collect account information such as name, email, company name, phone number, login details, billing status, and usage activity. We also process business data uploaded by users, including leads, phone numbers, email addresses, campaign details, appointment details, call outcomes, summaries, recordings, and transcripts.",
  },
  {
    title: "3. How We Use Information",
    body: "We use information to provide authentication, manage workspaces, trigger AI calls, qualify leads, book appointments, display analytics, process subscriptions, prevent misuse, improve reliability, provide support, and comply with legal or operational obligations.",
  },
  {
    title: "4. Calls, Recordings, and Transcripts",
    body: "AI calls may generate call metadata, recordings, transcripts, summaries, qualification notes, and appointment details. You are responsible for obtaining any consent required before calling or recording leads and for informing callers when applicable law requires notice.",
  },
  {
    title: "5. Third-Party Processors",
    body: "Manolle AI may use Supabase for authentication and database services, Vapi for AI calling and telephony workflows, Stripe for payments, Vercel for hosting, and other infrastructure providers needed to operate the service. These providers process data only as needed to deliver the service.",
  },
  {
    title: "6. Payments",
    body: "Payment details are processed by Stripe or another payment provider. We do not store full card numbers on our servers. We may store billing identifiers, subscription status, plan, renewal dates, and payment-related metadata.",
  },
  {
    title: "7. Data Security",
    body: "We use reasonable technical and organisational safeguards such as authentication, row-level access controls, environment secrets, access restrictions, and secure third-party infrastructure. No online service is completely risk-free, so you should use strong passwords and limit account access.",
  },
  {
    title: "8. Data Sharing",
    body: "We do not sell customer data. We share data with service providers only to operate Manolle AI, comply with law, enforce our terms, prevent fraud or abuse, or complete a business transfer such as a merger or acquisition.",
  },
  {
    title: "9. Data Retention",
    body: "We retain account, lead, call, transcript, appointment, billing, and usage data while your account is active or as needed for service delivery, legal compliance, dispute resolution, security, and backups. You may request deletion, subject to legal or operational limits.",
  },
  {
    title: "10. User and Lead Rights",
    body: "Depending on applicable law, users or individuals whose data appears in leads may request access, correction, deletion, or restriction of personal data. Business customers are responsible for responding to their own leads and customers where they act as the data controller.",
  },
  {
    title: "11. International Processing",
    body: "Our providers may process data in India or other countries where their infrastructure operates. By using Manolle AI, you understand that data may be transferred and processed outside your local region.",
  },
  {
    title: "12. Children's Data",
    body: "Manolle AI is intended for businesses and is not directed to children. Do not knowingly upload children's personal data unless you have a lawful basis and all required permissions.",
  },
  {
    title: "13. Changes to This Policy",
    body: "We may update this Privacy Policy as the product, providers, laws, or business practices change. Continued use after an update means you accept the revised policy.",
  },
  {
    title: "14. Contact",
    body: "For privacy questions or deletion requests, contact us at applepraneethme@gmail.com until an official Manolle AI privacy address is added.",
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
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
