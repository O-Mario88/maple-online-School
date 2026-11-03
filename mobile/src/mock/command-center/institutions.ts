/** Maple Command › Institutions & School Onboarding Pipeline sample data. */
import type { Plan, School, Stage } from '@/features/command/logic/institutions';

import type { KpiData } from './shared';

export interface SchoolRow extends School {
  n: number;
  city: string;
  flag: string;
  students: number;
  owner: string;
  last: string;
  /** Logo colour for the round badge. */
  color: string;
}

const first: readonly SchoolRow[] = [
  { n: 1, id: 'sc-1', name: 'Green Valley Academy', city: 'Kampala, Uganda', flag: 'UG', teachers: 8, students: 420, stage: 'Active Tenant', plan: 'Pro Plan', renewal: 'Jan 2027', owner: 'Alice K.', last: 'Oct 18, 2026', color: '#22A55A' },
  { n: 2, id: 'sc-2', name: 'Bright Future School', city: 'Nairobi, Kenya', flag: 'KE', teachers: 5, students: 312, stage: 'Active Tenant', plan: 'Standard', owner: 'Peter O.', last: 'Oct 18, 2026', color: '#1E6BF0' },
  { n: 3, id: 'sc-3', name: 'Sunrise Primary School', city: 'Arusha, Tanzania', flag: 'TZ', teachers: 3, students: 180, stage: 'Registered', plan: '', owner: 'Grace M.', last: 'Oct 17, 2026', color: '#16A34A' },
  { n: 4, id: 'sc-4', name: 'Hope International School', city: 'Lagos, Nigeria', flag: 'NG', teachers: 12, students: 560, stage: 'In Negotiation', plan: 'Enterprise', owner: 'Daniel A.', last: 'Oct 16, 2026', color: '#8B5CF6' },
  { n: 5, id: 'sc-5', name: 'New Life Academy', city: 'Accra, Ghana', flag: 'GH', teachers: 4, students: 210, stage: 'Onboarding', plan: 'Standard', owner: 'Sarah N.', last: 'Oct 16, 2026', color: '#F59E0B' },
  { n: 6, id: 'sc-6', name: 'Faith Christian School', city: 'Kigali, Rwanda', flag: 'RW', teachers: 3, students: 150, stage: 'Qualified', plan: '', owner: 'Peter O.', last: 'Oct 15, 2026', color: '#0EA5E9' },
  { n: 7, id: 'sc-7', name: "St. Mark's College", city: 'Johannesburg, South Africa', flag: 'ZA', teachers: 15, students: 890, stage: 'Active Tenant', plan: 'Enterprise', owner: 'Mary N.', last: 'Oct 15, 2026', color: '#0F766E' },
  { n: 8, id: 'sc-8', name: 'Unity Primary School', city: 'Gulu, Uganda', flag: 'UG', teachers: 2, students: 95, stage: 'Registered', plan: '', owner: 'Daniel A.', last: 'Oct 14, 2026', color: '#64748B' },
  { n: 9, id: 'sc-9', name: 'Cornerstone Academy', city: 'Mombasa, Kenya', flag: 'KE', teachers: 6, students: 320, stage: 'In Negotiation', plan: 'Pro Plan', owner: 'Grace M.', last: 'Oct 14, 2026', color: '#DC2626' },
  { n: 10, id: 'sc-10', name: 'Light of Hope School', city: 'Dar es Salaam, Tanzania', flag: 'TZ', teachers: 1, students: 60, stage: 'Registered', plan: '', owner: '—', last: 'Oct 13, 2026', color: '#111827' },
];

const PREFIX = ['Kingdom', 'Victory', 'Mount Zion', 'Riverside', 'Lakeview', 'Hilltop', 'Golden Gate', 'Morning Star', 'Pearl', 'Heritage', 'Bethel', 'Excel', 'Savannah', 'Crestwood', 'Harmony'];
const SUFFIX = ['Academy', 'Primary School', 'High School', 'College', 'International School', 'Junior School'];
const CITIES: readonly [string, string][] = [['Kampala, Uganda', 'UG'], ['Nairobi, Kenya', 'KE'], ['Dodoma, Tanzania', 'TZ'], ['Abuja, Nigeria', 'NG'], ['Kumasi, Ghana', 'GH'], ['Kigali, Rwanda', 'RW'], ['Mbarara, Uganda', 'UG'], ['Kisumu, Kenya', 'KE'], ['Durban, South Africa', 'ZA']];
const OWNERS = ['Alice K.', 'Peter O.', 'Grace M.', 'Daniel A.', 'Sarah N.', 'Mary N.'];
const COLORS = ['#22A55A', '#1E6BF0', '#8B5CF6', '#F59E0B', '#0EA5E9', '#DC2626', '#0F766E'];

