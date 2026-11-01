import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { TField, TSelect, TToggle } from '@/features/teacher/frame/TeacherInputs';
import { BLUE, BODY, INK, LINE, MUTED, RED } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type { CourseBuilder } from '@/mock/teacher-course';

import type { Builder } from './useCourseBuilder';

/** The selected lesson's settings, with delete (tap twice) and duplicate. */
export function LessonSettingsPanel({ c, b, buttons = true }: { c: CourseBuilder; b: Builder; buttons?: boolean }) {
  const s = b.lessonSettings;
  const [confirm, setConfirm] = useState(false);
  const del = () => {
    if (b.order.length <= 1) return toast('A course needs at least one lesson.');
    if (!confirm) {
      setConfirm(true);
      return toast('Tap Delete Lesson again to delete it.');
    }
    setConfirm(false);
    b.deleteLesson();
  };
  return (
    <View style={styles.settings}>
      <View style={styles.head}>
        <Text style={styles.headTitle} numberOfLines={1} accessibilityRole="header">
          Lesson Settings
        </Text>
        <Pressable style={styles.addBtn} onPress={() => b.addBlock('pdf')} accessibilityRole="button" accessibilityLabel="Add a resource to this lesson">
          <Icon name="plus" size={10} color={BLUE} />
          <Text style={styles.addText}>Add Resource</Text>
        </Pressable>
      </View>
      <View style={styles.fields}>
        <TField label="Lesson Title" value={b.current?.lesson.title ?? ''} onChange={b.renameLesson} />
        <TSelect label="Lesson Type" value={s.type} options={c.settings.types} onChange={(type) => b.updateSettings({ type })} />
        <TField label="Estimated Duration" value={s.duration} onChange={(duration) => b.updateSettings({ duration })} trailing="clock" />
        <TSelect label="Completion Requirement" value={s.completion} options={c.settings.completion} onChange={(completion) => b.updateSettings({ completion })} />
        <View style={styles.toggles}>
          {c.settings.toggles.map((t) => (
            <TToggle key={t.key} label={t.label} icon={t.icon} value={s.toggles[t.key] ?? t.on} onChange={(v) => b.updateSettings({ toggles: { ...s.toggles, [t.key]: v } })} />
          ))}
        </View>
      </View>
      {buttons ? (
        <View style={styles.buttons}>
          <Pressable style={[styles.btn, styles.danger, confirm && styles.dangerOn]} onPress={del} accessibilityRole="button" accessibilityLabel={confirm ? 'Confirm: delete this lesson' : 'Delete lesson'}>
            <Icon name="trash" size={11} color={confirm ? '#FFFFFF' : RED} />
            <Text style={[styles.btnText, styles.dangerText, confirm && styles.dangerTextOn]} numberOfLines={1}>{confirm ? 'Tap to confirm' : 'Delete Lesson'}</Text>
          </Pressable>
          <Pressable style={styles.btn} onPress={b.duplicateLesson} accessibilityRole="button" accessibilityLabel="Duplicate lesson">
            <Icon name="grid" size={11} color={BLUE} />
            <Text style={styles.btnText} numberOfLines={1}>
              Duplicate Lesson
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

/** Downloadable notes for the lesson, edited as plain text. */
export function NotesTab({ c, b }: { c: CourseBuilder; b: Builder }) {
  const [notes, setNotes] = useState<Readonly<Record<string, string>>>({});
  const id = b.current?.lesson.id ?? '';
  const first = c.modules[0].lessons[0].id;
  const value = notes[id] ?? (id === first ? c.notes : '');
  return (
    <View style={styles.tab}>
      <Text style={styles.tabTitle}>Lesson notes</Text>
      <Text style={styles.tabSub}>Learners can read these in the lesson and download them as a PDF.</Text>
      <TextInput style={styles.notes} value={value} onChangeText={(t) => setNotes((prev) => ({ ...prev, [id]: t }))} multiline placeholder="Write the notes for this lesson…" placeholderTextColor={MUTED} accessibilityLabel="Lesson notes" />
    </View>
  );
}

/** The lesson's check questions with their answers. */
export function QuizTab({ c, b }: { c: CourseBuilder; b: Builder }) {
  const first = c.modules[0].lessons[0].id;
  const questions = b.current?.lesson.id === first ? c.quiz : [];
  return (
    <View style={styles.tab}>
      <Text style={styles.tabTitle}>{`Check Your Understanding · ${questions.length} questions`}</Text>
      <Text style={styles.tabSub}>Auto-marked. Learners see the answer and a short explanation after each one.</Text>
      {questions.length === 0 ? <Text style={styles.tabSub}>No questions yet. Add a Quiz Question block from the Content tab.</Text> : null}
      {questions.map((q, i) => (
        <View key={q.q} style={styles.question}>
          <Text style={styles.qNum}>{i + 1}</Text>
          <View style={styles.flex}>
            <Text style={styles.qText}>{q.q}</Text>
            <Text style={styles.qAnswer}>{`Answer: ${q.a}`}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  settings: { padding: 9, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headTitle: { flexShrink: 1, fontSize: 11.5, fontWeight: '700', color: INK, letterSpacing: -0.2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: LINE },
  addText: { fontSize: 8.5, fontWeight: '600', color: BLUE },
  fields: { gap: 8 },
  toggles: { gap: 1, marginTop: 4 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginTop: 30 },
  btn: { height: 26, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 5, borderRadius: 6, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  btnText: { flexShrink: 1, fontSize: 8.5, fontWeight: '600', color: BLUE, letterSpacing: -0.15 },
  danger: { borderColor: '#F3B5B7' },
  dangerOn: { backgroundColor: RED, borderColor: RED },
  dangerText: { color: RED },
  dangerTextOn: { color: '#FFFFFF' },
  tab: { gap: 8 },
  tabTitle: { fontSize: 14, fontWeight: '700', color: INK },
  tabSub: { fontSize: 12, color: BODY },
  notes: { minHeight: 280, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: LINE, fontSize: 13, lineHeight: 20, color: INK, textAlignVertical: 'top' },
  question: { flexDirection: 'row', gap: 10, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  qNum: { width: 22, height: 22, borderRadius: 11, overflow: 'hidden', textAlign: 'center', lineHeight: 22, fontSize: 11, fontWeight: '700', color: '#FFFFFF', backgroundColor: BLUE },
  qText: { fontSize: 12.5, color: INK },
  qAnswer: { marginTop: 3, fontSize: 11.5, color: '#1F8A4C' },
});
