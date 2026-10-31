import { type ReactNode, useMemo } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { useMe } from '@/lib/auth/auth-context';
import { lessonWhen, upcomingLessons } from '@/lib/lessons/lessons';
import { groupSessions, type LiveSession } from '@/lib/lessons/live';
import { useLessons, useLiveSessions } from '@/lib/lessons/queries';
import { isStaff } from '@/lib/roles';
import { toast } from '@/lib/toast';

import { TeachPanel } from './TeachPanel';

const INK = '#0B1424';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const RED = '#E5484D';
const LINE = '#E6EBF2';

async function openLink(href: string) {
  try {
    await Linking.openURL(href);
  } catch {
    toast('Could not open the meeting on this device.');
  }
}

const provider = (s: LiveSession) => (s.provider === 'zoom' ? 'Zoom' : 'Google Meet');
const when = (s: LiveSession) => (s.scheduled_start ? lessonWhen(s.scheduled_start) : 'Time to be set');

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.h2} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function LiveNow({ s }: { s: LiveSession }) {
  return (
    <View style={styles.liveCard}>
      <View style={styles.liveTop}>
        <Text style={styles.liveBadge}>● LIVE</Text>
        <Text style={styles.liveMeta}>{provider(s)}</Text>
      </View>
      <Text style={styles.liveTitle}>{s.title}</Text>
      <Text style={styles.liveMeta}>{[s.hostName, `${s.duration_minutes} min`].filter(Boolean).join(' · ')}</Text>
      <Pressable style={styles.join} onPress={() => openLink(s.meeting_link)} accessibilityRole="button" accessibilityLabel={`Join ${s.title}`}>
        <Icon name="live" size={16} color={BLUE} />
        <Text style={styles.joinText}>Join Class</Text>
      </Pressable>
    </View>
  );
}

function SessionRow({ s, replay }: { s: LiveSession; replay?: string }) {
  return (
    <View style={styles.rowItem}>
      <View style={styles.iconBox}>
        <Icon name={replay ? 'play' : 'calendar'} size={18} color={BLUE} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.rowTitle}>{s.title}</Text>
        <Text style={styles.muted}>{[when(s), s.hostName, provider(s)].filter(Boolean).join(' · ')}</Text>
      </View>
      {replay ? (
        <Pressable style={styles.outline} onPress={() => openLink(replay)} accessibilityRole="button" accessibilityLabel={`Watch the replay of ${s.title}`}>
          <Text style={styles.outlineText}>Watch replay</Text>
        </Pressable>
      ) : (
        <Text style={styles.muted}>Opens 15 min before</Text>
      )}
    </View>
  );
}

/** Classes on the real API: live sessions to join now, what's coming up, planned lessons and replays. */
export function LiveClasses() {
  const { wide } = useShell();
  const me = useMe();
  const staff = me.data ? isStaff(me.data.memberships) : false;
  const sessions = useLiveSessions();
  const lessons = useLessons();
  const now = useMemo(() => new Date(), []);
  const g = useMemo(() => groupSessions(sessions.data ?? [], now), [sessions.data, now]);
  const planned = useMemo(() => upcomingLessons(lessons.data ?? [], now).filter((l) => l.access_mode !== 'draft'), [lessons.data, now]);
  const pending = sessions.isPending || lessons.isPending;
  const error = sessions.error ?? lessons.error;
  const replays = g.past.filter((s) => s.replay_url);
  const nothing = !pending && !error && g.live.length + g.upcoming.length + planned.length + replays.length === 0;

  return (
    <ScrollView style={styles.bg} contentContainerStyle={[styles.page, wide && styles.pageWide]}>
      <View style={styles.hero}>
        <Text style={styles.h1} accessibilityRole="header">
          Classes
        </Text>
        <Text style={styles.body}>Join your live classes, see what’s coming up, and catch up on replays.</Text>
      </View>
      {pending ? <ActivityIndicator color={BLUE} accessibilityLabel="Loading your classes" /> : null}
      {error ? <Text style={styles.error}>{error.message}</Text> : null}
      {staff ? <TeachPanel /> : null}
      {nothing ? (
        <View style={[styles.panel, styles.empty]}>
          <Text style={styles.rowTitle}>Nothing scheduled yet</Text>
          <Text style={styles.body}>When your teachers plan lessons or live classes, they appear here.</Text>
        </View>
      ) : null}
      {g.live.length > 0 ? (
        <Section title="Live Now">
          <View style={[styles.liveGrid, wide && styles.liveGridWide]}>
            {g.live.map((s) => (
              <LiveNow key={s.id} s={s} />
            ))}
          </View>
        </Section>
      ) : null}
      {g.upcoming.length > 0 ? (
        <Section title="Coming Up">
          <View style={styles.panel}>
            {g.upcoming.map((s) => (
              <SessionRow key={s.id} s={s} />
            ))}
          </View>
        </Section>
      ) : null}
      {planned.length > 0 ? (
        <Section title="Planned Lessons">
          <View style={styles.panel}>
            {planned.map((l) => (
              <View key={l.id} style={styles.rowItem}>
                <View style={styles.iconBox}>
                  <Icon name="book" size={18} color={BLUE} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.rowTitle}>{l.title}</Text>
                  <Text style={styles.muted}>{[lessonWhen(l.scheduled_at), l.class_title, l.topic_name].filter(Boolean).join(' · ')}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>
      ) : null}
      {replays.length > 0 ? (
        <Section title="Replays">
          <View style={styles.panel}>
            {replays.map((s) => (
              <SessionRow key={s.id} s={s} replay={s.replay_url ?? undefined} />
            ))}
          </View>
        </Section>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: '#F4F8FD' },
  page: { gap: 22, padding: 16, paddingBottom: 110 },
  pageWide: { width: '100%', maxWidth: 1160, alignSelf: 'center', padding: 24 },
  hero: { gap: 8, padding: 22, borderRadius: 14, backgroundColor: '#E8F0FE' },
  h1: { fontSize: 28, fontWeight: '800', color: INK, letterSpacing: -0.6 },
  h2: { fontSize: 18, fontWeight: '800', color: INK },
  body: { fontSize: 14, lineHeight: 21, color: BODY },
  muted: { fontSize: 12, color: BODY },
  error: { fontSize: 13, color: '#B42318' },
  section: { gap: 12 },
  panel: { gap: 4, padding: 6, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  empty: { gap: 6, padding: 16 },
  liveGrid: { gap: 12 },
  liveGridWide: { flexDirection: 'row', flexWrap: 'wrap' },
  liveCard: { minWidth: 280, flexGrow: 1, flexBasis: 300, gap: 8, padding: 16, borderRadius: 12, backgroundColor: '#123A8C' },
  liveTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', fontSize: 11, fontWeight: '800', color: '#FFFFFF', backgroundColor: RED },
  liveTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  liveMeta: { fontSize: 12.5, color: '#D6E2FA' },
  join: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 8, backgroundColor: '#FFFFFF' },
  joinText: { fontSize: 14, fontWeight: '700', color: BLUE },
  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10 },
  iconBox: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 9, backgroundColor: '#E8F0FE' },
  rowTitle: { fontSize: 14, fontWeight: '700', color: INK },
  outline: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: '#CFDAEC' },
  outlineText: { fontSize: 12.5, fontWeight: '700', color: BLUE },
});
