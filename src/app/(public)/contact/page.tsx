import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with One Flame Records — press, sync licensing, artist submissions, and general enquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
          Reach out
        </p>
        <h1 className="font-display font-bold text-oxblood text-[2.5rem] leading-[1.05] tracking-tight">
          Contact
        </h1>
        <div className="mt-3 h-px w-16 bg-oxblood" />
        <p className="mt-5 text-ink/70 leading-relaxed">
          For press, sync licensing, or artist submissions — use the form below.
          No attachments needed to start a conversation.
        </p>
      </div>

      <ContactForm />
    </div>
  );
}
