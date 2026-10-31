import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';

import { AssignmentRow, Bar, type Dash, LiveBadge, LiveRow, panel, ResumeCard, SectionHead } from './DashParts';

/** The dashboard reference's page width (x 18–1176 at 1536 wide); this layout uses its pixels (render inside RefScale). */
export const DASH_REF_WIDTH = 1158;
const INK = '#0B1424';
const BODY = '#4A5263';

function Hero({ d }: { d: Dash }) {
  return (
    <View style={styles.hero}>
      <Image source={d.hero} style={styles.heroPhoto} contentFit="cover" accessibilityLabel="A smiling learner at his laptop" />
      <Text style={styles.hello}>{`Good morning, ${d.name}! 👋`}</Text>
      <Text style={styles.next} accessibilityRole="header">
        Your Next 20 Minutes
      </Text>
      <Text style={styles.nextSub}>Let’s keep the momentum going. You’re doing great!</Text>
      <View style={styles.resumeAt}>
        <ResumeCard d={d} />
      </View>
    </View>
  );
}

function Stats({ d }: { d: Dash }) {
  return (
    <View style={styles.stats}>
      {d.stats.map((s) => (
        <View key={s.label} style={styles.stat}>
          <View style={styles.statLeft}>
            <Image source={s.icon} style={styles.statIcon} />
            <View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </View>
          <View style={styles.statRight}>
            <Text style={styles.statNote}>{s.note}</Text>
            <Text style={styles.statSub}>{s.sub}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function Subjects({ d }: { d: Dash }) {
  return (
    <View style={styles.subjects}>
      {d.subjects.map((s) => (
        <Pressable key={s.name} style={styles.subject} accessibilityRole="link" accessibilityLabel={s.name}>
          <Image source={s.icon} style={styles.subjectIcon} />
          <View>
            <Text style={styles.subjectName}>{s.name}</Text>
            <Text style={styles.subjectDetail}>{s.detail}</Text>
          </View>
        </Pressable>
      ))}
      <View style={styles.flex} />
      <Pressable style={styles.more} accessibilityRole="button" accessibilityLabel="More subjects">
        <Icon name="chevronRight" size={18} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function Plan({ d }: { d: Dash }) {
  return (
    <View style={[styles.card, styles.planCard]}>
      <SectionHead title="Today’s Plan" link="See All" />
      <View style={styles.plan}>
        <View style={styles.planLine} />
        {d.plan.map((p) => (
          <View key={p.at} style={styles.planRow}>
            <View style={styles.dot} />
            <Text style={styles.planAt}>{p.at}</Text>
            <Image source={p.icon} style={styles.planIcon} />
            <View style={styles.flex}>
              <Text style={styles.planTitle}>{p.title}</Text>
              <Text style={styles.planDetail}>{p.detail}</Text>
            </View>
            <Text style={[styles.tag, p.live && styles.tagLive]}>{p.tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Live({ d }: { d: Dash }) {
  return (
    <View style={[styles.card, styles.liveCard]}>
      <SectionHead title="Upcoming Live Class" link="View Schedule" />
      <View style={styles.liveBox}>
        <Image source={d.live.art} style={styles.laptop} contentFit="contain" />
        <LiveBadge text="LIVE SOON" />
        <View style={styles.liveInfo}>
          <LiveRow d={d} />
        </View>
        <View style={styles.liveFoot}>
          <Pressable style={styles.join} onPress={() => router.push(`/classroom/${d.live.slug}`)} accessibilityRole="button">
            <Icon name="video" size={18} color="#FFFFFF" />
            <Text style={styles.joinText}>Join Class</Text>
          </Pressable>
          <View style={styles.set}>
            <Icon name="plus" size={18} color={Brand.blue} />
            <View>
              <Text style={styles.setTitle}>You’re all set!</Text>
              <Text style={styles.setSub}>Join 5 minutes early.</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

function Continue({ d }: { d: Dash }) {
  return (
    <View style={[styles.card, styles.contCard]}>
      <SectionHead title="Continue Learning" link="See All" />
      <View style={styles.thumbs}>
        {d.continue.map((c) => (
          <View key={c.title} style={styles.thumb}>
            <Image source={c.photo} style={styles.thumbPhoto} contentFit="cover" />
            <Text style={styles.thumbTitle} numberOfLines={1}>
              {c.title}
            </Text>
            <Text style={styles.thumbMeta}>{c.meta}</Text>
            <View style={styles.thumbBar}>
              <View style={styles.flex}>
                <Bar value={c.progress} color={c.color} track="#E7EBF2" height={4} />
              </View>
              <Text style={styles.thumbPct}>{`${Math.round(c.progress * 100)}%`}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function Urgent({ d }: { d: Dash }) {
  return (
    <View style={[styles.card, styles.urgentCard]}>
      <SectionHead title="Urgent Assignments" link="See All" count={d.urgent.length} small />
      <View style={styles.gap4}>
        {d.urgent.map((a) => (
          <AssignmentRow key={a.title} a={a} />
        ))}
      </View>
    </View>
  );
}

function Activity({ d }: { d: Dash }) {
  return (
    <View style={[styles.card, styles.activityCard]}>
      <SectionHead title="Recent Activity" link="See All" small />
      <View style={styles.activity}>
        {d.activity.map((a) => (
          <View key={a.title} style={styles.activityRow}>
            <Image source={a.icon} style={styles.activityIcon} />
            <View style={styles.flex}>
              <Text style={styles.activityTitle}>{a.title}</Text>
              <Text style={styles.activityAt}>{a.at}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** The learner home on desktop, positioned in the reference's pixels. */
export function DashDesk({ d }: { d: Dash }) {
  return (
    <View style={styles.canvas}>
      <Hero d={d} />
      <Stats d={d} />
      <Subjects d={d} />
      <Plan d={d} />
      <Live d={d} />
      <Continue d={d} />
      <Urgent d={d} />
      <Activity d={d} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap4: { marginTop: 10, gap: 4 },
  canvas: { width: DASH_REF_WIDTH, height: 910 },
  hero: { position: 'absolute', left: 0, top: 0, width: 796, height: 331, overflow: 'hidden', borderTopLeftRadius: 14, backgroundColor: '#EEF4FC' },
  heroPhoto: { position: 'absolute', left: 458, top: 2, width: 338, height: 329 },
  hello: { position: 'absolute', left: 28, top: 34, fontSize: 21, fontWeight: '700', color: INK },
  next: { position: 'absolute', left: 28, top: 66, fontSize: 36, fontWeight: '800', color: INK, letterSpacing: -0.9 },
  nextSub: { position: 'absolute', left: 28, top: 114, fontSize: 16, color: '#3D4656' },
  resumeAt: { position: 'absolute', left: 28, top: 153, width: 429 },
  stats: { position: 'absolute', left: 813, top: 31, width: 327, gap: 14 },
  stat: { height: 86, flexDirection: 'row', overflow: 'hidden', ...panel },
  statLeft: { width: 181, flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 14 },
  statIcon: { width: 56, height: 56 },
  statValue: { fontSize: 25, fontWeight: '700', color: INK },
  statLabel: { fontSize: 13.5, color: BODY },
  statRight: { flex: 1, justifyContent: 'center', paddingLeft: 21, backgroundColor: '#F5F8FD' },
  statNote: { fontSize: 13, fontWeight: '600', color: INK },
  statSub: { marginTop: 5, fontSize: 12.5, color: BODY },
  subjects: { position: 'absolute', left: 0, top: 347, width: 1158, height: 93, flexDirection: 'row', alignItems: 'center', gap: 16, paddingLeft: 28, paddingRight: 30, borderRadius: 14, backgroundColor: '#EEF4FC' },
  subject: { width: 210, height: 78, flexDirection: 'row', alignItems: 'center', gap: 13, paddingLeft: 10, ...panel, borderRadius: 10 },
  subjectIcon: { width: 58, height: 58, borderRadius: 12 },
  subjectName: { fontSize: 14, fontWeight: '600', color: INK },
  subjectDetail: { marginTop: 4, fontSize: 12.5, color: BODY },
  more: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1463F3', alignItems: 'center', justifyContent: 'center' },
  card: { position: 'absolute', paddingHorizontal: 28, paddingTop: 16, ...panel },
  planCard: { left: 0, top: 445, width: 380, height: 460 },
  plan: { marginTop: 16, gap: 20 },
  planLine: { position: 'absolute', left: 3, top: 10, bottom: 10, width: 1, backgroundColor: '#C9D7EE' },
  planRow: { height: 46, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#1463F3' },
  planAt: { width: 60, fontSize: 12, color: BODY },
  planIcon: { width: 38, height: 38, borderRadius: 8 },
  planTitle: { fontSize: 13, fontWeight: '500', color: INK },
  planDetail: { marginTop: 3, fontSize: 11, color: BODY },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: '#EEF1F6', fontSize: 11.5, color: BODY, overflow: 'hidden' },
  tagLive: { backgroundColor: '#FDECEC', color: '#E5484D' },
  liveCard: { left: 392, top: 445, width: 436, height: 230, paddingHorizontal: 22 },
  liveBox: { marginTop: 12, height: 181, padding: 16, borderRadius: 10, backgroundColor: '#E9F1FE', overflow: 'hidden' },
  laptop: { position: 'absolute', right: 2, top: 4, width: 142, height: 115 },
  liveInfo: { marginTop: 12, width: 260 },
  liveFoot: { position: 'absolute', left: 16, right: 0, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 16 },
  join: { width: 204, height: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 6, backgroundColor: '#0B6BFF' },
  joinText: { fontSize: 14.5, fontWeight: '500', color: '#FFFFFF' },
  set: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  setTitle: { fontSize: 12.5, color: INK },
  setSub: { marginTop: 3, fontSize: 11.5, color: BODY },
  contCard: { left: 392, top: 685, width: 436, height: 190, paddingHorizontal: 15 },
  thumbs: { flexDirection: 'row', gap: 15, marginTop: 12 },
  thumb: { width: 125 },
  thumbPhoto: { width: 125, height: 66, borderRadius: 6 },
  thumbTitle: { marginTop: 8, fontSize: 10.5, fontWeight: '600', color: INK },
  thumbMeta: { marginTop: 3, fontSize: 9.5, color: BODY },
  thumbBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  thumbPct: { fontSize: 9.5, color: BODY },
  urgentCard: { left: 842, top: 445, width: 316, height: 165, paddingHorizontal: 16 },
  activityCard: { left: 842, top: 622, width: 316, height: 256, paddingHorizontal: 16 },
  activity: { marginTop: 14, gap: 22 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  activityIcon: { width: 38, height: 38, borderRadius: 19 },
  activityTitle: { fontSize: 13, color: INK },
  activityAt: { marginTop: 3, fontSize: 12, color: BODY },
});
