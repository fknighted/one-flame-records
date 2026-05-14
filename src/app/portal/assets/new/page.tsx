import AssetUploadForm from "@/components/AssetUploadForm";

export default function PortalAssetsNewPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
          Artist Portal
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">
          Upload Asset
        </h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      <AssetUploadForm />
    </div>
  );
}
