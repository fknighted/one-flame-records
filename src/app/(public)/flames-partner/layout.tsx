import type { Metadata } from 'next';
import Link from 'next/link';
import '@/app/studio.css';
export const metadata:Metadata={title:'Flames Partner',description:'The rotating savings programme.'};
export default function PartnerLayout({children}:{children:React.ReactNode}) {
  return <div className="partner-section studio-shell">
    <nav aria-label="Flames Partner" className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 border-b border-line px-4 py-4 text-sm sm:px-6">
      <Link href="/flames-partner" className="font-semibold text-yellow">Flames Partner</Link>
      <Link href="/flames-partner/signup" className="text-paper underline underline-offset-4">Apply to Spark</Link>
      <Link href="/flames-partner/dashboard" className="text-paper underline underline-offset-4">My savings</Link>
    </nav>{children}
  </div>;
}