/** Fills the list to 1,248 schools in the reference's proportions, so tabs, counts and pages are real. */
function generated(): readonly SchoolRow[] {
  const plan: readonly [Stage, number][] = [['Active Tenant', 889], ['Onboarding', 51], ['Contract Signed', 12], ['In Negotiation', 126], ['Qualified', 116], ['Registered', 44]];
  const out: SchoolRow[] = [];
  let n = 11;
  for (const [stage, count] of plan) {
    for (let i = 0; i < count; i++, n++) {
      const [city, flag] = CITIES[n % CITIES.length];
      const teachers = stage === 'Registered' ? n % 3 : 3 + (n % 12);
      const p: Plan = stage === 'Registered' || stage === 'Qualified' ? '' : n % 19 === 0 ? 'Enterprise' : n % 2 ? 'Standard' : 'Pro Plan';
      out.push({
        n,
        id: `sc-${n}`,
        name: `${PREFIX[n % PREFIX.length]} ${SUFFIX[(n * 7) % SUFFIX.length]}`,
        city,
        flag,
        teachers,
        students: teachers * (35 + (n % 30)),
        stage,
        plan: p,
        renewal: stage === 'Active Tenant' && n % 4 === 0 ? ['Jan 2027', 'Mar 2027', 'Jun 2027'][n % 3] : undefined,
        owner: stage === 'Registered' && n % 2 ? '—' : OWNERS[n % OWNERS.length],
        last: `Oct ${Math.max(1, 13 - Math.floor((n - 11) / 100))}, 2026`,
        color: COLORS[n % COLORS.length],
      });
    }
  }
  return out;
}

export const schools: readonly SchoolRow[] = [...first, ...generated()];
export const quota = 1200;

/** Static figures from the reference (trend lines and this period's funnel). */
export const kpiExtras: Readonly<Record<string, Pick<KpiData, 'delta' | 'caption'>>> = {
  'Total Registered Schools': { delta: '24%', caption: 'from last month' },
  'Active Tenants': { delta: '22%', caption: 'with active subscription' },
  'Bottom-Up Opportunities': { delta: '35%', caption: '≥ 3 active teachers' },
  'Enterprise Contracts': { delta: '15%', caption: 'negotiation / signed' },
  'Onboarding (In Progress)': { delta: '18%', caption: 'schools in pipeline' },
};

export const growth = {
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
  total: [420, 610, 540, 780, 860, 1020, 1130, 1260, 1250, 1380],
  active: [220, 300, 280, 360, 440, 560, 610, 690, 760, 880],
  bottomUp: [60, 110, 120, 150, 200, 260, 280, 310, 330, 350],
  enterprise: [18, 22, 24, 28, 30, 34, 38, 40, 43, 46],
  windows: ['Last 12 Months', 'Last 6 Months'],
};

/** This quarter's funnel, from qualified to live. */
export const funnel: readonly { label: string; sub: string; value: number; color: string }[] = [
  { label: 'Bottom-Up Qualified', sub: '≥ 3 active teachers', value: 356, color: '#8DB5FA' },
  { label: 'Contacted', sub: 'Outreach initiated', value: 242, color: '#4ADE80' },
  { label: 'In Negotiation', sub: 'Demo / Proposal sent', value: 128, color: '#C4B5FD' },
  { label: 'Contract Signed', sub: 'Pending setup', value: 64, color: '#FCD34D' },
  { label: 'Onboarding', sub: 'Setup in progress', value: 52, color: '#FCA5A5' },
  { label: 'Active Tenant', sub: 'Completed', value: 46, color: '#D8B4FE' },
];
export const regionsFilter = ['All Regions', 'East Africa', 'West Africa', 'Southern Africa'];

export const byRegion: readonly { country: string; code: string; schools: number; growth: string }[] = [
  { country: 'Uganda', code: 'UG', schools: 98, growth: '+42%' },
  { country: 'Kenya', code: 'KE', schools: 76, growth: '+38%' },
  { country: 'Tanzania', code: 'TZ', schools: 54, growth: '+31%' },
  { country: 'Nigeria', code: 'NG', schools: 48, growth: '+28%' },
  { country: 'Ghana', code: 'GH', schools: 32, growth: '+25%' },
  { country: 'Rwanda', code: 'RW', schools: 28, growth: '+40%' },
  { country: 'South Africa', code: 'ZA', schools: 18, growth: '+22%' },
  { country: 'Other', code: 'XX', schools: 20, growth: '+19%' },
];
