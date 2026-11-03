/** Rules behind the shared curriculum templates that schools and teachers clone from. */

export interface Subject {
  name: string;
  category: string;
  /** "P1 – S6": the first and last grade it covers. */
  levels: string;
  resources: number;
  papers: number;
  active: boolean;
}

const PRIMARY = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];
const SECONDARY = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
const ALL_GRADES = [...PRIMARY, ...SECONDARY];

/** The grades a range like "P4 – S4" covers, in order. */
export function gradesIn(range: string): readonly string[] {
  const [from, to] = range.split(/\s*[–-]\s*/).map((s) => s.trim());
  const a = ALL_GRADES.indexOf(from);
  const b = ALL_GRADES.indexOf(to ?? from);
  if (a < 0 || b < 0) return [];
  return ALL_GRADES.slice(Math.min(a, b), Math.max(a, b) + 1);
}

/** Subjects matching the level ("Primary", "Secondary"), category and search text. */
export function filterSubjects<T extends Subject>(list: readonly T[], f: { level: string; category: string; query: string }): readonly T[] {
  const q = f.query.trim().toLowerCase();
  return list.filter((s) => {
    const grades = gradesIn(s.levels);
    const levelOk = f.level === 'All Levels' || (f.level === 'Primary' ? grades.some((g) => g.startsWith('P')) : grades.some((g) => g.startsWith('S')));
    return levelOk && (f.category === 'All Categories' || s.category === f.category) && (!q || s.name.toLowerCase().includes(q));
  });
}

/** Add a subject to a framework; names must be present and unique. */
export function addSubject<T extends Subject>(list: readonly T[], input: { name: string; category: string; levels: string }): { list: readonly T[]; error?: string } {
  const name = input.name.trim();
  if (!name) return { list, error: 'Give the subject a name.' };
  if (list.some((s) => s.name.toLowerCase() === name.toLowerCase())) return { list, error: `${name} is already in this framework.` };
  const added = { name, category: input.category, levels: input.levels, resources: 0, papers: 0, active: true } as T;
  return { list: [...list, added] };
}

export interface FrameworkRef {
  short: string;
  version: number;
  clones: number;
}

/** A school's own copy of a template. The template stays shared; the copy can be edited without touching it. */
export function cloneTemplate<T extends FrameworkRef>(f: T, school: string): { framework: T; copyName: string } {
  return { framework: { ...f, clones: f.clones + 1 }, copyName: `${school} – ${f.short} (v${f.version})` };
}
