import { Image } from 'expo-image';
import { useState } from 'react';
import { type GestureResponderEvent, type LayoutChangeEvent, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import { usePlayback } from '@/features/learner/exam/Walkthrough';
import { BLUE, BODY, GREEN, INK, MathLine, RED } from '@/features/learner/work/MathText';
import { IdentifierPill, RaceGrid, raceSummary, SkillChip, ValueChip } from '@/features/learner/cbc/CbcParts';
import { identifierFor } from '@/lib/cbc';
import { mmss, waveform } from '@/lib/feedback';
import type { MockData } from '@/mock';

export type Feedback = MockData['learner']['assignmentFeedback'];
const DARK_GREEN = '#15803D';
const BARS = waveform(38);

export function GradedChip({ small = false }: { small?: boolean }) {
  return (
    <View style={[styles.graded, small && styles.gradedS]}>
      <View style={[styles.gradedTick, small && styles.gradedTickS]}>
        <Icon name="check" size={small ? 8 : 11} color="#FFFFFF" />
      </View>
      <Text style={[styles.gradedText, small && styles.gradedTextS]}>Graded</Text>
    </View>
  );
}

export function ScoreCard({ f }: { f: Feedback }) {
  const t = raceSummary(f.race);
  return (
    <View style={styles.score}>
      <View>
        <Text style={styles.scoreBig}>{`${t.score} / ${t.max}`}</Text>
        <View style={styles.scoreId}>
          <IdentifierPill identifier={identifierFor(t.score, t.max)} withNumber />
        </View>
      </View>
      <ProgressRing value={t.percent / 100} size={54} stroke={6} color={GREEN} track="#DDF3E5" label={false} />
      <View style={styles.flex}>
        <Text style={styles.verdict}>{f.verdict}</Text>
        <Text style={styles.verdictText}>{f.verdictText}</Text>
      </View>
    </View>
  );
}

/** The RACE marks with the teacher's note on each, then the generic skills and values the teacher saw. */
export function RaceBreakdown({ f, phone = false }: { f: Feedback; phone?: boolean }) {
  const t = raceSummary(f.race);
  return (
    <View>
      {phone ? null : (
        <View style={styles.rubricHead}>
          <Text style={styles.cardTitle}>RACE Assessment</Text>
          <Text style={styles.rubricTotal}>{`${t.score} / ${t.max}`}</Text>
        </View>
      )}
      <RaceGrid race={f.race} notes={f.raceNotes} phone={phone} />
      <Text style={styles.seenTitle}>Generic skills and values seen</Text>
      <View style={styles.seen}>
        {f.skillsSeen.map((k) => (
          <SkillChip key={k.key} skill={k.key} id={k.id} />
        ))}
        {f.valuesSeen.map((v) => (
          <ValueChip key={v} value={v} />
        ))}
      </View>
    </View>
  );
}

/** The teacher's voice note: play/pause, tap the waveform to jump, change speed. */
export function VoiceNote({ seconds }: { seconds: number }) {
  const p = usePlayback(seconds);
  const [w, setW] = useState(1);
  const played = p.pos / seconds;
  return (
    <View style={styles.voice}>
      <Pressable style={styles.voicePlay} onPress={p.toggle} accessibilityRole="button" accessibilityLabel={p.running ? 'Pause voice note' : 'Play voice note'}>
        <Icon name={p.running ? 'pause' : 'playFill'} size={15} color="#FFFFFF" />
      </Pressable>
      <Pressable
        style={styles.wave}
        onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
        onPress={(e: GestureResponderEvent) => p.seek(e.nativeEvent.locationX / w)}
        accessibilityRole="adjustable"
        accessibilityLabel="Voice note position"
        accessibilityValue={{ min: 0, max: seconds, now: p.pos, text: mmss(p.pos) }}>
        {BARS.map((b, i) => (
          <View key={i} style={[styles.bar, { height: 4 + b * 18, backgroundColor: i / BARS.length < played ? BLUE : '#AFC3EA' }]} />
        ))}
      </Pressable>
      <Text style={styles.voiceTime}>{mmss(p.running || p.pos > 0 ? p.pos : seconds)}</Text>
      <Pressable style={styles.speed} onPress={p.nextSpeed} accessibilityRole="button" accessibilityLabel={`Speed ${p.speed} times`}>
        <Text style={styles.speedText}>{`${p.speed}x`}</Text>
      </Pressable>
    </View>
  );
}

export function TeacherCard({ f, phone = false }: { f: Feedback; phone?: boolean }) {
  const t = f.teacher;
  return (
    <View>
      <View style={styles.teacher}>
        <Image source={t.photo} style={phone ? styles.teacherPhotoP : styles.teacherPhoto} />
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <Text style={[styles.teacherName, phone && styles.teacherNameP]}>{t.name}</Text>
            <View style={styles.verified}>
              <Icon name="check" size={8} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.teacherRole}>{t.role}</Text>
          <Text style={styles.teacherRole}>{phone ? t.phoneGraded : t.graded}</Text>
        </View>
      </View>
      <View style={styles.voiceWrap}>
        <VoiceNote seconds={t.voiceSeconds} />
      </View>
      <Text style={[styles.comment, phone && styles.commentP]}>{t.comment}</Text>
    </View>
  );
}

