import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { Body, Button, ErrorText, Field, Loading } from '@/components/ui';
import { api } from '@/lib/api/client';
import { AuthPage } from '@/features/auth/AuthPage';

type State = { kind: 'working' } | { kind: 'done'; email?: string } | { kind: 'failed'; message: string };

/** Opened from the activation email: verifies the address, once. */
export default function ActivateScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [state, setState] = useState<State>({ kind: 'working' });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!token) {
        setState({ kind: 'failed', message: 'This link is missing its code.' });
        return;
      }
      const { data, error } = await api.POST('/api/v1/auth/activate/', { body: { token } });
      if (cancelled) return;
      if (error || !data) {
        setState({ kind: 'failed', message: (error as { detail?: string } | undefined)?.detail ?? 'Could not verify the email.' });
        return;
      }
      setState({ kind: 'done', email: data.email });
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthPage title="Activate your account">
      {state.kind === 'working' ? <Loading label="Verifying your email" /> : null}
      {state.kind === 'done' ? (
        <>
          <Body>Your email{state.email ? ` (${state.email})` : ''} is verified. You can sign in now.</Body>
          <Button label="Sign in" onPress={() => router.replace('/sign-in')} />
        </>
      ) : null}
      {state.kind === 'failed' ? <ResendLink message={state.message} /> : null}
    </AuthPage>
  );
}

/** When a link fails, ask for a new one. The reply never says whether the account exists. */
function ResendLink({ message }: { message: string }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState<string | null>(null);

  async function resend() {
    const { data } = await api.POST('/api/v1/auth/resend-activation/', { body: { email: email.trim() } });
    setSent(data?.message ?? 'If that account still needs activating, we have sent a new link.');
  }

  return (
    <>
      <ErrorText message={message} />
      <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Button label="Send a new link" onPress={resend} disabled={!email.trim()} />
      {sent ? <Body>{sent}</Body> : null}
      <Button label="Back to sign in" variant="secondary" onPress={() => router.replace('/sign-in')} />
    </>
  );
}
