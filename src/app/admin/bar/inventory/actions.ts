"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const id  = formData.get("id") as string;
  const raw = formData.get("qty") as string;
  const qty = parseInt(raw, 10);
  if (!id || isNaN(qty) || qty < 0) return;
  const supabase = createServiceClient();
  await supabase
    .from("pos_items")
    .update({ stock_quantity: qty, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/bar/inventory");
}
