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
        <p className="text-xs text-bone/40 mb-1">
          <a href="/bar" className="hover:text-bone transition-colors">← Tabs</a>
        </p>
        <h1 className="font-display font-bold text-bone text-2xl">Open Tab</h1>
      </div>
      <OpenTabForm regulars={regulars ?? []} />
    </div>
  );
}
