export default function ApprovedPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center space-y-3">
        <div className="w-14 h-14  bg-raised flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-poster text-2xl uppercase text-paper">Approval confirmed</h1>
        <p className="text-sm text-muted">
          Thank you. Your approval is saved. The member’s account email is queued for delivery.
        </p>
      </div>
    </section>
  );
}
