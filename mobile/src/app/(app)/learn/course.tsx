import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { DomainChip, SkillChip } from '@/features/learner/cbc/CbcParts';
import { useShell } from '@/components/ui';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { BadgesCard, type Course, LessonRow, ModuleCard, ProgressCard, ResourcesCard, SquadCard } from '@/features/learner/course/CourseParts';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { domainOf } from '@/lib/cbc';
import { mockData } from '@/lib/mock';

const INK = '#0B1424';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const TABS = ['Modules', 'Overview', 'Resources', 'Discussion', 'Study Squad'] as const;
/** The course reference's page width (x 18–1164 at 1536 wide); the desktop layout uses its pixels. */
const COURSE_REF_WIDTH = 1146;

function back() {
  if (router.canGoBack()) router.back();
  else router.push('/learn/explore');
}

function useCourseState(c: Course) {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Modules');
  const [open, setOpen] = useState(2);
  const [saved, setSaved] = useState<readonly number[]>([]);
  const [offline, setOffline] = useState(true);
  const [joined, setJoined] = useState(false);
  const toggle = (n: number) => setSaved((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n]));
  const saveAll = () => setSaved(c.modules.filter((m) => m.progress < 1).map((m) => m.n));
  return { tab, setTab, open, setOpen, saved, toggle, saveAll, offline, setOffline, joined, setJoined };
}
type State = ReturnType<typeof useCourseState>;

function Heading({ c, phone = false }: { c: Course; phone?: boolean }) {
  return (
    <>
      <Pressable style={styles.back} onPress={back} accessibilityRole="link">
        <Icon name="chevronLeft" size={14} color={BLUE} />
        <Text style={styles.backText}>Back to Courses</Text>
      </Pressable>
      <View style={styles.chips}>
        <Image source={c.subjectIcon} style={styles.subjIcon} />
        <Text style={styles.subj}>{c.subject}</Text>
        <Text style={styles.level}>{c.level}</Text>
      </View>
      <Text style={[styles.title, phone && styles.titleP]} accessibilityRole="header">
        {c.title}
      </Text>
    </>
  );
}

