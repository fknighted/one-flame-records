import type { Metadata } from "next";
import Link from "next/link";
import LinkButton from "@/components/LinkButton";
import LogoMark from "@/components/LogoMark";
import SectionHeader from "@/components/SectionHeader";
import SpeakerRings from "@/components/SpeakerRings";
import EmptyState from "@/components/EmptyState";
import { buttonClasses } from "@/lib/sound-system";
import { createServiceClient } from "@/lib/supabase/server";

// Public lounge page — cookieless service-client read filtered to is_public
// events (matching the events RLS SELECT policy), served as ISR.
export const revalidate = 120;

export const metadata: Metadata = {
  title: "Flames Lounge — Montego Bay's Creative Space",
  description:
    "Outdoor recording studio, gaming lounge, Jamaican food, and live events — all under one roof in Montego Bay, Jamaica. Part of the One Flame Records family.",
  openGraph: {
    title: "Flames Lounge — Montego Bay's Creative Space",
    description:
      "Outdoor studio, gaming, Jamaican fritters, and live events in Montego Bay.",
  },
};

// ── Icons ─────────────────────────────────────────────────────────────────────

function StudioIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

function GameIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <path d="M12 12h.01M17 12h.01" />
      <path d="M7 10v4M5 12h4" />
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

function EventIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const HERO_LIST = [
  { name: "Outdoor studio", note: "Record where the label works" },
  { name: "Gaming lounge", note: "Walk-ins" },
  { name: "Kitchen", note: "Jamaican food" },
  { name: "Bar", note: "Drinks and a tab" },
];

const PILLARS = [
  {
    icon: <StudioIcon />,
    title: "Outdoor Recording Studio",
    body: "A full professional studio setup in the open air. Mics, monitors, mixing — all the gear, none of the four walls. Record under Montego Bay skies with acoustics designed to carry.",
  },
  {
    icon: <GameIcon />,
    title: "Gaming Lounge",
    body: "Unwind between sessions. Our gaming setup lets you switch off and recharge — whether you're an artist on a break or just here to hang out.",
  },
  {
    icon: <FoodIcon />,
    title: "Food & Beverages",
    body: "Jamaican fritters made fresh — fish, jerk chicken, or vegetable — served with our signature dipping sauces. Plus steamed veg and cold drinks to keep you going.",
  },
  {
    icon: <EventIcon />,
    title: "Live Events",
    body: "Open mic nights, artist showcases, DJ sets, listening sessions, watch parties, and private hire. The Lounge is a space for the culture to happen.",
  },
];

const MENU = [
  {
    category: "Fritters",
    items: [
      { name: "Fish Fritters", description: "Crispy Jamaican-style, made fresh to order" },
      { name: "Jerk Chicken Fritters", description: "Spiced, smoky, and perfectly seasoned" },
      { name: "Vegetable Fritters", description: "Garden-fresh, light and crispy" },
    ],
  },
  {
    category: "Sides",
    items: [
      { name: "Steamed Vegetables", description: "Seasonal veg, lightly seasoned" },
      { name: "Signature Sauces", description: "House-made dipping sauces — ask your server what's on today" },
    ],
  },
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  open_mic:          "Open Mic Night",
  showcase:          "Artist Showcase",
  dj_night:          "DJ Night",
  listening_session: "Listening Session",
  watch_party:       "Watch Party",
  private_hire:      "Private Hire",
  other:             "Event",
};

