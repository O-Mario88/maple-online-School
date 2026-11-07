import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ErrorText, Loading, useContentWidth } from '@/components/ui';
import { Maple } from '@/constants/maple';
import { useMe } from '@/lib/auth/auth-context';
import { useMarks } from '@/lib/messages/marks';
import { type ThreadSummary, useThreads } from '@/lib/messages/queries';
import { type Folder, FOLDERS, inFolder, matches } from '@/lib/messages/view';

import { ConversationList, FolderRail } from './ConversationList';
import { ConversationPane } from './ConversationPane';
import { MessagesHero } from './MessagesHero';
import { PageScroll } from '@/components/shell/PageScroll';

/** Room for the folders, the list and the open conversation side by side. */
const THREE_COLUMNS = 1040;
/** Room for the list beside the open conversation (folders move above the list). */
const TWO_COLUMNS = 720;
/** The card fits the window under the header and banner, within these bounds. */
const CARD_MIN = 460;
const CARD_MAX = 760;
const ABOVE_CARD = 400;

/** Messages: the banner, then folders, conversations and the open conversation in one card. */
export function MessagesPage() {
  const width = useContentWidth();
  const { height } = useWindowDimensions();
  const layout = width >= THREE_COLUMNS ? 'three' : width >= TWO_COLUMNS ? 'two' : 'phone';
  const phone = layout === 'phone';
  const threads = useThreads();
  const me = useMe();
  const marks = useMarks();
  const meName = me.data?.full_name ?? '';
  const canStart = me.data ? me.data.children.length > 0 || me.data.memberships.some((m) => m.status === 'active' && m.role !== 'student') : false;
  const [folder, setFolder] = useState<Folder>('all');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<number | null>(null);
  // Unread keeps what was unread when it opened, so reading one doesn't pull it out from under you.
  const [keptUnread, setKeptUnread] = useState<readonly number[]>([]);
  const now = useMemo(() => new Date(), []);

  const all = useMemo(() => threads.data ?? [], [threads.data]);
  const shown = useMemo(
    () => all.filter((t) => (inFolder(t, folder, marks, meName) || (folder === 'unread' && keptUnread.includes(t.id))) && matches(t, query)),
    [all, folder, marks, meName, keptUnread, query],
  );
  // The picked conversation while it's in the list, else the newest one shown.
  const open = shown.some((t) => t.id === picked) ? picked : (shown[0]?.id ?? null);
  const unread = (t: ThreadSummary) => inFolder(t, 'unread', marks, meName);
  const chooseFolder = (f: Folder) => {
    setFolder(f);
    if (f === 'unread') setKeptUnread(all.filter(unread).map((t) => t.id));
  };
  const openThread = (id: number) => (phone ? router.push({ pathname: '/messages/[id]', params: { id: String(id) } }) : setPicked(id));
  const label = FOLDERS.find((f) => f.key === folder)?.label ?? '';
  const empty =
    all.length === 0
      ? 'No conversations yet. Teachers and families can write to each other about a learner, and school leaders can read every conversation.'
      : query.trim()
        ? `No conversations match "${query.trim()}".`
        : `Nothing in ${label} yet.`;

  const list = (
    <ConversationList threads={shown} query={query} onQuery={setQuery} selected={phone ? null : open} onOpen={openThread} unread={unread} empty={empty} now={now} inline={phone} />
  );

  let content;
  if (threads.isPending) content = <Loading label="Loading conversations" />;
  else if (threads.isError) content = <ErrorText message={threads.error.message} />;
  else if (phone) content = list;
  else
    content = (
      <View style={styles.columns}>
        {layout === 'three' ? (
          <View style={styles.railCol}>
            <FolderRail threads={all} folder={folder} onFolder={chooseFolder} marks={marks} me={meName} />
          </View>
        ) : null}
        <View style={[styles.listCol, layout === 'two' && styles.listColWide]}>
          {layout === 'two' ? (
            <View style={styles.railRow}>
              <FolderRail threads={all} folder={folder} onFolder={chooseFolder} marks={marks} me={meName} horizontal />
            </View>
          ) : null}
          {list}
        </View>
        <View style={styles.threadCol}>{open !== null ? <ConversationPane key={open} threadId={open} meId={me.data?.id} meName={meName} /> : null}</View>
      </View>
    );

  return (
    <PageScroll style={styles.page} contentContainerStyle={styles.pageContent} keyboardShouldPersistTaps="handled">
      <MessagesHero phone={phone} canStart={canStart} />
      <View style={[styles.card, phone ? styles.cardPhone : { height: Math.min(CARD_MAX, Math.max(CARD_MIN, height - ABOVE_CARD)) }]}>{content}</View>
    </PageScroll>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Maple.canvas },
  // Room to scroll the card's reply box clear of the floating Ask Maple button.
  pageContent: { paddingBottom: 96 },
  card: {
    marginTop: -36,
    marginHorizontal: 16,
    padding: 22,
    borderRadius: 20,
    backgroundColor: Maple.surface,
    borderWidth: 1,
    borderColor: Maple.border,
    shadowColor: Maple.navy,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
  },
  cardPhone: { marginTop: -24, marginHorizontal: 12, padding: 14, borderRadius: 18 },
  columns: { flex: 1, flexDirection: 'row', gap: 20 },
  railCol: { width: 236, paddingRight: 16, borderRightWidth: 1, borderRightColor: Maple.border },
  listCol: { width: 340, paddingRight: 20, borderRightWidth: 1, borderRightColor: Maple.border },
  listColWide: { width: 320 },
  railRow: { paddingBottom: 12 },
  threadCol: { flex: 1, minWidth: 0 },
});
