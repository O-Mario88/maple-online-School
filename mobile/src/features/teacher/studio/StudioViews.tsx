import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { type SideItem, type TeacherMe, TeacherPhoneTop, TeacherSideNav, TeacherTopBar, useTeacherGo } from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, CANVAS, GREEN, INK, LINE, MUTED, Panel, TButton } from '@/features/teacher/frame/TeacherParts';
import type { StudioNew } from '@/mock/teacher-studio';

import { AddContent, PhoneSources, Processing, type StudioRun, useStudioRun } from './StudioInput';
import { type ReviewTab, PhoneReview, ReviewCourse, useCourseDraft } from './StudioReview';

/** The studio reference's desktop (top bar to the end of step 3), laid out in its pixels and scaled. */
export const STUDIO_REF_WIDTH = 1180;

const HOW = [
  'Add your content: a syllabus, worksheet, past paper, playlist or class link.',
  'The AI reads it and builds three levels of lessons, quizzes and competency tags in about a minute.',
  'Check everything, change what you like, then publish. Nothing goes live until you say so.',
];

/** Picks a template and starts a build from it. */
function Templates({ s, run, onClose }: { s: StudioNew; run: StudioRun; onClose: () => void }) {
  return (
    <Panel>
      <View style={styles.panelHead}>
        <Text style={styles.panelTitle}>Start from a template</Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close templates" hitSlop={8}>
          <Icon name="close" size={16} color={BODY} />
        </Pressable>
      </View>
      <View style={styles.templates}>
        {s.templates.map((t) => (
          <View key={t.title} style={styles.template}>
            <Text style={styles.templateTitle}>{t.title}</Text>
            <Text style={styles.templateSub}>{t.detail}</Text>
            <TButton label="Use template" variant="outline" onPress={() => { onClose(); run.start(`${t.title} template`); }} style={styles.templateBtn} />
          </View>
        ))}
      </View>
    </Panel>
  );
}

