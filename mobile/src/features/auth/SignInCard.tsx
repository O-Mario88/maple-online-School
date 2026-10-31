import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, ErrorText, Field } from '@/components/ui';
import { Brand } from '@/features/public/palette';
import { useAuth } from '@/lib/auth/auth-context';
import type { IconName } from '@/lib/icons';
import { MOCK_DATA } from '@/lib/mock';
import type { MockData } from '@/mock';

type Art = MockData['publicPages']['signInArt'];
type Method = 'whatsapp' | 'email' | 'phonePin' | 'google' | 'apple' | 'passkey';

interface MethodInfo {
  key: Method;
  title: string;
  detail?: string;
  icon: IconName;
  tint: string;
}

// The reference's sign-in methods. Only email works today; the rest say "coming soon" until their server side exists.
const PRIMARY: readonly MethodInfo[] = [
  { key: 'whatsapp', title: 'Continue with WhatsApp', detail: 'Get a magic link on WhatsApp', icon: 'chat', tint: '#25D366' },
  { key: 'email', title: 'Continue with Email', detail: 'Get a magic link in your email', icon: 'mail', tint: '#1463F3' },
  { key: 'phonePin', title: 'Continue with Phone + PIN', detail: 'Enter your phone number and receive a PIN', icon: 'phone', tint: '#8B3DFF' },
];
const OTHERS: readonly MethodInfo[] = [
  { key: 'google', title: 'Continue with Google', icon: 'globe', tint: '#4285F4' },
  { key: 'apple', title: 'Continue with Apple', icon: 'person', tint: '#000000' },
  { key: 'passkey', title: 'Use a passkey', detail: 'Sign in with your biometric (Face ID, Touch ID, Windows Hello)', icon: 'fingerprint', tint: '#1463F3' },
];

function Logo({ m, art, size }: { m: MethodInfo; art?: Art; size: number }) {
  const photo = art?.[m.key];
  if (photo) return <Image source={photo} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: m.tint, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={m.icon} size={size * 0.5} color={Brand.surface} />
    </View>
  );
}

function Row({ m, art, phone, tall, onPress }: { m: MethodInfo; art?: Art; phone: boolean; tall: boolean; onPress: () => void }) {
  const p = phone;
  const logo = m.detail ? (p ? 34 : 44) : p ? 26 : 32;
  return (
    <Pressable style={[styles.row, p && styles.rowP, tall ? (p ? styles.tallP : styles.tall) : p ? styles.shortP : styles.short]} onPress={onPress} accessibilityRole="button" accessibilityLabel={m.title}>
      <Logo m={m} art={art} size={logo} />
      <View style={styles.flex}>
        <Text style={[styles.rowTitle, p && styles.rowTitleP]}>{m.title}</Text>
        {m.detail ? <Text style={[styles.rowDetail, p && styles.rowDetailP]}>{m.detail}</Text> : null}
      </View>
      <Icon name="chevronRight" size={p ? 16 : 20} color={Brand.ink} />
    </Pressable>
  );
}

/** Email and password: the way to sign in that works today. */
function EmailForm({ onBack, phone }: { onBack: () => void; phone: boolean }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const canSubmit = email.trim() !== '' && password !== '' && !busy;

  async function submit() {
    if (!canSubmit) return;
    setError(null);
    setBusy(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in. Please try again.');
      setBusy(false);
    }
  }

  return (
    <View style={styles.form}>
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="username" placeholder="you@school.org" returnKeyType="next" />
      <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="current-password" textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
      <ErrorText message={error} />
      <Button label="Sign in" onPress={submit} disabled={!canSubmit} busy={busy} />
      <View style={styles.formLinks}>
        <Pressable onPress={onBack} accessibilityRole="button">
          <Text style={[styles.link, phone && styles.linkP]}>← Other ways to sign in</Text>
        </Pressable>
        <Link href="/forgot-password" style={[styles.link, phone && styles.linkP]} accessibilityRole="link">
          Forgot password?
        </Link>
      </View>
    </View>
  );
}

