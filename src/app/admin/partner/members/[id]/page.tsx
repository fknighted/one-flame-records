import ActionForm from '@/components/partner/ActionForm';
import { requirePartnerAdmin } from '@/lib/partner/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createAdminClient } from '@/lib/partner/database';
import { formatJMD, formatDate } from '@/lib/partner/utils';
import { getTier } from '@/lib/partner/rules';
import type { TierKey } from '@/lib/partner/rules';
import { recordPayment, updateMemberStatus, retryMemberMail } from '@/lib/partner/admin-actions';

const PAYMENT_BADGE: Record<string, string> = {
  paid:      'bg-raised text-yellow',
  pending:   'bg-raised text-yellow',
  late:      'bg-raised text-yellow',
  defaulted: 'bg-raised text-yellow',
};

export default async function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePartnerAdmin();
  const { id } = await params;
  const adminClient = createAdminClient();

  const { data: member } = await adminClient
    .from('partner_members')
    .select('*').throwOnError()
    .eq('id', id)
    .single();

  if (!member) notFound();

  const tier = getTier(member.tier as TierKey);

  const [{ data: guarantors }, { data: payments }, { data: draws }] = await Promise.all([
    adminClient.from('partner_guarantors').select('*').throwOnError().eq('member_id', id).order('created_at', { ascending: false }),
    adminClient.from('partner_payments').select('*').throwOnError().eq('member_id', id).order('week_number', { ascending: true }),
    adminClient.from('partner_draws').select('*').throwOnError().eq('member_id', id).order('scheduled_week', { ascending: false }),
  ]);

  const {data:mailJobs}=await adminClient.from('partner_delivery_jobs').select('id,kind,status,attempts,last_error').eq('member_id',id).throwOnError();
  const retryMail=retryMemberMail.bind(null,id);
  const guarantor = guarantors?.[0];
  const paidWeeks = (payments ?? []).filter(p => p.received_date).map(p => p.week_number);
  const nextWeek = (() => {
    for (let w = 1; w <= tier.termWeeks; w++) {
      if (!paidWeeks.includes(w)) return w;
    }
    return null;
  })();

  const recordPaymentForMember = recordPayment.bind(null, id);
  const markDefaultPre   = updateMemberStatus.bind(null, id, 'defaulted_predraw');
  const markDefaultPost  = updateMemberStatus.bind(null, id, 'defaulted_postdraw');
  const markWithdrawn    = updateMemberStatus.bind(null, id, 'withdrawn');

  return (
    <div className="space-y-6">
      <Link href="/admin/partner/members" className="text-sm text-yellow hover:underline">← All members</Link>

      {/* Member info */}
      <div className="bg-panel  border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-poster text-2xl uppercase text-paper">{member.full_name}</h2>
            <p className="text-sm text-muted font-mono">{member.display_id}</p>
          </div>
          <div className="flex items-center gap-2">
            {member.is_test && (
              <span className="inline-block  px-2 py-0.5 text-xs font-medium bg-raised text-yellow">
                test
              </span>
            )}
            <span className="inline-block  px-2 py-0.5 text-xs font-medium bg-raised text-yellow capitalize">
              {tier.displayName}
            </span>
            <span className="inline-block  px-3 py-1 text-xs font-medium bg-raised text-yellow capitalize">
              {member.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          {[
            ['Email', member.email],
            ['Phone', member.phone],
            ['Address', member.address],
            ['Employer', member.employer],
            ['Enrolled', formatDate(member.enrollment_date)],
            ['Weeks paid', `${member.weeks_paid} / ${tier.termWeeks}`],
            ['Weekly contribution', formatJMD(tier.weeklyContribution)],
            ['Draw amount', formatJMD(tier.drawAmount)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-muted text-xs">{label}</dt>
              <dd className="text-paper font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Guarantor */}
      {guarantor && (
        <div className="bg-panel  border p-6">
          <h2 className="text-sm font-semibold text-paper mb-3">Guarantor</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Name', guarantor.full_name],
              ['Email', guarantor.email],
              ['Phone', guarantor.phone],
              ['Relationship', guarantor.relationship_to_member],
              ['Status', guarantor.status],
              ['Responded', guarantor.responded_at ? formatDate(guarantor.responded_at) : 'Pending'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-muted text-xs">{label}</dt>
                <dd className="text-paper font-medium capitalize">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {mailJobs&&mailJobs.length>0&&<div className="studio-card space-y-3"><h2 className="studio-label">Account &amp; email setup</h2><ul>{mailJobs.map(job=><li key={job.id} className="text-sm">{job.kind.replaceAll('_',' ')}: {job.status==='sent'?'Accepted by email provider':'Pending'}{job.last_error?' — '+job.last_error:''}</li>)}</ul><ActionForm action={retryMail}><button className="studio-btn studio-btn-quiet">Retry pending messages</button></ActionForm></div>}
      {/* Actions */}
      <div className="bg-panel  border p-6 space-y-4">
        <h2 className="text-sm font-semibold text-paper">Actions</h2>

        {/* Record payment */}
        {nextWeek && ['active', 'eligible', 'drew'].includes(member.status) && (
          <ActionForm action={recordPaymentForMember} className="space-y-3 border  p-4">
            <p className="text-sm font-medium text-paper">Record payment</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="week_number" className="block text-xs text-muted">Week number</label>
                <select key={nextWeek} id="week_number" name="week_number" defaultValue={nextWeek} className="mt-1 w-full  border border-line px-2 py-1.5 text-sm">
                  {Array.from({ length: tier.termWeeks }, (_, i) => i + 1).map(w => (
                    <option key={w} value={w} disabled={paidWeeks.includes(w)}>Week {w}{paidWeeks.includes(w) ? ' ✓' : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="method" className="block text-xs text-muted">Method</label>
                <select id="method" name="method" className="mt-1 w-full  border border-line px-2 py-1.5 text-sm">
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank transfer</option>
                </select>
              </div>
              <div>
                <label htmlFor="due_date" className="block text-xs text-muted">Due date</label>
                <input type="date" id="due_date" name="due_date" required className="mt-1 w-full  border border-line px-2 py-1.5 text-sm" />
              </div>
              <div className="flex items-end pb-1.5">
                <label className="flex items-center gap-2 text-sm text-muted">
                  <input type="checkbox" name="late_fee" className="" />
                  Apply late fee ({formatJMD(tier.lateFee)})
                </label>
              </div>
            </div>
            <button type="submit" className=" bg-yellow px-4 py-1.5 text-sm font-semibold text-black hover:bg-yellow">
              Record payment
            </button>
          </ActionForm>
        )}

        {/* Status overrides */}
        <div className="flex flex-wrap gap-2 pt-2">
          {['active','eligible','drew','pending_guarantor'].includes(member.status) && (
            <>
              {['active','eligible'].includes(member.status)&&<ActionForm action={markDefaultPre}>
                <button type="submit" className=" border border-line px-3 py-1.5 text-xs font-semibold text-yellow hover:bg-raised">
                  Default (pre-draw)
                </button>
              </ActionForm>}
              {member.status==='drew'&&<ActionForm action={markDefaultPost}>
                <button type="submit" className=" border border-line px-3 py-1.5 text-xs font-semibold text-yellow hover:bg-raised">
                  Default (post-draw)
                </button>
              </ActionForm>}
              {member.status!=='drew'&&<ActionForm action={markWithdrawn}>
                <button type="submit" className=" border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:bg-black">
                  Withdraw
                </button>
              </ActionForm>}
            </>
          )}
        </div>
      </div>

      {/* Payments */}
      <div className="bg-panel border overflow-x-auto">
        <div className="px-5 py-4 border-b">
          <p className="text-sm font-semibold text-paper">Payment history</p>
        </div>
        {payments && payments.length > 0 ? (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-black">
              <tr>
                {['Week', 'Due date', 'Received', 'Amount', 'Late fee', 'Method', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2.5">{p.week_number}</td>
                  <td className="px-4 py-2.5 text-muted">{formatDate(p.due_date)}</td>
                  <td className="px-4 py-2.5 text-muted">{p.received_date ? formatDate(p.received_date) : '—'}</td>
                  <td className="px-4 py-2.5">{formatJMD(Number(p.amount))}</td>
                  <td className="px-4 py-2.5">{Number(p.late_fee) > 0 ? formatJMD(Number(p.late_fee)) : '—'}</td>
                  <td className="px-4 py-2.5 capitalize">{p.method?.replace('_', ' ') ?? '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={` px-2 py-0.5 text-xs font-medium capitalize ${PAYMENT_BADGE[p.status] ?? 'bg-raised text-muted'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-4 text-sm text-muted">No payments recorded.</p>
        )}
      </div>

      {/* Draws */}
      <div className="bg-panel border overflow-x-auto">
        <div className="px-5 py-4 border-b">
          <p className="text-sm font-semibold text-paper">Draws</p>
        </div>
        {draws && draws.length > 0 ? (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-black">
              <tr>
                {['Scheduled week', 'Amount', 'Paid date', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs text-muted font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {draws.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-2.5">{formatDate(d.scheduled_week)}</td>
                  <td className="px-4 py-2.5">{formatJMD(Number(d.amount))}</td>
                  <td className="px-4 py-2.5 text-muted">{d.paid_date ? formatDate(d.paid_date) : '—'}</td>
                  <td className="px-4 py-2.5 capitalize">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-5 py-4 text-sm text-muted">No draws recorded.</p>
        )}
      </div>
    </div>
  );
}
