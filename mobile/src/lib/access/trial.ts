/**
 * Who may open what: everyone (learners, teachers, schools) starts with a free month
 * of everything, marketplace included. After it, only the free tier opens until they pay;
 * a plan opens everything again, teachers' marketplace subjects included. Nothing is
 * bought on its own. Dates are plain days ("2026-11-03").
 */

export type Phase = 'trial' | 'paid' | 'locked';

/** Plan levels, lowest first: each opens everything the one below it does. */
export type Tier = 'basic' | 'pro' | 'premium';
const TIER_RANK: Readonly<Record<Tier, number>> = { basic: 1, pro: 2, premium: 3 };
const TIERS: readonly Tier[] = ['basic', 'pro', 'premium'];

/** Features inside a page and the plan level each needs. */
export const FEATURE_TIERS = { stepByStep: 'pro', videoExplainer: 'premium', privateTutor: 'premium', careerPersonal: 'pro', careerCompass: 'premium' } as const satisfies Readonly<Record<string, Tier>>;
export type Feature = keyof typeof FEATURE_TIERS;

export interface Plan {
  /** The day the free month started. */
  trialStart: string;
  /** The last day a paid plan covers, if they have paid. */
  paidUntil?: string | null;
  /** The level paid for; Basic when not given. */
  tier?: Tier;
}

export interface Access {
  phase: Phase;
  /** The day the free month ends (it is locked from that day). */
  trialEnds: string;
  /** Days of the free month left; 0 once it has ended. */
  daysLeft: number;
  /** The level paid for, while paid. */
  tier?: Tier;
}

export interface Resource {
  /** Maple's own content, or a teacher's course sold in the marketplace. */
  source: 'maple' | 'marketplace';
  free?: boolean;
  /** The lowest plan that opens it; any plan when not given. */
  needs?: Tier;
}

/** Why something won't open: the free month is over ('pay'), it needs a higher plan ('upgrade'), or a visitor needs an account ('signup'). */
export type LockReason = 'pay' | 'upgrade' | 'signup';

const DAY_MS = 86_400_000;

function parts(day: string): [number, number, number] {
  const [y, m, d] = day.split('-').map(Number);
  return [y, m, d];
}

const pad = (n: number) => String(n).padStart(2, '0');

/** The day the free month ends: the same date a month on, or that month's last day. */
export function trialEnd(start: string): string {
  const [y, m, d] = parts(start);
  const year = m === 12 ? y + 1 : y;
  const month = m === 12 ? 1 : m + 1;
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${year}-${pad(month)}-${pad(Math.min(d, lastDay))}`;
}

function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = parts(from);
  const [ty, tm, td] = parts(to);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / DAY_MS);
}

/** Where someone stands on a given day. */
export function accessOn(plan: Plan, today: string): Access {
  const trialEnds = trialEnd(plan.trialStart);
  if (plan.paidUntil && plan.paidUntil >= today) return { phase: 'paid', trialEnds, daysLeft: 0, tier: plan.tier ?? 'basic' };
  const daysLeft = Math.max(0, daysBetween(today, trialEnds));
  return daysLeft > 0 ? { phase: 'trial', trialEnds, daysLeft } : { phase: 'locked', trialEnds, daysLeft: 0 };
}

const RANK: Readonly<Record<Phase, number>> = { locked: 0, trial: 1, paid: 2 };

/** The better of several (a learner's own plan and their school's): paid, then the longest trial. */
export function bestAccess(list: readonly Access[]): Access {
  return [...list].sort((a, b) => RANK[b.phase] - RANK[a.phase] || b.daysLeft - a.daysLeft)[0];
}

/** Why a resource won't open, or null when it opens. */
export function lockReason(r: Resource, a: Access): LockReason | null {
  if (r.free || a.phase === 'trial') return null;
  if (a.phase === 'locked') return 'pay';
  return r.needs && TIER_RANK[a.tier ?? 'basic'] < TIER_RANK[r.needs] ? 'upgrade' : null;
}

/** Whether a feature inside a page is open: the free month opens all, a plan opens its level and below. */
export function featureOpen(feature: Feature, a: Access | null): boolean {
  return a === null || lockReason({ source: 'maple', needs: FEATURE_TIERS[feature] }, a) === null;
}

/** The plan level a ?plan= address asks to preview, or null. */
export function planOverride(search: string): Tier | null {
  const value = new URLSearchParams(search).get('plan');
  return TIERS.find((t) => t === value) ?? null;
}

export function canOpen(r: Resource, a: Access): boolean {
  return lockReason(r, a) === null;
}

/** A day moved by some days ("2026-11-03" − 18 = "2026-10-16"). */
export function addDays(day: string, days: number): string {
  const [y, m, d] = parts(day);
  const t = new Date(Date.UTC(y, m - 1, d) + days * DAY_MS);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** Today in the person's own time zone, as a plain day. */
export function localToday(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export type TrialPreview = 'active' | 'ended' | 'paid';
const PREVIEWS: readonly TrialPreview[] = ['active', 'ended', 'paid'];

/** The state a ?trial= address asks to preview, or null. */
export function trialOverride(search: string): TrialPreview | null {
  const value = new URLSearchParams(search).get('trial');
  return PREVIEWS.find((p) => p === value) ?? null;
}

/** A sample payer's plan: its free month started the days it has used before today, unless a preview asks otherwise. */
export function samplePlan(daysUsed: number, today: string, preview: TrialPreview | null, tier?: Tier): Plan {
  if (preview === 'active') return { trialStart: today };
  if (preview === 'ended') return { trialStart: addDays(today, -40) };
  if (preview === 'paid') return { trialStart: addDays(today, -40), paidUntil: trialEnd(today), tier };
  return { trialStart: addDays(today, -daysUsed) };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** A plain day as people read it: "16 Nov 2026". */
export function dayLabel(day: string): string {
  const [y, m, d] = parts(day);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
