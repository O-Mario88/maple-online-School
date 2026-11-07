import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bell, DeskHost, PhoneTop } from '@/features/portal/PortalFrame';
import type { PortalTab } from '@/features/portal/PortalFrame';
import { BLUE, BODY, CANVAS, LINE, MUTED, NAVY, WHITE } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';
import { useSwitcher } from '@/lib/switcher-context';
import { toast } from '@/lib/toast';
import { openMenuPage } from '@/lib/menu-nav';

import { SIDEBAR, SIDEBAR_ACTIVE, SIDEBAR_TEXT } from './tokens';
import { Maple } from '@/constants/maple';
import { MapleLogo } from '@/components/brand/MapleLogo';
import { PAGE_TITLE } from '@/lib/fonts/type';


export interface CmdMe {
  name: string;
  role: string;
  avatar: number;
  notifications: number;
}

export interface NavChild {
  label: string;
  href?: string;
  count?: number;
}

export interface NavGroup {
  label: string;
  icon: IconName;
  href?: string;
  children?: readonly NavChild[];
}

/** The Maple Command sidebar, shared by every page. Items without a page of their own open the closest one. */
export const CMD_NAV: readonly NavGroup[] = [
  { label: 'Overview', icon: 'home', href: '/command/overview' },
  { label: 'Users & Growth', icon: 'people', href: '/command/overview' },
  { label: 'Institutions', icon: 'building', href: '/command/institutions' },
  { label: 'Schools', icon: 'school', href: '/command/institutions' },
  { label: 'Classes (Live)', icon: 'screen', href: '/command/ops' },
  { label: 'Curricula', icon: 'book', href: '/command/curricula' },
  { label: 'Learning & Academic', icon: 'library', href: '/command/curricula' },
  { label: 'Engagement', icon: 'sparkle', href: '/command/overview' },
  { label: 'Commerce (GMV)', icon: 'cart', href: '/command/finance/revenue' },
  { label: 'Retention', icon: 'sync', href: '/command/overview' },
  { label: 'Regions', icon: 'globe', href: '/command/institutions' },
  { label: 'Reports', icon: 'chart', href: '/command/overview' },
  {
    label: 'Finance',
    icon: 'wallet',
    children: [
      { label: 'Revenue & Escrow', href: '/command/finance/revenue' },
      { label: 'Subscriptions', href: '/command/finance/subscriptions' },
      { label: 'Transactions', href: '/command/finance/transactions' },
      { label: 'Settlements', href: '/command/finance/settlements' },
      { label: 'Receivables', href: '/command/finance/receivables' },
      { label: 'Revenue Recognition', href: '/command/finance/revenue-recognition' },
      { label: 'Contracts', href: '/command/finance/contracts' },
      { label: 'Payouts', href: '/command/finance/payouts' },
      { label: 'Teacher Payables', href: '/command/finance/teacher-payables' },
      { label: 'Invoices', href: '/command/finance/invoices' },
      { label: 'Expenses', href: '/command/finance/expenses' },
      { label: 'Payroll', href: '/command/finance/payroll' },
      { label: 'General Ledger', href: '/command/finance/accounting' },
      { label: 'Forecasting', href: '/command/finance/forecast' },
      { label: 'Reports', href: '/command/finance/reports' },
      { label: 'Profitability', href: '/command/finance/profitability' },
      { label: 'Integrations', href: '/command/finance/integrations' },
      { label: 'Tax & Compliance', href: '/command/finance/tax' },
    ],
  },
  {
    label: 'Operations',
    icon: 'settings',
    children: [{ label: 'System Operations', href: '/command/ops' }, { label: 'LiveKit Health', href: '/command/ops' }, { label: 'Job Queues (River)', href: '/command/ops' }, { label: 'Infrastructure', href: '/command/ops' }, { label: 'Alerts & Incidents', href: '/command/ops' }],
  },
  {
    label: 'Security',
    icon: 'shield',
    children: [
      { label: 'Security Dashboard', href: '/command/security' },
      { label: 'Audit Logs', href: '/command/security/audit-logs' },
      { label: 'Data Requests', href: '/command/security/data-requests' },
      { label: 'Support Escalations', href: '/command/security/support' },
    ],
  },
  {
    label: 'Trust & Safety',
    icon: 'verified',
    href: '/command/trust',
    children: [
      { label: 'Verification Queue', href: '/command/trust-queue', count: 47 },
      { label: 'Flagged Content', href: '/command/trust', count: 12 },
      { label: 'Safeguarding Alerts', href: '/command/trust', count: 5 },
      { label: 'Appeals', href: '/command/trust', count: 3 },
      { label: 'Policy Rules' },
      { label: 'Audit Log', href: '/command/security/audit-logs' },
    ],
  },
  {
    label: 'Communications',
    icon: 'chat',
    children: [
      { label: 'Messages', href: '/command/communications' },
      { label: 'Announcements', href: '/command/communications/announcements' },
      { label: 'Broadcasts', href: '/command/communications/broadcasts' },
      { label: 'Templates' },
      { label: 'Notification Logs' },
    ],
  },
];

