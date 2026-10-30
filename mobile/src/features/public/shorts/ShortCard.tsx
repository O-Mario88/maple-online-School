import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatCount } from '@/lib/shorts';
import type { ShortEntry } from '@/mock/public';

import { Brand } from '../palette';

const HIGHLIGHT = '#FFD43B';

/** The big caption painted on a short, with one highlighted phrase. */
export function Caption({ clip, size }: { clip: ShortEntry; size: number }) {
  const line = { fontSize: size, lineHeight: size * 1.15 };
  return (
    <View style={styles.caption}>
      <Text style={[styles.capText, line]}>{clip.caption.lead}</Text>
      <Text style={[styles.capText, styles.capHighlight, line]}>{clip.caption.highlight}</Text>
      <Text style={[styles.capText, line]}>{clip.caption.tail}</Text>
    </View>
  );
}

/** One vertical clip in the grid: subject, caption, views and likes, then title and teacher. */
export function ShortCard({ clip, active, onPress }: { clip: ShortEntry; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.wrap} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: active }} accessibilityLabel={`Play ${clip.title} by ${clip.teacher}`}>
      {clip.photo ? (
        // The reference frame already carries the subject, caption, views and likes.
        <View style={[styles.frame, styles.photoFrame, active && styles.frameActive]}>
          <Image source={clip.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
        </View>
      ) : (
      <View style={[styles.frame, { backgroundColor: clip.tint }, active && styles.frameActive]}>
        <View style={styles.top}>
          <Text style={styles.subject}>{clip.subject}</Text>
          <Text style={styles.meta}>{clip.meta}</Text>
        </View>
        <Text style={styles.emoji} accessibilityElementsHidden>
          {clip.emoji}
        </Text>
        <Caption clip={clip} size={17} />
        <View style={styles.bottom}>
          <Text style={styles.stat}>{`▷ ${formatCount(clip.views)}`}</Text>
          <Text style={styles.stat}>{`♡ ${formatCount(clip.likes)}`}</Text>
        </View>
      </View>
      )}
      <Text style={styles.title} numberOfLines={1}>
        {clip.title}
      </Text>
      <Text style={styles.teacher} numberOfLines={1}>
        {clip.teacher}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, flexBasis: 150, maxWidth: 220, gap: 4 },
  frame: { aspectRatio: 9 / 16, borderRadius: 12, overflow: 'hidden', padding: 10, justifyContent: 'space-between' },
  frameActive: { borderWidth: 3, borderColor: Brand.blue },
  photoFrame: { padding: 0, backgroundColor: Brand.video },
  top: { gap: 2 },
  subject: { alignSelf: 'flex-start', fontSize: 11, fontWeight: '700', color: Brand.surface, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  meta: { fontSize: 10, color: 'rgba(255,255,255,0.85)' },
  emoji: { position: 'absolute', alignSelf: 'center', top: '22%', fontSize: 64 },
  caption: { gap: 2 },
  capText: { fontWeight: '900', color: Brand.surface, alignSelf: 'flex-start', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 4 },
  capHighlight: { color: Brand.ink, backgroundColor: HIGHLIGHT, paddingHorizontal: 4, textShadowRadius: 0 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { fontSize: 11, fontWeight: '600', color: Brand.surface },
  title: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  teacher: { fontSize: 11, color: Brand.muted },
});
