/** Scholarship rules: filters, open or closed, "For Me", and the order. Eligibility shown is a summary; providers decide. */
import { daysBetween } from './dates';

export interface ScholarshipFilters {
  /** Any of these levels (none chosen means all). */
  levels: readonly string[];
  areas: readonly string[];
  types: readonly string[];
  /** 'all' | 'quarter' (closing in the next 90 days) | 'later' */
  deadline: string;
}
export const NO_SCHOLARSHIP_FILTERS: ScholarshipFilters = { levels: [], areas: [], types: [], deadline: 'all' };
const QUARTER = 90;

interface Sch {
  id: string;
  title: string;
  deadline: string;
  level: string;
  area: string;
  type: string;
}

export const isOpen = (s: { deadline: string }, today: string) => daysBetween(today, s.deadline) >= 0;
const anyOf = (chosen: readonly string[], v: string) => chosen.length === 0 || chosen.includes(v);

export function filterScholarships<T extends Sch>(list: readonly T[], f: ScholarshipFilters, today: string): T[] {
  return list.filter((s) => {
    const left = daysBetween(today, s.deadline);
    if (f.deadline === 'quarter' && (left < 0 || left > QUARTER)) return false;
    if (f.deadline === 'later' && left <= QUARTER) return false;
    return anyOf(f.levels, s.level) && anyOf(f.areas, s.area) && anyOf(f.types, s.type);
  });
}

/** Open scholarships at each study level. */
export function levelCounts(list: readonly Sch[], today: string): Record<string, number> {
  const out: Record<string, number> = {};
  list.filter((s) => isOpen(s, today)).forEach((s) => (out[s.level] = (out[s.level] ?? 0) + 1));
  return out;
}

/** Open scholarships linked to the learner's saved programs, or in one of their closest career areas. */
export function forMe<T extends Sch>(list: readonly T[], me: { areas: readonly string[]; linked: readonly string[] }, today: string): T[] {
  return list.filter((s) => isOpen(s, today) && (me.linked.includes(s.id) || me.areas.includes(s.area)));
}

export function sortScholarships<T extends Sch>(list: readonly T[], sort: 'deadline' | 'az'): T[] {
  return [...list].sort((a, b) => (sort === 'az' ? a.title.localeCompare(b.title) : a.deadline.localeCompare(b.deadline)));
}
