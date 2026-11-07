import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CmdStat, CountTabs, Initials, KpiGrid, OutlineBtn, PhotoDot, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import { CmdHead, CommandDesk, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { ReasonModal, type ReasonAsk } from '@/features/command/kit/ReasonModal';
import { filterThreads, type Message, sendMessage, type ThreadTab, toggleReaction } from '@/features/command/logic/comms';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, MUTED, NAVY, TONES, WHITE } from '@/features/portal/tokens';
import { PageHead, Search } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { Participant, ThreadRow } from '@/mock/command-center/comms';
import { Maple } from '@/constants/maple';

type M = CommandData['comms'];
const CHAT_TABS = ['Messages', 'Files', 'Links', 'Tasks', 'Events'] as const;
const FILE_TONE = { pdf: 'red', doc: 'blue', xls: 'green' } as const;

const clock = () => new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

function useMessages(m: M, me: string) {
  const [list, setList] = useState<readonly ThreadRow[]>(m.threads);
  const [tab, setTab] = useState<ThreadTab>('All Messages');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(m.threads[0].id);
  const [draft, setDraft] = useState('');
  const [chatTab, setChatTab] = useState<string>('Messages');
  const [muted, setMuted] = useState<ReadonlySet<string>>(new Set());
  const [tasks, setTasks] = useState<readonly string[]>([]);
  const [events, setEvents] = useState<readonly string[]>([]);
  const [ask, setAsk] = useState<ReasonAsk | null>(null);
  const shown = useMemo(() => filterThreads(list, tab, query), [list, tab, query]);
  const open = list.find((t) => t.id === openId) ?? null;
  const update = (t: ThreadRow) => setList((prev) => prev.map((x) => (x.id === t.id ? t : x)));

  const pick = (id: string) => {
    setOpenId(id);
    setChatTab('Messages');
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, unread: 0, mentions: 0 } : x)));
  };
  const send = () => {
    if (!open) return;
    const r = sendMessage(open, draft, me, clock());
    if (r.error) return toast(r.error);
    update(r.thread);
    setDraft('');
  };
  const react = (msg: Message, emoji: string) => {
    if (!open) return;
    update({ ...open, messages: open.messages.map((x) => (x.id === msg.id ? toggleReaction(x, emoji, me) : x)) });
  };
  const newMessage = () =>
    setAsk({
      title: 'New message',
      body: 'Start a conversation. Write who it is with, a colon, then the message, for example "Hope International: the Term 3 timetable is ready".',
      confirm: 'Start Conversation',
      tone: 'blue',
      placeholder: 'Name: message',
      onConfirm: (text) => {
        const [name, ...rest] = text.split(':');
        const body = rest.join(':').trim() || text;
        const id = `t-new-${Date.now()}`;
        const thread: ThreadRow = { id, name: rest.length ? name.trim() : 'New conversation', kind: 'Internal', sub: 'Internal · 1 member', icon: 'people', tone: 'blue', unread: 0, mentions: 0, archived: false, preview: '', time: clock(), messages: [], participants: [], files: [] };
        const r = sendMessage(thread, body, me, clock());
        setList((prev) => [r.thread, ...prev]);
        setTab('All Messages');
        setOpenId(id);
        toast(`Conversation with ${r.thread.name} started.`);
      },
    });
  const archiveOpen = () => {
    if (!open) return;
    update({ ...open, archived: !open.archived });
    toast(open.archived ? `${open.name} moved back to the inbox.` : `${open.name} archived. Find it under Archived.`);
  };
  const toggleMute = () => {
    if (!open) return;
    const on = muted.has(open.id);
    setMuted((prev) => {
      const next = new Set(prev);
      if (on) next.delete(open.id);
      else next.add(open.id);
      return next;
    });
    toast(on ? `Notifications on for ${open.name}.` : `${open.name} muted. You still see @mentions.`);
  };
  const createTask = () =>
    setAsk({
      title: 'Create task',
      body: 'The task is shared with everyone in this conversation.',
      confirm: 'Create Task',
      placeholder: 'Review the P5 lesson plan by Friday',
      onConfirm: (t) => {
        setTasks((prev) => [t, ...prev]);
        setChatTab('Tasks');
        toast('Task created and shared with the conversation.');
      },
    });
  const scheduleMeeting = () => {
    if (!open) return;
    setEvents((prev) => [`Live meeting with ${open.name} · Tomorrow, 10:00 AM (45 min)`, ...prev]);
    setChatTab('Events');
    toast('Meeting scheduled. Everyone gets a calendar invite and a LiveKit link.');
  };
  const countOf = (l: readonly ThreadRow[], f: (t: ThreadRow) => boolean) => l.filter((t) => !t.archived && f(t)).length;
  const live: Readonly<Record<string, number>> = {
    'All Messages': list.length - m.threads.length,
    Unread: countOf(list, (t) => t.unread > 0) - countOf(m.threads, (t) => t.unread > 0),
    Mentions: countOf(list, (t) => t.mentions > 0) - countOf(m.threads, (t) => t.mentions > 0),
  };
  const tabs = m.threadTabs.map((t) => ({ label: t.label, count: t.base === undefined ? undefined : t.base + (live[t.label] ?? 0), tone: 'red' as const }));
  return { shown, tab, setTab: (x: string) => setTab(x as ThreadTab), tabs, query, setQuery, open, pick, draft, setDraft, send, react, chatTab, setChatTab, muted: open ? muted.has(open.id) : false, toggleMute, tasks, events, createTask, scheduleMeeting, archiveOpen, newMessage, ask, setAsk };
}
type U = ReturnType<typeof useMessages>;

