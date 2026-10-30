import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';

import { Brand, HERO_GRADIENT } from '../palette';

const SCRIPT_FONT = Platform.select({ web: '"Segoe Print", "Bradley Hand", cursive', default: undefined });

/** "Maple Shorts: quick learning, real results" with the four promises. */
export function ShortsHero({ promises, wide, photo }: { promises: readonly string[]; wide: boolean; photo?: number }) {
  return (
    <LinearGradient colors={HERO_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <View style={[styles.copy, wide && styles.copyWide]}>
        <Text style={[styles.title, wide && styles.titleWide]} accessibilityRole="header">
          {'Maple '}
          <Text style={styles.accent}>Shorts</Text>
        </Text>
        <Text style={styles.tagline}>Quick learning. Real results.</Text>
        <Text style={styles.body}>60-second revision clips, study tips and classroom moments from expert teachers. Watch, learn, then go deeper with a full course or a live class.</Text>
        <View style={styles.promises}>
          {promises.map((p) => (
            <View key={p} style={styles.promise}>
              <Icon name="check" size={15} color={Brand.blue} />
              <Text style={styles.promiseText}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
      {wide ? (
        <View style={styles.art}>
          <Text style={[styles.script, { fontFamily: SCRIPT_FONT }]}>{'Big\nLearning\nIn Small\nMoments ♡'}</Text>
          {photo ? (
            <Image source={photo} style={styles.photo} contentFit="cover" accessibilityLabel="A learner with headphones watching a Maple Short on her phone" />
          ) : (
            <Text style={styles.learner} accessibilityElementsHidden>
              👩🏾‍💻
            </Text>
          )}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', borderRadius: 20, overflow: 'hidden', padding: 24, minHeight: 200 },
  copy: { gap: 8, flex: 1 },
  copyWide: { maxWidth: 520 },
  title: { fontSize: 36, fontWeight: '900', color: Brand.ink, letterSpacing: -1 },
  titleWide: { fontSize: 52 },
  accent: { color: Brand.blue },
  tagline: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  body: { fontSize: 14, lineHeight: 21, color: Brand.body },
  promises: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 6, marginTop: 6 },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  promiseText: { fontSize: 12, color: Brand.body },
  art: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 },
  script: { fontSize: 22, lineHeight: 28, color: '#5B6B8C', transform: [{ rotate: '-8deg' }] },
  learner: { fontSize: 150 },
  photo: { width: 300, height: 270, borderRadius: 16, marginVertical: -24, marginRight: -24 },
});
