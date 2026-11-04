import { Image } from 'expo-image';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ContentStats } from '@/features/shared/ContentStats';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { Block } from '@/mock/book-reader';

import { EnvironmentArt } from './ReaderArt';
import { clock } from './reader';
import type { Reader } from './useBookReader';

export const INK = '#0B1424';
export const NAVY = '#0E2A6B';
export const BODY = '#4A5263';
export const BLUE = '#1463F3';
export const LINE = '#E3E9F3';
export const WHITE = '#FFFFFF';
const GREEN = '#3E8E2F';
const HEAD_BLUE = '#1458D6';
const MARK = '#FFF2A8';

function IconBtn({ icon, label, onPress, on = false, children }: { icon?: IconName; label: string; onPress: () => void; on?: boolean; children?: ReactNode }) {
  return (
    <Pressable style={({ hovered }) => [styles.iconBtn, on && styles.iconBtnOn, hovered && styles.hover]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: on }}>
      {children ?? (icon ? <Icon name={icon} size={18} color={on ? WHITE : NAVY} /> : null)}
    </Pressable>
  );
}

/** The cover: the book's own cover image, or the drawn landscape with the title over the sky. */
function BookCover({ title, level, phone, cover, drawn }: { title: string; level: string; phone: boolean; cover: number; drawn: boolean }) {
  const w = phone ? 92 : 132;
  const h = phone ? 74 : 106;
  if (!drawn) return <Image source={cover} style={[styles.cover, phone && styles.coverPhone]} contentFit="cover" accessibilityLabel={`${title} cover`} />;
  return (
    <View style={[styles.cover, phone && styles.coverPhone]} accessible accessibilityLabel={`${title} cover`}>
      <EnvironmentArt width={w} height={h} />
      <View style={styles.coverText}>
        <Text style={[styles.coverTitle, phone && styles.coverTitlePhone]}>{title.replace(' ', '\n')}</Text>
        <Text style={[styles.coverLevel, phone && styles.coverLevelPhone]}>{level}</Text>
      </View>
    </View>
  );
}

