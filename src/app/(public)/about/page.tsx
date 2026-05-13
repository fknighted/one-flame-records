import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "One Flame Records is an independent reggae and dancehall label pressed in Montego Bay, Jamaica. The story, the philosophy, and the people behind it.",
};

const TIMELINE = [
  {
    year: "2018",
    event: "Founded",
    detail:
      "One Flame Records is established in Montego Bay by a small group of musicians and producers tired of watching Jamaican talent sign away their masters to overseas labels.",
  },
  {
    year: "2019",
    event: "First release",
    detail:
      "The label's debut catalogue — four singles across two artists — lands on streaming platforms and earns rotation on local radio within the first month.",
  },
  {
    year: "2020",
    event: "Distribution deal",
    detail:
      "A non-exclusive international distribution agreement puts One Flame releases on every major platform worldwide while keeping rights firmly in Montego Bay.",
  },
  {
    year: "2021",
    event: "Studio expansion",
    detail:
      "The original recording room doubles in size. A dedicated mixing suite is added, allowing the label to bring post-production fully in-house for the first time.",
  },
  {
    year: "2022",
    event: "Video production",
    detail:
      "One Flame begins producing its own music videos — real locations, natural light, no green screens. The visual identity of the label takes shape alongside the sound.",
  },
  {
    year: "2023",
    event: "Roster grows",
    detail:
      "Five artists signed. The roster spans traditional roots reggae, contemporary dancehall, and a handful of artists who resist either category.",
  },
  {
    year: "2024",
    event: "Ten million streams",
    detail:
      "The catalogue crosses ten million combined streams. Not a boast — a marker. The music is finding people without the help of a major.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">

      {/* Opening statement */}
      <div className="mb-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ochre mb-4">
          Montego Bay · Jamaica
        </p>
        <h1 className="font-display font-bold text-oxblood text-[clamp(2.25rem,5vw,3.5rem)] leading-[1.05] tracking-tight">
          One flame is enough.
        </h1>
        <div className="mt-5 h-px w-20 bg-oxblood" />
        <p className="mt-6 text-[1.15rem] text-ink/80 leading-relaxed">
          One Flame Records is an independent reggae and dancehall label based in
          Montego Bay, Jamaica. We record, release, and represent artists who have
          something real to say — and we do it without asking them to compromise
          what makes them worth hearing.
        </p>
      </div>

      {/* Body copy */}
      <div className="prose-section space-y-6 text-ink/75 leading-relaxed text-[1.05rem] mb-16">
        <p>
          The label was built on a straightforward premise: Jamaican music has been
          shaping the world&apos;s ear for sixty years, and the people making it should
          own the results. Too many artists from this island have signed deals that
          handed their catalogues to companies headquartered in cities that couldn&apos;t
          place Montego Bay on a map. One Flame exists to be the alternative.
        </p>
        <p>
          We work across the full spectrum of Jamaican sound — roots, dancehall,
          lovers rock, and the newer strains that don&apos;t have names yet. What the
          roster has in common is not a genre; it&apos;s a standard. The music has to
          mean something. The recording has to serve the song. The image has to
          come from the artist, not be handed to them.
        </p>
        <p>
          Production, mixing, and video work happen in-house at our Montego Bay
          studio. We don&apos;t outsource the creative process to a facility in Kingston
          or Miami and call it a Jamaican record. Everything that leaves this label
          was made here, by people who live here, for an audience that deserves
          the real thing.
        </p>
        <p>
          Distribution is worldwide. The deal structure keeps rights where they
          belong — with the artists. We take a cut of what we help create, not a
          permanent stake in what someone built before they walked through the door.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-oxblood/15 mb-16" />

      {/* Timeline */}
      <div className="mb-16">
        <h2 className="font-display font-bold text-oxblood text-2xl mb-1">Timeline</h2>
        <div className="mt-2 h-px w-10 bg-oxblood mb-10" />

        <ol className="relative border-l border-oxblood/20 space-y-0">
          {TIMELINE.map(({ year, event, detail }, i) => (
            <li key={i} className="pl-8 pb-10 last:pb-0 relative">
              {/* Dot */}
              <span className="absolute -left-[5px] top-[6px] w-2.5 h-2.5 rounded-full bg-oxblood" />

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-1.5">
                <span className="font-display font-bold text-oxblood text-lg leading-none">
                  {event}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/40">
                  {year}
                </span>
              </div>
              <p className="text-sm text-ink/65 leading-relaxed">{detail}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Divider */}
      <div className="h-px bg-oxblood/15 mb-16" />

      {/* Closing / CTA */}
      <div>
        <h2 className="font-display font-bold text-oxblood text-2xl mb-4">
          Work with us.
        </h2>
        <p className="text-ink/70 leading-relaxed mb-6">
          If you&apos;re an artist looking for a label that will take your music
          seriously — and leave your masters alone — we want to hear from you.
          Reach out directly. No middlemen, no audition portals.
        </p>
        <a
          href="/contact"
          className="inline-block rounded bg-oxblood px-6 py-2.5 text-sm font-semibold text-bone hover:bg-ochre transition-colors"
        >
          Get in touch
        </a>
      </div>

    </div>
  );
}
