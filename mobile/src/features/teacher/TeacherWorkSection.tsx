import { router } from 'expo-router';

import { Badge, Body, Button, Card, ErrorText, Loading, Row } from '@/components/ui';
import { useAssignments, useGrades, useSubmissions } from '@/lib/learning/queries';
import { toMark, trimDecimal } from '@/lib/learning/work';

/** The teacher home: work waiting to be marked first, then their assignments. */
export function TeacherWorkSection() {
  const assignments = useAssignments();
  const submissions = useSubmissions();
  const grades = useGrades();

  if (assignments.isPending || submissions.isPending || grades.isPending) {
    return (
      <Card title="To mark">
        <Loading label="Loading your classes’ work" />
      </Card>
    );
  }
  const error = assignments.error ?? submissions.error ?? grades.error;
  if (error || !assignments.data || !submissions.data || !grades.data) {
    return (
      <Card title="To mark">
        <ErrorText message={error?.message ?? 'Could not load this section.'} />
      </Card>
    );
  }

  const pending = toMark(submissions.data, grades.data);
  return (
    <>
      <Card title={`To mark (${pending.length})`}>
        {pending.length === 0 ? (
          <Body muted>Nothing waiting. New submissions will appear here.</Body>
        ) : (
          pending.map((s) => (
            <Row
              key={s.id}
              title={s.student_name ?? `Student ${s.student}`}
              detail={s.assessment_title}
              badge={<Badge label="Mark" tone="accent" />}
              onPress={() => router.push({ pathname: '/teach/grading', params: { id: String(s.id) } })}
              accessibilityHint="Opens the submission so you can grade it"
            />
          ))
        )}
      </Card>

      <Card
        title="Assignments"
        action={<Button label="New" variant="secondary" onPress={() => router.push('/new-assignment')} />}>
        {assignments.data.length === 0 ? (
          <Body muted>You haven’t set any assignments yet.</Body>
        ) : (
          assignments.data.map((a) => (
            <Row
              key={a.id}
              title={a.title}
              detail={`Out of ${trimDecimal(a.max_score)}`}
              badge={<Badge label={a.is_published ? 'Published' : 'Draft'} />}
            />
          ))
        )}
      </Card>
    </>
  );
}
