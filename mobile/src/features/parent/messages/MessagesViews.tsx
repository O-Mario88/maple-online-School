import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ParentDesk, ParentPhoneTop } from '@/features/portal/PortalFrame';
import { Btn, Card, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, CANVAS, LINE, MUTED, NAVY, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import { PAGE_TITLE } from '@/lib/fonts/type';
import type { ChatMessage, ParentPortal, Thread } from '@/mock/portal';

import {
  AnnouncementsCard,
  BookingCard,
  ChatPane,
  HelpCard,
  MESSAGE_TABS,
  MeetingsCard,
  type MessageTab,
  TeachersCard,
  ThreadRow,
  threadsFor,
} from './MessagesParts';

/** The conversation state both layouts share: the open thread, the tab, and what's been said in each. */
function useInbox(m: ParentPortal['messages']) {
  const [tab, setTab] = useState<MessageTab>('All');
  const [openId, setOpenId] = useState(m.threads[0].id);
  const [sent, setSent] = useState<Readonly<Record<string, readonly ChatMessage[]>>>({});
  const open = m.threads.find((t) => t.id === openId) ?? m.threads[0];
  const chatFor = (t: Thread): readonly ChatMessage[] => {
    const base: readonly ChatMessage[] = t.id === 'sarah' ? m.chat : [{ from: 'teacher', text: t.previewLong.replace(/\.\.\.$/, '.'), time: t.time }];
    return [...base, ...(sent[t.id] ?? [])];
  };
  const send = (t: Thread, text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    setSent((prev) => ({ ...prev, [t.id]: [...(prev[t.id] ?? []), { from: 'me', text, time }] }));
  };
  const openByName = (name: string) => {
    const t = m.threads.find((x) => x.name === name);
    if (t) setOpenId(t.id);
  };
  return { tab, setTab: (t: string) => setTab(t as MessageTab), open, setOpenId, chatFor, send, openByName, list: threadsFor(m.threads, tab) };
}

/** Audited Parent–Teacher Messaging & Meeting Booker on the desktop reference. */
export function MessagesDesk({ p }: { p: ParentPortal }) {
  const m = p.messages;
  const inbox = useInbox(m);
  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? inbox.list.filter((t) => `${t.name} ${t.subject ?? ''} ${t.child ?? ''} ${t.previewLong}`.toLowerCase().includes(q)) : inbox.list;
  }, [inbox.list, query]);
  return (
    <ParentDesk list={p.children} me={p.me} search="Search messages, teachers, or announcements..." active="Messages">
      <Text style={styles.title} {...PAGE_TITLE}>
        Messages
      </Text>
      <Text style={styles.subtitle}>{"Communicate with your child's teachers, receive school announcements, and book meetings."}</Text>
      <View style={styles.row}>
        <Card style={[styles.inbox, styles.colInbox]}>
          <View style={styles.inboxTabs}>
            <UnderTabs items={MESSAGE_TABS} active={inbox.tab} onChange={inbox.setTab} size={16} style={styles.tabs} />
            <Btn label="New Message" icon="plus" onPress={() => toast('Pick a teacher from the Teachers list below to start a message.')} height={48} style={styles.newBtn} />
          </View>
          <View style={styles.panes}>
            <View style={styles.listPane}>
              <View style={styles.searchRow}>
                <View style={styles.search}>
                  <Icon name="search" size={19} color={BODY} />
                  <TextInput style={styles.searchInput} value={query} onChangeText={setQuery} placeholder="Search messages..." placeholderTextColor={MUTED} accessibilityLabel="Search messages" />
                </View>
                <Pressable style={styles.filter} onPress={() => toast('Filter by child or subject is coming soon.')} accessibilityRole="button" accessibilityLabel="Filter messages">
                  <Icon name="filter" size={20} color={BLUE} />
                </Pressable>
              </View>
              <ScrollView>
                {shown.map((t) => (
                  <ThreadRow key={t.id} t={t} selected={t.id === inbox.open.id} onPress={() => inbox.setOpenId(t.id)} />
                ))}
              </ScrollView>
            </View>
            <ChatPane t={inbox.open} chat={inbox.chatFor(inbox.open)} onSend={(text) => inbox.send(inbox.open, text)} />
          </View>
        </Card>
        <View style={[styles.side, styles.colSide]}>
          <BookingCard b={m.booking} />
          <MeetingsCard meetings={m.meetings} />
        </View>
      </View>
      <View style={styles.bottom}>
        <View style={styles.flex}>
          <AnnouncementsCard items={m.announcements} />
        </View>
        <View style={styles.colTeachers}>
          <TeachersCard teachers={m.teachers} onMessage={inbox.openByName} />
        </View>
        <View style={styles.colHelp}>
          <HelpCard art={m.helpArt} />
        </View>
      </View>
    </ParentDesk>
  );
}

