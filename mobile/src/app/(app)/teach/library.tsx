import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import {
  TEACHER_LIBRARY_REF_WIDTH,
  TeacherLibraryDesk,
  TeacherLibraryPhone,
} from '@/features/teacher/library/TeacherLibraryViews';
import { mockData } from '@/lib/mock';

/** Inventory 51: Teacher Resource Library & Co-Teaching Collections (`/(teacher)/library`). */
export default function TeacherLibraryScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen title="Resource Library" subtitle="Manage your teaching resources, organize files, and collaborate with colleagues">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const l = mock.teacher.teacherLibrary;
  if (!wide) return <TeacherLibraryPhone lib={l} me={me} />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={TEACHER_LIBRARY_REF_WIDTH}>
        <TeacherLibraryDesk lib={l} me={me} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
