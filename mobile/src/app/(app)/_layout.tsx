import { Stack } from 'expo-router';

import { AppShell } from '@/components/shell/AppShell';
import { PortalProvider } from '@/lib/portal-context';

/** Screens only signed-in users can reach. The root layout guards this group. */
export default function SignedInLayout() {
  return (
    <PortalProvider>
      <AppShell>
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </AppShell>
    </PortalProvider>
  );
}
