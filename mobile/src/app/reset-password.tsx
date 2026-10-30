import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Body, Button, Card, ErrorText, Field, Heading, Screen } from '@/components/ui';
import { api } from '@/lib/api/client';
import { passwordProblem } from '@/lib/auth/signup';

/** Opened from the reset (or "set your password") email: choose a new password. */
export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    // The server also rejects passwords containing the email address.
    const message = !token
      ? 'This link is missing its code. Ask for a new one.'
      : (passwordProblem(password, '') ?? (password !== confirm ? "The passwords don't match." : null));
    setProblem(message);
    if (message || !token) return;
    setBusy(true);
    const { error } = await api.POST('/api/v1/auth/reset-password/', { body: { token, password } });
    setBusy(false);
    if (error) {
      setProblem((error as { detail?: string }).detail ?? 'Could not change the password.');
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <Screen>
        <Heading>Password changed</Heading>
        <Body>You can sign in with your new password now.</Body>
        <Button label="Sign in" onPress={() => router.replace('/sign-in')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Heading>Choose a new password</Heading>
      <Card>
        <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
        <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" />
        <ErrorText message={problem} />
        <Button label="Save password" onPress={submit} busy={busy} />
      </Card>
      <Button label="Ask for a new link" variant="secondary" onPress={() => router.replace('/forgot-password')} />
    </Screen>
  );
}
