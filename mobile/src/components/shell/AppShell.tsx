import { type ReactNode, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ShellContext } from '@/components/ui';
import { Breakpoints, type Theme } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';

import { DesignOverlays } from './DesignOverlays';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';

/**
 * The signed-in frame: a sidebar beside the page on wide screens, a tab bar
 * under it on phones.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { styles } = useStyles(makeStyles);
  const { width } = useWindowDimensions();
  const wide = width >= Breakpoints.wide;
  const shell = useMemo(() => ({ inShell: true, wide }), [wide]);

  return (
    <ShellContext.Provider value={shell}>
      <View style={[styles.frame, wide && styles.frameWide]}>
        {wide ? <Sidebar /> : null}
        <View style={styles.content}>
          {children}
          <DesignOverlays />
        </View>
        {wide ? null : <TabBar />}
      </View>
    </ShellContext.Provider>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    frame: { flex: 1, backgroundColor: t.background },
    frameWide: { flexDirection: 'row' },
    content: { flex: 1, minWidth: 0 },
  });
}
