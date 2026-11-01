import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { STUDIO_REF_WIDTH, StudioDesk, StudioPhone } from '@/features/teacher/studio/StudioViews';
import { mockData } from '@/lib/mock';

/** Inventory 37: turn a syllabus, worksheet, past paper or playlist into a 3-level course in about a minute. */
export default function StudioScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) return <PreviewScreen title="AI course studio">{() => null}</PreviewScreen>;
  const h = mock.teacher.teacherHome;
  const me = h.me;
  const s = mock.teacher.studioNew;
  if (!wide) return <StudioPhone s={s} me={me} />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={STUDIO_REF_WIDTH}>
        <StudioDesk s={s} me={me} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
