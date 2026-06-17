import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

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
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

function GameIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <path d="M12 12h.01M17 12h.01" />
      <path d="M7 10v4M5 12h4" />
    </svg>
  );
}

function FoodIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

function FlameGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 28" className={className} aria-hidden="true">
      <path d="M10 1C10 1 4 9 4 16C4 19.8 6.3 23.1 10 25C13.7 23.1 16 19.8 16 16C16 9 10 1 10 1Z" fill="#8B2A1F" />
      <path d="M10 14C10 14 7.5 17.5 7.5 19.5C7.5 21.4 8.6 23 10 24C11.4 23 12.5 21.4 12.5 19.5C12.5 17.5 10 14 10 14Z" fill="#3F5A3A" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: <StudioIcon />,
    title: "Outdoor Recording Studio",
    body: "A full professional studio setup in the open air. Mics, monitors, mixing — all the gear, none of the four walls. Record under Montego Bay skies with acoustics designed to carry.",
  },
  {
    icon: <GameIcon />,
    title: "Gaming Lounge",
    body: "Unwind between sessions. Our gaming setup lets you switch off and recharge — whether you're an artist on a break or just here for the vibes.",
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
  const supabase = await createClient();
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
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-[#0A0806] min-h-[85vh] flex flex-col justify-end">
        {/* Hero photo */}
        <Image
          src="/flames-lounge-hero.jpg"
          alt="Outdoor bar at dusk — the mood of Flames Lounge"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#0A0806]/65" />

        {/* Flame glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 20% 70%, rgba(139,42,31,0.35) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 80% 30%, rgba(184,137,59,0.10) 0%, transparent 60%)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 pb-20 pt-32 w-full">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B8893B] mb-5">
            Montego Bay · Jamaica
          </p>
          <h1 className="font-display font-bold text-[#F5EDD8] text-[clamp(3rem,8vw,6rem)] leading-[0.96] tracking-tight max-w-2xl">
            Flames<br />Lounge
          </h1>
          <div className="mt-6 h-px w-20 bg-[#8B2A1F]" />
          <p className="mt-6 text-lg text-[#F5EDD8]/55 max-w-md leading-relaxed">
            Montego Bay&apos;s creative space — outdoor studio, gaming, Jamaican food,
            and live events. Part of the One Flame Records family.
          </p>

          {/* Social links */}
          <div className="mt-8 flex items-center gap-4">
            <a
              href="https://instagram.com/flamesmobay"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#F5EDD8]/50 hover:text-[#B8893B] transition-colors"
            >
              <InstagramIcon />
              <span>@flamesmobay</span>
            </a>
            <a
              href="https://tiktok.com/@flamesmobay"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#F5EDD8]/50 hover:text-[#B8893B] transition-colors"
            >
              <TikTokIcon />
              <span>@flamesmobay</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── About strip ── */}
      <section className="bg-[#111009]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F5A3A] mb-4">
                About the Lounge
              </p>
              <h2 className="font-display font-bold text-[#F5EDD8] text-[clamp(1.8rem,3.5vw,2.75rem)] leading-tight">
                Where the music meets the moment.
              </h2>
              <div className="mt-4 h-px w-14 bg-[#8B2A1F]" />
            </div>
            <div>
              <p className="text-[#F5EDD8]/55 leading-relaxed">
                Flames Lounge is the creative and social hub connected to One Flame Records.
                It&apos;s where artists come to record, decompress, eat well, and connect —
                and where the community comes to be part of something real. Walk in, feel it, stay a while.
              </p>
              <p className="mt-4 text-[#F5EDD8]/40 text-sm">
                Part of the One Flame Records family.{" "}
                <Link href="/" className="text-[#B8893B] hover:text-[#F5EDD8] transition-colors">
                  Visit the label →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Four pillars ── */}
      <section className="bg-[#0D0B09]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F5A3A] mb-10">
            What we offer
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#F5EDD8]/[0.06] rounded-xl overflow-hidden">
            {PILLARS.map(({ icon, title, body }) => (
              <div key={title} className="bg-[#0D0B09] p-8 sm:p-10">
                <div className="text-[#8B2A1F] mb-5">{icon}</div>
                <h3 className="font-display font-bold text-[#F5EDD8] text-xl mb-3">{title}</h3>
                <p className="text-[#F5EDD8]/50 leading-relaxed text-sm">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Outdoor studio feature ── */}
      <section className="bg-[#0A0806]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="rounded-2xl overflow-hidden border border-[#8B2A1F]/20 bg-gradient-to-br from-[#1A0C07] to-[#0D0B09] p-8 sm:p-14">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B8893B] mb-4">
                Record outdoors
              </p>
              <h2 className="font-display font-bold text-[#F5EDD8] text-[clamp(2rem,4vw,3.25rem)] leading-tight">
                A full studio.<br />Open skies.
              </h2>
              <div className="mt-5 h-px w-14 bg-[#8B2A1F]" />
              <p className="mt-6 text-[#F5EDD8]/55 leading-relaxed max-w-lg">
                Professional microphones, studio monitors, and mixing capability —
                all set up outdoors in Montego Bay. There&apos;s nothing like recording
                with the Caribbean air and the sounds of the city around you.
                Come make something real.
              </p>
            </div>

            {/* Placeholder image block */}
            <div className="mt-10 rounded-xl bg-[#F5EDD8]/[0.03] border border-[#F5EDD8]/[0.06] aspect-[16/6] flex items-center justify-center">
              <div className="text-center">
                <FlameGlyph className="w-10 h-auto mx-auto opacity-10 mb-3" />
                <p className="text-[#F5EDD8]/15 text-xs uppercase tracking-wider">Photo coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Menu ── */}
      <section className="bg-[#111009]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Header */}
            <div className="md:sticky md:top-24">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F5A3A] mb-4">
                The Kitchen
              </p>
              <h2 className="font-display font-bold text-[#F5EDD8] text-[clamp(2rem,4vw,3rem)] leading-tight">
                Jamaican flavour,<br />made fresh.
              </h2>
              <div className="mt-5 h-px w-14 bg-[#8B2A1F]" />
              <p className="mt-5 text-[#F5EDD8]/50 leading-relaxed">
                We cook to order. Our fritters are Jamaican-style — crispy outside,
                full of flavour inside — served with our signature dipping sauces.
                Walk-in, sit down, eat well.
              </p>
            </div>

            {/* Menu items */}
            <div className="space-y-8">
              {MENU.map(({ category, items }) => (
                <div key={category}>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8B2A1F] mb-4">
                    {category}
                  </p>
                  <div className="space-y-4">
                    {items.map(({ name, description }) => (
                      <div key={name} className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4 pb-4 border-b border-[#F5EDD8]/[0.06]">
                        <div>
                          <p className="font-display font-semibold text-[#F5EDD8] text-base">{name}</p>
                          <p className="text-sm text-[#F5EDD8]/40 mt-0.5">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <p className="text-xs text-[#F5EDD8]/25 italic">
                Beverages available — ask your server for today&apos;s selection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Events ── */}
      <section className="bg-[#0D0B09]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F5A3A] mb-4">
              Happening here
            </p>
            <h2 className="font-display font-bold text-[#F5EDD8] text-[clamp(2rem,4vw,3rem)] leading-tight">
              Events & programming
            </h2>
            <div className="mt-4 h-px w-14 bg-[#8B2A1F] mx-auto" />
            <p className="mt-5 text-[#F5EDD8]/50 max-w-lg mx-auto leading-relaxed">
              The Lounge is a live venue. Open mics, DJ nights, artist showcases,
              private hire — if you want to make it happen, this is the place.
            </p>
          </div>

          {(upcomingEvents ?? []).length > 0 ? (
            <div className="space-y-3 max-w-2xl mx-auto">
              {(upcomingEvents ?? []).map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-[#F5EDD8]/[0.09] bg-[#F5EDD8]/[0.02] px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="font-display font-semibold text-[#F5EDD8] text-base leading-snug">
                      {event.title}
                    </p>
                    <p className="text-sm text-[#F5EDD8]/45 mt-1">
                      {formatEventDate(event.event_date)}
                      {" · "}
                      {formatEventTime(event.event_date)}
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#8B2A1F]/20 text-[#B8893B]">
                      {EVENT_TYPE_LABELS[event.type] ?? event.type}
                    </span>
                  </div>
                  {event.tickets_url && (
                    <a
                      href={event.tickets_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded border border-[#B8893B]/50 px-5 py-2 text-sm font-semibold text-[#B8893B] hover:border-[#B8893B] hover:bg-[#B8893B]/10 transition-colors"
                    >
                      Get tickets
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {EVENT_TYPES_LIST.map((label) => (
                <div
                  key={label}
                  className="rounded-lg border border-[#F5EDD8]/[0.07] bg-[#F5EDD8]/[0.02] px-5 py-4 text-center hover:border-[#8B2A1F]/40 hover:bg-[#8B2A1F]/[0.04] transition-colors"
                >
                  <p className="font-display font-semibold text-[#F5EDD8] text-sm sm:text-base">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 text-center">
            <p className="text-[#F5EDD8]/40 text-sm mb-4">
              Want to host a private event or artist showcase?
            </p>
            <Link
              href="/contact"
              className="inline-block rounded border border-[#8B2A1F]/50 px-7 py-3 text-sm font-semibold text-[#F5EDD8]/80 hover:border-[#8B2A1F] hover:text-[#F5EDD8] hover:bg-[#8B2A1F]/10 transition-colors"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      {/* ── Gamer membership CTA ── */}
      <section className="bg-[#0D0B09] border-t border-[#F5EDD8]/[0.05]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F5A3A] mb-2">
              Gaming Lounge
            </p>
            <h2 className="font-display font-bold text-[#F5EDD8] text-2xl sm:text-3xl">
              Get a gamer account
            </h2>
            <p className="mt-2 text-[#F5EDD8]/50 max-w-sm text-sm leading-relaxed">
              Track your sessions, build up game time credit, and skip the queue. Free to join.
            </p>
          </div>
          <Link
            href="/gamer-signup"
            className="shrink-0 rounded-lg bg-[#B8893B] text-[#1A1612] font-semibold px-7 py-3.5 text-sm hover:bg-[#B8893B]/90 transition-colors"
          >
            Join as a Gamer
          </Link>
        </div>
      </section>

      {/* ── Image gallery placeholder ── */}
      <section className="bg-[#0A0806]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#3F5A3A] mb-8">
            The space
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`rounded-lg bg-[#F5EDD8]/[0.03] border border-[#F5EDD8]/[0.05] flex items-center justify-center ${
                  i === 0 ? "md:col-span-2 md:row-span-2 aspect-square" : "aspect-square"
                }`}
              >
                <FlameGlyph className="w-6 h-auto opacity-[0.07]" />
              </div>
            ))}
          </div>
          <p className="mt-4 text-[#F5EDD8]/20 text-xs text-center">Photos coming soon</p>
        </div>
      </section>

      {/* ── Find us ── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: "#8B2A1F" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(0,0,0,0.35) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-20">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h2 className="font-display font-bold text-[#F5EDD8] text-[clamp(2rem,4vw,3rem)] leading-tight">
                Come through.
              </h2>
              <p className="mt-3 text-[#F5EDD8]/70 max-w-md leading-relaxed">
                Montego Bay, Jamaica. Walk-in welcome — no reservation needed.
                Hours coming soon.
              </p>
              <div className="mt-6 flex items-center gap-5">
                <a
                  href="https://instagram.com/flamesmobay"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Flames Lounge on Instagram"
                  className="text-[#F5EDD8]/60 hover:text-[#F5EDD8] transition-colors"
                >
                  <InstagramIcon />
                </a>
                <a
                  href="https://tiktok.com/@flamesmobay"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Flames Lounge on TikTok"
                  className="text-[#F5EDD8]/60 hover:text-[#F5EDD8] transition-colors"
                >
                  <TikTokIcon />
                </a>
                <span className="text-[#F5EDD8]/40 text-sm">@flamesmobay</span>
              </div>
            </div>
            <Link
              href="/contact"
              className="shrink-0 inline-block rounded bg-[#F5EDD8] px-8 py-3.5 text-sm font-semibold text-[#8B2A1F] hover:bg-[#B8893B] hover:text-[#F5EDD8] transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
