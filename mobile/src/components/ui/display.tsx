/**
 * Components for showing information: metrics, progress, people, empty and
 * notice states, choices between views, and responsive grids.
 */
import { Children, type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Elevation, Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { gridColumns, initials } from '@/lib/layout';
import type { IconName } from '@/lib/icons';

type Tone = 'neutral' | 'accent' | 'good' | 'warning' | 'danger' | 'info';

function toneColors(t: Theme, tone: Tone): { soft: string; strong: string } {
  switch (tone) {
    case 'accent':
      return { soft: t.accentSoft, strong: t.accentText };
    case 'good':
      return { soft: t.successSoft, strong: t.success };
    case 'warning':
      return { soft: t.warningSoft, strong: t.warning };
    case 'danger':
      return { soft: t.dangerSoft, strong: t.danger };
    case 'info':
      return { soft: t.infoSoft, strong: t.info };
    default:
      return { soft: t.backgroundSelected, strong: t.textSecondary };
  }
}

interface StatProps {
  label: string;
  value: string;
  detail?: string;
  icon?: IconName;
  tone?: Tone;
}

/** One headline number, such as fees collected or classes today. */
export function Stat({ label, value, detail, icon, tone = 'neutral' }: StatProps) {
  const { theme, styles } = useStyles(makeStyles);
  const colors = toneColors(theme, tone);
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}${detail ? `, ${detail}` : ''}`}>
      <View style={styles.statTop}>
        <Text style={styles.statLabel}>{label}</Text>
        {icon ? (
          <View style={[styles.statIcon, { backgroundColor: colors.soft }]}>
            <Icon name={icon} size={16} color={colors.strong} />
          </View>
        ) : null}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {detail ? <Text style={[styles.statDetail, tone !== 'neutral' && { color: colors.strong }]}>{detail}</Text> : null}
    </View>
  );
}

interface ProgressProps {
  label: string;
  /** Between 0 and 1. */
  value: number;
  tone?: Tone;
  showValue?: boolean;
}

export function ProgressBar({ label, value, tone = 'accent', showValue = true }: ProgressProps) {
  const { theme, styles } = useStyles(makeStyles);
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const fill = tone === 'accent' ? theme.accent : toneColors(theme, tone).strong;
  return (
    <View style={styles.progress}>
      <View style={styles.progressTop}>
        <Text style={styles.progressLabel}>{label}</Text>
        {showValue ? <Text style={styles.progressValue}>{pct}%</Text> : null}
      </View>
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max: 100, now: pct }}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: fill }]} />
      </View>
    </View>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const { styles } = useStyles(makeStyles);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} accessible={false}>
      <Text style={[styles.avatarText, { fontSize: Math.round(size * 0.38) }]}>{initials(name)}</Text>
    </View>
  );
}

interface EmptyProps {
  icon: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, body, action }: EmptyProps) {
  const { theme, styles } = useStyles(makeStyles);
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Icon name={icon} size={22} color={theme.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {body ? <Text style={styles.emptyBody}>{body}</Text> : null}
      {action}
    </View>
  );
}

interface BannerProps {
  tone?: Exclude<Tone, 'neutral' | 'accent'>;
  title: string;
  body?: string;
  action?: ReactNode;
}

const BANNER_ICONS = { good: 'check', warning: 'alert', danger: 'alert', info: 'info' } as const;

export function Banner({ tone = 'info', title, body, action }: BannerProps) {
  const { theme, styles } = useStyles(makeStyles);
  const colors = toneColors(theme, tone);
  return (
    <View
      style={[styles.banner, { backgroundColor: colors.soft, borderColor: colors.strong }]}
      accessibilityRole={tone === 'danger' ? 'alert' : undefined}>
      <Icon name={BANNER_ICONS[tone]} size={20} color={colors.strong} />
      <View style={styles.flex}>
        <Text style={[styles.bannerTitle, { color: colors.strong }]}>{title}</Text>
        {body ? <Text style={styles.bannerBody}>{body}</Text> : null}
      </View>
      {action}
    </View>
  );
}

interface SegmentedProps<T extends string> {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** A small set of views to switch between, such as levels or terms. */
export function Segmented<T extends string>({ label, options, value, onChange }: SegmentedProps<T>) {
  const { styles } = useStyles(makeStyles);
  return (
    <View style={styles.segmented} accessibilityRole="tablist" accessibilityLabel={label}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={({ hovered }) => [styles.segment, selected && styles.segmentOn, hovered && !selected && styles.segmentHover]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={o.label}>
            <Text style={[styles.segmentText, selected && styles.segmentTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface SectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

/** A titled group of cards on a page. */
export function Section({ title, description, action, children }: SectionProps) {
  const { styles } = useStyles(makeStyles);
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.flex}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            {title}
          </Text>
          {description ? <Text style={styles.sectionDescription}>{description}</Text> : null}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

/** Lays children out in equal columns at least `min` wide, one column on phones. */
export function Grid({ min = 260, children }: { min?: number; children: ReactNode }) {
  const { styles } = useStyles(makeStyles);
  const [width, setWidth] = useState(0);
  const items = Children.toArray(children);
  const gap = Spacing.three;
  const columns = gridColumns(width, min, gap, items.length);
  const cellWidth = width > 0 ? (width - gap * (columns - 1)) / columns : undefined;
  return (
    <View style={styles.grid} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {items.map((child, i) => (
        <View key={i} style={cellWidth ? { width: cellWidth } : styles.gridCell}>
          {child}
        </View>
      ))}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    stat: {
      flexGrow: 1,
      backgroundColor: t.backgroundElement,
      borderColor: t.border,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderRadius: Radius.lg,
      padding: Spacing.four,
      gap: Spacing.one,
      ...Elevation.card,
    },
    statTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
    statLabel: { ...Type.small, fontWeight: '500', color: t.textSecondary, flex: 1 },
    statIcon: { width: 28, height: 28, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
    statValue: { ...Type.metric, color: t.text, marginTop: Spacing.two },
    statDetail: { ...Type.caption, color: t.textMuted },
    progress: { gap: Spacing.two },
    progressTop: { flexDirection: 'row', justifyContent: 'space-between' },
    progressLabel: { ...Type.small, color: t.text },
    progressValue: { ...Type.small, fontWeight: '600', color: t.textSecondary, fontVariant: ['tabular-nums'] },
    track: { height: 8, borderRadius: Radius.pill, backgroundColor: t.backgroundSelected, overflow: 'hidden' },
    fill: { height: 8, borderRadius: Radius.pill },
    avatar: { backgroundColor: t.accentSoft, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: t.accentText, fontWeight: '700' },
    empty: {
      alignItems: 'center',
      gap: Spacing.two,
      paddingVertical: Spacing.five,
      paddingHorizontal: Spacing.four,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: t.borderStrong,
    },
    emptyIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: t.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.one,
    },
    emptyTitle: { ...Type.bodyStrong, color: t.text, textAlign: 'center' },
    emptyBody: { ...Type.small, color: t.textSecondary, textAlign: 'center', maxWidth: 420 },
    banner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.three,
      padding: Spacing.three,
      borderRadius: Radius.md,
      borderLeftWidth: 4,
    },
    bannerTitle: { ...Type.bodyStrong },
    bannerBody: { ...Type.small, color: t.text, marginTop: 2 },
    segmented: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.one,
      padding: Spacing.one,
      borderRadius: Radius.md,
      backgroundColor: t.backgroundSelected,
      alignSelf: 'flex-start',
    },
    segment: { minHeight: 36, paddingHorizontal: Spacing.three, borderRadius: Radius.sm, justifyContent: 'center' },
    segmentOn: { backgroundColor: t.backgroundElement, ...Elevation.card },
    segmentHover: { backgroundColor: t.border },
    segmentText: { ...Type.small, fontWeight: '600', color: t.textSecondary },
    segmentTextOn: { color: t.text },
    section: { gap: Spacing.three },
    sectionHeader: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.three },
    sectionTitle: { ...Type.heading, color: t.text },
    sectionDescription: { ...Type.small, color: t.textSecondary },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
    gridCell: { width: '100%' },
  });
}
