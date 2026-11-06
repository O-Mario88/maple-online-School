import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import { L, LightFrame } from '@/features/learner/frame/LightFrame';
import { useAccess } from '@/lib/access/access-context';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

import { ChalkThumb, LessonMenu, LessonStats, Picker, StatusChip } from './LessonParts';
import { clock, continueWatching, filterLessons, learningPath, type LessonSort, type LessonTab, lessonStatus, subjectProgress, topicsOf, type VideoLessonItem } from './videoLessons';
import { Maple } from '@/constants/maple';

type Hub = MockData['learner']['videoHub'];

const TABS: readonly { key: LessonTab; label: string; icon: 'play' | 'layers' | 'download' | 'bookmark' | 'check' }[] = [
  { key: 'all', label: 'All Lessons', icon: 'play' },
  { key: 'mine', label: 'My Subjects', icon: 'layers' },
  { key: 'downloaded', label: 'Downloaded', icon: 'download' },
  { key: 'later', label: 'Watch Later', icon: 'bookmark' },
  { key: 'completed', label: 'Completed', icon: 'check' },
];
const SORTS: readonly { value: LessonSort; label: string }[] = [
  { value: 'order', label: 'Lesson order' },
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Most viewed' },
  { value: 'rating', label: 'Top rated' },
];
/** Cards shown before "View all". */
const FIRST = 8;

/** Everything both layouts need: tabs, filters, what is saved, and what the buttons do. */
export function useVideoLessons(hub: Hub, startSubject?: string) {
  const { lockFor } = useAccess();
  const [tab, setTab] = useState<LessonTab>('all');
  const [subject, setSubject] = useState(startSubject && hub.subjects.includes(startSubject) ? startSubject : hub.subjects[0]);
  const [level, setLevel] = useState('all');
  const [topic, setTopic] = useState('all');
  const [sort, setSort] = useState<LessonSort>('order');
  const [downloaded, setDownloaded] = useState<readonly string[]>(hub.downloaded);
  const [later, setLater] = useState<readonly string[]>(hub.later);
  const [grid, setGrid] = useState(true);
  const [all, setAll] = useState(false);
  const toggle = (set: (f: (xs: readonly string[]) => readonly string[]) => void, on: string, off: string) => (l: VideoLessonItem) =>
    set((xs) => {
      const has = xs.includes(l.id);
      toast(has ? off : on);
      return has ? xs.filter((x) => x !== l.id) : [...xs, l.id];
    });
  const list = filterLessons(hub.lessons, { tab, subject, level: level === 'all' ? undefined : level, topic: topic === 'all' ? undefined : topic, sort, saved: { downloaded, later } });
  const cont = continueWatching(hub.lessons, subject);
  const topics = topicsOf(hub.lessons, subject);
  const pathTopic = topic !== 'all' ? topic : (cont?.topic ?? topics[0]);
  return {
    tab,
    setTab,
    subject,
    pickSubject: (v: string) => {
      setSubject(v);
      setTopic('all');
      setAll(false);
    },
    level,
    setLevel,
    topic,
    setTopic,
    sort,
    setSort,
    grid,
    setGrid,
    all,
    setAll,
    list,
    shown: all ? list : list.slice(0, FIRST),
    cont,
    total: hub.lessons.filter((l) => l.subject === subject).length,
    progress: subjectProgress(hub.lessons, subject),
    topics,
    pathTopic,
    path: pathTopic ? learningPath(hub.lessons, subject, pathTopic) : [],
    subjectOptions: hub.subjects.map((v) => ({ value: v, label: v })),
    levelOptions: [{ value: 'all', label: 'All levels' }, ...hub.levels],
    topicOptions: [{ value: 'all', label: 'All Topics' }, ...topics.map((v) => ({ value: v, label: v }))],
    locked: (l: VideoLessonItem) => lockFor('/learn/lesson', l.id) !== null,
    isLater: (l: VideoLessonItem) => later.includes(l.id),
    isDownloaded: (l: VideoLessonItem) => downloaded.includes(l.id),
    toggleLater: toggle(setLater, 'Saved to Watch Later.', 'Removed from Watch Later.'),
    toggleDownload: toggle(setDownloaded, 'Downloaded for offline viewing.', 'Download removed.'),
    open: (l: VideoLessonItem) => router.push(`/learn/lesson?id=${l.id}` as Href),
    restart: (l: VideoLessonItem) => {
      toast(`Starting ${l.title} from the beginning.`);
      router.push(`/learn/lesson?id=${l.id}` as Href);
    },
    quiz: () => router.push('/learn/paper' as Href),
  };
}
type V = ReturnType<typeof useVideoLessons>;

