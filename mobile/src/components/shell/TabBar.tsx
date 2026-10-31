import { type Href, router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { MOCK_DATA } from '@/lib/mock';
import { activeKey, navFor, tabBar } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';

/** The phone menu: up to five sections along the bottom. */
export function TabBar() {
  const { theme, styles } = useStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { portal } = usePortal();
  const all = navFor(portal, MOCK_DATA);
  const { tabs, more } = tabBar(all);
  const active = activeKey(all, pathname);
  const items = more ? [...tabs, { key: 'more', label: 'More', href: '/more', icon: 'more' as const }] : tabs;
  const moreActive = more && (pathname === '/more' || (active != null && !tabs.some((t) => t.key === active)));

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]} accessibilityRole="tablist">
      {items.map((item) => {
        const selected = item.key === 'more' ? moreActive : item.key === active;
        const color = selected ? theme.accentText : theme.textMuted;
        return (
          <Pressable
            key={item.key}
            onPress={() => router.navigate(item.href as Href)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={item.label}>
            <View style={[styles.pill, selected && styles.pillOn]}>
              <Icon name={item.icon} size={22} color={color} />
            </View>
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
    label: { ...Type.caption, fontSize: 12 },
  });
}
