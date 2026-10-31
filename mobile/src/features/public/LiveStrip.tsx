import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ComponentRef, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';

import type { LiveClass } from './home/types';
import { Brand, CARD_SHADOW } from './palette';

const CARD_WIDTH = 270;
const CARD_GAP = 14;

function ClassCard({ c }: { c: LiveClass }) {
  const live = c.status === 'live';
  return (
    <Pressable
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${c.subject} with ${c.teacher}, ${live ? 'live now' : `starts in ${c.startsIn}`}`}
      onPress={() => router.push('/sign-up')}>
      <Image source={c.photo} style={styles.thumb} contentFit="cover" accessibilityLabel={`${c.teacher} teaching`} />
      <View style={styles.info}>
        <View style={[styles.titleRow, !live && styles.titleRowSoon]}>
          {live ? (
            <View style={styles.liveBadge}>
              <Text style={styles.liveText}>◆ LIVE</Text>
            </View>
          ) : (
            <View style={styles.soonBadge}>
              <Text style={styles.soonText}>{`Starts in ${c.startsIn}`}</Text>
            </View>
          )}
          <Text style={styles.subject} numberOfLines={1}>
            {c.subject}
          </Text>
        </View>
        <Text style={styles.meta}>{`${c.board} · ${c.level}`}</Text>
        <View style={styles.footer}>
          <Image source={c.face} style={styles.face} />
          <Text style={styles.teacher} numberOfLines={1}>
            {c.teacher}
          </Text>
          <Icon name="people" size={13} color={Brand.body} />
          <Text style={styles.count}>{String(c.learners)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

/** "Live Classes Happening Now": a scrolling row of open and upcoming classes. */
const openLive = () => router.push({ pathname: '/explore', params: { kind: 'live' } });

export function LiveStrip({ classes, phone = false }: { classes: readonly LiveClass[]; phone?: boolean }) {
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  return (
    <View style={[styles.wrap, phone && styles.wrapPhone]}>
      <View style={[styles.head, phone && styles.headPhone]}>
        <View style={styles.headLeft}>
          <View style={styles.headIcon}>
            <Icon name="live" size={15} color={Brand.surface} />
          </View>
          <View>
            <Text style={styles.title} accessibilityRole="header">
              Live Classes Happening Now
            </Text>
            <Text style={styles.subtitle}>Join a live class or explore upcoming lessons</Text>
          </View>
        </View>
        {phone ? null : (
          <Pressable accessibilityRole="link" style={styles.viewAll} onPress={openLive}>
            <Text style={styles.viewAllText}>View all live classes</Text>
            <Icon name="arrowRight" size={14} color={Brand.blue} />
          </Pressable>
        )}
      </View>
      <ScrollView ref={scroller} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, phone && styles.rowPhone]} style={phone && styles.rowScrollPhone}>
        {classes.map((c) => (
          <ClassCard key={c.id} c={c} />
        ))}
      </ScrollView>
      {phone ? (
        <Pressable accessibilityRole="link" style={styles.viewAllPhone} onPress={openLive}>
          <Text style={styles.viewAllText}>View all live classes</Text>
          <Icon name="arrowRight" size={14} color={Brand.blue} />
        </Pressable>
      ) : (
        <Pressable
          style={styles.next}
          accessibilityRole="button"
          accessibilityLabel="More live classes"
          onPress={() => scroller.current?.scrollToEnd({ animated: true })}>
          <Icon name="chevronRight" size={16} color={Brand.ink} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginHorizontal: 50, marginRight: 40, height: 156, paddingTop: 20, paddingHorizontal: 20, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  wrapPhone: { marginHorizontal: 10, marginRight: 10, height: undefined, paddingHorizontal: 0, paddingBottom: 16 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 2 },
  headPhone: { paddingHorizontal: 14 },
  headLeft: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingLeft: 0 },
  headIcon: { width: 24, height: 24, borderRadius: 7, backgroundColor: '#F2614B', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14.5, fontWeight: '700', color: Brand.ink },
  subtitle: { fontSize: 9.5, color: Brand.body },
  viewAll: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  viewAllPhone: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, paddingHorizontal: 14 },
  viewAllText: { fontSize: 12, fontWeight: '500', color: Brand.blue },
  row: { gap: CARD_GAP, paddingTop: 16, paddingBottom: 12 },
  rowPhone: { paddingHorizontal: 14 },
  rowScrollPhone: { marginTop: 2 },
  card: { width: CARD_WIDTH, height: 87, flexDirection: 'row', gap: 12, padding: 8, borderRadius: 8, backgroundColor: Brand.surface, ...CARD_SHADOW },
  thumb: { width: 73, height: 71, borderRadius: 6 },
  info: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titleRowSoon: { flexDirection: 'column', alignItems: 'flex-start', gap: 2 },
  liveBadge: { paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 3, backgroundColor: Brand.live },
  liveText: { fontSize: 9, fontWeight: '700', color: Brand.surface },
  soonBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, backgroundColor: Brand.blue },
  soonText: { fontSize: 9, fontWeight: '600', color: Brand.surface },
  subject: { flexShrink: 1, fontSize: 12, fontWeight: '700', color: Brand.ink },
  meta: { fontSize: 11, color: Brand.body },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  face: { width: 20, height: 20, borderRadius: 10 },
  teacher: { flex: 1, fontSize: 11, color: Brand.body },
  count: { fontSize: 11, color: Brand.body },
  next: { position: 'absolute', right: -16, top: 86, width: 30, height: 30, borderRadius: 15, backgroundColor: Brand.surface, alignItems: 'center', justifyContent: 'center', ...CARD_SHADOW },
});
