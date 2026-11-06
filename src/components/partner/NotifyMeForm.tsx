'use client';

import { useState, useTransition } from 'react';
import { captureInterest } from '@/lib/partner/public-actions';
import type { TierKey } from '@/lib/partner/rules';

export default function NotifyMeForm({ tier }: { tier: TierKey }) {
  const [email, setEmail] = useState('');
  const [error,setError]=useState<string|null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    startTransition(async () => {
      setError(null);
      const result=await captureInterest(email.trim(),tier);
      if(result.error)setError(result.error);else setDone(true);
    });
  }

  if (done) {
    return <p className="text-sm text-yellow font-medium text-center py-2">You’re on the list!</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <label className="sr-only" htmlFor={"interest-"+tier}>Email for {tier} updates</label>
      <input id={"interest-"+tier}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full  border border-line px-3 py-2 text-sm focus:border-line focus:outline-none focus:ring-1 focus:ring-orange-500"
      />
      {error&&<p role="alert" className="text-sm text-paper">{error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="w-full  border border-line px-4 py-2 text-sm font-medium text-paper hover:bg-black disabled:opacity-60"
      >
        {isPending ? 'Saving…' : 'Notify me when open'}
      </button>
    </form>
  );
}
