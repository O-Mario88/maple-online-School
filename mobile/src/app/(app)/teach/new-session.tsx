import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import { CALENDAR_REF_WIDTH, CalendarDesk, CalendarPhone } from '@/features/teacher/calendar/CalendarViews';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { mockData } from '@/lib/mock';

/** Inventory 41 (/(teacher)/calendar/new-session): Schedule a Live Class / Recurring Series modal over Calendar. */
export default function NewSessionScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen
        title="Schedule a Live Class"
        subtitle="Create a one-time class or a recurring series for your students.">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const c = mock.teacher.teacherCalendar;
  if (!wide) return <CalendarPhone c={c} me={me} initialAdding />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={CALENDAR_REF_WIDTH}>
        <CalendarDesk c={c} me={me} initialAdding />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});

