import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';

import { Brand, CARD_SHADOW } from '../palette';
import type { Landing } from './types';

// The hero photo is the reference's x 620–1536, y 57–570, so it is 916×513.
// It already carries the "Anytime Anywhere Together" note and the sticky note;
// the stat cards and the story button are drawn over their printed copies so
// they stay sharp and tappable.
const PHOTO = { w: 916, h: 513 } as const;
const STAT_TOPS = [162, 223, 284, 345] as const;
const STORY = { x: 400, y: 447, w: 139, h: 43 } as const;
// Phones show the photo from x 150 (where the globe starts) to the girl's shoulder.
const PHONE_WINDOW = { x: 150, w: 528 } as const;
const PHOTO_LABEL = 'A smiling learner with headphones studying online, with a globe of teachers from around the world';

type Stat = Landing['stats'][number];

function StatCard({ stat, style }: { stat: Stat; style?: object }) {
  return (
    <View style={[styles.stat, style]}>
      <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
        <Icon name={stat.icon} size={14} color={Brand.surface} />
      </View>
      <View style={styles.statText}>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statLabel} numberOfLines={1}>
          {stat.label}
        </Text>
      </View>
    </View>
  );
}

function StoryButton({ style }: { style?: object }) {
  return (
    <Pressable style={[styles.story, style]} accessibilityRole="button" accessibilityLabel="Watch our story, 2 minutes">
      <View style={styles.storyPlay}>
        <Icon name="play" size={13} color={Brand.surface} />
      </View>
      <View>
        <Text style={styles.storyTitle}>Watch our story</Text>
        <Text style={styles.storyTime}>2 min</Text>
      </View>
    </Pressable>
  );
}

/** Desktop: the photo at its reference size and place inside the 1536px hero. */
export function HeroPhotoDesktop({ landing, left, height }: { landing: Landing; left: number; height: number }) {
  return (
    <View style={[styles.desk, { left, width: PHOTO.w, height }]}>
      <Image source={landing.heroPhoto} style={StyleSheet.absoluteFill} contentFit="fill" accessibilityLabel={PHOTO_LABEL} />
      {landing.stats.map((s, i) => (
        <StatCard key={s.label} stat={s} style={[styles.statDesk, { top: STAT_TOPS[i] }]} />
      ))}
      <StoryButton style={{ position: 'absolute', left: STORY.x, top: STORY.y, width: STORY.w, height: STORY.h }} />
    </View>
  );
}

/** Phones: the same photo full-bleed, cropped to the learner and globe, with the stats under it. */
export function HeroPhotoPhone({ landing, width }: { landing: Landing; width: number }) {
  const k = width / PHONE_WINDOW.w;
  const height = PHOTO.h * k;
  // Centre our button over the one printed in the photo.
  const storyLeft = (STORY.x + STORY.w / 2 - PHONE_WINDOW.x) * k - STORY.w / 2;
  const storyTop = (STORY.y + STORY.h / 2) * k - STORY.h / 2;
  return (
    <View>
      <View style={{ width, height, overflow: 'hidden' }}>
        <Image
          source={landing.heroPhoto}
          style={{ position: 'absolute', left: -PHONE_WINDOW.x * k, top: 0, width: PHOTO.w * k, height }}
          contentFit="fill"
          accessibilityLabel={PHOTO_LABEL}
        />
        <StoryButton style={{ position: 'absolute', left: storyLeft, top: storyTop, width: STORY.w, height: STORY.h }} />
      </View>
      <Image source={landing.stickyNote} style={[styles.sticky, { top: height - 88 }]} contentFit="contain" accessibilityLabel="Same opportunities for every learner" />
      <View style={styles.statGrid}>
        {landing.stats.map((s) => (
          <StatCard key={s.label} stat={s} style={styles.statPhone} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  desk: { position: 'absolute', top: 0 },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 54,
    paddingHorizontal: 13,
    borderRadius: 8,
    backgroundColor: Brand.surface,
  },
  statDesk: { position: 'absolute', left: 680, width: 172 },
  statPhone: { width: '48.5%', ...CARD_SHADOW },
  statIcon: { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  statText: { flexShrink: 1 },
  statValue: { fontSize: 14.5, lineHeight: 17, fontWeight: '700', color: Brand.ink },
  statLabel: { fontSize: 9.5, lineHeight: 13, color: '#4A5263' },
  story: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingLeft: 6,
    borderRadius: 8,
    backgroundColor: Brand.surface,
    ...CARD_SHADOW,
  },
  storyPlay: { width: 30, height: 30, borderRadius: 15, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  storyTitle: { fontSize: 11.5, fontWeight: '600', color: Brand.ink },
  storyTime: { fontSize: 9.5, color: Brand.muted },
  // On phones the story button takes the photo's lower right, so the note sits lower left.
  sticky: { position: 'absolute', left: 12, width: 112, height: 91 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 8, marginTop: 14, paddingHorizontal: 16 },
});
