import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import type { IconName } from '@/lib/icons';
import type { MockData } from '@/mock';

type Art = MockData['publicPages']['signInArt'];

const PROMISES: readonly { icon: IconName; title: string; body: string }[] = [
  { icon: 'cap', title: 'Join live classes', body: 'Learn with expert teachers' },
  { icon: 'notes', title: 'Access past papers', body: 'Practice and improve' },
  { icon: 'chart', title: 'Track your progress', body: 'See your growth' },
  { icon: 'people', title: 'Built for everyone', body: 'Learners, parents, teachers and schools' },
];
const STATS: readonly { icon: IconName; value?: string; label: string }[] = [
  { icon: 'people', value: '50,000+', label: 'Learners' },
  { icon: 'school', value: '500+', label: 'Schools' },
  { icon: 'book', value: '10,000+', label: 'Resources' },
  { icon: 'globe', label: 'Across\nUganda & Beyond' },
];
const NAVY = ['#0B2350', '#123A72'] as const;

/** Desktop: the photo panel with the welcome, four promises, a parent's quote and the reach numbers (reference pixels). */
export function SignInPanel({ art, width, height }: { art?: Art; width: number; height: number }) {
  return (
    <View style={[styles.panel, { width, height }]}>
      {art ? <Image source={art.panel} style={StyleSheet.absoluteFill} contentFit="cover" /> : <LinearGradient colors={NAVY} style={StyleSheet.absoluteFill} />}
      <Text style={styles.welcome} accessibilityRole="header">
        {'Welcome to\n'}
        <Text style={styles.accent}>Maple</Text>
      </Text>
      <Text style={styles.sub}>{'Quality education. Real progress.\nA brighter future.'}</Text>
      <View style={styles.promises}>
        {PROMISES.map((p) => (
          <View key={p.title} style={styles.promise}>
            <Icon name={p.icon} size={32} color={Brand.surface} />
            <View>
              <Text style={styles.promiseTitle}>{p.title}</Text>
              <Text style={styles.promiseBody}>{p.body}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.quote}>
        {art ? <Image source={art.parent} style={styles.face} /> : <View style={styles.face} />}
        <Text style={styles.mark}>“</Text>
        <View style={styles.quoteBody}>
          <Text style={styles.quoteText}>Maple has made learning so easy for my daughter. The live classes and past papers really help.</Text>
          <Text style={styles.quoteBy}>— Parent, Kampala</Text>
        </View>
      </View>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotOn]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <View style={styles.stats}>
        {STATS.map((s, i) => (
          <View key={s.label} style={[styles.stat, i > 0 && styles.statRule]}>
            <Icon name={s.icon} size={26} color={Brand.surface} />
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
  welcome: { position: 'absolute', left: 46, top: 94, fontSize: 55, lineHeight: 54, fontWeight: '800', color: Brand.surface, letterSpacing: -1.4 },
  accent: { color: '#4DA3FF' },
  sub: { position: 'absolute', left: 46, top: 216, fontSize: 19.5, lineHeight: 28, color: '#E6EEF8' },
  promises: { position: 'absolute', left: 48, top: 314, gap: 26 },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 26 },
  promiseTitle: { fontSize: 15, fontWeight: '700', color: Brand.surface },
  promiseBody: { marginTop: 5, fontSize: 14, color: '#D6E2F2' },
  quote: { position: 'absolute', left: 46, top: 601, width: 404, height: 139, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.07)' },
  face: { position: 'absolute', left: 16, top: 13, width: 66, height: 66, borderRadius: 33, backgroundColor: '#3B5B8C' },
  mark: { position: 'absolute', left: 104, top: 4, fontSize: 42, fontWeight: '800', color: '#4DA3FF' },
  quoteBody: { position: 'absolute', left: 137, top: 28, width: 250 },
  quoteText: { fontSize: 14.5, lineHeight: 21, color: Brand.surface },
  quoteBy: { marginTop: 10, fontSize: 12.5, color: '#D6E2F2' },
  dots: { position: 'absolute', left: 230, top: 758, flexDirection: 'row', gap: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotOn: { backgroundColor: '#4DA3FF' },
  stats: { position: 'absolute', left: 0, top: 792, width: 452, height: 131, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 30, backgroundColor: 'rgba(4,18,42,0.45)' },
  stat: { flex: 1, alignItems: 'center', gap: 6 },
  statRule: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.18)' },
  statValue: { fontSize: 16.5, fontWeight: '700', color: Brand.surface },
  statLabel: { fontSize: 13, lineHeight: 17, color: '#D6E2F2', textAlign: 'center' },
});
