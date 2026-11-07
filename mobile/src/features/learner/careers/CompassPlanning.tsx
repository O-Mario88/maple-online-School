import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';

import { Btn, cs, FitPill, Panel, BRAND_BLUE, shortDate, Tag } from './CareerParts';
import { upcoming } from './compass';
import type { Compass } from './useCompass';

const STEPS = ['Check the current entry requirements', 'Prepare your results slip, ID and a recommendation', 'Apply on the institution’s official site'];

/** Application Planner: saved programs with their deadlines, subject fit and the steps to apply. */
export function ApplicationsTab({ x, phone }: { x: Compass; phone: boolean }) {
  const dated = upcoming(
    x.savedPrograms.map((p) => ({ id: p.id, title: p.title, date: p.deadline, kind: 'Application' })),
    x.today,
    20,
  );
  const daysLeft = (id: string) => dated.find((d) => d.id === id)?.daysLeft;
  return (
    <View style={s.stack}>
      <Panel title="Application Planner" sub="Programs you’ve saved, soonest deadline first. Maple helps you plan; you apply directly to the institution.">
        {x.savedPrograms.length ? (
          [...x.savedPrograms]
            .sort((a, b) => a.deadline.localeCompare(b.deadline))
            .map((p) => {
              const left = daysLeft(p.id);
              return (
                <View key={p.id} style={s.app}>
                  <View style={[s.appHead, phone && s.appHeadP]}>
                    <View style={s.flex}>
                      <Text style={s.strong}>{p.title}</Text>
                      <Text style={cs.small}>{`${x.uni(p.universityId)?.name ?? ''} · Apply by ${shortDate(p.deadline)}`}</Text>
                    </View>
                    <Tag text={left === undefined ? 'Deadline passed' : `${left} days left`} tone={left === undefined ? 'grey' : left <= 30 ? 'amber' : 'purple'} />
                  </View>
                  <FitPill fit={x.fit(p)} />
                  {STEPS.map((st) => (
                    <View key={st} style={s.step}>
                      <Icon name="chevronRight" size={13} color={BRAND_BLUE} />
                      <Text style={cs.body}>{st}</Text>
                    </View>
                  ))}
                  <View style={s.row}>
                    <Btn small ghost icon="plus" label="Add steps to My Plan" onPress={() => x.plan(`Apply: ${p.title}`, p.deadline)} />
                    <Btn small ghost label="View program" onPress={() => x.openProgram(p.id)} />
                  </View>
                </View>
              );
            })
        ) : (
          <View style={s.empty}>
            <Text style={cs.body}>Save programs in Universities & Programs to plan your applications here.</Text>
            <Btn small label="Find programs" onPress={() => x.setTab('programs')} />
          </View>
        )}
      </Panel>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  gridP: { flexDirection: 'column' },
  strong: { fontSize: 14.5, fontWeight: '700', color: L.navy },
  item: { gap: 4 },
  itemFoot: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingBottom: 10, paddingLeft: 52 },
  app: { gap: 8, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: L.line },
  appHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appHeadP: { alignItems: 'flex-start' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  empty: { alignItems: 'flex-start', gap: 10 },
});
