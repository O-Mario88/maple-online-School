import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, Grid, Row } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';

/** Inventory 42 and 43: the live host console and the class's understanding at a glance. */
export default function HostScreen() {
  const { theme, styles } = useStyles(makeStyles);
  const cell = (v: number) => (v >= 0.7 ? theme.successSoft : v >= 0.5 ? theme.warningSoft : theme.dangerSoft);
  const ink = (v: number) => (v >= 0.7 ? theme.success : v >= 0.5 ? theme.warning : theme.danger);
  return (
    <PreviewScreen title="Live host" subtitle="Run the class: whiteboard, pulse quizzes, who's following and who isn't">
      {(m) => {
        const h = m.teacher.hostConsole;
        return (
          <>
            <View style={styles.stage}>
              <Text style={styles.stageTitle}>{h.title}</Text>
              <Badge label={`Live · ${h.elapsed}`} tone="danger" />
            </View>
            <View style={styles.controls}>
              <Button label="Launch 15-second pulse quiz" icon="sparkle" compact onPress={() => undefined} />
              <Button label="Breakout rooms" icon="people" variant="secondary" compact onPress={() => undefined} />
              <Button label="Mute all" icon="mic" variant="secondary" compact onPress={() => undefined} />
              <Button label="End class" variant="danger" compact onPress={() => undefined} />
            </View>
            <Grid min={320}>
              <Card title="Understanding right now" subtitle="From the last pulse quiz" icon="chart">
                <View style={styles.heat}>
                  {h.understanding.map((s) => (
                    <View key={s.name} style={[styles.tile, { backgroundColor: cell(s.score) }]} accessible accessibilityLabel={`${s.name} ${Math.round(s.score * 100)}%`}>
                      <Text style={styles.tileName}>{s.name}</Text>
                      <Text style={[styles.tileScore, { color: ink(s.score) }]}>{Math.round(s.score * 100)}%</Text>
                    </View>
                  ))}
                </View>
              </Card>
              <Card title="Hands up" icon="hand">
                {h.hands.map((n) => (
                  <Row key={n} icon="hand" title={n} badge={<Button label="Unmute" compact variant="secondary" onPress={() => undefined} />} />
                ))}
                {h.breakouts.map((b) => (
                  <Row key={b.name} icon="people" title={b.name} detail={`${b.members} learners`} />
                ))}
              </Card>
            </Grid>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    stage: { aspectRatio: 21 / 9, borderRadius: Radius.lg, backgroundColor: t.sidebar, padding: Spacing.four, justifyContent: 'space-between', alignItems: 'flex-start' },
    stageTitle: { ...Type.title, color: t.sidebarText },
    controls: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    heat: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    tile: { width: 96, padding: Spacing.two, borderRadius: Radius.md, gap: 2 },
    tileName: { ...Type.caption, color: t.text },
    tileScore: { ...Type.bodyStrong },
  });
}
