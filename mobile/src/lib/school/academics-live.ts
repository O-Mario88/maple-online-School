import type { Programme } from '@/lib/curriculum/programme';

import { localToday } from './attendance';
import { classesByLevel } from './academics';
import type { Class, ClassLevel, Term } from './types';

type Row = readonly string[];
export type AcademicsKey = 'campuses' | 'years' | 'terms' | 'streams' | 'subjects' | 'grading' | 'competency';

export interface AcademicsInput {
  school: { name: string; country: string; level: string };
  learners: number;
  terms: readonly Term[];
  classes: readonly Class[];
  levels: readonly ClassLevel[];
  /** Learners on each class list, by class id. */
  classLearners: ReadonlyMap<number, number>;
  programme: Programme | null;
  today?: Date;
}

export interface AcademicsData {
  rows: Record<AcademicsKey, Row[]>;
  counts: Record<AcademicsKey, number>;
  /** Subject matrices: the curriculum classes that have subjects assigned. */
  matrices: number;
}

/** How much of the academic set-up is done: the share of the seven parts with anything in them, as a whole percent. */
export function setupProgress(counts: Readonly<Record<AcademicsKey, number>>): number {
  const parts = Object.values(counts);
  return parts.length ? Math.round((parts.filter((n) => n > 0).length / parts.length) * 100) : 0;
}

/**
 * One matrix per curriculum class with subjects, counting only the school's own level ("Secondary" counts
 * Lower and Advanced Secondary) when the curriculum names it; otherwise every class.
 */
function matrixCount(programme: Programme | null, schoolLevel: string): number {
  const levels = (programme?.tracks ?? []).flatMap((t) => t.levels);
  const word = schoolLevel.trim().toLowerCase();
  const own = word ? levels.filter((l) => l.name.toLowerCase().includes(word)) : [];
  return (own.length ? own : levels).reduce((n, l) => n + l.classes.filter((c) => c.subjects.length > 0).length, 0);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-02-02" as "Feb 2, 2026", the same in every language setting. */
function longDate(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

function termStatus(t: Term, today: string): string {
  if (t.is_active) return 'Current';
  return t.end_date < today ? 'Closed' : 'Upcoming';
}

function yearRows(terms: readonly Term[], today: string): Row[] {
  const byYear = new Map<string, Term[]>();
  for (const t of terms) byYear.set(t.start_date.slice(0, 4), [...(byYear.get(t.start_date.slice(0, 4)) ?? []), t]);
  return [...byYear.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([year, list], i) => {
      const start = list.map((t) => t.start_date).sort()[0];
      const end = list.map((t) => t.end_date).sort().at(-1) ?? start;
      const status = list.some((t) => t.is_active) ? 'Current' : end < today ? 'Closed' : 'Upcoming';
      return [String(i + 1), year, longDate(start), longDate(end), String(list.length), status];
    });
}

function subjectRows(programme: Programme | null): Row[] {
  const subjects = new Map<string, { name: string; first: string; last: string; firstGrade: number; lastGrade: number; core: boolean }>();
  for (const track of programme?.tracks ?? []) {
    for (const level of track.levels) {
      for (const c of level.classes) {
        for (const s of c.subjects) {
          const seen = subjects.get(s.code);
          if (!seen) {
            subjects.set(s.code, { name: s.name, first: c.name, last: c.name, firstGrade: c.grade, lastGrade: c.grade, core: s.compulsory });
            continue;
          }
          subjects.set(s.code, {
            ...seen,
            ...(c.grade < seen.firstGrade ? { first: c.name, firstGrade: c.grade } : {}),
            ...(c.grade > seen.lastGrade ? { last: c.name, lastGrade: c.grade } : {}),
            core: seen.core || s.compulsory,
          });
        }
      }
    }
  }
  return [...subjects.entries()]
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([code, s], i) => [String(i + 1), s.name, code, s.first === s.last ? s.first : `${s.first} – ${s.last}`, s.core ? 'Core' : 'Elective', 'Active']);
}

/** The Academics design's tables filled from the API; grading and competency stay empty until the API serves them. */
export function academicsData(input: AcademicsInput): AcademicsData {
  const today = localToday(input.today);
  const rows: Record<AcademicsKey, Row[]> = {
    campuses: [['1', input.school.name, input.school.country, input.school.level, String(input.learners), 'Active']],
    years: yearRows(input.terms, today),
    terms: [...input.terms]
      .sort((a, b) => a.start_date.localeCompare(b.start_date))
      .map((t, i) => [String(i + 1), t.name, t.start_date.slice(0, 4), longDate(t.start_date), longDate(t.end_date), termStatus(t, today)]),
    streams: classesByLevel(input.classes, input.levels).map((g, i) => [
      String(i + 1),
      g.name,
      g.classes.map((c) => c.title).join(', '),
      String(g.classes.reduce((n, c) => n + (input.classLearners.get(c.id) ?? 0), 0)),
      'Active',
    ]),
    subjects: subjectRows(input.programme),
    grading: [],
    competency: [],
  };
  const counts = Object.fromEntries(Object.entries(rows).map(([k, r]) => [k, r.length])) as Record<AcademicsKey, number>;
  return { rows, counts, matrices: matrixCount(input.programme, input.school.level) };
}
