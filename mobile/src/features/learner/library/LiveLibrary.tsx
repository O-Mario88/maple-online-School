import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { useMe } from '@/lib/auth/auth-context';
import type { IconName } from '@/lib/icons';
import { dueLabel, itemDetail, itemHref, libraryChoices, type LibraryItem, MEDIA_URL, typeLabel } from '@/lib/library/library';
import { useAssignedReading, useContinue, useLibrary, useRecordProgress } from '@/lib/library/queries';
import { isStaff } from '@/lib/roles';
import { toast } from '@/lib/toast';

import { LibraryStaff } from './LibraryStaff';

const INK = '#0B1424';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const LINE = '#E6EBF2';

/** A coloured tile per kind of item, standing in for cover art the API doesn't have. */
const TILE: Readonly<Record<string, { icon: IconName; tint: string }>> = {
  video: { icon: 'play', tint: '#7C3AED' },
  mock_exam: { icon: 'clipboard', tint: '#F28C28' },
  worksheet: { icon: 'edit', tint: '#16A34A' },
  textbook: { icon: 'book', tint: '#1463F3' },
  notes: { icon: 'notes', tint: '#0EA5E9' },
  slides: { icon: 'screen', tint: '#DB2777' },
};
const OTHER: { icon: IconName; tint: string } = { icon: 'library', tint: '#475569' };
const tileFor = (type: string) => TILE[type] ?? OTHER;

type Openable = { external_url: string; file_url: string | null };

async function openItem(item: Openable) {
  const href = itemHref(item, MEDIA_URL);
  if (!href) {
    toast('This item has no file or link yet.');
    return;
  }
  try {
    await Linking.openURL(href);
  } catch {
    toast('Could not open this on this device.');
  }
}

function Tile({ type, size }: { type: string; size: number }) {
  const t = tileFor(type);
  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: t.tint }]}>
      <Icon name={t.icon} size={Math.round(size * 0.42)} color="#FFFFFF" />
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.h2} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

function Bar({ pct }: { pct: number }) {
  return (
    <View style={styles.bar}>
      <View style={[styles.barFill, { width: `${Math.max(2, Math.min(100, pct))}%` }]} />
    </View>
  );
}

