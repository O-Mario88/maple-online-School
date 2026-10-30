import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';
import type { MockData } from '@/mock';
import type { OutlineItemKind } from '@/mock/public';

import { Brand } from '../palette';

type Course = MockData['publicPages']['coursePage'];

const KIND_ICON: Readonly<Record<OutlineItemKind, IconName>> = { video: 'play', notes: 'book', quiz: 'check', live: 'live' };

/** The course outline in three levels: module, then lesson, then each video, note, quiz or live class. */
export function CourseOutline({ course }: { course: Course }) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const allOpen = open.size === course.outline.length;
  const toggle = (i: number) =>
    setOpen((o) => {
      const next = new Set(o);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  const t = course.totals;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          Course curriculum
        </Text>
        <Text style={styles.muted}>{`${t.modules} modules · ${t.lessons} lessons · ${t.hours} hours`}</Text>
        <Pressable accessibilityRole="button" onPress={() => setOpen(allOpen ? new Set() : new Set(course.outline.map((_, i) => i)))}>
          <Text style={styles.link}>{allOpen ? 'Collapse all' : 'Expand all'}</Text>
        </Pressable>
      </View>
      {course.outline.map((m, i) => {
        const isOpen = open.has(i);
        return (
          <View key={m.title} style={styles.module}>
            <Pressable style={styles.moduleHead} onPress={() => toggle(i)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }}>
              <View style={styles.num}>
                <Text style={styles.numText}>{String(i + 1)}</Text>
              </View>
              <View style={styles.moduleText}>
                <Text style={styles.moduleTitle}>{`Module ${i + 1}: ${m.title}`}</Text>
                <Text style={styles.muted}>{`${m.lessonCount} lessons · ${m.hours} hours`}</Text>
              </View>
              <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} size={18} color={Brand.body} />
            </Pressable>
            {isOpen
              ? m.lessons.map((l) => (
                  <View key={l.title} style={styles.lesson}>
                    <Text style={styles.lessonTitle}>{l.title}</Text>
                    {l.items.map((it) => (
                      <View key={it.title} style={styles.item}>
                        <Icon name={KIND_ICON[it.kind]} size={14} color={Brand.blue} />
                        <Text style={styles.itemText}>{it.title}</Text>
                        <Text style={styles.muted}>{`${it.mins} min`}</Text>
                      </View>
                    ))}
                  </View>
                ))
              : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 10, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '700', color: Brand.ink },
  muted: { fontSize: 12, color: Brand.muted },
  link: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  module: { borderRadius: 12, borderWidth: 1, borderColor: Brand.line, overflow: 'hidden' },
  moduleHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  num: { width: 34, height: 34, borderRadius: 17, backgroundColor: Brand.blueSoft, alignItems: 'center', justifyContent: 'center' },
  numText: { fontSize: 15, fontWeight: '700', color: Brand.blue },
  moduleText: { flex: 1 },
  moduleTitle: { fontSize: 14, fontWeight: '600', color: Brand.ink },
  lesson: { gap: 6, paddingHorizontal: 16, paddingVertical: 10, marginLeft: 46, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Brand.line },
  lessonTitle: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  item: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemText: { flex: 1, fontSize: 13, color: Brand.body },
});
