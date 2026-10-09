import { requireBarStaff } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import RegularsClient from "./RegularsClient";

export default async function RegularsPage() {
  await requireBarStaff();
  const supabase = createServiceClient();

  const { data: regulars } = await supabase
    .from("bar_regulars")
    .select("id, name, phone, notes")
    .order("name");

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="studio-page-title">Regulars</h1>
      <RegularsClient regulars={regulars ?? []} />
    </div>
  );
}
