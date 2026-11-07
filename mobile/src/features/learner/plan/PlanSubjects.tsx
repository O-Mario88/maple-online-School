import { type Href } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Chips, Sheet } from '@/features/learner/careers/CareerParts';
import { L } from '@/features/learner/frame/LightFrame';
import { Picker } from '@/features/learner/lessons/LessonParts';
import { todayISO } from '@/lib/today';

import { levelFor, type SubjectLevel } from './plan';
import { SubjectBars } from './PlanGoals';
import { Bar, barColor, Card, k, LAV, OutlineBtn, Pill, BRAND_BLUE, SubjectIcon } from './PlanKit';
import type { PlanState } from './PlanViews';
import { WEEKDAYS } from './schedule';
import { Maple } from '@/constants/maple';

type Subject = PlanState['subjects'][number];
const LEVEL_TONE: Readonly<Record<SubjectLevel, 'green' | 'purple' | 'orange'>> = { Strong: 'purple', Good: 'green', Developing: 'orange' };
const to12 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

function SubjectCard({ p, x, list }: { p: PlanState; x: Subject; list: boolean }) {
  const level = levelFor(x.progress);
  return (
    <View style={[s.card, list ? s.cardList : s.cardGrid]}>
      <View style={s.cardHead}>
        <SubjectIcon icon={x.icon} tint={x.tint} size={46} />
        <Text style={[s.name, k.flex]}>{x.name}</Text>
        <Pill text={level} tone={LEVEL_TONE[level]} />
      </View>
      <Text style={k.body}>{`${Math.round(x.progress * 100)}% complete`}</Text>
      <Bar value={x.progress} color={barColor(x.progress)} height={8} />
      <Pressable
        style={s.next}
        onPress={() => p.openSubject(x.name)}
        accessibilityRole="link"
        accessibilityLabel={`Next lesson in ${x.name}: ${x.next}`}>
        <Icon name="playFill" size={16} color={BRAND_BLUE} />
        <View style={k.flex}>
          <Text style={k.small}>Next lesson</Text>
          <Text style={s.nextTitle}>{x.next}</Text>
        </View>
        <Icon name="chevronRight" size={16} color={L.navy} />
      </Pressable>
      <View style={s.btns}>
        <OutlineBtn solid icon="playFill" label="Continue Learning" onPress={() => p.openSubject(x.name)} />
        <OutlineBtn icon="library" label="Resources" onPress={() => p.go(`/learn/library?subject=${encodeURIComponent(x.name)}` as Href)} />
      </View>
    </View>
  );
}

function AddSubject({ p, list }: { p: PlanState; list: boolean }) {
  const [open, setOpen] = useState(false);
  const left = p.plan.addable.filter((a) => !p.subjects.some((x) => x.name === a));
  return (
    <>
      <View style={[s.add, list ? s.cardList : s.cardGrid]}>
        <View style={s.addIcon}>
          <Icon name="plus" size={26} color={BRAND_BLUE} />
        </View>
        <Text style={s.addTitle}>Add a Subject</Text>
        <Text style={[k.small, s.center]}>Include another subject in your learning plan (e.g. ICT, Geography).</Text>
        <OutlineBtn icon="plus" label="Add Subject" onPress={() => setOpen(true)} />
      </View>
      {open ? (
        <Sheet title="Add a subject" onClose={() => setOpen(false)}>
          {left.length ? (
            <Chips
              options={left}
              on={[]}
              onPress={(v) => {
                p.addSubject(v);
                setOpen(false);
              }}
            />
          ) : (
            <Text style={k.body}>Every subject you can add is already in your plan.</Text>
          )}
        </Sheet>
      ) : null}
    </>
  );
}

function WeekSchedule({ p }: { p: PlanState }) {
  const days = WEEKDAYS.slice(0, 5);
  const today = new Date(`${todayISO()}T12:00:00Z`).getUTCDay();
  const [day, setDay] = useState<string>(WEEKDAYS[(today + 6) % 7] ?? 'Mon');
  const dates = weekDates();
  const items = p.sessions.filter((x) => x.day === day && x.kind === 'study');
  return (
    <Card
      title="This Week’s Study Schedule"
      icon="calendar"
      right={
        <Text style={s.link} onPress={() => p.setTab('schedule')} accessibilityRole="link">
          View All
        </Text>
      }>
      <View style={s.days}>
        {days.map((d, i) => (
          <Pressable
            key={d}
            style={[s.day, d === day && s.dayOn]}
            onPress={() => setDay(d)}
            accessibilityRole="tab"
            accessibilityState={{ selected: d === day }}>
            <Text style={[s.dayName, d === day && s.white]}>{d}</Text>
            <Text style={[s.dayNum, d === day && s.white]}>{dates[i]}</Text>
          </Pressable>
        ))}
      </View>
      {items.length ? (
        items.map((x) => {
          const sub = p.subjects.find((y) => y.name === x.subject);
          return (
            <View key={`${x.day}${x.start}`} style={s.slot}>
              <Text style={s.slotTime}>{to12(x.start)}</Text>
              {sub ? <SubjectIcon icon={sub.icon} tint={sub.tint} size={28} /> : null}
              <Text style={[k.body, k.flex]} numberOfLines={1}>
                <Text style={s.bold}>{x.subject}</Text>
                {` – ${x.topic}`}
              </Text>
            </View>
          );
        })
      ) : (
        <Text style={k.small}>Nothing planned that day.</Text>
      )}
    </Card>
  );
}

