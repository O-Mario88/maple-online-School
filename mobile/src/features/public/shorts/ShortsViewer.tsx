import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { type ComponentRef, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Platform, Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { DomainChip } from '@/features/learner/cbc/CbcParts';
import { formatCount, ncdcDomain, stepClip } from '@/lib/shorts';
import type { ShortEntry } from '@/mock/public';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '../palette';
import { Caption } from './ShortCard';

const CLIP_SECONDS = 60;
const TICK_MS = 250;
/** From this width the video sits in the middle with its buttons beside it, as on YouTube's website. */
const STAGE_MIN = 768;
const STAGE_PAD = 24;
const DARK = '#0F0F0F';
const BUTTON = '#272727';
const VIEWABLE = { itemVisiblePercentThreshold: 60 };
/** The part of a FlatList "viewable item" this screen reads. */
type Visible = { index?: number | null; item: ShortEntry };

function initial(name: string): string {
  return name.replace(/^(Mr|Ms|Mrs|Dr)\.\s*/, '').slice(0, 1);
}

function RailButton({ label, a11y, onPress, children }: { label: string; a11y: string; onPress?: () => void; children: ReactNode }) {
  return (
    <Pressable style={styles.rail} onPress={onPress} accessibilityRole="button" accessibilityLabel={a11y}>
      <View style={styles.railCircle}>{children}</View>
      <Text style={styles.railLabel}>{label}</Text>
    </Pressable>
  );
}

interface PageProps {
  clip: ShortEntry;
  active: boolean;
  width: number;
  height: number;
  stage: boolean;
  courseSlug: string;
}

/** Tap to pause or play, and the progress line; plays while on screen and loops, like YouTube Shorts. */
function Playback({ active }: { active: boolean }) {
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active || paused) return undefined;
    const id = setInterval(() => setElapsed((e) => (e + TICK_MS / 1000) % CLIP_SECONDS), TICK_MS);
    return () => clearInterval(id);
  }, [active, paused]);
  return (
    <>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => setPaused((p) => !p)} accessibilityRole="button" accessibilityLabel={paused ? 'Play' : 'Pause'}>
        {paused ? (
          <View style={styles.bigPlay}>
            <Text style={styles.bigPlayIcon}>▶</Text>
          </View>
        ) : null}
      </Pressable>
      <View style={styles.track} pointerEvents="none">
        <View style={[styles.fill, { width: `${(elapsed / CLIP_SECONDS) * 100}%` }]} />
      </View>
    </>
  );
}