/** The phone reference: tabs, Book a Meeting, the conversations and upcoming meetings; a thread or the booker opens full screen. */
export function MessagesPhone({ p }: { p: ParentPortal }) {
  const m = p.messages;
  const inbox = useInbox(m);
  const [view, setView] = useState<'list' | 'chat' | 'book'>('list');
  if (view === 'chat') {
    return (
      <View style={styles.phoneRoot}>
        <ParentPhoneTop me={p.me} />
        <View style={styles.phoneChat}>
          <ChatPane t={inbox.open} chat={inbox.chatFor(inbox.open)} onSend={(text) => inbox.send(inbox.open, text)} onBack={() => setView('list')} />
        </View>
      </View>
    );
  }
  if (view === 'book') {
    return (
      <View style={styles.phoneRoot}>
        <ParentPhoneTop me={p.me} />
        <ScrollView contentContainerStyle={styles.phoneScroll}>
          <Pressable style={styles.back} onPress={() => setView('list')} accessibilityRole="button" accessibilityLabel="Back to messages">
            <Icon name="arrowLeft" size={22} color={NAVY} />
            <Text style={styles.backText}>Messages</Text>
          </Pressable>
          <View style={styles.phoneBody}>
            <BookingCard b={m.booking} phone />
            <MeetingsCard meetings={m.meetings} phone />
          </View>
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={styles.phoneRoot}>
      <ParentPhoneTop me={p.me} />
      <ScrollView contentContainerStyle={styles.phoneScroll}>
        <Text style={styles.phoneTitle} accessibilityRole="header">
          Messages
        </Text>
        <UnderTabs items={MESSAGE_TABS} active={inbox.tab} onChange={inbox.setTab} size={16} spread style={styles.phoneTabs} />
        <View style={styles.phoneBody}>
          <Pressable style={styles.bookRow} onPress={() => setView('book')} accessibilityRole="button" accessibilityLabel="Book a Meeting: schedule a parent–teacher meeting">
            <View style={styles.bookTile}>
              <Icon name="calendar" size={24} color={WHITE} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.bookRowTitle}>Book a Meeting</Text>
              <Text style={styles.bookRowSub} numberOfLines={2}>
                Schedule a parent–teacher meeting
              </Text>
            </View>
            <Icon name="chevronRight" size={22} color={BLUE} />
          </Pressable>
          <View style={styles.threads}>
            {inbox.list.map((t) => (
              <ThreadRow
                key={t.id}
                t={t}
                size="phone"
                selected={false}
                onPress={() => {
                  inbox.setOpenId(t.id);
                  setView('chat');
                }}
              />
            ))}
          </View>
          <MeetingsCard meetings={m.meetings} phone />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  title: { fontSize: 34, fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  subtitle: { marginTop: 6, fontSize: 16, color: BODY },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 20, marginTop: 20 },
  colInbox: { flex: 1.8 },
  colSide: { flex: 1.12 },
  inbox: { padding: 0, overflow: 'hidden' },
  inboxTabs: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 6, borderBottomWidth: 1, borderColor: LINE },
  tabs: { flex: 1, borderBottomWidth: 0 },
  newBtn: { paddingHorizontal: 20 },
  panes: { flexDirection: 'row', height: 760 },
  listPane: { width: 350, borderRightWidth: 1, borderColor: LINE },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderColor: LINE },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  searchInput: { flex: 1, height: 48, paddingVertical: 0, fontSize: 15, color: NAVY },
  filter: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: LINE },
  side: { gap: 20 },
  bottom: { flexDirection: 'row', alignItems: 'stretch', gap: 20, marginTop: 20 },
  colHelp: { flex: 0.85 },
  colTeachers: { flex: 1.2, minWidth: 0 },
  phoneRoot: { flex: 1, backgroundColor: CANVAS },
  phoneChat: { flex: 1, backgroundColor: WHITE },
  phoneScroll: { paddingBottom: 32 },
  phoneTitle: { marginTop: 6, paddingHorizontal: 20, fontSize: 28, fontWeight: '800', color: NAVY, letterSpacing: -0.5 },
  phoneTabs: { marginTop: 10, marginHorizontal: 20, paddingHorizontal: 14 },
  phoneBody: { gap: 18, paddingHorizontal: 20, paddingTop: 18 },
  bookRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  bookTile: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  bookRowTitle: { fontSize: 17, fontWeight: '700', color: NAVY },
  bookRowSub: { marginTop: 2, fontSize: 14, color: BODY },
  threads: { marginTop: -6 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingTop: 10 },
  backText: { fontSize: 17, fontWeight: '600', color: NAVY },
});
