import type { IconName } from '@/lib/icons';

/** Career Compass sections, in the desktop reference's sidebar order. The key is the page's `?tab=`; `nav` fits the sidebar. */
export const COMPASS_SECTIONS = [
  { key: 'home', label: 'Home', nav: 'Home', short: 'Home', icon: 'home' },
  { key: 'interests', label: 'Interests & Strengths', nav: 'Interests', short: 'Interests', icon: 'heart' },
  { key: 'explorer', label: 'Career Explorer', nav: 'Career Explorer', short: 'Explore', icon: 'search' },
  { key: 'counselor', label: 'Counselor & Sessions', nav: 'Counselor', short: 'Counselor', icon: 'headset' },
  { key: 'programs', label: 'Universities & Programs', nav: 'Universities', short: 'Programs', icon: 'cap' },
  { key: 'scholarships', label: 'Scholarships', nav: 'Scholarships', short: 'Scholarships', icon: 'award' },
  { key: 'applications', label: 'Application Planner', nav: 'Applications', short: 'Applications', icon: 'clipboard' },
  { key: 'events', label: 'Career Events', nav: 'Career Events', short: 'Events', icon: 'calendar' },
  { key: 'communities', label: 'Communities', nav: 'Communities', short: 'Communities', icon: 'people' },
] as const satisfies readonly { key: string; label: string; nav: string; short: string; icon: IconName }[];

export type CompassSection = (typeof COMPASS_SECTIONS)[number]['key'];

export const isCompassSection = (v: unknown): v is CompassSection => COMPASS_SECTIONS.some((x) => x.key === v);
export const compassHref = (key: CompassSection) => (key === 'home' ? '/learn/careers' : `/learn/careers?tab=${key}`);
