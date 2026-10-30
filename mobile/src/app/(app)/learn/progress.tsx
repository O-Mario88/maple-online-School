import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Card, Grid, Stat } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import type { MasteryState } from '@/mock/learner';

/** Inventory 31: the mastery map (gold mastered, amber review, grey locked). */
export default function ProgressScreen() {
  const { theme, styles } = useStyles(makeStyles);
  const colour = (s: MasteryState) => (s === 'mastered' ? theme.warning : s === 'review' ? theme.accent : theme.textMuted);
  const fill = (s: MasteryState) => (s === 'mastered' ? theme.warningSoft : s === 'review' ? theme.accentSoft : theme.backgroundSelected);
  return (
    <PreviewScreen title="My progress" subtitle="What you've mastered, what needs review, and what's next">
      {(m) => {
        const all = m.learner.mastery.flatMap((s) => s.skills);
        const count = (s: MasteryState) => all.filter((x) => x.state === s).length;
        return (
          <>
            <Grid min={150}>
              <Stat label="Mastered" value={String(count('mastered'))} icon="star" tone="warning" />
              <Stat label="Needs review" value={String(count('review'))} icon="alert" tone="accent" />
              <Stat label="Still locked" value={String(count('locked'))} icon="lock" />
              <Stat label="Streak" value={`${m.learner.streak.days} days`} icon="sparkle" tone="good" />
            </Grid>
            {m.learner.mastery.map((subject) => (
              <Card key={subject.subject} title={subject.subject} icon="map">
                <View style={styles.path}>
                  {subject.skills.map((s, i) => (
                    <View key={s.name} style={styles.step}>
                      {i > 0 ? <View style={[styles.link, { backgroundColor: colour(s.state) }]} /> : null}
                      <View style={[styles.node, { borderColor: colour(s.state), backgroundColor: fill(s.state) }]} accessible accessibilityLabel={`${s.name}: ${s.state}`}>
                        <Icon name={s.state === 'mastered' ? 'star' : s.state === 'review' ? 'alert' : 'lock'} size={18} color={colour(s.state)} />
                      </View>
                      <Text style={styles.label}>{s.name}</Text>
                    </View>
                  ))}
                </View>
              </Card>
            ))}
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    path: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, alignItems: 'flex-start' },
    step: { width: 104, alignItems: 'center', gap: Spacing.one },
    link: { position: 'absolute', top: 22, left: -40, width: 64, height: 3, borderRadius: 2, opacity: 0.5 },
    node: { width: 46, height: 46, borderRadius: Radius.pill, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    label: { ...Type.caption, color: t.text, textAlign: 'center' },
  });
}
