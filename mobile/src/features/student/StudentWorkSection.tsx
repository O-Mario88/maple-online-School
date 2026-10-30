import { router } from 'expo-router';

import { Badge, Body, Card, ErrorText, Loading, Row } from '@/components/ui';
import { useAssignments, useGrades, useSubmissions } from '@/lib/learning/queries';
import { studentWork, type WorkItem } from '@/lib/learning/work';

/** "My assignments" on the student home: what to do, what's waiting, what's marked. */
export function StudentWorkSection() {
  const assignments = useAssignments();
  const submissions = useSubmissions();
  const grades = useGrades();

  if (assignments.isPending || submissions.isPending || grades.isPending) {
    return (
      <Card title="My assignments">
        <Loading label="Loading your assignments" />
      </Card>
    );
  }
  const error = assignments.error ?? submissions.error ?? grades.error;
  if (error || !assignments.data || !submissions.data || !grades.data) {
    return (
      <Card title="My assignments">
        <ErrorText message={error?.message ?? 'Could not load this section.'} />
      </Card>
    );
  }

  const items = studentWork(assignments.data, submissions.data, grades.data);
  return (
    <Card title="My assignments">
      {items.length === 0 ? (
        <Body muted>No assignments yet. Your teachers’ work will appear here.</Body>
      ) : (
        items.map((item) => <WorkRow key={item.assessmentId} item={item} />)
      )}
    </Card>
  );
}

function WorkRow({ item }: { item: WorkItem }) {
  const open = () => router.push({ pathname: '/assignment/[id]', params: { id: String(item.assessmentId) } });
  switch (item.state) {
    case 'todo':
      return (
        <Row
          title={item.title}
          detail="Not submitted yet"
          badge={<Badge label="To do" tone="accent" />}
          onPress={open}
          accessibilityHint="Opens the assignment so you can answer it"
        />
      );
    case 'submitted':
      return <Row title={item.title} detail="Waiting for your teacher" badge={<Badge label="Submitted" />} onPress={open} />;
    case 'graded':
      return (
        <Row
          title={item.title}
          detail={item.feedback ? `“${item.feedback}”` : 'Marked'}
          badge={<Badge label={`${item.score}/${item.maxScore}`} tone="good" />}
          onPress={open}
        />
      );
  }
}
