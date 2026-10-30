import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';

import { Badge, type BadgeTone, Body, Button, Card, ErrorText, Heading, Loading, Row, Screen } from '@/components/ui';
import { initialRegister, localToday, nextStatus, type Register, STATUS_LABELS } from '@/lib/school/attendance';
import { useMarks, useRoster, useSaveRegister } from '@/lib/school/queries';
import type { MarkStatus } from '@/lib/school/types';

const TONE: Record<MarkStatus, BadgeTone> = {
  present: 'good',
  late: 'neutral',
  authorized_absent: 'neutral',
  unauthorized_absent: 'accent',
};

/** Today's register for one class: tap a student to change their mark, then save. */
export default function RegisterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classId = Number(id);
  const day = useMemo(() => localToday(), []);
  const roster = useRoster(classId);
  const today = useMarks({ class: classId, record_date: day });
  const save = useSaveRegister();
  const [register, setRegister] = useState<Register | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (roster.data && today.data && register === null) {
      setRegister(initialRegister(roster.data.students, today.data));
    }
  }, [roster.data, today.data, register]);

  if (roster.error) {
    return (
      <Screen>
        <Heading>Register unavailable</Heading>
        <ErrorText message={roster.error.message} />
        <Button label="Back" variant="secondary" onPress={() => router.back()} />
      </Screen>
    );
  }
  if (!roster.data || register === null) {
    return (
      <Screen>
        <Loading label="Loading the class list" />
      </Screen>
    );
  }

  const students = roster.data.students;
  const statuses = students.map((s) => register[s.student] ?? 'present');
  const count = (wanted: MarkStatus[]) => statuses.filter((s) => wanted.includes(s)).length;

  const toggle = (student: number) => {
    setSaved(false);
    setRegister((r) => (r ? { ...r, [student]: nextStatus(r[student] ?? 'present') } : r));
  };

  async function handleSave() {
    await save.mutateAsync({
      class: classId,
      record_date: day,
      entries: students.map((s) => ({ student: s.student, status: register?.[s.student] ?? 'present' })),
    });
    setSaved(true);
  }

  return (
    <Screen>
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Heading>{roster.data.class.title}</Heading>
      <Body muted>
        {day} · {count(['present'])} present · {count(['late'])} late ·{' '}
        {count(['unauthorized_absent', 'authorized_absent'])} absent
      </Body>

      <Card title={`Students (${students.length})`}>
        {students.length === 0 ? (
          <Body muted>No students are enrolled in this class yet.</Body>
        ) : (
          students.map((s) => {
            const status = register[s.student] ?? 'present';
            return (
              <Row
                key={s.student}
                title={s.student_name}
                badge={<Badge label={STATUS_LABELS[status]} tone={TONE[status]} />}
                onPress={() => toggle(s.student)}
                accessibilityHint="Changes this student's mark"
              />
            );
          })
        )}
      </Card>

      <ErrorText message={save.error?.message} />
      {saved ? <Body>Register saved. Parents can see today’s marks now.</Body> : null}
      <Button label="Save register" onPress={handleSave} disabled={students.length === 0} busy={save.isPending} />
      <Button
        label="Term marks and report cards"
        variant="secondary"
        onPress={() => router.push({ pathname: '/marks/[id]', params: { id: String(classId) } })}
      />
    </Screen>
  );
}
