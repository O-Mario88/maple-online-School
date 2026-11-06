import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { useEffect, useReducer, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { Btn, Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, RED, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { ScanMode, ScanResult } from '@/mock/school-admin';

import { initialScanState, type ScanLog, scanReducer } from './scanState';
import { Maple } from '@/constants/maple';

type Admin = MockData['schoolAdmin'];

/** On a desk or tablet the scanner keeps a phone-width column, like a gate kiosk. */
const SCANNER_MAX_WIDTH = 520;

const RESULT: Readonly<Record<ScanResult, { color: string; soft: string; icon: 'check' | 'clock' | 'close'; title: string }>> = {
  ok: { color: Maple.successText, soft: Maple.successSoft, icon: 'check', title: 'Verified' },
  late: { color: Maple.warning, soft: Maple.warningSoft, icon: 'clock', title: 'Late' },
  denied: { color: RED, soft: Maple.errorSoft, icon: 'close', title: 'Not allowed' },
};

/** The scanner on screen. A design build has no camera: each "scan" reads the next badge in the sample queue. */
export function useScanner(a: Admin) {
  const queue = a.attendance.scanQueue;
  const [state, dispatch] = useReducer(scanReducer, initialScanState);
  const scan = (again = false) => dispatch({ type: 'scan', queue, at: new Date(), again });
  const sync = () => {
    const n = state.log.filter((x) => !x.synced).length;
    dispatch({ type: 'sync' });
    toast(n ? `${n} offline scans synced. Signatures checked, no duplicates.` : 'Everything is already synced.');
  };
  return {
    mode: state.mode,
    setMode: (mode: ScanMode) => dispatch({ type: 'mode', mode }),
    scan,
    log: state.log,
    last: state.log[0] ?? null,
    offline: state.offline,
    goOffline: () => dispatch({ type: 'offline' }),
    sync,
  };
}

/** The camera window: corner brackets and a sweeping line; tapping it reads the next badge. */
function Viewfinder({ onScan, tint, big = false }: { onScan: () => void; tint: string | null; big?: boolean }) {
  const [sweep] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(sweep, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [sweep]);
  const size = big ? 260 : 170;
  return (
    <Pressable style={[styles.finder, { height: size + 40 }, big && styles.finderBig, tint ? { borderColor: tint } : null]} onPress={onScan} accessibilityRole="button" accessibilityLabel="Scan a QR badge">
      <View style={[styles.frame, { width: size, height: size }]}>
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <View key={c} style={[styles.corner, styles[c], tint ? { borderColor: tint } : null]} />
        ))}
        <Icon name="qr" size={size * 0.38} color={big ? 'rgba(255,255,255,0.35)' : Maple.blueLine} />
        <Animated.View style={[styles.sweep, { width: size - 24, transform: [{ translateY: sweep.interpolate({ inputRange: [0, 1], outputRange: [12, size - 12] }) }] }, tint ? { backgroundColor: tint } : null]} />
      </View>
      <Text style={[styles.finderHint, big && styles.finderHintBig]} numberOfLines={1}>
        {big ? 'Point at a badge · tap the frame to simulate a scan' : 'Tap the frame to simulate a scan'}
      </Text>
    </Pressable>
  );
}

/** The result card: green, amber or red, with who it is and what happens next. */
function ResultCard({ s, onAgain }: { s: ScanLog; onAgain: () => void }) {
  const r = RESULT[s.result];
  return (
    <View style={[styles.result, { backgroundColor: r.soft, borderColor: r.color }]} accessibilityLiveRegion="polite">
      <Image source={s.person.avatar} style={styles.resultFace} contentFit="cover" />
      <View style={styles.flex}>
        <View style={styles.resultHead}>
          <View style={[styles.resultBadge, { backgroundColor: r.color }]}>
            <Icon name={r.icon} size={14} color={WHITE} />
            <Text style={styles.resultBadgeText}>{r.title}</Text>
          </View>
          <Text style={styles.time}>{s.time}</Text>
        </View>
        <Text style={styles.resultName}>{s.person.name}</Text>
        <Text style={styles.meta}>{s.person.detail}</Text>
        <Text style={[styles.resultMsg, { color: r.color }]}>{s.message}</Text>
      </View>
      {s.result === 'denied' ? (
        <Pressable onPress={onAgain} accessibilityRole="button" accessibilityLabel="Scan the same badge again" hitSlop={8}>
          <Icon name="sync" size={20} color={NAVY} />
        </Pressable>
      ) : null}
    </View>
  );
}

const MODE_ICON: Readonly<Record<ScanMode, 'arrowRight' | 'arrowLeft' | 'book'>> = { 'Gate Entry': 'arrowRight', 'Gate Exit': 'arrowLeft', 'Lesson Check': 'book' };

