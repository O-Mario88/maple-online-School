/**
 * The site footer's content: its columns, the legal links and where the app store buttons go.
 * Every link goes to a page that exists (tested). Links whose own page isn't built yet go to the
 * closest one that is, and say so in `until`.
 */
import type { Href } from 'expo-router';

import type { IconName } from './icons';

export interface FooterLink {
  label: string;
  href: Href;
  icon: IconName;
  /** The page this link should get of its own; until then it opens `href`. */
  until?: string;
}

export const FOOTER_COLUMNS: readonly { title: string; links: readonly FooterLink[] }[] = [
  {
    title: 'Platform',
    links: [
      { label: 'My Plan', href: '/learn/plan', icon: 'cap' },
      { label: 'Subjects', href: '/explore', icon: 'book' },
      { label: 'Videos', href: '/learn/lessons', icon: 'play' },
      { label: 'Assignments', href: '/learn/assignments', icon: 'calendar' },
      { label: 'Progress', href: '/learn/progress', icon: 'chart' },
      { label: 'Library', href: '/learn/library', icon: 'library' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help', icon: 'help' },
      { label: 'Contact Support', href: '/help', icon: 'chat', until: 'a contact form' },
      { label: 'FAQs', href: '/help', icon: 'doc', until: 'an FAQ page' },
      { label: 'Student Guides', href: '/help', icon: 'cap', until: 'student guides' },
      { label: 'Parent Guides', href: '/help', icon: 'people', until: 'parent guides' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Learning Resources', href: '/learn/library', icon: 'book' },
      { label: 'Study Tips', href: '/shorts', icon: 'sparkle', until: 'a study tips page' },
      { label: 'Policies', href: '/terms', icon: 'doc' },
      { label: 'Downloads', href: '/learn/library', icon: 'download', until: 'a downloads page' },
      { label: 'Announcements', href: '/digest', icon: 'megaphone' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Maple', href: '/about', icon: 'info' },
      { label: 'Our Educators', href: '/teachers', icon: 'people' },
      { label: 'Careers', href: '/about', icon: 'briefcase', until: 'a careers page' },
      { label: 'News & Updates', href: '/digest', icon: 'notes' },
    ],
  },
];

/** The bottom bar's links after the copyright. */
export const LEGAL_LINKS: readonly FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy', icon: 'lock' },
  { label: 'Terms of Service', href: '/terms', icon: 'doc' },
  { label: 'Cookie Settings', href: '/privacy', icon: 'settings', until: 'cookie settings' },
  { label: 'Accessibility', href: '/help', icon: 'eye', until: 'an accessibility statement' },
];

/** The page a link opens, without its search params. */
export function footerPath(href: Href): string {
  return typeof href === 'string' ? href.split('?')[0] : String(href.pathname);
}

/** A store page link from config, or null when none is set (or it isn't a web link). */
export function storeLink(value: string | undefined): string | null {
  const v = value?.trim() ?? '';
  return /^https:\/\//.test(v) ? v : null;
}

/** The App Store and Google Play pages, set per deployment (EXPO_PUBLIC_APP_STORE_URL and EXPO_PUBLIC_PLAY_STORE_URL). */
export const STORE_LINKS = {
  appStore: storeLink(process.env.EXPO_PUBLIC_APP_STORE_URL),
  playStore: storeLink(process.env.EXPO_PUBLIC_PLAY_STORE_URL),
} as const;

/** Maple's social profiles, set per deployment; a network shows in the footer only once its link is set. */
export const SOCIAL_LINKS = {
  linkedin: storeLink(process.env.EXPO_PUBLIC_LINKEDIN_URL),
  youtube: storeLink(process.env.EXPO_PUBLIC_YOUTUBE_URL),
  instagram: storeLink(process.env.EXPO_PUBLIC_INSTAGRAM_URL),
  facebook: storeLink(process.env.EXPO_PUBLIC_FACEBOOK_URL),
} as const;

/** Full-screen rooms (live classes, the host console, the classroom), the gate QR scanner and the book reader have no footer. */
const NO_FOOTER_PATHS: readonly string[] = ['/teach/host', '/learn/live-room', '/admin/scan'];
const NO_FOOTER_PREFIXES: readonly string[] = ['/teach/live-host/', '/classroom/', '/learn/library/'];

export function hasSiteFooter(path: string): boolean {
  return !NO_FOOTER_PATHS.includes(path) && !NO_FOOTER_PREFIXES.some((p) => path.startsWith(p));
}

export function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
