import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTier, allTiers } from '@/lib/partner/rules';
import type { TierKey } from '@/lib/partner/rules';
import NotifyMeForm from '@/components/partner/NotifyMeForm';

export function generateStaticParams() {
  return allTiers().map((t) => ({ tier: t.key }));
}

function jmd(n: number) {
  return `J$${n.toLocaleString()}`;
}

const TIER_CONFIG: Record<TierKey, {
  tagline: string;
  description: string;
  color: { accent: string; badge: string; button: string; border: string; bg: string; step: string; divider: string };
}> = {
  spark: {
    tagline: 'The accessible entry point. Build the habit, save consistently.',
    description: 'Spark is our entry-level tier — designed for first-time members who want to experience the partner system without a large weekly commitment. At J$3,000 per week you save a total of J$60,000 and walk away with a J$57,000 draw payout when your turn comes, plus your deposit back at the end.',
    color: {
      accent: 'text-yellow', badge: 'bg-raised text-yellow',
      button: 'bg-yellow hover:bg-yellow', border: 'border-line',
      bg: 'bg-raised', step: 'bg-raised text-yellow', divider: 'bg-raised',
    },
  },
  blaze: {
    tagline: 'Step up your savings. Serious money for serious savers.',
    description: 'Blaze is our mid-tier — for members ready to commit at a higher level. A J$10,000 weekly contribution across 20 weeks earns you a J$190,000 draw payout. The same 20-week structure as Spark, with higher contributions and a larger draw.',
    color: {
      accent: 'text-yellow', badge: 'bg-raised text-yellow',
      button: 'bg-paper hover:bg-paper', border: 'border-line',
      bg: 'bg-raised', step: 'bg-raised text-yellow', divider: 'bg-raised',
    },
  },
  inferno: {
    tagline: 'Maximum impact. Our highest-stakes, highest-return tier.',
    description: 'Inferno is for our most committed members. At J$20,000 per week you contribute J$400,000 over 20 weeks and receive a J$380,000 draw payout when your turn comes. This is the largest draw in our programme — reserved for members who can sustain the full 20-week commitment.',
    color: {
      accent: 'text-yellow', badge: 'bg-raised text-yellow',
      button: 'bg-paper hover:bg-paper', border: 'border-line',
      bg: 'bg-raised', step: 'bg-raised text-yellow', divider: 'bg-raised',
    },
  },
};

