import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ErrorText, IconButton, Loading } from '@/components/ui';
import { Maple, TypeScale } from '@/constants/maple';
import { flipStar, markOpened, useMarks } from '@/lib/messages/marks';
import { type Thread, useReply, useThread } from '@/lib/messages/queries';
import { byDay, clock } from '@/lib/messages/view';

import { Monogram } from './ConversationList';

interface PaneProps {
  threadId: number;
  /** The signed-in person: their messages sit on the right. */
  meId: number | undefined;
  meName: string;
  /** Shows a Back button in the header (the conversation on its own page). */
  onBack?: () => void;
}

/** One conversation: who it's between, the messages by day, and a reply box. */
export function ConversationPane({ threadId, meId, meName, onBack }: PaneProps) {
  const thread = useThread(threadId);
  const last = thread.data?.messages[thread.data.messages.length - 1]?.created_at;
  useEffect(() => {
    if (last) markOpened(threadId, last);
  }, [threadId, last]);

  if (thread.isPending) return <Loading label="Opening the conversation" />;
  if (thread.isError) return <ErrorText message={thread.error.message} />;
  const t = thread.data;
  return (
    <View style={styles.pane}>
      <Header t={t} onBack={onBack} />
      <Body t={t} meId={meId} meName={meName} />
      {t.can_reply ? (
        <Composer threadId={t.id} />
      ) : (
        <Text style={styles.readOnly}>You can read this conversation. The teacher and the family write in it.</Text>
      )}
    </View>
  );
}

function Header({ t, onBack }: { t: Thread; onBack?: () => void }) {
  const starred = useMarks().starred.includes(t.id);
  return (
    <View style={styles.head}>
      {onBack ? <IconButton icon="chevronLeft" label="Back to messages" onPress={onBack} /> : null}
      <Monogram name={t.student.name} size={48} strong />
      <View style={styles.headText}>
        <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
          {t.subject}
        </Text>
        <Text style={styles.people} numberOfLines={1}>
          {t.student.name} · {t.staff.name}
        </Text>
      </View>
      <IconButton icon="star" label={starred ? 'Unstar this conversation' : 'Star this conversation'} variant={starred ? 'outline' : 'plain'} onPress={() => flipStar(t.id)} />
    </View>
  );
}

function Body({ t, meId, meName }: { t: Thread; meId: number | undefined; meName: string }) {
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  return (
    <ScrollView ref={scroll} style={styles.flex} contentContainerStyle={styles.body} onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}>
      {t.messages.length === 0 ? <Text style={styles.day}>No messages yet.</Text> : null}
      {byDay(t.messages).map((d) => (
        <View key={d.key} style={styles.dayGroup}>
          <Text style={styles.day}>{d.label}</Text>
          {d.messages.map((m) => {
            const mine = m.author.id === meId;
            return (
              <View key={m.id} style={[styles.msg, mine && styles.msgMine]} accessible accessibilityLabel={`${mine ? 'You' : m.author.name}, ${clock(m.created_at)}: ${m.body}`}>
                <Monogram name={mine ? meName || m.author.name : m.author.name} size={38} strong={mine} />
                <View style={[styles.msgCol, mine && styles.msgColMine]}>
                  <View style={[styles.msgMeta, mine && styles.msgMetaMine]}>
                    <Text style={styles.author}>{mine ? 'You' : m.author.name}</Text>
                    <Text style={styles.time}>{clock(m.created_at)}</Text>
                  </View>
                  <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                    <Text style={[styles.text, mine && styles.textMine]}>{m.body}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

function Composer({ threadId }: { threadId: number }) {
  const [text, setText] = useState('');
  const reply = useReply(threadId);
  const empty = text.trim() === '';
  const send = async () => {
    if (empty || reply.isPending) return;
    await reply.mutateAsync(text.trim());
    setText('');
  };
  return (
    <View style={styles.composeWrap}>
      <ErrorText message={reply.error?.message} />
      <View style={styles.compose}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={Maple.muted}
          accessibilityLabel="Reply"
          maxLength={4000}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <IconButton icon="send" label="Send" variant="primary" disabled={empty || reply.isPending} onPress={send} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pane: { flex: 1, minWidth: 0 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: Maple.border },
  headText: { flex: 1, minWidth: 0, gap: 2 },
  title: { ...TypeScale.sectionTitle, color: Maple.navy },
  people: { ...TypeScale.bodySecondary, color: Maple.body },
  body: { paddingVertical: 18, gap: 18 },
  dayGroup: { gap: 18 },
  day: { alignSelf: 'center', ...TypeScale.meta, color: Maple.secondary },
  msg: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, maxWidth: '86%' },
  msgMine: { flexDirection: 'row-reverse', alignSelf: 'flex-end' },
  msgCol: { flexShrink: 1, gap: 6 },
  msgColMine: { alignItems: 'flex-end' },
  msgMeta: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  msgMetaMine: { flexDirection: 'row-reverse' },
  author: { ...TypeScale.label, fontWeight: '600', color: Maple.navy },
  time: { ...TypeScale.meta, color: Maple.secondary },
  bubble: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14 },
  bubbleTheirs: { backgroundColor: Maple.blueSoft, borderTopLeftRadius: 4 },
  bubbleMine: { backgroundColor: Maple.blue, borderTopRightRadius: 4 },
  text: { ...TypeScale.body, color: Maple.navy },
  textMine: { color: Maple.white },
  readOnly: { paddingTop: 14, borderTopWidth: 1, borderTopColor: Maple.border, ...TypeScale.bodySecondary, color: Maple.secondary },
  composeWrap: { gap: 6, paddingTop: 14, borderTopWidth: 1, borderTopColor: Maple.border },
  compose: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: { flex: 1, height: 46, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: Maple.borderStrong, backgroundColor: Maple.surface, ...TypeScale.body, color: Maple.navy },
});
