import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

import { AuthProvider, useAuth } from '@/lib/auth/auth-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: 1 } } }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootNavigator />
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function RootNavigator() {
  const { status } = useAuth();

  useEffect(() => {
    if (status !== 'restoring') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'restoring') {
    return null; // The splash screen stays up while the saved session is checked.
  }

  const signedIn = status === 'signedIn';
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" />
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
      <Stack.Screen name="explore" />
      <Stack.Screen name="shorts" />
      <Stack.Screen name="event" />
      <Stack.Screen name="digest" />
      <Stack.Screen name="pay" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="help" />
      <Stack.Screen name="get-started" />
      <Stack.Screen name="qr-sign-in" />
      <Stack.Screen name="consent" />
      <Stack.Screen name="claim-child" />
    </Stack>
  );
}
