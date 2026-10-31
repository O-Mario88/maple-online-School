import { Card, Grid, ProgressBar, Row, Stat, Table, Badge } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';

/** Inventory 64 and 60: today's register by class, chronic absence, and changes to marks. */
export default function AttendanceMonitorScreen() {
  return (
    <PreviewScreen title="Attendance" subtitle="Today's register across the school, and the learners we're worried about">
      {(m) => {
        const a = m.school.attendanceMonitor;
        const present = a.classes.reduce((s, c) => s + c.present, 0);
        const total = a.classes.reduce((s, c) => s + c.total, 0);
        return (
          <>
            <Grid min={170}>
              <Stat label={`Present · ${a.date}`} value={`${Math.round((present / total) * 100)}%`} detail={`${present} of ${total}`} icon="check" tone="good" />
              <Stat label="Teachers in" value={`${Math.round(m.school.leadership.teacherAttendance * 100)}%`} icon="people" />
              <Stat label="Chronic absence" value={String(a.chronic.length)} icon="alert" tone="warning" />
            </Grid>
            <Card title="By class" icon="school">
              {a.classes.map((c) => (
                <ProgressBar key={c.class} label={`${c.class} · ${c.present} of ${c.total}`} value={c.present / c.total} tone={c.present / c.total < 0.92 ? 'warning' : 'good'} />
              ))}
            </Card>
            <Grid min={320}>
              <Card title="Missing too many days" icon="alert">
                {a.chronic.map((c) => (
                  <Row key={c.name} icon="person" title={c.name} detail={`${c.class} · missed ${c.missed}`} badge={<Badge label="Follow up" tone="warning" />} />
                ))}
              </Card>
              <Card title="Changes to marks" subtitle="Every edit is kept" icon="clock">
                <Table
                  rows={a.adjustments}
                  rowKey={(x) => x.when}
                  columns={[
                    { key: 'when', label: 'When', render: (x) => x.when },
                    { key: 'by', label: 'By', render: (x) => x.by },
                    { key: 'change', label: 'Change', flex: 2, render: (x) => `${x.change} (${x.reason})` },
                  ]}
                />
              </Card>
            </Grid>
          </>
        );
      }}
    </PreviewScreen>
  );
}
