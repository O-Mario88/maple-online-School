import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';

import { invite } from './SquadCards';
import type { Room, SquadState } from './useSquad';

const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';

export type Dialog = 'discover' | 'join' | 'create' | null;
export const openSquad = (id: string) => router.push({ pathname: '/learn/squads/[id]', params: { id } });

const MENU: readonly { label: string; icon: IconName; dialog: Dialog }[] = [
  { label: 'My Squad', icon: 'clipboard', dialog: null },
  { label: 'Discover Squads', icon: 'search', dialog: 'discover' },
  { label: 'Join by Code', icon: 'qr', dialog: 'join' },
  { label: 'Create a Squad', icon: 'person', dialog: 'create' },
];

export function SquadSide({ room, s, onDialog }: { room: Room; s: SquadState; onDialog: (d: Dialog) => void }) {
  const a = s.squad.activity;
  const stats = [
    { n: a.questions, label: 'Questions Solved', icon: room.activityIcons.questions },
    { n: a.sessions, label: 'Study Sessions', icon: room.activityIcons.sessions },
    { n: a.resources, label: 'Resources Shared', icon: room.activityIcons.resources },
    { n: a.messages, label: 'Messages', icon: room.activityIcons.messages },
  ];
  const actions: readonly { label: string; icon: IconName; go: () => void }[] = [
    { label: 'Start Study Session', icon: 'video', go: () => router.push('/learn/live-room') },
    { label: 'Share Resource', icon: 'upload', go: () => s.setTab('Resources') },
    { label: 'Create Squad Task', icon: 'check', go: () => s.setTab('Tasks') },
    { label: 'Invite Members', icon: 'people', go: () => invite(s) },
  ];
  return (
    <View style={styles.side}>
      <View style={styles.panel}>
        <View style={styles.brand}>
          <Image source={room.headerIcon} style={styles.brandIcon} contentFit="contain" />
          <Text style={styles.brandText}>Study Squads</Text>
        </View>
        {MENU.map((m, i) => (
          <Pressable key={m.label} style={[styles.menuItem, i === 0 && styles.menuOn]} onPress={() => (m.dialog ? onDialog(m.dialog) : s.setTab('Overview'))} accessibilityRole="button" accessibilityState={{ selected: i === 0 }}>
            <Icon name={m.icon} size={17} color={i === 0 ? BLUE : '#3B4456'} />
            <Text style={[styles.menuText, i === 0 && styles.menuTextOn]}>{m.label}</Text>
          </Pressable>
        ))}
        <View style={styles.headRow}>
          <Text style={styles.head}>My Squads</Text>
          <Pressable onPress={() => onDialog('discover')} accessibilityRole="link" hitSlop={6}>
            <Text style={styles.link}>See All</Text>
          </Pressable>
        </View>
        {room.squads.map((q) => {
          const on = q.id === s.squad.id;
          return (
            <Pressable key={q.id} style={[styles.squad, on && styles.squadOn]} onPress={() => (on ? s.setTab('Overview') : openSquad(q.id))} accessibilityRole="link" accessibilityState={{ selected: on }}>
              <Image source={q.icon} style={styles.squadIcon} contentFit="contain" />
              <Text style={[styles.squadName, on && styles.squadNameOn]} numberOfLines={1}>
                {q.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.panel}>
        <View style={styles.headRow}>
          <Text style={styles.headBig}>Squad Activity</Text>
          <Text style={styles.chip}>This Week</Text>
        </View>
        {stats.map((x) => (
          <View key={x.label} style={styles.stat}>
            <Image source={x.icon} style={styles.statIcon} contentFit="contain" />
            <View>
              <Text style={styles.statN}>{x.n}</Text>
              <Text style={styles.statLabel}>{x.label}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.panel}>
        <Text style={styles.headBig}>Quick Actions</Text>
        {actions.map((x) => (
          <Pressable key={x.label} style={styles.action} onPress={x.go} accessibilityRole="button">
            <Icon name={x.icon} size={15} color={BLUE} />
            <Text style={styles.actionText}>{x.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Join by code, discover open squads, or ask a teacher to set up a new squad. */
export function SquadDialogs({ room, s, dialog, onClose }: { room: Room; s: SquadState; dialog: Dialog; onClose: () => void }) {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const others = room.squads.filter((q) => q.id !== s.squad.id);
  const close = () => {
    setCode('');
    setName('');
    setError(null);
    onClose();
  };
  const join = () => {
    const found = room.squads.find((q) => q.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      setError('That code doesn’t match a squad. Check it with whoever invited you.');
      return;
    }
    close();
    openSquad(found.id);
  };
  return (
    <Modal visible={dialog != null} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.scrim}>
        <View style={styles.dialog}>
          <View style={styles.headRow}>
            <Text style={styles.headBig}>{dialog === 'join' ? 'Join by Code' : dialog === 'create' ? 'Create a Squad' : 'Discover Squads'}</Text>
            <Pressable onPress={close} accessibilityRole="button" accessibilityLabel="Close" hitSlop={8}>
              <Icon name="close" size={18} color={INK} />
            </Pressable>
          </View>
          {dialog === 'join' ? (
            <>
              <Text style={styles.dialogText}>Enter the code a classmate or teacher shared with you.</Text>
              <TextInput style={styles.input} value={code} onChangeText={(t) => {
                  setCode(t);
                  setError(null);
                }} placeholder="e.g. MATH-6K2Q" placeholderTextColor="#8A93A6" autoCapitalize="characters" autoFocus accessibilityLabel="Squad code" />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable style={styles.primary} onPress={join} accessibilityRole="button">
                <Text style={styles.primaryText}>Join Squad</Text>
              </Pressable>
            </>
          ) : dialog === 'create' ? (
            <>
              <Text style={styles.dialogText}>Squads have 5 to 8 learners and a teacher moderator. Your teacher approves new squads before anyone can join.</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Squad name, e.g. Biology Buddies" placeholderTextColor="#8A93A6" autoFocus accessibilityLabel="Squad name" />
              <Pressable
                style={[styles.primary, !name.trim() && styles.disabled]}
                disabled={!name.trim()}
                onPress={() => {
                  s.toast(`“${name.trim()}” sent to your teacher for approval`);
                  close();
                }}
                accessibilityRole="button">
                <Text style={styles.primaryText}>Ask My Teacher</Text>
              </Pressable>
            </>
          ) : (
            others.map((q) => (
              <Pressable
                key={q.id}
                style={styles.discover}
                onPress={() => {
                  close();
                  openSquad(q.id);
                }}
                accessibilityRole="link">
                <Image source={q.icon} style={styles.squadIcon} contentFit="contain" />
                <View style={styles.flex}>
                  <Text style={styles.squadNameOn}>{q.name}</Text>
                  <Text style={styles.statLabel}>{`${q.members.length} of 8 members • ${q.level} • ${q.subject}`}</Text>
                </View>
                <Icon name="chevronRight" size={14} color={BODY} />
              </Pressable>
            ))
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  side: { gap: 10 },
  panel: { gap: 4, padding: 12, borderRadius: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEFF6' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  brandIcon: { width: 40, height: 40 },
  brandText: { fontSize: 18, fontWeight: '700', color: NAVY },
  menuItem: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, borderRadius: 6 },
  menuOn: { backgroundColor: '#E6EEFC' },
  menuText: { fontSize: 13, color: '#2B3445' },
  menuTextOn: { fontWeight: '500', color: BLUE },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 6 },
  head: { fontSize: 13, fontWeight: '700', color: NAVY },
  headBig: { fontSize: 15, fontWeight: '700', color: NAVY },
  link: { fontSize: 11, color: BLUE },
  chip: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#DCE3EE', fontSize: 10, color: INK },
  squad: { height: 40, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 6, borderRadius: 6 },
  squadOn: { backgroundColor: '#E6EEFC' },
  squadIcon: { width: 30, height: 30 },
  squadName: { flex: 1, fontSize: 12, color: '#2B3445', letterSpacing: -0.15 },
  squadNameOn: { fontSize: 12, fontWeight: '600', color: NAVY, letterSpacing: -0.15 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  statIcon: { width: 32, height: 32 },
  statN: { fontSize: 16, fontWeight: '700', color: INK },
  statLabel: { fontSize: 10.5, color: BODY },
  action: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#EEF4FF' },
  actionText: { fontSize: 12, fontWeight: '500', color: BLUE },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(8,12,20,0.5)' },
  dialog: { width: '100%', maxWidth: 420, gap: 10, padding: 18, borderRadius: 14, backgroundColor: '#FFFFFF' },
  dialogText: { fontSize: 12.5, lineHeight: 18, color: BODY },
  input: { height: 42, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#DCE3EE', fontSize: 14, color: INK },
  error: { fontSize: 12, color: '#B91C1C' },
  primary: { height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#0B6BFF' },
  primaryText: { fontSize: 13.5, fontWeight: '600', color: '#FFFFFF' },
  disabled: { opacity: 0.45 },
  discover: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EEF1F6' },
});
