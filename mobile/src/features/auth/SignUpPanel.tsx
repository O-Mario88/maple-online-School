import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import type { IconName } from '@/lib/icons';
import type { MockData } from '@/mock';

type Art = MockData['publicPages']['signUpArt'];

const PROMISES: readonly { icon: IconName; tint: string; title: string; body: string }[] = [
  { icon: 'book', tint: '#1463F3', title: 'Access thousands\nof books and resources', body: 'Learn anytime, anywhere' },
  { icon: 'people', tint: '#16A34A', title: 'Join live classes\nand tutoring', body: 'Learn with expert teachers' },
  { icon: 'chart', tint: '#7C3AED', title: 'Track your progress', body: 'See your growth and achievements' },
  { icon: 'sparkle', tint: '#F59E0B', title: 'Built for everyone', body: 'Learners, parents, teachers\nand schools' },
];
const STATS: readonly { icon: IconName; value?: string; label: string }[] = [
  { icon: 'people', value: '50,000+', label: 'Learners' },
  { icon: 'school', value: '500+', label: 'Schools' },
  { icon: 'book', value: '10,000+', label: 'Books & Resources' },
  { icon: 'globe', label: 'Across\nUganda & Beyond' },
];
const NAVY = ['#0B2350', '#123A72'] as const;
const DARK = '#0F1B3D';

/** Desktop: the photo panel with "Join Maple", four promises, a parent's quote and the reach numbers (reference pixels). */
export function SignUpPanel({ art, width, height }: { art?: Art; width: number; height: number }) {
  return (
    <View style={[styles.panel, { width, height }]}>
      {art ? <Image source={art.panel} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="left" /> : <LinearGradient colors={NAVY} style={StyleSheet.absoluteFill} />}
      <Text style={styles.join} accessibilityRole="header">
        {'Join '}
        <Text style={styles.accent}>Maple</Text>
      </Text>
      <Text style={styles.sub}>{'Quality education.\nReal progress.\nA brighter future.'}</Text>
      <View style={styles.promises}>
        {PROMISES.map((p, i) => (
          <View key={p.title} style={styles.promise}>
            {art ? (
              <Image source={art[`promise-${i + 1}`]} style={styles.circle} contentFit="contain" />
            ) : (
              <View style={[styles.circle, { backgroundColor: p.tint }]}>
                <Icon name={p.icon} size={26} color={Brand.surface} />
              </View>
            )}
            <View>
              <Text style={styles.promiseTitle}>{p.title}</Text>
              <Text style={styles.promiseBody}>{p.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.quote}>
        {art ? <Image source={art.face} style={styles.face} contentFit="cover" /> : <View style={styles.face} />}
        <Text style={styles.mark}>“</Text>
        <View style={styles.quoteBody}>
          <Text style={styles.quoteText}>“Maple has made learning so easy for my daughter. The live classes and resources really help.”</Text>
          <Text style={styles.quoteBy}>— Parent, Kampala</Text>
        </View>
      </View>
      <View style={styles.stats}>
        {STATS.map((s, i) => (
          <View key={s.label} style={[styles.stat, i > 0 && styles.statRule]}>
            <Icon name={s.icon} size={30} color={DARK} />
            {s.value ? <Text style={styles.statValue}>{s.value}</Text> : null}
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { overflow: 'hidden', borderBottomLeftRadius: 14, borderBottomRightRadius: 14, backgroundColor: '#0B2350' },
  join: { position: 'absolute', left: 35, top: 86, fontSize: 64, lineHeight: 74, fontWeight: '800', color: Brand.surface, letterSpacing: -1.6 },
  accent: { color: '#4DA3FF' },
  sub: { position: 'absolute', left: 38, top: 172, fontSize: 24, lineHeight: 31.5, color: '#F1F5FB' },
  promises: { position: 'absolute', left: 41, top: 291, gap: 26 },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  circle: { width: 57, height: 57, alignItems: 'center', justifyContent: 'center', borderRadius: 29 },
  promiseTitle: { fontSize: 16.5, lineHeight: 21, fontWeight: '700', color: Brand.surface },
  promiseBody: { marginTop: 3, fontSize: 14.5, lineHeight: 19, color: '#D9E3F2' },
  quote: { position: 'absolute', left: 36, top: 672, width: 372, height: 117, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(240,244,250,0.88)' },
  face: { position: 'absolute', left: 14, top: 12, width: 66, height: 66, borderRadius: 33, backgroundColor: '#C9D6EA' },
  mark: { position: 'absolute', left: 99, top: 4, fontSize: 40, fontWeight: '800', color: '#1463F3' },
  quoteBody: { position: 'absolute', left: 127, top: 20, width: 232 },
  quoteText: { fontSize: 14, lineHeight: 20.5, color: DARK },
  quoteBy: { marginTop: 8, fontSize: 12.5, color: '#3F4A63' },
  stats: { position: 'absolute', left: 14, top: 806, width: 600, height: 100, flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statRule: { borderLeftWidth: 1, borderLeftColor: 'rgba(15,27,61,0.18)' },
  statValue: { marginTop: 4, fontSize: 18.5, fontWeight: '800', color: DARK },
  statLabel: { fontSize: 14, lineHeight: 18, color: DARK, textAlign: 'center' },
});
