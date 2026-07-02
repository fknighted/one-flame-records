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
      <div className={`flex items-start justify-between gap-4 px-5 py-4 ${i > 0 ? "border-t border-bone/8" : ""}`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-medium text-bone">{event.title}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-bone/10 text-bone/50">
              {TYPE_LABELS[event.type] ?? event.type}
            </span>
            {!event.is_public && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-oxblood/15 text-rose">
                Private
              </span>
            )}
          </div>
          <p className="text-xs text-bone/60">{formatDate(event.event_date)}</p>
          {event.location !== "Flames Lounge, Montego Bay" && (
            <p className="text-xs text-bone/50 mt-0.5">{event.location}</p>
          )}
        </div>
        <Link href={`/admin/events/${event.id}/edit`} className="shrink-0 text-xs text-bone/60 hover:text-ochre transition-colors">
          Edit →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage mb-2">Community</p>
          <h1 className="font-display font-bold text-bone text-3xl">Events</h1>
          <div className="mt-3 h-px w-16 bg-bone/20" />
        </div>
        <Link
          href="/admin/events/new"
          className="shrink-0 rounded bg-ochre px-4 py-2.5 text-sm font-medium text-ink hover:bg-ochre/90 transition-colors"
        >
          + New event
        </Link>
      </div>

      {(events ?? []).length === 0 ? (
        <p className="text-bone/60 text-sm">No events yet.</p>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/52 mb-3">Upcoming</p>
              <div className="rounded-lg border border-bone/10 overflow-hidden">
                {upcoming.map((event, i) => <EventRow key={event.id} event={event} i={i} />)}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bone/52 mb-3">Past</p>
              <div className="rounded-lg border border-bone/10 overflow-hidden opacity-60">
                {past.map((event, i) => <EventRow key={event.id} event={event} i={i} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
