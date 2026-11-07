/**
 * Vector stand-ins for the icon images cropped from the reference
 * screenshots. Those crops are raster and look soft or pixelated, so the
 * shared Image (components/picture.tsx) draws the Lucide icon listed here, in
 * a soft tile of the same size, wherever a page shows one of them.
 *
 * Photographs, book covers, video stills, faces, crests and payment or
 * sign-in brand logos are real image content and are not listed.
 */
import type { IconName } from '@/lib/icons';

import { photos } from './photos';

/** Tile colour family: blue unless the icon carries a status or a category. */
export type ArtTone = 'blue' | 'green' | 'amber' | 'red' | 'teal' | 'slate';

export interface IconArt {
  icon: IconName;
  tone: ArtTone;
}

/** A bundled asset: a number on phones, an object on the web. */
type Asset = unknown;
type Entry = readonly [asset: Asset, icon: IconName, tone?: ArtTone];

const P = photos as unknown as Record<string, Record<string, Asset> & { blocks?: Record<string, Asset> }>;
const g = (group: string, key: string): Asset => P[group]?.[key];

const SUBJECTS: Record<string, [IconName, ArtTone]> = {
  maths: ['calculator', 'blue'],
  math: ['calculator', 'blue'],
  english: ['book', 'green'],
  science: ['flask', 'teal'],
  social: ['globe', 'amber'],
  ict: ['screen', 'blue'],
  life: ['leaf', 'green'],
  re: ['heart', 'slate'],
  languages: ['chat', 'teal'],
  exam: ['clipboard', 'red'],
};

const subjectEntries = (group: string, prefix: string): Entry[] =>
  Object.entries(SUBJECTS).map(([k, [icon, tone]]) => [g(group, `${prefix}${k}`), icon, tone] as const);

