import { router } from 'expo-router';
import { useState } from 'react';

import { Body, Button, Card, Field, Heading, Screen } from '@/components/ui';
import { api } from '@/lib/api/client';

/** Ask for a password-reset link. The reply is the same whether or not the account exists. */
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    const { data } = await api.POST('/api/v1/auth/forgot-password/', { body: { email: email.trim() } });
    setBusy(false);
    setSent(data?.message ?? 'If an account with that email exists, we have sent a link to reset the password.');
  }

  return (
    <Screen>
      <Button label="Back to sign in" variant="secondary" onPress={() => router.replace('/sign-in')} />
      <Heading>Reset your password</Heading>
      <Card>
        {sent ? (
          <Body>{sent}</Body>
        ) : (
          <>
            <Body muted>Enter the email you sign in with. We'll send a link that works for 2 hours.</Body>
            <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" />
            <Button label="Send reset link" onPress={submit} busy={busy} disabled={!email.trim()} />
          </>
        )}
      </Card>
    </Screen>
  );
}
