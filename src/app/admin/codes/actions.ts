"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type ActionState = { error: string } | null;

function todayLabel(prefix: string): string {
  return `${prefix} — ${new Date().toISOString().slice(0, 10)}`;
}

export async function generateCode(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();
  const label =
    (formData.get("label") as string)?.trim() || todayLabel("Code");

  const supabase = createServiceClient();

  // Deactivate any existing active code
  const { error: deactivateError } = await supabase
    .from("signup_codes")
    .update({ is_active: false, rotated_at: new Date().toISOString() })
    .eq("is_active", true);

  if (deactivateError) {
    return { error: `Failed to rotate existing code: ${deactivateError.message}` };
  }

  const code = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

  const { error: insertError } = await supabase
    .from("signup_codes")
    .insert({ code, label, is_active: true });

  if (insertError) {
    return { error: `Failed to generate code: ${insertError.message}` };
  }

  revalidatePath("/admin/codes");
  redirect("/admin/codes");
}
