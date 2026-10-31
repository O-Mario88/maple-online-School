import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_SKY, AuthPhoneTop, AuthTopBar, FitScale } from '@/features/auth/AuthChrome';
import { SignInLink, SignUpCard } from '@/features/auth/SignUpCard';
import { SignUpPanel } from '@/features/auth/SignUpPanel';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

/** From this width the page is the reference's desktop layout, scaled to fit the window. */
const DESKTOP_MIN = 900;
// The sign-up reference's desktop frame: 1198 × 1020, with the bar at (18, 12), the photo panel at (18, 78) and the card at (625, 90).
const REF_W = 1198;
const REF_H = 1020;
const FRAME_W = 1162;

/** Create an account: the sign-up reference, sharing the sign-in page's frame. "Sign In" goes straight back to it. */
export default function SignUpScreen() {
  const { width } = useWindowDimensions();
  const art = useMemo(() => mockData()?.publicPages.signUpArt, []);

  if (width >= DESKTOP_MIN) {
    return (
      <LightOnly>
        <SafeAreaView style={styles.sky}>
          <FitScale refWidth={REF_W} refHeight={REF_H}>
            <View style={styles.bar}>
              <AuthTopBar width={FRAME_W} trailing={<SignInLink />} />
            </View>
            <View style={styles.panel}>
              <SignUpPanel art={art} width={FRAME_W} height={927} />
            </View>
            <View style={styles.card}>
              <SignUpCard art={art} />
            </View>
          </FitScale>
        </SafeAreaView>
      </LightOnly>
    );
  }

  return (
    <LightOnly>
      <SafeAreaView style={styles.phoneSafe} edges={['top', 'left', 'right']}>
        <AuthPhoneTop />
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.phoneScroll} keyboardShouldPersistTaps="handled">
            <SignUpCard art={art} phone />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sky: { flex: 1, backgroundColor: AUTH_SKY },
  bar: { position: 'absolute', left: 18, top: 12 },
  panel: { position: 'absolute', left: 18, top: 78 },
  card: { position: 'absolute', left: 625, top: 90 },
  phoneSafe: { flex: 1, backgroundColor: '#FFFFFF' },
  phoneScroll: { paddingBottom: 28, backgroundColor: '#FFFFFF' },
});
