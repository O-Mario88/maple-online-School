import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Icon } from '@/components/icon';
import { Chips, Sheet } from '@/features/learner/careers/CareerParts';
import { L } from '@/features/learner/frame/LightFrame';
import type { IconName } from '@/lib/icons';
import { offerCalendarFile } from '@/lib/calendar-file';
import { toast } from '@/lib/toast';
import { todayISO } from '@/lib/today';

import { Card, Field, k, LAV, OutlineBtn, BRAND_BLUE, SubjectIcon } from './PlanKit';
import type { PlanState } from './PlanViews';
import {
  calendarFileName,
  dayTotal,
  formatMinutes,
  scheduleIcs,
  type Session,
  sessionMinutes,
  weeklyBreakdown,
  weekRange,
  WEEKDAYS,
} from './schedule';
import { Maple } from '@/constants/maple';
import { Palette } from '@/constants/palette';

type ViewMode = 'week' | 'day' | 'list';
const DAY_NAMES: Readonly<Record<string, string>> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TIME = /^([01]?\d|2[0-3]):[0-5]\d$/;
const to12 = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
const addMinutes = (t: string, n: number) => {
  const [h, m] = t.split(':').map(Number);
  const total = Math.min(23 * 60 + 59, h * 60 + m + n);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};
const todayName = () => WEEKDAYS[(new Date(`${todayISO()}T12:00:00Z`).getUTCDay() + 6) % 7];

function useSchedulePage(p: PlanState, phone: boolean) {
  const [offset, setOffset] = useState(0);
  const [mode, setMode] = useState<ViewMode>('week');
  const [day, setDay] = useState<string>(todayName());
  const [reminders, setReminders] = useState(true);
  const [adding, setAdding] = useState(false);
  const week = weekRange(todayISO(), offset);
  const ordered = [...p.sessions].sort(
    (a, b) =>
      WEEKDAYS.indexOf(a.day as (typeof WEEKDAYS)[number]) - WEEKDAYS.indexOf(b.day as (typeof WEEKDAYS)[number]) ||
      a.start.localeCompare(b.start),
  );
  return { phone, offset, setOffset, mode, setMode, day, setDay, reminders, setReminders, adding, setAdding, week, ordered };
}
type SP = ReturnType<typeof useSchedulePage>;

