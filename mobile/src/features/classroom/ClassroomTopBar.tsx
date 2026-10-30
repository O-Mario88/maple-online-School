import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import { clockOf } from '@/lib/classroom';

const TICK_MS = 1000;

interface Props {
  title: string;
  board: string;
  students: number;
  teacher: string;
  startSeconds: number;
  lengthSeconds: number;
  wide: boolean;
}

/** Lesson title, LIVE badge, running clock, class facts and the Layout, Settings and Leave buttons. */
export function ClassroomTopBar({ title, board, students, teacher, startSeconds, lengthSeconds, wide }: Props) {
  const [elapsed, setElapsed] = useState(startSeconds);
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => Math.min(e + 1, lengthSeconds)), TICK_MS);
    return () => clearInterval(id);
  }, [lengthSeconds]);

  return (
    <View style={[styles.bar, !wide && styles.barNarrow]}>
      {wide ? (
        <View style={styles.brand}>
          <Text style={styles.leaf}>🍁</Text>
          <View>
            <Text style={styles.name}>Maple</Text>
            <Text style={styles.tag}>Global Online School</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.live}>● LIVE</Text>
          <Text style={styles.clock} accessibilityLabel={`${clockOf(elapsed)} of ${clockOf(lengthSeconds)} so far`}>{`◷ ${clockOf(elapsed)} / ${clockOf(lengthSeconds)}`}</Text>
        </View>
        <View style={styles.chips}>
          <Text style={styles.chip}>{board}</Text>
          <Text style={styles.chip}>{`👥 ${students} students`}</Text>
          {wide ? <Text style={styles.chip}>{teacher}</Text> : null}
        </View>
      </View>
      <View style={styles.actions}>
        {wide ? (
          <>
            <Pressable style={styles.ghost} accessibilityRole="button">
              <Icon name="grid" size={16} color={Brand.ink} />
              <Text style={styles.ghostText}>Layout</Text>
            </Pressable>
            <Pressable style={styles.ghost} accessibilityRole="button">
              <Icon name="settings" size={16} color={Brand.ink} />
              <Text style={styles.ghostText}>Settings</Text>
            </Pressable>
          </>
        ) : null}
        <Pressable style={styles.leave} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityRole="button" accessibilityLabel="Leave class">
          <Icon name="logout" size={16} color={Brand.surface} />
          <Text style={styles.leaveText}>{wide ? 'Leave Class' : 'Leave'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Brand.surface, borderBottomWidth: 1, borderBottomColor: Brand.line },
  barNarrow: { gap: 10, paddingHorizontal: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 150 },
  leaf: { fontSize: 30 },
  name: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  tag: { fontSize: 10, color: Brand.body, marginTop: -2 },
  info: { flex: 1, gap: 6, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  title: { fontSize: 17, fontWeight: '800', color: Brand.ink, flexShrink: 1 },
  live: { fontSize: 11, fontWeight: '800', color: Brand.surface, backgroundColor: Brand.live, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  clock: { fontSize: 13, color: Brand.body, fontVariant: ['tabular-nums'] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { fontSize: 12, color: Brand.ink, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, backgroundColor: Brand.canvas, overflow: 'hidden' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ghost: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  ghostText: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  leave: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 16, borderRadius: 8, backgroundColor: Brand.live },
  leaveText: { fontSize: 13, fontWeight: '700', color: Brand.surface },
});
