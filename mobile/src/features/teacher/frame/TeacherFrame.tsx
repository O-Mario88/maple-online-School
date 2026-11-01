import { Image } from 'expo-image';
import { type Href, router } from 'expo-router';
import { type ReactNode, useCallback } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { LanguageMenu } from '@/components/shell/LanguageMenu';
import type { IconName } from '@/lib/icons';
import { useClasses } from '@/lib/school/queries';
import { useSwitcher } from '@/lib/switcher-context';
import type { TeacherDest } from '@/lib/teacher-home';

import { BLUE, BODY, INK, LINE, RED } from './TeacherParts';

const LEAF = require('@/assets/images/maple-leaf.png') as number;

/** Follows a teacher link. "analytics" opens the first class's learners view, or Classes when there is none yet. */
export function useTeacherGo(): (dest: TeacherDest) => void {
  const classes = useClasses();
  const first = classes.data?.[0];
  return useCallback(
    (dest: TeacherDest) => {
      if (dest !== 'analytics') {
        router.push(dest);
        return;
      }
      if (first) router.push({ pathname: '/learners/[id]', params: { id: String(first.id), title: first.title } });
      else router.push('/learn/live');
    },
    [first],
  );
}

export type TopTab = 'Home' | 'Classes' | 'Students' | 'Assignments' | 'Resources' | 'Analytics' | 'Earnings' | 'Studio' | 'Calendar';

const TABS: readonly { label: TopTab; icon: IconName; go: TeacherDest }[] = [
  { label: 'Home', icon: 'home', go: '/' },
  { label: 'Classes', icon: 'book', go: '/learn/live' },
  { label: 'Students', icon: 'people', go: '/teach/class-spaces' },
  { label: 'Assignments', icon: 'clipboard', go: '/teach/grading' },
  { label: 'Resources', icon: 'folder', go: '/learn/library' },
  { label: 'Analytics', icon: 'chart', go: 'analytics' },
  { label: 'Earnings', icon: 'wallet', go: '/teach/earnings' },
  { label: 'Studio', icon: 'sparkle', go: '/teach/studio' },
];

const CALENDAR_TABS: readonly { label: TopTab; icon: IconName; go: TeacherDest }[] = [
  { label: 'Home', icon: 'home', go: '/' },
  { label: 'Classes', icon: 'book', go: '/learn/live' },
  { label: 'Students', icon: 'people', go: '/teach/class-spaces' },
  { label: 'Assignments', icon: 'clipboard', go: '/teach/grading' },
  { label: 'Studio', icon: 'sparkle', go: '/teach/studio' },
  { label: 'Calendar', icon: 'calendar', go: '/teach/calendar' },
  { label: 'Resources', icon: 'folder', go: '/learn/library' },
  { label: 'Analytics', icon: 'chart', go: 'analytics' },
  { label: 'Earnings', icon: 'wallet', go: '/teach/earnings' },
];

/** Who the frame shows in its header: name, photo, unread alerts and mode (as the reference prints it). */
export interface TeacherMe {
  name: string;
  avatar: number;
  notifications: number;
  mode: string;
}

