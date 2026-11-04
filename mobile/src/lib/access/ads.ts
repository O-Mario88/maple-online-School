/**
 * Ads on the free tier: visitors browsing free, and anyone whose free month has ended with
 * no plan, see them. The pages the free plan opens (the library and its books, lessons and
 * past papers) carry the bigger ad; other pages a slim one. None where people pay, sign in or
 * sit in a live class. Any plan takes them away.
 */
import type { Phase } from './trial';

export type AdKind = 'featured' | 'banner';

const FEATURED = ['/learn/library', '/learn/lesson', '/learn/paper'];
const AD_FREE = ['/plans', '/learn/billing', '/learn/account', '/sign-in', '/sign-up', '/checkout', '/learn/live-room'];

const under = (list: readonly string[], path: string) => list.some((p) => path === p || path.startsWith(`${p}/`));

export function adFor({ guest, phase, path }: { guest: boolean; phase: Phase | null; path: string }): AdKind | null {
  if (!guest && phase !== 'locked') return null;
  if (under(AD_FREE, path)) return null;
  return under(FEATURED, path) ? 'featured' : 'banner';
}

/** Which of the sample ads a page shows: the same one each visit, varying from page to page. */
export function adPick(path: string, count: number): number {
  let h = 0;
  for (const ch of path) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return count > 0 ? h % count : 0;
}
