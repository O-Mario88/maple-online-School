import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import { L, LightFrame } from '@/features/learner/frame/LightFrame';
import { ChalkThumb, LessonStats } from '@/features/learner/lessons/LessonParts';
import type { VideoLessonItem } from '@/features/learner/lessons/videoLessons';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

import { levelFor, overallProgress, phaseStatus, planStatus, scalePhases, subjectAction, type SubjectLevel } from './plan';

type Plan = MockData['learner']['learnerPlan'];
type Tab = 'plan' | 'subject' | 'schedule' | 'goals' | 'recs';

const TABS: readonly { key: Tab; label: string; icon: IconName }[] = [
  { key: 'plan', label: 'My Plan', icon: 'layers' },
  { key: 'subject', label: 'By Subject', icon: 'grid' },
  { key: 'schedule', label: 'Study Schedule', icon: 'calendar' },
  { key: 'goals', label: 'Goals & Milestones', icon: 'flag' },
  { key: 'recs', label: 'Recommendations', icon: 'bulb' },
];
const LEVEL_TONE: Readonly<Record<SubjectLevel, { fg: string; bg: string }>> = {
  Strong: { fg: '#1D4ED8', bg: '#E3ECFF' },
  Good: { fg: '#15803D', bg: '#E6F6EC' },
  Developing: { fg: '#B45309', bg: '#FEF3DC' },
};
const AMBER = '#F5A524';

/** Everything both layouts need: the plan as the learner has set it, this week's ticks, and what the buttons do. */
export function usePlan(plan: Plan, lessons: readonly VideoLessonItem[]) {
  const [tab, setTab] = useState<Tab>('plan');
  const [goal, setGoal] = useState(plan.goal);
  const [target, setTarget] = useState(plan.target);
  const [weeks, setWeeks] = useState(plan.weeks);
  const [style, setStyle] = useState(plan.style);
  const [focus, setFocus] = useState(plan.focus);
  const [adjusting, setAdjusting] = useState(false);
  const overall = overallProgress(plan.subjects.map((x) => x.progress));
  const week = Math.min(plan.week, weeks);
  return {
    plan,
    tab,
    setTab,
    goal,
    setGoal,
    target,
    setTarget,
    weeks,
    setWeeks,
    style,
    setStyle,
    week,
    phases: scalePhases(plan.phases, plan.weeks, weeks),
    focus,
    toggle: (id: string) => setFocus((f) => f.map((x) => (x.id === id ? { ...x, done: !x.done } : x))),
    overall,
    status: planStatus(overall, week, weeks),
    recommended: plan.recommended.map((id) => lessons.find((l) => l.id === id)).filter((l): l is VideoLessonItem => !!l),
    adjusting,
    setAdjusting,
    save: () => {
      setAdjusting(false);
      toast('Your plan is updated.');
    },
    openSubject: (name: string) => router.push(`/learn/lessons?subject=${encodeURIComponent(name)}` as Href),
    openLesson: (l: VideoLessonItem) => router.push(`/learn/lesson?id=${l.id}` as Href),
    go: (href: Href) => router.push(href),
  };
}
type P = ReturnType<typeof usePlan>;

