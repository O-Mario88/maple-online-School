/**
 * The public site's palette, taken from the homepage reference: a bright,
 * light marketing look with Maple blue. The public site is light-only by
 * design; the signed-in app keeps its own themed tokens.
 */
export const Brand = {
  blue: '#1463F3',
  blueDeep: '#0B4FD1',
  blueSoft: '#EAF1FF',
  ink: '#0B1424',
  body: '#3D4656',
  muted: '#6B7385',
  line: '#E3E8F2',
  surface: '#FFFFFF',
  canvas: '#F5F7FC',
  live: '#E5484D',
  liveSoft: '#FDECEC',
  green: '#16A34A',
  greenSoft: '#E6F6EC',
  amber: '#F59E0B',
  amberSoft: '#FEF3DC',
  purple: '#7C5CFF',
  purpleSoft: '#EFEBFF',
  sticky: '#FFE873',
  leaf: '#D7262F',
  video: '#1B2230',
} as const;

export type Tint = 'green' | 'blue' | 'amber' | 'purple';

export const TINTS: Readonly<Record<Tint, { fg: string; bg: string }>> = {
  green: { fg: Brand.green, bg: Brand.greenSoft },
  blue: { fg: Brand.blue, bg: Brand.blueSoft },
  amber: { fg: Brand.amber, bg: Brand.amberSoft },
  purple: { fg: Brand.purple, bg: Brand.purpleSoft },
};

/** Hero background: morning sky to lavender, as in the reference. */
export const HERO_GRADIENT = ['#FFFFFF', '#EEF3FF', '#E9E4FF'] as const;

/** Width at which the public pages switch to two columns. */
export const PUBLIC_WIDE = 1024;
