import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useTeacherGo } from '@/features/teacher/frame/TeacherFrame';
import { PopMenu } from '@/features/teacher/frame/TeacherInputs';
import { BLUE, BODY, INK, LINE, MUTED, RED, TButton } from '@/features/teacher/frame/TeacherParts';
import { formatTimestamp, parseTimestamp } from '@/lib/course-builder';

import type { Builder } from './useCourseBuilder';

const TICK_MS = 250;
const SPEEDS = [1, 1.25, 1.5, 2];

export interface Player {
  pos: number;
  playing: boolean;
  speed: number;
  length: number;
  toggle: () => void;
  seek: (at: number) => void;
  nextSpeed: () => void;
}

/** A pretend player clock: plays, pauses, seeks and changes speed. */
export function usePlayer(length: number): Player {
  const [pos, setPos] = useState(0);
  const [wantsPlay, setWantsPlay] = useState(false);
  const [speed, setSpeed] = useState(1);
  // It stops by itself at the end: playing is derived, not stored.
  const playing = wantsPlay && pos < length;
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos((p) => Math.min(length, p + (TICK_MS / 1000) * speed));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [playing, speed, length]);
  return {
    pos,
    playing,
    speed,
    length,
    toggle: () => {
      if (playing) return setWantsPlay(false);
      if (pos >= length) setPos(0);
      setWantsPlay(true);
    },
    seek: (at) => setPos(Math.min(Math.max(0, at), length)),
    nextSpeed: () => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length]),
  };
}

