/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */
import { createContext, createElement, type ReactNode, useContext } from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Scheme = 'light' | 'dark';

const SchemeOverride = createContext<Scheme | null>(null);

/** Pins everything inside to the light theme: the public site is light-only, as in the reference designs. */
export function LightOnly({ children }: { children: ReactNode }) {
  return createElement(SchemeOverride.Provider, { value: 'light' }, children);
}

export function useTheme() {
  const override = useContext(SchemeOverride);
  const scheme = useColorScheme();
  const theme: Scheme = override ?? (scheme === 'dark' ? 'dark' : 'light');

  return Colors[theme];
}
