import { Image } from '@/components/picture';
import { type ImageStyle, type StyleProp, StyleSheet, Text, View } from 'react-native';

import { Maple } from '@/constants/maple';

const MARK = require('@/assets/images/brand/logo-mark.png') as number;
const MARK_LIGHT = require('@/assets/images/brand/logo-mark-light.png') as number;
const WORDMARK = require('@/assets/images/brand/logo-wordmark.png') as number;
const WORDMARK_LIGHT = require('@/assets/images/brand/logo-wordmark-light.png') as number;

/** The artwork's proportions (assets/images/brand), so every size keeps the logo's shape. */
const MARK_RATIO = 466 / 411;
const WORDMARK_RATIO = 1021 / 118;
/** The lettering's height beside the mark, as a share of the mark's height. */
const WORDMARK_SHARE = 0.4;
const DEFAULT_SIZE = 40;
/** Maple's slogan, under the name. */
export const SLOGAN = 'Learning Without Borders';
/** The slogan's size as a share of the mark's height, and the smallest it may go. */
const SLOGAN_SHARE = 0.22;
const SLOGAN_MIN = 9;

interface MapleLogoProps {
  /** The mark's height. */
  size?: number;
  /** Or take the height from a place's existing leaf style. */
  markStyle?: StyleProp<ImageStyle>;
  /** On a dark ground the navy parts turn white (the orange stays). */
  onDark?: boolean;
  /** The mark alone, for tight spaces (the name is still read out). */
  markOnly?: boolean;
  /** Leave out the slogan under the name. */
  noSlogan?: boolean;
}

/**
 * The Maple Online School logo: the maple leaf and book mark, with the name beside it.
 * Every header, sidebar and footer uses this one component.
 */
export function MapleLogo({ size, markStyle, onDark = false, markOnly = false, noSlogan = false }: MapleLogoProps) {
  const fromStyle = StyleSheet.flatten(markStyle)?.height;
  const h = size ?? (typeof fromStyle === 'number' ? fromStyle : DEFAULT_SIZE);
  const wordH = Math.round(h * WORDMARK_SHARE);
  const sloganSize = Math.max(SLOGAN_MIN, Math.round(h * SLOGAN_SHARE));
  const slogan = !markOnly && !noSlogan;
  return (
    <View style={styles.row} accessible accessibilityRole="image" accessibilityLabel={slogan ? `Maple Online School. ${SLOGAN}` : 'Maple Online School'}>
      <Image decorative source={onDark ? MARK_LIGHT : MARK} style={{ width: Math.round(h * MARK_RATIO), height: h }} contentFit="contain" />
      {markOnly ? null : (
        <View style={styles.name}>
          <Image decorative source={onDark ? WORDMARK_LIGHT : WORDMARK} style={{ width: Math.round(wordH * WORDMARK_RATIO), height: wordH }} contentFit="contain" />
          {slogan ? (
            <Text style={[styles.slogan, onDark && styles.sloganOnDark, { fontSize: sloganSize, lineHeight: Math.round(sloganSize * 1.3) }]} numberOfLines={1}>
              {SLOGAN}
            </Text>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { gap: 2 },
  // Set in the logo's navy, spaced a little so it reads as a tagline under the name.
  slogan: { fontWeight: '500', letterSpacing: 0.3, color: Maple.secondary },
  sloganOnDark: { color: Maple.onBlueMuted },
});
