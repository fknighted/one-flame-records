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
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center space-y-4">
          <h1 className="font-display font-bold text-ink text-2xl">Invalid unsubscribe link</h1>
          <p className="text-ink/50 text-sm">
            This link doesn't look right. Please use the unsubscribe link from your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-sm w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="font-display font-bold text-ink text-2xl">Unsubscribe</h1>
          <p className="text-ink/50 text-sm">
            Unsubscribe from the One Flame Records newsletter?
          </p>
        </div>
        <UnsubscribeForm email={email} />
      </div>
    </div>
  );
}
