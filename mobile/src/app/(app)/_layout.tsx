import { Stack } from 'expo-router';

import { AppShell } from '@/components/shell/AppShell';
import { SwitcherProvider } from '@/components/shell/ContextSwitcher';
import { PortalScreen } from '@/components/shell/PortalScreen';
import { ScreenBoundary } from '@/components/shell/ScreenBoundary';
import { AccessProvider } from '@/lib/access/access-context';
import { PortalProvider } from '@/lib/portal-context';
import { routePath } from '@/lib/portal-frame';

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
            {/* Each screen gets its portal's frame (when the page doesn't draw it) and its own error boundary, */}
            {/* so a crash replaces only that page and the frame stays. The frame is chosen from the screen's own route. */}
            <Stack
              screenOptions={({ route }) => ({ headerShown: false, animation: 'fade', gestureEnabled: !LIVE_ROOMS.includes(route.name) })}
              screenLayout={({ route, children }) => {
                const params = route.params as Readonly<Record<string, unknown>> | undefined;
                const id = params?.id;
                return (
                  <PortalScreen path={routePath(route.name, params)} courseId={typeof id === 'string' ? id : undefined}>
                    <ScreenBoundary>{children}</ScreenBoundary>
                  </PortalScreen>
                );
              }}
            />
          </AppShell>
        </AccessProvider>
      </SwitcherProvider>
    </PortalProvider>
  );
}
