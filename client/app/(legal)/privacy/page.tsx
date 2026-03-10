import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – Flowbill",
  description: "Read the Privacy Policy for Flowbill.",
};

const sections = [
  {
    title: "1. Information We Collect",
    body: `We collect information you provide directly to us when you create an account, use the Service, or contact support. This includes: (a) Account information — your name, email address, and password; (b) Profile and work preferences — your role, hourly rate, currency, and timezone; (c) Business data — clients, projects, time entries, invoices, and expenses you create within the Service; (d) Payment information — processed securely by our payment providers; we do not store full card numbers; (e) Usage data — log data, IP address, browser type, pages visited, and interactions with the Service.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the information we collect to: provide, maintain, and improve the Service; process transactions and send related information; send transactional and promotional communications (you can opt out of promotional emails at any time); respond to comments, questions, and requests; monitor and analyze usage trends to improve user experience; detect, investigate, and prevent fraudulent or illegal activity; and comply with legal obligations.`,
  },
  {
    title: "3. Data Storage and Security",
    body: `Your data is stored on secure servers hosted in the European Union. We implement industry-standard security measures including encryption in transit (TLS), encryption at rest, and strict access controls. While we take reasonable steps to protect your information, no security system is completely impenetrable. We cannot guarantee the absolute security of your data and encourage you to use a strong, unique password.`,
  },
  {
    title: "4. Data Sharing and Disclosure",
    body: `We do not sell, trade, or rent your personal information to third parties. We may share your data with: (a) Service providers — trusted third parties that assist us in operating the Service (e.g., cloud hosting, email delivery, payment processing) under strict confidentiality agreements; (b) Legal requirements — if required by law, court order, or governmental authority; (c) Business transfers — in connection with a merger, acquisition, or sale of assets, with appropriate notice to you; (d) With your consent — in any other circumstances, with your explicit consent.`,
  },
  {
    title: "5. Cookies and Tracking",
    body: `We use cookies and similar tracking technologies to maintain your session, remember your preferences, and analyze usage patterns. Session cookies are deleted when you close your browser. Persistent cookies remain until they expire or you delete them. You can control cookie behavior through your browser settings; however, disabling certain cookies may affect the functionality of the Service.`,
  },
  {
    title: "6. Your Rights",
    body: `Depending on your location, you may have the following rights regarding your personal data: access — request a copy of the data we hold about you; rectification — request correction of inaccurate data; erasure — request deletion of your data (subject to certain legal exceptions); portability — request an export of your data in a machine-readable format; restriction — request that we limit the processing of your data; objection — object to certain types of processing. To exercise any of these rights, contact us at privacy@flowbill.app.`,
  },
  {
    title: "7. Data Retention",
    body: `We retain your personal data for as long as your account is active or as needed to provide the Service. After account deletion, we may retain certain information for up to 90 days in our backup systems before permanent deletion. Some data may be retained longer if required by law or for legitimate business purposes such as dispute resolution.`,
  },
  {
    title: "8. Children's Privacy",
    body: `The Service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If you believe we have inadvertently collected such information, please contact us immediately and we will take steps to delete it.`,
  },
  {
    title: "9. Third-Party Links",
    body: `The Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review the privacy policies of any third-party sites you visit.`,
  },
  {
    title: "10. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a prominent notice on the Service at least 14 days before the changes take effect. Your continued use of the Service after the effective date constitutes your acceptance of the updated policy.`,
  },
  {
    title: "11. Contact Us",
    body: `If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our Data Protection team at privacy@flowbill.app or write to us at: Flowbill, Data Protection, [Address].`,
  },
];

export default function PrivacyPage() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-violet-300 text-sm font-medium uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="text-4xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-violet-200/70 text-base">
            Last updated: March 10, 2026
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
        <p className="text-muted-foreground leading-relaxed">
          Your privacy matters to us. This Privacy Policy explains how Flowbill
          collects, uses, stores, and protects your personal information when
          you use our platform.
        </p>

        {sections.map((s) => (
          <section key={s.title} className="space-y-3">
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {s.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
