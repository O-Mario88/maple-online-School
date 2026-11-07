import { Image } from '@/components/picture';
import { type Href, router, useGlobalSearchParams, usePathname } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ShellContext, useShell } from '@/components/ui';
import { Breakpoints } from '@/constants/theme';
import { useOptionalAccess } from '@/lib/access/access-context';
import { useMe } from '@/lib/auth/auth-context';
import { isCompassSection } from '@/lib/careers/sections';
import { PAGE_GUTTER, PAGE_MAX_WIDTH, pageWidth } from '@/lib/layout';
import { DESIGN_DATA, mockData } from '@/lib/mock';
import { useCanOpen } from '@/lib/access/use-role';
import { activeKey, type NavItem, navFor, type NavMode, navMode, onlyAllowed, type Portal, topBarSplit } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';
import { useInstalled } from '@/lib/use-installed';
import { useSwitcher } from '@/lib/switcher-context';
import { openMenuPage } from '@/lib/menu-nav';
import { Maple, Radii } from '@/constants/maple';
import { MapleLogo } from '@/components/brand/MapleLogo';

/** Sidebar width on wide screens; below the extra-wide breakpoint it folds to an icon rail. */
export const LEARNER_SIDE = 208;
export const LEARNER_RAIL = 76;
const HEADER = 68;
const C = {
  navy: Maple.navyDeep,
  ink: Maple.navy,
  body: Maple.body,
  blue: Maple.blue,
  soft: Maple.blueSoft,
  line: Maple.blueSelected,
  canvas: Maple.blueSoft,
  white: Maple.surface,
  purple: Maple.blue,
} as const;

/** The sidebar's width at this window width. */
export const learnerSideWidth = (width: number) => (width >= Breakpoints.extraWide ? LEARNER_SIDE : LEARNER_RAIL);

/** Sidebar, top bar or bottom tabs for this device (see navMode in lib/navigation). */
export function useNavMode(): NavMode {
  const { width } = useWindowDimensions();
  const installed = useInstalled();
  return navMode({ os: Platform.OS, width, installed });
}

const TOP_TAB = 76;
const TOP_TAB_W = TOP_TAB - 2;
const TOP_BRAND = 200;
/** Search, notifications and the profile chip. */
const TOP_RIGHT = 330;

/** The learner's one header: brand, search, notifications and the profile and mode menu. */
export function LearnerHeader({ mode = 'sidebar' }: { mode?: NavMode }) {
  const me = useMe();
  const switcher = useSwitcher();
  const { width } = useWindowDimensions();
  const name = me.data?.full_name ?? 'Learner';
  const avatar = mockData()?.learner.learnerHome.avatar;
  const top = mode === 'topbar';
  return (
    <View style={s.header}>
      {/* In the top bar the header lines up with the page: the same centred width and gutter. */}
      <View style={top ? s.headerRowTop : s.headerRow}>
        <Pressable
          style={[s.brand, top ? s.brandTop : { width: learnerSideWidth(width) }]}
          onPress={() => openMenuPage('/')}
          accessibilityRole="link"
          accessibilityLabel="Maple home">
          {/* The name shows when there's room for it: the top bar, or a very wide window. */}
          <MapleLogo markStyle={s.leaf} markOnly={!(mode === 'topbar' || width >= Breakpoints.extraWide)} />
        </Pressable>
        {mode === 'topbar' ? (
          <>
            <TopTabs />
            <Pressable
              style={s.searchIcon}
              onPress={() => openMenuPage('/learn/explore')}
              accessibilityRole="search"
              accessibilityLabel="Search subjects, lessons, past papers">
              <Icon name="search" size={20} color={C.ink} />
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              style={s.search}
              onPress={() => openMenuPage('/learn/explore')}
              accessibilityRole="search"
              accessibilityLabel="Search subjects, lessons, past papers">
              <Icon name="search" size={19} color={C.body} />
              <Text style={s.searchText} numberOfLines={1}>
                Search subjects, lessons, past papers...
              </Text>
            </Pressable>
            <View style={s.flex} />
          </>
        )}
        <Pressable
          style={s.bell}
          onPress={() => openMenuPage('/inbox')}
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          hitSlop={8}>
          <Icon name="bell" size={22} color={C.ink} />
          <View style={s.bellDot} />
        </Pressable>
        <Pressable
          style={s.me}
          onPress={switcher?.open}
          disabled={!switcher}
          accessibilityRole="button"
          accessibilityLabel={`${name}${switcher ? `, ${switcher.label}. Switch mode` : ''}`}>
          {avatar ? (
            <Image decorative source={avatar} style={s.avatar} contentFit="cover" />
          ) : (
            <View style={[s.avatar, s.avatarBlank]}>
              <Text style={s.avatarText}>{name.slice(0, 1).toUpperCase()}</Text>
            </View>
          )}
          <Text style={s.name} numberOfLines={1}>
            {name}
          </Text>
          <Icon name="chevronDown" size={16} color={C.ink} />
        </Pressable>
      </View>
    </View>
  );
}

