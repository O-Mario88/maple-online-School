import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import { api } from '@/lib/api/client';
import { apiRole, needsGuardian, newAccountProblem, parseDob, type SignUpRole } from '@/lib/auth/signup';
import type { IconName } from '@/lib/icons';
import type { MockData } from '@/mock';

type Art = MockData['publicPages']['signUpArt'];

const INK = '#0F1B3D';
const BODY = '#4A5263';
const BLUE = '#1463F3';

const ROLES: readonly { key: SignUpRole; title: string; sub: string; icon: IconName; tint: string; fill: string }[] = [
  { key: 'learner', title: 'Learner', sub: 'Student account', icon: 'cap', tint: '#1463F3', fill: '#EAF2FE' },
  { key: 'parent', title: 'Parent', sub: 'Manage your child', icon: 'people', tint: '#EC4899', fill: '#FDF0F6' },
  { key: 'teacher', title: 'Teacher', sub: 'Teach and assign', icon: 'person', tint: '#16A34A', fill: '#EEF8F1' },
  { key: 'school', title: 'School', sub: 'Institution account', icon: 'school', tint: '#F97316', fill: '#FEF5EC' },
];
const GRADES = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'Primary 7', 'Senior 1', 'Senior 2', 'Senior 3', 'Senior 4', 'Senior 5', 'Senior 6'];
const SOCIAL = [
  { key: 'google', label: 'Google' },
  { key: 'apple', label: 'Apple' },
  { key: 'microsoft', label: 'Microsoft' },
] as const;
const TRUST: readonly { key: string; title: string; body: string; icon: IconName; tint: string }[] = [
  { key: 'shield', title: 'Safe & Secure', body: 'Your data is protected', icon: 'shield', tint: '#1463F3' },
  { key: 'people', title: 'Child Friendly', body: 'A safe learning space', icon: 'people', tint: '#1463F3' },
  { key: 'heart', title: 'Trusted by Schools', body: 'Used by schools across Uganda and beyond', icon: 'heart', tint: '#EC4899' },
];
/** Accounts are created for Uganda until the form asks for a country. */
const COUNTRY = 'UG';

/** Formats typed digits as DD / MM / YYYY. */
const maskDob = (t: string) => {
  const d = t.replace(/\D/g, '').slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join(' / ');
};

/** A reference icon on design builds, a drawn icon everywhere else. */
function Glyph({ art, k, size, icon, tint, fill }: { art?: Art; k: string; size: number; icon: IconName; tint: string; fill?: string }) {
  const photo = art?.[k];
  if (photo) return <Image source={photo} style={{ width: size, height: size }} contentFit="contain" />;
  return (
    <View style={[styles.glyph, { width: size, height: size, borderRadius: size / 2, backgroundColor: fill ?? 'transparent' }]}>
      <Icon name={icon} size={size * 0.55} color={tint} />
    </View>
  );
}

function Field({ label, icon, children, phone, half = false }: { label: string; icon: IconName; children: React.ReactNode; phone: boolean; half?: boolean }) {
  return (
    <View style={half && !phone ? styles.flex : undefined}>
      <Text style={[styles.label, phone && styles.labelP]}>{label}</Text>
      <View style={[styles.input, phone && styles.inputP]}>
        <Icon name={icon} size={phone ? 15 : 17} color="#6B7489" />
        {children}
      </View>
    </View>
  );
}

