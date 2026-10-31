import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { scoreQuiz } from '@/lib/quiz';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

type Course = MockData['publicPages']['coursePage'];

const LETTERS = ['A', 'B', 'C', 'D'] as const;
const PROMISES = ['Real lesson content', 'Instant feedback', 'See explanations'] as const;

/** Three sample questions from the course, checked one at a time with an explanation. */
export function SamplePreview({ course, wide }: { course: Course; wide: boolean }) {
  const qs = course.sample.questions;
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => qs.map(() => null));
  const [checked, setChecked] = useState(false);
  const done = step >= qs.length;
  const q = qs[Math.min(step, qs.length - 1)];
  const picked = picks[step] ?? null;
  const right = picked === q.answer;
  const score = scoreQuiz(qs, picks);

  const choose = (i: number) => {
    if (checked) return;
    setPicks((p) => p.map((v, k) => (k === step ? i : v)));
  };
  const next = () => {
    setChecked(false);
    setStep((s) => s + 1);
  };

  return (
    <View style={styles.card}>
      <View style={styles.between}>
        <View>
          <Text style={styles.title} accessibilityRole="header">
            Sample lesson preview
          </Text>
          <Text style={styles.muted}>{`${qs.length} questions · ${course.sample.minutes} minutes`}</Text>
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.push('/sign-up')}>
          <Text style={styles.link}>Try full lesson →</Text>
        </Pressable>
      </View>
      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={[styles.quiz, wide && styles.flex]}>
          {done ? (
            <View style={styles.done}>
              <Text style={styles.score}>{`${score.correct} of ${score.total}`}</Text>
              <Text style={styles.text}>Enrol to keep going from here.</Text>
            </View>
          ) : (
            <>
              <View style={styles.between}>
                <Text style={styles.muted}>{`Question ${step + 1} of ${qs.length}`}</Text>
                <Text style={styles.muted}>Multiple choice</Text>
              </View>
              <Text style={styles.question}>{q.text}</Text>
              {q.options.map((o, i) => {
                const on = picked === i;
                const showRight = checked && i === q.answer;
                const showWrong = checked && on && !right;
                return (
                  <Pressable
                    key={o}
                    onPress={() => choose(i)}
                    style={[styles.option, on && styles.optionOn, showRight && styles.optionRight, showWrong && styles.optionWrong]}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on, disabled: checked }}>
                    <Text style={styles.letter}>{LETTERS[i]}</Text>
                    <Text style={styles.text}>{o}</Text>
                  </Pressable>
                );
              })}
              {checked ? (
                <View style={[styles.why, right ? styles.whyRight : styles.whyWrong]} accessibilityLiveRegion="polite">
                  <Text style={styles.strong}>{right ? 'Correct' : 'Not quite'}</Text>
                  <Text style={styles.text}>{q.why}</Text>
                </View>
              ) : null}
              <Pressable
                style={[styles.primary, picked === null && styles.disabled]}
                disabled={picked === null}
                onPress={checked ? next : () => setChecked(true)}
                accessibilityRole="button">
                <Text style={styles.primaryText}>{checked ? (step === qs.length - 1 ? 'See my score' : 'Next question') : 'Check answer'}</Text>
              </Pressable>
            </>
          )}
        </View>
        <View style={[styles.side, wide && styles.sideWide]}>
          <Icon name="trophy" size={34} color={Brand.amber} />
          <Text style={styles.strong}>Try a short lesson</Text>
          <Text style={styles.sideText}>Experience the real course with 3 sample questions before you enrol.</Text>
          {PROMISES.map((p) => (
            <View key={p} style={styles.promise}>
              <Icon name="check" size={15} color={Brand.green} />
              <Text style={styles.text}>{p}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { gap: 14, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 20, fontWeight: '700', color: Brand.ink },
  muted: { fontSize: 12, color: Brand.muted },
  link: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  body: { gap: 14 },
  bodyWide: { flexDirection: 'row' },
  quiz: { gap: 8, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Brand.line },
  question: { fontSize: 15, fontWeight: '600', color: Brand.ink, marginBottom: 4 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 40, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  optionOn: { borderColor: Brand.blue, backgroundColor: Brand.blueSoft },
  optionRight: { borderColor: Brand.green, backgroundColor: Brand.greenSoft },
  optionWrong: { borderColor: Brand.live, backgroundColor: Brand.liveSoft },
  letter: { width: 20, fontSize: 12, fontWeight: '700', color: Brand.muted },
  text: { fontSize: 13, color: Brand.body, flexShrink: 1 },
  strong: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  why: { gap: 2, padding: 10, borderRadius: 8 },
  whyRight: { backgroundColor: Brand.greenSoft },
  whyWrong: { backgroundColor: Brand.amberSoft },
  primary: { alignItems: 'center', justifyContent: 'center', minHeight: 44, borderRadius: 8, backgroundColor: Brand.blue, marginTop: 4 },
  primaryText: { fontSize: 14, fontWeight: '600', color: Brand.surface },
  disabled: { opacity: 0.45 },
  done: { alignItems: 'center', gap: 6, paddingVertical: 24 },
  score: { fontSize: 34, fontWeight: '800', color: Brand.blue },
  side: { gap: 8, padding: 16, borderRadius: 12, backgroundColor: Brand.blueSoft, alignItems: 'center' },
  sideWide: { width: 220 },
  sideText: { fontSize: 13, color: Brand.body, textAlign: 'center' },
  promise: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'stretch' },
});
