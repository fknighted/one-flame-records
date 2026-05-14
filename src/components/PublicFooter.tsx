import Link from "next/link";
import Image from "next/image";

const LABEL_LINKS = [
  { href: "/about",   label: "About" },
  { href: "/contact", label: "Contact" },
];

const MUSIC_LINKS = [
  { href: "/artists",  label: "Artists" },
  { href: "/releases", label: "Releases" },
  { href: "/videos",   label: "Videos" },
];

export default function PublicFooter() {
  return (
    <footer className="bg-cream border-t-2 border-oxblood mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="One Flame Records"
                width={80}
                height={80}
                className="h-20 w-auto"
              />
            </Link>
          </div>

          {/* Label */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/60 mb-3">
              Label
            </p>
            <ul className="space-y-2">
              {LABEL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-ink/70 hover:text-oxblood transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Music */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/60 mb-3">
              Music
            </p>
            <ul className="space-y-2">
              {MUSIC_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-ink/70 hover:text-oxblood transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink/60 mb-3">
              Legal
            </p>
            <ul className="space-y-2">
              <li><span className="text-sm text-ink/30">Privacy</span></li>
              <li><span className="text-sm text-ink/30">Terms</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-6 border-t border-oxblood/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-ink/40">
            &copy; 2026 One Flame Records. All rights reserved.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-5">
            <a
              href="https://instagram.com/oneflamerecords"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-ink/40 hover:text-oxblood transition-colors"
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
              className="text-ink/40 hover:text-oxblood transition-colors"
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
