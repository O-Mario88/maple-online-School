import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar, Button, Card, EmptyState, ErrorText, Loading, Screen } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useMe } from '@/lib/auth/auth-context';
import { timeAgo } from '@/lib/inbox/inbox';
import { type ThreadSummary, useThreads } from '@/lib/messages/queries';

/** Conversations between the school and families (inventory screen 57). */
export default function MessagesScreen() {
  const threads = useThreads();
  const me = useMe();
  const canStart = me.data ? me.data.children.length > 0 || me.data.memberships.some((m) => m.status === 'active' && m.role !== 'student') : false;

  return (
    <Screen
      width="wide"
      title="Messages"
      subtitle="Conversations about a learner, between the family and the school"
      actions={canStart ? <Button label="New conversation" icon="plus" compact onPress={() => router.push('/messages/new')} /> : undefined}>
      {threads.isPending ? (
        <Loading label="Loading conversations" />
      ) : threads.isError ? (
        <ErrorText message={threads.error.message} />
      ) : threads.data.length === 0 ? (
        <EmptyState
          icon="people"
          title="No conversations yet"
          body="Teachers and families can write to each other about a learner. School leaders can read every conversation."
        />
      ) : (
        <Card>
          {threads.data.map((t) => (
            <ThreadRow key={t.id} thread={t} />
          ))}
        </Card>
      )}
    </Screen>
  );
}

function ThreadRow({ thread }: { thread: ThreadSummary }) {
  const { styles } = useStyles(makeStyles);
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/messages/[id]', params: { id: String(thread.id) } })}
      style={({ hovered, pressed }) => [styles.row, (hovered || pressed) && styles.rowHover]}
      accessibilityRole="button"
      accessibilityLabel={`${thread.subject}, about ${thread.student.name}, with ${thread.staff.name}`}>
      <Avatar name={thread.student.name} size={40} />
      <View style={styles.text}>
        <View style={styles.top}>
          <Text style={styles.subject} numberOfLines={1}>
            {thread.subject}
          </Text>
          <Text style={styles.time}>{timeAgo(thread.last_message_at, new Date())}</Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          About {thread.student.name} · with {thread.staff.name}
        </Text>
        {thread.last_body ? (
          <Text style={styles.preview} numberOfLines={2}>
            {thread.last_author ? `${thread.last_author.split(' ')[0]}: ` : ''}
            {thread.last_body}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    row: { flexDirection: 'row', gap: Spacing.three, padding: Spacing.three, marginHorizontal: -Spacing.three, borderRadius: Radius.md },
    rowHover: { backgroundColor: t.backgroundSelected },
    text: { flex: 1, gap: 2 },
    top: { flexDirection: 'row', alignItems: 'baseline', gap: Spacing.two },
    subject: { ...Type.bodyStrong, color: t.text, flex: 1 },
    time: { ...Type.caption, color: t.textMuted },
    meta: { ...Type.caption, color: t.textSecondary },
    preview: { ...Type.small, color: t.textSecondary },
  });
}
