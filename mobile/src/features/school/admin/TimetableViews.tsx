import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn, Card, CardHead, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, CANVAS, LINE, NAVY, RED, TONES, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { Lesson, Slot, Subject } from '@/mock/school-admin';

import { AdminDesk, AdminPhone, Cell, type Column, DataTable, Face, MiniBtn, PageHead, SelectBox, Segments, useChoice } from '../kit/AdminKit';
import { Maple } from '@/constants/maple';

type Admin = MockData['schoolAdmin'];
type TT = Admin['timetable'];

interface Picked {
  slot: number;
  day: number;
}

const toneOf = (a: Admin, s: Subject) => TONES[a.SUBJECT_TONE[s]];

/** The grid's working state: lessons (editable), what's picked, what's still unscheduled. */

/** Longest name a grid tile shows in full; longer names (Physical Education) show their short subject (P.E.). */
const TILE_TITLE_MAX = 14;
const tileTitle = (l: Lesson): string => (l.label && l.label.length > TILE_TITLE_MAX ? l.subject : (l.label ?? l.subject));

function useTimetable(t: TT) {
  const [slots, setSlots] = useState<readonly Slot[]>(t.slots);
  const [picked, setPicked] = useState<Picked>({ slot: 0, day: 0 });
  const [unscheduled, setUnscheduled] = useState(t.unscheduled);
  const lessonAt = (p: Picked): Lesson | null => {
    const s = slots[p.slot];
    return s && 'lessons' in s ? (s.lessons[p.day] ?? null) : null;
  };
  const remove = (p: Picked) => {
    const l = lessonAt(p);
    setSlots((prev) => prev.map((s, i) => (i === p.slot && 'lessons' in s ? { ...s, lessons: s.lessons.map((x, d) => (d === p.day ? { ...x, subject: 'Library' as Subject, label: 'Free period', teacher: '—', room: '—' } : x)) } : s)));
    if (l) toast(`${l.label ?? l.subject} removed from ${t.days[p.day].dow} ${slots[p.slot].time}. The slot is now free.`);
  };
  const schedule = (subject: string) => {
    setUnscheduled((prev) => prev.filter((u) => u.label !== subject));
    toast(`${subject} placed in the first free slot with no teacher, room or class collisions.`);
  };
  const autoSchedule = () => {
    if (!unscheduled.length) return toast('Everything is scheduled. No collisions found.');
    const n = unscheduled.length;
    setUnscheduled([]);
    toast(`Auto-scheduled ${n} lessons. Checked against teachers, rooms and classes: 0 collisions.`);
  };
  return { slots, picked, setPicked, lessonAt, remove, unscheduled, schedule, autoSchedule };
}

