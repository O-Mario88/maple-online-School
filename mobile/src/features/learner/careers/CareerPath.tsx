import { type Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { useAccess } from '@/lib/access/access-context';
import { mockData } from '@/lib/mock';
import { toast } from '@/lib/toast';

import { careerStages, matchCareers, subjectFit } from './careers';
import { Btn, cs, FitPill, BRAND_SOFT, Panel, BRAND_BLUE, shortDate } from './CareerParts';
import { withPreferences } from './profile';
import { addAction, seedSaves, toggleAction, useCareerSaves } from './saved';
import { Maple } from '@/constants/maple';

/** Adds a step to the learner's career path (shared by My Plan, Career Compass, events and counseling). */
export function addCareerStep(existing: readonly { text: string }[], text: string, due: string): void {
  if (existing.some((a) => a.text === text)) return toast('Already in My Plan');
  addAction({ id: `a-${Date.now()}`, text, due, done: false });
  toast('Added to your career path in My Plan');
}

/** My Plan's Career Path tab: the career goal built into the learning plan, its four stages, and the career steps. */
export function CareerPathPanel({ phone }: { phone: boolean }) {
  const cc = useMemo(() => mockData()?.learner.careerCompass ?? null, []);
  const { hasFeature } = useAccess();
  const [goalId, setGoalId] = useState<string | null>(null);
  if (cc) seedSaves({ ...cc.saved, actions: cc.actions, events: cc.registrations });
  const saves = useCareerSaves();
  if (!cc) return null;
  const goals = cc.careers.filter((c) => saves.careers.includes(c.id));
  const goal = goals.find((g) => g.id === goalId) ?? goals[0] ?? matchCareers(cc.careers, withPreferences(cc.answers, cc.preferences))[0].career;
  const programs = cc.programs.filter((p) => goal.programIds.includes(p.id));
  const stages = careerStages(goal, cc.learner.level, programs);
  const explore = () => router.push((hasFeature('careerCompass') ? '/learn/careers?tab=explorer' : '/plans?need=premium') as Href);
  return (
    <View style={s.stack}>
      <Panel title="My Career Path" sub="Your career goal, built into this plan: the subjects you study now lead to it." right={<Btn small ghost icon="search" label="Explore careers" onPress={explore} />}>
        {goals.length ? (
          <View style={s.chips} accessibilityRole="tablist">
            {goals.map((c) => (
              <Pressable key={c.id} style={[s.goal, c.id === goal.id && s.goalOn]} onPress={() => setGoalId(c.id)} accessibilityRole="tab" accessibilityState={{ selected: c.id === goal.id }}>
                <Icon name={c.icon} size={14} color={c.id === goal.id ? L.white : BRAND_BLUE} />
                <Text style={[s.goalText, c.id === goal.id && s.goalTextOn]}>{c.title}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={cs.small}>{`Save a career to set it as your goal. Showing ${goal.title}, your closest match.`}</Text>
        )}
        <View style={[s.road, phone && s.roadP]}>
          {stages.map((st, i) => (
            <View key={st.when} style={[s.stage, !phone && s.stageD]}>
              <View style={s.stageHead}>
                <View style={s.stageNo}>
                  <Text style={s.stageNoText}>{i + 1}</Text>
                </View>
                <Text style={s.stageWhen}>{st.when}</Text>
              </View>
              <Text style={s.stageTitle}>{st.title}</Text>
              <Text style={cs.small}>{st.body}</Text>
              {i === 0 ? <FitPill fit={subjectFit(goal.essentials, cc.learner.subjects)} /> : null}
            </View>
          ))}
        </View>
        <Text style={cs.small}>{`If plans change: ${goal.related.join(', ')} use many of the same subjects.`}</Text>
      </Panel>
      <Panel title="Career steps" sub="Tick a step when it’s done. Steps from counseling sessions, events and applications land here too.">
        {saves.actions.length ? (
          saves.actions.map((a) => (
            <Pressable key={a.id} style={s.action} onPress={() => toggleAction(a.id)} accessibilityRole="checkbox" accessibilityState={{ checked: a.done }}>
              <View style={[s.box, a.done && s.boxOn]}>{a.done ? <Icon name="tick" size={13} color={L.white} /> : null}</View>
              <Text style={[cs.body, s.flex, a.done && s.doneText]}>{a.text}</Text>
              <Text style={cs.small}>{shortDate(a.due)}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={cs.small}>No career steps yet.</Text>
        )}
        <View style={s.chips}>
          {programs.slice(0, 2).map((p) => (
            <Btn key={p.id} small ghost icon="plus" label={`Check entry for the ${p.award === 'Bachelor' ? 'degree' : p.award.toLowerCase()}`} onPress={() => addCareerStep(saves.actions, `Check entry requirements: ${p.title}`, p.deadline)} />
          ))}
        </View>
      </Panel>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: BRAND_SOFT },
  goalOn: { backgroundColor: BRAND_BLUE },
  goalText: { fontSize: 13, fontWeight: '600', color: BRAND_BLUE },
  goalTextOn: { color: L.white },
  road: { flexDirection: 'row', gap: 12 },
  roadP: { flexDirection: 'column' },
  stage: { gap: 6, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.blueSoft },
  stageD: { flex: 1 },
  stageHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stageNo: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: BRAND_BLUE },
  stageNoText: { fontSize: 12, fontWeight: '700', color: L.white },
  stageWhen: { fontSize: 12, fontWeight: '700', color: BRAND_BLUE, textTransform: 'uppercase' },
  stageTitle: { fontSize: 14.5, fontWeight: '700', color: L.navy },
  action: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  box: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1.5, borderColor: Maple.blueLine },
  boxOn: { borderColor: Maple.successText, backgroundColor: Maple.successText },
  doneText: { color: L.muted, textDecorationLine: 'line-through' },
});
