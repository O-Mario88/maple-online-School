import { Image } from 'expo-image';
import { router, usePathname } from 'expo-router';
import { type ReactNode, useSyncExternalStore } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { RefScale } from '@/features/public/home/RefScale';
import type { IconName } from '@/lib/icons';
import { useSwitcher } from '@/lib/switcher-context';
import { toast } from '@/lib/toast';
import type { NavItem, PortalChild } from '@/mock/portal';

import { CountBadge } from './PortalParts';
import { BLUE, BODY, CANVAS, DESK_MIN_WIDTH, LINE, MUTED, NAVY, SELECT, WHITE } from './tokens';

const LEAF = require('@/assets/images/maple-leaf.png') as number;

/** The Maple leaf and wordmark. */
export function Logo({ size = 'desk' }: { size?: 'desk' | 'phone' }) {
  const phone = size === 'phone';
  return (
    <Pressable style={styles.logo} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
      <Image source={LEAF} style={phone ? styles.leafPhone : styles.leaf} contentFit="contain" />
      <View>
        <Text style={[styles.brand, phone && styles.brandPhone]}>Maple</Text>
        <Text style={[styles.brandSub, phone && styles.brandSubPhone]}>Global Online School</Text>
      </View>
    </Pressable>
  );
}

/** The alerts bell with its red count. */
export function Bell({ count, size = 26 }: { count: number; size?: number }) {
  return (
    <Pressable onPress={() => router.push('/inbox')} accessibilityRole="button" accessibilityLabel={`Notifications, ${count} unread`} hitSlop={8}>
      <Icon name="bell" size={size} color={NAVY} />
      {count > 0 ? <CountBadge count={count} size={size * 0.72} style={styles.bellBadge} /> : null}
    </Pressable>
  );
}

/**
 * A desktop page: laid out at the window's width from DESK_MIN_WIDTH up; below that it keeps the
 * DESK_MIN_WIDTH layout and scales it down, so columns never squeeze.
 */
export function DeskHost({ children, minWidth = DESK_MIN_WIDTH }: { children: ReactNode; minWidth?: number }) {
  const { width } = useWindowDimensions();
  if (width >= minWidth) {
    return (
      <ScrollView style={styles.canvas} contentContainerStyle={styles.canvasContent}>
        {children}
      </ScrollView>
    );
  }
  return (
    <ScrollView style={styles.canvas}>
      <RefScale width={width} refWidth={minWidth}>
        {children}
      </RefScale>
    </ScrollView>
  );
}

