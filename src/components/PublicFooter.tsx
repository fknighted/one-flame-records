import Link from "next/link";
import SubscribeForm from "@/components/SubscribeForm";
import LogoMark from "@/components/LogoMark";

const LABEL_LINKS = [
  { href: "/about",   label: "About" },
  { href: "/sign",    label: "Sign with us" },
  { href: "/contact", label: "Contact" },
];

const MUSIC_LINKS = [
  { href: "/artists",  label: "Artists" },
  { href: "/releases", label: "Releases" },
  { href: "/videos",   label: "Videos" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms",   label: "Terms" },
];

// Footer links on black: muted text (12.2:1), yellow on hover, yellow focus ring.
const LINK = "type-small text-muted underline-offset-4 hover:text-yellow hover:underline focus-on-black";

function LinkList({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="type-label text-paper mb-3">{title}</p>
      <ul className="space-y-2.5">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className={LINK}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PublicFooter() {
  return (
    <footer className="bg-black text-muted mt-auto">
      {/* Newsletter: forms sit on paper */}
      <div id="subscribe" className="bg-paper text-black scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid gap-5 md:grid-cols-2 md:items-end">
          <div className="min-w-0">
            <h2 className="type-headline">Stay in the loop.</h2>
            <span aria-hidden="true" className="section-bar mt-2" />
            <p className="type-body mt-4 max-w-[46ch]">
              New releases, events, and label news, straight to your inbox.
            </p>
          </div>
          <div className="min-w-0">
            <SubscribeForm />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand: light stacked logo on black */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block focus-on-black">
              <LogoMark variant="stacked" ground="black" height={112} className="h-24 w-auto sm:h-28" />
            </Link>
            <p className="type-small text-muted mt-4">Montego Bay, Jamaica</p>
          </div>

          <LinkList title="Label" links={LABEL_LINKS} />
          <LinkList title="Music" links={MUSIC_LINKS} />
          <LinkList title="Legal" links={LEGAL_LINKS} />
        </div>

        {/* Bottom row */}
        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="type-caption text-muted">
            &copy; 2026 One Flame Records. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/oneflamerecords"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (opens in a new tab)"
              className="grid place-items-center w-11 h-11 text-muted hover:text-yellow focus-on-black"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://youtube.com/@oneflamerecords"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube (opens in a new tab)"
              className="grid place-items-center w-11 h-11 text-muted hover:text-yellow focus-on-black"
            >
              <svg width="20" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z" />
                <polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="currentColor" stroke="none" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
