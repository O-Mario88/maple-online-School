import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Banner, Button, Card, Chip, ChipRow, Field, KeyValue, Row } from '@/components/ui';
import { Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import type { AssignmentState } from '@/mock/learner';

const FILTERS: { value: AssignmentState | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'due', label: 'Due soon' },
  { value: 'draft', label: 'Offline drafts' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Marked' },
];

const TONE = { due: 'warning', draft: 'info', submitted: 'neutral', graded: 'good' } as const;
const LABEL = { due: 'Due', draft: 'Draft', submitted: 'Submitted', graded: 'Marked' } as const;

/** Inventory 26, 27, 28: assignments, the workspace (scanner and viva) and marked feedback. */
export default function AssignmentsScreen() {
  const { styles } = useStyles(makeStyles);
  const [filter, setFilter] = useState<AssignmentState | 'all'>('all');
  const [open, setOpen] = useState<string | null>('a4');
  const [text, setText] = useState('');
  return (
    <PreviewScreen title="Assignments" subtitle="Everything set for you, with drafts saved offline">
      {(m) => {
        const rows = m.learner.assignments.filter((a) => filter === 'all' || a.state === filter);
        const current = m.learner.assignments.find((a) => a.id === open);
        return (
          <>
            <ChipRow>
              {FILTERS.map((f) => (
                <Chip key={f.value} label={f.label} selected={f.value === filter} onPress={() => setFilter(f.value)} />
              ))}
            </ChipRow>
            <Card>
              {rows.map((a) => (
                <Row
                  key={a.id}
                  icon="clipboard"
                  title={a.title}
                  detail={`${a.subject} · ${a.due}`}
                  badge={<Badge label={a.state === 'graded' && 'score' in a ? `${a.score}/${a.max}` : LABEL[a.state]} tone={TONE[a.state]} />}
                  onPress={() => setOpen(a.id)}
                />
              ))}
            </Card>
            {current && current.state === 'graded' && 'rubric' in current ? (
              <Card title={`Feedback: ${current.title}`} subtitle={`${current.score} of ${current.max}`} icon="check">
                <KeyValue items={(current.rubric ?? []).map((r) => ({ label: r.criterion, value: `${r.score} / ${r.max}` }))} />
                <View style={styles.voice}>
                  <Button label="Play teacher's voice note (0:28)" icon="play" variant="secondary" compact onPress={() => undefined} />
                </View>
                <Text style={styles.feedback}>“{current.feedback}”</Text>
                <Button label="Practise the mistake (5 questions)" icon="sparkle" compact onPress={() => undefined} />
              </Card>
            ) : current ? (
              <Card title={current.title} subtitle={`${current.subject} · out of ${current.max}`} icon="clipboard">
                <Field label="Your answer" value={text} onChangeText={setText} multiline placeholder="Type your working here, or scan your book" />
                <View style={styles.tools}>
                  <Button label="Scan handwritten work" icon="camera" variant="secondary" compact onPress={() => undefined} />
                  <Button label="Record 60-second viva" icon="mic" variant="secondary" compact onPress={() => undefined} />
                </View>
                <Banner tone="info" title="Saved on this phone" body="Your draft syncs when you're back online." />
                <Button label="Hand in" icon="check" onPress={() => undefined} />
              </Card>
            ) : null}
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    voice: { flexDirection: 'row' },
    feedback: { ...Type.body, color: t.text, fontStyle: 'italic' },
    tools: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  });
}
