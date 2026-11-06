import { requirePartnerAdmin } from '@/lib/partner/auth';
import Link from 'next/link';
import { createAdminClient } from '@/lib/partner/database';
import { formatDate } from '@/lib/partner/utils';
import { allTiers } from '@/lib/partner/rules';

const STATUS_COLORS: Record<string, string> = {
  pending_guarantor:  'bg-raised text-yellow',
  active:             'bg-raised text-yellow',
  eligible:           'bg-raised text-yellow',
  drew:               'bg-raised text-yellow',
  completed:          'bg-raised text-muted',
  defaulted_predraw:  'bg-raised text-yellow',
  defaulted_postdraw: 'bg-raised text-yellow',
  withdrawn:          'bg-raised text-muted',
};

const TIER_COLORS: Record<string, string> = {
  spark:   'bg-raised text-yellow',
  blaze:   'bg-raised text-yellow',
  inferno: 'bg-raised text-yellow',
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tier?: string; test?: string }>;
}) {
  await requirePartnerAdmin();
  const { status, tier, test } = await searchParams;
  const showTest = test === '1';
  const adminClient = createAdminClient();

  let query = adminClient
    .from('partner_members')
    .select('id, display_id, full_name, email, status, weeks_paid, enrollment_date, tier, is_test').throwOnError()
    .is('deleted_at', null)
    .order('enrollment_date', { ascending: true });

  // Default: show real members only; ?test=1 shows test members only
  if (showTest) {
    query = query.eq('is_test', true);
  } else {
    query = query.eq('is_test', false);
  }

  if (status) query = query.eq('status', status);
  if (tier) query = query.eq('tier', tier);

  const { data: members } = await query;

  const statuses = [
    'pending_guarantor', 'active', 'eligible', 'drew',
    'completed', 'defaulted_predraw', 'defaulted_postdraw', 'withdrawn',
  ];

  const tiers = allTiers();

  function filterHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { status, tier, test, ...overrides };
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v);
    }
    const str = params.toString();
    return `/admin/partner/members${str ? `?${str}` : ''}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-poster text-3xl uppercase text-paper">Members</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">{members?.length ?? 0} shown</span>
          <Link
            href="/admin/partner/members/new"
            className=" bg-yellow px-3 py-1.5 text-sm font-semibold text-black hover:bg-yellow"
          >
            + New test member
          </Link>
        </div>
      </div>

      {/* Real / Test toggle */}
      <div className="flex gap-2">
        <Link
          href={filterHref({ test: undefined })}
          className={`px-3 py-1  text-xs font-medium border ${!showTest ? 'bg-paper text-black border-line' : 'bg-panel text-muted border-line hover:border-line'}`}
        >
          Real members
        </Link>
        <Link
          href={filterHref({ test: '1' })}
          className={`px-3 py-1  text-xs font-medium border ${showTest ? 'bg-amber-600 text-black border-line' : 'bg-panel text-muted border-line hover:border-line'}`}
        >
          Test members
        </Link>
      </div>

      {/* Tier filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={filterHref({ tier: undefined })}
          className={`px-3 py-1  text-xs font-medium border ${!tier ? 'bg-paper text-black border-line' : 'bg-panel text-muted border-line hover:border-line'}`}
        >
          All tiers
        </Link>
        {tiers.map((t) => (
          <Link
            key={t.key}
            href={filterHref({ tier: t.key })}
            className={`px-3 py-1  text-xs font-medium border ${tier === t.key ? 'bg-paper text-black border-line' : 'bg-panel text-muted border-line hover:border-line'}`}
          >
            {t.displayName}
          </Link>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={filterHref({ status: undefined })}
          className={`px-3 py-1  text-xs font-medium border ${!status ? 'bg-paper text-black border-line' : 'bg-panel text-muted border-line hover:border-line'}`}
        >
          All statuses
        </Link>
        {statuses.map((s) => (
          <Link
            key={s}
            href={filterHref({ status: s })}
            className={`px-3 py-1  text-xs font-medium border ${status === s ? 'bg-paper text-black border-line' : 'bg-panel text-muted border-line hover:border-line'}`}
          >
            {s.replace(/_/g, ' ')}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-panel border overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-black border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs text-muted font-medium">ID</th>
              <th className="px-4 py-3 text-left text-xs text-muted font-medium">Name</th>
              <th className="px-4 py-3 text-left text-xs text-muted font-medium hidden sm:table-cell">Tier</th>
              <th className="px-4 py-3 text-left text-xs text-muted font-medium hidden sm:table-cell">Email</th>
              <th className="px-4 py-3 text-left text-xs text-muted font-medium">Status</th>
              <th className="px-4 py-3 text-left text-xs text-muted font-medium hidden sm:table-cell">Weeks paid</th>
              <th className="px-4 py-3 text-left text-xs text-muted font-medium hidden md:table-cell">Enrolled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {members && members.length > 0 ? members.map((m) => (
              <tr key={m.id} className="hover:bg-black">
                <td className="px-4 py-3">
                  <Link href={`/admin/partner/members/${m.id}`} className="font-mono text-xs text-yellow hover:underline">
                    {m.display_id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/partner/members/${m.id}`} className="font-medium text-paper hover:text-yellow">
                    {m.full_name}
                  </Link>
                  {m.is_test && <span className="ml-1.5 text-xs text-yellow font-medium">test</span>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`inline-block  px-2 py-0.5 text-xs font-medium capitalize ${TIER_COLORS[m.tier] ?? 'bg-raised text-muted'}`}>
                    {m.tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted hidden sm:table-cell">{m.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block  px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[m.status] ?? 'bg-raised text-muted'}`}>
                    {m.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-paper hidden sm:table-cell">{m.weeks_paid}</td>
                <td className="px-4 py-3 text-muted hidden md:table-cell">{formatDate(m.enrollment_date)}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">No members found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