function Stats({ p, phone = false }: { p: P; phone?: boolean }) {
  return (
    <View style={[s.stats, phone ? s.statsP : s.statsD]}>
      <Pressable style={[s.statCard, phone ? s.statCardP : s.goalCard]} onPress={() => p.setAdjusting(true)} accessibilityRole="button" accessibilityLabel={`My goal: ${p.goal}. Edit`}>
        <View style={[s.statIcon, { backgroundColor: '#FDE7F1' }]}>
          <Icon name="target" size={24} color="#DB2777" />
        </View>
        <View style={s.flex}>
          <Text style={s.statLabel}>My Goal</Text>
          <Text style={s.statValue}>{p.goal}</Text>
        </View>
        <Icon name="edit" size={18} color={L.body} />
      </Pressable>
      <View style={[s.statCard, phone ? [s.statCardP, s.metaP] : s.metaCard]}>
        <View style={[s.statPart, phone ? s.statPartP : s.statPartD]}>
          <View style={[s.statIcon, { backgroundColor: '#E7EFFE' }]}>
            <Icon name="chart" size={22} color={L.blue} />
          </View>
          <View>
            <Text style={s.statLabel}>My Level</Text>
            <Text style={[s.statValue, { color: L.blue }]}>{p.plan.level}</Text>
          </View>
        </View>
        {phone ? null : <View style={s.divider} />}
        <Pressable style={[s.statPart, phone ? s.statPartP : s.statPartD]} onPress={() => p.setAdjusting(true)} accessibilityRole="button" accessibilityLabel={`Target date: ${p.target}. Edit`}>
          <View style={[s.statIcon, { backgroundColor: '#F1EAFE' }]}>
            <Icon name="calendar" size={22} color="#7C3AED" />
          </View>
          <View>
            <Text style={s.statLabel}>Target Date</Text>
            <Text style={s.statValue}>{p.target}</Text>
          </View>
          <Icon name="edit" size={18} color={L.body} />
        </Pressable>
        {phone ? null : <View style={s.divider} />}
        <Pressable style={[s.statPart, phone ? s.statPartWide : s.statPartD]} onPress={() => p.go('/learn/progress')} accessibilityRole="button" accessibilityLabel={`Overall progress ${p.overall}%, ${p.status}`}>
          <ProgressRing value={p.overall / 100} size={62} stroke={7} color={L.green} track="#E6EBF3" labelSize={15} />
          <View style={s.flex}>
            <Text style={[s.statValue, s.statValueSmall]}>Overall Progress</Text>
            <Text style={[s.onTrack, p.status === 'Behind' && s.behind]}>{p.status}</Text>
          </View>
          <Icon name="chevronRight" size={20} color={L.ink} />
        </Pressable>
      </View>
    </View>
  );
}

