import { type Href, router } from 'expo-router';
import { type ReactNode, useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PremiumTile } from '@/features/portal/Premium';
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
import { Maple } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';

const INK = Maple.navy;
const BODY = Maple.body;
const BLUE = Maple.blue;
const LINE = Maple.blueSelected;
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

/** One number in the premium tile look, tinted with its own colour. */
function Stat({ icon, tint, value, label }: { icon: IconName; tint: string; value: string; label: string }) {
  return <PremiumTile item={{ label, value, icon, tone: 'blue', color: tint }} minHeight={128} style={styles.stat} />;
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
        <Text style={styles.h1} {...PAGE_TITLE}>{`${greeting(now)}, ${firstName}`}</Text>
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
        <Stat icon="clipboard" tint={Maple.warning} value={String(todo.length)} label="To do" />
        <Stat icon="check" tint={Maple.successText} value={String(marked.length)} label="Marked" />
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
  bg: { flex: 1, backgroundColor: Maple.blueSoft },
  page: { gap: 16, padding: 16, paddingBottom: 110 },
  pageWide: { width: '100%', maxWidth: 1180, alignSelf: 'center', padding: 24 },
  hero: { gap: 8, padding: 22, borderRadius: 16, backgroundColor: Maple.blue },
  eyebrow: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.6, color: Maple.blueSelected },
  h1: { fontSize: 26, fontWeight: '800', color: Maple.surface, letterSpacing: -0.5 },
  heroBody: { fontSize: 14, color: Maple.blueSelected },
  heroButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, backgroundColor: Maple.surface },
  heroButtonText: { fontSize: 14, fontWeight: '700', color: BLUE },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.surface },
  stat: { flexGrow: 1, flexBasis: 100 },
  columns: { gap: 16 },
  columnsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { gap: 16 },
  colMain: { flex: 3 },
  colSide: { flex: 2 },
  card: { gap: 8, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: Maple.surface },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 16, fontWeight: '800', color: INK },
  link: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  body: { fontSize: 13.5, lineHeight: 20, color: BODY },
  muted: { fontSize: 12, color: BODY },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, borderTopWidth: 1, borderTopColor: Maple.blueSoft },
  rowTitle: { fontSize: 14, fontWeight: '600', color: INK },
  pill: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden', fontSize: 11.5, fontWeight: '700' },
  pillTodo: { color: Maple.warningText, backgroundColor: Maple.warningSoft },
  pillSent: { color: Maple.body, backgroundColor: Maple.blueSelected },
  pillDone: { color: Maple.successText, backgroundColor: Maple.successSoft },
  live: { gap: 6, padding: 14, borderRadius: 10, backgroundColor: Maple.blueHover },
  liveTitle: { fontSize: 16, fontWeight: '800', color: Maple.surface },
  liveMeta: { fontSize: 12.5, color: Maple.blueSelected },
  join: { alignSelf: 'flex-start', marginTop: 4, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: Maple.surface },
  joinText: { fontSize: 13.5, fontWeight: '700', color: BLUE },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: Maple.surface },
});
