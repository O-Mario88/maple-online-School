/** Maple Command › Finance › Contracts and Teacher Payables sample data. Illustrative. */
import type { Contract } from '@/features/command/logic/contracts';
import type { TeacherPayable } from '@/features/command/logic/payables';

import { face, type KpiData } from './shared';
import { Maple } from '@/constants/maple';

export interface ContractRow extends Contract {
  ref: string;
  /** The next billing or review step. */
  milestone: string;
  milestoneDate: string;
}

export const contracts: readonly ContractRow[] = [
  { id: 'CON-2026-0143', ref: 'SCH-00184', institution: 'Hope Valley Schools', type: 'Enterprise', value: 1_200_000_000, discount: 10, commissionRate: 3, start: '2026-01-01', end: '2028-12-31', billing: 'Annual', stage: 'Signed', milestone: 'Invoice (Q4)', milestoneDate: '2026-11-15' },
  { id: 'CON-2026-0107', ref: 'SCH-00126', institution: 'Bright Future Academy', type: 'School Plan', value: 360_000_000, discount: 5, commissionRate: 3, start: '2026-02-01', end: '2027-03-31', billing: 'Termly', stage: 'Signed', milestone: 'Next Invoice', milestoneDate: '2026-11-01' },
  { id: 'CON-2026-0098', ref: 'SCH-00876', institution: 'Riverside Schools Group', type: 'Enterprise', value: 960_000_000, discount: 12, commissionRate: 3, start: '2026-03-01', end: '2029-02-28', billing: 'Annual', stage: 'Signed', milestone: 'Expansion Review', milestoneDate: '2026-11-20' },
  { id: 'CON-2026-0085', ref: 'SCH-00211', institution: "St. Mark's College", type: 'Content License', value: 240_000_000, discount: 0, commissionRate: 3, start: '2026-01-15', end: '2027-01-14', billing: 'Annual', stage: 'Signed', milestone: 'Usage Review', milestoneDate: '2026-12-01' },
  { id: 'CON-2026-0066', ref: 'SCH-00641', institution: 'Unity Schools Network', type: 'Service', value: 420_000_000, discount: 8, commissionRate: 4, start: '2026-04-01', end: '2027-03-31', billing: 'Milestone', stage: 'Signed', milestone: 'Milestone 2', milestoneDate: '2026-11-10' },
  { id: 'CON-2025-0049', ref: 'SCH-00835', institution: 'Green Valley Education', type: 'School Plan', value: 180_000_000, discount: 0, commissionRate: 3, start: '2025-12-15', end: '2026-12-14', billing: 'Annual', stage: 'Signed', milestone: 'Renew by', milestoneDate: '2026-12-14' },
  { id: 'CON-2024-0037', ref: 'SCH-00677', institution: 'Lakeside Learning Trust', type: 'Enterprise', value: 780_000_000, discount: 15, commissionRate: 3, start: '2024-11-30', end: '2026-11-29', billing: 'Annual', stage: 'Signed', milestone: 'Renewal', milestoneDate: '2026-11-29' },
  { id: 'CON-2026-0151', ref: 'SCH-00912', institution: 'Kampala Parents School', type: 'School Plan', value: 210_000_000, discount: 6, commissionRate: 3, start: '2027-01-01', end: '2027-12-31', billing: 'Termly', stage: 'Negotiation', milestone: 'Pricing call', milestoneDate: '2026-11-06' },
  { id: 'CON-2026-0152', ref: 'SCH-00930', institution: 'Mbarara High School', type: 'Content License', value: 96_000_000, discount: 0, commissionRate: 3, start: '2027-01-01', end: '2027-12-31', billing: 'Annual', stage: 'Draft', milestone: 'Send proposal', milestoneDate: '2026-11-08' },
];

export const conStats: readonly KpiData[] = [
  { label: 'Active Contracts', value: '142', delta: '12.7%', icon: 'doc', tone: 'blue' },
  { label: 'Total Contract Value', value: 'UGX 8,760,000,000', icon: 'layers', tone: 'green' },
  { label: 'Annual Contract Value (ACV)', value: 'UGX 4,920,000,000', delta: '14.8%', icon: 'calendar', tone: 'orange' },
  { label: 'Revenue (YTD)', value: 'UGX 3,486,750,000', delta: '18.2%', icon: 'wallet', tone: 'green' },
  { label: 'Discounts Given', value: 'UGX 312,000,000', caption: '6.3% of ACV', icon: 'ticket', tone: 'red', valueTone: 'red' },
  { label: 'Commissions Due', value: 'UGX 148,600,000', icon: 'percent', tone: 'orange' },
];

