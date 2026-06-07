import EventForm from "../EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-2">Community</p>
        <h1 className="font-display font-bold text-bone text-3xl">New Event</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>
      <EventForm />
    </div>
  );
}
