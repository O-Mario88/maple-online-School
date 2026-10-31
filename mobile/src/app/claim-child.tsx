import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { AUTH_SKY, AuthPhoneTop, AuthTopBar, FitScale } from '@/features/auth/AuthChrome';
import { FlowSteps, type StepState } from '@/features/auth/FlowSteps';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { Brand } from '@/features/public/palette';
import { LightOnly } from '@/hooks/use-theme';
import type { IconName } from '@/lib/icons';
import { mockData } from '@/lib/mock';
import type { MockData } from '@/mock';

type Claim = MockData['publicPages']['claimChild'];
type Stage = 'enter' | 'verify';

const DESKTOP_MIN = 900;
// The reference's desktop frame: 1160 × 990 (bar at (16, 14), photo panel x 26–393, claim card x 403–866, help column x 872–1128).
const REF_W = 1160;
const REF_H = 990;

const PROMISES: readonly { icon: IconName; title: string; body: string }[] = [
  { icon: 'people', title: 'View progress', body: 'See attendance, grades\nand learning activities' },
  { icon: 'cap', title: 'Get updates', body: 'Receive announcements\nand teacher messages' },
  { icon: 'shield', title: 'Secure & private', body: 'Cryptographic verification\nkeeps your child’s data safe' },
  { icon: 'phone', title: 'Stay connected', body: 'Support your child’s growth\nanytime, anywhere' },
];
const NEXT = [
  { title: 'Scan or enter the claim code', body: 'Use your child’s school-provided QR code or 8-character code.' },
  { title: 'Verify child details', body: 'Confirm your child’s date of birth and admission number.' },
  { title: 'Confirm and link', body: 'Once verified, your child will be linked to your account.' },
  { title: 'Access your child’s profile', body: 'View progress, attend updates and stay connected.' },
] as const;

function steps(stage: Stage): { label: string; short: string; state: StepState }[] {
  const at = stage === 'enter' ? 0 : 1;
  return ['Scan or Enter Code', 'Verify Child Details', 'Confirm & Link', 'Complete'].map((label, i) => ({
    label,
    short: ['Scan Code', 'Verify Details', 'Confirm', 'Complete'][i],
    state: i < at ? 'done' : i === at ? 'current' : 'todo',
  }));
}

function cleanCode(v: string, length: number): string {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, length);
}

function useClaim(c: Claim) {
  const [tab, setTab] = useState<'scan' | 'code'>('scan');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<Stage>('enter');
  return { tab, setTab, code, setCode: (v: string) => setCode(cleanCode(v, c.codeLength)), ready: code.length === c.codeLength, stage, setStage };
}
type Form = ReturnType<typeof useClaim>;

