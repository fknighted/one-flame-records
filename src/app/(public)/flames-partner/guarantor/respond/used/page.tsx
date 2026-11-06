export default function UsedPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center space-y-3">
        <h1 className="font-poster text-2xl uppercase text-paper">Already responded</h1>
        <p className="text-sm text-muted">
          This guarantor link has already been used. No further action is needed.
        </p>
      </div>
    </section>
  );
}
