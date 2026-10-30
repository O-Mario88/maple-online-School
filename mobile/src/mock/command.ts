/** Maple Command fixtures (design builds only; never bundled in deployment). */

export const northStar = [
  { label: 'Try-before-signup conversion', value: '18.4%', delta: '+2.1 pts' },
  { label: 'Day-7 retention', value: '46%', delta: '+3 pts' },
  { label: 'Live classes right now', value: '37', delta: '' },
  { label: 'Marketplace GMV (Oct)', value: 'UGX 148M', delta: '+22%' },
];

export const retention = [
  { cohort: 'Aug', d1: 0.71, d7: 0.41, d30: 0.27 },
  { cohort: 'Sep', d1: 0.74, d7: 0.44, d30: 0.29 },
  { cohort: 'Oct', d1: 0.77, d7: 0.46, d30: 0.31 },
];

export const regions = [
  { region: 'Central', schools: 46, learners: 18200 },
  { region: 'Western', schools: 21, learners: 7400 },
  { region: 'Eastern', schools: 17, learners: 6100 },
  { region: 'Northern', schools: 9, learners: 2800 },
];

export const trustQueue = [
  { id: 't1', kind: 'Teacher verification', subject: 'Mr. Isaac Mugisha', ai: 'Documents match; low risk', priority: 'normal' },
  { id: 't2', kind: 'Safeguarding alert', subject: 'Message flagged in S2 Biology squad', ai: 'Possible contact-sharing with a minor', priority: 'urgent' },
  { id: 't3', kind: 'Copyright flag', subject: 'Course: UACE Physics Notes', ai: '38% match to a published textbook', priority: 'high' },
  { id: 't4', kind: 'Course quality', subject: 'Course: P6 SST Revision', ai: 'Audio quality low in 3 lessons', priority: 'normal' },
];

export const pipeline = [
  { school: 'St. Mary’s College Kisubi', stage: 'Contract', teachersActive: 14, learners: 820 },
  { school: 'Gulu High School', stage: 'Bottom-up (ready)', teachersActive: 5, learners: 210 },
  { school: 'Mbarara Junior School', stage: 'Pilot', teachersActive: 8, learners: 340 },
  { school: 'Jinja College', stage: 'Bottom-up', teachersActive: 2, learners: 64 },
];

export const revenue = {
  batches: [
    { id: 'MTN-20261030', provider: 'MTN MoMo', amountUGX: 18400000, matched: 0.998, status: 'Reconciled' },
    { id: 'AIR-20261030', provider: 'Airtel Money', amountUGX: 7200000, matched: 0.991, status: 'Reconciled' },
    { id: 'FLW-20261029', provider: 'Flutterwave (cards)', amountUGX: 3900000, matched: 0.97, status: '3 to review' },
  ],
  split: { escrowUGX: 21600000, netUGX: 5800000, byosUGX: 12400000 },
};

export const payoutQueue = [
  { id: 'PO-3012', teacher: 'Dr. Ruth Namusoke', amountUGX: 4200000, to: 'Bank · Stanbic', needs: 'Second approver', firstApprover: 'Finance: Jane K.' },
  { id: 'PO-3011', teacher: 'Mr. Daniel Ssempala', amountUGX: 1840000, to: 'MTN MoMo', needs: 'Ready', firstApprover: '' },
  { id: 'PO-3009', teacher: 'Ms. Grace Atim', amountUGX: 960000, to: 'Airtel Money', needs: 'Retry (network)', firstApprover: '' },
];

export const ops = [
  { label: 'API p95 latency', value: '142 ms', ok: true },
  { label: 'Postgres connections', value: '38 of 100', ok: true },
  { label: 'Job queue (digests)', value: '1,204 waiting', ok: false },
  { label: 'Live rooms healthy', value: '37 of 37', ok: true },
  { label: 'Error rate (1 h)', value: '0.08%', ok: true },
];

export const security = [
  { when: '30 Oct 08:44', kind: 'Privileged action', detail: 'Support agent viewed a school’s fee ledger (ticket #4412)', severity: 'info' },
  { when: '29 Oct 22:10', kind: 'Cross-tenant attempt blocked', detail: 'Token for school 18 requested school 21 invoices', severity: 'high' },
  { when: '29 Oct 14:02', kind: 'Erasure request', detail: 'Parent asked to delete a withdrawn learner’s data', severity: 'medium' },
];
