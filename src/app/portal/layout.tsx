import { createClient } from "@/lib/supabase/server";
import InkShell from "@/components/InkShell";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let displayName = user?.email ?? "";
  let isBartender = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_bartender, artists(stage_name)")
      .eq("id", user.id)
      .single();

    isBartender = profile?.is_bartender === true;

    const stageName = (profile?.artists as { stage_name: string } | null)?.stage_name;
    if (stageName) displayName = stageName;
  }

  return (
    <InkShell displayName={displayName} mode="portal" isBartender={isBartender}>
      {children}
    </InkShell>
  );
}
