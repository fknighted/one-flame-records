import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import InkShell from "@/components/InkShell";

export default async function BarLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const serviceClient = createServiceClient();
  const { data: profile } = await serviceClient
    .from("profiles")
    .select("role, is_bartender")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "bartender" && profile.role !== "admin" && !profile.is_bartender)) {
    redirect("/login");
  }

  return (
    <InkShell displayName={user.email ?? "Bartender"} mode="bar">
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </InkShell>
  );
}
