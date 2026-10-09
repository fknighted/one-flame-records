import { requireBarStaff } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import OpenTabForm from "./OpenTabForm";

export default async function NewTabPage() {
  await requireBarStaff();
  const supabase = createServiceClient();
  const { data: regulars } = await supabase
    .from("bar_regulars")
    .select("id, name, phone, notes")
    .order("name");

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div>
        <p className="text-[14px] mb-2">
          <a href="/bar" className="studio-link inline-flex min-h-[44px] items-center">← Tabs</a>
        </p>
        <h1 className="studio-page-title">Open Tab</h1>
      </div>
      <OpenTabForm regulars={regulars ?? []} />
    </div>
  );
}
