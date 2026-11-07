import { type Href, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { DESIGN_DATA } from '@/lib/mock';
import { useCanOpen } from '@/lib/access/use-role';
import { activeKey, navFor, onlyAllowed, tabBar } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';
import { openMenuPage } from '@/lib/menu-nav';

import { NavDrawer } from './LearnerChrome';

/** The phone menu: up to five sections along the bottom. */
export function TabBar() {
  const { theme, styles } = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { portal } = usePortal();
  const may = useCanOpen();
  const all = onlyAllowed(navFor(portal, DESIGN_DATA), may);
  const { tabs, more } = tabBar(all);
  const active = activeKey(all, pathname);
  const items = more ? [...tabs, { key: 'more', label: 'More', href: '/more', icon: 'more' as const }] : tabs;
  const moreActive = more && (pathname === '/more' || (active != null && !tabs.some((t) => t.key === active)));
  // More opens the whole menu as a drawer (the /more page stays for old links).
  const [drawer, setDrawer] = useState(false);

  return (
    <>
      <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]} accessibilityRole="tablist">
        {items.map((item) => {
          const selected = item.key === 'more' ? moreActive : item.key === active;
          const color = selected ? theme.accentText : theme.textMuted;
          return (
            <Pressable
              key={item.key}
              onPress={() => (item.key === 'more' ? setDrawer(true) : openMenuPage(item.href as Href))}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              // The name it's read by is the label it shows (WCAG 2.5.3).
              accessibilityLabel={item.short ?? item.label}>
              <View style={[styles.pill, selected && styles.pillOn]}>
                <Icon name={item.icon} size={22} color={color} />
              </View>
              <Text style={[styles.label, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {item.short ?? item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <NavDrawer open={drawer} onClose={() => setDrawer(false)} />
    </>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: t.backgroundElement,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.borderStrong,
      paddingTop: Spacing.two,
      paddingHorizontal: Spacing.one,
    },
    tab: { flex: 1, alignItems: 'center', gap: 2, minHeight: 48 },
    pill: { width: 56, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
    pillOn: { backgroundColor: t.accentSoft },
    // 11px so "Assignments" fits a fifth of a 375px phone; iOS and Android may shrink it a little more.
    label: { ...Type.caption, fontSize: 11 },
  });
}
