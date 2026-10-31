import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { AUTH_SKY, AuthPhoneTop, AuthTopBar, FitScale } from '@/features/auth/AuthChrome';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { Brand } from '@/features/public/palette';
import { LightOnly } from '@/hooks/use-theme';
import type { IconName } from '@/lib/icons';
import { mockData } from '@/lib/mock';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

type Qr = MockData['publicPages']['qrLogin'];

const DESKTOP_MIN = 900;
// The reference's desktop frame: 1188 × 985 (bar at (18, 15), photo panel x 18–478, badge card x 478–921, help column x 933–1174).
const REF_W = 1188;
const REF_H = 985;

const STEPS = [
  { title: 'Open the camera', body: 'Allow camera access on your device.' },
  { title: 'Scan your QR badge', body: 'Hold your school QR badge in front of the camera.' },
  { title: 'Enter your 4-digit PIN', body: 'Type the 4 numbers you see on your badge.' },
  { title: 'Join your class', body: 'You’ll be signed in and taken to your class automatically.' },
] as const;
const PROMISES: readonly { icon: IconName; title: string; body: string }[] = [
  { icon: 'sparkle', title: 'Fast & easy', body: 'Get to your class in seconds' },
  { icon: 'lock', title: 'Safe & secure', body: 'Designed for younger learners' },
  { icon: 'people', title: 'Made for the classroom', body: 'Simple, visual and child-friendly' },
];
const HELP = ['Can’t scan your badge?', 'Forgot your PIN?', 'Ask your teacher for help.'] as const;

function usePin(length: number) {
  const [digits, setDigits] = useState<readonly string[]>(() => Array.from({ length }, () => ''));
  const refs = useRef<(ComponentRef<typeof TextInput> | null)[]>([]);
  const set = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    setDigits((cur) => cur.map((x, k) => (k === i ? d : x)));
    if (d !== '' && i < length - 1) refs.current[i + 1]?.focus();
  };
  return { digits, set, refs, full: digits.every((d) => d !== '') };
}
type Pin = ReturnType<typeof usePin>;

function PinBoxes({ pin, phone = false }: { pin: Pin; phone?: boolean }) {
  return (
    <View style={[styles.pins, phone && styles.pinsP]}>
      {pin.digits.map((d, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            pin.refs.current[i] = r;
          }}
          style={[styles.pin, phone && styles.pinP]}
          value={d}
          onChangeText={(v) => pin.set(i, v)}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={1}
          placeholder="•"
          placeholderTextColor="#9AA3B2"
          textAlign="center"
          accessibilityLabel={`PIN digit ${i + 1}`}
        />
      ))}
    </View>
  );
}

function ScanHeader({ phone = false }: { phone?: boolean }) {
  return (
    <View style={styles.scanHead}>
      <View style={[styles.camBox, phone && styles.camBoxP]}>
        <Icon name="camera" size={phone ? 24 : 30} color={Brand.blue} />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.scanTitle, phone && styles.scanTitleP]} accessibilityRole="header">
          Scan Your QR Badge
        </Text>
        <Text style={[styles.scanSub, phone && styles.scanSubP]}>Point your camera at your school QR badge to log in.</Text>
      </View>
    </View>
  );
}

function ClassCode({ q, open, onOpen, phone = false }: { q: Qr; open: boolean; onOpen: () => void; phone?: boolean }) {
  const [code, setCode] = useState('');
  return (
    <View style={[styles.code, phone && styles.codeP]}>
      <Icon name="grid" size={22} color={Brand.blue} />
      {open ? (
        <View style={styles.flex}>
          <Text style={styles.codeLabel}>Or enter your class code</Text>
          <View style={styles.codeRow}>
            <TextInput style={styles.codeInput} value={code} onChangeText={(v) => setCode(v.slice(0, q.classCodeLength))} placeholder={`Enter ${q.classCodeLength}-digit class code`} placeholderTextColor="#9AA3B2" autoCapitalize="characters" accessibilityLabel="Class code" />
            <Pressable style={[styles.codeGo, code.length === q.classCodeLength && styles.codeGoOn]} disabled={code.length !== q.classCodeLength} onPress={() => toast(`Class ${code.toUpperCase()} found. Now enter your PIN to sign in.`)} accessibilityRole="button" accessibilityLabel="Use class code">
              <Icon name="chevronRight" size={16} color={Brand.surface} />
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.codeClosed} onPress={onOpen} accessibilityRole="button">
          <Text style={styles.codeLabel}>Or enter your class code</Text>
          <Icon name="chevronRight" size={16} color={Brand.ink} />
        </Pressable>
      )}
    </View>
  );
}

function LoginButton({ pin, onLogin, phone = false }: { pin: Pin; onLogin: () => void; phone?: boolean }) {
  return (
    <Pressable style={[styles.login, phone && styles.loginP, pin.full && styles.loginOn]} disabled={!pin.full} onPress={onLogin} accessibilityRole="button" accessibilityState={{ disabled: !pin.full }}>
      <Text style={[styles.loginText, phone && styles.loginTextP]}>Log in to My Class</Text>
      <Icon name="chevronRight" size={phone ? 16 : 20} color={Brand.surface} />
    </Pressable>
  );
}

