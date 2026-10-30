import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { MockData } from '@/mock';

import { HeroArt } from './HeroArt';
import { Brand } from './palette';

type Landing = MockData['publicPages']['landing'];

/** The hero: promise, curriculum picker, course search and the illustrated globe. */
export function HomeHero({ landing, wide }: { landing: Landing; wide: boolean }) {
  const [board, setBoard] = useState(landing.curricula[0].code);
  return (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <View style={[styles.copy, wide && styles.copyWide]}>
        <Text style={styles.eyebrow}>{landing.eyebrow.toUpperCase()}</Text>
        <Text style={[styles.headline, wide && styles.headlineWide]} accessibilityRole="header">
          {`${landing.headline.lead}\n${landing.headline.pre}`}
          <Text style={styles.accent}>{landing.headline.accent}</Text>
        </Text>
        <Text style={styles.sub}>{landing.sub}</Text>

        <Text style={styles.pickLabel}>Choose a curriculum to get started</Text>
        <View style={styles.boards}>
          {landing.curricula.map((c) => {
            const on = c.code === board;
            return (
              <Pressable
                key={c.code}
                onPress={() => setBoard(c.code)}
                style={[styles.board, on && styles.boardOn]}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${c.code}, ${c.region}`}>
                <Text style={styles.flag}>{c.flag}</Text>
                <View>
                  <Text style={styles.boardCode}>{c.code}</Text>
                  <Text style={styles.boardRegion}>{`(${c.region})`}</Text>
                </View>
                {on ? (
                  <View style={styles.tick}>
                    <Icon name="check" size={12} color={Brand.surface} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.searchRow, wide && styles.searchRowWide]}>
          <View style={styles.search}>
            <Icon name="search" size={20} color={Brand.muted} />
            <TextInput style={styles.searchInput} placeholder="Search for courses, subjects, or skills..." placeholderTextColor={Brand.muted} accessibilityLabel="Search courses" />
          </View>
          <Pressable style={styles.explore} accessibilityRole="button" onPress={() => router.push('/sign-up')}>
            <Text style={styles.exploreText}>Explore Courses</Text>
            <Icon name="arrowRight" size={18} color={Brand.surface} />
          </Pressable>
        </View>

        <View style={styles.trust}>
          {landing.trust.map((t) => (
            <View key={t} style={styles.trustItem}>
              <Icon name="check" size={16} color={Brand.green} />
              <Text style={styles.trustText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
      <HeroArt landing={landing} wide={wide} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingTop: 32, gap: 24 },
  heroWide: { flexDirection: 'row', paddingHorizontal: 48, paddingTop: 48, gap: 32, alignItems: 'stretch' },
  copy: { gap: 14 },
  copyWide: { flex: 1.1, maxWidth: 700, paddingBottom: 32 },
  eyebrow: { fontSize: 13, fontWeight: '600', letterSpacing: 1.6, color: Brand.muted },
  headline: { fontSize: 38, lineHeight: 44, fontWeight: '800', color: Brand.ink, letterSpacing: -1.2 },
  headlineWide: { fontSize: 56, lineHeight: 62, letterSpacing: -1.8 },
  accent: { color: Brand.blue },
  sub: { fontSize: 18, lineHeight: 27, color: Brand.body, maxWidth: 520 },
  pickLabel: { fontSize: 15, fontWeight: '600', color: Brand.ink, marginTop: 10 },
  boards: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  board: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.surface,
  },
  boardOn: { borderColor: Brand.blue, borderWidth: 2, backgroundColor: Brand.blueSoft },
  flag: { fontSize: 18 },
  boardCode: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  boardRegion: { fontSize: 10, color: Brand.muted },
  tick: { position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: 9, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  searchRow: { gap: 10, marginTop: 8 },
  searchRowWide: { flexDirection: 'row' },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.surface,
  },
  searchInput: { flex: 1, fontSize: 15, color: Brand.ink, minHeight: 50 },
  explore: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 54, paddingHorizontal: 28, borderRadius: 10, backgroundColor: Brand.blue },
  exploreText: { fontSize: 16, fontWeight: '600', color: Brand.surface },
  trust: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 8, marginTop: 6 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { fontSize: 13, color: Brand.body },
});
