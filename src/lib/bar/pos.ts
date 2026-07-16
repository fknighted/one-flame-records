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

export function formatCents(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
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

export function elapsed(startedAt: string): string {
  const ms   = Date.now() - new Date(startedAt).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
