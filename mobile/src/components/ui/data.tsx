/**
 * Components for records: tables that become stacked cards on phones,
 * label–value lists, toggles and chips.
 */
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';

import { Breakpoints, Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';

export interface Column<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  /** Relative width on wide screens. */
  flex?: number;
  align?: 'left' | 'right';
}

interface TableProps<T> {
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string;
  onPress?: (row: T) => void;
}

/** A table on wide screens; on phones each row becomes a small card. */
export function Table<T>({ columns, rows, rowKey, onPress }: TableProps<T>) {
  const { styles } = useStyles(makeStyles);
  const { width } = useWindowDimensions();
  const wide = width >= Breakpoints.wide;

  if (!wide) {
    return (
      <View style={styles.cards}>
        {rows.map((row) => (
          <Pressable
            key={rowKey(row)}
            disabled={!onPress}
            onPress={() => onPress?.(row)}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            accessibilityRole={onPress ? 'button' : undefined}>
            {columns.map((c, i) => (
              <View key={c.key} style={i === 0 ? styles.cardHead : styles.cardLine}>
                {i === 0 ? null : <Text style={styles.cardLabel}>{c.label}</Text>}
                <View style={i === 0 ? undefined : styles.cardValue}>{cell(c.render(row), i === 0 ? styles.strong : styles.cellText)}</View>
              </View>
            ))}
          </Pressable>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.table} accessibilityRole="list">
      <View style={[styles.tr, styles.th]}>
        {columns.map((c) => (
          <Text key={c.key} style={[styles.thText, { flex: c.flex ?? 1, textAlign: c.align ?? 'left' }]}>
            {c.label}
          </Text>
        ))}
      </View>
      {rows.map((row) => (
        <Pressable
          key={rowKey(row)}
          disabled={!onPress}
          onPress={() => onPress?.(row)}
          style={({ hovered, pressed }) => [styles.tr, (hovered || pressed) && onPress ? styles.trHover : null]}
          accessibilityRole={onPress ? 'button' : undefined}>
          {columns.map((c, i) => (
            <View key={c.key} style={{ flex: c.flex ?? 1, alignItems: c.align === 'right' ? 'flex-end' : 'flex-start' }}>
              {cell(c.render(row), i === 0 ? styles.strong : styles.cellText)}
            </View>
          ))}
        </Pressable>
      ))}
    </View>
  );
}

function cell(content: ReactNode, style: object) {
  return typeof content === 'string' || typeof content === 'number' ? <Text style={style}>{content}</Text> : content;
}

/** Label on the left, value on the right. */
export function KeyValue({ items }: { items: readonly { label: string; value: ReactNode }[] }) {
  const { styles } = useStyles(makeStyles);
  return (
    <View>
      {items.map((it) => (
        <View key={it.label} style={styles.kv}>
          <Text style={styles.kvLabel}>{it.label}</Text>
          {cell(it.value, styles.kvValue)}
        </View>
      ))}
    </View>
  );
}

/** A labelled switch that remembers its own state (for design previews). */
export function ToggleRow({ label, detail, initial }: { label: string; detail?: string; initial: boolean }) {
  const { theme, styles } = useStyles(makeStyles);
  const [on, setOn] = useState(initial);
  return (
    <View style={styles.toggle}>
      <View style={styles.flex}>
        <Text style={styles.cellText}>{label}</Text>
        {detail ? <Text style={styles.kvLabel}>{detail}</Text> : null}
      </View>
      <Switch
        value={on}
        onValueChange={setOn}
        accessibilityLabel={label}
        trackColor={{ true: theme.accent, false: theme.borderStrong }}
        thumbColor={theme.backgroundElement}
      />
    </View>
  );
}

/** A small selectable pill, such as a filter. */
export function Chip({ label, selected = false, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  const { styles } = useStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }) => [styles.chip, selected && styles.chipOn, hovered && !selected && styles.chipHover]}
      accessibilityRole="button"
      accessibilityState={{ selected }}>
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  const { styles } = useStyles(makeStyles);
  return <View style={styles.chipRow}>{children}</View>;
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    pressed: { opacity: 0.7 },
    table: { borderRadius: Radius.md, borderWidth: 1, borderColor: t.border, overflow: 'hidden' },
    tr: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    th: { backgroundColor: t.backgroundSelected, paddingVertical: Spacing.two },
    thText: { ...Type.caption, color: t.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
    trHover: { backgroundColor: t.backgroundSelected },
    strong: { ...Type.bodyStrong, color: t.text },
    cellText: { ...Type.small, color: t.text },
    cards: { gap: Spacing.two },
    card: { borderRadius: Radius.md, borderWidth: 1, borderColor: t.border, padding: Spacing.three, gap: Spacing.one, backgroundColor: t.backgroundElement },
    cardHead: { marginBottom: Spacing.one },
    cardLine: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.three },
    cardLabel: { ...Type.caption, color: t.textMuted },
    cardValue: { flexShrink: 1, alignItems: 'flex-end' },
    kv: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Spacing.three,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    kvLabel: { ...Type.small, color: t.textSecondary },
    kvValue: { ...Type.bodyStrong, color: t.text, textAlign: 'right' },
    toggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 52 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    chip: { minHeight: 34, paddingHorizontal: Spacing.three, borderRadius: Radius.pill, borderWidth: 1, borderColor: t.borderStrong, justifyContent: 'center' },
    chipOn: { backgroundColor: t.accent, borderColor: t.accent },
    chipHover: { backgroundColor: t.backgroundSelected },
    chipText: { ...Type.small, fontWeight: '600', color: t.text },
    chipTextOn: { color: t.onAccent },
  });
}
