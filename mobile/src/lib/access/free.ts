/**
 * The free plan: what opens once the free month is over and nothing is paid, and what every
 * paid plan includes too. Each month: five video lessons, one live class and ten past papers,
 * whichever the learner chooses; and every book in the Digital Library, with no limit.
 * Something already opened this month opens again. People on the free plan see ads.
 */

/** How many of each the free plan opens a month. */
export const FREE_LIMITS = { lesson: 5, live: 1, paper: 10 } as const;
export type FreeKind = keyof typeof FREE_LIMITS;

/** What a learner has opened on the free plan this month, by id. */
export interface FreeUse {
  /** YYYY-MM. */
  month: string;
  lesson: readonly string[];
  live: readonly string[];
  paper: readonly string[];
}

const BOOK = '/learn/library/';
const KINDS: Readonly<Record<string, FreeKind>> = { '/learn/lesson': 'lesson', '/learn/live-room': 'live', '/learn/paper': 'paper' };

export const noFreeUse = (month: string): FreeUse => ({ month, lesson: [], live: [], paper: [] });

/** The month a day falls in ("2026-11-03" → "2026-11"). */
export const monthOf = (day: string) => day.slice(0, 7);

/** This month's use: last month's counts start again. */
const current = (use: FreeUse, month: string): FreeUse => (use.month === month ? use : noFreeUse(month));

/** A page that names nothing counts as one item of its kind. */
const keyOf = (kind: FreeKind, id: string | undefined) => id ?? `${kind}:default`;

export function freeLeft(kind: FreeKind, use: FreeUse, month: string): number {
  return Math.max(0, FREE_LIMITS[kind] - current(use, month)[kind].length);
}

/** Whether the free plan opens this page (with the id it opens, if any) this month. */
export function freeAllows(path: string, id: string | undefined, use: FreeUse, month: string): boolean {
  if (path.startsWith(BOOK)) return true;
  const kind = KINDS[path];
  if (!kind) return false;
  const now = current(use, month);
  return now[kind].includes(keyOf(kind, id)) || now[kind].length < FREE_LIMITS[kind];
}

/** The use after opening a page: it counts once, and only while the allowance lasts. */
export function recordFree(path: string, id: string | undefined, use: FreeUse, month: string): FreeUse {
  const kind = KINDS[path];
  const now = current(use, month);
  if (!kind) return now;
  const key = keyOf(kind, id);
  if (now[kind].includes(key) || now[kind].length >= FREE_LIMITS[kind]) return now;
  return { ...now, [kind]: [...now[kind], key] };
}
