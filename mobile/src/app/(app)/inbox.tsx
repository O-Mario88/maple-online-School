import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, EmptyState, ErrorText, Loading, Screen } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import type { IconName } from '@/lib/icons';
import { appLink, type Notification, timeAgo } from '@/lib/inbox/inbox';
import { useInbox, useMarkRead } from '@/lib/inbox/queries';

const KIND_ICONS: Partial<Record<string, IconName>> = {
  invoice: 'wallet',
  payment: 'check',
  family_link: 'people',
};

/** Everything that happened that the person should know about. */
export default function InboxScreen() {
  const inbox = useInbox();
  const mark = useMarkRead();
  const unread = inbox.data?.filter((n) => !n.read_at).length ?? 0;

  return (
    <Screen
      back
      title="Notifications"
      subtitle="Invoices, payments and what your school has confirmed"
      actions={
        unread > 0 ? (
          <Button label="Mark all read" variant="secondary" compact icon="check" busy={mark.isPending} onPress={() => mark.mutate('all')} />
        ) : undefined
      }>
      <ErrorText message={mark.error?.message} />
      {inbox.isPending ? (
        <Loading label="Loading notifications" />
      ) : inbox.isError ? (
        <ErrorText message={inbox.error.message} />
      ) : inbox.data.length === 0 ? (
        <EmptyState icon="bell" title="You're all caught up" body="New invoices, receipts and school decisions will appear here." />
      ) : (
        <Card>
          {inbox.data.map((n) => (
            <NoteRow
              key={n.id}
              note={n}
              onOpen={() => {
                if (!n.read_at) mark.mutate(n.id);
                router.navigate(appLink(n.link) as Href);
              }}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}

function NoteRow({ note, onOpen }: { note: Notification; onOpen: () => void }) {
  const { theme, styles } = useStyles(makeStyles);
  const unread = !note.read_at;
  return (
    <Pressable
      onPress={onOpen}
      style={({ hovered, pressed }) => [styles.row, (hovered || pressed) && styles.rowHover]}
      accessibilityRole="button"
      accessibilityLabel={`${unread ? 'Unread: ' : ''}${note.title}. ${note.body}`}>
      <View style={[styles.icon, unread && styles.iconUnread]}>
        <Icon name={KIND_ICONS[note.kind] ?? 'bell'} size={18} color={unread ? theme.accentText : theme.textSecondary} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, unread && styles.titleUnread]}>{note.title}</Text>
        {note.body ? <Text style={styles.body}>{note.body}</Text> : null}
        <Text style={styles.time}>{timeAgo(note.created_at, new Date())}</Text>
      </View>
      {unread ? <View style={styles.dot} /> : null}
    </Pressable>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.three,
      padding: Spacing.three,
      marginHorizontal: -Spacing.three,
      borderRadius: Radius.md,
    },
    rowHover: { backgroundColor: t.backgroundSelected },
    icon: {
      width: 36,
      height: 36,
      borderRadius: Radius.md,
      backgroundColor: t.backgroundSelected,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconUnread: { backgroundColor: t.accentSoft },
    text: { flex: 1, gap: 2 },
    title: { ...Type.body, color: t.text },
    titleUnread: { fontWeight: '700' },
    body: { ...Type.small, color: t.textSecondary },
    time: { ...Type.caption, color: t.textMuted, marginTop: Spacing.one },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.accent, marginTop: Spacing.two },
  });
}
