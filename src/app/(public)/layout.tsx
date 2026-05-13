import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

// Grain texture applied as a fixed overlay with mix-blend-multiply so it
// reads as subtle paper grain without affecting interactive elements.
const GRAIN_SVG =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/></filter><rect width='200' height='200' filter='url(%23n)'/></svg>";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-cream min-h-screen flex flex-col">
      {/* Paper grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.055] mix-blend-multiply"
        style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundSize: "200px 200px" }}
      />

      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
