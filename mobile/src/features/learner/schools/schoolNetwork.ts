/**
 * Rules behind the School Network: finding verified Maple schools, the category tiles, the
 * three lists, sorting, and the reasons a school is recommended. Recommendations rank by
 * educational fit (curriculum and level first), never by who pays, and always say why.
 */

export type Stay = 'Day' | 'Boarding' | 'Day & Boarding';
export type Mode = 'Physical' | 'Hybrid' | 'Online';

export interface NetworkSchool {
  id: string;
  name: string;
  town: string;
  district: string;
  /** Distance from the learner's chosen area. */
  km: number;
  rating: number;
  reviews: number;
  curricula: readonly string[];
  levels: readonly string[];
  stay: Stay;
  mode: Mode;
  /** Programs such as STEM, Arts or Vocational. */
  programs: readonly string[];
  blurb: string;
  /** Published pass rate (%), for the latest verified year. */
  passRate: number;
  learners: number;
  est: number;
  scholarships: boolean;
  /** Total profile views: an aggregate, never who viewed. */
  views: number;
  /** When the school joined the network (YYYY-MM-DD). */
  added: string;
}

/** What the learner chose to share for matching; every field is optional. */
export interface SchoolPrefs {
  district?: string;
  curriculum?: string;
  level?: string;
  stay?: Stay;
  subjects?: readonly string[];
}

export interface SchoolFilters {
  query?: string;
  district?: string;
  curriculum?: string;
  level?: string;
}

export type Category = 'all' | 'near' | 'top' | 'online' | 'boarding' | 'scholarships';
export type ListTab = 'recommended' | 'popular' | 'recent';
export type SchoolSort = 'relevance' | 'rating' | 'distance' | 'passRate';

/** "Near me" reaches this far from the learner's chosen area. */
export const NEAR_KM = 40;
/** "Top performing" starts at this published pass rate. */
export const TOP_PASS_RATE = 95;

const lower = (s: string) => s.toLowerCase();

/** Schools matching the search words and every filter that is set. */
export function searchSchools<T extends NetworkSchool>(list: readonly T[], f: SchoolFilters): readonly T[] {
  const q = lower((f.query ?? '').trim());
  return list.filter((s) => {
    if (f.district && s.district !== f.district) return false;
    if (f.curriculum && !s.curricula.includes(f.curriculum)) return false;
    if (f.level && !s.levels.includes(f.level)) return false;
    if (!q) return true;
    return [s.name, s.town, s.district, ...s.curricula, ...s.levels, ...s.programs].some((x) => lower(x).includes(q));
  });
}

export function inCategory(s: NetworkSchool, c: Category): boolean {
  switch (c) {
    case 'near':
      return s.mode !== 'Online' && s.km <= NEAR_KM;
    case 'top':
      return s.passRate >= TOP_PASS_RATE;
    case 'online':
      return s.mode !== 'Physical';
    case 'boarding':
      return s.stay !== 'Day';
    case 'scholarships':
      return s.scholarships;
    default:
      return true;
  }
}

/** How much each kind of fit counts: what the school teaches matters most. */
const WEIGHT = { curriculum: 3, level: 3, district: 2, stay: 1, programs: 1 } as const;

function fits(s: NetworkSchool, p: SchoolPrefs) {
  const programs = s.programs.filter((x) => p.subjects?.includes(x));
  return [
    { on: !!p.curriculum && s.curricula.includes(p.curriculum), weight: WEIGHT.curriculum, reason: 'Offers the curriculum you selected' },
    // Where an online school is based does not matter to the learner.
    { on: !!p.district && s.mode !== 'Online' && s.district === p.district, weight: WEIGHT.district, reason: 'Located in your preferred district' },
    { on: !!p.level && s.levels.includes(p.level), weight: WEIGHT.level, reason: `Teaches ${p.level}, the level you chose` },
    { on: !!p.stay && s.stay === p.stay, weight: WEIGHT.stay, reason: `${p.stay}, as you prefer` },
    { on: programs.length > 0, weight: WEIGHT.programs, reason: `Has the ${programs.join(' and ')} programs you are exploring` },
  ].filter((x) => x.on);
}

/** Why a school is recommended, in plain words; empty when it fits none of the learner's choices. */
export const matchReasons = (s: NetworkSchool, p: SchoolPrefs): readonly string[] => fits(s, p).map((x) => x.reason);

const score = (s: NetworkSchool, p: SchoolPrefs) => fits(s, p).reduce((n, x) => n + x.weight, 0);

/** The list under each tab: best fit, most viewed, or newest to the network. */
export function listFor<T extends NetworkSchool>(list: readonly T[], tab: ListTab, p: SchoolPrefs): readonly T[] {
  if (tab === 'popular') return [...list].sort((a, b) => b.views - a.views);
  if (tab === 'recent') return [...list].sort((a, b) => b.added.localeCompare(a.added));
  return list
    .map((s) => ({ s, n: score(s, p) }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || b.s.rating - a.s.rating)
    .map((x) => x.s);
}

/** The Sort menu; "relevance" keeps the tab's own order. */
export function sortSchools<T extends NetworkSchool>(list: readonly T[], sort: SchoolSort): readonly T[] {
  if (sort === 'rating') return [...list].sort((a, b) => b.rating - a.rating);
  if (sort === 'distance') return [...list].sort((a, b) => a.km - b.km);
  if (sort === 'passRate') return [...list].sort((a, b) => b.passRate - a.passRate);
  return list;
}
