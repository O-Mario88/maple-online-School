import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PlayerControls, usePlayback } from '@/features/learner/exam/Walkthrough';

function Player({ poster, title, seconds, onClose }: { poster?: number; title: string; seconds: number; onClose: () => void }) {
  const p = usePlayback(seconds);
  const [muted, setMuted] = useState(false);
  const [cc, setCc] = useState(true);
  return (
    <View style={styles.sheet}>
      <View style={styles.head}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close video" hitSlop={8}>
          <Icon name="close" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
      <Pressable style={styles.video} onPress={p.toggle} accessibilityRole="button" accessibilityLabel={p.running ? 'Pause' : 'Play'}>
        {poster ? <Image source={poster} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
        {p.running ? null : (
          <View style={styles.play}>
            <Icon name="playFill" size={26} color="#FFFFFF" />
          </View>
        )}
        {cc && p.running ? <Text style={styles.caption}>{title}</Text> : null}
      </Pressable>
      <PlayerControls total={seconds} p={p} muted={muted} onMute={() => setMuted(!muted)} cc={cc} onCc={() => setCc(!cc)} />
    </View>
  );
}

/** "1:45" or "2 min" as seconds; two minutes when it can't be read. */
export function lengthSeconds(length?: string): number {
  if (!length) return 120;
  const mm = /(\d+):(\d{2})/.exec(length);
  if (mm) return Number(mm[1]) * 60 + Number(mm[2]);
  const min = /(\d+)\s*min/.exec(length);
  return min ? Number(min[1]) * 60 : 120;
}

/** A video in a sheet: the poster with a working player (simulated playback on sample data). */
export function VideoSheet({ visible, poster, title, seconds = 120, onClose }: { visible: boolean; poster?: number; title: string; seconds?: number; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>{visible ? <Player poster={poster} title={title} seconds={seconds} onClose={onClose} /> : null}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(4,8,16,0.82)' },
  sheet: { width: '100%', maxWidth: 820, borderRadius: 12, backgroundColor: '#0B1424', overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 10 },
  title: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  video: { width: '100%', aspectRatio: 16 / 9, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' },
  play: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32, backgroundColor: 'rgba(11,107,255,0.92)' },
  caption: { position: 'absolute', bottom: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.6)', fontSize: 13, color: '#FFFFFF' },
});
