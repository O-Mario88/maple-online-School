import { Stack } from 'expo-router';

import { AppShell } from '@/components/shell/AppShell';
import { SwitcherProvider } from '@/components/shell/ContextSwitcher';
import { AccessProvider } from '@/lib/access/access-context';
import { PortalProvider } from '@/lib/portal-context';

// Live rooms are drawing surfaces: a stroke to the right must not be read as iOS's swipe back
// (with the fade animation that swipe works anywhere on the screen, not just from the edge).
const LIVE_ROOMS: readonly string[] = ['teach/host', 'teach/live-host/[sessionId]', 'learn/live-room'];

/** Screens only signed-in users can reach. The root layout guards this group. */
export default function SignedInLayout() {
  return (
    <PortalProvider>
      <SwitcherProvider>
        <AccessProvider>
          <AppShell>
            <Stack screenOptions={({ route }) => ({ headerShown: false, animation: 'fade', gestureEnabled: !LIVE_ROOMS.includes(route.name) })} />
          </AppShell>
        </AccessProvider>
      </SwitcherProvider>
    </PortalProvider>
  );
}
