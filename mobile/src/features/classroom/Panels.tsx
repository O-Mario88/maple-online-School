import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Sheet } from '@/components/ui/Sheet';
import { Brand, CARD_SHADOW } from '@/features/public/palette';
import { filterParticipants, type ParticipantFilter, searchTranscript } from '@/lib/classroom';
import type { BoardSnapshot } from '@/lib/excalidraw-livekit';
import type { MockData } from '@/mock';

type Room = MockData['shared']['classroom'];
export type ChatMessage = Room['chat'][number];

function Count({ n, blue = false }: { n: number; blue?: boolean }) {
  return <Text style={[styles.count, blue && styles.countBlue]}>{String(n)}</Text>;
}

/** A white panel with a title row; used for every classroom panel. */
/** The reference's small square expand button on panel headers. */
export function ExpandButton({ boxed = false, onPress }: { boxed?: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.expand, boxed && styles.expandBoxed]} onPress={onPress} accessibilityRole="button" accessibilityLabel="Expand" hitSlop={6}>
      <Icon name="expand" size={14} color={Brand.ink} />
    </Pressable>
  );
}

export function Panel({ title, count, action, children, flat = false, expand = false }: { title: string; count?: number; action?: ReactNode; children: ReactNode; flat?: boolean; expand?: boolean }) {
  const [big, setBig] = useState(false);
  return (
    <View style={[styles.panel, flat && styles.flat]}>
      {expand ? (
        <Sheet visible={big} title={title} onClose={() => setBig(false)}>
          {children}
        </Sheet>
      ) : null}
      <View style={styles.head}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {count ? <Count n={count} /> : null}
        <View style={styles.flex} />
        {action}
        {expand ? <ExpandButton boxed onPress={() => setBig(true)} /> : null}
      </View>
      {children}
    </View>
  );
}

function Search({ value, onChange, placeholder, trailingIcon }: { value: string; onChange: (v: string) => void; placeholder: string; trailingIcon?: 'swap' }) {
  return (
    <View style={styles.search}>
      <Icon name="search" size={16} color={Brand.muted} />
      <TextInput style={styles.searchInput} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={Brand.muted} accessibilityLabel={placeholder} />
      {trailingIcon ? <Icon name={trailingIcon} size={15} color={Brand.muted} /> : null}
    </View>
  );
}

