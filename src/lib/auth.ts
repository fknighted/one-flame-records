"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Verify the caller is an authenticated admin.
 * Throws if not — call at the top of any server action that modifies data
 * or calls external APIs.
 */
export async function requireAdmin(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Forbidden");
}

/** Verify the caller is an authenticated admin OR bartender. */
export async function requireBarStaff(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "bartender") throw new Error("Forbidden");
}
