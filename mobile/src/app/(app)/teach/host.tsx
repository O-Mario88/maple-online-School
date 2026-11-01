import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import { HOST_REF_WIDTH, HostDesk, HostPhone } from '@/features/teacher/host/HostViews';
import { mockData } from '@/lib/mock';

/** Inventory 42: Maple Live Teacher Host Console (`/(teacher)/live-host/[sessionId]`). */
export default function HostScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen
        title="Maple Live Host Console"
        subtitle="Full presenter studio: interactive vector whiteboard + PDF stage, 15s Pulse Quiz, live comprehension heatmap, breakout rooms, and mic/camera locks">
        {() => null}
      </PreviewScreen>
    );
  }
  const h = mock.teacher.teacherHost;
  if (!wide) return <HostPhone h={h} />;
  return (
    <ScrollView style={styles.bg}>
      <RefScale width={width} refWidth={HOST_REF_WIDTH}>
        <HostDesk h={h} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bg: { backgroundColor: '#EEF2F8' },
});
