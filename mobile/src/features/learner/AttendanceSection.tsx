import { Badge, Body, Card, ErrorText, Loading, Row } from '@/components/ui';
import { attendanceSummary, STATUS_LABELS } from '@/lib/school/attendance';
import { useMarks } from '@/lib/school/queries';
import type { Mark } from '@/lib/school/types';

/** Attendance at a glance for a student, or for each of a parent's children. */
export function AttendanceSection() {
  const marks = useMarks();

  if (marks.isPending) {
    return (
      <Card title="Attendance">
        <Loading label="Loading attendance" />
      </Card>
    );
  }
  if (marks.error || !marks.data) {
    return (
      <Card title="Attendance">
        <ErrorText message={marks.error?.message ?? 'Could not load attendance.'} />
      </Card>
    );
  }
  if (marks.data.length === 0) {
    return (
      <Card title="Attendance">
        <Body muted>No register has been taken yet this term.</Body>
      </Card>
    );
  }

  const byStudent = new Map<number, Mark[]>();
  for (const m of marks.data) {
    byStudent.set(m.student, [...(byStudent.get(m.student) ?? []), m]);
  }

  return (
    <Card title="Attendance">
      {[...byStudent.values()].map((list) => {
        const s = attendanceSummary(list);
        const latest = list[0];
        return (
          <Row
            key={latest.student}
            title={byStudent.size > 1 ? latest.student_name : `${s.days} days recorded`}
            detail={`Last: ${STATUS_LABELS[latest.status]} on ${latest.record_date} · ${s.absent} absent, ${s.late} late`}
            badge={<Badge label={s.rate === null ? '—' : `${s.rate}%`} tone={s.rate !== null && s.rate >= 90 ? 'good' : 'accent'} />}
          />
        );
      })}
    </Card>
  );
}
