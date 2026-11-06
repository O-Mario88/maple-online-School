/**
 * Which portal frame (top bar and sidebar) a page shows. A designed page draws its portal's frame
 * itself; every other page in that portal gets the same frame from the layout, so moving between
 * pages never swaps the shell.
 */
import { PRICING } from '@/lib/access/route';

export type FramePortal = 'school' | 'parent' | 'teacher';
export type PageFrame = FramePortal | 'learner';

/** Portals whose pages all share one designed frame. The learner's comes from the shell itself. */
const FRAMED_PORTALS: readonly string[] = ['school', 'parent', 'teacher'];

/** The parent pages that draw the parent frame themselves. */
export const PARENT_REF_PATHS: readonly string[] = ['/family/academics', '/family/settings', '/messages'];

/** Learner pages drawn from a reference, in the learner's own header and sidebar. */
const LEARNER_REF_PATHS: readonly string[] = [
  '/',
  '/learn/projects',
  '/learn/library',
  '/learn/live-room',
  '/learn/explore',
  '/learn/lessons',
  '/learn/plan',
  '/learn/schools',
  '/learn/apply',
  '/learn/careers',
];

/** Teacher pages that draw the teacher frame in any mode (a link can open one from another mode). */
const TEACHER_REF_PATHS: readonly string[] = ['/teach/studio', '/teach/course-editor', '/teach/calendar', '/teach/new-session', '/teach/host'];
const TEACHER_REF_PREFIXES: readonly string[] = [
  '/teach/live-host',
  '/teach/assignments',
  '/teach/attendance',
  '/teach/grading',
  '/teach/learners',
  '/teach/class-spaces',
  '/teach/storefront',
  '/teach/verification',
  '/teach/earnings',
  '/teach/library',
];

/** Full-screen pages: live rooms, the book reader and Pricing show no portal frame. */
const FULL_SCREEN_PATHS: readonly string[] = ['/teach/host', '/learn/live-room', PRICING];
const FULL_SCREEN_PREFIXES: readonly string[] = ['/teach/live-host/', '/learn/library/'];

/** Every school-admin page draws the school frame. */
export function isSchoolRefPath(path: string): boolean {
  return path.startsWith('/admin/');
}

/** Every Maple Command page draws the command frame, a school-admin frame. */
export function isCommandRefPath(path: string): boolean {
  return path.startsWith('/command/');
}

function isTeacherRefPath(path: string): boolean {
  return TEACHER_REF_PATHS.includes(path) || TEACHER_REF_PREFIXES.some((p) => path.startsWith(p));
}

/** The path a screen of the signed-in stack serves, from its route name and params. */
export function routePath(name: string, params?: Readonly<Record<string, unknown>>): string {
  const segments = name
    .split('/')
    .filter((s) => s !== 'index')
    .map((s) => {
      const key = /^\[(.+)\]$/.exec(s)?.[1];
      const value = key ? params?.[key] : undefined;
      return typeof value === 'string' || typeof value === 'number' ? String(value) : s;
    });
  return `/${segments.join('/')}`;
}

/** The frame this page draws itself in a design build, or null when it leaves the frame to the layout. */
export function ownFrame(portal: string, path: string): PageFrame | null {
  if (isSchoolRefPath(path) || isCommandRefPath(path) || (portal === 'school' && path === '/')) return 'school';
  if (isTeacherRefPath(path) || (portal === 'teacher' && path === '/')) return 'teacher';
  if (portal === 'parent' && (path === '/' || PARENT_REF_PATHS.includes(path))) return 'parent';
  if (portal === 'learner' && (LEARNER_REF_PATHS.includes(path) || path.startsWith('/learn/library/'))) return 'learner';
  return null;
}

/** The portal frame the layout draws around this page, or null when the page needs none from it. */
export function layoutFrame(portal: string, path: string): FramePortal | null {
  if (!FRAMED_PORTALS.includes(portal)) return null;
  if (FULL_SCREEN_PATHS.includes(path) || FULL_SCREEN_PREFIXES.some((p) => path.startsWith(p))) return null;
  if (ownFrame(portal, path) !== null) return null;
  return portal as FramePortal;
}

interface MenuLink {
  label: string;
  href: string;
}

/** The menu item to tint for this page: its own link, else the deepest link it sits under (never Home). */
export function activeLabel(items: readonly MenuLink[], path: string): string {
  const exact = items.find((i) => i.href === path);
  if (exact) return exact.label;
  const parents = items.filter((i) => i.href !== '/' && path.startsWith(`${i.href}/`));
  const deepest = parents.reduce<MenuLink | null>((best, i) => (best && best.href.length >= i.href.length ? best : i), null);
  return deepest?.label ?? '';
}