/** Cover, title, rating and format, reading progress, and the book's actions. */
export function BookTop({ x, phone = false }: { x: Reader; phone?: boolean }) {
  const b = x.r.book;
  const [menu, setMenu] = useState(false);
  return (
    <View style={[styles.top, phone && styles.topPhone]}>
      <View style={styles.topMain}>
        <BookCover title={b.title} level={b.level} phone={phone} cover={b.cover} drawn={b.art === 'environment'} />
        <View style={styles.flex}>
          <Text style={[styles.bookTitle, phone && styles.bookTitlePhone]}>{b.title}</Text>
          <Text style={styles.bookSub}>{`${b.subject}  •  ${b.level}`}</Text>
          <ContentStats e={b.stats} size={13} />
          <View style={styles.inline}>
            <View style={styles.formatPill}>
              <Text style={styles.formatText}>{x.offline ? 'Offline' : b.format}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={[styles.progressBox, phone && styles.progressPhone]}>
        <Text style={styles.progressLabel}>Reading Progress</Text>
        <View style={styles.inline}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${x.progress}%` }]} />
          </View>
          <Text style={styles.pct}>{`${x.progress}%`}</Text>
        </View>
        <Text style={styles.synced}>{`Saved • ${x.r.book.unit} ${x.sync.lastPage} • shared with your dashboard and parent`}</Text>
      </View>
      <View style={[styles.inline, phone && styles.actionsPhone]}>
        <Pressable style={[styles.outlineBtn, phone && styles.flex]} onPress={x.toggleMine} accessibilityRole="button" accessibilityLabel={x.mine ? 'Remove from My Books' : 'Add to My Books'}>
          <Icon name="heart" size={18} color={x.mine ? '#E5484D' : NAVY} />
          <Text style={styles.outlineText}>{x.mine ? 'In My Books' : phone ? 'My Books' : 'Add to My Books'}</Text>
        </Pressable>
        <Pressable style={[styles.primaryBtn, x.completed && styles.doneBtn, phone && styles.flex]} onPress={x.complete} accessibilityRole="button" accessibilityLabel={x.completed ? 'Completed' : 'Mark as Completed'}>
          <Icon name="check" size={18} color={WHITE} />
          <Text style={styles.primaryText}>{x.completed ? 'Completed' : phone ? 'Complete' : 'Mark as Completed'}</Text>
        </Pressable>
        <IconBtn icon="more" label="More book options" onPress={() => setMenu((m) => !m)} />
      </View>
      {menu ? (
        <View style={[styles.menu, phone && styles.menuPhone]}>
          <MenuItem icon="download" label={x.offline ? 'Remove offline copy' : 'Download for offline'} onPress={x.download} />
          <MenuItem icon="expand" label="Focus Reading Mode" onPress={() => x.setFocus(true)} />
          <MenuItem icon="share" label="Share progress with parent" onPress={() => toast(`Sent: ${x.r.learner.name} is on page ${x.page} (${x.progress}%).`)} />
        </View>
      ) : null}
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <Pressable style={({ hovered }) => [styles.menuItem, hovered && styles.hover]} onPress={onPress} accessibilityRole="menuitem" accessibilityLabel={label}>
      <Icon name={icon} size={16} color={NAVY} />
      <Text style={styles.menuText}>{label}</Text>
    </Pressable>
  );
}

/** Units and chapters; tapping a chapter opens its first page. */
export function Contents({ x, onPick }: { x: Reader; onPick?: () => void }) {
  return (
    <View style={styles.contents}>
      <Text style={styles.contentsTitle}>{x.r.book.kind === 'video' ? 'Video Parts' : x.r.book.kind === 'audio' ? 'Tracks' : 'Book Contents'}</Text>
      {x.r.units.map((u) => {
        const open = x.openUnits.includes(u.id);
        return (
          <View key={u.id} style={styles.unit}>
            <Pressable style={styles.unitHead} onPress={() => x.toggleUnit(u.id)} accessibilityRole="button" accessibilityState={{ expanded: open }} accessibilityLabel={u.title}>
              <Icon name={open ? 'chevronDown' : 'chevronRight'} size={15} color={NAVY} />
              <Text style={styles.unitTitle}>{u.title}</Text>
            </Pressable>
            {open
              ? u.chapters.map((c) => {
                  const on = x.chapter?.id === c.id;
                  const done = x.isDone(c.id);
                  return (
                    <Pressable
                      key={c.id}
                      style={[styles.chapter, on && styles.chapterOn]}
                      onPress={() => {
                        x.turnTo(c.start);
                        onPick?.();
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: on }}
                      accessibilityLabel={`${c.title}${done ? ', completed' : ''}`}>
                      <Icon name="book" size={19} color={on ? BLUE : '#5B6B8C'} />
                      <Text style={[styles.chapterText, on && styles.chapterTextOn]}>{c.title}</Text>
                      <View style={[styles.check, done && styles.checkOn]}>{done ? <Icon name="check" size={11} color={WHITE} /> : null}</View>
                    </Pressable>
                  );
                })
              : null}
          </View>
        );
      })}
    </View>
  );
}

/** Back to the library, page turns, bookmark, focus mode and text size. */
export function ReaderBar({ x, phone = false }: { x: Reader; phone?: boolean }) {
  return (
    <View style={styles.bar}>
      {phone ? null : (
        <Pressable style={styles.back} onPress={() => (x.focus ? x.setFocus(false) : router.push('/learn/library'))} accessibilityRole="button" accessibilityLabel={x.focus ? 'Leave focus mode' : 'Back to Library'}>
          <Icon name="chevronLeft" size={15} color={NAVY} />
          <Text style={styles.backText}>{x.focus ? 'Leave Focus Mode' : 'Back to Library'}</Text>
        </Pressable>
      )}
      {phone ? null : <View style={styles.flex} />}
      <View style={[styles.pager, phone && styles.pagerPhone]}>
        <Pressable onPress={() => x.turnTo(x.page - 1)} accessibilityRole="button" accessibilityLabel={`Previous ${x.r.book.unit}`} hitSlop={8} disabled={x.page <= 1}>
          <Icon name="arrowLeft" size={18} color={x.page <= 1 ? '#B8C2D9' : NAVY} />
        </Pressable>
        <Text style={styles.pageText}>{x.r.book.unit === 'page' ? `${x.page} of ${x.r.book.pages}` : `${x.r.book.unit[0].toUpperCase()}${x.r.book.unit.slice(1)} ${x.page} of ${x.r.book.pages}`}</Text>
        <Pressable onPress={() => x.turnTo(x.page + 1)} accessibilityRole="button" accessibilityLabel={`Next ${x.r.book.unit}`} hitSlop={8} disabled={x.page >= x.r.book.pages}>
          <Icon name="arrowRight" size={18} color={x.page >= x.r.book.pages ? '#B8C2D9' : NAVY} />
        </Pressable>
      </View>
      <View style={styles.flex} />
      <IconBtn icon={x.bookmarked ? 'bookmarkOn' : 'bookmark'} label={x.bookmarked ? 'Remove bookmark' : 'Bookmark this page'} onPress={x.bookmark} on={x.bookmarked} />
      <IconBtn icon="expand" label={x.focus ? 'Leave focus mode' : 'Focus Reading Mode'} onPress={() => x.setFocus(!x.focus)} on={x.focus} />
      <IconBtn label="Larger text" onPress={() => x.textSize(1)}>
        <Text style={styles.aa}>
          <Text style={styles.aSmall}>A</Text>A
        </Text>
      </IconBtn>
      <IconBtn icon="minus" label="Smaller text" onPress={() => x.textSize(-1)} />
    </View>
  );
}

function Blocks({ x, blocks, size, figureWidth }: { x: Reader; blocks: readonly Block[]; size: number; figureWidth: number }) {
  const lh = Math.round(size * 1.32);
  const marked = (id: string) => x.s.highlights.some((h) => h.page === x.page && h.block === id);
  return (
    <View style={styles.blocks}>
      {blocks.map((b, i) => {
        const key = `${b.kind}-${i}`;
        if (b.kind === 'tag')
          return (
            <View key={key} style={styles.tag}>
              <Text style={styles.tagText}>{b.text}</Text>
            </View>
          );
        if (b.kind === 'title')
          return (
            <Text key={key} style={[styles.chapterTitle, { fontSize: size * 2.35, lineHeight: size * 2.55 }]} accessibilityRole="header">
              {b.text}
            </Text>
          );
        if (b.kind === 'rule') return <View key={key} style={styles.greenRule} />;
        if (b.kind === 'para')
          return (
            <Pressable key={key} onPress={() => x.highlight(b.id, b.text)} accessibilityRole="button" accessibilityLabel={`${marked(b.id) ? 'Remove highlight' : 'Highlight'}: ${b.text}`}>
              <Text style={[styles.para, { fontSize: size, lineHeight: lh }, marked(b.id) && styles.marked]}>{b.text}</Text>
            </Pressable>
          );
        if (b.kind === 'idea')
          return (
            <View key={key} style={styles.idea}>
              <View style={styles.inline}>
                <Icon name="sparkle" size={20} color="#E0A100" />
                <Text style={[styles.ideaTitle, { fontSize: size + 2 }]}>{b.title}</Text>
              </View>
              <Text style={[styles.ideaText, { fontSize: size * 0.94, lineHeight: lh }]}>{b.text}</Text>
            </View>
          );
        if (b.kind === 'heading')
          return (
            <Text key={key} style={[styles.heading, { fontSize: size * 1.18 }]} accessibilityRole="header">
              {b.text}
            </Text>
          );
        if (b.kind === 'bullets')
          return (
            <View key={key} style={styles.bullets}>
              {b.items.map((it) => (
                <View key={it.bold} style={styles.bulletRow}>
                  <View style={styles.dot} />
                  <Text style={[styles.para, styles.flex, { fontSize: size, lineHeight: lh }]}>
                    <Text style={styles.bold}>{it.bold}</Text>
                    {it.text}
                  </Text>
                </View>
              ))}
            </View>
          );
        if (b.kind === 'figure')
          return (
            <View key={key} style={styles.figure}>
              <View style={styles.figureArt}>
                {b.image ? <Image source={b.image} style={{ width: figureWidth, height: Math.round(figureWidth * 0.66) }} contentFit="cover" accessibilityLabel={b.caption} /> : <EnvironmentArt width={figureWidth} height={Math.round(figureWidth * 0.79)} />}
              </View>
              <Text style={styles.caption}>
                <Text style={styles.bold}>{b.caption.split(':')[0]}:</Text>
                {b.caption.slice(b.caption.indexOf(':') + 1)}
              </Text>
            </View>
          );
        if (b.kind === 'media')
          return (
            <Pressable key={key} style={styles.media} onPress={x.togglePlay} accessibilityRole="button" accessibilityLabel={`${x.playing ? 'Pause' : 'Play'} ${b.title}`}>
              <Image source={b.image} style={{ width: figureWidth, height: Math.round(figureWidth * 0.56) }} contentFit="cover" />
              <View style={styles.mediaShade}>
                <View style={styles.mediaPlay}>
                  <Icon name={x.playing ? 'pause' : b.media === 'video' ? 'playFill' : 'volume'} size={26} color={WHITE} />
                </View>
                <Text style={styles.mediaTitle}>{b.title}</Text>
                <Text style={styles.mediaCaption}>{`${b.caption} • ${clock(x.elapsed)} / ${clock(x.total)}`}</Text>
              </View>
            </Pressable>
          );
        return (
          <View key={key} style={styles.uses}>
            {b.items.map((it) => (
              <View key={it.text} style={styles.use}>
                <Icon name={it.icon} size={20} color={it.color} />
                <Text style={[styles.useText, { fontSize: size * 0.9 }]}>
                  {it.bold ? <Text style={styles.bold}>{it.bold}</Text> : null}
                  {it.text}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

/** The page: two columns on desktop, one on phones. Tap a paragraph to highlight it. */
export function PageView({ x, phone = false }: { x: Reader; phone?: boolean }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const fallback: { left: readonly Block[]; right: readonly Block[] } = {
    left: [
      { kind: 'tag', text: x.chapter ? x.chapter.title : 'Introduction' },
      { kind: 'heading', text: x.chapter ? `Page ${x.page}` : 'Before You Begin' },
      { kind: 'para', id: `f${x.page}`, text: x.chapter ? (x.r.units.flatMap((u) => u.chapters).find((c) => c.id === x.chapter?.id)?.summary ?? '') : 'This book helps you understand the world around you. Read each chapter, try the questions and do the activities with your friends.' },
    ],
    right: [{ kind: 'idea', title: 'Keep Reading', text: 'Use the arrows to turn the page. Your place is saved and your progress is shared with your teacher and parent.' }],
  };
  const sp = x.spread ?? fallback;
  const colWidth = phone ? width : (width - 28) / 2;
  return (
    <View style={[styles.page, phone && styles.pagePhone]} onLayout={onLayout}>
      {phone ? (
        <Blocks x={x} blocks={[...sp.left, ...sp.right]} size={x.size} figureWidth={Math.max(0, colWidth - 16)} />
      ) : (
        <View style={styles.cols}>
          <View style={styles.col}>
            <Blocks x={x} blocks={sp.left} size={x.size} figureWidth={Math.max(0, colWidth - 16)} />
          </View>
          <View style={styles.col}>
            <Blocks x={x} blocks={sp.right} size={x.size} figureWidth={Math.max(0, colWidth - 16)} />
          </View>
        </View>
      )}
    </View>
  );
}

/** Read aloud: play, a seek bar, the clock, sound and speed. */
export function ReadAloud({ x, phone = false }: { x: Reader; phone?: boolean }) {
  const [width, setWidth] = useState(1);
  const frac = x.elapsed / x.total;
  return (
    <View style={[styles.aloud, phone && styles.aloudPhone]}>
      <Pressable style={styles.play} onPress={x.togglePlay} accessibilityRole="button" accessibilityLabel={x.playing ? 'Pause reading aloud' : 'Read aloud'}>
        <View style={styles.playDot}>
          <Icon name={x.playing ? 'pause' : 'playFill'} size={13} color={WHITE} />
        </View>
        {phone ? null : <Text style={styles.playText}>{x.playing ? 'Pause' : x.r.book.play}</Text>}
      </Pressable>
      <Pressable style={styles.seek} onLayout={(e) => setWidth(e.nativeEvent.layout.width || 1)} onPress={(e) => x.seek(e.nativeEvent.locationX / width)} accessibilityRole="adjustable" accessibilityLabel={`Read aloud position ${clock(x.elapsed)} of ${clock(x.total)}`}>
        <View style={styles.seekTrack}>
          <View style={[styles.seekFill, { width: `${frac * 100}%` }]} />
        </View>
        <View style={[styles.knob, { left: `${frac * 100}%` }]} />
      </Pressable>
      <Text style={styles.time}>{`${clock(x.elapsed)} / ${clock(x.total)}`}</Text>
      <Pressable onPress={() => x.setMuted(!x.muted)} accessibilityRole="button" accessibilityLabel={x.muted ? 'Unmute' : 'Mute'} hitSlop={6}>
        <Icon name={x.muted ? 'volumeOff' : 'volume'} size={20} color={NAVY} />
      </Pressable>
      <Pressable style={styles.rate} onPress={x.nextRate} accessibilityRole="button" accessibilityLabel={`Reading speed ${x.rate}×. Tap to change`} hitSlop={6}>
        <Icon name="settings" size={18} color={NAVY} />
        {x.rate !== 1 ? <Text style={styles.rateText}>{`${x.rate}×`}</Text> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hover: { backgroundColor: '#F1F5FC' },
  bold: { fontWeight: '700', color: INK },
  top: { flexDirection: 'row', alignItems: 'center', gap: 22, padding: 12, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  topPhone: { flexDirection: 'column', alignItems: 'stretch', gap: 12 },
  topMain: { flexDirection: 'row', alignItems: 'center', gap: 20, flex: 1, minWidth: 0 },
  cover: { width: 132, height: 106, borderRadius: 10, overflow: 'hidden' },
  coverText: { position: 'absolute', left: 0, right: 0, top: 6, alignItems: 'center' },
  coverTitle: { fontSize: 17, lineHeight: 18, fontWeight: '900', color: '#0E2A6B', textAlign: 'center', textShadowColor: 'rgba(255,255,255,0.9)', textShadowRadius: 4 },
  coverTitlePhone: { fontSize: 12, lineHeight: 13 },
  coverLevel: { marginTop: 2, fontSize: 11, fontWeight: '800', color: '#1458D6', textShadowColor: 'rgba(255,255,255,0.9)', textShadowRadius: 3 },
  coverLevelPhone: { fontSize: 9 },
  coverPhone: { width: 92, height: 74 },
  bookTitle: { fontSize: 27, fontWeight: '800', color: NAVY, letterSpacing: -0.4 },
  bookTitlePhone: { fontSize: 22 },
  bookSub: { marginTop: 2, marginBottom: 8, fontSize: 16, color: NAVY },
  formatPill: { marginLeft: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, backgroundColor: '#E6EEFD' },
  formatText: { fontSize: 13, fontWeight: '600', color: BLUE },
  progressBox: { width: 270, gap: 8 },
  progressPhone: { width: 'auto' },
  progressLabel: { fontSize: 14, fontWeight: '600', color: NAVY },
  track: { flex: 1, height: 9, borderRadius: 5, backgroundColor: '#E2E8F3', overflow: 'hidden' },
  fill: { height: 9, borderRadius: 5, backgroundColor: BLUE },
  pct: { width: 44, textAlign: 'right', fontSize: 15, fontWeight: '700', color: NAVY },
  synced: { fontSize: 11, color: BODY },
  actionsPhone: { alignSelf: 'stretch' },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 42, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: '#CBD6EA', backgroundColor: WHITE },
  outlineText: { fontSize: 14.5, fontWeight: '600', color: NAVY },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 42, paddingHorizontal: 18, borderRadius: 10, backgroundColor: BLUE },
  doneBtn: { backgroundColor: '#22A55A' },
  primaryText: { fontSize: 14.5, fontWeight: '700', color: WHITE },
  iconBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#CBD6EA', alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE },
  iconBtnOn: { borderColor: BLUE, backgroundColor: BLUE },
  menu: { position: 'absolute', right: 12, top: 78, zIndex: 10, width: 250, padding: 6, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE, shadowColor: '#0B1F4D', shadowOpacity: 0.14, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  menuPhone: { position: 'relative', right: 0, top: 0, width: 'auto' },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8 },
  menuText: { fontSize: 13.5, color: NAVY },
  contents: { gap: 4 },
  contentsTitle: { marginBottom: 8, fontSize: 20, fontWeight: '800', color: NAVY },
  unit: { borderTopWidth: 1, borderColor: LINE, paddingVertical: 6 },
  unitHead: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  unitTitle: { flex: 1, minWidth: 0, fontSize: 14, fontWeight: '700', color: NAVY },
  chapter: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4, paddingHorizontal: 8, paddingVertical: 9, borderRadius: 10 },
  chapterOn: { backgroundColor: '#E5EEFF' },
  chapterText: { flex: 1, minWidth: 0, fontSize: 13, lineHeight: 18, color: NAVY },
  chapterTextOn: { fontWeight: '700', color: BLUE },
  check: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#8FA0C2', alignItems: 'center', justifyContent: 'center' },
  checkOn: { borderColor: BLUE, backgroundColor: BLUE },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#CBD6EA', backgroundColor: WHITE },
  backText: { fontSize: 13.5, fontWeight: '600', color: NAVY },
  pager: { flexDirection: 'row', alignItems: 'center', gap: 18, height: 36, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: '#CBD6EA', backgroundColor: WHITE },
  pagerPhone: { gap: 10, paddingHorizontal: 10 },
  pageText: { minWidth: 62, textAlign: 'center', fontSize: 14.5, fontWeight: '700', color: NAVY },
  aa: { fontSize: 19, fontWeight: '700', color: NAVY },
  aSmall: { fontSize: 13 },
  page: { padding: 22, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  pagePhone: { padding: 16 },
  cols: { flexDirection: 'row', gap: 28 },
  col: { flex: 1, minWidth: 0 },
  blocks: { gap: 14 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 10, backgroundColor: '#DDF0C4' },
  tagText: { fontSize: 18, fontWeight: '800', color: '#244A10' },
  chapterTitle: { fontWeight: '800', color: NAVY, letterSpacing: -0.5 },
  greenRule: { width: 56, height: 4, marginTop: -4, borderRadius: 2, backgroundColor: GREEN },
  para: { color: INK },
  marked: { backgroundColor: MARK },
  idea: { gap: 6, padding: 14, borderRadius: 12, backgroundColor: '#F7F7DD' },
  ideaTitle: { fontWeight: '800', color: INK },
  ideaText: { color: INK },
  heading: { fontWeight: '800', color: HEAD_BLUE },
  bullets: { gap: 8 },
  bulletRow: { flexDirection: 'row', gap: 10 },
  dot: { width: 8, height: 8, marginTop: 8, borderRadius: 4, backgroundColor: GREEN },
  figure: { gap: 0, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F2F5EA' },
  figureArt: { borderRadius: 12, overflow: 'hidden' },
  media: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#0B1424' },
  mediaShade: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 12, backgroundColor: 'rgba(8,16,40,0.45)' },
  mediaPlay: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  mediaTitle: { fontSize: 17, fontWeight: '800', color: WHITE, textAlign: 'center' },
  mediaCaption: { fontSize: 12.5, color: '#DDE6F8', textAlign: 'center' },
  caption: { padding: 10, fontSize: 12.5, color: INK },
  uses: { gap: 8 },
  use: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: '#F4F7FB' },
  useText: { flex: 1, minWidth: 0, color: INK },
  aloud: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  aloudPhone: { gap: 12, paddingHorizontal: 10 },
  play: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 40, paddingLeft: 6, paddingRight: 14, borderRadius: 20, backgroundColor: '#E8F0FE' },
  playDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  playText: { fontSize: 14, fontWeight: '600', color: BLUE },
  seek: { flex: 1, minWidth: 0, height: 24, justifyContent: 'center' },
  seekTrack: { height: 4, borderRadius: 2, backgroundColor: '#D5DEED', overflow: 'hidden' },
  seekFill: { height: 4, backgroundColor: BLUE },
  knob: { position: 'absolute', width: 14, height: 14, marginLeft: -7, borderRadius: 7, backgroundColor: BLUE, borderWidth: 2, borderColor: WHITE },
  time: { fontSize: 13.5, color: NAVY },
  rate: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rateText: { fontSize: 11.5, fontWeight: '700', color: NAVY },
});
