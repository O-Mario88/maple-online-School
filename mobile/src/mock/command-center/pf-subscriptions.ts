/** Maple Command › Finance › Subscription Management sample data. All figures and prices are illustrative. */
import type { Plan, Sub } from '@/features/command/logic/subscriptions';

import { planVersions } from '../institution-plans';
import type { KpiData } from './shared';

export const TODAY = '2026-10-26';
const TERMS_PER_YEAR = 3;

export interface PlanRow extends Plan {
  limit: string;
  subscribers: number;
}

export const plans: readonly PlanRow[] = [
  // School plans come from the published plan configuration: per-term prices as a monthly figure (three terms a year).
  ...planVersions.map((v, i) => ({ id: v.planId, name: v.name, type: 'School' as const, price: Math.round((v.priceUGX * TERMS_PER_YEAR) / 12), limit: `Up to ${v.learners.toLocaleString('en-US')} learners`, subscribers: [1284, 496, 118][i] ?? 0 })),
  { id: 'plus', name: 'Basic', type: 'Learner', price: 60_000, limit: 'Individual learner plan', subscribers: 2610 },
  { id: 'pro', name: 'Pro Study Pass', type: 'Learner', price: 90_000, limit: 'Live classes + step-by-step solutions', subscribers: 384 },
  { id: 'learner-premium', name: 'Premium', type: 'Learner', price: 150_000, limit: 'Private tutor + video explainers', subscribers: 142 },
];

export interface SubRow extends Sub {
  ref: string;
  kind: 'School' | 'Learner';
  avatar?: number;
}

const S = (id: string, subscriber: string, kind: SubRow['kind'], plan: string, billing: Sub['billing'], start: string, nextRenewal: string, status: Sub['status'], over: Partial<SubRow> = {}): SubRow => ({ id, ref: id, subscriber, kind, plan, billing, start, nextRenewal, status, failedAttempts: status === 'Past Due' ? 1 : 0, ...over });

export const subs: readonly SubRow[] = [
  S('SCH-00184', 'Green Valley School', 'School', 'enterprise', 'Annual', '2026-01-15', '2027-01-15', 'Active'),
  S('SCH-00126', 'Riverside Academy', 'School', 'growth', 'Annual', '2026-03-01', '2027-03-01', 'Active'),
  S('LRN-045772', 'Amina N.', 'Learner', 'pro', 'Monthly', '2026-10-02', '2026-11-02', 'Active', { avatar: require('../images/pp-sarah.png') as number }),
  S('LRN-045889', 'Daniel K.', 'Learner', 'plus', 'Monthly', '2026-10-05', '2026-11-05', 'Active', { avatar: require('../images/pp-john.png') as number }),
  S('SCH-00157', 'Lakeview International', 'School', 'launch', 'Annual', '2026-02-10', '2027-02-10', 'Trial'),
  S('SCH-00211', 'Hope Primary School', 'School', 'launch', 'Termly', '2026-09-01', '2026-11-12', 'Past Due', { failedAttempts: 2 }),
  S('SCH-00198', 'Sunrise Secondary', 'School', 'growth', 'Annual', '2025-11-20', '2026-11-20', 'Active'),
  S('LRN-046012', 'Grace A.', 'Learner', 'plus', 'Monthly', '2026-09-28', '2026-10-28', 'Past Due', { avatar: require('../images/pp-esther.png') as number }),
  S('SCH-00267', 'Bright Future Academy', 'School', 'enterprise', 'Annual', '2026-05-04', '2027-05-04', 'Active'),
  S('LRN-045993', 'Brian O.', 'Learner', 'pro', 'Monthly', '2026-08-14', '2026-11-14', 'Cancelled', { avatar: require('../images/pp-kato.png') as number, endsOn: '2026-11-14', cancelReason: 'Finished exam revision' }),
];

export const stats: readonly KpiData[] = [
  { label: 'Total Active Subscriptions', value: '4,892', delta: '6.8%', icon: 'people', tone: 'blue' },
  { label: 'Monthly Recurring Revenue (MRR)', value: 'UGX 468,750,000', delta: '8.4%', icon: 'layers', tone: 'green' },
  { label: 'Annual Recurring Revenue (ARR)', value: 'UGX 5,625,000,000', delta: '8.9%', icon: 'chart', tone: 'purple' },
  { label: 'Renewals Due (Next 30 Days)', value: '327', icon: 'sync', tone: 'orange', valueTone: 'orange' },
  { label: 'Payment Failures', value: '46', caption: '(0.9%)', icon: 'alert', tone: 'red', valueTone: 'red' },
  { label: 'Cancellations (This Month)', value: '21', caption: '(0.4%)', icon: 'close', tone: 'grey' },
];

/** Platform totals the sample list is the newest part of. */
export const totals = { active: 4892, mrr: 468_750_000, schools: 1898, learners: 2994, renewals: 327, failed: 46, cancelled: 21, trialsEnding: 58 };

/** MRR and ARR ÷ 12, in millions, Nov 2025 – Oct 2026. */
export const trend = {
  labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  mrr: [318, 326, 338, 352, 368, 384, 394, 408, 420, 434, 450, 468.8],
  arr: [296, 304, 314, 326, 338, 352, 362, 374, 386, 400, 414, 430],
};

export const revenue = {
  'This Month': { base: 468_750_000, upgrades: 24_000_000, downgrades: 6_250_000, cancellations: 10_500_000 },
  'Year to Date': { base: 4_312_400_000, upgrades: 186_000_000, downgrades: 48_500_000, cancellations: 92_400_000 },
};

export const activity: readonly { text: string; when: string; icon: 'arrowUp' | 'sync' | 'userPlus' | 'close' }[] = [
  { text: 'Green Valley School upgraded to Premium', when: '10:24 AM', icon: 'arrowUp' },
  { text: 'Riverside Academy renewed (Annual)', when: '9:47 AM', icon: 'sync' },
  { text: 'New learner subscription: Amina N. (Pro)', when: '9:12 AM', icon: 'userPlus' },
  { text: 'Subscription cancelled: Brian O.', when: 'Yesterday', icon: 'close' },
];
