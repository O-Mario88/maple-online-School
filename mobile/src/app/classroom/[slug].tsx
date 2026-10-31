import { router, useLocalSearchParams } from 'expo-router';
import { type ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState } from '@/components/ui';
import { ClassRail, type RailItem, type RailKey } from '@/features/classroom/ClassRail';
import { ClassroomTopBar } from '@/features/classroom/ClassroomTopBar';
import { AssignmentsBody, type ChatMessage, ChatBody, NotesBody, Panel, ParticipantsBody, TranscriptBody } from '@/features/classroom/Panels';
import { Stage } from '@/features/classroom/Stage';
import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

/** Width from which the classroom shows the rail, the side panel and the four panels in a row. */
const CLASSROOM_WIDE = 1100;
const SIDE = 400;

type SideTab = 'chat' | 'notes' | 'transcript' | 'assignments' | 'people';

/** Inventory 25: the live classroom: teacher on stage, everyone in the class, chat, notes, transcript and work. */
export default function ClassroomScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= CLASSROOM_WIDE;
  const room = mock?.shared.classroom;
  const [messages, setMessages] = useState<readonly ChatMessage[]>(() => room?.chat ?? []);
  const [hand, setHand] = useState(false);
  const [rail, setRail] = useState<RailKey>('class');
  const [tab, setTab] = useState<SideTab>('notes');

  if (!mock || !room) return <PreviewScreen title="Live class">{() => null}</PreviewScreen>;
  if (slug !== room.slug) {
    return (
      <LightOnly>
        <EmptyState icon="live" title="This class isn't live" body="It may have ended. Check your timetable for the next one." action={<Button label="Go home" variant="secondary" compact onPress={() => router.replace('/')} />} />
      </LightOnly>
    );
  }

  const me = room.participants[0];
  const send = (text: string) =>
    setMessages((m) => [...m, { who: 'You', at: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), text, photo: me.photo, teacher: false }]);
  const chatCount = room.chatCount + (messages.length - room.chat.length);

  const railItems: RailItem[] = [
    { key: 'class', label: 'Class', icon: 'live' },
    { key: 'participants', label: 'Participants', icon: 'people', count: room.students },
    { key: 'chat', label: 'Chat', icon: 'chat', count: chatCount },
    { key: 'notes', label: 'Notes', icon: 'notes' },
    { key: 'transcript', label: 'Transcript', icon: 'transcript' },
    { key: 'assignments', label: 'Assignments', icon: 'book', count: room.assignments.length },
    { key: 'resources', label: 'Resources', icon: 'folder' },
    { key: 'polls', label: 'Polls', icon: 'poll' },
    { key: 'rooms', label: 'Breakout Rooms', icon: 'rooms' },
    { key: 'recording', label: 'Recording', icon: 'record' },
  ];
  const selectRail = (key: RailKey) => {
    setRail(key);
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
    notes: <NotesBody room={room} />,
    transcript: <TranscriptBody room={room} />,
    assignments: <AssignmentsBody room={room} />,
    people: <ParticipantsBody room={room} myHand={hand} />,
  };
  const sideTabs = (
    <View style={styles.tabs} accessibilityRole="tablist">
      {tabs.map((t) => {
        const on = t.key === tab;
        return (
          <Pressable key={t.key} style={[styles.tab, on && styles.tabOn]} onPress={() => setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
            {t.count ? <Text style={styles.tabCount}>{String(t.count)}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
  const stage = <Stage photo={room.stage} teacher={room.teacher} tiles={room.tiles} others={room.students - room.tiles.length} hand={hand} onHand={() => setHand((h) => !h)} compact={!wide} />;

  return (
    <LightOnly>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ClassroomTopBar title={room.title} board={room.board} students={room.students} teacher={room.teacher} startSeconds={room.elapsedSeconds} lengthSeconds={room.lengthSeconds} wide={wide} />
        <ScrollView style={styles.flex} contentContainerStyle={styles.page}>
          {wide ? (
            <>
              <View style={styles.top}>
                <ClassRail items={railItems} active={rail} onSelect={selectRail} />
                <View style={styles.center}>{stage}</View>
                <View style={styles.side}>
                  {sideTabs}
                  <View style={styles.sideBody}>
                    {tab === 'notes' ? (
                      <>
                        <View style={styles.notesHead}>
                          <Text style={styles.notesHeading}>Lesson Notes</Text>
                          <View style={styles.notesActions}>
                            <Text style={styles.myNotes}>My Notes ⌄</Text>
                            <Text style={styles.moreBtn}>•••</Text>
                          </View>
                        </View>
                        <View style={styles.toolbar} accessibilityRole="toolbar">
                          <Text style={[styles.tool, styles.toolBold]}>B</Text>
                          <Text style={[styles.tool, styles.toolItalic]}>I</Text>
                          <Text style={[styles.tool, styles.toolUnderline]}>U</Text>
                          <Icon name="list" size={17} color={Brand.ink} />
                          <Icon name="notes" size={17} color={Brand.ink} />
                          <Icon name="grid" size={17} color={Brand.ink} />
                          <View style={styles.flex} />
                          <Icon name="expand" size={15} color={Brand.ink} />
                        </View>
                      </>
                    ) : null}
                    {body[tab]}
                  </View>
                </View>
              </View>
              <View style={styles.bottom}>
                <View style={styles.flex}>
                  <Panel title={`Participants (${room.students})`} expand>
                    <ParticipantsBody room={room} myHand={hand} />
                  </Panel>
                </View>
                <View style={styles.flex}>
                  <Panel title="Chat" count={chatCount} expand action={<Text style={styles.everyone}>Everyone ⌄</Text>}>
                    <ChatBody messages={messages} onSend={send} />
                  </Panel>
                </View>
                <View style={styles.flex}>
                  <Panel title="Transcript" expand>
                    <TranscriptBody room={room} />
                  </Panel>
                </View>
                <View style={styles.flex}>
                  <Panel title="Assignments" count={room.assignments.length} action={<Text style={styles.newBtn}>＋ New</Text>}>
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
  side: { width: SIDE, marginVertical: 10, marginRight: 10, borderRadius: 14, backgroundColor: Brand.surface, overflow: 'hidden' },
  sideBody: { padding: 18, gap: 12 },
  notesHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notesHeading: { fontSize: 17, fontWeight: '800', color: Brand.ink },
  notesActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moreBtn: { fontSize: 11, fontWeight: '800', color: Brand.ink, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 22, marginTop: 14, marginBottom: 4, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  tool: { fontSize: 16, color: Brand.ink },
  toolBold: { fontWeight: '800' },
  toolItalic: { fontStyle: 'italic', fontFamily: 'Georgia' },
  toolUnderline: { textDecorationLine: 'underline' },
  everyone: { fontSize: 12, fontWeight: '600', color: Brand.ink, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  myNotes: { fontSize: 12, fontWeight: '600', color: Brand.ink, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: Brand.line, paddingHorizontal: 8 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabOn: { borderBottomColor: Brand.blue },
  tabText: { fontSize: 14, fontWeight: '600', color: Brand.ink },
  tabTextOn: { color: Brand.blue },
  tabCount: { fontSize: 10, fontWeight: '700', color: Brand.surface, backgroundColor: Brand.live, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 999, overflow: 'hidden' },
  bottom: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 10, paddingTop: 2 },
  newBtn: { fontSize: 13, fontWeight: '700', color: Brand.surface, backgroundColor: Brand.blue, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, overflow: 'hidden' },
  narrow: { gap: 12, padding: 12 },
  narrowBody: { padding: 14, borderRadius: 14, backgroundColor: Brand.surface },
});
