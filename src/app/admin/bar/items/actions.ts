"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type ActionState = { error: string } | null;

function parseCents(value: string): number | null {
  const dollars = parseFloat(value);
  if (isNaN(dollars) || dollars < 0) return null;
  return Math.round(dollars * 100);
}

export async function createMenuItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const name          = (formData.get("name") as string)?.trim();
  const category      = formData.get("category") as string;
  const priceStr      = formData.get("price") as string;
  const costStr       = formData.get("cost") as string;
  const description   = (formData.get("description") as string)?.trim() || null;
  const sortStr       = formData.get("sort_order") as string;
  const reorderStr    = formData.get("reorder_level") as string;
  const bottleGroup   = (formData.get("bottle_group") as string)?.trim() || null;
  const bottleYldStr  = formData.get("bottle_yield") as string;

  if (!name)     return { error: "Name is required." };
  if (!category) return { error: "Category is required." };

  const price_cents   = parseCents(priceStr);
  if (price_cents === null) return { error: "Enter a valid price (e.g. 5.00)." };

  const cost_cents    = costStr ? parseCents(costStr) : null;
  const sort_order    = sortStr ? parseInt(sortStr, 10) : null;
  const reorder_level = reorderStr ? parseInt(reorderStr, 10) : null;
  const bottle_yield  = bottleYldStr ? parseInt(bottleYldStr, 10) : null;

  const supabase = createServiceClient();
  const { error } = await supabase.from("pos_items").insert({
    name,
    category,
    price_cents,
    cost_cents,
    description,
    sort_order,
    reorder_level,
    bottle_group: bottleGroup,
    bottle_yield,
  });

  if (error) return { error: `Failed to create item: ${error.message}` };

  revalidatePath("/admin/bar/items");
  redirect("/admin/bar/items");
}

export async function updateMenuItem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id            = formData.get("id") as string;
  const name          = (formData.get("name") as string)?.trim();
  const category      = formData.get("category") as string;
  const priceStr      = formData.get("price") as string;
  const costStr       = formData.get("cost") as string;
  const description   = (formData.get("description") as string)?.trim() || null;
  const sortStr       = formData.get("sort_order") as string;
  const reorderStr    = formData.get("reorder_level") as string;
  const bottleGroup   = (formData.get("bottle_group") as string)?.trim() || null;
  const bottleYldStr  = formData.get("bottle_yield") as string;
  const is_active     = formData.getAll("is_active").includes("true");

  if (!id)   return { error: "ID missing." };
  if (!name) return { error: "Name is required." };

  const price_cents   = parseCents(priceStr);
  if (price_cents === null) return { error: "Enter a valid price (e.g. 5.00)." };

  const cost_cents    = costStr ? parseCents(costStr) : null;
  const sort_order    = sortStr ? parseInt(sortStr, 10) : null;
  const reorder_level = reorderStr ? parseInt(reorderStr, 10) : null;
  const bottle_yield  = bottleYldStr ? parseInt(bottleYldStr, 10) : null;

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("pos_items")
    .update({ name, category, price_cents, cost_cents, description, sort_order, reorder_level, bottle_group: bottleGroup, bottle_yield, is_active })
    .eq("id", id);

  if (error) return { error: `Failed to update item: ${error.message}` };

  revalidatePath("/admin/bar/items");
  redirect("/admin/bar/items");
}

export async function deleteMenuItem(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("pos_items").delete().eq("id", id);
  revalidatePath("/admin/bar/items");
}
