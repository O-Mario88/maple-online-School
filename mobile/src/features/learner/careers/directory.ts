/**
 * Rules behind the University & Programs Directory: study levels, fee bands, filters, the "most
 * relevant" order and pages. The directory is free for everyone, and paying never changes the order.
 */
import { programStatus } from './careers';

export const INSTITUTION_TYPES = [
  { type: 'University', plural: 'Universities', icon: 'building' },
  { type: 'College', plural: 'Colleges', icon: 'cap' },
  { type: 'Technical Institute', plural: 'Technical Institutes', icon: 'settings' },
  { type: 'Vocational Provider', plural: 'Vocational Providers', icon: 'briefcase' },
] as const;

export const STUDY_LEVELS = ['Undergraduate', 'Postgraduate', 'Diploma & Certificate', 'Vocational & Technical'] as const;
export type StudyLevel = (typeof STUDY_LEVELS)[number];

export function levelOf(award: string, institutionType: string): StudyLevel {
  if (institutionType === 'Vocational Provider') return 'Vocational & Technical';
  if (award === 'Master') return 'Postgraduate';
  if (award === 'Bachelor') return 'Undergraduate';
  return 'Diploma & Certificate';
}

/** Fee bands, per semester. */
export const FEE_LOW = 1_500_000;
export const FEE_HIGH = 2_500_000;
export type FeeBand = 'low' | 'mid' | 'high';
export const feeBand = (fees: number): FeeBand => (fees < FEE_LOW ? 'low' : fees <= FEE_HIGH ? 'mid' : 'high');

const ALL = 'all';
export interface DirFilters {
  query: string;
  type: string;
  level: string;
  area: string;
  town: string;
  mode: string;
  fees: string;
  /** 'verified' | 'review-due' | 'unverified' */
  accreditation: string;
}
export const NO_FILTERS: DirFilters = { query: '', type: ALL, level: ALL, area: ALL, town: ALL, mode: ALL, fees: ALL, accreditation: ALL };

interface Inst {
  id: string;
  name: string;
  type: string;
  town: string;
  about: string;
  verification: { status: 'verified' | 'pending' };
}
interface Prog {
  universityId: string;
  title: string;
  faculty: string;
  award: string;
  mode: string;
  feesUGX: number;
  accreditation: { status: 'accredited' | 'pending' | 'not-accredited'; verifiedOn: string | null };
}

const pass = (want: string, have: string) => want === ALL || want === have;

/** Does a program pass the program filters (level, area, mode, fees, accreditation)? */
export function programMatches(p: Prog, institutionType: string, f: DirFilters, today: string): boolean {
  return (
    pass(f.level, levelOf(p.award, institutionType)) &&
    pass(f.area, p.faculty) &&
    pass(f.mode, p.mode) &&
    pass(f.fees, feeBand(p.feesUGX)) &&
    pass(f.accreditation, programStatus(p.accreditation, today))
  );
}

const programFilterSet = (f: DirFilters) => [f.level, f.area, f.mode, f.fees, f.accreditation].some((v) => v !== ALL);

/** Institutions of the chosen type and town that match the search and offer at least one program passing the program filters. */
export function filterInstitutions<U extends Inst>(unis: readonly U[], programs: readonly Prog[], f: DirFilters, today: string): U[] {
  const q = f.query.trim().toLowerCase();
  return unis.filter((u) => {
    if (!pass(f.type, u.type) || !pass(f.town, u.town)) return false;
    const own = programs.filter((p) => p.universityId === u.id);
    if (programFilterSet(f) && !own.some((p) => programMatches(p, u.type, f, today))) return false;
    if (!q) return true;
    return [u.name, u.town, u.about].some((x) => x.toLowerCase().includes(q)) || own.some((p) => `${p.title} ${p.faculty}`.toLowerCase().includes(q));
  });
}

export type DirSort = 'relevant' | 'name' | 'programs';

/** "Most relevant": verified institutions first, then the ones offering more programs. */
export function sortInstitutions<U extends Inst>(unis: readonly U[], programs: readonly Prog[], sort: DirSort): U[] {
  const count = (id: string) => programs.filter((p) => p.universityId === id).length;
  const byName = (a: U, b: U) => a.name.localeCompare(b.name);
  if (sort === 'name') return [...unis].sort(byName);
  if (sort === 'programs') return [...unis].sort((a, b) => count(b.id) - count(a.id));
  const verified = (u: U) => (u.verification.status === 'verified' ? 0 : 1);
  return [...unis].sort((a, b) => verified(a) - verified(b) || count(b.id) - count(a.id));
}

export const PAGE_SIZE = 6;

export function paginate<T>(list: readonly T[], page: number, size = PAGE_SIZE) {
  const pages = Math.max(1, Math.ceil(list.length / size));
  const at = Math.min(Math.max(1, page), pages);
  const start = (at - 1) * size;
  const items = list.slice(start, start + size);
  return { items, page: at, pages, from: items.length ? start + 1 : 0, to: start + items.length, total: list.length };
}
