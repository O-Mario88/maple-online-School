import { useState } from 'react';

import { Choice, Choices, FormLabel, FormMessage, FormRow, Input, PrimaryButton } from '@/features/shared/DesignForm';
import { FormSheet } from '@/features/shared/FormSheet';
import { useCreateClass } from '@/lib/school/queries';
import { useAddTerm } from '@/lib/school/timetable-queries';
import { termProblem } from '@/lib/school/timetable-week';
import type { ClassLevel, SchoolMember } from '@/lib/school/types';
import { toast } from '@/lib/toast';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  school: number;
}

/** Add a term (making it current deactivates the others). */
export function AddTermSheet({ visible, onClose, school }: SheetProps) {
  const add = useAddTerm();
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [current, setCurrent] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const save = () => {
    const p = termProblem(name, start, end);
    if (p) return setProblem(p);
    setProblem(null);
    add.mutate(
      { institution: school, name: name.trim(), start_date: start.trim(), end_date: end.trim(), is_active: current },
      {
        onSuccess: (t) => {
          toast(`${t.name} added.`);
          setName('');
          setStart('');
          setEnd('');
          onClose();
        },
        onError: (e) => setProblem(e.message),
      },
    );
  };

  return (
    <FormSheet visible={visible} title="Create Term" onClose={onClose}>
      <FormRow>
        <Input label="Term name" value={name} onChangeText={setName} placeholder="Term 1 2027" maxLength={100} />
      </FormRow>
      <FormRow>
        <Input label="First day" value={start} onChangeText={setStart} placeholder="2027-02-01" autoCapitalize="none" maxLength={10} />
        <Input label="Last day" value={end} onChangeText={setEnd} placeholder="2027-05-01" autoCapitalize="none" maxLength={10} />
      </FormRow>
      <FormLabel>Status</FormLabel>
      <Choices>
        <Choice label="Upcoming" on={!current} onPress={() => setCurrent(false)} />
        <Choice label="Current term" on={current} onPress={() => setCurrent(true)} />
      </Choices>
      <FormMessage text={problem} />
      <PrimaryButton label="Create Term" busy={add.isPending} onPress={save} />
    </FormSheet>
  );
}

/** Add a grade stream: a class at a level, with its class teacher. */
export function AddGradeSheet({ visible, onClose, school, levels, teachers }: SheetProps & { levels: readonly ClassLevel[]; teachers: readonly SchoolMember[] }) {
  const create = useCreateClass();
  const [title, setTitle] = useState('');
  const [levelId, setLevelId] = useState<number | null>(null);
  const [teacher, setTeacher] = useState<number | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const chosenTeacher = teacher ?? teachers[0]?.user ?? null;

  const save = () => {
    if (!title.trim()) return setProblem('Name the stream, such as S1 Blue.');
    if (levelId === null) return setProblem('Choose the grade level.');
    if (chosenTeacher === null) return setProblem('Invite a teacher first, then choose the class teacher.');
    setProblem(null);
    create.mutate(
      { title: title.trim(), institution: school, class_level: levelId, teacher: chosenTeacher },
      {
        onSuccess: (c) => {
          toast(`${c.title} created. Add its learners from Rosters.`);
          setTitle('');
          onClose();
        },
        onError: (e) => setProblem(e.message),
      },
    );
  };

  return (
    <FormSheet visible={visible} title="Add Grade Stream" onClose={onClose}>
      <FormRow>
        <Input label="Stream name" value={title} onChangeText={setTitle} placeholder="S1 Blue" maxLength={255} />
      </FormRow>
      <FormLabel>Grade level</FormLabel>
      <Choices>
        {levels.map((l) => (
          <Choice key={l.id} label={l.name} on={levelId === l.id} onPress={() => setLevelId(l.id)} />
        ))}
      </Choices>
      <FormLabel>Class teacher</FormLabel>
      <Choices>
        {teachers.map((t) => (
          <Choice key={t.user} label={t.full_name} on={chosenTeacher === t.user} onPress={() => setTeacher(t.user)} />
        ))}
      </Choices>
      <FormMessage text={problem} />
      <PrimaryButton label="Add Grade Stream" busy={create.isPending} onPress={save} />
    </FormSheet>
  );
}
