import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import { AnnotatedStrip, AnnotatedViewer, VideoFeedback } from '@/features/learner/feedback/FeedbackMedia';
import { raceSummary } from '@/features/learner/cbc/CbcParts';
import { type Feedback, GradedChip, PracticeSheet, RaceBreakdown, ScoreCard, TeacherCard } from '@/features/learner/feedback/FeedbackParts';
import { BLUE, BODY, GREEN, INK } from '@/features/learner/work/MathText';
import { Crumbs } from '@/features/learner/work/WorkSide';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { identifierFor } from '@/lib/cbc';
import { mockData } from '@/lib/mock';

/** The feedback reference's page (x 18–1170 at 1536 wide); the desktop layout uses its pixels. */
const FB_REF_WIDTH = 1152;
const MAX_DESK_WIDTH = 1400;
const TOAST_MS = 2600;
const DESK_TABS = ['Overview', 'Detailed Feedback', 'Annotated Work', 'Voice/Video Feedback', 'Remedial Practice'] as const;
const PHONE_TABS = ['Overview', 'Feedback', 'Annotated Work'] as const;
const PURPLE = '#7C3AED';

type Actions = { practice: () => void; download: () => void };

const nextAction = (key: string, a: Actions) => {
  if (key === 'practice') a.practice();
  else if (key === 'chat') router.push('/inbox');
  else router.push('/learn/live');
};