function Item({
  item,
  active,
  rail,
  onPress,
  sub = false,
}: {
  item: NavItem;
  active: boolean;
  rail: boolean;
  onPress: () => void;
  sub?: boolean;
}) {
  return (
    <Pressable
      style={({ hovered }) => [
        sub ? s.sub : s.item,
        rail && s.itemRail,
        active && (sub ? s.subOn : s.itemOn),
        hovered && !active && s.hover,
      ]}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      accessibilityLabel={item.label}>
      <Icon name={item.icon} size={sub ? 16 : 21} color={active ? (sub ? C.blue : C.white) : C.ink} />
      {!rail ? (
        <Text style={[sub ? s.subText : s.itemText, active && (sub ? s.subTextOn : s.itemTextOn)]} numberOfLines={1}>
          {item.label}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** The current child of an open section, such as Career Compass's tab. */
function useActiveChild(item: NavItem): string | undefined {
  const path = usePathname();
  const { tab } = useGlobalSearchParams<{ tab?: string }>();
  if (item.key !== 'careers') return undefined;
  if (path.startsWith('/universities')) return 'careers-programs';
  return `careers-${isCompassSection(tab) ? tab : 'home'}`;
}

function Children({ item, rail, onNavigate }: { item: NavItem; rail: boolean; onNavigate?: () => void }) {
  const path = usePathname();
  const current = useActiveChild(item);
  const here = path === item.href;
  return (
    <View style={s.children}>
      {(item.children ?? []).map((c) => (
        <Item
          key={c.key}
          item={c}
          sub
          rail={rail}
          active={c.key === current}
          onPress={() => {
            const q = c.href.split('?tab=')[1];
            onNavigate?.();
            // Inside the section, switch its tab in place; from elsewhere, open it.
            if (here) router.setParams({ tab: q });
            else openMenuPage(c.href as Href);
          }}
        />
      ))}
    </View>
  );
}

function GoPremium({ onNavigate }: { onNavigate?: () => void }) {
  const access = useOptionalAccess()?.access;
  if (!access || (access.phase === 'paid' && access.tier === 'premium')) return null;
  return (
    <View style={s.premium}>
      <View style={s.premiumHead}>
        <Icon name="crown" size={20} color={C.purple} />
        <Text style={s.premiumTitle}>Go Premium</Text>
      </View>
      <Text style={s.premiumText}>Get detailed career insights, assessments and more.</Text>
      <Pressable
        style={s.premiumBtn}
        onPress={() => {
          onNavigate?.();
          router.push('/plans?need=premium' as Href);
        }}
        accessibilityRole="button">
        <Text style={s.premiumBtnText}>Upgrade Now</Text>
        <Icon name="arrowRight" size={14} color={C.white} />
      </Pressable>
    </View>
  );
}

/** A portal's menu: the main pages, the open section's children, More, and (for learners) Go Premium. */
export function PortalNav({ portal, rail, onNavigate }: { portal: Portal; rail: boolean; onNavigate?: () => void }) {
  const path = usePathname();
  const may = useCanOpen();
  // Only what this account's role may open (the API would refuse the rest).
  const items = useMemo(() => onlyAllowed(navFor(portal, DESIGN_DATA), may), [portal, may]);
  const active = activeKey(items, path);
  const main = items.filter((i) => !i.group);
  const more = items.filter((i) => i.group);
  const [moreOpen, setMoreOpen] = useState(() => more.some((i) => i.key === active));
  const go = (href: string) => {
    onNavigate?.();
    openMenuPage(href as Href);
  };
  return (
    <>
      <ScrollView contentContainerStyle={s.nav} accessibilityRole="menu">
        {main.map((i) => (
          <View key={i.key}>
            <Item item={i} active={i.key === active} rail={rail} onPress={() => go(i.href)} />
            {i.children && i.key === active ? <Children item={i} rail={rail} onNavigate={onNavigate} /> : null}
          </View>
        ))}
        {more.length ? (
          <Pressable
            style={[s.item, rail && s.itemRail]}
            onPress={() => setMoreOpen(!moreOpen)}
            accessibilityRole="button"
            accessibilityState={{ expanded: moreOpen }}
            accessibilityLabel="More pages">
            <Icon name="more" size={21} color={C.ink} />
            {!rail ? <Text style={s.itemText}>More</Text> : null}
            {!rail ? <Icon name={moreOpen ? 'chevronDown' : 'chevronRight'} size={14} color={C.body} /> : null}
          </Pressable>
        ) : null}
        {moreOpen
          ? more.map((i) => <Item key={i.key} item={i} sub rail={rail} active={i.key === active} onPress={() => go(i.href)} />)
          : null}
      </ScrollView>
      {!rail && portal === 'learner' ? <GoPremium onNavigate={onNavigate} /> : null}
    </>
  );
}

/** The learner's one sidebar (an installed app on a computer, or a tablet). */
export function LearnerSidebar() {
  const { width } = useWindowDimensions();
  return (
    <View style={[s.side, { width: learnerSideWidth(width) }]}>
      <PortalNav portal="learner" rail={width < Breakpoints.extraWide} />
    </View>
  );
}

/** The browser top bar's menu: the main pages that fit, and More for the rest. */
function TopTabs() {
  const path = usePathname();
  const { width } = useWindowDimensions();
  const may = useCanOpen();
  const items = useMemo(() => onlyAllowed(navFor('learner', DESIGN_DATA), may), [may]);
  const active = activeKey(items, path);
  const row = pageWidth(width) - PAGE_GUTTER * 2;
  const slots = Math.floor((row - TOP_BRAND - TOP_RIGHT) / TOP_TAB) - 1;
  const { tabs, more } = topBarSplit(items, slots);
  const [open, setOpen] = useState(false);
  const moreOn = more.some((i) => i.key === active);
  return (
    <View style={s.topTabs} accessibilityRole="tablist">
      {tabs.map((i) => {
        const on = i.key === active;
        return (
          <Pressable
            key={i.key}
            style={({ hovered }) => [s.topTab, on && s.topTabOn, hovered && !on && s.hover]}
            onPress={() => openMenuPage(i.href as Href)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            // The name it's read by is the label it shows (WCAG 2.5.3), so "Videos" is "Videos" to everyone.
            accessibilityLabel={i.short ?? i.label}>
            <Icon name={i.icon} size={20} color={on ? C.blue : C.ink} />
            <Text style={[s.topTabText, on && s.topTabTextOn]} numberOfLines={1}>
              {i.short ?? i.label}
            </Text>
            {on ? <View style={s.topLine} /> : null}
          </Pressable>
        );
      })}
      <Pressable
        style={({ hovered }) => [s.topTab, moreOn && s.topTabOn, hovered && !moreOn && s.hover]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel="More pages">
        <Icon name="more" size={20} color={moreOn ? C.blue : C.ink} />
        <Text style={[s.topTabText, moreOn && s.topTabTextOn]}>More</Text>
        {moreOn ? <View style={s.topLine} /> : null}
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.menuScrim} onPress={() => setOpen(false)} accessibilityRole="button" accessibilityLabel="Close menu">
          <View style={s.menu}>
            <ScrollView contentContainerStyle={s.menuList}>
              {more.map((i) => (
                <Item
                  key={i.key}
                  item={i}
                  sub
                  rail={false}
                  active={i.key === active}
                  onPress={() => {
                    setOpen(false);
                    openMenuPage(i.href as Href);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

/** The phone menu's More: the whole menu as a drawer from the left. */
export function NavDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { portal } = usePortal();
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.drawerRoot}>
        <SafeAreaView style={s.drawer} edges={['top', 'bottom', 'left']}>
          <View style={s.drawerHead}>
            <MapleLogo markStyle={s.leaf} />
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close menu">
              <Icon name="close" size={22} color={C.ink} />
            </Pressable>
          </View>
          <PortalNav portal={portal} rail={false} onNavigate={onClose} />
        </SafeAreaView>
        <Pressable style={s.flex} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close menu" />
      </View>
    </Modal>
  );
}

/**
 * The learner's header and sidebar around a page, for pages outside the app shell (the public
 * directory when signed in). The app shell draws the same two itself.
 */
export function LearnerChrome({ children }: { children: ReactNode }) {
  const shell = useShell();
  const { width } = useWindowDimensions();
  const mode = useNavMode();
  const side = mode === 'sidebar' ? learnerSideWidth(width) : 0;
  const value = useMemo(() => ({ ...shell, wide: true, contentWidth: width - side }), [shell, width, side]);
  return (
    <View style={s.root}>
      <LearnerHeader mode={mode} />
      <View style={s.row}>
        {mode === 'sidebar' ? <LearnerSidebar /> : null}
        <View style={s.flex}>
          <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  root: { flex: 1, backgroundColor: C.canvas },
  row: { flex: 1, flexDirection: 'row' },
  header: { height: HEADER, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected, backgroundColor: C.white },
  headerRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 18, paddingRight: 28 },
  headerRowTop: {
    flex: 1,
    width: '100%',
    maxWidth: PAGE_MAX_WIDTH,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingHorizontal: PAGE_GUTTER,
  },
  brandTop: { width: TOP_BRAND, paddingLeft: 0 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 22 },
  leaf: { width: 36, height: 38 },
  brandName: { fontSize: 21, lineHeight: 23, fontWeight: '700', color: C.navy },
  brandSub: { fontSize: 10.5, lineHeight: 12, fontWeight: '600', color: C.navy },
  search: {
    flex: 1,
    maxWidth: 620,
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: Maple.disabledBorder,
    backgroundColor: C.white,
  },
  searchText: { flex: 1, fontSize: 14, color: C.body },
  bell: { padding: 4 },
  bellDot: { position: 'absolute', right: 2, top: 2, width: 9, height: 9, borderRadius: 5, backgroundColor: Maple.error },
  me: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19 },
  avatarBlank: { alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.blueSelected },
  avatarText: { fontSize: 15, fontWeight: '700', color: C.blue },
  name: { maxWidth: 180, fontSize: 15, fontWeight: '600', color: C.navy },
  side: { borderRightWidth: 1, borderRightColor: Maple.blueSelected, backgroundColor: C.white },
  nav: { gap: 3, paddingTop: 12, paddingBottom: 12 },
  item: {
    marginHorizontal: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingLeft: 12,
    paddingRight: 10,
    borderRadius: 12,
  },
  itemRail: { justifyContent: 'center', paddingLeft: 0, paddingRight: 0 },
  itemOn: { backgroundColor: C.blue },
  hover: { backgroundColor: Maple.blueSoft },
  itemText: { flex: 1, fontSize: 14.5, fontWeight: '500', color: C.ink },
  itemTextOn: { fontWeight: '600', color: C.white },
  children: { gap: 2, marginTop: 4, marginBottom: 6 },
  sub: { marginHorizontal: 12, height: 36, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 18, borderRadius: 10 },
  subOn: { backgroundColor: C.soft },
  subText: { flex: 1, fontSize: 13, color: C.ink },
  subTextOn: { fontWeight: '600', color: C.blue },
  searchIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Maple.disabledBorder,
  },
  topTabs: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2 },
  topTab: { width: TOP_TAB_W, height: 58, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 10 },
  topTabOn: { backgroundColor: C.soft },
  topTabText: { fontSize: 11, color: C.ink },
  topTabTextOn: { fontWeight: '600', color: C.blue },
  topLine: { position: 'absolute', left: 14, right: 14, bottom: -5, height: 3, borderRadius: 2, backgroundColor: C.blue },
  menuScrim: { flex: 1, alignItems: 'flex-end', paddingTop: HEADER, paddingRight: 24 },
  menu: {
    width: 260,
    maxHeight: 520,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
    shadowColor: Maple.navyDeep,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  menuList: { paddingVertical: 8 },
  drawerRoot: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(11,26,63,0.35)' },
  drawer: { width: 290, backgroundColor: C.white },
  drawerHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  premium: { gap: 8, margin: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  premiumHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  premiumTitle: { fontSize: 15, fontWeight: '800', color: C.navy },
  premiumText: { fontSize: 12, lineHeight: 16, color: C.body },
  premiumBtn: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: Radii.control,
    backgroundColor: C.purple,
  },
  premiumBtnText: { fontSize: 13.5, fontWeight: '700', color: C.white },
});
