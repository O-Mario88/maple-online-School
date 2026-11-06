import { Platform } from 'react-native';

import { Categorical, Maple } from '@/constants/maple';

/**
 * The public site's palette, taken from the homepage reference: a bright,
 * light marketing look with Maple blue. The public site is light-only by
 * design; the signed-in app keeps its own themed tokens.
 */
export const Brand = {
  blue: Maple.blue,
  blueDeep: Maple.blueHover,
  blueSoft: Maple.blueSoft,
  ink: Maple.navy,
  body: Maple.body,
  muted: Maple.secondary,
  line: Maple.border,
  surface: Maple.surface,
  canvas: Maple.canvas,
  live: Maple.error,
  liveSoft: Maple.errorSoft,
  green: Maple.success,
  greenSoft: Maple.successSoft,
  amber: Maple.warning,
  amberSoft: Maple.warningSoft,
  /** Was purple; Maple has one accent, so this tint is now a quiet teal for categories. */
  purple: Categorical.teal,
  purpleSoft: '#E6F4F2',
  sticky: '#FFE873',
  leaf: Maple.error,
  video: Maple.navy,
} as const;

export type Tint = 'green' | 'blue' | 'amber' | 'purple';

export const TINTS: Readonly<Record<Tint, { fg: string; bg: string }>> = {
  green: { fg: Brand.green, bg: Brand.greenSoft },
  blue: { fg: Brand.blue, bg: Brand.blueSoft },
  amber: { fg: Brand.amber, bg: Brand.amberSoft },
  purple: { fg: Brand.purple, bg: Brand.purpleSoft },
};

/** Hero background: white to a soft Maple blue (no lavender). */
export const HERO_GRADIENT = [Maple.surface, Maple.blueSoft, Maple.blueSelected] as const;

/** The soft card shadow the reference designs use instead of outlines. */
export const CARD_SHADOW = Platform.select({
  web: { boxShadow: '0 6px 24px rgba(15, 35, 80, 0.07)' },
  default: { shadowColor: '#0F2350', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
});

/** Width at which the public pages switch to two columns. */
export const PUBLIC_WIDE = 1024;
