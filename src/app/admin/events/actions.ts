"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export type ActionState = { error: string } | null;

const EVENT_TYPES = ["open_mic","showcase","dj_night","listening_session","watch_party","private_hire","other"] as const;

function parseForm(formData: FormData) {
  const type = formData.get("type") as string;
  return {
    title:       (formData.get("title") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || null,
    event_date:  (formData.get("event_date") as string) || null,
    end_date:    (formData.get("end_date") as string) || null,
    type:        EVENT_TYPES.includes(type as typeof EVENT_TYPES[number]) ? type : "other",
    location:    (formData.get("location") as string)?.trim() || "Flames Lounge, Montego Bay",
    tickets_url: (formData.get("tickets_url") as string)?.trim() || null,
    is_public:   formData.get("is_public") === "true",
  };
}

export async function createEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const fields = parseForm(formData);
  if (!fields.title)      return { error: "Title is required." };
  if (!fields.event_date) return { error: "Event date is required." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("events").insert({ ...fields, event_date: fields.event_date! });
  if (error) return { error: `Failed to create event: ${error.message}` };

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEvent(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = formData.get("id") as string;
  if (!id) return { error: "Event ID missing." };

  const fields = parseForm(formData);
  if (!fields.title)      return { error: "Title is required." };
  if (!fields.event_date) return { error: "Event date is required." };

  const supabase = createServiceClient();
  const { error } = await supabase.from("events").update({ ...fields, event_date: fields.event_date! }).eq("id", id);
  if (error) return { error: `Failed to update event: ${error.message}` };

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEvent(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createServiceClient();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/admin/events");
}