/** A five-question practice set on the skill the marking found weakest, marked as you go. */
export function PracticeSheet({ f, open, onClose }: { f: Feedback; open: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const [picks, setPicks] = useState<readonly (number | null)[]>(f.practice.map(() => null));
  const done = i >= f.practice.length;
  const correct = f.practice.filter((q, k) => picks[k] === q.answer).length;
  const restart = () => {
    setI(0);
    setPicks(f.practice.map(() => null));
  };
  const q = f.practice[Math.min(i, f.practice.length - 1)];
  const pick = picks[i];
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.scrim, { paddingBottom: insets.bottom + 16, paddingTop: insets.top + 16 }]}>
        <View style={styles.sheet}>
          <View style={styles.sheetHead}>
            <Text style={styles.sheetTitle}>Remedial Practice: adding and subtracting fractions</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close practice" hitSlop={10}>
              <Icon name="close" size={18} color={BODY} />
            </Pressable>
          </View>
          {done ? (
            <View style={styles.result}>
              <Text style={styles.resultBig}>{`${correct} / ${f.practice.length}`}</Text>
              <Text style={styles.resultText}>{correct === f.practice.length ? 'All correct. Well done!' : 'Good effort. Try the ones you missed again.'}</Text>
              <View style={styles.sheetBtns}>
                <Pressable style={[styles.btn, styles.half, styles.btnGhost]} onPress={restart} accessibilityRole="button">
                  <Text style={[styles.btnText, { color: BLUE }]}>Try again</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.half]} onPress={onClose} accessibilityRole="button">
                  <Text style={styles.btnText}>Done</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.sheetStep}>{`Question ${i + 1} of ${f.practice.length}`}</Text>
              <MathLine text={q.text} size={16} />
              <View style={styles.opts}>
                {q.options.map((o, k) => {
                  const right = pick != null && k === q.answer;
                  const wrong = pick === k && k !== q.answer;
                  return (
                    <Pressable
                      key={o}
                      style={[styles.opt, right && styles.optRight, wrong && styles.optWrong]}
                      disabled={pick != null}
                      onPress={() => setPicks((p) => p.map((x, j) => (j === i ? k : x)))}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: pick === k, disabled: pick != null }}
                      accessibilityLabel={`${o}${right ? ', correct' : wrong ? ', incorrect' : ''}`}>
                      <MathLine text={o} size={15} />
                      {right ? <Icon name="check" size={16} color={GREEN} /> : wrong ? <Icon name="close" size={16} color={RED} /> : null}
                    </Pressable>
                  );
                })}
              </View>
              <Pressable style={[styles.btn, pick == null && styles.btnOff]} disabled={pick == null} onPress={() => setI(i + 1)} accessibilityRole="button">
                <Text style={styles.btnText}>{i === f.practice.length - 1 ? 'See my score' : 'Next question'}</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cardTitle: { fontSize: 15.5, fontWeight: '700', color: INK },
  graded: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 10, height: 29, borderRadius: 6, backgroundColor: '#E5F6EB' },
  gradedS: { height: 20, gap: 4, paddingHorizontal: 6 },
  gradedTick: { width: 17, height: 17, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: GREEN },
  gradedTickS: { width: 12, height: 12 },
  gradedText: { fontSize: 14.5, fontWeight: '600', color: DARK_GREEN },
  gradedTextS: { fontSize: 10.5 },
  score: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, height: 91, borderRadius: 10, backgroundColor: '#FFFFFF' },
  scoreBig: { fontSize: 22, fontWeight: '700', color: INK },
  scoreId: { marginTop: 6 },
  seenTitle: { marginTop: 10, fontSize: 11.5, fontWeight: '700', color: INK },
  seen: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  verdict: { fontSize: 15.5, fontWeight: '700', color: '#1F3A2B' },
  verdictText: { marginTop: 5, fontSize: 11, lineHeight: 16, color: BODY },
  rubricHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rubricTotal: { fontSize: 17, fontWeight: '700', color: DARK_GREEN },
  teacher: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  teacherPhoto: { width: 66, height: 66, borderRadius: 33 },
  teacherPhotoP: { width: 46, height: 46, borderRadius: 23 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  teacherName: { fontSize: 14, fontWeight: '700', color: INK },
  teacherNameP: { fontSize: 12.5 },
  verified: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: BLUE },
  teacherRole: { marginTop: 4, fontSize: 12, color: BODY },
  voiceWrap: { marginTop: 12 },
  voice: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E3E8F0', backgroundColor: '#FFFFFF' },
  voicePlay: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#0B6BFF' },
  wave: { flex: 1, height: 30, flexDirection: 'row', alignItems: 'center', gap: 2 },
  bar: { flex: 1, borderRadius: 1 },
  voiceTime: { fontSize: 12, color: INK, fontVariant: ['tabular-nums'] },
  speed: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 4, backgroundColor: '#EEF2F7' },
  speedText: { fontSize: 11.5, fontWeight: '600', color: INK },
  comment: { marginTop: 10, fontSize: 12, lineHeight: 17, color: '#2B3445' },
  commentP: { fontSize: 12 },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(8,12,20,0.55)' },
  sheet: { width: '100%', maxWidth: 460, padding: 20, gap: 12, borderRadius: 14, backgroundColor: '#FFFFFF' },
  sheetHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  sheetTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: INK },
  sheetStep: { fontSize: 12, color: BODY },
  opts: { gap: 8 },
  opt: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: '#DFE5EE' },
  optRight: { borderColor: GREEN, backgroundColor: '#F1FBF4' },
  optWrong: { borderColor: RED, backgroundColor: '#FFF4F4' },
  btn: { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#0B6BFF' },
  btnGhost: { borderWidth: 1.5, borderColor: BLUE, backgroundColor: '#FFFFFF' },
  btnOff: { opacity: 0.4 },
  btnText: { fontSize: 14.5, fontWeight: '600', color: '#FFFFFF' },
  result: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  resultBig: { fontSize: 34, fontWeight: '800', color: INK },
  resultText: { fontSize: 13.5, color: BODY, textAlign: 'center' },
  sheetBtns: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 8 },
  half: { flex: 1 },
});