const weekDates = () => {
  const t = new Date(`${todayISO()}T12:00:00Z`);
  const monday = new Date(t.getTime() - ((t.getUTCDay() + 6) % 7) * 86_400_000);
  return Array.from({ length: 5 }, (_, i) => new Date(monday.getTime() + i * 86_400_000).getUTCDate());
};

function Recs({ p }: { p: PlanState }) {
  return (
    <Card title="Recommendations for You" icon="sparkle">
      {p.plan.tips.slice(0, 2).map((t) => (
        <Pressable key={t.id} style={s.rec} onPress={() => p.go(t.href)} accessibilityRole="link">
          <View style={s.recIcon}>
            <Icon name={t.action === 'lesson' ? 'play' : t.action === 'practice' ? 'doc' : 'calendar'} size={18} color={BRAND_BLUE} />
          </View>
          <View style={k.flex}>
            <Text style={s.recTitle}>{t.title}</Text>
            <Text style={k.small}>{t.sub}</Text>
          </View>
          <Icon name="chevronRight" size={16} color={L.navy} />
        </Pressable>
      ))}
    </Card>
  );
}

const FILTERS = [
  { value: 'all', label: 'All Subjects' },
  { value: 'Strong', label: 'Strong' },
  { value: 'Good', label: 'Good' },
  { value: 'Developing', label: 'Developing' },
];

/** By Subject (its reference): every subject in the plan with its next lesson, the week’s schedule and what to do next. */
export function SubjectsTab({ p, phone }: { p: PlanState; phone: boolean }) {
  const [filter, setFilter] = useState('all');
  const [list, setList] = useState(false);
  const shown = p.subjects.filter((x) => filter === 'all' || levelFor(x.progress) === filter);
  const tools = (
    <View style={s.tools}>
      <View style={s.toggle}>
        <Pressable
          style={[s.toggleBtn, !list && s.toggleOn]}
          onPress={() => setList(false)}
          accessibilityRole="button"
          accessibilityState={{ selected: !list }}
          accessibilityLabel="Grid view">
          <Icon name="grid" size={16} color={!list ? L.white : L.ink} />
        </Pressable>
        <Pressable
          style={[s.toggleBtn, list && s.toggleOn]}
          onPress={() => setList(true)}
          accessibilityRole="button"
          accessibilityState={{ selected: list }}
          accessibilityLabel="List view">
          <Icon name="list" size={16} color={list ? L.white : L.ink} />
        </Pressable>
      </View>
      <Picker compact label="Subjects" icon="filter" value={filter} options={FILTERS} onChange={setFilter} />
    </View>
  );
  const main = (
    <Card title="Subjects in Your Plan" sub="Track progress, continue learning and focus on what’s next." right={phone ? undefined : tools}>
      {phone ? tools : null}
      <View style={[s.grid, (list || phone) && s.gridList]}>
        {shown.map((x) => (
          <SubjectCard key={x.name} p={p} x={x} list={list || phone} />
        ))}
        {filter === 'all' ? <AddSubject p={p} list={list || phone} /> : null}
      </View>
    </Card>
  );
  const side = (
    <>
      <SubjectBars p={p} title="Your Progress by Subject" />
      <WeekSchedule p={p} />
      <Recs p={p} />
    </>
  );
  return phone ? (
    <View style={s.stack}>
      {main}
      {side}
    </View>
  ) : (
    <View style={s.cols}>
      <View style={k.flex}>{main}</View>
      <View style={s.right}>{side}</View>
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: 16 },
  cols: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  right: { width: 370, gap: 16 },
  white: { color: L.white },
  bold: { fontWeight: '700' },
  center: { textAlign: 'center' },
  link: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  tools: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 10 },
  toggle: { flexDirection: 'row', gap: 4, padding: 3, borderRadius: 12, backgroundColor: Maple.blueSoft },
  toggleBtn: { width: 38, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  toggleOn: { backgroundColor: BRAND_BLUE },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 8 },
  gridList: { flexDirection: 'column' },
  card: { gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardGrid: { width: '31.9%' },
  cardList: { width: '100%' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 17, fontWeight: '800', color: L.navy },
  next: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  nextTitle: { fontSize: 14, fontWeight: '700', color: L.navy },
  btns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  add: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Maple.blueLine,
    backgroundColor: Maple.blueSoft,
  },
  addIcon: { width: 54, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: LAV },
  addTitle: { fontSize: 17, fontWeight: '800', color: BRAND_BLUE },
  days: { flexDirection: 'row', gap: 8 },
  day: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: L.line },
  dayOn: { borderColor: BRAND_BLUE, backgroundColor: BRAND_BLUE },
  dayName: { fontSize: 11.5, color: L.body },
  dayNum: { fontSize: 18, fontWeight: '800', color: L.navy },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: Maple.blueSelected },
  slotTime: { width: 64, fontSize: 12.5, fontWeight: '600', color: L.navy },
  rec: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  recIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: LAV },
  recTitle: { fontSize: 14, fontWeight: '700', color: L.navy },
});
