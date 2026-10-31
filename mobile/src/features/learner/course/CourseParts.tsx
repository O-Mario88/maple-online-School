import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { DomainChip } from '@/features/learner/cbc/CbcParts';
import { Bar, panel } from '@/features/learner/dashboard/DashParts';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

export type Course = MockData['learner']['courseOverview'];
type Module = Course['modules'][number];
type Lesson = Course['current']['lessons'][number];

const INK = '#0B1424';
const BODY = '#4A5263';
const BLUE = '#1463F3';
export { panel };

export function Tick({ size = 22 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="check" size={size * 0.62} color="#FFFFFF" />
    </View>
  );
}

/** One module in the map: number, title, progress, offline download and open. */
export function ModuleCard({ m, on, saved, onPress, onSave, phone = false }: { m: Module; on: boolean; saved: boolean; onPress: () => void; onSave: () => void; phone?: boolean }) {
  const done = m.progress >= 1;
  return (
    <View style={[styles.module, phone && styles.moduleP, on && styles.moduleOn]}>
      <Pressable style={styles.mOpen} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`Module ${m.n}: ${m.title}`}>
      <Image source={m.icon} style={phone ? styles.mIconP : styles.mIcon} />
      <View style={styles.flex}>
        <Text style={styles.mNum}>{`Module ${m.n}`}</Text>
        <Text style={[styles.mTitle, m.title.length > 26 && styles.mTitleLong]} numberOfLines={1}>
          {m.title}
        </Text>
        <View style={styles.mBarRow}>
          <View style={styles.flex}>
            <Bar value={m.progress} color={done ? '#14B8A6' : BLUE} track="#E8ECF2" height={5} />
          </View>
          <Text style={styles.mPct}>{`${Math.round(m.progress * 100)}%`}</Text>
        </View>
      </View>
      </Pressable>
      {done ? (
        <Tick size={20} />
      ) : (
        <Pressable style={[styles.dl, saved && styles.dlOn]} onPress={onSave} accessibilityRole="button" accessibilityLabel={saved ? `Module ${m.n} saved for offline` : `Download module ${m.n} for offline`} hitSlop={6}>
          <Icon name={saved ? 'check' : 'download'} size={16} color={saved ? '#FFFFFF' : BLUE} />
        </Pressable>
      )}
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Open module ${m.n}`} hitSlop={6}>
        <Icon name="chevronRight" size={16} color={INK} />
      </Pressable>
    </View>
  );
}

export function LessonRow({ l }: { l: Lesson }) {
  const current = l.status === 'current';
  return (
    <View style={[styles.lesson, current && styles.lessonOn]}>
      <Image source={l.thumb} style={styles.thumb} />
      <View style={styles.flex}>
        <Text style={styles.lTitle}>{l.title}</Text>
        <View style={styles.lMeta}>
          <Icon name={l.kind === 'Practice' ? 'clipboard' : 'play'} size={13} color={BODY} />
          <Text style={styles.lMetaText}>{`${l.kind} • ${l.length}`}</Text>
          <DomainChip domain={l.domain} />
        </View>
      </View>
      {l.status === 'done' ? <Tick size={22} /> : null}
      {current ? (
        <Pressable style={styles.cont} accessibilityRole="button" onPress={() => router.push('/learn/lesson')}>
          <Text style={styles.contText}>Continue</Text>
          <Icon name="arrowRight" size={15} color="#FFFFFF" />
        </Pressable>
      ) : null}
      {l.status === 'todo' ? <View style={styles.todo} /> : null}
    </View>
  );
}

/** A thick ring showing a share (drawn with borders; good to the nearest quarter). */
export function Ring({ value, size = 92 }: { value: number; size?: number }) {
  const q = Math.round(value * 4);
  const c = (i: number) => (i < q ? BLUE : '#E1E9F6');
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 9, borderTopColor: c(0), borderRightColor: c(1), borderBottomColor: c(2), borderLeftColor: c(3), transform: [{ rotate: '45deg' }] }} />
      <Text style={styles.ringText}>{`${Math.round(value * 100)}%`}</Text>
    </View>
  );
}

export function ProgressCard({ c }: { c: Course }) {
  const b = c.progressBreakdown;
  const rows = [
    { dot: '#14B8A6', text: `${b.completed} lessons completed` },
    { dot: BLUE, text: `${b.inProgress} in progress` },
    { dot: '#C9D2E0', text: `${b.notStarted} not started` },
  ];
  return (
    <View style={[styles.side, styles.progress]}>
      <Text style={styles.sideTitle}>Your Progress</Text>
      <View style={styles.progressRow}>
        <Ring value={c.progress} />
        <View style={styles.gap8}>
          {rows.map((r) => (
            <View key={r.text} style={styles.legend}>
              <View style={[styles.legendDot, { backgroundColor: r.dot }]} />
              <Text style={styles.legendText}>{r.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export function SquadCard({ c, joined, onJoin }: { c: Course; joined: boolean; onJoin: () => void }) {
  return (
    <View style={styles.side}>
      <View style={styles.squadHead}>
        <Icon name="people" size={30} color={BLUE} />
        <View style={styles.flex}>
          <Text style={styles.squadTitle}>Cohort Study Squad</Text>
          <Text style={styles.small}>{`${c.squad.learners} learners in this cohort`}</Text>
        </View>
        <Icon name="arrowRight" size={16} color={BLUE} />
      </View>
      <View style={styles.faces}>
        <Image source={c.squad.faces} style={styles.facesImg} contentFit="contain" />
        <Text style={styles.moreFaces}>{`+${c.squad.more}`}</Text>
      </View>
      <Pressable style={styles.join} onPress={onJoin} accessibilityRole="button">
        <Icon name={joined ? 'check' : 'people'} size={16} color={BLUE} />
        <Text style={styles.joinText}>{joined ? 'You’re in the squad' : 'Join Study Squad'}</Text>
      </Pressable>
    </View>
  );
}

export function BadgesCard({ c }: { c: Course }) {
  return (
    <View style={styles.side}>
      <View style={styles.squadHead}>
        <Text style={[styles.sideTitle, styles.flex]}>Module Achievements</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>
      <View style={styles.badges}>
        {c.badges.map((b) => (
          <View key={b.title} style={styles.badge}>
            <Image source={b.icon} style={styles.badgeIcon} contentFit="contain" />
            <Text style={styles.badgeTitle}>{b.title}</Text>
            <Text style={styles.badgeDetail}>{b.detail}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ResourcesCard({ c }: { c: Course }) {
  return (
    <View style={styles.resources}>
      <Text style={styles.sideTitle}>Module Resources</Text>
      <View style={styles.files}>
        {c.resources.map((r) => (
          <Pressable key={r.title} style={styles.file} accessibilityRole="button" accessibilityLabel={`Download ${r.title}`} onPress={() => toast(`${r.title} saved for offline study`)}>
            <View style={styles.fileTop}>
              <Image source={r.icon} style={styles.fileIcon} />
              <View style={styles.flex}>
                <Text style={styles.fileTitle} numberOfLines={1}>
                  {r.title}
                </Text>
                <Text style={styles.fileMeta}>{r.meta}</Text>
              </View>
            </View>
            <View style={styles.fileDl}>
              <Icon name="download" size={14} color={BLUE} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap8: { gap: 10 },
  module: { height: 78, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, ...panel, borderRadius: 10, borderWidth: 1, borderColor: '#EDF0F5' },
  moduleP: { height: 66, paddingHorizontal: 10 },
  moduleOn: { borderWidth: 2, borderColor: '#4C8DF6', backgroundColor: '#F4F8FF' },
  mOpen: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  mIcon: { width: 50, height: 50, borderRadius: 25 },
  mIconP: { width: 42, height: 42, borderRadius: 21 },
  mNum: { fontSize: 11.5, color: INK },
  mTitle: { marginTop: 2, fontSize: 13.5, color: INK },
  mTitleLong: { fontSize: 11.5 },
  mBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  mPct: { width: 32, fontSize: 11, color: INK, textAlign: 'right' },
  dl: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#D5E2F7', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  dlOn: { backgroundColor: BLUE, borderColor: BLUE },
  lesson: { height: 68, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 7, borderRadius: 8, borderWidth: 1, borderColor: '#EDF0F5', backgroundColor: '#FFFFFF' },
  lessonOn: { borderWidth: 2, borderColor: '#4C8DF6', backgroundColor: '#F4F8FF' },
  thumb: { width: 76, height: 54, borderRadius: 4 },
  lTitle: { fontSize: 13.5, fontWeight: '500', color: INK },
  lMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  lMetaText: { fontSize: 12, color: BODY },
  cont: { width: 118, height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 6, backgroundColor: '#0B6BFF' },
  contText: { fontSize: 13.5, fontWeight: '500', color: '#FFFFFF' },
  todo: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E3E8F0', marginRight: 16 },
  ringText: { fontSize: 18, fontWeight: '700', color: INK },
  side: { padding: 16, paddingTop: 18, ...panel, borderRadius: 10 },
  progress: { backgroundColor: '#F2F7FE' },
  sideTitle: { fontSize: 15.5, fontWeight: '700', color: INK },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 22, marginTop: 10 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: INK },
  squadHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  squadTitle: { fontSize: 14, fontWeight: '600', color: INK },
  small: { marginTop: 3, fontSize: 11, color: BODY },
  faces: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 14 },
  facesImg: { width: 196, height: 37 },
  moreFaces: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#EAF1FE', textAlign: 'center', lineHeight: 30, fontSize: 11, color: BLUE, overflow: 'hidden' },
  join: { height: 38, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 7, backgroundColor: '#EAF1FE' },
  joinText: { fontSize: 12.5, fontWeight: '500', color: BLUE },
  seeAll: { fontSize: 11.5, color: BLUE },
  badges: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  badge: { width: 76, alignItems: 'center' },
  badgeIcon: { width: 52, height: 54 },
  badgeTitle: { marginTop: 6, fontSize: 10.5, color: INK, textAlign: 'center' },
  badgeDetail: { marginTop: 3, fontSize: 10.5, color: BODY, textAlign: 'center' },
  resources: { padding: 16, ...panel, borderRadius: 10 },
  files: { flexDirection: 'row', gap: 10, marginTop: 14 },
  file: { flex: 1, height: 78, padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#EDF0F5' },
  fileTop: { flexDirection: 'row', gap: 8 },
  fileIcon: { width: 22, height: 22 },
  fileTitle: { fontSize: 10.5, fontWeight: '500', color: INK },
  fileMeta: { marginTop: 3, fontSize: 9, color: BODY },
  fileDl: { position: 'absolute', right: 10, bottom: 8 },
});
