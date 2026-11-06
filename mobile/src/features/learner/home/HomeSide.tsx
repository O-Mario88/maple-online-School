import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { toast } from '@/lib/toast';
import { openMenuPage } from '@/lib/menu-nav';

import { CardHead } from './HomeCards';
import { BLUE, BODY, type Home, INK } from './HomeFrame';
import { Maple } from '@/constants/maple';

const GREEN = Maple.successText;

/** Top-right "This Week 20 – 26 Oct 2026" card with `<` `>` week switcher. */
export function ThisWeekCard({ h }: { h: Home }) {
  const [offset, setOffset] = useState(0);
  const label =
    offset === 0
      ? h.weekRange
      : offset < 0
        ? '13 – 19 Oct 2026'
        : '27 Oct – 2 Nov 2026';
  return (
    <View style={styles.weekCard}>
      <View style={styles.weekIconBox}>
        <Icon name="calendar" size={16} color={BLUE} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.weekTitle}>This Week</Text>
        <Text style={styles.weekSub}>{label}</Text>
      </View>
      <View style={styles.weekArrows}>
        <Pressable
          style={styles.arrowBtn}
          onPress={() => setOffset((o) => Math.max(-1, o - 1))}
          accessibilityRole="button"
          accessibilityLabel="Previous week">
          <Icon name="chevronLeft" size={12} color={INK} />
        </Pressable>
        <Pressable
          style={styles.arrowBtn}
          onPress={() => setOffset((o) => Math.min(1, o + 1))}
          accessibilityRole="button"
          accessibilityLabel="Next week">
          <Icon name="chevronRight" size={12} color={INK} />
        </Pressable>
      </View>
    </View>
  );
}

/** Interactive "My To-Do This Week (5)" checklist card. */
export function MyTodoWeekCard({ h }: { h: Home }) {
  const [doneIds, setDoneIds] = useState<readonly string[]>(
    h.todoWeek.filter((t) => t.done).map((t) => t.id),
  );
  const toggle = (id: string) =>
    setDoneIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <View>
      <Text style={styles.todoHeading}>{`My To-Do This Week (${h.todoWeek.length})`}</Text>
      <View style={styles.todoList}>
        {h.todoWeek.map((t) => {
          const isDone = doneIds.includes(t.id);
          return (
            <Pressable
              key={t.id}
              style={styles.todoRow}
              onPress={() => toggle(t.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isDone }}
              accessibilityLabel={t.text}>
              <View style={[styles.checkbox, isDone && styles.checkboxOn]}>
                {isDone ? <Icon name="check" size={11} color={Maple.surface} /> : null}
              </View>
              <Text style={[styles.todoText, isDone && styles.todoTextDone]} numberOfLines={2}>
                {t.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** "Continue Reading" card (`Our Environment • Social Studies • 68%`). */
export function ContinueReadingCard({ h }: { h: Home }) {
  const b = h.continueReadingBook;
  return (
    <View>
      <CardHead title="Continue Reading" link="View All" onLink={() => router.push('/learn/library')} />
      <Pressable
        style={styles.bookRow}
        onPress={() => openMenuPage(b.href)}
        accessibilityRole="link"
        accessibilityLabel={`${b.title}, ${b.subject}, ${b.percentLabel}`}>
        <Image source={b.thumb} style={styles.bookThumb} contentFit="cover" />
        <View style={styles.flex}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {b.title}
          </Text>
          <Text style={styles.bookSub}>{b.subject}</Text>
          <View style={styles.bookBarRow}>
            <View style={styles.flex}>
              <Bar value={b.progress} color={BLUE} track={Maple.border} height={6} />
            </View>
            <Text style={styles.bookPct}>{b.percentLabel}</Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

/** "Completed Reading" card (`The Boy Who Harnessed the Wind • Life Skills ✓`). */
export function CompletedReadingCard({ h }: { h: Home }) {
  const b = h.completedReadingBook;
  return (
    <View>
      <CardHead title="Completed Reading" link="View All" onLink={() => router.push('/learn/library')} />
      <Pressable
        style={styles.bookRow}
        onPress={() => openMenuPage(b.href)}
        accessibilityRole="link"
        accessibilityLabel={`${b.title}, ${b.subject}, Completed`}>
        <Image source={b.thumb} style={styles.bookThumb} contentFit="cover" />
        <View style={styles.flex}>
          <Text style={styles.bookTitle} numberOfLines={2}>
            {b.title}
          </Text>
          <Text style={styles.bookSub}>{b.subject}</Text>
        </View>
        <View style={styles.completedCheck}>
          <Icon name="check" size={11} color={Maple.surface} />
        </View>
      </Pressable>
    </View>
  );
}

/** "Learning Tips" card at bottom right. */
export function LearningTipsCard({ h }: { h: Home }) {
  return (
    <View>
      <View style={styles.tipsHead}>
        <View style={styles.bulbCircle}>
          <Icon name="sparkle" size={13} color={Maple.warning} />
        </View>
        <Text style={styles.tipsTitle}>Learning Tips</Text>
      </View>
      <View style={styles.tipsList}>
        {h.learningTips.map((tip) => (
          <View key={tip} style={styles.tipRow}>
            <View style={styles.tipCheck}>
              <Icon name="check" size={9} color={Maple.surface} />
            </View>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
      <Pressable
        style={styles.tipsFooter}
        onPress={() => toast('More study habits and revision guides unlocked in your Library.')}
        accessibilityRole="button"
        accessibilityLabel="View More Tips">
        <Text style={styles.linkText}>View More Tips</Text>
        <Icon name="arrowRight" size={12} color={BLUE} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  weekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  weekIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Maple.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: INK,
  },
  weekSub: {
    marginTop: 1,
    fontSize: 10.5,
    color: BODY,
  },
  weekArrows: {
    flexDirection: 'row',
    gap: 5,
  },
  arrowBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Maple.border,
    backgroundColor: Maple.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todoHeading: {
    fontSize: 13.5,
    fontWeight: '800',
    color: INK,
  },
  todoList: {
    marginTop: 10,
    gap: 9,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Maple.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  todoText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 14,
    color: INK,
  },
  todoTextDone: {
    fontWeight: '600',
    color: INK,
  },
  bookRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bookThumb: {
    width: 54,
    height: 62,
    borderRadius: 7,
  },
  bookTitle: {
    fontSize: 11.5,
    lineHeight: 14.5,
    fontWeight: '800',
    color: INK,
  },
  bookSub: {
    marginTop: 2,
    fontSize: 10,
    color: BODY,
  },
  bookBarRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookPct: {
    fontSize: 10.5,
    fontWeight: '800',
    color: INK,
  },
  completedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  bulbCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Maple.warningSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: INK,
  },
  tipsList: {
    marginTop: 10,
    gap: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipCheck: {
    width: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: Maple.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    fontSize: 10.5,
    color: INK,
  },
  tipsFooter: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Maple.blueSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  linkText: {
    fontSize: 11,
    fontWeight: '700',
    color: BLUE,
  },
});
