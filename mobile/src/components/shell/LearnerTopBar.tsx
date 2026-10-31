import { Image } from 'expo-image';
import { type Href, router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import { mockData } from '@/lib/mock';
import { useSwitcher } from '@/lib/switcher-context';

const LEAF = require('@/assets/images/maple-leaf.png') as number;
const BLUE = '#1463F3';
const INK = '#0B1424';

const TABS: readonly { label: string; href: Href; icon: IconName; match: readonly string[] }[] = [
  { label: 'Home', href: '/', icon: 'home', match: ['/'] },
  { label: 'Learn', href: '/learn/explore', icon: 'book', match: ['/learn'] },
  { label: 'Classes', href: '/learn/live', icon: 'person', match: ['/lessons', '/learn/live'] },
  { label: 'Assignments', href: '/learn/assignments', icon: 'chart', match: ['/learn/assignments'] },
  { label: 'Progress', href: '/learn/progress', icon: 'chart', match: ['/learn/progress'] },
  { label: 'Library', href: '/learn/library', icon: 'library', match: ['/learn/library', '/library'] },
  { label: 'Squads', href: '/learn/squads', icon: 'people', match: ['/learn/squads'] },
  { label: 'Shorts', href: '/learn/shorts', icon: 'play', match: ['/learn/shorts'] },
];

/** Account pages (reached from the profile menu) light no tab, as the billing reference shows. */
const ACCOUNT_PAGES = ['/learn/billing'];

/** The learner portal's top bar on wide screens, as the dashboard reference draws it (it replaces the sidebar). */
export function LearnerTopBar({ name }: { name: string }) {
  const path = usePathname();
  const switcher = useSwitcher();
  // The longest matching path wins, so /learn/assignments lights Assignments, not Learn.
  const score = (t: (typeof TABS)[number]) => Math.max(0, ...t.match.map((m) => (m === '/' ? (path === '/' ? 1 : 0) : path.startsWith(m) ? m.length : 0)));
  const best = TABS.reduce((a, b) => (score(b) > score(a) ? b : a));
  const active = score(best) > 0 && !ACCOUNT_PAGES.some((x) => path.startsWith(x)) ? best : undefined;
  const avatar = mockData()?.learner.dashboard.avatar;
  return (
    <View style={styles.bar}>
      <Pressable style={styles.logo} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
        <Image source={LEAF} style={styles.leaf} contentFit="contain" />
        <View>
          <Text style={styles.name}>Maple</Text>
          <Text style={styles.tag}>Global Online School</Text>
        </View>
      </Pressable>
      <View style={styles.tabs} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t === active;
          return (
            <Pressable key={t.label} style={[styles.tab, on && styles.tabOn]} onPress={() => router.push(t.href)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Icon name={t.icon} size={21} color={on ? BLUE : INK} />
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
              {on ? <View style={styles.tabLine} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.search}>
        <Icon name="search" size={16} color="#4A5263" />
        <TextInput style={styles.searchInput} placeholder="Search lessons, topics, or anything..." placeholderTextColor="#6B7385" accessibilityLabel="Search" />
        <Text style={styles.kbd}>⌘K</Text>
      </View>
      <Pressable style={styles.lang} accessibilityRole="button" accessibilityLabel="Language: English">
        <Icon name="globe" size={19} color={INK} />
        <Text style={styles.langText}>English</Text>
        <Icon name="chevronDown" size={13} color={INK} />
      </Pressable>
      <Pressable onPress={() => router.push('/inbox')} accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={8}>
        <Icon name="bell" size={21} color="#E5484D" />
        <View style={styles.redDot} />
      </Pressable>
      <Pressable style={styles.me} onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${name}, ${switcher?.label ?? ''}. Switch mode`}>
        {avatar ? <Image source={avatar} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarBlank]} />}
        <View>
          <View style={styles.meRow}>
            <Text style={styles.meName}>{name}</Text>
            <Icon name="chevronDown" size={12} color={INK} />
          </View>
          <Text style={styles.meMode}>{switcher?.label ?? ''}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { height: 74, flexDirection: 'row', alignItems: 'center', gap: 22, paddingHorizontal: 28, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E8EDF5' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 14 },
  leaf: { width: 42, height: 42 },
  name: { fontSize: 21, lineHeight: 23, fontWeight: '700', color: INK, letterSpacing: -0.3 },
  tag: { fontSize: 10, color: INK },
  tabs: { flexDirection: 'row', gap: 4 },
  tab: { width: 72, height: 62, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 10 },
  tabOn: { backgroundColor: '#EAF1FE' },
  tabText: { fontSize: 11, color: INK },
  tabTextOn: { color: BLUE, fontWeight: '500' },
  tabLine: { position: 'absolute', left: 16, right: 16, bottom: -6, height: 3, borderRadius: 2, backgroundColor: BLUE },
  search: { flex: 1, maxWidth: 280, height: 38, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 9, backgroundColor: '#F2F5FA' },
  searchInput: { flex: 1, height: 36, fontSize: 12, color: INK },
  kbd: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#E3E8F0', fontSize: 10.5, color: '#4A5263', overflow: 'hidden' },
  lang: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langText: { fontSize: 14, color: INK },
  redDot: { position: 'absolute', top: 0, right: -1, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E5484D' },
  me: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  avatarBlank: { backgroundColor: '#D9DEE7' },
  meRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meName: { fontSize: 13.5, fontWeight: '500', color: INK },
  meMode: { marginTop: 2, fontSize: 11, color: '#4A5263' },
});
