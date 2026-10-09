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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/events" className="studio-btn studio-btn-quiet studio-btn-sm mb-3 -ml-3.5">
            Events
          </Link>
          <h1 className="studio-page-title">{event.title}</h1>
        </div>
        <DeleteEventButton id={event.id} />
      </div>
      <EventForm event={event} />
    </div>
  );
}
