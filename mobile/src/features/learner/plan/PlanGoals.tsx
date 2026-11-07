import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Sheet } from '@/features/learner/careers/CareerParts';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import { L } from '@/features/learner/frame/LightFrame';

import { phaseStatus } from './plan';
import { Bar, barColor, Card, Field, k, LAV, OutlineBtn, Pill, BRAND_BLUE } from './PlanKit';
import type { PlanState } from './PlanViews';
import { goalCounts, goalStatus, weeksToGo } from './schedule';
import { Maple } from '@/constants/maple';

const STATUS_TONE = { Completed: 'green', 'In progress': 'purple', 'Not started': 'grey' } as const;
const PHASE_WORD = { done: 'Completed', current: 'In progress', upcoming: 'Upcoming' } as const;

function GoalBanner({ p, phone }: { p: PlanState; phone: boolean }) {
  return (
    <View style={[s.banner, phone && s.bannerP]}>
      <Icon name="target" size={phone ? 34 : 48} color={BRAND_BLUE} />
      <View style={s.bannerText}>
        <Text style={s.bannerKicker}>Your Goal</Text>
        <Text style={[s.bannerGoal, phone && s.bannerGoalP]}>{p.goal}</Text>
        <Text style={k.small}>{p.plan.goalNote}</Text>
      </View>
      {!phone ? <View style={s.divider} /> : null}
      <View style={s.target}>
        <Icon name="calendar" size={20} color={L.navy} />
        <View>
          <Text style={k.small}>Target Date</Text>
          <Text style={s.targetText}>{p.target}</Text>
        </View>
      </View>
      <OutlineBtn label="Edit Goal" icon="edit" onPress={() => p.setAdjusting(true)} />
    </View>
  );
}

