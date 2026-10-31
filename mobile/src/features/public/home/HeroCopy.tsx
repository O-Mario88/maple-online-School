import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';

import { Brand, CARD_SHADOW } from '../palette';
import type { Landing } from './types';

/** Each curriculum chip's width in the reference, in order. */
const CHIP_WIDTHS = [117, 87, 100, 100, 103, 122] as const;

/** The hero's text column. Desktop sizes are the reference's own pixels at 1536px wide. */
export function HeroCopy({ landing, phone = false }: { landing: Landing; phone?: boolean }) {
  return (
    <View style={phone ? styles.colPhone : styles.col}>
      <Text style={[styles.eyebrow, phone && styles.eyebrowPhone]}>{landing.eyebrow.toUpperCase()}</Text>
      <Text style={[styles.headline, phone && styles.headlinePhone]} accessibilityRole="header">
        {`${landing.headline.lead}\n${landing.headline.pre}`}
        <Text style={styles.accent}>{landing.headline.accent}</Text>
      </Text>
      <Text style={[styles.sub, phone && styles.subPhone]}>{landing.sub}</Text>
    </View>
  );
}

/** "Choose a curriculum", the search box and the four promises under it. */
export function HeroActions({ landing, phone = false }: { landing: Landing; phone?: boolean }) {
  const [board, setBoard] = useState(landing.curricula[0].code);
  const chips = landing.curricula.map((c, i) => {
    const on = c.code === board;
    return (
      <Pressable
        key={c.code}
        onPress={() => setBoard(c.code)}
        style={[styles.chip, !phone && { width: CHIP_WIDTHS[i] }, on && styles.chipOn]}
        accessibilityRole="radio"
        accessibilityState={{ selected: on }}
        accessibilityLabel={`${c.code}, ${c.region}`}>
        <Image source={c.badge} style={styles.badge} />
        <View>
          <Text style={styles.chipCode}>{c.code}</Text>
          <Text style={styles.chipRegion}>{`(${c.region})`}</Text>
        </View>
        {on ? (
          <View style={styles.tick}>
            <Icon name="check" size={9} color={Brand.surface} />
          </View>
        ) : null}
      </Pressable>
    );
  });

  return (
    <View style={phone ? styles.actionsPhone : styles.actions}>
      <Text style={[styles.pick, phone && styles.pickPhone]}>Choose a curriculum to get started</Text>
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsPhone} style={styles.chipScroller}>
          {chips}
        </ScrollView>
      ) : (
        <View style={styles.chips}>{chips}</View>
      )}

      <View style={[styles.searchRow, phone && styles.searchRowPhone]}>
        <View style={[styles.search, phone && styles.searchPhone]}>
          <Icon name="search" size={18} color={Brand.ink} />
          <TextInput style={styles.searchInput} placeholder="Search for courses, subjects, or skills..." placeholderTextColor={Brand.muted} accessibilityLabel="Search courses" />
        </View>
        <Pressable style={[styles.explore, phone && styles.explorePhone]} accessibilityRole="button" onPress={() => router.push('/explore')}>
          <Text style={styles.exploreText}>Explore Courses</Text>
          <Icon name="arrowRight" size={16} color={Brand.surface} />
        </Pressable>
      </View>

      <View style={[styles.trust, phone && styles.trustPhone]}>
        {landing.trust.map((t) => (
          <View key={t.label} style={[styles.trustItem, phone && styles.trustItemPhone]}>
            <View style={[styles.trustIcon, { backgroundColor: t.color }]}>
              <Icon name={t.icon} size={11} color={Brand.surface} />
            </View>
            <Text style={[styles.trustText, phone && styles.trustTextPhone]}>{t.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  col: { width: 640 },
  colPhone: { paddingHorizontal: 16 },
  eyebrow: { fontSize: 12.5, fontWeight: '600', letterSpacing: 1.3, color: '#5E6675' },
  eyebrowPhone: { fontSize: 12 },
  headline: { marginTop: 13, fontSize: 51, lineHeight: 53, fontWeight: '700', color: Brand.ink, letterSpacing: -1.1 },
  headlinePhone: { marginTop: 10, fontSize: 38, lineHeight: 42, letterSpacing: -1 },
  accent: { color: Brand.blue },
  sub: { marginTop: 14, maxWidth: 480, fontSize: 18.5, lineHeight: 23.5, color: '#3D4656' },
  subPhone: { marginTop: 12, maxWidth: undefined, fontSize: 16.5, lineHeight: 23 },

  actions: { width: 680 },
  actionsPhone: { gap: 0 },
  pick: { fontSize: 13.5, fontWeight: '600', color: Brand.ink },
  pickPhone: { paddingHorizontal: 16, fontSize: 14 },
  chips: { flexDirection: 'row', gap: 7, marginTop: 9 },
  chipScroller: { marginTop: 10 },
  chipsPhone: { flexDirection: 'row', gap: 7, paddingHorizontal: 16, paddingVertical: 6 },
  chip: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 10,
    paddingRight: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    backgroundColor: Brand.surface,
    ...CARD_SHADOW,
  },
  chipOn: { borderWidth: 2, borderColor: Brand.blue, backgroundColor: '#F4F8FF', paddingLeft: 9 },
  badge: { width: 22, height: 22, borderRadius: 11 },
  chipCode: { fontSize: 11.5, fontWeight: '700', color: Brand.ink, letterSpacing: -0.2 },
  chipRegion: { fontSize: 8.5, color: Brand.muted, marginTop: 1 },
  tick: { position: 'absolute', top: -5, right: -5, width: 15, height: 15, borderRadius: 8, borderWidth: 1.5, borderColor: Brand.surface, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },

  searchRow: { flexDirection: 'row', gap: 10, marginTop: 15, width: 661 },
  searchRowPhone: { flexDirection: 'column', width: undefined, marginTop: 12, paddingHorizontal: 16 },
  search: {
    width: 464,
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 17,
    borderRadius: 7,
    backgroundColor: Brand.surface,
    ...CARD_SHADOW,
  },
  searchPhone: { width: undefined },
  searchInput: { flex: 1, height: 48, fontSize: 13.5, color: Brand.ink },
  explore: { width: 187, height: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 7, backgroundColor: Brand.blue },
  explorePhone: { width: undefined },
  exploreText: { fontSize: 14.5, fontWeight: '600', color: Brand.surface },

  trust: { flexDirection: 'row', gap: 19, marginTop: 24 },
  trustPhone: { flexWrap: 'wrap', columnGap: 12, rowGap: 10, marginTop: 16, paddingHorizontal: 16 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trustItemPhone: { width: '47%' },
  trustIcon: { width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  trustText: { fontSize: 10.5, color: '#2A3242', flexShrink: 1 },
  trustTextPhone: { fontSize: 12.5 },
});
