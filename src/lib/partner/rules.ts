// Single source of truth for all Flames Partner business rule constants.
// Never hardcode money values or program parameters anywhere else in the codebase.

export type TierKey = 'spark' | 'blaze' | 'inferno';
export type TierStatus = 'live' | 'coming_soon';

export interface Tier {
  key: TierKey;
  displayName: string;
  weeklyContribution: number;
  termWeeks: number;
  totalContribution: number;
  eligibilityWeeks: number;
  drawAmount: number;
  operatorMargin: number;
  deposit: number;
  guarantorMaxLiability: number;
  lateFee: number;
  graceDays: number;
  defaultDays: number;
  status: TierStatus;
  displayOrder: number;
}

export const TIERS: Record<TierKey, Tier> = {
  spark: {
    key: 'spark', displayName: 'Spark',
    weeklyContribution: 3_000, termWeeks: 20, totalContribution: 60_000,
    eligibilityWeeks: 12, drawAmount: 57_000, operatorMargin: 3_000,
    deposit: 3_000, guarantorMaxLiability: 24_000,
    lateFee: 500, graceDays: 3, defaultDays: 7,
    status: 'live', displayOrder: 1,
  },
  blaze: {
    key: 'blaze', displayName: 'Blaze',
    weeklyContribution: 10_000, termWeeks: 20, totalContribution: 200_000,
    eligibilityWeeks: 12, drawAmount: 190_000, operatorMargin: 10_000,
    deposit: 10_000, guarantorMaxLiability: 80_000,
    lateFee: 500, graceDays: 3, defaultDays: 7,
    status: 'coming_soon', displayOrder: 2,
  },
  inferno: {
    key: 'inferno', displayName: 'Inferno',
    weeklyContribution: 20_000, termWeeks: 20, totalContribution: 400_000,
    eligibilityWeeks: 12, drawAmount: 380_000, operatorMargin: 20_000,
    deposit: 20_000, guarantorMaxLiability: 160_000,
    lateFee: 500, graceDays: 3, defaultDays: 7,
    status: 'coming_soon', displayOrder: 3,
  },
};

export const getTier = (key: TierKey): Tier => TIERS[key];
export const allTiers = (): Tier[] =>
  Object.values(TIERS).sort((a, b) => a.displayOrder - b.displayOrder);
export const liveTiers = (): Tier[] =>
  allTiers().filter((t) => t.status === 'live');
export const publicTiers = (): Tier[] => allTiers();

// Cross-tier constants — identical across all tiers and not financial values
export const GUARANTOR_TOKEN_EXPIRY_DAYS = 7;
export const PREDRAW_DEFAULT_FORFEITURE_RATE = 0.5;
export const APP_TIMEZONE = 'America/Jamaica';
