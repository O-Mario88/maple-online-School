import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, type StyleProp, StyleSheet, Text, TextInput, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import { SchoolDesk, SchoolPhoneTop } from '@/features/portal/PortalFrame';
import { Bar, Card, CardHead, IconTile, Pill } from '@/features/portal/PortalParts';
import { PremiumTiles } from '@/features/portal/Premium';
import { BLUE, BODY, CANVAS, LINE, MUTED, NAVY, SOFT, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { NavItem } from '@/mock/portal';

/** Every school-admin page shares this sidebar; the current page is tinted blue. */
export const ADMIN_NAV: readonly NavItem[] = [
  { label: 'Dashboard', icon: 'home', href: '/' },
  { label: 'Students', icon: 'people', href: '/admin/rosters' },
  { label: 'Academics', icon: 'cap', href: '/admin/academics' },
  { label: 'Timetable', icon: 'calendar', href: '/admin/timetable' },
  { label: 'Attendance', icon: 'qr', href: '/admin/attendance' },
  { label: 'Report Cards', icon: 'clipboard', href: '/admin/report-cards' },
  { label: 'Library', icon: 'library', href: '/admin/library' },
  { label: 'Fees & Finance', icon: 'wallet', href: '/admin/finance/fees' },
  { label: 'Student Ledger', icon: 'doc', href: '/admin/finance/ledger' },
  { label: 'Accounting', icon: 'chart', href: '/admin/finance/accounting' },
  { label: 'Rosters', icon: 'columns', href: '/admin/rosters' },
  { label: 'Communication', icon: 'chat', href: '/messages' },
  { label: 'Settings', icon: 'settings', href: '/admin/settings' },
];

export interface AdminMe {
  name: string;
  role: string;
  avatar: number;
  initial: string;
  notifications: number;
}

/** A school-admin desktop page: the shared top bar and sidebar around the page. */
export function AdminDesk({ me, search, active, children }: { me: AdminMe; search: string; active: string; children: ReactNode }) {
  return (
    <SchoolDesk search={search} me={me} nav={ADMIN_NAV} active={active}>
      {children}
    </SchoolDesk>
  );
}

/** A school-admin phone page: header, scrolling body and an optional fixed footer. */
export function AdminPhone({ me, children, footer }: { me: AdminMe; children: ReactNode; footer?: ReactNode }) {
  return (
    <View style={styles.phoneRoot}>
      <SchoolPhoneTop initial={me.initial} notifications={me.notifications} />
      <ScrollView contentContainerStyle={styles.phoneScroll} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer}
    </View>
  );
}

/** A page title and its line, with controls (selectors, buttons) on the right. */
export function PageHead({ title, subtitle, right, phone = false, onBack }: { title: string; subtitle: string; right?: ReactNode; phone?: boolean; onBack?: () => void }) {
  return (
    <View style={[styles.head, phone && styles.headPhone]}>
      <View style={styles.flex}>
        <View style={styles.titleRow}>
          {onBack ? (
            <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" hitSlop={10}>
              <Icon name="arrowLeft" size={phone ? 24 : 28} color={NAVY} />
            </Pressable>
          ) : null}
          <Text style={[styles.title, phone && styles.titlePhone]} accessibilityRole="header">
            {title}
          </Text>
        </View>
        <Text style={[styles.subtitle, phone && styles.subtitlePhone]}>{subtitle}</Text>
      </View>
      {right ? <View style={styles.headRight}>{right}</View> : null}
    </View>
  );
}

