import { Categorical, Maple } from '@/constants/maple';
import { Palette } from '@/constants/palette';

/**
 * The palette of the parent and school-admin references (November 2026): deep navy headings,
 * blue-grey body text, one bright blue and a soft blue-white canvas. Light-only, like the
 * other reference pages.
 */
export const NAVY = Maple.navy;
export const TEXT = Maple.body;
export const BODY = Maple.secondary;
export const MUTED = Maple.muted;
export const BLUE = Maple.blue;
export const LINE = Maple.border;
export const CANVAS = Maple.canvas;
export const SOFT = Maple.subtle;
export const SELECT = Maple.blueSelected;
export const WHITE = Maple.surface;
export const RED = Maple.error;
export const GREEN = Maple.success;

export type Tone = 'blue' | 'red' | 'orange' | 'purple' | 'green' | 'grey';

/** Each tone's strong colour (icons, bars), its soft tint (tiles, pills) and its text colour. */
export const TONES: Readonly<Record<Tone, { solid: string; soft: string; text: string }>> = {
  blue: { solid: Maple.blue, soft: Maple.blueSoft, text: Maple.blueText },
  red: { solid: Maple.error, soft: Maple.errorSoft, text: Maple.errorText },
  orange: { solid: Maple.warning, soft: Maple.warningSoft, text: Maple.warningText },
  // Was purple: Maple has one accent, so this category tone is teal.
  purple: { solid: Categorical.teal, soft: Palette.teal100b, text: Palette.teal900 },
  green: { solid: Maple.success, soft: Maple.successSoft, text: Maple.successText },
  grey: { solid: Maple.muted, soft: Maple.blueSelected, text: Maple.secondary },
};

/**
 * Desktop pages lay out at the window's width from this size up and scale down below it. The
 * references are about 1,180px wide with small type; this is that layout at 1.3×.
 */
export const DESK_MIN_WIDTH = 1536;
