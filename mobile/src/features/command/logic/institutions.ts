/**
 * The school pipeline behind Institutions & School Onboarding: when a school becomes a bottom-up
 * sales opportunity, what happens next at each stage, and the tenant quota.
 */

export type Stage = 'Registered' | 'Qualified' | 'In Negotiation' | 'Contract Signed' | 'Onboarding' | 'Active Tenant';
export type Plan = '' | 'Standard' | 'Pro Plan' | 'Pro' | 'Enterprise';

export interface School {
  id: string;
  name: string;
  teachers: number;
  plan: Plan;
  stage: Stage;
  renewal?: string;
}

/** A school with this many active teachers is worth a B2B conversation. */
export const MIN_TEACHERS = 3;

export const STAGES: readonly Stage[] = ['Registered', 'Qualified', 'In Negotiation', 'Contract Signed', 'Onboarding', 'Active Tenant'];
const PRE_CONTRACT: readonly Stage[] = ['Registered', 'Qualified', 'In Negotiation'];

/** Bottom-up opportunity: teachers already use Maple there (≥ 3 active) and no contract is signed yet. */
export function isBottomUp(s: Pick<School, 'teachers' | 'stage'>): boolean {
  return s.teachers >= MIN_TEACHERS && PRE_CONTRACT.includes(s.stage);
}

/** What the owner should do next with this school. */
export function nextAction(s: School): string {
  switch (s.stage) {
    case 'Registered':
      return s.teachers < MIN_TEACHERS ? `Needs ${MIN_TEACHERS - s.teachers} Teacher${MIN_TEACHERS - s.teachers === 1 ? '' : 's'}` : 'Contact School';
    case 'Qualified':
      return 'Schedule Demo';
    case 'In Negotiation':
      return 'Send Proposal';
    case 'Contract Signed':
    case 'Onboarding':
      return 'Complete Setup';
    case 'Active Tenant':
      return s.renewal ? `Renewal (${s.renewal})` : '—';
  }
}

/** Move a school one stage on. Activating a tenant takes a quota seat. */
export function advance<T extends School>(s: T, quota: { used: number; quota: number }): { school: T; quotaUsed: number; error?: string } {
  const i = STAGES.indexOf(s.stage);
  if (s.stage === 'Active Tenant') return { school: s, quotaUsed: quota.used, error: `${s.name} is already an active tenant.` };
  if (s.stage === 'Registered' && s.teachers < MIN_TEACHERS) {
    return { school: s, quotaUsed: quota.used, error: `${s.name} has ${s.teachers} of ${MIN_TEACHERS} active teachers. Invite teachers before sales outreach.` };
  }
  const next = STAGES[i + 1];
  if (next === 'Active Tenant') {
    if (quota.used >= quota.quota) return { school: s, quotaUsed: quota.used, error: `Tenant quota is full (${quota.used} / ${quota.quota}). Raise the quota before activating more schools.` };
    return { school: { ...s, stage: next, plan: s.plan || 'Standard' }, quotaUsed: quota.used + 1 };
  }
  return { school: { ...s, stage: next }, quotaUsed: quota.used };
}

/** Schools per stage, all of them, and the bottom-up opportunities. */
export function stageCounts(list: readonly School[]): Readonly<Record<Stage | 'all' | 'bottomUp', number>> {
  const by = (st: Stage) => list.filter((s) => s.stage === st).length;
  return {
    all: list.length,
    bottomUp: list.filter(isBottomUp).length,
    Registered: by('Registered'),
    Qualified: by('Qualified'),
    'In Negotiation': by('In Negotiation'),
    'Contract Signed': by('Contract Signed'),
    Onboarding: by('Onboarding'),
    'Active Tenant': by('Active Tenant'),
  };
}
