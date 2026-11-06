import Link from 'next/link';
import { allTiers } from '@/lib/partner/rules';
import NotifyMeForm from '@/components/partner/NotifyMeForm';

function jmd(amount: number) {
  return `J$${amount.toLocaleString()}`;
}

const TIER_COLORS: Record<string, { badge: string; heading: string; border: string }> = {
  spark:   { badge: 'bg-raised text-yellow', heading: 'text-yellow', border: 'border-line' },
  blaze:   { badge: 'bg-raised text-yellow',       heading: 'text-yellow',    border: 'border-line' },
  inferno: { badge: 'bg-raised text-yellow', heading: 'text-yellow', border: 'border-line' },
};

export default function WelcomePage() {
  const tiers = allTiers();

  return (
    <section className="min-h-screen bg-panel">
      {/* Hero */}
      <section className="border-b-4 border-yellow bg-black px-6 py-16 text-center">
        <h1 className="font-poster text-5xl uppercase tracking-tight text-yellow sm:text-7xl">Flames Partner</h1>
        <p className="mt-4 text-lg text-yellow max-w-xl mx-auto">
          A rotating savings programme at One Flame Records. Contribute weekly and receive a draw when your turn comes.
        </p>
        <Link
          href="/flames-partner/signup?tier=spark"
          className="studio-btn studio-btn-primary mt-6"
        >
          Join Spark — Start Today
        </Link>
      </section>

      {/* Tier cards */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="font-poster text-3xl uppercase text-paper text-center mb-3">Choose your tier</h2>
        <p className="text-center text-muted text-sm mb-10">
          All tiers follow the same 20-week program. Only the contribution and draw amounts scale.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {tiers.map((tier) => {
            const colors = TIER_COLORS[tier.key];
            const isLive = tier.status === 'live';
            return (
              <div
                key={tier.key}
                className={`relative  border-2 p-6 flex flex-col gap-4 ${colors.border} ${isLive ? '' : 'opacity-80'}`}
              >
                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-2 py-0.5  ${colors.badge}`}>
                    {isLive ? 'Open' : 'Coming soon'}
                  </span>
                  {tier.displayOrder === 1 && (
                    <span className="text-xs text-muted font-medium">Spark</span>
                  )}
                </div>

                <div>
                  <h3 className={`font-poster text-3xl uppercase ${colors.heading}`}>{tier.displayName}</h3>
                  <p className="text-3xl font-black text-paper mt-1">{jmd(tier.weeklyContribution)}<span className="text-sm font-normal text-muted">/week</span></p>
                </div>

                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted">Draw amount</dt>
                    <dd className="font-semibold text-paper">{jmd(tier.drawAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Deposit</dt>
                    <dd className="font-semibold text-paper">{jmd(tier.deposit)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Eligible after</dt>
                    <dd className="font-semibold text-paper">{tier.eligibilityWeeks} weeks</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted">Total contributed</dt>
                    <dd className="font-semibold text-paper">{jmd(tier.totalContribution)}</dd>
                  </div>
                </dl>

                <div className="mt-auto space-y-2">
                  {isLive ? (
                    <Link
                      href={`/flames-partner/signup?tier=${tier.key}`}
                      className="block text-center  bg-yellow text-black font-semibold px-4 py-2.5 hover:bg-yellow transition-colors text-sm"
                    >
                      Join {tier.displayName}
                    </Link>
                  ) : (
                    <NotifyMeForm tier={tier.key} />
                  )}
                  <Link
                    href={`/flames-partner/tiers/${tier.key}`}
                    className="block text-center text-sm text-muted hover:text-paper py-1"
                  >
                    Full details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-black px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-poster text-3xl uppercase text-paper text-center mb-10">How it works</h2>
          <ol className="space-y-6">
            {[
              { n: '1', title: 'Enroll and pay your deposit', body: 'Pay a refundable deposit to secure your spot. A personal guarantor is required.' },
              { n: '2', title: 'Contribute weekly', body: 'Make weekly contributions for 20 weeks. Your tier sets the amount.' },
              { n: '3', title: 'Become eligible for your draw', body: 'After 12 weeks of good-standing contributions you enter the draw queue.' },
              { n: '4', title: 'Receive your draw', body: 'When it\'s your turn, receive your draw payout — then continue contributing until week 20 and collect your deposit back.' },
            ].map(({ n, title, body }) => (
              <li key={n} className="flex gap-5">
                <span className="flex-shrink-0 w-9 h-9  bg-raised text-yellow font-bold flex items-center justify-center text-sm">
                  {n}
                </span>
                <div>
                  <h3 className="font-semibold text-paper">{title}</h3>
                  <p className="mt-1 text-muted text-sm">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="font-poster text-3xl uppercase text-paper">Ready to join?</h2>
        <p className="mt-3 text-muted max-w-md mx-auto">
          Applications take about 5 minutes. You’ll need your guarantor’s contact details.
        </p>
        <Link
          href="/flames-partner/signup?tier=spark"
          className="mt-6 inline-block  bg-yellow text-black font-semibold px-8 py-3 hover:bg-yellow transition-colors"
        >
          Apply to Join Spark
        </Link>
        <p className="mt-4 text-sm text-muted">
          Already a member?{' '}
          <Link href="/login?next=/flames-partner/dashboard" className="text-yellow hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </section>
  );
}
