import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useShell } from '@/components/ui';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { type DeckState, Flashcards, useDecks } from '@/features/learner/library/Flashcards';
import { BookHeader, HighlightBar, PageView, type ReaderState, Toolbar, useReader } from '@/features/learner/library/ReaderPage';
import { AutoCard, ReaderMenu, ReaderSearch, ReadingLists, Recommended, ShelfTiles } from '@/features/learner/library/ReaderSide';
import type { Book, Hub } from '@/features/learner/library/useShelf';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** The opened-resource reference's desktop panel (x 16–1168 of 1536), laid out in its pixels. */
const READER_REF_WIDTH = 1152;
const MAX_DESK_WIDTH = 1400;
const TOAST_MS = 2600;
/** The only book with sample pages in the mock library. */
const SAMPLE_BOOK = 'maths-olevel';
const INK = '#0B1424';
const BODY = '#4A5263';
const BLUE = '#1463F3';

type ReaderProps = { hub: Hub; b: Book; rs: ReaderState; f: DeckState; toast: (m: string) => void; notes: () => void; decks: () => void };

function Desktop({ hub, b, rs, f, toast, notes, decks }: ReaderProps) {
  const sample = b.id === SAMPLE_BOOK;
  return (
    <View style={styles.canvas}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Digital Library</Text>
          <Text style={styles.sub}>Read, explore and learn. E-books, PDFs, reading lists and flashcards to help you go deeper.</Text>
        </View>
        <View style={styles.searchCol}>
          <ReaderSearch hub={hub} />
        </View>
      </View>
      <ShelfTiles hub={hub} current={b.subject} />
      <View style={styles.cols}>
        <View style={styles.left}>
          <ReaderMenu hub={hub} onNotes={notes} onDecks={decks} />
          <View style={styles.rule} />
          <Recommended hub={hub} />
          <AutoCard hub={hub} onDecks={decks} />
        </View>
        <View style={styles.centre}>
          <View style={styles.row}>
            <View style={[styles.card, styles.book]}>
              <BookHeader b={b} hub={hub} rs={rs} />
              <Toolbar hub={hub} rs={rs} />
              <PageView hub={hub} rs={rs} sample={sample} />
              <HighlightBar hub={hub} rs={rs} toast={toast} />
            </View>
            <View style={[styles.card, styles.cards]}>
              <Flashcards hub={hub} f={f} />
            </View>
          </View>
          <ReadingLists hub={hub} toast={toast} />
        </View>
      </View>
    </View>
  );
}

function Phone({ hub, b, rs, f, toast, avatar }: ReaderProps & { avatar: number }) {
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={avatar} />
      <ScrollView contentContainerStyle={styles.phone} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn/library'))} accessibilityRole="link">
          <Icon name="chevronLeft" size={16} color={BLUE} />
          <Text style={styles.backText}>Library</Text>
        </Pressable>
        <BookHeader b={b} hub={hub} rs={rs} phone />
        <View style={styles.phoneBtns}>
          <Pressable style={[styles.phoneBtn, rs.saved && styles.phoneBtnOn]} onPress={rs.toggleSaved} accessibilityRole="button" accessibilityState={{ selected: rs.saved }}>
            <Icon name={rs.saved ? 'bookmarkOn' : 'bookmark'} size={14} color={BLUE} />
            <Text style={styles.phoneBtnText}>{rs.saved ? 'In My Books' : 'Add to My Books'}</Text>
          </Pressable>
          <Pressable style={styles.phoneBtn} onPress={rs.download} disabled={rs.downloaded} accessibilityRole="button">
            <Icon name={rs.downloaded ? 'check' : 'download'} size={14} color={BLUE} />
            <Text style={styles.phoneBtnText}>{rs.downloaded ? 'Downloaded' : 'Download'}</Text>
          </Pressable>
        </View>
        <Toolbar hub={hub} rs={rs} phone />
        <PageView hub={hub} rs={rs} sample={b.id === SAMPLE_BOOK} phone />
        <HighlightBar hub={hub} rs={rs} toast={toast} />
        <View style={styles.phoneCard}>
          <Flashcards hub={hub} f={f} />
        </View>
        <ReadingLists hub={hub} toast={toast} phone />
      </ScrollView>
    </View>
  );
}

