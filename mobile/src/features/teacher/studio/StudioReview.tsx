import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BLUE, BODY, INK, IconTile, LINE, MUTED, Pill, StepBadge, TButton } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type { StudioLevel, StudioNew } from '@/mock/teacher-studio';

import type { StudioRun } from './StudioInput';
import { CourseCard, LevelList, Objectives, Samples } from './StudioStructure';

export type ReviewTab = 'structure' | 'quizzes' | 'tags' | 'resources' | 'settings';

/** Shared course state: the editable levels and the publishing status. */
export function useCourseDraft(s: StudioNew) {
  const [levels, setLevels] = useState<StudioLevel[]>(s.levels);
  const [status, setStatus] = useState(s.course.status);
  const saveDraft = () => {
    setStatus('Draft');
    toast('Saved to your drafts. Nothing is visible to learners yet.');
  };
  const publish = () => {
    setStatus('In review');
    toast('Sent for a quick quality check. It goes live once approved.');
  };
  return { levels, setLevels, status, saveDraft, publish };
}

export type CourseDraft = ReturnType<typeof useCourseDraft>;

function QuizzesTab({ levels }: { levels: readonly StudioLevel[] }) {
  return (
    <View style={styles.tabBody}>
      {levels.map((l) => (
        <View key={l.name} style={styles.group}>
          <Text style={styles.groupTitle}>{`${l.name} · ${l.quizzes} quizzes`}</Text>
          {l.items.map((it) => (
            <View key={it.title} style={styles.line}>
              <IconTile icon="clipboard" color={BLUE} size={26} soft />
              <Text style={styles.lineTitle}>{`Quiz: ${it.title}`}</Text>
              <Text style={styles.lineMeta}>5 questions · auto-marked</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function TagsTab({ s }: { s: StudioNew }) {
  return (
    <View style={styles.tabBody}>
      {[1, 2, 3].map((lvl) => (
        <View key={lvl} style={styles.group}>
          <Text style={styles.groupTitle}>{s.levels[lvl - 1].name}</Text>
          <View style={styles.chips}>
            {s.competencies
              .filter((c) => c.level === lvl)
              .map((c) => (
                <View key={c.code} style={styles.chip}>
                  <Text style={styles.chipCode}>{c.code}</Text>
                  <Text style={styles.chipText}>{c.name}</Text>
                </View>
              ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function ResourcesTab({ s }: { s: StudioNew }) {
  return (
    <View style={styles.tabBody}>
      {s.resources.map((r) => (
        <View key={r.title} style={styles.line}>
          <IconTile icon={r.icon} color={BLUE} size={30} soft />
          <View style={styles.flex}>
            <Text style={styles.lineTitle}>{r.title}</Text>
            <Text style={styles.lineMeta}>{r.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function SettingsTab({ s }: { s: StudioNew }) {
  const [picked, setPicked] = useState<readonly number[]>(s.settings.map(() => 0));
  const choose = (row: number, opt: number) => setPicked((prev) => prev.map((v, i) => (i === row ? opt : v)));
  return (
    <View style={styles.tabBody}>
      {s.settings.map((set, row) => (
        <View key={set.label} style={styles.group}>
          <Text style={styles.groupTitle}>{set.label}</Text>
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={set.label}>
            {set.options.map((o, opt) => {
              const on = picked[row] === opt;
              return (
                <Pressable key={o} style={[styles.option, on && styles.optionOn]} onPress={() => choose(row, opt)} accessibilityRole="radio" accessibilityState={{ checked: on }}>
                  <Text style={[styles.optionText, on && styles.optionTextOn]}>{o}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Step 3: review what the AI built, then regenerate, save or publish. */
export function ReviewCourse({ s, run, draft, tab, setTab }: { s: StudioNew; run: StudioRun; draft: CourseDraft; tab: ReviewTab; setTab: (t: ReviewTab) => void }) {
  const quizzes = draft.levels.reduce((n, l) => n + l.quizzes, 0);
  const tabs: readonly { key: ReviewTab; label: string }[] = [
    { key: 'structure', label: 'Course Structure' },
    { key: 'quizzes', label: `Quizzes (${quizzes})` },
    { key: 'tags', label: 'Competency Tags' },
    { key: 'resources', label: 'Resources' },
    { key: 'settings', label: 'Settings' },
  ];
  return (
    <View>
      <View style={styles.head}>
        <StepBadge n={3} size={32} />
        <View style={styles.flex}>
          <Text style={styles.title} accessibilityRole="header">
            Review & Customize Your Course
          </Text>
          <Text style={styles.sub}>{run.running ? 'Your course appears here as soon as AI processing finishes.' : 'Your course has been generated. You can edit the content, quizzes, and settings before publishing.'}</Text>
        </View>
        <TButton small label="Regenerate" icon="redo" variant="outline" onPress={() => run.start(run.source)} />
        <TButton small label="Save as Draft" variant="outline" onPress={draft.saveDraft} />
        <TButton small label={draft.status === 'Draft' ? 'Publish Course' : 'Sent for review'} icon="arrowRight" iconRight onPress={draft.publish} />
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {tabs.map((t) => {
          const on = t.key === tab;
          return (
            <Pressable key={t.key} style={[styles.tab, on && styles.tabOn]} onPress={() => setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={run.running ? styles.dim : null} pointerEvents={run.running ? 'none' : 'auto'}>
        {tab === 'structure' ? (
          <View style={styles.cols}>
            <View style={styles.colLeft}>
              <View style={styles.box}>
                <CourseCard s={s} status={draft.status} levels={draft.levels} />
              </View>
              <Objectives s={s} />
            </View>
            <View style={styles.flex}>
              <LevelList levels={draft.levels} setLevels={draft.setLevels} />
            </View>
            <View style={styles.colRight}>
              <Samples s={s} />
            </View>
          </View>
        ) : null}
        {tab === 'quizzes' ? <QuizzesTab levels={draft.levels} /> : null}
        {tab === 'tags' ? <TagsTab s={s} /> : null}
        {tab === 'resources' ? <ResourcesTab s={s} /> : null}
        {tab === 'settings' ? <SettingsTab s={s} /> : null}
      </View>
    </View>
  );
}

/** Step 3 on phones: the course card with Edit and Publish. */
export function PhoneReview({ s, draft, onEdit }: { s: StudioNew; draft: CourseDraft; onEdit: () => void }) {
  const c = s.course;
  const quizzes = draft.levels.reduce((n, l) => n + l.quizzes, 0);
  return (
    <View>
      <View style={styles.phoneHead}>
        <StepBadge n={3} size={26} />
        <Text style={styles.phoneTitle}>Review & Customize</Text>
      </View>
      <View style={styles.phoneCourse}>
        <Image source={c.cover} style={styles.phoneThumb} contentFit="cover" contentPosition="left" accessibilityLabel="Course cover" />
        <View style={styles.flex}>
          <View style={styles.phoneTitleRow}>
            <Text style={styles.phoneCourseTitle}>{c.title}</Text>
            <Pill label={draft.status} tone={draft.status === 'Draft' ? 'purple' : 'amber'} />
          </View>
          <Text style={styles.phoneMeta}>{`${c.lessons} lessons • ${quizzes} quizzes • ${draft.levels.length} levels`}</Text>
          <View style={styles.phoneBtns}>
            <TButton label="Edit" variant="outline" onPress={onEdit} style={styles.flex} />
            <TButton label={draft.status === 'Draft' ? 'Publish Course' : 'Sent'} onPress={draft.publish} style={styles.publish} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 17, fontWeight: '700', color: INK },
  sub: { fontSize: 10.5, color: BODY, marginTop: 2 },
  tabs: { flexDirection: 'row', marginTop: 12, marginBottom: 12, borderBottomWidth: 1, borderColor: LINE },
  tab: { paddingHorizontal: 18, paddingVertical: 6, borderBottomWidth: 2.5, borderColor: 'transparent' },
  tabOn: { borderColor: BLUE, backgroundColor: '#EEF4FF' },
  tabText: { fontSize: 12, color: INK },
  tabTextOn: { color: BLUE, fontWeight: '600' },
  dim: { opacity: 0.35 },
  cols: { flexDirection: 'row', gap: 14 },
  colLeft: { width: 300, gap: 12 },
  colRight: { width: 220 },
  box: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  tabBody: { gap: 14, minHeight: 380 },
  group: { gap: 6 },
  groupTitle: { fontSize: 13.5, fontWeight: '700', color: INK },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderColor: '#EEF2F8' },
  lineTitle: { flex: 1, fontSize: 12.5, color: INK },
  lineMeta: { fontSize: 11.5, color: MUTED },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#EEF4FF' },
  chipCode: { fontSize: 11, fontWeight: '700', color: BLUE },
  chipText: { fontSize: 12, color: INK },
  option: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  optionOn: { borderColor: BLUE, backgroundColor: '#EEF4FF' },
  optionText: { fontSize: 12.5, color: INK },
  optionTextOn: { color: BLUE, fontWeight: '600' },
  phoneHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phoneTitle: { fontSize: 15, fontWeight: '700', color: INK },
  phoneCourse: { flexDirection: 'row', gap: 12, marginTop: 12 },
  phoneThumb: { width: 70, height: 70, borderRadius: 8 },
  phoneTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  phoneCourseTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: INK },
  phoneMeta: { fontSize: 11.5, color: BODY, marginTop: 3 },
  phoneBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  publish: { flex: 1.6 },
});
