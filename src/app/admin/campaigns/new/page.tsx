import Link from "next/link";
import CampaignForm from "./CampaignForm";

export default function NewCampaignPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/admin/campaigns" className="inline-flex items-center gap-1.5 text-xs text-bone/35 hover:text-bone/70 transition-colors mb-4">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M19 12H5M5 12l7-7M5 12l7 7" />
          </svg>
          Campaigns
        </Link>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">AI Studio</p>
        <h1 className="font-display font-bold text-bone text-2xl">New Campaign</h1>
        <p className="mt-1 text-sm text-bone/50">
          Paste your source content and the AI will generate platform-ready posts for Instagram, TikTok, and Facebook.
        </p>
      </div>
      <CampaignForm />
    </div>
  );
}
