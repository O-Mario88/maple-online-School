import { Image } from 'expo-image';
import { type ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Icon } from '@/components/icon';
import { Card } from '@/features/portal/PortalParts';
import { PremiumTiles } from '@/features/portal/Premium';
import { BLUE, BODY, GREEN, LINE, MUTED, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';

export interface Kpi {
  label: string;
  value: string;
  icon: IconName;
  tone: Tone;
  /** "↑ 24%" style change; `down` turns the arrow (red unless `good`). */
  delta?: string;
  down?: boolean;
  /** A fall that is good news (latency, response time). */
  good?: boolean;
  caption?: string;
  /** Colours the big value (Operational, Healthy). */
  valueTone?: Tone;
  /** 0–1: draws a progress bar under the value (tenant quota). */
  progress?: number;
}

/** A command stat card: tinted icon tile, label, big value, its change and a caption. */
export function CmdStat({ k, style, aside, phone = false }: { k: Kpi; style?: StyleProp<ViewStyle>; aside?: ReactNode; phone?: boolean }) {
  const t = TONES[k.tone];
  const deltaColor = k.down && !k.good ? RED : GREEN;
  return (
    <View style={[styles.stat, style]} accessible accessibilityLabel={`${k.label}: ${k.value}${k.delta ? `, ${k.delta}` : ''}${k.caption ? `, ${k.caption}` : ''}`}>
      <View style={[styles.statIcon, phone && styles.statIconPhone, { backgroundColor: t.soft }]}>
        <Icon name={k.icon} size={phone ? 22 : 30} color={t.solid} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.statLabel} numberOfLines={3}>
          {k.label}
        </Text>
        <Text style={[styles.statValue, k.valueTone && { color: TONES[k.valueTone].text }, k.value.length > 8 && styles.statValueLong, phone && styles.statValuePhone, phone && k.value.length > 7 && styles.statValuePhoneLong]} numberOfLines={1}>
          {k.value}
        </Text>
        {k.progress !== undefined ? (
          <View style={styles.statBarRow}>
            <View style={styles.statBar}>
              <View style={[styles.statBarFill, { width: `${Math.round(k.progress * 100)}%`, backgroundColor: t.solid }]} />
            </View>
            <Text style={styles.statBarText}>{`${Math.round(k.progress * 100)}%`}</Text>
          </View>
        ) : null}
        {k.delta ? (
          <View style={styles.deltaRow}>
            <Icon name={k.down ? 'arrowDown' : 'arrowUp'} size={13} color={deltaColor} />
            <Text style={[styles.delta, { color: deltaColor }]}>{k.delta}</Text>
          </View>
        ) : null}
        {k.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {k.caption}
          </Text>
        ) : null}
      </View>
      {aside}
    </View>
  );
}

/** Stat cards sharing a row. */
export function KpiRow({ items }: { items: readonly Kpi[] }) {
  return (
    <View style={styles.kpiRow}>
      {items.map((k) => (
        <CmdStat key={k.label} k={k} style={styles.flex} />
      ))}
    </View>
  );
}

/** Stat cards two to a row, for phones. */
export function KpiGrid({ items, title = 'Key Metrics', subtitle = 'The headline numbers for this period.' }: { items: readonly Kpi[]; title?: string; subtitle?: string }) {
  return <PremiumTiles title={title} subtitle={subtitle} items={items.map((k) => ({ label: k.label, value: k.value, icon: k.icon, tone: k.tone, delta: k.delta, down: k.down, good: k.good, caption: k.caption, progress: k.progress }))} />;
}

