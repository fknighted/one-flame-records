"use server";

import { createServiceClient } from "@/lib/supabase/server";

export async function unsubscribeEmail(email: string): Promise<{ error?: string }> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Invalid email address." };
  }

  const supabase = createServiceClient();
  const { error } = await supabase
    .from("fan_subscribers")
    .update({ status: "unsubscribed" })
    .eq("email", email.toLowerCase().trim());

  if (error) {
    return { error: "Something went wrong. Please try again." };
  }

  return {};
}
