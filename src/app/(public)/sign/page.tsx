import type { Metadata } from "next";
import Link from "next/link";
import LinkButton from "@/components/LinkButton";
import PosterHeadline from "@/components/PosterHeadline";
import SectionHeader from "@/components/SectionHeader";
import GrilleBand from "@/components/GrilleBand";

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
      {/* Hero: yellow poster block */}
      <section className="relative bg-yellow text-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-12 pb-20 sm:pt-16 md:pb-14 md:pr-[84px] min-w-0">
          <PosterHeadline as="h1" size="poster">Sign with One Flame.</PosterHeadline>
          <p className="type-lead mt-4 max-w-[30ch]">
            You keep your publishing. We handle the platform.
          </p>
          <p className="type-body mt-6 max-w-[66ch]">
            One Flame Records is an independent reggae and dancehall label
            based in Montego Bay, Jamaica. We&apos;re looking for artists who
            have something real to say. We sign artists, not sounds. If the
            music is rooted, honest, and built to last, we want to hear it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <LinkButton href="/contact" variant="outline" ground="yellow">
              Start the conversation
            </LinkButton>
            <Link
              href="/artists"
              className="type-label text-black underline underline-offset-4 focus-on-yellow"
            >
              Our roster
            </Link>
          </div>
        </div>
        <GrilleBand className="absolute left-0 right-0 bottom-0 h-[42px] md:left-auto md:inset-y-0 md:w-[60px] md:h-auto" />
      </section>

      {/* What we look for: reading on paper */}
      <section className="bg-paper text-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
            <div className="min-w-0">
              <SectionHeader as="h2" variant="paper" title="Rooted music. Real stories." />
              <p className="type-body mt-6 max-w-[66ch]">
                One Flame started in the tradition of Jamaican music, not to
                chase what&apos;s trending, but to amplify voices that carry
                weight. We sign artists at every stage, from emerging
                bedroom producers to established performers ready for the
                next chapter.
              </p>
              <p className="type-body mt-4 max-w-[66ch]">
                We work closely with our artists on production, releases,
                visual identity, and distribution. You keep your publishing.
                We handle the platform.
              </p>
            </div>
            <div className="min-w-0">
              <h3 className="type-label mb-4">Genres we work with</h3>
              <ul className="border-t-2 border-black">
                {GENRES.map((g) => (
                  <li key={g} className="type-title-sm border-b-2 border-black py-3 [overflow-wrap:anywhere]">
                    {g}
                  </li>
                ))}
              </ul>
              <p className="type-body-sm mt-6 max-w-[66ch]">
                If your sound doesn&apos;t fit a neat category but feels
                connected to Caribbean music culture, reach out anyway. We
                listen before we label.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process: black ground, raised tiles */}
      <section className="bg-black text-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <SectionHeader as="h2" title="Simple. Three steps." />
          <ol className="grid md:grid-cols-3 gap-2 mt-8">
            {PROCESS.map(({ step, title, body }) => (
              <li key={step} className="bg-raised text-paper p-5 sm:p-6 min-w-0">
                <span className="type-number text-yellow block mb-3">{step}</span>
                <h3 className="type-title mb-3 [overflow-wrap:anywhere]">{title}</h3>
                <p className="type-body-sm">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final call: red block */}
      <section className="bg-red text-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="min-w-0">
            <p className="type-label mb-3">Montego Bay, Jamaica</p>
            <PosterHeadline as="h2">Ready to talk?</PosterHeadline>
            <p className="type-body mt-3 max-w-[40ch]">
              Send us a message and include links to your music. We read
              every submission.
            </p>
          </div>
          <LinkButton href="/contact" variant="primary" ground="red" className="shrink-0">
            Get in touch
          </LinkButton>
        </div>
      </section>
    </>
  );
}
