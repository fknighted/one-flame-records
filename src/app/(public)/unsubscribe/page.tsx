import type { Metadata } from "next";
import UnsubscribeForm from "./UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ email?: string }>;
}

export default async function UnsubscribePage({ searchParams }: Props) {
  const { email } = await searchParams;

  if (!email) {
    return (
      <div className="mx-auto max-w-xl px-4 sm:px-6 py-14 sm:py-[88px]">
        <div className="bg-paper text-black p-5 sm:p-6 space-y-3">
          <h1 className="type-title">Invalid unsubscribe link</h1>
          <p className="type-body">
            This link doesn&apos;t look right. Please use the unsubscribe link from your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 sm:px-6 py-14 sm:py-[88px]">
      <div className="bg-paper text-black p-5 sm:p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="type-title">Unsubscribe</h1>
          <p className="type-body">
            Unsubscribe from the One Flame Records newsletter?
          </p>
        </div>
        <UnsubscribeForm email={email} />
      </div>
    </div>
  );
}
