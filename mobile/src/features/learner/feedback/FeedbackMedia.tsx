import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { PlayerControls, usePlayback } from '@/features/learner/exam/Walkthrough';
import { BLUE, BODY, INK } from '@/features/learner/work/MathText';
import { chapterAt, mmss } from '@/lib/feedback';

import type { Feedback } from './FeedbackParts';

const ZOOMS = [1, 1.5, 2] as const;

function PageView({ f, page, zoom, height }: { f: Feedback; page: number; zoom: number; height: number }) {
  const p = f.pages[page];
  return (
    <View style={[styles.page, { height }]}>
      {p.note ? (
        <View style={styles.plain}>
          <Image source={p.image} style={[styles.plainImage, { transform: [{ scale: zoom }] }]} contentFit="contain" accessibilityLabel={p.note} />
          <Text style={styles.plainNote}>{p.note}</Text>
        </View>
      ) : (
        <Image source={p.image} style={[styles.fill, { transform: [{ scale: zoom }] }]} contentFit="cover" accessibilityLabel="Your page 1 with the teacher's ticks, a note on question 3 and a correction on question 4" />
      )}
    </View>
  );
}

function Zoom({ zoom, setZoom }: { zoom: number; setZoom: (z: number) => void }) {
  const i = ZOOMS.indexOf(zoom as (typeof ZOOMS)[number]);
  return (
    <View style={styles.zoom}>
      <Pressable style={styles.zoomBtn} onPress={() => setZoom(ZOOMS[Math.min(ZOOMS.length - 1, i + 1)])} disabled={i === ZOOMS.length - 1} accessibilityRole="button" accessibilityLabel="Zoom in">
        <Icon name="plus" size={16} color={INK} />
      </Pressable>
      <View style={styles.zoomSep} />
      <Pressable style={styles.zoomBtn} onPress={() => setZoom(ZOOMS[Math.max(0, i - 1)])} disabled={i === 0} accessibilityRole="button" accessibilityLabel="Zoom out">
        <Icon name="minus" size={16} color={INK} />
      </Pressable>
    </View>
  );
}

function Pager({ f, page, setPage }: { f: Feedback; page: number; setPage: (n: number) => void }) {
  return (
    <View style={styles.pager}>
      <Pressable onPress={() => setPage(Math.max(0, page - 1))} disabled={page === 0} accessibilityRole="button" accessibilityLabel="Previous page" hitSlop={6}>
        <Icon name="chevronLeft" size={14} color={page === 0 ? '#B8C0CE' : INK} />
      </Pressable>
      <Text style={styles.pagerText}>{`${page + 1}/${f.pages.length}`}</Text>
      <Pressable onPress={() => setPage(Math.min(f.pages.length - 1, page + 1))} disabled={page === f.pages.length - 1} accessibilityRole="button" accessibilityLabel="Next page" hitSlop={6}>
        <Icon name="chevronRight" size={14} color={page === f.pages.length - 1 ? '#B8C0CE' : INK} />
      </Pressable>
    </View>
  );
}

function FullScreen({ f, open, onClose, start }: { f: Feedback; open: boolean; onClose: () => void; start: number }) {
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(start);
  const [zoom, setZoom] = useState(1);
  return (
    <Modal visible={open} animationType="fade" onRequestClose={onClose} transparent>
      <View style={[styles.full, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.fullHead}>
          <Pager f={f} page={page} setPage={setPage} />
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close full screen" hitSlop={10}>
            <Icon name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.fullBody} maximumZoomScale={3}>
          <PageView f={f} page={page} zoom={zoom} height={560} />
          <Zoom zoom={zoom} setZoom={setZoom} />
        </ScrollView>
      </View>
    </Modal>
  );
}

