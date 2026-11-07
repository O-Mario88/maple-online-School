import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { DeskHost } from '@/features/portal/PortalFrame';
import { Bar } from '@/features/portal/PortalParts';
import { BLUE, BODY, CANVAS, LINE, NAVY, RED, TEXT, WHITE } from '@/features/portal/tokens';
import { initials } from '@/lib/school/admin-me';
import { useSwitcher } from '@/lib/switcher-context';
import type { NavItem } from '@/mock/portal';

const LEAF = require('@/assets/images/maple-leaf.png') as number;
const AVATAR = '#4B4FE0';

/** The full-height sidebar: logo, links (the current one solid blue) and the set-up progress card. */
function Side({ nav, active, progress }: { nav: readonly NavItem[]; active: string; progress: number }) {
  return (
    <View style={styles.side}>
      <Pressable style={styles.logo} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
        <Image source={LEAF} style={styles.leaf} contentFit="contain" />
        <View>
          <Text style={styles.brand}>Maple</Text>
          <Text style={styles.brandSub}>School Management</Text>
        </View>
      </Pressable>
      <View style={styles.nav} accessibilityRole="menu">
        {nav.map((n) => {
          const on = n.label === active;
          return (
            <Pressable
              key={n.label}
              style={({ hovered }) => [styles.item, on && styles.itemOn, hovered && !on && styles.itemHover]}
              onPress={() => router.push(n.href as never)}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: on }}
              accessibilityLabel={n.label}>
              <Icon name={n.icon} size={20} color={on ? WHITE : TEXT} />
              <Text style={[styles.itemText, on && styles.itemTextOn]}>{n.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.flex} />
      <View style={styles.setup}>
        <Icon name="book" size={34} color={BLUE} />
        <Text style={styles.setupTitle}>Academic Setup</Text>
        <Text style={styles.setupBody}>Set up your academic structure, grading, and learning framework.</Text>
        <Text style={styles.setupPct}>{`${progress}% Complete`}</Text>
        <Bar value={progress / 100} color={BLUE} height={6} style={styles.setupBar} />
      </View>
    </View>
  );
}

/** The top bar beside the sidebar: school switcher, search, alerts, help and the admin's initials. */
function Top({ school, name, notifications }: { school: string; name: string; notifications: number }) {
  const switcher = useSwitcher();
  return (
    <View style={styles.top}>
      <Pressable style={styles.school} onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${school}. Switch school`}>
        <Icon name="school" size={21} color={NAVY} />
        <Text style={styles.schoolName} numberOfLines={1}>
          {school}
        </Text>
        <Icon name="chevronDown" size={16} color={NAVY} />
      </Pressable>
      <View style={styles.flex} />
      <View style={styles.search}>
        <Icon name="search" size={19} color={NAVY} />
        <TextInput style={styles.searchInput} placeholder="Search students, classes, subjects..." placeholderTextColor={BODY} accessibilityLabel="Search" />
      </View>
      <View style={styles.flex} />
      <Pressable onPress={() => router.push('/inbox')} accessibilityRole="button" accessibilityLabel={`Notifications, ${notifications} unread`} hitSlop={8}>
        <Icon name="bell" size={25} color={NAVY} />
        {notifications > 0 ? <View style={styles.dot} /> : null}
      </Pressable>
      <Pressable onPress={() => router.push('/help')} accessibilityRole="link" accessibilityLabel="Help" hitSlop={8}>
        <Icon name="help" size={25} color={NAVY} />
      </Pressable>
      <Pressable style={styles.me} onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${name}. Switch mode`}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(name)}</Text>
        </View>
        <Icon name="chevronDown" size={16} color={NAVY} />
      </Pressable>
    </View>
  );
}

/** The Academics desktop frame (its own design, not the shared school frame): sidebar, top bar, page. */
export function AcademicsFrame({
  nav,
  active,
  school,
  me,
  progress,
  children,
}: {
  nav: readonly NavItem[];
  active: string;
  school: string;
  me: { name: string; notifications: number };
  progress: number;
  children: ReactNode;
}) {
  return (
    <DeskHost>
      <View style={styles.root}>
        <Side nav={nav} active={active} progress={progress} />
        <View style={styles.right}>
          <Top school={school} name={me.name} notifications={me.notifications} />
          <View style={styles.main}>{children}</View>
        </View>
      </View>
    </DeskHost>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  root: { flex: 1, flexDirection: 'row', minHeight: '100%', backgroundColor: CANVAS },
  side: { width: 202, paddingBottom: 20, backgroundColor: WHITE, borderRightWidth: 1, borderColor: LINE },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 60, paddingHorizontal: 22 },
  leaf: { width: 38, height: 40 },
  brand: { fontSize: 24, lineHeight: 26, fontWeight: '800', color: NAVY, letterSpacing: -0.5 },
  brandSub: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  nav: { gap: 5, paddingHorizontal: 12, paddingTop: 16 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 18, height: 44, paddingHorizontal: 16, borderRadius: 10 },
  itemOn: { backgroundColor: BLUE },
  itemHover: { backgroundColor: '#F2F6FD' },
  itemText: { fontSize: 14.5, color: TEXT },
  itemTextOn: { color: WHITE, fontWeight: '600' },
  setup: { marginHorizontal: 18, padding: 16, gap: 6, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: '#F4F7FD' },
  setupTitle: { marginTop: 6, fontSize: 15, fontWeight: '700', color: NAVY },
  setupBody: { fontSize: 13, lineHeight: 18, color: TEXT },
  setupPct: { marginTop: 8, fontSize: 11, fontWeight: '600', color: NAVY },
  setupBar: { backgroundColor: WHITE },
  right: { flex: 1, minWidth: 0 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 22, height: 60, paddingLeft: 34, paddingRight: 36, backgroundColor: WHITE, borderBottomWidth: 1, borderColor: LINE },
  school: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 38, maxWidth: 320, paddingHorizontal: 14, borderRadius: 12, backgroundColor: '#F3F6FB' },
  schoolName: { flexShrink: 1, fontSize: 15, fontWeight: '700', color: NAVY },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 386, height: 38, paddingHorizontal: 16, borderRadius: 19, borderWidth: 1, borderColor: '#D9E1EE', backgroundColor: WHITE },
  searchInput: { flex: 1, height: 38, paddingVertical: 0, fontSize: 14, color: NAVY },
  dot: { position: 'absolute', top: -1, right: -1, width: 9, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: WHITE, backgroundColor: RED },
  me: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: AVATAR },
  avatarText: { fontSize: 14, fontWeight: '700', color: WHITE },
  main: { flex: 1, paddingHorizontal: 20, paddingTop: 2, paddingBottom: 30, gap: 18 },
});
