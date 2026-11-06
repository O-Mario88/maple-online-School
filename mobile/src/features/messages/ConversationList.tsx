import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { SearchField } from '@/components/ui';
import { Maple, TypeScale } from '@/constants/maple';
import type { IconName } from '@/lib/icons';
import type { ThreadSummary } from '@/lib/messages/queries';
import { type Folder, folderCount, FOLDERS, listDate, type Marks } from '@/lib/messages/view';

const FOLDER_ICON: Readonly<Record<Folder, IconName>> = {
  all: 'chat',
  unread: 'bell',
  starred: 'star',
  academic: 'cap',
  admissions: 'clipboard',
  events: 'calendar',
  announcements: 'megaphone',
  archived: 'folder',
};

/** Two initials in a circle: navy when it marks the open conversation or the signed-in person. */
export function Monogram({ name, size = 44, strong = false }: { name: string; size?: number; strong?: boolean }) {
  const letters = name
    .replace(/^(Mr|Mrs|Ms|Dr|Prof)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <View style={[styles.mono, strong && styles.monoStrong, { width: size, height: size, borderRadius: size / 2 }]} accessible={false}>
      <Text style={[styles.monoText, strong && styles.monoTextStrong, { fontSize: Math.round(size * 0.36) }]}>{letters}</Text>
    </View>
  );
}

interface RailProps {
  threads: readonly ThreadSummary[];
  folder: Folder;
  onFolder: (f: Folder) => void;
  marks: Marks;
  me: string;
  /** A single scrolling row above the list, for narrower windows. */
  horizontal?: boolean;
}

/** The folders: All, Unread and Starred with their counts, then the topics. */
export function FolderRail({ threads, folder, onFolder, marks, me, horizontal = false }: RailProps) {
  const items = FOLDERS.map((f) => {
    const on = f.key === folder;
    const count = f.key === 'all' || f.key === 'unread' ? folderCount(threads, f.key, marks, me) : 0;
    return (
      <Pressable
        key={f.key}
        onPress={() => onFolder(f.key)}
        style={({ hovered }: { hovered?: boolean }) => [styles.folder, horizontal && styles.folderRow, on ? styles.folderOn : hovered && styles.folderHover]}
        accessibilityRole="tab"
        accessibilityState={{ selected: on }}
        accessibilityLabel={count ? `${f.label}, ${count}` : f.label}>
        <Icon name={FOLDER_ICON[f.key]} size={20} color={on ? Maple.white : Maple.navy} />
        <Text style={[styles.folderText, on && styles.folderTextOn]} numberOfLines={1}>
          {f.label}
        </Text>
        {count ? (
          <View style={[styles.count, on ? styles.countOn : f.key === 'unread' && styles.countUnread]}>
            <Text style={[styles.countText, on && styles.countTextOn]}>{count}</Text>
          </View>
        ) : null}
      </Pressable>
    );
  });
  if (horizontal) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railRow} accessibilityRole="tablist">
        {items}
      </ScrollView>
    );
  }
  return (
    <View style={styles.rail} accessibilityRole="tablist">
      {items}
    </View>
  );
}

interface ListProps {
  threads: readonly ThreadSummary[];
  query: string;
  onQuery: (q: string) => void;
  selected: number | null;
  onOpen: (id: number) => void;
  unread: (t: ThreadSummary) => boolean;
  empty: string;
  now: Date;
  /** On phones the list grows with the page instead of scrolling on its own. */
  inline?: boolean;
}

/** Search and the conversations, newest first, the open one tinted gold. */
export function ConversationList({ threads, query, onQuery, selected, onOpen, unread, empty, now, inline = false }: ListProps) {
  const rows = threads.map((t, i) => (
    <Row key={t.id} t={t} on={t.id === selected} dot={unread(t)} last={i === threads.length - 1} onOpen={onOpen} now={now} />
  ));
  return (
    <View style={[styles.list, inline && styles.listInline]}>
      <View style={styles.search}>
        <SearchField label="Search conversations" placeholder="Search conversations..." value={query} onChangeText={onQuery} />
      </View>
      {threads.length === 0 ? (
        <Text style={styles.empty}>{empty}</Text>
      ) : inline ? (
        <View>{rows}</View>
      ) : (
        <ScrollView style={styles.flex} contentContainerStyle={styles.rows}>
          {rows}
        </ScrollView>
      )}
    </View>
  );
}

function Row({ t, on, dot, last, onOpen, now }: { t: ThreadSummary; on: boolean; dot: boolean; last: boolean; onOpen: (id: number) => void; now: Date }) {
  const preview = t.last_body ? `${t.last_author ? `${t.last_author}: ` : ''}${t.last_body}` : `About ${t.student.name}`;
  return (
    <Pressable
      onPress={() => onOpen(t.id)}
      style={({ hovered }: { hovered?: boolean }) => [styles.row, on ? styles.rowOn : hovered && styles.rowHover, !last && !on && styles.rowLine]}
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      accessibilityLabel={`${t.subject}${dot ? ', unread' : ''}. ${preview}`}>
      <Monogram name={t.student.name} strong={on} />
      <View style={styles.rowText}>
        <View style={styles.rowTop}>
          <Text style={styles.subject} numberOfLines={1}>
            {t.subject}
          </Text>
          <Text style={styles.date}>{listDate(t.last_message_at, now)}</Text>
        </View>
        <View style={styles.rowTop}>
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
          {dot ? <View style={styles.dot} /> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  mono: { alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.blueSoft },
  monoStrong: { backgroundColor: Maple.blue },
  monoText: { ...TypeScale.label, color: Maple.navy },
  monoTextStrong: { color: Maple.white },
  rail: { gap: 4 },
  railRow: { gap: 6, paddingBottom: 4 },
  folder: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 46, paddingHorizontal: 12, borderRadius: 10 },
  folderRow: { height: 40, gap: 8, paddingHorizontal: 12 },
  folderOn: { backgroundColor: Maple.blue },
  folderHover: { backgroundColor: Maple.blueSoft },
  folderText: { flexShrink: 1, ...TypeScale.nav, color: Maple.navy },
  folderTextOn: { color: Maple.white },
  count: { minWidth: 24, height: 22, marginLeft: 'auto', paddingHorizontal: 7, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.blueSoft },
  countOn: { backgroundColor: Maple.white },
  countUnread: { backgroundColor: Maple.goldSoft },
  countText: { ...TypeScale.meta, fontWeight: '600', color: Maple.navy },
  countTextOn: { color: Maple.blue },
  list: { flex: 1, minWidth: 0 },
  listInline: { flex: 0 },
  search: { paddingBottom: 12 },
  rows: { paddingBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12 },
  rowOn: { backgroundColor: Maple.goldTint },
  rowHover: { backgroundColor: Maple.subtle },
  rowLine: { borderBottomWidth: 1, borderBottomColor: Maple.border, borderRadius: 0 },
  rowText: { flex: 1, minWidth: 0, gap: 4 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subject: { flex: 1, ...TypeScale.cardTitle, color: Maple.navy },
  date: { ...TypeScale.meta, color: Maple.secondary },
  preview: { flex: 1, ...TypeScale.bodySecondary, color: Maple.body },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Maple.blue },
  empty: { paddingVertical: 28, paddingHorizontal: 12, ...TypeScale.body, color: Maple.secondary },
});
