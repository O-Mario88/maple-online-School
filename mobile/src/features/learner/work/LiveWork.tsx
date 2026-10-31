import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { useAssignment, useGrades, useSubmissions, useSubmitWork } from '@/lib/learning/queries';
import type { Assessment, Grade, Submission } from '@/lib/learning/types';
import { answerProblem, MAX_ANSWER, submittedAnswer, trimDecimal } from '@/lib/learning/work';

import { BLUE, BODY, GREEN, INK } from './MathText';
import { Crumbs } from './WorkSide';

const LINE = '#EAEFF6';
const SOFT = '#F4F8FD';

/** The learner's own submission and its mark for one assignment, from the API. */
function useMyWork(id: number) {
  const assignment = useAssignment(id);
  const submissions = useSubmissions();
  const grades = useGrades();
  const mine = submissions.data?.find((s) => s.assessment === id);
  const grade = mine ? grades.data?.find((g) => g.submission === mine.id) : undefined;
  return {
    assignment,
    mine,
    grade,
    pending: assignment.isPending || submissions.isPending || grades.isPending,
    error: assignment.error ?? submissions.error ?? grades.error,
  };
}

function Frame({ crumbs, children }: { crumbs: readonly string[]; children: ReactNode }) {
  const { wide } = useShell();
  return (
    <ScrollView style={styles.bg} contentContainerStyle={[styles.page, wide && styles.pageWide]}>
      <Crumbs items={crumbs} phone={!wide} />
      {children}
    </ScrollView>
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <Frame crumbs={['Assignments']}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
    </Frame>
  );
}

function Header({ a }: { a: Assessment }) {
  return (
    <View style={styles.gapSmall}>
      <View style={styles.titleRow}>
        <Text style={styles.title} accessibilityRole="header">
          {a.title}
        </Text>
        <Text style={styles.kind}>{a.type.charAt(0).toUpperCase() + a.type.slice(1)}</Text>
      </View>
      <Text style={styles.body}>{`Out of ${trimDecimal(a.max_score)} marks`}</Text>
    </View>
  );
}

function Instructions({ a }: { a: Assessment }) {
  const questions = [...a.questions].sort((x, y) => x.order - y.order);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Instructions</Text>
      <Text style={styles.body}>{a.instructions}</Text>
      {questions.length > 0 ? <Text style={styles.label}>Questions</Text> : null}
      {questions.map((q, i) => (
        <View key={q.id} style={styles.question}>
          <Text style={styles.qNumber}>{String(i + 1)}</Text>
          <Text style={[styles.body, styles.flex]}>{q.content}</Text>
          <Text style={styles.muted}>{`${trimDecimal(q.marks)} marks`}</Text>
        </View>
      ))}
    </View>
  );
}

function Answer({ a }: { a: Assessment }) {
  const submit = useSubmitWork();
  const [answer, setAnswer] = useState('');
  const [tried, setTried] = useState(false);
  const problem = answerProblem(answer);
  const send = async () => {
    setTried(true);
    if (problem) return;
    await submit.mutateAsync({ assessment: a.id, answer: answer.trim() }).catch(() => undefined);
  };
  const shown = (tried && problem) || submit.error?.message;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>My Work</Text>
      <TextInput
        style={styles.input}
        value={answer}
        onChangeText={setAnswer}
        multiline
        maxLength={MAX_ANSWER + 1}
        placeholder="Write your answer and show your working"
        placeholderTextColor="#8A92A3"
        accessibilityLabel="Your answer"
      />
      {shown ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {shown}
        </Text>
      ) : null}
      <Pressable style={[styles.submit, submit.isPending && styles.busy]} onPress={send} disabled={submit.isPending} accessibilityRole="button" accessibilityState={{ busy: submit.isPending }}>
        {submit.isPending ? <ActivityIndicator color="#FFFFFF" /> : <Icon name="send" size={16} color="#FFFFFF" />}
        <Text style={styles.submitText}>Submit Assignment</Text>
      </Pressable>
      <Text style={styles.muted}>You can submit once. Your teacher marks it and you’ll see the feedback here.</Text>
    </View>
  );
}

function Sent({ mine }: { mine: Submission }) {
  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.cardTitle}>Submitted</Text>
        <Text style={styles.waiting}>Waiting for your teacher</Text>
      </View>
      <Text style={styles.body}>{submittedAnswer(mine) || 'Your work was sent.'}</Text>
    </View>
  );
}