/** A white panel with a title row (title, optional pill or controls, a "View All" link). */
export function Panel({
  title,
  badge,
  right,
  onAll,
  allLabel = 'View All',
  children,
  style,
  icon,
}: {
  title: string;
  /** Sits right after the title (an info mark, a "Healthy" pill). */
  badge?: ReactNode;
  /** Sits at the right end (a period picker). */
  right?: ReactNode;
  onAll?: () => void;
  allLabel?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  icon?: ReactNode;
}) {
  return (
    <Card style={[styles.panel, style]}>
      <View style={styles.panelHead}>
        {icon}
        <Text style={styles.panelTitle} numberOfLines={2}>
          {title}
        </Text>
        {badge}
        <View style={styles.flex} />
        {right}
        {onAll ? (
          <Pressable style={styles.allLink} onPress={onAll} accessibilityRole="link" accessibilityLabel={`${allLabel}: ${title}`} hitSlop={6}>
            <Text style={styles.allText}>{allLabel}</Text>
            <Icon name="arrowRight" size={14} color={BLUE} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </Card>
  );
}

export interface CountTab {
  label: string;
  count?: number;
  tone?: Tone;
}

/** Underlined tabs with count pills ("All Applications 132 · Flagged 25"). */
export function CountTabs({ tabs, active, onChange, size = 13.5, style, dense = false }: { tabs: readonly CountTab[]; active: string; onChange: (label: string) => void; size?: number; style?: StyleProp<ViewStyle>; dense?: boolean }) {
  return (
    <View style={[styles.tabs, style]} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.label === active;
        const tone = TONES[t.tone ?? 'blue'];
        return (
          <Pressable
            key={t.label}
            style={[styles.tab, dense && styles.tabDense, on && styles.tabOn]}
            onPress={() => onChange(t.label)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={t.count !== undefined ? `${t.label}, ${t.count}` : t.label}>
            <Text style={[styles.tabText, { fontSize: size }, on && styles.tabTextOn]} numberOfLines={1}>
              {t.label}
            </Text>
            {t.count !== undefined ? (
              <View style={[styles.tabCount, { backgroundColor: on ? BLUE : tone.soft }]}>
                <Text style={[styles.tabCountText, { color: on ? WHITE : tone.text }]}>{t.count.toLocaleString('en-US')}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** A label and its value on one line, for details panels. */
export function DetailRow({ label, value, children, valueColor }: { label: string; value?: string; children?: ReactNode; valueColor?: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.flex}>{children ?? <Text style={[styles.detailValue, valueColor ? { color: valueColor } : null]}>{value}</Text>}</View>
    </View>
  );
}

/** A plain white outlined control: date range, refresh, columns, filters. */
export function OutlineBtn({ label, icon, onPress, chevron = false, style, small = false }: { label?: string; icon?: IconName; onPress: () => void; chevron?: boolean; style?: StyleProp<ViewStyle>; small?: boolean }) {
  return (
    <Pressable style={({ hovered }) => [styles.outline, small && styles.outlineSmall, !label && styles.outlineSquare, hovered && styles.outlineHover, style]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label ?? icon}>
      {icon ? <Icon name={icon} size={small ? 15 : 18} color={label ? BLUE : NAVY} /> : null}
      {label ? (
        <Text style={[styles.outlineText, small && styles.outlineTextSmall]} numberOfLines={2}>
          {label}
        </Text>
      ) : null}
      {chevron ? <Icon name="chevronDown" size={14} color={NAVY} /> : null}
    </Pressable>
  );
}

/** The blue primary button with an optional menu chevron ("Export ▾", "+ Add School ▾"). */
export function PrimaryBtn({ label, icon, onPress, chevron = false, style, tone }: { label: string; icon?: IconName; onPress: () => void; chevron?: boolean; style?: StyleProp<ViewStyle>; tone?: Tone }) {
  const bg = tone ? TONES[tone].solid : BLUE;
  return (
    <Pressable style={({ hovered }) => [styles.primary, { backgroundColor: bg }, hovered && styles.primaryHover, style]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {icon ? <Icon name={icon} size={17} color={WHITE} /> : null}
      <Text style={styles.primaryText} numberOfLines={2}>
        {label}
      </Text>
      {chevron ? (
        <>
          <View style={styles.primaryRule} />
          <Icon name="chevronDown" size={14} color={WHITE} />
        </>
      ) : null}
    </Pressable>
  );
}

/** A small pick-one box for panel headers ("Last 30 Days ▾"); tapping steps to the next option. */
export function CmdSelect({ value, options, onChange, width, label }: { value: string; options: readonly string[]; onChange: (v: string) => void; width?: number; label?: string }) {
  return (
    <Pressable
      style={({ hovered }) => [styles.cmdSelect, width ? { width } : null, hovered && styles.outlineHover]}
      onPress={() => onChange(options[(options.indexOf(value) + 1) % options.length])}
      accessibilityRole="button"
      accessibilityLabel={`${label ?? 'Filter'}: ${value}. Tap to change`}>
      <Text style={styles.cmdSelectText} numberOfLines={1}>
        {value}
      </Text>
      <Icon name="chevronDown" size={13} color={NAVY} />
    </Pressable>
  );
}

/** The page's period picker; it steps through the given ranges. */
export function RangeBox({ value, options, onChange, width }: { value: string; options: readonly string[]; onChange: (v: string) => void; width?: number }) {
  return (
    <Pressable style={[styles.outline, styles.range, width ? { width } : null]} onPress={() => onChange(options[(options.indexOf(value) + 1) % options.length])} accessibilityRole="button" accessibilityLabel={`Period: ${value}. Tap to change`}>
      <Icon name="calendar" size={17} color={BLUE} />
      <Text style={[styles.outlineText, styles.flex]} numberOfLines={1}>
        {value}
      </Text>
      <Icon name="chevronDown" size={14} color={NAVY} />
    </Pressable>
  );
}

/** Export menu: in a design build each choice says what file would be made. */
export function exportMenu(what: string): void {
  toast(`${what} export: CSV, XLSX or PDF. Exports are masked, logged and expire after 24 hours.`);
}

/** A small round flag drawn from its stripes, so no country photo is needed. */
const FLAGS: Readonly<Record<string, { stripes: readonly string[]; vertical?: boolean; dot?: string }>> = {
  UG: { stripes: ['#000', '#FCDC04', '#D90000', '#000', '#FCDC04', '#D90000'], dot: '#FFFFFF' },
  KE: { stripes: ['#000', '#FFFFFF', '#BB0000', '#FFFFFF', '#006600'], dot: '#BB0000' },
  TZ: { stripes: ['#1EB53A', '#FCD116', '#000', '#FCD116', '#00A3DD'] },
  NG: { stripes: ['#008751', '#FFFFFF', '#008751'], vertical: true },
  GH: { stripes: ['#CE1126', '#FCD116', '#006B3F'], dot: '#000' },
  RW: { stripes: ['#00A1DE', '#00A1DE', '#FAD201', '#20603D'] },
  ZA: { stripes: ['#DE3831', '#FFFFFF', '#007A4D', '#FFFFFF', '#002395'] },
  ET: { stripes: ['#078930', '#FCDD09', '#DA121A'], dot: '#0F47AF' },
  ZM: { stripes: ['#198A00', '#198A00', '#DE2010', '#000', '#EF7D00'], vertical: true },
  US: { stripes: ['#B22234', '#FFFFFF', '#B22234', '#FFFFFF', '#B22234', '#FFFFFF', '#B22234'], dot: '#3C3B6E' },
  GB: { stripes: ['#012169', '#FFFFFF', '#C8102E', '#FFFFFF', '#012169'] },
  SG: { stripes: ['#EF3340', '#FFFFFF'] },
  XX: { stripes: ['#B8C2D9', '#DDE3F0'] },
};

export function Flag({ code, size = 18 }: { code: string; size?: number }) {
  const f = FLAGS[code] ?? FLAGS.XX;
  const n = f.stripes.length;
  return (
    <View style={[styles.flag, { width: size, height: size, borderRadius: size / 2 }]} accessible accessibilityLabel={`Flag: ${code}`}>
      <Svg width={size} height={size}>
        {f.stripes.map((c, i) =>
          f.vertical ? <Rect key={i} x={(size / n) * i} y={0} width={size / n + 0.5} height={size} fill={c} /> : <Rect key={i} x={0} y={(size / n) * i} width={size} height={size / n + 0.5} fill={c} />,
        )}
        {f.dot ? <Circle cx={code === 'US' ? size * 0.3 : size / 2} cy={code === 'US' ? size * 0.3 : size / 2} r={size * 0.2} fill={f.dot} /> : null}
      </Svg>
    </View>
  );
}

/** A score inside a ring coloured by how good it is (green ≥ 80, amber ≥ 70, else red). */
export function ScoreRing({ score, size = 38, stroke = 4, max = 100, label }: { score: number; size?: number; stroke?: number; max?: number; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? '#22A55A' : score >= 70 ? '#F59E0B' : RED;
  return (
    <View style={{ width: size, height: size }} accessible accessibilityLabel={`${label ?? 'Score'} ${score} of ${max}`}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF2F8" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${(score / max) * c} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.ringText, { fontSize: size * 0.3 }]}>{score}</Text>
      </View>
    </View>
  );
}

export type CheckState = 'ok' | 'warn' | 'fail';

const CHECK: Readonly<Record<CheckState, { color: string; icon: IconName }>> = {
  ok: { color: '#22A55A', icon: 'check' },
  warn: { color: '#F59E0B', icon: 'alert' },
  fail: { color: RED, icon: 'close' },
};

/** A tiny round check mark: green tick, amber warning or red cross. */
export function CheckDot({ state, size = 16 }: { state: CheckState; size?: number }) {
  const c = CHECK[state];
  return (
    <View style={[styles.checkDot, { width: size, height: size, borderRadius: size / 2, backgroundColor: c.color }]} accessible accessibilityLabel={state === 'ok' ? 'Passed' : state === 'warn' ? 'Needs a look' : 'Failed'}>
      <Icon name={c.icon} size={size * 0.62} color={WHITE} />
    </View>
  );
}

/** A check and its line of text ("Identity Verified"), coloured by the result. */
export function CheckLine({ state, text, size = 12 }: { state: CheckState; text: string; size?: number }) {
  return (
    <View style={styles.checkLine}>
      <CheckDot state={state} size={size + 2} />
      <Text style={[styles.checkText, { fontSize: size, color: state === 'ok' ? BODY : CHECK[state].color }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

/** A little drawn chart icon for stat cards (the rising bars in the reference). */
export function MiniBars({ color, values = [3, 5, 4, 7, 9] }: { color: string; values?: readonly number[] }) {
  const max = Math.max(...values);
  return (
    <Svg width={values.length * 9} height={36}>
      {values.map((v, i) => (
        <Rect key={i} x={i * 9} y={36 - (v / max) * 36} width={6} height={(v / max) * 36} rx={1.5} fill={color} opacity={0.45 + (i / values.length) * 0.55} />
      ))}
    </Svg>
  );
}

/** A trend line with soft fill, for stat cards. */
export function Sparkline({ color, values, width = 110, height = 40 }: { color: string; values: readonly number[]; width?: number; height?: number }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const x = (i: number) => (i / (values.length - 1)) * width;
  const y = (v: number) => height - 3 - ((v - min) / (max - min || 1)) * (height - 6);
  const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <Svg width={width} height={height}>
      <Path d={`${line} L${width},${height} L0,${height} Z`} fill={color} opacity={0.14} />
      <Path d={line} stroke={color} strokeWidth={2} fill="none" />
    </Svg>
  );
}

/** "Showing 1–10 of 132 applications" and a short page strip with the last page. */
export function PageStrip({ label, page, pages, onPage }: { label: string; page: number; pages: number; onPage: (p: number) => void }) {
  const shown = Array.from(new Set([1, 2, 3, 4, 5, pages].filter((p) => p >= 1 && p <= pages)));
  return (
    <View style={styles.pageRow}>
      <Text style={styles.pageLabel}>{label}</Text>
      <View style={styles.pages}>
        <Pressable style={styles.pageBtn} onPress={() => onPage(Math.max(1, page - 1))} accessibilityRole="button" accessibilityLabel="Previous page">
          <Icon name="chevronLeft" size={15} color={BODY} />
        </Pressable>
        {shown.map((p, i) => (
          <View key={p} style={styles.pageItem}>
            {i > 0 && p - shown[i - 1] > 1 ? <Text style={styles.pageGap}>…</Text> : null}
            <Pressable style={[styles.pageBtn, p === page && styles.pageBtnOn]} onPress={() => onPage(p)} accessibilityRole="button" accessibilityState={{ selected: p === page }} accessibilityLabel={`Page ${p}`}>
              <Text style={[styles.pageText, p === page && styles.pageTextOn]}>{p.toLocaleString('en-US')}</Text>
            </Pressable>
          </View>
        ))}
        <Pressable style={styles.pageBtn} onPress={() => onPage(Math.min(pages, page + 1))} accessibilityRole="button" accessibilityLabel="Next page">
          <Icon name="chevronRight" size={15} color={BODY} />
        </Pressable>
      </View>
    </View>
  );
}

/** A two-line person cell: photo, name, and a second line (email or country). */
export function PersonCell({ avatar, name, sub, flag, size = 32 }: { avatar?: number; name: string; sub?: string; flag?: string; size?: number }) {
  return (
    <View style={styles.person}>
      {avatar !== undefined ? <PhotoDot source={avatar} size={size} /> : <Initials name={name} size={size} />}
      <View style={styles.flex}>
        <Text style={styles.personName} numberOfLines={2}>
          {name}
        </Text>
        {sub ? (
          <View style={styles.personSubRow}>
            {flag ? <Flag code={flag} size={12} /> : null}
            <Text style={styles.personSub} numberOfLines={1}>
              {sub}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function PhotoDot({ source, size = 32 }: { source: number; size?: number }) {
  return <Image source={source} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />;
}

/** Initials in a blue circle, for people without a photo. */
export function Initials({ name, size = 32 }: { name: string; size?: number }) {
  const letters = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View style={[styles.initials, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initialsText, { fontSize: size * 0.36 }]}>{letters}</Text>
    </View>
  );
}

/** A coloured bar with a label and value, for "jobs by queue" style lists. */
export function HBarRow({ label, value, max, color, display }: { label: string; value: number; max: number; color: string; display?: string }) {
  return (
    <View style={styles.hbar}>
      <Text style={styles.hbarLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.hbarTrack}>
        <View style={[styles.hbarFill, { width: `${Math.max(2, (value / max) * 100)}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.hbarValue}>{display ?? value.toLocaleString('en-US')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  center: { alignItems: 'center', justifyContent: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 112, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  statPhone: { minHeight: 96, gap: 8, paddingHorizontal: 9, alignItems: 'flex-start' },
  statIcon: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, fontWeight: '600', color: NAVY },
  statValue: { marginTop: 2, fontSize: 23, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  statValueLong: { fontSize: 17.5 },
  statIconPhone: { width: 36, height: 36, borderRadius: 9 },
  statValuePhone: { fontSize: 19 },
  statValuePhoneLong: { fontSize: 15 },
  statBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: '#EEF2F8', overflow: 'hidden' },
  statBarFill: { height: 6, borderRadius: 3 },
  statBarText: { fontSize: 11.5, fontWeight: '600', color: GREEN },
  deltaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  delta: { fontSize: 13, fontWeight: '700' },
  caption: { marginTop: 1, fontSize: 11.5, color: BODY },
  kpiRow: { flexDirection: 'row', gap: 12 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, rowGap: 10 },
  half: { width: '50%', paddingHorizontal: 5 },
  panel: { padding: 14, gap: 10 },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 28 },
  panelTitle: { flexShrink: 1, fontSize: 16, fontWeight: '800', color: NAVY },
  allLink: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  allText: { fontSize: 13.5, fontWeight: '600', color: BLUE },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 1, borderColor: LINE },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 2.5, borderColor: 'transparent', marginBottom: -1 },
  tabDense: { paddingHorizontal: 7, gap: 6 },
  tabOn: { borderColor: BLUE },
  tabText: { color: BODY },
  tabTextOn: { color: BLUE, fontWeight: '700' },
  tabCount: { minWidth: 26, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 11, alignItems: 'center' },
  tabCountText: { fontSize: 12, fontWeight: '700' },
  detail: { flexDirection: 'row', gap: 10, paddingVertical: 3 },
  detailLabel: { width: 108, fontSize: 12.5, color: BODY },
  detailValue: { fontSize: 12.5, color: NAVY },
  outline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 40, paddingHorizontal: 14, borderRadius: 9, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  outlineSmall: { height: 32, paddingHorizontal: 10, borderRadius: 8, gap: 6 },
  outlineSquare: { width: 40, paddingHorizontal: 0 },
  outlineHover: { backgroundColor: '#F4F8FF' },
  outlineText: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: NAVY, textAlign: 'center' },
  outlineTextSmall: { fontSize: 12.5 },
  range: { justifyContent: 'flex-start' },
  cmdSelect: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cmdSelectText: { flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: '500', color: NAVY },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 40, paddingHorizontal: 16, borderRadius: 9 },
  primaryHover: { opacity: 0.92 },
  primaryText: { flexShrink: 1, fontSize: 14, fontWeight: '700', color: WHITE, textAlign: 'center' },
  primaryRule: { width: 1, height: 18, marginHorizontal: 2, backgroundColor: 'rgba(255,255,255,0.4)' },
  flag: { overflow: 'hidden', borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.12)' },
  ringText: { fontWeight: '700', color: NAVY },
  checkDot: { alignItems: 'center', justifyContent: 'center' },
  checkLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkText: { flexShrink: 1 },
  pageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingTop: 4 },
  pageLabel: { fontSize: 13, color: BODY },
  pages: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pageItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pageGap: { fontSize: 13, color: MUTED },
  pageBtn: { minWidth: 32, height: 32, paddingHorizontal: 6, borderRadius: 7, borderWidth: 1, borderColor: LINE, alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE },
  pageBtnOn: { backgroundColor: BLUE, borderColor: BLUE },
  pageText: { fontSize: 13, color: NAVY },
  pageTextOn: { color: WHITE, fontWeight: '700' },
  person: { flexShrink: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9 },
  personName: { fontSize: 11.5, fontWeight: '600', color: NAVY },
  personSubRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  personSub: { flexShrink: 1, fontSize: 10.5, color: BODY },
  initials: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#5B6FB5' },
  initialsText: { fontWeight: '700', color: WHITE },
  hbar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  hbarLabel: { width: 96, fontSize: 12.5, color: NAVY },
  hbarTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: '#EEF2F8', overflow: 'hidden' },
  hbarFill: { height: 10, borderRadius: 5 },
  hbarValue: { width: 52, textAlign: 'right', fontSize: 12.5, fontWeight: '600', color: NAVY },
});
