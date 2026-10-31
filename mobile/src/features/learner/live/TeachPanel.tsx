import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Choice, Choices, FORM, FormCard, FormLabel, FormMessage, FormRow, Input, OutlineButton, PrimaryButton } from '@/features/shared/DesignForm';
import { lessonWhen, parseLessonTime, upcomingLessons } from '@/lib/lessons/lessons';
import { providerFor } from '@/lib/lessons/live';
import { useAddLiveSession, useLessons, useLiveSessions, usePlanLesson, usePublishLesson } from '@/lib/lessons/queries';
import { useClasses } from '@/lib/school/queries';
import { toast } from '@/lib/toast';

/** Draft lessons for staff to publish. */
function Drafts() {
  const lessons = useLessons();
  const publish = usePublishLesson();
  const drafts = useMemo(() => upcomingLessons(lessons.data ?? [], new Date()).filter((l) => l.access_mode === 'draft'), [lessons.data]);
  if (drafts.length === 0) return null;
  return (
    <FormCard title="Drafts">
      {drafts.map((l) => (
        <View key={l.id} style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{l.title}</Text>
            <Text style={styles.muted}>{[lessonWhen(l.scheduled_at), l.class_title].filter(Boolean).join(' · ')}</Text>
          </View>
          <OutlineButton
            label="Publish"
            accessibilityLabel={`Publish ${l.title}`}
            onPress={() => publish.mutate(l.id, { onSuccess: () => toast(`${l.title} published. Learners can see it now.`) })}
          />
        </View>
      ))}
      <FormMessage text={publish.error?.message} />
    </FormCard>
  );
}

/** Plan a lesson for one of the teacher's classes; it starts as a draft. */
function PlanLesson() {
  const classes = useClasses();
  const plan = usePlanLesson();
  const [classId, setClassId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('08:00');
  const [problem, setProblem] = useState<string | null>(null);
  if (!classes.data || classes.data.length === 0) return null;
  const chosen = classId ?? classes.data[0].id;

  const save = async () => {
    const when = parseLessonTime(date, time);
    const message = !title.trim() ? 'Give the lesson a title.' : when.error;
    setProblem(message);
    if (message || !when.value) return;
    await plan.mutateAsync({ parent_class: chosen, title: title.trim(), scheduled_at: when.value, access_mode: 'draft' }).then(
      () => {
        setTitle('');
        toast('Lesson saved as a draft. Publish it when you’re ready.');
      },
      () => undefined,
    );
  };

  return (
    <FormCard title="Plan a Lesson">
      <FormLabel>Class</FormLabel>
      <Choices>
        {classes.data.map((c) => (
          <Choice key={c.id} label={c.title} on={c.id === chosen} onPress={() => setClassId(c.id)} />
        ))}
      </Choices>
      <Input label="Title" value={title} onChangeText={setTitle} maxLength={255} placeholder="e.g. Photosynthesis, part 1" />
      <FormRow>
        <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-11-02" autoCorrect={false} />
        <Input label="Time (HH:MM)" value={time} onChangeText={setTime} placeholder="08:00" autoCorrect={false} />
      </FormRow>
      <FormMessage text={problem ?? plan.error?.message} />
      <PrimaryButton label="Save as draft" busy={plan.isPending} onPress={save} />
    </FormCard>
  );
}

/** Attach a Google Meet or Zoom link to an upcoming lesson that has none. */
function AddMeetingLink() {
  const lessons = useLessons();
  const sessions = useLiveSessions();
  const add = useAddLiveSession();
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [link, setLink] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const open = useMemo(() => {
    const taken = new Set((sessions.data ?? []).map((s) => s.lesson));
    return upcomingLessons(lessons.data ?? [], new Date()).filter((l) => !taken.has(l.id));
  }, [lessons.data, sessions.data]);
  if (open.length === 0) return null;
  const chosen = lessonId ?? open[0].id;

  const save = async () => {
    const provider = providerFor(link);
    setProblem(provider ? null : 'Paste a Google Meet (https://meet.google.com/…) or Zoom link.');
    if (!provider) return;
    await add.mutateAsync({ lesson: chosen, meeting_link: link.trim(), provider }).then(
      () => {
        setLink('');
        toast('Live session added. Learners can join from Classes.');
      },
      () => undefined,
    );
  };

  return (
    <FormCard title="Add a Meeting Link">
      <FormLabel>Lesson</FormLabel>
      <Choices>
        {open.map((l) => (
          <Choice key={l.id} label={`${l.title} · ${lessonWhen(l.scheduled_at)}`} on={l.id === chosen} onPress={() => setLessonId(l.id)} />
        ))}
      </Choices>
      <Input label="Meeting link" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" placeholder="https://meet.google.com/…" />
      <FormMessage text={problem ?? add.error?.message} />
      <PrimaryButton label="Add live session" busy={add.isPending} onPress={save} />
    </FormCard>
  );
}

/** Staff tools on the Classes page: publish drafts, plan lessons and add meeting links. */
export function TeachPanel() {
  return (
    <View style={styles.panel}>
      <Text style={styles.h2} accessibilityRole="header">
        Teach
      </Text>
      <Drafts />
      <PlanLesson />
      <AddMeetingLink />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  panel: { gap: 12 },
  h2: { fontSize: 18, fontWeight: '800', color: FORM.ink },
  muted: { fontSize: 12, color: FORM.body },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F0F3F8' },
  rowTitle: { fontSize: 14, fontWeight: '700', color: FORM.ink },
});
