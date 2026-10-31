import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { clock12, type DayDot, dayParts, monthTitle, monthWeeks, weekOf } from '@/lib/live-hub';
import type { IconName } from '@/lib/icons';

import { type Hub, type HubState, type Session, TABS } from './useLiveHub';

export const INK = '#0B1424';
export const BODY = '#4A5263';
export const BLUE = '#1463F3';
export const GREEN = '#22A35A';
export const RED = '#E5484D';
export const ORANGE = '#F28C28';
const DOT: Record<DayDot, string> = { missed: ORANGE, school: BLUE, bootcamp: GREEN, none: '#D5DBE5' };
const LINE: Record<Session['icon'], string> = { math: BLUE, english: GREEN, science: BLUE, qa: ORANGE, ict: '#7C3AED', paper: ORANGE };

export function LiveBadge({ text = 'LIVE NOW' }: { text?: string }) {
  return (
    <View style={styles.live}>
      <Icon name="live" size={9} color="#FFFFFF" />
      <Text style={styles.liveText}>{text}</Text>
    </View>
  );
}

/** "Today, Wed 21 Oct" for today, the day's name otherwise; recordings get their own heading. */
export function dayTitle(hub: Hub, s: HubState, phone = false): string {
  if (s.tab === 'recordings') return 'Recordings this week';
  const today = s.day === hub.now.day;
  if (phone) return today ? 'Today’s Schedule' : `${dayParts(s.day).long} Schedule`;
  return today ? `Today, ${dayParts(s.day).long}` : dayParts(s.day).long;
}