/** One lesson tile: tinted by subject, with its room and teacher; a dimmed one doesn't match the view's filter. */
function LessonTile({ a, l, on, dim, onPress }: { a: Admin; l: Lesson; on: boolean; dim: boolean; onPress: () => void }) {
  const t = toneOf(a, l.subject);
  const free = l.teacher === '—';
  return (
    <Pressable
      style={({ hovered }) => [styles.tile, { backgroundColor: free ? Maple.blueSoft : t.soft }, on && styles.tileOn, dim && styles.dim, hovered && !on && styles.tileHover]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${l.label ?? l.subject}, ${l.room}, ${l.teacher}`}>
      <View style={styles.tileHead}>
        <Text style={[styles.tileTitle, { color: free ? BODY : t.text }]} numberOfLines={1}>
          {tileTitle(l)}
        </Text>
        <Icon name="more" size={15} color={NAVY} />
      </View>
      <Text style={styles.tileLine} numberOfLines={1}>
        {l.room}
      </Text>
      <Text style={styles.tileLine} numberOfLines={1}>
        {l.teacher}
      </Text>
    </Pressable>
  );
}

const VIEW_FILTER: Readonly<Record<string, (l: Lesson, pick: string) => boolean>> = {
  'Teacher View': (l, pick) => l.teacher === pick,
  'Room View': (l, pick) => l.room === pick,
};

/** The Class Details panel for the picked lesson. */
function Details({ a, tt, p, l, onDelete, onSubstitute }: { a: Admin; tt: TT; p: Picked; l: Lesson | null; onDelete: () => void; onSubstitute: () => void }) {
  if (!l) return null;
  const t = toneOf(a, l.subject);
  const [from, to] = tt.slots[p.slot].time.split(' – ');
  const rows: readonly [string, string][] = [
    ['Class', 'Primary 1A'],
    ['Subject', l.label ?? l.subject],
    ['Teacher', l.teacher],
    ['Room', l.room],
    ['Day & Time', `${tt.days[p.day].dow}, ${from} – ${to} ${p.slot < 7 ? 'AM' : 'PM'}`],
    ['Duration', '40 minutes'],
    ['Term', 'Term 1, 2026'],
  ];
  return (
    <Card style={styles.details}>
      <CardHead title="Class Details" right={<MiniBtn label="Edit" icon="edit" onPress={() => toast('Change the teacher, room or time. Collisions are checked as you edit.')} />} />
      <View style={styles.detailsHead}>
        <View style={[styles.swatch, { backgroundColor: t.soft }]} />
        <Text style={styles.detailsTitle}>{l.label ?? l.subject}</Text>
      </View>
      {rows.map(([k, v]) => (
        <View key={k} style={styles.kv}>
          <Text style={styles.key}>{k}</Text>
          <View style={styles.valueRow}>
            {k === 'Teacher' && tt.faces[v] ? <Face source={tt.faces[v]} size={24} /> : null}
            <Text style={[styles.value, k === 'Teacher' && styles.valueStrong]}>{v}</Text>
          </View>
        </View>
      ))}
      <View style={styles.detailsBtns}>
        <MiniBtn label="Delete" icon="trash" tone="red" onPress={onDelete} style={styles.flex} />
        <MiniBtn label="Duplicate" icon="doc" onPress={() => toast(`Duplicated ${l.label ?? l.subject}. Pick a free slot to place the copy.`)} style={styles.flex} />
      </View>
      <MiniBtn label="Find Substitute" icon="search" onPress={onSubstitute} />
    </Card>
  );
}

/** Master School Timetable & Zero-Collision Scheduler on the desktop reference. */
export function TimetableDesk({ a }: { a: Admin }) {
  const tt = a.timetable;
  const s = useTimetable(tt);
  const [view, setView] = useState('Weekly View');
  const [year, setYear, years] = useChoice(a.years);
  const [term, setTerm, terms] = useChoice(a.terms);
  const [campus, setCampus, campuses] = useChoice(a.campuses);
  const [section, setSection, sections] = useChoice(tt.sections);
  const [grade, setGrade, grades] = useChoice(tt.grades);
  const [cls, setCls, classes] = useChoice(tt.classes);
  const [panel, setPanel] = useState('Unscheduled');
  const [room, setRoom, rooms] = useChoice(tt.rooms);
  const picked = s.lessonAt(s.picked);
  const filterPick = view === 'Teacher View' ? (picked?.teacher ?? '') : view === 'Room View' ? (picked?.room ?? '') : '';
  const matches = (l: Lesson) => (VIEW_FILTER[view] ? VIEW_FILTER[view](l, filterPick) : room === 'All Rooms' || l.room === room);
  const panelTabs = [`Unscheduled (${s.unscheduled.length})`, `Conflicts (${tt.conflicts.length})`, 'Substitutes'];
  const listRows = s.slots.flatMap((slot, si) => ('lessons' in slot ? slot.lessons.map((l, d) => ({ key: `${si}-${d}`, day: tt.days[d].dow, time: slot.time, l })) : []));
  const listCols: readonly Column<(typeof listRows)[number]>[] = [
    { label: 'Day', flex: 0.6, render: (x) => <Cell strong>{x.day}</Cell> },
    { label: 'Time', flex: 1, render: (x) => <Cell>{x.time}</Cell> },
    { label: 'Subject', flex: 1.2, render: (x) => <Cell strong lines={2} color={toneOf(a, x.l.subject).text}>{x.l.label ?? x.l.subject}</Cell> },
    { label: 'Room', flex: 1, render: (x) => <Cell>{x.l.room}</Cell> },
    { label: 'Teacher', flex: 1.4, render: (x) => <Cell>{x.l.teacher}</Cell> },
  ];
  return (
    <AdminDesk me={a.me} search="Search students, teachers, classes, or reports..." active="Timetable">
      <PageHead
        title="Timetable"
        subtitle="Create and manage your school timetable with zero collisions."
        right={
          <>
            <SelectBox label="Academic Year" value={year} options={years} onChange={setYear} />
            <SelectBox label="Term" value={term} options={terms} onChange={setTerm} />
            <SelectBox label="Campus" value={campus} options={campuses} onChange={setCampus} />
            <Pressable style={styles.gear} onPress={() => toast('Periods, breaks, room capacities and teacher workload limits.')} accessibilityRole="button" accessibilityLabel="Timetable settings">
              <Icon name="settings" size={22} color={BODY} />
            </Pressable>
          </>
        }
      />
      <Segments items={tt.views} active={view} onChange={setView} style={styles.views} />
      <View style={styles.row}>
        <Card style={styles.gridCard}>
          <View style={styles.filters}>
            <SelectBox value={section} options={sections} onChange={setSection} width={104} />
            <SelectBox value={grade} options={grades} onChange={setGrade} width={114} />
            <SelectBox value={cls} options={classes} onChange={setCls} width={124} />
            <View style={styles.spacer} />
            <Pressable style={styles.navBtn} onPress={() => toast('Previous week: Mar 3 – Mar 7, 2026')} accessibilityRole="button" accessibilityLabel="Previous week">
              <Icon name="chevronLeft" size={18} color={BLUE} />
            </Pressable>
            <Text style={styles.range} numberOfLines={1}>
              {tt.range}
            </Text>
            <Pressable style={styles.navBtn} onPress={() => toast('Next week: Mar 17 – Mar 21, 2026')} accessibilityRole="button" accessibilityLabel="Next week">
              <Icon name="chevronRight" size={18} color={BLUE} />
            </Pressable>
            <View style={styles.spacer} />
            <MiniBtn label="Auto-Schedule" icon="sparkle" onPress={s.autoSchedule} />
            <Btn label="Add Class" icon="plus" onPress={() => toast('Pick a subject, teacher and room. We block any slot that would collide.')} height={42} />
          </View>
          {view === 'List View' ? (
            <DataTable columns={listCols} rows={listRows} rowKey={(x) => x.key} dense />
          ) : (
            <View style={styles.grid}>
              <View style={styles.gridHead}>
                <View style={styles.timeCol}>
                  <Text style={styles.headTime}>Time</Text>
                </View>
                {tt.days.map((d) => (
                  <View key={d.dow} style={styles.dayCol}>
                    <Text style={styles.dow}>{d.dow}</Text>
                    <Text style={styles.date}>{d.date}</Text>
                  </View>
                ))}
              </View>
              {s.slots.map((slot, si) => (
                <View key={slot.time} style={[styles.gridRow, !('lessons' in slot) && styles.gridRowBreak]}>
                  <View style={styles.timeCol}>
                    <Text style={styles.time}>{slot.time}</Text>
                  </View>
                  {'lessons' in slot
                    ? slot.lessons.map((l, d) => (
                        <View key={d} style={styles.dayCol}>
                          <LessonTile a={a} l={l} on={s.picked.slot === si && s.picked.day === d} dim={!matches(l)} onPress={() => s.setPicked({ slot: si, day: d })} />
                        </View>
                      ))
                    : tt.days.map((d) => (
                        <View key={d.dow} style={styles.dayCol}>
                          <View style={styles.breakTile}>
                            <Text style={styles.breakText}>{slot.label}</Text>
                          </View>
                        </View>
                      ))}
                </View>
              ))}
            </View>
          )}
        </Card>
        <View style={styles.side}>
          <Card style={styles.panel}>
            <UnderTabs items={panelTabs} active={panelTabs.find((x) => x.startsWith(panel)) ?? panelTabs[0]} onChange={(x) => setPanel(x.split(' (')[0])} size={12.5} spread style={styles.panelTabs} />
            {panel === 'Unscheduled'
              ? s.unscheduled.length
                ? s.unscheduled.map((u) => (
                    <View key={u.label} style={styles.unsched}>
                      <View style={[styles.square, { backgroundColor: toneOf(a, u.subject).solid + '66' }]} />
                      <View style={styles.flex}>
                        <Text style={styles.unschedTitle}>{u.label}</Text>
                        <Text style={styles.unschedMeta}>{u.cls}</Text>
                        <Text style={styles.unschedMeta}>{u.periods}</Text>
                      </View>
                      <MiniBtn label="Schedule" onPress={() => s.schedule(u.label)} />
                    </View>
                  ))
                : <Text style={styles.empty}>Everything for Primary 1A is scheduled.</Text>
              : null}
            {panel === 'Conflicts'
              ? tt.conflicts.map((c) => (
                  <View key={c.title} style={styles.conflict}>
                    <Icon name="alert" size={20} color={RED} />
                    <View style={styles.flex}>
                      <Text style={styles.unschedTitle}>{c.title}</Text>
                      <Text style={styles.unschedMeta}>{c.body}</Text>
                    </View>
                    <MiniBtn label="Resolve" onPress={() => toast('Moved P2B Science to Lab 2. No collisions remain.')} />
                  </View>
                ))
              : null}
            {panel === 'Substitutes'
              ? tt.substitutes.map((x) => (
                  <View key={x.name} style={styles.unsched}>
                    {tt.faces[x.name] ? <Face source={tt.faces[x.name]} size={38} /> : null}
                    <View style={styles.flex}>
                      <Text style={styles.unschedTitle}>{x.name}</Text>
                      <Text style={styles.unschedMeta}>{x.subjects}</Text>
                      <Text style={styles.unschedMeta}>{x.free}</Text>
                    </View>
                    <MiniBtn label="Assign" onPress={() => toast(`${x.name} now covers ${picked?.label ?? picked?.subject ?? 'this lesson'}. The class and teacher have been told.`)} />
                  </View>
                ))
              : null}
          </Card>
          <Details a={a} tt={tt} p={s.picked} l={picked} onDelete={() => s.remove(s.picked)} onSubstitute={() => setPanel('Substitutes')} />
        </View>
      </View>
      <Card style={styles.legendCard}>
        <View style={styles.flex}>
          <Text style={styles.legendTitle}>Subjects</Text>
          <View style={styles.legend}>
            {(['English', 'Mathematics', 'Science', 'C.R.E.', 'Social Studies', 'ICT', 'Art', 'Music', 'P.E.', 'Guidance', 'Library'] as const).map((sub) => (
              <View key={sub} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: toneOf(a, sub).solid }]} />
                <Text style={styles.legendText}>{sub}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.roomsBox}>
          <Text style={styles.legendTitle}>Rooms</Text>
          <SelectBox value={room} options={rooms} onChange={setRoom} width={170} />
        </View>
      </Card>
    </AdminDesk>
  );
}

/** The phone reference: class and week pickers, day tabs, then the day's lessons in time order. */
export function TimetablePhone({ a }: { a: Admin }) {
  const tt = a.timetable;
  const s = useTimetable(tt);
  const [cls, setCls, classes] = useChoice(tt.classes);
  const [week, setWeek, weeks] = useChoice(['This Week', 'Next Week', 'Last Week']);
  const [day, setDay] = useState(0);
  return (
    <AdminPhone
      me={a.me}
      footer={
        <View style={styles.phoneFooter}>
          <Btn label="Add Class" icon="plus" onPress={() => toast(`Add a lesson to ${cls} on ${tt.days[day].dow}. Collisions are checked as you pick.`)} height={52} />
        </View>
      }>
      <PageHead title="Timetable" subtitle="View and manage your school timetable." phone />
      <View style={styles.phoneSelects}>
        <SelectBox value={cls} options={classes} onChange={setCls} style={styles.flex} />
        <SelectBox value={week} options={weeks} onChange={setWeek} style={styles.flex} />
      </View>
      <View style={styles.dayTabs}>
        {tt.days.map((d, i) => {
          const on = i === day;
          return (
            <Pressable key={d.dow} style={[styles.dayTab, on && styles.dayTabOn]} onPress={() => setDay(i)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={`${d.dow} ${d.date}`}>
              <Text style={[styles.dayTabDow, on && styles.dayTabTextOn]}>{d.dow}</Text>
              <Text style={[styles.dayTabDate, on && styles.dayTabTextOn]}>{d.date}</Text>
            </Pressable>
          );
        })}
      </View>
      {s.slots.map((slot) => {
        if (!('lessons' in slot)) {
          return (
            <View key={slot.time} style={styles.phoneBreak}>
              <Text style={styles.phoneTime}>{slot.time}</Text>
              <Text style={styles.phoneBreakText}>{slot.label}</Text>
            </View>
          );
        }
        const l = slot.lessons[day];
        const t = toneOf(a, l.subject);
        return (
          <View key={slot.time} style={styles.phoneSlot}>
            <View style={styles.phoneTimeBox}>
              <Text style={styles.phoneTime}>{slot.time}</Text>
            </View>
            <Pressable style={[styles.phoneLesson, { backgroundColor: t.soft, borderLeftColor: t.solid }]} onPress={() => toast(`${l.label ?? l.subject} • ${l.teacher} • ${l.room}`)} accessibilityRole="button" accessibilityLabel={`${slot.time}: ${l.label ?? l.subject}, ${l.room}, ${l.teacher}`}>
              <View style={styles.flex}>
                <Text style={styles.phoneLessonTitle} numberOfLines={1}>
                  {l.label ?? l.subject}
                </Text>
                <Text style={styles.phoneLessonMeta} numberOfLines={1}>{`${cls}  •  ${l.room}`}</Text>
                <Text style={styles.phoneLessonMeta} numberOfLines={1}>
                  {l.teacher}
                </Text>
              </View>
              <Icon name="more" size={20} color={NAVY} />
            </Pressable>
          </View>
        );
      })}
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  spacer: { flexGrow: 1 },
  gear: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  views: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  gridCard: { flex: 1, minWidth: 0, gap: 14, padding: 14 },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  range: { flexShrink: 0, fontSize: 14, fontWeight: '500', color: NAVY },
  grid: { gap: 6 },
  gridHead: { flexDirection: 'row', gap: 6 },
  gridRow: { flexDirection: 'row', gap: 6, minHeight: 72 },
  gridRowBreak: { minHeight: 38 },
  timeCol: { width: 96, justifyContent: 'center', alignItems: 'center', borderRadius: 8, backgroundColor: Maple.blueSoft },
  dayCol: { flex: 1, minWidth: 0 },
  headTime: { paddingVertical: 12, fontSize: 14, fontWeight: '600', color: NAVY },
  dow: { textAlign: 'center', paddingTop: 6, fontSize: 14, fontWeight: '700', color: NAVY },
  date: { textAlign: 'center', paddingBottom: 6, fontSize: 12.5, color: BODY },
  time: { fontSize: 12.5, color: NAVY },
  tile: { flex: 1, gap: 2, paddingVertical: 8, paddingHorizontal: 9, borderRadius: 8, borderWidth: 1.5, borderColor: 'transparent' },
  tileOn: { borderColor: BLUE, backgroundColor: WHITE },
  tileHover: { borderColor: Maple.blueLine },
  dim: { opacity: 0.3 },
  tileHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tileTitle: { flex: 1, fontSize: 13.5, fontWeight: '700' },
  tileLine: { fontSize: 12, color: BODY },
  breakTile: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: Maple.blueSelected },
  breakText: { fontSize: 13, color: BODY },
  side: { width: 300, gap: 16 },
  panel: { gap: 12, padding: 14 },
  panelTabs: { marginHorizontal: -4 },
  unsched: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderColor: LINE },
  square: { width: 34, height: 34, borderRadius: 8 },
  unschedTitle: { fontSize: 14.5, fontWeight: '700', color: NAVY },
  unschedMeta: { fontSize: 12.5, color: BODY },
  empty: { fontSize: 13.5, color: BODY, paddingVertical: 10 },
  conflict: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, backgroundColor: Maple.errorSoft },
  details: { gap: 10, padding: 16 },
  detailsHead: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 4 },
  swatch: { width: 42, height: 42, borderRadius: 8 },
  detailsTitle: { fontSize: 19, fontWeight: '700', color: NAVY },
  kv: { flexDirection: 'row', alignItems: 'center', minHeight: 26 },
  key: { width: 92, fontSize: 13.5, color: BODY },
  valueRow: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { flexShrink: 1, fontSize: 13.5, color: NAVY },
  valueStrong: { fontWeight: '600' },
  detailsBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  legendCard: { flexDirection: 'row', gap: 20, marginTop: 16, padding: 14 },
  legendTitle: { marginBottom: 8, fontSize: 14, fontWeight: '700', color: NAVY },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 11, height: 11, borderRadius: 6 },
  legendText: { fontSize: 12.5, color: BODY },
  roomsBox: { paddingLeft: 20, borderLeftWidth: 1, borderColor: LINE },
  phoneFooter: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: CANVAS },
  phoneSelects: { flexDirection: 'row', gap: 10 },
  dayTabs: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  dayTab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 9 },
  dayTabOn: { backgroundColor: BLUE },
  dayTabDow: { fontSize: 15, fontWeight: '600', color: NAVY },
  dayTabDate: { fontSize: 12, color: BODY },
  dayTabTextOn: { color: WHITE },
  phoneSlot: { flexDirection: 'row', gap: 8 },
  phoneTimeBox: { width: 88, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  phoneTime: { fontSize: 14, color: NAVY },
  phoneLesson: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderLeftWidth: 5 },
  phoneLessonTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  phoneLessonMeta: { marginTop: 2, fontSize: 13.5, color: BODY },
  phoneBreak: { flexDirection: 'row', alignItems: 'center', gap: 30, height: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: Maple.blueSelected },
  phoneBreakText: { fontSize: 15, color: NAVY },
});
