import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState } from '@/components/ui';
import { RefScale } from '@/features/public/home/RefScale';
import { EXPLORE_LINKS, HomeNav } from '@/features/public/HomeNav';
import { LIVE_REF_WIDTH, LiveDesk } from '@/features/public/live/LiveDesk';
import { LivePhone } from '@/features/public/live/LivePhone';
import { Brand } from '@/features/public/palette';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

/** From this width the page is the reference itself, scaled to fit. */
const DESKTOP_MIN = 1200;

/** Inventory 9: a public live class or bootcamp page anyone can open from a shared link. */
export default function LiveSessionScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_MIN;

  if (!mock) return <PreviewScreen title="Live class">{() => null}</PreviewScreen>;
  const s = mock.publicPages.liveSession;
  if (slug !== s.slug) {
    return (
      <LightOnly>
        <SafeAreaView style={styles.safe}>
          <HomeNav wide={desktop} active="Live Classes" />
          <EmptyState
            icon="search"
            title="Live class not found"
            body="It may have finished or the link may be old."
            action={<Button label="See live classes" variant="secondary" compact onPress={() => router.push('/explore')} />}
          />
        </SafeAreaView>
      </LightOnly>
    );
  }

  if (!desktop) {
    return (
      <LightOnly>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <LivePhone s={s} />
        </SafeAreaView>
      </LightOnly>
    );
  }

  return (
    <LightOnly>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <RefScale width={width}>
          <HomeNav wide tall fullWidth links={EXPLORE_LINKS} active="Live Classes" searchPlaceholder="Search courses, live classes, topics..." />
        </RefScale>
        <ScrollView style={styles.page}>
          <RefScale width={width} refWidth={LIVE_REF_WIDTH}>
            <LiveDesk s={s} />
          </RefScale>
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  page: { backgroundColor: '#F4F8FC' },
});
