import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import PrintFilters from "@/components/PrintFilters";
import NotFoundContent from "@/components/NotFoundContent";

// Unmatched URLs render this root file, outside the public layout, so it
// brings its own header and footer. notFound() inside a public page renders
// src/app/(public)/not-found.tsx instead, which relies on the public layout.
export default function NotFound() {
  return (
    <div className="bg-black text-paper font-text min-h-screen flex flex-col">
      <PrintFilters />
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <NotFoundContent />
      </main>
      <PublicFooter />
    </div>
  );
}
