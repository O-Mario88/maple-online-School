import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTeacherGo } from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, GREEN, INK, LINE, Pill, RED, type Tone, toneColor } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type { LevelTone, StudioLevel, StudioNew } from '@/mock/teacher-studio';

const LEVEL_TONE: Readonly<Record<LevelTone, Tone>> = { green: 'green', blue: 'blue', purple: 'purple' };
const LETTERS = ['A', 'B', 'C', 'D'];

function SmallEdit({ label = 'Edit', onPress, a11y }: { label?: string; onPress: () => void; a11y: string }) {
  return (
    <Pressable style={styles.edit} onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y}>
      <Text style={styles.editText}>{label}</Text>
    </Pressable>
  );
}

/** The course card: cover, title, status, description and counts. */
export function CourseCard({ s, status, levels }: { s: StudioNew; status: string; levels: readonly StudioLevel[] }) {
  const go = useTeacherGo();
  const c = s.course;
  const quizzes = levels.reduce((n, l) => n + l.quizzes, 0);
  return (
    <View>
      <View>
        <Image source={c.cover} style={styles.cover} contentFit="cover" accessibilityLabel="Course cover: maths on a chalkboard" />
        <Pressable style={styles.coverEdit} onPress={() => go('/teach/course-editor')} accessibilityRole="button" accessibilityLabel="Edit cover">
          <Text style={styles.coverEditText}>Edit Cover</Text>
        </Pressable>
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.courseTitle}>{c.title}</Text>
        <Pill label={status} tone={status === 'Draft' ? 'purple' : 'amber'} />
      </View>
      <Text style={styles.desc}>{c.description}</Text>
      <View style={styles.counts}>
        <Count icon="play" text={`${c.lessons} lessons`} />
        <Count icon="clock" text={`${quizzes} quizzes`} />
        <Count icon="columns" text={`${levels.length} levels`} />
      </View>
      <View style={styles.counts}>
        <Count icon="notes" text={c.board} />
        <Count icon="link" text={c.subject} />
      </View>
    </View>
  );
}

function Count({ icon, text }: { icon: 'play' | 'clock' | 'columns' | 'notes' | 'link'; text: string }) {
  return (
    <View style={styles.count}>
      <Icon name={icon} size={14} color={BODY} />
      <Text style={styles.countText}>{text}</Text>
    </View>
  );
}