const go = (href: string | undefined, label: string) => (href ? openMenuPage(href as never) : toast(`${label} opens here in the next release.`));

/** One sidebar entry; a group opens its children while one of them is the current page. */
function SideGroup({ g, active, sub }: { g: NavGroup; active: string; sub?: string }) {
  const on = g.label === active;
  const open = on && !!g.children;
  return (
    <View>
      <Pressable
        style={({ hovered }) => [styles.item, on && styles.itemOn, hovered && !on && styles.itemHover]}
        onPress={() => go(g.href ?? g.children?.[0]?.href, g.label)}
        accessibilityRole="menuitem"
        accessibilityState={{ selected: on, expanded: g.children ? open : undefined }}
        accessibilityLabel={g.label}>
        <Icon name={g.icon} size={19} color={WHITE} />
        <Text style={[styles.itemText, on && styles.itemTextOn]} numberOfLines={1}>
          {g.label}
        </Text>
        {g.children ? <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} color={SIDEBAR_TEXT} /> : null}
      </Pressable>
      {open
        ? g.children?.map((c) => {
            const here = c.label === sub;
            return (
              <Pressable
                key={c.label}
                style={({ hovered }) => [styles.child, here && styles.childOn, hovered && !here && styles.itemHover]}
                onPress={() => go(c.href, c.label)}
                accessibilityRole="menuitem"
                accessibilityState={{ selected: here }}
                accessibilityLabel={c.count ? `${c.label}, ${c.count}` : c.label}>
                <Text style={styles.bullet}>•</Text>
                <Text style={[styles.childText, here && styles.itemTextOn]} numberOfLines={1}>
                  {c.label}
                </Text>
                {c.count ? (
                  <View style={[styles.count, here && styles.countOn]}>
                    <Text style={[styles.countText, here && styles.countTextOn]}>{c.count}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })
        : null}
    </View>
  );
}

/** The dark command sidebar: logo, sections, health and settings, and the platform status card. */
function CommandSide({ active, sub, nav, home, platform, footer }: { active: string; sub?: string; nav: readonly NavGroup[]; home: string; platform: boolean; footer?: ReactNode }) {
  return (
    <View style={styles.side} accessibilityRole="menu">
      <Pressable style={styles.logo} onPress={() => router.push(home as never)} accessibilityRole="link" accessibilityLabel="Maple home">
        <MapleLogo markStyle={styles.leaf} onDark />
      </Pressable>
      <View style={styles.items}>
        {nav.map((g) => (
          <SideGroup key={g.label} g={g} active={active} sub={sub} />
        ))}
      </View>
      {platform ? (
        <>
          <View style={styles.sideRule} />
          <Pressable style={({ hovered }) => [styles.item, hovered && styles.itemHover]} onPress={() => router.push('/command/ops' as never)} accessibilityRole="menuitem" accessibilityLabel="System Health: healthy">
            <Icon name="pulse" size={19} color={WHITE} />
            <Text style={styles.itemText}>System Health</Text>
            <View style={styles.healthDot} />
          </Pressable>
          <Pressable style={({ hovered }) => [styles.item, hovered && styles.itemHover]} onPress={() => toast('Platform settings: plans, regions, feature flags and admin roles.')} accessibilityRole="menuitem" accessibilityLabel="Settings">
            <Icon name="settings" size={19} color={WHITE} />
            <Text style={styles.itemText}>Settings</Text>
          </Pressable>
        </>
      ) : null}
      {footer ?? (
        <View style={styles.status} accessible accessibilityLabel="Platform status: all systems operational">
          <View style={styles.statusIcon}>
            <Icon name="check" size={15} color={WHITE} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.statusTitle}>Platform Status</Text>
            <Text style={styles.statusBody}>All systems operational</Text>
          </View>
        </View>
      )}
    </View>
  );
}

/** The green "Live" pill: data on the page is streaming in. */
export function LivePill({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.live, small && styles.liveSmall]} accessible accessibilityLabel="Live data">
      <View style={styles.liveDot} />
      <Text style={[styles.liveText, small && styles.liveTextSmall]}>Live</Text>
    </View>
  );
}

