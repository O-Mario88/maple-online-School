import Head from 'expo-router/head';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RefScale } from '@/features/public/home/RefScale';
import { HomeNav, PAPER_LINKS } from '@/features/public/HomeNav';
import { PhoneBar } from '@/features/public/PhoneBar';
import { Brand } from '@/features/public/palette';
import { PricingDetails, PricingTop, PricingTopPhone } from '@/features/public/schools/InstitutionPricing';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

/** From this width the page is the reference itself, scaled to fit. */
const DESKTOP_MIN = 1200;
const PHONE_MAX = 720;

/** Institutional Pricing (`/schools/pricing`): Launch, Growth and Enterprise, the full comparison, how it works and FAQs. */
export default function InstitutionPricingScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  // Real builds show the preview placeholder until Maple Command publishes plan configuration through the API.
  if (!mock) return <PreviewScreen title="Pricing for schools">{() => null}</PreviewScreen>;
  const d = mock.schoolAdmin;
  const head = (
    <Head>
      <title>Maple for Schools: Plans and Pricing</title>
      <meta name="description" content="Maple Launch, Growth and Enterprise: a complete digital school under your school's identity, with live classes, library, assessments, full accounting and School Network growth." />
    </Head>
  );

  if (width < DESKTOP_MIN) {
    return (
      <LightOnly>
        {head}
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <PhoneBar />
          <ScrollView contentContainerStyle={styles.page}>
            <View style={styles.phone}>
              <PricingTopPhone d={d} />
              <PricingDetails d={d} phone />
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
          <HomeNav wide tall fullWidth links={PAPER_LINKS} active="For Schools" searchPlaceholder="Search..." />
        </RefScale>
        <ScrollView style={styles.page}>
          <RefScale width={width}>
            <PricingTop d={d} />
            <PricingDetails d={d} />
          </RefScale>
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  page: { backgroundColor: '#F7F9FE', paddingBottom: 40 },
  phone: { width: '100%', maxWidth: PHONE_MAX, alignSelf: 'center', gap: 18, padding: 16 },
});
