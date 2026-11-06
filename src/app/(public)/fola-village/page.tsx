import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/lib/sound-system";

const BRAND = "/brand/fola-village";

export const metadata: Metadata = {
  title: "Fola Village — life by the river",
  description:
    "A riverside community in Barritown, St. James, outside Montego Bay. Discover Fola Village's story, food grown in the hills, drumming and plans for a more self-sufficient life.",
  alternates: { canonical: "/fola-village" },
  manifest: `${BRAND}/site.webmanifest`,
  icons: {
    icon: [
      { url: `${BRAND}/favicon.svg`, type: "image/svg+xml", sizes: "any" },
      { url: `${BRAND}/favicon-32.png`, type: "image/png", sizes: "32x32" },
    ],
    shortcut: `${BRAND}/favicon.ico`,
    apple: { url: `${BRAND}/apple-touch-icon.png`, sizes: "180x180" },
  },
  openGraph: {
    title: "Fola Village — life by the river",
    description: "River life, food from the hills and a community built together in St. James, Jamaica.",
    url: "/fola-village",
    type: "website",
    images: [{ url: `${BRAND}/social-share.png`, width: 1200, height: 630, alt: "Fola Village — river, rhythm, community" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fola Village — life by the river",
    description: "Get to know a riverside community outside Montego Bay.",
    images: [`${BRAND}/social-share.png`],
  },
};

const LIFE = [
  {
    number: "01",
    title: "The river.",
    detail: "Room to slow down",
    copy: "The river runs through daily life here. Large natural pools open into quieter places to sit back and let the water flow around you.",
  },
  {
    number: "02",
    title: "The food.",
    detail: "From the hills to the table",
    copy: "Members who live in the village grow food in the surrounding hills, then prepare fresh meals to share beside the river. The people growing it are part of the place you're getting to know.",
  },
  {
    number: "03",
    title: "The people.",
    detail: "A place built together",
    copy: "Growing, cooking, building and drumming are part of village life. Supporting one another is the purpose the community was built around.",
  },
];

const PLANS = [
  { title: "Water & light", copy: "Work toward drawing our water and generating power for village lighting from the river." },
  { title: "Food & learning", copy: "Develop a school programme where children can eat meals cooked with food grown in the village." },
  { title: "Making a living", copy: "Open a bakery and woodworking shop, creating more ways for members to work and provide for the community." },
];

export default function FolaVillagePage() {
  return (
    <div className="bg-paper text-black">
      <section aria-labelledby="fola-title" className="border-b-4 border-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 sm:pt-12">
          <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-b border-black/20 pb-5">
            <p className="type-label text-green">Barritown · St. James · Jamaica</p>
            <nav aria-label="Fola Village" className="flex flex-wrap gap-x-6 gap-y-2 type-small">
              <a href="#our-story" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-on-paper">Our story</a>
              <a href="#river-life" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-on-paper">River life</a>
              <a href="#our-plans" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline focus-on-paper">Our plans</a>
            </nav>
          </div>

          <div className="grid items-center gap-10 py-12 sm:py-16 md:grid-cols-[1.2fr_0.8fr] md:gap-12">
            <div className="min-w-0">
              <p className="type-label mb-5">Fola Village</p>
              <h1 id="fola-title" className="type-poster max-w-[9ch]">Life by<br />the river.</h1>
              <p className="type-lead mt-7 max-w-[43ch]">
                A community built into the cliffs, beside a river, outside Montego Bay.
                Living close to nature. Growing food. Supporting each other.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
                <a href="#our-story" className={buttonClasses("primary", "paper", "hover:bg-black hover:text-paper")}>
                  Get to know Fola
                </a>
                <a href="#visit" className="inline-flex min-h-11 items-center type-small underline underline-offset-4 focus-on-paper">Ask about visiting</a>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[340px] md:max-w-none">
              <Image src={`${BRAND}/fola-stacked-colour.svg`} alt="Fola Village: three community dots above a drum, a green rim and a gold river" width={740} height={1170} className="mx-auto h-auto max-h-[440px] w-auto max-w-full" preload unoptimized />
            </div>
          </div>
        </div>
        <div className="bg-black text-paper">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6 py-5">
            <p className="type-title-sm">River. Rhythm. Community.</p>
            <p className="type-small text-muted">Working alongside One Flame Records</p>
          </div>
        </div>
      </section>

      <section id="our-story" aria-labelledby="story-title" className="scroll-mt-28 border-b border-black/20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 py-14 sm:py-[88px] md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <p className="type-label text-green mb-4">Our story</p>
            <h2 id="story-title" className="type-headline">Built together.</h2>
            <span className="mt-5 block h-1 w-16 bg-red" aria-hidden="true" />
          </div>
          <div className="type-body max-w-[60ch] space-y-5">
            <p className="type-lead">Fola began with a shared intention: live close to nature, grow food and build a community where people support one another.</p>
            <p>For 15 years, members have made their home among the rocks on the edge of Barritown. What started as a small community has grown into around ten homes, built into the cliff sides leading down to the river valley.</p>
            <p>Asha, one of the founding members, has helped build the village. He is also a drummer. That connection runs through the name: Fola, the drummer.</p>
            <p>Today, the village is working toward greater self-sufficiency while sharing its way of life with visitors.</p>
          </div>
        </div>
      </section>

      <section id="river-life" aria-labelledby="life-title" className="scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
            <div>
              <p className="type-label text-green mb-4">Life in the village</p>
              <h2 id="life-title" className="type-headline">Close to the land.</h2>
            </div>
            <Image src={`${BRAND}/fola-drum-colour.svg`} alt="" width={66} height={72} className="h-[72px] w-auto" unoptimized />
          </div>
          <div className="border-t-2 border-black">
            {LIFE.map((item) => (
              <article key={item.number} className="grid gap-4 border-b border-black/20 py-8 sm:py-10 md:grid-cols-[56px_0.8fr_1fr] md:gap-8">
                <span className="type-title text-red" aria-hidden="true">{item.number}</span>
                <div>
                  <h3 className="type-title">{item.title}</h3>
                  <p className="type-small mt-3 text-green">{item.detail}</p>
                </div>
                <p className="type-body max-w-[50ch]">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="music-title" className="bg-paper border-y-4 border-black">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 py-14 sm:py-[88px] md:grid-cols-[1.1fr_0.9fr] md:gap-14">
          <Image src={`${BRAND}/community-river.webp`} alt="Illustration of three people sharing a drum beside a flowing river, with community figures, leaves and a gold sun" width={1200} height={800} sizes="(min-width: 768px) 55vw, 100vw" className="h-auto w-full" />
          <div className="max-w-[52ch]">
            <p className="type-label text-green mb-5">Drumming & live music</p>
            <h2 id="music-title" className="font-poster font-black uppercase leading-[0.85] text-[clamp(64px,8vw,112px)]">Fola<br />Village</h2>
            <p className="type-title mt-6 mb-6">Music belongs here.</p>
            <div className="type-body space-y-5 border-t-4 border-yellow pt-6">
              <p>Asha and fellow village drummers bring music into the community. Alongside One Flame Records, we’re shaping a visitor experience centred on live music and gatherings, with local artists passing through.</p>
              <p>Fresh food by the riverside. Time in the water. People coming together around music. That’s the experience we’re building toward.</p>
              <Link href="/artists" className="inline-flex min-h-11 items-center type-small underline underline-offset-4 focus-on-paper">Meet One Flame’s artists</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="our-plans" aria-labelledby="plans-title" className="scroll-mt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <div className="grid gap-6 mb-12 md:grid-cols-2 md:gap-16">
            <div>
              <p className="type-label text-green mb-4">Our next chapter</p>
              <h2 id="plans-title" className="type-headline">Growing from here.</h2>
            </div>
            <p className="type-body max-w-[52ch]">We’re working toward a village that can provide more for itself and create more opportunities for its members. These are our plans for the years ahead.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {PLANS.map((plan) => (
              <article key={plan.title} className="border-t-2 border-green pt-6">
                <h3 className="type-title-sm mb-4">{plan.title}</h3>
                <p className="type-body-sm max-w-[40ch]">{plan.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="visit" aria-labelledby="visit-title" className="scroll-mt-28 bg-black text-paper border-t-4 border-green">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 py-14 sm:py-[88px] md:grid-cols-2 md:gap-16">
          <div>
            <p className="type-label text-yellow mb-4">Get in touch</p>
            <h2 id="visit-title" className="type-headline">Get to know us.</h2>
          </div>
          <div className="max-w-[50ch]">
            <p className="type-body mb-7">Interested in visiting, sharing music or being part of what we’re building? Contact One Flame and mention Fola Village. Ask about current arrangements before making the journey.</p>
            <Link href="/contact" className={buttonClasses("primary", "black")}>Ask about Fola Village</Link>
            <p className="type-small text-muted mt-5">Barritown, St. James · outside Montego Bay</p>
          </div>
        </div>
      </section>
    </div>
  );
}
