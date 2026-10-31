import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeHeroDesktop, HomeHeroPhone } from '@/features/public/HomeHero';
import { HomeNav } from '@/features/public/HomeNav';
import { LiveStrip } from '@/features/public/LiveStrip';
import { RefScale } from '@/features/public/home/RefScale';
import { TryLesson } from '@/features/public/TryLesson';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';
import { PUBLIC_PREVIEWS } from '@/lib/navigation';
import { LightOnly } from '@/hooks/use-theme';

/** From this width the page is the reference itself, scaled to fit. */
const DESKTOP_MIN = 1200;
/** Tablets get the phone column, centred, no wider than this. */
const COLUMN_MAX = 720;
const PAGE_SKY = '#E8F4FD';

function DesignFooter() {
  return (
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
  );
}

/** Inventory 1, 6 and 7: the public home page, built to the homepage reference. */
export default function WelcomeScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_MIN;

  if (!mock) {
    // Deployment builds have no sample data yet; PreviewScreen says "Coming soon".
    return <PreviewScreen title="Maple Online School">{() => null}</PreviewScreen>;
  }
  const landing = mock.publicPages.landing;
  const column = Math.min(width, COLUMN_MAX);

  return (
    <LightOnly>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {desktop ? (
          <RefScale width={width}>
            <HomeNav wide fullWidth />
          </RefScale>
        ) : (
          <HomeNav wide={false} />
        )}
        <ScrollView style={styles.scroll} contentContainerStyle={styles.page}>
          {desktop ? (
            <RefScale width={width}>
              <HomeHeroDesktop landing={landing} />
              <LiveStrip classes={landing.liveClasses} />
              <View style={styles.deskGap} />
              <TryLesson lesson={landing.sampleLesson} />
            </RefScale>
          ) : (
            <View style={[styles.column, { width: column }]}>
              <HomeHeroPhone landing={landing} width={column} />
              <LiveStrip classes={landing.liveClasses} phone />
              <View style={styles.phoneGap} />
              <TryLesson lesson={landing.sampleLesson} phone />
            </View>
          )}
          <DesignFooter />
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { backgroundColor: PAGE_SKY },
  page: { paddingBottom: 40 },
  column: { alignSelf: 'center' },
  deskGap: { height: 17 },
  phoneGap: { height: 16 },
  footer: { marginHorizontal: 20, marginTop: 24, gap: 8 },
  footNote: { fontSize: 12, color: '#6B7385' },
  footLinks: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  footLink: { fontSize: 13, fontWeight: '600', color: '#1463F3' },
});