function Marked({ a, grade }: { a: Assessment; grade: Grade }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Marked</Text>
      <Text style={styles.score}>{`${trimDecimal(grade.score)} / ${trimDecimal(a.max_score)}`}</Text>
      <Pressable style={styles.submit} onPress={() => router.push({ pathname: '/learn/assignments/[id]/feedback', params: { id: String(a.id) } })} accessibilityRole="button">
        <Icon name="star" size={16} color="#FFFFFF" />
        <Text style={styles.submitText}>See your feedback</Text>
      </Pressable>
    </View>
  );
}

const NOT_SHARED = 'It may have been removed, or it isn’t shared with you.';

/** The assignment workspace on the real API: instructions and questions, one written answer, then the mark. */
export function LiveWork({ id }: { id: number }) {
  const { wide } = useShell();
  const w = useMyWork(id);
  if (w.pending) return <Loader />;
  if (w.error || !w.assignment.data) return <Message title="Assignment not found" body={w.error?.message ?? NOT_SHARED} />;
  const a = w.assignment.data;
  const side = w.grade ? <Marked a={a} grade={w.grade} /> : w.mine ? <Sent mine={w.mine} /> : <Answer a={a} />;
  return (
    <Frame crumbs={['Assignments', a.title]}>
      <Header a={a} />
      <View style={[styles.columns, wide && styles.columnsWide]}>
        <View style={wide ? styles.colLeft : null}>
          <Instructions a={a} />
        </View>
        <View style={wide ? styles.colRight : null}>{side}</View>
      </View>
    </Frame>
  );
}

/** The teacher's mark and comment on the real API, with the answer it was given for. */
export function LiveFeedback({ id }: { id: number }) {
  const w = useMyWork(id);
  if (w.pending) return <Loader />;
  if (w.error || !w.assignment.data) return <Message title="Assignment not found" body={w.error?.message ?? NOT_SHARED} />;
  const a = w.assignment.data;
  if (!w.grade || !w.mine) return <Message title="Not marked yet" body="Your teacher hasn’t marked this assignment yet. You’ll see the feedback here once they do." />;
  return (
    <Frame crumbs={['Assignments', a.title, 'Feedback']}>
      <Header a={a} />
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your mark</Text>
        <Text style={[styles.score, styles.good]}>{`${trimDecimal(w.grade.score)} / ${trimDecimal(a.max_score)}`}</Text>
        <Text style={styles.label}>Teacher’s feedback</Text>
        <Text style={styles.body}>{w.grade.teacher_feedback || 'Your teacher marked this without a comment.'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your answer</Text>
        <Text style={styles.body}>{submittedAnswer(w.mine) || 'Your work was sent.'}</Text>
      </View>
    </Frame>
  );
}

function Loader() {
  return (
    <View style={[styles.bg, styles.center]}>
      <ActivityIndicator color={BLUE} accessibilityLabel="Loading the assignment" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: SOFT },
  center: { alignItems: 'center', justifyContent: 'center' },
  page: { gap: 14, padding: 16, paddingBottom: 110 },
  pageWide: { width: '100%', maxWidth: 1160, alignSelf: 'center', padding: 24 },
  gapSmall: { gap: 6 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 },
  title: { fontSize: 24, fontWeight: '800', color: INK, letterSpacing: -0.5 },
  kind: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 5, backgroundColor: '#E6EEFC', fontSize: 12.5, fontWeight: '600', color: '#1450C8', overflow: 'hidden' },
  columns: { gap: 14 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  colLeft: { flex: 5 },
  colRight: { flex: 6 },
  card: { gap: 10, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: INK },
  body: { fontSize: 14, lineHeight: 21, color: BODY },
  muted: { fontSize: 12, color: BODY },
  label: { marginTop: 4, fontSize: 12.5, fontWeight: '700', color: INK },
  question: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: LINE },
  qNumber: { width: 24, height: 24, borderRadius: 12, overflow: 'hidden', textAlign: 'center', lineHeight: 24, fontSize: 12, fontWeight: '700', color: BLUE, backgroundColor: '#E6EEFC' },
  input: { minHeight: 220, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DCE3EE', fontSize: 14, lineHeight: 21, color: INK, textAlignVertical: 'top' },
  error: { fontSize: 12.5, color: '#B42318' },
  submit: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, backgroundColor: BLUE },
  busy: { opacity: 0.7 },
  submitText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  waiting: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: '#FFF4E5', fontSize: 12, fontWeight: '600', color: '#B45309', overflow: 'hidden' },
  score: { fontSize: 32, fontWeight: '800', color: INK },
  good: { color: GREEN },
});
