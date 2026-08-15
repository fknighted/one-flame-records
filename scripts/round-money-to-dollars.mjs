/**
 * Round every sub-dollar money value to the nearest whole dollar.
 *
 * Owner decision 2026-08-15 (Frank): "round all One Flame lounge bar POS to the
 * closest dollar and remove all cents." This clears the gate that
 * audit-money-precision.mjs enforces, so 20260809000001_money_cents_to_dollars.sql
 * can run without aborting.
 *
 * Values are still stored as cents when this runs -- it executes BEFORE the
 * migration. Rounding therefore means snapping each value to the nearest
 * multiple of 100, so the migration's later divide-by-100 is exact.
 *
 *   23125 (J$231.25) -> 23100 (J$231)
 *      10 (J$0.10)   ->     0 (J$0)
 *  170010 (J$1700.10)-> 170000 (J$1700)
 *
 * Ties round half up: 22850 (J$228.50) -> 22900 (J$229).
 *
 * Back up before running. The previous values are not recorded anywhere else.
 *
 *   node scripts/round-money-to-dollars.mjs            # report only, changes nothing
 *   node scripts/round-money-to-dollars.mjs --apply    # write the rounded values
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Match audit-money-precision.mjs: read .env.local without needing dotenv.
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// The same 11 columns the migration converts.
const TARGETS = [
  { table: "pos_items", columns: ["price_cents", "cost_cents"] },
  { table: "pos_tab_items", columns: ["price_cents", "cost_cents"] },
  { table: "pos_tabs", columns: ["total_cents", "tip_cents"] },
  { table: "pos_stock_purchases", columns: ["unit_cost_cents", "total_cost_cents", "container_cost_cents"] },
  { table: "pos_voids", columns: ["price_cents", "cost_cents"] },
];

const jmd = (cents) => `J$${(cents / 100).toFixed(2)}`;
const apply = process.argv.includes("--apply");

async function fetchAll({ table, columns }) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from(table)
      .select(["id", ...columns].join(","))
      .range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}

let found = 0;
let written = 0;

for (const target of TARGETS) {
  const rows = await fetchAll(target);
  for (const row of rows) {
    const patch = {};
    for (const col of target.columns) {
      const v = row[col];
      if (v === null || v === undefined) continue;
      if (Number.isInteger(v) && v % 100 === 0) continue;
      // Round half up on the dollar, then store back as cents.
      patch[col] = Math.round(v / 100) * 100;
      found += 1;
      console.log(
        `  ${target.table}.${col}  ${jmd(v)} -> ${jmd(patch[col])}  id=${row.id}`,
      );
    }
    if (Object.keys(patch).length === 0) continue;
    if (!apply) continue;
    const { error } = await supabase.from(target.table).update(patch).eq("id", row.id);
    if (error) throw new Error(`${target.table} ${row.id}: ${error.message}`);
    written += Object.keys(patch).length;
  }
}

console.log(
  found === 0
    ? "\nNothing to round: every money value is already a whole dollar."
    : apply
      ? `\nRounded ${written} value(s). Re-run audit-money-precision.mjs to confirm the gate is clear.`
      : `\nFound ${found} value(s) to round. Nothing was written -- re-run with --apply.`,
);
