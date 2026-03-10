import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service – Flowbill",
  description: "Read the Terms of Service for Flowbill.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: `By creating an account or using Flowbill ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not access or use the Service. These Terms apply to all visitors, users, and others who access or use the Service.`,
  },
  {
    title: "2. Description of Service",
    body: `Flowbill is a business management platform designed for freelancers and independent professionals. The Service includes time tracking, invoice generation, client management, project tracking, and financial reporting tools. We reserve the right to modify, suspend, or discontinue any part of the Service at any time with reasonable notice.`,
  },
  {
    title: "3. Account Registration",
    body: `You must register for an account to access most features. You agree to provide accurate, current, and complete information during registration and to keep your account information updated. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. Notify us immediately at support@flowbill.app if you suspect unauthorized access.`,
  },
  {
    title: "4. Acceptable Use",
    body: `You agree not to use the Service to: (a) violate any applicable law or regulation; (b) upload or transmit harmful, fraudulent, or deceptive content; (c) interfere with or disrupt the integrity or performance of the Service; (d) attempt to gain unauthorized access to any system or network; (e) resell or sublicense the Service without our written permission; or (f) use the Service in any manner that could damage, disable, or overburden our infrastructure.`,
  },
  {
    title: "5. Intellectual Property",
    body: `The Service and its original content, features, and functionality are and will remain the exclusive property of Flowbill and its licensors. You retain ownership of the data you upload or create within the Service. By using the Service, you grant us a limited license to process, store, and display your data solely for the purpose of providing the Service to you.`,
  },
  {
    title: "6. Payment and Billing",
    body: `Certain features of the Service may be offered on a paid subscription basis. By subscribing, you authorize us to charge the applicable fees to your payment method. All fees are non-refundable except where required by law. We may change our fees at any time with at least 30 days' notice. If you do not cancel before the fee change takes effect, you consent to the new fees.`,
  },
  {
    title: "7. Data and Privacy",
    body: `Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.`,
  },
  {
    title: "8. Termination",
    body: `We may suspend or terminate your access to the Service at our sole discretion, with or without cause, with or without notice. You may terminate your account at any time through the account settings. Upon termination, your right to use the Service ceases immediately. You may request a data export before terminating your account.`,
  },
  {
    title: "9. Disclaimer of Warranties",
    body: `THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.`,
  },
  {
    title: "10. Limitation of Liability",
    body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FLOWBILL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.`,
  },
  {
    title: "11. Changes to Terms",
    body: `We reserve the right to modify these Terms at any time. We will notify you of significant changes by email or through a notice on the Service at least 14 days before the changes take effect. Your continued use of the Service after the effective date constitutes your acceptance of the revised Terms.`,
  },
  {
    title: "12. Contact",
    body: `If you have any questions about these Terms, please contact us at legal@flowbill.app.`,
  },
];

export default function TermsPage() {
  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-900 py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-violet-300 text-sm font-medium uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="text-4xl font-bold text-white mb-4">
            Terms of Service
          </h1>
          <p className="text-violet-200/70 text-base">
            Last updated: March 10, 2026
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-14 space-y-10">
        <p className="text-muted-foreground leading-relaxed">
          Please read these Terms of Service carefully before using Flowbill.
          These Terms govern your access to and use of our platform and
          services.
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