function HowItWorks({ onClose }: { onClose: () => void }) {
  return (
    <Panel>
      <View style={styles.panelHead}>
        <Text style={styles.panelTitle}>How it works</Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close how it works" hitSlop={8}>
          <Icon name="close" size={16} color={BODY} />
        </Pressable>
      </View>
      <View style={styles.how}>
        {HOW.map((h, i) => (
          <View key={h} style={styles.howItem}>
            <Text style={styles.howNum}>{i + 1}</Text>
            <Text style={styles.howText}>{h}</Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}

/** The sidebar's promo card and "Need ideas?" link. */
function SideCards({ s, onTemplates }: { s: StudioNew; onTemplates: () => void }) {
  const p = s.promo;
  return (
    <View style={styles.sideCards}>
      <View style={styles.promo}>
        <Image source={p.spark} style={styles.spark} contentFit="contain" />
        <Text style={styles.promoTitle}>{p.title}</Text>
        {p.points.map((x) => (
          <View key={x} style={styles.point}>
            <View style={styles.pointTick}>
              <Icon name="check" size={9} color="#FFFFFF" />
            </View>
            <Text style={styles.pointText}>{x}</Text>
          </View>
        ))}
        <Image source={p.robot} style={styles.robot} contentFit="contain" accessibilityLabel="A friendly robot helper" />
      </View>
      <Pressable style={styles.ideas} onPress={onTemplates} accessibilityRole="button" accessibilityLabel="Need ideas? Browse templates">
        <View style={styles.ideasIcon}>
          <Icon name="sparkle" size={14} color="#FFFFFF" />
        </View>
        <View>
          <Text style={styles.ideasTitle}>Need Ideas?</Text>
          <Text style={styles.ideasLink}>Browse Templates</Text>
        </View>
      </Pressable>
    </View>
  );
}

const SAME_PAGE: Readonly<Record<string, ReviewTab>> = {
  'Create New': 'structure',
  'Question Bank': 'quizzes',
  'Competency Tags': 'tags',
  Settings: 'settings',
};

function activeItem(tab: ReviewTab, templates: boolean): string {
  if (templates) return 'Templates';
  return Object.keys(SAME_PAGE).find((k) => SAME_PAGE[k] === tab) ?? 'Create New';
}

export function StudioDesk({ s, me }: { s: StudioNew; me: TeacherMe }) {
  const run = useStudioRun(s);
  const draft = useCourseDraft(s);
  const [tab, setTab] = useState<ReviewTab>('structure');
  const [templates, setTemplates] = useState(false);
  const [how, setHow] = useState(false);
  const onItem = (n: SideItem) => {
    if (n.label === 'Templates') {
      setTemplates(true);
      return true;
    }
    const t = SAME_PAGE[n.label];
    if (!t) return false;
    setTab(t);
    setTemplates(false);
    return true;
  };
  return (
    <View style={styles.canvas}>
      <TeacherTopBar active="Studio" me={me} placeholder="Search documents, topics, or courses..." />
      <View style={styles.body}>
        <TeacherSideNav title="AI Course Studio" items={s.nav} active={activeItem(tab, templates)} onItem={onItem}>
          <SideCards s={s} onTemplates={() => setTemplates(true)} />
        </TeacherSideNav>
        <View style={styles.main}>
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.title} accessibilityRole="header">
                Create a New Course with AI
              </Text>
              <Text style={styles.subtitle}>Upload your content or paste a link and let AI build a complete, interactive course in 60 seconds.</Text>
            </View>
            <Pressable style={styles.howBtn} onPress={() => setHow((h) => !h)} accessibilityRole="button" accessibilityState={{ expanded: how }} accessibilityLabel="How it works">
              <View style={styles.howPlay}>
                <Icon name="playFill" size={11} color="#FFFFFF" />
              </View>
              <Text style={styles.howBtnText}>How it works</Text>
            </Pressable>
          </View>
          {how ? <HowItWorks onClose={() => setHow(false)} /> : null}
          {templates ? <Templates s={s} run={run} onClose={() => setTemplates(false)} /> : null}
          <View style={styles.row}>
            <Panel style={styles.add}>
              <AddContent s={s} run={run} />
            </Panel>
            <Panel style={[styles.flex, styles.step]}>
              <Processing s={s} run={run} />
            </Panel>
          </View>
          <Panel style={styles.step}>
            <ReviewCourse s={s} run={run} draft={draft} tab={tab} setTab={setTab} />
          </Panel>
        </View>
      </View>
    </View>
  );
}

type PhoneTab = 'Create' | 'Templates';

export function StudioPhone({ s, me }: { s: StudioNew; me: TeacherMe }) {
  const go = useTeacherGo();
  const run = useStudioRun(s);
  const draft = useCourseDraft(s);
  const [tab, setTab] = useState<PhoneTab>('Create');
  return (
    <View style={styles.phoneRoot}>
      <TeacherPhoneTop me={me} />
      <ScrollView contentContainerStyle={styles.phone}>
        <View>
          <Text style={styles.titleP} accessibilityRole="header">
            AI Course Studio
          </Text>
          <Text style={styles.subP}>Turn any content into an interactive course in 60 seconds.</Text>
        </View>
        <View style={styles.segs} accessibilityRole="tablist">
          {(['Create', 'My Courses', 'Templates'] as const).map((t) => {
            const on = t === tab;
            return (
              <Pressable key={t} style={[styles.seg, on && styles.segOn]} onPress={() => (t === 'My Courses' ? go('/teach/course-editor') : setTab(t))} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[styles.segText, on && styles.segTextOn]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
        {tab === 'Templates' ? (
          <Templates s={s} run={run} onClose={() => setTab('Create')} />
        ) : (
          <>
            <Panel style={styles.cardP}>
              <PhoneSources s={s} run={run} />
            </Panel>
            <Panel style={styles.cardP}>
              <Processing s={s} run={run} phone />
            </Panel>
            <Panel style={styles.cardP}>
              <PhoneReview s={s} draft={draft} onEdit={() => go('/teach/course-editor')} />
            </Panel>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  canvas: { width: STUDIO_REF_WIDTH, padding: 14, gap: 8, backgroundColor: CANVAS },
  body: { flexDirection: 'row', gap: 8 },
  main: { flex: 1, gap: 12, paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  title: { fontSize: 29, fontWeight: '800', color: INK, letterSpacing: -0.6 },
  subtitle: { fontSize: 14.5, color: BODY, marginTop: 4 },
  howBtn: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE },
  howPlay: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: BLUE },
  howBtnText: { fontSize: 13.5, fontWeight: '600', color: BLUE },
  row: { flexDirection: 'row', gap: 12 },
  add: { width: 612, paddingTop: 11, paddingBottom: 10 },
  step: { paddingTop: 11, paddingBottom: 10 },
  panelHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panelTitle: { fontSize: 15, fontWeight: '700', color: INK },
  templates: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  template: { flexGrow: 1, flexBasis: 220, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  templateTitle: { fontSize: 13.5, fontWeight: '700', color: INK },
  templateSub: { fontSize: 12, color: BODY, marginTop: 3 },
  templateBtn: { marginTop: 10, alignSelf: 'flex-start', height: 32 },
  how: { gap: 8, marginTop: 10 },
  howItem: { flexDirection: 'row', gap: 10 },
  howNum: { width: 20, height: 20, borderRadius: 10, overflow: 'hidden', textAlign: 'center', lineHeight: 20, fontSize: 11, fontWeight: '700', color: '#FFFFFF', backgroundColor: BLUE },
  howText: { flex: 1, fontSize: 13, color: INK },
  sideCards: { gap: 10, marginTop: 16 },
  promo: { padding: 12, borderRadius: 10, backgroundColor: '#E6EEFB' },
  spark: { width: 40, height: 38 },
  promoTitle: { marginTop: 8, marginBottom: 10, fontSize: 13.5, lineHeight: 18, fontWeight: '800', color: INK },
  point: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingVertical: 3 },
  pointTick: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: GREEN },
  pointText: { fontSize: 11, color: INK },
  robot: { width: 56, height: 60, marginTop: 8 },
  ideas: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE },
  ideasIcon: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#7C4DDB' },
  ideasTitle: { fontSize: 12, fontWeight: '700', color: INK },
  ideasLink: { fontSize: 12.5, color: BLUE, marginTop: 2 },
  phoneRoot: { flex: 1, backgroundColor: '#F4F7FB' },
  phone: { gap: 12, padding: 14, paddingBottom: 110 },
  titleP: { fontSize: 20, fontWeight: '800', color: INK },
  subP: { fontSize: 12.5, color: BODY, marginTop: 4 },
  segs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: LINE },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 9, borderBottomWidth: 2.5, borderColor: 'transparent' },
  segOn: { borderColor: BLUE },
  segText: { fontSize: 13, color: MUTED },
  segTextOn: { color: BLUE, fontWeight: '600' },
  cardP: { padding: 12 },
});
