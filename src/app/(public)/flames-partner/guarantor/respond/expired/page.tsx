export default function ExpiredPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center space-y-3">
        <h1 className="font-poster text-2xl uppercase text-paper">Link expired</h1>
        <p className="text-sm text-muted">
          This guarantor link has expired. Please ask the member to contact us to re-submit.
        </p>
      </div>
    </section>
  );
}