/** The desktop sidebar: an optional heading ("Parent") over icon links, the current one tinted blue. */
export function SideNav({ heading, items, active }: { heading?: string; items: readonly NavItem[]; active: string }) {
  return (
    <View style={styles.side} accessibilityRole="menu">
      {heading ? <Text style={styles.sideHeading}>{heading}</Text> : null}
      {items.map((n) => {
        const on = n.label === active;
        return (
          <Pressable
            key={n.label}
            style={({ hovered }) => [styles.sideItem, on && styles.sideItemOn, hovered && !on && styles.sideItemHover]}
            onPress={() => router.push(n.href as never)}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: on }}
            accessibilityLabel={n.label}>
            <Icon name={n.icon} size={21} color={on ? BLUE : BODY} />
            <Text style={[styles.sideText, on && styles.sideTextOn]}>{n.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A grey rounded search field. */
export function SearchField({ placeholder, style }: { placeholder: string; style?: object }) {
  return (
    <View style={[styles.search, style]}>
      <Icon name="search" size={19} color={BODY} />
      <TextInput style={styles.searchInput} placeholder={placeholder} placeholderTextColor={MUTED} accessibilityLabel="Search" />
    </View>
  );
}

/** The signed-in person at the right of the desktop top bar; opens the mode switcher. */
export function MeChip({ name, role, avatar, initial }: { name: string; role: string; avatar?: number; initial?: string }) {
  const switcher = useSwitcher();
  return (
    <Pressable style={styles.me} onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${name}, ${role}. Switch mode`}>
      {avatar ? <Image source={avatar} style={styles.meAvatar} contentFit="cover" /> : <Initial letter={initial ?? name[0]} size={46} />}
      <View>
        <Text style={styles.meName}>{name}</Text>
        <Text style={styles.meRole}>{role}</Text>
      </View>
      <Icon name="chevronDown" size={16} color={BODY} />
    </Pressable>
  );
}

/** A navy circle with a white initial (the admin's avatar in the onboarding reference). */
export function Initial({ letter, size }: { letter: string; size: number }) {
  return (
    <View style={[styles.initial, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initialText, { fontSize: size * 0.42 }]}>{letter}</Text>
    </View>
  );
}

// The child being looked at, shared by every parent page and kept while moving between them.
let currentChild = 'daniel';
const childListeners = new Set<() => void>();

/** The child the parent pages show, and a setter; every page follows the same choice. */
export function useCurrentChild(): [string, (id: string) => void] {
  const id = useSyncExternalStore(
    (cb) => {
      childListeners.add(cb);
      return () => childListeners.delete(cb);
    },
    () => currentChild,
    () => currentChild,
  );
  const set = (next: string) => {
    currentChild = next;
    childListeners.forEach((cb) => cb());
  };
  return [id, set];
}

/** The parent top bar's child switcher: one pill per child, then "Add Child". */
export function ChildPills({ list, compact = false }: { list: readonly PortalChild[]; compact?: boolean }) {
  const [current, setCurrent] = useCurrentChild();
  return (
    <View style={styles.pills} accessibilityRole="tablist">
      {list.map((c) => {
        const on = c.id === current;
        return (
          <Pressable
            key={c.id}
            style={[styles.pill, compact && styles.pillCompact, on && styles.pillOn]}
            onPress={() => setCurrent(c.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${c.name}, ${c.level}`}>
            <Image source={c.avatar} style={styles.pillAvatar} contentFit="cover" />
            <View>
              <Text style={styles.pillName}>{c.name}</Text>
              <Text style={styles.pillLevel}>{c.level}</Text>
            </View>
          </Pressable>
        );
      })}
      <Pressable style={styles.addChild} onPress={() => router.push('/claim-child')} accessibilityRole="button" accessibilityLabel="Add Child">
        <Icon name="plus" size={20} color={BLUE} />
        <Text style={styles.addChildText}>Add Child</Text>
        <Icon name="chevronDown" size={14} color={BLUE} />
      </Pressable>
    </View>
  );
}

/** The parent references' desktop top bar. */
export function ParentTopBar({
  list,
  me,
  search,
}: {
  list: readonly PortalChild[];
  me: { name: string; mode: string; avatar: number; notifications: number };
  search?: string;
}) {
  return (
    <View style={styles.top}>
      <View style={styles.topLogo}>
        <Logo />
      </View>
      <ChildPills list={list} compact={!search} />
      <View style={styles.flex} />
      {search ? <SearchField placeholder={search} style={styles.topSearch} /> : null}
      <Bell count={me.notifications} />
      <MeChip name={me.name} role={me.mode} avatar={me.avatar} />
    </View>
  );
}

export const PARENT_NAV: readonly NavItem[] = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'Children', icon: 'people', href: '/family/settings' },
  { label: 'Academics', icon: 'book', href: '/family/academics' },
  { label: 'Messages', icon: 'chat', href: '/messages' },
  { label: 'Calendar', icon: 'calendar', href: '/family/attendance' },
  { label: 'Resources', icon: 'library', href: '/learn/library' },
  { label: 'Settings', icon: 'settings', href: '/family/settings' },
];

/** A parent desktop page: top bar, the "Parent" sidebar and the page beside it. */
export function ParentDesk({
  list,
  me,
  search,
  active,
  children,
}: {
  list: readonly PortalChild[];
  me: { name: string; mode: string; avatar: number; notifications: number };
  search: string;
  active: string;
  children: ReactNode;
}) {
  return (
    <DeskHost>
      <ParentTopBar list={list} me={me} search={search} />
      <View style={styles.body}>
        <SideNav heading="Parent" items={PARENT_NAV} active={active} />
        <View style={styles.main}>{children}</View>
      </View>
    </DeskHost>
  );
}

