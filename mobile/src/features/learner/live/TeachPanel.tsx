import { type ComponentProps, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { lessonWhen, parseLessonTime, upcomingLessons } from '@/lib/lessons/lessons';
import { providerFor } from '@/lib/lessons/live';
import { useAddLiveSession, useLessons, useLiveSessions, usePlanLesson, usePublishLesson } from '@/lib/lessons/queries';
import { useClasses } from '@/lib/school/queries';
import { toast } from '@/lib/toast';

const INK = '#0B1424';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const LINE = '#E6EBF2';

function Choice({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.choice, on && styles.choiceOn]} onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }}>
      <Text style={[styles.choiceText, on && styles.choiceTextOn]}>{label}</Text>
    </Pressable>
  );
}

function Input({ label, ...props }: { label: string } & ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#8A92A3" accessibilityLabel={label} {...props} />
    </View>
  );
}

function Primary({ label, busy, onPress }: { label: string; busy: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.primary, busy && styles.busy]} onPress={onPress} disabled={busy} accessibilityRole="button" accessibilityState={{ busy }}>
      {busy ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>{label}</Text>}
    </Pressable>
  );
}

/** Draft lessons for staff to publish. */
function Drafts() {
  const lessons = useLessons();
  const publish = usePublishLesson();
  const drafts = useMemo(() => upcomingLessons(lessons.data ?? [], new Date()).filter((l) => l.access_mode === 'draft'), [lessons.data]);
  if (drafts.length === 0) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Drafts</Text>
      {drafts.map((l) => (
        <View key={l.id} style={styles.row}>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{l.title}</Text>
            <Text style={styles.muted}>{[lessonWhen(l.scheduled_at), l.class_title].filter(Boolean).join(' · ')}</Text>
          </View>
          <Pressable
            style={styles.outline}
            onPress={() => publish.mutate(l.id, { onSuccess: () => toast(`${l.title} published. Learners can see it now.`) })}
            accessibilityRole="button"
            accessibilityLabel={`Publish ${l.title}`}>
            <Text style={styles.outlineText}>Publish</Text>
          </Pressable>
        </View>
      ))}
      {publish.error ? <Text style={styles.error}>{publish.error.message}</Text> : null}
    </View>
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
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Plan a Lesson</Text>
      <Text style={styles.label}>Class</Text>
      <View style={styles.choices} accessibilityRole="radiogroup">
        {classes.data.map((c) => (
          <Choice key={c.id} label={c.title} on={c.id === chosen} onPress={() => setClassId(c.id)} />
        ))}
      </View>
      <Input label="Title" value={title} onChangeText={setTitle} maxLength={255} placeholder="e.g. Photosynthesis, part 1" />
      <View style={styles.pair}>
        <Input label="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} placeholder="2026-11-02" autoCorrect={false} />
        <Input label="Time (HH:MM)" value={time} onChangeText={setTime} placeholder="08:00" autoCorrect={false} />
      </View>
      {problem || plan.error ? <Text style={styles.error}>{problem ?? plan.error?.message}</Text> : null}
      <Primary label="Save as draft" busy={plan.isPending} onPress={save} />
    </View>
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
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Add a Meeting Link</Text>
      <Text style={styles.label}>Lesson</Text>
      <View style={styles.choices} accessibilityRole="radiogroup">
        {open.map((l) => (
          <Choice key={l.id} label={`${l.title} · ${lessonWhen(l.scheduled_at)}`} on={l.id === chosen} onPress={() => setLessonId(l.id)} />
        ))}
      </View>
      <Input label="Meeting link" value={link} onChangeText={setLink} autoCapitalize="none" keyboardType="url" placeholder="https://meet.google.com/…" />
      {problem || add.error ? <Text style={styles.error}>{problem ?? add.error?.message}</Text> : null}
      <Primary label="Add live session" busy={add.isPending} onPress={save} />
    </View>
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
  h2: { fontSize: 18, fontWeight: '800', color: INK },
  card: { gap: 10, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: INK },
  label: { fontSize: 12.5, fontWeight: '600', color: INK },
  muted: { fontSize: 12, color: BODY },
  error: { fontSize: 12.5, color: '#B42318' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F0F3F8' },
  rowTitle: { fontSize: 14, fontWeight: '700', color: INK },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#CFDAEC' },
  choiceOn: { borderColor: BLUE, backgroundColor: '#E8F0FE' },
  choiceText: { fontSize: 13, color: INK },
  choiceTextOn: { color: BLUE, fontWeight: '700' },
  pair: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  field: { flexGrow: 1, flexBasis: 200, gap: 4 },
  input: { height: 42, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DCE3EE', fontSize: 14, color: INK, backgroundColor: '#FFFFFF' },
  primary: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: BLUE },
  busy: { opacity: 0.7 },
  primaryText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  outline: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: '#CFDAEC' },
  outlineText: { fontSize: 12.5, fontWeight: '700', color: BLUE },
});