/** The marked pages: page arrows, zoom, thumbnails, full screen and the annotated PDF. */
export function AnnotatedViewer({ f, onDownload }: { f: Feedback; onDownload: () => void }) {
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);
  const go = (n: number) => {
    setPage(n);
    setZoom(1);
  };
  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.title}>Annotated Handwritten Work</Text>
        <Pager f={f} page={page} setPage={go} />
        <Pressable style={styles.expand} onPress={() => setFull(true)} accessibilityRole="button" accessibilityLabel="Open full screen" hitSlop={6}>
          <Icon name="expand" size={14} color={INK} />
        </Pressable>
      </View>
      <View style={styles.viewer}>
        <PageView f={f} page={page} zoom={zoom} height={446} />
        <View style={styles.zoomPos}>
          <Zoom zoom={zoom} setZoom={setZoom} />
        </View>
      </View>
      <View style={styles.thumbs}>
        {f.pages.map((p, i) => (
          <Pressable key={i} style={[styles.thumb, i === page && styles.thumbOn]} onPress={() => go(i)} accessibilityRole="button" accessibilityState={{ selected: i === page }} accessibilityLabel={`Page ${i + 1}`}>
            <Image source={p.thumb} style={styles.thumbImg} contentFit="cover" />
            <Text style={styles.thumbText}>{`Page ${i + 1}`}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.download} onPress={onDownload} accessibilityRole="button">
          <Icon name="download" size={16} color={BLUE} />
          <Text style={styles.downloadText}>Download PDF</Text>
        </Pressable>
      </View>
      {full ? <FullScreen f={f} open={full} onClose={() => setFull(false)} start={page} /> : null}
    </View>
  );
}

/** The phone's folded annotated work: a strip of page 1 that opens full screen. */
export function AnnotatedStrip({ f }: { f: Feedback }) {
  const [open, setOpen] = useState(true);
  const [full, setFull] = useState(false);
  return (
    <View>
      <Pressable style={styles.stripHead} onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={styles.stripTitle}>{`Annotated Work (1 / ${f.pages.length})`}</Text>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} size={14} color={INK} />
      </Pressable>
      {open ? (
        <Pressable style={styles.strip} onPress={() => setFull(true)} accessibilityRole="button" accessibilityLabel="Open your marked pages full screen">
          <Image source={f.pages[0].image} style={styles.fill} contentFit="cover" contentPosition={{ top: '13%', left: '50%' }} />
          <View style={styles.stripExpand}>
            <Icon name="expand" size={14} color={INK} />
          </View>
        </Pressable>
      ) : null}
      {full ? <FullScreen f={f} open={full} onClose={() => setFull(false)} start={0} /> : null}
    </View>
  );
}

