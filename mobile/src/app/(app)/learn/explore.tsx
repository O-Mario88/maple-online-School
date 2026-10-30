import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Badge, Chip, ChipRow, Field, Grid, Section } from '@/components/ui';
import { Elevation, Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import { formatMoney } from '@/lib/finance/fees';
import type { MockCourse } from '@/mock/learner';

const LEVELS = ['All', 'P7', 'S3', 'S4', 'S5'];

/** Inventory 2 / learner Explore: courses, past papers and bootcamps. */
export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All');
  return (
    <PreviewScreen title="Explore" subtitle="Courses, past papers and live bootcamps for your exams">
      {(m) => {
        const q = query.trim().toLowerCase();
        const shown = m.learner.courses.filter(
          (c) => (level === 'All' || c.level === level) && (!q || `${c.title} ${c.subject} ${c.teacher}`.toLowerCase().includes(q)),
        );
        return (
          <>
            <Field label="Search" value={query} onChangeText={setQuery} placeholder="Subject, topic or teacher" />
            <ChipRow>
              {LEVELS.map((l) => (
                <Chip key={l} label={l} selected={level === l} onPress={() => setLevel(l)} />
              ))}
            </ChipRow>
            <Section title="Courses" description={`${shown.length} for you`}>
              <Grid min={260}>
                {shown.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </Grid>
            </Section>
            <Section title="Living past papers" description="Solve real UNEB papers with instant marking">
              <Grid min={220}>
                {m.learner.pastPapers.map((p) => (
                  <Pressable key={p.id} onPress={() => router.push({ pathname: '/learn/paper', params: { id: p.id } })}>
                    <PaperTile title={`${p.exam} ${p.subject} ${p.year}`} detail={`${p.paper} · ${p.attempts.toLocaleString()} attempts`} />
                  </Pressable>
                ))}
              </Grid>
            </Section>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function CourseCard({ course }: { course: MockCourse }) {
  const { theme, styles } = useStyles(makeStyles);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/learn/course', params: { id: course.id } })}
      style={({ hovered }) => [styles.card, hovered && styles.cardHover]}
      accessibilityRole="button"
      accessibilityLabel={course.title}>
      <View style={styles.cover}>
        <Text style={styles.coverSubject}>{course.subject}</Text>
        <Badge label={course.board} tone="accent" />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={styles.teacher}>{course.teacher}</Text>
        <View style={styles.meta}>
          <Icon name="star" size={14} color={theme.warning} />
          <Text style={styles.metaText}>
            {course.rating} · {course.learners.toLocaleString()} learners
          </Text>
        </View>
        <Text style={styles.price}>{course.priceUGX === 0 ? 'Free' : formatMoney(course.priceUGX, 'UGX')}</Text>
      </View>
    </Pressable>
  );
}

function PaperTile({ title, detail }: { title: string; detail: string }) {
  const { theme, styles } = useStyles(makeStyles);
  return (
    <View style={styles.paper}>
      <Icon name="book" size={20} color={theme.accentText} />
      <View style={styles.flex}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.metaText}>{detail}</Text>
      </View>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    card: { borderRadius: Radius.lg, borderWidth: 1, borderColor: t.border, backgroundColor: t.backgroundElement, overflow: 'hidden', ...Elevation.card },
    cardHover: { borderColor: t.borderStrong },
    cover: { height: 96, backgroundColor: t.sidebar, padding: Spacing.three, justifyContent: 'space-between', alignItems: 'flex-start' },
    coverSubject: { ...Type.heading, color: t.sidebarText },
    body: { padding: Spacing.three, gap: Spacing.one },
    title: { ...Type.bodyStrong, color: t.text },
    teacher: { ...Type.small, color: t.textSecondary },
    meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
    metaText: { ...Type.caption, color: t.textSecondary },
    price: { ...Type.bodyStrong, color: t.accentText, marginTop: Spacing.one },
    paper: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center', padding: Spacing.three, borderRadius: Radius.md, backgroundColor: t.backgroundSelected },
  });
}
