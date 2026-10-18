import Link from "next/link";
import type { Metadata } from "next";
import PosterHeadline from "@/components/PosterHeadline";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy" },
  title: "Privacy Policy",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <>
      {/* Black banner */}
      <section className="bg-black text-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-10 sm:pt-16">
          <p className="type-label text-yellow mb-3">Legal</p>
          <PosterHeadline as="h1">Privacy Policy</PosterHeadline>
          <div className="section-bar mt-4" aria-hidden="true" />
        </div>
      </section>

      {/* Reading on paper */}
      <section className="bg-paper text-black">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-[88px] space-y-10">
          <p className="type-label">Effective date: October 2026</p>

          <div>
            <h2 className="type-title mb-4">
              Who we are
            </h2>
            <p className="type-body max-w-[66ch]">
              One Flame Records is an independent Jamaican record label based in
              Montego Bay. We operate the website at oneflamerecords.com. If you
              have any questions about this policy, please contact us at{" "}
              <a
                href="mailto:contact@oneflamerecords.com"
                className="inline-block py-3 text-red underline underline-offset-4 focus-on-paper [overflow-wrap:anywhere]"
              >
                contact@oneflamerecords.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="type-title mb-4">
              What data we collect
            </h2>
            <p className="type-body max-w-[66ch] mb-3">
              We collect information you provide and limited technical information needed to operate and improve this website. Information you provide may include:
            </p>
            <ul className="list-disc pl-5 space-y-2 type-body max-w-[66ch]">
              <li>
                <strong className="text-black">Name and email address</strong>{" "}
                — when you subscribe to our newsletter, or submit a contact form.
              </li>
              <li>
                <strong className="text-black">Artist application details</strong>{" "}
                — name, contact information, links, and any materials submitted
                through our artist application form.
              </li>
              <li>
                <strong className="text-black">Contact form submissions</strong>{" "}
                — the content of messages you send us through the contact page.
              </li>
            </ul>
            <p className="type-body max-w-[66ch] mt-3">
              We do not collect payment information directly. We do not use
              tracking cookies or third-party advertising pixels.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-4">Website operation and diagnostics</h2>
            <p className="type-body max-w-[66ch]">Sign-in uses essential session cookies. We use Vercel for hosting, aggregated usage analytics and page-speed measurements, and Sentry for error reports. Error diagnostics may include technical details about your browser and actions around an error. Sentry error replay is configured to mask text and form inputs and block media; it is not used for advertising. Music and video embeds can connect to services such as YouTube and Spotify, which process information under their own policies.</p>
          </div>

          <div>
            <h2 className="type-title mb-4">
              How we use your data
            </h2>
            <ul className="list-disc pl-5 space-y-2 type-body max-w-[66ch]">
              <li>
                To respond to your enquiries and contact form submissions.
              </li>
              <li>
                To send you newsletters and label updates, only with your
                explicit consent at the time of sign-up.
              </li>
              <li>
                To process and review artist applications.
              </li>
            </ul>
            <p className="type-body max-w-[66ch] mt-3">
              We do not sell, rent, or share your personal information with
              third parties for marketing purposes.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-4">
              Data storage
            </h2>
            <p className="type-body max-w-[66ch]">
              Your data is stored securely on cloud infrastructure provided by
              Supabase. Transactional emails are sent via Resend. Both providers
              are bound by their own privacy and security policies. Your data is
              retained for as long as needed to fulfil the purpose for which it
              was collected, or until you request deletion.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-4">
              Newsletter communications
            </h2>
            <p className="type-body max-w-[66ch]">
              If you have subscribed to our newsletter, you may unsubscribe at
              any time by clicking the unsubscribe link in any email we send, or
              by contacting us directly at{" "}
              <a
                href="mailto:contact@oneflamerecords.com"
                className="inline-block py-3 text-red underline underline-offset-4 focus-on-paper [overflow-wrap:anywhere]"
              >
                contact@oneflamerecords.com
              </a>
              . We will process your request promptly.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-4">
              Your rights
            </h2>
            <p className="type-body max-w-[66ch]">
              You have the right to request access to, correction of, or
              deletion of your personal data at any time. To make such a
              request, contact us at{" "}
              <a
                href="mailto:contact@oneflamerecords.com"
                className="inline-block py-3 text-red underline underline-offset-4 focus-on-paper [overflow-wrap:anywhere]"
              >
                contact@oneflamerecords.com
              </a>
              . We will respond within a reasonable timeframe.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-4">
              Changes to this policy
            </h2>
            <p className="type-body max-w-[66ch]">
              We may update this Privacy Policy from time to time. The effective
              date at the top of this page will always reflect the most recent
              version. Continued use of the site after any changes constitutes
              acceptance of the updated policy.
            </p>
          </div>

          <div className="pt-4 border-t-2 border-black">
            <Link
              href="/"
              className="type-label inline-flex min-h-[44px] items-center text-red underline underline-offset-4 focus-on-paper"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
