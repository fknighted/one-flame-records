import type { Metadata } from "next";
import { createServiceClient } from "@/lib/supabase/server";
import SignupForm from "@/components/SignupForm";
import PosterHeadline from "@/components/PosterHeadline";

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
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-14 sm:py-[88px]">
      <div className="mb-8 min-w-0">
        <p className="type-label text-yellow mb-3">One Flame Records</p>
        <PosterHeadline as="h1">{invalid ? "Link expired" : "Apply to the roster"}</PosterHeadline>
        <p className="type-body text-paper mt-5 max-w-[66ch]">
          {invalid
            ? "This signup link is no longer active. Ask One Flame Records for the latest QR code."
            : "Fill in the form below. We review every application and will reach out by email."}
        </p>
      </div>

      {!invalid && <SignupForm codeId={signupCode.id} />}
    </div>
  );
}
