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

export function formatCents(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

export const CATEGORY_LABELS: Record<string, string> = {
  drink:     "Drinks",
  beverage:  "Beverages",
  food:      "Food",
  game_time: "Game Time",
};

export const CATEGORY_ORDER = ["drink", "beverage", "food", "game_time"] as const;
