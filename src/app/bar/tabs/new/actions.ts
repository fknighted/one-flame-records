"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

export type ActionState = { error: string } | null;

export async function openTab(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const name  = (formData.get("name") as string)?.trim();
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) return { error: "Customer name is required." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const serviceClient = createServiceClient();
  const { data: tab, error } = await serviceClient
    .from("pos_tabs")
    .insert({ name, notes, opened_by: user?.id ?? null })
    .select("id")
    .single();

  if (error || !tab) return { error: `Failed to open tab: ${error?.message ?? "unknown"}` };

  redirect(`/bar/tabs/${tab.id}`);
}
