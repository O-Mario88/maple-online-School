import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Body, Button, Card, ErrorText, Field, Heading, Screen } from '@/components/ui';
import { api } from '@/lib/api/client';
import { signUpProblem } from '@/lib/auth/signup';

type Role = 'student' | 'teacher' | 'institution';

const ROLES: readonly { value: Role; label: string }[] = [
  { value: 'student', label: 'I am a student' },
  { value: 'teacher', label: 'I am a teacher' },
  { value: 'institution', label: 'I run a school' },
];

/** Create an account. An activation link is emailed before first sign-in. */
export default function SignUpScreen() {
  const [role, setRole] = useState<Role>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('UG');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function submit() {
    const message = signUpProblem({ email, fullName, password, confirm });
    setProblem(message);
    if (message) return;
    setBusy(true);
    const { data, error } = await api.POST('/api/v1/auth/register/', {
      body: { email: email.trim(), full_name: fullName.trim(), country_code: country.trim(), password, role },
    });
    setBusy(false);
    if (error || !data) {
      setProblem((error as { detail?: string } | undefined)?.detail ?? 'Could not create the account. Please try again.');
      return;
    }
    setSentTo(data.email);
  }

  if (sentTo) {
    return (
      <Screen>
        <Heading>Check your email</Heading>
        <Body>We sent an activation link to {sentTo}. Open it to finish, then sign in.</Body>
        <Button label="Go to sign in" onPress={() => router.replace('/sign-in')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Button label="Back to sign in" variant="secondary" onPress={() => router.replace('/sign-in')} />
      <Heading>Create your Maple account</Heading>
      <Card>
        <View style={styles.choices}>
          {ROLES.map((r) => (
            <Button key={r.value} label={r.value === role ? `✓ ${r.label}` : r.label} variant="secondary" onPress={() => setRole(r.value)} />
          ))}
        </View>
        <Field label="Full name" value={fullName} onChangeText={setFullName} autoComplete="name" maxLength={255} />
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" />
        <Field label="Country code" value={country} onChangeText={setCountry} autoCapitalize="characters" maxLength={10} />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
        <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" />
        <ErrorText message={problem} />
        <Button label="Create account" onPress={submit} busy={busy} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  choices: { gap: 8 },
});
