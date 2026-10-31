import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Body, Button, Card, ErrorText, Field, Loading, Screen } from '@/components/ui';
import { FORMATIVE_MAX, parseMark, SUMMATIVE_MAX } from '@/lib/reports/marks';
import { useClassMarks, useGenerateReports, useSaveMarks } from '@/lib/reports/queries';
import { useRoster } from '@/lib/school/queries';

type Field2 = 'formative' | 'summative';
type Draft = Record<number, Partial<Record<Field2, string>>>;

/** A teacher enters this term's marks for the class, then prepares report cards. */
export default function MarksScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const classId = Number(id);
  const roster = useRoster(classId);
  const existing = useClassMarks(classId);
  const save = useSaveMarks();
  const generate = useGenerateReports();
  const [draft, setDraft] = useState<Draft>({});
  const [notice, setNotice] = useState<string | null>(null);

  const saved = useMemo(() => new Map((existing.data ?? []).map((m) => [m.student, m])), [existing.data]);

  if (roster.isPending || existing.isPending) {
    return (
      <Screen>
        <Loading label="Loading the class" />
      </Screen>
    );
  }
  if (roster.error || !roster.data) {
    return (
      <Screen back title="Marks unavailable">
        <ErrorText message={roster.error?.message} />
      </Screen>
    );
  }

  const valueOf = (student: number, field: Field2): string => {
    const typed = draft[student]?.[field];
    if (typed !== undefined) return typed;
    const stored = saved.get(student)?.[field === 'formative' ? 'formative_score' : 'summative_score'];
    return stored ? stored.replace(/\.00$/, '') : '';
  };

  const students = roster.data.students;
  const touched = students.filter((s) => valueOf(s.student, 'formative') !== '' || valueOf(s.student, 'summative') !== '');
  const entries = touched.map((s) => ({
    student: s.student,
    formative: parseMark(valueOf(s.student, 'formative'), FORMATIVE_MAX),
    summative: parseMark(valueOf(s.student, 'summative'), SUMMATIVE_MAX),
  }));
  const invalid = entries.some((e) => e.formative === null || e.summative === null);

  const setValue = (student: number, field: Field2, text: string) => {
    setNotice(null);
    setDraft((d) => ({ ...d, [student]: { ...d[student], [field]: text } }));
  };

  async function handleSave() {
    await save.mutateAsync({
      class: classId,
      entries: entries.map((e) => ({
        student: e.student,
        formative_score: String(e.formative),
        summative_score: String(e.summative),
      })),
    });
    setNotice(`Saved marks for ${entries.length} students.`);
  }

  async function handleGenerate() {
    const result = await generate.mutateAsync(classId);
    setNotice(`Prepared ${result.generated} draft report cards. A school leader can publish them.`);
  }

  return (
    <Screen back title={`${roster.data.class.title}: term marks`}>
      <Body muted>Classwork out of 20 plus the end-of-term exam out of 80.</Body>

      <Card title={`Students (${students.length})`}>
        {students.map((s) => (
          <View key={s.student} style={styles.student}>
            <Body>{s.student_name}</Body>
            <View style={styles.pair}>
              <View style={styles.cell}>
                <Field
                  label="Classwork /20"
                  value={valueOf(s.student, 'formative')}
                  onChangeText={(t) => setValue(s.student, 'formative', t)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.cell}>
                <Field
                  label="Exam /80"
                  value={valueOf(s.student, 'summative')}
                  onChangeText={(t) => setValue(s.student, 'summative', t)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}
      </Card>

      {invalid ? <ErrorText message="Classwork must be 0–20 and the exam 0–80, and each student needs both." /> : null}
      <ErrorText message={save.error?.message ?? generate.error?.message} />
      {notice ? <Body>{notice}</Body> : null}
      <Button label="Save marks" onPress={handleSave} disabled={entries.length === 0 || invalid} busy={save.isPending} />
      <Button label="Prepare report cards" variant="secondary" onPress={handleGenerate} busy={generate.isPending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  student: { gap: 8, paddingVertical: 8 },
  pair: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
});
