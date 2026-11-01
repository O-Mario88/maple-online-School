/** Teacher fixtures (design builds only; never bundled in deployment). */

export { teacherHome } from './teacher-home';
export { studioNew } from './teacher-studio';
export { courseBuilder } from './teacher-course';
export { teacherCalendar } from './teacher-calendar';
export { teacherHost } from './teacher-host';

export type EventKind = 'school' | 'tutoring' | 'busy' | 'live';

export const calendar = {
  week: 'Mon 2 – Fri 6 Nov',
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  hours: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  events: [
    { day: 0, start: 8, length: 1, title: 'S3 East Maths', kind: 'school' as EventKind, room: 'Room 12' },
    { day: 0, start: 10, length: 2, title: 'S4 West Maths', kind: 'school' as EventKind, room: 'Room 12' },
    { day: 0, start: 16, length: 1, title: 'Live: Simultaneous eqns', kind: 'live' as EventKind, room: 'Maple Live' },
    { day: 1, start: 9, length: 1, title: 'Staff meeting', kind: 'busy' as EventKind, room: 'Google Calendar' },
    { day: 1, start: 14, length: 1, title: 'Tutoring: Peter K.', kind: 'tutoring' as EventKind, room: 'Maple Live' },
    { day: 2, start: 8, length: 1, title: 'S3 East Maths', kind: 'school' as EventKind, room: 'Room 12' },
    { day: 2, start: 13, length: 2, title: 'UCE revision bootcamp', kind: 'live' as EventKind, room: 'Maple Live' },
    { day: 3, start: 11, length: 1, title: 'Dentist', kind: 'busy' as EventKind, room: 'Outlook' },
    { day: 4, start: 8, length: 1, title: 'S3 East Maths', kind: 'school' as EventKind, room: 'Room 12' },
    { day: 4, start: 15, length: 1, title: 'Tutoring: Ruth A.', kind: 'tutoring' as EventKind, room: 'Maple Live' },
  ],
  availableNow: true,
};

export const hostConsole = {
  title: 'S3 Maths: Simultaneous equations',
  elapsed: '18:42',
  understanding: [
    { name: 'Amina N.', score: 0.9 },
    { name: 'Brian O.', score: 0.8 },
    { name: 'Joan N.', score: 0.7 },
    { name: 'Peter K.', score: 0.35 },
    { name: 'Ruth A.', score: 0.55 },
    { name: 'Moses T.', score: 0.25 },
    { name: 'Sarah L.', score: 0.85 },
    { name: 'David M.', score: 0.6 },
  ],
  hands: ['Peter K.', 'Moses T.'],
  breakouts: [{ name: 'Room 1', members: 4 }, { name: 'Room 2', members: 4 }],
};

export const gradingQueue = [
  {
    id: 'g1',
    learner: 'Peter Kato',
    assignment: 'Quadratics practice set',
    submitted: '2 h ago',
    answer: 'x² − 5x + 6 = 0 → (x − 2)(x − 3) = 0 → x = 2 or x = 3. For Q2 I used the formula but got a negative under the root.',
    suggestion: 'Method marks earned on Q1. Q2: sign error in b² − 4ac (used +4ac).',
    rubric: [{ criterion: 'Method', max: 8 }, { criterion: 'Accuracy', max: 8 }, { criterion: 'Presentation', max: 4 }],
  },
  {
    id: 'g2',
    learner: 'Ruth Achieng',
    assignment: 'Quadratics practice set',
    submitted: '5 h ago',
    answer: 'Completed all five questions with working.',
    suggestion: 'Full marks likely; check Q5 units.',
    rubric: [{ criterion: 'Method', max: 8 }, { criterion: 'Accuracy', max: 8 }, { criterion: 'Presentation', max: 4 }],
  },
];

export const classSpaces = [
  { id: 'cs1', name: 'S3 East Maths Club', code: '482 917', members: 31, school: 'Kampala Hill School', pending: 2 },
  { id: 'cs2', name: 'UCE Revision Group', code: '305 448', members: 64, school: 'Independent', pending: 0 },
];

export const storefront = {
  handle: '@mr.ssempala',
  name: 'Mr. Daniel Ssempala',
  headline: 'UCE and UACE Mathematics · 11 years teaching · 94% pass rate',
  bio: 'I make algebra feel like the market: practical, quick and something you can check yourself.',
  hourlyUGX: 25000,
  verified: true,
  courses: ['S3 Mathematics: Algebra and Functions', 'UCE Maths Paper 1 Drills'],
  vouchers: [{ code: 'TERM3FREE', detail: 'First lesson free', uses: 41 }, { code: 'SQUAD20', detail: '20% off for groups of 5+', uses: 9 }],
  directLink: 'maple.school/@mr.ssempala?ref=direct',
};

export type DocState = 'verified' | 'in_review' | 'needed';

export const verification = [
  { doc: 'National ID', state: 'verified' as DocState, detail: 'NIN checked 3 Sep 2026' },
  { doc: 'Bachelor of Education (Mathematics)', state: 'verified' as DocState, detail: 'Makerere University, 2014' },
  { doc: 'Teaching registration (MoES)', state: 'in_review' as DocState, detail: 'Submitted 28 Oct 2026' },
  { doc: 'Police clearance', state: 'needed' as DocState, detail: 'Needed for tutoring under-18s' },
];

export const earnings = {
  availableUGX: 1840000,
  escrowUGX: 620000,
  thisMonthUGX: 2460000,
  byosUGX: 1520000,
  marketplaceUGX: 940000,
  months: [
    { month: 'Jun', ugx: 980000 },
    { month: 'Jul', ugx: 1250000 },
    { month: 'Aug', ugx: 1610000 },
    { month: 'Sep', ugx: 1980000 },
    { month: 'Oct', ugx: 2460000 },
  ],
  payouts: [
    { id: 'PO-2291', to: 'MTN MoMo · 0772 *** 481', amountUGX: 1500000, date: '1 Oct 2026', status: 'Paid' },
    { id: 'PO-2104', to: 'MTN MoMo · 0772 *** 481', amountUGX: 1200000, date: '1 Sep 2026', status: 'Paid' },
  ],
};

export const clips = [
  { id: 'r1', source: 'Live: Simultaneous equations (28 Oct)', moment: '12:40 – 13:38', title: 'The elimination trick' },
  { id: 'r2', source: 'Quadratic formula lesson', moment: '03:10 – 04:05', title: 'Where the formula comes from' },
];
