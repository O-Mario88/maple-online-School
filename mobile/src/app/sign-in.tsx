import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthLayout } from '@/components/shell/AuthLayout';
import { Button, ErrorText, Field } from '@/components/ui';
import { Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAuth } from '@/lib/auth/auth-context';
import { MOCK_DATA } from '@/lib/mock';

export default function SignInScreen() {
  const { styles } = useStyles(makeStyles);
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '' && !isSubmitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sign in. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your school, classes and family account.">
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="username"
        placeholder="you@school.org"
        returnKeyType="next"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={handleSubmit}
      />
      <ErrorText message={error} />
      <Button label="Sign in" onPress={handleSubmit} disabled={!canSubmit} busy={isSubmitting} />
      <View style={styles.links}>
        <Link href="/forgot-password" style={styles.link} accessibilityRole="link">
          Forgot password?
        </Link>
        <Link href="/sign-up" style={styles.link} accessibilityRole="link">
          Create an account
        </Link>
      </View>
      {MOCK_DATA ? (
        <Link href="/welcome" style={styles.link} accessibilityRole="link">
          Design preview: public pages
        </Link>
      ) : null}
    </AuthLayout>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.one },
    link: { ...Type.small, fontWeight: '600', color: t.accentText, paddingVertical: Spacing.two },
  });
}
