import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Banner, Button, Card, Chip, ChipRow, Field, Grid, Row } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';

const QUALITIES = ['144p', '360p', '720p', '1080p'];
const TRANSCRIPT = [
  { at: '00:12', text: 'Today we turn any quadratic into a perfect square.' },
  { at: '01:40', text: 'Take x² + 6x. Half of 6 is 3, and 3 squared is 9.' },
  { at: '03:05', text: 'So x² + 6x + 9 is (x + 3)². That is the whole trick.' },
  { at: '05:30', text: 'Now solve x² + 6x − 7 = 0 by completing the square.' },
];
const CHAPTERS = ['Why complete the square', 'Half and square', 'Solving equations', 'Market problem'];

/** Inventory 21: the lesson player with transcript, chapters, a check and the AI study buddy. */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, styles } = useStyles(makeStyles);
  const [quality, setQuality] = useState('360p');
  const [answer, setAnswer] = useState<number | null>(null);
  const [buddyOpen, setBuddyOpen] = useState(true);
  const [question, setQuestion] = useState('');
  return (
    <PreviewScreen back title="Lesson">
      {(m) => {
        const lesson = m.learner.courses.flatMap((c) => c.modules.flatMap((mod) => mod.lessons)).find((l) => l.id === id) ?? { title: m.learner.nextUp.title, minutes: 18 };
        return (
          <>
            <View style={styles.player} accessibilityLabel={`Video: ${lesson.title}`}>
              <Icon name="play" size={56} color={theme.sidebarText} />
              <View style={styles.playerBar}>
                <Text style={styles.playerText}>03:05 / {lesson.minutes}:00</Text>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: '28%' }]} />
                </View>
                <Text style={styles.playerText}>{quality} · uses about 6 MB</Text>
              </View>
            </View>
            <Text style={styles.title}>{lesson.title}</Text>
            <ChipRow>
              {QUALITIES.map((q) => (
                <Chip key={q} label={q} selected={q === quality} onPress={() => setQuality(q)} />
              ))}
            </ChipRow>
            <Grid min={320}>
              <Card title="Chapters" subtitle="Made by AI from the recording" icon="sparkle">
                {CHAPTERS.map((c, i) => (
                  <Row key={c} icon="play" title={c} detail={`Part ${i + 1}`} onPress={() => undefined} />
                ))}
              </Card>
              <Card title="Transcript" subtitle="Tap a line to jump there" icon="book">
                {TRANSCRIPT.map((t) => (
                  <Pressable key={t.at} style={styles.line} onPress={() => undefined} accessibilityRole="button">
                    <Text style={styles.at}>{t.at}</Text>
                    <Text style={styles.lineText}>{t.text}</Text>
                  </Pressable>
                ))}
              </Card>
            </Grid>
            <Card title="Quick check" subtitle="Complete the square: x² + 10x + ___" icon="clipboard">
              <ChipRow>
                {['5', '10', '25', '100'].map((opt, i) => (
                  <Chip key={opt} label={opt} selected={answer === i} onPress={() => setAnswer(i)} />
                ))}
              </ChipRow>
              {answer == null ? null : answer === 2 ? (
                <Banner tone="good" title="Correct" body="Half of 10 is 5, and 5² = 25." />
              ) : (
                <Banner tone="warning" title="Not quite" body="Halve the 10 first, then square it." />
              )}
            </Card>
            <Card
              title="AI study buddy"
              subtitle="Answers about this moment in the lesson (03:05)"
              icon="sparkle"
              action={<Button label={buddyOpen ? 'Hide' : 'Open'} variant="ghost" compact onPress={() => setBuddyOpen(!buddyOpen)} />}>
              {buddyOpen ? (
                <>
                  <View style={styles.bubbleMe}>
                    <Text style={styles.bubbleText}>Why do we halve the 6?</Text>
                  </View>
                  <View style={styles.bubbleAi}>
                    <Text style={styles.bubbleText}>
                      Because (x + a)² = x² + 2ax + a². The middle term is 2a·x, so a is half of the 6. Then you add a² = 9 to make the square.
                    </Text>
                  </View>
                  <Field label="Ask about this lesson" value={question} onChangeText={setQuestion} placeholder="e.g. What if the number is odd?" />
                </>
              ) : null}
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    player: { aspectRatio: 16 / 9, borderRadius: Radius.lg, backgroundColor: t.sidebar, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    playerBar: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: Spacing.three, gap: Spacing.one, backgroundColor: 'rgba(0,0,0,0.35)' },
    playerText: { ...Type.caption, color: t.sidebarText },
    track: { height: 4, borderRadius: 2, backgroundColor: t.sidebarElement },
    fill: { height: 4, borderRadius: 2, backgroundColor: t.accent },
    title: { ...Type.title, color: t.text },
    line: { flexDirection: 'row', gap: Spacing.three, paddingVertical: Spacing.two },
    at: { ...Type.caption, color: t.accentText, width: 44 },
    lineText: { ...Type.small, color: t.text, flex: 1 },
    bubbleMe: { alignSelf: 'flex-end', maxWidth: '85%', padding: Spacing.three, borderRadius: Radius.lg, backgroundColor: t.accentSoft },
    bubbleAi: { alignSelf: 'flex-start', maxWidth: '85%', padding: Spacing.three, borderRadius: Radius.lg, backgroundColor: t.backgroundSelected },
    bubbleText: { ...Type.small, color: t.text },
  });
}
