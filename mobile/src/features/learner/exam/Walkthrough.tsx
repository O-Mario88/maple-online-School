import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, type GestureResponderEvent, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatPlayback } from '@/lib/exam';

import type { Question } from './useExam';

const BLUE = '#1463F3';
const SPEEDS = [1, 1.5, 2] as const;
const TICK_MS = 1000;
/** The filmed frame's shape (the reference's x 474–851, y 367–541). */
const FRAME_RATIO = 377 / 174;
const HAND = Platform.select({ ios: 'Noteworthy', android: 'casual', default: '"Segoe Print", "Comic Sans MS", cursive' });

/** The walkthrough's length as the button and title show it, for example "Teacher Walkthrough (2:14)". */
export const walkthroughLabel = (q: Question) => `Teacher Walkthrough (${formatPlayback(q.walkthrough.seconds)})`;

/** Simulated playback for sample videos: position, play/pause, seeking and speed. */
export function usePlayback(total: number) {
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const ended = pos >= total;
  const running = playing && !ended;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setPos((p) => Math.min(total, p + speed)), TICK_MS);
    return () => clearInterval(id);
  }, [running, speed, total]);

  return {
    pos,
    running,
    speed,
    toggle: () => {
      if (ended) setPos(0);
      setPlaying(!running);
    },
    seek: (fraction: number) => setPos(Math.round(Math.min(1, Math.max(0, fraction)) * total)),
    nextSpeed: () => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]),
  };
}

/** The whiteboard for questions whose filmed board shows other working: the steps, in the teacher's hand. */
function Board({ q }: { q: Question }) {
  return (
    <View style={styles.board}>
      {q.steps.map((s) => (
        <Text key={s.math} style={styles.boardText} numberOfLines={1} adjustsFontSizeToFit>
          {s.math}
        </Text>
      ))}
    </View>
  );
}

/** The player bar: seek track, play/pause, mute, time, speed, captions and full screen. */
export function PlayerControls({ total, p, muted, onMute, cc, onCc, onExpand }: { total: number; p: ReturnType<typeof usePlayback>; muted: boolean; onMute: () => void; cc: boolean; onCc: () => void; onExpand?: () => void }) {
  const [trackW, setTrackW] = useState(1);
  const pct = `${(p.pos / total) * 100}%` as const;
  return (
    <View style={styles.controls}>
      <Pressable
        style={styles.track}
        onLayout={(e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width)}
        onPress={(e: GestureResponderEvent) => p.seek(e.nativeEvent.locationX / trackW)}
        accessibilityRole="adjustable"
        accessibilityLabel="Video position"
        accessibilityValue={{ min: 0, max: total, now: p.pos, text: formatPlayback(p.pos) }}>
        <View style={styles.trackLine}>
          <View style={[styles.trackFill, { width: pct }]} />
        </View>
        <View style={[styles.knob, { left: pct }]} />
      </Pressable>
      <View style={styles.row}>
        <Pressable onPress={p.toggle} accessibilityRole="button" accessibilityLabel={p.running ? 'Pause' : 'Play'} hitSlop={8}>
          <Icon name={p.running ? 'pause' : 'playFill'} size={20} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={onMute} accessibilityRole="button" accessibilityLabel={muted ? 'Unmute' : 'Mute'} hitSlop={8}>
          <Icon name={muted ? 'volumeOff' : 'volume'} size={19} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.time}>{`${formatPlayback(p.pos)} / ${formatPlayback(total)}`}</Text>
        <View style={styles.flex} />
        <Pressable onPress={p.nextSpeed} accessibilityRole="button" accessibilityLabel={`Speed ${p.speed} times`} hitSlop={8}>
          <Text style={styles.speed}>{`${p.speed}x`}</Text>
        </Pressable>
        <Pressable style={[styles.cc, cc && styles.ccOn]} onPress={onCc} accessibilityRole="switch" accessibilityState={{ checked: cc }} accessibilityLabel="Captions" hitSlop={8}>
          <Text style={[styles.ccText, cc && styles.ccTextOn]}>CC</Text>
        </Pressable>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Icon name="settings" size={19} color="#FFFFFF" />
        </View>
        {onExpand ? (
          <Pressable onPress={onExpand} accessibilityRole="button" accessibilityLabel="Full screen" hitSlop={8}>
            <Icon name="expand" size={18} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** A question's teacher walkthrough: the filmed frame with working play, seek, speed, mute and captions. */
export function WalkthroughPlayer({ q, frame, onClose, onExpand }: { q: Question; frame: number; onClose?: () => void; onExpand?: () => void }) {
  const p = usePlayback(q.walkthrough.seconds);
  const [muted, setMuted] = useState(false);
  const [cc, setCc] = useState(true);
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>{walkthroughLabel(q)}</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close walkthrough" hitSlop={10}>
            <Icon name="close" size={18} color="#FFFFFF" />
          </Pressable>
        ) : null}
      </View>
      <Pressable style={styles.frame} onPress={p.toggle} accessibilityRole="button" accessibilityLabel={p.running ? 'Pause walkthrough' : 'Play walkthrough'}>
        <Image source={frame} style={StyleSheet.absoluteFill} contentFit="cover" />
        {q.walkthrough.board ? null : <Board q={q} />}
        <LinearGradient colors={['rgba(16,20,30,0)', 'rgba(16,20,30,0.85)']} style={styles.fade} />
        {cc && p.running ? <Text style={styles.caption}>{q.walkthrough.caption}</Text> : null}
      </Pressable>
      <PlayerControls total={q.walkthrough.seconds} p={p} muted={muted} onMute={() => setMuted((m) => !m)} cc={cc} onCc={() => setCc((c) => !c)} onExpand={onExpand} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 8, backgroundColor: '#161B26', overflow: 'hidden' },
  head: { height: 39, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  title: { fontSize: 16.5, fontWeight: '700', color: '#FFFFFF' },
  frame: { width: '100%', aspectRatio: FRAME_RATIO, backgroundColor: '#2A3140', overflow: 'hidden' },
  board: { position: 'absolute', left: '37%', right: '3%', top: '4%', bottom: '12%', justifyContent: 'center', gap: 6, paddingHorizontal: 14, borderRadius: 3, backgroundColor: '#F6F7FA' },
  boardText: { fontFamily: HAND, fontSize: 14, color: '#1E2A78' },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%' },
  caption: { position: 'absolute', left: 24, right: 24, bottom: 8, alignSelf: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, backgroundColor: 'rgba(0,0,0,0.7)', fontSize: 12, color: '#FFFFFF', textAlign: 'center', overflow: 'hidden' },
  controls: { paddingHorizontal: 12, paddingBottom: 9, backgroundColor: 'rgba(16,20,30,0.85)' },
  track: { height: 14, justifyContent: 'center' },
  trackLine: { height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.35)', overflow: 'hidden' },
  trackFill: { height: 3, backgroundColor: BLUE },
  knob: { position: 'absolute', top: 2, width: 10, height: 10, marginLeft: -5, borderRadius: 5, borderWidth: 2, borderColor: '#FFFFFF', backgroundColor: BLUE },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 2 },
  time: { fontSize: 12.5, color: '#FFFFFF', fontVariant: ['tabular-nums'] },
  speed: { fontSize: 14, color: '#FFFFFF' },
  cc: { paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3, borderWidth: 1.5, borderColor: '#FFFFFF' },
  ccOn: { backgroundColor: '#FFFFFF' },
  ccText: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  ccTextOn: { color: '#161B26' },
});
