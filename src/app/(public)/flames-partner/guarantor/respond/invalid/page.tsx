export default function InvalidPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center space-y-3">
        <h1 className="font-poster text-2xl uppercase text-paper">Invalid link</h1>
        <p className="text-sm text-muted">
          This link is invalid or malformed. Please check the email and try again.
        </p>
      </div>
    </section>
  );
}
