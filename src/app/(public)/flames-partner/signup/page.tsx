import { redirect } from 'next/navigation';
import { liveTiers } from '@/lib/partner/rules';
import type { TierKey } from '@/lib/partner/rules';
import SignupForm from './SignupForm';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier: rawTier } = await searchParams;

  // Default to spark; reject any non-live tier
  const live = liveTiers().map((t) => t.key);
  const tier: TierKey = live.includes(rawTier as TierKey) ? (rawTier as TierKey) : 'spark';

  // If an explicit non-live tier was requested, reject at the page level too
  if (rawTier && !live.includes(rawTier as TierKey)) {
    redirect('/flames-partner');
  }

  return (
    <section className="min-h-screen bg-black px-4 py-12">
      <div className="max-w-lg mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-poster text-3xl uppercase text-paper">Apply to join Flames Partner</h1>
          <p className="mt-2 text-sm text-muted">Takes about 5 minutes. Have your guarantor’s details ready.</p>
        </div>
        <div className="bg-panel  border p-8 ">
          <SignupForm tier={tier} />
        </div>
      </div>
    </section>
  );
}
