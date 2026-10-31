import { usePathname } from 'expo-router';
import { type ReactNode, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ShellContext } from '@/components/ui';
import { Breakpoints, type Theme } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useMe } from '@/lib/auth/auth-context';
import { mockData } from '@/lib/mock';
import { usePortal } from '@/lib/portal-context';

import { DesignOverlays } from './DesignOverlays';
import { LearnerTopBar } from './LearnerTopBar';
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
  const { portal } = usePortal();
  const me = useMe();
  const path = usePathname();
  // The learner home, Projects and Library draw their own sidebar (their references); other learner pages use the top bar.
  const ownFrame = wide && portal === 'learner' && (path === '/' || path === '/learn/projects' || path === '/learn/library') && mockData() != null;
  const topBar = wide && portal === 'learner' && !ownFrame;
  const firstName = me.data?.full_name.split(' ')[0] ?? '';

  return (
    <ShellContext.Provider value={shell}>
      {topBar ? <LearnerTopBar name={firstName} /> : null}
      <View style={[styles.frame, wide && !topBar && !ownFrame && styles.frameWide]}>
        {wide && !topBar && !ownFrame ? <Sidebar /> : null}
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