/** The teacher's video: a working player, with chapters and a transcript that jump to their moment. */
export function VideoFeedback({ f, phone = false, startTab = 'Chapters' }: { f: Feedback; phone?: boolean; startTab?: 'Chapters' | 'Transcript' }) {
  const v = f.video;
  const p = usePlayback(v.seconds);
  const [muted, setMuted] = useState(false);
  const [cc, setCc] = useState(true);
  const [tab, setTab] = useState(startTab);
  const now = chapterAt(v.chapters, p.pos);
  const line = chapterAt(v.transcript, p.pos);
  const jump = (at: number) => {
    p.seek(at / v.seconds);
    if (!p.running) p.toggle();
  };
  const rows = tab === 'Chapters' ? v.chapters.map((c) => ({ at: c.at, text: c.title })) : v.transcript;
  const on = tab === 'Chapters' ? now : line;
  return (
    <View>
      {phone ? null : <Text style={styles.title}>Teacher Video Feedback</Text>}
      <View style={[styles.player, phone && styles.playerP]}>
        <Pressable style={styles.frame} onPress={p.toggle} accessibilityRole="button" accessibilityLabel={p.running ? 'Pause video' : 'Play video'}>
          <Image source={v.frame} style={styles.fill} contentFit="cover" />
          {cc && p.running ? <Text style={styles.caption}>{v.transcript[line].text}</Text> : null}
        </Pressable>
        <PlayerControls total={v.seconds} p={p} muted={muted} onMute={() => setMuted((m) => !m)} cc={cc} onCc={() => setCc((c) => !c)} />
      </View>
      <View style={styles.tabs} accessibilityRole="tablist">
        {(['Chapters', 'Transcript'] as const).map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: t === tab }}>
            <Text style={[styles.tabText, t === tab && styles.tabOn]}>{t}</Text>
            {t === tab ? <View style={styles.tabLine} /> : null}
          </Pressable>
        ))}
      </View>
      <View style={styles.rows}>
        {rows.map((r, i) => (
          <Pressable key={r.at} style={[styles.row, i === on && styles.rowOn]} onPress={() => jump(r.at)} accessibilityRole="button" accessibilityLabel={`${mmss(r.at)}, ${r.text}`}>
            <Text style={styles.rowTime}>{mmss(r.at).replace(/^0/, '')}</Text>
            <Text style={[styles.rowText, tab === 'Transcript' && styles.rowTextSmall]}>{r.text}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, fontSize: 15.5, fontWeight: '700', color: INK },
  pager: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  pagerText: { fontSize: 12, color: INK },
  expand: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  viewer: { marginTop: 12 },
  page: { borderRadius: 6, overflow: 'hidden', backgroundColor: '#F4F1EC' },
  plain: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  plainImage: { width: 200, height: 160 },
  plainNote: { fontSize: 13, color: BODY },
  zoomPos: { position: 'absolute', right: 9, bottom: 22 },
  zoom: { width: 30, borderRadius: 15, backgroundColor: '#FFFFFF', shadowColor: INK, shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  zoomBtn: { height: 32, alignItems: 'center', justifyContent: 'center' },
  zoomSep: { height: 1, marginHorizontal: 6, backgroundColor: '#E6EBF2' },
  thumbs: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  thumb: { width: 76, alignItems: 'center', gap: 4, padding: 3, borderRadius: 6, borderWidth: 1, borderColor: '#E1E7F0' },
  thumbOn: { borderWidth: 2, borderColor: BLUE },
  thumbImg: { width: 68, height: 54, borderRadius: 3 },
  thumbText: { fontSize: 11, color: INK },
  download: { flex: 1, height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginLeft: 8, borderRadius: 6, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF' },
  downloadText: { fontSize: 13, fontWeight: '600', color: BLUE },
  full: { flex: 1, backgroundColor: 'rgba(8,12,20,0.94)' },
  fullHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  fullBody: { padding: 16, alignItems: 'center', gap: 12 },
  stripHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stripTitle: { fontSize: 13.5, fontWeight: '700', color: INK },
  strip: { height: 66, marginTop: 10, borderRadius: 6, overflow: 'hidden', backgroundColor: '#F4F1EC' },
  stripExpand: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, alignItems: 'center', justifyContent: 'center', borderRadius: 5, backgroundColor: '#FFFFFF' },
  player: { marginTop: 12, borderRadius: 8, overflow: 'hidden', backgroundColor: '#161B26' },
  playerP: { marginTop: 0 },
  frame: { width: '100%', aspectRatio: 278 / 190, backgroundColor: '#2A3140' },
  caption: { position: 'absolute', left: 16, right: 16, bottom: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.7)', fontSize: 11.5, color: '#FFFFFF', textAlign: 'center', overflow: 'hidden' },
  tabs: { flexDirection: 'row', gap: 24, marginTop: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#E3E8F0' },
  tab: { paddingVertical: 9, paddingHorizontal: 20 },
  tabText: { fontSize: 12.5, color: '#3D4656' },
  tabOn: { color: BLUE, fontWeight: '600' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 2.5, backgroundColor: BLUE },
  rows: { gap: 4, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 28, paddingHorizontal: 6, paddingVertical: 5, borderRadius: 4 },
  rowOn: { backgroundColor: '#EAF1FE' },
  rowTime: { width: 44, fontSize: 12, color: INK, fontVariant: ['tabular-nums'] },
  rowText: { flex: 1, fontSize: 12.5, color: INK },
  rowTextSmall: { fontSize: 11.5, lineHeight: 16, color: '#2B3445' },
});