/** Mode buttons: Gate Entry, Gate Exit, Lesson Check. */
function Modes({ modes, mode, onChange, dark = false, compact = false }: { modes: readonly ScanMode[]; mode: ScanMode; onChange: (m: ScanMode) => void; dark?: boolean; compact?: boolean }) {
  return (
    <View style={[styles.modes, dark && styles.modesDark]} accessibilityRole="tablist">
      {modes.map((m) => {
        const on = m === mode;
        return (
          <Pressable key={m} style={[styles.mode, on && styles.modeOn]} onPress={() => onChange(m)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={m}>
            {compact ? null : <Icon name={MODE_ICON[m]} size={16} color={on ? WHITE : dark ? Maple.blueLine : NAVY} />}
            <Text style={[styles.modeText, dark && styles.modeTextDark, on && styles.modeTextOn]} numberOfLines={1}>
              {m}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** The desktop scanner card (the reference's right-hand panel). */
export function ScannerPanel({ a }: { a: Admin }) {
  const s = useScanner(a);
  return (
    <Card style={styles.panel}>
      <Modes modes={a.attendance.modes} mode={s.mode} onChange={s.setMode} compact />
      <Viewfinder onScan={() => s.scan()} tint={s.last ? RESULT[s.last.result].color : null} />
      <Text style={styles.panelTitle}>Scan Student or Teacher QR</Text>
      <Text style={styles.meta}>Entry • Lesson • Exit</Text>
      {s.last ? <ResultCard s={s.last} onAgain={() => s.scan(true)} /> : null}
      <Btn label="Start Scanning" icon="camera" onPress={() => router.push('/admin/scan' as never)} height={48} style={styles.stretch} />
      <View style={styles.panelBtns}>
        <Btn label="Manual Check-in" kind="outline" onPress={() => toast('Search a learner or teacher and record why they had no badge. A reason is required.')} height={42} style={styles.flex} textStyle={styles.tiny} />
        <Btn label="Print QR IDs" icon="qr" kind="outline" onPress={() => toast('Printing signed, revocable QR badges…')} height={42} style={styles.flex} textStyle={styles.tiny} />
      </View>
    </Card>
  );
}

/** The full-screen mobile scanner for gate and academic-office staff. */
export function ScannerScreen({ a }: { a: Admin }) {
  const s = useScanner(a);
  const insets = useSafeAreaInsets();
  const lesson = a.attendance.lessonNow;
  const counts = { ok: s.log.filter((x) => x.result === 'ok').length, late: s.log.filter((x) => x.result === 'late').length, denied: s.log.filter((x) => x.result === 'denied').length };
  const pending = s.log.filter((x) => !x.synced).length;
  return (
    <ScrollView style={styles.screen} contentContainerStyle={[styles.screenBody, { paddingTop: insets.top + 8 }]}>
      <View style={styles.screenHead}>
        <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/admin/attendance' as never))} accessibilityRole="button" accessibilityLabel="Close scanner" hitSlop={10}>
          <Icon name="close" size={26} color={WHITE} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={styles.screenTitle}>QR Scanner</Text>
          <Text style={styles.screenSub}>Main Gate • Kampala Hill School</Text>
        </View>
        <Pressable style={[styles.netPill, s.offline && styles.netPillOff]} onPress={() => (s.offline ? s.sync() : s.goOffline())} accessibilityRole="button" accessibilityLabel={s.offline ? `Offline, ${pending} scans waiting. Tap to sync` : 'Online. Tap to go offline'}>
          <Icon name={s.offline ? 'cloud' : 'sync'} size={14} color={WHITE} />
          <Text style={styles.netText}>{s.offline ? `Offline · ${pending}` : 'Online'}</Text>
        </Pressable>
      </View>
      <Modes modes={a.attendance.modes} mode={s.mode} onChange={s.setMode} dark />
      {s.mode === 'Lesson Check' ? (
        <View style={styles.lesson}>
          <Icon name="book" size={18} color={Maple.blueLine} />
          <Text style={styles.lessonText}>{`${lesson.cls} ${lesson.subject} • ${lesson.teacher} • ${lesson.room} • due ${lesson.due}`}</Text>
        </View>
      ) : null}
      <Viewfinder onScan={() => s.scan()} tint={s.last ? RESULT[s.last.result].color : null} big />
      <View style={styles.counts}>
        {(['ok', 'late', 'denied'] as const).map((k) => (
          <View key={k} style={[styles.count, { borderColor: RESULT[k].color }]}>
            <Text style={[styles.countNum, { color: RESULT[k].color }]}>{counts[k]}</Text>
            <Text style={styles.countLabel}>{k === 'ok' ? 'Verified' : k === 'late' ? 'Late / flagged' : 'Not allowed'}</Text>
          </View>
        ))}
      </View>
      <View style={styles.sheet}>
        {s.last ? <ResultCard s={s.last} onAgain={() => s.scan(true)} /> : <Text style={styles.empty}>Scans appear here with a green, amber or red result and a sound.</Text>}
        <Text style={styles.queueTitle}>Recent scans</Text>
        {s.log.slice(0, 5).map((x) => (
          <View key={x.key} style={styles.queueRow}>
            <View style={[styles.queueDot, { backgroundColor: RESULT[x.result].color }]} />
            <Text style={styles.queueName} numberOfLines={1}>
              {x.person.name}
            </Text>
            <Text style={styles.queueMeta}>{`${x.mode.replace('Gate ', '')} · ${x.time}`}</Text>
            {x.synced ? <Icon name="check" size={14} color={GREEN} /> : <Pill label="Queued" tone="orange" size={11} />}
          </View>
        ))}
        <View style={styles.sheetBtns}>
          <Btn label="Manual Check-in" kind="outline" onPress={() => toast('Search by name or admission number. Give a reason; it goes in the audit log.')} height={46} style={styles.flex} textStyle={styles.small} />
          <Btn label="Sync Now" icon="sync" onPress={s.sync} height={46} style={styles.flex} textStyle={styles.small} />
        </View>
        <Text style={styles.security}>Badges are signed and can be revoked. Scanners sign in, duplicate scans are ignored, and offline scans sync safely.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stretch: { alignSelf: 'stretch' },
  small: { fontSize: 13.5 },
  tiny: { fontSize: 12.5 },
  meta: { fontSize: 12.5, color: BODY },
  panel: { alignItems: 'center', gap: 10, padding: 14 },
  panelTitle: { fontSize: 17, fontWeight: '800', color: NAVY },
  panelBtns: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  modes: { flexDirection: 'row', alignSelf: 'stretch', gap: 4, padding: 4, borderRadius: 12, backgroundColor: Maple.blueSelected },
  modesDark: { marginHorizontal: 18, backgroundColor: 'rgba(255,255,255,0.1)' },
  mode: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 9 },
  modeOn: { backgroundColor: BLUE },
  modeText: { fontSize: 13, fontWeight: '500', color: NAVY },
  modeTextDark: { color: Maple.blueLine },
  modeTextOn: { color: WHITE, fontWeight: '700' },
  finder: { alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, borderWidth: 1.5, borderColor: 'transparent', backgroundColor: Maple.blueSoft },
  finderBig: { marginHorizontal: 18, backgroundColor: Maple.navy },
  frame: { alignItems: 'center', justifyContent: 'center' },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: BLUE },
  tl: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 10 },
  tr: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 10 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 10 },
  br: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 10 },
  sweep: { position: 'absolute', left: 12, top: 0, height: 3, borderRadius: 2, backgroundColor: BLUE, opacity: 0.8 },
  finderHint: { fontSize: 12, color: BODY },
  finderHintBig: { color: Maple.blue },
  result: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 12, borderRadius: 14, borderWidth: 2 },
  resultFace: { width: 52, height: 52, borderRadius: 26 },
  resultHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  resultBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  resultBadgeText: { fontSize: 12.5, fontWeight: '700', color: WHITE },
  time: { fontSize: 12, color: BODY },
  resultName: { marginTop: 4, fontSize: 16, fontWeight: '800', color: NAVY },
  resultMsg: { marginTop: 4, fontSize: 13, fontWeight: '600' },
  screen: { flex: 1, backgroundColor: '#081230' },
  screenBody: { flexGrow: 1, gap: 14, width: '100%', maxWidth: SCANNER_MAX_WIDTH, alignSelf: 'center' },
  screenHead: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18 },
  screenTitle: { fontSize: 20, fontWeight: '800', color: WHITE },
  screenSub: { fontSize: 13, color: Maple.blue },
  netPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(34,165,90,0.85)' },
  netPillOff: { backgroundColor: 'rgba(217,127,6,0.9)' },
  netText: { fontSize: 12.5, fontWeight: '700', color: WHITE },
  lesson: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 18, padding: 10, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' },
  lessonText: { flex: 1, fontSize: 12.5, color: Maple.blueSelected },
  counts: { flexDirection: 'row', gap: 8, marginHorizontal: 18 },
  count: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 10, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.04)' },
  countNum: { fontSize: 20, fontWeight: '800' },
  countLabel: { fontSize: 11.5, color: Maple.blueLine },
  sheet: { flexGrow: 1, gap: 8, padding: 18, paddingBottom: 28, borderTopLeftRadius: 22, borderTopRightRadius: 22, backgroundColor: WHITE },
  empty: { fontSize: 13.5, color: BODY, textAlign: 'center', paddingVertical: 10 },
  queueTitle: { marginTop: 4, fontSize: 14, fontWeight: '700', color: NAVY },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, borderBottomWidth: 1, borderColor: LINE },
  queueDot: { width: 10, height: 10, borderRadius: 5 },
  queueName: { flex: 1, fontSize: 13.5, color: NAVY },
  queueMeta: { fontSize: 12, color: BODY },
  sheetBtns: { flexDirection: 'row', gap: 10, marginTop: 6 },
  security: { fontSize: 11.5, lineHeight: 16, color: BODY, textAlign: 'center' },
});

