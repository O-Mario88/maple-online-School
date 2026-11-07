import { useState } from 'react';

import { Body, Button, Card, Chip, ChipRow, ErrorText, Field, Overline, Row } from '@/components/ui';
import { useAddLesson, useAddRoom, useAddTerm } from '@/lib/school/timetable-queries';
import { DAY_NAMES, lessonTimeProblem, normalizeTime, termProblem } from '@/lib/school/timetable-week';
import type { Class, Room, Term } from '@/lib/school/types';
import { toast } from '@/lib/toast';

const MAX_ROOM_CAPACITY = 5000;
const LESSON_DAYS = DAY_NAMES.slice(0, 6);

interface AddLessonProps {
  term: Term;
  classes: readonly Class[];
  rooms: readonly Room[];
  initialClass: number | null;
}

/** Add one lesson to the term's timetable; the API refuses clashes and the reason shows here. */
export function AddLessonCard({ term, classes, rooms, initialClass }: AddLessonProps) {
  const add = useAddLesson();
  const [classId, setClassId] = useState<number | null>(initialClass ?? classes[0]?.id ?? null);
  const [day, setDay] = useState(0);
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('08:40');
  const [room, setRoom] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  if (classes.length === 0) {
    return (
      <Card title="Add a lesson" icon="plus">
        <Body muted>Create a class first, then place its lessons here.</Body>
      </Card>
    );
  }

  const save = () => {
    const timeProblem = lessonTimeProblem(start, end);
    if (classId === null) return setProblem('Choose a class.');
    if (timeProblem) return setProblem(timeProblem);
    setProblem(null);
    const body = { class: classId, term: term.id, day_of_week: day, start_time: normalizeTime(start) ?? start, end_time: normalizeTime(end) ?? end };
    add.mutate(room === null ? body : { ...body, room }, {
      onSuccess: (s) => toast(`${s.class_title} added on ${DAY_NAMES[s.day_of_week]} at ${s.start_time}.`),
      onError: (e) => setProblem(e.message),
    });
  };

  return (
    <Card title="Add a lesson" subtitle={`To ${term.name}. Clashes with a class, teacher or room are refused.`} icon="plus">
      <Overline>Class</Overline>
      <ChipRow>
        {classes.map((c) => (
          <Chip key={c.id} label={c.title} selected={classId === c.id} onPress={() => setClassId(c.id)} />
        ))}
      </ChipRow>
      <Overline>Day</Overline>
      <ChipRow>
        {LESSON_DAYS.map((name, i) => (
          <Chip key={name} label={name} selected={day === i} onPress={() => setDay(i)} />
        ))}
      </ChipRow>
      <Field label="Starts" value={start} onChangeText={setStart} placeholder="08:00" autoCapitalize="none" maxLength={5} />
      <Field label="Ends" value={end} onChangeText={setEnd} placeholder="08:40" autoCapitalize="none" maxLength={5} />
      {rooms.length > 0 ? (
        <>
          <Overline>Room</Overline>
          <ChipRow>
            <Chip label="No room" selected={room === null} onPress={() => setRoom(null)} />
            {rooms.map((r) => (
              <Chip key={r.id} label={r.name} selected={room === r.id} onPress={() => setRoom(r.id)} />
            ))}
          </ChipRow>
        </>
      ) : null}
      <ErrorText message={problem} />
      <Button label="Add lesson" icon="plus" onPress={save} busy={add.isPending} />
    </Card>
  );
}

/** The school's terms, and a form to add one. */
export function TermsCard({ school, terms }: { school: number; terms: readonly Term[] }) {
  const add = useAddTerm();
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [active, setActive] = useState(terms.length === 0);
  const [problem, setProblem] = useState<string | null>(null);

  const save = () => {
    const p = termProblem(name, start, end);
    if (p) return setProblem(p);
    setProblem(null);
    add.mutate(
      { institution: school, name: name.trim(), start_date: start.trim(), end_date: end.trim(), is_active: active },
      {
        onSuccess: (t) => {
          toast(`${t.name} added.`);
          setName('');
          setStart('');
          setEnd('');
        },
        onError: (e) => setProblem(e.message),
      },
    );
  };

  return (
    <Card title="Terms" subtitle="Lessons, registers and report cards belong to a term" icon="calendar">
      {terms.map((t) => (
        <Row key={t.id} title={t.name} detail={`${t.start_date} to ${t.end_date}${t.is_active ? ' · current term' : ''}`} />
      ))}
      <Field label="New term name" value={name} onChangeText={setName} placeholder="Term 1 2027" maxLength={100} />
      <Field label="First day" value={start} onChangeText={setStart} placeholder="2027-02-01" autoCapitalize="none" maxLength={10} />
      <Field label="Last day" value={end} onChangeText={setEnd} placeholder="2027-05-01" autoCapitalize="none" maxLength={10} />
      <ChipRow>
        <Chip label="Make it the current term" selected={active} onPress={() => setActive(!active)} />
      </ChipRow>
      <ErrorText message={problem} />
      <Button label="Add term" variant="secondary" onPress={save} busy={add.isPending} />
    </Card>
  );
}

/** The school's rooms, and a form to add one. */
export function RoomsCard({ school, rooms }: { school: number; rooms: readonly Room[] }) {
  const add = useAddRoom();
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [problem, setProblem] = useState<string | null>(null);

  const save = () => {
    const seats = Number(capacity);
    if (!name.trim()) return setProblem('Give the room a name, such as Lab 1.');
    if (!Number.isInteger(seats) || seats < 1 || seats > MAX_ROOM_CAPACITY) return setProblem('Seats must be a whole number from 1 to 5,000.');
    setProblem(null);
    add.mutate(
      { institution: school, name: name.trim(), capacity: seats },
      {
        onSuccess: (r) => {
          toast(`${r.name} added.`);
          setName('');
          setCapacity('');
        },
        onError: (e) => setProblem(e.message),
      },
    );
  };

  return (
    <Card title="Rooms" subtitle="Two lessons can't share a room at the same time" icon="school">
      {rooms.map((r) => (
        <Row key={r.id} title={r.name} detail={`${r.capacity} seats`} />
      ))}
      <Field label="New room name" value={name} onChangeText={setName} placeholder="Lab 1" maxLength={100} />
      <Field label="Seats" value={capacity} onChangeText={setCapacity} placeholder="40" keyboardType="number-pad" maxLength={4} />
      <ErrorText message={problem} />
      <Button label="Add room" variant="secondary" onPress={save} busy={add.isPending} />
    </Card>
  );
}