function Btn({ label, icon, kind, onPress, phone }: { label: string; icon?: IconName; kind: 'fill' | 'outline' | 'soft' | 'done'; onPress?: () => void; phone: boolean }) {
  const color = kind === 'fill' ? '#FFFFFF' : kind === 'done' ? GREEN : BLUE;
  return (
    <Pressable style={[styles.btn, phone && styles.btnP, styles[kind]]} onPress={onPress} disabled={!onPress} accessibilityRole="button" accessibilityState={{ disabled: !onPress }}>
      {icon && (!phone || kind === 'fill') ? <Icon name={icon} size={phone ? 14 : 16} color={color} /> : null}
      <Text style={[styles.btnText, phone && styles.btnTextP, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** The session's button: join while live, "Upcoming" inside two hours, a reminder toggle later on, the recording once over. */
export function SessionButton({ x, s, phone = false }: { x: Session; s: HubState; phone?: boolean }) {
  const a = s.action(x);
  if (a === 'join') return <Btn label={phone ? 'Join' : 'Join Class'} icon="video" kind="fill" phone={phone} onPress={() => router.push('/learn/live-room')} />;
  if (a === 'soon') return <Btn label="Upcoming" kind="soft" phone={phone} />;
  if (a === 'ended') return x.recording ? <Btn label={phone ? 'Recording' : 'Watch Recording'} icon="playFill" kind="outline" phone={phone} onPress={() => router.push('/learn/lesson')} /> : <Btn label="Ended" kind="soft" phone={phone} />;
  const on = s.reminded(x.id);
  return <Btn label={on ? 'Reminder Set' : 'Remind Me'} icon={on ? 'check' : 'bell'} kind={on ? 'done' : 'outline'} phone={phone} onPress={() => s.toggleReminder(x.id)} />;
}

export function ScheduleRow({ hub, x, s, phone = false, showDay = false }: { hub: Hub; x: Session; s: HubState; phone?: boolean; showDay?: boolean }) {
  const live = s.action(x) === 'join';
  const missed = x.attended === false;
  return (
    <View style={[styles.row, phone && styles.rowP]}>
      {phone ? null : <View style={[styles.dot, { backgroundColor: LINE[x.icon] }]} />}
      <View style={phone ? styles.timeP : styles.time}>
        {showDay ? <Text style={styles.timeEnd}>{dayParts(x.day).long}</Text> : null}
        <Text style={[styles.timeStart, phone && styles.timeStartP]}>{phone ? clock12(x.start).replace(' ', '\n') : clock12(x.start)}</Text>
        {phone ? null : <Text style={styles.timeEnd}>{`– ${clock12(x.end)}`}</Text>}
      </View>
      <Image source={hub.icons[x.icon]} style={phone ? styles.iconP : styles.icon} />
      <View style={styles.flex}>
        {live ? <LiveBadge /> : null}
        <Text style={[styles.title, phone && styles.titleP]} numberOfLines={1}>
          {phone ? x.short : x.title}
        </Text>
        <Text style={[styles.sub, phone && styles.subP]} numberOfLines={1}>
          {phone ? x.teacher : `${x.teacher} • ${missed ? 'Missed • Recording available' : x.context}`}
        </Text>
      </View>
      <SessionButton x={x} s={s} phone={phone} />
    </View>
  );
}

/** The seven days of the chosen week, each with its dot. */
export function DayStrip({ s, phone = false }: { s: HubState; phone?: boolean }) {
  return (
    <View style={styles.days}>
      {weekOf(s.day).map((d) => {
        const on = d === s.day;
        const p = dayParts(d);
        return (
          <Pressable key={d} style={styles.dayCol} onPress={() => s.setDay(d)} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={p.long}>
            <View style={[styles.dayBox, phone && styles.dayBoxP, on && styles.dayOn]}>
              <Text style={[styles.dow, phone && styles.dowP, on && styles.white]}>{p.dow}</Text>
              <Text style={[styles.date, phone && styles.dateP, on && styles.white]}>{p.date}</Text>
            </View>
            <View style={[styles.dayDot, { backgroundColor: DOT[s.dot(d)] }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

export function MonthGrid({ s }: { s: HubState }) {
  return (
    <View style={styles.month}>
      <View style={styles.monthRow}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <Text key={d} style={styles.monthHead}>
            {d}
          </Text>
        ))}
      </View>
      {monthWeeks(s.day).map((w) => (
        <View key={w.find(Boolean)} style={styles.monthRow}>
          {w.map((d, i) =>
            d ? (
              <Pressable key={d} style={[styles.monthCell, d === s.day && styles.dayOn]} onPress={() => s.setDay(d)} accessibilityRole="button" accessibilityLabel={dayParts(d).long}>
                <Text style={[styles.monthDate, d === s.day && styles.white]}>{dayParts(d).date}</Text>
                {s.dot(d) === 'none' ? null : <View style={[styles.monthDot, { backgroundColor: DOT[s.dot(d)] }]} />}
              </Pressable>
            ) : (
              <View key={`blank-${i}`} style={styles.monthCell} />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

export function CalendarHeader({ s }: { s: HubState }) {
  const [filter, setFilter] = useState(false);
  return (
    <View style={styles.calHead}>
      <Text style={styles.cardTitle}>Class Calendar</Text>
      <Pressable style={styles.today} onPress={s.today} accessibilityRole="button">
        <Text style={styles.todayText}>Today</Text>
      </Pressable>
      <Pressable style={styles.arrow} onPress={() => s.shift(-1)} accessibilityRole="button" accessibilityLabel={`Previous ${s.view}`}>
        <Icon name="chevronLeft" size={14} color={INK} />
      </Pressable>
      <Pressable style={styles.arrow} onPress={() => s.shift(1)} accessibilityRole="button" accessibilityLabel={`Next ${s.view}`}>
        <Icon name="chevronRight" size={14} color={INK} />
      </Pressable>
      <Text style={styles.monthTitle}>{monthTitle(s.day)}</Text>
      <View style={styles.flex} />
      <View style={styles.seg} accessibilityRole="tablist">
        {(['week', 'month'] as const).map((v) => (
          <Pressable key={v} style={[styles.segItem, s.view === v && styles.segOn]} onPress={() => s.setView(v)} accessibilityRole="tab" accessibilityState={{ selected: s.view === v }}>
            <Text style={[styles.segText, s.view === v && styles.white]}>{v === 'week' ? 'Week' : 'Month'}</Text>
          </Pressable>
        ))}
      </View>
      <View>
        <Pressable style={styles.filter} onPress={() => setFilter((f) => !f)} accessibilityRole="button" accessibilityState={{ expanded: filter }}>
          <Text style={styles.segText}>Filter</Text>
          <Icon name="chevronDown" size={12} color={INK} />
        </Pressable>
        {filter ? (
          <View style={styles.menu}>
            {TABS.slice(0, 4).map((t) => (
              <Pressable
                key={t.key}
                style={styles.menuItem}
                onPress={() => {
                  s.setTab(t.key);
                  setFilter(false);
                }}
                accessibilityRole="menuitem">
                <Text style={[styles.menuText, s.tab === t.key && styles.menuOn]}>{t.key === 'all' ? 'Everything' : t.label}</Text>
                {s.tab === t.key ? <Icon name="check" size={13} color={BLUE} /> : null}
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: INK },
  live: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 3, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, backgroundColor: RED },
  liveText: { fontSize: 8.5, fontWeight: '700', color: '#FFFFFF' },
  btn: { width: 125, height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 5 },
  btnP: { width: 76, height: 32, gap: 5 },
  fill: { backgroundColor: '#0B6BFF' },
  outline: { borderWidth: 1, borderColor: '#BBD0F4', backgroundColor: '#FFFFFF' },
  soft: { backgroundColor: '#E6EEFB' },
  done: { borderWidth: 1, borderColor: '#B9E3C8', backgroundColor: '#F0FAF3' },
  btnText: { fontSize: 13, fontWeight: '500' },
  btnTextP: { fontSize: 11.5 },
  row: { height: 60, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowP: { height: 58, gap: 10 },
  dot: { width: 7, height: 7, marginLeft: 0, borderRadius: 4 },
  time: { width: 72 },
  timeP: { width: 34 },
  timeStart: { fontSize: 13, color: INK },
  timeStartP: { fontSize: 11.5, lineHeight: 15 },
  timeEnd: { marginTop: 2, fontSize: 12, color: BODY },
  icon: { width: 46, height: 46 },
  iconP: { width: 38, height: 38 },
  title: { fontSize: 14.5, fontWeight: '600', color: INK },
  titleP: { fontSize: 12, fontWeight: '600' },
  sub: { marginTop: 3, fontSize: 13, color: BODY },
  subP: { fontSize: 11 },
  days: { flexDirection: 'row' },
  dayCol: { flex: 1, alignItems: 'center' },
  dayBox: { width: 75, height: 50, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 6 },
  dayBoxP: { width: 34, height: 44 },
  dayOn: { backgroundColor: '#0B6BFF' },
  dow: { fontSize: 12.5, color: BODY },
  dowP: { fontSize: 10.5 },
  date: { fontSize: 15, fontWeight: '600', color: INK },
  dateP: { fontSize: 13.5 },
  dayDot: { width: 7, height: 7, marginTop: 8, borderRadius: 4 },
  month: { gap: 4 },
  monthRow: { flexDirection: 'row', gap: 4 },
  monthHead: { flex: 1, textAlign: 'center', fontSize: 11.5, color: BODY },
  monthCell: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  monthDate: { fontSize: 13, color: INK },
  monthDot: { width: 5, height: 5, marginTop: 3, borderRadius: 3 },
  calHead: { height: 26, flexDirection: 'row', alignItems: 'center', gap: 7, zIndex: 2 },
  today: { height: 26, paddingHorizontal: 10, justifyContent: 'center', marginLeft: 13, borderRadius: 5, borderWidth: 1, borderColor: '#E1E7F0' },
  todayText: { fontSize: 12.5, color: INK },
  arrow: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1, borderColor: '#E1E7F0' },
  monthTitle: { marginLeft: 4, fontSize: 15, color: INK },
  seg: { flexDirection: 'row', borderRadius: 5, borderWidth: 1, borderColor: '#E1E7F0', overflow: 'hidden' },
  segItem: { width: 55, height: 26, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: '#0B6BFF' },
  segText: { fontSize: 12.5, color: INK },
  filter: { height: 26, flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 3, paddingHorizontal: 10, borderRadius: 5, borderWidth: 1, borderColor: '#E1E7F0' },
  menu: { position: 'absolute', top: 30, right: 0, width: 160, paddingVertical: 4, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E7F0', shadowColor: INK, shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
  menuItem: { height: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  menuText: { fontSize: 12.5, color: INK },
  menuOn: { color: BLUE, fontWeight: '600' },
});
