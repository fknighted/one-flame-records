import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign with One Flame Records",
  description:
    "One Flame Records is looking for artists who have something real to say. Roots reggae, dancehall, and conscious music from Montego Bay.",
};

const PROCESS = [
  {
    step: "01",
    title: "Get in touch",
    body: "Send us a message through our contact page. Include a brief bio, your sound, and links to your best work — no attachments needed at this stage.",
  },
  {
    step: "02",
    title: "We review your music",
    body: "Every submission is listened to by the label team. We look for originality, craft, and cultural rootedness. We'll get back to you within two weeks.",
  },
  {
    step: "03",
    title: "Conversation, not a contract",
    body: "If the music fits, we set up a call — no pressure, no paperwork yet. We want to understand where you're headed before anything else.",
  },
];

const GENRES = [
  "Roots reggae",
  "Dancehall",
  "Conscious music",
  "Rocksteady",
  "Ska",
  "Afrobeats / Afrodancehall",
];

export default function SignPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-24 pb-24 md:pt-32 md:pb-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-forest mb-5">
            For Artists
          </p>
          <h1 className="font-display font-bold text-bone text-[clamp(2.75rem,6vw,5rem)] leading-[1.02] tracking-tight max-w-3xl">
            We&apos;re looking for artists who have something real to say.
          </h1>
          <div className="mt-6 h-px w-24 bg-oxblood" />
          <p className="mt-6 text-lg text-bone/60 max-w-xl leading-relaxed">
            One Flame Records is an independent reggae and dancehall label
            based in Montego Bay, Jamaica. We sign artists, not sounds — if
            the music is rooted, honest, and built to last, we want to hear it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="inline-block rounded bg-ochre px-7 py-3 text-sm font-semibold text-ink hover:bg-bone transition-colors"
            >
              Start the conversation
            </Link>
            <Link
              href="/artists"
              className="inline-block rounded border border-bone/30 px-7 py-3 text-sm font-semibold text-bone hover:border-bone hover:bg-bone/5 transition-colors"
            >
              Our roster
            </Link>
          </div>
        </div>
      </section>

      {/* ── What we look for ── */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-3">
                What we look for
              </p>
              <h2 className="font-display font-bold text-oxblood text-[clamp(2rem,3.5vw,2.75rem)] leading-tight">
                Rooted music.<br />Real stories.
              </h2>
              <div className="mt-4 h-px w-16 bg-oxblood" />
              <p className="mt-6 text-ink/70 leading-relaxed">
                One Flame started in the tradition of Jamaican music — not to
                chase what&apos;s trending, but to amplify voices that carry
                weight. We sign artists at every stage, from emerging
                bedroom producers to established performers ready for the
                next chapter.
              </p>
              <p className="mt-4 text-ink/70 leading-relaxed">
                We work closely with our artists on production, releases,
                visual identity, and distribution. You keep your publishing.
                We handle the platform.
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/40 mb-4">
                Genres we work with
              </p>
              <ul className="space-y-2">
                {GENRES.map((g) => (
                  <li key={g} className="flex items-center gap-3">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full bg-oxblood shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-ink/80 text-[15px]">{g}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-sm text-ink/50 leading-relaxed">
                If your sound doesn&apos;t fit a neat category but feels
                connected to Caribbean music culture, reach out anyway — we
                listen before we label.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Process ── */}
      <section className="bg-ink">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-3">
            How it works
          </p>
          <h2 className="font-display font-bold text-bone text-[clamp(2rem,3.5vw,2.75rem)] leading-tight mb-12">
            Simple. Three steps.
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {PROCESS.map(({ step, title, body }) => (
              <div key={step} className="border-t border-bone/10 pt-6">
                <span className="font-mono text-[11px] text-bone/25 tracking-widest block mb-4">
                  {step}
                </span>
                <h3 className="font-display font-semibold text-bone text-xl mb-3">
                  {title}
                </h3>
                <p className="text-bone/50 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-oxblood">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-bone/50 mb-3">
              Montego Bay · Jamaica
            </p>
            <h2 className="font-display font-bold text-bone text-[clamp(2rem,4vw,3rem)] leading-tight">
              Ready to talk?
            </h2>
            <p className="mt-3 text-bone/70 max-w-md leading-relaxed">
              Send us a message and include links to your music. We read
              every submission.
            </p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 inline-block rounded bg-bone px-8 py-3.5 text-sm font-semibold text-ink hover:bg-ochre transition-colors"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
