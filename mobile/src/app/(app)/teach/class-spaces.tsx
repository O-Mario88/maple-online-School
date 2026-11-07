import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import {
  CLASS_SPACES_REF_WIDTH,
  ClassSpacesDesk,
  ClassSpacesPhone,
} from '@/features/teacher/class-spaces/ClassSpacesViews';
import { CANVAS } from '@/features/teacher/frame/TeacherParts';
import { mockData } from '@/lib/mock';
import { PageScroll } from '@/components/shell/PageScroll';

/** Inventory 47: "Bottom-Up" Free School Class Space Manager (`/(teacher)/class-spaces`). */
export default function ClassSpacesScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen
        title="Class Spaces"
        subtitle="Create a class roster in 2 minutes via a 6-digit join code or WhatsApp invite link, and invite your principal to upgrade the school">
        {() => null}
      </PreviewScreen>
    );
  }
  const me = mock.teacher.teacherHome.me;
  const c = mock.teacher.classSpacesManager;
  if (!wide) return <ClassSpacesPhone c={c} me={me} />;
  return (
    <PageScroll style={styles.bg}>
      <RefScale width={width} refWidth={CLASS_SPACES_REF_WIDTH}>
        <ClassSpacesDesk c={c} me={me} />
      </RefScale>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: CANVAS },
});
