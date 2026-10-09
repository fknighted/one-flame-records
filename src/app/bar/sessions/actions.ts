"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { createClient } from "@/lib/supabase/server";
import { requireBarStaff } from "@/lib/auth";

export type ActionState = { error: string } | null;

const DURATION_PRICE: Record<string, number> = {
  half_hour: 300,
  one_hour:  600,
};

export async function startSession(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireBarStaff();

  const station      = (formData.get("station") as string)?.trim() || null;
  const tabItemId    = (formData.get("tab_item_id") as string) || null;
  const durationType = (formData.get("duration_type") as string) || null;

  if (!durationType || !DURATION_PRICE[durationType]) {
    return { error: "Select a session duration." };
  }

  const priceJmd = DURATION_PRICE[durationType];

  const supabase   = createServiceClient();
  const session    = await createClient();
  const { data: { user } } = await session.auth.getUser();

  const { error } = await supabase.from("game_sessions").insert({
    member_id:     null,
    tab_item_id:   tabItemId,
    started_by:    user?.id ?? null,
    station,
    duration_type: durationType,
    price_jmd:     priceJmd,
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
    .select("started_at")
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

  revalidatePath("/bar/sessions");
  return null;
}
