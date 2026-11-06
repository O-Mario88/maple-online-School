import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, router, Stack, ThemeProvider, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { ToastHost } from '@/components/ui/ToastHost';
import { mapleNavTheme } from '@/lib/appearance';
import { AuthProvider, useAuth } from '@/lib/auth/auth-context';
import { INTER_FAMILY } from '@/lib/fonts/inter';
import { goesHomeOnSignIn, signedOutLanding } from '@/lib/landing';
import { DESIGN_DATA } from '@/lib/mock';
import { Maple } from '@/constants/maple';

// Signed-out visitors who open a signed-in address (such as /) land on the public
// homepage on the web once it has its content, and on sign-in otherwise and in the
// phone apps, not on whichever public page happens to be first.
export const unstable_settings = { anchor: signedOutLanding(Platform.OS, DESIGN_DATA) };

/** Last resort for a crash outside a screen; screens have their own boundary in app/(app)/_layout.tsx. */
export { RootErrorBoundary as ErrorBoundary } from '@/components/shell/ScreenBoundary';

SplashScreen.preventAutoHideAsync();

// The space the navigator shows while a page opens is Maple's page colour (see lib/appearance).
const NAV_THEME = mapleNavTheme(DefaultTheme);

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));
  // Inter is every page's font: the splash screen stays up until it has loaded (or failed, then
  // the system font stands in rather than leaving the app blank).
  const [fontsLoaded, fontError] = useFonts(INTER_FAMILY);
  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={NAV_THEME}>
          {/* Dark status bar icons on Maple's light pages; screens with a dark header (live rooms) set their own while open. */}
          <StatusBar style="dark" />
          {/* The web manifest makes Maple installable as an app on a computer (where it gets the sidebar). */}
          <Head>
            <link rel="manifest" href="/manifest.json" />
            <meta name="theme-color" content={Maple.blue} />
          </Head>
          <RootNavigator />
          <ToastHost />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { status, guest } = useAuth();
  const path = usePathname();
  const previous = useRef(status);
  // Set when someone has just signed in: signing in closes the sign-in page and the app falls back to
  // its anchor (on the web, the homepage), so the dashboard opens once that fall-back has happened.
  const goHome = useRef(false);

  useEffect(() => {
    if (status !== 'restoring') {
      SplashScreen.hideAsync();
    }
    if (goesHomeOnSignIn(previous.current, status)) goHome.current = true;
    previous.current = status;
  }, [status]);

  useEffect(() => {
    if (!goHome.current || status !== 'signedIn' || path === '/sign-in' || path === '/sign-up') return;
    goHome.current = false;
    if (path !== '/') router.replace('/');
  }, [path, status]);

  if (status === 'restoring') {
    return null; // The splash screen stays up while the saved session is checked.
  }

  const signedIn = status === 'signedIn';
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Visitors browsing free get the app's pages too; each one shows them only what is free. */}
      <Stack.Protected guard={signedIn || guest}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        {/* The live classroom takes the whole screen, outside the app shell. */}
        <Stack.Screen name="classroom/[slug]" />
        {/* A counseling call takes the whole screen too. */}
        <Stack.Screen name="counseling/[session]" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="sign-in" />
        <Stack.Screen name="sign-up" />
        <Stack.Screen name="forgot-password" />
      </Stack.Protected>
      {/* Opened from emailed links, whether or not someone is signed in. */}
      <Stack.Screen name="activate" />
      <Stack.Screen name="reset-password" />
      {/* Public pages (PUBLIC_PREVIEWS in lib/navigation): open to everyone. */}
      <Stack.Screen name="welcome" />
      <Stack.Screen name="courses/[slug]" />
      <Stack.Screen name="universities/index" />
      <Stack.Screen name="universities/[slug]" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="schools" />
      <Stack.Screen name="p/digest/[token]" />
      <Stack.Screen name="pay/[token]" />
      <Stack.Screen name="shorts" />
      <Stack.Screen name="live/[slug]" />
      <Stack.Screen name="past-papers/[board]/[subject]/[year]" />
      {/* Teacher storefronts at /@handle; other unknown addresses show "Page not found" there. */}
      <Stack.Screen name="[handle]" />
      <Stack.Screen name="event" />
      <Stack.Screen name="digest" />
      <Stack.Screen name="pay" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="help" />
      <Stack.Screen name="get-started" />
      <Stack.Screen name="qr-sign-in" />
      <Stack.Screen name="qr-login" />
      <Stack.Screen name="consent" />
      <Stack.Screen name="guardian-consent" />
      <Stack.Screen name="claim-child" />
      <Stack.Screen name="pricing" />
      <Stack.Screen name="curriculums" />
      <Stack.Screen name="teachers" />
      <Stack.Screen name="about" />
      <Stack.Screen name="terms" />
      <Stack.Screen name="privacy" />
    </Stack>
  );
}