/** The admin at the top right; opens the mode switcher. */
function CmdMeChip({ me }: { me: CmdMe }) {
  const switcher = useSwitcher();
  return (
    <Pressable style={styles.me} onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${me.name}, ${me.role}. Switch mode`}>
      <Image decorative source={me.avatar} style={styles.meAvatar} contentFit="cover" />
      <View>
        <Text style={styles.meName}>{me.name}</Text>
        <Text style={styles.meRole}>{me.role}</Text>
      </View>
      <Icon name="chevronDown" size={16} color={NAVY} />
    </Pressable>
  );
}

function CommandTopBar({ search, me }: { search: string; me: CmdMe }) {
  return (
    <View style={styles.top}>
      <Pressable onPress={() => toast('Command settings: alert routing, dashboards and admin roles.')} accessibilityRole="button" accessibilityLabel="Command settings" hitSlop={8}>
        <Icon name="settings" size={22} color={BLUE} />
      </Pressable>
      <View style={styles.search}>
        <Icon name="search" size={18} color={BODY} />
        <TextInput style={styles.searchInput} placeholder={search} placeholderTextColor={MUTED} accessibilityLabel="Search Maple Command" />
        <Text style={styles.kbd}>⌘ K</Text>
      </View>
      <View style={styles.flex} />
      <LivePill />
      <Bell count={me.notifications} size={25} />
      <CmdMeChip me={me} />
    </View>
  );
}

/**
 * A dark-sidebar desktop page: the sidebar, the top bar and the page. Maple Command uses its own
 * menu; school accounting pages pass theirs with `nav` and `home`.
 */
export function CommandDesk({
  me,
  search,
  active,
  sub,
  children,
  nav = CMD_NAV,
  home = '/command/overview',
  top,
  footer,
  width,
}: {
  me: CmdMe;
  search: string;
  active: string;
  sub?: string;
  children: ReactNode;
  nav?: readonly NavGroup[];
  home?: string;
  /** Replaces the command top bar (the Platform Finance workspace has its own). */
  top?: ReactNode;
  /** Replaces the sidebar's platform status card. */
  footer?: ReactNode;
  /** Lay the page out at this reference width and scale it to the window (the finance references are 1672 wide). */
  width?: number;
}) {
  return (
    <DeskHost minWidth={width}>
      <View style={styles.desk}>
        <CommandSide active={active} sub={sub} nav={nav} home={home} platform={nav === CMD_NAV} footer={footer} />
        <View style={styles.column}>
          {top ?? <CommandTopBar search={search} me={me} />}
          <View style={styles.main}>{children}</View>
        </View>
      </View>
    </DeskHost>
  );
}

/** The page title block: icon, "Maple Command › Section", the title and its line, and controls on the right. */
export function CmdHead({ icon, title, subtitle, section, right, root = 'Maple Command' }: { icon: IconName; title: string; subtitle: string; section?: string; right?: ReactNode; root?: string }) {
  return (
    <View style={styles.head}>
      <View style={styles.headIcon}>
        <Icon name={icon} size={34} color={BLUE} />
      </View>
      <View style={styles.flex}>
        <View style={styles.crumbs}>
          <Text style={styles.crumb}>{root}</Text>
          {section ? (
            <>
              <Icon name="chevronRight" size={12} color={MUTED} />
              <Text style={styles.crumbOn}>{section}</Text>
            </>
          ) : null}
        </View>
        <Text style={styles.title} {...PAGE_TITLE} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      {right ? <View style={styles.headRight}>{right}</View> : null}
    </View>
  );
}

/** A Maple Command phone page: header, scrolling body and an optional fixed footer. */
export function CommandPhone({ me, children, footer }: { me: CmdMe; children: ReactNode; footer?: ReactNode }) {
  const switcher = useSwitcher();
  return (
    <View style={styles.phoneRoot}>
      <PhoneTop
        right={
          <>
            <Bell count={me.notifications} size={26} />
            <Pressable onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${me.name}. Switch mode`}>
              <Image decorative source={me.avatar} style={styles.phoneAvatar} contentFit="cover" />
            </Pressable>
          </>
        }
      />
      <ScrollView contentContainerStyle={styles.phoneScroll} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

export { isCommandRefPath } from '@/lib/portal-frame';

