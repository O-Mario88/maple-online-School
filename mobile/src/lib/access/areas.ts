/**
 * Which pages open a resource, per mode. Pages not listed are for seeing (the catalogue,
 * progress, school work, billing) and stay open whatever the plan; the listed ones are
 * Maple's content and lock when the free month ends and nothing is paid.
 */
import type { Portal } from '@/lib/navigation';

import type { Resource } from './trial';

export type Payer = 'learner' | 'teacher' | 'school';

const PAYERS: Readonly<Record<Portal, Payer | null>> = { learner: 'learner', teacher: 'teacher', school: 'school', parent: null, command: null };

/** Whose free month and plan a mode runs on; parents and Maple staff have none. */
export function payerFor(portal: Portal): Payer | null {
  return PAYERS[portal];
}

/** A page, or every page under it when it ends in "/". */
const LEARNER_OPENS = ['/learn/lesson', '/learn/paper', '/learn/library/', '/learn/shorts', '/copilot'];
/** Learner pages that need Pro or above: live classes and study squads. */
const LEARNER_PRO = ['/learn/live-room', '/learn/squads/'];
const TEACHER_TOOLS = ['/teach/studio', '/teach/course-editor', '/teach/library', '/teach/shorts', '/teach/new-session', '/teach/host', '/teach/live-host/'];
const SCHOOL_OPEN = ['/admin/settings', '/admin/onboarding'];
const COURSE = '/learn/course';

const matches = (list: readonly string[], path: string) => list.some((p) => (p.endsWith('/') ? path.startsWith(p) : path === p));

/**
 * The resource a page opens in a mode, or null when the page is always open.
 * A course page takes its source and price from the course opened (a marketplace course by default).
 */
export function resourceFor(path: string, portal: Portal, course?: Resource): Resource | null {
  const maple: Resource = { source: 'maple' };
  if (portal === 'learner') {
    if (path === COURSE) return course ?? { source: 'marketplace' };
    if (matches(LEARNER_PRO, path)) return { ...maple, needs: 'pro' };
    return matches(LEARNER_OPENS, path) ? maple : null;
  }
  if (portal === 'teacher') return matches(TEACHER_TOOLS, path) ? maple : null;
  if (portal === 'school') return path.startsWith('/admin/') && !SCHOOL_OPEN.includes(path) ? maple : null;
  return null;
}
