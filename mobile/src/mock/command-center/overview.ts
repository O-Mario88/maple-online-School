/** Maple Command › Executive Overview: the eight North-Star metrics, signups, cohorts, live classes, regions and GMV. */
import type { IconName } from '@/lib/icons';

import { face, type KpiData, type Photo, type Tone, wave } from './shared';

export const northStar: readonly (KpiData & { from: string })[] = [
  { label: 'Zero-Signup Conversion', value: '42.8%', delta: '12%', from: 'From 38.2%', icon: 'userPlus', tone: 'blue' },
  { label: 'Day-1 Retention', value: '78.6%', delta: '5%', from: 'From 74.9%', icon: 'people', tone: 'green' },
  { label: 'Day-7 Retention', value: '64.3%', delta: '8%', from: 'From 59.5%', icon: 'calendar', tone: 'purple' },
  { label: 'Day-30 Retention', value: '48.7%', delta: '11%', from: 'From 43.9%', icon: 'calendar', tone: 'orange' },
  { label: 'Live Concurrent Classes', value: '1,248', delta: '18%', from: 'From 1,058', icon: 'video', tone: 'red' },
  { label: 'Gross Merchandise Value (GMV)', value: 'UGX 185.6M', delta: '23%', from: 'From UGX 151.2M', icon: 'cart', tone: 'green' },
  { label: 'Regional Growth (Users)', value: '+28.4%', delta: '28%', from: 'From last month', icon: 'chart', tone: 'purple' },
  { label: 'Monthly Active Students', value: '15,842', delta: '19%', from: 'From 13,287', icon: 'star', tone: 'orange' },
];

const N = 31;
/** Daily signup funnel for October, in people. */
export const signups = {
  visited: 152890,
  started: 65420,
  completed: 28032,
  labels: ['Oct 1', 'Oct 5', 'Oct 10', 'Oct 15', 'Oct 16', 'Oct 20', 'Oct25', 'Oct 31'],
  visitors: wave(N, 3400, 5600, 900, 0.4).map((v) => Math.round(v)),
  startedDaily: wave(N, 1500, 2600, 420, 1.1).map((v) => Math.round(v)),
  completedDaily: wave(N, 620, 1180, 200, 2.2).map((v) => Math.round(v)),
  conversion: wave(N, 34, 46, 2.6, 0.9),
  windows: ['Last 30 Days', 'Last 7 Days', 'Last 90 Days'],
};

export interface Cohort {
  cohort: string;
  size: number;
  d1: number;
  d7: number;
  /** Null until the cohort is 30 days old. */
  d30: number | null;
}

export const cohorts: readonly Cohort[] = [
  { cohort: 'Oct 1 – 7', size: 3842, d1: 79, d7: 66, d30: 51 },
  { cohort: 'Oct 8 – 14', size: 4120, d1: 80, d7: 65, d30: 49 },
  { cohort: 'Oct 15 – 21', size: 3965, d1: 77, d7: 63, d30: 47 },
  { cohort: 'Oct 22 – 28', size: 3712, d1: 76, d7: 61, d30: 45 },
  { cohort: 'Oct 29 – 31', size: 1286, d1: 72, d7: 58, d30: null },
];
export const cohortWindows = ['Signups from Oct 2026', 'Signups from Sep 2026'];

export interface LiveClass {
  title: string;
  teacher: string;
  students: number;
  progress: number;
  photo: Photo;
}

export const live = {
  inProgress: 1248,
  teaching: 892,
  upcoming: 320,
  ended: 36,
  classes: [
    { title: 'P5 Mathematics', teacher: 'Mary N.', students: 24, progress: 0.55, photo: face.tutorA },
    { title: 'S2 English', teacher: 'James O.', students: 18, progress: 0.4, photo: face.tutorB },
    { title: 'Primary Science', teacher: 'Grace A.', students: 32, progress: 0.62, photo: face.tutorC },
    { title: 'S4 Physics', teacher: 'Peter M.', students: 27, progress: 0.3, photo: face.tutorD },
    { title: 'P7 Social Studies', teacher: 'Ruth K.', students: 21, progress: 0.75, photo: face.esther },
  ] as readonly LiveClass[],
};

export interface Region {
  country: string;
  code: string;
  users: number;
  growth: string;
}

export const regions: readonly Region[] = [
  { country: 'Uganda', code: 'UG', users: 8942, growth: '+32%' },
  { country: 'Kenya', code: 'KE', users: 4218, growth: '+28%' },
  { country: 'Tanzania', code: 'TZ', users: 2985, growth: '+26%' },
  { country: 'Nigeria', code: 'NG', users: 2410, growth: '+34%' },
  { country: 'Ghana', code: 'GH', users: 1876, growth: '+21%' },
  { country: 'Rwanda', code: 'RW', users: 1245, growth: '+38%' },
  { country: 'South Africa', code: 'ZA', users: 984, growth: '+19%' },
  { country: 'Other', code: 'XX', users: 4392, growth: '+24%' },
];

/** GMV by month, in millions of UGX, split by what was sold. */
export const gmv = {
  total: 185600000,
  delta: '23%',
  months: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  tuition: [34, 41, 58, 71, 92, 112],
  resources: [16, 18, 27, 32, 40, 48],
  other: [8, 9, 14, 18, 22, 26],
  windows: ['Last 6 Months', 'Last 12 Months'],
};

export interface Activity {
  title: string;
  body: string;
  when: string;
  icon: IconName;
  tone: Tone;
}

export const activity: readonly Activity[] = [
  { title: 'New school registration', body: 'Green Valley Academy (Kenya)', when: '2 minutes ago', icon: 'building', tone: 'green' },
  { title: 'Large payment received', body: 'UGX 4,500,000 • Kampala International School', when: '8 minutes ago', icon: 'wallet', tone: 'green' },
  { title: 'New teacher signup', body: 'Sarah N. (Uganda)', when: '12 minutes ago', icon: 'person', tone: 'blue' },
  { title: 'Live class started', body: 'S3 Biology • 28 students', when: '15 minutes ago', icon: 'video', tone: 'orange' },
  { title: 'New student signup', body: 'P6 • Nigeria', when: '18 minutes ago', icon: 'people', tone: 'blue' },
  { title: 'Content upload', body: 'Primary 5 Mathematics Lesson Plan', when: '22 minutes ago', icon: 'doc', tone: 'purple' },
];

export const updated = '2 minutes ago';
export const periods = ['This Month', 'Last Month', 'This Quarter'];
