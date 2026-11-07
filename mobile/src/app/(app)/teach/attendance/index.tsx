import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import {
  ATTENDANCE_REF_WIDTH,
  AttendanceDesk,
  AttendancePhone,
} from '@/features/teacher/attendance/AttendanceViews';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { mockData } from '@/lib/mock';

/** Inventory 43: Post-Class Attendance & Engagement Register (`/(teacher)/attendance/[sessionId]`). */
export default function AttendanceRegisterScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen
        title="Attendance & Engagement Register"
        subtitle="Review auto-calculated attendance statuses, audited manual overrides with reason codes, and auto-generated recording chapters">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const r = mock.teacher.attendanceRegister;
  if (!wide) return <AttendancePhone r={r} me={me} />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={ATTENDANCE_REF_WIDTH}>
        <AttendanceDesk r={r} me={me} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});