/** The school-admin desktop top bar: logo, a wide search, optional help, alerts and the admin. */
export function SchoolTopBar({
  search,
  me,
  help = false,
}: {
  search: string;
  me: { name: string; role: string; avatar?: number; initial: string; notifications: number };
  help?: boolean;
}) {
  return (
    <View style={styles.top}>
      <View style={styles.topLogo}>
        <Logo />
      </View>
      <SearchField placeholder={search} style={styles.schoolSearch} />
      <View style={styles.flex} />
      {help ? (
        <Pressable onPress={() => router.push('/help')} accessibilityRole="link" accessibilityLabel="Help" hitSlop={8}>
          <Icon name="help" size={28} color={NAVY} />
        </Pressable>
      ) : null}
      <Bell count={me.notifications} />
      <View style={styles.topDivider} />
      <MeChip name={me.name} role={me.role} avatar={me.avatar} initial={me.initial} />
    </View>
  );
}

/** A school-admin desktop page: top bar, sidebar and the page beside it. */
export function SchoolDesk({
  search,
  me,
  help,
  nav,
  active,
  children,
}: {
  search: string;
  me: { name: string; role: string; avatar?: number; initial: string; notifications: number };
  help?: boolean;
  nav: readonly NavItem[];
  active: string;
  children: ReactNode;
}) {
  return (
    <DeskHost>
      <SchoolTopBar search={search} me={me} help={help} />
      <View style={styles.body}>
        <SideNav items={nav} active={active} />
        <View style={styles.main}>{children}</View>
      </View>
    </DeskHost>
  );
}

/** The phone header: logo on the left; alerts or help and the account photo on the right. */
export function PhoneTop({ right }: { right: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.phoneTop, { paddingTop: insets.top + 10 }]}>
      <Logo size="phone" />
      <View style={styles.flex} />
      {right}
    </View>
  );
}

/** The parent phone header: bell and Mary's photo, which opens the mode switcher. */
export function ParentPhoneTop({ me }: { me: { avatar: number; notifications: number; name: string } }) {
  const switcher = useSwitcher();
  return (
    <PhoneTop
      right={
        <>
          <Bell count={me.notifications} size={27} />
          <Pressable onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${me.name}. Switch mode`}>
            <Image source={me.avatar} style={styles.phoneAvatar} contentFit="cover" />
          </Pressable>
        </>
      }
    />
  );
}

/** The school-admin phone header: help or alerts, and the admin's initial. */
export function SchoolPhoneTop({ initial, notifications, help = false }: { initial: string; notifications: number; help?: boolean }) {
  const switcher = useSwitcher();
  return (
    <PhoneTop
      right={
        <>
          {help ? (
            <Pressable onPress={() => router.push('/help')} accessibilityRole="link" accessibilityLabel="Help" hitSlop={8}>
              <Icon name="help" size={30} color={NAVY} />
            </Pressable>
          ) : (
            <Bell count={notifications} size={27} />
          )}
          <Pressable onPress={switcher?.open} accessibilityRole="button" accessibilityLabel="Switch mode">
            <Initial letter={initial} size={50} />
          </Pressable>
        </>
      }
    />
  );
}

/** The parent phone pages' child switcher: a sideways row of child cards. */
export function ChildCards({ list }: { list: readonly PortalChild[] }) {
  const [current, setCurrent] = useCurrentChild();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
      {list.map((c) => {
        const on = c.id === current;
        return (
          <Pressable
            key={c.id}
            style={[styles.card, on && styles.cardOn]}
            onPress={() => setCurrent(c.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${c.name}, ${c.level}`}>
            <Image source={c.avatar} style={styles.cardAvatar} contentFit="cover" />
            <View>
              <Text style={styles.cardName}>{c.name}</Text>
              <Text style={styles.cardLevel}>{c.level}</Text>
            </View>
          </Pressable>
        );
      })}
      <Pressable style={styles.cardMore} onPress={() => toast('Swipe to see all your children, or add one from Settings.')} accessibilityRole="button" accessibilityLabel="More children">
        <Icon name="chevronRight" size={18} color={BODY} />
      </Pressable>
    </ScrollView>
  );
}

export interface PortalTab {
  label: string;
  icon: IconName;
  href: string;
  badge?: number;
}

