import Link from "next/link";
import Image from "next/image";
import SubscribeForm from "@/components/SubscribeForm";

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

export default function PublicFooter() {
  return (
    <footer className="bg-ink border-t-2 border-oxblood mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14">
        {/* Newsletter */}
        <div className="mb-10 pb-10 border-b border-bone/10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-bone/40 mb-2">
            Stay in the loop
          </p>
          <p className="text-sm text-bone/50 mb-3 max-w-sm">
            New releases, events, and label news — straight to your inbox.
          </p>
          <div className="max-w-sm">
            <SubscribeForm />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="One Flame Records"
                width={80}
                height={80}
                className="h-20 sm:h-32 w-auto"
              />
            </Link>
          </div>

          {/* Label */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-bone/40 mb-4">
              Label
            </p>
            <ul className="space-y-2.5">
              {LABEL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-bone/60 hover:text-ochre transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Music */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-bone/40 mb-4">
              Music
            </p>
            <ul className="space-y-2.5">
              {MUSIC_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-bone/60 hover:text-ochre transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-bone/40 mb-4">
              Legal
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/privacy" className="text-sm text-bone/60 hover:text-ochre transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-bone/60 hover:text-ochre transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 border-t border-bone/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-bone/30">
            &copy; 2026 One Flame Records. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com/oneflamerecords"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-bone/35 hover:text-ochre transition-colors"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="https://youtube.com/@oneflamerecords"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-bone/35 hover:text-ochre transition-colors"
            >
              <svg width="19" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