function Tabs({ v, phone = false }: { v: V; phone?: boolean }) {
  const row = (
    <View style={[s.tabs, phone && s.tabsP]} accessibilityRole="tablist">
      {TABS.map((t) => {
        const on = v.tab === t.key;
        return (
          <Pressable key={t.key} style={[s.tab, phone && s.tabP]} onPress={() => v.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={t.icon} size={phone ? 16 : 19} color={on ? L.blue : L.body} />
            <Text style={[s.tabText, phone && s.tabTextP, on && s.tabOn]}>{t.label}</Text>
            {on ? <View style={s.tabLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
  return phone ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  ) : (
    row
  );
}

function LessonCard({ v, l, width }: { v: V; l: VideoLessonItem; width: number }) {
  const locked = v.locked(l);
  return (
    <View style={[s.card, { width }]}>
      <Pressable onPress={() => v.open(l)} accessibilityRole="button" accessibilityLabel={`Lesson ${l.n}: ${l.title}${locked ? ', locked' : ''}`}>
        <ChalkThumb l={l} height={88} />
        <View style={s.cardBody}>
          <Text style={s.cardTitle} numberOfLines={2}>
            {l.title}
          </Text>
          <Text style={s.cardMeta}>{`Lesson ${l.n} • ${Math.round(l.seconds / 60)} min`}</Text>
          <LessonStats l={l} size={11.5} />
        </View>
      </Pressable>
      <View style={s.cardFoot}>
        <StatusChip l={l} locked={locked} small />
        <LessonMenu l={l} later={v.isLater(l)} downloaded={v.isDownloaded(l)} onLater={() => v.toggleLater(l)} onDownload={() => v.toggleDownload(l)} />
      </View>
    </View>
  );
}

function LessonRow({ v, l }: { v: V; l: VideoLessonItem }) {
  const locked = v.locked(l);
  return (
    <View style={s.row}>
      <Pressable style={s.rowMain} onPress={() => v.open(l)} accessibilityRole="button" accessibilityLabel={`Lesson ${l.n}: ${l.title}${locked ? ', locked' : ''}`}>
        <View style={s.rowThumb}>
          <ChalkThumb l={l} height={78} />
        </View>
        <View style={s.flex}>
          <Text style={s.cardTitle} numberOfLines={2}>
            {l.title}
          </Text>
          <Text style={s.cardMeta}>{`Lesson ${l.n} • ${Math.round(l.seconds / 60)} min • ${l.topic}`}</Text>
          <LessonStats l={l} size={11.5} />
          <StatusChip l={l} locked={locked} small />
        </View>
      </Pressable>
      <LessonMenu l={l} later={v.isLater(l)} downloaded={v.isDownloaded(l)} onLater={() => v.toggleLater(l)} onDownload={() => v.toggleDownload(l)} />
    </View>
  );
}

function Continue({ v, phone = false }: { v: V; phone?: boolean }) {
  const l = v.cont;
  if (!l) return null;
  const pct = Math.round((l.watched / l.seconds) * 100);
  return (
    <View style={[s.cont, phone && s.contP]}>
      <Pressable style={phone ? s.contThumbP : s.contThumb} onPress={() => v.open(l)} accessibilityRole="button" accessibilityLabel={`Resume ${l.title}`}>
        <ChalkThumb l={l} height={phone ? 170 : 146} big />
      </Pressable>
      <View style={s.flex}>
        <Text style={s.contKicker}>Continue Watching</Text>
        <Text style={s.contTitle}>{l.title}</Text>
        <Text style={s.contMeta}>{`${l.subject}  •  ${l.level}  •  Lesson ${l.n} of ${v.total}`}</Text>
        <Text style={s.contTime}>{`${clock(l.watched)} / ${clock(l.seconds)}  (${pct}%)`}</Text>
        <View style={s.bar}>
          <View style={[s.barFill, { width: `${pct}%` }]} />
        </View>
        <View style={s.contStats}>
          <LessonStats l={l} />
        </View>
      </View>
      <View style={[s.contActions, phone && s.contActionsP]}>
        <View style={s.contTop}>
          <Pressable style={s.resume} onPress={() => v.open(l)} accessibilityRole="button">
            <Icon name="playFill" size={15} color={L.white} />
            <Text style={s.resumeText}>Resume Lesson</Text>
          </Pressable>
          <LessonMenu l={l} later={v.isLater(l)} downloaded={v.isDownloaded(l)} onLater={() => v.toggleLater(l)} onDownload={() => v.toggleDownload(l)} />
        </View>
        <Pressable style={s.restart} onPress={() => v.restart(l)} accessibilityRole="button">
          <Icon name="restart" size={16} color={L.blue} />
          <Text style={s.restartText}>Restart Lesson</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Progress({ v }: { v: V }) {
  const p = v.progress;
  return (
    <View style={s.side}>
      <Text style={s.sideTitle}>{`Your Progress in ${v.subject}`}</Text>
      <View style={s.progRow}>
        <ProgressRing value={p.pct / 100} size={96} stroke={11} color={L.green} track={Maple.blueSelected} labelSize={22} />
        <View style={s.progList}>
          <ProgLine icon="playFill" color={L.green} text={`${p.completed} ${p.completed === 1 ? 'lesson' : 'lessons'} completed`} />
          <ProgLine icon="play" color={L.blue} text={`${p.inProgress} in progress`} />
          <ProgLine icon="clock" color={L.muted} text={`${p.notStarted} not started`} />
        </View>
      </View>
    </View>
  );
}

function ProgLine({ icon, color, text }: { icon: 'playFill' | 'play' | 'clock'; color: string; text: string }) {
  return (
    <View style={s.progLine}>
      <Icon name={icon} size={17} color={color} />
      <Text style={s.progText}>{text}</Text>
    </View>
  );
}

function Path({ v }: { v: V }) {
  if (!v.pathTopic) return null;
  return (
    <View style={s.side}>
      <Text style={s.sideTitle}>{`Learning Path: ${v.pathTopic}`}</Text>
      <Text style={s.sideSub}>{`Complete the lessons to master ${v.pathTopic}.`}</Text>
      <View style={s.steps}>
        {v.path.map((l) => {
          const st = lessonStatus(l);
          return (
            <Pressable key={l.id} style={[s.step, st === 'progress' && s.stepOn]} onPress={() => v.open(l)} accessibilityRole="button" accessibilityLabel={`${l.title}, ${st === 'done' ? 'completed' : st === 'progress' ? 'in progress' : 'not started'}`}>
              <View style={[s.dot, st === 'done' && s.dotDone, st === 'progress' && s.dotOn]}>
                {st === 'done' ? <Icon name="tick" size={16} color={L.white} /> : st === 'progress' ? <Icon name="playFill" size={11} color={L.blue} /> : null}
              </View>
              <View style={s.flex}>
                <Text style={[s.stepTitle, st === 'progress' && s.stepTitleOn]}>{l.title}</Text>
                <Text style={s.stepMeta}>
                  <Text style={st === 'done' ? s.doneText : st === 'progress' ? s.onText : null}>{st === 'done' ? '✓ Completed' : st === 'progress' ? 'In Progress' : 'Not Started'}</Text>
                  {`  •  ${Math.round(l.seconds / 60)} min`}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Pressable style={s.quiz} onPress={v.quiz} accessibilityRole="button">
        <Icon name="target" size={20} color={L.blue} />
        <Text style={s.quizText}>Take Topic Quiz</Text>
      </Pressable>
    </View>
  );
}

function Filters({ v, phone = false }: { v: V; phone?: boolean }) {
  return (
    <View style={phone ? s.filtersP : s.filters}>
      <Picker label="Subject" icon="layers" value={v.subject} options={v.subjectOptions} onChange={v.pickSubject} width={phone ? undefined : 264} />
      <Picker label="Level" icon="cap" value={v.level} options={v.levelOptions} onChange={v.setLevel} width={phone ? undefined : 268} />
      <Picker label="Topic" icon="flag" value={v.topic} options={v.topicOptions} onChange={v.setTopic} width={phone ? undefined : 281} />
      {phone ? null : <View style={s.flex} />}
      <Picker label="Sort" icon="sync" value={v.sort} options={SORTS} onChange={v.setSort} width={phone ? undefined : 232} />
    </View>
  );
}

function Empty({ v }: { v: V }) {
  const text = v.tab === 'downloaded' ? 'Nothing downloaded yet. Use ⋮ on a lesson to download it for offline viewing.' : v.tab === 'later' ? 'Nothing saved yet. Use ⋮ on a lesson to watch it later.' : v.tab === 'completed' ? 'No lessons completed here yet.' : 'No lessons match these filters.';
  return <Text style={s.empty}>{text}</Text>;
}

function Grid({ v, phone = false }: { v: V; phone?: boolean }) {
  const width = phone ? 0 : 206;
  return (
    <View style={[s.gridCard, phone && s.gridCardP]}>
      <View style={s.gridHead}>
        <View style={s.flex}>
          <Text style={s.gridTitle}>{`${v.subject} – Video Lessons`}</Text>
          <Text style={s.gridSub}>{`${v.list.length} ${v.list.length === 1 ? 'lesson' : 'lessons'} • ${v.topics.length} ${v.topics.length === 1 ? 'topic' : 'topics'}`}</Text>
        </View>
        {phone ? null : (
          <View style={s.views}>
            <Pressable style={[s.viewBtn, v.grid && s.viewBtnOn]} onPress={() => v.setGrid(true)} accessibilityRole="button" accessibilityLabel="Grid view" accessibilityState={{ selected: v.grid }}>
              <Icon name="grid" size={18} color={v.grid ? L.white : L.ink} />
            </Pressable>
            <Pressable style={[s.viewBtn, !v.grid && s.viewBtnOn]} onPress={() => v.setGrid(false)} accessibilityRole="button" accessibilityLabel="List view" accessibilityState={{ selected: !v.grid }}>
              <Icon name="list" size={18} color={!v.grid ? L.white : L.ink} />
            </Pressable>
          </View>
        )}
      </View>
      {v.list.length === 0 ? <Empty v={v} /> : null}
      {phone || !v.grid ? (
        <View style={s.rows}>
          {v.shown.map((l) => (
            <LessonRow key={l.id} v={v} l={l} />
          ))}
        </View>
      ) : (
        <View style={s.gridWrap}>
          {v.shown.map((l) => (
            <LessonCard key={l.id} v={v} l={l} width={width} />
          ))}
        </View>
      )}
      {v.list.length > FIRST ? (
        <Pressable onPress={() => v.setAll(!v.all)} accessibilityRole="link" style={s.more}>
          <Text style={s.moreText}>{v.all ? 'Show fewer' : `View all ${v.list.length} lessons`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Video Lessons on wide screens: the reference, in the light learner frame. */
export function VideoLessonsDesk({ hub, avatar, subject }: { hub: Hub; avatar?: number; subject?: string }) {
  const v = useVideoLessons(hub, subject);
  return (
    <LightFrame>
      <View style={s.heroPhoto} pointerEvents="none">
        <Image source={hub.hero} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="right" />
        <LinearGradient colors={[L.canvas, 'rgba(246,248,253,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 0.45, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </View>
      <View style={s.head}>
        <View style={s.headIcon}>
          <Icon name="playFill" size={28} color={L.blue} />
        </View>
        <View>
          <Text style={s.title} accessibilityRole="header">
            Video Lessons
          </Text>
          <Text style={s.sub}>Watch, learn and master topics with high-quality, exam-focused video lessons.</Text>
        </View>
      </View>
      <View style={s.tabsWrap}>
        <Tabs v={v} />
      </View>
      <Filters v={v} />
      <View style={s.cols}>
        <View style={s.left}>
          <Continue v={v} />
          <Grid v={v} />
        </View>
        <View style={s.right}>
          <Progress v={v} />
          <Path v={v} />
        </View>
      </View>
    </LightFrame>
  );
}

/** Video Lessons on phones. */
export function VideoLessonsPhone({ hub, avatar, subject }: { hub: Hub; avatar?: number; subject?: string }) {
  const v = useVideoLessons(hub, subject);
  return (
    <View style={s.phoneRoot}>
      {avatar ? <LearnerPhoneTop avatar={avatar} /> : null}
      <ScrollView contentContainerStyle={s.phone}>
        <View style={s.headP}>
          <View style={[s.headIcon, s.headIconP]}>
            <Icon name="playFill" size={22} color={L.blue} />
          </View>
          <View style={s.flex}>
            <Text style={s.titleP} accessibilityRole="header">
              Video Lessons
            </Text>
            <Text style={s.subP}>Exam-focused lessons to watch at your own pace.</Text>
          </View>
        </View>
        <Tabs v={v} phone />
        <Filters v={v} phone />
        <Continue v={v} phone />
        <Progress v={v} />
        <Grid v={v} phone />
        <Path v={v} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  heroPhoto: { position: 'absolute', top: -20, right: -16, width: 500, height: 168, overflow: 'hidden' },
  head: { height: 92, flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  headIcon: { width: 57, height: 57, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: Maple.blueSelected },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '700', color: L.navy },
  sub: { marginTop: 6, fontSize: 16, color: L.body },
  tabsWrap: { width: 829, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: L.line },
  tabs: { flexDirection: 'row', paddingHorizontal: 8 },
  tabsP: { paddingHorizontal: 0, gap: 4 },
  tab: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 18 },
  tabP: { height: 44, paddingHorizontal: 10 },
  tabText: { fontSize: 14.5, fontWeight: '500', color: L.body },
  tabTextP: { fontSize: 13.5 },
  tabOn: { fontWeight: '700', color: L.blue },
  tabLine: { position: 'absolute', left: 8, right: 8, bottom: 0, height: 3, borderRadius: 2, backgroundColor: L.blue },
  filters: { marginTop: 17, flexDirection: 'row', alignItems: 'center', gap: 20 },
  filtersP: { gap: 8 },
  cols: { marginTop: 16, flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  left: { width: 931, gap: 16 },
  right: { flex: 1, gap: 16 },
  cont: { flexDirection: 'row', gap: 22, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  contP: { flexDirection: 'column', gap: 12, padding: 14 },
  contThumb: { width: 283 },
  contThumbP: { width: '100%' },
  contKicker: { fontSize: 14, fontWeight: '600', color: L.blue },
  contTitle: { marginTop: 8, fontSize: 18, lineHeight: 24, fontWeight: '700', color: L.navy },
  contMeta: { marginTop: 6, fontSize: 14, color: L.body },
  contTime: { marginTop: 14, fontSize: 14, color: L.ink },
  bar: { marginTop: 8, width: '100%', maxWidth: 296, height: 6, borderRadius: 3, backgroundColor: Maple.blueSelected },
  barFill: { height: 6, borderRadius: 3, backgroundColor: L.blue },
  contStats: { marginTop: 10 },
  contActions: { alignItems: 'center', gap: 16 },
  contActionsP: { alignItems: 'stretch' },
  contTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  resume: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, height: 40, borderRadius: 20, backgroundColor: L.blue },
  resumeText: { fontSize: 14.5, fontWeight: '600', color: L.white },
  restart: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  restartText: { fontSize: 14, fontWeight: '600', color: L.blue },
  side: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  sideTitle: { fontSize: 19, lineHeight: 25, fontWeight: '700', color: L.navy },
  sideSub: { marginTop: 4, fontSize: 13.5, color: L.body },
  progRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 22 },
  progList: { gap: 12 },
  progLine: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progText: { fontSize: 14.5, color: L.ink },
  steps: { marginTop: 14, gap: 6 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 10, borderRadius: 12 },
  stepOn: { backgroundColor: Maple.blueSelected },
  dot: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 2, borderColor: Maple.borderStrong, backgroundColor: L.white },
  dotDone: { borderColor: L.green, backgroundColor: L.green },
  dotOn: { borderColor: L.blue },
  stepTitle: { fontSize: 14.5, fontWeight: '600', color: L.navy },
  stepTitleOn: { color: L.blue },
  stepMeta: { marginTop: 2, fontSize: 12.5, color: L.muted },
  doneText: { color: L.green },
  onText: { color: L.blue },
  quiz: { marginTop: 14, height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 12, backgroundColor: Maple.blueSelected },
  quizText: { fontSize: 15, fontWeight: '600', color: L.blue },
  gridCard: { padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  gridCardP: { padding: 14 },
  gridHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  gridTitle: { fontSize: 22, lineHeight: 28, fontWeight: '700', color: L.navy },
  gridSub: { marginTop: 2, fontSize: 14, color: L.body },
  views: { flexDirection: 'row', gap: 6 },
  viewBtn: { width: 40, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 9, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  viewBtnOn: { borderColor: L.blue, backgroundColor: L.blue },
  gridWrap: { marginTop: 14, flexDirection: 'row', flexWrap: 'wrap', gap: 21 },
  card: { overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardBody: { gap: 5, padding: 10 },
  cardTitle: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: L.navy },
  cardMeta: { fontSize: 12, color: L.body },
  cardFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingBottom: 10 },
  rows: { marginTop: 12, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  rowMain: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowThumb: { width: 128 },
  more: { marginTop: 14, alignSelf: 'center' },
  moreText: { fontSize: 14.5, fontWeight: '600', color: L.blue },
  empty: { paddingVertical: 26, fontSize: 14, color: L.body, textAlign: 'center' },
  phoneRoot: { flex: 1, backgroundColor: L.canvas },
  phone: { gap: 14, padding: 16, paddingBottom: 110 },
  headP: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headIconP: { width: 46, height: 46 },
  titleP: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: L.navy },
  subP: { fontSize: 13.5, color: L.body },
});
