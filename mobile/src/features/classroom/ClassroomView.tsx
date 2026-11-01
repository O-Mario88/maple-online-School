import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClassRail, type RailItem, type RailKey } from '@/features/classroom/ClassRail';
import { type ClassLayout, isSheetRail, RailSheet, type SheetRail } from '@/features/classroom/ClassSheets';
import { ClassroomTopBar } from '@/features/classroom/ClassroomTopBar';
import { NotesPanel } from '@/features/classroom/NotesPanel';
import {
  AssignmentsBody,
  type ChatMessage,
  ChatBody,
  NotesBody,
  Panel,
  ParticipantsBody,
  TranscriptBody,
} from '@/features/classroom/Panels';
import { Stage } from '@/features/classroom/Stage';
import { Brand } from '@/features/public/palette';
import { LightOnly } from '@/hooks/use-theme';
import {
  type BoardSnapshot,
  type ExcalidrawDeltaPacket,
  type ExcalidrawElement,
  exportBoardSnapshot,
  INITIAL_FRACTION_ELEMENTS,
} from '@/lib/excalidraw-livekit';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

const CLASSROOM_WIDE = 1100;
const SIDE = 400;

type SideTab = 'chat' | 'notes' | 'transcript' | 'assignments' | 'people';
type Room = MockData['shared']['classroom'];

const NO_DRAWERS: readonly string[] = [];

/**
 * Active live lesson / bootcamp interface (designed for a LiveKit room; not connected yet):
 * Teacher stage, participant video strip, dark left rail, Lesson Notes / Chat / Transcript / Assignments side panel, and 4 bottom panels.
 */
