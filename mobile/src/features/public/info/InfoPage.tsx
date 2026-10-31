import { type Href, router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';
import type { MockData } from '@/mock';

import { HomeNav } from '../HomeNav';
import { Brand } from '../palette';
import { PhoneBar } from '../PhoneBar';
import { InfoSection } from './InfoBlocks';

type PageKey = keyof MockData['publicPages']['infoPages'];

const DESKTOP_MIN = 900;
const COLUMN = 1120;
const FOOTER: readonly { label: string; href: string }[] = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Curriculums', href: '/curriculums' },
  { label: 'For Teachers', href: '/teachers' },
  { label: 'For Schools', href: '/schools' },
  { label: 'About', href: '/about' },
  { label: 'Help', href: '/help' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

const go = (href: string) => router.push(href as Href);

/** A public information page (Pricing, Curriculums, For Teachers, About, Terms, Privacy): hero, sections and the site footer. */
export function InfoPage({ page }: { page: PageKey }) {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= DESKTOP_MIN;

  if (!mock) return <PreviewScreen title="Maple Online School">{() => null}</PreviewScreen>;
  const p = mock.publicPages.infoPages[page];

  return (
    <LightOnly>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {wide ? <HomeNav wide active={p.nav} /> : <PhoneBar />}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <View style={[styles.column, { width: Math.min(width, COLUMN) }, !wide && styles.columnPhone]}>
            <View style={[styles.hero, !wide && styles.heroPhone]}>
              <View style={styles.eyebrow}>
                <Icon name={p.icon} size={14} color={Brand.blue} />
                <Text style={styles.eyebrowText}>{p.eyebrow}</Text>
              </View>
              <Text style={[styles.h1, !wide && styles.h1Phone]} accessibilityRole="header">
                {p.title}
              </Text>
              <Text style={styles.sub}>{p.sub}</Text>
              {p.cta || p.second ? (
                <View style={styles.ctas}>
                  {p.cta ? (
                    <Pressable style={styles.primary} onPress={() => go(p.cta?.href ?? '/sign-up')} accessibilityRole="button">
                      <Text style={styles.primaryText}>{p.cta.label}</Text>
                    </Pressable>
                  ) : null}
                  {p.second ? (
                    <Pressable style={styles.secondary} onPress={() => go(p.second?.href ?? '/explore')} accessibilityRole="button">
                      <Text style={styles.secondaryText}>{p.second.label}</Text>
                    </Pressable>
                  ) : null}
                </View>
              ) : null}
            </View>
            {p.blocks.map((b, i) => (
              <InfoSection key={`${b.kind}-${i}`} block={b} wide={wide} plans={mock.publicPages.pricingPlans} />
            ))}
            <View style={styles.footer} accessibilityRole="menu">
              {FOOTER.map((f) => (
                <Pressable key={f.href} onPress={() => go(f.href)} accessibilityRole="link" hitSlop={6}>
                  <Text style={styles.footLink}>{f.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.copyright}>© 2026 Maple Global Online School</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  scroll: { backgroundColor: Brand.canvas },
  content: { paddingBottom: 40 },
  column: { alignSelf: 'center', gap: 28, paddingHorizontal: 24, paddingTop: 28 },
  columnPhone: { paddingHorizontal: 16, paddingTop: 16, gap: 22 },
  hero: { gap: 14, padding: 36, borderRadius: 20, backgroundColor: Brand.blueSoft },
  heroPhone: { padding: 22 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrowText: { fontSize: 13, fontWeight: '700', color: Brand.blue, textTransform: 'uppercase', letterSpacing: 0.6 },
  h1: { maxWidth: 760, fontSize: 40, lineHeight: 48, fontWeight: '800', color: Brand.ink, letterSpacing: -0.8 },
  h1Phone: { fontSize: 28, lineHeight: 35 },
  sub: { maxWidth: 720, fontSize: 16, lineHeight: 24, color: Brand.body },
  ctas: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  primary: { height: 46, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Brand.blue },
  primaryText: { fontSize: 15, fontWeight: '700', color: Brand.surface },
  secondary: { height: 46, paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: Brand.line, backgroundColor: Brand.surface },
  secondaryText: { fontSize: 15, fontWeight: '600', color: Brand.ink },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, paddingTop: 20, borderTopWidth: 1, borderTopColor: Brand.line },
  footLink: { fontSize: 13.5, fontWeight: '600', color: Brand.body },
  copyright: { fontSize: 12, color: Brand.muted },
});
