import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import type { MockData } from '@/mock';

export type Dash = MockData['learner']['dashboard'];

const INK = '#0B1424';
const BODY = '#4A5263';
/** The soft white card the dashboard reference uses everywhere. */
export const panel = { borderRadius: 14, backgroundColor: '#FFFFFF', shadowColor: '#0F2350', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 4 } } as const;

export function Bar({ value, color = '#22C55E', track = 'rgba(255,255,255,0.35)', height = 6 }: { value: number; color?: string; track?: string; height?: number }) {
  return (
    <View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(value * 100)}%`, height, borderRadius: height / 2, backgroundColor: color }} />
    </View>
  );
}

export function SectionHead({ title, link, count, small = false }: { title: string; link: string; count?: number; small?: boolean }) {
  return (
    <View style={styles.head}>
      <Text style={[styles.headTitle, small && styles.headTitleS]}>{title}</Text>
      {count ? (
        <View style={styles.count}>
          <Text style={styles.countText}>{String(count)}</Text>
        </View>
      ) : null}
      <View style={styles.flex} />
      <Pressable style={[styles.link, small && styles.linkS]} accessibilityRole="link">
        <Text style={styles.linkText}>{link}</Text>
        <Icon name="arrowRight" size={12} color={Brand.blue} />
      </Pressable>
    </View>
  );
}

/** "Continue Lesson": the blue card with the course, progress and Resume. */
export function ResumeCard({ d, phone = false }: { d: Dash; phone?: boolean }) {
  const r = d.resume;
  return (
    <View style={[styles.resume, phone && styles.resumeP]}>
      <Text style={styles.resumeTag}>Continue Lesson</Text>
      <Text style={[styles.resumeTitle, phone && styles.resumeTitleP]}>{r.title}</Text>
      <Text style={styles.resumeMeta}>{r.meta}</Text>
      <View style={styles.resumeBarRow}>
        <View style={styles.flex}>
          <Bar value={r.progress} color="#2DD4BF" />
        </View>
        <Text style={styles.resumePct}>{`${Math.round(r.progress * 100)}% complete`}</Text>
      </View>
      <Pressable style={[styles.resumeBtn, phone && styles.resumeBtnP]} onPress={() => router.push(`/learn/course?id=${r.course}`)} accessibilityRole="button">
        <Text style={styles.resumeBtnText}>Resume Lesson</Text>
        <Icon name="arrowRight" size={16} color={INK} />
      </Pressable>
    </View>
  );
}

export function AssignmentRow({ a, phone = false }: { a: Dash['urgent'][number]; phone?: boolean }) {
  return (
    <View style={[styles.assign, phone && styles.assignP]}>
      <Image source={a.icon} style={styles.icon34} />
      <View style={styles.flex}>
        <Text style={styles.rowTitle}>{a.title}</Text>
        <Text style={styles.rowSub}>{a.due}</Text>
      </View>
      <Pressable style={[styles.action, a.primary ? styles.actionOn : styles.actionOff]} accessibilityRole="button">
        <Text style={[styles.actionText, a.primary ? styles.actionTextOn : styles.actionTextOff]}>{a.action}</Text>
      </Pressable>
    </View>
  );
}

/** The upcoming live class: teacher, time and Join. */
export function LiveRow({ d, phone = false }: { d: Dash; phone?: boolean }) {
  const l = d.live;
  return (
    <View style={styles.liveRow}>
      <Image source={l.photo} style={phone ? styles.liveFaceP : styles.liveFace} />
      <View style={styles.flex}>
        <Text style={[styles.liveSubject, phone && styles.liveSubjectP]}>{l.subject}</Text>
        <Text style={styles.rowSub}>{phone ? l.phoneWhen : l.when}</Text>
        <View style={styles.liveTeacher}>
          <Icon name="person" size={13} color={BODY} />
          <Text style={styles.rowSub}>{l.teacher}</Text>
        </View>
      </View>
      {phone ? (
        <Pressable style={styles.joinP} onPress={() => router.push(`/classroom/${l.slug}`)} accessibilityRole="button">
          <Icon name="video" size={16} color="#FFFFFF" />
          <Text style={styles.joinText}>Join</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function LiveBadge({ text }: { text: string }) {
  return (
    <View style={styles.liveBadge}>
      <Text style={styles.liveBadgeText}>{`▸ ${text}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headTitle: { fontSize: 19, fontWeight: '700', color: INK, letterSpacing: -0.3 },
  headTitleS: { fontSize: 16 },
  count: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#E5484D', alignItems: 'center', justifyContent: 'center' },
  countText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: '#EEF4FF' },
  linkS: { backgroundColor: 'transparent', paddingHorizontal: 0 },
  linkText: { fontSize: 11.5, color: Brand.blue },
  resume: { padding: 20, paddingTop: 18, borderRadius: 14, backgroundColor: '#1D5BEA' },
  resumeP: { padding: 16 },
  resumeTag: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.18)', fontSize: 12.5, color: '#FFFFFF' },
  resumeTitle: { marginTop: 8, fontSize: 19, fontWeight: '700', color: '#FFFFFF' },
  resumeTitleP: { fontSize: 17 },
  resumeMeta: { marginTop: 6, fontSize: 13.5, color: '#E1EAFE' },
  resumeBarRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  resumePct: { fontSize: 12.5, color: '#FFFFFF' },
  resumeBtn: { alignSelf: 'flex-start', width: 286, height: 40, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 7, backgroundColor: '#FFFFFF' },
  resumeBtnP: { alignSelf: 'stretch', width: undefined, height: 36 },
  resumeBtnText: { fontSize: 14.5, fontWeight: '500', color: INK },
  assign: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  assignP: { paddingVertical: 6 },
  icon34: { width: 34, height: 34, borderRadius: 8 },
  rowTitle: { fontSize: 13, fontWeight: '600', color: INK },
  rowSub: { marginTop: 2, fontSize: 11.5, color: BODY },
  action: { minWidth: 66, height: 34, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 6 },
  actionOn: { backgroundColor: '#0B6BFF' },
  actionOff: { backgroundColor: '#EAF2FE' },
  actionText: { fontSize: 13.5, fontWeight: '500' },
  actionTextOn: { color: '#FFFFFF' },
  actionTextOff: { color: Brand.blue },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  liveFace: { width: 64, height: 64, borderRadius: 32 },
  liveFaceP: { width: 46, height: 46, borderRadius: 23 },
  liveSubject: { fontSize: 15, fontWeight: '700', color: INK },
  liveSubjectP: { fontSize: 13.5 },
  liveTeacher: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  joinP: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, borderRadius: 7, backgroundColor: '#0B6BFF' },
  joinText: { fontSize: 13.5, fontWeight: '500', color: '#FFFFFF' },
  liveBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, backgroundColor: '#E5484D' },
  liveBadgeText: { fontSize: 10.5, fontWeight: '700', color: '#FFFFFF' },
});
