import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Badge, Body, Button, Card, ErrorText, Field, Heading, Loading, Screen } from '@/components/ui';
import { useAssignment, useGrades, useSubmissions, useSubmitWork } from '@/lib/learning/queries';
import { trimDecimal } from '@/lib/learning/work';

const MAX_ANSWER = 20_000;

/** A student reads an assignment, answers it once, and later sees the mark. */
export default function AssignmentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const assessmentId = Number(id);
  const assignment = useAssignment(assessmentId);
  const submissions = useSubmissions();
  const grades = useGrades();
  const submit = useSubmitWork();
  const [answer, setAnswer] = useState('');

  if (!Number.isInteger(assessmentId) || assessmentId <= 0) {
    return <NotFound />;
  }
  if (assignment.isPending || submissions.isPending || grades.isPending) {
    return (
      <Screen>
        <Loading label="Loading the assignment" />
      </Screen>
    );
  }
  if (assignment.error) {
    return <NotFound message={assignment.error.message} />;
  }

  const a = assignment.data;
  const mine = submissions.data?.find((s) => s.assessment === a.id);
  const grade = mine ? grades.data?.find((g) => g.submission === mine.id) : undefined;
  const tooLong = answer.length > MAX_ANSWER;

  async function handleSubmit() {
    await submit.mutateAsync({ assessment: a.id, answer: answer.trim() });
    setAnswer('');
  }

  return (
    <Screen>
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Heading>{a.title}</Heading>
      <Body muted>Out of {trimDecimal(a.max_score)} marks</Body>
      <Card title="Instructions">
        <Body>{a.instructions}</Body>
      </Card>

      {grade ? (
        <Card title="Your mark" action={<Badge label={`${trimDecimal(grade.score)}/${trimDecimal(a.max_score)}`} tone="good" />}>
          <Body>{grade.teacher_feedback || 'Your teacher marked this without a comment.'}</Body>
        </Card>
      ) : mine ? (
        <Card title="Submitted" action={<Badge label="Waiting for your teacher" />}>
          <Body>{String((mine.answers_data as { essay?: string }).essay ?? 'Your answer was sent.')}</Body>
        </Card>
      ) : (
        <Card title="Your answer">
          <Field label="Answer" value={answer} onChangeText={setAnswer} multiline placeholder="Write your answer here" />
          <ErrorText message={tooLong ? 'Your answer is too long. Please shorten it.' : submit.error?.message} />
          <Button label="Submit" onPress={handleSubmit} disabled={answer.trim() === '' || tooLong} busy={submit.isPending} />
        </Card>
      )}
    </Screen>
  );
}

function NotFound({ message }: { message?: string }) {
  return (
    <Screen>
      <Heading>Assignment not found</Heading>
      <Body muted>{message ?? 'It may have been removed, or it isn’t shared with you.'}</Body>
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}