function ThreadLead({ t, size = 40 }: { t: ThreadRow; size?: number }) {
  if (t.avatar) return <PhotoDot source={t.avatar} size={size} />;
  const tone = TONES[t.tone ?? 'blue'];
  return (
    <View style={[styles.lead, { width: size, height: size, borderRadius: size / 2, backgroundColor: tone.soft }]}>
      <Icon name={t.icon ?? 'people'} size={size * 0.5} color={tone.solid} />
    </View>
  );
}

function ThreadItem({ t, on, onPress }: { t: ThreadRow; on: boolean; onPress: () => void }) {
  return (
    <Pressable style={({ hovered }) => [styles.thread, on && styles.threadOn, hovered && !on && styles.hover]} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${t.name}, ${t.preview}${t.unread ? `, ${t.unread} unread` : ''}`}>
      <ThreadLead t={t} />
      <View style={styles.flex}>
        <View style={styles.inline}>
          <Text style={[styles.threadName, styles.flex]} numberOfLines={1}>
            {t.name}
          </Text>
          {t.verified ? <Icon name="verified" size={14} color={BLUE} /> : null}
          <Text style={styles.tiny}>{t.time}</Text>
        </View>
        <Text style={styles.tiny} numberOfLines={1}>
          {t.sub}
        </Text>
        <View style={styles.inline}>
          <Text style={[styles.preview, styles.flex]} numberOfLines={1}>
            {t.preview}
          </Text>
          {t.unread ? (
            <View style={styles.unread}>
              <Text style={styles.unreadText}>{t.unread}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function ThreadList({ u, onOpen }: { u: U; onOpen: (id: string) => void }) {
  if (!u.shown.length) return <Text style={[styles.small, styles.empty]}>No conversations match.</Text>;
  return (
    <>
      {u.shown.map((t) => (
        <ThreadItem key={t.id} t={t} on={t.id === u.open?.id} onPress={() => onOpen(t.id)} />
      ))}
    </>
  );
}

function Face({ name, people, size = 36 }: { name: string; people: readonly Participant[]; size?: number }) {
  const p = people.find((x) => x.name.startsWith(name));
  return (
    <View style={styles.face}>
      {p ? <PhotoDot source={p.avatar} size={size} /> : <Initials name={name} size={size} />}
      {p?.online ? <View style={styles.online} /> : null}
    </View>
  );
}

function Bubble({ msg, u, people, me }: { msg: Message; u: U; people: readonly Participant[]; me: string }) {
  const p = people.find((x) => x.name.startsWith(msg.by));
  const mine = msg.by === me;
  const reactions = Object.entries(msg.reactions).filter(([, who]) => who.length);
  return (
    <View style={styles.msg}>
      <Face name={msg.by} people={people} />
      <View style={styles.flex}>
        <View style={styles.inline}>
          <Text style={styles.msgBy}>{msg.by}</Text>
          {p ? <Text style={styles.tiny}>{p.role}</Text> : null}
          <Text style={styles.tiny}>{msg.time}</Text>
        </View>
        <View style={[styles.bubble, mine && styles.bubbleMine]}>
          <Text style={styles.msgText}>{msg.text}</Text>
          {msg.file ? (
            <Pressable style={styles.file} onPress={() => toast(`${msg.file?.name} opens in the document viewer.`)} accessibilityRole="button" accessibilityLabel={`Open ${msg.file.name}`}>
              <View style={[styles.fileIcon, { backgroundColor: TONES.red.soft }]}>
                <Icon name="doc" size={16} color={TONES.red.solid} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {msg.file.name}
                </Text>
                <Text style={styles.tiny}>{msg.file.size}</Text>
              </View>
              <Icon name="more" size={16} color={BODY} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.reactRow}>
          {reactions.map(([emoji, who]) => {
            const mineToo = who.includes(me);
            return (
              <Pressable key={emoji} style={[styles.react, mineToo && styles.reactOn]} onPress={() => u.react(msg, emoji)} accessibilityRole="button" accessibilityState={{ selected: mineToo }} accessibilityLabel={`${emoji} ${who.length}`}>
                <Text style={styles.reactText}>{`${emoji} ${who.length}`}</Text>
              </Pressable>
            );
          })}
          <Pressable style={styles.reactAdd} onPress={() => u.react(msg, '👍')} accessibilityRole="button" accessibilityLabel="React with thumbs up" hitSlop={6}>
            <Icon name="smile" size={14} color={MUTED} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Composer({ u }: { u: U }) {
  const empty = !u.draft.trim();
  return (
    <View style={styles.composer}>
      <Pressable onPress={() => toast('Attach a file, photo or lesson resource (up to 25 MB).')} accessibilityRole="button" accessibilityLabel="Attach a file" hitSlop={6}>
        <Icon name="paperclip" size={19} color={BODY} />
      </Pressable>
      <View style={styles.inputBox}>
        <TextInput value={u.draft} onChangeText={u.setDraft} placeholder="Type a message..." placeholderTextColor={MUTED} style={styles.input} onSubmitEditing={u.send} accessibilityLabel="Message" returnKeyType="send" />
        <Pressable onPress={() => u.setDraft(`${u.draft}🙂`)} accessibilityRole="button" accessibilityLabel="Add emoji" hitSlop={6}>
          <Icon name="smile" size={19} color={BODY} />
        </Pressable>
        <Pressable onPress={() => u.setDraft(`${u.draft}${u.draft && !u.draft.endsWith(' ') ? ' ' : ''}@`)} accessibilityRole="button" accessibilityLabel="Mention someone" hitSlop={6}>
          <Text style={styles.at}>@</Text>
        </Pressable>
      </View>
      <Pressable style={[styles.send, empty && styles.sendOff]} onPress={u.send} accessibilityRole="button" accessibilityLabel="Send message" accessibilityState={{ disabled: empty }}>
        <Icon name="send" size={19} color={WHITE} />
      </Pressable>
    </View>
  );
}

function ChatBody({ u, me }: { u: U; me: string }) {
  const t = u.open;
  if (!t) return null;
  if (u.chatTab === 'Files') return <FileList t={t} />;
  if (u.chatTab === 'Links') return <Text style={[styles.small, styles.empty]}>{'maple.school/live/p5-maths-review\nmaple.school/library/fractions-pack'}</Text>;
  if (u.chatTab === 'Tasks') return <Text style={[styles.small, styles.empty]}>{u.tasks.length ? u.tasks.map((x) => `☐ ${x}`).join('\n') : 'No tasks yet. Use Create Task to add one.'}</Text>;
  if (u.chatTab === 'Events') return <Text style={[styles.small, styles.empty]}>{u.events.length ? u.events.join('\n') : 'No meetings yet. Use Schedule Meeting to add one.'}</Text>;
  return (
    <View style={styles.msgs}>
      <View style={styles.dateChip}>
        <Text style={styles.dateText}>Oct 26, 2026</Text>
      </View>
      {t.messages.map((msg) => (
        <Bubble key={msg.id} msg={msg} u={u} people={t.participants ?? []} me={me} />
      ))}
    </View>
  );
}

function ChatHead({ u, onInfo, compact = false }: { u: U; onInfo?: () => void; compact?: boolean }) {
  const t = u.open;
  if (!t) return null;
  const actions: readonly [IconName, string, () => void][] = [
    ['video', 'Start video call', () => toast(`Starting a LiveKit video call with ${t.name}.`)],
    ['phone', 'Start voice call', () => toast(`Calling ${t.name}…`)],
    ['userPlus', 'Add people', () => toast('Pick teachers, parents, staff or a class to add.')],
    ['more', t.archived ? 'Move back to inbox' : 'Archive conversation', u.archiveOpen],
  ];
  return (
    <View style={styles.chatHead}>
      {compact ? (
        <View style={styles.flex} />
      ) : (
        <>
          <ThreadLead t={t} size={42} />
          <View style={styles.flex}>
            <Text style={styles.chatName} numberOfLines={1}>
              {t.name}
            </Text>
            <Text style={styles.tiny}>{t.sub}</Text>
          </View>
        </>
      )}
      {actions.map(([icon, label, fn]) => (
        <Pressable key={label} style={({ hovered }) => [styles.headBtn, hovered && styles.hover]} onPress={fn} accessibilityRole="button" accessibilityLabel={label}>
          <Icon name={icon} size={18} color={BLUE} />
        </Pressable>
      ))}
      {onInfo ? (
        <Pressable style={styles.headBtn} onPress={onInfo} accessibilityRole="button" accessibilityLabel="Conversation details">
          <Icon name="info" size={18} color={BLUE} />
        </Pressable>
      ) : null}
    </View>
  );
}

function ChatTabs({ u }: { u: U }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <CountTabs tabs={CHAT_TABS.map((label) => ({ label }))} active={u.chatTab} onChange={u.setChatTab} size={13} style={styles.noWrap} />
    </ScrollView>
  );
}

function FileList({ t }: { t: ThreadRow }) {
  const files = t.files ?? [];
  return (
    <View style={styles.block}>
      {files.map((f) => (
        <View key={f.name} style={styles.fileRow}>
          <View style={[styles.fileIcon, { backgroundColor: TONES[FILE_TONE[f.kind]].soft }]}>
            <Icon name="doc" size={16} color={TONES[FILE_TONE[f.kind]].solid} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.fileName} numberOfLines={1}>
              {f.name}
            </Text>
            <Text style={styles.tiny}>{f.meta}</Text>
          </View>
          <Pressable style={styles.moreBtn} onPress={() => toast(`${f.name}: open, download or remove.`)} accessibilityRole="button" accessibilityLabel={`More for ${f.name}`}>
            <Icon name="more" size={16} color={NAVY} />
          </Pressable>
        </View>
      ))}
      {!files.length ? <Text style={styles.small}>No files shared yet.</Text> : null}
    </View>
  );
}

function Details({ u, onClose }: { u: U; onClose?: () => void }) {
  const t = u.open;
  if (!t)
    return (
      <Card style={styles.panel}>
        <Text style={styles.small}>Pick a conversation.</Text>
      </Card>
    );
  const people = t.participants ?? [];
  const quick: readonly [IconName, string, () => void][] = [
    ['calendar', 'Schedule Meeting', u.scheduleMeeting],
    ['clipboard', 'Create Task', u.createTask],
    ['userPlus', 'Add Members', () => toast('Pick teachers, parents, staff or a class to add.')],
    ['bell', u.muted ? 'Unmute Notifications' : 'Mute Notifications', u.toggleMute],
  ];
  return (
    <Card style={styles.panel}>
      <View style={styles.inline}>
        <Text style={[styles.panelTitle, styles.flex]}>Conversation Details</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close details" hitSlop={8}>
            <Icon name="close" size={18} color={BODY} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.inline}>
        <ThreadLead t={t} size={52} />
        <View style={styles.flex}>
          <View style={styles.inline}>
            <Text style={[styles.chatName, styles.flex]} numberOfLines={2}>
              {t.name}
            </Text>
            <Pill label={t.archived ? 'Archived' : 'Active'} tone={t.archived ? 'grey' : 'green'} size={11} />
          </View>
          <Text style={styles.tiny}>{`${t.kind} Conversation`}</Text>
          {t.created ? <Text style={styles.tiny}>{t.created}</Text> : null}
        </View>
      </View>
      <View style={styles.rule} />
      <View style={styles.inline}>
        <Text style={[styles.section, styles.flex]}>{`Participants (${people.length})`}</Text>
        <Pressable onPress={() => toast('Add, remove or change roles for participants.')} accessibilityRole="link" accessibilityLabel="Manage participants" hitSlop={6}>
          <Text style={styles.link}>Manage</Text>
        </Pressable>
      </View>
      {people.map((p) => (
        <View key={p.name} style={styles.person}>
          <PhotoDot source={p.avatar} size={32} />
          <View style={styles.flex}>
            <Text style={styles.personName} numberOfLines={1}>
              {p.name}
            </Text>
            <Text style={styles.tiny}>{p.role}</Text>
          </View>
          <View style={[styles.status, { backgroundColor: p.online ? GREEN : Maple.borderStrong }]} accessible accessibilityLabel={p.online ? 'Online' : 'Offline'} />
        </View>
      ))}
      {!people.length ? <Text style={styles.small}>Just you so far.</Text> : null}
      <View style={styles.rule} />
      <View style={styles.inline}>
        <Text style={[styles.section, styles.flex]}>{`Shared Files (${(t.files ?? []).length})`}</Text>
        <Pressable onPress={() => u.setChatTab('Files')} accessibilityRole="link" accessibilityLabel="View all files" hitSlop={6}>
          <Text style={styles.link}>View All</Text>
        </Pressable>
      </View>
      <FileList t={t} />
      <View style={styles.rule} />
      <Text style={styles.section}>Quick Actions</Text>
      <View style={styles.quick}>
        {quick.map(([icon, label, fn]) => (
          <Pressable key={label} style={({ hovered }) => [styles.quickBtn, hovered && styles.hover]} onPress={fn} accessibilityRole="button" accessibilityLabel={label}>
            <Icon name={icon} size={16} color={BLUE} />
            <Text style={styles.quickText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </Card>
  );
}

/** Maple Command › Communications › Messages on the desktop reference. */
export function MessagesDesk({ c }: { c: CommandData }) {
  const m = c.comms;
  const u = useMessages(m, c.me.name);
  const [range, setRange] = useState(c.ranges[0]);
  const [details, setDetails] = useState(true);
  return (
    <CommandDesk me={c.me} search="Search users, schools, classes, messages, or reference IDs..." active="Communications" sub="Messages">
      <CmdHead
        icon="chat"
        section="Communications"
        title="Communications"
        subtitle="Manage conversations, announcements, and notifications across teachers, students, parents, and schools."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="New Message" onPress={u.newMessage} />
            <OutlineBtn icon="chevronDown" onPress={() => toast('New announcement, broadcast or template.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {m.messageStats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <Card style={styles.tabsCard}>
        <View style={styles.flex}>
          <CountTabs tabs={u.tabs} active={u.tab} onChange={u.setTab} size={13.5} style={styles.noWrap} />
        </View>
        <Search placeholder="Search conversations..." value={u.query} onChange={u.setQuery} style={styles.searchBox} />
        <OutlineBtn label="Filters" icon="filter" onPress={() => toast('Filter by school, role, unread or date.')} />
      </Card>
      <View style={styles.row}>
        <Card style={styles.listCol}>
          <ThreadList u={u} onOpen={u.pick} />
        </Card>
        <Card style={[styles.chatCol, styles.flex]}>
          <ChatHead u={u} onInfo={details ? undefined : () => setDetails(true)} />
          <ChatTabs u={u} />
          <ChatBody u={u} me={c.me.name} />
          <Composer u={u} />
        </Card>
        {details ? (
          <View style={styles.detailCol}>
            <Details u={u} onClose={() => setDetails(false)} />
          </View>
        ) : null}
      </View>
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandDesk>
  );
}

/** The phone version: counts, then the inbox; a conversation opens full screen with its details a tap away. */
export function MessagesPhone({ c }: { c: CommandData }) {
  const m = c.comms;
  const u = useMessages(m, c.me.name);
  const [view, setView] = useState<'list' | 'chat' | 'details'>('list');
  if (view === 'details') {
    return (
      <CommandPhone key="details" me={c.me}>
        <PageHead title="Details" subtitle="People, files and quick actions." phone onBack={() => setView('chat')} />
        <Details u={u} />
        <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
      </CommandPhone>
    );
  }
  if (view === 'chat') {
    return (
      <CommandPhone
        key="chat"
        me={c.me}
        footer={
          <View style={styles.phoneFoot}>
            <Composer u={u} />
          </View>
        }>
        <PageHead title={u.open?.name ?? 'Conversation'} subtitle={u.open?.sub ?? ''} phone onBack={() => setView('list')} />
        <Card style={styles.chatPhone}>
          <ChatHead u={u} onInfo={() => setView('details')} compact />
          <ChatTabs u={u} />
          <ChatBody u={u} me={c.me.name} />
        </Card>
        <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Communications" subtitle="Conversations, announcements and broadcasts across Maple." phone />
      <KpiGrid items={m.messageStats} />
      <View style={styles.inline}>
        <PrimaryBtn label="New Message" icon="edit" onPress={u.newMessage} style={styles.flex} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={u.tabs} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      <Search placeholder="Search conversations..." value={u.query} onChange={u.setQuery} />
      <Card style={styles.listPhone}>
        <ThreadList
          u={u}
          onOpen={(id) => {
            u.pick(id);
            setView('chat');
          }}
        />
      </Card>
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noWrap: { flexWrap: 'nowrap' },
  block: { gap: 8 },
  small: { fontSize: 12.5, lineHeight: 19, color: BODY },
  tiny: { fontSize: 11.5, color: BODY },
  empty: { padding: 14 },
  hover: { backgroundColor: Maple.blueSoft },
  tabsCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, paddingHorizontal: 12 },
  searchBox: { width: 250 },
  listCol: { width: 360, padding: 0, overflow: 'hidden' },
  listPhone: { padding: 0, overflow: 'hidden' },
  chatCol: { gap: 10, padding: 14 },
  chatPhone: { gap: 10, padding: 12 },
  detailCol: { width: 312 },
  lead: { alignItems: 'center', justifyContent: 'center' },
  thread: { flexDirection: 'row', gap: 10, paddingVertical: 11, paddingHorizontal: 12, borderBottomWidth: 1, borderColor: LINE },
  threadOn: { backgroundColor: Maple.blueSoft },
  threadName: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  preview: { marginTop: 2, fontSize: 12, color: NAVY },
  unread: { minWidth: 20, height: 20, paddingHorizontal: 6, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  unreadText: { fontSize: 11, fontWeight: '700', color: WHITE },
  chatHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chatName: { fontSize: 15, fontWeight: '800', color: NAVY },
  headBtn: { width: 36, height: 36, borderRadius: 9, borderWidth: 1, borderColor: LINE, alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE },
  msgs: { gap: 14 },
  dateChip: { alignSelf: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, backgroundColor: Maple.blueSoft },
  dateText: { fontSize: 11.5, color: NAVY },
  msg: { flexDirection: 'row', gap: 10 },
  msgBy: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  bubble: { alignSelf: 'flex-start', maxWidth: '100%', gap: 8, marginTop: 4, padding: 10, borderRadius: 12, backgroundColor: Maple.blueSoft },
  bubbleMine: { backgroundColor: Maple.blueSelected },
  msgText: { fontSize: 13, lineHeight: 21, color: NAVY },
  file: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 9, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  fileIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  fileName: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  moreBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: LINE, alignItems: 'center', justifyContent: 'center' },
  reactRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 6 },
  react: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  reactOn: { borderColor: BLUE, backgroundColor: Maple.blueSoft },
  reactText: { fontSize: 12, fontWeight: '600', color: NAVY },
  reactAdd: { padding: 3 },
  face: { alignSelf: 'flex-start' },
  online: { position: 'absolute', right: 0, bottom: 0, width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: WHITE, backgroundColor: GREEN },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10, borderTopWidth: 1, borderColor: LINE },
  inputBox: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, height: 44, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  input: { flex: 1, minWidth: 0, height: 42, paddingVertical: 0, fontSize: 13.5, color: NAVY },
  at: { fontSize: 18, fontWeight: '600', color: BODY },
  send: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  sendOff: { opacity: 0.55 },
  phoneFoot: { paddingHorizontal: 12, paddingBottom: 10, backgroundColor: WHITE },
  panel: { gap: 9, padding: 14 },
  panelTitle: { fontSize: 15, fontWeight: '800', color: NAVY },
  section: { fontSize: 13.5, fontWeight: '800', color: NAVY },
  link: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  rule: { height: 1, backgroundColor: LINE },
  person: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  personName: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  status: { width: 9, height: 9, borderRadius: 5 },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, width: '48%', minHeight: 40, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9, borderWidth: 1, borderColor: LINE },
  quickText: { flex: 1, minWidth: 0, fontSize: 12, fontWeight: '600', color: BLUE },
});
