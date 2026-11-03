/**
 * The premium look, taken from the Maple Command Executive Overview phone page (November 2026):
 * tinted metric tiles with a centred icon, the label and figure in the tile's colour, the change
 * and where it came from; white panels with heavy titles. Every portal's phone pages share these.
 */
import { type ReactNode } from 'react';
import { Pressable, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';

import { BODY, GREEN, LINE, NAVY, RED, TONES, type Tone, WHITE } from './tokens';

export interface PremiumItem {
  label: string;
  value: string;
  icon: IconName;
  tone: Tone;
  /** "12%" — shown with an arrow. */
  delta?: string;
  /** The change is a fall (arrow down; red unless `good`). */
  down?: boolean;
  /** A fall that is good news. */
  good?: boolean;
  /** "From 38.2%", "vs. last month". */
  caption?: string;
  /** Colours the caption instead of the body grey. */
  captionTone?: Tone;
  /** 0–1: a thin progress bar under the figure. */
  progress?: number;
  /** A page's own colour instead of a tone: the icon and text colour; the tile is tinted from it. */
  color?: string;
  /** Makes the tile a link or button. */
  onPress?: () => void;
}

/** The benchmark tile: the tone's soft colour at 69% on a white card, edged in the soft colour. */
const TILE_ALPHA = 'B0';
/** A page's own colour, tinted to match the tones' soft colours (10% fill, 15% edge). */
const OWN_FILL_ALPHA = '1A';
const OWN_EDGE_ALPHA = '26';

/** Longest figure a half-width tile shows in full; longer money values are shortened ("UGX 468.8M"). */
const MAX_FULL = 11;
const MONEY = /^(−|-)?UGX ([\d,]+)$/;

/** "UGX 468,750,000" → "UGX 468.8M" when it would not fit; other values are left as they are. */
export function tileValue(value: string): string {
  const m = MONEY.exec(value);
  if (!m || value.length <= MAX_FULL) return value;
  const n = Number(m[2].replace(/,/g, ''));
  const sign = m[1] ? '−' : '';
  if (n >= 1e9) return `${sign}UGX ${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${sign}UGX ${(n / 1e6).toFixed(1)}M`;
  return `${sign}UGX ${Math.round(n / 1e3)}K`;
}

/** One premium metric tile. */
export function PremiumTile({ item, style, minHeight = 160 }: { item: PremiumItem; style?: StyleProp<ViewStyle>; minHeight?: number }) {
  const tone = TONES[item.tone];
  const t = item.color ? { solid: item.color, text: item.color, fill: item.color + OWN_FILL_ALPHA, edge: item.color + OWN_EDGE_ALPHA } : { ...tone, fill: tone.soft + TILE_ALPHA, edge: tone.soft };
  const deltaColor = item.down && !item.good ? RED : GREEN;
  const shown = tileValue(item.value);
  const long = shown.length > 8;
  const label = `${item.label}: ${item.value}${item.delta ? `, ${item.down ? 'down' : 'up'} ${item.delta}` : ''}${item.caption ? `, ${item.caption}` : ''}`;
  return (
    <Pressable
      disabled={!item.onPress}
      onPress={item.onPress}
      style={({ pressed }) => [styles.tile, { minHeight, backgroundColor: t.fill, borderColor: t.edge }, pressed && styles.pressed, style]}
      accessible
      accessibilityRole={item.onPress ? 'link' : undefined}
      accessibilityLabel={label}>
      <Icon name={item.icon} size={26} color={t.solid} />
      <Text style={[styles.label, { color: t.text }]} numberOfLines={2}>
        {item.label}
      </Text>
      <Text style={[styles.value, long && styles.valueLong, shown.length > 11 && styles.valueLonger, { color: t.text }]} numberOfLines={1}>
        {shown}
      </Text>
      {item.progress !== undefined ? (
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${Math.round(Math.min(1, item.progress) * 100)}%`, backgroundColor: t.solid }]} />
        </View>
      ) : null}
      {item.delta ? (
        <View style={styles.delta}>
          <Icon name={item.down ? 'arrowDown' : 'arrowUp'} size={14} color={deltaColor} />
          <Text style={[styles.deltaText, { color: deltaColor }]} numberOfLines={1}>
            {item.delta}
          </Text>
        </View>
      ) : null}
      {item.caption ? (
        <Text style={[styles.caption, item.captionTone && { color: TONES[item.captionTone].text }]} numberOfLines={2}>
          {item.caption}
        </Text>
      ) : null}
    </Pressable>
  );
}

/**
 * Premium tiles two to a row on the benchmark's white card (the Executive Overview "North-Star
 * Metrics" panel): a heavy title, a line saying what the numbers are, then the tiles. Pass `bare`
 * when the grid already sits inside a white panel.
 */
export function PremiumTiles({ items, minHeight, title, subtitle, bare = false }: { items: readonly PremiumItem[]; minHeight?: number; title?: string; subtitle?: string; bare?: boolean }) {
  const grid = (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={styles.half}>
          <PremiumTile item={item} minHeight={minHeight} />
        </View>
      ))}
    </View>
  );
  if (bare) return grid;
  return (
    <View style={styles.panel}>
      {title ? (
        <Text style={styles.boardTitle} accessibilityRole="header">
          {title}
        </Text>
      ) : null}
      {subtitle ? <Text style={styles.panelSub}>{subtitle}</Text> : null}
      {grid}
    </View>
  );
}

/** A white premium panel: a heavy title, an optional line under it and the content. */
export function PremiumPanel({ title, subtitle, right, children, style }: { title?: string; subtitle?: string; right?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.panel, style]}>
      {title ? (
        <View style={styles.panelHead}>
          <Text style={styles.panelTitle} numberOfLines={2}>
            {title}
          </Text>
          {right}
        </View>
      ) : null}
      {subtitle ? <Text style={styles.panelSub}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

/** The premium type scale, for pages that draw their own headings. */
export const PREMIUM = {
  title: { fontSize: 27, fontWeight: '800', color: NAVY, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, lineHeight: 21, color: BODY },
  panelTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  body: { fontSize: 13, color: BODY },
} as const;

const styles = StyleSheet.create({
  pressed: { opacity: 0.85 },
  tile: { alignItems: 'center', gap: 4, paddingVertical: 14, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1 },
  label: { minHeight: 34, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  value: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  valueLong: { fontSize: 20 },
  valueLonger: { fontSize: 17 },
  track: { alignSelf: 'stretch', height: 5, marginHorizontal: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.8)', overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
  delta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  deltaText: { fontSize: 14, fontWeight: '700' },
  caption: { fontSize: 12.5, color: BODY, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5, rowGap: 10 },
  half: { width: '50%', paddingHorizontal: 5 },
  panel: { gap: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  panelTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: NAVY },
  panelSub: { marginTop: -6, fontSize: 12.5, color: BODY },
  boardTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
});
