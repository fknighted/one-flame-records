import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { jamaicaDateTime } from "@/lib/bar/pos";
import { ENQUIRY_TYPES, isEnquiryType } from "@/lib/contact-enquiries";

const EMAIL_CHIP: Record<string, string> = {
  sent:    "studio-chip-ok",
  failed:  "studio-chip-bad",
  pending: "studio-chip-neutral",
};

const EMAIL_LABEL: Record<string, string> = {
  sent:    "accepted",
  failed:  "not sent",
  pending: "not recorded",
};

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const type = isEnquiryType(params.type) ? params.type : null;

  // Read with the signed-in session so the database's admin-only rule applies too.
  const supabase = await createClient();
  let query = supabase
    .from("contact_enquiries")
    .select("id, enquiry_type, name, email, message, admin_email_status, reply_email_status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (type) query = query.eq("enquiry_type", type);
  const { data: enquiries, error } = await query;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <p className="studio-label mb-2">Community</p>
        <h1 className="studio-page-title">Enquiries</h1>
        <p className="mt-3 text-[15px] text-muted">
          Messages sent through the public contact form, newest first. Reply from your own email.
        </p>
      </div>

      <nav aria-label="Filter by enquiry type" className="flex flex-wrap gap-x-4 gap-y-1">
        <Link
          href="/admin/enquiries"
          className="studio-link inline-flex min-h-[44px] items-center"
          aria-current={type ? undefined : "page"}
        >
          All
        </Link>
        {Object.entries(ENQUIRY_TYPES).map(([value, label]) => (
          <Link
            key={value}
            href={`/admin/enquiries?type=${value}`}
            className="studio-link inline-flex min-h-[44px] items-center"
            aria-current={type === value ? "page" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>

      {error ? (
        <p role="alert" className="studio-error">
          Enquiries could not be loaded. Retry later.
        </p>
      ) : !enquiries || enquiries.length === 0 ? (
        <div className="studio-empty">
          <p className="studio-empty-title">No enquiries yet.</p>
          <p className="studio-empty-body">
            New messages from the contact form appear here as soon as they are sent.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {enquiries.map((e) => (
            <li key={e.id} className="studio-card space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="studio-chip studio-chip-neutral">
                  {isEnquiryType(e.enquiry_type) ? ENQUIRY_TYPES[e.enquiry_type] : e.enquiry_type}
                </span>
                <span className="text-muted text-[15px]">{jamaicaDateTime(e.created_at)}</span>
              </div>
              <div>
                <p className="font-semibold text-paper [overflow-wrap:anywhere]">{e.name}</p>
                <a
                  href={`mailto:${encodeURIComponent(e.email)}`}
                  className="studio-link inline-flex min-h-[44px] items-center [overflow-wrap:anywhere]"
                >
                  {e.email}
                </a>
              </div>
              <p className="text-paper whitespace-pre-wrap [overflow-wrap:anywhere]">{e.message}</p>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-muted">
                <span>
                  Label email{" "}
                  <span className={`studio-chip ${EMAIL_CHIP[e.admin_email_status] ?? "studio-chip-neutral"}`}>
                    {EMAIL_LABEL[e.admin_email_status] ?? e.admin_email_status}
                  </span>
                </span>
                <span>
                  Sender confirmation{" "}
                  <span className={`studio-chip ${EMAIL_CHIP[e.reply_email_status] ?? "studio-chip-neutral"}`}>
                    {EMAIL_LABEL[e.reply_email_status] ?? e.reply_email_status}
                  </span>
                </span>
              </p>
            </li>
          ))}
        </ul>
      )}
      {enquiries && enquiries.length === 100 && (
        <p className="text-muted text-[15px]">Showing the latest 100.</p>
      )}
    </div>
  );
}
