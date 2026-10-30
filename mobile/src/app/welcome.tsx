import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHero } from '@/features/public/HomeHero';
import { HomeNav } from '@/features/public/HomeNav';
import { LiveStrip } from '@/features/public/LiveStrip';
import { Brand, PUBLIC_WIDE } from '@/features/public/palette';
import { TryLesson } from '@/features/public/TryLesson';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';
import { PUBLIC_PREVIEWS } from '@/lib/navigation';

const MAX_WIDTH = 1440;

/** Inventory 1, 6 and 7: the public home page, built to the homepage reference. */
export default function WelcomeScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;

  if (!mock) {
    // Deployment builds have no sample data yet; PreviewScreen says "Coming soon".
    return <PreviewScreen title="Maple Online School">{() => null}</PreviewScreen>;
  }
  const landing = mock.publicPages.landing;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <HomeNav wide={wide} />
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.inner}>
          <HomeHero landing={landing} wide={wide} />
          <LiveStrip classes={landing.liveClasses} />
          <TryLesson lesson={landing.sampleLesson} wide={wide} />
          <View style={styles.footer}>
            <Text style={styles.footNote}>Design preview · sample data. More public pages:</Text>
            <View style={styles.footLinks}>
              {PUBLIC_PREVIEWS.filter((p) => p.href !== '/welcome').map((p) => (
                <Pressable key={p.href} accessibilityRole="link" onPress={() => router.push(p.href)}>
                  <Text style={styles.footLink}>{p.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  page: { backgroundColor: Brand.canvas, paddingBottom: 40 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 20 },
  footer: { marginHorizontal: 20, gap: 8, paddingTop: 8 },
  footNote: { fontSize: 12, color: Brand.muted },
  footLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  footLink: { fontSize: 13, fontWeight: '600', color: Brand.blue },
});
