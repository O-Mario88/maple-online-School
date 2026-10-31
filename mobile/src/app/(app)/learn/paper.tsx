import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { Legend, NavGrid, NavStrip, Progress, SubmitButton } from '@/features/learner/exam/ExamNav';
import { AnswerBox, BLUE, BODY, Crumbs, INK, leaveExam, ORANGE, QuestionBody, QuestionHead, RED, SectionTabs, TimerCard } from '@/features/learner/exam/ExamParts';
import { SolutionTabs } from '@/features/learner/exam/ExamSolution';
import { type Exam, type ExamState, useExam } from '@/features/learner/exam/useExam';
import { walkthroughLabel, WalkthroughPlayer } from '@/features/learner/exam/Walkthrough';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** The exam reference's page (x 18–1166, y 78–1002 at 1536 wide); the desktop layout uses its pixels. */
const EXAM_REF_WIDTH = 1148;
const EXAM_REF_HEIGHT = 924;
const MAX_DESK_WIDTH = 1400;

function NavButtons({ s, phone = false }: { s: ExamState; phone?: boolean }) {
  const n = s.q.n;
  return (
    <View style={[styles.navBtns, phone && styles.navBtnsP]}>
      <Pressable style={[styles.prev, phone && styles.btnP, n === 1 && styles.disabled]} onPress={() => s.go(n - 1)} disabled={n === 1} accessibilityRole="button" accessibilityLabel="Previous question">
        <View style={styles.flip}>
          <Icon name="arrowRight" size={17} color={BLUE} />
        </View>
        <Text style={styles.prevText}>Previous</Text>
      </Pressable>
      <Pressable style={[styles.next, phone && styles.btnP, n === s.total && styles.disabled]} onPress={() => s.go(n + 1)} disabled={n === s.total} accessibilityRole="button" accessibilityLabel="Next question">
        <Text style={styles.nextText}>{phone ? 'Next' : 'Next Question'}</Text>
        <Icon name="arrowRight" size={17} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function WalkthroughButton({ s, onPress, phone = false }: { s: ExamState; onPress: () => void; phone?: boolean }) {
  return (
    <Pressable style={phone ? styles.watchP : styles.watch} onPress={onPress} accessibilityRole="button">
      <View style={phone ? styles.watchPlayP : styles.watchPlay}>
        <Icon name="playFill" size={phone ? 13 : 11} color="#FFFFFF" />
      </View>
      <Text style={phone ? styles.watchTextP : styles.watchText}>{`Watch ${walkthroughLabel(s.q)}`}</Text>
    </Pressable>
  );
}

/** The walkthrough as a full pop-up: the video, then the explanation, scheme and topic tabs. */
function WalkthroughSheet({ exam, s, open, onClose }: { exam: Exam; s: ExamState; open: boolean; onClose: () => void }) {
  // Read outside the modal: inside it the safe-area provider reports zero on iOS.
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={open} animationType="slide" onRequestClose={onClose} transparent>
      <View style={[styles.sheetBg, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
        <View style={styles.sheet}>
          <WalkthroughPlayer key={s.q.n} q={s.q} frame={exam.video} onClose={onClose} />
          <ScrollView style={styles.sheetBody} contentContainerStyle={styles.sheetBodyIn}>
            <Text style={styles.sheetTeacher}>{`${exam.teacher} • Question ${s.q.n}`}</Text>
            <SolutionTabs s={s} phone />
            <Pressable style={styles.sheetBack} onPress={onClose} accessibilityRole="button">
              <Text style={styles.prevText}>Back to question</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function OtherSection({ exam, s }: { exam: Exam; s: ExamState }) {
  const sec = exam.sections.find((x) => x.key === s.section);
  return (
    <View style={[styles.panel, styles.otherPanel]}>
      <Icon name="lock" size={28} color={BODY} />
      <Text style={styles.otherTitle}>{`${sec?.title}: ${sec?.sub}`}</Text>
      <Text style={styles.otherBody}>{`${sec?.title} opens when you submit Section A. Its structured answers are marked against the official scheme.`}</Text>
      <Pressable style={styles.otherBtn} onPress={() => s.setSection(exam.sections[0].key)} accessibilityRole="button">
        <Text style={styles.nextText}>Back to Section A</Text>
      </Pressable>
    </View>
  );
}

function Desktop({ exam, s, onExpand }: { exam: Exam; s: ExamState; onExpand: () => void }) {
  const [video, setVideo] = useState(true);
  const flagged = s.sheet.flagged.includes(s.q.n);
  return (
    <View style={styles.canvas}>
      <View style={styles.crumbsPos}>
        <Crumbs items={exam.crumbs} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {exam.title}
      </Text>
      <Text style={styles.sub}>{exam.sub}</Text>
      <Pressable style={styles.exit} onPress={leaveExam} accessibilityRole="button">
        <Icon name="logout" size={17} color={RED} />
        <Text style={styles.exitText}>Exit Exam</Text>
      </Pressable>
      <View style={styles.timerPos}>
        <TimerCard left={s.left} />
      </View>
      <View style={styles.sectionsPos}>
        <SectionTabs exam={exam} s={s} />
      </View>

      {s.section === exam.sections[0].key ? (
        <>
          <View style={[styles.panel, styles.leftPanel]}>
            <QuestionHead s={s} />
            <QuestionBody s={s} />
            <View style={styles.navPos}>
              <NavButtons s={s} />
            </View>
            <Pressable style={[styles.flag, flagged && styles.flagOn]} onPress={s.toggleFlag} accessibilityRole="switch" accessibilityState={{ checked: flagged }}>
              <Icon name={flagged ? 'bookmarkOn' : 'bookmark'} size={17} color={flagged ? ORANGE : INK} />
              <Text style={[styles.flagText, flagged && styles.flagTextOn]}>{flagged ? 'Flagged for Review' : 'Flag for Review'}</Text>
            </Pressable>
          </View>

          <View style={[styles.panel, styles.midPanel]}>
            <View style={styles.watchRow}>
              <WalkthroughButton s={s} onPress={() => setVideo(true)} />
              {video ? (
                <Pressable onPress={() => setVideo(false)} accessibilityRole="button" accessibilityLabel="Hide walkthrough" hitSlop={10}>
                  <Icon name="close" size={18} color={BODY} />
                </Pressable>
              ) : null}
            </View>
            {video ? (
              <View style={styles.videoPos}>
                <WalkthroughPlayer key={s.q.n} q={s.q} frame={exam.video} onExpand={onExpand} />
              </View>
            ) : null}
            <View style={styles.tabsPos}>
              <ScrollView style={styles.flex}>
                <SolutionTabs s={s} />
              </ScrollView>
            </View>
            <AnswerBox s={s} />
          </View>
        </>
      ) : (
        <OtherSection exam={exam} s={s} />
      )}

      <View style={styles.side}>
        <Text style={styles.sideTitle}>Question Navigator</Text>
        <Legend />
        <NavGrid s={s} />
        <View style={styles.sideGap} />
        <Progress s={s} />
        <View style={styles.submitPos}>
          <SubmitButton s={s} />
        </View>
      </View>
    </View>
  );
}

function Phone({ exam, s, avatar, onWatch }: { exam: Exam; s: ExamState; avatar: number; onWatch: () => void }) {
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={avatar} globe />
      <ScrollView contentContainerStyle={styles.phonePage}>
        <View style={styles.phonePad}>
          <Crumbs items={exam.phoneCrumbs} phone />
          <View style={styles.phoneTitleRow}>
            <Text style={styles.phoneTitle} accessibilityRole="header">
              {exam.phoneTitle}
            </Text>
            <TimerCard left={s.left} phone />
          </View>
        </View>
        <NavStrip s={s} />
        <View style={styles.legendP}>
          <Legend phone />
        </View>
        <View style={styles.rule} />
        <View style={styles.phonePad}>
          <QuestionHead s={s} phone />
          <QuestionBody s={s} phone />
          <View style={styles.watchPos}>
            <WalkthroughButton s={s} onPress={onWatch} phone />
          </View>
          <NavButtons s={s} phone />
        </View>
        <View style={styles.rule} />
        <View style={styles.phonePad}>
          <Text style={styles.autoTitle}>Auto-marking</Text>
          <AnswerBox s={s} phone />
          <Text style={styles.phoneProgress}>{`${s.marks.answered} of ${s.total} answered • ${s.marks.correct} correct • ${s.marks.incorrect} incorrect`}</Text>
          <SubmitButton s={s} phone />
        </View>
      </ScrollView>
    </View>
  );
}

/** Inventory 22: the living past-paper exam simulator with a countdown, navigator, instant marking, the official scheme and teacher walkthroughs. */
export default function PaperScreen() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) return <PreviewScreen back title="Past paper">{() => null}</PreviewScreen>;
  return <ExamView exam={mock.learner.examSimulator} avatar={mock.learner.dashboard.avatar} />;
}

function ExamView({ exam, avatar }: { exam: Exam; avatar: number }) {
  const s = useExam(exam);
  const [sheet, setSheet] = useState(false);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  const sheetView = <WalkthroughSheet exam={exam} s={s} open={sheet} onClose={() => setSheet(false)} />;
  if (!wide)
    return (
      <>
        <Phone exam={exam} s={s} avatar={avatar} onWatch={() => setSheet(true)} />
        {sheetView}
      </>
    );
  return (
    <ScrollView style={styles.deskBg} contentContainerStyle={styles.deskWrap}>
      <RefScale width={Math.min(width - 48, MAX_DESK_WIDTH)} refWidth={EXAM_REF_WIDTH}>
        <Desktop exam={exam} s={s} onExpand={() => setSheet(true)} />
      </RefScale>
      {sheetView}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flip: { transform: [{ scaleX: -1 }] },
  deskBg: { backgroundColor: '#EEF3FB' },
  deskWrap: { alignItems: 'center', paddingVertical: 16 },
  canvas: { width: EXAM_REF_WIDTH, height: EXAM_REF_HEIGHT, borderRadius: 12, backgroundColor: '#F7F9FD' },
  crumbsPos: { position: 'absolute', left: 22, top: 20 },
  title: { position: 'absolute', left: 22, top: 46, fontSize: 29, fontWeight: '800', color: INK, letterSpacing: -0.6 },
  sub: { position: 'absolute', left: 22, top: 87, fontSize: 15, color: BODY },
  exit: { position: 'absolute', left: 678, top: 37, width: 128, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 5, borderWidth: 1.5, borderColor: '#F3A9AB', backgroundColor: '#FFF6F6' },
  exitText: { fontSize: 14, color: RED },
  timerPos: { position: 'absolute', left: 828, top: 20, width: 306 },
  sectionsPos: { position: 'absolute', left: 22, top: 123 },
  panel: { position: 'absolute', top: 198, height: 714, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDF1F6' },
  leftPanel: { left: 16, width: 416, padding: 15 },
  navPos: { position: 'absolute', left: 17, top: 621, width: 385 },
  flag: { position: 'absolute', left: 16, top: 672, height: 34, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderRadius: 5, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  flagOn: { borderColor: '#F7C99A', backgroundColor: '#FFF7EE' },
  flagText: { fontSize: 13, color: INK },
  flagTextOn: { color: ORANGE },
  midPanel: { left: 437, width: 415, paddingTop: 12, paddingBottom: 50, paddingHorizontal: 10 },
  watchRow: { height: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 8 },
  watch: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 4, paddingRight: 10, borderRadius: 5, backgroundColor: '#EEF4FF' },
  watchPlay: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 4, backgroundColor: BLUE },
  watchText: { fontSize: 13.5, color: BLUE },
  videoPos: { marginTop: 12 },
  tabsPos: { flex: 1, marginTop: 16, marginBottom: 14 },
  otherPanel: { left: 16, width: 836, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  otherTitle: { fontSize: 18, fontWeight: '700', color: INK },
  otherBody: { maxWidth: 460, fontSize: 14, lineHeight: 21, color: BODY, textAlign: 'center' },
  otherBtn: { height: 42, paddingHorizontal: 22, justifyContent: 'center', borderRadius: 6, backgroundColor: '#0B6BFF' },
  side: { position: 'absolute', left: 871, top: 122, width: 263, height: 790, paddingTop: 22, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDF1F6' },
  sideTitle: { fontSize: 14.5, fontWeight: '700', color: INK },
  sideGap: { height: 22 },
  submitPos: { position: 'absolute', left: 7, right: 7, bottom: 26 },
  navBtns: { flexDirection: 'row', gap: 12 },
  navBtnsP: { gap: 15, marginTop: 12 },
  prev: { flex: 183, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 5, borderWidth: 1.5, borderColor: BLUE, backgroundColor: '#FFFFFF' },
  next: { flex: 190, height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 5, backgroundColor: '#0B6BFF' },
  btnP: { flex: 1, height: 42 },
  disabled: { opacity: 0.45 },
  prevText: { fontSize: 14.5, color: BLUE },
  nextText: { fontSize: 14.5, fontWeight: '500', color: '#FFFFFF' },
  phoneRoot: { flex: 1, backgroundColor: '#FFFFFF' },
  phonePage: { paddingBottom: 110 },
  phonePad: { paddingHorizontal: 16 },
  phoneTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 12, marginBottom: 16 },
  phoneTitle: { flexShrink: 1, fontSize: 17, fontWeight: '800', color: INK, letterSpacing: -0.3 },
  legendP: { marginTop: 12, paddingHorizontal: 12 },
  rule: { height: 1, marginVertical: 14, backgroundColor: '#E8EDF4' },
  watchPos: { marginTop: 12 },
  watchP: { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, borderRadius: 6, borderWidth: 1, borderColor: '#A9C4F5', backgroundColor: '#F2F7FE' },
  watchPlayP: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: BLUE },
  watchTextP: { fontSize: 13.5, fontWeight: '500', color: BLUE },
  autoTitle: { marginBottom: 10, fontSize: 13.5, fontWeight: '700', color: INK },
  phoneProgress: { marginTop: 14, marginBottom: 10, fontSize: 12, color: BODY },
  sheetBg: { flex: 1, alignItems: 'center', backgroundColor: 'rgba(8,12,20,0.88)' },
  sheet: { flex: 1, width: '100%', maxWidth: 760, padding: 12, gap: 12 },
  sheetBody: { flex: 1, borderRadius: 10, backgroundColor: '#FFFFFF' },
  sheetBodyIn: { padding: 16, paddingBottom: 40 },
  sheetTeacher: { marginBottom: 6, fontSize: 12, color: BODY },
  sheetBack: { height: 42, alignItems: 'center', justifyContent: 'center', marginTop: 24, borderRadius: 6, borderWidth: 1.5, borderColor: BLUE },
});
