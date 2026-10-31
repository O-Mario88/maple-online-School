import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Fragment } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { DomainChip } from '@/features/learner/cbc/CbcParts';
import { formatClock } from '@/lib/exam';
import type { IconName } from '@/lib/icons';

import type { Exam, ExamState, Question } from './useExam';

export const INK = '#0B1424';
export const BODY = '#4A5263';
export const BLUE = '#1463F3';
export const GREEN = '#22A35A';
export const RED = '#E5484D';
export const ORANGE = '#F28C28';
export const MATH = Platform.select({ ios: 'Times New Roman', android: 'serif', default: '"Times New Roman", Georgia, serif' });
/** Under five minutes the clock turns red. */
const LOW_TIME = 5 * 60;
const SECTION_ICONS: readonly IconName[] = ['notes', 'clipboard', 'shield'];

export const letter = (i: number) => String.fromCharCode(65 + i);

export function leaveExam() {
  if (router.canGoBack()) router.back();
  else router.push('/learn/past-papers');
}

export function Crumbs({ items, phone = false }: { items: readonly string[]; phone?: boolean }) {
  return (
    <View style={styles.crumbs}>
      {phone ? (
        <Pressable onPress={leaveExam} accessibilityRole="link" accessibilityLabel="Back to past papers" hitSlop={8}>
          <Icon name="chevronLeft" size={13} color={BLUE} />
        </Pressable>
      ) : null}
      {items.map((t, i) => (
        <Fragment key={t}>
          {i > 0 ? <Icon name="chevronRight" size={12} color={INK} /> : null}
          <Text style={[styles.crumb, phone && styles.crumbP]} onPress={i === 0 ? leaveExam : undefined} accessibilityRole={i === 0 ? 'link' : 'text'}>
            {t}
          </Text>
        </Fragment>
      ))}
    </View>
  );
}

export function TimerCard({ left, phone = false }: { left: number; phone?: boolean }) {
  const low = left < LOW_TIME;
  const color = low ? RED : BLUE;
  return (
    <View style={phone ? styles.timerP : styles.timer} accessibilityRole="timer" accessibilityLabel={`${formatClock(left)} time remaining`}>
      <Icon name="timer" size={phone ? 22 : 40} color={color} />
      <View>
        <Text style={[phone ? styles.clockP : styles.clock, low && styles.low]}>{formatClock(left)}</Text>
        <Text style={phone ? styles.remainP : styles.remain}>Time Remaining</Text>
      </View>
    </View>
  );
}

