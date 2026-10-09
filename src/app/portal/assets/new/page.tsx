import AssetUploadForm from "@/components/AssetUploadForm";

export default function PortalAssetsNewPage() {
  return (
    <div className="max-w-xl">
      <div className="mb-8">
        <p className="studio-label mb-2">Artist Portal</p>
        <h1 className="studio-page-title">
          Upload Asset
        </h1>
      </div>

      <AssetUploadForm />
    </div>
  );
}
