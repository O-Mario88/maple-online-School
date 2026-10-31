import { Image } from 'expo-image';
import { useState } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { DomainChip } from '@/features/learner/cbc/CbcParts';
import { MathLine } from '@/features/learner/work/MathText';
import type { IconName } from '@/lib/icons';

import type { Book, Hub } from './useShelf';

const INK = '#0B1424';
const NAVY = '#0B2A6B';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const MARKS = ['#FDF0A6', '#C9F2D6', '#FBD3DA', '#CFE2FB'] as const;
const ZOOM_STEP = 10;

type Block = Hub['reader']['content'][number][number];

/** The reader's state: page, zoom, bookmarks, highlight colour, notes, saved and downloaded. */
export function useReader(hub: Hub, toast: (m: string) => void, start: number) {
  const r = hub.reader;
  const [page, setPage] = useState(start);
  const [zoom, setZoom] = useState(100);
  const [marks, setMarks] = useState<readonly number[]>([]);
  const [mark, setMark] = useState<string>(MARKS[0]);
  const [notes, setNotes] = useState<readonly { page: number; text: string }[]>([]);
  const [saved, setSaved] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const go = (p: number) => setPage(Math.min(r.pages, Math.max(1, p)));
  return {
    page,
    go,
    zoom,
    setZoom: (z: number) => setZoom(Math.min(200, Math.max(60, z))),
    bookmarked: marks.includes(page),
    toggleBookmark: () => {
      setMarks((m) => (m.includes(page) ? m.filter((x) => x !== page) : [...m, page]));
      toast(marks.includes(page) ? `Bookmark on page ${page} removed` : `Page ${page} bookmarked`);
    },
    mark,
    setMark,
    notes: notes.filter((n) => n.page === page),
    addNote: (text: string) => setNotes((n) => [...n, { page, text }]),
    saved,
    toggleSaved: () => {
      setSaved(!saved);
      toast(saved ? 'Removed from My Books' : 'Added to My Books');
    },
    downloaded,
    download: () => {
      setDownloaded(true);
      toast('Downloaded • you can read it offline');
    },
  };
}
export type ReaderState = ReturnType<typeof useReader>;

