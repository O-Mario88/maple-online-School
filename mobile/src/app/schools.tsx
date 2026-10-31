import Head from 'expo-router/head';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RefScale } from '@/features/public/home/RefScale';
import { HomeNav, PAPER_LINKS } from '@/features/public/HomeNav';
import { PhoneBar } from '@/features/public/PhoneBar';
import { Brand } from '@/features/public/palette';
import { CurriculumPreview } from '@/features/public/schools/CurriculumPreview';
import { RoiCalculator } from '@/features/public/schools/RoiCalculator';
import { FeatureTiles, ResultsStrip, SchoolsHero, SetupCard, TrustedRow } from '@/features/public/schools/SchoolsSections';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

/** From this width the page is the reference itself, scaled to fit. */
const DESKTOP_MIN = 1200;
/** The For Schools reference is 1250px wide: main column 980, ROI 234, setup 300. */
const SCHOOLS_REF_WIDTH = 1250;
const PHONE_MAX = 720;

/** Inventory 5: the For Schools page, with the ROI calculator, curriculum templates and 15-minute setup. */
export default function SchoolsScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_MIN;

  if (!mock) return <PreviewScreen title="For schools">{() => null}</PreviewScreen>;
  const page = mock.publicPages.schoolsPage;

  const head = (
    <Head>
      <title>Maple for Schools: Live Classes, Curricula and Progress Tracking</title>
      <meta name="description" content="Give your school live classes, ready-made UNEB, KCSE, WAEC and IGCSE schemes of work, past papers and progress tracking. See your ROI and set up in 15 minutes." />
    </Head>
  );

  if (!desktop) {
    // Phones follow the reference phone screen: hero, results, ROI, then the rest.
    return (
      <LightOnly>
        {head}
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <PhoneBar />
          <ScrollView contentContainerStyle={styles.page}>
            <View style={styles.phone}>
              <SchoolsHero page={page} wide={false} phone />
              <ResultsStrip page={page} />
              <RoiCalculator roi={page.roi} />
              <CurriculumPreview templates={page.templates} wide={false} />
              <SetupCard page={page} />
              <TrustedRow page={page} />
              <FeatureTiles page={page} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </LightOnly>
    );
  }

  return (
    <LightOnly>
      {head}
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <RefScale width={width}>
          <HomeNav wide tall fullWidth links={PAPER_LINKS} active="For Schools" searchPlaceholder="Search courses, teachers, or past papers..." />
        </RefScale>
        <ScrollView style={styles.page}>
          <RefScale width={width} refWidth={SCHOOLS_REF_WIDTH}>
            <View style={styles.desk}>
              <View style={styles.deskMain}>
                <SchoolsHero page={page} wide />
                <TrustedRow page={page} wide />
                <FeatureTiles page={page} wide />
              </View>
              <View style={styles.roi}>
                <RoiCalculator roi={page.roi} />
              </View>
            </View>
            <View style={styles.deskBottom}>
              <View style={styles.preview}>
                <CurriculumPreview templates={page.templates} wide />
              </View>
              <View style={styles.setup}>
                <SetupCard page={page} />
              </View>
            </View>
          </RefScale>
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  page: { backgroundColor: '#F5F9FE', paddingBottom: 40 },
  phone: { width: '100%', maxWidth: PHONE_MAX, alignSelf: 'center', gap: 16, padding: 16 },
  desk: { flexDirection: 'row', alignItems: 'flex-start', paddingRight: 20 },
  deskMain: { width: 996, gap: 14, paddingLeft: 16, paddingTop: 14 },
  roi: { width: 234, marginTop: 6 },
  deskBottom: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 20, paddingHorizontal: 16 },
  preview: { flex: 1 },
  setup: { width: 300 },
});
