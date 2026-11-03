/**
 * The palette of the parent and school-admin references (November 2026): deep navy headings,
 * blue-grey body text, one bright blue and a soft blue-white canvas. Light-only, like the
 * other reference pages.
 */
export const NAVY = '#111C4E';
export const TEXT = '#1F2A5C';
export const BODY = '#5A6890';
export const MUTED = '#8792B0';
export const BLUE = '#1463F3';
export const LINE = '#E3E9F4';
export const CANVAS = '#F2F6FC';
export const SOFT = '#F6F9FE';
export const SELECT = '#E8F1FF';
export const WHITE = '#FFFFFF';
export const RED = '#EF3B4D';
export const GREEN = '#16A34A';

export type Tone = 'blue' | 'red' | 'orange' | 'purple' | 'green' | 'grey';

/** Each tone's strong colour (icons, bars), its soft tint (tiles, pills) and its text colour. */
export const TONES: Readonly<Record<Tone, { solid: string; soft: string; text: string }>> = {
  blue: { solid: '#1E6BF0', soft: '#E8F0FE', text: '#1463F3' },
  red: { solid: '#F0394E', soft: '#FDEBEE', text: '#E0283E' },
  orange: { solid: '#F7A21B', soft: '#FFF4E2', text: '#D97F06' },
  purple: { solid: '#8B3CF0', soft: '#F2EBFE', text: '#7A2EE0' },
  green: { solid: '#22A55A', soft: '#E6F7EC', text: '#16A34A' },
  grey: { solid: '#8792B0', soft: '#EEF1F7', text: '#5A6890' },
};

/**
 * Desktop pages lay out at the window's width from this size up and scale down below it. The
 * references are about 1,180px wide with small type; this is that layout at 1.3×.
 */
export const DESK_MIN_WIDTH = 1536;
