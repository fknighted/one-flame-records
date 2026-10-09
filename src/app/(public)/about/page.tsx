import type { Metadata } from "next";
import PosterHeadline from "@/components/PosterHeadline";
import LinkButton from "@/components/LinkButton";

export const metadata: Metadata = {
  title: "About",
  description:
    "One Flame Records is an independent reggae and dancehall label pressed in Montego Bay, Jamaica. The story, the philosophy, and the people behind it.",
};

export default function AboutPage() {
  return (
    <>
      {/* Opening statement on black */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-10 sm:pt-[88px] sm:pb-14">
          <PosterHeadline as="h1" size="headline" className="text-paper">
            One flame is enough.
          </PosterHeadline>
          <span aria-hidden="true" className="section-bar mt-2" />
          <p className="type-lead text-paper mt-6 max-w-[60ch]">
            One Flame Records is an independent reggae and dancehall label based in
            Montego Bay, Jamaica. We record, release, and represent artists who have
            something real to say — and we do it without asking them to compromise
            what makes them worth hearing.
          </p>
        </div>
      </section>

      {/* Long reading sits on paper */}
      <section className="bg-paper text-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <div className="type-body space-y-6 max-w-[66ch]">
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
              Rights stay where they belong — with the artists. We take a cut of
              what we help create, not a permanent stake in what someone built before
              they walked through the door.
            </p>
          </div>

          {/* Closing */}
          <div className="mt-14 pt-10 border-t-[3px] border-black max-w-[66ch]">
            <PosterHeadline size="headline">Work with us.</PosterHeadline>
            <span aria-hidden="true" className="section-bar mt-2" />
            <p className="type-body mt-6 mb-6">
              If you&apos;re an artist looking for a label that will take your music
              seriously — and leave your masters alone — we want to hear from you.
              Reach out directly. No middlemen, no audition portals.
            </p>
            <LinkButton href="/contact" variant="dark" ground="paper">
              Get in touch
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
