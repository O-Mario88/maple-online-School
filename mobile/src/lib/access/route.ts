/**
 * Where the free month sends people. Once it has ended, they land on the Pricing page the
 * first time they open the app in a visit, and any page a plan opens takes them there too;
 * a page above their plan does as well, asking for the plan that opens it.
 * Visitors browsing free go to sign-up.
 */
import type { Phase, Tier } from './trial';

export const PRICING = '/plans';

interface Where {
  path: string;
  /** The person's phase, or null with no plan to check (browsing free, or no plans yet). */
  phase: Phase | null;
  lock: { reason: 'pay' | 'upgrade' | 'signup'; needs?: Tier } | null;
  /** Whether Pricing has been shown this visit since the free month ended. */
  pricingSeen: boolean;
}

export function accessRedirect({ path, phase, lock, pricingSeen }: Where): string | null {
  if (lock?.reason === 'signup') return '/sign-up';
  if (lock?.reason === 'pay') return PRICING;
  if (lock?.reason === 'upgrade') return lock.needs ? `${PRICING}?need=${lock.needs}` : PRICING;
  if (phase === 'locked' && !pricingSeen && path !== PRICING) return PRICING;
  return null;
}
