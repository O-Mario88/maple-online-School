import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import { CALENDAR_REF_WIDTH, CalendarDesk, CalendarPhone } from '@/features/teacher/calendar/CalendarViews';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { mockData } from '@/lib/mock';

/** Inventory 40 and 41: Unified Zero-Collision Calendar & External Sync Setup + Schedule a Live Class modal. */
export default function CalendarScreen() {
  const { modal } = useLocalSearchParams<{ modal?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen
        title="Calendar"
        subtitle="School classes, live sessions, tutoring and your synced busy time, with no double-booking">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const c = mock.teacher.teacherCalendar;
  const initialAdding = modal === 'schedule';
  if (!wide) return <CalendarPhone c={c} me={me} initialAdding={initialAdding} />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={CALENDAR_REF_WIDTH}>
        <CalendarDesk c={c} me={me} initialAdding={initialAdding} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
