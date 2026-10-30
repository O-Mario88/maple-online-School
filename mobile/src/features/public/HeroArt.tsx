import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import type { MockData } from '@/mock';

import { Brand, HERO_GRADIENT, TINTS } from './palette';

type Landing = MockData['publicPages']['landing'];

const GLOBE = 300;
const AVATAR_TINTS = ['#F4A261', '#2A9D8F', '#E76F51', '#8E7DBE'] as const;
// Where the teacher avatars sit around the globe, as fractions of its size.
const ORBIT = [
  { left: 0.62, top: -0.12 },
  { left: 0.12, top: 0.02 },
  { left: -0.12, top: 0.36 },
  { left: 0.28, top: 0.82 },
] as const;
const SCRIPT_FONT = Platform.select({ web: '"Segoe Print", "Bradley Hand", cursive', default: undefined });

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
}

/**
 * The hero illustration: a globe ringed by teachers, a learner, and Maple's
 * reach. A stand-in for the reference's photography until real photos exist.
 */
export function HeroArt({ landing, wide }: { landing: Landing; wide: boolean }) {
  return (
    <View style={[styles.wrap, wide && styles.wrapWide]}>
      <LinearGradient colors={HERO_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.panel, wide && styles.panelWide]}>
        <View style={[styles.globeArea, !wide && styles.globeNarrow]}>
          <LinearGradient colors={['#3B82F6', '#1E3A8A']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={styles.globe}>
            <View style={[styles.land, styles.landA]} />
            <View style={[styles.land, styles.landB]} />
            <View style={[styles.land, styles.landC]} />
            <View style={[styles.ring, styles.ringA]} />
            <View style={[styles.ring, styles.ringB]} />
          </LinearGradient>
          {landing.teachers.map((t, i) => (
            <View key={t} style={[styles.avatar, { left: ORBIT[i].left * GLOBE, top: ORBIT[i].top * GLOBE, backgroundColor: AVATAR_TINTS[i] }]} accessibilityLabel={`Teacher ${t}`}>
              <Text style={styles.avatarText}>{initials(t)}</Text>
            </View>
          ))}
          <Text style={styles.learner} accessibilityLabel="A learner studying with headphones">
            🧑🏾‍💻
          </Text>
        </View>
        <Text style={[styles.script, { fontFamily: SCRIPT_FONT }]}>{'Anytime\n  Anywhere\n    Together ♡'}</Text>
        <Pressable style={styles.story} accessibilityRole="button" accessibilityLabel="Watch our story, 2 minutes">
          <View style={styles.storyPlay}>
            <Icon name="play" size={16} color={Brand.surface} />
          </View>
          <View>
            <Text style={styles.storyTitle}>Watch our story</Text>
            <Text style={styles.storyTime}>2 min</Text>
          </View>
        </Pressable>
        <View style={styles.sticky}>
          <Text style={[styles.stickyText, { fontFamily: SCRIPT_FONT }]}>{'Same\nOpportunities\nfor Every\nLearner'}</Text>
        </View>
      </LinearGradient>
      <View style={[styles.stats, wide && styles.statsWide]}>
        {landing.stats.map((s) => (
          <View key={s.label} style={[styles.stat, wide && styles.statWide]}>
            <View style={[styles.statIcon, { backgroundColor: TINTS[s.tint].bg }]}>
              <Icon name={s.icon} size={18} color={TINTS[s.tint].fg} />
            </View>
            <View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  wrapWide: { flex: 1, minHeight: 500 },
  panel: { height: 420, borderRadius: 24, overflow: 'hidden' },
  panelWide: { flex: 1, height: undefined, marginRight: 150 },
  globeArea: { position: 'absolute', left: '14%', top: 70, width: GLOBE, height: GLOBE },
  globeNarrow: { left: -20, top: 30, transform: [{ scale: 0.78 }] },
  globe: { width: GLOBE, height: GLOBE, borderRadius: GLOBE / 2, overflow: 'hidden' },
  land: { position: 'absolute', backgroundColor: '#4CAF7A', opacity: 0.9 },
  landA: { width: 120, height: 150, borderRadius: 60, left: 110, top: 80, transform: [{ rotate: '18deg' }] },
  landB: { width: 90, height: 70, borderRadius: 40, left: 40, top: 50 },
  landC: { width: 70, height: 50, borderRadius: 30, left: 200, top: 200, backgroundColor: '#D9B26F' },
  ring: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)', borderRadius: GLOBE },
  ringA: { left: -20, right: -20, top: GLOBE * 0.3, height: GLOBE * 0.4 },
  ringB: { left: GLOBE * 0.3, width: GLOBE * 0.4, top: -20, bottom: -20 },
  avatar: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: Brand.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: Brand.surface },
  learner: { position: 'absolute', left: GLOBE * 0.55, top: GLOBE * 0.32, fontSize: 170 },
  script: { position: 'absolute', right: 24, top: 28, fontSize: 22, lineHeight: 28, color: '#5B6B8C', transform: [{ rotate: '-8deg' }] },
  story: {
    position: 'absolute',
    left: 24,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 18,
    borderRadius: 999,
    backgroundColor: Brand.surface,
  },
  storyPlay: { width: 34, height: 34, borderRadius: 17, backgroundColor: Brand.blue, alignItems: 'center', justifyContent: 'center' },
  storyTitle: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  storyTime: { fontSize: 11, color: Brand.muted },
  sticky: { position: 'absolute', right: 20, bottom: 20, width: 128, padding: 14, backgroundColor: Brand.sticky, transform: [{ rotate: '-6deg' }] },
  stickyText: { fontSize: 15, lineHeight: 19, color: Brand.ink },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statsWide: { position: 'absolute', right: 0, top: 120, flexDirection: 'column', flexWrap: 'nowrap', width: 190 },
  stat: {
    flexGrow: 1,
    flexBasis: 150,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    backgroundColor: Brand.surface,
    borderWidth: 1,
    borderColor: Brand.line,
  },
  statWide: { flexGrow: 0, flexBasis: 'auto' },
  statIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 18, fontWeight: '800', color: Brand.ink },
  statLabel: { fontSize: 11, color: Brand.muted },
});
