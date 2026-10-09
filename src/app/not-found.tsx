import LinkButton from "@/components/LinkButton";
import LogoMark from "@/components/LogoMark";
import PosterHeadline from "@/components/PosterHeadline";

// Sits outside the public layout, so it sets its own black ground and fonts.
export default function NotFound() {
  return (
    <main className="min-h-screen bg-black text-paper font-text flex flex-col items-center justify-center px-4 py-14 text-center">
      <LogoMark variant="stacked" ground="black" height={96} alt="One Flame Records" className="mb-8" />

      <p className="type-label text-yellow mb-3">404</p>
      <PosterHeadline as="h1">Page not found.</PosterHeadline>
      <div className="section-bar my-6" aria-hidden="true" />
      <p className="type-body text-paper max-w-[40ch] mb-10">
        That page doesn&apos;t exist or has been moved. Head back to the
        homepage to keep listening.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <LinkButton href="/" variant="primary" ground="black">
          Go home
        </LinkButton>
        <LinkButton href="/releases" variant="outline" ground="black">
          Releases
        </LinkButton>
      </div>
    </main>
  );
}
