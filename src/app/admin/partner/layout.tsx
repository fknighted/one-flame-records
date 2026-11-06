import Link from 'next/link';
import { requirePartnerAdmin } from '@/lib/partner/auth';
export default async function PartnerAdminLayout({children}:{children:React.ReactNode}) {
  await requirePartnerAdmin();
  return <section className="partner-section max-w-6xl space-y-6">
    <div><p className="studio-label">One Flame Records</p><h1 className="studio-page-title">Flames Partner</h1></div>
    <nav aria-label="Flames Partner administration" className="flex flex-wrap gap-2 border-b border-line pb-4">
      {[['/admin/partner','Overview'],['/admin/partner/members','Members'],['/admin/partner/queue','Queues & draws'],['/admin/partner/audit','Audit log'],['/flames-partner','Public page']].map(([href,label])=><Link key={href} href={href} className="studio-btn studio-btn-quiet">{label}</Link>)}
    </nav>{children}
  </section>;
}
