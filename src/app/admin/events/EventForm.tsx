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

const INPUT = "w-full bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:outline-none focus:border-ochre/60";
const LABEL = "block text-xs text-bone/50 mb-1.5";

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
        <p className="rounded bg-oxblood/20 border border-oxblood/40 px-4 py-2 text-sm text-oxblood">
          {state.error}
        </p>
      )}
      {isEdit && <input type="hidden" name="id" value={event.id} />}

      <div>
        <label className={LABEL}>Title *</label>
        <input
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
          <label className={LABEL}>Event date & time *</label>
          <input
            name="event_date"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocal(event?.event_date ?? null)}
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>End time (optional)</label>
          <input
            name="end_date"
            type="datetime-local"
            defaultValue={toDatetimeLocal(event?.end_date ?? null)}
            className={INPUT}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={LABEL}>Type</label>
          <select name="type" defaultValue={event?.type ?? "other"} className={INPUT}>
            {EVENT_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL}>Location</label>
          <input
            name="location"
            type="text"
            defaultValue={event?.location ?? "Flames Lounge, Montego Bay"}
            className={INPUT}
          />
        </div>
      </div>

      <div>
        <label className={LABEL}>Description</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={event?.description ?? ""}
          placeholder="What's happening at this event…"
          className={INPUT}
        />
      </div>

      <div>
        <label className={LABEL}>Tickets URL (optional)</label>
        <input
          name="tickets_url"
          type="url"
          defaultValue={event?.tickets_url ?? ""}
          placeholder="https://…"
          className={INPUT}
        />
      </div>

      <div className="flex items-center gap-3">
        <select
          name="is_public"
          defaultValue={String(event?.is_public ?? true)}
          className="bg-bone/5 border border-bone/15 rounded px-3 py-2 text-sm text-bone focus:outline-none focus:border-ochre/60"
        >
          <option value="true">Public</option>
          <option value="false">Private</option>
        </select>
        <span className="text-xs text-bone/40">Public events appear on the Flames Lounge page.</span>
      </div>

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-ochre px-5 py-2.5 text-sm font-medium text-ink hover:bg-ochre/90 disabled:opacity-50 transition-colors"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create event"}
        </button>
        <a href="/admin/events" className="text-sm text-bone/40 hover:text-bone transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}