const EVENT_TYPES_LIST = [
  "Open Mic Nights",
  "Artist Showcases",
  "DJ Nights",
  "Listening Sessions",
  "Watch Parties",
  "Private Hire",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function FlamesLoungePage() {
  const supabase = createServiceClient();
  const now = new Date().toISOString();
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, type, event_date, tickets_url")
    .eq("is_public", true)
    .gte("event_date", now)
    .order("event_date", { ascending: true })
    .limit(6);

  function formatEventDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric",
    });
  }
  function formatEventTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", hour12: true,
    });
  }
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["EntertainmentBusiness", "FoodEstablishment"],
    name: "Flames Lounge",
    description:
      "Outdoor recording studio, gaming lounge, Jamaican food, and live events in Montego Bay, Jamaica.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://oneflamerecords.com"}/flames-lounge`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Montego Bay",
      addressRegion: "Saint James",
      addressCountry: "JM",
    },
    parentOrganization: {
      "@type": "Organization",
      name: "One Flame Records",
    },
  };


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "<") }}
      />

      {/* Hero: black panel with a yellow rule, red block where a photo will go.
          No real Lounge photo exists yet; never a stock or generated image. */}
      <section className="grid lg:grid-cols-[1.1fr_1fr] bg-black">
        <div className="min-w-0 px-4 sm:px-6 py-10 sm:py-14 grid gap-5 content-start border-b-4 border-yellow lg:border-b-0 lg:border-r-4">
          <h1 className="type-poster text-paper">
            Flames
            <span className="block text-yellow">Lounge</span>
          </h1>
          <p className="type-lead text-paper max-w-[40ch]">
            Montego Bay&apos;s creative space, part of One Flame Records. Walk-in welcome, no reservation needed.
          </p>
          <div>
            {HERO_LIST.map(({ name, note }) => (
              <div
                key={name}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-3 border-b-2 border-line"
              >
                <span className="type-title-sm text-paper">{name}</span>
                <span className="type-small text-muted">{note}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="https://instagram.com/flamesmobay"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[46px] items-center type-label text-yellow underline underline-offset-4 focus-on-black"
            >
              Follow @flamesmobay on Instagram
            </a>
          </div>
        </div>
        <div aria-hidden="true" className="relative min-h-[260px] bg-red grid place-items-center overflow-hidden">
          <SpeakerRings ground="red" size={190} />
        </div>
      </section>

      {/* About */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-14 sm:py-[88px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="min-w-0">
              <SectionHeader title="Where the music meets the moment." />
            </div>
            <div className="min-w-0">
              <p className="type-body text-paper max-w-[66ch]">
                Flames Lounge is the creative and social hub connected to One Flame Records.
                It&apos;s where artists come to record, decompress, eat well, and connect —
                and where the community comes to be part of something real. Walk in, feel it, stay a while.
              </p>
              <p className="type-body-sm text-muted mt-4">
                Part of the One Flame Records family.{" "}
                <Link href="/" className="inline-flex min-h-[44px] items-center text-yellow underline underline-offset-4 focus-on-black">
                  Visit the label
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What we offer */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-14 sm:pb-[88px]">
          <SectionHeader title="What we offer" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PILLARS.map(({ icon, title, body }) => (
              <div key={title} className="min-w-0 bg-panel border border-line p-6 sm:p-8">
                <div className="text-yellow mb-4">{icon}</div>
                <h3 className="type-title text-paper mb-3 [overflow-wrap:anywhere]">{title}</h3>
                <p className="type-body-sm text-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Outdoor studio feature */}
      <section className="bg-yellow text-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px] grid md:grid-cols-2 gap-8 items-stretch">
          <div className="min-w-0">
            <SectionHeader title="A full studio. Open skies." variant="light" />
            <p className="type-body max-w-[66ch]">
              Professional microphones, studio monitors, and mixing capability —
              all set up outdoors in Montego Bay. There&apos;s nothing like recording
              with the Caribbean air and the sounds of the city around you.
              Come make something real.
            </p>
          </div>
          {/* Red block where a studio photo will go. */}
          <div aria-hidden="true" className="bg-red min-h-[160px] md:min-h-[220px] grid place-items-center">
            <LogoMark variant="flame" ground="red" height={72} alt="" />
          </div>
        </div>
      </section>

      {/* Menu */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="min-w-0 md:sticky md:top-24">
              <SectionHeader title="Jamaican flavour, made fresh." />
              <p className="type-body text-paper max-w-[66ch]">
                We cook to order. Our fritters are Jamaican-style — crispy outside,
                full of flavour inside — served with our signature dipping sauces.
                Walk-in, sit down, eat well.
              </p>
            </div>

            <div className="min-w-0 space-y-8">
              {MENU.map(({ category, items }) => (
                <div key={category}>
                  <p className="type-label text-yellow mb-2">{category}</p>
                  <div>
                    {items.map(({ name, description }) => (
                      <div key={name} className="py-3 border-b-2 border-line">
                        <p className="type-title-sm text-paper [overflow-wrap:anywhere]">{name}</p>
                        <p className="type-small text-muted mt-1">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <p className="type-small text-muted">
                Beverages available — ask your server for today&apos;s selection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="bg-black border-t-4 border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-10 pb-14 sm:py-[88px]">
          <SectionHeader title="Events & programming" />
          <p className="type-body text-paper max-w-[66ch] mb-8">
            The Lounge is a live venue. Open mics, DJ nights, artist showcases,
            private hire — if you want to make it happen, this is the place.
          </p>

          {(upcomingEvents ?? []).length > 0 ? (
            <div className="grid gap-2 max-w-3xl">
              {(upcomingEvents ?? []).map((event) => (
                <div
                  key={event.id}
                  className="bg-panel border border-line px-5 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <p className="type-title text-paper [overflow-wrap:anywhere]">{event.title}</p>
                    <p className="type-body-sm text-muted mt-1">
                      {formatEventDate(event.event_date)}
                      {" · "}
                      {formatEventTime(event.event_date)}
                    </p>
                    <span className="inline-block mt-2 bg-red text-paper type-label px-2 py-1">
                      {EVENT_TYPE_LABELS[event.type] ?? event.type}
                    </span>
                  </div>
                  {event.tickets_url && (
                    <a
                      href={event.tickets_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses("outline", "black", "shrink-0")}
                    >
                      Get tickets
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {EVENT_TYPES_LIST.map((label) => (
                <div key={label} className="bg-panel border-2 border-line px-5 py-4">
                  <p className="type-title-sm text-paper [overflow-wrap:anywhere]">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10">
            <p className="type-body text-paper mb-4">
              Want to host a private event or artist showcase?
            </p>
            <LinkButton href="/contact" variant="outline" ground="black">
              Get in touch
            </LinkButton>
          </div>
        </div>
      </section>

      {/* The space: no photos yet */}
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-0 pb-14 sm:py-[88px]">
          <SectionHeader title="The space" />
          <EmptyState
            title="Photos of the space are on the way."
            body="Follow @flamesmobay on Instagram and TikTok to see the Lounge."
          />
        </div>
      </section>

      {/* Find us */}
      <section className="bg-red text-paper">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-[88px]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="min-w-0">
              <h2 className="type-headline">Come through.</h2>
              <span aria-hidden="true" className="block mt-2 h-2 w-[72px] bg-paper" />
              <p className="type-body mt-4 max-w-[46ch]">
                Montego Bay, Jamaica. Walk-in welcome, no reservation needed.
              </p>
              <div className="mt-6 -ml-3 flex flex-wrap items-center gap-x-2 gap-y-2">
                <a
                  href="https://instagram.com/flamesmobay"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Flames Lounge on Instagram"
                  className="inline-grid place-items-center min-h-[44px] min-w-[44px] text-paper focus-on-red"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="https://tiktok.com/@flamesmobay"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Flames Lounge on TikTok"
                  className="inline-grid place-items-center min-h-[44px] min-w-[44px] text-paper focus-on-red"
                >
                  <TikTokIcon />
                </a>
                <span className="type-label">@flamesmobay</span>
              </div>
            </div>
            <LinkButton href="/contact" variant="dark" ground="red" className="shrink-0">
              Contact us
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
