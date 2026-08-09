#!/usr/bin/env node
/**
 * Before/after verification for the cents → dollars migration (20260809000001).
 *
 * READ-ONLY in both modes. Writes nothing to the database.
 *
 * The point is to prove the migration changed the *unit* and nothing else — same
 * revenue, same profit, same tips, same tab-by-tab figures. It follows the
 * project's established pattern (see decisions.md / the bar sales RPC work):
 * fetch raw values, compute the expected result independently in JS, compare.
 *
 *   BEFORE the migration:   node scripts/verify-money-migration.mjs --snapshot
 *   (apply migration + deploy)
 *   AFTER  the migration:   node scripts/verify-money-migration.mjs --verify
 *
 * --snapshot reads the cents schema and writes .money-snapshot.json, storing the
 * EXPECTED dollar values (cents ÷ 100). --verify reads the dollar schema and
 * asserts reality matches that expectation exactly.
 *
 * Exit codes: 0 = match, 1 = mismatch, 2 = could not run.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SNAPSHOT = ".money-snapshot.json";
const mode = process.argv.includes("--snapshot") ? "snapshot"
           : process.argv.includes("--verify")   ? "verify"
           : null;

if (!mode) {
  console.error("Usage: node scripts/verify-money-migration.mjs --snapshot | --verify");
  process.exit(2);
}

// ── env ──────────────────────────────────────────────────────────────────────
function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "").split("#")[0].trim();
    }
  } catch { /* optional */ }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. (The key is never printed.)");
  process.exit(2);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const PAGE = 1000;
async function all(table, cols) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.from(table).select(cols).order("id").range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

// Column names differ either side of the migration; everything else is identical.
const C = mode === "snapshot"
  ? { price: "price_cents", cost: "cost_cents", total: "total_cents", tip: "tip_cents" }
  : { price: "price_jmd",   cost: "cost_jmd",   total: "total_jmd",   tip: "tip_jmd"   };

// Snapshot divides by 100 to record the EXPECTED post-migration dollars.
const toDollars = (v) => (v == null ? null : mode === "snapshot" ? v / 100 : v);

console.log(`${mode === "snapshot" ? "Snapshotting" : "Verifying"} ${url.replace(/^https:\/\//, "")} — read-only\n`);

let tabs, items, tabItems;
try {
  tabs     = await all("pos_tabs",      `id,status,${C.total},${C.tip}`);
  items    = await all("pos_items",     `id,name,${C.price},${C.cost}`);
  tabItems = await all("pos_tab_items", `id,tab_id,quantity,${C.price},${C.cost}`);
} catch (e) {
  console.error(`  ✗ ${e.message}`);
  process.exit(2);
}

const closed = new Set(tabs.filter((t) => t.status === "closed").map((t) => t.id));

// ── the figures that must not move ───────────────────────────────────────────
const actual = {
  tabCount:      tabs.length,
  itemCount:     items.length,
  tabItemCount:  tabItems.length,
  closedTabs:    closed.size,
  // Revenue mirrors bar_sales_payment_summary: SUM(total) over closed tabs.
  revenue:       tabs.filter((t) => closed.has(t.id)).reduce((s, t) => s + (toDollars(t[C.total]) ?? 0), 0),
  tips:          tabs.filter((t) => closed.has(t.id)).reduce((s, t) => s + (toDollars(t[C.tip]) ?? 0), 0),
  // COGS mirrors bar_sales_by_category: SUM(cost × quantity), NULL cost = 0.
  cogs:          tabItems.filter((r) => closed.has(r.tab_id))
                         .reduce((s, r) => s + (toDollars(r[C.cost]) ?? 0) * (r.quantity ?? 1), 0),
  lineRevenue:   tabItems.filter((r) => closed.has(r.tab_id))
                         .reduce((s, r) => s + (toDollars(r[C.price]) ?? 0) * (r.quantity ?? 1), 0),
  // Per-item menu prices, so a single mis-scaled row can't hide inside a total.
  menu: Object.fromEntries(items.map((i) => [i.id, [toDollars(i[C.price]), toDollars(i[C.cost])]])),
  // Per-tab totals, same reason.
  tabTotals: Object.fromEntries(tabs.map((t) => [t.id, toDollars(t[C.total])])),
};
actual.profit = actual.revenue - actual.cogs;

// ── snapshot ─────────────────────────────────────────────────────────────────
if (mode === "snapshot") {
  writeFileSync(SNAPSHOT, JSON.stringify(actual, null, 2));
  console.log(`  Closed tabs   ${actual.closedTabs}`);
  console.log(`  Revenue       $${actual.revenue.toLocaleString()}`);
  console.log(`  Tips          $${actual.tips.toLocaleString()}`);
  console.log(`  Cost of goods $${actual.cogs.toLocaleString()}`);
  console.log(`  Profit        $${actual.profit.toLocaleString()}`);
  console.log(`\nWrote ${SNAPSHOT} — these are the EXPECTED values after the migration.`);
  console.log("Apply the migration and deploy, then run with --verify.");
  process.exit(0);
}

// ── verify ───────────────────────────────────────────────────────────────────
if (!existsSync(SNAPSHOT)) {
  console.error(`No ${SNAPSHOT} found. Run --snapshot BEFORE applying the migration.`);
  process.exit(2);
}
const expected = JSON.parse(readFileSync(SNAPSHOT, "utf8"));

const problems = [];
const check = (label, exp, act) => {
  const ok = exp === act;
  console.log(`  ${ok ? "✓" : "✗"} ${label.padEnd(15)} expected ${String(exp).padStart(12)}   actual ${String(act).padStart(12)}`);
  if (!ok) problems.push(`${label}: expected ${exp}, got ${act}`);
};

for (const k of ["tabCount", "itemCount", "tabItemCount", "closedTabs"]) check(k, expected[k], actual[k]);
for (const k of ["revenue", "tips", "cogs", "lineRevenue", "profit"])      check(k, expected[k], actual[k]);

// Row-level: a total can match by luck while individual rows are wrong.
let menuBad = 0;
for (const [id, [p, c]] of Object.entries(expected.menu)) {
  const a = actual.menu[id];
  if (!a || a[0] !== p || a[1] !== c) { menuBad++; if (menuBad <= 10) problems.push(`menu item ${id}: expected [${p}, ${c}], got [${a?.[0]}, ${a?.[1]}]`); }
}
let tabBad = 0;
for (const [id, t] of Object.entries(expected.tabTotals)) {
  if (actual.tabTotals[id] !== t) { tabBad++; if (tabBad <= 10) problems.push(`tab ${id}: expected ${t}, got ${actual.tabTotals[id]}`); }
}
console.log(`  ${menuBad === 0 ? "✓" : "✗"} menu rows      ${Object.keys(expected.menu).length} checked, ${menuBad} mismatched`);
console.log(`  ${tabBad  === 0 ? "✓" : "✗"} tab totals     ${Object.keys(expected.tabTotals).length} checked, ${tabBad} mismatched`);

if (problems.length === 0) {
  console.log("\nVERIFIED — every figure matches the pre-migration snapshot exactly.");
  console.log("The unit changed; the money did not.");
  process.exit(0);
}

console.log(`\nMISMATCH — ${problems.length} problem(s):\n`);
for (const p of problems.slice(0, 30)) console.log(`  • ${p}`);
if (problems.length > 30) console.log(`  … and ${problems.length - 30} more`);
console.log("\nDo NOT drop the legacy columns. Investigate before any further change.");
process.exit(1);
