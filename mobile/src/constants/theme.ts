/**
 * Maple's design tokens: colour (light and dark), type, spacing, radius and
 * elevation. Screens and components take every value from here.
 */
import '@/global.css';

import { Platform } from 'react-native';

// Maple blue on cool, light neutrals, taken from the reference designs, with
// a white sidebar, and a soft and a strong shade of each status colour. Text
// on every background meets WCAG AA in both themes.
export const Colors = {
  light: {
    text: '#0B1424',
    textSecondary: '#3D4656',
    textMuted: '#636B7C',
    background: '#F5F7FC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF2FA',
    border: '#E3E8F2',
    borderStrong: '#C9D2E3',
    accent: '#1463F3',
    accentHover: '#0B4FD1',
    accentSoft: '#EAF1FF',
    accentText: '#0B4FD1',
    onAccent: '#FFFFFF',
    danger: '#C62828',
    dangerSoft: '#FDECEC',
    success: '#15803D',
    successSoft: '#E6F6EC',
    warning: '#8A5A00',
    warningSoft: '#FEF3DC',
    info: '#1F5FA8',
    infoSoft: '#E8F0FB',
    sidebar: '#FFFFFF',
    sidebarElement: '#EAF1FF',
    sidebarText: '#0B1424',
    sidebarMuted: '#636B7C',
    focus: '#1463F3',
    overlay: 'rgba(11, 20, 36, 0.45)',
  },
  dark: {
    text: '#EEF2FA',
    textSecondary: '#B6C0D4',
    textMuted: '#8892A8',
    background: '#0B1020',
    backgroundElement: '#121A2E',
    backgroundSelected: '#1A2440',
    border: '#24304D',
    borderStrong: '#36456A',
    accent: '#6EA0FF',
    accentHover: '#8DB4FF',
    accentSoft: '#14254A',
    accentText: '#9CBEFF',
    onAccent: '#0B1424',
    danger: '#F2B8B5',
    dangerSoft: '#3B1D1B',
    success: '#7DD3A6',
    successSoft: '#163024',
    warning: '#F2C46B',
    warningSoft: '#33280F',
    info: '#8DB8F0',
    infoSoft: '#16263B',
    sidebar: '#0E1528',
    sidebarElement: '#1A2440',
    sidebarText: '#EEF2FA',
    sidebarMuted: '#8892A8',
    focus: '#8DB4FF',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;
export type Theme = { readonly [K in ThemeColor]: string };

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'normal', serif: 'serif', rounded: 'normal', mono: 'monospace' },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** Type scale: size, line height and weight for each role. */
export const Type = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700', letterSpacing: -0.6 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700', letterSpacing: -0.4 },
  heading: { fontSize: 18, lineHeight: 26, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  metric: { fontSize: 28, lineHeight: 34, fontWeight: '700', letterSpacing: -0.5, fontVariant: ['tabular-nums'] },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 } as const;

/** Soft shadows; on Android, elevation does the same job. */
export const Elevation = {
  card: Platform.select({
    web: { boxShadow: '0 1px 2px rgba(26, 25, 23, 0.04), 0 1px 3px rgba(26, 25, 23, 0.06)' },
    default: { shadowColor: '#1A1917', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  }),
  raised: Platform.select({
    web: { boxShadow: '0 8px 24px rgba(26, 25, 23, 0.12)' },
    default: { shadowColor: '#1A1917', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  }),
} as const;

/** Width at which the app switches from the phone tab bar to the sidebar. */
export const Breakpoints = { wide: 960, extraWide: 1280 } as const;

export const SidebarWidth = 264;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 1160;
