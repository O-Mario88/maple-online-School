import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { VideoSheet } from '@/features/shared/VideoSheet';
import { scoreQuiz } from '@/lib/quiz';

import type { SampleLesson } from './home/types';
import { Brand, CARD_SHADOW } from './palette';

const POINTS = [
  { label: 'Real lesson content', icon: 'play' as const, color: '#3E7A97' },
  { label: 'Instant feedback', icon: 'check' as const, color: '#3E7A97' },
  { label: 'Personalized next steps', icon: 'check' as const, color: '#16A34A' },
];

function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.stepper}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={styles.stepCell}>
          <View style={[styles.dot, i === step && styles.dotOn, i < step && styles.dotDone]}>
            <Text style={[styles.dotText, i <= step && styles.dotTextOn]}>{String(i + 1)}</Text>
          </View>
          {i === step ? <View style={styles.stepBar} /> : null}
          <View style={styles.stepLine} />
        </View>
      ))}
      <View style={styles.stepCell}>
        <View style={styles.dot}>
          <Icon name="flag" size={10} color={Brand.muted} />
        </View>
        <Text style={styles.resultsStep}>Results</Text>
      </View>
    </View>
  );
}

function Quiz({ lesson, phone }: { lesson: SampleLesson; phone: boolean }) {
  const [step, setStep] = useState(0);
  // The reference shows the first answer already picked.
  const [picks, setPicks] = useState<(number | null)[]>(() => lesson.questions.map((_, i) => (i === 0 ? 0 : null)));
  const total = lesson.questions.length;
  const done = step >= total;
  const q = lesson.questions[Math.min(step, total - 1)];
  const score = scoreQuiz(lesson.questions, picks);
  const pick = (i: number) => setPicks((p) => p.map((v, k) => (k === step ? i : v)));

  return (
    <View style={[styles.quizCol, phone && styles.quizColPhone]}>
      <Stepper step={Math.min(step, total)} total={total} />
      <View style={[styles.quizCard, phone && styles.quizCardPhone]}>
        {done ? (
          <View style={styles.scoreBox}>
            <Text style={styles.score}>{`${score.correct} of ${score.total}`}</Text>
            <Text style={[styles.small, phone && styles.smallPhone]}>{score.correct === score.total ? 'Perfect. You are ready for the next topic.' : 'Good start. Maple will plan what to practise next.'}</Text>
            <Pressable style={styles.next} accessibilityRole="button" onPress={() => router.push('/sign-up')}>
              <Text style={styles.nextText}>Save my results</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.qHead}>
              <Text style={styles.qTag}>{`Question ${step + 1} of ${total}`}</Text>
              <Text style={styles.qKind}>Multiple Choice</Text>
            </View>
            <Text style={[styles.question, phone && styles.questionPhone]}>{q.text}</Text>
            <View style={[styles.options, phone && styles.optionsPhone]}>
              {q.options.map((o, i) => {
                const on = picks[step] === i;
                return (
                  <Pressable key={o} style={[styles.option, phone && styles.optionPhone, on && styles.optionOn]} onPress={() => pick(i)} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                    <View style={[styles.radio, on && styles.radioOn]} />
                    <Text style={[styles.optionText, phone && styles.optionTextPhone]}>{o}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={[styles.next, phone && styles.nextPhone, picks[step] === null && styles.disabled]} disabled={picks[step] === null} accessibilityRole="button" onPress={() => setStep((s) => s + 1)}>
              <Text style={[styles.nextText, phone && styles.nextTextPhone]}>{step === total - 1 ? 'See Results' : 'Next Question'}</Text>
              <Icon name="arrowRight" size={14} color={Brand.surface} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

/** "Try before you sign up": a short lesson and three questions with instant results. */
export function TryLesson({ lesson, phone = false }: { lesson: SampleLesson; phone?: boolean }) {
  const [playing, setPlaying] = useState(false);
  return (
    <View style={[styles.wrap, phone && styles.wrapPhone]}>
      <View style={[styles.copy, phone && styles.copyPhone]}>
        <Text style={styles.eyebrow}>TRY BEFORE YOU SIGN UP</Text>
        <Text style={[styles.title, phone && styles.titlePhone]} accessibilityRole="header">
          {'Experience a real lesson\nin just 3 questions.'}
        </Text>
        <Text style={[styles.body, phone && styles.bodyPhone]}>See how Maple works. Watch a short lesson and answer 3 questions to get instant feedback and personalized recommendations.</Text>
        <View style={styles.points}>
          {POINTS.map((p) => (
            <View key={p.label} style={styles.point}>
              <View style={[styles.pointIcon, { backgroundColor: p.color }]}>
                <Icon name={p.icon} size={8} color={Brand.surface} />
              </View>
              <Text style={[styles.small, phone && styles.smallPhone]}>{p.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.ctas}>
          <Pressable style={[styles.primary, phone && styles.ctaPhone]} onPress={() => setPlaying(true)} accessibilityRole="button">
            <Text style={[styles.primaryText, phone && styles.ctaTextPhone]}>Start 3-Question Lesson</Text>
            <Icon name="arrowRight" size={14} color={Brand.surface} />
          </Pressable>
          <Pressable style={[styles.secondary, phone && styles.ctaPhone]} onPress={() => router.push('/explore')} accessibilityRole="button">
            <Icon name="book" size={15} color={Brand.ink} />
            <Text style={styles.secondaryText}>Browse Sample Lessons</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={[styles.video, phone && styles.videoPhone]} onPress={() => setPlaying(true)} accessibilityRole="button" accessibilityLabel={`Play the sample lesson: ${lesson.title}`}>
        <Image source={lesson.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Pressable>
      <VideoSheet visible={playing} poster={lesson.photo} title={lesson.title} seconds={180} onClose={() => setPlaying(false)} />

      <Quiz lesson={lesson} phone={phone} />

      <View style={[styles.results, phone && styles.resultsPhone]}>
        <Image source={lesson.trophy} style={styles.trophy} contentFit="contain" accessibilityLabel="Trophy" />
        <Text style={styles.resultsTitle}>Get instant results</Text>
        <View style={styles.resultList}>
          {lesson.results.map((r) => (
            <View key={r} style={styles.resultItem}>
              <View style={[styles.pointIcon, styles.resultIcon]}>
                <Icon name="check" size={8} color={Brand.surface} />
              </View>
              <Text style={[styles.small, phone && styles.smallPhone]}>{r}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop: the reference's own pixels (x 50–1488, y 745–1020).
  wrap: { flexDirection: 'row', marginLeft: 50, width: 1438, height: 275, paddingLeft: 32, paddingRight: 16, borderRadius: 16, backgroundColor: '#EEF5FE' },
  wrapPhone: { flexDirection: 'column', width: undefined, height: undefined, marginLeft: 10, marginRight: 10, paddingLeft: 14, paddingRight: 14, paddingVertical: 18, gap: 14 },
  ctaPhone: { width: '100%', height: 46 },
  ctaTextPhone: { fontSize: 15 },
  copy: { width: 459, paddingTop: 23 },
  copyPhone: { width: undefined, paddingTop: 0 },
  eyebrow: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: Brand.surface, fontSize: 9.5, fontWeight: '600', letterSpacing: 1, color: '#4A5263' },
  title: { marginTop: 9, fontSize: 30, lineHeight: 32, fontWeight: '700', color: Brand.ink, letterSpacing: -0.6 },
  titlePhone: { fontSize: 27, lineHeight: 31 },
  body: { marginTop: 11, width: 360, fontSize: 14, lineHeight: 17.5, color: '#3D4656' },
  bodyPhone: { width: undefined, fontSize: 14.5, lineHeight: 20 },
  points: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 32, rowGap: 8, marginTop: 14 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pointIcon: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  small: { fontSize: 10.5, color: '#2A3242' },
  smallPhone: { fontSize: 13.5 },
  ctas: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
  primary: { width: 208, height: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 6, backgroundColor: Brand.blue },
  primaryText: { fontSize: 12.5, fontWeight: '500', color: Brand.surface },
  secondary: { width: 186, height: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, backgroundColor: Brand.surface, ...CARD_SHADOW },
  secondaryText: { fontSize: 12.5, color: '#2A3242' },

  video: { width: 454, height: 243, marginTop: 12, borderRadius: 10, overflow: 'hidden', backgroundColor: Brand.video },
  videoPhone: { width: '100%', height: undefined, aspectRatio: 454 / 243, marginTop: 0 },

  quizCol: { width: 248, marginLeft: 27, paddingTop: 22 },
  stepper: { flexDirection: 'row', alignItems: 'center', height: 24, paddingLeft: 5 },
  stepCell: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: '#DCE2EC', backgroundColor: Brand.surface, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  dotDone: { backgroundColor: '#9DBBF8', borderColor: '#9DBBF8' },
  dotText: { fontSize: 9.5, color: '#4A5263' },
  dotTextOn: { color: Brand.surface, fontWeight: '700' },
  stepBar: { position: 'absolute', left: 0, bottom: -7, width: 20, height: 2, borderRadius: 1, backgroundColor: Brand.blue },
  stepLine: { width: 27, height: 1, backgroundColor: '#E1E6EF' },
  resultsStep: { marginLeft: 6, fontSize: 10.5, color: '#4A5263' },
  quizCard: { marginTop: 8, padding: 7, paddingTop: 9, borderRadius: 8, backgroundColor: '#F7FAFE' },
  qHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qTag: { paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4, backgroundColor: '#DCEBFE', fontSize: 8.5, fontWeight: '500', color: Brand.blue },
  qKind: { paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4, backgroundColor: '#EEF1F6', fontSize: 8, color: '#4A5263' },
  question: { marginTop: 8, fontSize: 11, lineHeight: 15.5, fontWeight: '600', color: Brand.ink },
  options: { gap: 2, marginTop: 9 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 22, paddingHorizontal: 7, borderRadius: 4, borderWidth: 1, borderColor: '#EEF1F6', backgroundColor: Brand.surface },
  optionOn: { borderColor: '#9DBBF8', backgroundColor: '#EEF4FE' },
  radio: { width: 9, height: 9, borderRadius: 5, borderWidth: 1, borderColor: '#B8C0CC' },
  radioOn: { borderWidth: 3, borderColor: Brand.blue },
  optionText: { fontSize: 9.5, color: Brand.ink },
  next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 30, marginTop: 8, borderRadius: 5, backgroundColor: Brand.blue },
  nextText: { fontSize: 10.5, fontWeight: '500', color: Brand.surface },
  disabled: { opacity: 0.45 },
  quizColPhone: { width: undefined, marginLeft: 0, paddingTop: 0 },
  quizCardPhone: { padding: 10, paddingTop: 10 },
  questionPhone: { fontSize: 15, lineHeight: 21 },
  optionsPhone: { gap: 6, marginTop: 12 },
  optionPhone: { height: 42, paddingHorizontal: 12 },
  optionTextPhone: { fontSize: 14 },
  nextPhone: { height: 44, marginTop: 12 },
  nextTextPhone: { fontSize: 14 },
  scoreBox: { gap: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  score: { fontSize: 32, fontWeight: '800', color: Brand.blue },

  results: { width: 182, height: 205, marginLeft: 20, marginTop: 50, paddingTop: 8, paddingHorizontal: 11, borderRadius: 10, borderWidth: 1, borderColor: '#E7ECF5', backgroundColor: '#F6F8FE', alignItems: 'center' },
  resultsPhone: { width: undefined, height: undefined, marginLeft: 0, marginTop: 0, paddingBottom: 16 },
  trophy: { width: 52, height: 48 },
  resultsTitle: { marginTop: 7, fontSize: 12, fontWeight: '700', color: Brand.ink },
  resultList: { alignSelf: 'stretch', gap: 9, marginTop: 13 },
  resultItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  resultIcon: { backgroundColor: '#16A34A', marginTop: 1 },
});
