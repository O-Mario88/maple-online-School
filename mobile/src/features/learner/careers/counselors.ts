/** Counselor rules: the next open times and the Find a Counselor filters. */
import type { Counseling, Slot } from './compass';
import { daysBetween } from './dates';

export interface CounselorFilters {
  area: string;
  focus: string;
  language: string;
  /** 'all' | 'week' (an open time in the next 7 days) | 'fortnight' */
  availability: string;
}
export const NO_COUNSELOR_FILTERS: CounselorFilters = { area: 'all', focus: 'all', language: 'all', availability: 'all' };
const WINDOW = { week: 7, fortnight: 14 } as const;

/** Open times still ahead for one counselor, soonest first. */
export function nextTimes<T extends Slot>(slots: readonly T[], c: Counseling, counselorId: string, now: string, limit = 3): T[] {
  return slots
    .filter((s) => s.counselorId === counselorId && s.at > now && !c.sessions.some((b) => b.slotId === s.id))
    .sort((a, b) => a.at.localeCompare(b.at))
    .slice(0, limit);
}

interface Person {
  id: string;
  areas: readonly string[];
  focus: readonly string[];
  languages: readonly string[];
}

export function filterCounselors<T extends Person>(list: readonly T[], slots: readonly Slot[], c: Counseling, f: CounselorFilters, now: string): T[] {
  return list.filter((p) => {
    if (f.availability !== 'all') {
      const within = WINDOW[f.availability as keyof typeof WINDOW];
      if (!nextTimes(slots, c, p.id, now, 99).some((s) => daysBetween(now, s.at) <= within)) return false;
    }
    return (f.area === 'all' || p.areas.includes(f.area)) && (f.focus === 'all' || p.focus.includes(f.focus)) && (f.language === 'all' || p.languages.includes(f.language));
  });
}
