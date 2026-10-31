import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { AUTH_SKY, AuthPhoneTop, AuthTopBar, FitScale } from '@/features/auth/AuthChrome';
import { type Channel, ChannelPicker, CHANNELS, type Consent, CONSENT_STEPS, ContactField, MessageBox, WhyBox } from '@/features/auth/consent/ConsentParts';
import { FlowSteps } from '@/features/auth/FlowSteps';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { Brand } from '@/features/public/palette';
import { LightOnly } from '@/hooks/use-theme';
import type { IconName } from '@/lib/icons';
import { mockData } from '@/lib/mock';

const DESKTOP_MIN = 900;
// The reference's desktop frame: 1178 × 1010 (bar at (18, 14), photo panel at (18, 142), middle column x 398–902, right x 913–1153).
const REF_W = 1178;
const REF_H = 1010;

const NEXT: readonly { icon: IconName; title: string; body: string; done?: boolean }[] = [
  { icon: 'mail', title: '1. We send a verification link', body: 'Your parent or guardian will receive a secure link on WhatsApp.' },
  { icon: 'check', title: '2. They approve your account', body: 'They’ll review a few details and confirm consent.', done: true },
  { icon: 'person', title: '3. You can start learning', body: 'Once approved, you’ll get a notification and can log in.' },
];
const FOR_PARENTS = ['Quick and easy approval (takes less than 2 minutes)', 'Control what your child can access', 'Keep your child safe online', 'Receive important updates about their learning', 'You can change permissions anytime'] as const;
const PROMISES: readonly { icon: IconName; title: string; body: string }[] = [
  { icon: 'shield', title: 'We keep learners safe', body: 'Parental consent helps us create a secure and age-appropriate experience.' },
  { icon: 'people', title: 'You’re in control', body: 'Parents can manage permissions and privacy settings anytime.' },
  { icon: 'lock', title: 'Trusted by schools', body: 'Used by thousands of families and schools across Uganda and beyond.' },
];

function useConsentForm(c: Consent) {
  const [channel, setChannel] = useState<Channel>('whatsapp');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState(c.defaultMessage);
  const [sent, setSent] = useState<string | null>(null);
  const send = () => {
    const to = contact.trim();
    if (to === '') {
      setSent(null);
      return;
    }
    const where = CHANNELS.find((x) => x.key === channel)?.title ?? '';
    setSent(`Link sent to ${channel === 'email' ? to : `${c.dialCode} ${to}`} by ${where}. It works for ${c.expiresDays} days.`);
  };
  return { channel, setChannel, contact, setContact, message, setMessage, sent, send };
}
type Form = ReturnType<typeof useConsentForm>;

function Heading({ c, phone = false }: { c: Consent; phone?: boolean }) {
  return (
    <>
      <View style={styles.headRow}>
        <Image source={c.art.header} style={phone ? styles.headIconP : styles.headIcon} />
        <Text style={[styles.eyebrow, phone && styles.eyebrowP]}>GUARDIAN CONSENT REQUIRED</Text>
      </View>
      <Text style={[styles.title, phone && styles.titleP]} accessibilityRole="header">
        {phone ? 'Let’s get your parent\nor guardian’s permission' : 'Let’s get your parent or guardian’s\npermission'}
      </Text>
      <Text style={[styles.body, phone && styles.bodyP]}>{`Because you’re under the age of digital majority in ${c.country}, we need a parent or guardian to confirm your account.${phone ? '' : ' We’ll send them a verification link.'}`}</Text>
    </>
  );
}

function SendBlock({ c, f, phone = false }: { c: Consent; f: Form; phone?: boolean }) {
  return (
    <>
      <Text style={[styles.h, phone && styles.hP]}>{phone ? 'Send a verification link' : 'Send a verification link to your parent or guardian'}</Text>
      <Text style={[styles.hSub, phone && styles.hSubP]}>Choose how you’d like to send the verification link. They’ll receive a secure link to approve your account.</Text>
      <View style={styles.gap16}>
        <ChannelPicker c={c} value={f.channel} onChange={f.setChannel} phone={phone} />
        <ContactField c={c} channel={f.channel} value={f.contact} onChange={f.setContact} phone={phone} />
        <MessageBox value={f.message} onChange={f.setMessage} phone={phone} />
        {f.sent ? (
          <Text style={styles.sent} accessibilityLiveRegion="polite">
            {f.sent}
          </Text>
        ) : null}
      </View>
    </>
  );
}

