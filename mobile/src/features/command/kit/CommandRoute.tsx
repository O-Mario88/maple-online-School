import { type ComponentType, useMemo } from 'react';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';
import type { MockData } from '@/mock';

export type CommandData = MockData['commandCenter'];

/**
 * A Maple Command route: design builds show the reference page (desktop or phone);
 * real builds say "Coming soon" until the API serves it.
 */
export function CommandRoute({ desk: Desk, phone: Phone, title, subtitle }: { desk: ComponentType<{ c: CommandData }>; phone: ComponentType<{ c: CommandData }>; title: string; subtitle: string }) {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  if (!mock) {
    return (
      <PreviewScreen title={title} subtitle={subtitle}>
        {() => null}
      </PreviewScreen>
    );
  }
  return wide ? <Desk c={mock.commandCenter} /> : <Phone c={mock.commandCenter} />;
}