function Reader({ hub, b, avatar }: { hub: Hub; b: Book; avatar: number }) {
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  const [toastText, setToastText] = useState<string | null>(null);
  const toast = (m: string) => {
    setToastText(m);
    setTimeout(() => setToastText((t) => (t === m ? null : t)), TOAST_MS);
  };
  const rs = useReader(hub, toast, b.id === SAMPLE_BOOK ? hub.reader.startPage : 1);
  const f = useDecks(hub);
  const props: ReaderProps = {
    hub,
    b,
    rs,
    f,
    toast,
    notes: () => toast(rs.notes.length === 0 ? 'No notes on this page yet. Use Add note below the page.' : `${rs.notes.length} note${rs.notes.length === 1 ? '' : 's'} on page ${rs.page}`),
    decks: () => {
      f.setDeck('My Decks');
      toast('My Decks is open in the Flashcards panel');
    },
  };
  return (
    <View style={styles.flex}>
      {wide ? (
        <ScrollView style={styles.deskBg} contentContainerStyle={styles.deskWrap}>
          <RefScale width={Math.min(width - 32, MAX_DESK_WIDTH)} refWidth={READER_REF_WIDTH}>
            <Desktop {...props} />
          </RefScale>
        </ScrollView>
      ) : (
        <Phone {...props} avatar={avatar} />
      )}
      {toastText ? (
        <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>{toastText}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function LibraryReaderScreen() {
  const mock = useMemo(() => mockData(), []);
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!mock) return <PreviewScreen title="Library">{() => null}</PreviewScreen>;
  const hub = mock.learner.libraryHub;
  const b = hub.books.find((x) => x.id === id);
  if (!b)
    return (
      <View style={styles.missing}>
        <Text style={styles.missingTitle}>We couldn’t find that book</Text>
        <Pressable onPress={() => router.replace('/learn/library')} accessibilityRole="link">
          <Text style={styles.backText}>Back to the library</Text>
        </Pressable>
      </View>
    );
  return <Reader key={b.id} hub={hub} b={b} avatar={mock.learner.dashboard.avatar} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  deskBg: { backgroundColor: '#EEF3FB' },
  deskWrap: { alignItems: 'center', paddingVertical: 16 },
  canvas: { width: READER_REF_WIDTH, gap: 14, paddingBottom: 14, borderRadius: 10, backgroundColor: '#F6F9FD' },
  head: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 24, paddingHorizontal: 21 },
  title: { fontSize: 33, fontWeight: '800', color: INK, letterSpacing: -0.8 },
  sub: { marginTop: 8, fontSize: 14, color: BODY },
  searchCol: { width: 527 },
  cols: { flexDirection: 'row', gap: 8 },
  left: { width: 242, gap: 22, paddingLeft: 14 },
  rule: { height: 1, marginHorizontal: -2, backgroundColor: '#E6EBF2' },
  centre: { flex: 1, gap: 14, paddingRight: 8 },
  row: { flexDirection: 'row', gap: 10 },
  card: { borderRadius: 8, borderWidth: 1, borderColor: '#EAEFF6', backgroundColor: '#FFFFFF' },
  book: { width: 630, padding: 12 },
  cards: { flex: 1, padding: 12 },
  phoneRoot: { flex: 1, backgroundColor: '#FFFFFF' },
  phone: { gap: 12, padding: 16, paddingBottom: 110 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontSize: 13, fontWeight: '500', color: BLUE },
  phoneBtns: { flexDirection: 'row', gap: 8 },
  phoneBtn: { flex: 1, height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 6, borderWidth: 1, borderColor: '#C9DAF8' },
  phoneBtnOn: { backgroundColor: '#EEF4FF' },
  phoneBtnText: { fontSize: 12, fontWeight: '500', color: BLUE },
  phoneCard: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EAEFF6' },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center' },
  toastText: { maxWidth: 520, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(11,20,36,0.92)', fontSize: 13, color: '#FFFFFF', textAlign: 'center', overflow: 'hidden' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#FFFFFF' },
  missingTitle: { fontSize: 17, fontWeight: '700', color: INK },
});
