import { useMemo, useState } from 'react';

import { Badge, Card, EmptyState, ErrorText, Grid, Loading, Row, Screen, Segmented, Stat } from '@/components/ui';
import { attendanceSummary, STATUS_LABELS } from '@/lib/school/attendance';
import { useMarks } from '@/lib/school/queries';
import type { Mark, MarkStatus } from '@/lib/school/types';

const TONE: Readonly<Record<MarkStatus, 'good' | 'warning' | 'info' | 'danger'>> = { present: 'good', late: 'warning', authorized_absent: 'info', unauthorized_absent: 'danger' };
const RECENT_DAYS = 10;

/** Attendance on the real API: each child's rate, absences and lateness, and their recent days. */
export function LiveAttendance() {
  const marks = useMarks();
  const children = useMemo(() => {
    const byStudent = new Map<number, Mark[]>();
    for (const m of marks.data ?? []) byStudent.set(m.student, [...(byStudent.get(m.student) ?? []), m]);
    return [...byStudent.values()];
  }, [marks.data]);
  const [picked, setPicked] = useState<string | null>(null);
  const list = children.find((c) => String(c[0].student) === picked) ?? children[0];
  const s = list ? attendanceSummary(list) : null;

  return (
    <Screen title="Attendance" subtitle="Every school day your child is registered">
      {marks.isPending ? <Loading label="Loading attendance" /> : null}
      <ErrorText message={marks.error?.message} />
      {!marks.isPending && !marks.error && children.length === 0 ? <EmptyState icon="calendar" title="No register yet" body="Attendance appears here once the class teacher takes the register." /> : null}
      {children.length > 1 && list ? (
        <Segmented label="Child" options={children.map((c) => ({ value: String(c[0].student), label: c[0].student_name }))} value={String(list[0].student)} onChange={setPicked} />
      ) : null}
      {list && s ? (
        <>
          <Grid min={150}>
            <Stat label="In school" value={s.rate === null ? '—' : `${s.rate}%`} icon="check" tone={s.rate !== null && s.rate >= 90 ? 'good' : 'warning'} />
            <Stat label="Absent" value={String(s.absent)} icon="info" tone={s.absent > 0 ? 'warning' : 'neutral'} />
            <Stat label="Late" value={String(s.late)} icon="clock" tone="neutral" />
          </Grid>
          <Card title="Recent days" subtitle={`${s.days} days recorded`} icon="calendar">
            {list.slice(0, RECENT_DAYS).map((m) => (
              <Row
                key={`${m.student}-${m.record_date}`}
                title={new Date(m.record_date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                badge={<Badge label={STATUS_LABELS[m.status]} tone={TONE[m.status]} />}
              />
            ))}
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
