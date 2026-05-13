import { createServiceClient } from "@/lib/supabase/server";
import ReleaseForm from "@/components/ReleaseForm";
import { createRelease } from "@/app/admin/releases/actions";

export default async function NewReleasePage() {
  const supabase = createServiceClient();
  const { data: artists } = await supabase
    .from("artists")
    .select("id, stage_name")
    .eq("status", "active")
    .order("stage_name");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl text-bone">New Release</h1>
      <ReleaseForm action={createRelease} mode="create" artists={artists ?? []} />
    </div>
  );
}