const PARENT_TABS: readonly PortalTab[] = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'Academics', icon: 'book', href: '/family/academics' },
  { label: 'Messages', icon: 'chat', href: '/messages', badge: 3 },
  { label: 'Calendar', icon: 'calendar', href: '/family/attendance' },
  { label: 'More', icon: 'more', href: '/more' },
];

const ONBOARDING_TABS: readonly PortalTab[] = [
  { label: 'Home', icon: 'home', href: '/' },
  { label: 'Classes', icon: 'book', href: '/admin/timetable' },
  { label: 'Students', icon: 'person', href: '/admin/rosters' },
  { label: 'Onboarding', icon: 'cap', href: '/admin/onboarding' },
  { label: 'More', icon: 'more', href: '/more' },
];

const ADMIN_TABS: readonly PortalTab[] = [
  { label: 'Dashboard', icon: 'home', href: '/' },
  { label: 'Students', icon: 'book', href: '/admin/rosters' },
  { label: 'Academics', icon: 'cap', href: '/admin/academics' },
  { label: 'Reports', icon: 'clipboard', href: '/admin/attendance' },
  { label: 'More', icon: 'more', href: '/more' },
];

/** The paths whose pages draw the parent or school-admin reference frame themselves. */
export const PARENT_REF_PATHS = ['/family/academics', '/family/settings', '/messages'];

/** Every school-admin page draws the school reference frame. */
export function isSchoolRefPath(path: string): boolean {
  return path.startsWith('/admin/');
}

/** The school-admin phone tab bar: Home, Students, this page's section, then Reports or Messages, and More. */
function schoolTabs(path: string): readonly PortalTab[] {
  const home: PortalTab = { label: 'Home', icon: 'home', href: '/' };
  const students: PortalTab = { label: 'Students', icon: 'people', href: '/admin/rosters' };
  const reports: PortalTab = { label: 'Reports', icon: 'clipboard', href: '/admin/report-cards' };
  const messages: PortalTab = { label: 'Messages', icon: 'chat', href: '/messages' };
  const more: PortalTab = { label: 'More', icon: 'more', href: '/more' };
  const finance: PortalTab = { label: 'Finance', icon: 'columns', href: '/admin/finance/fees' };
  if (path === '/admin/rosters') return [home, { ...students, label: 'Students' }, { label: 'Classes', icon: 'book', href: '/admin/timetable' }, reports, more];
  if (path === '/admin/timetable') return [home, students, { label: 'Timetable', icon: 'columns', href: path }, reports, more];
  if (path === '/admin/report-cards') return [home, students, { label: 'Reports', icon: 'clipboard', href: path }, messages, more];
  if (path === '/admin/library') return [home, students, { label: 'Library', icon: 'columns', href: path }, messages, more];
  if (path === '/admin/attendance' || path === '/admin/scan') return [home, students, { label: 'Attendance', icon: 'qr', href: '/admin/attendance' }, { label: 'Scan', icon: 'scan', href: '/admin/scan' }, more];
  if (path.startsWith('/admin/finance') || path === '/admin/accounting') return [home, students, { ...finance, href: path }, reports, more];
  if (path === '/admin/settings') return [home, students, finance, messages, { ...more, href: path }];
  if (path === '/admin/onboarding') return ONBOARDING_TABS;
  return ADMIN_TABS;
}

/** The reference tab bar for this mode and page in a design build, or null for the shared one. */
export function portalTabsFor(portal: string, path: string): readonly PortalTab[] | null {
  if (isSchoolRefPath(path)) return schoolTabs(path);
  if (portal === 'parent') return PARENT_TABS;
  return null;
}

