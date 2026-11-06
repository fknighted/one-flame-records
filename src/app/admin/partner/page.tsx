import { requirePartnerAdmin } from '@/lib/partner/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/partner/database';
import { createAdminClient } from '@/lib/partner/database';
import { formatJMD, formatDate } from '@/lib/partner/utils';
import { allTiers, getTier } from '@/lib/partner/rules';
import type { TierKey } from '@/lib/partner/rules';

type TierSummaryRow = {
  tier: string;
  active_members: number;
  queue_length: number;
  total_contributions_received: number;
  total_draws_paid: number;
  buffer_balance: number;
};

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ include_test?: string }>;
}) {
  await requirePartnerAdmin();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { include_test } = await searchParams;
  const includeTest = include_test === '1';

  const adminClient = createAdminClient();

  // Per-tier summary from the DB function
  const { data: tierRows } = await adminClient
    .rpc('partner_tier_summary', { include_test: includeTest }).throwOnError() as { data: TierSummaryRow[] | null };

  const tiers = allTiers();

  // Build a lookup; rows only exist for tiers that have members
  const byTier: Record<string, TierSummaryRow> = {};
  for (const row of tierRows ?? []) {
    byTier[row.tier] = row;
  }

  // Compute totals across all tiers
  const totals = {
    active_members: 0,
    queue_length: 0,
    buffer_balance: 0,
    weekly_inflow: 0,
  };

  for (const tier of tiers) {
    const row = byTier[tier.key];
    const activeMembers = Number(row?.active_members ?? 0);
    totals.active_members += activeMembers;
    totals.queue_length += Number(row?.queue_length ?? 0);
    totals.buffer_balance += Number(row?.buffer_balance ?? 0);
    totals.weekly_inflow += activeMembers * tier.weeklyContribution;
  }

  // Next scheduled draw (any tier)
  let nextDrawQuery = adminClient
    .from('partner_draws')
    .select('id, scheduled_week, amount, member_id, partner_members!inner(display_id, full_name, tier,is_test)').throwOnError()
    .eq('status', 'scheduled')
    .order('scheduled_week', { ascending: true })
    .limit(1);
  if(!includeTest)nextDrawQuery=nextDrawQuery.eq('partner_members.is_test',false);
  const {data:nextDraw}=await nextDrawQuery.maybeSingle();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-poster text-3xl uppercase text-paper">Overview</h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted">Test members:</span>
          <Link
            href={includeTest ? '/admin/partner' : '/admin/partner?include_test=1'}
            className={` px-3 py-1 border font-medium transition-colors ${includeTest ? 'bg-raised text-yellow border-line' : 'bg-panel text-muted border-line hover:border-line'}`}
          >
            {includeTest ? 'Included' : 'Excluded'}
          </Link>
        </div>
      </div>

      {/* Combined totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active members (all tiers)', value: totals.active_members },
          { label: 'In draw queues',             value: totals.queue_length },
          { label: 'Combined buffer',            value: formatJMD(totals.buffer_balance) },
          { label: 'Est. weekly inflow',         value: formatJMD(totals.weekly_inflow) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-panel  border p-5">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 font-poster text-3xl uppercase text-paper">{value}</p>
          </div>
        ))}
      </div>

      {/* Per-tier breakdown */}
      <div className="bg-panel border overflow-x-auto">
        <div className="px-5 py-4 border-b">
          <p className="text-sm font-semibold text-paper">Per-tier breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-black">
              <tr>
                {['Tier', 'Active members', 'Queue', 'Contributions received', 'Draws paid', 'Buffer balance', 'Est. weekly inflow'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tiers.map((tier) => {
                const row = byTier[tier.key];
                const activeMembers = Number(row?.active_members ?? 0);
                return (
                  <tr key={tier.key}>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-paper">{tier.displayName}</span>
                      {tier.status === 'coming_soon' && (
                        <span className="ml-2 text-xs text-muted">coming soon</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-paper">{activeMembers}</td>
                    <td className="px-4 py-3 text-paper">{Number(row?.queue_length ?? 0)}</td>
                    <td className="px-4 py-3 text-paper">{formatJMD(Number(row?.total_contributions_received ?? 0))}</td>
                    <td className="px-4 py-3 text-paper">{formatJMD(Number(row?.total_draws_paid ?? 0))}</td>
                    <td className="px-4 py-3 font-semibold text-paper">{formatJMD(Number(row?.buffer_balance ?? 0))}</td>
                    <td className="px-4 py-3 text-muted">{formatJMD(activeMembers * tier.weeklyContribution)}</td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="bg-black font-semibold">
                <td className="px-4 py-3 text-paper">All tiers</td>
                <td className="px-4 py-3 text-paper">{totals.active_members}</td>
                <td className="px-4 py-3 text-paper">{totals.queue_length}</td>
                <td className="px-4 py-3 text-paper">
                  {formatJMD(tiers.reduce((s, t) => s + Number(byTier[t.key]?.total_contributions_received ?? 0), 0))}
                </td>
                <td className="px-4 py-3 text-paper">
                  {formatJMD(tiers.reduce((s, t) => s + Number(byTier[t.key]?.total_draws_paid ?? 0), 0))}
                </td>
                <td className="px-4 py-3 text-paper">{formatJMD(totals.buffer_balance)}</td>
                <td className="px-4 py-3 text-paper">{formatJMD(totals.weekly_inflow)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Next scheduled draw */}
      <div className="bg-panel  border p-5">
        <p className="text-sm font-medium text-paper mb-3">Next scheduled draw</p>
        {nextDraw ? (() => {
          const m = Array.isArray(nextDraw.partner_members) ? nextDraw.partner_members[0] : nextDraw.partner_members as { full_name: string; display_id: string; tier: string } | null;
          const tierLabel = m?.tier ? getTier(m.tier as TierKey).displayName : '';
          return (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-paper">{m?.full_name ?? '—'}</p>
                <p className="text-sm text-muted">
                  {formatDate(nextDraw.scheduled_week)} · {formatJMD(Number(nextDraw.amount))} · {tierLabel}
                </p>
              </div>
              <Link href="/admin/partner/queue" className="text-sm text-yellow hover:underline">
                Manage queue →
              </Link>
            </div>
          );
        })() : (
          <p className="text-sm text-muted">No draws scheduled. <Link href="/admin/partner/queue" className="text-yellow hover:underline">Go to queue →</Link></p>
        )}
      </div>
    </div>
  );
}
