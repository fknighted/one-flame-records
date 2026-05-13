import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import ReleaseForm from "@/components/ReleaseForm";
import { updateRelease } from "@/app/admin/releases/actions";

export default async function EditReleasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const [{ data: release, error }, { data: artists }] = await Promise.all([
    supabase.from("releases").select("*").eq("id", id).single(),
    supabase
      .from("artists")
      .select("id, stage_name")
      .order("stage_name"),
  ]);

  if (error || !release) notFound();

  const initialValues = {
    id: release.id,
    title: release.title,
    slug: release.slug,
    artist_id: release.artist_id,
    type: release.type,
    release_date: release.release_date,
    description: release.description,
    featured: release.featured,
    cover_url: release.cover_url,
    streaming_links: (release.streaming_links ?? {}) as Record<string, string>,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-bone">{release.title}</h1>
      <ReleaseForm
        action={updateRelease}
        initialValues={initialValues}
        mode="edit"
        artists={artists ?? []}
      />
    </div>
  );
}
