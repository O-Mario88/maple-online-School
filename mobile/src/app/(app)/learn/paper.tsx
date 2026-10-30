import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Badge, Banner, Body, Button, Card, EmptyState, Stat, Grid } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';

/** Inventory 22: the living past-paper exam simulator. */
export default function PaperScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, styles } = useStyles(makeStyles);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  return (
    <PreviewScreen back title="Past paper">
      {(m) => {
        const paper = m.learner.pastPapers.find((p) => p.id === id) ?? m.learner.pastPapers[0];
        if (!paper || paper.questions.length === 0) {
          return <EmptyState icon="book" title="Questions coming soon" body="Try UCE Mathematics 2025 Paper 1 for the full simulator." />;
        }
        const q = paper.questions[current];
        const score = paper.questions.reduce((s, x) => s + (answers[x.n] === x.answer ? x.marks : 0), 0);
        const total = paper.questions.reduce((s, x) => s + x.marks, 0);
        return (
          <>
            <View style={styles.head}>
              <Text style={styles.title}>{`${paper.board} ${paper.exam} ${paper.subject} ${paper.year} · ${paper.paper}`}</Text>
              <View style={styles.timer} accessibilityLabel="Time left 2 hours 12 minutes">
                <Icon name="clock" size={16} color={theme.warning} />
                <Text style={styles.timerText}>2:12:40 left</Text>
              </View>
            </View>
            <View style={styles.nav}>
              {paper.questions.map((x, i) => {
                const done = answers[x.n] != null;
                return (
                  <Pressable
                    key={x.n}
                    onPress={() => setCurrent(i)}
                    style={[styles.navDot, done && styles.navDone, i === current && styles.navOn]}
                    accessibilityRole="button"
                    accessibilityLabel={`Question ${x.n}${done ? ', answered' : ''}`}>
                    <Text style={[styles.navText, (done || i === current) && styles.navTextOn]}>{x.n}</Text>
                  </Pressable>
                );
              })}
            </View>
            {finished ? (
              <Grid min={180}>
                <Stat label="Your score" value={`${score} / ${total}`} tone="accent" icon="check" />
                <Stat label="Percentage" value={`${Math.round((score / total) * 100)}%`} tone="good" icon="chart" />
              </Grid>
            ) : null}
            <Card title={`Question ${q.n}`} subtitle={`${q.marks} marks`} action={<Badge label="Objective" />}>
              <Text style={styles.question}>{q.text}</Text>
              {q.options.map((opt, i) => {
                const chosen = answers[q.n] === i;
                const right = finished && i === q.answer;
                const wrong = finished && chosen && i !== q.answer;
                return (
                  <Pressable
                    key={opt}
                    disabled={finished}
                    onPress={() => setAnswers({ ...answers, [q.n]: i })}
                    style={[styles.option, chosen && styles.optionOn, right && styles.optionRight, wrong && styles.optionWrong]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: chosen }}>
                    <Text style={styles.optionLetter}>{String.fromCharCode(65 + i)}</Text>
                    <Text style={styles.optionText}>{opt}</Text>
                  </Pressable>
                );
              })}
              {finished ? (
                answers[q.n] === q.answer ? (
                  <Banner tone="good" title="Correct, matches the marking scheme" />
                ) : (
                  <Banner tone="warning" title={`The marking scheme says ${String.fromCharCode(65 + q.answer)}`} body={`Watch the walkthrough: ${q.walkthrough}`} />
                )
              ) : null}
              <View style={styles.actions}>
                <Button label="Previous" variant="secondary" compact disabled={current === 0} onPress={() => setCurrent(current - 1)} />
                {current < paper.questions.length - 1 ? (
                  <Button label="Next" compact onPress={() => setCurrent(current + 1)} />
                ) : (
                  <Button label={finished ? 'Marked' : 'Finish and mark'} compact icon="check" disabled={finished} onPress={() => setFinished(true)} />
                )}
                <Button label={`Watch walkthrough (${q.walkthrough})`} variant="ghost" compact icon="play" onPress={() => undefined} />
              </View>
            </Card>
            <Body muted>{paper.attempts.toLocaleString()} learners have tried this paper.</Body>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    head: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
    title: { ...Type.heading, color: t.text, flexShrink: 1 },
    timer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingHorizontal: Spacing.three, paddingVertical: Spacing.one, borderRadius: Radius.pill, backgroundColor: t.warningSoft },
    timerText: { ...Type.bodyStrong, color: t.warning, fontVariant: ['tabular-nums'] },
    nav: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    navDot: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: t.borderStrong, alignItems: 'center', justifyContent: 'center' },
    navDone: { backgroundColor: t.backgroundSelected },
    navOn: { backgroundColor: t.accent, borderColor: t.accent },
    navText: { ...Type.bodyStrong, color: t.text },
    navTextOn: { color: t.text },
    question: { ...Type.body, color: t.text, fontSize: 18, lineHeight: 28 },
    option: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 52, paddingHorizontal: Spacing.three, borderRadius: Radius.md, borderWidth: 1, borderColor: t.border },
    optionOn: { borderColor: t.accent, backgroundColor: t.accentSoft },
    optionRight: { borderColor: t.success, backgroundColor: t.successSoft },
    optionWrong: { borderColor: t.danger, backgroundColor: t.dangerSoft },
    optionLetter: { ...Type.bodyStrong, color: t.textSecondary, width: 20 },
    optionText: { ...Type.body, color: t.text, flex: 1 },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  });
}
