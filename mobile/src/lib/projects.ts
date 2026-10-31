/** Rules for the learner's Projects page: status counts, the overall competency identifier, filters and paging. */
import { type Identifier, identifierFor } from './cbc';

export type ProjectStatus = 'in_progress' | 'completed' | 'upcoming' | 'attention';

const STATUSES: readonly ProjectStatus[] = ['completed', 'in_progress', 'upcoming', 'attention'];

/** Rounds .5 to the nearest even number (37.5 → 38, 12.5 → 12). */
function roundHalfEven(n: number): number {
  const floor = Math.floor(n);
  if (Math.abs(n - floor - 0.5) > 1e-9) return Math.round(n);
  return floor % 2 === 0 ? floor : floor + 1;
}

export function projectStats(projects: readonly { status: ProjectStatus }[]): { total: number } & Record<ProjectStatus, { count: number; percent: number }> {
  const total = projects.length;
  const entry = (s: ProjectStatus) => {
    const count = projects.filter((p) => p.status === s).length;
    return { count, percent: total === 0 ? 0 : roundHalfEven((count / total) * 100) };
  };
  return { total, ...(Object.fromEntries(STATUSES.map((s) => [s, entry(s)])) as Record<ProjectStatus, { count: number; percent: number }>) };
}

/** The overall identifier: the mean of the competency identifiers on the 1–3 scale. */
export function overallIdentifier(ids: readonly number[]): Identifier {
  return identifierFor(
    ids.reduce((s, x) => s + x, 0),
    ids.length * 3,
  );
}

export function filterProjects<T extends { status: ProjectStatus; subject: string; title: string }>(projects: readonly T[], f: { status?: ProjectStatus; subject?: string; query?: string }): T[] {
  const q = f.query?.trim().toLowerCase();
  return projects.filter((p) => (!f.status || p.status === f.status) && (!f.subject || p.subject === f.subject) && (!q || p.title.toLowerCase().includes(q)));
}

export function pageOf<T>(items: readonly T[], page: number, size: number): { items: T[]; pages: number; from: number; to: number; total: number } {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const start = (Math.min(page, pages) - 1) * size;
  const slice = items.slice(start, start + size);
  return { items: slice, pages, from: slice.length ? start + 1 : 0, to: start + slice.length, total: items.length };
}