/** A labelled pick-one box ("Academic Year / 2026"); tapping moves to the next option. */
export function SelectBox({
  label,
  value,
  options,
  onChange,
  width,
  style,
}: {
  label?: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  width?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const next = () => onChange(options[(options.indexOf(value) + 1) % options.length]);
  return (
    <Pressable
      style={[styles.select, label ? styles.selectTall : null, width ? { width } : null, style]}
      onPress={next}
      accessibilityRole="button"
      accessibilityLabel={`${label ?? 'Filter'}: ${value}. Tap to change`}>
      <View style={styles.flex}>
        {label ? <Text style={styles.selectLabel}>{label}</Text> : null}
        <Text style={[styles.selectValue, label ? styles.selectValueTall : null]} numberOfLines={1}>
          {value}
        </Text>
      </View>
      <Icon name="chevronDown" size={16} color={NAVY} />
    </Pressable>
  );
}

/** A pick-one filter kept in local state: [value, setValue, options]. */
export function useChoice(options: readonly string[], start = 0): [string, (v: string) => void, readonly string[]] {
  const [value, setValue] = useState(options[start]);
  return [value, setValue, options];
}

/** Filled segmented buttons ("Students | Teachers | Parents"). */
export function Segments({
  items,
  active,
  onChange,
  size = 15,
  stretch = false,
  style,
}: {
  items: readonly string[];
  active: string;
  onChange: (v: string) => void;
  size?: number;
  stretch?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.segments, stretch && styles.segmentsStretch, style]} accessibilityRole="tablist">
      {items.map((t) => {
        const on = t === active;
        return (
          <Pressable key={t} style={[styles.segment, stretch && styles.segmentStretch, on && styles.segmentOn]} onPress={() => onChange(t)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={t}>
            <Text style={[styles.segmentText, { fontSize: size }, on && styles.segmentTextOn]} numberOfLines={1}>
              {t}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export interface Stat {
  value: string;
  label: string;
  sub?: string;
  subTone?: Tone;
  icon: IconName;
  tone: Tone;
  progress?: number;
}

/** A tinted stat card: icon tile, big value, label and a line under it (optionally a bar). */
export function StatCard({ s, style, compact = false }: { s: Stat; style?: StyleProp<ViewStyle>; compact?: boolean }) {
  const t = TONES[s.tone];
  return (
    <View style={[styles.stat, compact && styles.statCompact, { backgroundColor: t.soft + '80', borderColor: t.soft }, style]}>
      <IconTile icon={s.icon} tone={s.tone} solid size={compact ? 34 : 44} radius={compact ? 9 : 12} />
      <View style={styles.flex}>
        <Text style={[styles.statValue, compact && styles.statValueCompact, compact && s.value.length > 9 && styles.statValueLong]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {s.value}
        </Text>
        <Text style={styles.statLabel} numberOfLines={1}>
          {s.label}
        </Text>
        {s.sub ? (
          <Text style={[styles.statSub, s.subTone && { color: TONES[s.subTone].text }]} numberOfLines={1}>
            {s.sub}
          </Text>
        ) : null}
        {s.progress !== undefined ? <Bar value={s.progress} color={t.solid} height={5} style={styles.statBar} /> : null}
      </View>
    </View>
  );
}

/** Stat cards in a row that shares the width. */
export function StatRow({ stats, compact = false }: { stats: readonly Stat[]; compact?: boolean }) {
  return (
    <View style={styles.statRow}>
      {stats.map((s) => (
        <StatCard key={s.label} s={s} compact={compact} style={styles.flex} />
      ))}
    </View>
  );
}

/** Stat cards two to a row (phones). */
export function StatGrid({ stats, title = 'At a Glance', subtitle = 'The key numbers for your school today.' }: { stats: readonly Stat[]; title?: string; subtitle?: string }) {
  return <PremiumTiles title={title} subtitle={subtitle} items={stats.map((s) => ({ label: s.label, value: s.value, icon: s.icon, tone: s.tone, caption: s.sub, captionTone: s.subTone, progress: s.progress }))} minHeight={150} />;
}

export interface Column<T> {
  label: string;
  /** Share of the width; use `width` for a fixed column instead. */
  flex?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render: (row: T, index: number) => ReactNode;
}

/** A plain text cell (navy when strong). */
export function Cell({ children, strong = false, color, lines, small = false }: { children: ReactNode; strong?: boolean; color?: string; lines?: number; small?: boolean }) {
  // Small (dense) cells may wrap to a second line rather than hide text.
  return (
    <Text style={[styles.td, small && styles.tdSmall, strong && styles.tdStrong, color ? { color } : null]} numberOfLines={lines ?? (small ? 2 : 1)}>
      {children}
    </Text>
  );
}

/** A status pill cell. */
export function StatusCell({ label, tone, icon }: { label: string; tone: Tone; icon?: IconName }) {
  return <Pill label={label} tone={tone} size={12.5} icon={icon} style={styles.statusPill} />;
}

/** A table with a header row, optional tick boxes and a ⋮ menu column. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  check = false,
  menu = false,
  onMenu,
  selected,
  onToggle,
  rowStyle,
  dense = false,
  compact = false,
  onRowPress,
  activeKey,
}: {
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  check?: boolean;
  menu?: boolean;
  onMenu?: (row: T) => void;
  selected?: ReadonlySet<string>;
  onToggle?: (key: string) => void;
  rowStyle?: (row: T) => StyleProp<ViewStyle>;
  dense?: boolean;
  /** Smaller type and rows, for the dense command-centre tables. */
  compact?: boolean;
  /** Tapping a row (outside its tick box and menu) opens it, e.g. in a details panel. */
  onRowPress?: (row: T) => void;
  /** The row shown in that panel, tinted. */
  activeKey?: string;
}) {
  const cellStyle = (c: Column<T>) => [c.width ? { width: c.width } : { flex: c.flex ?? 1 }, styles.cell, c.align === 'right' && styles.right, c.align === 'center' && styles.center];
  return (
    <View style={styles.table}>
      <View style={[styles.tr, styles.th, dense && styles.trDense, compact && styles.thCompact]}>
        {check ? <View style={styles.checkCol} /> : null}
        {columns.map((c) => (
          <View key={c.label} style={cellStyle(c)}>
            <Text style={[styles.thText, compact && styles.thTextCompact, c.align === 'right' && styles.textRight]} numberOfLines={2}>
              {c.label}
            </Text>
          </View>
        ))}
        {menu ? <View style={styles.menuCol} /> : null}
      </View>
      {rows.map((r, i) => {
        const key = rowKey(r);
        const on = selected?.has(key) ?? false;
        const Row = onRowPress ? Pressable : View;
        return (
          <Row
            key={key}
            style={[styles.tr, dense && styles.trDense, compact && styles.trCompact, (on || key === activeKey) && styles.trOn, rowStyle?.(r)]}
            {...(onRowPress ? { onPress: () => onRowPress(r), accessibilityState: { selected: key === activeKey }, accessibilityHint: 'Opens this row in the details panel' } : {})}>
            {check ? (
              <Pressable style={styles.checkCol} onPress={() => onToggle?.(key)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={`Select row ${i + 1}`} hitSlop={6}>
                <View style={[styles.box, on && styles.boxOn]}>{on ? <Icon name="check" size={13} color={WHITE} /> : null}</View>
              </Pressable>
            ) : null}
            {columns.map((c) => (
              <View key={c.label} style={cellStyle(c)}>
                {c.render(r, i)}
              </View>
            ))}
            {menu ? (
              <Pressable
                style={styles.menuCol}
                onPress={() => (onMenu ? onMenu(r) : toast('Edit, duplicate or archive this row.'))}
                accessibilityRole="button"
                accessibilityLabel={`Options for row ${i + 1}`}
                hitSlop={6}>
                <Icon name="more" size={20} color={BLUE} />
              </Pressable>
            ) : null}
          </Row>
        );
      })}
    </View>
  );
}

/** Tick-box state for a table: [selected keys, toggle one, clear]. */
export function useSelection(): [ReadonlySet<string>, (key: string) => void, () => void] {
  const [set, setSet] = useState<ReadonlySet<string>>(new Set());
  const toggle = (key: string) =>
    setSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  return [set, toggle, () => setSet(new Set())];
}

/** A search box. */
export function Search({ placeholder, value, onChange, style }: { placeholder: string; value?: string; onChange?: (v: string) => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.search, style]}>
      <Icon name="search" size={18} color={BODY} />
      <TextInput style={styles.searchInput} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={MUTED} accessibilityLabel={placeholder} />
    </View>
  );
}

/** A small white outlined button with an icon ("Import CSV", "Export"). */
export function MiniBtn({ label, icon, onPress, tone = 'blue', style }: { label: string; icon?: IconName; onPress: () => void; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  const c = TONES[tone].text;
  return (
    <Pressable
      style={({ hovered }) => [styles.mini, hovered && styles.miniHover, { borderColor: tone === 'red' ? '#F5C2C8' : '#C9DAF7' }, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      {icon ? <Icon name={icon} size={17} color={c} /> : null}
      <Text style={[styles.miniText, { color: c }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** A phone menu row: tinted icon tile, title, line and a chevron. */
export function MenuRow({ icon, tone, title, body, onPress, right }: { icon: IconName; tone: Tone; title: string; body: string; onPress: () => void; right?: ReactNode }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}: ${body}`}>
      <IconTile icon={icon} tone={tone} size={46} radius={12} />
      <View style={styles.flex}>
        <Text style={styles.menuTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.menuBody} numberOfLines={2}>
          {body}
        </Text>
      </View>
      {right}
      <Icon name="chevronRight" size={20} color={BLUE} />
    </Pressable>
  );
}

/** A card with a heading, an optional "View All", then rows. */
export function ListCard({ title, onAll, children, style, right }: { title: string; onAll?: () => void; children: ReactNode; style?: StyleProp<ViewStyle>; right?: ReactNode }) {
  return (
    <Card style={[styles.listCard, style]}>
      <CardHead title={title} size={18} link={onAll ? 'View All' : undefined} onLink={onAll} right={right} />
      {children}
    </Card>
  );
}

/** One row of a list card: a leading element, title and line, and something on the right. */
export function ListRow({ lead, title, body, right, last = false, onPress }: { lead?: ReactNode; title: string; body?: string; right?: ReactNode; last?: boolean; onPress?: () => void }) {
  const inner = (
    <>
      {lead}
      <View style={styles.flex}>
        <Text style={styles.listTitle} numberOfLines={2}>
          {title}
        </Text>
        {body ? (
          <Text style={styles.listBody} numberOfLines={2}>
            {body}
          </Text>
        ) : null}
      </View>
      {right}
    </>
  );
  return onPress ? (
    <Pressable style={({ hovered }) => [styles.listRow, !last && styles.listLine, hovered && styles.hover]} onPress={onPress} accessibilityRole="button" accessibilityLabel={title}>
      {inner}
    </Pressable>
  ) : (
    <View style={[styles.listRow, !last && styles.listLine]}>{inner}</View>
  );
}

/** A round photo. */
export function Face({ source, size = 36 }: { source: number; size?: number }) {
  return <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />;
}

/** A coloured legend dot with a label and an optional value on the right. */
export function Legend({ color, label, value, style }: { color: string; label: string; value?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.legend, style]}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel} numberOfLines={1}>
        {label}
      </Text>
      {value ? <Text style={styles.legendValue}>{value}</Text> : null}
    </View>
  );
}

/** A numbered workflow tracker ("1 Upload File — 2 Map Columns — …"); compact puts the label under the circle. */
export function Steps({ steps, current, done = [], compact = false, onPick }: { steps: readonly { title: string; body?: string }[]; current: number; done?: readonly number[]; compact?: boolean; onPick?: (i: number) => void }) {
  return (
    <View style={[styles.steps, compact && styles.stepsCompact]}>
      {steps.map((s, i) => {
        const on = i === current;
        const fin = done.includes(i);
        return (
          <View key={s.title} style={[styles.stepWrap, compact && styles.stepWrapCompact]}>
            {i > 0 && !compact ? <View style={styles.stepLine} /> : null}
            <Pressable style={[styles.step, compact && styles.stepCompact]} onPress={() => onPick?.(i)} disabled={!onPick} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={`Step ${i + 1}: ${s.title}`}>
              <View style={[styles.stepDot, compact && styles.stepDotCompact, on && styles.stepDotOn, fin && !on && styles.stepDotDone]}>
                {fin && !on ? <Icon name="check" size={18} color={WHITE} /> : <Text style={[styles.stepNum, on && styles.stepNumOn]}>{i + 1}</Text>}
              </View>
              <View style={compact ? styles.stepTextCompact : undefined}>
                <Text style={[styles.stepTitle, compact && styles.stepTitleCompact, on && compact && styles.stepTitleOn]} numberOfLines={1}>
                  {s.title}
                </Text>
                {s.body && !compact ? (
                  <Text style={styles.stepBody} numberOfLines={1}>
                    {s.body}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

/** The phone pages' blue call-to-action. */
export function BigButton({ label, onPress, icon, style }: { label: string; onPress: () => void; icon?: IconName; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable style={({ pressed }) => [styles.big, pressed && styles.pressed, style]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {icon ? <Icon name={icon} size={20} color={WHITE} /> : null}
      <Text style={styles.bigText}>{label}</Text>
      {icon ? null : <Icon name="arrowRight" size={20} color={WHITE} />}
    </Pressable>
  );
}

/** Pages through a table ("Showing 1–8 of 42 · ‹ 1 2 3 ›"). */
export function Pager({ pages, page, onPage, label }: { pages: number; page: number; onPage: (p: number) => void; label: string }) {
  return (
    <View style={styles.pagerRow}>
      <Text style={styles.pagerLabel}>{label}</Text>
      <View style={styles.pager}>
        <Pressable style={styles.pageBtn} onPress={() => onPage(Math.max(1, page - 1))} accessibilityRole="button" accessibilityLabel="Previous page">
          <Icon name="chevronLeft" size={16} color={BODY} />
        </Pressable>
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Pressable key={p} style={[styles.pageBtn, p === page && styles.pageBtnOn]} onPress={() => onPage(p)} accessibilityRole="button" accessibilityState={{ selected: p === page }} accessibilityLabel={`Page ${p}`}>
            <Text style={[styles.pageText, p === page && styles.pageTextOn]}>{p}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.pageBtn} onPress={() => onPage(Math.min(pages, page + 1))} accessibilityRole="button" accessibilityLabel="Next page">
          <Icon name="chevronRight" size={16} color={BODY} />
        </Pressable>
      </View>
    </View>
  );
}

/** Money as the references print it: "450,000". */
export function money(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hover: { backgroundColor: SOFT },
  pressed: { opacity: 0.85 },
  phoneRoot: { flex: 1, backgroundColor: CANVAS },
  phoneScroll: { gap: 16, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 32 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 18 },
  headPhone: { marginBottom: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 32, fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  titlePhone: { fontSize: 27 },
  subtitle: { marginTop: 4, fontSize: 15.5, color: BODY },
  subtitlePhone: { fontSize: 15, lineHeight: 21 },
  headRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  select: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 44, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE, minWidth: 110 },
  selectTall: { height: 56, minWidth: 150 },
  selectLabel: { fontSize: 12, color: BODY },
  selectValue: { fontSize: 13.5, fontWeight: '500', color: NAVY },
  selectValueTall: { marginTop: 2, fontSize: 15.5, fontWeight: '600' },
  segments: { flexDirection: 'row', alignSelf: 'flex-start', padding: 4, gap: 4, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  segmentsStretch: { alignSelf: 'stretch' },
  segment: { alignItems: 'center', justifyContent: 'center', height: 40, paddingHorizontal: 22, borderRadius: 9 },
  segmentStretch: { flexGrow: 1, flexShrink: 1, paddingHorizontal: 8 },
  segmentOn: { backgroundColor: BLUE },
  segmentText: { color: NAVY },
  segmentTextOn: { color: WHITE, fontWeight: '600' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  statCompact: { gap: 9, padding: 11, alignItems: 'flex-start' },
  statValue: { fontSize: 22, fontWeight: '800', color: NAVY },
  statValueCompact: { fontSize: 17.5 },
  statValueLong: { fontSize: 15.5, letterSpacing: -0.3 },
  statLabel: { marginTop: 1, fontSize: 13.5, color: BODY },
  statSub: { marginTop: 2, fontSize: 12, color: BODY, fontWeight: '500' },
  statBar: { marginTop: 6 },
  statRow: { flexDirection: 'row', gap: 14 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6, rowGap: 12 },
  half: { width: '50%', paddingHorizontal: 6 },
  table: { borderRadius: 12, borderWidth: 1, borderColor: LINE, overflow: 'hidden', backgroundColor: WHITE },
  tr: { flexDirection: 'row', alignItems: 'center', minHeight: 48, paddingHorizontal: 12, borderBottomWidth: 1, borderColor: LINE },
  trDense: { minHeight: 42 },
  trCompact: { minHeight: 34, paddingHorizontal: 10 },
  thCompact: { minHeight: 34 },
  thTextCompact: { fontSize: 12 },
  trOn: { backgroundColor: '#F1F6FF' },
  th: { minHeight: 44, backgroundColor: '#F3F6FC' },
  thText: { fontSize: 13, fontWeight: '600', color: NAVY },
  textRight: { textAlign: 'right' },
  cell: { minWidth: 0, paddingRight: 8, justifyContent: 'center' },
  right: { alignItems: 'flex-end' },
  center: { alignItems: 'center' },
  td: { fontSize: 13.5, color: BODY },
  tdSmall: { fontSize: 11.5 },
  tdStrong: { color: NAVY, fontWeight: '600' },
  statusPill: { paddingHorizontal: 9, paddingVertical: 4 },
  checkCol: { width: 30, justifyContent: 'center' },
  box: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: '#9AA7C4', alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE },
  boxOn: { backgroundColor: BLUE, borderColor: BLUE },
  menuCol: { width: 30, alignItems: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  searchInput: { flex: 1, minWidth: 0, height: 44, paddingVertical: 0, fontSize: 14.5, color: NAVY },
  mini: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 42, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, backgroundColor: WHITE },
  miniHover: { backgroundColor: SOFT },
  miniText: { fontSize: 14, fontWeight: '600' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  menuTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  menuBody: { marginTop: 2, fontSize: 13.5, color: BODY },
  listCard: { gap: 6, padding: 16 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  listLine: { borderBottomWidth: 1, borderColor: LINE },
  listTitle: { fontSize: 15, fontWeight: '600', color: NAVY },
  listBody: { marginTop: 2, fontSize: 13.5, color: BODY },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 11, height: 11, borderRadius: 6 },
  legendLabel: { flexShrink: 1, fontSize: 13.5, color: NAVY },
  legendValue: { marginLeft: 'auto', fontSize: 13.5, fontWeight: '700', color: NAVY },
  steps: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  stepsCompact: { paddingVertical: 12, paddingHorizontal: 6 },
  stepWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stepWrapCompact: { justifyContent: 'center' },
  stepLine: { flex: 1, height: 2, marginHorizontal: 14, backgroundColor: '#D7E2F3', minWidth: 20 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepCompact: { flexDirection: 'column', gap: 6 },
  stepDot: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: NAVY, backgroundColor: WHITE },
  stepDotCompact: { width: 36, height: 36, borderRadius: 18 },
  stepDotOn: { borderColor: BLUE, backgroundColor: BLUE },
  stepDotDone: { borderColor: '#16A34A', backgroundColor: '#16A34A' },
  stepNum: { fontSize: 17, fontWeight: '700', color: NAVY },
  stepNumOn: { color: WHITE },
  stepTextCompact: { alignItems: 'center' },
  stepTitle: { fontSize: 15, fontWeight: '600', color: NAVY },
  stepTitleCompact: { fontSize: 12.5, fontWeight: '500', color: BODY },
  stepTitleOn: { color: NAVY, fontWeight: '600' },
  stepBody: { fontSize: 12.5, color: BODY },
  big: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 12, backgroundColor: BLUE },
  bigText: { fontSize: 17, fontWeight: '600', color: WHITE },
  pagerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 },
  pagerLabel: { fontSize: 13.5, color: BODY },
  pager: { flexDirection: 'row', gap: 6 },
  pageBtn: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  pageBtnOn: { backgroundColor: BLUE, borderColor: BLUE },
  pageText: { fontSize: 13.5, color: NAVY },
  pageTextOn: { color: WHITE, fontWeight: '700' },
});
