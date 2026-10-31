import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { MockData } from '@/mock';

import { Brand, CARD_SHADOW } from '../palette';

type Templates = MockData['publicPages']['schoolsPage']['templates'];

/** One-click curriculum template preview: pick a board and level, see a sample scheme of work. */
export function CurriculumPreview({ templates, wide }: { templates: Templates; wide: boolean }) {
  const [board, setBoard] = useState(templates.boards[0]);
  const levels = templates.levels[board] ?? [];
  const [level, setLevel] = useState(levels[0] ?? '');
  const [downloaded, setDownloaded] = useState(false);
  const sample = templates.samples[board];

  const pickBoard = (b: string) => {
    setBoard(b);
    setLevel(templates.levels[b]?.[0] ?? '');
    setDownloaded(false);
  };

  return (
    <View style={styles.card}>
      <View style={[styles.head, wide && styles.headWide]}>
        <View style={styles.flexShrink}>
          <Text style={styles.title} accessibilityRole="header">
            Curriculum Template Preview
          </Text>
          <Text style={styles.sub}>Get a glimpse of our ready-to-use schemes of work, lesson plans and assessments.</Text>
        </View>
        <View style={styles.boards} accessibilityRole="tablist">
          {templates.boards.map((b) => {
            const on = b === board;
            return (
              <Pressable key={b} style={[styles.board, on && styles.boardOn]} onPress={() => pickBoard(b)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[styles.boardText, on && styles.boardTextOn]}>{b}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={[styles.body, wide && styles.bodyWide]}>
        <View style={[styles.levels, wide && styles.levelsWide]}>
          {levels.map((l) => {
            const on = l === level;
            return (
              <Pressable key={l} style={[styles.level, on && styles.levelOn]} onPress={() => setLevel(l)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Icon name="book" size={15} color={on ? Brand.blue : Brand.body} />
                <Text style={[styles.levelText, on && styles.levelTextOn]}>{l}</Text>
              </Pressable>
            );
          })}
        </View>
        {sample ? (
          <View style={[styles.sample, wide && styles.flex]}>
            <View style={[styles.sampleHead, wide && styles.headWide]}>
              <View style={styles.flexShrink}>
                <Text style={styles.strong}>{sample.title}</Text>
                <Text style={styles.muted}>{`${sample.term} · ${level}`}</Text>
              </View>
              <View style={styles.actions}>
                <Pressable style={styles.outline} onPress={() => router.push('/sign-up')} accessibilityRole="button">
                  <Text style={styles.outlineText}>View Full Template</Text>
                </Pressable>
                <Pressable style={styles.fill} onPress={() => setDownloaded(true)} accessibilityRole="button">
                  <Text style={styles.fillText}>{downloaded ? 'Sample ready ✓' : 'Download Sample'}</Text>
                </Pressable>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.table}>
                <View style={[styles.row, styles.headRow]}>
                  <Text style={[styles.cell, styles.week, styles.th]}>Week</Text>
                  <Text style={[styles.cell, styles.topic, styles.th]}>Topic</Text>
                  <Text style={[styles.cell, styles.obj, styles.th]}>Learning Objectives</Text>
                  <Text style={[styles.cell, styles.res, styles.th]}>Resources</Text>
                </View>
                {sample.rows.map((r) => (
                  <View key={r.week} style={styles.row}>
                    <Text style={[styles.cell, styles.week]}>{String(r.week)}</Text>
                    <Text style={[styles.cell, styles.topic]}>{r.topic}</Text>
                    <Text style={[styles.cell, styles.obj]}>{r.objectives}</Text>
                    <Text style={[styles.cell, styles.res, styles.resText]}>{r.resources}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  card: { gap: 16, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  head: { gap: 12 },
  headWide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  sub: { fontSize: 13, color: Brand.body, marginTop: 2 },
  boards: { flexDirection: 'row', padding: 4, borderRadius: 10, backgroundColor: Brand.canvas, alignSelf: 'flex-start' },
  board: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  boardOn: { backgroundColor: Brand.surface, borderBottomWidth: 2, borderBottomColor: Brand.blue },
  boardText: { fontSize: 13, color: Brand.body },
  boardTextOn: { color: Brand.blue, fontWeight: '700' },
  body: { gap: 14 },
  bodyWide: { flexDirection: 'row', alignItems: 'flex-start' },
  levels: { gap: 4, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: Brand.line },
  levelsWide: { width: 170 },
  level: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 8 },
  levelOn: { backgroundColor: Brand.blueSoft },
  levelText: { flexShrink: 1, fontSize: 12, color: Brand.body },
  levelTextOn: { color: Brand.blue, fontWeight: '700' },
  sample: { gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: Brand.line },
  sampleHead: { gap: 10 },
  strong: { fontSize: 14, fontWeight: '800', color: Brand.ink },
  muted: { fontSize: 12, color: Brand.muted },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  outline: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, borderWidth: 1, borderColor: Brand.blue },
  outlineText: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  fill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 8, backgroundColor: Brand.blue },
  fillText: { fontSize: 13, fontWeight: '700', color: Brand.surface },
  table: { borderRadius: 8, borderWidth: 1, borderColor: Brand.line, overflow: 'hidden', minWidth: 620 },
  row: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Brand.line },
  headRow: { backgroundColor: Brand.canvas, borderTopWidth: 0 },
  cell: { paddingHorizontal: 12, paddingVertical: 10, fontSize: 12, color: Brand.ink },
  th: { fontWeight: '700' },
  week: { width: 60 },
  topic: { width: 150 },
  obj: { width: 230 },
  res: { flex: 1, minWidth: 180 },
  resText: { color: Brand.blue },
});
