import { Image } from 'expo-image';
import { useMemo } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTH_SKY, AuthPhoneTop, AuthTopBar, FitScale } from '@/features/auth/AuthChrome';
import { SignInCard } from '@/features/auth/SignInCard';
import { SignInPanel } from '@/features/auth/SignInPanel';
import { Brand } from '@/features/public/palette';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

/** From this width the page is the reference's desktop layout, scaled to fit the window. */
const DESKTOP_MIN = 900;
// The reference's desktop frame: 1158 × 1020, with the bar at (18, 15), the photo panel at (18, 82) and the card at (563, 108).
const REF_W = 1158;
const REF_H = 1020;
const FRAME_W = 1122;
const PHONE_PHOTO_RATIO = 349 / 175;

/** Inventory 2: one sign-in and sign-up gateway, built to the sign-in reference. */
export default function SignInScreen() {
  const { width } = useWindowDimensions();
  const art = useMemo(() => mockData()?.publicPages.signInArt, []);

  if (width >= DESKTOP_MIN) {
    return (
      <LightOnly>
        <SafeAreaView style={styles.sky}>
          <FitScale refWidth={REF_W} refHeight={REF_H}>
            <View style={styles.bar}>
              <AuthTopBar width={FRAME_W} />
            </View>
            <View style={styles.panel}>
              <SignInPanel art={art} width={FRAME_W} height={923} />
            </View>
            <View style={styles.card}>
              <SignInCard art={art} />
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
            {art ? <Image source={art.phone} style={styles.phonePhoto} contentFit="cover" accessibilityLabel="A smiling learner in school uniform" /> : null}
            <View style={[styles.phoneCard, art ? styles.phoneCardOverlap : null]}>
              <SignInCard art={art} phone />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sky: { flex: 1, backgroundColor: AUTH_SKY },
  bar: { position: 'absolute', left: 18, top: 15 },
  panel: { position: 'absolute', left: 18, top: 82 },
  card: { position: 'absolute', left: 563, top: 108 },
  phoneSafe: { flex: 1, backgroundColor: Brand.surface },
  phoneScroll: { paddingBottom: 28, backgroundColor: '#F4F7FC' },
  phonePhoto: { width: '100%', aspectRatio: PHONE_PHOTO_RATIO },
  phoneCard: { marginHorizontal: 10, marginTop: 10 },
  phoneCardOverlap: { marginTop: -22 },
});