function Stats({ c, phone = false }: { c: Course; phone?: boolean }) {
  return (
    <View style={[styles.stats, phone && styles.statsP]}>
      {c.stats.slice(0, phone ? 3 : 4).map((s) => (
        <View key={s.label} style={styles.stat}>
          <Image source={s.icon} style={phone ? styles.statIconP : styles.statIcon} />
          <View>
            <Text style={[styles.statValue, phone && styles.statValueP]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function ContinueButton({ style }: { style?: object }) {
  return (
    <Pressable style={[styles.continue, style]} accessibilityRole="button" onPress={() => router.push('/learn/lesson')}>
      <Text style={styles.continueText}>Continue Lesson</Text>
      <Icon name="arrowRight" size={18} color="#FFFFFF" />
    </Pressable>
  );
}

function Tabs({ s, phone = false }: { s: State; phone?: boolean }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.tabs, phone && styles.tabsP]}>
      {TABS.slice(0, phone ? 4 : 5).map((t) => {
        const on = t === s.tab;
        return (
          <Pressable key={t} style={styles.tab} onPress={() => s.setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Text style={[styles.tabText, phone && styles.tabTextP, on && styles.tabOn]}>{t}</Text>
            {on ? <View style={styles.tabLine} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ModuleList({ c, s, phone = false }: { c: Course; s: State; phone?: boolean }) {
  return (
    <View style={styles.modules}>
      {c.modules.map((m) => (
        <ModuleCard key={m.n} m={m} on={m.n === s.open} saved={s.saved.includes(m.n)} onPress={() => s.setOpen(m.n)} onSave={() => s.toggle(m.n)} phone={phone} />
      ))}
    </View>
  );
}

function Desktop({ c, s }: { c: Course; s: State }) {
  const cur = c.current;
  return (
    <View style={styles.canvas}>
      <View style={styles.hero}>
        <Image source={c.hero} style={styles.heroPhoto} contentFit="fill" accessibilityLabel="A smiling learner with fraction doodles" />
        <View style={styles.heroCopy}>
          <Heading c={c} />
          <Text style={styles.sub}>{c.sub}</Text>
          <View style={styles.barRow}>
            <View style={styles.barWrap}>
              <Bar value={c.progress} color={BLUE} track="#DCE6F5" height={8} />
            </View>
            <Text style={styles.pct}>{`${Math.round(c.progress * 100)}% complete`}</Text>
          </View>
          <Stats c={c} />
        </View>
        <View style={styles.contBox}>
          <ContinueButton style={styles.contDesk} />
        </View>
      </View>
      <View style={styles.tabsRow}>
        <Tabs s={s} />
        <Pressable style={styles.dlAll} onPress={s.saveAll} accessibilityRole="button">
          <Icon name="download" size={18} color={BLUE} />
          <Text style={styles.dlAllText}>Download All Modules</Text>
        </Pressable>
      </View>
      <View style={styles.colModules}>
        <ModuleList c={c} s={s} />
      </View>
      <View style={styles.colMid}>
        <View style={styles.modCard}>
          <View style={styles.modHead}>
            <View style={styles.flex}>
              <Text style={styles.modTitle}>{cur.title}</Text>
              <Text style={styles.modSub}>{cur.sub}</Text>
              <View style={styles.outcomes}>
                <Text style={styles.outTitle}>NCDC learning outcomes</Text>
                {cur.outcomes.map((o) => (
                  <View key={o} style={styles.outRow}>
                    <DomainChip domain={domainOf(o)} />
                    <Text style={styles.outText}>{o}</Text>
                  </View>
                ))}
                <View style={styles.outRow}>
                  {cur.skills.map((k) => (
                    <SkillChip key={k} skill={k} />
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.offline}>
              <Switch value={s.offline} onValueChange={s.setOffline} trackColor={{ true: BLUE, false: '#C9D2E0' }} thumbColor="#FFFFFF" accessibilityLabel="Download for offline use" />
              <View>
                <Text style={styles.offlineText}>Download for offline use</Text>
                <Text style={styles.offlineSize}>{cur.size}</Text>
              </View>
            </View>
          </View>
          <View style={styles.lessons}>
            {cur.lessons.map((l) => (
              <LessonRow key={l.title} l={l} />
            ))}
          </View>
        </View>
        <ResourcesCard c={c} />
      </View>
      <View style={styles.colSide}>
        <ProgressCard c={c} />
        <SquadCard c={c} joined={s.joined} onJoin={() => s.setJoined((j) => !j)} />
        <BadgesCard c={c} />
      </View>
    </View>
  );
}

function Phone({ c, s }: { c: Course; s: State }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView style={styles.phoneBg} contentContainerStyle={[styles.phone, { paddingTop: insets.top + 12 }]}>
      <Heading c={c} phone />
      <Image source={c.heroPhone} style={styles.heroP} contentFit="cover" accessibilityLabel="A smiling learner with fraction doodles" />
      <View style={styles.barRow}>
        <View style={styles.flex}>
          <Bar value={c.progress} color={BLUE} track="#DCE6F5" height={8} />
        </View>
        <Text style={styles.pctP}>{`${Math.round(c.progress * 100)}% complete`}</Text>
      </View>
      <Stats c={c} phone />
      <ContinueButton style={styles.contP} />
      <Tabs s={s} phone />
      <ModuleList c={c} s={s} phone />
    </ScrollView>
  );
}

/** Inventory 12: a course overview with the 3-tap module map, offline downloads, progress and the study squad. */
export default function CourseScreen() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) return <PreviewScreen title="Course">{() => null}</PreviewScreen>;
  return <CourseView c={mock.learner.courseOverview} />;
}

function CourseView({ c }: { c: Course }) {
  const s = useCourseState(c);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!wide) return <Phone c={c} s={s} />;
  return (
    <ScrollView style={styles.deskBg} contentContainerStyle={styles.deskWrap}>
      <RefScale width={Math.min(width - 48, 1400)} refWidth={COURSE_REF_WIDTH}>
        <Desktop c={c} s={s} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  deskBg: { backgroundColor: '#F2F6FC' },
  deskWrap: { alignItems: 'center', paddingVertical: 16 },
  canvas: { width: COURSE_REF_WIDTH, height: 1010 },
  hero: { position: 'absolute', left: 0, top: 0, width: COURSE_REF_WIDTH, height: 292, overflow: 'hidden', borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: '#EEF4FC' },
  heroPhoto: { position: 'absolute', left: 598, top: 0, width: 546, height: 292 },
  heroCopy: { position: 'absolute', left: 36, top: 24, width: 560 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 12.5, color: BLUE },
  chips: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  subjIcon: { width: 30, height: 30, borderRadius: 7 },
  subj: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: '#EEF1F6', fontSize: 13, color: INK, overflow: 'hidden' },
  level: { fontSize: 13, color: BODY },
  title: { marginTop: 10, fontSize: 38, fontWeight: '800', color: INK, letterSpacing: -1 },
  titleP: { marginTop: 8, fontSize: 24, letterSpacing: -0.5 },
  sub: { marginTop: 8, fontSize: 18, lineHeight: 25, color: '#3D4656' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  barWrap: { width: 420 },
  pct: { fontSize: 13, color: INK },
  pctP: { fontSize: 11, color: INK },
  stats: { flexDirection: 'row', gap: 22, marginTop: 18 },
  statsP: { justifyContent: 'space-between', gap: 8, marginTop: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statIcon: { width: 32, height: 32 },
  statIconP: { width: 30, height: 30 },
  statValue: { fontSize: 15, fontWeight: '700', color: INK },
  statValueP: { fontSize: 13 },
  statLabel: { fontSize: 10.5, color: BODY },
  contBox: { position: 'absolute', left: 848, top: 208, width: 272, height: 66, padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF' },
  continue: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 6, backgroundColor: '#0B6BFF' },
  contDesk: { flex: 1 },
  continueText: { fontSize: 15, fontWeight: '500', color: '#FFFFFF' },
  contP: { marginTop: 4 },
  tabsRow: { position: 'absolute', left: 0, top: 292, width: COURSE_REF_WIDTH, height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#E3E8F0', backgroundColor: '#FFFFFF' },
  tabs: { gap: 26, paddingHorizontal: 16 },
  tabsP: { gap: 18, paddingHorizontal: 0 },
  tab: { paddingVertical: 14 },
  tabText: { fontSize: 14.5, color: '#3D4656' },
  tabTextP: { fontSize: 12.5 },
  tabOn: { color: BLUE, fontWeight: '600' },
  tabLine: { position: 'absolute', left: -6, right: -6, bottom: 0, height: 3, borderRadius: 2, backgroundColor: BLUE },
  dlAll: { width: 186, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 6, borderWidth: 1, borderColor: '#C9DAF8', backgroundColor: '#F2F7FE' },
  dlAllText: { fontSize: 13, color: BLUE },
  colModules: { position: 'absolute', left: 14, top: 367, width: 314 },
  modules: { gap: 8 },
  colMid: { position: 'absolute', left: 338, top: 367, width: 521, gap: 12 },
  modCard: { padding: 16, borderRadius: 10, backgroundColor: '#FFFFFF' },
  modHead: { flexDirection: 'row', gap: 12 },
  modTitle: { fontSize: 18.5, fontWeight: '700', color: INK },
  modSub: { marginTop: 8, fontSize: 11, lineHeight: 16, color: BODY },
  outcomes: { gap: 5, marginTop: 10 },
  outTitle: { fontSize: 11, fontWeight: '700', color: BLUE },
  outRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  outText: { flex: 1, fontSize: 11, color: INK },
  offline: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 },
  offlineText: { fontSize: 12, color: INK },
  offlineSize: { marginTop: 3, fontSize: 10.5, color: BODY },
  lessons: { gap: 8, marginTop: 14 },
  colSide: { position: 'absolute', left: 873, top: 367, width: 255, gap: 16 },
  phoneBg: { flex: 1, backgroundColor: '#F5F8FD' },
  phone: { gap: 12, padding: 16, paddingBottom: 110 },
  heroP: { width: '100%', aspectRatio: 462 / 202, borderRadius: 10 },
});
