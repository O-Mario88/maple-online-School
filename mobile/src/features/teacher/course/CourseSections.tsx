import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTeacherGo } from '@/features/teacher/frame/TeacherFrame';
import { TField } from '@/features/teacher/frame/TeacherInputs';
import { BLUE, BODY, GREEN, INK, IconTile, LINE, MUTED, TButton } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type { CourseBuilder } from '@/mock/teacher-course';

import type { Builder } from './useCourseBuilder';

/** Rows of choices where one is picked, as pricing and completion use. */
function Choices({ groups }: { groups: readonly { label: string; options: readonly string[] }[] }) {
  const [picked, setPicked] = useState<readonly number[]>(groups.map(() => 0));
  return (
    <View style={styles.groups}>
      {groups.map((g, row) => (
        <View key={g.label} style={styles.group}>
          <Text style={styles.groupLabel}>{g.label}</Text>
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={g.label}>
            {g.options.map((o, i) => {
              const on = picked[row] === i;
              return (
                <Pressable key={o} style={[styles.chip, on && styles.chipOn]} onPress={() => setPicked((prev) => prev.map((v, j) => (j === row ? i : v)))} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{o}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function Setup({ c }: { c: CourseBuilder }) {
  const [form, setForm] = useState({ title: c.course.title, description: c.course.description, board: c.course.board, subject: c.course.subject });
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <View style={styles.setup}>
      <View style={styles.cover}>
        <Image source={c.course.thumb} style={styles.coverImg} contentFit="cover" accessibilityLabel="Course cover" />
        <TButton small label="Change cover" icon="gallery" variant="outline" onPress={() => toast('Pick a JPG or PNG, at least 1280 × 720.')} />
      </View>
      <View style={styles.form}>
        <TField label="Course title" value={form.title} onChange={set('title')} />
        <TField label="Short description" value={form.description} onChange={set('description')} />
        <TField label="Curriculum" value={form.board} onChange={set('board')} />
        <TField label="Subject" value={form.subject} onChange={set('subject')} />
        <TButton small label="Save setup" onPress={() => toast('Course setup saved.')} style={styles.save} />
      </View>
    </View>
  );
}

function Objectives({ c }: { c: CourseBuilder }) {
  const [items, setItems] = useState<readonly string[]>(c.sections.objectives);
  const [draft, setDraft] = useState('');
  const add = () => {
    if (!draft.trim()) return;
    setItems((prev) => [...prev, draft.trim()]);
    setDraft('');
  };
  return (
    <View style={styles.list}>
      {items.map((o, i) => (
        <View key={`${o}-${i}`} style={styles.line}>
          <Icon name="check" size={14} color={GREEN} />
          <Text style={styles.lineText}>{o}</Text>
          <Pressable onPress={() => setItems((prev) => prev.filter((_, j) => j !== i))} accessibilityRole="button" accessibilityLabel={`Remove objective: ${o}`} hitSlop={8}>
            <Icon name="close" size={13} color={MUTED} />
          </Pressable>
        </View>
      ))}
      <View style={styles.addRow}>
        <TextInput style={styles.input} value={draft} onChangeText={setDraft} onSubmitEditing={add} placeholder="Learners will be able to…" placeholderTextColor={MUTED} accessibilityLabel="New objective" />
        <TButton small label="Add" icon="plus" onPress={add} />
      </View>
    </View>
  );
}

function Quizzes({ b }: { b: Builder }) {
  return (
    <View style={styles.list}>
      {b.modules.map((m, mi) => (
        <View key={m.id} style={styles.group}>
          <Text style={styles.groupLabel}>{`Module ${mi + 1}: ${m.title}`}</Text>
          {m.lessons
            .filter((l) => l.kind === 'quiz')
            .map((l) => (
              <Pressable key={l.id} style={styles.line} onPress={() => { b.select(l.id); b.setTab('quiz'); }} accessibilityRole="button" accessibilityLabel={`Open ${l.title}`}>
                <IconTile icon="clipboard" color="#F0A000" size={26} soft />
                <Text style={styles.lineText}>{l.title}</Text>
                <Text style={styles.lineMeta}>10 questions · pass at 60%</Text>
                <Icon name="chevronRight" size={14} color={BODY} />
              </Pressable>
            ))}
          <Text style={styles.lineMeta}>{`Plus a 5-question check in each of the ${m.lessons.filter((l) => l.kind === 'lesson').length} lessons.`}</Text>
        </View>
      ))}
    </View>
  );
}

function Resources({ c }: { c: CourseBuilder }) {
  return (
    <View style={styles.list}>
      {c.sections.resources.map((r) => (
        <View key={r.title} style={styles.line}>
          <IconTile icon={r.icon} color={BLUE} size={28} soft />
          <View style={styles.flex}>
            <Text style={styles.lineText}>{r.title}</Text>
            <Text style={styles.lineMeta}>{r.detail}</Text>
          </View>
          <Icon name="download" size={14} color={BODY} />
        </View>
      ))}
      <TButton small label="Upload a file" icon="upload" variant="outline" onPress={() => toast('Choose a PDF, Word or PowerPoint file, up to 50 MB.')} style={styles.save} />
    </View>
  );
}

function Publish({ c, b }: { c: CourseBuilder; b: Builder }) {
  const go = useTeacherGo();
  return (
    <View style={styles.list}>
      {c.sections.checks.map((k) => (
        <View key={k.label} style={styles.line}>
          <Icon name={k.done ? 'check' : 'alert'} size={15} color={k.done ? GREEN : '#C25E00'} />
          <Text style={styles.lineText}>{k.label}</Text>
        </View>
      ))}
      <View style={styles.addRow}>
        <TButton small label="Preview Course" icon="eye" variant="outline" onPress={() => go(c.preview)} />
        <TButton small label={b.status === 'Draft' ? 'Publish Course' : 'Sent for review'} icon="arrowRight" iconRight onPress={b.publish} />
      </View>
    </View>
  );
}

const TITLES: Readonly<Record<string, { title: string; sub: string }>> = {
  setup: { title: 'Course Setup', sub: 'The basics learners see first: title, description, curriculum and cover.' },
  objectives: { title: 'Learning Objectives', sub: 'What learners will be able to do by the end of the course.' },
  quizzes: { title: 'Quizzes & Assessments', sub: 'Module quizzes and the quick checks inside each lesson.' },
  resources: { title: 'Resources & Downloads', sub: 'Files learners can download. Each is linked to a lesson or module.' },
  pricing: { title: 'Pricing & Access', sub: 'What the course costs and who can enrol.' },
  completion: { title: 'Completion Settings', sub: 'When a lesson, a module and the whole course count as finished.' },
  publish: { title: 'Preview & Publish', sub: 'Check everything, preview as a learner, then publish.' },
};

/** Every builder section other than Content Builder, picked from the sidebar. */
export function CourseSection({ c, b }: { c: CourseBuilder; b: Builder }) {
  const t = TITLES[b.section];
  if (!t) return null;
  return (
    <View>
      <Text style={styles.title} accessibilityRole="header">
        {t.title}
      </Text>
      <Text style={styles.sub}>{t.sub}</Text>
      {b.section === 'setup' ? <Setup c={c} /> : null}
      {b.section === 'objectives' ? <Objectives c={c} /> : null}
      {b.section === 'quizzes' ? <Quizzes b={b} /> : null}
      {b.section === 'resources' ? <Resources c={c} /> : null}
      {b.section === 'pricing' ? <Choices groups={c.sections.pricing} /> : null}
      {b.section === 'completion' ? <Choices groups={c.sections.completion} /> : null}
      {b.section === 'publish' ? <Publish c={c} b={b} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { fontSize: 17, fontWeight: '700', color: INK },
  sub: { marginTop: 4, marginBottom: 18, fontSize: 12.5, color: BODY },
  groups: { gap: 18 },
  group: { gap: 8 },
  groupLabel: { fontSize: 13, fontWeight: '700', color: INK },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  chipOn: { borderColor: BLUE, backgroundColor: '#EEF4FF' },
  chipText: { fontSize: 12.5, color: INK },
  chipTextOn: { color: BLUE, fontWeight: '600' },
  setup: { flexDirection: 'row', gap: 24 },
  cover: { width: 220, gap: 10 },
  coverImg: { width: 220, height: 124, borderRadius: 8 },
  form: { flex: 1, gap: 12, maxWidth: 460 },
  save: { alignSelf: 'flex-start', marginTop: 6 },
  list: { gap: 10 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  lineText: { flex: 1, fontSize: 12.5, color: INK },
  lineMeta: { fontSize: 11.5, color: MUTED },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  input: { flex: 1, height: 34, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE, fontSize: 12.5, color: INK },
});
