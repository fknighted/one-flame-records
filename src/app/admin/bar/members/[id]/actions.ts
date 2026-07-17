"use server";

import { revalidatePath } from "next/cache";
import * as Sentry from "@sentry/nextjs";
import { createServiceClient, createClient } from "@/lib/supabase/server";
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
  const { data: member } = await supabase.from("gamer_members").select("id").eq("id", id).single();
  if (!member) return { error: "Member not found." };

  // Atomic adjust; clamp_zero=false so a would-be-negative change is rejected
  // (returns null) rather than silently floored.
  const { data: newBalance, error } = await supabase.rpc("adjust_member_minutes", {
    p_member_id:  id,
    p_delta:      minutes,
    p_clamp_zero: false,
  });
  if (error) return { error: `Failed to adjust balance: ${error.message}` };
  if (newBalance === null) return { error: "Balance cannot go below zero." };

  const sessionClient = await createClient();
  const { data: { user: adminUser } } = await sessionClient.auth.getUser();
  const { error: ledgerError } = await supabase.from("gamer_balance_transactions").insert({
    member_id:      id,
    type:           minutes > 0 ? "topup" : "correction",
    amount_minutes: minutes,
    reason:         `Admin adjustment`,
    created_by:     adminUser?.id ?? null,
  });
  if (ledgerError) {
    Sentry.captureException(ledgerError, { tags: { area: "gamer-balance-ledger" }, extra: { memberId: id, action: "adjustBalance" } });
  }

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
