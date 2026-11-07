import { type ComponentType, useMemo } from 'react';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';
import type { MockData } from '@/mock';

type Admin = MockData['schoolAdmin'];

interface AdminRouteProps {
  desk: ComponentType<{ a: Admin }>;
  phone: ComponentType<{ a: Admin }>;
  title: string;
  subtitle: string;
  /** The page on the real API; without it, real builds say "Coming soon". */
  live?: ComponentType;
}

/**
 * A school-admin route: design builds show the reference page (desktop or phone);
 * real builds show the `live` page, or "Coming soon" until the API serves it.
 */
export function AdminRoute({ desk: Desk, phone: Phone, title, subtitle, live: Live }: AdminRouteProps) {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  if (!mock && Live) return <Live />;
  if (!mock) {
    return (
      <PreviewScreen title={title} subtitle={subtitle}>
        {() => null}
      </PreviewScreen>
    );
  }
  return wide ? <Desk a={mock.schoolAdmin} /> : <Phone a={mock.schoolAdmin} />;
}