function Bell({ count, size = 22 }: { count: number; size?: number }) {
  return (
    <Pressable onPress={() => router.push('/inbox')} accessibilityRole="button" accessibilityLabel={`Notifications, ${count} unread`} hitSlop={8}>
      <Icon name="bell" size={size} color={INK} />
      {count > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Logo({ small = false }: { small?: boolean }) {
  return (
    <Pressable style={styles.logo} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
      <Image source={LEAF} style={small ? styles.leafSmall : styles.leaf} contentFit="contain" />
      <View>
        <Text style={small ? styles.brandSmall : styles.brand}>Maple</Text>
        <Text style={small ? styles.brandSubSmall : styles.brandSub}>Global Online School</Text>
      </View>
    </Pressable>
  );
}

/** The teacher references' top bar: logo, section tabs, search, language, alerts and the mode switcher. */
export function TeacherTopBar({ active, me, placeholder }: { active: TopTab; me: TeacherMe; placeholder: string }) {
  const go = useTeacherGo();
  const switcher = useSwitcher();
  const tabs = active === 'Calendar' ? CALENDAR_TABS : TABS;
  return (
    <View style={styles.bar}>
      <Logo />
      <View style={styles.tabs} accessibilityRole="tablist">
        {tabs.map((t) => {
          const on = t.label === active;
          return (
            <Pressable key={t.label} style={[styles.tab, on && styles.tabOn]} onPress={() => go(t.go)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t.label}>
              <Icon name={t.icon} size={20} color={on ? BLUE : INK} />
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
              {on ? <View style={styles.tabLine} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.search}>
        <Icon name="search" size={15} color={BODY} />
        <TextInput style={styles.searchInput} placeholder={placeholder} placeholderTextColor="#6B7385" accessibilityLabel="Search" />
        <Text style={styles.kbd}>⌘K</Text>
      </View>
      <LanguageMenu style={styles.lang}>
        <Icon name="globe" size={18} color={INK} />
        <Text style={styles.langText}>English</Text>
        <Icon name="chevronDown" size={12} color={INK} />
      </LanguageMenu>
      <Bell count={me.notifications} />
      <Pressable style={styles.me} onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${me.name}, ${me.mode}. Switch mode`}>
        <Image source={me.avatar} style={styles.avatar} />
        <View style={styles.meText}>
          <Text style={styles.meName} numberOfLines={1}>
            {me.name}
          </Text>
          <View style={styles.meRow}>
            <Text style={styles.meMode} numberOfLines={1}>
              {me.mode}
            </Text>
            <Icon name="chevronDown" size={11} color={BODY} />
          </View>
        </View>
      </Pressable>
    </View>
  );
}

export interface SideItem {
  label: string;
  icon: IconName;
  go: TeacherDest;
  badge?: number;
}

interface SideNavProps {
  title?: string;
  items: readonly SideItem[];
  active: string;
  /** Handles an item on the current page; return true to stop the usual navigation. */
  onItem?: (item: SideItem) => boolean;
  /** Smaller labels, for menus with long names such as the course builder's. */
  dense?: boolean;
  children?: ReactNode;
}

/** The left menu each teacher reference draws, with an optional heading and footer cards. */
export function TeacherSideNav({ title, items, active, onItem, dense = false, children }: SideNavProps) {
  const go = useTeacherGo();
  const pick = (n: SideItem) => {
    if (!onItem?.(n)) go(n.go);
  };
  return (
    <View style={[styles.side, dense && styles.sideDense]}>
      {title ? (
        <Text style={[styles.sideTitle, dense && styles.sideTitleDense]} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      <View style={styles.sideList}>
        {items.map((n) => {
          const on = n.label === active;
          return (
            <Pressable key={n.label} style={[styles.sideItem, dense && styles.sideItemDense, on && styles.sideOn]} onPress={() => pick(n)} accessibilityRole="link" accessibilityState={{ selected: on }}>
              <Icon name={n.icon} size={18} color={on ? BLUE : '#3D4656'} />
              <Text style={[styles.sideText, dense && styles.sideTextDense, on && styles.sideTextOn]} numberOfLines={1}>
                {n.label}
              </Text>
              {n.badge ? (
                <View style={styles.sideBadge}>
                  <Text style={styles.badgeText}>{n.badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.flex} />
      {children}
    </View>
  );
}

/** The phone header from the references: menu, logo, alerts and the teacher's name. */
export function TeacherPhoneTop({ me }: { me: TeacherMe }) {
  const switcher = useSwitcher();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.phoneTop, { paddingTop: insets.top, height: 60 + insets.top }]}>
      <Pressable onPress={() => router.push('/more' as Href)} accessibilityRole="button" accessibilityLabel="Menu" hitSlop={8}>
        <Icon name="menu" size={22} color={INK} />
      </Pressable>
      <Logo small />
      <View style={styles.flex} />
      <Bell count={me.notifications} size={21} />
      <Pressable style={styles.phoneMe} onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${me.name}. Switch mode`}>
        <Image source={me.avatar} style={styles.phoneAvatar} />
        <View style={styles.phoneText}>
          <Text style={styles.phoneName} numberOfLines={1}>{me.name}</Text>
          <Text style={styles.phoneMode} numberOfLines={1}>{me.mode}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bar: { height: 62, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  leaf: { width: 36, height: 38 },
  leafSmall: { width: 28, height: 30 },
  brand: { fontSize: 22, lineHeight: 24, fontWeight: '800', color: INK, letterSpacing: -0.4 },
  brandSub: { fontSize: 11.5, fontWeight: '600', color: INK },
  brandSmall: { fontSize: 16, lineHeight: 18, fontWeight: '800', color: INK },
  brandSubSmall: { fontSize: 7.5, fontWeight: '600', color: INK },
  tabs: { flexDirection: 'row', marginLeft: 6 },
  tab: { minWidth: 50, paddingHorizontal: 6, height: 60, alignItems: 'center', justifyContent: 'center', gap: 4 },
  tabOn: { backgroundColor: '#EEF4FF' },
  tabText: { fontSize: 10.5, color: INK, letterSpacing: -0.1 },
  tabTextOn: { color: BLUE, fontWeight: '600' },
  tabLine: { position: 'absolute', left: 8, right: 8, bottom: 0, height: 2.5, borderRadius: 2, backgroundColor: BLUE },
  search: { flex: 1, minWidth: 120, height: 34, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 8, backgroundColor: '#F2F6FC', borderWidth: 1, borderColor: LINE },
  searchInput: { flex: 1, minWidth: 0, height: 32, fontSize: 11, color: INK },
  kbd: { fontSize: 10, fontWeight: '600', color: BODY, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, backgroundColor: '#E3EAF5' },
  lang: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  langText: { fontSize: 12.5, fontWeight: '600', color: INK },
  badge: { position: 'absolute', top: -6, right: -7, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderRadius: 8, backgroundColor: RED },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  me: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 6 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  meName: { fontSize: 13, fontWeight: '700', color: INK },
  meText: { maxWidth: 112 },
  meRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meMode: { flexShrink: 1, fontSize: 11, color: BODY },
  side: { width: 175, paddingVertical: 14, paddingHorizontal: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: LINE },
  sideTitle: { fontSize: 17, fontWeight: '800', color: INK, marginLeft: 8, marginBottom: 10 },
  sideTitleDense: { fontSize: 15 },
  sideList: { gap: 3 },
  sideItem: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, borderRadius: 8 },
  sideOn: { backgroundColor: '#E3EDFF' },
  sideText: { flex: 1, fontSize: 12.5, color: '#2B3445', letterSpacing: -0.2 },
  sideTextOn: { color: BLUE, fontWeight: '600' },
  sideTextDense: { fontSize: 11, letterSpacing: -0.35 },
  sideDense: { paddingHorizontal: 6 },
  sideItemDense: { gap: 8, paddingHorizontal: 7 },
  sideBadge: { minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: RED },
  phoneTop: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderColor: LINE },
  phoneMe: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  phoneAvatar: { width: 32, height: 32, borderRadius: 16 },
  phoneText: { maxWidth: 92 },
  phoneName: { fontSize: 11.5, fontWeight: '700', color: INK },
  phoneMode: { fontSize: 9.5, color: BODY },
});
