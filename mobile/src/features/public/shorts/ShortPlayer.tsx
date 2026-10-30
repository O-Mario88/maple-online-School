import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatCount } from '@/lib/shorts';
import type { ShortEntry } from '@/mock/public';

import { Brand } from '../palette';
import { Caption } from './ShortCard';

const CLIP_SECONDS = 60;
const TICK_MS = 1000;

function clock(sec: number): string {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

/** The selected short, playable, with its actions and the enrol and book buttons. */
export function ShortPlayer({ clip, courseSlug, onClose }: { clip: ShortEntry; courseSlug: string; onClose?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => setElapsed((e) => (e + 1 >= CLIP_SECONDS ? CLIP_SECONDS : e + 1)), TICK_MS);
    return () => clearInterval(id);
  }, [playing]);

  const share = async () => {
    const url = Linking.createURL('/shorts', { queryParams: { id: clip.id } });
    try {
      await Share.share({ message: `${clip.title} on Maple Shorts: ${url}`, url });
      setShared(true);
    } catch {
      setShared(false);
    }
  };

  const actions = [
    { key: 'like', icon: liked ? '♥' : '♡', label: formatCount(clip.likes + (liked ? 1 : 0)), onPress: () => setLiked((l) => !l), a11y: liked ? 'Unlike' : 'Like' },
    { key: 'comments', icon: '💬', label: formatCount(clip.comments), onPress: undefined, a11y: 'Comments' },
    { key: 'share', icon: '↗', label: shared ? 'Shared' : formatCount(clip.shares), onPress: share, a11y: 'Share this short' },
    { key: 'save', icon: saved ? '★' : '☆', label: saved ? 'Saved' : 'Save', onPress: () => setSaved((v) => !v), a11y: saved ? 'Remove from saved' : 'Save' },
  ];

  return (
    <View style={styles.wrap}>
      <View style={[styles.video, { backgroundColor: clip.tint }]}>
        <View style={styles.head}>
          <View>
            <Text style={styles.subject}>{clip.subject}</Text>
            <Text style={styles.meta}>{clip.meta}</Text>
          </View>
          <View style={styles.headActions}>
            <Pressable style={styles.followDark} onPress={() => setFollowing((f) => !f)} accessibilityRole="button">
              <Text style={styles.followDarkText}>{following ? 'Following' : 'Follow'}</Text>
            </Pressable>
            {onClose ? (
              <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close the player" hitSlop={8}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
        <Text style={styles.emoji} accessibilityElementsHidden>
          {clip.emoji}
        </Text>
        <Pressable style={styles.play} onPress={() => setPlaying((p) => !p)} accessibilityRole="button" accessibilityLabel={playing ? 'Pause' : 'Play'}>
          <Text style={styles.playIcon}>{playing ? '❚❚' : '▶'}</Text>
        </Pressable>
        <View style={styles.side}>
          {actions.map((a) => (
            <Pressable key={a.key} style={styles.action} onPress={a.onPress} accessibilityRole="button" accessibilityLabel={a.a11y}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.captionWrap}>
          <Caption clip={clip} size={30} />
        </View>
        <View style={styles.scrub}>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${(elapsed / CLIP_SECONDS) * 100}%` }]} />
          </View>
          <Text style={styles.time}>{`${clock(elapsed)} / ${clock(CLIP_SECONDS)}`}</Text>
        </View>
      </View>

      <Text style={styles.title} accessibilityRole="header">
        {clip.title}
      </Text>
      <Text style={styles.desc}>{clip.desc}</Text>
      <View style={styles.teacherRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{clip.teacher.replace(/^(Mr|Ms|Mrs|Dr)\.\s*/, '').slice(0, 1)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.teacherName}>{`${clip.teacher} ✓`}</Text>
          <Text style={styles.muted}>{clip.teacherTitle}</Text>
        </View>
        <Pressable style={styles.follow} onPress={() => setFollowing((f) => !f)} accessibilityRole="button">
          <Text style={styles.followText}>{following ? 'Following' : 'Follow'}</Text>
        </Pressable>
      </View>
      <View style={styles.tags}>
        {clip.tags.map((t) => (
          <Text key={t} style={styles.tag}>
            {t}
          </Text>
        ))}
      </View>
      <Pressable style={styles.enrol} onPress={() => router.push(`/courses/${courseSlug}`)} accessibilityRole="button">
        <Icon name="wallet" size={18} color={Brand.surface} />
        <Text style={styles.enrolText}>Enrol in Full Course</Text>
      </Pressable>
      <Pressable style={styles.book} onPress={() => router.push('/event')} accessibilityRole="button">
        <Icon name="calendar" size={18} color={Brand.ink} />
        <Text style={styles.bookText}>{`Book a Live Class with ${clip.teacher.split(' ').slice(0, 2).join(' ')}`}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: 12 },
  video: { aspectRatio: 9 / 14, borderRadius: 16, overflow: 'hidden', padding: 16, justifyContent: 'space-between' },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subject: { fontSize: 16, fontWeight: '700', color: Brand.surface },
  meta: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },
  followDark: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)' },
  followDarkText: { fontSize: 13, fontWeight: '600', color: Brand.surface },
  close: { fontSize: 20, color: Brand.surface },
  emoji: { position: 'absolute', alignSelf: 'center', top: '18%', fontSize: 130 },
  play: { position: 'absolute', alignSelf: 'center', top: '40%', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(11,20,36,0.6)', alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 24, color: Brand.surface },
  side: { position: 'absolute', right: 10, top: '30%', gap: 16, alignItems: 'center' },
  action: { alignItems: 'center', minWidth: 44 },
  actionIcon: { fontSize: 26, color: Brand.surface },
  actionLabel: { fontSize: 12, fontWeight: '600', color: Brand.surface },
  captionWrap: { marginTop: 'auto', marginBottom: 12, paddingRight: 56 },
  scrub: { gap: 6 },
  track: { height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  fill: { height: 4, backgroundColor: Brand.surface },
  time: { fontSize: 12, color: Brand.surface },
  title: { fontSize: 20, fontWeight: '800', color: Brand.ink },
  desc: { fontSize: 14, lineHeight: 20, color: Brand.body },
  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#8D5524', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: Brand.surface },
  teacherName: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  muted: { fontSize: 12, color: Brand.muted },
  follow: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Brand.blue },
  followText: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { fontSize: 12, color: Brand.ink, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: Brand.line, overflow: 'hidden' },
  enrol: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 10, backgroundColor: Brand.blue },
  enrolText: { fontSize: 15, fontWeight: '600', color: Brand.surface },
  book: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: Brand.line, backgroundColor: Brand.surface },
  bookText: { fontSize: 14, fontWeight: '600', color: Brand.ink },
});
