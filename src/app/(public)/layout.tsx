import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import PrintFilters from "@/components/PrintFilters";

// Sound System ground: black wall, paper text, Archivo body type.
// The old paper-grain overlay is gone (flat blocks, no texture).
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black text-paper font-text min-h-screen flex flex-col">
      {/* Three-tone photo print filters, used by print-yellow / print-red */}
      <PrintFilters />

      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
