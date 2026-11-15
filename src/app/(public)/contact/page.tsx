import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PublicPageIntro from "@/components/PublicPageIntro";

export const metadata: Metadata = {
  alternates: { canonical: "/contact" },
  title: "Contact",
  description:
    "Get in touch with One Flame Records — press, sync licensing, artist submissions, and general enquiries.",
};

export default function ContactPage() {
  return (
    <>
      <PublicPageIntro title="Contact"><p>
            For press, sync licensing, or artist submissions — use the form below.
            No attachments needed to start a conversation.
      </p></PublicPageIntro>
      <section className="bg-black">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14 sm:py-[88px]">
        {/* ContactForm draws its own paper block */}
        <ContactForm />
      </div>
      </section>
    </>
  );
}
