import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { AUTH_SKY, AuthPhoneTop, AuthTopBar, FitScale } from '@/features/auth/AuthChrome';
import { CountryFlag, RoleCards, Select, Steps, SubjectChips, Summary } from '@/features/auth/onboarding/OnboardingParts';
import { type Onboarding, useOnboarding, type Wizard } from '@/features/auth/onboarding/useOnboarding';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { Brand } from '@/features/public/palette';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

const DESKTOP_MIN = 900;
// The reference's desktop frame is 1178 × 1024 (the white bar at (18, 10), the page under it).
const REF_W = 1178;
const REF_H = 1024;

function finish() {
  router.push('/');
}

function Curriculum({ o }: { o: Onboarding }) {
  return (
    <Text style={styles.selectText} numberOfLines={1}>
      <Text style={styles.selectStrong}>{o.curriculum.code}</Text>
      {` (${o.curriculum.name})`}
    </Text>
  );
}

function Desktop({ w, o }: { w: Wizard; o: Onboarding }) {
  return (
    <FitScale refWidth={REF_W} refHeight={REF_H}>
      <View style={styles.bar}>
        <AuthTopBar width={1142} />
      </View>
      <View style={styles.page}>
        <Image source={w.note} style={styles.note} contentFit="contain" accessibilityLabel="Quality education for a brighter future" />
        <Text style={styles.eyebrow}>GET STARTED</Text>
        <Text style={styles.title} accessibilityRole="header">
          Let’s set up your Maple experience
        </Text>
        <Text style={styles.sub}>A few quick steps to personalize your learning journey.</Text>
        <View style={styles.stepsDesk}>
          <Steps />
        </View>

        <View style={[styles.box, styles.roleBox]}>
          <Text style={styles.h}>1. I am a...</Text>
          <Text style={styles.hSub}>Choose the option that best describes you. We’ll tailor the experience to your needs.</Text>
          <View style={styles.rolesDesk}>
            <RoleCards w={w} o={o} />
          </View>
        </View>

        <View style={[styles.box, styles.countryBox]}>
          <Text style={styles.h2}>2. Country & Curriculum</Text>
          <Text style={styles.hSub}>Select your country and curriculum so we can show you the right content.</Text>
          <View style={styles.twoCols}>
            <View style={styles.colCountry}>
              <Text style={styles.label}>Country</Text>
              <Select label={`Country: ${o.country.name}`} onPress={o.nextCountry} lead={<CountryFlag country={o.country} />}>
                <Text style={styles.selectText}>{o.country.name}</Text>
              </Select>
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>Curriculum / Exam Board</Text>
              <Select label={`Curriculum: ${o.curriculum.code}`} onPress={o.nextCurriculum} lead={<Image source={o.curriculum.crest} style={styles.crest} />}>
                <Curriculum o={o} />
              </Select>
            </View>
          </View>
        </View>

        <View style={[styles.box, styles.gradeBox]}>
          <Text style={styles.h2}>3. Grade & Target Subjects</Text>
          <Text style={styles.hSub}>Choose your current grade and the subjects you want to focus on.</Text>
          <View style={styles.twoCols}>
            <View style={styles.colGrade}>
              <Text style={styles.label}>Grade / Class</Text>
              <View style={styles.gradeSelect}>
                <Select label={`Grade: ${o.grade}`} onPress={o.nextGrade} chevron="chevronRight">
                  <Text style={styles.gradeText}>{o.grade}</Text>
                </Select>
              </View>
            </View>
            <View style={styles.flex}>
              <Text style={styles.label}>
                Target Subjects <Text style={styles.muted}>(Select all that apply)</Text>
              </Text>
              <SubjectChips w={w} o={o} />
            </View>
          </View>
        </View>

        <View style={styles.summaryBox}>
          <Summary o={o} />
        </View>

        <Pressable style={styles.back} onPress={() => (router.canGoBack() ? router.back() : router.push('/welcome'))} accessibilityRole="button">
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Pressable style={styles.continue} onPress={finish} accessibilityRole="button">
          <Text style={styles.continueText}>Continue to Your Dashboard</Text>
          <Icon name="arrowRight" size={16} color={Brand.surface} />
        </Pressable>
      </View>
    </FitScale>
  );
}

