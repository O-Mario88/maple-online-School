import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { mmss } from '@/lib/feedback';
import type { IconName } from '@/lib/icons';

import { BLUE, BODY, GREEN, INK, RED } from './MathText';
import type { Work, WorkState } from './useWork';


export function StepHead({ n, title, sub }: { n: number; title: string; sub: string }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepSub}>{sub}</Text>
      </View>
    </View>
  );
}

/** Blue corner brackets: the edges the scanner found, before the page is squared up. */
function Corners() {
  return (
    <View style={styles.corners} pointerEvents="none">
      {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
        <View key={c} style={[styles.corner, styles[c]]} />
      ))}
    </View>
  );
}

function CaptureVeil({ s }: { s: WorkState }) {
  if (!s.scanner.capturing) return null;
  return (
    <View style={styles.veil} pointerEvents="none">
      <Corners />
      <Text style={styles.veilText}>{s.scanner.auto ? 'Hold steady… finding the page edges' : 'Squaring up the page…'}</Text>
    </View>
  );
}

function Thumbs({ s, small = false }: { s: WorkState; small?: boolean }) {
  const sc = s.scanner;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbs}>
      {sc.pages.map((p, i) => (
        <View key={i} style={[small ? styles.thumbP : styles.thumb, i === sc.current && styles.thumbOn]}>
          <Pressable style={styles.fill} onPress={() => sc.setCurrent(i)} accessibilityRole="button" accessibilityState={{ selected: i === sc.current }} accessibilityLabel={`Page ${i + 1}`}>
            <Image source={p} style={styles.fill} contentFit="cover" />
          </Pressable>
          {i === sc.current ? (
            <Pressable style={styles.remove} onPress={() => sc.remove(i)} accessibilityRole="button" accessibilityLabel={`Remove page ${i + 1}`} hitSlop={6}>
              <Icon name="close" size={9} color="#FFFFFF" />
            </Pressable>
          ) : null}
        </View>
      ))}
      <Pressable style={[small ? styles.thumbP : styles.thumb, styles.galleryTile]} onPress={() => sc.capture('gallery')} accessibilityRole="button" accessibilityLabel="Add from gallery">
        <Icon name="gallery" size={16} color={INK} />
        <Text style={styles.galleryText}>Gallery</Text>
      </Pressable>
    </ScrollView>
  );
}

function AutoScan({ s }: { s: WorkState }) {
  return (
    <View style={styles.auto}>
      <Switch value={s.scanner.auto} onValueChange={s.scanner.setAuto} trackColor={{ true: BLUE, false: '#C9D2E0' }} thumbColor="#FFFFFF" accessibilityLabel="Auto scan" />
      <Text style={styles.autoText}>Auto Scan</Text>
    </View>
  );
}

/** Step 2 on desktop: the current page, the shutter, page thumbnails, auto scan, gallery and retake. */
export function ScannerCard({ s }: { s: WorkState }) {
  const sc = s.scanner;
  const page = sc.pages[sc.current];
  return (
    <View>
      <StepHead n={2} title="Scan Handwritten Work" sub="Take a photo or scan your written solutions" />
      <View style={styles.shot}>
        {page ? <Image source={page} style={styles.fill} contentFit="cover" accessibilityLabel={`Scanned page ${sc.current + 1}`} /> : <Text style={styles.emptyShot}>No pages yet. Tap the shutter to scan.</Text>}
        <CaptureVeil s={s} />
      </View>
      <Pressable style={styles.shutter} onPress={() => sc.capture('scan')} accessibilityRole="button" accessibilityLabel={sc.auto ? 'Start auto scan' : 'Take photo'}>
        <View style={styles.shutterIn} />
      </Pressable>
      <Thumbs s={s} />
      <View style={styles.scanRow}>
        <Icon name="bolt" size={18} color="#F5A524" />
        <Text style={styles.autoText} numberOfLines={1}>
          Auto Scan
        </Text>
        <Switch value={sc.auto} onValueChange={sc.setAuto} trackColor={{ true: BLUE, false: '#C9D2E0' }} thumbColor="#FFFFFF" accessibilityLabel="Auto scan" />
        <View style={styles.flex} />
        <Pressable style={styles.smallBtn} onPress={() => sc.capture('gallery')} accessibilityRole="button">
          <Text style={styles.smallBtnText}>Gallery</Text>
        </Pressable>
        <Pressable style={styles.smallBtn} onPress={() => sc.capture('retake')} accessibilityRole="button" accessibilityLabel={`Retake page ${sc.current + 1}`}>
          <Text style={styles.smallBtnText}>Retake</Text>
        </Pressable>
      </View>
    </View>
  );
}

