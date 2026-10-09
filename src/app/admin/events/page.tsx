import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

const TYPE_LABELS: Record<string, string> = {
  open_mic:          "Open Mic",
  showcase:          "Showcase",
  dj_night:          "DJ Night",
  listening_session: "Listening Session",
  watch_party:       "Watch Party",
  private_hire:      "Private Hire",
  other:             "Other",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default async function EventsPage() {
  const supabase = createServiceClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, title, type, event_date, location, is_public")
    .order("event_date", { ascending: true });

  const now = new Date().toISOString();
  const upcoming = (events ?? []).filter((e) => e.event_date >= now);
  const past     = (events ?? []).filter((e) => e.event_date < now);

  type EventRow = { id: string; title: string; type: string; event_date: string; location: string; is_public: boolean };
  function EventRow({ event, i }: { event: EventRow; i: number }) {
    return (
      <div className={`flex items-start justify-between gap-4 px-4 sm:px-5 py-4 ${i > 0 ? "border-t border-line" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-paper [overflow-wrap:anywhere]">{event.title}</span>
            <span className="studio-chip studio-chip-neutral">
              {TYPE_LABELS[event.type] ?? event.type}
            </span>
            {!event.is_public && (
              <span className="studio-chip studio-chip-neutral">
                Private
              </span>
            )}
          </div>
          <p className="text-[15px] text-muted studio-figures">{formatDate(event.event_date)}</p>
          {event.location !== "Flames Lounge, Montego Bay" && (
            <p className="text-[15px] text-muted mt-0.5">{event.location}</p>
          )}
        </div>
        <Link href={`/admin/events/${event.id}/edit`} className="studio-btn studio-btn-secondary studio-btn-sm shrink-0">
          Edit
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="studio-label mb-2">Community</p>
          <h1 className="studio-page-title">Events</h1>
        </div>
        <Link
          href="/admin/events/new"
          className="studio-btn studio-btn-primary shrink-0"
        >
          + New event
        </Link>
      </div>

      {(events ?? []).length === 0 ? (
        <p className="text-muted">No events yet.</p>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="studio-label mb-3">Upcoming</h2>
              <div className="studio-card p-0">
                {upcoming.map((event, i) => <EventRow key={event.id} event={event} i={i} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="studio-label mb-3">Past</h2>
              <div className="studio-card p-0">
                {past.map((event, i) => <EventRow key={event.id} event={event} i={i} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
