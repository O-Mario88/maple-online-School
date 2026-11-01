import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { type SideItem, TeacherPhoneTop, TeacherSideNav, TeacherTopBar } from '@/features/teacher/frame/TeacherFrame';
import { BODY, CANVAS, INK, Panel } from '@/features/teacher/frame/TeacherParts';
import { greeting } from '@/lib/home';
import type { TeacherHome } from '@/mock/teacher-home';

import { ActionQueue, FlaggedStudents, NextLiveClass, StatRow, useIntervene, useNextClassCountdown } from './HomeCards';
import { DateControls, QuickActions, TodaySchedule, WeekEarnings, dayLabel } from './HomeMore';

/** The teacher home reference's desktop (top bar to the end of the cards), laid out in its pixels and scaled. */
export const TEACHER_REF_WIDTH = 1180;

const NAV: readonly SideItem[] = [
  { label: 'Home', icon: 'home', go: '/' },
  { label: 'My Classes', icon: 'book', go: '/learn/live' },
  { label: 'Assignments', icon: 'clipboard', go: '/teach/grading' },
  { label: 'Students', icon: 'people', go: '/teach/class-spaces' },
  { label: 'Messages', icon: 'chat', go: '/messages', badge: 3 },
  { label: 'Resources', icon: 'folder', go: '/learn/library' },
  { label: 'Analytics', icon: 'chart', go: 'analytics' },
  { label: 'Earnings', icon: 'wallet', go: '/teach/earnings' },
  { label: 'Schedule', icon: 'calendar', go: '/teach/calendar' },
  { label: 'Help & Support', icon: 'help', go: '/help' },
];

export function TeacherHomeDesk({ h, now }: { h: TeacherHome; now: Date }) {
  const cd = useNextClassCountdown(h.nextClass.startsInMinutes);
  const { sent, intervene } = useIntervene();
  const me = h.me;
  return (
    <View style={styles.canvas}>
      <TeacherTopBar active="Home" me={me} placeholder="Search students, classes, or resources..." />
      <View style={styles.body}>
        <TeacherSideNav items={NAV} active="Home" />
        <View style={styles.main}>
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.title} accessibilityRole="header">{`${greeting(now)}, ${h.firstName}!`}</Text>
              <Text style={styles.subtitle}>Here’s what needs your attention today. You’re making a real difference! ☀️</Text>
            </View>
            <DateControls h={h} />
          </View>
          <StatRow h={h} cd={cd} />
          <View style={styles.row}>
            <Panel style={styles.left}>
              <NextLiveClass h={h} cd={cd} />
            </Panel>
            <Panel style={styles.flex}>
              <ActionQueue h={h} />
            </Panel>
          </View>
          <View style={styles.row}>
            <Panel style={styles.left}>
              <FlaggedStudents h={h} sent={sent} intervene={intervene} />
            </Panel>
            <Panel style={styles.flex}>
              <WeekEarnings h={h} />
            </Panel>
          </View>
          <View style={styles.row}>
            <Panel style={styles.schedule}>
              <TodaySchedule h={h} />
            </Panel>
            <Panel style={styles.flex}>
              <QuickActions h={h} />
            </Panel>
          </View>
        </View>
      </View>
    </View>
  );
}

export function TeacherHomePhone({ h, now }: { h: TeacherHome; now: Date }) {
  const cd = useNextClassCountdown(h.nextClass.startsInMinutes);
  const { sent, intervene } = useIntervene();
  const me = h.me;
  return (
    <View style={styles.phoneRoot}>
      <TeacherPhoneTop me={me} />
      <ScrollView contentContainerStyle={styles.phone}>
        <View>
          <Text style={styles.titleP} accessibilityRole="header">{`${greeting(now)}, ${h.firstName}!`}</Text>
          <View style={styles.dateP}>
            <Text style={styles.dateTextP}>{dayLabel(h.date)}</Text>
            <Icon name="calendar" size={13} color={BODY} />
          </View>
        </View>
        <StatRow h={h} cd={cd} phone />
        <Panel style={styles.cardP}>
          <NextLiveClass h={h} cd={cd} phone />
        </Panel>
        <Panel style={styles.cardP}>
          <ActionQueue h={h} phone />
        </Panel>
        <Panel style={styles.cardP}>
          <FlaggedStudents h={h} sent={sent} intervene={intervene} phone />
        </Panel>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  canvas: { width: TEACHER_REF_WIDTH, padding: 14, gap: 8, backgroundColor: CANVAS },
  body: { flexDirection: 'row', gap: 8 },
  main: { flex: 1, gap: 12, paddingHorizontal: 6, paddingTop: 10, paddingBottom: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, zIndex: 5 },
  title: { fontSize: 31, fontWeight: '800', color: INK, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, color: BODY, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  left: { width: 535 },
  schedule: { width: 600 },
  phoneRoot: { flex: 1, backgroundColor: '#F4F7FB' },
  phone: { gap: 12, padding: 14, paddingBottom: 110 },
  titleP: { fontSize: 20, fontWeight: '800', color: INK },
  dateP: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dateTextP: { fontSize: 12, color: BODY },
  cardP: { padding: 12 },
});
