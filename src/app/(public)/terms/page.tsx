import Link from "next/link";
import type { Metadata } from "next";
import PosterHeadline from "@/components/PosterHeadline";

export const metadata: Metadata = {
  title: "Terms of Service — One Flame Records",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <>
      {/* Black banner */}
      <section className="bg-black text-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-10 sm:pt-16">
          <p className="type-label text-yellow mb-3">Legal</p>
          <PosterHeadline as="h1">Terms of Service</PosterHeadline>
          <div className="section-bar mt-4" aria-hidden="true" />
        </div>
      </section>

      {/* Reading on paper */}
      <section className="bg-paper text-black">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-[88px] space-y-10">
          <p className="type-label">Effective date: June 2026</p>

          <div>
            <h2 className="type-title mb-3">
              Acceptance of terms
            </h2>
            <p className="type-body max-w-[66ch]">
              By accessing or using the One Flame Records website at
              oneflamerecords.com, you agree to be bound by these Terms of
              Service. If you do not agree, please do not use the site. These
              terms apply to all visitors and users of the website.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-3">
              Use of the website
            </h2>
            <p className="type-body max-w-[66ch] mb-3">
              This website is provided for personal, non-commercial use. You
              agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-2 type-body max-w-[66ch]">
              <li>
                Use the site in any way that violates applicable local, national,
                or international law.
              </li>
              <li>
                Attempt to gain unauthorised access to any part of the site or
                its underlying infrastructure.
              </li>
              <li>
                Scrape, copy, or redistribute content from this site without
                prior written permission from One Flame Records.
              </li>
              <li>
                Transmit any unsolicited or unauthorised advertising or
                promotional material.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="type-title mb-3">
              Intellectual property
            </h2>
            <p className="type-body max-w-[66ch]">
              All music, artwork, videos, photographs, text, logos, and other
              content on this website are the property of One Flame Records or
              its respective artists and rights holders, and are protected by
              copyright and other intellectual property laws. Nothing on this
              site grants you a licence to reproduce, distribute, or create
              derivative works from any content without express written
              permission.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-3">
              Artist submissions
            </h2>
            <p className="type-body max-w-[66ch]">
              If you submit a demo, application, or other material through the
              site, you grant One Flame Records a non-exclusive right to review
              that material for the purpose of evaluating your application. Any
              formal agreement regarding ownership, royalties, or signing will be
              governed by a separate written contract between you and the label.
              Submission of materials does not guarantee a response or signing
              offer.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-3">
              Newsletter
            </h2>
            <p className="type-body max-w-[66ch]">
              By subscribing to our newsletter, you consent to receive periodic
              email communications from One Flame Records about new releases,
              events, and label news. You may unsubscribe at any time via the
              link in any email or by contacting us at{" "}
              <a
                href="mailto:contact@oneflamerecords.com"
                className="text-red underline underline-offset-4 focus-on-paper [overflow-wrap:anywhere]"
              >
                contact@oneflamerecords.com
              </a>
              .
            </p>
          </div>

          <div>
            <h2 className="type-title mb-3">
              Disclaimer of warranties
            </h2>
            <p className="type-body max-w-[66ch]">
              This website is provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis without any warranties of any kind, express
              or implied. One Flame Records does not warrant that the site will
              be uninterrupted, error-free, or free of harmful components. Your
              use of the site is at your own risk.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-3">
              Limitation of liability
            </h2>
            <p className="type-body max-w-[66ch]">
              To the fullest extent permitted by law, One Flame Records shall not
              be liable for any indirect, incidental, special, or consequential
              damages arising from your use of, or inability to use, this
              website or its content.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-3">
              Governing law
            </h2>
            <p className="type-body max-w-[66ch]">
              These Terms of Service are governed by and construed in accordance
              with the laws of Jamaica. Any disputes arising under these terms
              shall be subject to the exclusive jurisdiction of the courts of
              Jamaica.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-3">
              Changes to these terms
            </h2>
            <p className="type-body max-w-[66ch]">
              We reserve the right to update these Terms of Service at any time.
              The effective date at the top of this page will reflect the most
              recent revision. Continued use of the site after changes are posted
              constitutes acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2 className="type-title mb-3">
              Contact
            </h2>
            <p className="type-body max-w-[66ch]">
              For questions about these terms, contact us at{" "}
              <a
                href="mailto:contact@oneflamerecords.com"
                className="text-red underline underline-offset-4 focus-on-paper [overflow-wrap:anywhere]"
              >
                contact@oneflamerecords.com
              </a>
              .
            </p>
          </div>

          <div className="pt-4 border-t-2 border-black">
            <Link
              href="/"
              className="type-label text-red underline underline-offset-4 focus-on-paper"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
