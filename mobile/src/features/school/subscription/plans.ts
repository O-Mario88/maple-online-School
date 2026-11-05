/**
 * Rules for a school's Maple subscription: which members use a learner licence, capacity
 * warnings, allowance usage, the plan that fits, what an upgrade or downgrade does, and the
 * price a school's contract keeps. Prices and limits come from versioned plan configuration
 * (set in Maple Command), never from the pages.
 */

export type PlanId = 'launch' | 'growth' | 'enterprise';

/** One published version of a plan. A school's contract points at a version, so later price changes don't alter it. */
export interface PlanVersion {
  planId: PlanId;
  version: string;
  name: string;
  /** Price per academic term. */
  priceUGX: number;
  /** Active enrolled learners included. */
  learners: number;
  allowances: { liveSessions: number; storageGB: number; streamingGB: number };
  /** YYYY-MM-DD the version took effect. */
  effective: string;
}

export interface Member {
  id: string;
  /** The person behind the record, so a learner with several records counts once. */
  personId: string;
  role: 'learner' | 'teacher' | 'admin' | 'parent';
  status: 'active' | 'archived' | 'former';
  enrolled: boolean;
}

/** Unique active, enrolled learners: teachers, staff, parents, archived and former learners use no licence. */
export function licensedLearners(members: readonly Member[]): number {
  return new Set(members.filter((m) => m.role === 'learner' && m.status === 'active' && m.enrolled).map((m) => m.personId)).size;
}

/** The warning levels, as a share of the included learners. */
export const CAPACITY_THRESHOLDS = [80, 90, 100] as const;

/** The highest warning level reached, or null below the first. */
export function capacityAlert(used: number, included: number, thresholds: readonly number[] = CAPACITY_THRESHOLDS): number | null {
  const pct = included > 0 ? (used / included) * 100 : 100;
  return [...thresholds].reverse().find((t) => pct >= t) ?? null;
}

/** Usage as a whole percent of an allowance; a zero allowance counts as full. */
export const usagePct = (used: number, allowance: number): number => (allowance > 0 ? Math.round((used / allowance) * 100) : 100);

/** The smallest plan that includes this many learners, or the largest plan. */
export function recommendedPlan<T extends PlanVersion>(learners: number, plans: readonly T[]): T {
  const bySize = [...plans].sort((a, b) => a.learners - b.learners);
  return bySize.find((p) => p.learners >= learners) ?? bySize[bySize.length - 1];
}

const DAY = 86_400_000;
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b) - Date.parse(a)) / DAY);

export interface ChangePreview {
  kind: 'upgrade' | 'downgrade';
  /** Charged when confirmed: the price difference for the days left in the term (upgrades only). */
  chargeNowUGX: number;
  /** Upgrades apply now; downgrades at the next renewal. */
  applies: 'now' | 'renewal';
  /** What would be over the new plan's limits; nothing is ever removed automatically. */
  issues: readonly string[];
}

/** What changing plan would cost now and what it would affect, shown before the admin confirms. */
export function changePreview(from: PlanVersion, to: PlanVersion, term: { start: string; end: string; today: string }, usage: { learners: number; storageGB: number }): ChangePreview {
  if (to.priceUGX > from.priceUGX) {
    const total = Math.max(1, daysBetween(term.start, term.end));
    const left = Math.min(total, Math.max(0, daysBetween(term.today, term.end)));
    return { kind: 'upgrade', chargeNowUGX: Math.round(((to.priceUGX - from.priceUGX) * left) / total), applies: 'now', issues: [] };
  }
  const issues = [
    usage.learners > to.learners ? `${usage.learners} active learners is more than ${to.name} includes (${to.learners}). No learner is removed; add seats or archive learners who have left before renewal.` : null,
    usage.storageGB > to.allowances.storageGB ? `${usage.storageGB} GB of storage is more than ${to.name} includes (${to.allowances.storageGB} GB). Nothing is deleted; new uploads pause until usage is under the allowance.` : null,
  ].filter((x): x is string => x !== null);
  return { kind: 'downgrade', chargeNowUGX: 0, applies: 'renewal', issues };
}

/** The price on a school's contract: its plan version's, whatever the current public price. */
export function contractPrice(contract: { planId: PlanId; version: string }, versions: readonly PlanVersion[]): number {
  return versions.find((v) => v.planId === contract.planId && v.version === contract.version)?.priceUGX ?? 0;
}
