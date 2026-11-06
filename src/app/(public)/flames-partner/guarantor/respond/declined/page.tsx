export default function DeclinedPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center space-y-3">
        <h1 className="font-poster text-2xl uppercase text-paper">Response recorded</h1>
        <p className="text-sm text-muted">
          You have declined the guarantor request. The member will be notified.
        </p>
      </div>
    </section>
  );
}
