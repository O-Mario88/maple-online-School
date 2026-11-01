import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ExcalidrawBoard } from '@/features/classroom/ExcalidrawBoard';
import { Brand } from '@/features/public/palette';
import type {
  BoardSnapshot,
  ExcalidrawDeltaPacket,
  ExcalidrawElement,
} from '@/lib/excalidraw-livekit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';

const REACTIONS = ['👏', '👍', '❤️', '😂', '🎉'] as const;

interface Tile {
  name: string;
  photo: number;
  speaking: boolean;
}

/** The teacher's video or Excalidraw interactive whiteboard, the class controls, and the strip of participant tiles. */
export function Stage({
  photo,
  teacher,
  teacherAvatar,
  tiles,
  others,
  hand,
  onHand,
  compact = false,
  whiteboardOpen = false,
  onToggleWhiteboard,
  elements = [],
  onChangeElements,
  viewModeEnabled = true,
  activeDrawerName = 'Ms. Sarah Kimani',
  onSaveSnapshot,
  packets = [],
}: {
  photo: number;
  teacher: string;
  teacherAvatar?: number;
  tiles: readonly Tile[];
  others: number;
  hand: boolean;
  onHand: () => void;
  compact?: boolean;
  whiteboardOpen?: boolean;
  onToggleWhiteboard?: () => void;
  elements?: readonly ExcalidrawElement[];
  onChangeElements?: (next: readonly ExcalidrawElement[], packet: ExcalidrawDeltaPacket | null) => void;
  viewModeEnabled?: boolean;
  activeDrawerName?: string;
  onSaveSnapshot?: (snapshot: BoardSnapshot) => void;
  packets?: readonly ExcalidrawDeltaPacket[];
}) {
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  const [picker, setPicker] = useState(false);
  const [more, setMore] = useState(false);
  const [shareAsked, setShareAsked] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [pipInCorner, setPipInCorner] = useState(true);

  const controls: {
    key: string;
    label: string;
    icon: IconName;
    on: boolean;
    danger?: boolean;
    onPress: () => void;
  }[] = [
    {
      key: 'mic',
      label: 'Mic',
      icon: mic ? 'mic' : 'micOff',
      on: mic,
      danger: !mic,
      onPress: () => setMic((v) => !v),
    },
    {
      key: 'camera',
      label: 'Camera',
      icon: camera ? 'video' : 'videoOff',
      on: camera,
      onPress: () => setCamera((v) => !v),
    },
    {
      key: 'share',
      label: 'Share',
      icon: 'screen',
      on: shareAsked,
      onPress: () => {
        setShareAsked((v) => !v);
        toast(shareAsked ? 'Request to share withdrawn.' : `Request sent. ${teacher} can let you share your screen.`);
      },
    },
    {
      key: 'hand',
      label: hand ? 'Lower Hand' : 'Raise Hand',
      icon: 'hand',
      on: hand,
      onPress: onHand,
    },
    {
      key: 'react',
      label: 'Reactions',
      icon: 'smile',
      on: picker,
      onPress: () => setPicker((v) => !v),
    },
    {
      key: 'more',
      label: 'More',
      icon: 'more',
      on: more,
      onPress: () => setMore((v) => !v),
    },
  ];

  const controlBar = (
    <View style={[styles.controls, compact && styles.controlsCompact]}>
      {controls.map((c) => (
        <Pressable
          key={c.key}
          style={[styles.control, compact && styles.controlCompact, c.on && styles.controlOn]}
          onPress={c.onPress}
          accessibilityRole="button"
          accessibilityState={{ selected: c.on }}
          accessibilityLabel={c.label}>
          <Icon name={c.icon} size={20} color={c.danger ? '#FF6B6B' : Brand.surface} />
          <Text style={styles.controlText} numberOfLines={1}>
            {compact ? c.label.split(' ')[0] : c.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View
        style={[styles.video, compact && styles.videoCompact]}
        accessibilityLabel={`${teacher} teaching: Fractions, adding and subtracting`}>
        {whiteboardOpen ? (
          <View style={StyleSheet.absoluteFill}>
            <ExcalidrawBoard
              elements={elements}
              onChangeElements={(next, pkt) => onChangeElements?.(next, pkt)}
              viewModeEnabled={viewModeEnabled}
              activeDrawerName={activeDrawerName}
              teacherName={teacher}
              teacherPhoto={teacherAvatar ?? tiles[0]?.photo ?? photo}
              pipInCorner={pipInCorner}
              onTogglePipLocation={() => setPipInCorner((v) => !v)}
              onSaveSnapshot={(snap) => onSaveSnapshot?.(snap)}
              packets={packets}
            />
          </View>
        ) : (
          <Image
            source={photo}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="top"
          />
        )}
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
        {more ? (
          <View style={styles.moreMenu} accessibilityRole="menu">
            {[
              { label: whiteboardOpen ? 'Show the teacher' : 'Show the whiteboard', icon: (whiteboardOpen ? 'video' : 'edit') as IconName, onPress: () => onToggleWhiteboard?.() },
              { label: 'Report a problem', icon: 'flag' as IconName, onPress: () => router.push('/report-concern') },
            ].map((m) => (
              <Pressable
                key={m.label}
                style={styles.moreRow}
                onPress={() => {
                  setMore(false);
                  m.onPress();
                }}
                accessibilityRole="menuitem">
                <Icon name={m.icon} size={16} color={Brand.surface} />
                <Text style={styles.moreLabel}>{m.label}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {compact ? null : controlBar}
      </View>
      {compact ? controlBar : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tiles}>
        {whiteboardOpen && !pipInCorner ? (
          <Pressable
            style={[styles.tile, styles.tilePinnedPip]}
            onPress={() => setPipInCorner(true)}
            accessibilityLabel={`${teacher} pinned PiP camera`}>
            <Image
              source={teacherAvatar ?? tiles[0]?.photo ?? photo}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <View style={styles.pipStripTag}>
              <Text style={styles.pipStripText}>PiP · {teacher}</Text>
            </View>
          </Pressable>
        ) : null}
        {tiles.map((t, i) => (
          <View
            key={t.name}
            style={[styles.tile, i === 0 && styles.tileActive]}
            accessibilityLabel={`${t.name}${t.speaking ? ', speaking' : ''}`}>
            <Image source={t.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
          </View>
        ))}
        <View
          style={[styles.tile, styles.moreTile]}
          accessibilityLabel={`${others} more participants`}>
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
  video: {
    aspectRatio: 932 / 476,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Brand.video,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    left: '26.2%',
    width: '51.6%',
    bottom: '1.7%',
    height: '11.8%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#1B2230',
  },
  // Phones put the bar under the video and crop the printed one away.
  videoCompact: { aspectRatio: 932 / 410 },
  control: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 6, borderRadius: 8 },
  controlOn: { backgroundColor: 'rgba(255,255,255,0.16)' },
  controlCompact: { flex: 1, minWidth: 0, paddingHorizontal: 2 },
  controlsCompact: {
    position: 'relative',
    left: 0,
    width: '100%',
    bottom: 0,
    height: undefined,
    paddingVertical: 6,
    justifyContent: 'space-between',
    backgroundColor: '#111827',
  },
  controlText: { fontSize: 11, color: Brand.surface },
  reaction: { position: 'absolute', right: 30, bottom: 90, fontSize: 48 },
  picker: {
    position: 'absolute',
    bottom: 82,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
  },
  pickerEmoji: { fontSize: 26 },
  moreMenu: { position: 'absolute', right: 24, bottom: 82, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(17, 24, 39, 0.94)' },
  moreRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 9 },
  moreLabel: { fontSize: 13, color: Brand.surface },
  tiles: { gap: 8 },
  tile: {
    width: 150,
    height: 94,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Brand.video,
  },
  tileActive: { borderWidth: 2, borderColor: Brand.blue },
  tilePinnedPip: { borderWidth: 2, borderColor: '#22C55E' },
  pipStripTag: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pipStripText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  moreTile: { alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: '#1F2937' },
  moreText: { fontSize: 14, fontWeight: '700', color: Brand.surface },
});