export default async function TierPage({ params }: { params: Promise<{ tier: string }> }) {
  const { tier: tierKey } = await params;
  const tier = getTier(tierKey as TierKey);
  if (!tier) notFound();

  const cfg = TIER_CONFIG[tier.key];
  const isLive = tier.status === 'live';

  const steps = [
    {
      week: 'Before week 1',
      title: 'Enroll and pay your deposit',
      body: `Pay a one-time refundable deposit of ${jmd(tier.deposit)}. You will also need a guarantor who agrees to cover up to ${jmd(tier.guarantorMaxLiability)} on your behalf if you default.`,
    },
    {
      week: 'Weeks 1–12',
      title: 'Contribute every week',
      body: `Make a ${jmd(tier.weeklyContribution)} payment each week. You have a ${tier.graceDays}-day grace period after your due date. Payments received after the grace period incur a ${jmd(tier.lateFee)} late fee.`,
    },
    {
      week: 'Week 12',
      title: 'Enter the draw queue',
      body: `After 12 weeks in good standing you become eligible for a draw. You are placed in the queue in enrollment order — whoever joined first is drawn first.`,
    },
    {
      week: 'Weeks 12–20',
      title: 'Receive your draw payout',
      body: `When it is your turn you receive ${jmd(tier.drawAmount)} — paid directly to you. You continue contributing for the remainder of the 20 weeks.`,
    },
    {
      week: 'Week 20',
      title: 'Programme complete — deposit returned',
      body: `Complete all 20 weekly contributions in good standing and your ${jmd(tier.deposit)} deposit is refunded in full.`,
    },
  ];

  return (
    <section className="min-h-screen bg-panel">

      {/* Back link */}
      <div className="px-6 pt-8 max-w-3xl mx-auto">
        <Link href="/" className="text-sm text-muted hover:text-paper">
          ← All tiers
        </Link>
      </div>

      {/* Hero */}
      <section className="px-6 pt-8 pb-14 max-w-3xl mx-auto">
        <span className={`text-xs font-semibold px-2.5 py-1  ${cfg.color.badge}`}>
          {isLive ? 'Open for enrollment' : 'Coming soon'}
        </span>
        <h1 className={`mt-4 text-6xl font-black ${cfg.color.accent}`}>{tier.displayName}</h1>
        <p className="mt-2 text-xl font-semibold text-paper">{cfg.tagline}</p>
        <p className="mt-4 text-muted leading-relaxed max-w-2xl">{cfg.description}</p>
      </section>

      {/* Numbers strip */}
      <section className={`${cfg.color.bg} border-y ${cfg.color.border} px-6 py-10`}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-6">The numbers</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {[
              { label: 'Weekly contribution', value: jmd(tier.weeklyContribution) },
              { label: 'Draw payout', value: jmd(tier.drawAmount) },
              { label: 'Programme length', value: `${tier.termWeeks} weeks` },
              { label: 'Total contributed', value: jmd(tier.totalContribution) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted mb-1">{label}</p>
                <p className={`text-2xl font-black ${cfg.color.accent}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="px-6 py-14 max-w-3xl mx-auto">
        <h2 className="font-poster text-2xl uppercase text-paper mb-10">Your 20-week journey</h2>
        <div className="space-y-0">
          {steps.map(({ week, title, body }, i) => (
            <div key={i} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className={`w-9 h-9  flex-shrink-0 flex items-center justify-center font-bold text-sm ${cfg.color.step}`}>
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-0.5 h-full min-h-[2.5rem] my-1 ${cfg.color.divider}`} />
                )}
              </div>
              <div className="pb-8">
                <p className="text-xs font-medium text-muted mb-0.5">{week}</p>
                <h3 className="font-semibold text-paper">{title}</h3>
                <p className="mt-1 text-sm text-muted leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Terms */}
      <section className="bg-black border-t px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-6">Terms at a glance</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-0">
            {[
              { label: 'Deposit (refundable)', value: jmd(tier.deposit) },
              { label: 'Guarantor max liability', value: jmd(tier.guarantorMaxLiability) },
              { label: 'Late fee', value: jmd(tier.lateFee) },
              { label: 'Grace period', value: `${tier.graceDays} days` },
              { label: 'Default threshold', value: `${tier.defaultDays} days overdue` },
              { label: 'Draw eligibility from', value: `Week ${tier.eligibilityWeeks}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-line py-3">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="text-sm font-semibold text-paper">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        {isLive ? (
          <>
            <h2 className="font-poster text-3xl uppercase text-paper">Ready to join {tier.displayName}?</h2>
            <p className="mt-3 text-muted max-w-md mx-auto">
              Applications take about 5 minutes. You will need your guarantor’s contact details ready.
            </p>
            <Link
              href={`/flames-partner/signup?tier=${tier.key}`}
              className={`mt-8 inline-block  text-black font-semibold px-10 py-3.5 transition-colors text-base ${cfg.color.button}`}
            >
              Apply to join {tier.displayName}
            </Link>
            <p className="mt-4 text-sm text-muted">
              Already a member?{' '}
              <Link href="/flames-partner/login" className={`${cfg.color.accent} hover:underline`}>Sign in</Link>
            </p>
          </>
        ) : (
          <>
            <h2 className="font-poster text-3xl uppercase text-paper">{tier.displayName} is coming soon</h2>
            <p className="mt-3 text-muted max-w-md mx-auto">
              Leave your email and we will let you know the moment {tier.displayName} opens for enrollment.
            </p>
            <div className="mt-8 max-w-sm mx-auto">
              <NotifyMeForm tier={tier.key} />
            </div>
          </>
        )}
      </section>

    </section>
  );
}