export function BookHeader({ b, hub, rs, phone = false }: { b: Book; hub: Hub; rs: ReaderState; phone?: boolean }) {
  const [menu, setMenu] = useState(false);
  return (
    <View style={styles.bookHead}>
      <Image source={b.cover} style={phone ? styles.coverP : styles.cover} contentFit="cover" />
      <View style={styles.flex}>
        <Text style={[styles.bookTitle, phone && styles.bookTitleP]}>{b.title}</Text>
        <Text style={styles.bookMeta}>{b.id === 'maths-olevel' ? hub.reader.publisherLine : `${b.publisher}  •  ${b.level}`}</Text>
      </View>
      {phone ? null : (
        <>
          <Pressable style={[styles.headBtn, rs.saved && styles.headBtnOn]} onPress={rs.toggleSaved} accessibilityRole="button" accessibilityState={{ selected: rs.saved }}>
            <Icon name={rs.saved ? 'bookmarkOn' : 'bookmark'} size={14} color={BLUE} />
            <Text style={styles.headBtnText}>{rs.saved ? 'In My Books' : 'Add to My Books'}</Text>
          </Pressable>
          <Pressable style={styles.headBtn} onPress={rs.download} disabled={rs.downloaded} accessibilityRole="button">
            <Icon name={rs.downloaded ? 'check' : 'download'} size={14} color={BLUE} />
            <Text style={styles.headBtnText}>{rs.downloaded ? 'Downloaded' : 'Download'}</Text>
          </Pressable>
          <View>
            <Pressable style={styles.more} onPress={() => setMenu(!menu)} accessibilityRole="button" accessibilityLabel="More actions" accessibilityState={{ expanded: menu }}>
              <Icon name="more" size={15} color={INK} />
            </Pressable>
            {menu ? (
              <View style={styles.menu}>
                {['Share with my class', 'Report a problem'].map((m) => (
                  <Pressable
                    key={m}
                    style={styles.menuItem}
                    onPress={() => {
                      setMenu(false);
                      if (m.startsWith('Share')) Share.share({ message: `Reading “${b.title}” on Maple` }).catch(() => undefined);
                    }}
                    accessibilityRole="menuitem">
                    <Text style={styles.menuText}>{m}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </>
      )}
    </View>
  );
}

function Tool({ icon, label, onPress, on = false }: { icon: IconName; label: string; onPress: () => void; on?: boolean }) {
  return (
    <Pressable style={[styles.tool, on && styles.toolOn]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: on }} hitSlop={4}>
      <Icon name={icon} size={16} color={on ? BLUE : INK} />
    </Pressable>
  );
}

export function Toolbar({ hub, rs, phone = false }: { hub: Hub; rs: ReaderState; phone?: boolean }) {
  const r = hub.reader;
  const [toc, setToc] = useState(false);
  const [typed, setTyped] = useState('');
  const jump = () => {
    const n = Number(typed);
    if (Number.isFinite(n) && n > 0) rs.go(n);
    setTyped('');
  };
  return (
    <View style={[styles.toolbar, phone && styles.toolbarP]}>
      <View>
        <Tool icon="listBullet" label="Contents" onPress={() => setToc(!toc)} on={toc} />
        {toc ? (
          <View style={styles.toc}>
            {r.contents.map((c) => (
              <Pressable
                key={c.title}
                style={styles.menuItem}
                onPress={() => {
                  rs.go(c.page);
                  setToc(false);
                }}
                accessibilityRole="menuitem">
                <Text style={styles.menuText}>{c.title}</Text>
                <Text style={styles.tocPage}>{c.page}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      <Tool icon="chevronLeft" label="Previous page" onPress={() => rs.go(rs.page - 1)} />
      <Tool icon="chevronRight" label="Next page" onPress={() => rs.go(rs.page + 1)} />
      <View style={styles.pageBox}>
        <TextInput style={styles.pageInput} value={typed} onChangeText={setTyped} onSubmitEditing={jump} placeholder={`${rs.page}`} placeholderTextColor={INK} keyboardType="number-pad" accessibilityLabel={`Page ${rs.page} of ${r.pages}. Type a page to jump`} />
        <Text style={styles.pageOf}>{`/ ${r.pages}`}</Text>
      </View>
      {phone ? null : <Tool icon="arrowRight" label="Go to page" onPress={jump} />}
      <View style={styles.zoom}>
        <Pressable style={styles.zoomBtn} onPress={() => rs.setZoom(rs.zoom - ZOOM_STEP)} accessibilityRole="button" accessibilityLabel="Zoom out">
          <Icon name="minus" size={14} color={INK} />
        </Pressable>
        <Text style={styles.zoomText}>{`${rs.zoom}%`}</Text>
        <Pressable style={styles.zoomBtn} onPress={() => rs.setZoom(rs.zoom + ZOOM_STEP)} accessibilityRole="button" accessibilityLabel="Zoom in">
          <Icon name="plus" size={14} color={INK} />
        </Pressable>
      </View>
      <View style={styles.flex} />
      <Tool icon={rs.bookmarked ? 'bookmarkOn' : 'bookmark'} label={rs.bookmarked ? 'Remove bookmark' : 'Bookmark this page'} onPress={rs.toggleBookmark} on={rs.bookmarked} />
      {phone ? null : (
        <>
          <Tool icon="expand" label="Fit to width" onPress={() => rs.setZoom(100)} />
          <Tool
            icon="notes"
            label="Print"
            onPress={() => {
              if (Platform.OS === 'web') globalThis.print?.();
            }}
          />
          <Tool icon="send" label="Share" onPress={() => Share.share({ message: `Page ${rs.page} of a Maple book` }).catch(() => undefined)} />
        </>
      )}
    </View>
  );
}

function BlockView({ blk, mark }: { blk: Block; mark: string }) {
  switch (blk.kind) {
    case 'h2':
      return (
        <View style={styles.h2Row}>
          <Text style={styles.h2Num}>{blk.num}</Text>
          <Text style={styles.h2}>{blk.title}</Text>
        </View>
      );
    case 'h3':
      return <Text style={styles.h3}>{`${blk.num}     ${blk.title}`}</Text>;
    case 'p':
      return <MathLine text={blk.text} size={12.5} color="#2B3445" />;
    case 'mark':
      return (
        <View style={styles.markRow}>
          <Text style={[styles.marked, { backgroundColor: mark }]}>{blk.text}</Text>
          <MathLine text={blk.rest} size={12.5} color="#2B3445" />
        </View>
      );
    case 'example':
      return (
        <View style={styles.example}>
          <Text style={styles.exTitle}>{blk.title}</Text>
          <View style={styles.exBody}>
            {blk.lines.map((l) => (
              <MathLine key={l} text={l} size={12.5} color="#2B3445" />
            ))}
          </View>
        </View>
      );
    case 'takeaway':
      return (
        <View style={styles.take}>
          <View style={styles.takeHead}>
            <Text style={styles.bulb}>💡</Text>
            <Text style={styles.takeTitle}>{blk.title}</Text>
          </View>
          <Text style={styles.takeText}>{blk.text}</Text>
        </View>
      );
  }
}

/** The open page: content drawn with stacked fractions, the sticky note and the pie figure. */
export function PageView({ hub, rs, sample, phone = false }: { hub: Hub; rs: ReaderState; sample: boolean; phone?: boolean }) {
  const r = hub.reader;
  const blocks = sample ? r.content[rs.page] : undefined;
  const scale = rs.zoom / 100;
  const figure = sample && rs.page === 12 && !phone;
  return (
    <View style={[styles.page, phone && styles.pageP]}>
      <View style={{ transform: [{ scale }], transformOrigin: 'top left', width: `${100 / scale}%` }}>
        {blocks ? (
          <View style={[styles.blocks, figure && styles.blocksBeside]}>
            {blocks.map((blk, i) => (
              <BlockView key={i} blk={blk} mark={rs.mark} />
            ))}
          </View>
        ) : (
          <View style={styles.preview}>
            <Text style={styles.h3}>{`Page ${rs.page}`}</Text>
            <Text style={styles.previewText}>
              {sample ? 'This sample includes pages 11–13 (section 2.3). Use the contents menu or the arrows to go back to them.' : 'The full text of this book opens here once your school adds it. Notes, highlights and flashcards work the same way.'}
            </Text>
          </View>
        )}
        {figure ? (
          <>
            <View style={styles.sticky}>
              <Text style={styles.stickyText}>{r.note}</Text>
            </View>
            <View style={styles.figure}>
              <Image source={r.pie} style={styles.pie} contentFit="contain" accessibilityLabel="A circle cut into 8 equal parts with 3 shaded" />
              <MathLine text="3/8" size={20} />
            </View>
          </>
        ) : null}
        {rs.notes.map((n, i) => (
          <View key={i} style={styles.note}>
            <Icon name="edit" size={12} color="#92400E" />
            <Text style={styles.noteText}>{n.text}</Text>
          </View>
        ))}
      </View>
      <View style={styles.domain}>
        <DomainChip domain="knowledge" />
      </View>
      <Text style={styles.pageNum}>{rs.page}</Text>
    </View>
  );
}

/** Highlighter colours, notes, copy, define and more. */
export function HighlightBar({ hub, rs, toast }: { hub: Hub; rs: ReaderState; toast: (m: string) => void }) {
  const [noting, setNoting] = useState(false);
  const [text, setText] = useState('');
  const [define, setDefine] = useState(false);
  const page = hub.reader.content[rs.page];
  const plain = page ? page.map((b) => ('text' in b ? b.text : 'title' in b ? b.title : '')).join(' ') : '';
  const copy = () => {
    const nav = (globalThis as { navigator?: { clipboard?: { writeText: (t: string) => Promise<void> } } }).navigator;
    if (Platform.OS === 'web' && nav?.clipboard) nav.clipboard.writeText(plain).then(() => toast('Page text copied'), () => toast('Could not copy'));
    else Share.share({ message: plain }).catch(() => undefined);
  };
  return (
    <View>
      {noting ? (
        <View style={styles.noteBox}>
          <TextInput style={styles.noteInput} value={text} onChangeText={setText} placeholder="Write a note for this page…" placeholderTextColor="#8A93A6" autoFocus accessibilityLabel="Note" />
          <Pressable
            style={styles.noteSave}
            disabled={!text.trim()}
            onPress={() => {
              rs.addNote(text.trim());
              setText('');
              setNoting(false);
              toast('Note saved to Notes & Highlights');
            }}
            accessibilityRole="button">
            <Text style={styles.noteSaveText}>Save</Text>
          </Pressable>
        </View>
      ) : null}
      {define ? (
        <View style={styles.defs}>
          {Object.entries(hub.reader.definitions).map(([w, d]) => (
            <Text key={w} style={styles.def}>
              <Text style={styles.defWord}>{`${w}: `}</Text>
              {d}
            </Text>
          ))}
        </View>
      ) : null}
      <View style={styles.hbar}>
        <View style={styles.hiliter}>
          <Text style={styles.hiliterText}>A</Text>
        </View>
        {MARKS.map((c) => (
          <Pressable key={c} style={[styles.dot, { backgroundColor: c }, rs.mark === c && styles.dotOn]} onPress={() => rs.setMark(c)} accessibilityRole="radio" accessibilityState={{ checked: rs.mark === c }} accessibilityLabel="Highlight colour" />
        ))}
        <Pressable style={styles.hItem} onPress={() => setNoting(!noting)} accessibilityRole="button">
          <Icon name="edit" size={14} color={INK} />
          <Text style={styles.hText}>Add note</Text>
        </Pressable>
        <Pressable style={styles.hItem} onPress={copy} accessibilityRole="button">
          <Icon name="clipboard" size={14} color={INK} />
          <Text style={styles.hText}>Copy</Text>
        </Pressable>
        <Pressable style={styles.hItem} onPress={() => setDefine(!define)} accessibilityRole="button" accessibilityState={{ expanded: define }}>
          <Icon name="book" size={14} color={INK} />
          <Text style={styles.hText}>Define</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bookHead: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  cover: { width: 66, height: 66, borderRadius: 4 },
  coverP: { width: 48, height: 48, borderRadius: 4 },
  bookTitle: { fontSize: 17, fontWeight: '700', color: NAVY },
  bookTitleP: { fontSize: 15 },
  bookMeta: { marginTop: 5, fontSize: 12, color: BODY },
  headBtn: { height: 32, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, borderRadius: 6, borderWidth: 1, borderColor: '#C9DAF8', backgroundColor: '#FFFFFF' },
  headBtnOn: { backgroundColor: '#EEF4FF' },
  headBtnText: { fontSize: 11.5, fontWeight: '500', color: BLUE },
  more: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#DCE3EE' },
  menu: { position: 'absolute', top: 36, right: 0, width: 180, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF', zIndex: 6 },
  menuItem: { height: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  menuText: { fontSize: 12, color: INK },
  toolbar: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 6, borderRadius: 6, backgroundColor: '#F4F7FB', zIndex: 5 },
  toolbarP: { gap: 4 },
  tool: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 5 },
  toolOn: { backgroundColor: '#E6EEFC' },
  toc: { position: 'absolute', top: 32, left: 0, width: 230, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF', zIndex: 6 },
  tocPage: { fontSize: 11, color: BODY },
  pageBox: { height: 26, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, borderRadius: 5, backgroundColor: '#FFFFFF' },
  pageInput: { width: 28, height: 24, fontSize: 12, color: INK, textAlign: 'right' },
  pageOf: { fontSize: 12, color: INK },
  zoom: { height: 26, flexDirection: 'row', alignItems: 'center', borderRadius: 5, backgroundColor: '#FFFFFF' },
  zoomBtn: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  zoomText: { width: 44, fontSize: 12, color: INK, textAlign: 'center' },
  page: { flex: 1, minHeight: 470, marginTop: 8, padding: 18, paddingRight: 16, paddingBottom: 40, borderRadius: 6, borderWidth: 1, borderColor: '#EEF1F6', backgroundColor: '#FFFFFF', overflow: 'hidden' },
  pageP: { minHeight: 380, padding: 14 },
  blocks: { gap: 12 },
  blocksBeside: { paddingRight: 150 },
  h2Row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  h2Num: { paddingHorizontal: 12, paddingVertical: 3, borderRadius: 3, backgroundColor: '#0B6BFF', fontSize: 18, fontWeight: '700', color: '#FFFFFF', overflow: 'hidden' },
  h2: { fontSize: 21, fontWeight: '700', color: NAVY },
  h3: { marginTop: 4, fontSize: 15, fontWeight: '700', color: BLUE },
  markRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  marked: { paddingHorizontal: 3, fontSize: 12.5, color: '#2B3445' },
  example: { maxWidth: 400, borderRadius: 6, backgroundColor: '#EAF2FE', overflow: 'hidden' },
  exTitle: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderBottomRightRadius: 6, backgroundColor: '#0B6BFF', fontSize: 12.5, fontWeight: '700', color: '#FFFFFF', overflow: 'hidden' },
  exBody: { gap: 8, padding: 14 },
  take: { padding: 12, borderRadius: 6, backgroundColor: '#FDE8EC' },
  takeHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bulb: { fontSize: 18 },
  takeTitle: { fontSize: 15, fontWeight: '700', color: '#BE123C' },
  takeText: { marginTop: 6, marginLeft: 26, fontSize: 12, color: BODY },
  preview: { gap: 8, paddingVertical: 40 },
  previewText: { fontSize: 12.5, lineHeight: 18, color: BODY },
  sticky: { position: 'absolute', top: 18, right: 0, width: 132, padding: 12, backgroundColor: '#FDF2A6', transform: [{ rotate: '-7deg' }], shadowColor: INK, shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  stickyText: { fontSize: 12, lineHeight: 17, color: '#1F2A44', fontStyle: 'italic' },
  figure: { position: 'absolute', top: 160, right: 6, alignItems: 'center', gap: 6 },
  pie: { width: 100, height: 100 },
  note: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, padding: 8, borderRadius: 6, backgroundColor: '#FEF3C7' },
  noteText: { flex: 1, fontSize: 12, color: '#78350F' },
  domain: { position: 'absolute', left: 18, bottom: 10 },
  pageNum: { position: 'absolute', right: 14, bottom: 10, fontSize: 11, color: INK },
  hbar: { height: 34, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8, paddingHorizontal: 12, borderRadius: 17, borderWidth: 1, borderColor: '#E8EDF4', backgroundColor: '#FFFFFF' },
  hiliter: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: '#FDF0A6' },
  hiliterText: { fontSize: 11, fontWeight: '800', color: '#92400E' },
  dot: { width: 14, height: 14, borderRadius: 7 },
  dotOn: { borderWidth: 2, borderColor: INK },
  hItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  hText: { fontSize: 11, color: INK },
  noteBox: { flexDirection: 'row', gap: 8, marginTop: 8 },
  noteInput: { flex: 1, height: 34, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#DCE3EE', fontSize: 12, color: INK },
  noteSave: { height: 34, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 6, backgroundColor: '#0B6BFF' },
  noteSaveText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  defs: { gap: 4, marginTop: 8, padding: 10, borderRadius: 6, backgroundColor: '#F4F8FF' },
  def: { fontSize: 11.5, color: BODY },
  defWord: { fontWeight: '700', color: NAVY },
});
