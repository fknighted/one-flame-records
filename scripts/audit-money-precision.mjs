#!/usr/bin/env node
/**
 * Pre-flight audit for the cents → dollars migration (20260809000001).
 *
 * READ-ONLY. Writes nothing, changes nothing.
 *
 * The migration converts every money column by integer-dividing by 100, which is
 * only lossless if every stored value is a whole number of dollars. That is not
 * guaranteed: CustomItemForm shipped with `step="0.01"`, so a custom item rung up
 * at $250.50 is stored as 25050. This script finds those rows BEFORE the
 * migration runs, so the rounding rule is an owner decision made with the actual
 * data in hand rather than a surprise mid-migration.
 *
 * Run against production:
 *   node scripts/audit-money-precision.mjs
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local
 * (or the ambient environment). Never prints the key.
 *
 * Exit codes: 0 = all clean, 1 = sub-dollar values found, 2 = could not run.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// ── env ──────────────────────────────────────────────────────────────────────
function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, "").split("#")[0].trim();
    }
  } catch {
    /* .env.local is optional if the vars are already exported */
  }
  return env;
}

const env = loadEnv();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("Export them or put them in .env.local. (The key is never printed.)");
  process.exit(2);
}

console.log(`Auditing ${url.replace(/^https:\/\//, "")} — read-only\n`);

const db = createClient(url, key, { auth: { persistSession: false } });

// ── the 11 money columns the migration converts ──────────────────────────────
const TARGETS = [
  { table: "pos_items",           columns: ["price_cents", "cost_cents"],                                     label: "menu items" },
  { table: "pos_tab_items",       columns: ["price_cents", "cost_cents"],                                     label: "sold line items" },
  { table: "pos_tabs",            columns: ["total_cents", "tip_cents"],                                      label: "tabs" },
  { table: "pos_stock_purchases", columns: ["unit_cost_cents", "total_cost_cents", "container_cost_cents"],   label: "stock purchases" },
  { table: "pos_voids",           columns: ["price_cents", "cost_cents"],                                     label: "voids" },
];

const PAGE = 1000;

/** Fetch every row's id + money columns, paginated. Modulo isn't expressible in
 *  PostgREST filters, so the check runs here. */
async function scan({ table, columns }) {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from(table)
      .select(["id", ...columns].join(","))
      .order("id")
      .range(from, from + PAGE - 1);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

let offenders = 0;
let scanned = 0;

for (const target of TARGETS) {
  let rows;
  try {
    rows = await scan(target);
  } catch (e) {
    console.error(`  ✗ ${target.table} — ${e.message}`);
    process.exit(2);
  }
  scanned += rows.length;

  const bad = [];
  for (const row of rows) {
    for (const col of target.columns) {
      const v = row[col];
      if (v != null && v % 100 !== 0) bad.push({ id: row.id, col, cents: v, dollars: v / 100 });
    }
  }

  if (bad.length === 0) {
    console.log(`  ✓ ${target.table.padEnd(21)} ${String(rows.length).padStart(6)} rows — all whole dollars`);
  } else {
    offenders += bad.length;
    console.log(`  ✗ ${target.table.padEnd(21)} ${String(rows.length).padStart(6)} rows — ${bad.length} SUB-DOLLAR value(s):`);
    for (const b of bad.slice(0, 25)) {
      console.log(`      ${b.col} = ${b.cents} (J$${b.dollars.toFixed(2)})  id=${b.id}`);
    }
    if (bad.length > 25) console.log(`      … and ${bad.length - 25} more`);
  }
}

console.log(`\nScanned ${scanned} rows across ${TARGETS.length} tables.`);

if (offenders === 0) {
  console.log("\nCLEAN — every money value is a whole dollar.");
  console.log("The migration's integer division is lossless. Safe to proceed.");
  process.exit(0);
}

console.log(`\nFOUND ${offenders} sub-dollar value(s). The migration will ABORT on these.`);
console.log("\nThese are real recorded amounts. Decide with the owner how to handle them");
console.log("before converting — round to nearest, round up, or correct the rows by hand.");
console.log("Do not let the migration truncate them silently.");
process.exit(1);