/** One short, full height: the video, its buttons, the teacher and the course link. */
function ShortPage({ clip, active, width, height, stage, courseSlug }: PageProps) {
  // On phones the video fills the screen, so keep text and buttons clear of the home indicator.
  const safe = useSafeAreaInsets();
  const bottomInset = stage ? 0 : safe.bottom;
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);

  const share = async () => {
    const url = Linking.createURL('/shorts', { queryParams: { id: clip.id } });
    try {
      await Share.share({ message: `${clip.title} on Maple Shorts: ${url}`, url });
    } catch {
      // Closing the share sheet is not an error worth showing.
    }
  };
  const like = () => {
    setLiked((l) => !l);
    setDisliked(false);
  };
  const dislike = () => {
    setDisliked((d) => !d);
    setLiked(false);
  };

  const videoH = stage ? height - STAGE_PAD * 2 : height;
  const videoW = stage ? Math.min((videoH * 9) / 16, width - 200) : width;
  const rail = (
    <View style={[styles.railCol, !stage && styles.railOverlay, !stage && { bottom: 110 + bottomInset }]}>
      <RailButton label={formatCount(clip.likes + (liked ? 1 : 0))} a11y={liked ? 'Remove like' : 'Like'} onPress={like}>
        <Icon name="thumbUp" size={22} color={liked ? '#3EA6FF' : Brand.surface} />
      </RailButton>
      <RailButton label="Dislike" a11y={disliked ? 'Remove dislike' : 'Dislike'} onPress={dislike}>
        <Icon name="thumbDown" size={22} color={disliked ? '#3EA6FF' : Brand.surface} />
      </RailButton>
      <RailButton label={formatCount(clip.comments)} a11y={`${clip.comments} comments`}>
        <Icon name="chat" size={21} color={Brand.surface} />
      </RailButton>
      <RailButton label="Share" a11y="Share this short" onPress={share}>
        <Icon name="share" size={21} color={Brand.surface} />
      </RailButton>
      <RailButton label={saved ? 'Saved' : 'Save'} a11y={saved ? 'Remove from saved' : 'Save'} onPress={() => setSaved((s) => !s)}>
        <Icon name="star" size={21} color={saved ? '#FFD43B' : Brand.surface} />
      </RailButton>
    </View>
  );

  return (
    <View style={[styles.page, { width, height }]}>
      <View style={styles.stageRow}>
        <View style={[styles.video, { width: videoW, height: videoH, borderRadius: stage ? 12 : 0, backgroundColor: clip.tint }]}>
          {clip.photo ? <Image source={clip.photo} style={StyleSheet.absoluteFill} contentFit="cover" /> : <Caption clip={clip} size={30} />}
          {/* Remounts when the short comes on screen, so it always starts from 0:00. */}
          <Playback key={active ? 'on' : 'off'} active={active} />
          <LinearGradient colors={['transparent', 'rgba(0,0,0,0.75)']} style={[styles.shade, { paddingBottom: 20 + bottomInset }]} pointerEvents="box-none">
            <View style={styles.channel}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial(clip.teacher)}</Text>
              </View>
              <Text style={styles.channelName} numberOfLines={1}>
                {clip.teacher}
              </Text>
              <Pressable style={[styles.follow, following && styles.following]} onPress={() => setFollowing((f) => !f)} accessibilityRole="button">
                <Text style={[styles.followText, following && styles.followingText]}>{following ? 'Following' : 'Follow'}</Text>
              </Pressable>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {`${clip.title} · ${clip.meta}`}
            </Text>
            {ncdcDomain(clip) ? (
              <View style={styles.domain}>
                <DomainChip domain={ncdcDomain(clip) ?? 'knowledge'} long />
              </View>
            ) : null}
            <Pressable style={styles.course} onPress={() => router.push(`/courses/${courseSlug}`)} accessibilityRole="link">
              <Text style={styles.courseText} numberOfLines={1}>
                {`▶ Full course with ${clip.teacher}`}
              </Text>
            </Pressable>
          </LinearGradient>
          {stage ? null : rail}
        </View>
        {stage ? rail : null}
      </View>
    </View>
  );
}

interface ViewerProps {
  clips: readonly ShortEntry[];
  startId: string;
  courseSlug: string;
  onChange: (id: string) => void;
  onClose: () => void;
}

