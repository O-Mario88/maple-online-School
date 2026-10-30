import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { scoreQuiz } from '@/lib/quiz';
import type { MockData } from '@/mock';

import { Brand } from './palette';

type Lesson = MockData['publicPages']['landing']['sampleLesson'];

const POINTS = ['Real lesson content', 'Instant feedback', 'Personalised next steps'] as const;

function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <View style={styles.stepper}>
      {Array.from({ length: total }, (_, i) => (
        <View key={i} style={[styles.dot, i <= step && styles.dotOn]}>
          <Text style={[styles.dotText, i <= step && styles.dotTextOn]}>{String(i + 1)}</Text>
        </View>
      ))}
      <Text style={styles.meta}>Results</Text>
    </View>
  );
}

function VideoMock({ lesson }: { lesson: Lesson }) {
  if (lesson.photo) {
    // The reference frame already shows the lesson title, play button and controls.
    return (
      <Pressable style={styles.video} accessibilityRole="button" accessibilityLabel={`Play the sample lesson: ${lesson.title}`}>
        <Image source={lesson.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Pressable>
    );
  }
  return (
    <View style={styles.video} accessibilityLabel={`Sample lesson video: ${lesson.title}`}>
      <View style={styles.videoTag}>
        <Text style={styles.videoTagText}>Sample Lesson</Text>
      </View>
      <Text style={styles.videoTitle}>{lesson.title}</Text>
      <Text style={styles.board}>{'Pythagorean Theorem\n\na² + b² = c²\n\nFind c when a = 3, b = 4\nc² = 3² + 4² = 9 + 16'}</Text>
      <Pressable style={styles.play} accessibilityRole="button" accessibilityLabel="Play the sample lesson">
        <Icon name="play" size={26} color={Brand.surface} />
      </Pressable>
      <View style={styles.scrub}>
        <Text style={styles.videoTime}>{`0:00 / ${lesson.duration}`}</Text>
        <View style={styles.track}>
          <View style={styles.trackFill} />
        </View>
      </View>
    </View>
  );
}

/** "Try before you sign up": a short lesson and three questions with instant results. */
export function TryLesson({ lesson, wide }: { lesson: Lesson; wide: boolean }) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<(number | null)[]>(() => lesson.questions.map(() => null));
  const done = step >= lesson.questions.length;
  const q = lesson.questions[Math.min(step, lesson.questions.length - 1)];
  const score = scoreQuiz(lesson.questions, picks);

  const pick = (i: number) => setPicks((p) => p.map((v, k) => (k === step ? i : v)));

  return (
    <View style={[styles.wrap, wide && styles.wrapWide]}>
      <View style={[styles.copy, wide && styles.copyWide]}>
        <Text style={styles.eyebrow}>TRY BEFORE YOU SIGN UP</Text>
        <Text style={styles.title} accessibilityRole="header">
          Experience a real lesson in just 3 questions.
        </Text>
        <Text style={styles.body}>See how Maple works. Watch a short lesson and answer 3 questions to get instant feedback and personalised recommendations.</Text>
        <View style={styles.points}>
          {POINTS.map((p) => (
            <View key={p} style={styles.point}>
              <Icon name="check" size={15} color={Brand.green} />
              <Text style={styles.meta}>{p}</Text>
            </View>
          ))}
        </View>
        <View style={styles.ctas}>
          <Pressable style={styles.primary} accessibilityRole="button" onPress={() => setStep(0)}>
            <Text style={styles.primaryText}>Start 3-Question Lesson</Text>
            <Icon name="arrowRight" size={16} color={Brand.surface} />
          </Pressable>
          <Pressable style={styles.secondary} accessibilityRole="button">
            <Icon name="book" size={16} color={Brand.ink} />
            <Text style={styles.secondaryText}>Browse Sample Lessons</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.videoCol, wide && styles.videoColWide]}>
        <VideoMock lesson={lesson} />
      </View>

      <View style={[styles.quiz, wide && styles.quizWide]}>
        <Stepper step={Math.min(step, lesson.questions.length)} total={lesson.questions.length} />
        {done ? (
          <View style={styles.scoreBox}>
            <Text style={styles.score}>{`${score.correct} of ${score.total}`}</Text>
            <Text style={styles.meta}>{score.correct === score.total ? 'Perfect. You are ready for the next topic.' : 'Good start. Maple will plan what to practise next.'}</Text>
            <Pressable style={styles.primary} accessibilityRole="button" onPress={() => router.push('/sign-up')}>
              <Text style={styles.primaryText}>Save my results</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.qHead}>
              <Text style={styles.qTag}>{`Question ${step + 1} of ${lesson.questions.length}`}</Text>
              <Text style={styles.meta}>Multiple choice</Text>
            </View>
            <Text style={styles.question}>{q.text}</Text>
            {q.options.map((o, i) => {
              const on = picks[step] === i;
              return (
                <Pressable key={o} style={[styles.option, on && styles.optionOn]} onPress={() => pick(i)} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                  <View style={[styles.radio, on && styles.radioOn]} />
                  <Text style={styles.optionText}>{o}</Text>
                </Pressable>
              );
            })}
            <Pressable style={[styles.primary, picks[step] === null && styles.disabled]} disabled={picks[step] === null} accessibilityRole="button" onPress={() => setStep((s) => s + 1)}>
              <Text style={styles.primaryText}>{step === lesson.questions.length - 1 ? 'See Results' : 'Next Question'}</Text>
              <Icon name="arrowRight" size={16} color={Brand.surface} />
            </Pressable>
          </>
        )}
      </View>

      <View style={[styles.results, wide && styles.resultsWide]}>
        <Icon name="trophy" size={36} color={Brand.amber} />
        <Text style={styles.resultsTitle}>Get instant results</Text>
        <View style={styles.resultList}>
          {lesson.results.map((r) => (
            <View key={r} style={styles.point}>
              <Icon name="check" size={15} color={Brand.green} />
              <Text style={styles.meta}>{r}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 20, padding: 24, gap: 20, borderRadius: 20, backgroundColor: Brand.blueSoft },
  wrapWide: { flexDirection: 'row', alignItems: 'stretch' },
  copy: { gap: 12 },
  copyWide: { flex: 1.15, justifyContent: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 1.4, color: Brand.muted },
  title: { fontSize: 30, lineHeight: 36, fontWeight: '800', color: Brand.ink, letterSpacing: -0.8 },
  body: { fontSize: 15, lineHeight: 22, color: Brand.body },
  points: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  point: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 12, color: Brand.body },
  ctas: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, paddingHorizontal: 22, borderRadius: 8, backgroundColor: Brand.blue },
  primaryText: { fontSize: 14, fontWeight: '600', color: Brand.surface },
  disabled: { opacity: 0.45 },
  secondary: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 46, paddingHorizontal: 18, borderRadius: 8, borderWidth: 1, borderColor: Brand.line, backgroundColor: Brand.surface },
  secondaryText: { fontSize: 14, fontWeight: '500', color: Brand.ink },
  videoCol: { minHeight: 260 },
  videoColWide: { flex: 1.45 },
  video: { flex: 1, minHeight: 260, padding: 14, borderRadius: 14, backgroundColor: Brand.video, overflow: 'hidden' },
  videoTag: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, backgroundColor: Brand.blue },
  videoTagText: { fontSize: 10, fontWeight: '700', color: Brand.surface },
  videoTitle: { fontSize: 11, color: '#C9D2E3', marginTop: 4 },
  board: { position: 'absolute', right: 20, top: 56, fontSize: 14, lineHeight: 20, color: '#E8ECF4', textAlign: 'right' },
  play: { position: 'absolute', left: '45%', top: '42%', width: 56, height: 56, borderRadius: 28, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  scrub: { position: 'absolute', left: 14, right: 14, bottom: 12, gap: 6 },
  videoTime: { fontSize: 11, color: '#C9D2E3' },
  track: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)' },
  trackFill: { width: '4%', height: 3, borderRadius: 2, backgroundColor: Brand.blue },
  quiz: { gap: 8, padding: 16, borderRadius: 14, backgroundColor: Brand.surface },
  quizWide: { flex: 1.05 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 4 },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: Brand.line, alignItems: 'center', justifyContent: 'center' },
  dotOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  dotText: { fontSize: 11, color: Brand.muted },
  dotTextOn: { color: Brand.surface, fontWeight: '700' },
  qHead: { flexDirection: 'row', justifyContent: 'space-between' },
  qTag: { fontSize: 11, fontWeight: '600', color: Brand.blue, backgroundColor: Brand.blueSoft, paddingHorizontal: 6, borderRadius: 4 },
  question: { fontSize: 14, fontWeight: '600', color: Brand.ink, lineHeight: 20 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: Brand.line },
  optionOn: { borderColor: Brand.blue, backgroundColor: Brand.blueSoft },
  radio: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: Brand.muted },
  radioOn: { borderWidth: 4, borderColor: Brand.blue },
  optionText: { fontSize: 13, color: Brand.ink },
  scoreBox: { flex: 1, gap: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  score: { fontSize: 36, fontWeight: '800', color: Brand.blue },
  results: { gap: 10, padding: 18, borderRadius: 14, backgroundColor: Brand.surface, alignItems: 'center' },
  resultsWide: { flex: 0.8, justifyContent: 'center' },
  resultsTitle: { fontSize: 16, fontWeight: '700', color: Brand.ink, marginBottom: 4 },
  resultList: { gap: 10, alignSelf: 'stretch' },
});
