/// <reference types="node" />
import fs from 'fs';
import path from 'path';

import { ICON_NAMES } from './icons';
import { FOOTER_COLUMNS, footerPath, hasSiteFooter, LEGAL_LINKS, storeLink, validEmail } from './public-footer';

const APP = path.join(__dirname, '..', 'app');

/** True when Expo Router has a screen file for this path, public or signed in. */
function hasRoute(route: string): boolean {
  const rel = route.replace(/^\//, '');
  return ['', '(app)'].some((group) => [`${rel}.tsx`, path.join(rel, 'index.tsx')].some((f) => fs.existsSync(path.join(APP, group, f))));
}

const ALL = [...FOOTER_COLUMNS.flatMap((c) => c.links), ...LEGAL_LINKS];

describe('the site footer', () => {
  it('has the design’s four columns, each with an icon per link', () => {
    expect(FOOTER_COLUMNS.map((c) => c.title)).toEqual(['Platform', 'Support', 'Resources', 'Company']);
    FOOTER_COLUMNS.flatMap((c) => c.links).forEach((l) => expect(ICON_NAMES).toContain(l.icon));
  });

  it('only links to pages that exist', () => {
    expect(ALL.filter((l) => !hasRoute(footerPath(l.href))).map((l) => l.label)).toEqual([]);
  });

  it('reads the page out of a link with search params', () => {
    expect(footerPath({ pathname: '/explore', params: { kind: 'live' } })).toBe('/explore');
    expect(footerPath('/terms')).toBe('/terms');
  });

  it('uses a store link only when one is set', () => {
    expect(storeLink('https://apps.apple.com/app/id123')).toBe('https://apps.apple.com/app/id123');
    expect(storeLink('  ')).toBeNull();
    expect(storeLink(undefined)).toBeNull();
    expect(storeLink('javascript:alert(1)')).toBeNull();
  });

  it('shows on ordinary pages but not in live rooms, the classroom or the book reader', () => {
    expect(hasSiteFooter('/welcome')).toBe(true);
    expect(hasSiteFooter('/plans')).toBe(true);
    expect(hasSiteFooter('/learn/library')).toBe(true);
    expect(hasSiteFooter('/teach/host')).toBe(false);
    expect(hasSiteFooter('/teach/live-host/42')).toBe(false);
    expect(hasSiteFooter('/learn/live-room')).toBe(false);
    expect(hasSiteFooter('/classroom/p7-maths')).toBe(false);
    expect(hasSiteFooter('/learn/library/7')).toBe(false);
    expect(hasSiteFooter('/admin/scan')).toBe(false);
  });

  it('accepts a plain email address for the newsletter', () => {
    expect(validEmail(' grace@example.com ')).toBe(true);
    expect(validEmail('grace@')).toBe(false);
    expect(validEmail('')).toBe(false);
  });
});