/** Unfinished items, in a row, each opening where the learner left off. */
function ContinueRow() {
  const items = useContinue(true);
  if (items.isPending || items.error || items.data.length === 0) return null;
  return (
    <Section title="Continue Reading">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {items.data.map((c) => {
          const pct = Math.round(Number(c.completion_percentage));
          return (
            <Pressable key={c.item} style={styles.continueCard} onPress={() => openItem(c)} accessibilityRole="button" accessibilityLabel={`Continue ${c.title}, ${pct}% done`}>
              <Tile type={c.content_type} size={48} />
              <View style={styles.flex}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {c.title}
                </Text>
                <Text style={styles.muted}>{`${pct}% done`}</Text>
                <Bar pct={pct} />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </Section>
  );
}

/** Reading the learner's teachers set, soonest due first, with a way to mark it done. */
function AssignedList({ learner }: { learner: boolean }) {
  const assigned = useAssignedReading();
  const progress = useRecordProgress();
  if (assigned.isPending) return <ActivityIndicator color={BLUE} accessibilityLabel="Loading assigned reading" />;
  if (assigned.error) return <Text style={styles.error}>{assigned.error.message}</Text>;
  if (assigned.data.length === 0) return null;
  const now = new Date();
  return (
    <Section title={learner ? 'Assigned by your teachers' : 'Reading set for your children'}>
      <View style={styles.panel}>
        {assigned.data.map((a, i) => {
          const pct = a.is_completed ? 100 : Math.round(Number(a.completion_percentage));
          return (
            <View key={a.id} style={[styles.assigned, i > 0 && styles.rule]}>
              <Tile type={a.content_type} size={44} />
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{a.title}</Text>
                <Text style={styles.muted}>{[typeLabel(a.content_type), dueLabel(a.due_date, now), a.note].filter(Boolean).join(' · ')}</Text>
                <Bar pct={pct} />
              </View>
              <View style={styles.actions}>
                <Pressable
                  style={styles.open}
                  onPress={() => {
                    if (learner) progress.mutate({ item: a.item, completion: 0, new_visit: true });
                    openItem(a);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${a.title}`}>
                  <Text style={styles.openText}>Open</Text>
                </Pressable>
                {a.is_completed ? (
                  <Text style={styles.done}>✓ Done</Text>
                ) : !learner ? null : (
                  <Pressable onPress={() => progress.mutate({ item: a.item, completion: 100 })} accessibilityRole="button" accessibilityLabel={`Mark ${a.title} as done`} hitSlop={6}>
                    <Text style={styles.link}>Mark as done</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>
      {progress.error ? <Text style={styles.error}>{progress.error.message}</Text> : null}
    </Section>
  );
}

function ItemCard({ item, wide }: { item: LibraryItem; wide: boolean }) {
  const t = tileFor(item.content_type);
  return (
    <Pressable style={[styles.itemCard, wide ? styles.itemWide : styles.itemPhone]} onPress={() => openItem(item)} accessibilityRole="button" accessibilityLabel={`Open ${item.title}`}>
      <View style={[styles.cover, { backgroundColor: t.tint }]}>
        <Icon name={t.icon} size={30} color="#FFFFFF" />
        <Text style={styles.coverType}>{typeLabel(item.content_type)}</Text>
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.muted} numberOfLines={2}>
        {itemDetail(item)}
      </Text>
    </Pressable>
  );
}

/** The library on the real API: continue reading, assigned reading, and search across everything the learner can see. */
export function LiveLibrary() {
  const { wide } = useShell();
  const me = useMe();
  const role = me.data?.role;
  const learner = role === 'student';
  const staff = me.data ? isStaff(me.data.memberships) || role === 'teacher' || role === 'admin' : false;
  const [search, setSearch] = useState('');
  const items = useLibrary(search);
  const searching = search.trim() !== '';
  return (
    <ScrollView style={styles.bg} contentContainerStyle={[styles.page, wide && styles.pageWide]}>
      <View style={styles.hero}>
        <Text style={styles.h1} accessibilityRole="header">
          Library
        </Text>
        <Text style={styles.body}>Notes, textbooks, past papers and videos from your teachers and Maple.</Text>
        <View style={styles.search}>
          <Icon name="search" size={18} color={BODY} />
          <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search by title or topic" placeholderTextColor="#8A92A3" autoCorrect={false} accessibilityLabel="Search the library" />
        </View>
      </View>
      {searching || !learner ? null : <ContinueRow />}
      {searching || !(learner || role === 'parent') ? null : <AssignedList learner={learner} />}
      <Section title={searching ? `Results for “${search.trim()}”` : 'Browse the Library'}>
        {items.isPending ? <ActivityIndicator color={BLUE} accessibilityLabel="Searching the library" /> : null}
        {items.error ? <Text style={styles.error}>{items.error.message}</Text> : null}
        {items.data?.length === 0 ? <Text style={styles.body}>{searching ? 'Nothing matches that search.' : 'The library is empty for now.'}</Text> : null}
        <View style={styles.grid}>
          {items.data?.map((item) => (
            <ItemCard key={item.id} item={item} wide={wide} />
          ))}
        </View>
      </Section>
      {staff && me.data ? <LibraryStaff choices={libraryChoices(me.data.memberships)} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: { flex: 1, backgroundColor: '#F4F8FD' },
  page: { gap: 22, padding: 16, paddingBottom: 110 },
  pageWide: { width: '100%', maxWidth: 1160, alignSelf: 'center', padding: 24 },
  hero: { gap: 10, padding: 22, borderRadius: 14, backgroundColor: '#E8F0FE' },
  h1: { fontSize: 28, fontWeight: '800', color: INK, letterSpacing: -0.6 },
  h2: { fontSize: 18, fontWeight: '800', color: INK },
  body: { fontSize: 14, lineHeight: 21, color: BODY },
  muted: { fontSize: 12, color: BODY },
  error: { fontSize: 13, color: '#B42318' },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  search: { maxWidth: 520, height: 44, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  searchInput: { flex: 1, height: 42, fontSize: 14, color: INK },
  section: { gap: 12 },
  row: { gap: 12 },
  continueCard: { width: 280, flexDirection: 'row', gap: 12, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: INK },
  tile: { alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  bar: { height: 5, marginTop: 6, borderRadius: 3, overflow: 'hidden', backgroundColor: '#E6ECF5' },
  barFill: { height: 5, borderRadius: 3, backgroundColor: '#22A35A' },
  panel: { borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  assigned: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  rule: { borderTopWidth: 1, borderTopColor: LINE },
  actions: { alignItems: 'flex-end', gap: 6 },
  open: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 7, backgroundColor: BLUE },
  openText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  done: { fontSize: 12.5, fontWeight: '700', color: '#22A35A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  itemCard: { gap: 6, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  itemWide: { width: 200 },
  itemPhone: { width: '47%' },
  cover: { height: 110, alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8 },
  coverType: { fontSize: 11.5, fontWeight: '700', color: '#FFFFFF', letterSpacing: 0.4, textTransform: 'uppercase' },
});
