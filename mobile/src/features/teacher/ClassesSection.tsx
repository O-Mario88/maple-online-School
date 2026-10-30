import { router } from 'expo-router';

import { Badge, Body, Card, ErrorText, Loading, Row } from '@/components/ui';
import { useClasses } from '@/lib/school/queries';

/** The teacher's classes, each opening today's register. */
export function ClassesSection() {
  const classes = useClasses();

  if (classes.isPending) {
    return (
      <Card title="My classes">
        <Loading label="Loading your classes" />
      </Card>
    );
  }
  if (classes.error || !classes.data) {
    return (
      <Card title="My classes">
        <ErrorText message={classes.error?.message ?? 'Could not load your classes.'} />
      </Card>
    );
  }

  return (
    <Card title="My classes">
      {classes.data.length === 0 ? (
        <Body muted>No classes yet. A school leader assigns classes to teachers.</Body>
      ) : (
        classes.data.map((c) => (
          <Row
            key={c.id}
            title={c.title}
            detail={[c.class_level_name, c.subject_name].filter(Boolean).join(' · ')}
            badge={<Badge label="Register" tone="accent" />}
            onPress={() => router.push({ pathname: '/register/[id]', params: { id: String(c.id) } })}
            accessibilityHint="Opens today's register for this class"
          />
        ))
      )}
    </Card>
  );
}
