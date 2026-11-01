import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Sheet, SheetButton } from '@/components/ui/Sheet';
import { Brand } from '@/features/public/palette';
import type { BoardSnapshot } from '@/lib/excalidraw-livekit';
import type { IconName } from '@/lib/icons';
import { saveText } from '@/lib/save-text';
import type { MockData } from '@/mock';

import { NotesBody } from './Panels';

type Room = MockData['shared']['classroom'];
type Style = 'bold' | 'italic' | 'underline';

/** The teacher's notes as plain text, for downloading. */
function notesText(n: Room['notes'], snapshots: readonly BoardSnapshot[] = []): string {
  const extra = snapshots.flatMap((s) => s.workedExamples);
  return [
    n.title,
    '',
    ...n.steps.map((s) => `• ${s}`),
    '',
    `Key point: ${n.keyPoint}`,
    '',
    'Examples from today',
    ...[...n.examples, ...extra].map((e) => `• ${e}`),
  ].join('\n');
}

const INSERTS: readonly { icon: IconName; label: string; text: string }[] = [
  { icon: 'list', label: 'Bulleted line', text: '\n• ' },
  { icon: 'notes', label: 'Numbered line', text: '\n1. ' },
  { icon: 'grid', label: 'To-do box', text: '\n☐ ' },
];

/** The side panel's notes: the teacher's Lesson Notes, or the learner's own notes with a small formatting toolbar. */
export function NotesPanel({
  room,
  snapshots = [],
  onSaveBoard,
}: {
  room: Room;
  snapshots?: readonly BoardSnapshot[];
  onSaveBoard?: () => void;
}) {
  const [mine, setMine] = useState(false);
  const [text, setText] = useState('');
  const [style, setStyle] = useState<Readonly<Record<Style, boolean>>>({ bold: false, italic: false, underline: false });
  const [menu, setMenu] = useState(false);
  const [big, setBig] = useState(false);
  const flip = (k: Style) => setStyle((s) => ({ ...s, [k]: !s[k] }));
  const download = () => {
    setMenu(false);
    saveText(mine ? 'my-class-notes.txt' : 'lesson-notes.txt', mine ? text : notesText(room.notes, snapshots));
  };

  const editor = (
    <TextInput
      style={[styles.input, style.bold && styles.bold, style.italic && styles.italic, style.underline && styles.underline]}
      value={text}
      onChangeText={setText}
      multiline
      placeholder="Write your own notes for this class"
      placeholderTextColor="#8A92A3"
      accessibilityLabel="My notes"
    />
  );

  return (
    <>
      <View style={styles.head}>
        <Text style={styles.heading}>{mine ? 'My Notes' : 'Lesson Notes'}</Text>
        <View style={styles.actions}>
          <Pressable style={styles.chip} onPress={() => setMine(!mine)} accessibilityRole="button" accessibilityLabel={mine ? 'Show lesson notes' : 'Show my notes'}>
            <Text style={styles.chipText}>{mine ? 'Lesson Notes ⌄' : 'My Notes ⌄'}</Text>
          </Pressable>
          <Pressable style={styles.more} onPress={() => setMenu(true)} accessibilityRole="button" accessibilityLabel="More note options">
            <Text style={styles.moreText}>•••</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.toolbar} accessibilityRole="toolbar">
        {(['bold', 'italic', 'underline'] as const).map((k) => (
          <Pressable key={k} onPress={() => flip(k)} disabled={!mine} hitSlop={6} accessibilityRole="button" accessibilityLabel={k} accessibilityState={{ selected: style[k], disabled: !mine }}>
            <Text style={[styles.tool, styles[k], style[k] && styles.toolOn, !mine && styles.toolOff]}>{k[0].toUpperCase()}</Text>
          </Pressable>
        ))}
        {INSERTS.map((t) => (
          <Pressable key={t.label} onPress={() => setText((v) => v + t.text)} disabled={!mine} hitSlop={6} accessibilityRole="button" accessibilityLabel={t.label}>
            <Icon name={t.icon} size={17} color={mine ? Brand.ink : Brand.muted} />
          </Pressable>
        ))}
        <View style={styles.flex} />
        <Pressable onPress={() => setBig(true)} hitSlop={6} accessibilityRole="button" accessibilityLabel="Expand notes">
          <Icon name="expand" size={15} color={Brand.ink} />
        </Pressable>
      </View>
      {mine ? editor : <NotesBody room={room} snapshots={snapshots} onSaveBoard={onSaveBoard} />}
      <Sheet visible={big} title={mine ? 'My Notes' : 'Lesson Notes'} onClose={() => setBig(false)}>
        {mine ? editor : <NotesBody room={room} snapshots={snapshots} onSaveBoard={onSaveBoard} />}
      </Sheet>
      <Sheet visible={menu} title="Notes" onClose={() => setMenu(false)}>
        <SheetButton primary label={mine ? 'Download my notes' : 'Download lesson notes'} onPress={download} />
        {mine ? (
          <SheetButton
            label="Clear my notes"
            onPress={() => {
              setText('');
              setMenu(false);
            }}
          />
        ) : null}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heading: { fontSize: 17, fontWeight: '800', color: Brand.ink },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  chipText: { fontSize: 12, fontWeight: '600', color: Brand.ink },
  more: { paddingHorizontal: 9, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  moreText: { fontSize: 11, fontWeight: '800', color: Brand.ink },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 22, marginTop: 14, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  tool: { fontSize: 16, color: Brand.ink },
  toolOn: { color: Brand.blue },
  toolOff: { color: Brand.muted },
  bold: { fontWeight: '800' },
  italic: { fontStyle: 'italic', fontFamily: 'Georgia' },
  underline: { textDecorationLine: 'underline' },
  input: { minHeight: 180, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: Brand.line, fontSize: 14, lineHeight: 21, color: Brand.ink, textAlignVertical: 'top' },
});