function Chips<T extends string>({ options, value, onChange }: { options: readonly { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Pressable key={o.value} style={[styles.chip, on && styles.chipOn]} onPress={() => onChange(o.value)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Text style={[styles.chipText, on && styles.chipTextOn]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The lesson notes: steps, the key point and today's worked examples (including saved board snapshots). */
export function NotesBody({
  room,
  snapshots = [],
  onSaveBoard,
}: {
  room: Room;
  snapshots?: readonly BoardSnapshot[];
  onSaveBoard?: () => void;
}) {
  const n = room.notes;
  const extraExamples = snapshots.flatMap((s) => s.workedExamples);
  return (
    <View style={styles.notes}>
      <Text style={styles.notesTitle}>{n.title}</Text>
      {n.steps.map((s) => (
        <Text key={s} style={styles.bullet}>{`•  ${s}`}</Text>
      ))}
      <View style={styles.keyPoint}>
        <Text style={styles.keyIcon}>💡</Text>
        <View style={styles.flex}>
          <Text style={styles.strong}>Key Point</Text>
          <Text style={styles.body}>{n.keyPoint}</Text>
        </View>
      </View>
      <View style={styles.examplesHeadRow}>
        <Text style={styles.notesSub}>Examples from Today</Text>
        {onSaveBoard ? (
          <Pressable
            style={styles.saveBoardChip}
            onPress={onSaveBoard}
            accessibilityRole="button"
            accessibilityLabel="Save Board to Notes">
            <Icon name="download" size={12} color={Brand.blue} />
            <Text style={styles.saveBoardChipText}>Save Board to Notes</Text>
          </Pressable>
        ) : null}
      </View>
      {n.examples.map((e) => (
        <Text key={e} style={styles.bullet}>{`•  ${e}`}</Text>
      ))}
      {extraExamples.map((e, idx) => (
        <Text key={`ex-${idx}-${e}`} style={[styles.bullet, styles.savedExampleBullet]}>{`•  ${e}`}</Text>
      ))}
      {snapshots.map((snap) => (
        <View key={snap.id} style={styles.snapshotCard}>
          <View style={styles.snapshotRow}>
            <Icon name="gallery" size={14} color={Brand.blue} />
            <Text style={styles.snapshotTitle}>{snap.title}</Text>
            <Text style={styles.muted}>{snap.createdAt}</Text>
          </View>
          <Text style={styles.snapshotSub}>
            Saved from the board ({snap.author}) · {snap.workedExamples[0]}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** The class chat, with a box to send a message. */
export function ChatBody({ messages, onSend }: { messages: readonly ChatMessage[]; onSend: (text: string) => void }) {
  const [draft, setDraft] = useState('');
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };
  return (
    <View style={styles.gap}>
      {messages.map((m, i) => (
        <View key={`${m.at}-${i}`} style={styles.message}>
          <Image source={m.photo} style={styles.face} contentFit="cover" />
          <View style={styles.flex}>
            <View style={styles.nameRow}>
              <Text style={styles.strong}>{m.who}</Text>
              {m.teacher ? (
                <View style={styles.verifiedDot}>
                  <Text style={styles.verifiedTick}>✓</Text>
                </View>
              ) : null}
              <Text style={styles.muted}>{m.at}</Text>
            </View>
            <Text style={styles.body}>{m.text}</Text>
          </View>
        </View>
      ))}
      <View style={styles.composeRow}>
        <View style={styles.compose}>
          <Icon name="plus" size={16} color={Brand.muted} />
          <TextInput style={styles.composeInput} value={draft} onChangeText={setDraft} onSubmitEditing={send} placeholder="Type a message..." placeholderTextColor={Brand.muted} accessibilityLabel="Message the class" />
          <Icon name="smile" size={17} color={Brand.muted} />
        </View>
        <Pressable style={styles.sendBtn} onPress={send} accessibilityRole="button" accessibilityLabel="Send">
          <Icon name="send" size={16} color={Brand.surface} />
        </Pressable>
      </View>
    </View>
  );
}

/** The live transcript, searchable. */
export function TranscriptBody({ room }: { room: Room }) {
  const [query, setQuery] = useState('');
  const lines = searchTranscript(room.transcript, query);
  return (
    <View style={styles.gap}>
      <Search value={query} onChange={setQuery} placeholder="Search transcript..." trailingIcon="swap" />
      {lines.length === 0 ? <Text style={styles.muted}>No lines match.</Text> : null}
      {lines.map((l) => (
        <View key={l.at} style={styles.line}>
          <Text style={styles.time}>{l.at}</Text>
          <Text style={[styles.body, styles.flex]}>
            {l.who ? <Text style={styles.strong}>{`${l.who}  `}</Text> : null}
            {l.text.startsWith('For example, ') ? (
              <>
                <Text style={styles.strong}>For example, </Text>
                {l.text.slice('For example, '.length)}
              </>
            ) : (
              l.text
            )}
          </Text>
        </View>
      ))}
    </View>
  );
}

type AssignmentFilter = 'all' | 'todo' | 'submitted';

/** Work set in this lesson, with Start buttons. */
export function AssignmentsBody({ room }: { room: Room }) {
  const [filter, setFilter] = useState<AssignmentFilter>('all');
  const total = room.assignments.length;
  const todo = room.assignments.filter((a) => a.status === 'todo').length;
  const shown = room.assignments.filter((a) => filter === 'all' || (filter === 'todo' ? a.status === 'todo' : a.status !== 'todo'));
  return (
    <View style={styles.gap}>
      <Chips<AssignmentFilter>
        options={[
          { value: 'all', label: `All (${total})` },
          { value: 'todo', label: `To Do (${todo})` },
          { value: 'submitted', label: `Submitted (${total - todo})` },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {shown.length === 0 ? <Text style={styles.muted}>Nothing here yet.</Text> : null}
      {shown.map((a) => (
        <View key={a.title} style={styles.assignment}>
          <View style={[styles.docIcon, { backgroundColor: a.soft }]}>
            <Icon name="book" size={22} color={a.tint} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.strong}>{a.title}</Text>
            <Text style={[styles.kind, { color: a.tint, backgroundColor: a.soft }]}>{a.kind}</Text>
            <Text style={styles.muted}>{a.due}</Text>
          </View>
          <Pressable style={styles.start} onPress={() => router.push('/learn/assignments')} accessibilityRole="button" accessibilityLabel={`Start ${a.title}`}>
            <Text style={styles.startText}>Start</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const MIC_ICON = { on: { icon: 'mic' as const, color: Brand.green }, off: { icon: 'mic' as const, color: Brand.muted }, muted: { icon: 'micOff' as const, color: Brand.live } };

/** Everyone in the class, searchable, filtered by All, Raised hand or Teachers, with per-student Allow Draw toggle. */
export function ParticipantsBody({
  room,
  myHand,
  allowedDrawers = [],
  onToggleAllowDraw,
}: {
  room: Room;
  myHand: boolean;
  allowedDrawers?: readonly string[];
  onToggleAllowDraw?: (studentName: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ParticipantFilter>('all');
  const people = filterParticipants(room.participants, query, filter);
  const hands = room.participants.filter((p) => p.hand).length + (myHand ? 1 : 0);
  const teachers = room.participants.filter((p) => p.role === 'teacher').length;
  return (
    <View style={styles.gap}>
      <Search value={query} onChange={setQuery} placeholder="Search participants..." />
      <Chips<ParticipantFilter>
        options={[
          { value: 'all', label: `All (${room.students})` },
          { value: 'hand', label: `Raised Hand (${hands})` },
          { value: 'teachers', label: `Teachers (${teachers})` },
        ]}
        value={filter}
        onChange={setFilter}
      />
      {people.map((p) => {
        const canDraw =
          p.role === 'student' &&
          allowedDrawers.some((n) => n.toLowerCase() === p.name.toLowerCase());
        return (
          <View key={p.name} style={styles.person}>
            <Image source={p.photo} style={styles.face} contentFit="cover" />
            <View style={styles.flex}>
              <View style={styles.nameRow}>
                <Text style={styles.strong}>{p.name}</Text>
                {p.role === 'teacher' ? (
                  <View style={styles.verifiedDot}>
                    <Text style={styles.verifiedTick}>✓</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.muted}>
                {canDraw ? `${p.note} · Drawing on Board` : p.note}
              </Text>
            </View>
            {p.role === 'student' && onToggleAllowDraw ? (
              <Pressable
                style={[styles.allowDrawBtn, canDraw && styles.allowDrawBtnOn]}
                onPress={() => onToggleAllowDraw(p.name)}
                accessibilityRole="button"
                accessibilityLabel={`Allow Draw for ${p.name}`}>
                <Text style={[styles.allowDrawText, canDraw && styles.allowDrawTextOn]}>
                  {canDraw ? 'Drawing ✏️' : 'Allow Draw'}
                </Text>
              </Pressable>
            ) : null}
            {p.hand ? <Text accessibilityLabel="Hand raised">✋</Text> : null}
            <Icon name={MIC_ICON[p.mic].icon} size={18} color={MIC_ICON[p.mic].color} />
            <Icon name="more" size={18} color={Brand.body} />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 12 },
  panel: { gap: 12, padding: 16, borderRadius: 14, backgroundColor: Brand.surface, ...CARD_SHADOW },
  flat: { borderRadius: 0, shadowOpacity: 0, elevation: 0, boxShadow: 'none' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 17, fontWeight: '800', color: Brand.ink },
  count: { fontSize: 11, fontWeight: '700', color: Brand.surface, backgroundColor: Brand.live, paddingHorizontal: 7, paddingVertical: 1, borderRadius: 999, overflow: 'hidden' },
  countBlue: { backgroundColor: Brand.blue },
  strong: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  body: { fontSize: 13, lineHeight: 19, color: Brand.body },
  muted: { fontSize: 11, fontWeight: '400', color: Brand.muted },
  search: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 38, paddingHorizontal: 12, borderRadius: 8, backgroundColor: Brand.canvas },
  searchInput: { flex: 1, fontSize: 13, color: Brand.ink, minHeight: 36 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, backgroundColor: Brand.canvas },
  chipOn: { backgroundColor: Brand.blueSoft },
  chipText: { fontSize: 12, color: Brand.body },
  chipTextOn: { color: Brand.blue, fontWeight: '600' },
  notes: { gap: 8 },
  notesTitle: { fontSize: 17, fontWeight: '800', color: Brand.ink },
  notesSub: { fontSize: 16, fontWeight: '800', color: Brand.ink, marginTop: 6 },
  bullet: { fontSize: 14, lineHeight: 22, color: Brand.body },
  keyPoint: { flexDirection: 'row', gap: 10, padding: 14, borderRadius: 10, backgroundColor: '#FFF7E6', marginTop: 6 },
  keyIcon: { fontSize: 22 },
  message: { flexDirection: 'row', gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  verifiedDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  verifiedTick: { fontSize: 9, fontWeight: '800', color: Brand.surface },
  face: { width: 32, height: 32, borderRadius: 16 },
  composeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compose: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: Brand.line },
  composeInput: { flex: 1, fontSize: 13, color: Brand.ink, minHeight: 38 },
  sendBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', gap: 12 },
  time: { width: 40, fontSize: 12, color: Brand.muted, fontVariant: ['tabular-nums'] },
  assignment: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docIcon: { width: 46, height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  kind: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '600', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4, overflow: 'hidden', marginVertical: 2 },
  start: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8, backgroundColor: Brand.blue },
  startText: { fontSize: 13, fontWeight: '700', color: Brand.surface },
  person: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  examplesHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  saveBoardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: Brand.blueSoft,
  },
  saveBoardChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Brand.blue,
  },
  savedExampleBullet: {
    color: Brand.blue,
    fontWeight: '600',
  },
  snapshotCard: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#F0F6FF',
    gap: 3,
    marginTop: 4,
  },
  snapshotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  snapshotTitle: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: Brand.ink,
  },
  snapshotSub: {
    fontSize: 11.5,
    color: Brand.body,
  },
  allowDrawBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Brand.line,
    backgroundColor: Brand.canvas,
  },
  allowDrawBtnOn: {
    borderColor: '#86EFAC',
    backgroundColor: '#DCFCE7',
  },
  allowDrawText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: Brand.ink,
  },
  allowDrawTextOn: {
    color: '#15803D',
    fontWeight: '700',
  },
  expand: { width: 28, height: 28, marginLeft: 8, alignItems: 'center', justifyContent: 'center' },
  expandBoxed: { borderRadius: 7, borderWidth: 1, borderColor: Brand.line },
});
