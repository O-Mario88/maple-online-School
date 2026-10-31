import { type Href, router } from 'expo-router';
import { type ReactNode, useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Segmented, useShell } from '@/components/ui';
import { useAuth } from '@/lib/auth/auth-context';
import { greeting } from '@/lib/home';
import type { IconName } from '@/lib/icons';
import { useAssignments, useGrades, useSubmissions } from '@/lib/learning/queries';
import { studentWork } from '@/lib/learning/work';
import { lessonWhen, upcomingLessons } from '@/lib/lessons/lessons';
import { groupSessions } from '@/lib/lessons/live';
import { useLessons, useLiveSessions } from '@/lib/lessons/queries';
import { itemHref, MEDIA_URL } from '@/lib/library/library';
import { useContinue } from '@/lib/library/queries';
import { PORTAL_LABELS } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';
import { toast } from '@/lib/toast';

const INK = '#0B1424';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const LINE = '#E6EBF2';
const MAX_ROWS = 4;

async function open(href: string | null) {
  if (!href) {
    toast('This has no link yet.');
    return;
  }
  try {
    await Linking.openURL(href);
  } catch {
    toast('Could not open this on this device.');
  }
}

function Card({ title, link, children }: { title: string; link?: { label: string; href: Href }; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.cardTitle} accessibilityRole="header">
          {title}
        </Text>
        {link ? (
          <Pressable onPress={() => router.push(link.href)} accessibilityRole="link" hitSlop={6}>
            <Text style={styles.link}>{`${link.label} →`}</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function Stat({ icon, tint, value, label }: { icon: IconName; tint: string; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.statIcon, { backgroundColor: tint }]}>
        <Icon name={icon} size={18} color="#FFFFFF" />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.muted}>{label}</Text>
      </View>
    </View>
  );
}

const QUICK: readonly { icon: IconName; label: string; href: Href }[] = [
  { icon: 'person', label: 'Classes', href: '/learn/live' },
  { icon: 'clipboard', label: 'Assignments', href: '/learn/assignments' },
  { icon: 'library', label: 'Library', href: '/learn/library' },
  { icon: 'wallet', label: 'Fees', href: '/fees' },
];