/** The white phone tab bar of the parent and school-admin references. */
export function PortalTabBar({ tabs }: { tabs: readonly PortalTab[] }) {
  const insets = useSafeAreaInsets();
  const path = usePathname();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.href === path;
        const color = on ? BLUE : BODY;
        return (
          <Pressable key={t.label} style={styles.tabItem} onPress={() => router.navigate(t.href as never)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t.badge ? `${t.label}, ${t.badge} unread` : t.label}>
            <View>
              <Icon name={t.icon} size={26} color={color} />
              {t.badge ? <CountBadge count={t.badge} size={19} style={styles.tabBadge} /> : null}
            </View>
            <Text style={[styles.tabLabel, { color }, on && styles.tabLabelOn]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  canvas: { flex: 1, backgroundColor: CANVAS },
  canvasContent: { minHeight: '100%' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  leaf: { width: 40, height: 42 },
  leafPhone: { width: 40, height: 42 },
  brand: { fontSize: 27, lineHeight: 30, fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  brandPhone: { fontSize: 25, lineHeight: 28 },
  brandSub: { fontSize: 13.5, fontWeight: '600', color: NAVY },
  brandSubPhone: { fontSize: 13 },
  bellBadge: { position: 'absolute', top: -7, right: -9, borderWidth: 1.5, borderColor: WHITE },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    height: 86,
    paddingHorizontal: 28,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderColor: LINE,
  },
  topLogo: { width: 200 },
  topSearch: { width: 340 },
  schoolSearch: { width: 600, marginLeft: 24 },
  topDivider: { width: 1, height: 40, backgroundColor: LINE },
  body: { flexDirection: 'row', flex: 1 },
  side: { width: 214, paddingTop: 24, paddingHorizontal: 14, gap: 4, borderRightWidth: 1, borderColor: LINE, backgroundColor: 'rgba(255,255,255,0.55)' },
  sideHeading: { marginBottom: 6, marginLeft: 14, fontSize: 17, fontWeight: '800', color: NAVY },
  sideItem: { flexDirection: 'row', alignItems: 'center', gap: 14, height: 48, paddingHorizontal: 14, borderRadius: 12 },
  sideItemOn: { backgroundColor: SELECT },
  sideItemHover: { backgroundColor: '#F1F5FD' },
  sideText: { fontSize: 16, color: BODY },
  sideTextOn: { color: BLUE, fontWeight: '600' },
  main: { flex: 1, minWidth: 0, paddingHorizontal: 26, paddingTop: 22, paddingBottom: 36 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 48, paddingHorizontal: 18, borderRadius: 24, backgroundColor: '#EFF3FA' },
  searchInput: { flex: 1, height: 48, paddingVertical: 0, fontSize: 15, color: NAVY },
  me: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  meAvatar: { width: 52, height: 52, borderRadius: 26 },
  meName: { fontSize: 16, fontWeight: '700', color: NAVY },
  meRole: { fontSize: 14, color: BODY },
  initial: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#163A9C' },
  initialText: { color: WHITE, fontWeight: '700' },
  pills: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 11, width: 160, height: 58, paddingHorizontal: 10, borderRadius: 13, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  pillCompact: { width: 170 },
  pillOn: { backgroundColor: SELECT, borderColor: '#9EC1F9', borderWidth: 1.5 },
  pillAvatar: { width: 40, height: 40, borderRadius: 20 },
  pillName: { fontSize: 14.5, fontWeight: '700', color: NAVY },
  pillLevel: { fontSize: 13, color: BODY },
  addChild: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 52, paddingHorizontal: 16, borderRadius: 14, backgroundColor: '#EAF1FD' },
  addChildText: { fontSize: 15, fontWeight: '600', color: BLUE },
  phoneTop: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingHorizontal: 20, paddingBottom: 12, backgroundColor: WHITE },
  phoneAvatar: { width: 54, height: 54, borderRadius: 27 },
  cards: { gap: 8, paddingHorizontal: 20, paddingVertical: 4, alignItems: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 110, height: 60, paddingHorizontal: 7, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  cardOn: { backgroundColor: SELECT, borderColor: '#8FB7F8', borderWidth: 1.5 },
  cardAvatar: { width: 40, height: 40, borderRadius: 20 },
  cardName: { fontSize: 14, fontWeight: '700', color: NAVY },
  cardLevel: { fontSize: 12.5, color: BODY },
  cardMore: { width: 22, height: 60, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', paddingTop: 10, backgroundColor: WHITE, borderTopWidth: 1, borderColor: LINE },
  tabItem: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, minHeight: 50, paddingHorizontal: 2 },
  tabLabel: { fontSize: 12 },
  tabLabelOn: { fontWeight: '600' },
  tabBadge: { position: 'absolute', top: -6, right: -12, borderWidth: 1.5, borderColor: WHITE },
});
