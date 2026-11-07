/**
 * Maple's design tokens: colour (light and dark), type, spacing, radius and
 * elevation. Screens and components take every value from here.
 */
import '@/global.css';

import { Platform } from 'react-native';

import { Maple, Radii } from '@/constants/maple';

// The light theme is the Maple Design System palette (constants/maple.ts).
// Text on every background meets WCAG AA in both themes.
export const Colors = {
  light: {
    text: Maple.navy,
    textSecondary: Maple.body,
    textMuted: Maple.secondary,
    background: Maple.canvas,
    backgroundElement: Maple.surface,
    backgroundSelected: Maple.blueSelected,
    border: Maple.border,
    borderStrong: Maple.borderStrong,
    accent: Maple.blue,
    accentHover: Maple.blueHover,
    accentSoft: Maple.blueSoft,
    accentText: Maple.blueText,
    onAccent: Maple.white,
    danger: Maple.error,
    dangerSoft: Maple.errorSoft,
    success: Maple.successText,
    successSoft: Maple.successSoft,
    warning: Maple.warningText,
    warningSoft: Maple.warningSoft,
    info: Maple.blueText,
    infoSoft: Maple.blueSoft,
    sidebar: Maple.surface,
    sidebarElement: Maple.blueSelected,
    sidebarText: Maple.navy,
    sidebarMuted: Maple.secondary,
    focus: Maple.blue,
    overlay: Maple.overlay,
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
  ios: { sans: 'Inter', serif: 'ui-serif', rounded: 'ui-rounded', mono: 'ui-monospace' },
  default: { sans: 'Inter', serif: 'serif', rounded: 'normal', mono: 'monospace' },
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

/** Radii from the design system: `control` for buttons and inputs, never `pill` for a button. */
export const Radius = { sm: Radii.control, control: Radii.control, md: Radii.card, lg: Radii.panel, xl: 20, pill: Radii.pill } as const;

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
