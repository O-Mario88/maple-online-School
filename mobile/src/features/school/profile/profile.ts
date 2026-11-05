/**
 * Rules for School Profile Management: how complete the public profile is, what the basic
 * information needs, and what must be true before changes are published to the School Network.
 * A paid plan is never proof of accreditation; results appear only once Maple has verified them.
 */

export const PROFILE_SECTIONS = [
  { key: 'basic', label: 'Basic Information', weight: 16 },
  { key: 'academics', label: 'Academics & Programs', weight: 14 },
  { key: 'performance', label: 'Performance', weight: 14 },
  { key: 'admissions', label: 'Admissions', weight: 14 },
  { key: 'facilities', label: 'Facilities & Gallery', weight: 12 },
  { key: 'exams', label: 'Examination Services', weight: 12 },
  { key: 'contact', label: 'Contact & Location', weight: 10 },
  { key: 'branding', label: 'School Branding', weight: 8 },
] as const;
export type SectionKey = (typeof PROFILE_SECTIONS)[number]['key'];

/** Percent complete: the weights of the finished sections. */
export const profileCompletion = (done: readonly SectionKey[]): number => PROFILE_SECTIONS.filter((x) => done.includes(x.key)).reduce((n, x) => n + x.weight, 0);

export interface BasicInfo {
  name: string;
  type: string;
  ownership: string;
  established: string;
  registration: string;
  description: string;
  country: string;
  district: string;
  town: string;
  address: string;
}

export const DESCRIPTION_MIN = 50;
export const DESCRIPTION_MAX = 500;
const FIRST_YEAR = 1900;

const blank = (v: string) => !v.trim();

/** What to fix in the basic information; empty when it can be published. */
export function validateBasic(b: BasicInfo, thisYear: number): Readonly<Record<string, string>> {
  const year = Number(b.established);
  const checks: readonly (readonly [keyof BasicInfo, string | null])[] = [
    ['name', blank(b.name) ? 'Enter the school’s name' : null],
    ['type', blank(b.type) ? 'Choose the school type' : null],
    ['ownership', blank(b.ownership) ? 'Choose the ownership' : null],
    ['established', /^\d{4}$/.test(b.established) && year >= FIRST_YEAR && year <= thisYear ? null : `Enter a year between ${FIRST_YEAR} and ${thisYear}`],
    ['description', b.description.trim().length < DESCRIPTION_MIN ? `Write at least ${DESCRIPTION_MIN} characters about your school` : b.description.length > DESCRIPTION_MAX ? `Keep the description to ${DESCRIPTION_MAX} characters` : null],
    ['country', blank(b.country) ? 'Choose the country' : null],
    ['district', blank(b.district) ? 'Choose the district' : null],
    ['town', blank(b.town) ? 'Enter the town or city' : null],
    ['address', blank(b.address) ? 'Enter the physical address' : null],
  ];
  return Object.fromEntries(checks.filter((c): c is readonly [keyof BasicInfo, string] => c[1] !== null));
}

/** Whether changes can go live on the School Network, and if not, why. */
export function canPublish(p: { basic: BasicInfo; policyAccepted: boolean; performanceVerified: boolean }, thisYear: number): { ok: boolean; reasons: readonly string[] } {
  const reasons = [
    Object.keys(validateBasic(p.basic, thisYear)).length ? 'Fix the highlighted fields in Basic Information.' : null,
    p.policyAccepted ? null : 'Accept the School Network policies.',
    p.performanceVerified ? null : 'Maple must verify your published results before they appear.',
  ].filter((r): r is string => r !== null);
  return { ok: reasons.length === 0, reasons };
}
