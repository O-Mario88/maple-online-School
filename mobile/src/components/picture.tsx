/**
 * Maple's Image: expo-image with one rule on top. Interface icons are never
 * raster. When a page passes one of the icon crops from the reference
 * screenshots (listed in mock/icon-art.ts), it is drawn as a crisp Lucide
 * vector in a soft tile of the same size; photographs, covers and logos pass
 * straight through to expo-image.
 */
import { Image as ExpoImage, type ImageProps } from 'expo-image';
import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import { Maple } from '@/constants/maple';
import type { IconName } from '@/lib/icons';
import { mockData } from '@/lib/mock';
import { Palette } from '@/constants/palette';

type Tone = 'blue' | 'green' | 'amber' | 'red' | 'teal' | 'slate';

const TONES: Readonly<Record<Tone, { fg: string; bg: string }>> = {
  blue: { fg: Maple.blue, bg: Maple.blueSoft },
  green: { fg: Maple.successText, bg: Maple.successSoft },
  amber: { fg: Maple.warningText, bg: Maple.warningSoft },
  red: { fg: Maple.errorText, bg: Maple.errorSoft },
  teal: { fg: Palette.teal900, bg: Palette.teal100b },
  slate: { fg: Maple.secondary, bg: Palette.blue100 },
};

/** The icon glyph fills about this much of its tile. */
const GLYPH_RATIO = 0.55;
const FALLBACK_SIZE = 24;

/** Bundled assets are numbers on phones and {uri, width, height} objects on the web; both are stable per asset. */
function artFor(source: ImageProps['source']) {
  if (source === null || source === undefined || typeof source === 'string') return undefined;
  return mockData()?.iconArt.get(source);
}

/**
 * Every image says what it shows, or says it is decoration. A photo beside its own caption, an
 * avatar beside the person's name or a cover beside the title is `decorative`: screen readers skip
 * it (an empty alt on the web). Anything else gets an `accessibilityLabel`, read out and used as alt.
 */
type Described = { accessibilityLabel: string; decorative?: false } | { decorative: true; accessibilityLabel?: undefined };
export type MapleImageProps = Omit<ImageProps, 'accessibilityLabel' | 'alt' | 'accessible'> & Described;

/**
 * Screen readers skip a decorative image: an empty alt on the web, hidden on iOS and Android.
 * expo-image's web image takes its alt from accessibilityLabel (not alt), so both are set.
 */
const DECORATIVE = { alt: '', accessibilityLabel: '', accessible: false, importantForAccessibility: 'no' } as const;

export function Image({ decorative = false, ...props }: MapleImageProps) {
  const art = artFor(props.source);
  const label = decorative ? undefined : props.accessibilityLabel;
  if (art) return <IconTile icon={art.icon} tone={art.tone} style={props.style as ViewStyle} label={label} />;
  return <ExpoImage {...props} {...(decorative ? DECORATIVE : { alt: label, accessible: true })} />;
}

interface IconTileProps {
  icon: IconName;
  tone: Tone;
  style?: ViewStyle;
  label?: string;
}

function IconTile({ icon, tone, style, label }: IconTileProps) {
  const flat = StyleSheet.flatten(style) ?? {};
  const fixed = Math.min(typeof flat.width === 'number' ? flat.width : Infinity, typeof flat.height === 'number' ? flat.height : Infinity);
  const [measured, setMeasured] = useState<number | null>(null);
  const side = Number.isFinite(fixed) ? fixed : (measured ?? FALLBACK_SIZE);
  const colors = TONES[tone];
  const onLayout = Number.isFinite(fixed)
    ? undefined
    : (e: LayoutChangeEvent) => setMeasured(Math.min(e.nativeEvent.layout.width, e.nativeEvent.layout.height) || FALLBACK_SIZE);
  return (
    <View
      onLayout={onLayout}
      style={[s.tile, { borderRadius: Math.round(side * 0.28), backgroundColor: colors.bg }, style]}
      accessible={Boolean(label)}
      accessibilityLabel={label}
      accessibilityRole={label ? 'image' : undefined}>
      <Icon name={icon} size={Math.max(12, Math.round(side * GLYPH_RATIO))} color={colors.fg} />
    </View>
  );
}

const s = StyleSheet.create({
  tile: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