function PanelHead({ icon, title, onClose }: { icon: IconName; title: string; onClose: () => void }) {
  return (
    <View style={styles.panelHead}>
      <Icon name={icon} size={15} color={BLUE} />
      <Text style={styles.panelTitle}>{title}</Text>
      <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={`Close ${title}`} hitSlop={10}>
        <Icon name="close" size={15} color={BODY} />
      </Pressable>
    </View>
  );
}

function Collapsed({ icon, title, detail, onOpen }: { icon: IconName; title: string; detail: string; onOpen: () => void }) {
  return (
    <Pressable style={styles.collapsed} onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Open ${title}`}>
      <Icon name={icon} size={15} color={BLUE} />
      <Text style={styles.panelTitle}>{title}</Text>
      <Text style={styles.collapsedDetail}>{detail}</Text>
      <Icon name="chevronDown" size={14} color={BODY} />
    </Pressable>
  );
}

/** The phone's camera scanner panel. */
export function ScannerPanel({ s }: { s: WorkState }) {
  const [open, setOpen] = useState(true);
  const sc = s.scanner;
  if (!open) return <Collapsed icon="scan" title="Camera Scanner" detail={`${sc.pages.length} pages`} onOpen={() => setOpen(true)} />;
  const page = sc.pages[sc.current];
  return (
    <View style={styles.panel}>
      <PanelHead icon="arrowLeft" title="Camera Scanner" onClose={() => setOpen(false)} />
      <View style={styles.shotP}>
        {page ? <Image source={page} style={styles.fill} contentFit="contain" accessibilityLabel={`Scanned page ${sc.current + 1}`} /> : null}
        <Corners />
        {sc.pages.length > 0 ? <Text style={styles.count}>{`${sc.current + 1}/${sc.pages.length}`}</Text> : null}
        <CaptureVeil s={s} />
      </View>
      <Thumbs s={s} small />
      <View style={styles.scanRowP}>
        <Pressable style={styles.scanBtn} onPress={() => sc.capture('scan')} accessibilityRole="button">
          <Icon name="playFill" size={15} color="#FFFFFF" />
          <Text style={styles.scanText}>{sc.capturing ? 'Scanning…' : 'Scan'}</Text>
        </Pressable>
        <AutoScan s={s} />
      </View>
    </View>
  );
}

function VivaControls({ s, phone = false }: { s: WorkState; phone?: boolean }) {
  const v = s.viva;
  const live = v.mode === 'recording' || v.mode === 'paused';
  const left =
    v.mode === 'recording'
      ? { icon: 'pause' as const, label: 'Pause', on: v.pause }
      : v.mode === 'paused'
        ? { icon: 'playFill' as const, label: 'Resume', on: v.pause }
        : v.mode === 'saved'
          ? { icon: v.playing ? ('pause' as const) : ('playFill' as const), label: v.playing ? 'Pause' : 'Play', on: v.togglePlay }
          : null;
  const center = live ? { label: 'Stop recording', on: v.stop } : { label: v.mode === 'saved' ? 'Record again' : 'Start recording', on: v.record };
  return (
    <View style={[styles.vivaBar, phone && styles.vivaBarP]}>
      <View style={styles.vivaSide}>
        {left ? (
          <Pressable style={styles.vivaLeft} onPress={left.on} accessibilityRole="button" accessibilityLabel={left.label}>
            <View style={styles.disc}>
              <Icon name={left.icon} size={16} color="#FFFFFF" />
            </View>
            {phone ? null : <Text style={styles.vivaLabel}>{left.label}</Text>}
          </Pressable>
        ) : null}
      </View>
      <Pressable style={[styles.rec, phone && styles.recP]} onPress={center.on} accessibilityRole="button" accessibilityLabel={center.label}>
        <View style={live ? styles.recStop : styles.recDot} />
      </Pressable>
      <View style={[styles.vivaSide, styles.vivaRight]}>
        {v.mode === 'idle' ? null : (
          <Pressable style={styles.disc} onPress={v.discard} accessibilityRole="button" accessibilityLabel="Delete recording">
            <Icon name="trash" size={15} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Timer({ s }: { s: WorkState }) {
  const v = s.viva;
  const text = v.mode === 'saved' && v.playing ? `${mmss(v.playPos)} / ${mmss(v.seconds)}` : `${mmss(v.seconds)} / ${mmss(v.max)}`;
  return (
    <View style={styles.timer} accessibilityRole="timer" accessibilityLabel={`${text}, ${v.mode}`}>
      <View style={[styles.timerDot, v.mode !== 'recording' && styles.timerDotIdle]} />
      <Text style={styles.timerText}>{text}</Text>
    </View>
  );
}

function VivaFrame({ w, s, phone = false }: { w: Work; s: WorkState; phone?: boolean }) {
  return (
    <View style={phone ? styles.frameP : styles.frame}>
      <Image source={w.viva.frame} style={styles.fill} contentFit="cover" contentPosition="top" accessibilityLabel="Your camera preview" />
      <LinearGradient colors={['rgba(10,14,24,0)', 'rgba(10,14,24,0.7)']} style={styles.frameFade} />
      <Timer s={s} />
      {s.viva.mode === 'idle' ? <Text style={styles.idleText}>Tap the red button to start (up to 60 s)</Text> : null}
      <VivaControls s={s} phone={phone} />
    </View>
  );
}

/** Step 3 on desktop: the 60-second viva recorder and its tips. */
export function VivaCard({ w, s }: { w: Work; s: WorkState }) {
  return (
    <View>
      <StepHead n={3} title="60-Second Viva Recording" sub="Explain one of your solutions in your own words" />
      <VivaFrame w={w} s={s} />
      <View style={styles.tips}>
        {w.vivaTips.map((t) => (
          <View key={t} style={styles.tip}>
            <View style={styles.tick}>
              <Icon name="check" size={9} color="#FFFFFF" />
            </View>
            <Text style={styles.tipText}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function VivaPanel({ w, s }: { w: Work; s: WorkState }) {
  const [open, setOpen] = useState(true);
  if (!open) return <Collapsed icon="mic" title="Viva Recording" detail={s.viva.mode === 'saved' ? mmss(s.viva.seconds) : s.viva.mode} onOpen={() => setOpen(true)} />;
  return (
    <View style={styles.panel}>
      <PanelHead icon="mic" title="Viva Recording" onClose={() => setOpen(false)} />
      <VivaFrame w={w} s={s} phone />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  step: { flexDirection: 'row', gap: 12 },
  stepNum: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: '#DCE8FD' },
  stepNumText: { fontSize: 14, fontWeight: '700', color: BLUE },
  stepTitle: { fontSize: 13.5, fontWeight: '700', color: INK },
  stepSub: { marginTop: 4, fontSize: 10.5, color: BODY },
  shot: { height: 262, marginTop: 14, borderRadius: 4, backgroundColor: '#8B6A4E', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  emptyShot: { fontSize: 12, color: '#FFFFFF' },
  shutter: { alignSelf: 'center', width: 50, height: 50, marginTop: -36, alignItems: 'center', justifyContent: 'center', borderRadius: 25, borderWidth: 3, borderColor: '#FFFFFF', backgroundColor: '#0B6BFF' },
  shutterIn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0B6BFF' },
  thumbs: { gap: 7, marginTop: 10 },
  thumb: { width: 58, height: 55, borderRadius: 4, borderWidth: 1, borderColor: '#E1E7F0', overflow: 'hidden' },
  thumbP: { width: 56, height: 40, borderRadius: 4, borderWidth: 1, borderColor: '#E1E7F0', overflow: 'hidden' },
  thumbOn: { borderWidth: 2, borderColor: BLUE },
  remove: { position: 'absolute', top: 2, right: 2, width: 15, height: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: 'rgba(11,20,36,0.75)' },
  galleryTile: { width: 63, alignItems: 'center', justifyContent: 'center', gap: 3, backgroundColor: '#FFFFFF' },
  galleryText: { fontSize: 10.5, color: BODY },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 12 },
  smallBtn: { height: 30, justifyContent: 'center', paddingHorizontal: 8, borderRadius: 5, borderWidth: 1, borderColor: '#E1E7F0' },
  smallBtnText: { fontSize: 12, color: INK },
  auto: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  autoText: { fontSize: 12.5, fontWeight: '500', color: INK },
  corners: { position: 'absolute', top: 10, right: 10, bottom: 10, left: 10 },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: '#2F80FF' },
  tl: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  tr: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  br: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  veil: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.45)' },
  veilText: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, backgroundColor: 'rgba(11,20,36,0.8)', fontSize: 11.5, color: '#FFFFFF', overflow: 'hidden' },
  panel: { padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E6EBF2', backgroundColor: '#FFFFFF', gap: 10 },
  panelHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  panelTitle: { flex: 1, fontSize: 12.5, fontWeight: '700', color: INK },
  collapsed: { height: 44, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E6EBF2', backgroundColor: '#FFFFFF' },
  collapsedDetail: { fontSize: 12, color: BODY },
  shotP: { width: '100%', aspectRatio: 281 / 188, borderRadius: 6, overflow: 'hidden', backgroundColor: '#8B6A4E' },
  count: { position: 'absolute', right: 6, bottom: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: 'rgba(11,20,36,0.75)', fontSize: 10.5, color: '#FFFFFF', overflow: 'hidden' },
  scanRowP: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scanBtn: { flex: 1, height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 5, backgroundColor: '#0B6BFF' },
  scanText: { fontSize: 13.5, fontWeight: '500', color: '#FFFFFF' },
  frame: { height: 250, marginTop: 14, borderRadius: 6, overflow: 'hidden', backgroundColor: '#1B2230' },
  frameP: { width: '100%', aspectRatio: 281 / 132, borderRadius: 6, overflow: 'hidden', backgroundColor: '#1B2230' },
  frameFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '35%' },
  timer: { position: 'absolute', top: 8, right: 4, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, height: 27, borderRadius: 7, backgroundColor: 'rgba(22,26,36,0.92)' },
  timerDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: RED },
  timerDotIdle: { backgroundColor: '#E8797C' },
  timerText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  idleText: { position: 'absolute', top: '42%', alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(11,20,36,0.75)', fontSize: 11.5, color: '#FFFFFF', overflow: 'hidden' },
  vivaBar: { position: 'absolute', left: 8, right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center' },
  vivaBarP: { bottom: 6 },
  vivaSide: { flex: 1, flexDirection: 'row' },
  vivaRight: { justifyContent: 'flex-end' },
  vivaLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  disc: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: 'rgba(11,20,36,0.55)' },
  vivaLabel: { fontSize: 11.5, color: '#FFFFFF' },
  rec: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 25, borderWidth: 3, borderColor: '#FFFFFF', backgroundColor: RED },
  recP: { width: 42, height: 42, borderRadius: 21 },
  recStop: { width: 16, height: 16, borderRadius: 3, backgroundColor: '#FFFFFF' },
  recDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFFFFF' },
  tips: { gap: 9, marginTop: 14 },
  tip: { flexDirection: 'row', gap: 9 },
  tick: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', marginTop: 1, borderRadius: 8, backgroundColor: GREEN },
  tipText: { flex: 1, fontSize: 12.5, color: '#2B3445' },
});
