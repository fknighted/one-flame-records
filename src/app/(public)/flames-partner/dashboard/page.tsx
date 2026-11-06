function safeDocumentUrl(value:string){try{const u=new URL(value);return u.protocol==='https:'?u.href:undefined;}catch{return undefined;}}
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { requirePartnerMember } from '@/lib/partner/auth';
import { getTier } from '@/lib/partner/rules';
import type { TierKey } from '@/lib/partner/rules';
import { formatJMD, formatDate, daysUntil } from '@/lib/partner/utils';

function statusLabel(status: string, weeksPaid: number, termWeeks: number, queuePosition: number | null): string {
  switch (status) {
    case 'pending_guarantor': return 'Awaiting guarantor approval';
    case 'active':            return `Active — week ${weeksPaid} of ${termWeeks}`;
    case 'eligible':          return `Eligible for draw — queue position ${queuePosition ?? '—'}`;
    case 'drew':              return 'Draw received — completing contributions';
    case 'completed':         return 'Program complete';
    case 'defaulted_predraw': return 'Account: pre-draw default';
    case 'defaulted_postdraw':return 'Account: post-draw default';
    case 'withdrawn':         return 'Withdrawn';
    default:                  return status;
  }
}

function statusColor(status: string): string {
  if (['active', 'eligible', 'drew', 'completed'].includes(status)) return 'bg-raised text-yellow border-line';
  if (['defaulted_predraw', 'defaulted_postdraw'].includes(status)) return 'bg-raised text-yellow border-line';
  return 'bg-raised text-yellow border-line';
}

function paymentBadge(status: string) {
  const map: Record<string, string> = {
    paid:      'bg-raised text-yellow',
    pending:   'bg-raised text-yellow',
    late:      'bg-raised text-yellow',
    defaulted: 'bg-raised text-yellow',
  };
  return map[status] ?? 'bg-raised text-muted';
}

