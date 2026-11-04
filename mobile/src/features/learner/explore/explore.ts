/**
 * Rules behind the learner's Explore & Learn page: filtering the catalogue by curriculum,
 * category, subject and search; what to continue; recommendations; today's goals; and which
 * live classes are on now or coming up.
 */

export type Curriculum = 'UNEB' | 'KCSE' | 'WAEC' | 'IGCSE' | 'IB' | 'Common Core';
export type Kind = 'Subjects' | 'Past Papers' | 'Live Classes' | 'Shorts' | 'Practice' | 'Library';

export interface Offering {
  id: string;
  title: string;
  kind: Kind;
  curriculum: Curriculum;
  subject: string;
  level: string;
  rating: number;
  learners: number;
  /** 0 to 1; 0 is not started. */
  progress: number;
  /** The teacher who set it for this learner, if one did. */
  assignedBy?: string;
  /** The day it was added, YYYY-MM-DD. */
  added?: string;
}

const UNITS: Readonly<Record<Kind, [string, string]>> = {
  Subjects: ['lesson', 'lessons'],
  'Past Papers': ['paper', 'papers'],
  'Live Classes': ['session', 'sessions'],
  Practice: ['question', 'questions'],
  Shorts: ['clip', 'clips'],
  Library: ['book', 'books'],
};

/** What a card says where a price used to be: how big it is ("36 lessons", "22 papers"). */
export function offeringSize(kind: Kind, n: number): string {
  const [one, many] = UNITS[kind];
  return `${n} ${n === 1 ? one : many}`;
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

export type RowKey = 'popular' | 'assigned' | 'recommended' | 'top' | 'new';

export interface Row<T> {
  key: RowKey;
  title: string;
  items: readonly T[];
}

const DAY_MS = 86_400_000;
const NEW_DAYS = 7;

/** The rows on Explore for one curriculum; a row with nothing in it is left out. */
export function exploreRows<T extends Offering>(list: readonly T[], at: { curriculum: Curriculum; weakest: readonly string[]; now: string }): readonly Row<T>[] {
  const mine = list.filter((x) => x.curriculum === at.curriculum);
  const since = Date.parse(at.now.slice(0, 10)) - NEW_DAYS * DAY_MS;
  const rows: Row<T>[] = [
    { key: 'popular', title: 'Most Popular', items: [...mine].sort((a, b) => b.learners - a.learners) },
    { key: 'assigned', title: 'Assigned by Teachers', items: mine.filter((x) => x.assignedBy) },
    { key: 'recommended', title: 'Recommended for You', items: justForYou(mine, at.curriculum, at.weakest) },
    { key: 'top', title: 'Top Rated', items: [...mine].sort((a, b) => b.rating - a.rating || b.learners - a.learners) },
    { key: 'new', title: 'New This Week', items: mine.filter((x) => x.added && Date.parse(x.added) >= since).sort((a, b) => (b.added ?? '').localeCompare(a.added ?? '')) },
  ];
  return rows.filter((r) => r.items.length > 0);
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
