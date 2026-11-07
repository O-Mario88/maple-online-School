import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import {
  VERIFICATION_REF_WIDTH,
  VerificationDesk,
  VerificationPhone,
} from '@/features/teacher/verification/VerificationViews';
import { mockData } from '@/lib/mock';

/** Inventory 49: Teacher Verification & KYC Credentials Upload (`/(teacher)/verification`). */
export default function VerificationScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen title="Verification" subtitle="Your ID and qualifications unlock the verified badge and instant payouts">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const v = mock.teacher.verificationKyc;
  if (!wide) return <VerificationPhone v={v} me={me} />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={VERIFICATION_REF_WIDTH}>
        <VerificationDesk v={v} me={me} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
