import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import type { MockData } from '@/mock';

import { Brand, CARD_SHADOW } from '../palette';

// Each syllabus item gets its own tile colour, as in the reference.
const SYLLABUS_TINTS = [
  { fg: '#2F6BFF', bg: '#EAF1FF' },
  { fg: '#F59E0B', bg: '#FEF3DC' },
  { fg: '#F97316', bg: '#FFEDD5' },
  { fg: '#2F6BFF', bg: '#EAF1FF' },
  { fg: '#8B5CF6', bg: '#EFEBFF' },
  { fg: '#EF4444', bg: '#FDECEC' },
] as const;

const BADGE_ICONS = [
  { icon: 'school' as const, color: '#8B5CF6' },
  { icon: 'clock' as const, color: '#2F6BFF' },
  { icon: 'check' as const, color: Brand.green },
];
const STAT_ICONS = [
  { icon: 'people' as const, color: '#2F6BFF' },
  { icon: 'chart' as const, color: '#2F6BFF' },
  { icon: 'star' as const, color: Brand.amber },
];

type Session = MockData['publicPages']['liveSession'];

/** Five things the session includes, in a row. */
export function LiveFeatures({ s }: { s: Session }) {
  return (
    <View style={styles.strip}>
      {s.features.map((f) => (
        <View key={f.title} style={styles.feature}>
          <View style={styles.featureIcon}>
            <Icon name={f.icon} size={20} color={Brand.blue} />
          </View>
          <View style={styles.flexShrink}>
            <Text style={styles.strong}>{f.title}</Text>
            <Text style={styles.muted}>{f.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** "About this live class", its key points and who it's for. */
export function AboutLive({ s }: { s: Session }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        About This Live Class
      </Text>
      <Text style={styles.body}>{s.about}</Text>
      {s.aboutPoints.map((p) => (
        <View key={p} style={styles.point}>
          <Icon name="check" size={16} color={Brand.green} />
          <Text style={styles.body}>{p}</Text>
        </View>
      ))}
      <View style={styles.forWho}>
        <View style={styles.forIcon}>
          <Icon name="people" size={20} color={Brand.blue} />
        </View>
        <View style={styles.flexShrink}>
          <Text style={styles.strong}>Who is this for?</Text>
          <Text style={styles.body}>{s.forWho}</Text>
        </View>
      </View>
    </View>
  );
}

/** The session syllabus: each part with its time. */
export function Syllabus({ s }: { s: Session }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        What You Will Learn
      </Text>
      {s.syllabus.map((item, i) => {
        const tint = SYLLABUS_TINTS[i % SYLLABUS_TINTS.length];
        return (
          <View key={item.title} style={styles.syllabusRow} accessibilityLabel={`${item.title}, about ${item.minutes} minutes. ${item.detail}`}>
            <View style={[styles.syllabusIcon, { backgroundColor: tint.bg }]}>
              <Icon name={item.icon} size={20} color={tint.fg} />
            </View>
            <View style={styles.flexShrink}>
              <Text style={styles.strong}>{item.title}</Text>
              <Text style={styles.muted}>{item.detail}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** The teacher's photo, badges, stats and short bio, linking to their storefront. */
export function LiveTeacher({ s }: { s: Session }) {
  const t = s.teacher;
  return (
    <View style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        Meet Your Teacher
      </Text>
      <View style={styles.teacherRow}>
        <Image source={t.photo} style={styles.avatar} contentFit="cover" accessibilityLabel={t.name} />
        <View style={styles.flexShrink}>
          <Text style={styles.strong}>{`${t.name}  ✓`}</Text>
          <Text style={styles.muted}>{t.title}</Text>
          {t.badges.map((b, i) => (
            <View key={b} style={styles.badgeRow}>
              <Icon name={BADGE_ICONS[i % BADGE_ICONS.length].icon} size={13} color={BADGE_ICONS[i % BADGE_ICONS.length].color} />
              <Text style={styles.badge}>{b}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.stats}>
        {t.stats.map((st, i) => (
          <View key={st.label}>
            <View style={styles.badgeRow}>
              <Icon name={STAT_ICONS[i % STAT_ICONS.length].icon} size={16} color={STAT_ICONS[i % STAT_ICONS.length].color} />
              <Text style={styles.stat}>{st.value}</Text>
            </View>
            <Text style={styles.muted}>{st.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.body}>{t.bio}</Text>
      <Pressable style={styles.outline} onPress={() => router.push(`/@${t.handle}`)} accessibilityRole="link">
        <Text style={styles.link}>View Full Profile →</Text>
      </Pressable>
    </View>
  );
}

/** Other upcoming live classes. */
export function MoreLive({ s }: { s: Session }) {
  return (
    <View style={styles.section}>
      <View style={styles.between}>
        <Text style={styles.title} accessibilityRole="header">
          More Live Classes You May Like
        </Text>
        <Pressable onPress={() => router.push('/explore')} accessibilityRole="link">
          <Text style={styles.link}>View all →</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moreRow}>
        {s.more.map((m) => (
          <Pressable key={m.title} style={styles.more} accessibilityRole="link" accessibilityLabel={`${m.title}, ${m.when}, ${formatMoney(m.priceUGX, 'UGX')}`}>
            <Image source={m.photo} style={styles.moreThumb} contentFit="cover" />
            <View style={styles.flexShrink}>
              <Text style={[styles.status, m.status === 'live' ? styles.statusLive : styles.statusSoon]}>{m.status === 'live' ? '● LIVE' : 'UPCOMING'}</Text>
              <Text style={styles.strong} numberOfLines={2}>
                {m.title}
              </Text>
              <Text style={styles.muted}>{m.when}</Text>
              <View style={styles.between}>
                <Text style={styles.strong}>{formatMoney(m.priceUGX, 'UGX')}</Text>
                <Text style={styles.muted}>{`👥 ${m.seats}`}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flexShrink: { flexShrink: 1 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  card: { gap: 12, padding: 22, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  section: { gap: 12 },
  title: { fontSize: 19, fontWeight: '700', color: Brand.ink },
  body: { fontSize: 14, lineHeight: 21, color: Brand.body, flexShrink: 1 },
  muted: { fontSize: 12, color: Brand.muted },
  strong: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  link: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, padding: 16, borderRadius: 16, backgroundColor: Brand.surface, ...CARD_SHADOW },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10, flexGrow: 1, flexBasis: 170 },
  featureIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Brand.blueSoft, alignItems: 'center', justifyContent: 'center' },
  point: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  forWho: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 12, backgroundColor: Brand.canvas, marginTop: 4 },
  forIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Brand.blueSoft, alignItems: 'center', justifyContent: 'center' },
  syllabusRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 2 },
  syllabusIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 84, height: 84, borderRadius: 42 },
  badge: { fontSize: 12, color: Brand.body },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: Brand.line },
  stat: { fontSize: 18, fontWeight: '800', color: Brand.ink },
  outline: { alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.blue },
  moreRow: { gap: 14 },
  more: { width: 300, flexDirection: 'row', gap: 12, padding: 10, borderRadius: 14, backgroundColor: Brand.surface, ...CARD_SHADOW },
  moreThumb: { width: 96, height: 96, borderRadius: 10 },
  status: { alignSelf: 'flex-start', fontSize: 10, fontWeight: '800', color: Brand.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', marginBottom: 2 },
  statusLive: { backgroundColor: Brand.live },
  statusSoon: { backgroundColor: Brand.blue },
});
