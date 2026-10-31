import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { RefScale } from '@/features/public/home/RefScale';

import { CardHead, GoalCard, Hero, Leaderboard, Members, Resources, Sessions, Settings, StreakCard, Tabs, Tasks } from './SquadCards';
import { SquadChat } from './SquadChat';
import { type Dialog, SquadDialogs, SquadSide } from './SquadSide';
import { type Room, type Squad, type SquadState, useSquad } from './useSquad';

/** The squad reference's desktop panel (x 16–1172 of 1536), laid out in its pixels. */
const SQUAD_REF_WIDTH = 1156;
const MAX_DESK_WIDTH = 1400;
const BODY = '#4A5263';

function ChatCard({ room, s, phone = false }: { room: Room; s: SquadState; phone?: boolean }) {
  return (
    <View style={[styles.card, styles.chatCard, phone && styles.chatCardP]}>
      <CardHead
        icon={room.icons.chat}
        title="Squad Chat"
        right={
          s.tab === 'Chat' ? null : (
            <Pressable onPress={() => s.setTab('Chat')} accessibilityRole="button" accessibilityLabel="Open the full chat" hitSlop={8}>
              <Icon name="more" size={16} color={BODY} />
            </Pressable>
          )
        }
      />
      <SquadChat s={s} phone={phone} onAttach={() => s.setTab('Resources')} />
    </View>
  );
}

function DeskContent({ room, s }: { room: Room; s: SquadState }) {
  switch (s.tab) {
    case 'Overview':
      return (
        <View style={styles.grid}>
          <View style={styles.colAB}>
            <View style={styles.row}>
              <View style={styles.colA}>
                <GoalCard room={room} s={s} />
              </View>
              <View style={styles.flex}>
                <StreakCard room={room} s={s} />
              </View>
            </View>
            <ChatCard room={room} s={s} />
          </View>
          <View style={styles.colC}>
            <Leaderboard room={room} s={s} />
            <Sessions room={room} s={s} />
            <Resources room={room} s={s} />
          </View>
        </View>
      );
    case 'Chat':
      return <ChatCard room={room} s={s} />;
    case 'Study Sessions':
      return <Sessions room={room} s={s} />;
    case 'Resources':
      return <Resources room={room} s={s} />;
    case 'Tasks':
      return <Tasks s={s} />;
    case 'Members':
      return <Members s={s} />;
    case 'Settings':
      return <Settings s={s} />;
  }
}

function PhoneContent({ room, s }: { room: Room; s: SquadState }) {
  switch (s.tab) {
    case 'Chat':
      return <ChatCard room={room} s={s} phone />;
    case 'Tasks':
      return <Tasks s={s} />;
    case 'Members':
      return <Members s={s} />;
    case 'Study Sessions':
      return <Sessions room={room} s={s} />;
    case 'Resources':
      return <Resources room={room} s={s} />;
    case 'Settings':
      return <Settings s={s} />;
    default:
      return (
        <>
          <GoalCard room={room} s={s} phone />
          <StreakCard room={room} s={s} />
          <Leaderboard room={room} s={s} limit={4} />
          <Sessions room={room} s={s} limit={1} />
        </>
      );
  }
}

function Toast({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
      <Text style={styles.toastText}>{text}</Text>
    </View>
  );
}

/** The Study Squad room for one squad. Rendered by /learn/squads and /learn/squads/[id]. */
export function SquadRoom({ room, squad, avatar }: { room: Room; squad: Squad; avatar: number }) {
  const s = useSquad(room, squad);
  const [dialog, setDialog] = useState<Dialog>(null);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  const dialogs = <SquadDialogs room={room} s={s} dialog={dialog} onClose={() => setDialog(null)} />;
  if (!wide)
    return (
      <View style={styles.phoneRoot}>
        <LearnerPhoneTop avatar={avatar} />
        <ScrollView contentContainerStyle={styles.phone} keyboardShouldPersistTaps="handled">
          <Hero room={room} s={s} phone />
          <Tabs s={s} phone />
          <PhoneContent room={room} s={s} />
          <Pressable style={styles.otherSquads} onPress={() => setDialog('discover')} accessibilityRole="button">
            <Text style={styles.otherText}>Other squads, join by code or create one</Text>
            <Icon name="chevronRight" size={14} color="#1463F3" />
          </Pressable>
        </ScrollView>
        <Toast text={s.toastText} />
        {dialogs}
      </View>
    );
  return (
    <View style={styles.flex}>
      <ScrollView style={styles.deskBg} contentContainerStyle={styles.deskWrap} keyboardShouldPersistTaps="handled">
        <RefScale width={Math.min(width - 32, MAX_DESK_WIDTH)} refWidth={SQUAD_REF_WIDTH}>
          <View style={styles.canvas}>
            <View style={styles.left}>
              <SquadSide room={room} s={s} onDialog={setDialog} />
            </View>
            <View style={styles.main}>
              <Hero room={room} s={s} />
              <Tabs s={s} />
              <View style={styles.content}>
                <DeskContent room={room} s={s} />
              </View>
            </View>
          </View>
        </RefScale>
      </ScrollView>
      <Toast text={s.toastText} />
      {dialogs}
    </View>
  );
}

/** Shown when a link names a squad the learner isn't in. */
export function NoSquad() {
  return (
    <View style={styles.missing}>
      <Text style={styles.missingTitle}>We couldn’t find that squad</Text>
      <Pressable onPress={() => router.replace('/learn/squads')} accessibilityRole="link">
        <Text style={styles.otherText}>Go to my squads</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  deskBg: { backgroundColor: '#EEF3FB' },
  deskWrap: { alignItems: 'center', paddingVertical: 16 },
  canvas: { width: SQUAD_REF_WIDTH, flexDirection: 'row', gap: 10 },
  left: { width: 206 },
  main: { flex: 1, borderRadius: 10, backgroundColor: '#F6F9FD', overflow: 'hidden' },
  content: { padding: 8 },
  grid: { flexDirection: 'row', gap: 8 },
  colAB: { flex: 1, gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  colA: { width: 404 },
  colC: { width: 276, gap: 10 },
  card: { borderRadius: 10, borderWidth: 1, borderColor: '#EAEFF6', backgroundColor: '#FFFFFF' },
  chatCard: { minHeight: 540, gap: 6, padding: 14 },
  chatCardP: { minHeight: 0 },
  phoneRoot: { flex: 1, backgroundColor: '#F6F9FD' },
  phone: { gap: 12, padding: 14, paddingBottom: 110 },
  otherSquads: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10 },
  otherText: { fontSize: 12.5, fontWeight: '500', color: '#1463F3' },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center' },
  toastText: { maxWidth: 520, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(11,20,36,0.92)', fontSize: 13, color: '#FFFFFF', textAlign: 'center', overflow: 'hidden' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFFFFF' },
  missingTitle: { fontSize: 17, fontWeight: '700', color: '#0B1424' },
});