/** The command phone tab bar: Overview, Trust, this page's section, Finance or Security, and More. */
export function commandTabs(path: string): readonly PortalTab[] {
  const overview: PortalTab = { label: 'Overview', icon: 'home', href: '/command/overview' };
  const trust: PortalTab = { label: 'Trust', icon: 'verified', href: path.startsWith('/command/trust') ? path : '/command/trust-queue', badge: 47 };
  const schools: PortalTab = { label: 'Schools', icon: 'building', href: '/command/institutions' };
  const finance: PortalTab = { label: 'Finance', icon: 'wallet', href: path.startsWith('/command/finance') ? path : '/command/finance/revenue' };
  const security: PortalTab = { label: 'Security', icon: 'shield', href: path.startsWith('/command/security') ? path : '/command/security' };
  const more: PortalTab = { label: 'More', icon: 'more', href: '/more' };
  if (path.startsWith('/command/security')) return [overview, trust, schools, security, more];
  if (path === '/command/ops') return [overview, trust, { label: 'Ops', icon: 'pulse', href: path }, finance, more];
  if (path.startsWith('/command/communications')) return [overview, trust, { label: 'Messages', icon: 'chat', href: path }, finance, more];
  if (path === '/command/curricula') return [overview, trust, { label: 'Curricula', icon: 'book', href: path }, finance, more];
  return [overview, trust, schools, finance, more];
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  desk: { flexDirection: 'row', flex: 1, minHeight: '100%', backgroundColor: CANVAS },
  side: { width: 214, paddingTop: 14, paddingHorizontal: 12, paddingBottom: 18, backgroundColor: SIDEBAR },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 6, marginBottom: 18 },
  leaf: { width: 38, height: 38 },
  brand: { fontSize: 22, fontWeight: '800', color: WHITE, lineHeight: 25 },
  brandSub: { fontSize: 11.5, fontWeight: '600', color: WHITE },
  items: { gap: 1 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 37, paddingHorizontal: 9, borderRadius: 9 },
  itemOn: { backgroundColor: SIDEBAR_ACTIVE },
  itemHover: { backgroundColor: 'rgba(255,255,255,0.07)' },
  itemText: { flex: 1, minWidth: 0, fontSize: 14, color: WHITE },
  itemTextOn: { fontWeight: '700', color: WHITE },
  child: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 31, marginTop: 2, marginLeft: 4, paddingHorizontal: 8, borderRadius: 8 },
  childOn: { backgroundColor: SIDEBAR_ACTIVE },
  childText: { flex: 1, minWidth: 0, fontSize: 12.5, color: SIDEBAR_TEXT },
  bullet: { fontSize: 13, color: SIDEBAR_TEXT },
  count: { minWidth: 22, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center' },
  countOn: { backgroundColor: WHITE },
  countText: { fontSize: 11.5, fontWeight: '700', color: WHITE },
  countTextOn: { color: NAVY },
  sideRule: { height: 1, marginVertical: 12, backgroundColor: 'rgba(255,255,255,0.12)' },
  healthDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Maple.success },
  status: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 'auto', padding: 11, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statusIcon: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.successText },
  statusTitle: { fontSize: 13, fontWeight: '700', color: WHITE },
  statusBody: { marginTop: 2, fontSize: 11.5, color: SIDEBAR_TEXT },
  column: { flex: 1, minWidth: 0 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16, height: 62, paddingHorizontal: 22, backgroundColor: WHITE, borderBottomWidth: 1, borderColor: LINE },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 600, height: 38, paddingHorizontal: 14, borderRadius: 10, backgroundColor: Maple.blueSoft },
  searchInput: { flex: 1, minWidth: 0, height: 38, paddingVertical: 0, fontSize: 13.5, color: NAVY },
  kbd: { fontSize: 12, color: BODY },
  live: { flexDirection: 'row', alignItems: 'center', gap: 7, height: 32, paddingHorizontal: 12, borderRadius: 8, backgroundColor: Maple.successSoft },
  liveSmall: { height: 28, paddingHorizontal: 9 },
  liveDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Maple.successText },
  liveText: { fontSize: 14, fontWeight: '600', color: Maple.successText },
  liveTextSmall: { fontSize: 13 },
  me: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeftWidth: 1, borderColor: LINE },
  meAvatar: { width: 44, height: 44, borderRadius: 22 },
  meName: { fontSize: 14.5, fontWeight: '700', color: NAVY },
  meRole: { marginTop: 1, fontSize: 12.5, color: BODY },
  main: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30, gap: 14 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 8 },
  headIcon: { width: 48, alignItems: 'center' },
  crumbs: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  crumb: { fontSize: 12.5, color: NAVY },
  crumbOn: { fontSize: 12.5, color: BODY },
  title: { marginTop: 1, fontSize: 28, fontWeight: '800', color: NAVY, letterSpacing: -0.4 },
  subtitle: { marginTop: 2, fontSize: 14.5, color: BODY },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  phoneRoot: { flex: 1, backgroundColor: CANVAS },
  phoneScroll: { padding: 16, paddingBottom: 30, gap: 14 },
  phoneAvatar: { width: 42, height: 42, borderRadius: 21 },
});