function NextSteps({ f, a }: { f: Feedback; a: Actions }) {
  return (
    <View style={styles.next}>
      <View style={styles.nextIntro}>
        <Text style={styles.nextTitle}>Next Steps</Text>
        <Text style={styles.nextText}>Strengthen your understanding with personalized practice and a quick follow-up session.</Text>
      </View>
      {f.next.map((n, i) => (
        <View key={n.key} style={[styles.nextCard, i === 0 ? styles.nextFirst : styles.nextOther]}>
          <View style={styles.nextRow}>
            <Image source={n.icon} style={styles.nextIcon} />
            <View style={styles.flex}>
              <Text style={styles.nextCardTitle}>{n.title}</Text>
              <Text style={styles.nextCardSub}>{n.sub}</Text>
            </View>
          </View>
          <Pressable style={[styles.nextBtn, i === 0 ? styles.nextBtnFill : styles.nextBtnLine]} onPress={() => nextAction(n.key, a)} accessibilityRole="button">
            <Text style={[styles.nextBtnText, i > 0 && styles.blue]}>{n.action}</Text>
            <Icon name="arrowRight" size={16} color={i === 0 ? '#FFFFFF' : BLUE} />
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function Desktop({ f, a }: { f: Feedback; a: Actions }) {
  const [tab, setTab] = useState<(typeof DESK_TABS)[number]>('Overview');
  const videoTab = tab === 'Detailed Feedback' ? 'Transcript' : 'Chapters';
  return (
    <View style={styles.canvas}>
      <View style={styles.crumbsPos}>
        <Crumbs items={f.crumbs} />
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title} accessibilityRole="header">
          {f.title}
        </Text>
        <GradedChip />
        <Text style={styles.kind}>Activity of Integration</Text>
      </View>
      <Text style={styles.sub}>{`${f.submitted}   |   ${f.graded}`}</Text>
      <View style={styles.scorePos}>
        <ScoreCard f={f} />
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {DESK_TABS.map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => (t === 'Remedial Practice' ? a.practice() : setTab(t))} accessibilityRole="tab" accessibilityState={{ selected: t === tab }}>
            <Text style={[styles.tabText, t === tab && styles.tabOn]}>{t}</Text>
            {t === tab ? <View style={styles.tabLine} /> : null}
          </Pressable>
        ))}
      </View>
      <View style={[styles.card, styles.rubric]}>
        <RaceBreakdown f={f} />
      </View>
      <View style={[styles.card, styles.teacher]}>
        <TeacherCard f={f} />
      </View>
      <View style={[styles.card, styles.annotated, tab === 'Annotated Work' && styles.focus]}>
        <AnnotatedViewer f={f} onDownload={a.download} />
      </View>
      <View style={[styles.card, styles.video, (tab === 'Voice/Video Feedback' || tab === 'Detailed Feedback') && styles.focus]}>
        <VideoFeedback key={videoTab} f={f} startTab={videoTab} />
      </View>
      <View style={[styles.card, styles.nextPos]}>
        <NextSteps f={f} a={a} />
      </View>
    </View>
  );
}

function PhoneScore({ f }: { f: Feedback }) {
  const t = raceSummary(f.race);
  const [rubric, setRubric] = useState(false);
  return (
    <View style={styles.cardP}>
      <Text style={styles.cardTitleP}>Your Score</Text>
      <View style={styles.scoreRowP}>
        <ProgressRing value={t.percent / 100} size={84} stroke={8} color={GREEN} track="#DDF3E5" labelSize={18} />
        <View style={styles.flex}>
          <Text style={styles.scoreP}>{`${t.score} / ${t.max}`}</Text>
          <Text style={styles.verdictP}>{f.verdict}</Text>
          <Text style={styles.verdictTextP}>{f.verdictText}</Text>
        </View>
      </View>
      <Pressable style={styles.fold} onPress={() => setRubric(!rubric)} accessibilityRole="button" accessibilityState={{ expanded: rubric }}>
        <Text style={styles.foldText}>RACE Breakdown</Text>
        <Icon name={rubric ? 'chevronDown' : 'chevronRight'} size={14} color={INK} />
      </Pressable>
      {rubric ? <RaceBreakdown f={f} phone /> : null}
    </View>
  );
}

function Phone({ f, a, avatar }: { f: Feedback; a: Actions; avatar: number }) {
  const [tab, setTab] = useState<(typeof PHONE_TABS)[number]>('Overview');
  const t = raceSummary(f.race);
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={avatar} />
      <ScrollView contentContainerStyle={styles.phone}>
        <Crumbs items={f.phoneCrumbs} phone />
        <View style={styles.titleRowP}>
          <Text style={styles.titleP} accessibilityRole="header">
            {f.title.replace(': ', ':\n')}
          </Text>
          <GradedChip small />
        </View>
        <Text style={styles.scoreLineP}>
          <Text style={styles.scoreLineBold}>{`${t.score} / ${t.max}`}</Text>
          {`  ·  ${identifierFor(t.score, t.max).label}`}
        </Text>
        <View style={styles.tabsP} accessibilityRole="tablist">
          {PHONE_TABS.map((x) => (
            <Pressable key={x} style={styles.tabP} onPress={() => setTab(x)} accessibilityRole="tab" accessibilityState={{ selected: x === tab }}>
              <Text style={[styles.tabTextP, x === tab && styles.tabOn]}>{x}</Text>
              {x === tab ? <View style={styles.tabLine} /> : null}
            </Pressable>
          ))}
        </View>
        {tab === 'Overview' ? (
          <>
            <View style={styles.cardP}>
              <TeacherCard f={f} phone />
            </View>
            <PhoneScore f={f} />
            <View style={styles.cardP}>
              <AnnotatedStrip f={f} />
            </View>
            <Pressable style={[styles.btnP, styles.btnFill]} onPress={a.practice} accessibilityRole="button">
              <Icon name="send" size={15} color="#FFFFFF" />
              <Text style={styles.btnFillText}>Start Remedial Practice</Text>
            </Pressable>
            <View style={styles.btnRow}>
              <Pressable style={[styles.btnP, styles.btnGreen]} onPress={() => router.push('/inbox')} accessibilityRole="button">
                <Icon name="clock" size={15} color={GREEN} />
                <Text style={[styles.btnLineText, { color: '#15803D' }]}>Open Chat</Text>
              </Pressable>
              <Pressable style={[styles.btnP, styles.btnPurple]} onPress={() => router.push('/learn/live')} accessibilityRole="button">
                <Icon name="video" size={15} color={PURPLE} />
                <Text style={[styles.btnLineText, { color: PURPLE }]}>Book Tutor</Text>
              </Pressable>
            </View>
          </>
        ) : null}
        {tab === 'Feedback' ? (
          <>
            <View style={styles.cardP}>
              <VideoFeedback f={f} phone />
            </View>
            <View style={styles.cardP}>
              <RaceBreakdown f={f} phone />
            </View>
          </>
        ) : null}
        {tab === 'Annotated Work' ? (
          <View style={styles.cardP}>
            <AnnotatedViewer f={f} onDownload={a.download} />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

/** Inventory 28: marked work: rubric, annotated pages, the teacher's voice and video feedback, and one-tap practice. */
export default function FeedbackScreen() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) return <PreviewScreen back title="Feedback">{() => null}</PreviewScreen>;
  return <FeedbackView f={mock.learner.assignmentFeedback} avatar={mock.learner.dashboard.avatar} />;
}

function FeedbackView({ f, avatar }: { f: Feedback; avatar: number }) {
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  const [practice, setPractice] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const a: Actions = {
    practice: () => setPractice(true),
    download: () => {
      setToast('Annotated PDF downloaded • available offline');
      setTimeout(() => setToast(null), TOAST_MS);
    },
  };
  return (
    <View style={styles.flex}>
      {wide ? (
        <ScrollView style={styles.deskBg} contentContainerStyle={styles.deskWrap}>
          <RefScale width={Math.min(width - 48, MAX_DESK_WIDTH)} refWidth={FB_REF_WIDTH}>
            <Desktop f={f} a={a} />
          </RefScale>
        </ScrollView>
      ) : (
        <Phone f={f} a={a} avatar={avatar} />
      )}
      <PracticeSheet f={f} open={practice} onClose={() => setPractice(false)} />
      {toast ? (
        <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  blue: { color: BLUE },
  deskBg: { backgroundColor: '#EEF3FB' },
  deskWrap: { alignItems: 'center', paddingVertical: 16 },
  canvas: { width: FB_REF_WIDTH, height: 935, borderRadius: 12, backgroundColor: '#F4F8FD' },
  crumbsPos: { position: 'absolute', left: 23, top: 21 },
  titleRow: { position: 'absolute', left: 23, top: 50, flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 26, fontWeight: '800', color: INK, letterSpacing: -0.6 },
  sub: { position: 'absolute', left: 23, top: 89, fontSize: 13, color: BODY },
  kind: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6, backgroundColor: '#E6EEFC', fontSize: 12.5, fontWeight: '600', color: '#1450C8', overflow: 'hidden' },
  scorePos: { position: 'absolute', left: 749, top: 24, width: 390 },
  tabs: { position: 'absolute', left: 20, top: 126, width: 652, height: 38, flexDirection: 'row', borderRadius: 6, backgroundColor: '#FFFFFF' },
  tab: { justifyContent: 'center', paddingHorizontal: 18 },
  tabText: { fontSize: 12.5, color: INK },
  tabOn: { color: BLUE, fontWeight: '600' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 2.5, backgroundColor: BLUE },
  card: { position: 'absolute', padding: 13, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEFF6' },
  focus: { borderColor: '#A9C4F5' },
  rubric: { left: 20, top: 173, width: 347, height: 368 },
  teacher: { left: 20, top: 551, width: 347, height: 219 },
  annotated: { left: 377, top: 173, width: 437, height: 597 },
  video: { left: 824, top: 173, width: 315, height: 597 },
  nextPos: { left: 20, top: 787, width: 1119, height: 138, padding: 10 },
  next: { flex: 1, flexDirection: 'row', gap: 12 },
  nextIntro: { width: 130, paddingLeft: 8, paddingTop: 6 },
  nextTitle: { fontSize: 19, fontWeight: '800', color: INK, letterSpacing: -0.4 },
  nextText: { marginTop: 8, fontSize: 12.5, lineHeight: 17, color: BODY },
  nextCard: { justifyContent: 'space-between', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#EAEFF6' },
  nextFirst: { width: 304 },
  nextOther: { width: 314 },
  nextRow: { flexDirection: 'row', gap: 16 },
  nextIcon: { width: 44, height: 44 },
  nextCardTitle: { fontSize: 13, fontWeight: '600', color: INK },
  nextCardSub: { marginTop: 4, fontSize: 12, lineHeight: 16, color: BODY },
  nextBtn: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginLeft: 60, borderRadius: 5 },
  nextBtnFill: { backgroundColor: '#0B6BFF' },
  nextBtnLine: { borderWidth: 1.5, borderColor: '#7AA6F5', backgroundColor: '#FFFFFF' },
  nextBtnText: { fontSize: 13.5, fontWeight: '500', color: '#FFFFFF' },
  phoneRoot: { flex: 1, backgroundColor: '#F7F9FC' },
  phone: { gap: 12, padding: 16, paddingBottom: 110 },
  titleRowP: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  titleP: { flexShrink: 1, fontSize: 20, fontWeight: '800', color: INK, letterSpacing: -0.4 },
  scoreLineP: { marginTop: -6, alignSelf: 'flex-end', fontSize: 16, color: INK },
  scoreLineBold: { fontWeight: '800' },
  tabsP: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E3E8F0' },
  tabP: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center' },
  tabTextP: { fontSize: 12, color: INK },
  cardP: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E6EBF2', backgroundColor: '#FFFFFF' },
  cardTitleP: { fontSize: 13.5, fontWeight: '700', color: INK },
  scoreRowP: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  scoreP: { fontSize: 14, fontWeight: '700', color: INK },
  verdictP: { marginTop: 4, fontSize: 15, fontWeight: '700', color: '#1F3A2B' },
  verdictTextP: { marginTop: 3, fontSize: 11.5, lineHeight: 16, color: BODY },
  fold: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  foldText: { fontSize: 12.5, fontWeight: '700', color: INK },
  btnP: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6 },
  btnFill: { backgroundColor: '#0B6BFF' },
  btnFillText: { fontSize: 13.5, fontWeight: '500', color: '#FFFFFF' },
  btnRow: { flexDirection: 'row', gap: 12 },
  btnGreen: { flex: 1, borderWidth: 1.5, borderColor: GREEN, backgroundColor: '#FFFFFF' },
  btnPurple: { flex: 1, borderWidth: 1.5, borderColor: PURPLE, backgroundColor: '#FFFFFF' },
  btnLineText: { fontSize: 13.5, fontWeight: '500' },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center' },
  toastText: { maxWidth: 520, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(11,20,36,0.92)', fontSize: 13, color: '#FFFFFF', textAlign: 'center', overflow: 'hidden' },
});
