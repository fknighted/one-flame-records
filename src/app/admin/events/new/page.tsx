import EventForm from "../EventForm";

export default function NewEventPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <p className="studio-label mb-2">Community</p>
        <h1 className="studio-page-title">New Event</h1>
      </div>
      <EventForm />
    </div>
  );
}