export default async function DashboardPage() {
  const {db,memberId}=await requirePartnerMember();
  if(!memberId)return <section className="mx-auto max-w-2xl space-y-4 px-4 py-12"><h1 className="font-poster text-3xl uppercase">My savings</h1><p>No Flames Partner membership is linked to this account.</p><Link href="/flames-partner/signup" className="studio-btn studio-btn-primary">Apply to Spark</Link></section>;
  const {data:member}=await db.from('partner_members').select('*').eq('id',memberId).single().throwOnError();
  if(!member)redirect('/flames-partner');
  const tier=getTier(member.tier as TierKey);
  const [{data:payments},{data:agreements},{data:queue}]=await Promise.all([
    db.from('partner_payments').select('*').eq('member_id',memberId).order('week_number').throwOnError(),
    db.from('partner_agreements').select('id,document_url,signed_date,version').eq('member_id',memberId).order('signed_date',{ascending:false}).throwOnError(),
    db.rpc('partner_queue_position',{p_member:memberId}).throwOnError()
  ]);
  const queuePosition=queue?.position??null,queueTotal=queue?.total??0;
  const nextPayment = payments?.find((p) => p.status === 'pending' || p.status === 'late');
  const progressPct = Math.min(100, Math.round((member.weeks_paid / tier.eligibilityWeeks) * 100));

  return (
    <section className="min-h-screen bg-black">
      <header className="bg-panel border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-paper">Flames Partner</h1>
          <p className="text-xs text-muted">{member.display_id} · {tier.displayName}</p>
        </div>
        <LogoutButton />
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Status banner */}
        <div className={` border px-5 py-4 ${statusColor(member.status)}`}>
          <p className="text-sm font-semibold">{member.full_name}</p>
          <p className="text-sm mt-0.5">{statusLabel(member.status, member.weeks_paid, tier.termWeeks, queuePosition)}</p>
        </div>

        {/* Progress to draw */}
        {['active', 'eligible'].includes(member.status) && (
          <div className="bg-panel  border p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-paper">Progress to eligibility</span>
              <span className="text-muted">{member.weeks_paid} / {tier.eligibilityWeeks} weeks</span>
            </div>
            <div className="w-full bg-raised  h-3">
              <div
                className="bg-yellow h-3  transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {member.weeks_paid >= tier.eligibilityWeeks ? (
              <p className="text-xs text-yellow font-medium">Eligible for draw</p>
            ) : (
              <p className="text-xs text-muted">
                {tier.eligibilityWeeks - member.weeks_paid} more week{tier.eligibilityWeeks - member.weeks_paid !== 1 ? 's' : ''} until eligible
              </p>
            )}
          </div>
        )}

        {/* Queue position */}
        {member.status === 'eligible' && queuePosition !== null && (
          <div className="bg-panel  border p-5">
            <p className="text-sm font-medium text-paper">Queue position</p>
            <p className="mt-1 text-3xl font-bold text-yellow">{queuePosition}</p>
            <p className="text-xs text-muted mt-1">of {queueTotal ?? '—'} in the {tier.displayName} queue</p>
          </div>
        )}

        {/* Next payment */}
        {nextPayment ? (
          <div className="bg-panel  border p-5 space-y-1">
            <p className="text-sm font-medium text-paper">Next payment due</p>
            <p className="font-poster text-3xl uppercase text-paper">{formatJMD(Number(nextPayment.amount) + Number(nextPayment.late_fee))}</p>
            {Number(nextPayment.late_fee) > 0 && (
              <p className="text-xs text-yellow">Includes {formatJMD(tier.lateFee)} late fee</p>
            )}
            <p className="text-sm text-muted">
              Due {formatDate(nextPayment.due_date)}
              {' · '}
              {daysUntil(nextPayment.due_date) > 0
                ? `${daysUntil(nextPayment.due_date)} days away`
                : daysUntil(nextPayment.due_date) === 0
                ? 'Due today'
                : `${Math.abs(daysUntil(nextPayment.due_date))} days overdue`}
            </p>
            <p className="text-xs text-muted">Week {nextPayment.week_number} of {tier.termWeeks}</p>
          </div>
        ) : (
          <div className="bg-panel  border p-5">
            <p className="text-sm font-medium text-paper">Next payment due</p>
            <p className="mt-1 text-sm text-muted">No upcoming payments recorded.</p>
          </div>
        )}

        {/* Payment history */}
        <div className="bg-panel border overflow-x-auto">
          <div className="px-5 py-4 border-b">
            <p className="text-sm font-medium text-paper">Payment history</p>
          </div>
          {payments && payments.length > 0 ? (
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-black">
                <tr>
                  <th className="px-5 py-2 text-left text-xs text-muted font-medium">Week</th>
                  <th className="px-5 py-2 text-left text-xs text-muted font-medium">Due date</th>
                  <th className="px-5 py-2 text-left text-xs text-muted font-medium">Amount</th>
                  <th className="px-5 py-2 text-left text-xs text-muted font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-5 py-3 text-paper">{p.week_number}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(p.due_date)}</td>
                    <td className="px-5 py-3 text-paper">
                      {formatJMD(Number(p.amount))}
                      {Number(p.late_fee) > 0 && (
                        <span className="text-xs text-yellow ml-1">+{formatJMD(Number(p.late_fee))}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-block  px-2 py-0.5 text-xs font-medium capitalize ${paymentBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-4 text-sm text-muted">No payments recorded yet.</p>
          )}
        </div>

        {/* Documents */}
        <div className="bg-panel border overflow-x-auto">
          <div className="px-5 py-4 border-b">
            <p className="text-sm font-medium text-paper">Documents</p>
          </div>
          {agreements && agreements.length > 0 ? (
            <ul className="divide-y divide-line">
              {agreements.map((a) => (
                <li key={a.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <span className="text-paper">Member Agreement v{a.version}</span>
                  <a
                    href={safeDocumentUrl(a.document_url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-yellow hover:underline text-xs"
                  >
                    Download
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-4 text-sm text-muted">No documents on file.</p>
          )}
        </div>

      </div>
    </section>
  );
}