/** The learner home on the real API: what to do next, live classes, assignments and reading, in the design's look. */
export function LiveHome({ firstName }: { firstName: string }) {
  const { wide } = useShell();
  const { signOut } = useAuth();
  const { portal, portals, setPortal } = usePortal();
  const now = useMemo(() => new Date(), []);
  const assignments = useAssignments();
  const submissions = useSubmissions();
  const grades = useGrades();
  const sessions = useLiveSessions();
  const lessons = useLessons();
  const reading = useContinue(true);

  const work = studentWork(assignments.data ?? [], submissions.data ?? [], grades.data ?? []);
  const todo = work.filter((w) => w.state === 'todo');
  const marked = work.filter((w) => w.state === 'graded');
  const groups = groupSessions(sessions.data ?? [], now);
  const next = groups.live[0] ?? groups.upcoming[0];
  const planned = upcomingLessons(lessons.data ?? [], now).filter((l) => l.access_mode !== 'draft');
  const nextWork = todo[0];
  const books = reading.data ?? [];

  return (
    <ScrollView style={styles.bg} contentContainerStyle={[styles.page, wide && styles.pageWide]}>
      {!wide && portals.length > 1 ? (
        <Segmented label="Switch portal" options={portals.map((p) => ({ value: p, label: PORTAL_LABELS[p] }))} value={portal} onChange={setPortal} />
      ) : null}
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>{now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</Text>
        <Text style={styles.h1} accessibilityRole="header">{`${greeting(now)}, ${firstName}`}</Text>
        <Text style={styles.heroBody}>{nextWork ? `Next up: ${nextWork.title}` : 'You’re all caught up. Explore your classes and library.'}</Text>
        <Pressable
          style={styles.heroButton}
          onPress={() => router.push(nextWork ? { pathname: '/learn/assignments/[id]', params: { id: String(nextWork.assessmentId) } } : '/learn/live')}
          accessibilityRole="button">
          <Text style={styles.heroButtonText}>{nextWork ? 'Continue Learning' : 'See my classes'}</Text>
          <Icon name="arrowRight" size={16} color={BLUE} />
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Stat icon="clipboard" tint="#F28C28" value={String(todo.length)} label="To do" />
        <Stat icon="check" tint="#22A35A" value={String(marked.length)} label="Marked" />
        <Stat icon="calendar" tint={BLUE} value={String(groups.live.length + groups.upcoming.length + planned.length)} label="Coming up" />
      </View>

      <View style={[styles.columns, wide && styles.columnsWide]}>
        <View style={[styles.col, wide && styles.colMain]}>
          <Card title="My Assignments" link={{ label: 'View all', href: '/learn/assignments' }}>
            {work.length === 0 ? <Text style={styles.body}>No assignments yet. Your teachers’ work will appear here.</Text> : null}
            {work.slice(0, MAX_ROWS).map((w) => (
              <Pressable
                key={w.assessmentId}
                style={styles.row}
                onPress={() =>
                  router.push(
                    w.state === 'graded'
                      ? { pathname: '/learn/assignments/[id]/feedback', params: { id: String(w.assessmentId) } }
                      : { pathname: '/learn/assignments/[id]', params: { id: String(w.assessmentId) } },
                  )
                }
                accessibilityRole="link">
                <Icon name="clipboard" size={18} color={BLUE} />
                <Text style={[styles.rowTitle, styles.flex]} numberOfLines={1}>
                  {w.title}
                </Text>
                <Text style={[styles.pill, w.state === 'todo' ? styles.pillTodo : w.state === 'graded' ? styles.pillDone : styles.pillSent]}>
                  {w.state === 'graded' ? `${w.score}/${w.maxScore}` : w.state === 'todo' ? 'To do' : 'Submitted'}
                </Text>
              </Pressable>
            ))}
          </Card>
          <Card title="Continue Reading" link={{ label: 'Library', href: '/learn/library' }}>
            {books.length === 0 ? <Text style={styles.body}>Books and notes you open appear here so you can pick up where you left off.</Text> : null}
            {books.slice(0, MAX_ROWS).map((c) => (
              <Pressable key={c.item} style={styles.row} onPress={() => open(itemHref(c, MEDIA_URL))} accessibilityRole="button">
                <Icon name="book" size={18} color={BLUE} />
                <Text style={[styles.rowTitle, styles.flex]} numberOfLines={1}>
                  {c.title}
                </Text>
                <Text style={styles.muted}>{`${Math.round(Number(c.completion_percentage))}%`}</Text>
              </Pressable>
            ))}
          </Card>
        </View>
        <View style={[styles.col, wide && styles.colSide]}>
          <Card title={groups.live.length > 0 ? 'Live Now' : 'Next Live Class'} link={{ label: 'Classes', href: '/learn/live' }}>
            {next ? (
              <View style={styles.live}>
                <Text style={styles.liveTitle}>{next.title}</Text>
                <Text style={styles.liveMeta}>{[next.scheduled_start ? lessonWhen(next.scheduled_start) : null, next.hostName].filter(Boolean).join(' · ')}</Text>
                {groups.live.length > 0 ? (
                  <Pressable style={styles.join} onPress={() => open(next.meeting_link)} accessibilityRole="button" accessibilityLabel={`Join ${next.title}`}>
                    <Text style={styles.joinText}>Join Class</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.liveMeta}>Opens 15 minutes before it starts.</Text>
                )}
              </View>
            ) : (
              <Text style={styles.body}>{planned[0] ? `Next lesson: ${planned[0].title}, ${lessonWhen(planned[0].scheduled_at)}` : 'No live classes scheduled yet.'}</Text>
            )}
          </Card>
          <Card title="Quick Links">
            {QUICK.map((q) => (
              <Pressable key={q.label} style={styles.row} onPress={() => router.push(q.href)} accessibilityRole="link">
                <Icon name={q.icon} size={18} color={BLUE} />
                <Text style={[styles.rowTitle, styles.flex]}>{q.label}</Text>
                <Icon name="chevronRight" size={14} color={BODY} />
              </Pressable>
            ))}
          </Card>
          {wide ? null : (
            <Pressable style={styles.signOut} onPress={() => signOut().catch(() => toast('Could not sign out. Try again.'))} accessibilityRole="button">
              <Icon name="logout" size={16} color={INK} />
              <Text style={styles.rowTitle}>Sign out</Text>
            </Pressable>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: '#EEF3FA' },
  page: { gap: 16, padding: 16, paddingBottom: 110 },
  pageWide: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: 24 },
  hero: { gap: 8, padding: 22, borderRadius: 16, backgroundColor: '#1D5BEA' },
  eyebrow: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.6, color: '#D6E2FA' },
  h1: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  heroBody: { fontSize: 14, color: '#E1EAFE' },
  heroButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, backgroundColor: '#FFFFFF' },
  heroButtonText: { fontSize: 14, fontWeight: '700', color: BLUE },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { flexGrow: 1, flexBasis: 140, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, backgroundColor: '#FFFFFF' },
  statIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  statValue: { fontSize: 20, fontWeight: '800', color: INK },
  columns: { gap: 16 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { gap: 16 },
  colMain: { flex: 3 },
  colSide: { flex: 2 },
  card: { gap: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: INK },
  link: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  body: { fontSize: 13.5, lineHeight: 20, color: BODY },
  muted: { fontSize: 12, color: BODY },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#F0F3F8' },
  rowTitle: { fontSize: 14, fontWeight: '600', color: INK },
  pill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden', fontSize: 11.5, fontWeight: '700' },
  pillTodo: { color: '#B45309', backgroundColor: '#FFF4E5' },
  pillSent: { color: '#475569', backgroundColor: '#EEF2F7' },
  pillDone: { color: '#15803D', backgroundColor: '#E6F6EC' },
  live: { gap: 6, padding: 14, borderRadius: 10, backgroundColor: '#123A8C' },
  liveTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  liveMeta: { fontSize: 12.5, color: '#D6E2FA' },
  join: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FFFFFF' },
  joinText: { fontSize: 13.5, fontWeight: '700', color: BLUE },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
});
