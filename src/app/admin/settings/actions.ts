"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";

export type SettingsState = { error: string } | { success: true } | null;

export async function updateBudget(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const raw = formData.get("monthly_video_budget_usd") as string;
  const value = parseFloat(raw);

  if (isNaN(value) || value < 0) {
    return { error: "Budget must be a positive number." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key: "monthly_video_budget_usd", value: value as unknown as import("@/types/supabase").Json })
    .eq("key", "monthly_video_budget_usd");

  if (error) return { error: "Could not save setting." };

  revalidatePath("/admin/settings");
  return { success: true };
}
