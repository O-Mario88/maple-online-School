import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LightOnly } from '@/hooks/use-theme';

import { AUTH_SKY, AuthPhoneTop, AuthTopBar } from './AuthChrome';

const DESKTOP_MIN = 900;
const FRAME_MAX = 1162;

/** A short sign-in step (reset password, verify email) in the sign-in page's look: its bar, the sky, and one white card. */
export function AuthPage({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  const { width } = useWindowDimensions();
  const wide = width >= DESKTOP_MIN;
  return (
    <LightOnly>
      <SafeAreaView style={[styles.safe, !wide && styles.phone]} edges={['top', 'left', 'right']}>
        {wide ? (
          <View style={styles.bar}>
            <AuthTopBar width={Math.min(width - 36, FRAME_MAX)} />
          </View>
        ) : (
          <AuthPhoneTop />
        )}
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={[styles.scroll, wide && styles.scrollWide]} keyboardShouldPersistTaps="handled">
            <View style={[styles.card, !wide && styles.cardPhone]}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              {sub ? <Text style={styles.sub}>{sub}</Text> : null}
              {children}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: AUTH_SKY },
  phone: { backgroundColor: '#FFFFFF' },
  bar: { alignItems: 'center', paddingTop: 12 },
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40 },
  scrollWide: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  card: { width: '100%', maxWidth: 460, gap: 14, padding: 28, borderRadius: 16, backgroundColor: '#FFFFFF', shadowColor: '#0F2350', shadowOpacity: 0.08, shadowRadius: 18, shadowOffset: { width: 0, height: 6 } },
  cardPhone: { padding: 4, shadowOpacity: 0 },
  title: { fontSize: 26, fontWeight: '800', color: '#0B1424', letterSpacing: -0.5 },
  sub: { fontSize: 14.5, lineHeight: 21, color: '#4A5263' },
});
