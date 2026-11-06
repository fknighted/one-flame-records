import Link from 'next/link';

export default function SignupSuccessPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14  bg-raised flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-yellow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-poster text-3xl uppercase text-paper">Application submitted</h1>
        <p className="text-muted">
          Your application is saved. A guarantor request is queued for email delivery. Your membership starts after their approval.
        </p>
        <Link href="/flames-partner" className="inline-block text-sm text-yellow hover:underline">
          Back to home
        </Link>
      </div>
    </section>
  );
}
