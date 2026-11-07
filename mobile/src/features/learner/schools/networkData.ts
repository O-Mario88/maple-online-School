/**
 * What the School Network page and the application form draw, whether from the design build's
 * sample data or the API, and the copy that is the same either way. No images or theme here, so
 * tests can import it.
 */
import type { IconName } from '@/lib/icons';

import type { ApplicationForm } from './applicationForm';
import type { Category, NetworkSchool, SchoolPrefs } from './schoolNetwork';

export interface ExamCentre {
  boards: readonly string[];
  exams: readonly string[];
  /** Whether the centre takes external (private) candidates. */
  external: boolean;
  /** Last day to register, as shown ("28 Feb 2027"), or null when the school hasn't said. */
  deadline: string | null;
  feeUGX: number | null;
}

export interface RequiredDocument {
  id: string;
  label: string;
  /** The sample file design builds attach; real builds ask the learner to choose one. */
  file?: string;
}

/** What a school's application form offers, needs and charges. */
export interface SchoolApply {
  /** e.g. "Term 1, 2027"; null when the school hasn't said. */
  intake: string | null;
  feeUGX: number | null;
  programs: readonly string[];
  documents: readonly RequiredDocument[];
}

export interface SchoolCard extends NetworkSchool {
  /** Campus photo and crest; real schools have none until uploads exist, and the page draws a stand-in. */
  photo?: number;
  crest?: number;
  /** The chips under the rating. */
  tags: readonly string[];
  /** What the pass rate measures, e.g. "UCE Pass Rate". */
  passLabel: string;
  /** The year and source of the published pass rate. */
  passSource: string;
  facilities: readonly string[];
  admissions: { opens: string; deadline: string; feesUGX: readonly [number, number] | null; requirements: readonly string[] };
  exam?: ExamCentre;
  /** The school's own application form (real builds); design builds share one sample form. */
  apply?: SchoolApply;
}

export interface NetVacancy {
  id: string;
  schoolId: string;
  title: string;
  type: string;
  closes: string;
  subjects: readonly string[];
}

export interface NetStep {
  title: string;
  sub: string;
  icon: IconName;
}

export interface NetPlan {
  id: string;
  name: string;
  from: boolean;
  priceUGX: number;
  popular: boolean;
}

/** One of the learner's own applications on Maple: started, or sent to the school. */
export interface NetApplication {
  schoolId: string;
  submitted: boolean;
}

/** The application form: the school's parts, the choice lists, and a sample draft in design builds. */
export interface NetApply extends SchoolApply {
  requirements: readonly string[];
  genders: readonly string[];
  nationalities: readonly string[];
  relationships: readonly string[];
  grades: readonly string[];
  years: readonly string[];
  streams: readonly string[];
  subjects: readonly string[];
  draft?: { schoolId: string; form: ApplicationForm };
}

export interface SchoolNetworkData {
  hero?: number;
  title: string;
  sub: string;
  schools: readonly SchoolCard[];
  /** How many schools each category tile holds. */
  categoryCounts: Readonly<Record<Category, number>>;
  /** What this learner chose to share for matching (changeable in More Filters). */
  prefs: SchoolPrefs;
  districts: readonly string[];
  curricula: readonly string[];
  levels: readonly string[];
  /** The learner's own saved schools, by id. */
  saved: readonly string[];
  journey: readonly NetStep[];
  funnel: readonly NetStep[];
  /** The learner's own applications on Maple, most recent first. Drafts stay on the device until sent. */
  applications: readonly NetApplication[];
  /** The application form. A school's own form replaces its school-specific parts (see formFor). */
  apply: NetApply;
  vacancies: readonly NetVacancy[];
  /** Plans for schools; empty until Maple publishes plan configuration through the API. */
  plans: readonly NetPlan[];
  planFeatures: readonly string[];
}

/** The choice lists on every school's form. */
export const APPLY_CHOICES = {
  genders: ['Female', 'Male'],
  nationalities: ['Ugandan', 'Kenyan', 'Tanzanian', 'Rwandan', 'South Sudanese', 'Other'],
  relationships: ['Father', 'Mother', 'Guardian', 'Grandparent', 'Sibling', 'Other'],
  grades: ['P.6', 'P.7', 'S.3', 'S.4'],
  streams: ['Sciences', 'Arts', 'STEM', 'Business', 'Undecided'],
  subjects: ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Geography', 'History', 'ICT', 'Fine Art'],
} as const;

const RECENT_YEARS = 3;

/** The last three years, oldest first, for the current-school and PLE year lists. */
export function recentYears(today: string): readonly string[] {
  const year = Number(today.slice(0, 4));
  return Array.from({ length: RECENT_YEARS }, (_, i) => String(year - RECENT_YEARS + 1 + i));
}

/** A school's form: its own form and requirements when it has published them, else the network's sample form. */
export function formFor(apply: NetApply, school: SchoolCard): NetApply {
  return school.apply ? { ...apply, ...school.apply, requirements: school.admissions.requirements } : apply;
}

/** The page's copy, the same in design and real builds. */
export const NETWORK_COPY = {
  title: 'School Network',
  sub: 'Discover verified schools, explore programs, find exam centres, and teaching opportunities.',
  journey: [
    { title: 'Discover Schools', sub: 'Explore verified Maple institutions', icon: 'cap' },
    { title: 'Explore & Compare', sub: 'View profiles, programs, reviews', icon: 'pointer' },
    { title: 'Apply', sub: 'Submit an application to your chosen school', icon: 'clipboard' },
    { title: 'Enrol', sub: 'Join and start learning', icon: 'people' },
  ] as readonly NetStep[],
  funnel: [
    { title: 'Profile View', sub: '(Interest)', icon: 'eye' },
    { title: 'Save / Like', sub: '(Consideration)', icon: 'bookmark' },
    { title: 'Admissions Visit', sub: '(Deeper Interest)', icon: 'pointer' },
    { title: 'Application', sub: '(Action)', icon: 'doc' },
    { title: 'Enrolment', sub: '(Success)', icon: 'tick' },
  ] as readonly NetStep[],
  planFeatures: ['Complete digital school', 'Full financial management', 'Live classes (LiveKit)', 'School Network listing', 'Custom branding'] as readonly string[],
};
