import { useMemo } from 'react';

import type { Theme } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Builds a component's StyleSheet from the current theme, once per theme. */
export function useStyles<T>(make: (theme: Theme) => T): { theme: Theme; styles: T } {
  const theme = useTheme();
  const styles = useMemo(() => make(theme), [make, theme]);
  return { theme, styles };
}
