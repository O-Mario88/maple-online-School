import { type ComponentRef, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { BLUE, BODY, INK, IconTile, LINE, MUTED, PanelHead, Pill } from '@/features/teacher/frame/TeacherParts';
import { useTeacherGo } from '@/features/teacher/frame/TeacherFrame';
import { compactAmount, scaleBars } from '@/lib/teacher-home';
import type { TeacherHome } from '@/mock/teacher-home';

import { ugx } from './HomeCards';

const BAR_MAX = 62;
const DAY = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Mon, 26 Oct 2026", as the reference prints dates. */
export function dayLabel(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** The date stepper and the term-week picker beside the greeting. */
export function DateControls({ h }: { h: TeacherHome }) {
  const [date, setDate] = useState(h.date);
  const [week, setWeek] = useState(h.week);
  const [open, setOpen] = useState(false);
  const step = (days: number) => setDate((d) => new Date(d.getTime() + days * DAY));
  const pick = (w: number) => {
    setWeek(w);
    setOpen(false);
  };
  return (
    <View style={styles.controls}>
      <View style={styles.datePill}>
        <Icon name="calendar" size={16} color={INK} />
        <Text style={styles.dateText}>{dayLabel(date)}</Text>
        <Pressable onPress={() => step(-1)} accessibilityRole="button" accessibilityLabel="Previous day" hitSlop={8}>
          <Icon name="chevronLeft" size={16} color={INK} />
        </Pressable>
        <Pressable onPress={() => step(1)} accessibilityRole="button" accessibilityLabel="Next day" hitSlop={8}>
          <Icon name="chevronRight" size={16} color={INK} />
        </Pressable>
      </View>
      <View>
        <Pressable style={styles.weekBtn} onPress={() => setOpen((o) => !o)} accessibilityRole="button" accessibilityLabel={`Week ${week}. Change week`} accessibilityState={{ expanded: open }}>
          <Text style={styles.weekText}>{`Week ${week}`}</Text>
          <Icon name="chevronDown" size={15} color={BLUE} />
        </Pressable>
        {open ? (
          <View style={styles.weekMenu}>
            <ScrollView style={styles.weekScroll}>
              {Array.from({ length: h.weeks }, (_, i) => i + 1).map((w) => (
                <Pressable key={w} style={[styles.weekRow, w === week && styles.weekRowOn]} onPress={() => pick(w)} accessibilityRole="menuitem" accessibilityState={{ selected: w === week }}>
                  <Text style={[styles.weekRowText, w === week && styles.weekRowTextOn]}>{`Week ${w}`}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/** This week's earnings: total, a bar per day (tap one to read it), and month and all-time totals. */
export function WeekEarnings({ h }: { h: TeacherHome }) {
  const go = useTeacherGo();
  const e = h.earnings;
  const shares = scaleBars(e.days.map((d) => d.amount));
  const best = e.days.reduce((a, b) => (b.amount > a.amount ? b : a)).day;
  const [picked, setPicked] = useState(best);
  return (
    <View>
      <PanelHead title="This Week’s Earnings" link="View Earnings" onLink={() => go('/teach/earnings')} />
      <View style={styles.totalRow}>
        <Text style={styles.total}>{ugx(e.week)}</Text>
        <Pill label={`↑ ${e.change}% from last week`} tone="green" />
      </View>
      <View style={styles.chart} accessibilityRole="summary" accessibilityLabel="Earnings for each day this week">
        {e.days.map((d, i) => {
          const on = d.day === picked;
          return (
            <Pressable key={d.day} style={styles.barCol} onPress={() => setPicked(d.day)} accessibilityRole="button" accessibilityLabel={`${d.day}: ${ugx(d.amount)}`} accessibilityState={{ selected: on }}>
              <Text style={[styles.barValue, on && styles.barValueOn]}>{compactAmount(d.amount)}</Text>
              <View style={[styles.bar, { height: Math.max(2, shares[i] * BAR_MAX) }, on ? styles.barOn : null, d.amount === 0 && styles.barEmpty]} />
              <Text style={styles.barDay}>{d.day}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.totals}>
        <Pressable style={styles.totalBox} onPress={() => go('/teach/earnings')} accessibilityRole="button" accessibilityLabel={`${ugx(e.month)} this month`}>
          <IconTile icon="calendar" color="#7C4DDB" size={36} soft />
          <View>
            <Text style={styles.boxValue}>{ugx(e.month)}</Text>
            <Text style={styles.boxLabel}>This Month</Text>
          </View>
        </Pressable>
        <Pressable style={styles.totalBox} onPress={() => go('/teach/earnings')} accessibilityRole="button" accessibilityLabel={`${ugx(e.allTime)} all-time earnings`}>
          <IconTile icon="wallet" color="#1F9D55" size={36} soft />
          <View>
            <Text style={styles.boxValue}>{ugx(e.allTime)}</Text>
            <Text style={styles.boxLabel}>All Time Earnings</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

/** Today's classes and sessions as a row of cards; the arrow scrolls to the rest. */
export function TodaySchedule({ h }: { h: TeacherHome }) {
  const go = useTeacherGo();
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  return (
    <View>
      <PanelHead title="Today’s Schedule" link="View Full Schedule" onLink={() => go('/teach/calendar')} />
      <View style={styles.slotsWrap}>
        <ScrollView ref={scroller} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slots}>
          {h.schedule.map((s) => (
            <Pressable key={s.time} style={[styles.slot, s.now && styles.slotNow]} onPress={() => go(s.go)} accessibilityRole="button" accessibilityLabel={`${s.time}, ${s.title}, ${s.live ?? s.kind}`}>
              {s.now ? (
                <View style={styles.nowTag}>
                  <Text style={styles.nowText}>Now</Text>
                </View>
              ) : null}
              <View style={styles.slotTop}>
                <IconTile icon={s.icon} color={s.color} size={26} soft />
                <View style={styles.flex}>
                  <Text style={styles.slotTime} numberOfLines={1}>
                    {s.time}
                  </Text>
                  <Text style={styles.slotTitle} numberOfLines={2}>
                    {s.title}
                  </Text>
                </View>
              </View>
              {s.live ? <Pill label={s.live} tone="blue" icon="live" style={styles.slotPill} /> : <Text style={styles.slotKind}>{s.kind}</Text>}
            </Pressable>
          ))}
        </ScrollView>
        <Pressable style={styles.slotArrow} onPress={() => scroller.current?.scrollToEnd({ animated: true })} accessibilityRole="button" accessibilityLabel="Show later sessions">
          <Icon name="chevronRight" size={16} color={BLUE} />
        </Pressable>
      </View>
    </View>
  );
}

export function QuickActions({ h }: { h: TeacherHome }) {
  const go = useTeacherGo();
  return (
    <View>
      <PanelHead title="Quick Actions" />
      <View style={styles.quick}>
        {h.quick.map((q) => (
          <Pressable key={q.label} style={styles.quickItem} onPress={() => go(q.go)} accessibilityRole="button" accessibilityLabel={q.label.replace('\n', ' ')}>
            <IconTile icon={q.icon} color={q.color} size={46} soft />
            <Text style={styles.quickText}>{q.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 5 },
  datePill: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE },
  dateText: { fontSize: 14, color: INK, marginRight: 4 },
  weekBtn: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 16, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE },
  weekText: { fontSize: 14, fontWeight: '600', color: BLUE },
  weekMenu: { position: 'absolute', top: 48, right: 0, width: 130, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE, shadowColor: '#0B1424', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  weekScroll: { maxHeight: 240 },
  weekRow: { paddingHorizontal: 14, paddingVertical: 8 },
  weekRowOn: { backgroundColor: '#EEF4FF' },
  weekRowText: { fontSize: 13, color: INK },
  weekRowTextOn: { color: BLUE, fontWeight: '600' },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8 },
  total: { fontSize: 25, fontWeight: '800', color: INK },
  chart: { height: 112, flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginTop: 10, paddingTop: 6, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: '#EEF2F8' },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4, paddingBottom: 6 },
  barValue: { fontSize: 11, color: BODY },
  barValueOn: { color: INK, fontWeight: '700' },
  bar: { width: '86%', borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: '#B9D2FB' },
  barOn: { backgroundColor: BLUE },
  barEmpty: { backgroundColor: '#E3EAF5' },
  barDay: { fontSize: 11.5, color: BODY },
  totals: { flexDirection: 'row', gap: 10, marginTop: 10 },
  totalBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  boxValue: { fontSize: 14.5, fontWeight: '800', color: INK },
  boxLabel: { fontSize: 11.5, color: MUTED, marginTop: 2 },
  slotsWrap: { marginTop: 12 },
  slots: { gap: 10, paddingRight: 30 },
  slot: { width: 143, height: 86, justifyContent: 'space-between', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  slotNow: { borderColor: BLUE, borderWidth: 1.5, backgroundColor: '#F4F8FF' },
  nowTag: { position: 'absolute', top: -1, left: -1, paddingHorizontal: 8, paddingVertical: 2, borderTopLeftRadius: 10, borderBottomRightRadius: 8, backgroundColor: BLUE },
  nowText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  slotTop: { flexDirection: 'row', gap: 6, marginTop: 6 },
  slotTime: { fontSize: 8.5, color: MUTED },
  slotTitle: { fontSize: 10, fontWeight: '600', color: INK, marginTop: 2 },
  slotKind: { fontSize: 11, color: MUTED, textAlign: 'center' },
  slotPill: { alignSelf: 'center' },
  slotArrow: { position: 'absolute', right: -4, top: 28, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: LINE },
  quick: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  quickItem: { alignItems: 'center', gap: 8, minWidth: 70 },
  quickText: { fontSize: 12, color: INK, textAlign: 'center', lineHeight: 16 },
});
