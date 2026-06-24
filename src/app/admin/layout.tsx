import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import InkShell from "@/components/InkShell";
import { ToastProvider } from "@/components/ToastProvider";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [supabase, serviceClient] = [await createClient(), createServiceClient()];

  const [{ data: { user } }, { count: pendingApps }] = await Promise.all([
    supabase.auth.getUser(),
    serviceClient
      .from("signup_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return (
    <InkShell displayName={user?.email ?? ""} pendingApps={pendingApps ?? 0} mode="admin">
      <ToastProvider>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </ToastProvider>
    </InkShell>
  );
}
