"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

export type ActionState = { error: string } | null;

export async function createRegular(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();
  const name  = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) return { error: "Name is required." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("bar_regulars").insert({ name, phone, notes });
  if (error) return { error: `Failed to save: ${error.message}` };

  revalidatePath("/bar/regulars");
  return null;
}

export async function updateRegular(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();
  const name  = (formData.get("name") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!name) return { error: "Name is required." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("bar_regulars").update({ name, phone, notes }).eq("id", id);
  if (error) return { error: `Failed to update: ${error.message}` };

  revalidatePath("/bar/regulars");
  return null;
}

export async function deleteRegular(id: string): Promise<ActionState> {
  await requireBarStaff();
  const supabase = createServiceClient();
  const { error } = await supabase.from("bar_regulars").delete().eq("id", id);
  if (error) return { error: `Failed to delete: ${error.message}` };
  revalidatePath("/bar/regulars");
  return null;
}
