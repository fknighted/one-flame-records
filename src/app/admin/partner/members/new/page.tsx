'use client';

import { useActionState } from 'react';
import { useRetryableAction } from '@/lib/retryable-action';
import Link from 'next/link';
import { allTiers } from '@/lib/partner/rules';
import { createTestMember } from '@/lib/partner/admin-actions';

const DAYS = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
];

export default function NewMemberPage() {
  const tiers = allTiers();
  const [state, action, isPending] = useActionState(useRetryableAction(createTestMember), null);

  return (
    <div className="space-y-6 max-w-lg">
      <Link href="/admin/partner/members" className="text-sm text-yellow hover:underline">← Members</Link>

      <div>
        <h2 className="font-poster text-3xl uppercase text-paper">Create test member</h2>
        <p className="mt-1 text-sm text-muted">
          Admin-created members are <strong>test members</strong> in every tier. Their contributions and draws stay separate from real savings. Real members apply through the guarantor flow.
        </p>
      </div>

      <form action={action} className="bg-panel  border p-6 space-y-4">

        {state?.error && (
          <p className=" bg-raised px-4 py-3 text-sm text-yellow">{state.error}</p>
        )}

        {/* Tier picker */}
        <div>
          <label htmlFor="partner-tier" className="block text-sm font-medium text-paper">Tier</label>
          <select
            id="partner-tier" name="tier"
            required
            className="mt-1 block w-full  border border-line px-3 py-2 text-sm  focus:border-line focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {tiers.map((t) => (
              <option key={t.key} value={t.key}>
                {t.displayName}{t.status === 'coming_soon' ? ' (coming soon — test)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Member fields */}
        {[
          { label: 'Full name',  name: 'full_name', type: 'text' },
          { label: 'Email',      name: 'email',     type: 'email' },
          { label: 'Phone',      name: 'phone',     type: 'tel' },
          { label: 'Address',    name: 'address',   type: 'text' },
          { label: 'Employer',   name: 'employer',  type: 'text' },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label htmlFor={"partner-"+name} className="block text-sm font-medium text-paper">{label}</label>
            <input
              id={"partner-"+name} name={name}
              type={type}
              required
              className="mt-1 block w-full  border border-line px-3 py-2 text-sm  focus:border-line focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        ))}

        {/* Payment day */}
        <div>
          <label htmlFor="partner-day" className="block text-sm font-medium text-paper">Preferred payment day</label>
          <select
            id="partner-day" name="payment_day"
            defaultValue="1"
            className="mt-1 block w-full  border border-line px-3 py-2 text-sm  focus:border-line focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Link
            href="/admin/partner/members"
            className="flex-1 text-center  border border-line px-4 py-2 text-sm font-semibold text-paper hover:bg-black"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1  bg-yellow px-4 py-2 text-sm font-semibold text-black hover:bg-yellow disabled:opacity-60"
          >
            {isPending ? 'Creating…' : 'Create test member'}
          </button>
        </div>
      </form>
    </div>
  );
}
