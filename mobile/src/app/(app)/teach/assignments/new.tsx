import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import {
  ASSIGNMENT_REF_WIDTH,
  AssignmentDesk,
  AssignmentPhone,
} from '@/features/teacher/assignments/AssignmentViews';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { mockData } from '@/lib/mock';

/** Inventory 44: Assignment & AI Rubric Builder (`/(teacher)/assignments/new`). */
export default function NewAssignmentScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen
        title="Create Assignment"
        subtitle="Create any of the 8 assessment types, generate or customize grading rubrics, toggle the 60-Second Student Viva, and assign to classes">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const a = mock.teacher.assignmentBuilder;
  if (!wide) return <AssignmentPhone a={a} me={me} />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={ASSIGNMENT_REF_WIDTH}>
        <AssignmentDesk a={a} me={me} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});

