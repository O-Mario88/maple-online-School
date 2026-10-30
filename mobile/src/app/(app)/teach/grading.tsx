import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Banner, Button, Card, Chip, ChipRow, Field, Grid, Row } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';

/** Inventory 45: fast marking with AI rubric hints and a held voice note. */
export default function GradingScreen() {
  const { styles } = useStyles(makeStyles);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  return (
    <PreviewScreen title="Marking" subtitle="Work waiting for you, with AI hints you can accept or ignore">
      {(m) => {
        const queue = m.teacher.gradingQueue;
        const s = queue[index % queue.length];
        const total = s.rubric.reduce((sum, r) => sum + (scores[`${s.id}-${r.criterion}`] ?? 0), 0);
        const max = s.rubric.reduce((sum, r) => sum + r.max, 0);
        return (
          <Grid min={340}>
            <Card title={`${s.learner}`} subtitle={`${s.assignment} · handed in ${s.submitted}`} action={<Avatar name={s.learner} size={36} />}>
              <View style={styles.page} accessibilityLabel="Scanned handwritten work">
                <Text style={styles.hand}>{s.answer}</Text>
                <View style={styles.circle} />
              </View>
              <Banner tone="info" title="AI hint" body={s.suggestion} />
            </Card>
            <Card title="Rubric" subtitle={`${total} of ${max}`} icon="check">
              {s.rubric.map((r) => (
                <View key={r.criterion} style={styles.criterion}>
                  <Text style={styles.label}>{r.criterion}</Text>
                  <ChipRow>
                    {Array.from({ length: r.max + 1 }, (_, i) => i).map((i) => (
                      <Chip key={i} label={String(i)} selected={scores[`${s.id}-${r.criterion}`] === i} onPress={() => setScores({ ...scores, [`${s.id}-${r.criterion}`]: i })} />
                    ))}
                  </ChipRow>
                </View>
              ))}
              <Field label="Comment" value={comment} onChangeText={setComment} multiline placeholder="What went well, and one thing to fix" />
              <Button label="Hold to record a 30-second voice note" icon="mic" variant="secondary" onPress={() => undefined} />
              <View style={styles.actions}>
                <Button label="Save and next" icon="check" onPress={() => setIndex(index + 1)} />
              </View>
              <Row title={`${queue.length} waiting`} detail="Oldest first" />
            </Card>
          </Grid>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    page: { minHeight: 200, padding: Spacing.three, borderRadius: Radius.md, backgroundColor: t.warningSoft, borderWidth: 1, borderColor: t.border },
    hand: { ...Type.body, color: t.text, fontFamily: 'serif', fontStyle: 'italic', lineHeight: 30 },
    circle: { position: 'absolute', right: 24, top: 70, width: 90, height: 44, borderRadius: 22, borderWidth: 2, borderColor: t.danger },
    criterion: { gap: Spacing.one },
    label: { ...Type.bodyStrong, color: t.text },
    actions: { flexDirection: 'row', gap: Spacing.two },
  });
}
