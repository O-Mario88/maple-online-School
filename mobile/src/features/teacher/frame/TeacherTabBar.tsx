import { type Href, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import { openMenuPage } from '@/lib/menu-nav';

import { BLUE, LINE, MUTED } from './TeacherParts';
import { Maple } from '@/constants/maple';

const TABS: readonly { label: string; icon: IconName; href: Href }[] = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'Classes', icon: 'book', href: '/learn/live' },
  { label: 'Students', icon: 'people', href: '/teach/learners' as Href },
  { label: 'Assignments', icon: 'clipboard', href: '/teach/assignments/new' as Href },
  { label: 'More', icon: 'more', href: '/more' },
];

const STUDIO: (typeof TABS)[number] = { label: 'Studio', icon: 'sparkle', href: '/teach/studio' };
const CALENDAR: (typeof TABS)[number] = { label: 'Calendar', icon: 'calendar', href: '/teach/calendar' };

/** The teacher references' white phone tab bar; in the studio, course builder and calendar the fourth tab matches those references. */
export function TeacherTabBar() {
  const insets = useSafeAreaInsets();
  const path = usePathname();
  const studio = path === '/teach/studio' || path === '/teach/course-editor';
  const calendar = path === '/teach/calendar' || path === '/teach/new-session';
  const tabs = studio
    ? TABS.map((t, i) => (i === 3 ? STUDIO : t))
    : calendar
      ? TABS.map((t, i) => (i === 3 ? CALENDAR : t))
      : TABS;
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.href === path || (t === STUDIO && studio) || (t === CALENDAR && calendar);
        const color = on ? BLUE : MUTED;
        return (
          <Pressable key={t.label} style={styles.tab} onPress={() => openMenuPage(t.href)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t.label}>
            <Icon name={t.icon} size={22} color={color} />
            <Text style={[styles.label, { color }, on && styles.labelOn]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', paddingTop: 8, backgroundColor: Maple.surface, borderTopWidth: 1, borderColor: LINE },
  tab: { flex: 1, alignItems: 'center', gap: 3, minHeight: 48 },
  label: { fontSize: 11 },
  labelOn: { fontWeight: '600' },
});