function Header({ x, phone }: { x: SP; phone: boolean }) {
  const modes: readonly { key: ViewMode; label: string; icon: IconName }[] = [
    { key: 'week', label: 'Week', icon: 'calendar' },
    { key: 'day', label: 'Day', icon: 'calendar' },
    { key: 'list', label: 'List', icon: 'list' },
  ];
  return (
    <View style={[s.header, phone && s.headerP]}>
      <View style={s.headLeft}>
        <View style={s.headIcon}>
          <Icon name="calendar" size={24} color={BRAND_BLUE} />
        </View>
        <View style={k.flex}>
          <Text style={s.headTitle}>Study Schedule</Text>
          <Text style={k.small}>A week of focused study, practice and revision tailored to your subjects and goals.</Text>
        </View>
      </View>
      <View style={s.weekNav}>
        <Pressable onPress={() => x.setOffset(x.offset - 1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Previous week">
          <Icon name="chevronLeft" size={18} color={L.navy} />
        </Pressable>
        <Icon name="calendar" size={16} color={L.navy} />
        <Text style={s.weekLabel}>{x.week.label}</Text>
        <Pressable onPress={() => x.setOffset(x.offset + 1)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Next week">
          <Icon name="chevronRight" size={18} color={L.navy} />
        </Pressable>
      </View>
      <View style={s.modes} accessibilityRole="tablist">
        {modes.map((m) => (
          <Pressable
            key={m.key}
            style={[s.mode, x.mode === m.key && s.modeOn]}
            onPress={() => x.setMode(m.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: x.mode === m.key }}>
            <Icon name={m.icon} size={15} color={x.mode === m.key ? L.white : L.navy} />
            <Text style={[s.modeText, x.mode === m.key && s.white]}>{m.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function DayTiles({ p, x }: { p: PlanState; x: SP }) {
  return (
    <View style={[s.tiles, x.phone && s.tilesP]}>
      {WEEKDAYS.map((d, i) => {
        const total = dayTotal(p.sessions, d);
        const on = d === x.day;
        return (
          <Pressable
            key={d}
            style={[s.tile, x.phone && s.tileP, on && s.tileOn]}
            onPress={() => x.setDay(d)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={`${DAY_NAMES[d]}: ${total ? formatMinutes(total) : 'rest day'}`}>
            <Text style={[s.tileDay, on && s.purple]}>{d}</Text>
            <Text style={[s.tileNum, on && s.purple]}>{Number(x.week.days[i].slice(8))}</Text>
            {total ? (
              <Text style={[s.tileTime, x.phone && s.tileTimeP, on && s.purple]}>{formatMinutes(total)}</Text>
            ) : (
              <View style={s.rest}>
                {!x.phone ? <Icon name="coffee" size={13} color={BRAND_BLUE} /> : null}
                <Text style={[s.tileTime, x.phone && s.tileTimeP]}>Rest</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

function SessionRow({ p, ss, phone }: { p: PlanState; ss: Session; phone: boolean }) {
  const sub = p.subjects.find((y) => y.name === ss.subject);
  const brk = ss.kind === 'break';
  return (
    <View style={[s.timeRow, phone && s.timeRowP]}>
      <View style={[s.timeCol, phone && s.timeColP]}>
        <View style={[s.timeDot, brk && s.timeDotBreak]} />
        <Text style={s.timeText}>{`${to12(ss.start)} – ${to12(ss.end)}`}</Text>
      </View>
      <View style={[s.session, brk && s.sessionBreak]}>
        {brk ? (
          <View style={s.breakIcon}>
            <Icon name="coffee" size={18} color={BRAND_BLUE} />
          </View>
        ) : sub ? (
          <SubjectIcon icon={sub.icon} tint={sub.tint} size={34} />
        ) : null}
        <View style={k.flex}>
          <Text style={s.sessionTitle}>{brk ? 'Break' : ss.subject}</Text>
          <Text style={k.small}>{ss.topic}</Text>
        </View>
        <Text style={s.duration}>{`${sessionMinutes(ss)} min`}</Text>
        {!brk ? (
          <Pressable
            onPress={() => p.openSubject(ss.subject)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Start ${ss.subject}: ${ss.topic}`}>
            <View style={s.play}>
              <Icon name="playFill" size={12} color={BRAND_BLUE} />
            </View>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function DayPlan({ p, x }: { p: PlanState; x: SP }) {
  const items = x.ordered.filter((ss) => ss.day === x.day);
  const date = x.week.days[WEEKDAYS.indexOf(x.day as (typeof WEEKDAYS)[number])];
  return (
    <Card
      title={`${DAY_NAMES[x.day]}, ${Number(date.slice(8))} ${MONTHS[Number(date.slice(5, 7)) - 1]}`}
      icon="calendar"
      right={<Text style={s.total}>{`Total: ${formatMinutes(dayTotal(p.sessions, x.day))}`}</Text>}>
      {items.length ? (
        items.map((ss) => <SessionRow key={`${ss.day}${ss.start}`} p={p} ss={ss} phone={x.phone} />)
      ) : (
        <Text style={k.small}>A rest day. Nothing planned.</Text>
      )}
      <Pressable style={s.addRow} onPress={() => x.setAdding(true)} accessibilityRole="button">
        <Icon name="plus" size={16} color={BRAND_BLUE} />
        <Text style={s.addText}>Add Study Session</Text>
      </Pressable>
    </Card>
  );
}

function ListView({ p, x }: { p: PlanState; x: SP }) {
  return (
    <Card title="This week’s sessions" icon="list">
      {WEEKDAYS.map((d) => {
        const items = x.ordered.filter((ss) => ss.day === d);
        if (!items.length) return null;
        return (
          <View key={d} style={s.listDay}>
            <Text style={s.listDayTitle}>{`${DAY_NAMES[d]} · ${formatMinutes(dayTotal(p.sessions, d))}`}</Text>
            {items.map((ss) => (
              <SessionRow key={`${ss.day}${ss.start}`} p={p} ss={ss} phone={x.phone} />
            ))}
          </View>
        );
      })}
    </Card>
  );
}

function StayOnTrack({ x }: { x: SP }) {
  return (
    <View style={s.stay}>
      <Icon name="clipboard" size={34} color={BRAND_BLUE} />
      <View style={s.stayText}>
        <Text style={s.sessionTitle}>Stay on Track</Text>
        <Text style={k.small}>Get reminders, track completion and build a consistent study habit.</Text>
      </View>
      <View style={s.switchRow}>
        <Icon name="bell" size={16} color={L.navy} />
        <Text style={s.switchText}>Study Reminders</Text>
        <Switch
          value={x.reminders}
          onValueChange={(v) => {
            x.setReminders(v);
            toast(v ? 'We’ll remind you 10 minutes before each session.' : 'Study reminders off.');
          }}
          trackColor={{ true: BRAND_BLUE, false: Maple.borderStrong }}
          accessibilityLabel="Study reminders"
        />
      </View>
    </View>
  );
}

/** The donut's own colours, so no two slices look alike whatever the subjects' colours are. */
// Every slice must differ from the others: two subjects in one colour can't be told apart.
const CHART_COLORS = [Maple.blue, Maple.successText, Maple.warning, Palette.pink600, Palette.cyan700, Palette.lime800, Maple.error];
const R = 62;
const CIRC = 2 * Math.PI * R;

function Breakdown({ p }: { p: PlanState }) {
  const b = weeklyBreakdown(p.sessions);
  const lens = b.subjects.map((x) => (b.total ? (x.minutes / b.total) * CIRC : 0));
  const tints = b.subjects.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);
  const arcs = b.subjects.map((x, i) => ({
    subject: x.subject,
    len: lens[i],
    start: lens.slice(0, i).reduce((n, v) => n + v, 0),
    tint: tints[i],
  }));
  return (
    <Card title="Weekly Breakdown">
      <View style={s.donutRow}>
        <View style={s.donut}>
          <Svg width={160} height={160} viewBox="0 0 160 160" style={s.turn}>
            <Circle cx={80} cy={80} r={R} stroke={Maple.blueSelected} strokeWidth={18} fill="none" />
            {arcs.map((a) => (
              <Circle
                key={a.subject}
                cx={80}
                cy={80}
                r={R}
                stroke={a.tint}
                strokeWidth={18}
                fill="none"
                strokeDasharray={`${a.len} ${CIRC - a.len}`}
                strokeDashoffset={-a.start}
              />
            ))}
          </Svg>
          <View style={s.donutCenter}>
            <Text style={s.donutTotal}>{formatMinutes(b.total)}</Text>
            <Text style={k.small}>Total Study Time</Text>
          </View>
        </View>
        <View style={s.stayText}>
          {b.subjects.map((x, i) => (
            <View key={x.subject} style={s.legend}>
              <View style={[s.legendDot, { backgroundColor: tints[i] }]} />
              <Text style={[k.body, k.flex]}>{x.subject}</Text>
              <Text style={s.legendVal}>{`${formatMinutes(x.minutes)} (${x.share}%)`}</Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
  );
}

async function exportSchedule(sessions: readonly Session[], weekStart: string) {
  const result = await offerCalendarFile(scheduleIcs(sessions, weekStart), calendarFileName(weekStart));
  if (!result.ok) return toast(result.reason);
  // The share sheet speaks for itself on phones; the web download needs a word on what to do next.
  if (result.how === 'downloaded') toast('Schedule downloaded. Open it to add the sessions to your calendar.');
}

function QuickActions({ p, x }: { p: PlanState; x: SP }) {
  const items: readonly { label: string; icon: IconName; go: () => void }[] = [
    { label: 'Adjust Schedule', icon: 'edit', go: () => p.setAdjusting(true) },
    { label: 'Add Study Task', icon: 'plus', go: () => x.setAdding(true) },
    { label: 'Set a Reminder', icon: 'bell', go: () => toast(`Reminder set for ${DAY_NAMES[x.day]}’s first session.`) },
    { label: 'Export Schedule', icon: 'download', go: () => void exportSchedule(p.sessions, x.week.start) },
  ];
  return (
    <Card title="Quick Actions">
      <View style={s.actions}>
        {items.map((it) => (
          <Pressable key={it.label} style={s.action} onPress={it.go} accessibilityRole="button">
            <Icon name={it.icon} size={20} color={BRAND_BLUE} />
            <Text style={s.actionText}>{it.label}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

function AddSession({ p, x }: { p: PlanState; x: SP }) {
  const [day, setDay] = useState(x.day);
  const [subject, setSubject] = useState(p.subjects[0]?.name ?? '');
  const [start, setStart] = useState('17:00');
  const [length, setLength] = useState('45 min');
  const [topic, setTopic] = useState('');
  const [error, setError] = useState<string | null>(null);
  if (!x.adding) return null;
  return (
    <Sheet title="Add a study session" onClose={() => x.setAdding(false)}>
      <Text style={s.label}>Day</Text>
      <Chips options={[...WEEKDAYS]} on={[day]} onPress={setDay} />
      <Text style={s.label}>Subject</Text>
      <Chips options={p.subjects.map((y) => y.name)} on={[subject]} onPress={setSubject} />
      <Field label="Start time (24-hour, e.g. 17:00)" value={start} onChange={setStart} />
      <Text style={s.label}>Length</Text>
      <Chips options={['30 min', '45 min', '60 min']} on={[length]} onPress={setLength} />
      <Field label="Topic" value={topic} onChange={setTopic} placeholder="For example: Past paper questions" />
      {error ? <Text style={s.error}>{error}</Text> : null}
      <OutlineBtn
        solid
        label="Add session"
        onPress={() => {
          if (!TIME.test(start)) return setError('Enter the start time as HH:MM, for example 17:00.');
          const padded = start.length === 4 ? `0${start}` : start;
          p.addSession({
            day,
            start: padded,
            end: addMinutes(padded, Number(length.split(' ')[0])),
            subject,
            topic: topic.trim() || 'Study session',
            kind: 'study',
          });
          x.setDay(day);
          x.setAdding(false);
        }}
      />
    </Sheet>
  );
}

/** Study Schedule (its reference): the week, each day’s sessions, the weekly breakdown and quick actions. */
export function ScheduleTab({ p, phone }: { p: PlanState; phone: boolean }) {
  const x = useSchedulePage(p, phone);
  const left = x.mode === 'list' ? <ListView p={p} x={x} /> : <DayPlan p={p} x={x} />;
  return (
    <View style={s.stack}>
      <Header x={x} phone={phone} />
      {x.mode !== 'list' ? <DayTiles p={p} x={x} /> : null}
      <View style={[s.cols, phone && s.colsP]}>
        <View style={[k.flex, s.stack]}>
          {left}
          <StayOnTrack x={x} />
        </View>
        <View style={[s.stack, !phone && s.right]}>
          <Breakdown p={p} />
          <QuickActions p={p} x={x} />
        </View>
      </View>
      <AddSession p={p} x={x} />
    </View>
  );
}

const s = StyleSheet.create({
  stack: { gap: 16 },
  cols: { flexDirection: 'row', gap: 18, alignItems: 'flex-start' },
  colsP: { flexDirection: 'column', alignItems: 'stretch' },
  right: { width: 520 },
  white: { color: L.white },
  purple: { color: BRAND_BLUE },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  headerP: { flexDirection: 'column', alignItems: 'stretch' },
  headLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 14 },
  headIcon: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: LAV },
  headTitle: { fontSize: 24, fontWeight: '800', color: L.navy },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: L.line,
  },
  weekLabel: { fontSize: 14, fontWeight: '600', color: L.navy },
  modes: { flexDirection: 'row', gap: 4, padding: 3, borderRadius: 12, backgroundColor: Maple.blueSoft },
  mode: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 10 },
  modeOn: { backgroundColor: BRAND_BLUE },
  modeText: { fontSize: 13.5, fontWeight: '600', color: L.navy },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  tilesP: { gap: 4 },
  tileP: { paddingVertical: 8, borderRadius: 10 },
  tileTimeP: { fontSize: 10 },
  timeRowP: { flexDirection: 'column', alignItems: 'stretch', gap: 6 },
  timeColP: { width: 'auto' },
  tileOn: { borderWidth: 2, borderColor: BRAND_BLUE, backgroundColor: LAV },
  tileDay: { fontSize: 13, fontWeight: '600', color: L.navy },
  tileNum: { fontSize: 22, fontWeight: '800', color: L.navy },
  tileTime: { fontSize: 13, color: L.ink },
  rest: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  total: { fontSize: 15, fontWeight: '600', color: L.navy },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  timeCol: { width: 170, flexDirection: 'row', alignItems: 'center', gap: 10 },
  timeDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND_BLUE },
  timeDotBreak: { borderWidth: 2, borderColor: BRAND_BLUE, backgroundColor: L.white },
  timeText: { fontSize: 13.5, color: L.navy },
  session: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: L.line,
    backgroundColor: L.white,
  },
  sessionBreak: { backgroundColor: Maple.blueSoft },
  breakIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  sessionTitle: { fontSize: 15, fontWeight: '700', color: L.navy },
  duration: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12.5,
    fontWeight: '600',
    color: BRAND_BLUE,
    backgroundColor: LAV,
  },
  play: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, borderWidth: 1.5, borderColor: BRAND_BLUE },
  addRow: {
    alignSelf: 'flex-start',
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: LAV,
  },
  addText: { fontSize: 14, fontWeight: '700', color: BRAND_BLUE },
  listDay: { gap: 8, paddingBottom: 6 },
  listDayTitle: { fontSize: 14, fontWeight: '800', color: L.navy },
  stay: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, padding: 18, borderRadius: 16, backgroundColor: LAV },
  stayText: { flex: 1, minWidth: 200 },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: L.white,
  },
  switchText: { fontSize: 13.5, fontWeight: '600', color: L.navy },
  donutRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 20 },
  donut: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  turn: { transform: [{ rotate: '-90deg' }] },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutTotal: { fontSize: 22, fontWeight: '800', color: L.navy },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendVal: { fontSize: 13, color: L.navy },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  action: {
    width: '48%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: L.line,
  },
  actionText: { fontSize: 14, fontWeight: '600', color: L.navy },
  label: { fontSize: 13, fontWeight: '700', color: L.navy },
  error: { fontSize: 13, color: Maple.error },
});
