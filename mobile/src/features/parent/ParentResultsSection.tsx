import { Badge, Body, Card, ErrorText, Loading, Row } from '@/components/ui';
import { useGrades } from '@/lib/learning/queries';
import { trimDecimal } from '@/lib/learning/work';

/** Latest marked work for the parent's approved children. */
export function ParentResultsSection() {
  const grades = useGrades();

  if (grades.isPending) {
    return (
      <Card title="Latest results">
        <Loading label="Loading your children’s results" />
      </Card>
    );
  }
  if (grades.error) {
    return (
      <Card title="Latest results">
        <ErrorText message={grades.error.message} />
      </Card>
    );
  }

  return (
    <Card title="Latest results">
      {grades.data.length === 0 ? (
        <Body muted>No marked work yet. Results appear here as soon as a teacher grades them.</Body>
      ) : (
        grades.data.map((g) => (
          <Row
            key={g.id}
            title={`${g.student_name ?? 'Your child'} · ${g.assessment_title ?? 'Assignment'}`}
            detail={g.teacher_feedback ? `“${g.teacher_feedback}”` : undefined}
            badge={<Badge label={`${trimDecimal(g.score)}/${trimDecimal(g.max_score ?? '')}`} tone="good" />}
          />
        ))
      )}
    </Card>
  );
}