function Phone({ w, o }: { w: Wizard; o: Onboarding }) {
  return (
    <>
      <AuthPhoneTop />
      <ScrollView contentContainerStyle={styles.phone}>
        <Steps phone />
        <Text style={styles.titleP} accessibilityRole="header">
          {'Let’s set up your\nMaple experience'}
        </Text>
        <Text style={styles.subP}>A few quick steps to personalize your learning journey.</Text>
        <View style={styles.cardP}>
          <Text style={styles.hP}>1. I am a...</Text>
          <Text style={styles.hSubP}>Choose the option that best describes you.</Text>
          <RoleCards w={w} o={o} phone />
        </View>
        <View style={styles.cardP}>
          <Text style={styles.hP}>2. Country & Curriculum</Text>
          <Text style={styles.hSubP}>Select your country and curriculum.</Text>
          <Select phone label={`Country: ${o.country.name}`} onPress={o.nextCountry} lead={<CountryFlag country={o.country} />}>
            <Text style={styles.selectText}>{o.country.name}</Text>
          </Select>
          <Select phone label={`Curriculum: ${o.curriculum.code}`} onPress={o.nextCurriculum} lead={<Image source={o.curriculum.crest} style={styles.crest} />}>
            <Text style={styles.selectSmall} numberOfLines={1}>
              <Text style={styles.selectStrong}>{o.curriculum.code}</Text>
              {` (${o.curriculum.name})`}
            </Text>
          </Select>
        </View>
        <View style={styles.cardP}>
          <Text style={styles.hP}>3. Grade & Target Subjects</Text>
          <Text style={styles.hSubP}>Choose your grade and subjects.</Text>
          <Select phone label={`Grade: ${o.grade}`} onPress={o.nextGrade}>
            <Text style={styles.selectText}>{o.grade}</Text>
          </Select>
          <SubjectChips w={w} o={o} phone limit={4} />
        </View>
        <Pressable style={styles.continueP} onPress={finish} accessibilityRole="button">
          <Text style={styles.continueText}>Continue to Your Dashboard</Text>
          <Icon name="arrowRight" size={16} color={Brand.surface} />
        </Pressable>
      </ScrollView>
    </>
  );
}

/** Inventory 2: the 3-step onboarding wizard (role, country and curriculum, grade and subjects), built to its reference. */
export default function GetStartedScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  if (!mock) return <PreviewScreen title="Let's set up Maple for you">{() => null}</PreviewScreen>;
  return <WizardScreen w={mock.publicPages.onboardingWizard} desktop={width >= DESKTOP_MIN} />;
}

function WizardScreen({ w, desktop }: { w: Wizard; desktop: boolean }) {
  const o = useOnboarding(w);
  return (
    <LightOnly>
      <SafeAreaView style={desktop ? styles.sky : styles.phoneSafe} edges={['top', 'left', 'right']}>
        {desktop ? <Desktop w={w} o={o} /> : <Phone w={w} o={o} />}
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sky: { flex: 1, backgroundColor: AUTH_SKY },
  bar: { position: 'absolute', left: 18, top: 10 },
  page: { position: 'absolute', left: 18, top: 77, width: 1142, height: 940, backgroundColor: '#F4F9FE', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  note: { position: 'absolute', left: 917, top: 5, width: 180, height: 130 },
  eyebrow: { position: 'absolute', left: 52, top: 25, fontSize: 13, fontWeight: '600', letterSpacing: 0.4, color: Brand.blue },
  title: { position: 'absolute', left: 52, top: 44, fontSize: 40, fontWeight: '700', color: Brand.ink, letterSpacing: -1 },
  sub: { position: 'absolute', left: 52, top: 99, fontSize: 18, color: '#3D4656' },
  stepsDesk: { position: 'absolute', left: 52, top: 132 },
  box: { position: 'absolute', left: 28, width: 825, paddingHorizontal: 25, borderRadius: 10, backgroundColor: Brand.surface },
  roleBox: { top: 185, height: 346, paddingTop: 12 },
  countryBox: { top: 545, height: 134, paddingTop: 12 },
  gradeBox: { top: 692, height: 179, paddingTop: 12 },
  h: { fontSize: 23, fontWeight: '700', color: Brand.ink },
  h2: { fontSize: 21, fontWeight: '700', color: Brand.ink },
  hSub: { marginTop: 7, fontSize: 13.5, color: '#4A5263' },
  rolesDesk: { marginTop: 14 },
  twoCols: { flexDirection: 'row', gap: 25, marginTop: 14 },
  colCountry: { width: 342 },
  colGrade: { width: 185 },
  label: { marginBottom: 6, fontSize: 13.5, color: Brand.ink },
  muted: { color: '#4A5263' },
  selectText: { fontSize: 13.5, color: Brand.ink },
  selectSmall: { fontSize: 11.5, color: Brand.ink },
  selectStrong: { fontWeight: '600' },
  crest: { width: 26, height: 26, borderRadius: 13 },
  gradeSelect: { height: 40 },
  gradeText: { fontSize: 14, fontWeight: '500', color: Brand.ink },
  summaryBox: { position: 'absolute', left: 867, top: 185, width: 251 },
  back: { position: 'absolute', left: 29, top: 881, width: 117, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: '#D5DCE7', backgroundColor: '#F1F5FB' },
  backText: { fontSize: 14.5, color: Brand.ink },
  continue: { position: 'absolute', left: 800, top: 881, width: 302, height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 7, backgroundColor: '#0067FE' },
  continueText: { fontSize: 14.5, fontWeight: '500', color: Brand.surface },
  phoneSafe: { flex: 1, backgroundColor: '#F4F7FC' },
  phone: { gap: 14, padding: 16, paddingBottom: 32 },
  titleP: { marginTop: 8, fontSize: 25, lineHeight: 29, fontWeight: '700', color: Brand.ink, letterSpacing: -0.5 },
  subP: { marginTop: -6, fontSize: 14.5, lineHeight: 20, color: '#3D4656' },
  cardP: { gap: 10, padding: 12, borderRadius: 12, backgroundColor: Brand.surface },
  hP: { fontSize: 17, fontWeight: '700', color: Brand.ink },
  hSubP: { marginTop: -6, fontSize: 12, color: '#4A5263' },
  continueP: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 9, backgroundColor: '#0067FE' },
});