function HelpBox({ phone = false }: { phone?: boolean }) {
  return (
    <View style={[styles.help, phone && styles.helpP]}>
      <Icon name="help" size={26} color={Brand.blue} />
      <View style={styles.flex}>
        <Text style={styles.helpTitle}>Need help?</Text>
        {HELP.map((h) => (
          <Pressable key={h} onPress={() => router.push('/help')} accessibilityRole="link">
            <Text style={styles.helpLink}>{h}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function Divider() {
  return (
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text style={styles.dividerText}>After scanning, enter your 4-digit PIN</Text>
      <View style={styles.line} />
    </View>
  );
}

function Desktop({ q, pin, onLogin }: { q: Qr; pin: Pin; onLogin: () => void }) {
  return (
    <FitScale refWidth={REF_W} refHeight={REF_H}>
      <View style={styles.bar}>
        <AuthTopBar width={1168} />
      </View>
      <View style={styles.panel}>
        <Image source={q.art.panel} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="A smiling learner holding her Maple QR badge" />
        <Text style={styles.hero} accessibilityRole="header">
          {'Quick\nClassroom\n'}
          <Text style={styles.heroAccent}>Login</Text>
        </Text>
        <Text style={styles.heroSub}>{'Just scan your QR badge\nand enter your 4-digit PIN.'}</Text>
        <View style={styles.promises}>
          {PROMISES.map((p) => (
            <View key={p.title} style={styles.promise}>
              <Icon name={p.icon} size={30} color={Brand.surface} />
              <View>
                <Text style={styles.promiseTitle}>{p.title}</Text>
                <Text style={styles.promiseBody}>{p.body}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.card, styles.mid]}>
        <ScanHeader />
        <Image source={q.art.scanner} style={styles.scanner} contentFit="cover" accessibilityLabel="Hold your QR badge inside the frame" />
        <ClassCode q={q} open onOpen={() => undefined} />
        <Divider />
        <PinBoxes pin={pin} />
        <LoginButton pin={pin} onLogin={onLogin} />
      </View>
      <View style={[styles.card, styles.side]}>
        <Text style={styles.howTitle}>How it works</Text>
        {STEPS.map((s, i) => (
          <View key={s.title} style={styles.how}>
            <View style={styles.howCol}>
              <View style={styles.howNum}>
                <Text style={styles.howNumText}>{String(i + 1)}</Text>
              </View>
              {i < STEPS.length - 1 ? <View style={styles.howLine} /> : null}
            </View>
            <View style={styles.flex}>
              <Text style={styles.howStep}>{s.title}</Text>
              <Text style={styles.howBody}>{s.body}</Text>
            </View>
          </View>
        ))}
        <Image source={q.art.kids} style={styles.kids} contentFit="contain" />
        <Text style={styles.motto}>Learn • Grow • Belong</Text>
        <Text style={styles.mottoSub}>A brighter future together.</Text>
        <View style={styles.helpWrap}>
          <HelpBox />
        </View>
      </View>
    </FitScale>
  );
}

function Phone({ q, pin, onLogin }: { q: Qr; pin: Pin; onLogin: () => void }) {
  const [codeOpen, setCodeOpen] = useState(false);
  return (
    <>
      <AuthPhoneTop />
      <ScrollView contentContainerStyle={styles.phone} keyboardShouldPersistTaps="handled">
        <ScanHeader phone />
        <Image source={q.art.scanner} style={styles.scannerP} contentFit="cover" accessibilityLabel="Hold your QR badge inside the frame" />
        <ClassCode q={q} open={codeOpen} onOpen={() => setCodeOpen(true)} phone />
        <Divider />
        <PinBoxes pin={pin} phone />
        <LoginButton pin={pin} onLogin={onLogin} phone />
        <HelpBox phone />
      </ScrollView>
    </>
  );
}

/** Inventory 3: young learners sign in by showing their school QR badge, then a 4-digit PIN. */
export default function QrLoginScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  if (!mock) return <PreviewScreen title="Classroom login">{() => null}</PreviewScreen>;
  return <QrLogin q={mock.publicPages.qrLogin} desktop={width >= DESKTOP_MIN} />;
}

function QrLogin({ q, desktop }: { q: Qr; desktop: boolean }) {
  const pin = usePin(q.pinLength);
  // Design preview: the badge scan and PIN check need the camera and the API, so this goes to the home screen.
  const onLogin = () => router.push('/');
  return (
    <LightOnly>
      <SafeAreaView style={desktop ? styles.sky : styles.phoneSafe} edges={['top', 'left', 'right']}>
        {desktop ? <Desktop q={q} pin={pin} onLogin={onLogin} /> : <Phone q={q} pin={pin} onLogin={onLogin} />}
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sky: { flex: 1, backgroundColor: AUTH_SKY },
  bar: { position: 'absolute', left: 18, top: 13 },
  panel: { position: 'absolute', left: 18, top: 80, width: 460, height: 890, overflow: 'hidden', borderBottomLeftRadius: 14 },
  hero: { position: 'absolute', left: 37, top: 38, fontSize: 47, lineHeight: 48, fontWeight: '800', color: Brand.surface, letterSpacing: -1.2 },
  heroAccent: { color: '#4DA3FF' },
  heroSub: { position: 'absolute', left: 37, top: 194, fontSize: 20, lineHeight: 28, color: '#EAF0F8' },
  promises: { position: 'absolute', left: 38, top: 282, gap: 20 },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  promiseTitle: { fontSize: 16, fontWeight: '600', color: Brand.surface },
  promiseBody: { marginTop: 3, fontSize: 13.5, color: '#E1E8F5' },
  card: { position: 'absolute', borderRadius: 12, backgroundColor: Brand.surface },
  mid: { left: 478, top: 108, width: 443, height: 844, paddingHorizontal: 25, paddingTop: 24 },
  side: { left: 933, top: 108, width: 241, height: 840, paddingHorizontal: 12, paddingTop: 26 },
  scanHead: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  camBox: { width: 68, height: 68, borderRadius: 16, backgroundColor: '#EAF2FE', alignItems: 'center', justifyContent: 'center' },
  camBoxP: { width: 56, height: 56, borderRadius: 14 },
  scanTitle: { fontSize: 25, fontWeight: '700', color: Brand.ink, letterSpacing: -0.4 },
  scanTitleP: { fontSize: 20 },
  scanSub: { marginTop: 8, fontSize: 13, color: '#4A5263' },
  scanSubP: { fontSize: 12 },
  scanner: { width: 394, height: 369, marginTop: 21, borderRadius: 10 },
  scannerP: { width: '100%', aspectRatio: 394 / 369, borderRadius: 12 },
  code: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 23, paddingHorizontal: 14, paddingVertical: 16, borderRadius: 10, backgroundColor: '#EEF4FF' },
  codeP: { marginTop: 0, paddingVertical: 14 },
  codeClosed: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeLabel: { fontSize: 13.5, color: Brand.ink },
  codeRow: { flexDirection: 'row', gap: 6, marginTop: 9 },
  codeInput: { flex: 1, height: 36, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: '#DFE4EC', backgroundColor: Brand.surface, fontSize: 12.5, color: Brand.ink },
  codeGo: { width: 36, height: 36, borderRadius: 6, backgroundColor: '#A9C6FB', alignItems: 'center', justifyContent: 'center' },
  codeGoOn: { backgroundColor: Brand.blue },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 26 },
  line: { flex: 1, height: 1, backgroundColor: '#E1E6EF' },
  dividerText: { fontSize: 13.5, color: '#2A3242' },
  pins: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 22 },
  pinsP: { marginTop: 0 },
  pin: { width: 66, height: 66, textAlign: 'center', borderRadius: 9, borderWidth: 1, borderColor: '#DFE4EC', backgroundColor: Brand.surface, fontSize: 24, color: Brand.ink },
  pinP: { width: 52, height: 52, fontSize: 20 },
  login: { height: 68, marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 10, backgroundColor: '#A9C6FB' },
  loginP: { height: 48, marginTop: 0 },
  loginOn: { backgroundColor: Brand.blue },
  loginText: { fontSize: 17, fontWeight: '600', color: Brand.surface },
  loginTextP: { fontSize: 15 },
  howTitle: { fontSize: 17, fontWeight: '700', color: Brand.ink, marginBottom: 18 },
  how: { flexDirection: 'row', gap: 14 },
  howCol: { alignItems: 'center' },
  howNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  howNumText: { fontSize: 14, fontWeight: '600', color: Brand.surface },
  howLine: { width: 1, flex: 1, minHeight: 40, marginVertical: 4, backgroundColor: '#C9D7EE' },
  howStep: { fontSize: 13.5, fontWeight: '600', color: Brand.ink },
  howBody: { marginTop: 6, marginBottom: 22, fontSize: 11.5, lineHeight: 17, color: '#4A5263' },
  kids: { width: 200, height: 156, alignSelf: 'center', marginTop: 2 },
  motto: { marginTop: 10, fontSize: 14, fontWeight: '700', color: Brand.ink, textAlign: 'center' },
  mottoSub: { marginTop: 4, fontSize: 12, color: '#4A5263', textAlign: 'center' },
  helpWrap: { marginTop: 42 },
  help: { flexDirection: 'row', gap: 14, padding: 14, borderRadius: 10, backgroundColor: '#EEF4FF' },
  helpP: { paddingVertical: 16 },
  helpTitle: { fontSize: 14, fontWeight: '600', color: Brand.ink, marginBottom: 6 },
  helpLink: { paddingVertical: 2, fontSize: 12, color: Brand.blue, textDecorationLine: 'underline' },
  phoneSafe: { flex: 1, backgroundColor: '#F4F7FC' },
  phone: { gap: 16, padding: 16, paddingBottom: 32 },
});
