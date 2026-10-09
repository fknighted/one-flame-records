import MFASection from "./MFASection";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sage mb-2">Label Admin</p>
        <h1 className="font-display font-bold text-bone text-3xl">Settings</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>
      <section className="rounded-lg border border-bone/10 p-6">
        <MFASection />
      </section>
    </div>
  );
}
