"use server";

import { createServiceClient } from "@/lib/supabase/server";

export async function subscribeEmail(email: string): Promise<{ error?: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("fan_subscribers")
    .insert({ email: email.toLowerCase().trim(), source: "website" });

  if (error) {
    if (error.code === "23505") return {}; // already subscribed — silently succeed
    return { error: "Something went wrong. Please try again." };
  }

  return {};
}