export function ClassroomView({ room }: { room: Room }) {
  const { width } = useWindowDimensions();
  const wide = width >= CLASSROOM_WIDE;
  const [messages, setMessages] = useState<readonly ChatMessage[]>(() => room.chat);
  const [hand, setHand] = useState(false);
  const [rail, setRail] = useState<RailKey>('class');
  const [tab, setTab] = useState<SideTab>('notes');
  const [layout, setLayout] = useState<ClassLayout>('full');
  const [sheet, setSheet] = useState<SheetRail | null>(null);
  const [teacherOnly, setTeacherOnly] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>(INITIAL_FRACTION_ELEMENTS);
  const [packets, setPackets] = useState<readonly ExcalidrawDeltaPacket[]>([]);
  // Only the teacher grants drawing; in the learner's view nobody else has been given the pen yet.
  const allowedDrawers: readonly string[] = NO_DRAWERS;
  const [snapshots, setSnapshots] = useState<readonly BoardSnapshot[]>([]);

  const handleSaveBoardQuick = () => {
    const snap = exportBoardSnapshot(
      elements,
      'png',
      'Fractions: Worked Board Snapshot',
      allowedDrawers[0] ?? room.teacher,
    );
    setSnapshots((prev) => [...prev, snap]);
    setTab('notes');
    toast('Board saved to your lesson notes.');
  };

  const me = room.participants[0];
  const send = (text: string) =>
    setMessages((m) => [
      ...m,
      {
        who: 'You',
        at: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
        text,
        photo: me.photo,
        teacher: false,
      },
    ]);
  const chatCount = room.chatCount + (messages.length - room.chat.length);

  const railItems: RailItem[] = [
    { key: 'class', label: 'Class', icon: 'live' },
    { key: 'participants', label: 'Participants', icon: 'people', count: room.students },
    { key: 'chat', label: 'Chat', icon: 'chat', count: chatCount },
    { key: 'notes', label: 'Notes', icon: 'notes' },
    { key: 'transcript', label: 'Transcript', icon: 'transcript' },
    { key: 'assignments', label: 'Assignments', icon: 'clipboard', count: room.assignments.length },
    { key: 'resources', label: 'Resources', icon: 'calendar' },
    { key: 'polls', label: 'Polls', icon: 'poll' },
    { key: 'rooms', label: 'Breakout Rooms', icon: 'grid' },
    { key: 'recording', label: 'Recording', icon: 'play' },
  ];

  const selectRail = (key: RailKey) => {
    setRail(key);
    if (isSheetRail(key)) setSheet(key);
    if (key === 'class') setLayout('full');
    if (key === 'chat' || key === 'notes' || key === 'transcript' || key === 'assignments') setTab(key);
    if (key === 'participants') setTab('people');
  };

  const tabs: { key: SideTab; label: string; count?: number }[] = [
    { key: 'chat', label: 'Chat', count: chatCount },
    { key: 'notes', label: 'Notes' },
    { key: 'transcript', label: 'Transcript' },
    { key: 'assignments', label: 'Assignments', count: room.assignments.length },
    ...(wide ? [] : [{ key: 'people' as const, label: 'People', count: room.students }]),
  ];

  const body: Record<SideTab, ReactNode> = {
    chat: <ChatBody messages={messages} onSend={send} />,
    notes: <NotesBody room={room} snapshots={snapshots} onSaveBoard={handleSaveBoardQuick} />,
    transcript: <TranscriptBody room={room} />,
    assignments: <AssignmentsBody room={room} />,
    people: (
      <ParticipantsBody
        room={room}
        myHand={hand}
        allowedDrawers={allowedDrawers}
      />
    ),
  };

  const sideTabs = (
    <View style={styles.tabs} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.key === tab;
        return (
          <Pressable
            key={t.key}
            style={[styles.tab, on && styles.tabOn]}
            onPress={() => setTab(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}>
            <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
            {t.count ? <Text style={styles.tabCount}>{String(t.count)}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );

  const stage = (
    <Stage
      photo={room.stage}
      teacher={room.teacher}
      teacherAvatar={me.photo}
      tiles={room.tiles}
      others={room.students - room.tiles.length}
      hand={hand}
      onHand={() => setHand((h) => !h)}
      compact={!wide}
      whiteboardOpen={whiteboardOpen}
      onToggleWhiteboard={() => setWhiteboardOpen((v) => !v)}
      elements={elements}
      onChangeElements={(next, pkt) => {
        setElements(next);
        if (pkt) setPackets((prev) => [...prev, pkt]);
      }}
      viewModeEnabled={allowedDrawers.length === 0}
      activeDrawerName={allowedDrawers[allowedDrawers.length - 1] ?? room.teacher}
      onSaveSnapshot={(snap) => {
        setSnapshots((prev) => [...prev, snap]);
        setTab('notes');
      }}
      packets={packets}
    />
  );

  return (
    <LightOnly>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ClassroomTopBar
          title={room.title}
          board={room.board}
          students={room.students}
          teacher={room.teacher}
          teacherPhoto={me.photo}
          startSeconds={room.elapsedSeconds}
          lengthSeconds={room.lengthSeconds}
          wide={wide}
          layout={layout}
          onLayout={setLayout}
        />
        <RailSheet
          rail={sheet}
          room={room}
          onClose={() => {
            setSheet(null);
            setRail('class');
          }}
        />
        <ScrollView style={styles.flex} contentContainerStyle={styles.page}>
          {layout === 'focus' ? (
            <View style={styles.focus}>{stage}</View>
          ) : wide ? (
            <>
              <View style={styles.top}>
                <ClassRail items={railItems} active={rail} onSelect={selectRail} />
                <View style={styles.center}>{stage}</View>
                <View style={styles.side}>
                  {sideTabs}
                  <View style={styles.sideBody}>
                    {tab === 'notes' ? (
                      <NotesPanel
                        room={room}
                        snapshots={snapshots}
                        onSaveBoard={handleSaveBoardQuick}
                      />
                    ) : (
                      body[tab]
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.bottom}>
                <View style={styles.flex}>
                  <Panel title={`Participants (${room.students})`} expand>
                    <ParticipantsBody
                      room={room}
                      myHand={hand}
                      allowedDrawers={allowedDrawers}
                    />
                  </Panel>
                </View>
                <View style={styles.flex}>
                  <Panel
                    title="Chat"
                    count={chatCount}
                    expand
                    action={
                      <Pressable
                        onPress={() => setTeacherOnly(!teacherOnly)}
                        accessibilityRole="button"
                        accessibilityLabel={`Send to ${teacherOnly ? 'the teacher only' : 'everyone'}. Change`}>
                        <Text style={styles.everyone}>
                          {teacherOnly ? 'Teacher only ⌄' : 'Everyone ⌄'}
                        </Text>
                      </Pressable>
                    }>
                    <ChatBody messages={messages} onSend={send} />
                  </Panel>
                </View>
                <View style={styles.flex}>
                  <Panel title="Transcript" expand>
                    <TranscriptBody room={room} />
                  </Panel>
                </View>
                <View style={styles.flex}>
                  <Panel
                    title="Assignments"
                    count={room.assignments.length}
                    action={
                      <Pressable
                        onPress={() => router.push('/learn/assignments')}
                        accessibilityRole="button"
                        accessibilityLabel="All my assignments">
                        <Text style={styles.newBtn}>＋ New</Text>
                      </Pressable>
                    }>
                    <AssignmentsBody room={room} />
                  </Panel>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.narrow}>
              {stage}
              {sideTabs}
              <View style={styles.narrowBody}>{body[tab]}</View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  flex: { flex: 1 },
  page: { backgroundColor: Brand.canvas, paddingBottom: 24 },
  top: { flexDirection: 'row', alignItems: 'stretch', gap: 10, backgroundColor: Brand.canvas },
  center: { flex: 1, paddingVertical: 10 },
  side: {
    width: SIDE,
    marginVertical: 10,
    marginRight: 10,
    borderRadius: 14,
    backgroundColor: Brand.surface,
    overflow: 'hidden',
  },
  sideBody: { padding: 18, gap: 12 },
  everyone: {
    fontSize: 12,
    fontWeight: '600',
    color: Brand.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Brand.line,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderBottomWidth: 1,
    borderBottomColor: Brand.line,
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabOn: { borderBottomColor: Brand.blue },
  tabText: { fontSize: 14, fontWeight: '600', color: Brand.ink },
  tabTextOn: { color: Brand.blue },
  tabCount: {
    fontSize: 10,
    fontWeight: '700',
    color: Brand.surface,
    backgroundColor: Brand.live,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  bottom: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 10, paddingTop: 2 },
  newBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: Brand.surface,
    backgroundColor: Brand.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  narrow: { gap: 12, padding: 12 },
  focus: { padding: 12 },
  narrowBody: { padding: 14, borderRadius: 14, backgroundColor: Brand.surface },
});
