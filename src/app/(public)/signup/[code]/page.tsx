import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import SignupForm from "@/components/SignupForm";

export const metadata: Metadata = {
  title: "Apply to One Flame Records",
  description: "Submit your application to join the One Flame Records roster.",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = createServiceClient();

  const { data: signupCode } = await supabase
    .from("signup_codes")
    .select("id, label, is_active")
    .eq("code", code)
    .maybeSingle();

  const invalid = !signupCode || !signupCode.is_active;

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
          One Flame Records
        </p>
        <h1 className="font-display font-bold text-oxblood text-[2.5rem] leading-[1.05] tracking-tight">
          {invalid ? "Link expired" : "Apply to the roster"}
        </h1>
        <div className="mt-3 h-px w-16 bg-oxblood" />
        <p className="mt-5 text-ink/70 leading-relaxed">
          {invalid
            ? "This signup link is no longer active. Ask One Flame Records for the latest QR code."
            : "Fill in the form below. We review every application and will reach out by email."}
        </p>
      </div>

      {!invalid && <SignupForm codeId={signupCode.id} />}
    </div>
  );
}
