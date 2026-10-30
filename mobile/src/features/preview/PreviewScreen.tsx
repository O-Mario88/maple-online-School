import { type ReactNode, useMemo } from 'react';

import { Badge, EmptyState, Screen } from '@/components/ui';
import { mockData } from '@/lib/mock';
import type { MockData } from '@/mock';

interface PreviewScreenProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean;
  width?: 'narrow' | 'wide';
  actions?: ReactNode;
  children: (mock: MockData) => ReactNode;
}

/**
 * A screen the API doesn't serve yet, drawn from mock data for design. In a
 * deployment build (no mock data) it says "Coming soon" instead.
 */
export function PreviewScreen({ title, subtitle, eyebrow, back = false, width = 'wide', actions, children }: PreviewScreenProps) {
  const mock = useMemo(() => mockData(), []);
  if (!mock) {
    return (
      <Screen back title={title}>
        <EmptyState icon="clock" title="Coming soon" body="This part of Maple is on its way." />
      </Screen>
    );
  }
  return (
    <Screen back={back} title={title} subtitle={subtitle} eyebrow={eyebrow} width={width} actions={actions}>
      <Badge label="Design preview · sample data" tone="info" />
      {children(mock)}
    </Screen>
  );
}