/** Whole-platform figures; the sample contracts are among them. */
export const conTotals = { contracts: 142, tcv: 8_760_000_000, acv: 4_920_000_000, discounts: 312_000_000, commissions: 148_600_000, lifecycle: { Draft: 8, Negotiation: 12, Active: 142, 'Renewal Due': 18, Expired: 6 } };

export const conByType: readonly { label: string; value: number; color: string }[] = [
  { label: 'School Subscription', value: 58, color: Maple.blue },
  { label: 'Enterprise / Multi-School', value: 34, color: Maple.successText },
  { label: 'Content & Marketplace', value: 28, color: Maple.warning },
  { label: 'Service / Implementation', value: 22, color: Maple.blue },
];

/** Revenue billed and contracted value (millions), Jan–Oct 2026. */
export const conTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  billed: [160, 180, 200, 230, 280, 290, 310, 350, 380, 400],
  contracted: [260, 290, 300, 330, 350, 380, 390, 420, 450, 490],
};

/* ─── Teacher payables ─── */

export interface PayableRow extends TeacherPayable {
  subject: string;
  sessions: number;
  photo: number;
}

export const teachers: readonly PayableRow[] = [
  { id: 'TCH-000184', name: 'Agnes Nanyonjo', subject: 'Mathematics', sessions: 12, earned: 48_600_000, paid: 40_000_000, reserve: 2_600_000, dispute: 0, photo: face.agnes },
  { id: 'TCH-000207', name: 'Peter Okiror', subject: 'Physics', sessions: 15, earned: 62_400_000, paid: 50_000_000, reserve: 2_400_000, dispute: 0, photo: face.john },
  { id: 'TCH-000315', name: 'Ruth Auma', subject: 'English', sessions: 9, earned: 36_000_000, paid: 24_000_000, reserve: 2_000_000, dispute: 2_000_000, photo: face.ruth },
  { id: 'TCH-000221', name: 'James Odongo', subject: 'Chemistry', sessions: 14, earned: 54_000_000, paid: 46_000_000, reserve: 2_000_000, dispute: 0, photo: face.james },
  { id: 'TCH-000338', name: 'Mary Atieno', subject: 'Biology', sessions: 11, earned: 42_000_000, paid: 28_000_000, reserve: 4_000_000, dispute: 0, hold: 'Tax ID (TIN) not on file', photo: face.mary },
  { id: 'TCH-000276', name: 'David Kato', subject: 'ICT', sessions: 10, earned: 32_400_000, paid: 24_000_000, reserve: 2_400_000, dispute: 0, photo: face.kato },
  { id: 'TCH-000362', name: 'Sarah Namugerwa', subject: 'Primary', sessions: 8, earned: 28_800_000, paid: 20_000_000, reserve: 2_800_000, dispute: 0, photo: face.sarah },
];

export const tpStats: readonly KpiData[] = [
  { label: 'Total Earned (YTD)', value: 'UGX 3,486,750,000', delta: '18.4%', icon: 'layers', tone: 'purple' },
  { label: 'Paid to Teachers', value: 'UGX 2,764,600,000', delta: '16.9%', icon: 'wallet', tone: 'green' },
  { label: 'Awaiting Release', value: 'UGX 356,400,000', icon: 'clock', tone: 'orange' },
  { label: 'Reserves / Holds', value: 'UGX 148,200,000', icon: 'shield', tone: 'blue' },
  { label: 'Disputes', value: 'UGX 24,600,000', icon: 'alert', tone: 'red', valueTone: 'red' },
  { label: 'Total Liability', value: 'UGX 529,200,000', icon: 'calculator', tone: 'purple' },
];

/** Whole-platform liability; the sample teachers are part of it. */
export const tpTotals = { teachers: 1204, awaiting: 356_400_000, reserve: 148_200_000, dispute: 24_600_000, eligible: 428, pending: 37, onHold: 12 };

/** Earnings, payouts and outstanding payables (millions), Jan–Oct 2026. */
export const tpTrend = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  earnings: [190, 230, 240, 250, 270, 275, 290, 300, 330, 360],
  payouts: [120, 150, 165, 170, 175, 180, 210, 220, 260, 280],
  outstanding: [150, 170, 200, 220, 230, 240, 270, 300, 320, 350],
};

export const tpBatches: readonly { id: string; teachers: number; amount: number; date: string; status: 'Scheduled' | 'Draft' }[] = [
  { id: 'PB-2026-041', teachers: 428, amount: 356_400_000, date: 'Nov 5, 2026', status: 'Scheduled' },
  { id: 'PB-2026-042', teachers: 37, amount: 48_200_000, date: 'Nov 12, 2026', status: 'Draft' },
];
