import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Brand } from '@/features/public/palette';
import type { IconName } from '@/lib/icons';

const REACTIONS = ['👏', '👍', '❤️', '😂', '🎉'] as const;

interface Tile {
  name: string;
  photo: number;
  speaking: boolean;
}

/** The teacher's video, the class controls, and the strip of participant tiles. */
export function Stage({ photo, teacher, tiles, others, hand, onHand, compact = false }: { photo: number; teacher: string; tiles: readonly Tile[]; others: number; hand: boolean; onHand: () => void; compact?: boolean }) {
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [picker, setPicker] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);

  const controls: { key: string; label: string; icon: IconName; on: boolean; danger?: boolean; onPress: () => void }[] = [
    { key: 'mic', label: 'Mic', icon: mic ? 'mic' : 'micOff', on: mic, danger: !mic, onPress: () => setMic((v) => !v) },
    { key: 'camera', label: 'Camera', icon: camera ? 'video' : 'videoOff', on: camera, onPress: () => setCamera((v) => !v) },
    { key: 'share', label: 'Share', icon: 'screen', on: sharing, onPress: () => setSharing((v) => !v) },
    { key: 'hand', label: hand ? 'Lower Hand' : 'Raise Hand', icon: 'hand', on: hand, onPress: onHand },
    { key: 'react', label: 'Reactions', icon: 'smile', on: picker, onPress: () => setPicker((v) => !v) },
    { key: 'more', label: 'More', icon: 'more', on: false, onPress: () => undefined },
  ];

  const controlBar = (
    <View style={[styles.controls, compact && styles.controlsCompact]}>
      {controls.map((c) => (
        <Pressable key={c.key} style={[styles.control, compact && styles.controlCompact, c.on && styles.controlOn]} onPress={c.onPress} accessibilityRole="button" accessibilityState={{ selected: c.on }} accessibilityLabel={c.label}>
          <Icon name={c.icon} size={20} color={c.danger ? '#FF6B6B' : Brand.surface} />
          <Text style={styles.controlText} numberOfLines={1}>{compact ? c.label.split(' ')[0] : c.label}</Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={[styles.video, compact && styles.videoCompact]} accessibilityLabel={`${teacher} teaching: Fractions, adding and subtracting`}>
        <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="top" />
        {reaction ? <Text style={styles.reaction}>{reaction}</Text> : null}
        {picker ? (
          <View style={styles.picker}>
            {REACTIONS.map((r) => (
              <Pressable
                key={r}
                onPress={() => {
                  setReaction(r);
                  setPicker(false);
                }}
                accessibilityRole="button"
                accessibilityLabel={`React ${r}`}>
                <Text style={styles.pickerEmoji}>{r}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {compact ? null : controlBar}
      </View>
      {compact ? controlBar : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tiles}>
        {tiles.map((t, i) => (
          <View key={t.name} style={[styles.tile, i === 0 && styles.tileActive]} accessibilityLabel={`${t.name}${t.speaking ? ', speaking' : ''}`}>
            <Image source={t.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
          </View>
        ))}
        <View style={[styles.tile, styles.moreTile]} accessibilityLabel={`${others} more participants`}>
          <Icon name="people" size={22} color={Brand.surface} />
          <Text style={styles.moreText}>{`+${others}`}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  // The photo is the reference's whole stage, control bar included; ours is drawn over that bar.
  video: { aspectRatio: 932 / 476, borderRadius: 12, overflow: 'hidden', backgroundColor: Brand.video, justifyContent: 'flex-end', alignItems: 'center' },
  controls: { position: 'absolute', left: '26.2%', width: '51.6%', bottom: '1.7%', height: '11.8%', flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 6, borderRadius: 12, backgroundColor: '#1B2230' },
  // Phones put the bar under the video and crop the printed one away.
  videoCompact: { aspectRatio: 932 / 410 },
  control: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6, borderRadius: 8 },
  controlOn: { backgroundColor: 'rgba(255,255,255,0.16)' },
  controlCompact: { flex: 1, minWidth: 0, paddingHorizontal: 2 },
  controlsCompact: { position: 'relative', left: 0, width: '100%', bottom: 0, height: undefined, paddingVertical: 6, justifyContent: 'space-between', backgroundColor: '#111827' },
  controlText: { fontSize: 11, color: Brand.surface },
  reaction: { position: 'absolute', right: 30, bottom: 90, fontSize: 48 },
  picker: { position: 'absolute', bottom: 82, flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(17, 24, 39, 0.9)' },
  pickerEmoji: { fontSize: 26 },
  tiles: { gap: 8 },
  tile: { width: 150, height: 94, borderRadius: 8, overflow: 'hidden', backgroundColor: Brand.video },
  tileActive: { borderWidth: 2, borderColor: Brand.blue },
  moreTile: { alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#1F2937' },
  moreText: { fontSize: 14, fontWeight: '700', color: Brand.surface },
});
