"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type ActionState = { error: string } | null;

export async function adjustBalance(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id      = formData.get("id") as string;
  const minutes = parseInt(formData.get("minutes") as string, 10);

  if (!id)           return { error: "Member ID missing." };
  if (isNaN(minutes)) return { error: "Enter a valid number of minutes." };

  const supabase = createServiceClient();
  const { data: member } = await supabase.from("gamer_members").select("minutes_balance").eq("id", id).single();
  if (!member) return { error: "Member not found." };

  const newBalance = member.minutes_balance + minutes;
  if (newBalance < 0) return { error: "Balance cannot go below zero." };

  const { error } = await supabase.from("gamer_members").update({ minutes_balance: newBalance }).eq("id", id);
  if (error) return { error: `Failed to adjust balance: ${error.message}` };

  revalidatePath(`/admin/bar/members/${id}`);
  return null;
}

export async function toggleMemberStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const id     = formData.get("id") as string;
  const status = formData.get("status") as string;

  if (!id || !["active", "suspended"].includes(status)) return { error: "Invalid request." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("gamer_members").update({ status }).eq("id", id);
  if (error) return { error: `Failed to update status: ${error.message}` };

  revalidatePath(`/admin/bar/members/${id}`);
  revalidatePath("/admin/bar/members");
  return null;
}
