import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Button, ErrorText, Field } from '@/components/ui';
import { api } from '@/lib/api/client';
import { passwordProblem } from '@/lib/auth/signup';
import { AuthPage } from '@/features/auth/AuthPage';

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
      <AuthPage title="Password changed" sub="You can sign in with your new password now.">
        <Button label="Sign in" onPress={() => router.replace('/sign-in')} />
      </AuthPage>
    );
  }

  return (
    <AuthPage title="Choose a new password" sub="Use at least 8 characters. You’ll sign in with it from now on.">
        <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
        <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry autoComplete="new-password" />
        <ErrorText message={problem} />
        <Button label="Save password" onPress={submit} busy={busy} />
      <Button label="Ask for a new link" variant="secondary" onPress={() => router.replace('/forgot-password')} />
    </AuthPage>
  );
}
