import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { type Mark, markAnswer } from '@/lib/past-paper';
import type { PastPaperEntry } from '@/mock/public';

import { Brand, CARD_SHADOW } from '../palette';

/** Question 1, free: the question, its figure, an answer box, auto-marking and the worked solution. */
export function QuestionCard({ paper }: { paper: PastPaperEntry }) {
  const q = paper.q1;
  const [answer, setAnswer] = useState('');
  const [mark, setMark] = useState<Mark | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const submit = () => {
    if (!answer.trim()) return;
    setMark(markAnswer(answer, q.expected));
  };

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Question 1
        </Text>
        <Text style={styles.free}>● Free Question</Text>
        <View style={styles.flex} />
        <Text style={styles.muted}>{`(${q.marks} marks)`}</Text>
      </View>
      {q.parts.map((p, i) => (
        <View key={p.label || i} style={styles.gap}>
          <Text style={styles.question}>{p.label ? `${p.label}  ${p.text}` : p.text}</Text>
          {i === 0 && q.figure ? <Image source={q.figure} style={styles.figure} contentFit="contain" accessibilityLabel="Right-angled triangle ABC with AB = 6 cm, BC = 8 cm and the right angle at B" /> : null}
        </View>
      ))}
      <View style={styles.editor}>
        <View style={styles.toolbar}>
          <Text style={styles.tool}>Normal text ⌄</Text>
          <Text style={[styles.tool, styles.bold]}>B</Text>
          <Text style={[styles.tool, styles.italic]}>I</Text>
          <Text style={styles.tool}>Σ</Text>
          <Text style={styles.tool}>√</Text>
        </View>
        <TextInput
          style={styles.input}
          value={answer}
          onChangeText={(t) => {
            setAnswer(t);
            setMark(null);
          }}
          multiline
          placeholder="Type your answer here..."
          placeholderTextColor={Brand.muted}
          accessibilityLabel="Your answer to question 1"
        />
        <View style={styles.editorFoot}>
          <Text style={styles.mathInput}>⊕ Math input</Text>
          <View style={styles.flex} />
          <Pressable style={[styles.submit, !answer.trim() && styles.disabled]} disabled={!answer.trim()} onPress={submit} accessibilityRole="button">
            <Text style={styles.submitText}>Submit Answer</Text>
          </Pressable>
        </View>
      </View>
      {mark ? (
        <View style={[styles.result, mark.score === mark.outOf ? styles.resultGood : styles.resultPart]} accessibilityLiveRegion="polite">
          <Text style={styles.resultTitle}>{`${mark.score} / ${mark.outOf} marks`}</Text>
          {mark.parts.map((p) => (
            <Text key={p.part} style={styles.body}>{`${p.correct ? '✓' : '✗'}  ${p.part}`}</Text>
          ))}
          <View style={styles.resultActions}>
            <Pressable onPress={() => setShowSolution((v) => !v)} accessibilityRole="button">
              <Text style={styles.link}>{showSolution ? 'Hide the solution' : 'See the worked solution'}</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/sign-up')} accessibilityRole="button">
              <Text style={styles.link}>Save my progress →</Text>
            </Pressable>
          </View>
          {showSolution ? q.solution.map((s) => <Text key={s} style={styles.body}>{s}</Text>) : null}
        </View>
      ) : null}
    </View>
  );
}

/** A hint box that asks the learner to sign in, as in the reference. */
export function HintCard({ hint }: { hint: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={styles.hint}>
      <View style={styles.hintHead}>
        <Text style={styles.hintIcon}>💡</Text>
        <View style={styles.flex}>
          <Text style={styles.strong}>Need a hint?</Text>
          <Text style={styles.body}>{open ? hint : 'Get guided hints and step-by-step solutions with a Maple account.'}</Text>
        </View>
      </View>
      <Pressable style={styles.hintBtn} onPress={() => setOpen((v) => !v)} accessibilityRole="button">
        <Text style={styles.link}>{open ? 'Hide hint' : 'Show Hint (free for Question 1)'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 10 },
  card: { gap: 14, padding: 20, borderRadius: 14, backgroundColor: Brand.surface, ...CARD_SHADOW },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  free: { fontSize: 11, fontWeight: '700', color: Brand.green, backgroundColor: Brand.greenSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  muted: { fontSize: 12, color: Brand.muted },
  question: { fontSize: 16, lineHeight: 26, color: Brand.ink, fontFamily: 'Georgia, serif' },
  figure: { width: 234, height: 176, marginLeft: 20 },
  editor: { borderRadius: 10, borderWidth: 1, borderColor: Brand.line, overflow: 'hidden' },
  toolbar: { flexDirection: 'row', gap: 18, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Brand.line },
  tool: { fontSize: 13, color: Brand.body },
  bold: { fontWeight: '800' },
  italic: { fontStyle: 'italic' },
  input: { minHeight: 110, padding: 12, fontSize: 14, color: Brand.ink, textAlignVertical: 'top' },
  editorFoot: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  mathInput: { fontSize: 12, color: Brand.blue, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: Brand.line },
  submit: { paddingHorizontal: 22, paddingVertical: 11, borderRadius: 8, backgroundColor: Brand.blue },
  submitText: { fontSize: 14, fontWeight: '700', color: Brand.surface },
  disabled: { opacity: 0.45 },
  result: { gap: 6, padding: 14, borderRadius: 10 },
  resultGood: { backgroundColor: Brand.greenSoft },
  resultPart: { backgroundColor: Brand.amberSoft },
  resultTitle: { fontSize: 16, fontWeight: '800', color: Brand.ink },
  resultActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginTop: 4 },
  body: { fontSize: 13, lineHeight: 20, color: Brand.body },
  strong: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  link: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  hint: { gap: 12, padding: 16, borderRadius: 12, backgroundColor: '#FFF7E6' },
  hintHead: { flexDirection: 'row', gap: 10 },
  hintIcon: { fontSize: 22 },
  hintBtn: { alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.blue, backgroundColor: Brand.surface },
});