const ENTRIES: Entry[] = [
  // Subject tiles: dashboard, library, progress, live classes.
  ...subjectEntries('dashboard', 'subj-'),
  ...subjectEntries('library', 'subj-'),
  ...subjectEntries('progress', 'subj-'),
  [g('liveHub', 'icon-math'), 'calculator', 'blue'],
  [g('liveHub', 'icon-english'), 'book', 'green'],
  [g('liveHub', 'icon-science'), 'flask', 'teal'],
  [g('liveHub', 'icon-qa'), 'help', 'amber'],
  [g('liveHub', 'week-1'), 'screen', 'blue'],
  [g('liveHub', 'week-2'), 'doc', 'slate'],
  [g('liveHub', 'now'), 'live', 'red'],
  [g('liveHub', 'camp-1'), 'calculator', 'blue'],
  [g('liveHub', 'camp-2'), 'flask', 'teal'],

  // Learner dashboard stats, plan, assignments and activity.
  [g('dashboard', 'fire'), 'bolt', 'amber'],
  [g('dashboard', 'target'), 'target', 'blue'],
  [g('dashboard', 'trophy'), 'trophy', 'amber'],
  [g('dashboard', 'plan-1'), 'video', 'red'],
  [g('dashboard', 'plan-2'), 'calculator', 'blue'],
  [g('dashboard', 'plan-3'), 'book', 'green'],
  [g('dashboard', 'plan-4'), 'play', 'teal'],
  [g('dashboard', 'plan-5'), 'notes', 'amber'],
  [g('dashboard', 'assign-1'), 'clipboard', 'blue'],
  [g('dashboard', 'assign-2'), 'edit', 'green'],
  [g('dashboard', 'activity-1'), 'check', 'green'],
  [g('dashboard', 'activity-2'), 'star', 'amber'],
  [g('dashboard', 'activity-3'), 'video', 'blue'],

  // Learner home (sidebar layout): quick actions, results, goals, badges.
  [g('learnerHome', 'qa-1'), 'playFill', 'blue'],
  [g('learnerHome', 'qa-2'), 'clipboard', 'blue'],
  [g('learnerHome', 'qa-3'), 'video', 'red'],
  [g('learnerHome', 'qa-4'), 'notes', 'amber'],
  [g('learnerHome', 'qa-5'), 'book', 'green'],
  [g('learnerHome', 'qa-6'), 'chart', 'teal'],
  [g('learnerHome', 'qa-7'), 'award', 'amber'],
  [g('learnerHome', 'qa-8'), 'library', 'blue'],
  [g('learnerHome', 'qa-9'), 'bulb', 'teal'],
  [g('learnerHome', 'res-1'), 'calculator', 'blue'],
  [g('learnerHome', 'res-2'), 'book', 'green'],
  [g('learnerHome', 'res-3'), 'flask', 'teal'],
  [g('learnerHome', 'res-4'), 'globe', 'amber'],
  [g('learnerHome', 'goal-1'), 'target', 'blue'],
  [g('learnerHome', 'goal-2'), 'book', 'green'],
  [g('learnerHome', 'goal-3'), 'flask', 'teal'],
  [g('learnerHome', 'badge-1'), 'book', 'blue'],
  [g('learnerHome', 'badge-2'), 'star', 'amber'],
  [g('learnerHome', 'badge-3'), 'heart', 'red'],
  [g('learnerHome', 'badge-4'), 'bolt', 'amber'],
  [g('learnerHome', 'crown'), 'crown', 'amber'],
  [g('learnerHome', 'crownsmall'), 'crown', 'amber'],
  [g('learnerHome', 'fire'), 'bolt', 'amber'],
  [g('learnerHome', 'gift'), 'gift', 'blue'],
  [g('learnerHome', 'levelbadge'), 'award', 'blue'],

  // Course overview: stats, modules, files, badges.
  [g('courseOverview', 'stat-ends'), 'calendar', 'blue'],
  [g('courseOverview', 'stat-lessons'), 'play', 'blue'],
  [g('courseOverview', 'stat-time'), 'clock', 'blue'],
  [g('courseOverview', 'stat-trophy'), 'trophy', 'amber'],
  [g('courseOverview', 'subject'), 'calculator', 'blue'],
  [g('courseOverview', 'module-1'), 'layers', 'blue'],
  [g('courseOverview', 'module-2'), 'layers', 'blue'],
  [g('courseOverview', 'module-3'), 'plus', 'blue'],
  [g('courseOverview', 'module-4'), 'percent', 'blue'],
  [g('courseOverview', 'module-5'), 'calculator', 'blue'],
  [g('courseOverview', 'module-6'), 'bulb', 'blue'],
  [g('courseOverview', 'file-1'), 'doc', 'red'],
  [g('courseOverview', 'file-2'), 'notes', 'blue'],
  [g('courseOverview', 'file-3'), 'clipboard', 'green'],
  [g('courseOverview', 'file-4'), 'bulb', 'amber'],
  [g('courseOverview', 'badge-1'), 'bolt', 'amber'],
  [g('courseOverview', 'badge-2'), 'rocket', 'blue'],
  [g('courseOverview', 'badge-3'), 'trophy', 'amber'],

  // Progress page: badges, trophy, milestone.
  [g('progress', 'badge-1'), 'award', 'blue'],
  [g('progress', 'badge-2'), 'bolt', 'amber'],
  [g('progress', 'badge-3'), 'trophy', 'amber'],
  [g('progress', 'badge-4'), 'book', 'green'],
  [g('progress', 'trophy'), 'trophy', 'amber'],
  [g('progress', 'milestone'), 'flag', 'blue'],

  // Library shelves.
  [g('library', 'my-1'), 'library', 'blue'],
  [g('library', 'my-2'), 'bookmarkOn', 'amber'],
  [g('library', 'my-3'), 'notes', 'green'],
  [g('library', 'my-4'), 'clock', 'slate'],

  // Projects: stats, files, RACE, sections, competencies.
  [g('projects', 'stat-1'), 'folder', 'blue'],
  [g('projects', 'stat-2'), 'check', 'green'],
  [g('projects', 'stat-3'), 'sync', 'blue'],
  [g('projects', 'stat-4'), 'calendar', 'slate'],
  [g('projects', 'stat-5'), 'alert', 'amber'],
  [g('projects', 'att-pdf'), 'doc', 'red'],
  [g('projects', 'att-docx'), 'doc', 'blue'],
  [g('projects', 'att-video'), 'video', 'teal'],
  [g('projects', 'att-more'), 'folder', 'slate'],
  [g('projects', 'page'), 'doc', 'blue'],
  [g('projects', 'subject'), 'leaf', 'green'],
  [g('projects', 'race-r'), 'target', 'blue'],
  [g('projects', 'race-a'), 'tick', 'green'],
  [g('projects', 'race-c'), 'layers', 'teal'],
  [g('projects', 'race-e'), 'star', 'amber'],
  [g('projects', 'sec-kusva'), 'book', 'blue'],
  [g('projects', 'sec-skills'), 'bulb', 'teal'],
  [g('projects', 'sec-profile'), 'person', 'green'],
  [g('projects', 'comp-1'), 'book', 'blue'],
  [g('projects', 'comp-2'), 'settings', 'blue'],
  [g('projects', 'comp-3'), 'heart', 'blue'],
  [g('projects', 'comp-4'), 'bulb', 'teal'],
  [g('projects', 'comp-5'), 'sparkle', 'teal'],
  [g('projects', 'comp-6'), 'chat', 'teal'],
  [g('projects', 'comp-7'), 'people', 'teal'],
  [g('projects', 'comp-8'), 'calculator', 'teal'],
  [g('projects', 'comp-9'), 'smile', 'green'],
  [g('projects', 'comp-10'), 'flag', 'green'],
  [g('projects', 'comp-11'), 'cap', 'green'],
  [g('projects', 'comp-12'), 'people', 'green'],

  // Study squad.
  [g('squadRoom', 'act-questions'), 'help', 'blue'],
  [g('squadRoom', 'act-sessions'), 'video', 'teal'],
  [g('squadRoom', 'act-resources'), 'folder', 'amber'],
  [g('squadRoom', 'act-messages'), 'chat', 'green'],
  [g('squadRoom', 'cal-1'), 'calendar', 'blue'],
  [g('squadRoom', 'cal-2'), 'calendar', 'blue'],
  [g('squadRoom', 'cal-head'), 'calendar', 'blue'],
  [g('squadRoom', 'res-head'), 'folder', 'blue'],
  [g('squadRoom', 'res-pdf'), 'doc', 'red'],
  [g('squadRoom', 'res-video'), 'video', 'teal'],
  [g('squadRoom', 'res-link'), 'link', 'blue'],
  [g('squadRoom', 'res-sheet'), 'grid', 'green'],
  [g('squadRoom', 'chat'), 'chat', 'blue'],
  [g('squadRoom', 'crown'), 'crown', 'amber'],
  [g('squadRoom', 'flame'), 'bolt', 'amber'],
  [g('squadRoom', 'medal'), 'award', 'amber'],
  [g('squadRoom', 'target'), 'target', 'blue'],
  [g('squadRoom', 'trophy'), 'trophy', 'amber'],

  // Assignment workspace and feedback.
  [g('work', 'file-text'), 'doc', 'blue'],
  [g('work', 'file-image'), 'image', 'teal'],
  [g('work', 'file-video'), 'video', 'red'],
  [g('work', 'res-chat'), 'chat', 'blue'],
  [g('work', 'res-guide'), 'clipboard', 'green'],
  [g('work', 'res-pdf'), 'doc', 'red'],
  [g('work', 'res-video'), 'play', 'teal'],
  [g('feedback', 'next-chat'), 'chat', 'blue'],
  [g('feedback', 'next-practice'), 'target', 'green'],
  [g('feedback', 'next-tutor'), 'headset', 'teal'],

  // Billing: plan tiers, wallet and purchases.
  [g('billing', 'basic'), 'book', 'slate'],
  [g('billing', 'pro'), 'bolt', 'blue'],
  [g('billing', 'premium'), 'crown', 'amber'],
  [g('billing', 'trophy'), 'trophy', 'amber'],
  [g('billing', 'wallet'), 'wallet', 'blue'],
  [g('billing', 'bolt'), 'bolt', 'blue'],
  [g('billing', 'gift'), 'gift', 'green'],
  [g('billing', 'buy-pass'), 'ticket', 'blue'],
  [g('billing', 'buy-credits'), 'clock', 'teal'],
  [g('billing', 'buy-credits-2'), 'clock', 'teal'],
  [g('billing', 'buy-bootcamp'), 'flask', 'teal'],
  [g('billing', 'buy-paper'), 'doc', 'slate'],

  // Course builder content blocks.
  ...(
    [
      ['video', 'video', 'red'],
      ['text', 'transcript', 'blue'],
      ['image', 'image', 'teal'],
      ['pdf', 'doc', 'red'],
      ['quiz', 'clipboard', 'green'],
      ['interactive', 'pointer', 'blue'],
      ['youtube', 'playFill', 'red'],
      ['drive', 'cloud', 'teal'],
      ['link', 'link', 'blue'],
      ['discussion', 'chat', 'amber'],
    ] as const
  ).map(([k, icon, tone]) => [P.courseBuilder?.blocks?.[k], icon, tone] as Entry),

  // Sign-up, sign-in and consent: trust, role and method icons (brand logos stay images).
  [g('signUp', 'learner'), 'cap', 'blue'],
  [g('signUp', 'parent'), 'people', 'green'],
  [g('signUp', 'teacher'), 'person', 'blue'],
  [g('signIn', 'parent'), 'people', 'green'],
  [g('signUp', 'people'), 'people', 'blue'],
  [g('signUp', 'school'), 'school', 'blue'],
  [g('signUp', 'heart'), 'heart', 'red'],
  [g('signUp', 'shield'), 'shield', 'green'],
  [g('signUp', 'promise-1'), 'shield', 'blue'],
  [g('signUp', 'promise-2'), 'lock', 'blue'],
  [g('signUp', 'promise-3'), 'people', 'blue'],
  [g('signUp', 'promise-4'), 'globe', 'blue'],
  [g('signIn', 'email'), 'mail', 'blue'],
  [g('signIn', 'passkey'), 'fingerprint', 'blue'],
  [g('signIn', 'phonePin'), 'phone', 'blue'],
  [g('guardianConsent', 'email'), 'mail', 'blue'],
  [g('guardianConsent', 'phone'), 'phone', 'blue'],
  [g('guardianConsent', 'header'), 'shield', 'blue'],
  [g('roles', 'icon-learner'), 'cap', 'blue'],
  [g('roles', 'icon-tutor'), 'person', 'teal'],
  [g('roles', 'icon-teacher'), 'people', 'blue'],
  [g('roles', 'icon-parent'), 'heart', 'green'],
  [g('studio', 'spark'), 'sparkle', 'blue'],
  [g('studio', 'robot'), 'sparkle', 'blue'],
  [(photos as unknown as { homeTrophy?: Asset }).homeTrophy, 'trophy', 'amber'],
];

/** Asset id → vector icon. Only assets that exist in this build are listed. */
export const iconArt: ReadonlyMap<Asset, IconArt> = new Map(
  ENTRIES.filter(([asset]) => asset !== undefined && asset !== null).map(([asset, icon, tone]) => [asset, { icon, tone: tone ?? 'blue' }]),
);
