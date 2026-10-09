import MFASection from "./MFASection";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="studio-label mb-2">Label Admin</p>
        <h1 className="studio-page-title">Settings</h1>
      </div>
      <section className="studio-card">
        <MFASection />
      </section>
    </div>
  );
}
