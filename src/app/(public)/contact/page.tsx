import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PosterHeadline from "@/components/PosterHeadline";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with One Flame Records — press, sync licensing, artist submissions, and general enquiries.",
};

export default function ContactPage() {
  return (
    <section className="bg-black">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14 sm:py-[88px]">
        <div className="mb-10 min-w-0">
          <PosterHeadline as="h1" size="headline" className="text-paper">
            Contact
          </PosterHeadline>
          <span aria-hidden="true" className="section-bar mt-2" />
          <p className="type-lead text-paper mt-6 max-w-[60ch]">
            For press, sync licensing, or artist submissions — use the form below.
            No attachments needed to start a conversation.
          </p>
        </div>

        {/* ContactForm draws its own paper block */}
        <ContactForm />
      </div>
    </section>
  );
}
