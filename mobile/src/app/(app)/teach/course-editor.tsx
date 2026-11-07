import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { COURSE_REF_WIDTH, CourseDesk, CoursePhone } from '@/features/teacher/course/CourseViews';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { mockData } from '@/lib/mock';
import { PageScroll } from '@/components/shell/PageScroll';

/** Inventory 38: build modules and lessons, with video, timestamps, notes, completion and access settings. */
export default function CourseEditorScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) return <PreviewScreen title="Subject builder">{() => null}</PreviewScreen>;
  const me = mock.teacher.teacherHome.me;
  const c = mock.teacher.courseBuilder;
  if (!wide) return <CoursePhone c={c} me={me} />;
  return (
    <PageScroll style={styles.bg}>
      <RefScale width={width} refWidth={COURSE_REF_WIDTH}>
        <CourseDesk c={c} me={me} />
      </RefScale>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
