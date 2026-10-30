import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { Body, Button, Card, ErrorText, Field, Heading, Loading, Screen } from '@/components/ui';
import { useAssignment, useGradeSubmission, useSubmissions } from '@/lib/learning/queries';
import { trimDecimal } from '@/lib/learning/work';

/** A teacher reads a student's answer and records a mark with feedback. */
export default function MarkScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const submissionId = Number(id);
  const submissions = useSubmissions();
  const submission = submissions.data?.find((s) => s.id === submissionId);
  const assignment = useAssignment(submission?.assessment ?? 0);
  const grade = useGradeSubmission();
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  if (submissions.isPending || (submission && assignment.isPending)) {
    return (
      <Screen>
        <Loading label="Loading the submission" />
      </Screen>
    );
  }
  if (!submission || assignment.error || !assignment.data) {
    return (
      <Screen>
        <Heading>Submission not found</Heading>
        <Body muted>It may already be marked, or it belongs to another school.</Body>
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }

  const maxLabel = trimDecimal(assignment.data.max_score);
  const max = Number(assignment.data.max_score);
  const value = Number(score);
  const scoreOk = score.trim() !== '' && Number.isFinite(value) && value >= 0 && value <= max;
  const answer = (submission.answers_data as { essay?: unknown }).essay;

  async function handleSave() {
    await grade.mutateAsync({ submission: submissionId, score: String(value), feedback: feedback.trim() });
    router.back();
  }

  return (
    <Screen>
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Heading>{submission.student_name ?? 'Student'}</Heading>
      <Body muted>{assignment.data.title}</Body>

      <Card title="Their answer">
        <Body>{typeof answer === 'string' && answer.trim() ? answer : 'No written answer.'}</Body>
      </Card>

      <Card title="Mark">
        <Field label={`Score (out of ${maxLabel})`} value={score} onChangeText={setScore} keyboardType="numeric" />
        {score.trim() !== '' && !scoreOk ? <ErrorText message={`Enter a number from 0 to ${maxLabel}.`} /> : null}
        <Field
          label="Feedback for the student"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          maxLength={5000}
          placeholder="What went well, and what to work on"
        />
        <ErrorText message={grade.error?.message} />
        <Button label="Save mark" onPress={handleSave} disabled={!scoreOk} busy={grade.isPending} />
      </Card>
    </Screen>
  );
}
