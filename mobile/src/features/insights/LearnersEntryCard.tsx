import { router } from 'expo-router';

import { Body, Card, ErrorText, Loading, Row } from '@/components/ui';
import { useClasses } from '@/lib/school/queries';

/** Opens each class's "learners who need you" view. */
export function LearnersEntryCard() {
  const classes = useClasses();
  return (
    <Card title="Learners who need you" subtitle="Attendance, missing work and marks, with one tap to act" icon="people">
      {classes.isPending ? (
        <Loading label="Loading your classes" />
      ) : classes.isError ? (
        <ErrorText message={classes.error.message} />
      ) : classes.data.length === 0 ? (
        <Body muted>No classes yet.</Body>
      ) : (
        classes.data.map((c) => (
          <Row
            key={c.id}
            icon="people"
            title={c.title}
            detail="See who needs you"
            onPress={() => router.push({ pathname: '/learners/[id]', params: { id: String(c.id), title: c.title } })}
          />
        ))
      )}
    </Card>
  );
}