/** Full-screen Shorts, one at a time: scroll, swipe, the arrow buttons or the arrow keys move between them. */
export function ShortsViewer({ clips, startId, courseSlug, onChange, onClose }: ViewerProps) {
  const { width, height } = useWindowDimensions();
  const stage = width >= STAGE_MIN;
  const insets = useSafeAreaInsets();
  const list = useRef<ComponentRef<typeof FlatList<ShortEntry>>>(null);
  const start = Math.max(0, clips.findIndex((c) => c.id === startId));
  const [index, setIndex] = useState(start);

  // Keep the list on the short the link names. The web list ignores initialScrollIndex,
  // and updating the link can re-render it at the top.
  useEffect(() => {
    const t = setTimeout(() => {
      list.current?.scrollToOffset({ offset: start * height, animated: false });
      setIndex(start);
    }, 0);
    return () => clearTimeout(t);
  }, [start, height]);

  const go = useCallback(
    (delta: number) => {
      list.current?.scrollToIndex({ index: stepClip(index, delta, clips.length), animated: true });
    },
    [index, clips.length],
  );

  // Arrow keys and Escape on the web.
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') go(1);
      else if (e.key === 'ArrowUp') go(-1);
      else if (e.key === 'Escape') onClose();
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  // FlatList needs one handler for its whole life; it reads the latest onChange from a ref.
  const latestOnChange = useRef(onChange);
  useEffect(() => {
    latestOnChange.current = onChange;
  }, [onChange]);
  const [onViewable] = useState(() => ({ viewableItems }: { viewableItems: Visible[] }) => {
    const first = viewableItems[0];
    if (first?.index == null) return;
    setIndex(first.index);
    latestOnChange.current(first.item.id);
  });

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.screen}>
        <FlatList
          ref={list}
          data={clips}
          keyExtractor={(c) => c.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          initialScrollIndex={start}
          getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
          onViewableItemsChanged={onViewable}
          viewabilityConfig={VIEWABLE}
          renderItem={({ item, index: i }) => <ShortPage clip={item} active={i === index} width={width} height={height} stage={stage} courseSlug={courseSlug} />}
        />
        <View style={[styles.top, { top: insets.top + 12 }]} pointerEvents="box-none">
          <Pressable style={styles.close} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close Shorts">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
          <Text style={styles.brand}>Maple Shorts</Text>
        </View>
        {stage ? (
          <View style={styles.nav}>
            <Pressable style={[styles.navBtn, index === 0 && styles.navOff]} onPress={() => go(-1)} disabled={index === 0} accessibilityRole="button" accessibilityLabel="Previous short">
              <View style={styles.flip}>
                <Icon name="chevronDown" size={24} color={Brand.surface} />
              </View>
            </Pressable>
            <Pressable style={[styles.navBtn, index === clips.length - 1 && styles.navOff]} onPress={() => go(1)} disabled={index === clips.length - 1} accessibilityRole="button" accessibilityLabel="Next short">
              <Icon name="chevronDown" size={24} color={Brand.surface} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DARK },
  page: { justifyContent: 'center', alignItems: 'center' },
  stageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 16 },
  video: { overflow: 'hidden', justifyContent: 'flex-end' },
  bigPlay: { position: 'absolute', alignSelf: 'center', top: '45%', width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  bigPlayIcon: { fontSize: 28, color: Brand.surface, marginLeft: 4 },
  shade: { paddingHorizontal: 16, paddingTop: 60, paddingBottom: 20, paddingRight: 72, gap: 10 },
  channel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#8D5524', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: Brand.surface },
  channelName: { flexShrink: 1, fontSize: 15, fontWeight: '600', color: Brand.surface },
  follow: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: Brand.surface },
  following: { backgroundColor: 'rgba(255,255,255,0.18)' },
  followText: { fontSize: 13, fontWeight: '700', color: DARK },
  followingText: { color: Brand.surface },
  domain: { marginTop: 6 },
  title: { fontSize: 15, lineHeight: 20, color: Brand.surface },
  course: { alignSelf: 'flex-start', maxWidth: '100%', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.16)' },
  courseText: { fontSize: 13, fontWeight: '600', color: Brand.surface },
  track: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, height: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  fill: { height: 3, backgroundColor: Brand.blue },
  railCol: { gap: 14, alignItems: 'center', paddingBottom: 4 },
  railOverlay: { position: 'absolute', right: 10, bottom: 110 },
  rail: { alignItems: 'center', gap: 5 },
  railCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: BUTTON, alignItems: 'center', justifyContent: 'center' },
  railLabel: { fontSize: 12, fontWeight: '500', color: Brand.surface },
  flip: { transform: [{ rotate: '180deg' }] },
  top: { position: 'absolute', top: 16, left: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 18, color: Brand.surface },
  brand: { fontSize: 17, fontWeight: '700', color: Brand.surface },
  nav: { position: 'absolute', right: 28, top: 0, bottom: 0, justifyContent: 'center', gap: 16 },
  navBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: BUTTON, alignItems: 'center', justifyContent: 'center' },
  navOff: { opacity: 0.35 },
});