function Tabs({ f, phone = false }: { f: Form; phone?: boolean }) {
  const items = [
    { key: 'scan' as const, label: 'Scan QR Code', icon: 'qr' as const },
    { key: 'code' as const, label: 'Enter Claim Code', icon: 'grid' as const },
  ];
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {items.map((t) => {
        const on = f.tab === t.key;
        return (
          <Pressable key={t.key} style={[styles.tab, phone && styles.tabP, on && styles.tabOn]} onPress={() => f.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={t.icon} size={17} color={on ? Brand.blue : Brand.ink} />
            <Text style={[styles.tabText, phone && styles.tabTextP, on && styles.tabTextOn]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function EnterBlock({ c, f, phone = false }: { c: Claim; f: Form; phone?: boolean }) {
  return (
    <>
      <Tabs f={f} phone={phone} />
      {f.tab === 'scan' ? (
        <>
          <Image source={c.art.scanner} style={phone ? styles.scannerP : styles.scanner} contentFit="cover" accessibilityLabel="Hold the Parent Claim card inside the frame" />
          <Pressable
            style={[styles.primary, phone && styles.primaryP]}
            accessibilityRole="button"
            onPress={() => {
              // Sample data has no camera: reading the sample card's code stands in for a scan.
              f.setCode(c.code);
              f.setStage('verify');
            }}>
            <Icon name="camera" size={18} color={Brand.surface} />
            <Text style={styles.primaryText}>Open Camera and Scan QR Code</Text>
          </Pressable>
          <View style={styles.or}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>
        </>
      ) : null}
      <Text style={styles.label}>{`Enter the ${c.codeLength}-character claim code`}</Text>
      <View style={[styles.codeRow, phone && styles.codeRowP]}>
        <TextInput style={[styles.input, phone && styles.inputP]} value={f.code} onChangeText={f.setCode} placeholder="e.g. A7K9M3D2" placeholderTextColor="#9AA3B2" autoCapitalize="characters" autoCorrect={false} accessibilityLabel="Claim code" />
        <Pressable style={[styles.cont, phone && styles.contP, f.ready && styles.contOn]} disabled={!f.ready} onPress={() => f.setStage('verify')} accessibilityRole="button" accessibilityState={{ disabled: !f.ready }}>
          <Text style={styles.contText}>Continue</Text>
          <Icon name="arrowRight" size={16} color={Brand.surface} />
        </Pressable>
      </View>
    </>
  );
}

function VerifyBlock({ c, f }: { c: Claim; f: Form }) {
  const m = c.match;
  return (
    <View style={styles.verify}>
      <Text style={styles.h}>2. Is this your child?</Text>
      <Text style={styles.sub}>{`Code ${f.code} matches this learner. Check the details before you link.`}</Text>
      <View style={styles.match}>
        {[
          ['Name', m.name],
          ['Class', m.cls],
          ['School', m.school],
          ['Admission No.', m.adm],
        ].map(([k, v]) => (
          <View key={k} style={styles.matchRow}>
            <Text style={styles.matchKey}>{k}</Text>
            <Text style={styles.matchVal}>{v}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.primary} onPress={() => router.push('/')} accessibilityRole="button">
        <Icon name="check" size={18} color={Brand.surface} />
        <Text style={styles.primaryText}>Yes, link my child</Text>
      </Pressable>
      <Pressable style={styles.notMine} onPress={() => f.setStage('enter')} accessibilityRole="button">
        <Text style={styles.notMineText}>Not my child — enter another code</Text>
      </Pressable>
    </View>
  );
}

function SecureBox({ phone = false }: { phone?: boolean }) {
  return (
    <View style={[styles.secure, phone && styles.secureP]}>
      <View style={styles.lock}>
        <Icon name="lock" size={20} color={Brand.blue} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.secureTitle}>Secure & Verified</Text>
        <Text style={styles.secureText}>
          {phone ? 'Each claim code is cryptographically signed by the school and expires after 30 days.' : 'Each claim code is cryptographically signed by the school and expires after 30 days. This ensures only authorized parents or guardians can link to a child’s profile.'}
        </Text>
      </View>
    </View>
  );
}

function Desktop({ c, f }: { c: Claim; f: Form }) {
  return (
    <FitScale refWidth={REF_W} refHeight={REF_H}>
      <View style={styles.bar}>
        <AuthTopBar width={1128} />
      </View>
      <View style={styles.page} />
      <View style={styles.steps}>
        <FlowSteps steps={steps(f.stage)} lineWidth={48} />
      </View>
      <View style={styles.panel}>
        <Image source={c.art.panel} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="A parent and child smiling at a phone" />
        <Text style={styles.hero} accessibilityRole="header">
          {'Connect\nwith '}
          <Text style={styles.heroAccent}>Your Child</Text>
        </Text>
        <Text style={styles.heroSub}>Stay involved in your child’s learning journey. Claim your child’s profile using the school-issued QR code or claim code.</Text>
        <View style={styles.promises}>
          {PROMISES.map((p) => (
            <View key={p.title} style={styles.promise}>
              <Icon name={p.icon} size={32} color={Brand.surface} />
              <View>
                <Text style={styles.promiseTitle}>{p.title}</Text>
                <Text style={styles.promiseBody}>{p.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.mid}>
        {f.stage === 'enter' ? (
          <>
            <Text style={styles.h}>1. Scan Your Parent Claim QR Code</Text>
            <Text style={styles.sub}>Use the QR code provided by your child’s school, or enter the claim code manually.</Text>
            <EnterBlock c={c} f={f} />
          </>
        ) : (
          <VerifyBlock c={c} f={f} />
        )}
        <View style={styles.secureWrap}>
          <SecureBox />
        </View>
      </View>
      <View style={[styles.side, styles.whereCard]}>
        <Text style={styles.sideTitle}>Where to find the claim code?</Text>
        <Text style={styles.sideBody}>You can find the Parent Claim QR Code on the card provided by your child’s school or in the school welcome letter.</Text>
        <Image source={c.art.card} style={styles.claimCard} contentFit="contain" accessibilityLabel="An example Parent Claim card" />
      </View>
      <View style={[styles.side, styles.nextCard]}>
        <Text style={styles.sideTitle}>Next Steps</Text>
        {NEXT.map((n, i) => (
          <View key={n.title} style={styles.next}>
            <View style={styles.nextNum}>
              <Text style={styles.nextNumText}>{String(i + 1)}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.nextTitle}>{n.title}</Text>
              <Text style={styles.nextBody}>{n.body}</Text>
            </View>
          </View>
        ))}
      </View>
    </FitScale>
  );
}

function Phone({ c, f }: { c: Claim; f: Form }) {
  return (
    <>
      <AuthPhoneTop />
      <ScrollView contentContainerStyle={styles.phone} keyboardShouldPersistTaps="handled">
        <FlowSteps steps={steps(f.stage)} phone />
        {f.stage === 'enter' ? (
          <>
            <Text style={styles.titleP} accessibilityRole="header">
              Claim Your Child
            </Text>
            <Text style={styles.subP}>Scan the school-issued Parent Claim QR Code or enter the claim code manually.</Text>
            <EnterBlock c={c} f={f} phone />
          </>
        ) : (
          <VerifyBlock c={c} f={f} />
        )}
        <SecureBox phone />
      </ScrollView>
    </>
  );
}

/** Inventory 6: a parent links their child with the school's Parent Claim QR code or 8-character code, built to its reference. */
export default function ClaimChildScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  if (!mock) return <PreviewScreen title="Claim your child">{() => null}</PreviewScreen>;
  return <ClaimScreen c={mock.publicPages.claimChild} desktop={width >= DESKTOP_MIN} />;
}

function ClaimScreen({ c, desktop }: { c: Claim; desktop: boolean }) {
  const f = useClaim(c);
  return (
    <LightOnly>
      <SafeAreaView style={desktop ? styles.sky : styles.phoneSafe} edges={['top', 'left', 'right']}>
        {desktop ? <Desktop c={c} f={f} /> : <Phone c={c} f={f} />}
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sky: { flex: 1, backgroundColor: AUTH_SKY },
  bar: { position: 'absolute', left: 16, top: 5 },
  page: { position: 'absolute', left: 16, top: 72, width: 1128, height: 918, backgroundColor: '#F4F8FD', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  steps: { position: 'absolute', left: 106, top: 85 },
  panel: { position: 'absolute', left: 26, top: 134, width: 367, height: 846, overflow: 'hidden', borderRadius: 4 },
  hero: { position: 'absolute', left: 34, top: 28, fontSize: 38, lineHeight: 41, fontWeight: '800', color: Brand.surface, letterSpacing: -0.8 },
  heroAccent: { color: '#4DA3FF' },
  heroSub: { position: 'absolute', left: 34, top: 120, width: 290, fontSize: 17, lineHeight: 23, color: '#EAF0F8' },
  promises: { position: 'absolute', left: 34, top: 230, gap: 16 },
  promise: { flexDirection: 'row', alignItems: 'flex-start', gap: 26 },
  promiseTitle: { fontSize: 14, fontWeight: '600', color: Brand.surface },
  promiseBody: { marginTop: 2, fontSize: 12.5, lineHeight: 17, color: '#E1E8F5' },
  mid: { position: 'absolute', left: 403, top: 134, width: 463, height: 818, paddingHorizontal: 22, paddingTop: 26, backgroundColor: Brand.surface },
  h: { fontSize: 22, fontWeight: '700', color: Brand.ink, letterSpacing: -0.4 },
  sub: { marginTop: 8, marginBottom: 16, fontSize: 14, lineHeight: 19, color: '#4A5263' },
  tabs: { flexDirection: 'row', gap: 5 },
  tab: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 6, borderWidth: 1, borderColor: '#E3E8F0', backgroundColor: Brand.surface },
  tabP: { height: 42, gap: 8 },
  tabOn: { borderWidth: 2, borderColor: Brand.blue },
  tabText: { fontSize: 13.5, color: Brand.ink },
  tabTextP: { fontSize: 12.5 },
  tabTextOn: { color: Brand.blue, fontWeight: '500' },
  scanner: { width: 427, height: 316, marginTop: 13, borderRadius: 6 },
  scannerP: { width: '100%', aspectRatio: 427 / 316, marginTop: 4, borderRadius: 8 },
  primary: { height: 45, marginTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 6, backgroundColor: '#0067FE' },
  primaryP: { height: 46, marginTop: 4 },
  primaryText: { fontSize: 14, fontWeight: '500', color: Brand.surface },
  or: { flexDirection: 'row', alignItems: 'center', gap: 18, marginVertical: 14 },
  line: { flex: 1, height: 1, backgroundColor: '#D5DCE7' },
  orText: { fontSize: 14, color: '#4A5263' },
  label: { marginBottom: 8, fontSize: 14, color: Brand.ink },
  codeRow: { flexDirection: 'row', gap: 10 },
  codeRowP: { flexDirection: 'column' },
  input: { flex: 1, height: 46, paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: '#DFE4EC', backgroundColor: Brand.surface, fontSize: 14, color: Brand.ink, letterSpacing: 1 },
  inputP: { flexGrow: 0, flexShrink: 0, flexBasis: 'auto', height: 44 },
  cont: { width: 137, height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 6, backgroundColor: '#76A8FA' },
  contP: { width: '100%', height: 46 },
  contOn: { backgroundColor: '#0067FE' },
  contText: { fontSize: 14.5, color: Brand.surface },
  secureWrap: { position: 'absolute', left: 22, right: 22, top: 697 },
  secure: { flexDirection: 'row', gap: 20, padding: 14, paddingLeft: 12, borderRadius: 8, backgroundColor: '#EEF4FF' },
  secureP: { marginTop: 4 },
  lock: { width: 40, height: 40, borderRadius: 20, backgroundColor: Brand.surface, alignItems: 'center', justifyContent: 'center' },
  secureTitle: { fontSize: 14, fontWeight: '600', color: Brand.ink },
  secureText: { marginTop: 8, fontSize: 10.5, lineHeight: 16, color: '#3D4656' },
  verify: { gap: 14 },
  match: { borderRadius: 8, borderWidth: 1, borderColor: '#E3E8F0' },
  matchRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  matchKey: { fontSize: 13, color: '#4A5263' },
  matchVal: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  notMine: { alignSelf: 'center', paddingVertical: 6 },
  notMineText: { fontSize: 13, color: Brand.blue },
  side: { position: 'absolute', left: 872, width: 256, borderRadius: 10, backgroundColor: Brand.surface, paddingHorizontal: 17 },
  whereCard: { top: 153, height: 314, paddingTop: 16, backgroundColor: '#EEF4FB' },
  nextCard: { top: 484, height: 366, paddingTop: 14 },
  sideTitle: { fontSize: 15, fontWeight: '700', color: Brand.ink },
  sideBody: { marginTop: 10, fontSize: 12.5, lineHeight: 18, color: '#4A5263' },
  claimCard: { width: 224, height: 190, marginTop: 14, alignSelf: 'center' },
  next: { flexDirection: 'row', gap: 16, marginTop: 20 },
  nextNum: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0067FE', alignItems: 'center', justifyContent: 'center' },
  nextNumText: { fontSize: 14, fontWeight: '600', color: Brand.surface },
  nextTitle: { fontSize: 12.5, fontWeight: '600', color: Brand.ink },
  nextBody: { marginTop: 4, fontSize: 11, lineHeight: 16, color: '#6B7385' },
  phoneSafe: { flex: 1, backgroundColor: '#F4F7FC' },
  phone: { gap: 14, padding: 16, paddingBottom: 32 },
  titleP: { marginTop: 4, fontSize: 22, fontWeight: '700', color: Brand.ink },
  subP: { marginTop: -6, fontSize: 14, lineHeight: 19, color: '#4A5263' },
});
