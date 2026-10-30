import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Badge, Body, Button, Card, EmptyState, Grid, ProgressBar, Row, ToggleRow } from '@/components/ui';
import { Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import { formatMoney } from '@/lib/finance/fees';
import type { IconName } from '@/lib/icons';

const KIND_ICON: Record<string, IconName> = { video: 'play', notes: 'book', quiz: 'clipboard', live: 'live' };

/** Inventory 20 / 3: a course's outline, progress and offline downloads. */
export default function CourseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, styles } = useStyles(makeStyles);
  return (
    <PreviewScreen back title="Course">
      {(m) => {
        const c = m.learner.courses.find((x) => x.id === id) ?? m.learner.courses[0];
        if (!c) return <EmptyState icon="book" title="Course not found" />;
        const lessons = c.modules.flatMap((mod) => mod.lessons);
        const next = lessons.find((l) => !l.done);
        return (
          <>
            <View style={styles.hero}>
              <Badge label={`${c.board} · ${c.level}`} tone="accent" />
              <Text style={styles.title}>{c.title}</Text>
              <Text style={styles.sub}>{c.summary}</Text>
              <View style={styles.metaRow}>
                <Icon name="star" size={14} color={theme.warning} />
                <Text style={styles.sub}>
                  {c.rating} · {c.learners.toLocaleString()} learners · {c.teacher}
                </Text>
              </View>
              <View style={styles.actions}>
                {next ? (
                  <Button
                    label={c.progress > 0 ? `Continue: ${next.title}` : 'Start learning'}
                    icon="play"
                    onPress={() => router.push({ pathname: '/learn/lesson', params: { id: next.id, course: c.id } })}
                  />
                ) : null}
                {c.priceUGX > 0 && c.progress === 0 ? (
                  <Button label={`Enrol · ${formatMoney(c.priceUGX, 'UGX')}`} variant="secondary" onPress={() => router.push('/checkout')} />
                ) : null}
              </View>
            </View>
            <Grid min={320}>
              <Card title="Your progress" icon="chart">
                <ProgressBar label={`${lessons.filter((l) => l.done).length} of ${lessons.length} lessons`} value={c.progress} />
                <Body muted>Keep a 20-minute streak to finish before end of term.</Body>
              </Card>
              <Card title="What you'll be able to do" icon="check">
                {c.outcomes.map((o) => (
                  <Row key={o} icon="check" title={o} />
                ))}
              </Card>
            </Grid>
            {c.modules.map((mod, i) => (
              <Card key={mod.title} title={`Module ${i + 1}: ${mod.title}`} subtitle={`${mod.lessons.length} lessons`}>
                <ToggleRow label="Download for offline" detail="Saved encrypted on this phone" initial={mod.downloaded} />
                {mod.lessons.map((l) => (
                  <Row
                    key={l.id}
                    icon={KIND_ICON[l.kind]}
                    title={l.title}
                    detail={`${l.minutes} min · ${l.kind}`}
                    badge={l.done ? <Badge label="Done" tone="good" /> : undefined}
                    onPress={() => router.push({ pathname: '/learn/lesson', params: { id: l.id, course: c.id } })}
                  />
                ))}
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
    hero: { gap: Spacing.two, padding: Spacing.four, borderRadius: 20, backgroundColor: t.sidebar },
    title: { ...Type.title, color: t.sidebarText },
    sub: { ...Type.small, color: t.sidebarMuted },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  });
}
