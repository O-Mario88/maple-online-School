import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ComponentRef, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Avatar, Btn, Card, CardHead, CountBadge, IconTile, Pill, PlayButton, Wave } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, MUTED, NAVY, RED, SELECT, SOFT, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { ChatMessage, ParentPortal, Thread } from '@/mock/portal';

type Messages = ParentPortal['messages'];

export const MESSAGE_TABS = ['All', 'Teachers', 'Announcements'] as const;
export type MessageTab = (typeof MESSAGE_TABS)[number];

/** The conversations a tab shows: teachers only, school notices only, or everything. */
export function threadsFor(threads: readonly Thread[], tab: MessageTab): readonly Thread[] {
  if (tab === 'Teachers') return threads.filter((t) => t.kind === 'teacher');
  if (tab === 'Announcements') return threads.filter((t) => t.kind !== 'teacher');
  return threads;
}

/** A conversation's picture: the teacher's photo with a presence dot, or an icon for school channels. */
function ThreadFace({ t, size }: { t: Thread; size: number }) {
  if (t.avatar) return <Avatar source={t.avatar} size={size} badge={t.online ? 'online' : 'none'} />;
  return (
    <View style={[styles.channel, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <Icon name={t.kind === 'announcements' ? 'megaphone' : 'people'} size={size * 0.48} color={BLUE} />
    </View>
  );
}

/** One conversation in the list: who, what about, the latest line and unread marks. */
export function ThreadRow({ t, selected, onPress, size = 'desk' }: { t: Thread; selected: boolean; onPress: () => void; size?: 'desk' | 'phone' }) {
  const phone = size === 'phone';
  return (
    <Pressable
      style={({ hovered }) => [styles.thread, phone && styles.threadPhone, selected && styles.threadOn, hovered && !selected && styles.hover]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${t.name}${t.unread ? `, ${t.unread} unread` : ''}: ${t.previewLong}`}>
      <ThreadFace t={t} size={phone ? 58 : 54} />
      <View style={styles.threadBody}>
        <View style={styles.threadTop}>
          <Text style={[styles.threadName, phone && styles.threadNamePhone]} numberOfLines={1}>
            {t.name}
          </Text>
          <Text style={styles.threadTime}>{t.time}</Text>
        </View>
        {t.subject ? (
          <Text style={[styles.threadMeta, phone && styles.threadMetaPhone]} numberOfLines={2}>
            {`${t.subject}  •  ${t.child}`}
          </Text>
        ) : null}
        <View style={styles.threadTop}>
          <Text style={[styles.threadPreview, phone && styles.threadPreviewPhone]} numberOfLines={1}>
            {phone ? t.preview : t.previewLong}
          </Text>
          {t.unread > 1 ? <CountBadge count={t.unread} size={phone ? 26 : 22} /> : t.unread === 1 ? <View style={styles.unreadDot} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

/** A bubble in the conversation: the teacher's on the left, the parent's on the right. */
function Bubble({ m }: { m: ChatMessage }) {
  const [playing, setPlaying] = useState(false);
  const mine = m.from === 'me';
  return (
    <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
      {m.voice ? (
        <View style={styles.voice}>
          <PlayButton playing={playing} onPress={() => setPlaying((p) => !p)} size={40} label="voice note" />
          <Wave played={playing ? 0.45 : 1} bars={22} height={24} />
          <Text style={styles.voiceTime}>{m.voice}</Text>
        </View>
      ) : null}
      <Text style={styles.bubbleText}>{m.text}</Text>
      {m.file ? (
        <Pressable style={styles.file} onPress={() => toast(`Opening ${m.file?.name}…`)} accessibilityRole="button" accessibilityLabel={`Open ${m.file.name}, ${m.file.size}`}>
          <View style={styles.pdf}>
            <Icon name="doc" size={20} color={WHITE} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.fileName} numberOfLines={1}>
              {m.file.name}
            </Text>
            <Text style={styles.fileSize}>{m.file.size}</Text>
          </View>
        </Pressable>
      ) : null}
      <View style={styles.bubbleFoot}>
        <Text style={styles.bubbleTime}>{m.time}</Text>
        {mine ? <Icon name="doneAll" size={14} color={BLUE} /> : null}
      </View>
    </View>
  );
}

/** The open conversation: header with call buttons, the messages and a box to reply. */
export function ChatPane({ t, chat, onSend, onBack }: { t: Thread; chat: readonly ChatMessage[]; onSend: (text: string) => void; onBack?: () => void }) {
  const [draft, setDraft] = useState('');
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const send = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };
  return (
    <View style={styles.chat}>
      <View style={styles.chatHead}>
        {onBack ? (
          <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back to messages" hitSlop={10}>
            <Icon name="arrowLeft" size={24} color={NAVY} />
          </Pressable>
        ) : null}
        <ThreadFace t={t} size={onBack ? 50 : 64} />
        <View style={styles.flex}>
          <Text style={styles.chatName} numberOfLines={1}>
            {t.name}
          </Text>
          {t.subject ? (
            <Text style={styles.chatMeta} numberOfLines={1}>
              {t.subject === 'Class Teacher' ? t.subject : `${t.subject} Teacher`}
            </Text>
          ) : null}
          {t.child ? (
            <View style={styles.online}>
              <View style={[styles.onlineDot, !t.online && styles.offlineDot]} />
              <Text style={[styles.chatMeta, styles.flex]} numberOfLines={1}>{`${t.child.split(' ')[0]}  •  ${t.child.replace(/^.*\(|\)$/g, '')}`}</Text>
            </View>
          ) : null}
        </View>
        {t.kind === 'teacher' ? (
          <View style={styles.callGroup}>
            <Pressable style={styles.callBtn} onPress={() => toast(`Starting a video call with ${t.name}…`)} accessibilityRole="button" accessibilityLabel={`Video call ${t.name}`}>
              <Icon name="video" size={22} color={BLUE} />
            </Pressable>
            <Pressable style={styles.callBtn} onPress={() => toast(`Calling ${t.name}…`)} accessibilityRole="button" accessibilityLabel={`Phone ${t.name}`}>
              <Icon name="phone" size={22} color={BLUE} />
            </Pressable>
          </View>
        ) : null}
        {onBack ? null : (
          <Pressable style={styles.moreBtn} onPress={() => toast('Conversation details are coming soon.')} accessibilityRole="button" accessibilityLabel="Conversation options">
            <Icon name="grid" size={18} color={BLUE} />
          </Pressable>
        )}
      </View>
      <ScrollView
        ref={scroller}
        style={styles.flex}
        contentContainerStyle={styles.chatBody}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}>
        {chat.map((m, i) => (
          <Bubble key={`${m.time}-${i}`} m={m} />
        ))}
      </ScrollView>
      <View style={styles.compose}>
        <Pressable onPress={() => toast('Attach a photo or a PDF.')} accessibilityRole="button" accessibilityLabel="Attach a file" hitSlop={8}>
          <Icon name="paperclip" size={24} color={BODY} />
        </Pressable>
        <View style={styles.input}>
          <TextInput
            style={styles.inputText}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={send}
            placeholder="Type a message..."
            placeholderTextColor={MUTED}
            accessibilityLabel={`Message ${t.name}`}
          />
          <Icon name="smile" size={24} color={BODY} />
        </View>
        <Pressable style={styles.send} onPress={send} accessibilityRole="button" accessibilityLabel="Send message">
          <Icon name="send" size={22} color={WHITE} />
        </Pressable>
      </View>
    </View>
  );
}

/** Book a Meeting: meeting type, a week of free slots, how to meet, and the button. */
export function BookingCard({ b, bare = false, phone = false }: { b: Messages['booking']; bare?: boolean; phone?: boolean }) {
  const [type, setType] = useState(0);
  const [slot, setSlot] = useState('Tue 28 Oct|3:00 PM');
  const [mode, setMode] = useState(b.modes[0].key);
  const [day, time] = slot.split('|');
  const book = () => {
    const how = b.modes.find((m) => m.key === mode)?.label.replace('\n', ' ');
    toast(`Booked: ${b.types[type]} with ${b.teacher}, ${day} at ${time} (${how}).`);
  };
  const body = (
    <>
      <View style={styles.bookHead}>
        <View style={styles.bookIcon}>
          <Icon name="calendar" size={26} color={WHITE} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.bookTitle}>Book a Meeting</Text>
          <Text style={styles.bookSub}>{phone ? `Schedule a parent–teacher meeting with ${b.teacher}` : `Schedule a parent–teacher meeting\nwith ${b.teacher}`}</Text>
        </View>
      </View>
      <Text style={styles.label}>Select Meeting Type</Text>
      <Pressable style={styles.select} onPress={() => setType((type + 1) % b.types.length)} accessibilityRole="button" accessibilityLabel={`Meeting type: ${b.types[type]}. Tap to change`}>
        <Text style={styles.selectText}>{b.types[type]}</Text>
        <Icon name="chevronDown" size={18} color={NAVY} />
      </Pressable>
      <View style={[styles.slotHead, phone && styles.slotHeadPhone]}>
        <Text style={[styles.label, phone ? styles.slotLabelPhone : styles.flex]}>Available Time Slots (EAT)</Text>
        <Pressable onPress={() => toast('Earlier weeks are fully booked.')} accessibilityRole="button" accessibilityLabel="Previous week" hitSlop={8}>
          <Icon name="chevronLeft" size={18} color={BLUE} />
        </Pressable>
        <Text style={styles.range}>{b.range}</Text>
        <Pressable onPress={() => toast('Next week opens on Friday.')} accessibilityRole="button" accessibilityLabel="Next week" hitSlop={8}>
          <Icon name="chevronRight" size={18} color={BLUE} />
        </Pressable>
      </View>
      <View style={styles.days}>
        {b.days.map((d) => (
          <View key={d.dow} style={styles.day}>
            <Text style={styles.dow}>{d.dow}</Text>
            <Text style={styles.date}>{d.date}</Text>
            {d.slots.map((s) => {
              const key = `${d.dow} ${d.date}|${s}`;
              const on = key === slot;
              return (
                <Pressable key={s} style={[styles.slot, phone && styles.slotPhone, on && styles.slotOn]} onPress={() => setSlot(key)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${d.dow} ${d.date}, ${s}`}>
                  <Text style={[styles.slotText, phone && styles.slotTextPhone, on && styles.slotTextOn]} numberOfLines={phone ? 2 : 1}>
                    {phone ? s.replace(' ', '\n') : s}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
      <Text style={styles.label}>Meeting Mode</Text>
      <View style={styles.modes}>
        {b.modes.map((m) => {
          const on = m.key === mode;
          return (
            <Pressable key={m.key} style={[styles.mode, phone && styles.modePhone, on && styles.modeOn]} onPress={() => setMode(m.key)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={m.label.replace('\n', ' ')}>
              <View style={[styles.modeIcon, on && styles.modeIconOn]}>
                <Icon name={m.icon} size={24} color={on ? BLUE : BODY} />
              </View>
              <Text style={[styles.modeText, phone && styles.modeTextPhone, on && styles.modeTextOn]}>{m.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Btn label="Book Meeting" onPress={book} height={54} textStyle={styles.bookBtnText} />
    </>
  );
  return bare ? <View style={styles.bookBare}>{body}</View> : <Card style={styles.bookCard}>{body}</Card>;
}

/** Upcoming Meetings: who, when, its status and how to join. */
export function MeetingsCard({ meetings, phone = false }: { meetings: Messages['meetings']; phone?: boolean }) {
  return (
    <Card style={[styles.gapCard, phone && styles.cardPhone]}>
      <CardHead title="Upcoming Meetings" size={phone ? 18 : 20} link="View All" onLink={() => toast('You have one meeting booked.')} />
      {meetings.map((m) => (
        <View key={m.when} style={[styles.meeting, phone && styles.meetingPhone]}>
          <View style={styles.meetingTop}>
            <Avatar source={m.avatar} size={phone ? 50 : 72} badge="check" />
            <View style={styles.flex}>
              <Text style={[styles.meetingName, phone && styles.meetingNamePhone]} numberOfLines={phone ? 2 : undefined}>
                {m.teacher}
                {phone ? <Text style={styles.meetingSubject}>{` – ${m.subject}`}</Text> : null}
              </Text>
              {phone ? null : <Text style={styles.meetingMeta}>{`${m.subject}  •  ${m.child}`}</Text>}
              <View style={styles.meetingWhen}>
                <Icon name="calendar" size={16} color={BLUE} />
                <Text style={[styles.meetingMeta, styles.flex, phone && styles.meetingWhenPhone]} numberOfLines={2}>
                  {m.when}
                </Text>
              </View>
            </View>
            {phone ? null : <Pill label={m.status} tone="green" size={14} style={styles.confirmed} />}
          </View>
          {phone ? <Pill label={m.status} tone="green" size={13} style={styles.confirmedPhone} /> : null}
          <View style={styles.meetingBtns}>
            <Btn label="Reschedule" kind="outline" onPress={() => toast('Pick a new time from the free slots.')} style={[styles.flex, phone && styles.meetingBtnPhone]} textStyle={phone ? styles.meetingBtnText : undefined} height={46} />
            <Btn label="Join Meeting" icon="video" onPress={() => toast('The meeting opens 10 minutes before it starts.')} style={[styles.flex, phone && styles.meetingBtnPhone]} textStyle={phone ? styles.meetingBtnText : undefined} height={46} />
          </View>
        </View>
      ))}
    </Card>
  );
}

/** School Announcements as a card of notices. */
export function AnnouncementsCard({ items }: { items: Messages['announcements'] }) {
  return (
    <Card style={styles.gapCard}>
      <CardHead title="School Announcements" link="View All" onLink={() => toast('All announcements are in the Announcements tab.')} icon={<IconTile icon="megaphone" tone="purple" size={44} />} />
      {items.map((a, i) => (
        <Pressable key={a.title} style={[styles.notice, i > 0 && styles.noticeLine]} onPress={() => toast(a.body)} accessibilityRole="button" accessibilityLabel={`${a.title}, ${a.date}`}>
          <IconTile icon={a.icon} tone={a.tone} size={52} />
          <View style={styles.flex}>
            <View style={styles.threadTop}>
              <Text style={styles.noticeTitle} numberOfLines={3}>
                {a.title}
              </Text>
              <Text style={styles.noticeDate}>{a.date}</Text>
            </View>
            <Text style={styles.noticeBody}>{a.body}</Text>
          </View>
          <Icon name="chevronRight" size={20} color={BLUE} />
        </Pressable>
      ))}
    </Card>
  );
}

/** Teachers: each of the children's teachers with Message and Book buttons. */
export function TeachersCard({ teachers, onMessage }: { teachers: Messages['teachers']; onMessage: (name: string) => void }) {
  return (
    <Card style={styles.gapCard}>
      <CardHead
        title="Teachers"
        subtitle="Message or book a meeting with your child's teachers."
        link="View All"
        onLink={() => toast('These are all of your children’s teachers.')}
        icon={<IconTile icon="person" tone="blue" size={44} />}
      />
      {teachers.map((t, i) => (
        <View key={t.name} style={[styles.teacher, i > 0 && styles.noticeLine]}>
          <Avatar source={t.avatar} size={50} badge="online" />
          <View style={styles.flex}>
            <Text style={styles.noticeTitle} numberOfLines={1}>
              {t.name}
            </Text>
            <Text style={styles.noticeBody} numberOfLines={2}>
              {t.detail}
            </Text>
          </View>
          <Btn label="Message" kind="outline" onPress={() => onMessage(t.name)} height={38} style={styles.smallBtn} textStyle={styles.smallBtnText} />
          <Btn label="Book" icon="clock" kind="outline" onPress={() => toast(`Pick a time to meet ${t.name}.`)} height={38} style={styles.smallBtn} textStyle={styles.smallBtnText} />
        </View>
      ))}
    </Card>
  );
}

/** "Need to speak with a teacher?" with the reference's illustration. */
export function HelpCard({ art }: { art: number }) {
  return (
    <Card style={styles.help}>
      <Image source={art} style={styles.helpArt} contentFit="cover" accessibilityLabel="A parent and child talking to a teacher online" />
      <Text style={styles.helpTitle}>Need to speak with a teacher?</Text>
      <Text style={styles.helpBody}>Book a meeting during their office hours. All communication is secure and school-audited for a safe learning environment.</Text>
      <Btn label="Learn More" onPress={() => router.push('/help')} style={styles.helpBtn} height={50} />
    </Card>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  hover: { backgroundColor: SOFT },
  gapCard: { gap: 18 },
  channel: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F0FF' },
  thread: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderColor: LINE },
  threadPhone: { paddingHorizontal: 0, paddingVertical: 14 },
  threadOn: { backgroundColor: SELECT },
  threadBody: { flex: 1, minWidth: 0, gap: 4 },
  threadTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  threadName: { flex: 1, minWidth: 0, fontSize: 16, fontWeight: '700', color: NAVY },
  threadNamePhone: { fontSize: 16.5 },
  threadTime: { fontSize: 13.5, color: BODY },
  threadMeta: { fontSize: 14, color: '#5371B5' },
  threadMetaPhone: { fontSize: 14.5 },
  threadPreview: { flex: 1, minWidth: 0, fontSize: 13.5, color: BODY },
  threadPreviewPhone: { fontSize: 14.5 },
  unreadDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: RED, marginRight: 4 },
  chat: { flex: 1, minWidth: 0 },
  chatHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderColor: LINE },
  chatName: { fontSize: 18, fontWeight: '700', color: NAVY },
  chatMeta: { fontSize: 13, color: '#5371B5' },
  online: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  onlineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: GREEN },
  offlineDot: { backgroundColor: MUTED },
  callGroup: { flexDirection: 'row', borderRadius: 12, borderWidth: 1, borderColor: LINE },
  callBtn: { width: 46, height: 48, alignItems: 'center', justifyContent: 'center' },
  moreBtn: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: LINE },
  chatBody: { gap: 14, padding: 20 },
  bubble: { maxWidth: '86%', gap: 10, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 10, borderRadius: 16 },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: '#F1F5FC', borderTopLeftRadius: 4 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#DCEBFF', borderTopRightRadius: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22, color: '#26335F' },
  bubbleFoot: { flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center', gap: 6 },
  bubbleTime: { fontSize: 12, color: MUTED },
  voice: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  voiceTime: { fontSize: 14, color: BODY },
  file: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, backgroundColor: WHITE },
  pdf: { width: 40, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5383B' },
  fileName: { fontSize: 14.5, fontWeight: '700', color: NAVY },
  fileSize: { fontSize: 13, color: BODY },
  compose: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 14, borderTopWidth: 1, borderColor: LINE },
  input: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 54, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  inputText: { flex: 1, height: 54, paddingVertical: 0, fontSize: 15, color: NAVY },
  send: { width: 54, height: 54, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  bookCard: { gap: 16 },
  bookBare: { gap: 16 },
  bookHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  bookIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  bookTitle: { fontSize: 22, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  bookSub: { marginTop: 4, fontSize: 15, lineHeight: 21, color: BODY },
  label: { fontSize: 15, fontWeight: '600', color: NAVY },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  selectText: { fontSize: 15.5, color: NAVY },
  slotHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  slotHeadPhone: { flexWrap: 'wrap', rowGap: 6 },
  slotLabelPhone: { width: '100%' },
  range: { fontSize: 13.5, color: BODY },
  days: { flexDirection: 'row', gap: 6 },
  day: { flex: 1, minWidth: 0, alignItems: 'stretch', gap: 8, paddingHorizontal: 5, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: LINE },
  dow: { textAlign: 'center', fontSize: 15, fontWeight: '700', color: NAVY },
  date: { textAlign: 'center', marginTop: -6, marginBottom: 4, fontSize: 13.5, color: BODY },
  slot: { alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 8, backgroundColor: '#EEF4FD' },
  slotOn: { backgroundColor: BLUE },
  slotText: { fontSize: 13.5, fontWeight: '500', color: '#2552B5' },
  slotTextOn: { color: WHITE, fontWeight: '700' },
  slotPhone: { height: 48 },
  slotTextPhone: { fontSize: 13, lineHeight: 16, textAlign: 'center' },
  modes: { flexDirection: 'row', gap: 10 },
  mode: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8, height: 74, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  modeOn: { borderColor: BLUE, borderWidth: 1.5, backgroundColor: '#EEF4FE' },
  modeIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  modeIconOn: { backgroundColor: '#DCE8FD' },
  modeText: { flex: 1, minWidth: 0, fontSize: 13.5, color: BODY },
  modeTextOn: { color: '#2552B5', fontWeight: '600' },
  modePhone: { flexDirection: 'column', justifyContent: 'center', gap: 4, height: 96, paddingHorizontal: 6 },
  modeTextPhone: { flex: 0, textAlign: 'center', fontSize: 13 },
  bookBtnText: { fontSize: 17 },
  meeting: { gap: 14, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: LINE },
  meetingTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  meetingName: { fontSize: 16.5, fontWeight: '700', color: NAVY },
  meetingSubject: { fontSize: 14.5, fontWeight: '400', color: BODY },
  meetingMeta: { fontSize: 14.5, color: '#5371B5' },
  meetingWhen: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  confirmed: { paddingHorizontal: 14, paddingVertical: 8 },
  meetingBtns: { flexDirection: 'row', gap: 12 },
  cardPhone: { padding: 16 },
  meetingPhone: { padding: 12 },
  meetingNamePhone: { fontSize: 15, marginRight: 92 },
  meetingWhenPhone: { fontSize: 13.5 },
  confirmedPhone: { position: 'absolute', top: 12, right: 12 },
  meetingBtnPhone: { paddingHorizontal: 8 },
  meetingBtnText: { fontSize: 14.5 },
  notice: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 14 },
  noticeLine: { borderTopWidth: 1, borderColor: LINE },
  noticeTitle: { flex: 1, minWidth: 0, fontSize: 15.5, fontWeight: '600', color: NAVY },
  noticeDate: { fontSize: 13, color: MUTED },
  noticeBody: { marginTop: 3, fontSize: 14, lineHeight: 20, color: BODY },
  teacher: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 12 },
  smallBtn: { paddingHorizontal: 11, borderRadius: 9, gap: 6 },
  smallBtnText: { fontSize: 13.5 },
  help: { gap: 12, padding: 16 },
  helpArt: { width: '100%', aspectRatio: 305 / 92, borderRadius: 12 },
  helpTitle: { fontSize: 21, fontWeight: '800', color: NAVY, marginTop: 6 },
  helpBody: { fontSize: 15.5, lineHeight: 23, color: BODY },
  helpBtn: { alignSelf: 'flex-start', paddingHorizontal: 34, marginTop: 6 },
});
