import { createServiceClient } from "@/lib/supabase/server";
import { BudgetForm } from "./BudgetForm";

export default async function AdminSettingsPage() {
  const supabase = createServiceClient();

  // Current budget setting
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "monthly_video_budget_usd")
    .single();

  const budgetUsd = Number(setting?.value ?? 100);

  // Month-to-date spend
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { data: jobs } = await supabase
    .from("video_jobs")
    .select("cost_estimate_usd, status")
    .gte("created_at", monthStart.toISOString());

  const PER_JOB_ESTIMATE = 5;
  const spentUsd = (jobs ?? []).reduce(
    (sum, j) => sum + (Number(j.cost_estimate_usd) || (j.status !== "pending" ? PER_JOB_ESTIMATE : 0)),
    0
  );

  const remainingUsd = Math.max(0, budgetUsd - spentUsd);
  const pctUsed = budgetUsd > 0 ? Math.min(100, (spentUsd / budgetUsd) * 100) : 0;

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest mb-2">
          Label Admin
        </p>
        <h1 className="font-display font-bold text-bone text-3xl">Settings</h1>
        <div className="mt-3 h-px w-16 bg-bone/20" />
      </div>

      {/* Monthly budget section */}
      <section className="rounded-lg border border-bone/10 p-6 mb-6">
        <h2 className="font-display text-lg text-bone mb-4">Monthly video budget</h2>

        {/* Spend meter */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-bone/50 mb-2">
            <span>${spentUsd.toFixed(2)} spent</span>
            <span>${remainingUsd.toFixed(2)} remaining</span>
          </div>
          <div className="h-2 rounded-full bg-bone/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pctUsed >= 90 ? "bg-oxblood" : pctUsed >= 70 ? "bg-ochre" : "bg-forest"
              }`}
              style={{ width: `${pctUsed}%` }}
            />
          </div>
          <p className="text-xs text-bone/30 mt-2">
            Budget resets on the 1st of each month.
          </p>
        </div>

        <BudgetForm currentBudget={budgetUsd} />
      </section>
    </div>
  );
}
