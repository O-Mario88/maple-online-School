import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import {
  EARNINGS_REF_WIDTH,
  EarningsDesk,
  EarningsPhone,
} from '@/features/teacher/earnings/EarningsViews';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { mockData } from '@/lib/mock';
import { PageScroll } from '@/components/shell/PageScroll';

/** Inventory 50: Teacher Earnings, Escrow Ledger & Instant Mobile-Money Payouts (`/(teacher)/earnings`). */
export default function EarningsScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen title="Earnings" subtitle="What you've earned, what's held until classes finish, and your payouts">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const e = mock.teacher.earningsLedger;
  if (!wide) return <EarningsPhone e={e} me={me} />;
  return (
    <PageScroll style={styles.bg}>
      <RefScale width={width} refWidth={EARNINGS_REF_WIDTH}>
        <EarningsDesk e={e} me={me} />
      </RefScale>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
