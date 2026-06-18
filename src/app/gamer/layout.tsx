import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import InkShell from "@/components/InkShell";

export default async function GamerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const serviceClient = createServiceClient();
  const [{ data: profile }, { data: member }] = await Promise.all([
    serviceClient.from("profiles").select("role").eq("id", user.id).single(),
    serviceClient.from("gamer_members").select("display_name").eq("auth_user_id", user.id).single(),
  ]);

  if (!profile || (profile.role !== "gamer" && profile.role !== "admin")) {
    redirect("/login");
  }

  const displayName = member?.display_name ?? user.email ?? "Gamer";

  return (
    <InkShell displayName={displayName} mode="gamer">
      <div className="p-4 sm:p-6 lg:p-8">{children}</div>
    </InkShell>
  );
}
