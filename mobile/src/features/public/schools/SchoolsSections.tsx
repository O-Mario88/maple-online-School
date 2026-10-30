import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { MockData } from '@/mock';

import { Brand, CARD_SHADOW } from '../palette';

type Page = MockData['publicPages']['schoolsPage'];

/** The hero: badge, three-line promise, ticks, the two calls to action, and the students photo with results. */
export function SchoolsHero({ page, wide }: { page: Page; wide: boolean }) {
  return (
    <View style={[styles.hero, wide && styles.heroWide]}>
      <View style={[styles.copy, wide && styles.copyWide]}>
        <Text style={styles.badge}>◎ FOR SCHOOLS & INSTITUTIONS</Text>
        <Text style={[styles.title, wide && styles.titleWide]} accessibilityRole="header">
          {'Better Learning.\nHigher '}
          <Text style={styles.accent}>Results.</Text>
          {'\nHappier Teachers.'}
        </Text>
        <Text style={styles.sub}>MAPLE helps schools deliver world-class academic support with live classes, structured curricula, past papers, AI-powered practice, and real-time progress tracking.</Text>
        {page.promises.map((p) => (
          <View key={p} style={styles.point}>
            <Icon name="check" size={16} color={Brand.blue} />
            <Text style={styles.body}>{p}</Text>
          </View>
        ))}
        <View style={styles.ctas}>
          <Pressable style={styles.primary} onPress={() => router.push('/get-started')} accessibilityRole="button">
            <Text style={styles.primaryText}>Start 15-Minute School Setup →</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => router.push('/help')} accessibilityRole="button">
            <Text style={styles.secondaryText}>Book a Demo</Text>
          </Pressable>
        </View>
      </View>
      <View style={[styles.art, wide && styles.artWide]}>
        <Image source={page.heroPhoto} style={styles.photo} contentFit="cover" accessibilityLabel="A teacher and three learners smiling at a laptop" />
        <View style={[styles.results, wide && styles.resultsWide]}>
          <Text style={styles.resultsTitle}>Real Results for Schools</Text>
          <View style={styles.resultsGrid}>
            {page.results.map((r) => (
              <View key={r.label} style={styles.result}>
                <Icon name={r.icon} size={18} color={r.tint} />
                <View style={styles.flexShrink}>
                  <Text style={[styles.resultValue, { color: r.tint }]}>{r.value}</Text>
                  <Text style={styles.resultLabel}>{r.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

/** "Trusted by schools worldwide": board and school crests. */
export function TrustedRow({ page }: { page: Page }) {
  return (
    <View style={styles.card}>
      <View style={styles.trustedHead}>
        <Text style={styles.strong}>Trusted by Schools Worldwide</Text>
        <Text style={styles.link}>View all →</Text>
      </View>
      <View style={styles.trusted}>
        {page.trusted.map((t) => (
          <View key={t.name} style={styles.trust}>
            <Image source={t.crest} style={styles.crest} contentFit="contain" accessibilityLabel={`${t.name} crest`} />
            <View>
              <Text style={styles.trustName}>{t.name}</Text>
              <Text style={styles.muted}>{t.place}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Six things Maple gives a school. */
export function FeatureTiles({ page }: { page: Page }) {
  return (
    <View style={styles.features}>
      {page.features.map((f) => (
        <View key={f.title} style={styles.feature}>
          <View style={[styles.featureIcon, { backgroundColor: `${f.tint}1A` }]}>
            <Icon name={f.icon} size={22} color={f.tint} />
          </View>
          <Text style={styles.featureTitle}>{f.title}</Text>
          <Text style={styles.featureDetail}>{f.detail}</Text>
        </View>
      ))}
    </View>
  );
}

/** "Start 15-minute school setup": the four steps and the button. */
export function SetupCard({ page }: { page: Page }) {
  return (
    <View style={styles.card}>
      <View style={styles.setupHead}>
        <View style={styles.flexShrink}>
          <Text style={styles.setupTitle} accessibilityRole="header">
            Start 15-Minute School Setup
          </Text>
          <Text style={styles.body}>Get your school up and running in just 15 minutes. No technical skills required.</Text>
        </View>
        <Icon name="clock" size={40} color={Brand.blue} />
      </View>
      {page.setupSteps.map((s, i) => (
        <View key={s.title} style={styles.step}>
          <Text style={styles.stepNum}>{String(i + 1)}</Text>
          <View style={styles.flexShrink}>
            <Text style={styles.strong}>{s.title}</Text>
            <Text style={styles.muted}>{s.detail}</Text>
          </View>
        </View>
      ))}
      <Pressable style={styles.primary} onPress={() => router.push('/get-started')} accessibilityRole="button">
        <Text style={styles.primaryText}>Start 15-Minute Setup →</Text>
      </Pressable>
      <Text style={styles.muted}>Prefer a guided setup?</Text>
      <Pressable onPress={() => router.push('/help')} accessibilityRole="link">
        <Text style={styles.link}>Book a demo with our team →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flexShrink: { flexShrink: 1 },
  card: { gap: 12, padding: 18, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  hero: { gap: 20 },
  heroWide: { flexDirection: 'row', alignItems: 'stretch' },
  copy: { gap: 12 },
  copyWide: { flex: 1, paddingTop: 8 },
  badge: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '800', letterSpacing: 0.4, color: Brand.surface, backgroundColor: Brand.blue, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, overflow: 'hidden' },
  title: { fontSize: 34, lineHeight: 38, fontWeight: '900', color: Brand.ink, letterSpacing: -1 },
  titleWide: { fontSize: 46, lineHeight: 50, letterSpacing: -1.4 },
  accent: { color: Brand.blue },
  sub: { fontSize: 15, lineHeight: 23, color: Brand.body },
  point: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  body: { fontSize: 13, lineHeight: 19, color: Brand.body, flexShrink: 1 },
  ctas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 8 },
  primary: { alignItems: 'center', justifyContent: 'center', minHeight: 46, paddingHorizontal: 20, borderRadius: 8, backgroundColor: Brand.blue },
  primaryText: { fontSize: 14, fontWeight: '700', color: Brand.surface },
  secondary: { alignItems: 'center', justifyContent: 'center', minHeight: 46, paddingHorizontal: 22, borderRadius: 8, borderWidth: 1, borderColor: Brand.blue, backgroundColor: Brand.surface },
  secondaryText: { fontSize: 14, fontWeight: '700', color: Brand.blue },
  art: { minHeight: 300 },
  artWide: { flex: 1.1 },
  photo: { width: '100%', height: '100%', minHeight: 300, borderRadius: 16 },
  results: { gap: 8, padding: 12, borderRadius: 12, backgroundColor: Brand.surface, marginTop: -60, marginHorizontal: 12, ...CARD_SHADOW },
  resultsWide: { position: 'absolute', right: 10, bottom: 14, width: 190, marginTop: 0, marginHorizontal: 0 },
  resultsTitle: { fontSize: 12, fontWeight: '700', color: Brand.ink },
  resultsGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10 },
  result: { width: '50%', flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  resultValue: { fontSize: 15, fontWeight: '800' },
  resultLabel: { fontSize: 9, color: Brand.muted },
  trustedHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  strong: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  link: { fontSize: 12, fontWeight: '600', color: Brand.blue },
  muted: { fontSize: 11, color: Brand.muted },
  trusted: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 14 },
  trust: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  crest: { width: 34, height: 36 },
  trustName: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  feature: { flexGrow: 1, flexBasis: 140, alignItems: 'center', gap: 6, paddingVertical: 14, paddingHorizontal: 8 },
  featureIcon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 14, fontWeight: '700', color: Brand.ink, textAlign: 'center' },
  featureDetail: { fontSize: 12, color: Brand.body, textAlign: 'center' },
  setupHead: { flexDirection: 'row', gap: 12 },
  setupTitle: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNum: { width: 28, height: 28, borderRadius: 14, textAlign: 'center', lineHeight: 28, fontSize: 13, fontWeight: '800', color: Brand.surface, backgroundColor: Brand.blue, overflow: 'hidden' },
});