/** Learning objectives, editable in place. */
export function Objectives({ s }: { s: StudioNew }) {
  const [items, setItems] = useState<readonly string[]>(s.objectives);
  const [editing, setEditing] = useState(false);
  const change = (i: number, text: string) => setItems((prev) => prev.map((x, j) => (j === i ? text : x)));
  const finish = () => {
    setItems((prev) => prev.filter((x) => x.trim().length > 0));
    setEditing(false);
  };
  return (
    <View style={styles.box}>
      <View style={styles.boxHead}>
        <Text style={styles.boxTitle}>Learning Objectives</Text>
        <SmallEdit label={editing ? 'Done' : 'Edit'} onPress={editing ? finish : () => setEditing(true)} a11y={editing ? 'Finish editing objectives' : 'Edit learning objectives'} />
      </View>
      {items.map((o, i) => (
        <View key={i} style={styles.objective}>
          <View style={styles.tick}>
            <Icon name="check" size={10} color="#FFFFFF" />
          </View>
          {editing ? (
            <TextInput style={styles.objectiveInput} value={o} onChangeText={(t) => change(i, t)} accessibilityLabel={`Objective ${i + 1}`} />
          ) : (
            <Text style={styles.objectiveText}>{o}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

/** The three levels, each folding open to its lessons, with "Add Topic". */
export function LevelList({ levels, setLevels }: { levels: readonly StudioLevel[]; setLevels: (next: StudioLevel[]) => void }) {
  const go = useTeacherGo();
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set([0, 1, 2]));
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const addTopic = () => {
    const at = levels.length - 1;
    setLevels(levels.map((l, i) => (i === at ? { ...l, lessons: l.lessons + 1, items: [...l.items, { title: 'New topic', kind: 'Video + Quiz', minutes: 30 }] } : l)));
    setOpen((prev) => new Set(prev).add(at));
    toast(`New topic added to ${levels[at].name}. Open the course builder to fill it in.`);
  };
  return (
    <View>
      <View style={styles.boxHead}>
        <Text style={styles.structTitle}>{`Course Structure (${levels.length} Levels)`}</Text>
        <SmallEdit label="Add Topic" onPress={addTopic} a11y="Add a topic" />
      </View>
      {levels.map((l, i) => {
        const tone = LEVEL_TONE[l.tone];
        const isOpen = open.has(i);
        return (
          <View key={l.name} style={styles.level}>
            <Pressable style={styles.levelHead} onPress={() => toggle(i)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} accessibilityLabel={`${l.name}, ${l.tag}, ${l.lessons} lessons, ${l.quizzes} quizzes`}>
              <View style={[styles.levelIcon, { backgroundColor: toneColor(tone) }]}>
                <Icon name="columns" size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.levelName} numberOfLines={1}>{l.name}</Text>
              <Pill label={l.tag} tone={tone} small />
              <Text style={styles.levelMeta} numberOfLines={1}>{`${l.lessons} lessons • ${l.quizzes} quizzes`}</Text>
              <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} size={15} color={BODY} />
            </Pressable>
            {isOpen
              ? l.items.map((it, j) => (
                  <View key={`${it.title}-${j}`} style={styles.lesson}>
                    <View style={styles.num}>
                      <Text style={styles.numText}>{j + 1}</Text>
                    </View>
                    <Text style={styles.lessonTitle} numberOfLines={1}>
                      {it.title}
                    </Text>
                    <Text style={styles.kind}>{it.kind}</Text>
                    <Text style={styles.mins}>{`${it.minutes} min`}</Text>
                    <Pressable onPress={() => go('/teach/course-editor')} accessibilityRole="button" accessibilityLabel={`Edit ${it.title}`} hitSlop={8}>
                      <Icon name="more" size={15} color={BODY} />
                    </Pressable>
                  </View>
                ))
              : null}
          </View>
        );
      })}
    </View>
  );
}

/** The sample lesson preview and a sample quiz question to try. */
export function Samples({ s }: { s: StudioNew }) {
  const go = useTeacherGo();
  const q = s.quiz;
  const [chosen, setChosen] = useState<number>(q.answer);
  return (
    <View style={styles.samples}>
      <View style={styles.box}>
        <View style={styles.boxHead}>
          <Text style={styles.boxTitle} numberOfLines={1}>Sample Lesson Preview</Text>
          <SmallEdit onPress={() => go('/teach/course-editor')} a11y="Edit the sample lesson" />
        </View>
        <Pressable onPress={() => go('/learn/lesson')} accessibilityRole="button" accessibilityLabel={`Preview ${s.lesson.title} as a learner, ${s.lesson.length}`}>
          <Image source={s.lesson.video} style={styles.video} contentFit="cover" />
        </Pressable>
      </View>
      <View style={styles.box}>
        <View style={styles.boxHead}>
          <Text style={styles.boxTitle} numberOfLines={1}>Sample Quiz Question</Text>
          <SmallEdit onPress={() => go('/teach/course-editor')} a11y="Edit the sample question" />
        </View>
        <View style={styles.quizTags}>
          <Pill label={q.kind} tone="purple" />
          <Pill label={q.marks} tone="amber" />
        </View>
        <Text style={styles.question}>{q.question}</Text>
        {q.options.map((o, i) => {
          const on = i === chosen;
          const right = on && i === q.answer;
          const wrong = on && i !== q.answer;
          return (
            <Pressable key={o} style={[styles.option, right && styles.optionRight, wrong && styles.optionWrong]} onPress={() => setChosen(i)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${LETTERS[i]}: ${o}${right ? ', correct' : wrong ? ', not correct' : ''}`}>
              <View style={[styles.letter, right && styles.letterRight, wrong && styles.letterWrong]}>
                <Text style={[styles.letterText, (right || wrong) && styles.letterTextOn]}>{LETTERS[i]}</Text>
              </View>
              <Text style={styles.optionText}>{o}</Text>
              {right ? <Icon name="check" size={15} color={GREEN} /> : null}
              {wrong ? <Icon name="close" size={14} color={RED} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  edit: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: LINE },
  editText: { fontSize: 11.5, fontWeight: '600', color: BLUE },
  cover: { width: '100%', height: 92, borderRadius: 8 },
  coverEdit: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, backgroundColor: '#FFFFFF' },
  coverEditText: { fontSize: 11, fontWeight: '600', color: INK },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  courseTitle: { flexShrink: 1, fontSize: 17, fontWeight: '800', color: INK },
  desc: { fontSize: 11.5, lineHeight: 16, color: BODY, marginTop: 6 },
  counts: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 10 },
  count: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  countText: { fontSize: 11.5, color: BODY },
  box: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  boxHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  boxTitle: { flexShrink: 1, fontSize: 12.5, fontWeight: '700', color: INK },
  structTitle: { fontSize: 15, fontWeight: '700', color: INK },
  objective: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  tick: { width: 15, height: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: GREEN },
  objectiveText: { flex: 1, fontSize: 11, color: INK },
  objectiveInput: { flex: 1, height: 28, paddingHorizontal: 6, borderRadius: 6, borderWidth: 1, borderColor: LINE, fontSize: 12, color: INK },
  level: { marginTop: 8, borderRadius: 10, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  levelHead: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#F7FAFE' },
  levelIcon: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  levelName: { fontSize: 11, fontWeight: '700', color: INK },
  levelMeta: { flex: 1, fontSize: 9, color: BODY, textAlign: 'right', letterSpacing: -0.1 },
  kind: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5, overflow: 'hidden', fontSize: 8.5, fontWeight: '600', color: BLUE, backgroundColor: '#E8F0FE' },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 4, borderTopWidth: 1, borderColor: '#EEF2F8' },
  num: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#EEF1F6' },
  numText: { fontSize: 10.5, fontWeight: '600', color: BODY },
  lessonTitle: { flex: 1, fontSize: 10.5, color: INK },
  mins: { width: 40, fontSize: 10, color: BODY, textAlign: 'right' },
  samples: { gap: 10 },
  video: { width: '100%', aspectRatio: 199 / 129, borderRadius: 8 },
  quizTags: { flexDirection: 'row', gap: 6 },
  question: { fontSize: 11.5, color: INK, marginVertical: 6 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, borderWidth: 1, borderColor: LINE },
  optionRight: { borderColor: GREEN, backgroundColor: '#E9F7EF' },
  optionWrong: { borderColor: RED, backgroundColor: '#FDECEC' },
  letter: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: LINE },
  letterRight: { backgroundColor: GREEN, borderColor: GREEN },
  letterWrong: { backgroundColor: RED, borderColor: RED },
  letterText: { fontSize: 10.5, fontWeight: '700', color: BODY },
  letterTextOn: { color: '#FFFFFF' },
  optionText: { flex: 1, fontSize: 12, color: INK },
});
