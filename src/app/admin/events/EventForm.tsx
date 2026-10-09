"use client";

import { useActionState } from "react";
import { createEvent, updateEvent, type ActionState } from "./actions";

const EVENT_TYPES = [
  { value: "open_mic",          label: "Open Mic Night" },
  { value: "showcase",          label: "Artist Showcase" },
  { value: "dj_night",          label: "DJ Night" },
  { value: "listening_session", label: "Listening Session" },
  { value: "watch_party",       label: "Watch Party" },
  { value: "private_hire",      label: "Private Hire" },
  { value: "other",             label: "Other" },
];

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  type: string;
  location: string;
  tickets_url: string | null;
  is_public: boolean;
};

const INPUT = "studio-field";
const LABEL = "studio-field-label";

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export default function EventForm({ event }: { event?: Event }) {
  const isEdit = !!event;
  const action = isEdit ? updateEvent : createEvent;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-5 max-w-2xl">
      {state?.error && (
        <p role="alert" className="studio-error">
          {state.error}
        </p>
      )}
      {isEdit && <input type="hidden" name="id" value={event.id} />}

      <div>
        <label htmlFor="event-title" className={LABEL}>Title *</label>
        <input
          id="event-title"
          name="title"
          type="text"
          required
          defaultValue={event?.title}
          placeholder="Summer Showcase"
          className={INPUT}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="event-event_date" className={LABEL}>Event date & time *</label>
          <input
            id="event-event_date"
          name="event_date"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(event?.event_date ?? null)}
            className={INPUT}
          />
        </div>
        <div>
          <label htmlFor="event-end_date" className={LABEL}>End time (optional)</label>
          <input
            id="event-end_date"
          name="end_date"
            type="datetime-local"
            defaultValue={toDatetimeLocal(event?.end_date ?? null)}
            className={INPUT}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="event-type" className={LABEL}>Type</label>
          <select id="event-type"
          name="type" defaultValue={event?.type ?? "other"} className={INPUT}>
            {EVENT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="event-location" className={LABEL}>Location</label>
          <input
            id="event-location"
          name="location"
            type="text"
            defaultValue={event?.location ?? "Flames Lounge, Montego Bay"}
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label htmlFor="event-description" className={LABEL}>Description</label>
        <textarea
          id="event-description"
          name="description"
          rows={4}
          defaultValue={event?.description ?? ""}
          placeholder="What's happening at this event…"
          className={INPUT}
        />
      </div>

      <div>
        <label htmlFor="event-tickets_url" className={LABEL}>Tickets URL (optional)</label>
        <input
          id="event-tickets_url"
          name="tickets_url"
          type="url"
          defaultValue={event?.tickets_url ?? ""}
          placeholder="https://…"
          className={INPUT}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          id="event-is_public"
          name="is_public"
          defaultValue={String(event?.is_public ?? true)}
          className="studio-field w-auto"
        >
          <option value="true">Public</option>
          <option value="false">Private</option>
        </select>
        <label htmlFor="event-is_public" className="studio-hint">Public events appear on the Flames Lounge page.</label>
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="studio-btn studio-btn-primary"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </button>
        <a href="/admin/events" className="studio-btn studio-btn-quiet studio-btn-sm">
          Cancel
        </a>
      </div>
    </form>
  );
}