function GoalProgress({ p, phone }: { p: PlanState; phone: boolean }) {
  const c = goalCounts(p.goals);
  const rows = [
    { label: `${c.completed} completed`, icon: 'sealCheck' as const, color: Maple.successText },
    { label: `${c.inProgress} in progress`, icon: 'clock' as const, color: Maple.blue },
    { label: `${c.notStarted} not started`, icon: 'clock' as const, color: Maple.muted },
  ];
  return (
    <Card title="Goal Progress" style={phone ? undefined : s.half}>
      <View style={s.progressRow}>
        <View style={s.ring}>
          <ProgressRing value={p.overall / 100} size={130} stroke={12} color={Maple.successText} track={Maple.successSoft} label={false} />
          <View style={s.ringCenter}>
            <Text style={s.ringPct}>{`${p.overall}%`}</Text>
            <Pill text={p.status} tone={p.status === 'On track' ? 'green' : 'orange'} />
          </View>
        </View>
        <View style={k.flex}>
          {rows.map((r) => (
            <View key={r.label} style={s.countRow}>
              <Icon name={r.icon} size={18} color={r.color} />
              <Text style={[k.body, k.flex]}>{r.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

function Roadmap({ p, phone }: { p: PlanState; phone: boolean }) {
  return (
    <Card title="Milestone Roadmap" style={phone ? undefined : s.half}>
      <View style={[s.road, phone && s.roadP]}>
        {p.phases.map((ph, i) => {
          const st = phaseStatus(ph, p.week);
          return (
            <View key={ph.title} style={phone ? s.stageP : s.stage}>
              <View style={phone ? undefined : s.stageTop}>
                <View style={[s.dot, st === 'done' && s.dotDone, st === 'current' && s.dotNow]}>
                  {st === 'done' ? <Icon name="tick" size={12} color={L.white} /> : null}
                </View>
                {!phone && i < p.phases.length - 1 ? <View style={[s.line, st === 'done' && s.lineDone]} /> : null}
              </View>
              <View style={phone ? s.stageTextP : s.stageText}>
                <Text style={phone ? s.stageTitleP : s.stageTitle}>{ph.title}</Text>
                <Pill text={`${PHASE_WORD[st]} (Week ${ph.to})`} tone={st === 'done' ? 'green' : st === 'current' ? 'purple' : 'grey'} />
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

function GoalsTable({ p, phone }: { p: PlanState; phone: boolean }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [week, setWeek] = useState('');
  return (
    <Card title={`Your Goals (${p.goals.length})`} right={<OutlineBtn label="Add Goal" icon="plus" onPress={() => setAdding(true)} />}>
      {p.goals.map((g) => {
        const st = goalStatus(g);
        return (
          <View key={g.id} style={[s.goal, phone && s.goalP]}>
            <Pressable
              onPress={() => p.toggleGoal(g.id)}
              hitSlop={8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: g.done }}
              accessibilityLabel={g.title}>
              <View style={[s.check, g.done && s.checkOn]}>{g.done ? <Icon name="tick" size={12} color={L.white} /> : null}</View>
            </Pressable>
            <Text style={[k.body, phone ? s.goalTitleP : s.goalTitle]}>{g.title}</Text>
            <View style={phone ? s.goalMetaP : s.goalMeta}>
              {!g.done ? (
                <View style={phone ? s.goalBarP : s.goalBar}>
                  <Bar value={g.progress} />
                  <Text style={s.goalPct}>{`${Math.round(g.progress * 100)}%`}</Text>
                </View>
              ) : (
                <View style={phone ? s.goalBarP : s.goalBar} />
              )}
              <Pill text={st} tone={STATUS_TONE[st]} />
              <Text style={s.week}>{`Week ${g.week}`}</Text>
            </View>
          </View>
        );
      })}
      {adding ? (
        <Sheet title="Add a goal" onClose={() => setAdding(false)}>
          <Field label="Goal" value={title} onChange={setTitle} placeholder="For example: Finish all Chemistry organic topics" />
          <Field label={`By week (1–${p.weeks})`} value={week} onChange={setWeek} placeholder={String(Math.min(p.weeks, p.week + 4))} />
          <OutlineBtn
            solid
            label="Add goal"
            onPress={() => {
              const w = Math.min(p.weeks, Math.max(p.week, Number(week) || p.week + 4));
              if (!title.trim()) return;
              p.addGoal(title.trim(), w);
              setTitle('');
              setWeek('');
              setAdding(false);
            }}
          />
        </Sheet>
      ) : null}
    </Card>
  );
}

function KeyMilestones({ p }: { p: PlanState }) {
  const ahead = p.phases.filter((ph) => phaseStatus(ph, p.week) !== 'done');
  return (
    <Card title="Key Milestones" icon="trophy">
      {ahead.map((ph) => (
        <View key={ph.title} style={s.key}>
          <View style={s.keyWeeks}>
            <Text style={s.keyNum}>{weeksToGo(ph.to, p.week)}</Text>
            <Text style={s.keyUnit}>Weeks</Text>
          </View>
          <View style={k.flex}>
            <Text style={s.keyTitle}>{ph.title}</Text>
            <Text style={k.small}>{ph.about}</Text>
          </View>
        </View>
      ))}
    </Card>
  );
}

export function SubjectBars({ p, title = 'Progress by Subject' }: { p: PlanState; title?: string }) {
  return (
    <Card title={title} icon="chart">
      {p.subjects.map((x) => (
        <View key={x.name} style={s.barRow}>
          <Text style={s.barName}>{x.name}</Text>
          <Bar value={x.progress} color={barColor(x.progress)} />
          <Text style={s.barPct}>{`${Math.round(x.progress * 100)}%`}</Text>
        </View>
      ))}
    </Card>
  );
}

function KeepGoing({ p }: { p: PlanState }) {
  return (
    <View style={s.keep}>
      <View style={s.keepHead}>
        <Icon name="target" size={26} color={BRAND_BLUE} />
        <Text style={k.title}>{p.status === 'On track' ? 'Keep Going!' : 'You can catch up'}</Text>
      </View>
      <Text style={k.body}>
        {p.status === 'On track'
          ? 'You’re on track to reach your goal. Maintain your study routine and complete the next milestone.'
          : 'You’re a little behind the plan. A few extra sessions this week will bring you back on track.'}
      </Text>
    </View>
  );
}

/** Goals & Milestones (its reference): the goal, progress, the roadmap of phases, the goals and what’s next. */
export function GoalsTab({ p, phone }: { p: PlanState; phone: boolean }) {
  const main = (
    <>
      <GoalBanner p={p} phone={phone} />
      <View style={[s.row, phone && s.col]}>
        <GoalProgress p={p} phone={phone} />
        <Roadmap p={p} phone={phone} />
      </View>
      <GoalsTable p={p} phone={phone} />
    </>
  );
  const side = (
    <>
      <KeyMilestones p={p} />
      <SubjectBars p={p} />
      <KeepGoing p={p} />
    </>
  );
  return phone ? (
    <View style={s.stack}>
      {main}
      {side}
    </View>
  ) : (
    <View style={s.cols}>
      <View style={[k.flex, s.stack]}>{main}</View>
      <View style={s.right}>{side}</View>
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: 16 },
  cols: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  right: { width: 360, gap: 16 },
  row: { flexDirection: 'row', gap: 16, alignItems: 'stretch' },
  col: { flexDirection: 'column' },
  half: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Maple.blueSelected,
    backgroundColor: LAV,
  },
  bannerP: { flexWrap: 'wrap', gap: 12 },
  bannerText: { flex: 1, minWidth: 200 },
  bannerKicker: { fontSize: 15, fontWeight: '700', color: L.navy },
  bannerGoal: { fontSize: 26, fontWeight: '800', color: L.navy, letterSpacing: -0.4 },
  bannerGoalP: { fontSize: 21 },
  divider: { width: 1, alignSelf: 'stretch', backgroundColor: Maple.blueSelected },
  target: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  targetText: { fontSize: 18, fontWeight: '800', color: L.navy },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  ring: { alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center', gap: 4 },
  ringPct: { fontSize: 26, fontWeight: '800', color: L.navy },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  road: { flexDirection: 'row' },
  roadP: { flexDirection: 'column', gap: 12 },
  stage: { flex: 1, alignItems: 'center', gap: 8 },
  stageTop: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 2,
    borderColor: Maple.borderStrong,
    backgroundColor: L.white,
  },
  dotDone: { borderColor: Maple.successText, backgroundColor: Maple.successText },
  dotNow: { borderColor: BRAND_BLUE, borderWidth: 6 },
  line: { position: 'absolute', left: '62%', right: '-38%', height: 2, backgroundColor: Maple.disabledBorder },
  lineDone: { backgroundColor: Maple.successText },
  stageText: { alignItems: 'center', gap: 8 },
  stageP: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stageTextP: { flex: 1, alignItems: 'flex-start', gap: 6 },
  stageTitleP: { fontSize: 14.5, fontWeight: '700', color: L.navy },
  stageTitle: { fontSize: 13.5, lineHeight: 17, fontWeight: '700', color: L.navy, textAlign: 'center' },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Maple.blueSelected,
  },
  goalP: { flexWrap: 'wrap' },
  check: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 1.5, borderColor: BRAND_BLUE },
  checkOn: { borderColor: Maple.successText, backgroundColor: Maple.successText },
  goalTitle: { flex: 1, minWidth: 160 },
  goalBar: { width: 180, flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalTitleP: { flex: 1, minWidth: 200 },
  goalMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalMetaP: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 34 },
  goalBarP: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  goalPct: { width: 38, fontSize: 13, fontWeight: '600', color: L.navy, textAlign: 'right' },
  week: { width: 64, fontSize: 13, color: L.body, textAlign: 'right' },
  key: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  keyWeeks: { width: 64, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: LAV },
  keyNum: { fontSize: 22, fontWeight: '800', color: BRAND_BLUE },
  keyUnit: { fontSize: 11.5, fontWeight: '600', color: BRAND_BLUE },
  keyTitle: { fontSize: 14.5, fontWeight: '700', color: L.navy },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  barName: { width: 96, fontSize: 13.5, color: L.navy },
  barPct: { width: 40, fontSize: 13, fontWeight: '600', color: L.navy, textAlign: 'right' },
  keep: { gap: 10, padding: 18, borderRadius: 16, backgroundColor: LAV },
  keepHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
