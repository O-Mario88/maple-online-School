import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { filterTasks, type TaskFilter, taskCounts } from '@/lib/learner-home';
import { addDays, dayParts } from '@/lib/live-hub';

import { CardHead } from './HomeCards';
import { BLUE, BODY, type Home, INK } from './HomeFrame';

const RED = '#E5484D';
const FILTERS: readonly { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'assignment', label: 'Assignments' },
  { key: 'test', label: 'Tests' },
  { key: 'project', label: 'Projects' },
];

/** "Mon, Oct 26, 2026" */
const longDate = (day: string) => {
  const p = dayParts(day);
  return `${p.dow}, ${p.long.split(' ')[2]} ${p.date}, ${day.slice(0, 4)}`;
};

export function Schedule({ h, phone = false, limit }: { h: Home; phone?: boolean; limit?: number }) {
  const [day, setDay] = useState(h.today);
  // On phones the Today list shows sessions only; tasks are in My Tasks.
  const items = (h.schedule[day] ?? []).filter((it) => !(phone && it.task)).slice(0, limit);
  return (
    <View>
      {phone ? (
        <CardHead icon="calendar" color={INK} title={day === h.today ? 'Today' : longDate(day)} link="See All" onLink={() => router.push('/learn/live')} />
      ) : (
        <View style={styles.dateRow}>
          <Text style={styles.date} numberOfLines={1}>
            {longDate(day)}
          </Text>
          <Pressable style={styles.arrow} onPress={() => setDay(addDays(day, -1))} accessibilityRole="button" accessibilityLabel="Previous day">
            <Icon name="chevronLeft" size={13} color={BLUE} />
          </Pressable>
          <Pressable style={styles.today} onPress={() => setDay(h.today)} accessibilityRole="button">
            <Text style={styles.todayText}>Today</Text>
          </Pressable>
          <Pressable style={styles.arrow} onPress={() => setDay(addDays(day, 1))} accessibilityRole="button" accessibilityLabel="Next day">
            <Icon name="chevronRight" size={13} color={BLUE} />
          </Pressable>
        </View>
      )}
      <View style={phone ? styles.itemsP : styles.items}>
        {items.length === 0 ? <Text style={styles.empty}>Nothing scheduled. Enjoy your free time!</Text> : null}
        {items.map((it, i) => (
          <View key={it.time + it.title} style={phone ? styles.itemP : styles.item}>
            <Text style={[styles.time, phone && styles.timeP]}>{phone ? it.time.replace(' ', '\n') : it.time}</Text>
            <View style={styles.rail}>
              {i > 0 ? <View style={[styles.line, styles.lineTop]} /> : null}
              <View style={[styles.dot, { borderColor: `${it.color}55` }]}>
                <View style={[styles.dotIn, { backgroundColor: it.color }]} />
              </View>
              {i < items.length - 1 ? <View style={[styles.line, styles.lineBottom]} /> : null}
            </View>
            <View style={styles.flex}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {phone ? (it.short ?? it.title) : it.title}
              </Text>
              <Text style={[styles.itemSub, it.sub.startsWith('With') && styles.itemSubTutor]}>{it.sub}</Text>
            </View>
            {phone && it.join ? (
              <Pressable style={[styles.joinP, i > 0 && styles.joinLine]} onPress={() => router.push('/learn/live-room')} accessibilityRole="button" accessibilityLabel={`Join ${it.title}`}>
                <Text style={[styles.joinPText, i > 0 && { color: BLUE }]}>Join</Text>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
      {phone ? null : (
        <Pressable style={styles.full} onPress={() => router.push('/learn/live')} accessibilityRole="link">
          <Text style={styles.linkText}>View Full Schedule</Text>
          <Icon name="arrowRight" size={12} color={BLUE} />
        </Pressable>
      )}
    </View>
  );
}

export function MyTasks({ h, phone = false }: { h: Home; phone?: boolean }) {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [done, setDone] = useState<readonly string[]>(h.tasks.filter((t) => t.done).map((t) => t.id));
  const counts = taskCounts(h.tasks);
  const shown = filterTasks(h.tasks, filter).slice(0, phone ? 3 : undefined);
  return (
    <View>
      <CardHead icon="clipboard" color={INK} title={phone ? `My Tasks (${counts.all})` : 'My Tasks'} link={phone ? 'See All' : 'View All'} onLink={() => router.push('/learn/assignments')} />
      {phone ? null : (
        <View style={styles.chips}>
          {FILTERS.map((f) => {
            const on = f.key === filter;
            return (
              <Pressable key={f.key} style={[styles.chip, on && styles.chipOn]} onPress={() => setFilter(f.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[styles.chipText, on && styles.white]}>{f.label}</Text>
                <View style={[styles.count, on && styles.countOn, f.key === 'assignment' && !on && styles.countRed]}>
                  <Text style={[styles.countText, on && { color: BLUE }, f.key === 'assignment' && !on && { color: RED }]}>{counts[f.key]}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
      <View style={phone ? styles.tasksP : styles.tasks}>
        {shown.map((t) => {
          const isDone = done.includes(t.id);
          return (
            <View key={t.id} style={[styles.task, phone && styles.taskP]}>
              <Pressable
                style={[styles.box, isDone && styles.boxOn]}
                onPress={() => setDone((d) => (isDone ? d.filter((x) => x !== t.id) : [...d, t.id]))}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isDone }}
                accessibilityLabel={`Mark ${t.title} as ${isDone ? 'not done' : 'done'}`}
                hitSlop={6}>
                {isDone ? <Icon name="check" size={12} color="#FFFFFF" /> : null}
              </Pressable>
              <Pressable style={styles.taskBody} onPress={() => router.push(t.href)} accessibilityRole="link" accessibilityLabel={`${t.title}, ${t.due}`}>
                <View style={styles.flex}>
                  <Text style={[styles.taskTitle, isDone && styles.taskDone]}>{t.title}</Text>
                  <Text style={[styles.taskDue, t.urgent && styles.urgent]}>{t.due}</Text>
                </View>
                <Icon name="chevronRight" size={14} color={BODY} />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function MyGoals({ h }: { h: Home }) {
  return (
    <View>
      <CardHead icon="flag" color={RED} title="My Goals" link="Edit Goals" onLink={() => router.push('/learn/progress')} />
      <View style={styles.goals}>
        {h.goals.map((g) => (
          <View key={g.title} style={styles.goal} accessible accessibilityLabel={`${g.title}: ${g.label}`}>
            <Image source={g.icon} style={styles.goalIcon} />
            <View style={styles.flex}>
              <Text style={styles.goalTitle}>{g.title}</Text>
              <View style={styles.goalBar}>
                <View style={styles.flex}>
                  <Bar value={g.value} color={BLUE} track="#E1E9F6" height={7} />
                </View>
                <Text style={styles.goalLabel}>{g.label}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function MyRewards({ h }: { h: Home }) {
  const r = h.rewards;
  return (
    <View>
      <CardHead icon="star" color={RED} title="My Rewards" link="View All" onLink={() => router.push('/learn/passport')} />
      <View style={styles.rewardTop}>
        <Image source={r.crown} style={styles.crown} />
        <View style={styles.points}>
          <Text style={styles.pointsNum}>{r.points}</Text>
          <Text style={styles.pointsText}>Total Points</Text>
        </View>
        <Image source={r.levelBadge} style={styles.levelBadge} />
        <View style={styles.flex}>
          <Text style={styles.levelTitle}>{`Level ${h.hero.level}`}</Text>
          <Text style={styles.pointsText}>{`Next: ${h.hero.xpNext} XP`}</Text>
          <View style={styles.levelBar}>
            <Bar value={h.hero.xp / h.hero.xpNext} color={BLUE} track="#E1E9F6" height={6} />
          </View>
        </View>
      </View>
      <View style={styles.badges}>
        {r.badges.map((b) => (
          <View key={b.title} style={styles.badge}>
            <Image source={b.icon} style={styles.badgeIcon} />
            <Text style={styles.badgeText}>{b.title}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  white: { color: '#FFFFFF' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  date: { flex: 1, fontSize: 13, fontWeight: '700', color: INK },
  arrow: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 4, borderWidth: 1, borderColor: '#D5E0F2' },
  today: { height: 22, justifyContent: 'center', paddingHorizontal: 8, borderRadius: 4, borderWidth: 1, borderColor: '#D5E0F2' },
  todayText: { fontSize: 11.5, fontWeight: '500', color: BLUE },
  items: { marginTop: 14 },
  itemsP: { marginTop: 10 },
  empty: { paddingVertical: 20, fontSize: 12, color: BODY, textAlign: 'center' },
  item: { height: 41, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  itemP: { height: 50, flexDirection: 'row', alignItems: 'center', gap: 8 },
  time: { width: 52, marginTop: 1, fontSize: 10.5, color: BODY },
  timeP: { width: 32, fontSize: 10, lineHeight: 13 },
  rail: { width: 14, alignSelf: 'stretch', alignItems: 'center' },
  line: { position: 'absolute', width: 1, backgroundColor: '#E1E7F0' },
  lineTop: { top: 0, height: 4 },
  lineBottom: { top: 16, bottom: 0 },
  dot: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center', marginTop: 3, borderRadius: 6, borderWidth: 2.5 },
  dotIn: { width: 6, height: 6, borderRadius: 3 },
  itemTitle: { fontSize: 11.5, fontWeight: '600', color: INK },
  itemSub: { marginTop: 2, fontSize: 11, color: BODY },
  itemSubTutor: { color: '#7C3AED' },
  joinP: { height: 30, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 5, backgroundColor: '#0B6BFF' },
  joinLine: { borderWidth: 1, borderColor: '#BBD0F4', backgroundColor: '#FFFFFF' },
  joinPText: { fontSize: 11.5, fontWeight: '500', color: '#FFFFFF' },
  full: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  linkText: { fontSize: 11.5, color: BLUE },
  chips: { flexDirection: 'row', gap: 3, marginTop: 12 },
  chip: { height: 24, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E1E7F0' },
  chipOn: { borderColor: BLUE, backgroundColor: BLUE },
  chipText: { fontSize: 10, color: INK },
  count: { minWidth: 15, height: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#EEF1F6' },
  countOn: { backgroundColor: '#FFFFFF' },
  countRed: { backgroundColor: '#FDE2E2' },
  countText: { fontSize: 9.5, fontWeight: '600', color: INK },
  tasks: { marginTop: 14 },
  tasksP: { marginTop: 8 },
  task: { height: 43, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: '#F0F3F7' },
  taskP: { height: 39 },
  box: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 3, borderWidth: 1.5, borderColor: '#9AA4B5' },
  boxOn: { borderColor: '#22A35A', backgroundColor: '#22A35A' },
  taskBody: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  taskTitle: { fontSize: 12, color: INK },
  taskDone: { color: BODY },
  taskDue: { marginTop: 2, fontSize: 11, color: BODY },
  urgent: { color: RED },
  goals: { gap: 13, marginTop: 14 },
  goal: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalIcon: { width: 32, height: 32 },
  goalTitle: { fontSize: 10.5, color: INK },
  goalBar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  goalLabel: { width: 30, fontSize: 11, fontWeight: '600', color: INK, textAlign: 'right' },
  rewardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  crown: { width: 38, height: 42 },
  points: { width: 82 },
  pointsNum: { fontSize: 18, fontWeight: '700', color: INK },
  pointsText: { fontSize: 10, color: BODY },
  levelBadge: { width: 34, height: 24 },
  levelTitle: { fontSize: 12, fontWeight: '700', color: INK },
  levelBar: { marginTop: 5 },
  badges: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  badge: { alignItems: 'center', gap: 4 },
  badgeIcon: { width: 44, height: 42 },
  badgeText: { fontSize: 10, color: INK },
});
