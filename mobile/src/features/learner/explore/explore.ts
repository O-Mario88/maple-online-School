/**
 * Rules behind the learner's Explore & Learn page: filtering the catalogue by curriculum,
 * category, subject and search; what to continue; recommendations; today's goals; and which
 * live classes are on now or coming up.
 */

export type Curriculum = 'UNEB' | 'KCSE' | 'WAEC' | 'IGCSE' | 'IB' | 'Common Core';
export type Kind = 'Courses' | 'Past Papers' | 'Live Classes' | 'Shorts' | 'Practice' | 'Library';

export interface Offering {
  id: string;
  title: string;
  kind: Kind;
  curriculum: Curriculum;
  subject: string;
  level: string;
  rating: number;
  learners: number;
  priceUGX: number;
  /** 0 to 1; 0 is not started. */
  progress: number;
}

export interface Filter {
  curriculum?: Curriculum;
  kind?: Kind;
  subject?: string;
  query?: string;
}

export function filterCourses<T extends Offering>(list: readonly T[], f: Filter): readonly T[] {
  const q = f.query?.trim().toLowerCase();
  return list
    .filter((x) => (!f.curriculum || x.curriculum === f.curriculum) && (!f.kind || x.kind === f.kind) && (!f.subject || x.subject === f.subject) && (!q || `${x.title} ${x.subject} ${x.curriculum} ${x.level}`.toLowerCase().includes(q)))
    .sort((a, b) => b.learners - a.learners);
}

export const continueLearning = <T extends Offering>(list: readonly T[]): readonly T[] => list.filter((x) => x.progress > 0 && x.progress < 1).sort((a, b) => b.progress - a.progress);

/** Not-started offerings in the learner's curriculum, weakest subjects first. */
export function justForYou<T extends Offering>(list: readonly T[], curriculum: Curriculum, weakest: readonly string[]): readonly T[] {
  const rank = (s: string) => (weakest.includes(s) ? weakest.indexOf(s) : weakest.length);
  return list.filter((x) => x.curriculum === curriculum && x.progress === 0).sort((a, b) => rank(a.subject) - rank(b.subject) || b.rating - a.rating);
}

export interface Goal {
  id: string;
  label: string;
  done: boolean;
}

export function goalsDone(goals: readonly Goal[]): { done: number; total: number; pct: number } {
  const done = goals.filter((g) => g.done).length;
  return { done, total: goals.length, pct: goals.length ? Math.round((done / goals.length) * 100) : 0 };
}

export const toggleGoal = (goals: readonly Goal[], id: string): readonly Goal[] => goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));

export interface Session {
  id: string;
  title: string;
  /** Local time, YYYY-MM-DDTHH:mm. */
  start: string;
  minutes: number;
}

const MINUTE_MS = 60_000;
const endOf = (s: Session) => Date.parse(s.start) + s.minutes * MINUTE_MS;

export const liveNow = <T extends Session>(list: readonly T[], now: string): readonly T[] => list.filter((s) => Date.parse(s.start) <= Date.parse(now) && Date.parse(now) < endOf(s));

export const upcoming = <T extends Session>(list: readonly T[], now: string): readonly T[] => list.filter((s) => Date.parse(s.start) > Date.parse(now)).sort((a, b) => a.start.localeCompare(b.start));
