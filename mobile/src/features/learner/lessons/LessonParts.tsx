import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { ContentStats } from '@/features/shared/ContentStats';
import type { IconName } from '@/lib/icons';

import { clock, type LessonStatus, lessonStatus, type VideoLessonItem } from './videoLessons';

/** A lesson's thumbnail: a chalkboard with what the lesson writes on it, its running time, and how far it is watched. */
export function ChalkThumb({ l, height, big = false }: { l: VideoLessonItem; height: number; big?: boolean }) {
  const pct = Math.min(1, l.watched / l.seconds);
  return (
    <View style={[s.thumb, { height }]} accessibilityLabel={`${l.title}, ${clock(l.seconds)}`}>
      <LinearGradient colors={['#21423A', '#173029']} style={StyleSheet.absoluteFill} />
      <View style={s.chalkLine} />
      <Text style={[s.chalk, big && s.chalkBig]} numberOfLines={2}>
        {l.board}
      </Text>
      {big ? (
        <View style={s.play}>
          <Icon name="playFill" size={26} color={L.white} />
        </View>
      ) : null}
      <Text style={s.duration}>{clock(l.seconds)}</Text>
      {pct > 0 && pct < 1 ? (
        <View style={s.track}>
          <View style={[s.fill, { width: `${pct * 100}%` }]} />
        </View>
      ) : null}
    </View>
  );
}

const STATUS: Readonly<Record<LessonStatus | 'locked', { label: string; icon: 'playFill' | 'check' | 'lock'; fg: string; bg: string }>> = {
  progress: { label: 'In Progress', icon: 'playFill', fg: L.blue, bg: '#E7EFFE' },
  done: { label: 'Completed', icon: 'check', fg: L.green, bg: '#E6F6EC' },
  new: { label: 'Not Started', icon: 'playFill', fg: L.body, bg: '#F1F4F9' },
  locked: { label: 'Locked', icon: 'lock', fg: L.body, bg: '#F1F4F9' },
};

export function StatusChip({ l, locked, small = false }: { l: VideoLessonItem; locked: boolean; small?: boolean }) {
  const st = STATUS[locked ? 'locked' : lessonStatus(l)];
  return (
    <View style={[s.chip, { backgroundColor: st.bg }]}>
      <Icon name={st.icon} size={small ? 11 : 12} color={st.fg} />
      <Text style={[s.chipText, small && s.chipTextSmall, { color: st.fg }]}>{st.label}</Text>
    </View>
  );
}

/** Who uploaded it, and its views, rating out of five, likes and comments. */
export function LessonStats({ l, size = 12 }: { l: VideoLessonItem; size?: number }) {
  return <ContentStats e={l} size={size} />;
}

/** A dropdown: the label and current choice (only the choice when compact), opening the choices in a sheet. */
export function Picker<T extends string>({ label, value, options, onChange, icon, width, compact = false }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (v: T) => void; icon: IconName; width?: number; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const shown = options.find((o) => o.value === value)?.label ?? '';
  return (
    <>
      <Pressable style={[compact ? s.pickerC : s.picker, width ? { width } : null]} onPress={() => setOpen(true)} accessibilityRole="button" accessibilityLabel={`${label}: ${shown}`}>
        <Icon name={icon} size={compact ? 15 : 18} color={L.ink} />
        <Text style={compact ? s.pickerTextC : s.pickerText} numberOfLines={1}>
          {compact ? null : `${label}: `}
          <Text style={compact ? null : s.pickerValue}>{shown}</Text>
        </Text>
        <Icon name="chevronDown" size={16} color={L.ink} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.scrim} onPress={() => setOpen(false)} accessibilityLabel="Close">
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>{label}</Text>
            {options.map((o) => (
              <Pressable
                key={o.value}
                style={[s.option, o.value === value && s.optionOn]}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                accessibilityRole="radio"
                accessibilityState={{ selected: o.value === value }}>
                <Text style={[s.optionText, o.value === value && s.optionTextOn]}>{o.label}</Text>
                {o.value === value ? <Icon name="tick" size={18} color={L.blue} /> : null}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

/** A lesson's ⋮ menu: save it to watch later, or download it. */
export function LessonMenu({ l, later, downloaded, onLater, onDownload }: { l: VideoLessonItem; later: boolean; downloaded: boolean; onLater: () => void; onDownload: () => void }) {
  const [open, setOpen] = useState(false);
  const act = (f: () => void) => () => {
    f();
    setOpen(false);
  };
  return (
    <>
      <Pressable onPress={() => setOpen(true)} hitSlop={10} accessibilityRole="button" accessibilityLabel={`More for ${l.title}`}>
        <Icon name="more" size={18} color={L.ink} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.scrim} onPress={() => setOpen(false)} accessibilityLabel="Close">
          <View style={s.sheet}>
            <Text style={s.sheetTitle} numberOfLines={2}>
              {l.title}
            </Text>
            <Pressable style={s.option} onPress={act(onLater)} accessibilityRole="button">
              <Icon name={later ? 'bookmarkOn' : 'bookmark'} size={18} color={L.ink} />
              <Text style={s.optionText}>{later ? 'Remove from Watch Later' : 'Watch later'}</Text>
            </Pressable>
            <Pressable style={s.option} onPress={act(onDownload)} accessibilityRole="button">
              <Icon name="download" size={18} color={L.ink} />
              <Text style={s.optionText}>{downloaded ? 'Remove download' : 'Download for offline'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  thumb: { overflow: 'hidden', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chalkLine: { position: 'absolute', left: 12, right: 12, bottom: 18, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' },
  chalk: { paddingHorizontal: 12, fontSize: 17, fontStyle: 'italic', color: 'rgba(255,255,255,0.92)', textAlign: 'center' },
  chalkBig: { position: 'absolute', top: 18, right: 22, fontSize: 22 },
  play: { width: 50, height: 50, borderRadius: 25, borderWidth: 2.5, borderColor: L.white, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  duration: { position: 'absolute', right: 8, bottom: 8, overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, fontSize: 11.5, fontWeight: '600', color: L.white, backgroundColor: 'rgba(0,0,0,0.65)' },
  track: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  fill: { height: 4, backgroundColor: L.blue },
  chip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7 },
  chipText: { fontSize: 12.5, fontWeight: '600' },
  chipTextSmall: { fontSize: 11.5 },
  picker: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#DFE5EE', backgroundColor: L.white },
  pickerText: { flex: 1, fontSize: 14, color: L.ink },
  pickerC: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: L.white },
  pickerTextC: { fontSize: 13, color: L.ink },
  pickerValue: { fontWeight: '600' },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(11,26,63,0.35)' },
  sheet: { width: '100%', maxWidth: 360, gap: 4, padding: 16, borderRadius: 16, backgroundColor: L.white },
  sheetTitle: { marginBottom: 6, fontSize: 16, fontWeight: '600', color: L.navy },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44, paddingHorizontal: 10, borderRadius: 10 },
  optionOn: { backgroundColor: L.soft },
  optionText: { flex: 1, fontSize: 15, color: L.ink },
  optionTextOn: { fontWeight: '600', color: L.blue },
});