function Tabs({ p, phone = false }: { p: P; phone?: boolean }) {
  const row = (
    <View style={[s.tabs, phone && s.tabsP]} accessibilityRole="tablist">
      {TABS.map((t) => {
        const on = p.tab === t.key;
        return (
          <Pressable key={t.key} style={[s.tab, phone && s.tabP]} onPress={() => p.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={t.icon} size={phone ? 16 : 20} color={on ? L.blue : L.body} />
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
    <View style={s.tabsCard}>{row}</View>
  );
}

function Journey({ p, phone = false }: { p: P; phone?: boolean }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <View style={s.flex}>
          <Text style={s.cardTitle}>My Learning Journey</Text>
          <Text style={s.cardSub}>{phone ? `${p.weeks} weeks to your goal.` : 'A step-by-step plan to reach your goal.'}</Text>
        </View>
        {phone ? null : (
          <View style={s.planFor}>
            <Icon name="calendar" size={17} color={L.ink} />
            <Text style={s.planForText}>
              {'Plan for: '}
              <Text style={s.bold}>{`${p.weeks} weeks`}</Text>
            </Text>
          </View>
        )}
        <Pressable style={s.adjust} onPress={() => p.setAdjusting(true)} accessibilityRole="button">
          <Icon name="filter" size={17} color={L.blue} />
          <Text style={s.adjustText}>Adjust Plan</Text>
        </Pressable>
      </View>
      <View style={[s.phases, phone && s.phasesP]}>
        {p.phases.map((ph, i) => {
          const st = phaseStatus(ph, p.week);
          return (
            <View key={ph.title} style={[s.phaseWrap, phone ? s.phaseWrapP : s.phaseWrapD]}>
              {i > 0 && !phone ? <View style={s.connector} /> : null}
              <View style={[s.phase, st === 'done' && s.phaseDone, st === 'current' && s.phaseOn]}>
                <View style={[s.phaseDot, st === 'done' && s.phaseDotDone, st === 'current' && s.phaseDotOn]}>
                  <Icon name={st === 'done' ? 'tick' : st === 'current' ? 'playFill' : 'lock'} size={st === 'current' ? 12 : 14} color={st === 'done' ? L.white : st === 'current' ? L.blue : L.muted} />
                </View>
                <Text style={s.phaseTitle}>{ph.title}</Text>
                <Text style={s.phaseWeeks}>{`Weeks ${ph.from} – ${ph.to}`}</Text>
                <Text style={[s.phaseChip, st === 'done' && s.phaseChipDone, st === 'current' && s.phaseChipOn]}>{st === 'done' ? 'Completed' : st === 'current' ? 'In Progress' : 'Upcoming'}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function SubjectRow({ p, x, phone }: { p: P; x: Plan['subjects'][number]; phone: boolean }) {
  const level = levelFor(x.progress);
  const action = subjectAction(x.progress);
  const tone = LEVEL_TONE[level];
  const pct = Math.round(x.progress * 100);
  const button = (
    <Pressable style={[s.colAction, action === 'Continue' ? s.continue : s.review]} onPress={() => p.openSubject(x.name)} accessibilityRole="button" accessibilityLabel={`${action} ${x.name}: ${x.next}`}>
      {action === 'Continue' ? <Icon name="playFill" size={12} color={L.white} /> : null}
      <Text style={action === 'Continue' ? s.continueText : s.reviewText}>{action}</Text>
    </Pressable>
  );
  if (phone) {
    return (
      <View style={s.trP}>
        <View style={s.subjectCell}>
          <View style={[s.subjectIcon, { backgroundColor: x.tint }]}>
            <Icon name={x.icon} size={18} color={L.white} />
          </View>
          <Text style={[s.subjectName, s.flex]}>{x.name}</Text>
          <Text style={[s.level, { color: tone.fg, backgroundColor: tone.bg }]}>{level}</Text>
        </View>
        <View style={s.bar}>
          <View style={[s.barFill, { width: `${pct}%`, backgroundColor: x.progress >= 0.65 ? L.green : AMBER }]} />
        </View>
        <View style={s.subjectCell}>
          <Text style={[s.next, s.flex]}>{`${pct}%  ·  Next: ${x.next}`}</Text>
          {button}
        </View>
      </View>
    );
  }
  return (
    <View style={s.tr}>
      <View style={[s.colSubject, s.subjectCell]}>
        <View style={[s.subjectIcon, { backgroundColor: x.tint }]}>
          <Icon name={x.icon} size={18} color={L.white} />
        </View>
        <Text style={s.subjectName}>{x.name}</Text>
      </View>
      <View style={s.colLevel}>
        <Text style={[s.level, { color: tone.fg, backgroundColor: tone.bg }]}>{level}</Text>
      </View>
      <View style={s.colProgress}>
        <Text style={s.pct}>{`${pct}%`}</Text>
        <View style={s.bar}>
          <View style={[s.barFill, { width: `${pct}%`, backgroundColor: x.progress >= 0.65 ? L.green : AMBER }]} />
        </View>
      </View>
      <Text style={[s.next, s.flex]}>{x.next}</Text>
      {button}
    </View>
  );
}

function SubjectsTable({ p, phone = false }: { p: P; phone?: boolean }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        <View style={s.flex}>
          <Text style={s.cardTitle}>My Subjects Plan</Text>
          <Text style={s.cardSub}>Your focus areas, progress and next steps.</Text>
        </View>
        {phone ? null : (
          <Pressable style={s.style} onPress={() => p.setAdjusting(true)} accessibilityRole="button" accessibilityLabel={`Learning style: ${p.style}. Change`}>
            <Icon name="calendar" size={17} color={L.ink} />
            <Text style={s.styleText}>{`Learning Style: ${p.style}`}</Text>
            <Icon name="chevronDown" size={16} color={L.ink} />
          </Pressable>
        )}
      </View>
      {phone ? null : (
        <View style={[s.tr, s.th]}>
          <Text style={[s.thText, s.colSubject]}>Subject</Text>
          <Text style={[s.thText, s.colLevel]}>Current Level</Text>
          <Text style={[s.thText, s.colProgress]}>Progress</Text>
          <Text style={[s.thText, s.flex]}>Next Focus</Text>
          <View style={s.colAction} />
        </View>
      )}
      {p.plan.subjects.map((x) => (
        <SubjectRow key={x.name} p={p} x={x} phone={phone} />
      ))}
    </View>
  );
}

function WeekFocus({ p, phone = false }: { p: P; phone?: boolean }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        {phone ? null : (
          <View style={[s.statIcon, { backgroundColor: '#E7EFFE' }]}>
            <Icon name="calendar" size={22} color={L.blue} />
          </View>
        )}
        <View style={s.flex}>
          <Text style={s.cardTitle}>This Week’s Focus</Text>
          <Text style={s.cardSub}>Key lessons and tasks for your plan.</Text>
        </View>
        <Text style={s.weekChip}>{`Week ${p.week} of ${p.weeks}`}</Text>
      </View>
      <View style={s.focusList}>
        {p.focus.map((f) => (
          <View key={f.id} style={s.focusRow}>
            <Pressable onPress={() => p.toggle(f.id)} hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked: f.done }} accessibilityLabel={f.text}>
              <View style={[s.check, f.done && s.checkOn]}>{f.done ? <Icon name="tick" size={13} color={L.white} /> : null}</View>
            </Pressable>
            <Pressable style={s.flex} onPress={() => p.go(f.href)} accessibilityRole="link">
              <Text style={[s.focusText, f.done && s.focusDone]}>{f.text}</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

function Advisor({ p }: { p: P }) {
  return (
    <View style={[s.card, s.advisor]}>
      <LinearGradient colors={['#F3EEFF', '#EAF1FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={s.advisorText}>
        <View style={s.cardHead}>
          <Icon name="sparkle" size={24} color="#7C3AED" />
          <Text style={s.cardTitle}>AI Learning Advisor</Text>
        </View>
        <Text style={s.advisorBody}>{p.plan.advisor.text}</Text>
        <Pressable style={s.boost} onPress={() => p.go('/copilot')} accessibilityRole="button">
          <Icon name="bolt" size={16} color="#6D28D9" />
          <Text style={s.boostText}>Get a Study Boost</Text>
        </Pressable>
      </View>
      <Image source={p.plan.advisor.robot} style={s.robot} contentFit="contain" accessibilityLabel="Maple's study robot" />
    </View>
  );
}

function Recommended({ p, count = 2, phone = false }: { p: P; count?: number; phone?: boolean }) {
  return (
    <View style={s.card}>
      <View style={s.cardHead}>
        {phone ? null : (
          <View style={[s.statIcon, { backgroundColor: '#E7EFFE' }]}>
            <Icon name="book" size={22} color={L.blue} />
          </View>
        )}
        <View style={s.flex}>
          <Text style={s.cardTitle}>Recommended for You</Text>
          <Text style={s.cardSub}>Based on your progress and goals.</Text>
        </View>
        <Pressable onPress={() => p.go('/learn/lessons')} accessibilityRole="link">
          <Text style={s.seeAll}>See All</Text>
        </Pressable>
      </View>
      <View style={s.recs}>
        {p.recommended.slice(0, count).map((l) => (
          <Pressable key={l.id} style={[s.rec, count > 2 && s.recQuarter]} onPress={() => p.openLesson(l)} accessibilityRole="button" accessibilityLabel={`${l.title}, ${l.subject}`}>
            <ChalkThumb l={l} height={86} />
            <View style={s.recBody}>
              <Text style={s.recTitle} numberOfLines={2}>
                {l.title}
              </Text>
              <Text style={s.recMeta}>{`${l.subject}  •  ${Math.round(l.seconds / 60)} min`}</Text>
              <LessonStats l={l} size={11} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function BySubject({ p, phone }: { p: P; phone: boolean }) {
  return (
    <View style={s.tiles}>
      {p.plan.subjects.map((x) => {
        const level = levelFor(x.progress);
        const tone = LEVEL_TONE[level];
        const pct = Math.round(x.progress * 100);
        return (
          <Pressable key={x.name} style={[s.tile, phone && s.tileP]} onPress={() => p.openSubject(x.name)} accessibilityRole="button" accessibilityLabel={`${x.name}, ${pct}%, ${level}`}>
            <View style={s.subjectCell}>
              <View style={[s.subjectIcon, { backgroundColor: x.tint }]}>
                <Icon name={x.icon} size={18} color={L.white} />
              </View>
              <Text style={[s.subjectName, s.flex]}>{x.name}</Text>
              <Text style={[s.level, { color: tone.fg, backgroundColor: tone.bg }]}>{level}</Text>
            </View>
            <Text style={s.pct}>{`${pct}% complete`}</Text>
            <View style={s.bar}>
              <View style={[s.barFill, { width: `${pct}%`, backgroundColor: x.progress >= 0.65 ? L.green : AMBER }]} />
            </View>
            <Text style={s.next}>{`Next: ${x.next}`}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Schedule({ p, phone }: { p: P; phone: boolean }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Study Schedule</Text>
      <Text style={s.cardSub}>{`A week of study for ${p.style.toLowerCase()} learners.`}</Text>
      <View style={s.days}>
        {p.plan.schedule.map((d) => (
          <View key={d.day} style={[s.day, phone && s.dayP]}>
            <Text style={s.dayName}>{d.day}</Text>
            {d.items.map((it) => (
              <Text key={it} style={s.dayItem}>
                {it}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function Milestones({ p }: { p: P }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Goals & Milestones</Text>
      <Text style={s.cardSub}>{`Steps on the way to ${p.goal}, by ${p.target}.`}</Text>
      <View style={s.focusList}>
        {p.plan.milestones.map((m) => (
          <View key={m.title} style={s.focusRow}>
            <View style={[s.check, m.done && s.checkOn]}>{m.done ? <Icon name="tick" size={13} color={L.white} /> : null}</View>
            <Text style={[s.focusText, s.flex, m.done && s.focusDone]}>{m.title}</Text>
            <Text style={s.due}>{m.due}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Recommendations({ p, phone }: { p: P; phone: boolean }) {
  return (
    <View style={s.stack}>
      <View style={s.card}>
        <Text style={s.cardTitle}>What to do next</Text>
        <View style={s.focusList}>
          {p.plan.tips.map((t) => (
            <View key={t} style={s.focusRow}>
              <Icon name="bulb" size={18} color="#C98A0B" />
              <Text style={[s.focusText, s.flex]}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
      <Recommended p={p} count={4} phone={phone} />
    </View>
  );
}

function Choices<T extends string | number>({ title, options, value, onChange, label = String }: { title: string; options: readonly T[]; value: T; onChange: (v: T) => void; label?: (v: T) => string }) {
  return (
    <View style={s.group}>
      <Text style={s.groupTitle}>{title}</Text>
      <View style={s.chips}>
        {options.map((o) => (
          <Pressable key={String(o)} style={[s.chip, o === value && s.chipOn]} onPress={() => onChange(o)} accessibilityRole="radio" accessibilityState={{ selected: o === value }}>
            <Text style={[s.chipText, o === value && s.chipTextOn]}>{label(o)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** The Adjust Plan sheet: goal, target date, plan length and learning style. */
function Adjust({ p }: { p: P }) {
  return (
    <Modal visible={p.adjusting} transparent animationType="fade" onRequestClose={() => p.setAdjusting(false)}>
      <View style={s.scrim}>
        <View style={s.sheet}>
          <Text style={s.cardTitle}>Adjust your plan</Text>
          <Choices title="Goal" options={p.plan.goals} value={p.goal} onChange={p.setGoal} />
          <Choices title="Target date" options={p.plan.targets} value={p.target} onChange={p.setTarget} />
          <Choices title="Plan length" options={p.plan.lengths} value={p.weeks} onChange={p.setWeeks} label={(w) => `${w} weeks`} />
          <Choices title="Learning style" options={p.plan.styles} value={p.style} onChange={p.setStyle} />
          <View style={s.sheetActions}>
            <Pressable style={s.cancel} onPress={() => p.setAdjusting(false)} accessibilityRole="button">
              <Text style={s.reviewText}>Close</Text>
            </Pressable>
            <Pressable style={[s.continue, s.save]} onPress={p.save} accessibilityRole="button">
              <Text style={s.continueText}>Save plan</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function TabBody({ p, phone }: { p: P; phone: boolean }) {
  if (p.tab === 'subject') return <BySubject p={p} phone={phone} />;
  if (p.tab === 'schedule') return <Schedule p={p} phone={phone} />;
  if (p.tab === 'goals') return <Milestones p={p} />;
  if (p.tab === 'recs') return <Recommendations p={p} phone={phone} />;
  if (phone) {
    return (
      <View style={s.stack}>
        <Journey p={p} phone />
        <WeekFocus p={p} phone />
        <SubjectsTable p={p} phone />
        <Advisor p={p} />
        <Recommended p={p} phone />
      </View>
    );
  }
  return (
    <View style={s.cols}>
      <View style={s.left}>
        <Journey p={p} />
        <SubjectsTable p={p} />
      </View>
      <View style={s.right}>
        <WeekFocus p={p} />
        <Advisor p={p} />
        <Recommended p={p} />
      </View>
    </View>
  );
}

interface PlanProps {
  plan: Plan;
  lessons: readonly VideoLessonItem[];
  avatar?: number;
}

/** My Personalized Learning Plan on wide screens: the reference, in the light learner frame. */
export function PlanDesk({ plan, lessons, avatar }: PlanProps) {
  const p = usePlan(plan, lessons);
  return (
    <LightFrame placeholder="Search subjects, lessons, past papers..." avatar={avatar}>
      <View style={s.heroPhoto} pointerEvents="none">
        <Image source={plan.hero} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
        <LinearGradient colors={[L.canvas, 'rgba(246,248,253,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 0.6, y: 0.5 }} style={StyleSheet.absoluteFill} />
        <LinearGradient colors={['rgba(246,248,253,0)', L.canvas]} start={{ x: 0.5, y: 0.6 }} end={{ x: 0.5, y: 1 }} style={StyleSheet.absoluteFill} />
      </View>
      <View style={s.head}>
        <View style={s.headIcon}>
          <Icon name="sparkle" size={28} color="#7C3AED" />
        </View>
        <View>
          <Text style={s.title} accessibilityRole="header">
            My Personalized Learning Plan
          </Text>
          <Text style={s.sub}>A learning plan tailored to your goals, current level and learning style.</Text>
        </View>
      </View>
      <Stats p={p} />
      <Tabs p={p} />
      <View style={s.bodyGap}>
        <TabBody p={p} phone={false} />
      </View>
      <Adjust p={p} />
    </LightFrame>
  );
}

/** My Plan on phones: the same plan, stacked. */
export function PlanPhone({ plan, lessons, avatar }: PlanProps) {
  const p = usePlan(plan, lessons);
  return (
    <View style={s.phoneRoot}>
      {avatar ? <LearnerPhoneTop avatar={avatar} /> : null}
      <ScrollView contentContainerStyle={s.phone}>
        <View style={s.headP}>
          <View style={[s.headIcon, s.headIconP]}>
            <Icon name="sparkle" size={22} color="#7C3AED" />
          </View>
          <View style={s.flex}>
            <Text style={s.titleP} accessibilityRole="header">
              My Learning Plan
            </Text>
            <Text style={s.subP}>Tailored to your goals, level and learning style.</Text>
          </View>
        </View>
        <Stats p={p} phone />
        <Tabs p={p} phone />
        <TabBody p={p} phone />
      </ScrollView>
      <Adjust p={p} />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  bold: { fontWeight: '700' },
  stack: { gap: 14 },
  heroPhoto: { position: 'absolute', top: -20, right: -16, width: 300, height: 215, overflow: 'hidden' },
  head: { height: 95, flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  headIcon: { width: 57, height: 57, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#EEE8FE' },
  title: { fontSize: 36, lineHeight: 42, fontWeight: '700', color: L.navy },
  sub: { marginTop: 6, fontSize: 16, color: L.body },
  stats: { flexDirection: 'row', gap: 18 },
  statsD: { width: 1045 },
  statsP: { flexDirection: 'column', gap: 10 },
  statCard: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: 'rgba(255,255,255,0.96)' },
  statCardP: { paddingVertical: 12 },
  goalCard: { width: 293, height: 84 },
  metaCard: { flex: 1, height: 84 },
  metaP: { flexWrap: 'wrap', rowGap: 12 },
  statPart: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statPartD: { flex: 1 },
  statPartP: { width: '100%' },
  statPartWide: { width: '100%' },
  statIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  statLabel: { fontSize: 14, color: L.body },
  statValue: { marginTop: 2, fontSize: 17, fontWeight: '700', color: L.navy },
  statValueSmall: { fontSize: 15 },
  onTrack: { marginTop: 4, alignSelf: 'flex-start', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 2, borderRadius: 7, fontSize: 12.5, fontWeight: '600', color: L.green, backgroundColor: '#E6F6EC' },
  behind: { color: '#B45309', backgroundColor: '#FEF3DC' },
  divider: { width: 1, height: 46, backgroundColor: L.line },
  tabsCard: { marginTop: 16, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  tabs: { flexDirection: 'row', paddingHorizontal: 12, gap: 10 },
  tabsP: { paddingHorizontal: 0, gap: 4 },
  tab: { height: 52, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 18 },
  tabP: { height: 44, paddingHorizontal: 10 },
  tabText: { fontSize: 15, fontWeight: '500', color: L.body },
  tabTextP: { fontSize: 13.5 },
  tabOn: { fontWeight: '700', color: L.blue },
  tabLine: { position: 'absolute', left: 8, right: 8, bottom: 0, height: 3, borderRadius: 2, backgroundColor: L.blue },
  bodyGap: { marginTop: 18 },
  cols: { flexDirection: 'row', gap: 26, alignItems: 'flex-start' },
  left: { width: 801, gap: 14 },
  right: { flex: 1, gap: 16 },
  card: { gap: 12, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 21, lineHeight: 27, fontWeight: '700', color: L.navy },
  cardSub: { marginTop: 2, fontSize: 14, color: L.body },
  planFor: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planForText: { fontSize: 14, color: L.ink },
  adjust: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, height: 38, borderRadius: 10, backgroundColor: '#E7EFFE' },
  adjustText: { fontSize: 14, fontWeight: '600', color: L.blue },
  phases: { flexDirection: 'row', marginTop: 14 },
  phasesP: { flexWrap: 'wrap', gap: 18, justifyContent: 'space-between' },
  phaseWrap: { flexDirection: 'row', alignItems: 'center' },
  phaseWrapD: { flex: 1 },
  phaseWrapP: { width: '46%' },
  connector: { width: 22, height: 2, backgroundColor: '#C9D6EA' },
  phase: { flex: 1, alignItems: 'center', gap: 6, paddingTop: 22, paddingBottom: 12, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1.5, borderColor: L.line, backgroundColor: L.white },
  phaseDone: { borderColor: '#9ADBB0', backgroundColor: '#F0FBF3' },
  phaseOn: { borderColor: '#A9C4F7', backgroundColor: '#EEF4FF' },
  phaseDot: { position: 'absolute', top: -14, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 2, borderColor: '#C9D2E0', backgroundColor: L.white },
  phaseDotDone: { borderColor: L.green, backgroundColor: L.green },
  phaseDotOn: { borderColor: L.blue },
  phaseTitle: { fontSize: 15, fontWeight: '700', color: L.navy, textAlign: 'center' },
  phaseWeeks: { fontSize: 13, color: L.body },
  phaseChip: { overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 7, fontSize: 12.5, fontWeight: '600', color: L.body, backgroundColor: '#F1F4F9' },
  phaseChipDone: { color: L.green, backgroundColor: '#DCF3E4' },
  phaseChipOn: { color: L.blue, backgroundColor: '#DCE7FC' },
  style: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, height: 38, borderRadius: 10, borderWidth: 1, borderColor: L.line },
  styleText: { fontSize: 14, fontWeight: '600', color: L.ink },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF1F6' },
  trP: { gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEF1F6' },
  th: { paddingVertical: 8, paddingHorizontal: 8, borderRadius: 8, borderBottomWidth: 0, backgroundColor: '#F5F7FB' },
  thText: { fontSize: 13.5, fontWeight: '600', color: L.ink },
  colSubject: { width: 176 },
  colLevel: { width: 104 },
  colProgress: { width: 158 },
  colAction: { width: 96 },
  subjectCell: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subjectIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  subjectName: { fontSize: 15, fontWeight: '600', color: L.navy },
  level: { alignSelf: 'flex-start', overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 7, fontSize: 12.5, fontWeight: '600' },
  pct: { fontSize: 13, color: L.ink },
  bar: { marginTop: 5, height: 6, borderRadius: 3, backgroundColor: '#E6EBF3' },
  barFill: { height: 6, borderRadius: 3 },
  next: { fontSize: 13.5, color: L.ink },
  continue: { height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8, backgroundColor: L.blue },
  continueText: { fontSize: 13.5, fontWeight: '600', color: L.white },
  review: { height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#E7EFFE' },
  reviewText: { fontSize: 13.5, fontWeight: '600', color: L.blue },
  weekChip: { overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 13, fontWeight: '600', color: L.blue, backgroundColor: '#E7EFFE' },
  focusList: { gap: 12 },
  focusRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1.5, borderColor: '#B6C0CF', backgroundColor: L.white },
  checkOn: { borderColor: L.green, backgroundColor: L.green },
  focusText: { fontSize: 14.5, color: L.ink },
  focusDone: { color: L.body },
  due: { fontSize: 13, color: L.muted },
  advisor: { flexDirection: 'row', borderColor: '#E3DAFB' },
  advisorText: { flex: 1, gap: 10 },
  advisorBody: { fontSize: 14, lineHeight: 20, color: L.body },
  boost: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: '#8B5CF6', backgroundColor: L.white },
  boostText: { fontSize: 14, fontWeight: '600', color: '#6D28D9' },
  robot: { width: 104, height: 104, alignSelf: 'center' },
  seeAll: { fontSize: 14, fontWeight: '600', color: L.blue },
  recs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  rec: { flex: 1, minWidth: 140, overflow: 'hidden', borderRadius: 12, borderWidth: 1, borderColor: L.line },
  recQuarter: { flexBasis: 200 },
  recBody: { gap: 4, padding: 10 },
  recTitle: { fontSize: 14, lineHeight: 18, fontWeight: '700', color: L.navy },
  recMeta: { fontSize: 12.5, color: L.body },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  tile: { width: 320, gap: 8, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  tileP: { width: '100%' },
  days: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  day: { width: 170, gap: 6, padding: 12, borderRadius: 12, backgroundColor: '#F5F7FB' },
  dayP: { width: '47%' },
  dayName: { fontSize: 15, fontWeight: '700', color: L.navy },
  dayItem: { fontSize: 13, color: L.ink },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(11,26,63,0.35)' },
  sheet: { width: '100%', maxWidth: 520, gap: 14, padding: 20, borderRadius: 18, backgroundColor: L.white },
  group: { gap: 8 },
  groupTitle: { fontSize: 14, fontWeight: '600', color: L.body },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: L.line },
  chipOn: { borderColor: L.blue, backgroundColor: L.soft },
  chipText: { fontSize: 13.5, color: L.ink },
  chipTextOn: { fontWeight: '600', color: L.blue },
  sheetActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancel: { height: 40, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#E7EFFE' },
  save: { height: 40, paddingHorizontal: 18 },
  phoneRoot: { flex: 1, backgroundColor: L.canvas },
  phone: { gap: 14, padding: 16, paddingBottom: 110 },
  headP: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headIconP: { width: 46, height: 46 },
  titleP: { fontSize: 24, lineHeight: 30, fontWeight: '700', color: L.navy },
  subP: { fontSize: 13.5, color: L.body },
});
