import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';

import { BLUE, BODY, GREEN, INK, letter, MATH, RED } from './ExamParts';
import type { ExamState, Question } from './useExam';

const TABS = ['Explanation', 'Marking Scheme', 'Related Topic'] as const;
type Tab = (typeof TABS)[number];

function Steps({ q, phone }: { q: Question; phone: boolean }) {
  return (
    <>
      <Text style={styles.heading}>Step-by-step solution</Text>
      <View style={[styles.steps, phone && styles.stepsP]}>
        {q.steps.map((st, i) => (
          <View key={st.label + st.math} style={styles.step}>
            <View style={styles.num}>
              <Text style={styles.numText}>{i + 1}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.stepLabel}>{st.label}</Text>
              <Text style={[styles.math, phone && styles.mathP]}>{st.math}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

/** The official scheme's line for the question, set against the learner's own answer. */
function Scheme({ q, s }: { q: Question; s: ExamState }) {
  const chosen = s.sheet.answers[q.n];
  const verdict = chosen == null ? null : chosen === q.answer;
  return (
    <>
      <Text style={styles.heading}>Official UNEB marking scheme</Text>
      <View style={styles.table}>
        <View style={[styles.tr, styles.th]}>
          <Text style={[styles.td, styles.tdQ, styles.thText]}>Qn</Text>
          <Text style={[styles.td, styles.flex, styles.thText]}>Expected answer</Text>
          <Text style={[styles.td, styles.tdM, styles.thText]}>Mark</Text>
        </View>
        <View style={styles.tr}>
          <Text style={[styles.td, styles.tdQ]}>{q.n}</Text>
          <Text style={[styles.td, styles.flex, styles.tdMath]}>{q.scheme.answer}</Text>
          <Text style={[styles.td, styles.tdM, styles.award]}>{`${q.scheme.award} (1)`}</Text>
        </View>
      </View>
      {q.scheme.notes.map((n) => (
        <Text key={n} style={styles.note}>{`•  ${n}`}</Text>
      ))}
      <View style={[styles.compare, verdict === true && styles.compareGood, verdict === false && styles.compareBad]}>
        <Text style={styles.compareLabel}>Your answer</Text>
        <Text style={styles.compareValue}>{chosen == null ? 'Not answered yet' : `${letter(chosen)}. ${q.options[chosen]}`}</Text>
        {verdict == null ? null : (
          <View style={styles.verdict}>
            <Icon name={verdict ? 'check' : 'close'} size={14} color={verdict ? GREEN : RED} />
            <Text style={[styles.verdictText, { color: verdict ? GREEN : RED }]}>{verdict ? `Matches the scheme • ${q.scheme.award} awarded, 1 / 1` : 'Does not match the scheme • 0 / 1'}</Text>
          </View>
        )}
      </View>
    </>
  );
}

function Topic({ q }: { q: Question }) {
  return (
    <>
      <Text style={styles.heading}>Related topic</Text>
      <View style={styles.topic}>
        <View style={styles.topicIcon}>
          <Icon name="book" size={20} color={BLUE} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.topicTitle}>{q.topic.title}</Text>
          <Text style={styles.topicMeta}>{q.topic.meta}</Text>
        </View>
      </View>
      <Pressable style={styles.topicBtn} onPress={() => router.push('/learn/course')} accessibilityRole="link">
        <Text style={styles.topicBtnText}>Revise this topic</Text>
        <Icon name="arrowRight" size={16} color={BLUE} />
      </Pressable>
    </>
  );
}

/** Explanation, marking scheme and related topic for the open question. */
export function SolutionTabs({ s, phone = false }: { s: ExamState; phone?: boolean }) {
  const [tab, setTab] = useState<Tab>('Explanation');
  return (
    <>
      <View style={[styles.tabs, phone && styles.tabsP]} accessibilityRole="tablist">
        {TABS.map((t) => {
          const on = t === tab;
          return (
            <Pressable key={t} style={styles.tab} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, phone && styles.tabTextP, on && styles.tabOn]}>{t}</Text>
              {on ? <View style={styles.tabLine} /> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.body, phone && styles.bodyP]}>
        {tab === 'Explanation' ? <Steps q={s.q} phone={phone} /> : tab === 'Marking Scheme' ? <Scheme q={s.q} s={s} /> : <Topic q={s.q} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabs: { flexDirection: 'row', gap: 38, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#E3E8F0' },
  tabsP: { gap: 22, paddingHorizontal: 0 },
  tab: { paddingVertical: 10, paddingHorizontal: 2 },
  tabText: { fontSize: 13.5, color: '#3D4656' },
  tabTextP: { fontSize: 12.5 },
  tabOn: { color: BLUE, fontWeight: '600' },
  tabLine: { position: 'absolute', left: -12, right: -12, bottom: -1, height: 2.5, backgroundColor: BLUE },
  body: { paddingHorizontal: 21, paddingTop: 20 },
  bodyP: { paddingHorizontal: 0, paddingTop: 14 },
  heading: { fontSize: 14.5, fontWeight: '700', color: INK },
  steps: { gap: 18, marginTop: 18 },
  stepsP: { gap: 14, marginTop: 12 },
  step: { flexDirection: 'row', gap: 18 },
  num: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#DCE8FD' },
  numText: { fontSize: 14, fontWeight: '700', color: BLUE },
  stepLabel: { fontSize: 13.5, color: '#2B3445' },
  math: { marginTop: 4, fontFamily: MATH, fontStyle: 'italic', fontSize: 17, color: '#2B3445' },
  mathP: { fontSize: 15 },
  table: { marginTop: 12, borderRadius: 6, borderWidth: 1, borderColor: '#E1E7F0', overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', minHeight: 34 },
  th: { backgroundColor: '#F3F6FA', borderBottomWidth: 1, borderBottomColor: '#E1E7F0' },
  td: { paddingHorizontal: 10, fontSize: 13, color: INK },
  thText: { fontSize: 11.5, fontWeight: '600', color: BODY },
  tdQ: { width: 44 },
  tdM: { width: 76, textAlign: 'right' },
  tdMath: { fontFamily: MATH, fontStyle: 'italic', fontSize: 15 },
  award: { fontWeight: '700', color: BLUE },
  note: { marginTop: 8, fontSize: 12.5, color: BODY },
  compare: { marginTop: 14, padding: 12, borderRadius: 8, backgroundColor: '#F1F4F8' },
  compareGood: { backgroundColor: '#EAF7EF' },
  compareBad: { backgroundColor: '#FDEEEE' },
  compareLabel: { fontSize: 11.5, color: BODY },
  compareValue: { marginTop: 3, fontSize: 14, fontWeight: '600', color: INK },
  verdict: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  verdictText: { fontSize: 12.5, fontWeight: '600' },
  topic: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0' },
  topicIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#EAF1FE' },
  topicTitle: { fontSize: 14.5, fontWeight: '600', color: INK },
  topicMeta: { marginTop: 3, fontSize: 12, color: BODY },
  topicBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingHorizontal: 14, height: 38, borderRadius: 6, borderWidth: 1, borderColor: '#C9DAF8', backgroundColor: '#F2F7FE' },
  topicBtnText: { fontSize: 13, fontWeight: '500', color: BLUE },
});
