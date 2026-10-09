import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { formatJmd, jamaicaDateTime } from "@/lib/bar/pos";

const STATUS_LABELS: Record<string, string> = {
  open:   "Open",
  closed: "Closed",
  voided: "Voided",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash:  "Cash",
  card:  "Card",
  comp:  "Comp",
};

export default async function OrderHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase
    .from("pos_tabs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && status !== "all") query = query.eq("status", status);

  const { data: tabs } = await query;

  const totalRevenue = (tabs ?? [])
    .filter((t) => t.status === "closed")
    .reduce((sum, t) => sum + (t.total_jmd ?? 0), 0);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="studio-label mb-1">Bar</p>
        <h1 className="studio-page-title">Order History</h1>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "all",    label: "All" },
          { value: "open",   label: "Open" },
          { value: "closed", label: "Closed" },
          { value: "voided", label: "Voided" },
        ].map((s) => (
          <Link
            key={s.value}
            href={s.value === "all" ? "/admin/bar/tabs" : `/admin/bar/tabs?status=${s.value}`}
            className={[
              "studio-focus inline-flex min-h-[44px] items-center px-4 text-[14px] font-semibold",
              (status ?? "all") === s.value
                ? "bg-raised text-paper border border-muted"
                : "text-muted border border-line hover:text-paper",
            ].join(" ")}
          >
            {s.label}
          </Link>
        ))}

        {totalRevenue > 0 && (
          <span className="ml-auto text-[14px] text-muted self-center">
            Total shown: <span className="studio-money">{formatJmd(totalRevenue)}</span>
          </span>
        )}
      </div>

      {!tabs?.length ? (
        <p className="text-[15px] text-muted">No tabs found.</p>
      ) : (
        <div className="studio-table-wrap">
          <table className="studio-table min-w-[560px]">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Opened</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="is-num">Total</th>
              </tr>
            </thead>
            <tbody>
              {tabs.map((tab) => (
                <tr key={tab.id} className="is-link">
                  <td className="font-semibold [overflow-wrap:anywhere]">
                    {tab.name}
                    {tab.notes && <p className="text-[13px] font-normal text-muted">{tab.notes}</p>}
                  </td>
                  <td className="studio-figures text-muted">
                    {jamaicaDateTime(tab.created_at)}
                  </td>
                  <td>
                    <span className={tab.status === "open" ? "studio-chip studio-chip-ok" : "studio-chip studio-chip-neutral"}>
                      {STATUS_LABELS[tab.status] ?? tab.status}
                    </span>
                  </td>
                  <td className="text-muted">
                    {tab.payment_method ? PAYMENT_LABELS[tab.payment_method] : "—"}
                  </td>
                  <td className="is-num">
                    <span className="studio-money">{formatJmd(tab.total_jmd ?? 0)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
