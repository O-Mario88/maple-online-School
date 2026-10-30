import { Badge, Body, Card, ErrorText, Loading, Row } from '@/components/ui';
import { useTodaySlots } from '@/lib/timetable';

/** Today's lessons from the timetable, in order. */
export function TodaySection() {
  const today = useTodaySlots();

  if (today.isPending) {
    return (
      <Card title="Today">
        <Loading label="Loading today's lessons" />
      </Card>
    );
  }
  if (today.error || !today.data) {
    return (
      <Card title="Today">
        <ErrorText message={today.error?.message ?? 'Could not load the timetable.'} />
      </Card>
    );
  }
  return (
    <Card title="Today">
      {today.data.length === 0 ? (
        <Body muted>No lessons on the timetable today.</Body>
      ) : (
        today.data.map((s) => (
          <Row
            key={s.id}
            title={s.class_title}
            detail={[s.room_name, s.teacher_name].filter(Boolean).join(' · ') || undefined}
            badge={<Badge label={`${s.start_time}–${s.end_time}`} />}
          />
        ))
      )}
    </Card>
  );
}
