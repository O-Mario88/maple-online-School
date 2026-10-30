import Head from 'expo-router/head';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeNav } from '@/features/public/HomeNav';
import { Brand, PUBLIC_WIDE } from '@/features/public/palette';
import { CurriculumPreview } from '@/features/public/schools/CurriculumPreview';
import { RoiCalculator } from '@/features/public/schools/RoiCalculator';
import { FeatureTiles, SchoolsHero, SetupCard, TrustedRow } from '@/features/public/schools/SchoolsSections';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

const MAX_WIDTH = 1440;
const SIDE = 320;

/** Inventory 5: the For Schools page, with the ROI calculator, curriculum templates and 15-minute setup. */
export default function SchoolsScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;

  if (!mock) return <PreviewScreen title="For schools">{() => null}</PreviewScreen>;
  const page = mock.publicPages.schoolsPage;

  return (
    <LightOnly>
      <Head>
        <title>Maple for Schools: Live Classes, Curricula and Progress Tracking</title>
        <meta name="description" content="Give your school live classes, ready-made UNEB, KCSE, WAEC and IGCSE schemes of work, past papers and progress tracking. See your ROI and set up in 15 minutes." />
      </Head>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <HomeNav wide={wide} active="For Schools" />
        <ScrollView contentContainerStyle={styles.page}>
          <View style={[styles.inner, wide && styles.innerWide]}>
            <View style={[styles.main, wide && styles.flex]}>
              <SchoolsHero page={page} wide={wide} />
              {wide ? null : <RoiCalculator roi={page.roi} />}
              <TrustedRow page={page} />
              <FeatureTiles page={page} />
              <CurriculumPreview templates={page.templates} wide={wide} />
              {wide ? null : <SetupCard page={page} />}
            </View>
            {wide ? (
              <View style={styles.side}>
                <RoiCalculator roi={page.roi} />
                <SetupCard page={page} />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  page: { backgroundColor: Brand.canvas, paddingBottom: 40 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 20, padding: 16 },
  innerWide: { flexDirection: 'row', alignItems: 'flex-start', padding: 24 },
  flex: { flex: 1 },
  main: { gap: 20, minWidth: 0 },
  side: { width: SIDE, gap: 20 },
});
