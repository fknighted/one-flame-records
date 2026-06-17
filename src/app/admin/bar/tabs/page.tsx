import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";

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
    .reduce((sum, t) => sum + (t.total_cents ?? 0), 0);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest mb-1">Bar</p>
        <h1 className="font-display font-bold text-bone text-3xl">Order History</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
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
              "px-3 py-1 rounded-full text-xs font-medium transition-colors",
              (status ?? "all") === s.value
                ? "bg-ochre text-ink"
                : "bg-bone/10 text-bone/60 hover:bg-bone/20",
            ].join(" ")}
          >
            {s.label}
          </Link>
        ))}

        {totalRevenue > 0 && (
          <span className="ml-auto text-xs text-bone/50 self-center">
            Total shown: <span className="text-bone font-mono">${(totalRevenue / 100).toFixed(2)}</span>
          </span>
        )}
      </div>

      {!tabs?.length ? (
        <p className="text-sm text-bone/30">No tabs found.</p>
      ) : (
        <div className="border border-bone/10 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-bone/10 bg-bone/3">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Opened</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Payment</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-bone/40">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone/10">
              {tabs.map((tab) => (
                <tr key={tab.id} className="hover:bg-bone/3 transition-colors">
                  <td className="px-4 py-3 text-bone font-medium">
                    {tab.name}
                    {tab.notes && <p className="text-xs text-bone/40">{tab.notes}</p>}
                  </td>
                  <td className="px-4 py-3 text-bone/60 text-xs">
                    {new Date(tab.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={[
                      "inline-block px-2 py-0.5 rounded-full text-xs font-medium",
                      tab.status === "closed" ? "bg-forest/20 text-forest" :
                      tab.status === "open"   ? "bg-ochre/20 text-ochre" :
                      "bg-bone/10 text-bone/40",
                    ].join(" ")}>
                      {STATUS_LABELS[tab.status] ?? tab.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-bone/60">
                    {tab.payment_method ? PAYMENT_LABELS[tab.payment_method] : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-bone">
                    ${(tab.total_cents / 100).toFixed(2)}
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