function SendButton({ f, style }: { f: Form; style: object }) {
  const ready = f.contact.trim() !== '';
  return (
    <Pressable style={[styles.send, style, !ready && styles.sendOff]} onPress={f.send} disabled={!ready} accessibilityRole="button" accessibilityState={{ disabled: !ready }}>
      <Icon name="send" size={18} color={Brand.surface} />
      <Text style={styles.sendText}>{f.sent ? 'Send Again' : 'Send Verification Link'}</Text>
    </Pressable>
  );
}

function Desktop({ c, f }: { c: Consent; f: Form }) {
  return (
    <FitScale refWidth={REF_W} refHeight={REF_H}>
      <View style={styles.bar}>
        <AuthTopBar width={1142} />
      </View>
      <View style={styles.page} />
      <View style={styles.steps}>
        <FlowSteps steps={CONSENT_STEPS} lineWidth={26} />
      </View>
      <View style={styles.panel}>
        <Image source={c.art.panel} style={StyleSheet.absoluteFill} contentFit="cover" accessibilityLabel="A smiling learner in school uniform" />
        <View style={styles.promises}>
          {PROMISES.map((p, i) => (
            <View key={p.title} style={[styles.promise, i > 0 && styles.promiseRule]}>
              <Icon name={p.icon} size={34} color={Brand.surface} />
              <Text style={styles.promiseTitle}>{p.title}</Text>
              <Text style={styles.promiseBody}>{p.body}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, styles.introCard]}>
        <Heading c={c} />
        <View style={styles.whyWrap}>
          <WhyBox />
        </View>
      </View>
      <View style={[styles.card, styles.sendCard]}>
        <SendBlock c={c} f={f} />
      </View>
      <Pressable style={styles.back} onPress={() => (router.canGoBack() ? router.back() : router.push('/get-started'))} accessibilityRole="button">
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <SendButton f={f} style={styles.sendDesk} />

      <View style={[styles.card, styles.nextCard]}>
        <Text style={styles.sideTitle}>What happens next?</Text>
        {NEXT.map((n, i) => (
          <View key={n.title} style={styles.nextRow}>
            <View style={styles.nextIconCol}>
              <View style={[styles.nextIcon, n.done && styles.nextIconDone]}>
                <Icon name={n.icon} size={18} color={n.done ? Brand.surface : Brand.blue} />
              </View>
              {i < NEXT.length - 1 ? <View style={styles.nextLine} /> : null}
            </View>
            <View style={styles.flex}>
              <Text style={styles.nextTitle}>{n.title}</Text>
              <Text style={styles.nextBody}>{n.body}</Text>
            </View>
          </View>
        ))}
        <View style={styles.expiry}>
          <Icon name="lock" size={20} color="#16A34A" />
          <Text style={styles.expiryText}>{`The link expires in ${c.expiresDays} days for security. Your parent can always approve later from their own device.`}</Text>
        </View>
      </View>
      <View style={[styles.card, styles.parentsCard]}>
        <Text style={styles.sideTitle}>For Parents & Guardians</Text>
        {FOR_PARENTS.map((t) => (
          <View key={t} style={styles.check}>
            <Icon name="check" size={18} color="#16A34A" />
            <Text style={styles.checkText}>{t}</Text>
          </View>
        ))}
      </View>
    </FitScale>
  );
}

function Phone({ c, f }: { c: Consent; f: Form }) {
  return (
    <>
      <AuthPhoneTop />
      <ScrollView contentContainerStyle={styles.phone} keyboardShouldPersistTaps="handled">
        <FlowSteps steps={CONSENT_STEPS} phone />
        <Heading c={c} phone />
        <WhyBox phone />
        <SendBlock c={c} f={f} phone />
        <SendButton f={f} style={styles.sendP} />
      </ScrollView>
    </>
  );
}

/** Inventory 4: a young learner asks a parent or guardian to approve their account (age gate), built to its reference. */
export default function GuardianConsentScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  if (!mock) return <PreviewScreen title="Guardian consent">{() => null}</PreviewScreen>;
  return <ConsentScreen c={mock.publicPages.guardianConsent} desktop={width >= DESKTOP_MIN} />;
}

