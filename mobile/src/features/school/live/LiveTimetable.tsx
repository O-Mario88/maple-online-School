import { useState } from 'react';

import { Body, Button, Card, Chip, ChipRow, EmptyState, ErrorText, Grid, Loading, Row, Screen, Segmented } from '@/components/ui';
import { useMe } from '@/lib/auth/auth-context';
import { countOf } from '@/lib/plural';
import { leaderSchools, type SchoolRef } from '@/lib/roles';
import { useClasses } from '@/lib/school/queries';
import { useRemoveLesson, useRooms, useSlots, useTerms } from '@/lib/school/timetable-queries';
import { pickTerm, weekDays } from '@/lib/school/timetable-week';
import type { Class, Slot, Term } from '@/lib/school/types';
import { toast } from '@/lib/toast';

import { AddLessonCard, RoomsCard, TermsCard } from './TimetableForms';

/** One day's lessons; removing asks for a second tap so a slip doesn't delete a lesson. */
function DayCard({ name, lessons }: { name: string; lessons: readonly Slot[] }) {
  const remove = useRemoveLesson();
  const [confirming, setConfirming] = useState<number | null>(null);

  const onRemove = (s: Slot) => {
    if (confirming !== s.id) return setConfirming(s.id);
    remove.mutate(s.id, {
      onSuccess: () => toast(`Removed ${s.class_title} at ${s.start_time}.`),
      onError: (e) => toast(e.message),
      onSettled: () => setConfirming(null),
    });
  };

  return (
    <Card title={name} subtitle={countOf(lessons.length, 'lesson')} icon="calendar">
      {lessons.length === 0 ? <Body muted>No lessons.</Body> : null}
      {lessons.map((s) => (
        <Row
          key={s.id}
          title={`${s.start_time}–${s.end_time} · ${s.class_title}`}
          detail={[s.teacher_name, s.room_name].filter(Boolean).join(' · ') || undefined}
          badge={
            <Button
              compact
              variant={confirming === s.id ? 'danger' : 'ghost'}
              label={confirming === s.id ? 'Tap again to remove' : 'Remove'}
              busy={remove.isPending && confirming === s.id}
              onPress={() => onRemove(s)}
            />
          }
        />
      ))}
    </Card>
  );
}

function SchoolTimetable({ school }: { school: SchoolRef }) {
  const terms = useTerms();
  const rooms = useRooms();
  const classes = useClasses();
  const schoolTerms: Term[] = (terms.data ?? []).filter((t) => t.institution === school.id);
  const schoolRooms = (rooms.data ?? []).filter((r) => r.institution === school.id);
  const schoolClasses: Class[] = (classes.data ?? []).filter((c) => c.institution === school.id);
  const [termId, setTermId] = useState<number | null>(null);
  const [classId, setClassId] = useState<number | null>(null);
  const term = schoolTerms.find((t) => t.id === termId) ?? pickTerm(schoolTerms);
  const slots = useSlots(term?.id ?? null, classId);

  if (terms.isPending || rooms.isPending || classes.isPending) return <Loading label="Loading the timetable" />;
  const loadError = terms.error ?? rooms.error ?? classes.error;
  if (loadError) return <ErrorText message={loadError.message} />;

  if (!term) {
    return (
      <Grid min={320}>
        <EmptyState icon="calendar" title="Add your first term" body="Every lesson belongs to a term. Add the current one to start the timetable." />
        <TermsCard school={school.id} terms={schoolTerms} />
      </Grid>
    );
  }

  return (
    <>
      {schoolTerms.length > 1 ? (
        <Segmented label="Term" options={schoolTerms.map((t) => ({ value: String(t.id), label: t.name }))} value={String(term.id)} onChange={(v) => setTermId(Number(v))} />
      ) : null}
      {schoolClasses.length > 0 ? (
        <ChipRow>
          <Chip label="Every class" selected={classId === null} onPress={() => setClassId(null)} />
          {schoolClasses.map((c) => (
            <Chip key={c.id} label={c.title} selected={classId === c.id} onPress={() => setClassId(c.id)} />
          ))}
        </ChipRow>
      ) : null}
      {slots.isPending ? <Loading label="Loading lessons" /> : null}
      <ErrorText message={slots.error?.message} />
      {slots.data ? (
        <Grid min={260}>
          {weekDays(slots.data).map((d) => (
            <DayCard key={d.day} name={d.name} lessons={d.lessons} />
          ))}
        </Grid>
      ) : null}
      <Grid min={320}>
        <AddLessonCard key={`${term.id}-${classId}`} term={term} classes={schoolClasses} rooms={schoolRooms} initialClass={classId} />
        <TermsCard school={school.id} terms={schoolTerms} />
        <RoomsCard school={school.id} rooms={schoolRooms} />
      </Grid>
    </>
  );
}

/** The school timetable on the real API: the week by class, lessons added with clash checks, terms and rooms. */
export function LiveTimetable() {
  const me = useMe();
  const schools = me.data ? leaderSchools(me.data.memberships) : [];
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const school = schools.find((s) => s.id === schoolId) ?? schools[0];

  return (
    <Screen width="wide" title="Timetable" subtitle="The week's lessons for every class. A lesson that clashes with a class, teacher or room is refused.">
      {me.isPending ? <Loading label="Loading your schools" /> : null}
      {me.data && !school ? <EmptyState icon="calendar" title="For school leaders" body="Only your school's leaders can change the timetable. Your own lessons are on your home page." /> : null}
      {schools.length > 1 && school ? (
        <Segmented label="School" options={schools.map((s) => ({ value: String(s.id), label: s.name }))} value={String(school.id)} onChange={(v) => setSchoolId(Number(v))} />
      ) : null}
      {school ? <SchoolTimetable key={school.id} school={school} /> : null}
    </Screen>
  );
}
