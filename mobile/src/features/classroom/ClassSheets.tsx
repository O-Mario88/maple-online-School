import { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Sheet, SheetButton } from '@/components/ui/Sheet';
import { Brand } from '@/features/public/palette';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

type Room = MockData['shared']['classroom'];
/** Rail items that open in a sheet rather than the side panel. */
export type SheetRail = 'resources' | 'polls' | 'rooms' | 'recording';
export const isSheetRail = (key: string): key is SheetRail => key === 'resources' || key === 'polls' || key === 'rooms' || key === 'recording';
export type ClassLayout = 'full' | 'focus';

function Poll({ poll }: { poll: Room['poll'] }) {
  const [vote, setVote] = useState<number | null>(null);
  const votes = poll.votes.map((v, i) => v + (vote === i ? 1 : 0));
  const total = votes.reduce((a, b) => a + b, 0);
  return (
    <>
      <Text style={styles.strong}>{poll.question}</Text>
      {poll.options.map((o, i) => {
        const pct = Math.round((votes[i] / total) * 100);
        return (
          <Pressable key={o} style={[styles.option, vote === i && styles.optionOn]} disabled={vote != null} onPress={() => setVote(i)} accessibilityRole="radio" accessibilityState={{ checked: vote === i, disabled: vote != null }}>
            {vote != null ? <View style={[styles.bar, { width: `${pct}%` }]} /> : null}
            <Text style={[styles.body, styles.flex]}>{o}</Text>
            {vote != null ? <Text style={styles.strong}>{`${pct}%`}</Text> : null}
          </Pressable>
        );
      })}
      <Text style={styles.muted}>{vote == null ? 'Tap an answer to vote. Results show after you vote.' : `Thanks for voting · ${total} votes`}</Text>
    </>
  );
}

const TITLES: Readonly<Record<SheetRail, string>> = { resources: 'Class resources', polls: 'Live poll', rooms: 'Breakout rooms', recording: 'Recording' };

/** Resources, the live poll, breakout rooms and the recording notice, opened from the classroom rail. */
export function RailSheet({ rail, room, onClose }: { rail: SheetRail | null; room: Room; onClose: () => void }) {
  return (
    <Sheet visible={rail != null} title={rail ? TITLES[rail] : ''} onClose={onClose}>
      {rail === 'resources'
        ? room.resources.map((r) => (
            <Pressable key={r.title} style={styles.option} onPress={() => toast(`${r.title} saved for offline study`)} accessibilityRole="button" accessibilityLabel={`Download ${r.title}`}>
              <Icon name="download" size={18} color={Brand.blue} />
              <View style={styles.flex}>
                <Text style={styles.strong}>{r.title}</Text>
                <Text style={styles.muted}>{r.meta}</Text>
              </View>
            </Pressable>
          ))
        : null}
      {rail === 'polls' ? <Poll poll={room.poll} /> : null}
      {rail === 'rooms' ? (
        <>
          <Text style={styles.body}>Your teacher opens breakout rooms during the class. You will be moved to your room automatically.</Text>
          {room.rooms.map((r) => (
            <View key={r.name} style={styles.option}>
              <Icon name="rooms" size={18} color={Brand.blue} />
              <Text style={[styles.body, styles.flex]}>{r.name}</Text>
              <Text style={styles.muted}>{`${r.members} learners`}</Text>
            </View>
          ))}
        </>
      ) : null}
      {rail === 'recording' ? (
        <View style={styles.option}>
          <Icon name="record" size={18} color={Brand.live} />
          <Text style={[styles.body, styles.flex]}>{room.recording}</Text>
        </View>
      ) : null}
      <SheetButton label="Back to class" onPress={onClose} />
    </Sheet>
  );
}

const LAYOUTS: readonly { key: ClassLayout; title: string; body: string }[] = [
  { key: 'full', title: 'Full classroom', body: 'Board, side panel and the four panels below.' },
  { key: 'focus', title: 'Board focus', body: 'Only the teacher and board, as large as possible.' },
];

/** Choose between the full classroom and a board-only focus view. */
export function LayoutSheet({ visible, layout, onPick, onClose }: { visible: boolean; layout: ClassLayout; onPick: (l: ClassLayout) => void; onClose: () => void }) {
  return (
    <Sheet visible={visible} title="Layout" onClose={onClose}>
      {LAYOUTS.map((c) => (
        <Pressable
          key={c.key}
          style={[styles.option, layout === c.key && styles.optionOn]}
          onPress={() => {
            onPick(c.key);
            onClose();
          }}
          accessibilityRole="radio"
          accessibilityState={{ checked: layout === c.key }}>
          <View style={styles.flex}>
            <Text style={styles.strong}>{c.title}</Text>
            <Text style={styles.muted}>{c.body}</Text>
          </View>
          {layout === c.key ? <Icon name="check" size={18} color={Brand.blue} /> : null}
        </Pressable>
      ))}
    </Sheet>
  );
}

const SETTINGS = [
  { key: 'captions', title: 'Live captions', body: 'Show what the teacher says as text.' },
  { key: 'saver', title: 'Data saver', body: 'Lower video quality to use less mobile data.' },
  { key: 'noise', title: 'Noise suppression', body: 'Filter background noise from your microphone.' },
] as const;
type SettingKey = (typeof SETTINGS)[number]['key'];

/** Captions, data saver and noise suppression for this class. */
export function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [on, setOn] = useState<Readonly<Record<SettingKey, boolean>>>({ captions: true, saver: false, noise: true });
  return (
    <Sheet visible={visible} title="Class settings" onClose={onClose}>
      {SETTINGS.map((s) => (
        <View key={s.key} style={styles.option}>
          <View style={styles.flex}>
            <Text style={styles.strong}>{s.title}</Text>
            <Text style={styles.muted}>{s.body}</Text>
          </View>
          <Switch value={on[s.key]} onValueChange={(v) => setOn((o) => ({ ...o, [s.key]: v }))} accessibilityLabel={s.title} />
        </View>
      ))}
      <SheetButton primary label="Done" onPress={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  strong: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  body: { fontSize: 13.5, lineHeight: 20, color: Brand.body },
  muted: { fontSize: 12, color: Brand.muted },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Brand.line, overflow: 'hidden' },
  optionOn: { borderColor: Brand.blue, backgroundColor: Brand.blueSoft },
  bar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: Brand.blueSoft },
});
