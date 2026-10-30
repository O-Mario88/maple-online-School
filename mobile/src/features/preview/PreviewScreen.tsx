import { type ReactNode, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge, EmptyState, Screen } from '@/components/ui';
import { HomeNav } from '@/features/public/HomeNav';
import { Brand, PUBLIC_WIDE } from '@/features/public/palette';
import { mockData } from '@/lib/mock';
import type { MockData } from '@/mock';
import { LightOnly } from '@/hooks/use-theme';

interface PreviewScreenProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean;
  width?: 'narrow' | 'wide';
  actions?: ReactNode;
  /** A public page: shows the public site's top bar above it. */
  publicNav?: boolean;
  children: (mock: MockData) => ReactNode;
}

/**
 * A screen the API doesn't serve yet, drawn from mock data for design. In a
 * deployment build (no mock data) it says "Coming soon" instead.
 */
export function PreviewScreen({ publicNav = false, ...props }: PreviewScreenProps) {
  const { width } = useWindowDimensions();
  if (!publicNav) return <PreviewBody {...props} />;
  return (
    <LightOnly>
    <View style={styles.public}>
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.nav}>
        <HomeNav wide={width >= PUBLIC_WIDE} />
      </SafeAreaView>
      <PreviewBody {...props} />
    </View>
    </LightOnly>
  );
}

function PreviewBody({ title, subtitle, eyebrow, back = false, width = 'wide', actions, children }: Omit<PreviewScreenProps, 'publicNav'>) {
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

const styles = StyleSheet.create({
  public: { flex: 1, backgroundColor: Brand.canvas },
  nav: { backgroundColor: Brand.surface },
});
