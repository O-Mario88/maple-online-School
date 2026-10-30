import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth/auth-context';

export default function SignInScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.brand} accessibilityRole="header">
            Maple
          </Text>
          <Text style={styles.tagline}>Sign in to your school</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="username"
              accessibilityLabel="Email"
              placeholder="you@school.org"
              placeholderTextColor={theme.textSecondary}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              accessibilityLabel="Password"
              returnKeyType="go"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {error ? (
            <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.button, (!canSubmit || pressed) && styles.buttonDim]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityState={{ disabled: !canSubmit, busy: isSubmitting }}>
            {isSubmitting ? (
              <ActivityIndicator color={theme.onAccent} />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>

          <View style={styles.links}>
            <Link href="/forgot-password" style={styles.link} accessibilityRole="link">
              Forgot password?
            </Link>
            <Link href="/sign-up" style={styles.link} accessibilityRole="link">
              Create an account
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type Theme = ReturnType<typeof useTheme>;

function makeStyles(t: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    flex: { flex: 1 },
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: Spacing.four,
      gap: Spacing.three,
      maxWidth: 440,
      width: '100%',
      alignSelf: 'center',
    },
    brand: { fontSize: 40, fontWeight: '700', color: t.accent, letterSpacing: -1 },
    tagline: { fontSize: 17, color: t.textSecondary, marginBottom: Spacing.three },
    field: { gap: Spacing.two },
    label: { fontSize: 15, fontWeight: '600', color: t.text },
    input: {
      minHeight: 48,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      fontSize: 17,
      color: t.text,
      backgroundColor: t.backgroundElement,
    },
    error: { color: t.danger, fontSize: 15 },
    button: {
      minHeight: 52,
      borderRadius: 12,
      backgroundColor: t.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.two,
    },
    buttonDim: { opacity: 0.6 },
    buttonText: { color: t.onAccent, fontSize: 17, fontWeight: '600' },
    links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.two },
    link: { color: t.accent, fontSize: 15, fontWeight: '600', paddingVertical: Spacing.two },
  });
}