export function SectionTabs({ exam, s }: { exam: Exam; s: ExamState }) {
  return (
    <View style={styles.sections} accessibilityRole="tablist">
      {exam.sections.map((sec, i) => {
        const on = sec.key === s.section;
        return (
          <Pressable key={sec.key} style={[styles.section, i === 2 && styles.sectionWide, on && styles.sectionOn]} onPress={() => s.setSection(sec.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <View style={styles.sectionIcon}>
              <Icon name={SECTION_ICONS[i]} size={17} color={BLUE} />
            </View>
            <View>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
              <Text style={styles.sectionSub}>{sec.sub}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function QuestionHead({ s, phone = false }: { s: ExamState; phone?: boolean }) {
  const flagged = s.sheet.flagged.includes(s.q.n);
  return (
    <View style={styles.qHead}>
      <Text style={[styles.qTitle, phone && styles.qTitleP]} accessibilityRole="header">{`Question ${s.q.n} of ${s.total}`}</Text>
      {phone ? <View style={styles.flex} /> : null}
      {phone ? (
        <Pressable onPress={s.toggleFlag} accessibilityRole="switch" accessibilityState={{ checked: flagged }} accessibilityLabel="Flag for review" hitSlop={8}>
          <Icon name={flagged ? 'bookmarkOn' : 'bookmark'} size={18} color={flagged ? ORANGE : BODY} />
        </Pressable>
      ) : null}
      <DomainChip domain={s.q.domain} />
      <Text style={[styles.mark, phone && styles.markP]}>1 mark</Text>
    </View>
  );
}

function Option({ q, i, s, phone }: { q: Question; i: number; s: ExamState; phone: boolean }) {
  const chosen = s.sheet.answers[q.n];
  const answered = chosen != null;
  const mine = chosen === i;
  const right = i === q.answer;
  const tone = !answered ? null : mine && right ? 'chosen' : right ? 'right' : mine ? 'wrong' : null;
  return (
    <Pressable
      style={[styles.option, phone && styles.optionP, tone === 'chosen' && styles.optChosen, tone === 'right' && styles.optRight, tone === 'wrong' && styles.optWrong]}
      onPress={() => s.choose(i)}
      disabled={s.done}
      accessibilityRole="radio"
      accessibilityState={{ checked: mine, disabled: s.done }}
      accessibilityLabel={`${letter(i)}. ${q.options[i]}${tone === 'chosen' || tone === 'right' ? ', correct answer' : tone === 'wrong' ? ', incorrect' : ''}`}>
      <View style={[styles.letter, phone && styles.letterP, tone === 'chosen' && styles.letterBlue, tone === 'wrong' && styles.letterRed]}>
        <Text style={[styles.letterText, (tone === 'chosen' || tone === 'wrong') && styles.letterTextOn]}>{letter(i)}</Text>
      </View>
      <Text style={[styles.optText, phone && styles.optTextP, mine && styles.optTextOn]}>{q.options[i]}</Text>
      {tone === 'chosen' || tone === 'right' ? (
        <View style={[styles.badge, { backgroundColor: GREEN }]}>
          <Icon name="check" size={14} color="#FFFFFF" />
        </View>
      ) : tone === 'wrong' ? (
        <View style={[styles.badge, { backgroundColor: RED }]}>
          <Icon name="close" size={13} color="#FFFFFF" />
        </View>
      ) : null}
    </Pressable>
  );
}

/** The question text, its diagram and the four options, marked the moment one is chosen. */
export function QuestionBody({ s, phone = false }: { s: ExamState; phone?: boolean }) {
  const q = s.q;
  return (
    <>
      <Text style={[styles.qText, phone && styles.qTextP]}>{q.text}</Text>
      {q.figure ? <Image source={q.figure} style={phone ? styles.figureP : styles.figure} contentFit="contain" accessibilityLabel="Right-angled triangle ABC: right angle at B, BC 6 cm, AB 8 cm" /> : null}
      <View style={[styles.options, phone && styles.optionsP]} accessibilityRole="radiogroup">
        {q.options.map((o, i) => (
          <Option key={o} q={q} i={i} s={s} phone={phone} />
        ))}
      </View>
    </>
  );
}

/** The auto-marked result for the open question. */
export function AnswerBox({ s, phone = false }: { s: ExamState; phone?: boolean }) {
  const q = s.q;
  const chosen = s.sheet.answers[q.n];
  if (chosen == null) {
    return (
      <View style={[styles.answer, styles.answerIdle, phone && styles.answerP]}>
        <Text style={styles.answerSub}>Choose an answer to see it marked instantly.</Text>
      </View>
    );
  }
  const right = chosen === q.answer;
  return (
    <View style={[styles.answer, !right && styles.answerWrong, phone && styles.answerP]} accessibilityLiveRegion="polite">
      <View style={[styles.answerIcon, phone && styles.answerIconP, !right && { backgroundColor: RED }]}>
        <Icon name={right ? 'check' : 'close'} size={phone ? 18 : 22} color="#FFFFFF" />
      </View>
      <View style={styles.flex}>
        <Text style={[styles.answerTitle, phone && styles.answerTitleP]}>{`${right ? 'Correct Answer' : 'Not quite. Correct Answer'}: ${letter(q.answer)}. ${q.options[q.answer]}`}</Text>
        <Text style={[styles.answerSub, phone && styles.answerSubP]}>{q.summary}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  crumbs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  crumb: { fontSize: 12.5, color: BLUE },
  crumbP: { fontSize: 11.5 },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, height: 82, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: '#0B1424', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } },
  clock: { fontSize: 25, fontWeight: '700', color: INK, fontVariant: ['tabular-nums'] },
  remain: { marginTop: 2, fontSize: 15, color: BODY },
  timerP: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#D5E2F7', backgroundColor: '#FFFFFF' },
  clockP: { fontSize: 13.5, fontWeight: '700', color: INK, fontVariant: ['tabular-nums'] },
  remainP: { fontSize: 7.5, color: BLUE },
  low: { color: RED },
  sections: { flexDirection: 'row', gap: 11 },
  section: { width: 264, height: 58, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, borderRadius: 6, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  sectionWide: { width: 274 },
  sectionOn: { borderWidth: 1.5, borderColor: BLUE, backgroundColor: '#F1F6FF' },
  sectionIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#E7EFFD' },
  sectionTitle: { fontSize: 13.5, fontWeight: '600', color: INK },
  sectionSub: { marginTop: 3, fontSize: 12.5, color: BODY },
  qHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qTitle: { fontSize: 16, fontWeight: '700', color: INK },
  qTitleP: { fontSize: 15 },
  mark: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 5, backgroundColor: '#EAF1FE', fontSize: 12.5, color: BLUE, overflow: 'hidden' },
  markP: { fontSize: 11 },
  qText: { marginTop: 26, fontSize: 15, lineHeight: 23, color: '#2B3445' },
  qTextP: { marginTop: 14, fontSize: 13.5, lineHeight: 20 },
  figure: { width: 258, height: 168, marginTop: 14, marginLeft: 23 },
  figureP: { width: 210, height: 137, marginTop: 6, marginLeft: 20 },
  options: { gap: 10, marginTop: 23, marginLeft: 4 },
  optionsP: { gap: 7, marginTop: 10, marginLeft: 0 },
  option: { height: 43, flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 12, borderRadius: 5, borderWidth: 1, borderColor: '#DFE5EE', backgroundColor: '#FFFFFF' },
  optionP: { height: 40, gap: 16 },
  optChosen: { borderWidth: 1.5, borderColor: BLUE, backgroundColor: '#F1F6FF' },
  optRight: { borderWidth: 1.5, borderColor: GREEN, backgroundColor: '#F1FBF4' },
  optWrong: { borderWidth: 1.5, borderColor: RED, backgroundColor: '#FFF4F4' },
  letter: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#EEF2F7' },
  letterP: { width: 24, height: 24 },
  letterBlue: { backgroundColor: BLUE },
  letterRed: { backgroundColor: RED },
  letterText: { fontSize: 13, fontWeight: '600', color: INK },
  letterTextOn: { color: '#FFFFFF' },
  optText: { flex: 1, fontSize: 14, color: INK },
  optTextP: { fontSize: 13 },
  optTextOn: { fontWeight: '700' },
  badge: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  answer: { minHeight: 73, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, backgroundColor: '#EAF7EF' },
  answerP: { minHeight: 60, gap: 12, paddingHorizontal: 12 },
  answerWrong: { backgroundColor: '#FDEEEE' },
  answerIdle: { backgroundColor: '#F1F4F8' },
  answerIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: GREEN },
  answerIconP: { width: 32, height: 32, borderRadius: 16 },
  answerTitle: { fontSize: 15, fontWeight: '700', color: '#1F3A2B' },
  answerTitleP: { fontSize: 13.5 },
  answerSub: { marginTop: 4, fontSize: 13, color: BODY },
  answerSubP: { fontSize: 12 },
});
