import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { MockData } from '@/mock';

import { Brand, CARD_SHADOW } from '../palette';

type Digest = MockData['publicPages']['parentDigest'];

const NAVY = '#0B1E4D';

/** The private-link header: logo and how long the link stays valid. */
export function DigestHeader({ validUntil, wide }: { validUntil: string; wide: boolean }) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Text style={styles.leaf}>🍁</Text>
        <View>
          <Text style={styles.name}>Maple</Text>
          <Text style={styles.tag}>Global Online School</Text>
        </View>
      </View>
      <View style={styles.valid}>
        <Icon name="lock" size={18} color={Brand.ink} />
        <View>
          <Text style={styles.validText}>{wide ? 'This link is private and valid until' : 'Valid until'}</Text>
          <Text style={styles.validDate}>{validUntil}</Text>
        </View>
      </View>
    </View>
  );
}

/** "Weekly Learning Digest" over the learner's photo, with the child card, stats and teacher's quote. */
export function DigestHero({ d, wide }: { d: Digest; wide: boolean }) {
  return (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <View style={[styles.banner, wide && styles.bannerWide]}>
        <Image source={d.heroPhoto} style={[styles.photo, wide && styles.photoWide]} contentFit="cover" accessibilityLabel="A smiling learner in school uniform" />
        <LinearGradient colors={[NAVY, 'rgba(11,30,77,0.85)', 'rgba(11,30,77,0)']} locations={[0, 0.45, 0.75]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        <View style={styles.bannerCopy}>
          <Text style={[styles.title, wide && styles.titleWide]} accessibilityRole="header">
            {'Weekly Learning\n'}
            <Text style={styles.accent}>Digest</Text>
          </Text>
          <Text style={styles.sub}>{"A summary of your child's learning journey this week."}</Text>
          <View style={styles.week}>
            <Icon name="calendar" size={16} color={Brand.surface} />
            <Text style={styles.weekText}>{d.week}</Text>
          </View>
        </View>
      </View>
      <View style={[styles.childCard, wide && styles.childCardWide]}>
        <View style={styles.childRow}>
          <Image source={d.child.photo} style={styles.childPhoto} contentFit="cover" accessibilityLabel={d.child.name} />
          <View style={styles.flexShrink}>
            <Text style={styles.childName}>{d.child.name}</Text>
            <Text style={styles.muted}>{`${d.child.level}  •  ${d.child.school}`}</Text>
          </View>
        </View>
        <View style={styles.stats}>
          {d.stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Icon name={s.icon} size={24} color={s.tint} />
              <View style={styles.flexShrink}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>
        <Text style={styles.quote}>{`“${d.quote.text}”`}</Text>
        <Text style={styles.muted}>{`— ${d.quote.by}`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flexShrink: { flexShrink: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14, backgroundColor: Brand.surface, ...CARD_SHADOW },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  leaf: { fontSize: 30 },
  name: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  tag: { fontSize: 10, color: Brand.body, marginTop: -2 },
  valid: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  validText: { fontSize: 12, color: Brand.body },
  validDate: { fontSize: 12, fontWeight: '700', color: Brand.ink },
  hero: { gap: 16 },
  heroWide: { flexDirection: 'row', alignItems: 'stretch', gap: 0 },
  banner: { minHeight: 260, borderRadius: 16, overflow: 'hidden', backgroundColor: NAVY, justifyContent: 'center' },
  bannerWide: { flex: 1.15, minHeight: 300, borderTopRightRadius: 0, borderBottomRightRadius: 0 },
  photo: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '60%' },
  photoWide: { width: '55%', right: 0 },
  bannerCopy: { gap: 10, padding: 24, maxWidth: 380 },
  title: { fontSize: 34, lineHeight: 38, fontWeight: '900', color: Brand.surface, letterSpacing: -0.8 },
  titleWide: { fontSize: 42, lineHeight: 46 },
  accent: { color: '#5B9BFF' },
  sub: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.9)' },
  week: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', marginTop: 6 },
  weekText: { fontSize: 14, fontWeight: '600', color: Brand.surface },
  childCard: { gap: 12, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  childCardWide: { flex: 1, marginLeft: -40, marginVertical: 20 },
  childRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  childPhoto: { width: 58, height: 58, borderRadius: 29 },
  childName: { fontSize: 22, fontWeight: '800', color: Brand.ink },
  muted: { fontSize: 12, color: Brand.muted },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { flexGrow: 1, flexBasis: 120, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Brand.line },
  statValue: { fontSize: 18, fontWeight: '800', color: Brand.ink },
  statLabel: { fontSize: 11, color: Brand.body },
  quote: { fontSize: 14, lineHeight: 21, fontStyle: 'italic', color: Brand.body },
});
