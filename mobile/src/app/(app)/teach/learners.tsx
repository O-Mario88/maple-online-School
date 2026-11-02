import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import {
  MASTERY_REF_WIDTH,
  MasteryHeatmapDesk,
  MasteryHeatmapPhone,
} from '@/features/teacher/learners/MasteryHeatmapViews';
import { mockData } from '@/lib/mock';

/** Inventory 46: Class Mastery Heatmap & 1-Click Intervention Centre (`/(teacher)/learners`). */
export default function TeacherLearnersScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen
        title="Class Mastery Heatmap"
        subtitle="Matrix of students vs. curriculum competencies; flags learning gaps and lets the teacher send an auto-assembled Intervention Pack or parent voice update in 1 tap">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const m = mock.teacher.masteryHeatmap;
  if (!wide) return <MasteryHeatmapPhone m={m} me={me} />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={MASTERY_REF_WIDTH}>
        <MasteryHeatmapDesk m={m} me={me} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