/** "0:00", as the player's clock prints time. */
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/** The lesson video with a working control bar; an upload box when the lesson has no video yet. */
export function VideoPlayer({ frame, b, player, compact = false }: { frame: number; b: Builder; player: Player; compact?: boolean }) {
  const go = useTeacherGo();
  const [width, setWidth] = useState(0);
  if (!b.hasVideo) {
    return (
      <View style={[styles.upload, compact && styles.uploadP]}>
        <Icon name="upload" size={26} color={BLUE} />
        <Text style={styles.uploadTitle}>Upload this lesson’s video</Text>
        <Text style={styles.uploadSub}>MP4 or MOV, up to 2 GB. Captions are added for you.</Text>
        <TButton small label="Upload Video" icon="upload" onPress={b.uploadVideo} />
      </View>
    );
  }
  const share = player.length ? player.pos / player.length : 0;
  return (
    <View style={styles.player}>
      <Pressable onPress={player.toggle} accessibilityRole="button" accessibilityLabel={player.playing ? 'Pause the lesson video' : 'Play the lesson video'}>
        <Image source={frame} style={styles.frame} contentFit="cover" accessibilityLabel="A teacher explaining place value at a whiteboard" />
        {player.playing ? (
          <View style={styles.pauseOver}>
            <Icon name="pause" size={22} color="#FFFFFF" />
          </View>
        ) : null}
      </Pressable>
      <View style={styles.bar}>
        <Pressable
          style={styles.track}
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          onPress={(e) => width > 0 && player.seek((e.nativeEvent.locationX / width) * player.length)}
          accessibilityRole="adjustable"
          accessibilityLabel={`Position ${clock(player.pos)} of ${clock(player.length)}`}>
          <View style={[styles.fill, { width: `${share * 100}%` }]} />
          <View style={[styles.knob, { left: `${share * 100}%` }]} />
        </Pressable>
        <View style={styles.controls}>
          <Pressable onPress={player.toggle} accessibilityRole="button" accessibilityLabel={player.playing ? 'Pause' : 'Play'} hitSlop={8}>
            <Icon name={player.playing ? 'pause' : 'playFill'} size={compact ? 13 : 15} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.time}>{`${clock(player.pos)} / ${clock(player.length)}`}</Text>
          <View style={styles.flex} />
          <View style={styles.cc}>
            <Text style={styles.ccText}>CC</Text>
          </View>
          <Pressable onPress={player.nextSpeed} accessibilityRole="button" accessibilityLabel={`Playback speed ${player.speed}x. Change`} hitSlop={8}>
            <Text style={styles.speed}>{`${player.speed % 1 === 0 ? player.speed.toFixed(1) : player.speed}x`}</Text>
          </Pressable>
          <Pressable onPress={() => go('/learn/lesson')} accessibilityRole="button" accessibilityLabel="Open full screen as a learner" hitSlop={8}>
            <Icon name="expand" size={14} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/** The video's chapter marks: tap one to jump there, add new ones, remove old ones. */
export function Timestamps({ b, player, max }: { b: Builder; player: Player; max?: number }) {
  const [adding, setAdding] = useState(false);
  const [time, setTime] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const currentAt = b.marks.filter((m) => m.at <= player.pos).pop()?.at;
  const add = () => {
    const at = parseTimestamp(time);
    if (at === null) return setError('Write the time as minutes:seconds, like 05:10.');
    if (at > player.length) return setError(`The video is only ${formatTimestamp(player.length)} long.`);
    if (!label.trim()) return setError('Give the timestamp a short name.');
    b.addMark(at, label.trim());
    setAdding(false);
    setTime('');
    setLabel('');
    setError(null);
  };
  const rows = max ? b.marks.slice(0, max) : b.marks;
  return (
    <View>
      <View style={styles.head}>
        <Text style={styles.headTitle} numberOfLines={1} accessibilityRole="header">
          Interactive Timestamps
        </Text>
        <Pressable style={styles.addBtn} onPress={() => setAdding((a) => !a)} disabled={!b.hasVideo} accessibilityRole="button" accessibilityLabel="Add timestamp" accessibilityState={{ expanded: adding, disabled: !b.hasVideo }}>
          <Icon name="plus" size={11} color={BLUE} />
          <Text style={styles.addText}>Add Timestamp</Text>
        </Pressable>
      </View>
      {adding ? (
        <View style={styles.form}>
          <View style={styles.formRow}>
            <TextInput style={[styles.input, styles.timeInput]} value={time} onChangeText={setTime} placeholder={formatTimestamp(Math.floor(player.pos))} placeholderTextColor={MUTED} accessibilityLabel="Time, minutes and seconds" />
            <TextInput style={[styles.input, styles.flex]} value={label} onChangeText={setLabel} onSubmitEditing={add} placeholder="What happens here" placeholderTextColor={MUTED} accessibilityLabel="Timestamp name" />
          </View>
          {error ? (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ) : null}
          <View style={styles.formRow}>
            <TButton small label="Add" onPress={add} style={styles.flex} />
            <TButton small label="Cancel" variant="outline" onPress={() => { setAdding(false); setError(null); }} style={styles.flex} />
          </View>
        </View>
      ) : null}
      {b.marks.length === 0 && !adding ? <Text style={styles.empty}>{b.hasVideo ? 'No timestamps yet. Add one for each part of the video.' : 'Upload a video first, then mark its parts here.'}</Text> : null}
      {rows.map((m) => {
        const on = m.at === currentAt && player.pos > 0;
        return (
          <View key={m.at} style={[styles.mark, on && styles.markOn]}>
            <Pressable style={styles.markMain} onPress={() => player.seek(m.at)} accessibilityRole="button" accessibilityLabel={`Jump to ${formatTimestamp(m.at)}, ${m.label}`}>
              <View style={[styles.markIcon, { backgroundColor: `${m.color}1F` }]}>
                <Icon name={m.icon} size={9} color={m.color} />
              </View>
              <Text style={styles.markTime}>{formatTimestamp(m.at)}</Text>
              <Text style={styles.markLabel} numberOfLines={1}>
                {m.label}
              </Text>
            </Pressable>
            <PopMenu
              label={`Actions for ${m.label}`}
              width={150}
              items={[
                { label: 'Jump to here', icon: 'playFill', onPress: () => player.seek(m.at) },
                { label: 'Remove', icon: 'trash', danger: true, onPress: () => b.removeMark(m.at) },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  player: { borderRadius: 8, overflow: 'hidden', backgroundColor: '#0E0E10' },
  frame: { width: '100%', aspectRatio: 426 / 203 },
  pauseOver: { position: 'absolute', top: '50%', left: '50%', width: 52, height: 52, marginTop: -26, marginLeft: -26, alignItems: 'center', justifyContent: 'center', borderRadius: 26, backgroundColor: 'rgba(30,30,32,0.92)' },
  bar: { backgroundColor: '#141416' },
  track: { height: 10, justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, height: 3, backgroundColor: RED },
  knob: { position: 'absolute', width: 9, height: 9, marginLeft: -4, borderRadius: 5, backgroundColor: RED },
  controls: { height: 26, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingBottom: 4 },
  time: { fontSize: 11, color: '#FFFFFF' },
  cc: { paddingHorizontal: 3, borderRadius: 2, backgroundColor: '#FFFFFF' },
  ccText: { fontSize: 8, fontWeight: '800', color: '#141416' },
  speed: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  upload: { aspectRatio: 426 / 238, alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C9D6EA', backgroundColor: '#FAFCFF' },
  uploadP: { aspectRatio: 16 / 10 },
  uploadTitle: { fontSize: 13, fontWeight: '700', color: INK },
  uploadSub: { fontSize: 11, color: MUTED, marginBottom: 4 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 },
  headTitle: { flexShrink: 1, fontSize: 11.5, fontWeight: '700', color: INK, letterSpacing: -0.2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 5, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: LINE },
  addText: { fontSize: 8.5, fontWeight: '600', color: BLUE },
  form: { gap: 6, marginBottom: 8, padding: 8, borderRadius: 8, backgroundColor: '#F4F8FF' },
  formRow: { flexDirection: 'row', gap: 6 },
  input: { height: 28, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF', fontSize: 11, color: INK },
  timeInput: { width: 58 },
  error: { fontSize: 10.5, color: RED },
  empty: { fontSize: 11, color: MUTED, paddingVertical: 8 },
  mark: { height: 34.5, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 3, borderRadius: 6 },
  markOn: { backgroundColor: '#EEF4FF' },
  markMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 7 },
  markIcon: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  markTime: { width: 31, fontSize: 10, color: BODY },
  markLabel: { flex: 1, fontSize: 10, color: INK, letterSpacing: -0.1 },
});
