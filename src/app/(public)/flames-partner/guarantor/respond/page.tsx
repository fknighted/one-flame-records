import { createAdminClient } from '@/lib/partner/database';
import { getTier, type TierKey, GUARANTOR_TOKEN_EXPIRY_DAYS } from '@/lib/partner/rules';
import { respondToGuarantorRequest } from '@/lib/partner/public-actions';
import { redirect } from 'next/navigation';

export default async function GuarantorRespondPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; action?: string }>;
}) {
  const { token, action } = await searchParams;

  if (!token || token.length<32 || token.length>256 || (action !== 'approve' && action !== 'decline')) {
    redirect('/flames-partner/guarantor/respond/invalid');
  }

  const adminClient = createAdminClient();

  const { data: guarantor } = await adminClient
    .from('partner_guarantors')
    .select('id, status, responded_at, created_at, full_name, partner_members(full_name,tier)')
    .eq('approval_token', token)
    .maybeSingle().throwOnError();

  if (!guarantor) redirect('/flames-partner/guarantor/respond/invalid');
  if (guarantor.responded_at) redirect('/flames-partner/guarantor/respond/used');

  const expiresAt = new Date(guarantor.created_at);
  expiresAt.setDate(expiresAt.getDate() + GUARANTOR_TOKEN_EXPIRY_DAYS);
  if (new Date() > expiresAt) redirect('/flames-partner/guarantor/respond/expired');

  const member = Array.isArray(guarantor.partner_members) ? guarantor.partner_members[0] : guarantor.partner_members;
  const memberName = member?.full_name ?? 'this member';

  const isApprove = action === 'approve';

  const confirmAction = respondToGuarantorRequest.bind(null, token, action);

  return (
    <section className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="max-w-md w-full bg-panel  border  p-8 space-y-6">
        <div>
          <h1 className="font-poster text-2xl uppercase text-paper">
            {isApprove ? 'Approve guarantor request' : 'Decline guarantor request'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isApprove
              ? `You are about to approve as guarantor for ${memberName}. By confirming, you agree to be responsible for up to J$${getTier((member?.tier??'spark') as TierKey).guarantorMaxLiability.toLocaleString('en-JM')} in unpaid contributions if they default after receiving their draw.`
              : `You are about to decline the guarantor request for ${memberName}. They will be notified and asked to nominate a different guarantor.`}
          </p>
        </div>

        <form action={confirmAction}>
          <button
            type="submit"
            className={`w-full  px-4 py-2 text-sm font-semibold text-black ${
              isApprove
                ? 'bg-yellow hover:bg-yellow'
                : 'bg-paper hover:bg-paper'
            }`}
          >
            {isApprove ? 'Confirm — I approve' : 'Confirm — I decline'}
          </button>
        </form>
      </div>
    </section>
  );
}
