"use server";

import { redirect } from "next/navigation";
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
  const { data: assurance, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !assurance) throw new Error("Could not verify sign-in security.");
  if (assurance.nextLevel === "aal2" && assurance.currentLevel !== "aal2") redirect("/auth/mfa");
}

/** Verify the caller is an authenticated admin, bartender, or artist with bar access. */
export async function requireBarStaff(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_bartender")
    .eq("id", user.id)
    .single();

  if (
    profile?.role !== "admin" &&
    profile?.role !== "bartender" &&
    !(profile?.role === "artist" && profile.is_bartender)
  ) throw new Error("Forbidden");
  if (profile?.role === "admin") await requireAdmin();
}

/** Current authenticated user's id, or null. For audit fields (e.g. added_by). */
export async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
