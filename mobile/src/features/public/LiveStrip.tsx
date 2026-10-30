import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { MockData } from '@/mock';

import { Brand } from './palette';

type LiveClass = MockData['publicPages']['landing']['liveClasses'][number];

const THUMB_TINTS = ['#1E3A8A', '#334155', '#0E7490', '#7C2D12', '#1F2937'] as const;

function ClassCard({ c, index }: { c: LiveClass; index: number }) {
  const live = c.status === 'live';
  return (
    <Pressable style={styles.card} accessibilityRole="button" accessibilityLabel={`${c.subject} with ${c.teacher}, ${live ? 'live now' : `starts in ${c.startsIn}`}`} onPress={() => router.push('/sign-up')}>
      <View style={[styles.thumb, { backgroundColor: THUMB_TINTS[index % THUMB_TINTS.length] }]}>
        <Icon name={c.icon} size={28} color={Brand.surface} />
      </View>
      <View style={styles.info}>
        <View style={styles.titleRow}>
          {live ? (
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>● LIVE</Text>
            </View>
          ) : (
            <View style={styles.soonBadge}>
              <Text style={styles.soonText}>{`Starts in ${c.startsIn}`}</Text>
            </View>
          )}
        </View>
        <Text style={styles.subject} numberOfLines={1}>
          {c.subject}
        </Text>
        <Text style={styles.meta}>{`${c.board} · ${c.level}`}</Text>
        <View style={styles.footer}>
          <Text style={styles.teacher} numberOfLines={1}>
            {c.teacher}
          </Text>
          <View style={styles.count}>
            <Icon name="people" size={13} color={Brand.muted} />
            <Text style={styles.meta}>{String(c.learners)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

/** "Live classes happening now": a scrolling row of open and upcoming classes. */
export function LiveStrip({ classes }: { classes: readonly LiveClass[] }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.headLeft}>
          <View style={styles.headIcon}>
            <Icon name="live" size={18} color={Brand.live} />
          </View>
          <View>
            <Text style={styles.title} accessibilityRole="header">
              Live Classes Happening Now
            </Text>
            <Text style={styles.meta}>Join a live class or explore upcoming lessons</Text>
          </View>
        </View>
        <Pressable accessibilityRole="link" style={styles.viewAll}>
          <Text style={styles.viewAllText}>View all live classes</Text>
          <Icon name="arrowRight" size={16} color={Brand.blue} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {classes.map((c, i) => (
          <ClassCard key={c.id} c={c} index={i} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 20, padding: 20, gap: 16, borderRadius: 20, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  head: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: Brand.liveSoft, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700', color: Brand.ink },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  row: { gap: 12 },
  card: { width: 278, flexDirection: 'row', gap: 12, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: Brand.line, backgroundColor: Brand.surface },
  thumb: { width: 74, height: 74, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row' },
  liveBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, backgroundColor: Brand.live },
  liveText: { fontSize: 10, fontWeight: '700', color: Brand.surface },
  soonBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, backgroundColor: Brand.blue },
  soonText: { fontSize: 10, fontWeight: '700', color: Brand.surface },
  subject: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  meta: { fontSize: 12, color: Brand.muted },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginTop: 4 },
  teacher: { flex: 1, fontSize: 12, color: Brand.body },
  count: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
