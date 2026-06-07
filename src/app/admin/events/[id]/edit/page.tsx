import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import EventForm from "@/app/admin/events/EventForm";
import DeleteEventButton from "./DeleteEventButton";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createServiceClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (!event) notFound();

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/events" className="text-xs text-bone/40 hover:text-ochre transition-colors mb-3 block">
            ← Events
          </Link>
          <h1 className="font-display font-bold text-bone text-3xl">{event.title}</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
        </div>
        <DeleteEventButton id={event.id} />
      </div>
      <EventForm event={event} />
    </div>
  );
}
