import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { lengthSeconds, VideoSheet } from '@/features/shared/VideoSheet';
import type { MockData } from '@/mock';

import { Brand } from '../palette';
import { crumbHref } from '@/features/public/HomeNav';

type Course = MockData['publicPages']['coursePage'];

function Trailer({ course, wide }: { course: Course; wide: boolean }) {
  const [playing, setPlaying] = useState(false);
  const sheet = <VideoSheet visible={playing} poster={course.trailer.photo} title={`${course.title}: course trailer`} seconds={lengthSeconds(course.trailer.length)} onClose={() => setPlaying(false)} />;
  if (course.trailer.photo) {
    // The reference frame already shows the trailer label and play button.
    return (
      <Pressable style={styles.video} onPress={() => setPlaying(true)} accessibilityRole="button" accessibilityLabel={`Play the course trailer, ${course.trailer.length}`}>
        <Image source={course.trailer.photo} style={StyleSheet.absoluteFill} contentFit="cover" />
        {sheet}
      </Pressable>
    );
  }
  return (
    <View style={styles.video} accessibilityLabel={`Course trailer, ${course.trailer.length}`}>
      <View style={styles.trailerTag}>
        <Icon name="play" size={14} color={Brand.surface} />
        <Text style={styles.trailerText}>{`Watch course trailer (${course.trailer.length})`}</Text>
      </View>
      <Text style={[styles.teacherEmoji, !wide && styles.teacherEmojiNarrow]} accessibilityElementsHidden>
        👨🏾‍🏫
      </Text>
      <Text style={styles.board}>{course.trailer.board.join('\n')}</Text>
      <Pressable style={styles.play} onPress={() => setPlaying(true)} accessibilityRole="button" accessibilityLabel="Play the course trailer">
        <Icon name="play" size={30} color={Brand.surface} />
      </Pressable>
      {sheet}
    </View>
  );
}

/** Breadcrumb, title, ratings, tags and the trailer video. */
export function CourseHero({ course, wide }: { course: Course; wide: boolean }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.crumbs}>
        {course.breadcrumb.map((c) => (
          <Text key={c} style={styles.crumb}>
            <Text onPress={() => router.push(crumbHref(c))} accessibilityRole="link">
              {c}
            </Text>
            {'  ›  '}
          </Text>
        ))}
        <Text style={styles.crumbHere} numberOfLines={1}>
          {course.title.split(' (')[0]}
        </Text>
      </View>
      <View style={[styles.row, wide && styles.rowWide]}>
        <View style={[styles.copy, wide && styles.copyWide]}>
          <View style={styles.badge}>
            <Icon name="trophy" size={14} color={Brand.ink} />
            <Text style={styles.badgeText}>{course.badge}</Text>
          </View>
          <Text style={[styles.title, wide && styles.titleWide]} accessibilityRole="header">
            {course.title}
          </Text>
          <Text style={styles.sub}>{course.sub}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaStrong}>{`★ ${course.rating} (${course.reviews.toLocaleString('en-US')} reviews)`}</Text>
            <Text style={styles.metaText}>{`${course.learners.toLocaleString('en-US')} learners`}</Text>
            <Text style={styles.metaText}>{`${course.hours} hours`}</Text>
            <Text style={styles.metaText}>Certificate included</Text>
          </View>
          <View style={styles.tags}>
            {course.tags.map((t) => (
              <Text key={t} style={styles.tag}>
                {t}
              </Text>
            ))}
          </View>
        </View>
        <View style={[styles.videoCol, wide && styles.videoColWide]}>
          <Trailer course={course} wide={wide} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  crumbs: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  crumb: { fontSize: 12, color: Brand.muted },
  crumbHere: { fontSize: 12, color: Brand.ink, fontWeight: '500', flexShrink: 1 },
  row: { gap: 20 },
  rowWide: { flexDirection: 'row' },
  copy: { gap: 12 },
  copyWide: { flex: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: '#FFE9A8' },
  badgeText: { fontSize: 13, fontWeight: '700', color: Brand.ink },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: Brand.ink, letterSpacing: -0.6 },
  titleWide: { fontSize: 40, lineHeight: 46, letterSpacing: -1 },
  sub: { fontSize: 16, lineHeight: 24, color: Brand.body },
  meta: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 6 },
  metaStrong: { fontSize: 14, fontWeight: '600', color: Brand.ink },
  metaText: { fontSize: 14, color: Brand.body },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { fontSize: 12, color: Brand.ink, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, overflow: 'hidden' },
  videoCol: { minHeight: 240 },
  videoColWide: { flex: 1 },
  video: { flex: 1, minHeight: 240, borderRadius: 14, backgroundColor: '#2C3E50', overflow: 'hidden' },
  trailerTag: { position: 'absolute', top: 14, right: 14, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(11,20,36,0.75)', zIndex: 1 },
  trailerText: { fontSize: 12, fontWeight: '600', color: Brand.surface },
  teacherEmoji: { position: 'absolute', left: '8%', bottom: -10, fontSize: 160 },
  teacherEmojiNarrow: { fontSize: 110, left: 0 },
  board: { position: 'absolute', right: 28, top: 60, fontSize: 18, lineHeight: 30, color: '#EEF2F7', textAlign: 'center' },
  play: { position: 'absolute', left: '50%', top: '50%', marginLeft: -32, marginTop: -32, width: 64, height: 64, borderRadius: 32, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.6)' },
});
