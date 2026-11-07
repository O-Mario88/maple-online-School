import { useQueries } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { Badge, Body, Button, Card, ChipRow, EmptyState, ErrorText, Grid, Loading, Row, Screen, Segmented, Stat } from '@/components/ui';
import { useMe } from '@/lib/auth/auth-context';
import { countOf } from '@/lib/plural';
import { leaderSchools, type SchoolRef } from '@/lib/roles';
import { localToday } from '@/lib/school/attendance';
import { schoolDay, shiftDay } from '@/lib/school/attendance-day';
import { classDayMarks, useClasses } from '@/lib/school/queries';
import type { Class, Mark } from '@/lib/school/types';

const GOOD_RATE = 90;

function DayView({ classes, day }: { classes: readonly Class[]; day: string }) {
  const results = useQueries({
    queries: classes.map((c) => ({ queryKey: ['marks', 'class-day', c.id, day], queryFn: () => classDayMarks(c.id, day) })),
  });
  if (results.some((r) => r.isPending)) return <Loading label="Loading the registers" />;
  const failed = results.find((r) => r.error);
  if (failed?.error) return <ErrorText message={failed.error.message} />;

  const byClass = new Map<number, Mark[]>(classes.map((c, i) => [c.id, results[i].data ?? []]));
  const d = schoolDay(classes, byClass);
  const isToday = day === localToday();

  return (
    <>
      <Grid min={150}>
        <Stat label="In school" value={d.totals.rate === null ? '—' : `${d.totals.rate}%`} icon="check" tone={d.totals.rate !== null && d.totals.rate >= GOOD_RATE ? 'good' : 'warning'} />
        <Stat label="Present" value={String(d.totals.present)} icon="people" tone="neutral" />
        <Stat label="Late" value={String(d.totals.late)} icon="clock" tone={d.totals.late > 0 ? 'warning' : 'neutral'} />
        <Stat label="Absent" value={String(d.totals.absent)} icon="info" tone={d.totals.absent > 0 ? 'warning' : 'neutral'} />
        <Stat label="Registers taken" value={`${d.registered.length}/${classes.length}`} icon="clipboard" tone={d.missing.length > 0 ? 'warning' : 'good'} />
      </Grid>
      <Grid min={320}>
        <Card title="Registers not taken" subtitle={d.missing.length === 0 ? 'Every class has a register for this day' : countOf(d.missing.length, 'class', 'classes')} icon="alert">
          {d.missing.length === 0 ? <Body muted>Nothing to chase.</Body> : null}
          {d.missing.map((c) => (
            <Row
              key={c.id}
              title={c.title}
              detail={isToday ? 'Take the register now' : 'No register was saved'}
              onPress={isToday ? () => router.push({ pathname: '/register/[id]', params: { id: String(c.id) } }) : undefined}
            />
          ))}
        </Card>
        <Card title="Unexcused absences" subtitle="Absent without a reason from home" icon="flag">
          {d.unexcused.length === 0 ? <Body muted>None.</Body> : null}
          {d.unexcused.map((u) => (
            <Row key={`${u.classId}-${u.student}`} title={u.name} detail={u.classTitle} badge={<Badge label="Absent" tone="danger" />} />
          ))}
        </Card>
        <Card title="By class" icon="school">
          {d.registered.length === 0 ? <Body muted>No registers saved for this day.</Body> : null}
          {d.registered.map((c) => (
            <Row
              key={c.id}
              title={c.title}
              detail={`Present ${c.summary.present} · Late ${c.summary.late} · Absent ${c.summary.absent}`}
              badge={<Badge label={`${c.summary.rate ?? 0}%`} tone={(c.summary.rate ?? 0) >= GOOD_RATE ? 'good' : 'warning'} />}
            />
          ))}
        </Card>
      </Grid>
    </>
  );
}

function SchoolAttendance({ school }: { school: SchoolRef }) {
  const classes = useClasses();
  const [day, setDay] = useState(localToday());
  const schoolClasses = (classes.data ?? []).filter((c) => c.institution === school.id);
  const today = localToday();

  if (classes.isPending) return <Loading label="Loading classes" />;
  if (classes.error) return <ErrorText message={classes.error.message} />;
  if (schoolClasses.length === 0) return <EmptyState icon="school" title="No classes yet" body="Each class's daily register shows here once classes are set up." />;

  const label = new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  return (
    <>
      <Card title={day === today ? `Today · ${label}` : label} icon="calendar">
        <ChipRow>
          <Button compact label="Previous day" variant="secondary" onPress={() => setDay(shiftDay(day, -1))} />
          <Button compact label="Next day" variant="secondary" disabled={day >= today} onPress={() => setDay(shiftDay(day, 1))} />
          {day !== today ? <Button compact label="Today" variant="ghost" onPress={() => setDay(today)} /> : null}
        </ChipRow>
      </Card>
      <DayView classes={schoolClasses} day={day} />
    </>
  );
}

/** The school's daily attendance on the real API: every class's register, the day's totals and who to follow up. */
export function LiveAttendanceMonitor() {
  const me = useMe();
  const schools = me.data ? leaderSchools(me.data.memberships) : [];
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const school = schools.find((s) => s.id === schoolId) ?? schools[0];

  return (
    <Screen width="wide" title="Attendance" subtitle="Every class's daily register, which ones are missing, and learners absent without a reason.">
      {me.isPending ? <Loading label="Loading your schools" /> : null}
      {me.data && !school ? <EmptyState icon="check" title="For school leaders" body="Class teachers take their register from the class page." /> : null}
      {schools.length > 1 && school ? (
        <Segmented label="School" options={schools.map((s) => ({ value: String(s.id), label: s.name }))} value={String(school.id)} onChange={(v) => setSchoolId(Number(v))} />
      ) : null}
      {school ? <SchoolAttendance key={school.id} school={school} /> : null}
    </Screen>
  );
}