function ConsentScreen({ c, desktop }: { c: Consent; desktop: boolean }) {
  const f = useConsentForm(c);
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
  gap16: { gap: 16, marginTop: 16 },
  sky: { flex: 1, backgroundColor: AUTH_SKY },
  bar: { position: 'absolute', left: 18, top: 5 },
  page: { position: 'absolute', left: 18, top: 72, width: 1142, height: 921, backgroundColor: '#F4F8FD', borderBottomLeftRadius: 14, borderBottomRightRadius: 14 },
  steps: { position: 'absolute', left: 66, top: 88 },
  panel: { position: 'absolute', left: 18, top: 142, width: 370, height: 851, overflow: 'hidden', borderBottomLeftRadius: 14 },
  promises: { position: 'absolute', left: 0, right: 0, top: 628, flexDirection: 'row' },
  promise: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  promiseRule: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.18)' },
  promiseTitle: { marginTop: 12, fontSize: 11.5, fontWeight: '700', color: Brand.surface, textAlign: 'center' },
  promiseBody: { marginTop: 8, fontSize: 9.5, lineHeight: 15, color: '#E1E8F5', textAlign: 'center' },
  card: { position: 'absolute', borderRadius: 10, backgroundColor: Brand.surface },
  introCard: { left: 398, top: 142, width: 504, height: 305, paddingHorizontal: 17, paddingTop: 22 },
  sendCard: { left: 398, top: 460, width: 504, height: 433, paddingHorizontal: 17, paddingTop: 18 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  headIcon: { width: 54, height: 54, borderRadius: 27 },
  headIconP: { width: 42, height: 42, borderRadius: 21 },
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, color: Brand.blue },
  eyebrowP: { fontSize: 9.5 },
  title: { marginTop: 10, fontSize: 28.5, lineHeight: 33, fontWeight: '700', color: Brand.ink, letterSpacing: -0.6 },
  titleP: { marginTop: 8, fontSize: 24, lineHeight: 28 },
  body: { marginTop: 10, fontSize: 13.5, lineHeight: 20, color: '#4A5263' },
  bodyP: { fontSize: 14, lineHeight: 19 },
  whyWrap: { marginTop: 22 },
  h: { fontSize: 18, fontWeight: '700', color: Brand.ink, letterSpacing: -0.3 },
  hP: { fontSize: 17 },
  hSub: { marginTop: 4, fontSize: 13, lineHeight: 19, color: '#4A5263' },
  hSubP: { fontSize: 13 },
  sent: { fontSize: 12.5, color: '#16A34A' },
  back: { position: 'absolute', left: 411, top: 912, width: 121, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1, borderColor: '#C9D3E2', backgroundColor: '#F1F5FB' },
  backText: { fontSize: 14.5, color: Brand.ink },
  send: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 7, backgroundColor: '#0067FE' },
  sendDesk: { position: 'absolute', left: 556, top: 912, width: 333, height: 46 },
  sendOff: { opacity: 0.55 },
  sendText: { fontSize: 15, fontWeight: '500', color: Brand.surface },
  nextCard: { left: 913, top: 142, width: 240, height: 410, paddingHorizontal: 10, paddingTop: 20 },
  parentsCard: { left: 913, top: 566, width: 240, height: 240, paddingHorizontal: 10, paddingTop: 18, gap: 11 },
  sideTitle: { fontSize: 15, fontWeight: '700', color: Brand.ink, marginBottom: 10 },
  nextRow: { flexDirection: 'row', gap: 11 },
  nextIconCol: { alignItems: 'center' },
  nextIcon: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: '#D5E2F7', alignItems: 'center', justifyContent: 'center', backgroundColor: Brand.surface },
  nextIconDone: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  nextLine: { width: 1, flex: 1, minHeight: 34, marginVertical: 4, backgroundColor: '#B9CCEA' },
  nextTitle: { fontSize: 12.5, fontWeight: '600', color: Brand.ink },
  nextBody: { marginTop: 5, marginBottom: 18, fontSize: 10.5, lineHeight: 16, color: '#4A5263' },
  expiry: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, padding: 12, borderRadius: 8, backgroundColor: '#EAF7EF' },
  expiryText: { flex: 1, fontSize: 10, lineHeight: 15, color: '#2A3242' },
  check: { flexDirection: 'row', gap: 10 },
  checkText: { flex: 1, fontSize: 11.5, lineHeight: 16, color: '#2A3242' },
  phoneSafe: { flex: 1, backgroundColor: '#F4F7FC' },
  phone: { gap: 14, padding: 16, paddingBottom: 32 },
  sendP: { height: 50, marginTop: 4 },
});