/** The sign-in card: Sign In / Create Account tabs, the ways in, and the security note. Desktop sizes are the reference's pixels. */
export function SignInCard({ art, phone = false }: { art?: Art; phone?: boolean }) {
  const [mode, setMode] = useState<'pick' | 'email'>('pick');
  const [soon, setSoon] = useState<string | null>(null);
  const p = phone;
  const choose = (m: MethodInfo) => {
    if (m.key === 'email') {
      setSoon(null);
      setMode('email');
    } else {
      setSoon(`${m.title} is coming soon. Use Continue with Email for now.`);
    }
  };

  return (
    <View style={[styles.card, p && styles.cardP]}>
      <View style={styles.tabs} accessibilityRole="tablist">
        <View style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: true }}>
          <Text style={[styles.tabText, styles.tabOn, p && styles.tabTextP]}>Sign In</Text>
          <View style={styles.tabLine} />
        </View>
        <Pressable style={styles.tab} onPress={() => router.replace('/sign-up')} accessibilityRole="tab" accessibilityState={{ selected: false }}>
          <Text style={[styles.tabText, p && styles.tabTextP]}>Create Account</Text>
        </Pressable>
      </View>

      <Text style={[styles.title, p && styles.titleP]} accessibilityRole="header">
        Let’s get you in
      </Text>
      <Text style={[styles.sub, p && styles.subP]}>
        {mode === 'email' ? 'Sign in with your email and password. Magic links are coming soon.' : 'Choose the easiest and most secure way to access your Maple account.'}
      </Text>

      {mode === 'email' ? (
        <EmailForm onBack={() => setMode('pick')} phone={p} />
      ) : (
        <>
          <View style={[styles.list, p && styles.listP]}>
            {PRIMARY.map((m) => (
              <Row key={m.key} m={m} art={art} phone={p} tall onPress={() => choose(m)} />
            ))}
          </View>
          <View style={[styles.or, p && styles.orP]}>
            <View style={styles.orLine} />
            <Text style={[styles.orText, p && styles.orTextP]}>or continue with</Text>
            <View style={styles.orLine} />
          </View>
          <View style={[styles.list, p && styles.listP]}>
            {OTHERS.map((m) => (
              <Row key={m.key} m={m} art={art} phone={p} tall={m.key === 'passkey'} onPress={() => choose(m)} />
            ))}
          </View>
          {soon ? (
            <Text style={[styles.soon, p && styles.soonP]} accessibilityLiveRegion="polite">
              {soon}
            </Text>
          ) : null}
        </>
      )}

      <View style={[styles.secure, p && styles.secureP]}>
        <Icon name="shield" size={p ? 24 : 30} color={Brand.blue} />
        <View style={styles.flex}>
          <Text style={[styles.secureTitle, p && styles.secureTitleP]}>Secure & Private</Text>
          <Text style={[styles.secureText, p && styles.secureTextP]}>We use industry-standard encryption to keep your data safe. No passwords required.</Text>
        </View>
      </View>
      {MOCK_DATA && p ? (
        <Link href="/welcome" style={[styles.link, styles.preview, p && styles.linkP]} accessibilityRole="link">
          Design preview: public pages
        </Link>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { width: 552, height: 877, paddingHorizontal: 35, paddingTop: 22, paddingBottom: 30, borderRadius: 14, backgroundColor: Brand.surface, shadowColor: '#0F2350', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
  cardP: { width: '100%', height: 'auto', paddingHorizontal: 14, paddingTop: 8, paddingBottom: 16, borderRadius: 14 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E6EAF1' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  tabText: { fontSize: 18, color: '#4A5263' },
  tabTextP: { fontSize: 13 },
  tabOn: { color: Brand.blue, fontWeight: '600' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 3, borderRadius: 2, backgroundColor: Brand.blue },
  title: { marginTop: 26, fontSize: 36, lineHeight: 42, fontWeight: '700', color: Brand.ink, letterSpacing: -0.8 },
  titleP: { marginTop: 16, fontSize: 22, lineHeight: 27, letterSpacing: -0.4 },
  sub: { marginTop: 10, fontSize: 16.5, lineHeight: 24, color: '#4A5C7A' },
  subP: { marginTop: 6, fontSize: 12, lineHeight: 17 },
  list: { gap: 13, marginTop: 24 },
  listP: { gap: 9, marginTop: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 22, paddingLeft: 20, paddingRight: 18, borderRadius: 10, borderWidth: 1, borderColor: '#E3E8F0', backgroundColor: Brand.surface },
  rowP: { gap: 14, paddingLeft: 12, paddingRight: 12, borderRadius: 9 },
  tall: { height: 72 },
  short: { height: 59 },
  tallP: { minHeight: 52, paddingVertical: 8 },
  shortP: { height: 44 },
  rowTitle: { fontSize: 17.5, fontWeight: '600', color: Brand.ink },
  rowTitleP: { fontSize: 13 },
  rowDetail: { marginTop: 3, fontSize: 13.5, color: '#4A5263', letterSpacing: -0.1 },
  rowDetailP: { marginTop: 2, fontSize: 10, lineHeight: 14 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 26, marginBottom: -2 },
  orP: { marginTop: 16 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E3E8F0' },
  orText: { fontSize: 14, color: '#4A5263' },
  orTextP: { fontSize: 11 },
  soon: { marginTop: 14, fontSize: 13.5, color: Brand.blue, textAlign: 'center' },
  soonP: { fontSize: 12 },
  secure: { flexDirection: 'row', alignItems: 'center', gap: 26, marginTop: 20, paddingLeft: 32, paddingRight: 24, paddingVertical: 22, borderRadius: 10, backgroundColor: '#EEF4FF' },
  secureP: { gap: 14, marginTop: 14, paddingLeft: 16, paddingRight: 14, paddingVertical: 14 },
  secureTitle: { fontSize: 15, fontWeight: '700', color: Brand.ink },
  secureTitleP: { fontSize: 12 },
  secureText: { marginTop: 6, fontSize: 14, lineHeight: 20, color: '#3D4656' },
  secureTextP: { marginTop: 3, fontSize: 10.5, lineHeight: 15 },
  form: { gap: 14, marginTop: 24 },
  formLinks: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { fontSize: 14, fontWeight: '600', color: Brand.blue, paddingVertical: 6 },
  linkP: { fontSize: 13 },
  preview: { marginTop: 10, textAlign: 'center' },
});