/** The sign-up card: role, details, social sign-up, terms and the trust strip. Desktop sizes are the reference's pixels. */
export function SignUpCard({ art, phone = false }: { art?: Art; phone?: boolean }) {
  const p = phone;
  const [role, setRole] = useState<SignUpRole>('learner');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [grade, setGrade] = useState('');
  const [gradeOpen, setGradeOpen] = useState(false);
  const [dob, setDob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [soon, setSoon] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ email: string; guardian: boolean } | null>(null);
  const learner = role === 'learner';

  async function submit() {
    const today = new Date();
    const message = newAccountProblem({ role, first, last, grade, dob, email, password }, today);
    setProblem(message);
    const accountRole = apiRole(role);
    if (message || !accountRole) return;
    setBusy(true);
    const { data, error } = await api.POST('/api/v1/auth/register/', {
      body: { email: email.trim(), full_name: `${first.trim()} ${last.trim()}`, country_code: COUNTRY, password, role: accountRole },
    });
    setBusy(false);
    if (error || !data) {
      setProblem((error as { detail?: string } | undefined)?.detail ?? 'Could not create the account. Please try again.');
      return;
    }
    const born = learner ? parseDob(dob, today) : null;
    setDone({ email: data.email, guardian: born != null && 'age' in born && needsGuardian(born.age) });
  }

  if (done) {
    return (
      <View style={[styles.card, p && styles.cardP, styles.doneCard]}>
        <Icon name="mail" size={40} color={BLUE} />
        <Text style={[styles.title, p && styles.titleP]}>Check your email</Text>
        <Text style={[styles.sub, p && styles.subP]}>{`We sent an activation link to ${done.email}. Open it to finish, then sign in.`}</Text>
        {done.guardian ? (
          <>
            <Text style={[styles.sub, p && styles.subP]}>Because you’re under 18, a parent or guardian also needs to confirm your account.</Text>
            <Pressable style={styles.primary} onPress={() => router.push('/guardian-consent')} accessibilityRole="button">
              <Text style={styles.primaryText}>Ask a parent to confirm</Text>
            </Pressable>
          </>
        ) : null}
        <Pressable style={done.guardian ? styles.secondary : styles.primary} onPress={() => router.replace('/sign-in')} accessibilityRole="button">
          <Text style={done.guardian ? styles.secondaryText : styles.primaryText}>Go to sign in</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.card, p && styles.cardP]}>
      <Text style={[styles.title, p && styles.titleP]} accessibilityRole="header">
        Create Your Account
      </Text>
      <Text style={[styles.sub, p && styles.subP]}>Join thousands of learners and start your learning journey today.</Text>

      <View style={[styles.roles, p && styles.rolesP]} accessibilityRole="radiogroup">
        {ROLES.map((r) => {
          const on = role === r.key;
          return (
            <Pressable
              key={r.key}
              style={[styles.role, p && styles.roleP, { backgroundColor: on ? '#F1F6FF' : r.fill }, on && styles.roleOn]}
              onPress={() => {
                setRole(r.key);
                setProblem(null);
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${r.title}: ${r.sub}`}>
              <Glyph art={art} k={r.key} size={p ? 30 : 41} icon={r.icon} tint={r.tint} fill="#FFFFFF" />
              <Text style={[styles.roleTitle, p && styles.roleTitleP]}>{r.title}</Text>
              <Text style={[styles.roleSub, p && styles.roleSubP]}>{r.sub}</Text>
            </Pressable>
          );
        })}
      </View>

      {role === 'parent' ? (
        <View style={[styles.parent, p && styles.parentP]}>
          <Icon name="people" size={26} color="#EC4899" />
          <Text style={styles.parentTitle}>Parents join through their child</Text>
          <Text style={styles.parentText}>Ask your child’s school for their claim code, or scan the QR code on the school letter. Claiming your child creates your parent account and links you to their reports and fees.</Text>
          <Pressable style={styles.primary} onPress={() => router.push('/claim-child')} accessibilityRole="button">
            <Text style={styles.primaryText}>Claim your child</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={[styles.pair, p && styles.pairP]}>
            <Field half label="First Name" icon="person" phone={p}>
              <TextInput style={styles.text} value={first} onChangeText={setFirst} placeholder="Enter your first name" placeholderTextColor="#8A93A6" autoComplete="given-name" maxLength={120} accessibilityLabel="First name" />
            </Field>
            <Field half label="Last Name" icon="person" phone={p}>
              <TextInput style={styles.text} value={last} onChangeText={setLast} placeholder="Enter your last name" placeholderTextColor="#8A93A6" autoComplete="family-name" maxLength={120} accessibilityLabel="Last name" />
            </Field>
          </View>
          {learner ? (
            <View style={[styles.pair, p && styles.pairP, styles.zTop]}>
              <View style={[!p && styles.flex, styles.zTop]}>
                <Text style={[styles.label, p && styles.labelP]}>Class / Grade</Text>
                <Pressable style={[styles.input, p && styles.inputP]} onPress={() => setGradeOpen(!gradeOpen)} accessibilityRole="button" accessibilityState={{ expanded: gradeOpen }} accessibilityLabel={`Class or grade: ${grade || 'not chosen'}`}>
                  <Icon name="book" size={p ? 15 : 17} color="#6B7489" />
                  <Text style={[styles.text, styles.choice, !grade && styles.placeholder]}>{grade || 'Select your class/grade'}</Text>
                  <Icon name="chevronDown" size={14} color={INK} />
                </Pressable>
                {gradeOpen ? (
                  <View style={[styles.menu, p && styles.menuP]}>
                    {GRADES.map((g) => (
                      <Pressable
                        key={g}
                        style={styles.menuItem}
                        onPress={() => {
                          setGrade(g);
                          setGradeOpen(false);
                        }}
                        accessibilityRole="menuitem">
                        <Text style={[styles.menuText, g === grade && styles.menuOn]}>{g}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
              <Field half label="Date of Birth" icon="calendar" phone={p}>
                <TextInput style={styles.text} value={dob} onChangeText={(t) => setDob(maskDob(t))} placeholder="DD / MM / YYYY" placeholderTextColor="#8A93A6" keyboardType="number-pad" maxLength={14} accessibilityLabel="Date of birth, day month year" />
              </Field>
            </View>
          ) : null}
          <Field label="Email Address" icon="mail" phone={p}>
            <TextInput style={styles.text} value={email} onChangeText={setEmail} placeholder="Enter your email address" placeholderTextColor="#8A93A6" autoCapitalize="none" autoComplete="email" keyboardType="email-address" textContentType="emailAddress" accessibilityLabel="Email address" />
          </Field>
          <Field label="Create Password" icon="lock" phone={p}>
            <TextInput style={styles.text} value={password} onChangeText={setPassword} placeholder="Create a strong password" placeholderTextColor="#8A93A6" secureTextEntry={!show} autoComplete="new-password" textContentType="newPassword" onSubmitEditing={submit} accessibilityLabel="Create password" />
            <Pressable onPress={() => setShow(!show)} accessibilityRole="button" accessibilityLabel={show ? 'Hide password' : 'Show password'} hitSlop={8}>
              <Icon name={show ? 'eyeOff' : 'eye'} size={17} color="#6B7489" />
            </Pressable>
          </Field>
          {problem ? (
            <Text style={styles.problem} accessibilityLiveRegion="polite">
              {problem}
            </Text>
          ) : null}
          <Pressable style={[styles.create, p && styles.createP, busy && styles.busy]} onPress={submit} disabled={busy} accessibilityRole="button">
            <Text style={[styles.createText, p && styles.createTextP]}>{busy ? 'Creating your account…' : 'Create Account'}</Text>
          </Pressable>
        </>
      )}

      <View style={styles.or}>
        <View style={styles.orLine} />
        <Text style={[styles.orText, p && styles.orTextP]}>or sign up with</Text>
        <View style={styles.orLine} />
      </View>
      <View style={[styles.socials, p && styles.socialsP]}>
        {SOCIAL.map((x) => (
          <Pressable key={x.key} style={[styles.social, p && styles.socialP]} onPress={() => setSoon(`Sign-up with ${x.label} is coming soon. Use your email for now.`)} accessibilityRole="button" accessibilityLabel={`Sign up with ${x.label}`}>
            <Glyph art={art} k={x.key} size={p ? 18 : 24} icon={x.key === 'apple' ? 'person' : 'globe'} tint={INK} />
            <Text style={[styles.socialText, p && styles.socialTextP]}>{x.label}</Text>
          </Pressable>
        ))}
      </View>
      {soon ? (
        <Text style={styles.soon} accessibilityLiveRegion="polite">
          {soon}
        </Text>
      ) : null}
      <Text style={[styles.terms, p && styles.termsP]}>
        {'By creating an account, you agree to our '}
        <Text style={styles.link} onPress={() => router.push('/help')} accessibilityRole="link">
          Terms of Service
        </Text>
        {' and '}
        <Text style={styles.link} onPress={() => router.push('/help')} accessibilityRole="link">
          Privacy Policy
        </Text>
        .
      </Text>
      {p ? (
        <Pressable style={styles.signIn} onPress={() => router.replace('/sign-in')} accessibilityRole="link">
          <Text style={styles.signInText}>
            {'Already have an account? '}
            <Text style={styles.link}>Sign In</Text>
          </Text>
        </Pressable>
      ) : (
        <View style={styles.trust}>
          {TRUST.map((t, i) => (
            <View key={t.key} style={[styles.trustItem, i > 0 && styles.trustRule]}>
              <Glyph art={art} k={t.key} size={28} icon={t.icon} tint={t.tint} />
              <View style={styles.flex}>
                <Text style={styles.trustTitle}>{t.title}</Text>
                <Text style={styles.trustBody}>{t.body}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

/** The desktop top bar's way back to sign in. */
export function SignInLink() {
  return (
    <Pressable style={styles.barLink} onPress={() => router.replace('/sign-in')} accessibilityRole="link" accessibilityLabel="Already have an account? Sign In">
      <Text style={styles.barText}>Already have an account?</Text>
      <Text style={styles.barSignIn}>Sign In</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  zTop: { zIndex: 10 },
  glyph: { alignItems: 'center', justifyContent: 'center' },
  card: { width: 547, height: 903, paddingHorizontal: 34, paddingTop: 30, borderRadius: 14, backgroundColor: Brand.surface, shadowColor: '#0F2350', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
  cardP: { width: '100%', height: 'auto', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 18 },
  doneCard: { justifyContent: 'center', gap: 14 },
  title: { fontSize: 33, lineHeight: 40, fontWeight: '800', color: INK, letterSpacing: -0.8 },
  titleP: { fontSize: 22, lineHeight: 28, letterSpacing: -0.4 },
  sub: { marginTop: 5, maxWidth: 440, fontSize: 16.5, lineHeight: 23, color: BODY },
  subP: { maxWidth: undefined, fontSize: 13, lineHeight: 19 },
  roles: { flexDirection: 'row', gap: 10, marginTop: 12 },
  rolesP: { flexWrap: 'wrap', gap: 8 },
  role: { width: 113, height: 99, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 8, borderWidth: 1, borderColor: '#EDF0F5' },
  roleP: { width: '48%', height: 74, flexGrow: 1 },
  roleOn: { borderWidth: 1.5, borderColor: '#3B82F6' },
  roleTitle: { marginTop: 4, fontSize: 13.5, fontWeight: '700', color: INK },
  roleTitleP: { marginTop: 2, fontSize: 12 },
  roleSub: { fontSize: 11, color: BODY },
  roleSubP: { fontSize: 10 },
  pair: { flexDirection: 'row', gap: 18 },
  pairP: { flexDirection: 'column', gap: 0 },
  label: { marginTop: 18, marginBottom: 5, fontSize: 13.5, fontWeight: '600', color: INK },
  labelP: { marginTop: 12, marginBottom: 4, fontSize: 12 },
  input: { height: 41, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 13, borderRadius: 7, borderWidth: 1, borderColor: '#E1E6EE', backgroundColor: '#FFFFFF' },
  inputP: { height: 40, gap: 10 },
  text: { flex: 1, height: 39, fontSize: 13, color: INK },
  choice: { lineHeight: 39 },
  placeholder: { color: '#8A93A6' },
  menu: { position: 'absolute', top: 70, left: 0, right: 0, maxHeight: 230, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF', overflow: 'scroll' },
  menuP: { top: 62 },
  menuItem: { height: 28, justifyContent: 'center', paddingHorizontal: 12 },
  menuText: { fontSize: 12.5, color: INK },
  menuOn: { fontWeight: '700', color: BLUE },
  problem: { marginTop: 10, fontSize: 12.5, color: '#B91C1C' },
  create: { height: 46, alignItems: 'center', justifyContent: 'center', marginTop: 20, borderRadius: 7, backgroundColor: '#0B6BFF' },
  createP: { height: 42, marginTop: 16 },
  busy: { opacity: 0.7 },
  createText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  createTextP: { fontSize: 14 },
  primary: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#0B6BFF' },
  primaryText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  secondary: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#C9DAF8' },
  secondaryText: { fontSize: 14, fontWeight: '600', color: BLUE },
  parent: { gap: 10, marginTop: 20, padding: 16, borderRadius: 10, backgroundColor: '#FDF0F6' },
  parentP: { marginTop: 14 },
  parentTitle: { fontSize: 15, fontWeight: '700', color: INK },
  parentText: { fontSize: 13, lineHeight: 19, color: BODY },
  or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22 },
  orLine: { flex: 1, height: 1, backgroundColor: '#E6EAF1' },
  orText: { fontSize: 13, color: BODY },
  orTextP: { fontSize: 11.5 },
  socials: { flexDirection: 'row', gap: 14, marginTop: 16 },
  socialsP: { gap: 8, marginTop: 12 },
  social: { flex: 1, height: 45, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 7, borderWidth: 1, borderColor: '#E1E6EE' },
  socialP: { height: 38, gap: 6 },
  socialText: { fontSize: 14.5, fontWeight: '600', color: INK },
  socialTextP: { fontSize: 11.5 },
  soon: { marginTop: 8, fontSize: 12, color: BODY, textAlign: 'center' },
  terms: { marginTop: 20, fontSize: 13, lineHeight: 18, color: BODY, textAlign: 'center' },
  termsP: { fontSize: 11.5 },
  link: { color: BLUE, fontWeight: '500' },
  signIn: { marginTop: 14, alignItems: 'center' },
  signInText: { fontSize: 13, color: BODY },
  trust: { position: 'absolute', left: 26, right: 26, bottom: 28, height: 88, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#EEF4FD' },
  trustItem: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingHorizontal: 8 },
  trustRule: { borderLeftWidth: 1, borderLeftColor: '#D9E3F2' },
  trustTitle: { fontSize: 12, fontWeight: '700', color: INK },
  trustBody: { marginTop: 3, fontSize: 10.5, lineHeight: 14, color: BODY },
  barLink: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barText: { fontSize: 14, color: INK },
  barSignIn: { fontSize: 15.5, fontWeight: '700', color: BLUE },
});
