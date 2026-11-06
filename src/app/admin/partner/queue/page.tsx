import ActionForm from '@/components/partner/ActionForm';
import { requirePartnerAdmin } from '@/lib/partner/auth';
import Link from 'next/link';
import { createAdminClient } from '@/lib/partner/database';
import { formatJMD, formatDate } from '@/lib/partner/utils';
import { allTiers } from '@/lib/partner/rules';
import { scheduleDraw, markDrawPaid, cancelDraw } from '@/lib/partner/admin-actions';

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; test?: string }>;
}) {
  await requirePartnerAdmin();
  const { tier: activeTierKey, test } = await searchParams;
  const showTest=test==='1';
  const tiers = allTiers();
  const activeTier = tiers.find((t) => t.key === activeTierKey) ?? tiers[0];

  const adminClient = createAdminClient();

  // Eligible members in the active tier, FIFO
  const { data: queue } = await adminClient
    .from('partner_members')
    .select('id, display_id, full_name, enrollment_date, weeks_paid, tier').throwOnError()
    .eq('status', 'eligible')
    .eq('tier', activeTier.key).eq('is_test',showTest).is('deleted_at',null)
    .order('enrollment_date', { ascending: true }).order('id');

  // Draws for the active tier
  const { data: draws } = await adminClient
    .from('partner_draws')
    .select('id, scheduled_week, paid_date, amount, status, member_id, partner_members!inner(display_id, full_name, tier,is_test)').throwOnError()
    .eq('partner_members.tier',activeTier.key).eq('partner_members.is_test',showTest).order('scheduled_week', { ascending: false }).limit(200);

  // Filter draws to active tier by joining through member tier
  const tierDraws = (draws ?? []).filter((d) => {
    const m = Array.isArray(d.partner_members) ? d.partner_members[0] : d.partner_members as { tier: string } | null;
    return m?.tier === activeTier.key;
  });

  const scheduled = tierDraws.filter(d => d.status === 'scheduled');
  const completed = tierDraws.filter(d => d.status !== 'scheduled');

  return (
    <div className="space-y-8">
      <h2 className="font-poster text-3xl uppercase text-paper">Queues &amp; draws</h2><p className="text-sm text-muted">{showTest?"Test savings only. These funds never pay real draws.":"Real savings only. Each tier funds its own draws."}</p><Link className="studio-btn studio-btn-quiet" href={`/admin/partner/queue?tier=${activeTier.key}${showTest?"":"&test=1"}`}>{showTest?"View real members":"View test members"}</Link>

      {/* Tier tabs */}
      <div className="flex gap-2 border-b border-line">
        {tiers.map((t) => (
          <Link
            key={t.key}
            href={`/admin/partner/queue?tier=${t.key}${showTest?"&test=1":""}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTier.key === t.key
                ? 'border-line text-yellow'
                : 'border-transparent text-muted hover:text-paper'
            }`}
          >
            {t.displayName}
            {t.status === 'coming_soon' && <span className="ml-1.5 text-xs text-muted">soon</span>}
          </Link>
        ))}
      </div>

      {/* Tier summary strip */}
      <div className=" bg-raised border border-line px-4 py-3 text-sm text-yellow flex gap-6">
        <span><strong>{activeTier.displayName}</strong> tier</span>
        <span>Draw: {formatJMD(activeTier.drawAmount)}</span>
        <span>Weekly contribution: {formatJMD(activeTier.weeklyContribution)}</span>
      </div>

      {/* Draw queue */}
      <div className="bg-panel border overflow-x-auto">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <p className="text-sm font-semibold text-paper">{activeTier.displayName} draw queue</p>
          <span className="text-xs text-muted">{queue?.length ?? 0} eligible</span>
        </div>
        {queue && queue.length > 0 ? (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-black">
              <tr>
                <th className="px-4 py-2 text-left text-xs text-muted font-medium">Position</th>
                <th className="px-4 py-2 text-left text-xs text-muted font-medium">Member</th>
                <th className="px-4 py-2 text-left text-xs text-muted font-medium">Enrolled</th>
                <th className="px-4 py-2 text-left text-xs text-muted font-medium">Weeks paid</th>
                <th className="px-4 py-2 text-left text-xs text-muted font-medium">Schedule draw</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {queue.map((m, i) => (
                <tr key={m.id}>
                  <td className="px-4 py-3 font-bold text-yellow">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-paper">{m.full_name}</p>
                    <p className="text-xs text-muted font-mono">{m.display_id}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(m.enrollment_date)}</td>
                  <td className="px-4 py-3 text-paper">{m.weeks_paid}</td>
                  <td className="px-4 py-3">
                    <ActionForm action={scheduleDraw} className="flex items-center gap-2">
                      <input type="hidden" name="member_id" value={m.id} />
                      <input aria-label="Scheduled draw date" type="date" name="scheduled_week" required className=" border border-line px-2 py-1 text-xs" />
                      <button type="submit" className=" bg-yellow px-3 py-1 text-xs font-semibold text-black hover:bg-yellow">
                        Schedule
                      </button>
                    </ActionForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-6 text-sm text-muted">No {activeTier.displayName} members are eligible for a draw yet.</p>
        )}
      </div>

      {/* Scheduled draws */}
      {scheduled.length > 0 && (
        <div className="bg-panel border overflow-x-auto">
          <div className="px-5 py-4 border-b">
            <p className="text-sm font-semibold text-paper">Scheduled {activeTier.displayName} draws</p>
          </div>
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-black">
              <tr>
                {['Member', 'Scheduled week', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {scheduled.map((d) => {
                const member = Array.isArray(d.partner_members) ? d.partner_members[0] : d.partner_members as { full_name: string; display_id: string } | null;
                const markPaid = markDrawPaid.bind(null, d.id, d.member_id);
                const cancel = cancelDraw.bind(null, d.id);
                return (
                  <tr key={d.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-paper">{member?.full_name}</p>
                      <p className="text-xs text-muted font-mono">{member?.display_id}</p>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatDate(d.scheduled_week)}</td>
                    <td className="px-4 py-3 font-semibold">{formatJMD(Number(d.amount))}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <ActionForm action={markPaid}>
                          <button type="submit" className=" bg-paper px-3 py-1 text-xs font-semibold text-black hover:bg-paper">
                            Mark paid
                          </button>
                        </ActionForm>
                        <ActionForm action={cancel}>
                          <button type="submit" className=" border border-line px-3 py-1 text-xs font-semibold text-muted hover:bg-black">
                            Cancel
                          </button>
                        </ActionForm>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Draw history */}
      <div className="bg-panel border overflow-x-auto">
        <div className="px-5 py-4 border-b">
          <p className="text-sm font-semibold text-paper">{activeTier.displayName} draw history</p>
        </div>
        {completed.length > 0 ? (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-black">
              <tr>
                {['Member', 'Scheduled week', 'Paid date', 'Amount', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {completed.map((d) => {
                const member = Array.isArray(d.partner_members) ? d.partner_members[0] : d.partner_members as { full_name: string } | null;
                return (
                  <tr key={d.id}>
                    <td className="px-4 py-3 font-medium text-paper">{member?.full_name}</td>
                    <td className="px-4 py-3 text-muted">{formatDate(d.scheduled_week)}</td>
                    <td className="px-4 py-3 text-muted">{d.paid_date ? formatDate(d.paid_date) : '—'}</td>
                    <td className="px-4 py-3">{formatJMD(Number(d.amount))}</td>
                    <td className="px-4 py-3 capitalize text-muted">{d.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-6 text-sm text-muted">No completed {activeTier.displayName} draws yet.</p>
        )}
      </div>
    </div>
  );
}
