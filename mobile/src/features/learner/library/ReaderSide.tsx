import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { IconName } from '@/lib/icons';

import { openBook } from './ShelfParts';
import type { Hub } from './useShelf';
import { Maple } from '@/constants/maple';

const INK = Maple.navy;
const NAVY = Maple.blueHover;
const BODY = Maple.body;
const BLUE = Maple.blue;

const MENU_ICONS: readonly IconName[] = ['library', 'book', 'list', 'grid', 'download', 'edit', 'clock'];
const LIST_TONES = [Maple.blueSelected, Maple.blueSoft, Maple.errorSoft, Maple.errorSoft] as const;

const toLibrary = (params: { subject?: string; q?: string } = {}) => router.push({ pathname: '/learn/library', params });

/** Search box and type chips; both open the library page with the search or type applied. */
export function ReaderSearch({ hub, phone = false }: { hub: Hub; phone?: boolean }) {
  const [q, setQ] = useState('');
  return (
    <View style={styles.searchCol}>
      <View style={styles.search}>
        <Icon name="search" size={15} color={BODY} />
        <TextInput style={styles.searchInput} value={q} onChangeText={setQ} onSubmitEditing={() => toLibrary({ q: q.trim() })} placeholder="Search books, topics, or authors..." placeholderTextColor={Maple.secondary} returnKeyType="search" accessibilityLabel="Search the library" />
      </View>
      <View style={[styles.types, phone && styles.typesP]}>
        {hub.reader.types.map((t, i) => (
          <Pressable key={t} style={[styles.type, i === 0 && styles.typeOn]} onPress={() => (i === 0 ? null : toLibrary())} accessibilityRole="button" accessibilityState={{ selected: i === 0 }}>
            <Text style={[styles.typeText, i === 0 && styles.typeTextOn]}>{t}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** The seven shelves across the top; the open book's shelf is highlighted. */
export function ShelfTiles({ hub, current }: { hub: Hub; current: string }) {
  return (
    <View style={styles.tiles}>
      {hub.reader.shelf.map((t, i) => {
        const on = t.name === current;
        return (
          <Pressable key={t.name} style={[styles.tile, i === 0 && styles.tileFirst, on && styles.tileOn]} onPress={() => toLibrary(i < 5 ? { subject: t.name } : {})} accessibilityRole="link" accessibilityLabel={`${t.name}, ${t.count}`}>
            <Image source={t.icon} style={styles.tileIcon} contentFit="contain" />
            <View>
              <Text style={styles.tileName}>{t.name}</Text>
              <Text style={styles.tileCount}>{t.count}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ReaderMenu({ hub, onNotes, onDecks }: { hub: Hub; onNotes: () => void; onDecks: () => void }) {
  return (
    <View style={styles.menu}>
      {hub.reader.menu.map((m, i) => (
        <Pressable
          key={m}
          style={[styles.menuItem, i === 0 && styles.menuOn]}
          onPress={() => (m === 'Notes & Highlights' ? onNotes() : m === 'Flashcard Decks' ? onDecks() : toLibrary())}
          accessibilityRole="link">
          <Icon name={MENU_ICONS[i]} size={17} color={i === 0 ? BLUE : Maple.body} />
          <Text style={[styles.menuText, i === 0 && styles.menuTextOn]}>{m}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Recommended({ hub }: { hub: Hub }) {
  return (
    <View>
      <View style={styles.headRow}>
        <Text style={styles.head}>Recommended for You</Text>
        <Pressable onPress={() => toLibrary()} accessibilityRole="link">
          <Text style={styles.link}>See All</Text>
        </Pressable>
      </View>
      <View style={styles.recList}>
        {hub.reader.recommended.map((r) => {
          const b = hub.books.find((x) => x.title === r.title);
          return (
            <Pressable key={r.title} style={styles.rec} onPress={() => (b ? openBook(b.id) : toLibrary({ q: r.title }))} accessibilityRole="link">
              <Image source={r.cover} style={styles.recCover} contentFit="cover" />
              <View style={styles.flex}>
                <Text style={styles.recTitle}>{r.title}</Text>
                <Text style={styles.recMeta}>{r.meta}</Text>
                <Text style={styles.recRate}>
                  <Text style={styles.gold}>★</Text> {r.rating}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function AutoCard({ hub, onDecks }: { hub: Hub; onDecks: () => void }) {
  return (
    <View style={styles.auto}>
      <View style={styles.autoHead}>
        <Image source={hub.reader.deckIcon} style={styles.autoIcon} contentFit="contain" />
        <View style={styles.flex}>
          <Text style={styles.autoTitle}>Auto-Generated Flashcards</Text>
          <Text style={styles.autoText}>Flashcards created from your recent classes and notes.</Text>
        </View>
      </View>
      <Pressable style={styles.autoBtn} onPress={onDecks} accessibilityRole="button">
        <Text style={styles.autoBtnText}>View My Decks</Text>
        <Icon name="arrowRight" size={15} color={Maple.surface} />
      </Pressable>
    </View>
  );
}

export function ReadingLists({ hub, toast, phone = false }: { hub: Hub; toast: (m: string) => void; phone?: boolean }) {
  return (
    <View style={styles.lists}>
      <View style={styles.headRow}>
        <Text style={styles.head}>Teacher Reading Lists</Text>
        <Pressable style={styles.seeAll} onPress={() => toLibrary()} accessibilityRole="link">
          <Text style={styles.link}>See All</Text>
          <Icon name="arrowRight" size={12} color={BLUE} />
        </Pressable>
      </View>
      <View style={[styles.listRow, phone && styles.listCol]}>
        {hub.reader.lists.map((l, i) => (
          <Pressable key={l.title} style={phone ? styles.listP : styles.list} onPress={() => toast(`${l.title} • ${l.count} from ${l.who}`)} accessibilityRole="button">
            <View style={[styles.listIconBox, { backgroundColor: LIST_TONES[i] }]}>
              <Image source={l.icon} style={styles.listIcon} contentFit="contain" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.listTitle}>{l.title}</Text>
              <Text style={styles.listMeta}>{l.who}</Text>
              <Text style={styles.listMeta}>{l.count}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  searchCol: { gap: 12 },
  search: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, borderRadius: 6, borderWidth: 1, borderColor: Maple.blueLine, backgroundColor: Maple.surface },
  searchInput: { flex: 1, height: 32, paddingVertical: 0, fontSize: 12, color: INK },
  types: { flexDirection: 'row', gap: 5 },
  typesP: { flexWrap: 'wrap' },
  type: { height: 30, justifyContent: 'center', paddingHorizontal: 9, borderRadius: 5, borderWidth: 1, borderColor: Maple.blueLine, backgroundColor: Maple.surface },
  typeOn: { borderColor: Maple.blue, backgroundColor: Maple.blue },
  typeText: { fontSize: 11, color: INK },
  typeTextOn: { fontWeight: '600', color: Maple.surface },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flexGrow: 1, flexShrink: 1, flexBasis: 0, height: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, borderRadius: 8, backgroundColor: Maple.surface },
  tileFirst: { flexGrow: 0, flexShrink: 0, flexBasis: 218, marginLeft: 14 },
  tileOn: { backgroundColor: Maple.blueSelected },
  tileIcon: { width: 34, height: 34 },
  tileName: { fontSize: 12.5, fontWeight: '500', color: INK },
  tileCount: { marginTop: 3, fontSize: 10.5, color: BODY },
  menu: { gap: 4 },
  menuItem: { height: 33, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 14, borderRadius: 6 },
  menuOn: { backgroundColor: Maple.blueSelected },
  menuText: { fontSize: 13, color: Maple.navy },
  menuTextOn: { fontWeight: '500', color: BLUE },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  head: { fontSize: 14, fontWeight: '700', color: INK },
  link: { fontSize: 11.5, color: BLUE },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  recList: { gap: 14, marginTop: 14 },
  rec: { flexDirection: 'row', gap: 12 },
  recCover: { width: 44, height: 50, borderRadius: 3 },
  recTitle: { fontSize: 12.5, fontWeight: '500', color: NAVY },
  recMeta: { marginTop: 2, fontSize: 11.5, color: BODY },
  recRate: { marginTop: 2, fontSize: 11, color: BODY },
  gold: { color: Maple.warning },
  auto: { gap: 14, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.surface },
  autoHead: { flexDirection: 'row', gap: 10 },
  autoIcon: { width: 34, height: 34 },
  autoTitle: { fontSize: 12.5, fontWeight: '600', color: INK },
  autoText: { marginTop: 4, fontSize: 11.5, lineHeight: 16, color: BODY },
  autoBtn: { height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 4, backgroundColor: Maple.blue },
  autoBtnText: { fontSize: 13, fontWeight: '500', color: Maple.surface },
  lists: { gap: 12 },
  listRow: { flexDirection: 'row', gap: 12 },
  listCol: { flexDirection: 'column', gap: 8 },
  list: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.surface },
  // Phones: a whole style (a `flex: 0` override collapses the rows on the web).
  listP: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.surface },
  listIconBox: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  listIcon: { width: 30, height: 30 },
  listTitle: { fontSize: 12, fontWeight: '500', color: INK },
  listMeta: { marginTop: 2, fontSize: 11, color: BODY },
});
