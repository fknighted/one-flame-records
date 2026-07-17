/**
 * Jamaica is UTC-5 year-round (no DST).
 * Returns the start of the current Jamaica calendar day expressed as a UTC Date.
 * Pass daysAgo > 0 to get the start of a past Jamaica day.
 */
export function jamaicaMidnight(daysAgo = 0): Date {
  const d = new Date();
  // Before 05:00 UTC, Jamaica is still on the previous calendar day
  if (d.getUTCHours() < 5) d.setUTCDate(d.getUTCDate() - 1);
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(5, 0, 0, 0); // 05:00 UTC = 00:00 Jamaica
  return d;
}

/**
 * Start of the current Jamaica calendar month, as a UTC Date.
 * Jamaica is UTC-5, so 00:00 on the 1st (Jamaica) = 05:00 UTC on the 1st.
 * Use for "this month" windows instead of `new Date().setDate(1)` (which gives
 * UTC month start and is off by 5h near the boundary).
 */
export function jamaicaMonthStart(): Date {
  const jamaicaNow = new Date(Date.now() - 5 * 60 * 60 * 1000);
  return new Date(Date.UTC(jamaicaNow.getUTCFullYear(), jamaicaNow.getUTCMonth(), 1, 5, 0, 0, 0));
}

export function jamaicaTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Jamaica",
  });
}

export function jamaicaDateTime(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Jamaica",
  });
}

// JMD is a whole-dollar currency in practice — cents are noise. Round to the
// nearest dollar and group thousands for readability (e.g. 218_180 → "$2,182").
export function formatCents(cents: number): string {
  return "$" + Math.round(cents / 100).toLocaleString("en-US");
}

/** Default number of shots in one bottle of spirit (per-item bottle_yield overrides this). */
export const DEFAULT_SHOTS_PER_BOTTLE = 16;

/**
 * Gross margin as a whole-number percentage: (price − cost) / price × 100.
 * Returns null when cost is unknown or price is 0 (margin is meaningless).
 */
export function marginPct(priceCents: number, costCents: number | null): number | null {
  if (costCents == null || priceCents <= 0) return null;
  return Math.round(((priceCents - costCents) / priceCents) * 100);
}

export const CATEGORY_LABELS: Record<string, string> = {
  drink:     "Drinks",
  beverage:  "Beverages",
  food:      "Food",
  snack:     "Snacks",
  game_time: "Game Time",
};

export const CATEGORY_ORDER = ["drink", "beverage", "food", "snack", "game_time"] as const;

/**
 * Inventory display sections. Splits the broad "drink" category into
 * Rums / Beers / Other Drinks and pulls Cigarettes to the bottom.
 * Non-drink items fall back to their category. POS `category` is unchanged.
 */
export const SECTION_LABELS: Record<string, string> = {
  rum:       "Rums",
  beer:      "Beers",
  other:     "Other Drinks",
  beverage:  "Beverages",
  food:      "Food",
  snack:     "Snacks",
  game_time: "Game Time",
  cigarette: "Cigarettes",
};

// Cigarettes render last.
export const SECTION_ORDER = ["rum", "beer", "other", "beverage", "food", "snack", "game_time", "cigarette"] as const;

/** Resolve an item's display section: explicit menu_section, else derive from category. */
export function resolveSection(item: { menu_section?: string | null; category: string }): string {
  if (item.menu_section) return item.menu_section;
  return item.category === "drink" ? "other" : item.category;
}

export function elapsed(startedAt: string): string {
  const ms   = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
