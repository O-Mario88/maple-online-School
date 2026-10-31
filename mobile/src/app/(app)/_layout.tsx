import { Stack } from 'expo-router';

import { AppShell } from '@/components/shell/AppShell';
import { SwitcherProvider } from '@/components/shell/ContextSwitcher';
import { PortalProvider } from '@/lib/portal-context';

/** Screens only signed-in users can reach. The root layout guards this group. */
export default function SignedInLayout() {
  return (
    <PortalProvider>
      <SwitcherProvider>
        <AppShell>
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
        </AppShell>
      </SwitcherProvider>
    </PortalProvider>
  );
}
