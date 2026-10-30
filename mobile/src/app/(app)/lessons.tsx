import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Badge, Body, Button, Card, ErrorText, Field, Heading, Loading, Row, Screen } from '@/components/ui';
import { AddLiveLinkCard, LiveSessionsCard } from '@/features/shared/LiveSessionsCard';
import { useMe } from '@/lib/auth/auth-context';
import { lessonWhen, parseLessonTime, upcomingLessons, type Lesson } from '@/lib/lessons/lessons';
import { usePlanLesson, usePublishLesson, useLessons } from '@/lib/lessons/queries';
import { isStaff } from '@/lib/roles';
import { useClasses } from '@/lib/school/queries';

/** Upcoming lessons for the person's classes; staff can plan and publish. */
export default function LessonsScreen() {
  const me = useMe();
  const staff = me.data ? isStaff(me.data.memberships) : false;

  return (
    <Screen>
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Heading>Lessons</Heading>
      <LiveSessionsCard />
      <UpcomingCard staff={staff} />
      {staff ? <PlanLessonCard /> : null}
      {staff ? <AddLiveLinkCard /> : null}
    </Screen>
  );
}

function UpcomingCard({ staff }: { staff: boolean }) {
  const lessons = useLessons();
  const publish = usePublishLesson();
  const upcoming = useMemo(() => upcomingLessons(lessons.data ?? [], new Date()), [lessons.data]);

  if (lessons.isPending) return <Loading label="Loading lessons" />;
  if (lessons.error) return <ErrorText message={lessons.error.message} />;

  return (
    <Card title="Coming up">
      {upcoming.length === 0 ? <Body muted>No lessons planned from today onwards.</Body> : null}
      {upcoming.map((l) => (
        <LessonRow key={l.id} lesson={l} staff={staff} onPublish={() => publish.mutate(l.id)} />
      ))}
      <ErrorText message={publish.error?.message} />
    </Card>
  );
}

interface LessonRowProps {
  lesson: Lesson;
  staff: boolean;
  onPublish: () => void;
}

function LessonRow({ lesson, staff, onPublish }: LessonRowProps) {
  const isDraft = lesson.access_mode === 'draft';
  return (
    <View>
      <Row
        title={lesson.title}
        detail={[lessonWhen(lesson.scheduled_at), lesson.class_title, lesson.topic_name].filter(Boolean).join(' · ')}
        badge={isDraft ? <Badge label="Draft" /> : <Badge label="Published" tone="good" />}
      />
      {staff && isDraft ? <Button label={`Publish “${lesson.title}”`} variant="secondary" onPress={onPublish} /> : null}
    </View>
  );
}

/** Staff plan a lesson for one of their classes. It starts as a draft. */
function PlanLessonCard() {
  const classes = useClasses();
  const plan = usePlanLesson();
  const [classId, setClassId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('08:00');
  const [problem, setProblem] = useState<string | null>(null);

  if (classes.isPending) return <Loading label="Loading your classes" />;
  if (classes.error) return <ErrorText message={classes.error.message} />;
  if (classes.data.length === 0) return null;

  const chosen = classId ?? classes.data[0].id;

  async function save() {
    const when = parseLessonTime(date, time);
    const message = !title.trim() ? 'Give the lesson a title.' : when.error;
    setProblem(message);
    if (message || !when.value) return;
    await plan.mutateAsync({ parent_class: chosen, title: title.trim(), scheduled_at: when.value, access_mode: 'draft' });
    setTitle('');
  }

  return (
    <Card title="Plan a lesson">
      <Body muted>Class</Body>
      <View style={styles.choices}>
        {classes.data.map((c) => (
          <Button key={c.id} label={c.id === chosen ? `✓ ${c.title}` : c.title} variant="secondary" onPress={() => setClassId(c.id)} />
        ))}
      </View>
      <Field label="Title" value={title} onChangeText={setTitle} maxLength={255} placeholder="e.g. Photosynthesis, part 1" />
      <Field label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-11-02" autoCorrect={false} />
      <Field label="Time (HH:MM)" value={time} onChangeText={setTime} placeholder="08:00" autoCorrect={false} />
      <ErrorText message={problem} />
      <ErrorText message={plan.error?.message} />
      <Button label="Save as draft" onPress={save} busy={plan.isPending} />
    </Card>
  );
}

const styles = StyleSheet.create({
  choices: { gap: 8 },
});
