/**
 * The Platform Finance workspace (Maple Command › Finance): its sidebar, top bar, page head, pill
 * tabs, tinted KPI cards and the small panels its pages share. Every finance desktop page sits in
 * FinDesk; every phone page in FinPhone.
 */
import { Image } from '@/components/picture';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, type StyleProp, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import { type Kpi, KpiGrid } from '@/features/command/kit/CmdParts';
import { CommandDesk, CommandPhone, type NavGroup } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { Bell } from '@/features/portal/PortalFrame';
import { BLUE, BODY, GREEN, LINE, MUTED, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { Donut, DonutLabel } from '@/features/school/kit/Charts';
import { PageHead } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { useSwitcher } from '@/lib/switcher-context';
import { toast } from '@/lib/toast';
import { Maple } from '@/constants/maple';

const F = '/command/finance';
/** The finance references are drawn 1672 wide; pages lay out at that width and scale to the window. */
export const FIN_WIDTH = 1672;

/** The Platform Finance sidebar from the references. Items without a page of their own open the closest one. */
export const FIN_NAV: readonly NavGroup[] = [
  { label: 'Dashboard', icon: 'home', href: '/command/overview' },
  { label: 'Users & Institutions', icon: 'people', href: '/command/institutions' },
  { label: 'Learning & Content', icon: 'book', href: '/command/curricula' },
  { label: 'Marketplace', icon: 'cart', href: `${F}/revenue` },
  {
    label: 'Finance',
    icon: 'wallet',
    children: [
      { label: 'Finance Home', href: `${F}/revenue` },
      { label: 'Auto Accountant', href: `${F}/accounting` },
      { label: 'Revenue & Earnings', href: `${F}/revenue` },
      { label: 'Subscriptions', href: `${F}/subscriptions` },
      { label: 'Transactions', href: `${F}/transactions` },
      { label: 'Settlements', href: `${F}/settlements` },
      { label: 'Receivables', href: `${F}/receivables` },
      { label: 'Revenue Recognition', href: `${F}/revenue-recognition` },
      { label: 'Contracts', href: `${F}/contracts` },
      { label: 'Teacher Payables', href: `${F}/teacher-payables` },
      { label: 'Treasury', href: `${F}/forecast` },
      { label: 'Expenses', href: `${F}/expenses` },
      { label: 'Payroll', href: `${F}/payroll` },
      { label: 'Accounting', href: `${F}/accounting` },
      { label: 'Forecasting', href: `${F}/forecast` },
      { label: 'Reports', href: `${F}/reports` },
      { label: 'Close & Periods', href: `${F}/accounting` },
      { label: 'Profitability', href: `${F}/profitability` },
      { label: 'Integrations', href: `${F}/integrations` },
      { label: 'Tax & Compliance', href: `${F}/tax` },
    ],
  },
  { label: 'Settings', icon: 'settings' },
];

type Me = CommandData['platformFinance']['me'];

/** The finance top bar: menu, search, the Platform Finance workspace chip, alerts, help and the director. */
function FinTopBar({ search, me }: { search: string; me: Me }) {
  const switcher = useSwitcher();
  return (
    <View style={styles.top}>
      <Pressable onPress={() => toast('Collapse or expand the finance menu.')} accessibilityRole="button" accessibilityLabel="Menu" hitSlop={8}>
        <Icon name="menu" size={24} color={BLUE} />
      </Pressable>
      <View style={styles.search}>
        <Icon name="search" size={18} color={BLUE} />
        <TextInput style={styles.searchInput} placeholder={search} placeholderTextColor={MUTED} accessibilityLabel="Search finance" />
      </View>
      <View style={styles.flex} />
      <Pressable style={styles.chip} onPress={() => toast('Workspaces: Platform Finance, Maple Command and Institution Finance.')} accessibilityRole="button" accessibilityLabel="Workspace: Platform Finance">
        <Icon name="globe" size={17} color={BLUE} />
        <Text style={styles.chipText}>Platform Finance</Text>
        <Icon name="chevronDown" size={14} color={NAVY} />
      </Pressable>
      <Bell count={me.notifications} size={25} />
      <Pressable onPress={() => toast('Finance help: guides, close checklist and the finance team.')} accessibilityRole="button" accessibilityLabel="Help" hitSlop={8}>
        <Icon name="help" size={24} color={BLUE} />
      </Pressable>
      <Pressable style={styles.me} onPress={switcher?.open} accessibilityRole="button" accessibilityLabel={`${me.name}, ${me.role}. Switch mode`}>
        <Image source={me.avatar} style={styles.meAvatar} contentFit="cover" />
        <View>
          <Text style={styles.meName}>{me.name}</Text>
          <Text style={styles.meRole}>{me.role}</Text>
        </View>
        <Icon name="chevronDown" size={16} color={NAVY} />
      </Pressable>
    </View>
  );
}

export interface Promo {
  icon: IconName;
  color: string;
  title: string;
  body: string;
}

function FinPromo({ p }: { p: Promo }) {
  return (
    <View style={styles.promo} accessible accessibilityLabel={`${p.title}. ${p.body}`}>
      <View style={[styles.promoIcon, { backgroundColor: p.color }]}>
        <Icon name={p.icon} size={30} color={WHITE} />
      </View>
      <Text style={styles.promoTitle}>{p.title}</Text>
      <Text style={styles.promoBody}>{p.body}</Text>
    </View>
  );
}

/** A Platform Finance desktop page. */
export function FinDesk({ c, sub, search, promo, children }: { c: CommandData; sub: string; search: string; promo: Promo; children: ReactNode }) {
  const me = c.platformFinance.me;
  return (
    <CommandDesk me={me} search={search} active="Finance" sub={sub} nav={FIN_NAV} top={<FinTopBar search={search} me={me} />} footer={<FinPromo p={promo} />} width={FIN_WIDTH}>
      {children}
    </CommandDesk>
  );
}

/** The page head: the blue tile, the title and its line, and the page's buttons. */
export function FinHead({ icon, title, subtitle, right }: { icon: IconName; title: string; subtitle: string; right?: ReactNode }) {
  return (
    <View style={styles.head}>
      <View style={styles.headIcon}>
        <Icon name={icon} size={30} color={WHITE} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.title} accessibilityRole="header" numberOfLines={1}>
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

/** Pill tabs on a white strip; the current one is filled blue. */
export function FinTabs({ tabs, active, onChange, phone = false }: { tabs: readonly string[]; active: string; onChange: (t: string) => void; phone?: boolean }) {
  const row = (
    <View style={[styles.tabs, phone && styles.tabsPhone]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t === active;
        return (
          <Pressable key={t} style={[styles.tab, on && styles.tabOn]} onPress={() => onChange(t)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t}>
            <Text style={[styles.tabText, on && styles.tabTextOn]} numberOfLines={1}>
              {t}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
  return phone ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  ) : (
    row
  );
}

/** One tinted KPI card: icon, label, the figure in its colour, a change pill and a line under it. */
/** `dense` tightens the card for rows of seven or more. */
export function FinStat({ k, style, dense = false }: { k: Kpi; style?: StyleProp<ViewStyle>; dense?: boolean }) {
  const t = TONES[k.tone];
  const valueColor = k.valueTone ? TONES[k.valueTone].text : NAVY;
  const deltaColor = k.down && !k.good ? RED : GREEN;
  return (
    <View style={[styles.stat, dense && styles.statDense, { backgroundColor: t.soft, borderColor: t.soft }, style]} accessible accessibilityLabel={`${k.label}: ${k.value}${k.delta ? `, ${k.down ? 'down' : 'up'} ${k.delta}` : ''}${k.caption ? `, ${k.caption}` : ''}`}>
      <Icon name={k.icon} size={26} color={t.solid} />
      <View style={styles.flex}>
        <Text style={styles.statLabel} numberOfLines={2}>
          {k.label}
        </Text>
        <View style={styles.statFoot}>
          <Text style={[styles.statValue, k.value.length > 13 && styles.statValueLong, dense && k.value.length > 13 && styles.statValueDense, { color: valueColor }]} numberOfLines={1}>
            {k.value}
          </Text>
          {k.caption ? (
            <Text style={[styles.statCaption, k.valueTone && { color: TONES[k.valueTone].text }]} numberOfLines={1}>
              {k.caption}
            </Text>
          ) : null}
          {k.delta ? (
            <View style={[styles.deltaPill, { backgroundColor: k.down && !k.good ? Maple.errorSoft : Maple.successSoft }]}>
              <Icon name={k.down ? 'arrowDown' : 'arrowUp'} size={11} color={deltaColor} />
              <Text style={[styles.deltaText, { color: deltaColor }]}>{k.delta}</Text>
            </View>
          ) : null}
        </View>
        {k.progress !== undefined ? (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.round(k.progress * 100)}%`, backgroundColor: t.solid }]} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** Cards share the row by how much they hold, as in the references (a long money figure gets more room). */
const DENSE_FROM = 7;
const statWeight = (k: Kpi) => Math.max(1, (Math.max(k.value.length, k.label.length * 0.62, (k.caption?.length ?? 0) * 0.85) + (k.delta ? 1 : 0)) / 12);

/** The KPI row on desktop; premium tiles on phones. */
export function FinStats({ items, phone = false, title }: { items: readonly Kpi[]; phone?: boolean; title?: string }) {
  if (phone) return <KpiGrid items={items} title={title ?? 'Key Metrics'} subtitle="The headline numbers for this period." />;
  return (
    <View style={styles.stats}>
      {items.map((k) => (
        <FinStat key={k.label} k={k} dense={items.length >= DENSE_FROM} style={{ flex: statWeight(k), minWidth: 0 }} />
      ))}
    </View>
  );
}

/** A white panel with a blue icon, a heavy title and optional controls. */
export function FinPanel({ icon, title, right, children, style, onAll, allLabel = 'View All' }: { icon: IconName; title: string; right?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle>; onAll?: () => void; allLabel?: string }) {
  return (
    <View style={[styles.panel, style]}>
      <View style={styles.panelHead}>
        <Icon name={icon} size={20} color={BLUE} />
        <Text style={[styles.panelTitle, styles.flex]} numberOfLines={2}>
          {title}
        </Text>
        {right}
        {onAll ? (
          <Pressable style={styles.allLink} onPress={onAll} accessibilityRole="link" accessibilityLabel={`${allLabel}: ${title}`} hitSlop={6}>
            <Text style={styles.allText}>{allLabel}</Text>
            <Icon name="arrowRight" size={13} color={BLUE} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export interface Part {
  label: string;
  value: number;
  color: string;
  /** What to print instead of the raw value. */
  display?: string;
}

/** A ring with its total in the middle and a legend of label, value and share. */
export function RingLegend({ parts, center, caption, size = 150, phone = false, pct = true, compact = false }: { parts: readonly Part[]; center: string; caption: string; size?: number; phone?: boolean; pct?: boolean; compact?: boolean }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <View style={[styles.ring, compact && styles.ringCompact, phone && styles.ringPhone]}>
      <Donut slices={parts.map((p) => ({ value: p.value, color: p.color }))} size={size} stroke={22}>
        <DonutLabel value={center} caption={caption} size={center.length > 7 ? 15 : 19} />
      </Donut>
      <View style={[styles.flex, styles.legend]}>
        {parts.map((p) => (
          <View key={p.label} style={styles.legendRow}>
            <View style={[styles.dot, { backgroundColor: p.color }]} />
            <Text style={[styles.legendLabel, compact && styles.small, styles.flex]} numberOfLines={2}>
              {p.label}
            </Text>
            {p.display ? <Text style={[styles.legendValue, compact && styles.small]}>{p.display}</Text> : null}
            {pct ? <Text style={[styles.legendPct, compact && styles.smallPct]}>{`${((p.value / total) * 100).toFixed(1)}%`}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export type Mark = 'ok' | 'warn' | 'fail' | 'info';
const MARK: Readonly<Record<Mark, { icon: IconName; color: string }>> = {
  ok: { icon: 'check', color: GREEN },
  warn: { icon: 'alert', color: Maple.warning },
  fail: { icon: 'close', color: RED },
  info: { icon: 'info', color: BLUE },
};

/** Ticked insight lines with an optional figure on the right. */
export function CheckList({ items }: { items: readonly { mark: Mark; text: string; right?: string; rightTone?: Tone }[] }) {
  return (
    <View style={styles.checks}>
      {items.map((it) => (
        <View key={it.text} style={styles.checkRow}>
          <View style={[styles.checkMark, { borderColor: MARK[it.mark].color }]}>
            <Icon name={MARK[it.mark].icon} size={12} color={MARK[it.mark].color} />
          </View>
          <Text style={[styles.checkText, styles.flex]}>{it.text}</Text>
          {it.right ? <Text style={[styles.checkRight, it.rightTone && { color: TONES[it.rightTone].text }]}>{it.right}</Text> : null}
        </View>
      ))}
    </View>
  );
}

/** Square action buttons in a grid. */
export function ActionGrid({ items, columns = 3 }: { items: readonly { icon: IconName; label: string; tone?: Tone; onPress: () => void }[]; columns?: number }) {
  return (
    <View style={styles.actions}>
      {items.map((a) => {
        const t = TONES[a.tone ?? 'blue'];
        return (
          <Pressable key={a.label} style={({ hovered }) => [styles.action, { width: `${100 / columns - 2}%`, backgroundColor: t.soft }, hovered && styles.hover]} onPress={a.onPress} accessibilityRole="button" accessibilityLabel={a.label}>
            <Icon name={a.icon} size={22} color={t.solid} />
            <Text style={styles.actionText}>{a.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Label and figure on one line, for summaries; `strong` gives the total row its green band. */
export function SumLine({ label, value, tone, strong = false, icon }: { label: string; value: string; tone?: Tone; strong?: boolean; icon?: IconName }) {
  return (
    <View style={[styles.sum, strong && styles.sumStrong]}>
      {icon ? <Icon name={icon} size={16} color={tone ? TONES[tone].solid : BLUE} /> : null}
      <Text style={[styles.sumLabel, strong && styles.sumLabelStrong, styles.flex]} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.sumValue, strong && styles.sumLabelStrong, tone && { color: TONES[tone].text }]}>{value}</Text>
    </View>
  );
}

/** A Platform Finance phone page. */
export function FinPhone({ c, title, subtitle, children, footer, onBack }: { c: CommandData; title: string; subtitle: string; children: ReactNode; footer?: ReactNode; onBack?: () => void }) {
  return (
    <CommandPhone me={c.platformFinance.me} footer={footer}>
      <PageHead title={title} subtitle={subtitle} phone onBack={onBack} />
      {children}
    </CommandPhone>
  );
}

/** A tappable phone card: title, a pill, a line and an amount. */
export function PhoneRow({ title, sub, right, pill, onPress, lead }: { title: string; sub: string; right?: string; pill?: ReactNode; onPress?: () => void; lead?: ReactNode }) {
  return (
    <Pressable style={styles.card} onPress={onPress} disabled={!onPress} accessibilityRole={onPress ? 'button' : undefined} accessibilityLabel={`${title}, ${sub}${right ? `, ${right}` : ''}`}>
      {lead}
      <View style={[styles.flex, styles.cardBody]}>
        <View style={styles.inline}>
          <Text style={[styles.cardTitle, styles.flex]}>{title}</Text>
          {pill}
        </View>
        <View style={styles.inline}>
          <Text style={[styles.cardSub, styles.flex]}>{sub}</Text>
          {right ? <Text style={styles.cardRight}>{right}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

/** A payment provider's letter on its colour (not the provider's own mark). */
export function ProviderBadge({ name, color, size = 22 }: { name: string; color: string; size?: number }) {
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 4, backgroundColor: color }]} accessible={false}>
      <Text style={[styles.badgeText, { fontSize: size * 0.5 }]}>{name.replace(/^MTN /, 'M')[0]}</Text>
    </View>
  );
}

/** "UGX 4,862,750,000". */
export const ugx = (n: number): string => `${n < 0 ? '−' : ''}UGX ${Math.abs(Math.round(n)).toLocaleString('en-US')}`;
/** "4,862,750,000". */
export const num = (n: number): string => Math.round(n).toLocaleString('en-US');
/** "UGX 468.8M", "UGX 4.86B". */
export function short(n: number): string {
  const a = Math.abs(n);
  const sign = n < 0 ? '−' : '';
  if (a >= 1e9) return `${sign}UGX ${(a / 1e9).toFixed(2)}B`;
  if (a >= 1e6) return `${sign}UGX ${(a / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${sign}UGX ${Math.round(a / 1e3)}K`;
  return `${sign}UGX ${a}`;
}
export const millions = (n: number): string => (n ? `${Math.round(n)}M` : '0');

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hover: { opacity: 0.85 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 18, height: 62, paddingHorizontal: 22, backgroundColor: WHITE, borderBottomWidth: 1, borderColor: LINE },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, width: 640, height: 38, paddingHorizontal: 14, borderRadius: 10, backgroundColor: Maple.blueSoft },
  searchInput: { flex: 1, minWidth: 0, height: 38, paddingVertical: 0, fontSize: 13.5, color: NAVY },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, height: 36, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  chipText: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  me: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 14, borderLeftWidth: 1, borderColor: LINE },
  meAvatar: { width: 44, height: 44, borderRadius: 22 },
  meName: { fontSize: 14.5, fontWeight: '700', color: NAVY },
  meRole: { marginTop: 1, fontSize: 12.5, color: BODY },
  promo: { alignItems: 'center', gap: 8, marginTop: 'auto', paddingVertical: 18, paddingHorizontal: 12, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  promoIcon: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  promoTitle: { fontSize: 18, lineHeight: 22, fontWeight: '800', color: WHITE, textAlign: 'center' },
  promoBody: { fontSize: 12.5, lineHeight: 18, color: Maple.blueLine, textAlign: 'center' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 4 },
  headIcon: { width: 58, height: 58, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  title: { fontSize: 27, fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  subtitle: { marginTop: 2, fontSize: 15, color: NAVY },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tabs: { flexDirection: 'row', alignSelf: 'flex-start', gap: 2, padding: 4, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  tabsPhone: { alignSelf: 'auto' },
  tab: { paddingHorizontal: 18, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tabOn: { backgroundColor: BLUE },
  tabText: { fontSize: 14, fontWeight: '600', color: NAVY },
  tabTextOn: { color: WHITE },
  stats: { flexDirection: 'row', gap: 8 },
  stat: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, minHeight: 80, paddingVertical: 13, paddingHorizontal: 11, borderRadius: 12, borderWidth: 1 },
  statLabel: { fontSize: 13, fontWeight: '600', color: NAVY },
  statValue: { flexShrink: 0, maxWidth: '100%', fontSize: 21, fontWeight: '800', letterSpacing: -0.4 },
  statValueLong: { fontSize: 17 },
  statDense: { gap: 7, paddingHorizontal: 9 },
  statValueDense: { fontSize: 16 },
  statFoot: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 7, rowGap: 2, marginTop: 3 },
  statCaption: { fontSize: 12, fontWeight: '600', color: BODY },
  deltaPill: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  deltaText: { fontSize: 12, fontWeight: '800' },
  track: { height: 6, marginTop: 8, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.85)', overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  panel: { gap: 10, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  panelTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  allLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  allText: { fontSize: 12, fontWeight: '600', color: BLUE },
  ring: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  ringPhone: { flexDirection: 'column', alignItems: 'stretch' },
  ringCompact: { gap: 12 },
  small: { fontSize: 11 },
  smallPct: { width: 38, fontSize: 11 },
  legend: { gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12.5, color: NAVY },
  legendValue: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  legendPct: { width: 46, textAlign: 'right', fontSize: 12.5, color: BODY },
  checks: { gap: 10 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkMark: { width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkText: { fontSize: 12.5, color: NAVY },
  checkRight: { fontSize: 13, fontWeight: '700', color: NAVY },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: { alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 66, padding: 10, borderRadius: 12 },
  actionText: { fontSize: 11.5, fontWeight: '700', color: NAVY, textAlign: 'center' },
  sum: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 4 },
  sumStrong: { marginTop: 4, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 10, backgroundColor: Maple.successSoft },
  sumLabel: { fontSize: 12, color: NAVY },
  sumLabelStrong: { fontWeight: '800', fontSize: 13 },
  sumValue: { fontSize: 12, fontWeight: '700', color: NAVY },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cardBody: { gap: 5 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: NAVY },
  cardSub: { fontSize: 12, color: BODY },
  cardRight: { fontSize: 13.5, fontWeight: '800', color: NAVY },
  badge: { alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontWeight: '900', color: WHITE },
});
