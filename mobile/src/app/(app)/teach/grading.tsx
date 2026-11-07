import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { RefScale } from '@/features/public/home/RefScale';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import {
  SPEED_GRADER_REF_WIDTH,
  SpeedGraderDesk,
  SpeedGraderPhone,
} from '@/features/teacher/grading/SpeedGraderViews';
import { LiveMarking } from '@/features/teacher/LiveMarking';
import { mockData } from '@/lib/mock';
import { PageScroll } from '@/components/shell/PageScroll';

/** Inventory 45: Rapid Speed-Grader (Voice-Note & Screen-Draw Studio) (`/(teacher)/grading/[assignmentId]`). */
export default function GradingScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  // Real builds mark the API's submissions; design builds render the full Speed-Grader replica.
  if (!mock) return <LiveMarking />;
  const me = mock.teacher.teacherHome.me;
  const g = mock.teacher.speedGrader;
  if (!wide) return <SpeedGraderPhone g={g} me={me} />;
  return (
    <PageScroll style={styles.bg}>
      <RefScale width={width} refWidth={SPEED_GRADER_REF_WIDTH}>
        <SpeedGraderDesk g={g} me={me} />
      </RefScale>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
