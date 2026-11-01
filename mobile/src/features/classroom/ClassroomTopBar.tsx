import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { type ClassLayout, LayoutSheet, SettingsSheet } from '@/features/classroom/ClassSheets';
import { Brand } from '@/features/public/palette';
import { clockOf } from '@/lib/classroom';

const LEAF = require('@/assets/images/maple-leaf.png') as number;
const TICK_MS = 1000;

interface Props {
  title: string;
  board: string;
  students: number;
  teacher: string;
  teacherPhoto?: number;
  startSeconds: number;
  lengthSeconds: number;
  wide: boolean;
  layout: ClassLayout;
  onLayout: (l: ClassLayout) => void;
}

/** On the web, full screen is the browser's; in the app it is the board-focus layout. */
function toggleFullScreen(layout: ClassLayout, onLayout: (l: ClassLayout) => void) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else document.documentElement.requestFullscreen().catch(() => onLayout('focus'));
    return;
  }
  onLayout(layout === 'focus' ? 'full' : 'focus');
}

/** Lesson title, LIVE badge, running clock, class facts and the Layout, Settings and Leave buttons. */
export function ClassroomTopBar({ title, board, students, teacher, teacherPhoto, startSeconds, lengthSeconds, wide, layout, onLayout }: Props) {
  const [elapsed, setElapsed] = useState(startSeconds);
  const [sheet, setSheet] = useState<'layout' | 'settings' | null>(null);
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => Math.min(e + 1, lengthSeconds)), TICK_MS);
    return () => clearInterval(id);
  }, [lengthSeconds]);

  return (
    <View style={[styles.bar, !wide && styles.barNarrow]}>
      <LayoutSheet visible={sheet === 'layout'} layout={layout} onPick={onLayout} onClose={() => setSheet(null)} />
      <SettingsSheet visible={sheet === 'settings'} onClose={() => setSheet(null)} />
      {wide ? (
        <Pressable style={styles.brand} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
          <Image source={LEAF} style={styles.leafImg} contentFit="contain" />
          <View>
            <Text style={styles.name}>Maple</Text>
            <Text style={styles.tag}>Global Online School</Text>
          </View>
        </Pressable>
      ) : null}
      <View style={styles.info}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
            {title}
          </Text>
          <View style={styles.liveBadge}>
            <Icon name="live" size={12} color={Brand.surface} />
            <Text style={styles.live}>LIVE</Text>
          </View>
          <View style={styles.clockPill}>
            <Icon name="clock" size={13} color={Brand.body} />
            <Text style={styles.clock} accessibilityLabel={`${clockOf(elapsed)} of ${clockOf(lengthSeconds)} so far`}>{`${clockOf(elapsed)} / ${clockOf(lengthSeconds)}`}</Text>
          </View>
        </View>
        <View style={styles.chips}>
          <View style={styles.chipBox}>
            <Icon name="school" size={13} color={Brand.body} />
            <Text style={styles.chip}>{board}</Text>
          </View>
          <View style={styles.chipBox}>
            <Icon name="people" size={13} color={Brand.body} />
            <Text style={styles.chip}>{`${students} students`}</Text>
          </View>
          {wide ? (
            <View style={styles.chipBox}>
              {teacherPhoto ? <Image source={teacherPhoto} style={styles.teacherFace} /> : null}
              <Text style={[styles.chip, styles.chipBold]}>{teacher}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View style={styles.actions}>
        {wide ? (
          <>
            <Pressable style={styles.ghost} onPress={() => setSheet('layout')} accessibilityRole="button">
              <Icon name="grid" size={16} color={Brand.ink} />
              <Text style={styles.ghostText}>Layout</Text>
            </Pressable>
            <Pressable style={styles.ghost} onPress={() => setSheet('settings')} accessibilityRole="button">
              <Icon name="settings" size={16} color={Brand.ink} />
              <Text style={styles.ghostText}>Settings</Text>
            </Pressable>
          </>
        ) : null}
        <Pressable style={styles.leave} onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} accessibilityRole="button" accessibilityLabel="Leave class">
          <Icon name="logout" size={16} color={Brand.surface} />
          <Text style={styles.leaveText}>{wide ? 'Leave Class' : 'Leave'}</Text>
        </Pressable>
        {wide ? (
          <Pressable style={styles.square} onPress={() => toggleFullScreen(layout, onLayout)} accessibilityRole="button" accessibilityLabel="Full screen">
            <Icon name="expand" size={16} color={Brand.ink} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Brand.surface, borderBottomWidth: 1, borderBottomColor: Brand.line },
  barNarrow: { gap: 10, paddingHorizontal: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8, width: 155 },
  leafImg: { width: 34, height: 36 },
  name: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  tag: { fontSize: 10, fontWeight: '600', color: Brand.ink, marginTop: -2 },
  info: { flex: 1, gap: 6, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  title: { fontSize: 17, fontWeight: '800', color: Brand.ink, flexShrink: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Brand.live, paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 5 },
  live: { fontSize: 11, fontWeight: '800', color: Brand.surface },
  clockPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 2.5, borderRadius: 6, backgroundColor: Brand.canvas },
  clock: { fontSize: 12.5, color: Brand.body, fontVariant: ['tabular-nums'] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipBox: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6, backgroundColor: Brand.canvas },
  chip: { fontSize: 12, color: Brand.ink },
  chipBold: { fontWeight: '600' },
  teacherFace: { width: 18, height: 18, borderRadius: 9 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ghost: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  ghostText: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  square: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  leave: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 16, borderRadius: 8, backgroundColor: Brand.live },
  leaveText: { fontSize: 13, fontWeight: '700', color: Brand.surface },
});
