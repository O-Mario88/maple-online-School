import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Avatar, Body, Button, Card, EmptyState, ErrorText, Field, Grid, Loading, Row, Screen } from '@/components/ui';
import { useAssignment, useGrades, useGradeSubmission, useSubmissions } from '@/lib/learning/queries';
import type { Submission } from '@/lib/learning/types';
import { scoreProblem, submittedAnswer, toMark, trimDecimal } from '@/lib/learning/work';
import { toast } from '@/lib/toast';

/** One submission: the learner's answer beside the mark and comment. */
function MarkOne({ s, waiting, onDone }: { s: Submission; waiting: number; onDone: () => void }) {
  const assignment = useAssignment(s.assessment);
  const grade = useGradeSubmission();
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [tried, setTried] = useState(false);
  const max = assignment.data?.max_score ?? '0';
  const problem = scoreProblem(score, max);
  const name = s.student_name ?? 'Learner';
  const handedIn = s.submitted_at ? ` · handed in ${new Date(s.submitted_at).toLocaleDateString()}` : '';

  const save = async () => {
    setTried(true);
    if (problem) return;
    await grade.mutateAsync({ submission: s.id, score: String(Number(score)), feedback: comment.trim() }).then(
      () => {
        toast(`Marked ${name}’s work.`);
        onDone();
      },
      () => undefined,
    );
  };

  return (
    <Grid min={340}>
      <Card title={name} subtitle={`${s.assessment_title ?? assignment.data?.title ?? 'Assignment'}${handedIn}`} action={<Avatar name={name} size={36} />}>
        <Body>{submittedAnswer(s) || 'No written answer.'}</Body>
      </Card>
      <Card title="Mark" subtitle={assignment.data ? `Out of ${trimDecimal(max)}` : undefined} icon="check">
        <Field label="Score" value={score} onChangeText={setScore} keyboardType="decimal-pad" placeholder={`0 to ${trimDecimal(max)}`} />
        <Field label="Comment" value={comment} onChangeText={setComment} multiline maxLength={5000} placeholder="What went well, and one thing to fix" />
        <ErrorText message={(tried ? problem : null) ?? grade.error?.message} />
        <Button label="Save and next" icon="check" onPress={save} busy={grade.isPending} disabled={!assignment.data} />
        <Row title={`${waiting} waiting`} detail="Oldest first" />
      </Card>
    </Grid>
  );
}

/** Marking on the real API: work waiting to be marked, oldest first, one at a time. */
export function LiveMarking() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const submissions = useSubmissions();
  const grades = useGrades();
  const [skip, setSkip] = useState(0);
  const pending = submissions.isPending || grades.isPending;
  const queue = submissions.data && grades.data ? toMark(submissions.data, grades.data) : [];
  // A link to one submission (?id=) opens it first.
  const start = Math.max(0, queue.findIndex((s) => String(s.id) === id));
  const current = queue.length > 0 ? queue[(start + skip) % queue.length] : undefined;

  return (
    <Screen width="wide" title="Marking" subtitle="Work waiting for you, oldest first">
      {pending ? <Loading label="Loading work to mark" /> : null}
      <ErrorText message={submissions.error?.message ?? grades.error?.message} />
      {!pending && !current ? <EmptyState icon="check" title="All marked" body="New work from your learners appears here as they hand it in." /> : null}
      {current ? <MarkOne key={current.id} s={current} waiting={queue.length} onDone={() => setSkip(0)} /> : null}
      {queue.length > 1 ? <Button label="Skip to the next one" variant="secondary" onPress={() => setSkip((n) => n + 1)} /> : null}
    </Screen>
  );
}
