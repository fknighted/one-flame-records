import Link from "next/link";

const TOOLS = [
  {
    href: "/admin/ai-studio/images",
    title: "Image Generator",
    description: "Create artist photos, release covers, news cover images, and promotional graphics with DALL-E 3.",
    eyebrow: "DALL-E 3",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    href: "/admin/ai-studio/copy",
    title: "Copy Generator",
    description: "Draft artist bios, release descriptions, news posts, and social captions in the One Flame voice.",
    eyebrow: "Claude",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    href: "/admin/jobs",
    title: "Video Jobs",
    description: "Manage the AI music video generation pipeline — track jobs, retry failures, control costs.",
    eyebrow: "kie.ai / Inngest",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
  },
];

export default function AIStudioPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-2">
          Admin
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">AI Studio</h1>
        <p className="mt-2 text-bone/50 text-sm max-w-lg">
          Generate content for One Flame Records using AI — images, written copy, and music videos.
        </p>
        <div className="mt-4 h-px w-16 bg-bone/20" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {TOOLS.map(({ href, title, description, eyebrow, icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-4 rounded-lg border border-bone/10 p-6 hover:border-ochre/30 hover:bg-bone/[0.02] transition-colors"
          >
            <div className="text-bone/40 group-hover:text-ochre transition-colors">
              {icon}
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-bone/25 mb-1">{eyebrow}</p>
              <h2 className="font-display font-bold text-bone text-lg group-hover:text-ochre transition-colors">{title}</h2>
              <p className="mt-1.5 text-sm text-bone/50 leading-relaxed">{description}</p>
            </div>
            <span className="mt-auto text-xs text-ochre/60 group-hover:text-ochre transition-colors">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
