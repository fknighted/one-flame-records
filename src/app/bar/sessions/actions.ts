"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

export type ActionState = { error: string } | null;

export async function startSession(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const memberId  = (formData.get("member_id") as string) || null;
  const station   = (formData.get("station") as string)?.trim() || null;
  const tabItemId = (formData.get("tab_item_id") as string) || null;

  const supabase   = createServiceClient();
  const session    = await createClient();
  const { data: { user } } = await session.auth.getUser();

  const { error } = await supabase.from("game_sessions").insert({
    member_id:   memberId,
    tab_item_id: tabItemId,
    started_by:  user?.id ?? null,
    station,
  });

  if (error) return { error: `Failed to start session: ${error.message}` };

  revalidatePath("/bar/sessions");
  return null;
}

export async function endSession(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const sessionId = formData.get("session_id") as string;
  if (!sessionId) return { error: "Session ID missing." };

  const supabase = createServiceClient();

  const { data: gs } = await supabase
    .from("game_sessions")
    .select("started_at, member_id")
    .eq("id", sessionId)
    .is("ended_at", null)
    .single();

  if (!gs) return { error: "Active session not found." };

  const endedAt = new Date().toISOString();
  const durationMinutes = Math.ceil(
    (new Date(endedAt).getTime() - new Date(gs.started_at).getTime()) / 60000
  );

  const { error: updateError } = await supabase.from("game_sessions").update({
    ended_at:         endedAt,
    duration_minutes: durationMinutes,
  }).eq("id", sessionId);

  if (updateError) return { error: `Failed to end session: ${updateError.message}` };

  // Deduct from member balance if linked
  if (gs.member_id) {
    const { data: member } = await supabase
      .from("gamer_members")
      .select("minutes_balance")
      .eq("id", gs.member_id)
      .single();

    if (member) {
      const newBalance = Math.max(0, member.minutes_balance - durationMinutes);
      const { error: balanceError } = await supabase
        .from("gamer_members")
        .update({ minutes_balance: newBalance })
        .eq("id", gs.member_id);
      if (balanceError) return { error: `Session ended but balance not deducted: ${balanceError.message}` };

      const { data: { user: barUser } } = await (await createClient()).auth.getUser();
      await supabase.from("gamer_balance_transactions").insert({
        member_id:      gs.member_id,
        type:           "session",
        amount_minutes: -durationMinutes,
        reason:         `Game session (${durationMinutes}m)`,
        created_by:     barUser?.id ?? null,
      });
    }
  }

  revalidatePath("/bar/sessions");
  return null;
}
