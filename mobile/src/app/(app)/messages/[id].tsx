import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner, Button, Card, ErrorText, Field, Loading, Screen } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useMe } from '@/lib/auth/auth-context';
import { timeAgo } from '@/lib/inbox/inbox';
import { type Thread, useReply, useThread } from '@/lib/messages/queries';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const threadId = Number(id);
  const thread = useThread(threadId);

  if (thread.isPending) {
    return (
      <Screen back title="Conversation">
        <Loading label="Opening the conversation" />
      </Screen>
    );
  }
  if (thread.isError) {
    return (
      <Screen back title="Conversation">
        <ErrorText message={thread.error.message} />
      </Screen>
    );
  }
  const t = thread.data;
  return (
    <Screen back eyebrow={`About ${t.student.name}`} title={t.subject} subtitle={`With ${t.staff.name}`}>
      <Messages thread={t} />
      {t.can_reply ? (
        <ReplyBox threadId={t.id} />
      ) : (
        <Banner tone="info" title="You can read this conversation" body="School leaders can read every conversation; the teacher and the family write in it." />
      )}
    </Screen>
  );
}

function Messages({ thread }: { thread: Thread }) {
  const { styles } = useStyles(makeStyles);
  const me = useMe();
  const now = new Date();
  return (
    <View style={styles.list} accessibilityRole="list">
      {thread.messages.map((m) => {
        const mine = m.author.id === me.data?.id;
        return (
          <View key={m.id} style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
            <View style={[styles.bubble, mine ? styles.mine : styles.theirs]} accessible accessibilityLabel={`${m.author.name}: ${m.body}`}>
              {mine ? null : <Text style={styles.author}>{m.author.name}</Text>}
              <Text style={styles.body}>{m.body}</Text>
              <Text style={styles.time}>{timeAgo(m.created_at, now)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function ReplyBox({ threadId }: { threadId: number }) {
  const { styles } = useStyles(makeStyles);
  const [text, setText] = useState('');
  const reply = useReply(threadId);
  async function send() {
    await reply.mutateAsync(text);
    setText('');
  }
  return (
    <Card>
      <Field label="Reply" value={text} onChangeText={setText} multiline maxLength={4000} placeholder="Write your reply…" />
      <ErrorText message={reply.error?.message} />
      <View style={styles.actions}>
        <Button label="Send" icon="check" busy={reply.isPending} disabled={text.trim() === ''} onPress={send} />
      </View>
    </Card>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    list: { gap: Spacing.two },
    bubbleRow: { flexDirection: 'row' },
    bubbleRowMine: { justifyContent: 'flex-end' },
    bubble: { maxWidth: '82%', padding: Spacing.three, borderRadius: Radius.lg, gap: 2 },
    mine: { backgroundColor: t.accentSoft, borderBottomRightRadius: Radius.sm },
    theirs: { backgroundColor: t.backgroundElement, borderWidth: 1, borderColor: t.border, borderBottomLeftRadius: Radius.sm },
    author: { ...Type.caption, color: t.accentText },
    body: { ...Type.body, color: t.text },
    time: { ...Type.caption, fontSize: 11, color: t.textMuted, alignSelf: 'flex-end' },
    actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  });
}
