import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import { leafState, overall, topicState } from '@/lib/progress';
import type { IconName } from '@/lib/icons';

import { TONE } from './SkillTree';
import type { Progress, ProgressState, View as PageView } from './useProgress';

const NAVY = '#16213E';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const pct = (done: number, total: number) => (total === 0 ? 0 : Math.round((done / total) * 100));

export function GreatProgress({ p, s, phone = false }: { p: Progress; s: ProgressState; phone?: boolean }) {
  return (
    <View style={[styles.great, phone && styles.greatP]}>
      <Image source={p.trophy} style={styles.trophy} contentFit="contain" />
      <View style={styles.flex}>
        <Text style={styles.greatTitle}>{`Great progress, ${p.learner}!`}</Text>
        <Text style={styles.greatSub}>{`You've mastered ${p.termMastered} skills this term.`}</Text>
      </View>
      <Pressable style={styles.keepGoing} onPress={() => (s.milestone ? router.push('/learn/course') : router.push('/learn/paper'))} accessibilityRole="button">
        <Text style={styles.keepText}>Keep Going</Text>
        <Icon name="arrowRight" size={14} color={BLUE} />
      </Pressable>
    </View>
  );
}

export function SubjectTabs({ s }: { s: ProgressState }) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {s.subjects.map((x, i) => {
        const on = i === s.subjectIndex;
        return (
          <Pressable key={x.name} style={styles.tab} onPress={() => s.setSubject(i)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Image source={x.icon} style={styles.tabIcon} contentFit="contain" />
            <View>
              <Text style={styles.tabName}>{x.name}</Text>
              <Text style={styles.tabCount}>{`${x.done} / ${x.total} skills`}</Text>
            </View>
            {on ? <View style={styles.tabLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const MENU: readonly { view: PageView; label: string; icon: IconName }[] = [
  { view: 'overview', label: 'Progress Overview', icon: 'chart' },
  { view: 'tree', label: 'Skill Tree', icon: 'share' },
  { view: 'analytics', label: 'Subject Analytics', icon: 'chart' },
  { view: 'history', label: 'Practice History', icon: 'clipboard' },
  { view: 'badges', label: 'Badges & Certificates', icon: 'trophy' },
  { view: 'goals', label: 'Goals', icon: 'flag' },
  { view: 'reports', label: 'Reports', icon: 'notes' },
  { view: 'time', label: 'Learning Time', icon: 'clock' },
];

export function SideMenu({ s }: { s: ProgressState }) {
  return (
    <View style={styles.menu}>
      {MENU.map((m) => {
        const on = s.view === m.view;
        return (
          <Pressable key={m.view} style={[styles.menuItem, on && styles.menuOn]} onPress={() => s.setView(m.view)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={m.icon} size={17} color={on ? BLUE : '#3B4456'} />
            <Text style={[styles.menuText, on && styles.menuTextOn]}>{m.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Milestone({ p, s }: { p: Progress; s: ProgressState }) {
  const m = s.milestone;
  return (
    <View style={styles.box}>
      <View style={styles.milestoneTop}>
        <Image source={p.milestoneIcon} style={styles.milestoneIcon} contentFit="contain" />
        <View style={styles.flex}>
          <Text style={styles.boxTitle}>Your Next Milestone</Text>
          {m ? (
            <Text style={styles.milestoneText}>
              {`Complete ${m.left} more skill${m.left === 1 ? '' : 's'} in ${m.topic} to unlock `}
              <Text style={styles.bold}>{m.unlock}</Text>
            </Text>
          ) : (
            <Text style={styles.milestoneText}>{`Everything in ${s.subject.name} is unlocked. Keep your gold skills fresh.`}</Text>
          )}
        </View>
      </View>
      {m ? (
        <View style={styles.barRow}>
          <View style={styles.flex}>
            <Bar value={m.done / m.total} color="#0B6BFF" track="#E4ECF6" height={8} />
          </View>
          <Text style={styles.barText}>{`${m.done} / ${m.total}`}</Text>
        </View>
      ) : null}
      <Pressable style={styles.primary} onPress={() => router.push('/learn/course')} accessibilityRole="button">
        <Text style={styles.primaryText}>Continue Learning</Text>
      </Pressable>
    </View>
  );
}

export function Achievements({ p, s, limit = 4 }: { p: Progress; s: ProgressState; limit?: number }) {
  return (
    <View style={styles.box}>
      <View style={styles.headRow}>
        <Text style={[styles.boxTitleSm, styles.tight]}>Recent Achievements</Text>
        <Pressable style={styles.pill} onPress={() => s.setView('badges')} accessibilityRole="link">
          <Text style={styles.pillText}>See All</Text>
        </Pressable>
      </View>
      {p.achievements.slice(0, limit).map((a) => (
        <View key={a.title} style={styles.ach}>
          <Image source={a.icon} style={styles.achIcon} contentFit="contain" />
          <View style={styles.flex}>
            <Text style={styles.achTitle}>{a.title}</Text>
            <Text style={styles.achSub}>{a.sub}</Text>
            <Text style={styles.achSub}>{a.when}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function OverallCard({ p, s }: { p: Progress; s: ProgressState }) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxTitleSm}>Overall Progress</Text>
      <View style={styles.overallRow}>
        <ProgressRing value={s.totals.percent / 100} size={78} stroke={9} color="#1FA35C" track="#DCEFE4" labelSize={18} />
        <View style={styles.flex}>
          <Text style={styles.overallBig}>{`${s.totals.done} / ${s.totals.total}`}</Text>
          <Text style={styles.overallSub}>skills mastered</Text>
          <View style={styles.gain}>
            <Text style={styles.gainText}>{'↑ '}</Text>
            <Text style={styles.gainText}>{`+${p.monthGain}% this month`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export function BySubject({ s }: { s: ProgressState }) {
  return (
    <View style={styles.box}>
      <Text style={styles.boxTitleSm}>Progress by Subject</Text>
      <View style={styles.subjList}>
        {s.subjects.map((x, i) => (
          <Pressable key={x.name} style={styles.subjRow} onPress={() => s.setSubject(i)} accessibilityRole="button" accessibilityLabel={`${x.name}: ${pct(x.done, x.total)}%`}>
            <Image source={x.icon} style={styles.subjIcon} contentFit="contain" />
            <View style={styles.flex}>
              <Text style={styles.subjName}>{x.name}</Text>
              <Bar value={x.done / x.total} color={x.color} track="#EEF2F7" height={5} />
            </View>
            <Text style={styles.subjPct}>{`${pct(x.done, x.total)}%`}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const CHART_MAX = 3;

export function Activity({ p, s, tall = false }: { p: Progress; s: ProgressState; tall?: boolean }) {
  const data = p.activity[s.period];
  const h = tall ? 200 : 76;
  return (
    <View style={styles.box}>
      <View style={styles.headRow}>
        <Text style={styles.boxTitleSm}>Learning Activity</Text>
        <Pressable style={styles.period} onPress={() => s.setPeriod(s.period === 'week' ? 'month' : 'week')} accessibilityRole="button" accessibilityLabel={`Showing ${s.period === 'week' ? 'this week' : 'this month'}. Switch`}>
          <Text style={styles.periodText}>{s.period === 'week' ? 'This Week' : 'This Month'}</Text>
          <Icon name="chevronDown" size={11} color={NAVY} />
        </Pressable>
      </View>
      <View style={styles.chart}>
        <View style={[styles.axis, { height: h }]}>
          {['3h', '2h', '1h', '0h'].map((l) => (
            <Text key={l} style={styles.axisText}>
              {l}
            </Text>
          ))}
        </View>
        <View style={styles.flex}>
          <View style={[styles.bars, { height: h }]}>
            {data.map((day, i) => (
              <View key={p.activity.days[i]} style={styles.barCol} accessibilityLabel={`${p.activity.days[i]}: ${day.reduce((a, b) => a + b, 0).toFixed(1)} hours`}>
                {day.map((v, k) => (v > 0 ? <View key={k} style={{ height: (v / CHART_MAX) * h, backgroundColor: p.activity.categories[k].color }} /> : null)).reverse()}
              </View>
            ))}
          </View>
          <View style={styles.days}>
            {p.activity.days.map((d) => (
              <Text key={d} style={styles.dayText}>
                {d}
              </Text>
            ))}
          </View>
        </View>
      </View>
      <View style={styles.keys}>
        {p.activity.categories.map((c) => (
          <View key={c.label} style={styles.key}>
            <View style={[styles.keyDot, { backgroundColor: c.color }]} />
            <Text style={styles.keyText}>{c.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function Goals({ p, s }: { p: Progress; s: ProgressState }) {
  return (
    <View style={styles.box}>
      <View style={styles.headRow}>
        <Text style={styles.boxTitleSm}>Your Learning Goals</Text>
        <Pressable style={styles.pill} onPress={() => s.setView('goals')} accessibilityRole="link">
          <Text style={styles.pillText}>See All</Text>
        </Pressable>
      </View>
      {p.goals.map((g) => (
        <Pressable key={g.title} style={styles.goal} onPress={() => (g.subject >= 0 ? s.openNode(g.subject, g.node) : router.push('/learn/library'))} accessibilityRole="button" accessibilityLabel={`${g.title}: ${g.done} of ${g.total} ${g.unit}`}>
          <Image source={g.icon} style={styles.goalIcon} contentFit="contain" />
          <Text style={styles.goalTitle}>{g.title}</Text>
          <Text style={styles.goalCount}>{`${g.done} / ${g.total} ${g.unit}`}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** What a tapped node is, how far along it is, and the next thing to do. */
export function NodeDialog({ s }: { s: ProgressState }) {
  const x = s.picked;
  const tree = s.tree;
  if (!x) return null;
  const topic = x.topic ? tree.topics.find((t) => t.id === x.topic) : undefined;
  const leaf = topic?.leaves.find((l) => l.id === x.id);
  const branch = !leaf ? tree.topics.find((t) => t.id === x.id) : undefined;
  const head = !leaf && !branch ? (x.id === tree.root.id ? tree.root : x.id === tree.capstone.id ? tree.capstone : undefined) : undefined;
  const st = leaf && topic ? leafState(tree, topic, leaf) : topicState(tree, x.id);
  const t = TONE[st];
  const name = leaf?.name ?? branch?.name ?? head?.name ?? '';
  const prereq: readonly string[] = branch?.prereq ?? (x.id === tree.capstone.id ? tree.capstone.prereq : []);
  const nameOf = (id: string) => tree.topics.find((tp) => tp.id === id)?.name ?? (id === tree.root.id ? tree.root.name : id);
  const blockers = prereq.filter((id) => topicState(tree, id) !== 'mastered').map(nameOf);
  const counts = branch ?? head;
  const leafText = () => {
    if (!leaf) return '';
    if (st === 'mastered') return 'Mastered. Practise now and then to keep it gold.';
    if (st === 'review') return leaf.due ? 'Mastered, and due for a quick review so you keep it.' : `Recent accuracy ${leaf.accuracy ?? 0}%. A short review will lift it.`;
    if (st === 'progress') return `You've started this skill${leaf.accuracy ? ` (accuracy ${leaf.accuracy}%)` : ''}.`;
    const before = leaf.after ? topic?.leaves.find((l) => l.id === leaf.after)?.name : undefined;
    return `Unlocks when you master ${before ?? topic?.name}.`;
  };
  const detail = leaf ? leafText() : counts ? `${counts.done} of ${counts.total} skills mastered.${st === 'locked' && blockers.length ? ` Unlocks when you master ${blockers.join(' and ')}.` : ''}` : '';
  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => s.pick(null)}>
      <View style={styles.scrim}>
        <View style={styles.dialog}>
          <View style={styles.dialogHead}>
            <View style={[styles.dialogDot, { backgroundColor: t.dot, borderColor: t.halo }]}>
              <Icon name={t.icon} size={14} color="#FFFFFF" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.dialogTitle}>{name}</Text>
              <Text style={styles.dialogMeta}>{`${s.subject.name}${topic ? ` • ${topic.name}` : ''}`}</Text>
            </View>
            <Pressable onPress={() => s.pick(null)} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <Icon name="close" size={18} color={NAVY} />
            </Pressable>
          </View>
          <Text style={[styles.stateChip, { backgroundColor: t.fill, borderColor: t.border }]}>{t.label}</Text>
          <Text style={styles.dialogText}>{detail}</Text>
          {branch && branch.leaves.length > 0 ? (
            <View style={styles.leafList}>
              {branch.leaves.map((l) => {
                const ls = leafState(tree, branch, l);
                return (
                  <Pressable key={l.id} style={styles.leafRow} onPress={() => s.pick({ id: l.id, topic: branch.id })} accessibilityRole="button">
                    <View style={[styles.keyDot, { backgroundColor: TONE[ls].dot }]} />
                    <Text style={styles.leafRowText}>{l.name}</Text>
                    <Text style={styles.achSub}>{TONE[ls].label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          <View style={styles.actions}>
            {st === 'locked' ? (
              <Pressable style={[styles.primary, styles.flex]} onPress={() => s.pick(null)} accessibilityRole="button">
                <Text style={styles.primaryText}>Got it</Text>
              </Pressable>
            ) : (
              <>
                <Pressable style={[styles.primary, styles.flex]} onPress={() => router.push('/learn/paper')} accessibilityRole="button">
                  <Text style={styles.primaryText}>{st === 'mastered' ? 'Practise' : 'Practise now'}</Text>
                </Pressable>
                <Pressable style={[styles.secondary, styles.flex]} onPress={() => router.push('/learn/course')} accessibilityRole="button">
                  <Text style={styles.secondaryText}>Continue learning</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** The sidebar views other than the overview, shown in place of the skill tree. */
export function SideView({ p, s }: { p: Progress; s: ProgressState }) {
  switch (s.view) {
    case 'analytics':
      return (
        <View style={styles.viewGap}>
          <BySubject s={s} />
          <View style={styles.box}>
            <Text style={styles.boxTitleSm}>{`${s.subject.name}: skills by state`}</Text>
            <View style={styles.stateGrid}>
              {(['mastered', 'review', 'progress', 'locked'] as const).map((k) => (
                <View key={k} style={[styles.stateCard, { backgroundColor: TONE[k].fill, borderColor: TONE[k].border }]}>
                  <Text style={styles.stateN}>{s.counts[k]}</Text>
                  <Text style={styles.achSub}>{TONE[k].label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      );
    case 'history':
      return (
        <View style={styles.box}>
          <Text style={styles.boxTitleSm}>Practice History</Text>
          {p.history.map((h) => (
            <View key={h.when + h.title} style={styles.histRow}>
              <View style={styles.flex}>
                <Text style={styles.achTitle}>{h.title}</Text>
                <Text style={styles.achSub}>{`${h.subject} • ${h.when} • ${h.minutes} min`}</Text>
              </View>
              <Text style={styles.histScore}>{h.score}</Text>
            </View>
          ))}
        </View>
      );
    case 'badges':
      return (
        <View style={styles.box}>
          <Text style={styles.boxTitleSm}>Badges & Certificates</Text>
          <View style={styles.badgeGrid}>
            {p.achievements.map((a) => (
              <View key={a.title} style={styles.badgeCard}>
                <Image source={a.icon} style={styles.badgeImg} contentFit="contain" />
                <Text style={styles.achTitle}>{a.title}</Text>
                <Text style={styles.achSub}>{`${a.sub} • ${a.when}`}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'goals':
      return (
        <View style={styles.box}>
          <Text style={styles.boxTitleSm}>Goals</Text>
          {p.goals.map((g) => (
            <View key={g.title} style={styles.histRow}>
              <Image source={g.icon} style={styles.goalIcon} contentFit="contain" />
              <View style={styles.flex}>
                <Text style={styles.achTitle}>{g.title}</Text>
                <Bar value={g.done / g.total} color="#0B6BFF" track="#E4ECF6" height={6} />
              </View>
              <Text style={styles.histScore}>{`${g.done} / ${g.total}`}</Text>
            </View>
          ))}
        </View>
      );
    case 'reports': {
      const all = overall(p.subjects);
      const text = [`${p.learner}'s learning report`, ...p.subjects.map((x) => `${x.name}: ${x.done}/${x.total} skills (${pct(x.done, x.total)}%)`), `Overall: ${all.done}/${all.total} (${all.percent}%)`].join('\n');
      return (
        <View style={styles.box}>
          <Text style={styles.boxTitleSm}>Term Report</Text>
          {p.subjects.map((x) => (
            <View key={x.name} style={styles.histRow}>
              <Text style={[styles.achTitle, styles.flex]}>{x.name}</Text>
              <Text style={styles.histScore}>{`${pct(x.done, x.total)}%`}</Text>
            </View>
          ))}
          <Pressable style={styles.primary} onPress={() => Share.share({ message: text }).catch(() => undefined)} accessibilityRole="button">
            <Text style={styles.primaryText}>Share with my parent</Text>
          </Pressable>
        </View>
      );
    }
    case 'time':
      return <Activity p={p} s={s} tall />;
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontWeight: '700', color: BLUE },
  great: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E8EEF6', backgroundColor: '#FFFFFF' },
  greatP: { paddingVertical: 12 },
  trophy: { width: 42, height: 40 },
  greatTitle: { fontSize: 16.5, fontWeight: '700', color: NAVY },
  greatSub: { marginTop: 4, fontSize: 12.5, color: '#3F4A63' },
  keepGoing: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, borderRadius: 8, borderWidth: 1, borderColor: '#CFE0F8', backgroundColor: '#EEF5FF' },
  keepText: { fontSize: 13, fontWeight: '500', color: BLUE },
  tabs: { height: 67, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#FFFFFF' },
  tab: { flex: 1, height: 67, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 4 },
  tabIcon: { width: 40, height: 40 },
  tabName: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  tabCount: { marginTop: 2, fontSize: 11.5, color: BODY },
  tabLine: { position: 'absolute', left: 0, right: 12, bottom: 0, height: 3, borderRadius: 2, backgroundColor: '#0B6BFF' },
  menu: { gap: 1 },
  menuItem: { height: 33, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 12, borderRadius: 7 },
  menuOn: { backgroundColor: '#E6EEFC' },
  menuText: { fontSize: 13, color: '#2B3445' },
  menuTextOn: { fontWeight: '500', color: BLUE },
  box: { gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E8EEF6', backgroundColor: '#FFFFFF' },
  tight: { fontSize: 12.5 },
  boxTitle: { fontSize: 13, fontWeight: '700', color: NAVY },
  boxTitleSm: { fontSize: 13, fontWeight: '700', color: NAVY, letterSpacing: -0.2 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  milestoneTop: { flexDirection: 'row', gap: 10 },
  milestoneIcon: { width: 42, height: 42 },
  milestoneText: { marginTop: 4, fontSize: 12, lineHeight: 16, color: '#3F4A63' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barText: { fontSize: 12, fontWeight: '600', color: NAVY },
  primary: { height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#0B6BFF' },
  primaryText: { fontSize: 12.5, fontWeight: '600', color: '#FFFFFF' },
  secondary: { height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#C9DAF8' },
  secondaryText: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  pill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: '#D8E5FA' },
  pillText: { fontSize: 11, color: BLUE },
  ach: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  achIcon: { width: 42, height: 42 },
  achTitle: { fontSize: 12, fontWeight: '700', color: NAVY },
  achSub: { marginTop: 1, fontSize: 11, color: BODY },
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  overallBig: { fontSize: 15, fontWeight: '700', color: NAVY },
  overallSub: { fontSize: 12.5, color: BODY },
  gain: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, backgroundColor: '#E6F6EC' },
  gainText: { fontSize: 10, fontWeight: '500', color: '#15803D' },
  subjList: { gap: 9 },
  subjRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  subjIcon: { width: 20, height: 20 },
  subjName: { marginBottom: 3, fontSize: 11.5, color: NAVY },
  subjPct: { width: 36, fontSize: 11.5, color: NAVY, textAlign: 'right' },
  period: { height: 24, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: '#DCE3EE' },
  periodText: { fontSize: 10.5, color: NAVY },
  chart: { flexDirection: 'row', gap: 6 },
  axis: { justifyContent: 'space-between' },
  axisText: { fontSize: 9.5, color: BODY },
  bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  barCol: { width: 14, borderTopLeftRadius: 3, borderTopRightRadius: 3, overflow: 'hidden' },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  dayText: { width: 22, fontSize: 9.5, color: BODY, textAlign: 'center' },
  keys: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 6, columnGap: 12 },
  key: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  keyDot: { width: 9, height: 9, borderRadius: 3 },
  keyText: { fontSize: 10, color: BODY },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  goalIcon: { width: 20, height: 20 },
  goalTitle: { flex: 1, fontSize: 10.5, fontWeight: '500', color: NAVY, letterSpacing: -0.2 },
  goalCount: { fontSize: 10, color: BODY, textDecorationLine: 'underline' },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(8,12,20,0.5)' },
  dialog: { width: '100%', maxWidth: 420, gap: 10, padding: 18, borderRadius: 14, backgroundColor: '#FFFFFF' },
  dialogHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dialogDot: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderWidth: 3 },
  dialogTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  dialogMeta: { marginTop: 2, fontSize: 12, color: BODY },
  stateChip: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10, borderWidth: 1, fontSize: 11.5, fontWeight: '600', color: NAVY, overflow: 'hidden' },
  dialogText: { fontSize: 13, lineHeight: 19, color: '#2B3445' },
  leafList: { gap: 6 },
  leafRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  leafRowText: { flex: 1, fontSize: 12.5, color: NAVY },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  viewGap: { gap: 12 },
  stateGrid: { flexDirection: 'row', gap: 10 },
  stateCard: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 14, borderRadius: 10, borderWidth: 1.5 },
  stateN: { fontSize: 22, fontWeight: '800', color: NAVY },
  histRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F3F7' },
  histScore: { fontSize: 13, fontWeight: '700', color: NAVY },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  badgeCard: { width: 190, alignItems: 'center', gap: 4, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#EEF1F6' },
  badgeImg: { width: 64, height: 64 },
});
