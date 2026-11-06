import { Colors } from '@/constants/theme';

/**
 * Maple is drawn light everywhere for now: its designed pages are light-only, and following a
 * phone or computer in dark mode painted the navigator black between those light pages.
 * Set this to follow the device again once the dark theme has been designed for every page.
 */
export const APP_SCHEME: 'light' | 'dark' = 'light';

interface NavTheme {
  dark: boolean;
  colors: object;
}

/** The navigator's theme in Maple's colours, so the space shown while a page opens is the page colour. */
export function mapleNavTheme<T extends NavTheme>(base: T): T {
  const c = Colors.light;
  return {
    ...base,
    dark: false,
    colors: { ...base.colors, primary: c.accent, background: c.background, card: c.background, text: c.text, border: c.border },
  };
}
