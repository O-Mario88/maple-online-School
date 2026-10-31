import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import type { IconName } from '@/lib/icons';
import { ID_TONE } from '@/features/learner/cbc/CbcParts';
import { identifierFor } from '@/lib/cbc';

import { BLUE, BODY, type Home, INK } from './HomeFrame';

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' });
const GREEN = '#16A34A';

export function CardHead({ icon, color, title, link, onLink, children }: { icon: IconName; color: string; title: string; link?: string; onLink?: () => void; children?: ReactNode }) {
  return (
    <View style={styles.head}>
      <Icon name={icon} size={16} color={color} />
      <Text style={styles.headTitle} numberOfLines={1}>
        {title}
      </Text>
      {children}
      <View style={styles.flex} />
      {link ? (
        <Pressable style={styles.link} onPress={onLink} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.linkText}>{link}</Text>
          <Icon name="arrowRight" size={12} color={BLUE} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Tabs<T extends string>({ tabs, on, setOn }: { tabs: readonly T[]; on: T; setOn: (t: T) => void }) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {tabs.map((t) => (
        <Pressable key={t} style={[styles.tab, t === on && styles.tabOn]} onPress={() => setOn(t)} accessibilityRole="tab" accessibilityState={{ selected: t === on }}>
          <Text style={[styles.tabText, t === on && styles.tabTextOn]}>{t}</Text>
          {t === on ? <View style={styles.tabLine} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

export function Hero({ h, greeting }: { h: Home; greeting: string }) {
  const x = h.hero;
  return (
    <View style={styles.hero}>
      <Image source={x.image} style={styles.fill} contentFit="cover" accessibilityLabel="A smiling girl resting her chin on her hand" />
      <View style={styles.heroCopy}>
        <Text style={styles.hello}>{`${greeting},`}</Text>
        <Text style={styles.name}>{`${h.name} 👋`}</Text>
        <Text style={styles.heroSub}>{x.sub}</Text>
      </View>
      <Text style={styles.quote}>{x.quote}</Text>
      <View style={styles.level}>
        <Image source={x.crown} style={styles.crown} />
        <Text style={styles.levelText}>{`Level ${x.level}`}</Text>
        <View style={styles.levelBar}>
          <Bar value={x.xp / x.xpNext} color={BLUE} track="#E1E9F6" height={7} />
        </View>
        <Text style={styles.xp}>{`${x.xp} / ${x.xpNext} XP`}</Text>
      </View>
      <View style={styles.streak}>
        <Image source={x.fire} style={styles.fire} />
        <View>
          <Text style={styles.streakNum}>{x.streak}</Text>
          <Text style={styles.streakText}>Day Streak</Text>
        </View>
      </View>
    </View>
  );
}

export function QuickActions({ h }: { h: Home }) {
  return (
    <View style={styles.quick}>
      {h.quick.map((q) => (
        <Pressable key={q.label} style={styles.quickItem} onPress={() => router.push(q.href)} accessibilityRole="link">
          <Image source={q.icon} style={styles.quickIcon} />
          <Text style={styles.quickText} numberOfLines={1}>
            {q.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

type LearnTab = keyof Home['learning'];

export function MyLearning({ h }: { h: Home }) {
  const tabs = Object.keys(h.learning) as LearnTab[];
  const [on, setOn] = useState<LearnTab>(tabs[0]);
  return (
    <View>
      <CardHead icon="people" color="#5B3FD9" title="My Learning" link="View All" onLink={() => router.push('/learn/explore')}>
        <Tabs tabs={tabs} on={on} setOn={setOn} />
      </CardHead>
      <View style={styles.courses}>
        {h.learning[on].map((c) => (
          <View key={c.subject + c.topic} style={styles.course}>
            <Image source={c.thumb} style={styles.courseThumb} contentFit="cover" />
            <View style={styles.courseBody}>
              <Text style={styles.courseSubject}>{c.subject}</Text>
              <Text style={styles.courseTopic} numberOfLines={1}>
                {c.topic}
              </Text>
              <View style={styles.courseBar}>
                <View style={styles.flex}>
                  <Bar value={c.progress} color={BLUE} track="#E1E9F6" height={7} />
                </View>
                <Text style={styles.coursePct}>{`${Math.round(c.progress * 100)}%`}</Text>
              </View>
              <Pressable style={styles.continue} onPress={() => router.push('/learn/course')} accessibilityRole="button" accessibilityLabel={`${c.progress === 1 ? 'Review' : c.progress === 0 ? 'Start' : 'Continue'} ${c.subject}: ${c.topic}`}>
                <View style={styles.playDot}>
                  <Icon name="playFill" size={8} color="#FFFFFF" />
                </View>
                <Text style={styles.continueText}>{c.progress === 1 ? 'Review' : c.progress === 0 ? 'Start' : 'Continue'}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function SessionCard({ photo, title, topic, when, time, teacher, action, onPress }: { photo: number; title: string; topic: string; when: string; time: string; teacher: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.session}>
      <Image source={photo} style={styles.sessionPhoto} />
      <View style={styles.flex}>
        <Text style={styles.sessionTitle}>{title}</Text>
        <Text style={styles.sessionSub}>{topic}</Text>
        <Text style={styles.sessionWhen}>{`${when}  •  ${time}`}</Text>
        <Text style={styles.sessionSub}>{`with ${teacher}`}</Text>
      </View>
      <Pressable style={styles.join} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${action}: ${title}`}>
        <Icon name={action === 'Join Class' ? 'video' : 'live'} size={13} color="#FFFFFF" />
        <Text style={styles.joinText}>{action}</Text>
      </Pressable>
    </View>
  );
}

export function UpcomingLive({ h }: { h: Home }) {
  const c = h.liveClass;
  return (
    <View>
      <CardHead icon="live" color="#E5484D" title="Upcoming Live Classes" link="View All" onLink={() => router.push('/learn/live')} />
      <SessionCard photo={c.photo} title={c.subject} topic={c.topic} when={c.when} time={c.time} teacher={c.teacher} action="Join Class" onPress={() => router.push('/learn/live-room')} />
    </View>
  );
}

export function UpcomingTutoring({ h }: { h: Home }) {
  const t = h.tutoring;
  return (
    <View>
      <CardHead icon="person" color="#F28C28" title="Upcoming Live Tutoring" link="View All" onLink={() => router.push('/learn/live')} />
      <SessionCard photo={t.photo} title={t.title} topic={t.topic} when={t.when} time={t.time} teacher={t.teacher} action="Join Session" onPress={() => router.push('/learn/live-room')} />
    </View>
  );
}

export function MyProgress({ h, phone = false }: { h: Home; phone?: boolean }) {
  return (
    <View style={[styles.rings, phone && styles.ringsP]}>
      {h.progress.map((p) => (
        <View key={p.subject} style={styles.ring} accessible accessibilityLabel={`${p.subject}: ${Math.round(p.value * 100)}%, ${identifierFor(p.value * 100, 100).label}`}>
          <ProgressRing value={p.value} size={phone ? 54 : 64} stroke={phone ? 5 : 6} color={p.color} track={`${p.color}22`} labelSize={phone ? 12 : 15} />
          <View style={styles.ringLabel}>
            <Text style={[styles.ringText, phone && styles.ringTextP]}>{phone ? p.short : p.subject}</Text>
            <Text style={[styles.ringId, { color: ID_TONE[identifierFor(p.value * 100, 100).id].fg }]}>{identifierFor(p.value * 100, 100).label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

export function ResultRow({ r, phone = false }: { r: Home['results'][number]; phone?: boolean }) {
  const g = identifierFor(r.percent, 100);
  const good = g.id === 3;
  return (
    <View style={[styles.result, phone && styles.resultP]} accessible accessibilityLabel={`${r.title}, ${r.date}, ${r.percent}%, identifier ${g.id}, ${g.label}`}>
      <Image source={r.icon} style={phone ? styles.resultIconP : styles.resultIcon} />
      <View style={styles.flex}>
        <Text style={styles.resultTitle}>{r.title}</Text>
        {phone ? <Text style={styles.resultDate}>{r.date}</Text> : null}
      </View>
      {phone ? null : <Text style={styles.resultDate}>{r.date}</Text>}
      <Text style={[styles.resultPct, { color: good ? GREEN : '#D97706' }]}>{`${r.percent}%`}</Text>
      <View style={[styles.grade, good ? styles.gradeGood : styles.gradeWarn]}>
        <Text style={[styles.gradeText, { color: good ? GREEN : '#D97706' }]}>{g.id}</Text>
      </View>
    </View>
  );
}

type LibTab = keyof Home['library'];

export function MyLibrary({ h }: { h: Home }) {
  const tabs = Object.keys(h.library) as LibTab[];
  const [on, setOn] = useState<LibTab>(tabs[0]);
  return (
    <View>
      <CardHead icon="book" color="#E5484D" title="My Library" link="View All" onLink={() => router.push('/learn/library')}>
        <Tabs tabs={tabs} on={on} setOn={setOn} />
      </CardHead>
      <View style={styles.books}>
        {h.library[on].map((b) => (
          <Pressable key={b.title} style={styles.book} onPress={() => router.push('/learn/library')} accessibilityRole="link" accessibilityLabel={`${b.title}, ${b.meta}`}>
            <Image source={b.thumb} style={styles.bookThumb} contentFit="cover" />
            <Text style={styles.bookTitle}>{b.title}</Text>
            <Text style={styles.bookMeta}>{b.meta}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function MyProjects({ h }: { h: Home }) {
  return (
    <View>
      <CardHead icon="star" color="#F28C28" title="My Projects" link="View All" onLink={() => router.push('/learn/projects')} />
      <View style={styles.projects}>
        {h.projects.map((p) => (
          <Pressable key={p.title} style={styles.project} onPress={() => router.push('/learn/projects')} accessibilityRole="link" accessibilityLabel={`${p.title}, ${p.subject}, ${p.due}, ${Math.round(p.progress * 100)}% done`}>
            <Text style={styles.projectTitle} numberOfLines={1}>
              {p.title}
            </Text>
            <Text style={styles.projectSub} numberOfLines={1}>
              {p.subject}
            </Text>
            <Text style={styles.due}>{p.due}</Text>
            <View style={styles.projectBar}>
              <View style={styles.flex}>
                <Bar value={p.progress} color={p.color} track="#E1E9F6" height={6} />
              </View>
              <Text style={styles.projectPct}>{`${Math.round(p.progress * 100)}%`}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headTitle: { fontSize: 15.5, fontWeight: '700', color: INK, letterSpacing: -0.2 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  linkText: { fontSize: 11.5, color: BLUE },
  tabs: { flexDirection: 'row', gap: 5, marginLeft: 10 },
  tab: { height: 25, justifyContent: 'center', paddingHorizontal: 8, borderRadius: 5, backgroundColor: '#F1F4F9' },
  tabOn: { backgroundColor: '#E6EEFC' },
  tabText: { fontSize: 11, color: BODY },
  tabTextOn: { color: BLUE, fontWeight: '600' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: -4, height: 2, backgroundColor: BLUE },
  hero: { height: 173, borderRadius: 12, overflow: 'hidden', backgroundColor: '#DCE9F7' },
  heroCopy: { position: 'absolute', left: 207, top: 17 },
  hello: { fontSize: 15.5, fontWeight: '600', color: INK },
  name: { marginTop: 1, fontSize: 30, fontWeight: '800', color: INK, letterSpacing: -0.6 },
  heroSub: { marginTop: 4, fontSize: 15.5, color: '#3D4656' },
  quote: { position: 'absolute', left: 540, top: 38, fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, lineHeight: 22, color: '#1E2A44', textAlign: 'right' },
  level: { position: 'absolute', left: 206, top: 122, width: 426, height: 40, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 8, backgroundColor: '#FFFFFF' },
  crown: { width: 26, height: 26 },
  levelText: { fontSize: 14, fontWeight: '700', color: INK, marginRight: 8, flexShrink: 0 },
  levelBar: { flex: 1 },
  xp: { marginLeft: 6, fontSize: 12, color: INK, flexShrink: 0 },
  streak: { position: 'absolute', left: 648, top: 107, width: 110, height: 55, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#FFFFFF' },
  fire: { width: 28, height: 32 },
  streakNum: { fontSize: 18, lineHeight: 20, fontWeight: '700', color: INK },
  streakText: { fontSize: 11.5, color: INK },
  quick: { height: 70, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, borderRadius: 10, backgroundColor: '#FFFFFF' },
  quickItem: { flex: 1, alignItems: 'center', gap: 8 },
  quickIcon: { width: 42, height: 42 },
  quickText: { fontSize: 10.5, color: INK },
  courses: { flexDirection: 'row', gap: 12, marginTop: 18 },
  course: { width: 133, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  courseThumb: { width: 133, height: 68 },
  courseBody: { padding: 9 },
  courseSubject: { fontSize: 12.5, fontWeight: '700', color: INK },
  courseTopic: { marginTop: 3, fontSize: 10.5, color: BODY },
  courseBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  coursePct: { fontSize: 11, color: INK },
  continue: { height: 26, flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8, paddingHorizontal: 8, borderRadius: 5, backgroundColor: '#E6EEFC' },
  playDot: { width: 15, height: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: BLUE },
  continueText: { fontSize: 11.5, fontWeight: '600', color: BLUE },
  session: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4' },
  sessionPhoto: { width: 58, height: 56, borderRadius: 6 },
  sessionTitle: { fontSize: 12.5, fontWeight: '700', color: INK },
  sessionSub: { marginTop: 3, fontSize: 11, color: BODY },
  sessionWhen: { marginTop: 3, fontSize: 10.5, color: INK },
  join: { height: 24, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 4, backgroundColor: '#0B6BFF' },
  joinText: { fontSize: 11, fontWeight: '500', color: '#FFFFFF' },
  rings: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  ringsP: { marginTop: 10, justifyContent: 'space-between' },
  ring: { alignItems: 'center', gap: 8 },
  ringLabel: { alignItems: 'center' },
  ringId: { marginTop: 1, fontSize: 10, fontWeight: '600' },
  ringText: { fontSize: 12.5, color: INK },
  ringTextP: { fontSize: 11 },
  result: { height: 31, flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultP: { height: 44 },
  resultIcon: { width: 18, height: 18 },
  resultIconP: { width: 28, height: 28 },
  resultTitle: { fontSize: 12, color: INK },
  resultDate: { width: 86, fontSize: 11, color: BODY },
  resultPct: { width: 34, fontSize: 12.5, fontWeight: '700', textAlign: 'right' },
  grade: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  gradeGood: { backgroundColor: '#DDF3E5' },
  gradeWarn: { backgroundColor: '#FDEBD3' },
  gradeText: { fontSize: 11.5, fontWeight: '700' },
  books: { flexDirection: 'row', gap: 12, marginTop: 14 },
  book: { width: 120 },
  bookThumb: { width: 120, height: 56, borderRadius: 5 },
  bookTitle: { marginTop: 6, fontSize: 11, color: INK },
  bookMeta: { marginTop: 1, fontSize: 9.5, color: BODY },
  projects: { flexDirection: 'row', gap: 8, marginTop: 14 },
  project: { flex: 1, padding: 9, borderRadius: 8, borderWidth: 1, borderColor: '#E8EDF4' },
  projectTitle: { fontSize: 10.5, fontWeight: '600', color: INK },
  projectSub: { marginTop: 3, fontSize: 10.5, color: BODY },
  due: { alignSelf: 'flex-start', marginTop: 8, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, backgroundColor: '#FDE2E2', fontSize: 10, color: '#E5484D', overflow: 'hidden' },
  projectBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
  projectPct: { fontSize: 10.5, color: INK },
});
