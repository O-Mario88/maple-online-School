import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

type Storefront = MockData['publicPages']['teacherStorefront'];

const HIGHLIGHT = '#FFD43B';

function SectionHead({ title, link, onPress }: { title: string; link?: string; onPress?: () => void }) {
  return (
    <View style={styles.between}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {link ? (
        <Pressable onPress={onPress} accessibilityRole="link">
          <Text style={styles.link}>{`${link} →`}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** "About me" with the teaching highlights. */
export function AboutCard({ t, wide }: { t: Storefront; wide: boolean }) {
  return (
    <View style={styles.card}>
      <SectionHead title="About Me" />
      {t.about.map((p) => (
        <Text key={p} style={styles.body}>
          {p}
        </Text>
      ))}
      <View style={styles.highlights}>
        {t.highlights.map((h) => (
          <View key={h} style={[styles.highlight, wide && styles.highlightWide]}>
            <Icon name="check" size={16} color={Brand.blue} />
            <Text style={styles.body}>{h}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Credentials Maple has checked. */
export function CredentialsCard({ t }: { t: Storefront }) {
  return (
    <View style={styles.card}>
      <SectionHead title="Verified Credentials" link="View all" />
      {t.credentials.map((c) => (
        <View key={c.title} style={styles.row}>
          <View style={styles.rowIcon}>
            <Icon name={c.icon} size={20} color={Brand.blue} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.strong}>{c.title}</Text>
            <Text style={styles.muted}>{c.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** The teacher's published courses. */
export function CoursesRow({ t }: { t: Storefront }) {
  return (
    <View style={styles.section}>
      <SectionHead title="Popular Courses" link="View all courses" onPress={() => router.push('/explore')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
        {t.courses.map((c) => (
          <Pressable key={c.title} style={styles.course} onPress={() => router.push(`/courses/${t.courseSlug}`)} accessibilityRole="link" accessibilityLabel={`${c.title}, ${formatMoney(c.priceUGX, 'UGX')}`}>
            <View style={[styles.courseThumb, { backgroundColor: c.tint }]}>
              <Icon name="chart" size={30} color="rgba(255,255,255,0.85)" />
              {c.badge ? <Text style={styles.courseBadge}>{c.badge}</Text> : null}
            </View>
            <View style={styles.courseInfo}>
              <Text style={styles.strong} numberOfLines={2}>
                {c.title}
              </Text>
              <Text style={styles.muted}>{c.meta}</Text>
              <Text style={styles.body}>{`★ ${c.rating} (${c.reviews})`}</Text>
              <Text style={styles.muted}>{`${c.lessons} lessons · ${c.hours} hours`}</Text>
              <Text style={[styles.price, c.wasUGX ? styles.sale : null]}>
                {formatMoney(c.priceUGX, 'UGX')}
                {c.wasUGX ? <Text style={styles.was}>{`  ${formatMoney(c.wasUGX, 'UGX')}`}</Text> : null}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

/** Free Maple Shorts by this teacher; each opens in the Shorts feed. */
export function ShortsRow({ t }: { t: Storefront }) {
  return (
    <View style={styles.section}>
      <SectionHead title="Latest Maple Shorts" link="View all" onPress={() => router.push('/shorts')} />
      <View style={styles.shorts}>
        {t.shorts.map((s) => (
          <Pressable key={s.id} style={[styles.short, { backgroundColor: s.tint }]} onPress={() => router.push(`/shorts?id=${s.id}`)} accessibilityRole="link" accessibilityLabel={`${s.lead} ${s.highlight} ${s.tail}, free short`}>
            <Text style={styles.shortText}>{s.lead}</Text>
            <Text style={[styles.shortText, styles.shortHighlight]}>{s.highlight}</Text>
            <Text style={styles.shortText}>{s.tail}</Text>
            <Text style={styles.shortViews}>{`▷ ${s.views}`}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** What students say. */
export function ReviewsRow({ t }: { t: Storefront }) {
  return (
    <View style={styles.section}>
      <Text style={styles.title} accessibilityRole="header">
        {'★ What Students Say  '}
        <Text style={styles.muted}>{`${t.rating} out of 5 · based on ${t.reviewCount.toLocaleString('en-US')} reviews`}</Text>
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
        {t.reviews.map((r) => (
          <View key={r.name} style={styles.review}>
            <Text style={styles.strong}>{r.name}</Text>
            <Text style={styles.muted}>{r.where}</Text>
            <Text style={styles.body}>
              <Text style={styles.stars}>★★★★★ </Text>
              {r.text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  card: { gap: 12, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  section: { gap: 12 },
  title: { fontSize: 19, fontWeight: '700', color: Brand.ink },
  link: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  body: { fontSize: 14, lineHeight: 21, color: Brand.body, flexShrink: 1 },
  muted: { fontSize: 12, color: Brand.muted, fontWeight: '400' },
  strong: { fontSize: 14, fontWeight: '700', color: Brand.ink },
  highlights: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, columnGap: 16 },
  highlight: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  highlightWide: { width: '46%' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 42, height: 42, borderRadius: 10, backgroundColor: Brand.blueSoft, alignItems: 'center', justifyContent: 'center' },
  hRow: { gap: 14 },
  course: { width: 250, borderRadius: 14, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line, overflow: 'hidden' },
  courseThumb: { height: 110, alignItems: 'center', justifyContent: 'center' },
  courseBadge: { position: 'absolute', top: 10, left: 10, fontSize: 11, fontWeight: '800', color: Brand.ink, backgroundColor: HIGHLIGHT, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  courseInfo: { gap: 3, padding: 12 },
  price: { fontSize: 15, fontWeight: '800', color: Brand.ink, marginTop: 4 },
  sale: { color: Brand.live },
  was: { fontSize: 11, fontWeight: '400', color: Brand.muted, textDecorationLine: 'line-through' },
  shorts: { flexDirection: 'row', gap: 10 },
  short: { flex: 1, aspectRatio: 9 / 15, maxWidth: 140, borderRadius: 12, padding: 10, justifyContent: 'flex-end', gap: 2 },
  shortText: { fontSize: 15, fontWeight: '900', color: Brand.surface, alignSelf: 'flex-start' },
  shortHighlight: { color: Brand.ink, backgroundColor: HIGHLIGHT, paddingHorizontal: 3 },
  shortViews: { fontSize: 11, fontWeight: '600', color: Brand.surface, marginTop: 6 },
  review: { width: 300, gap: 4, padding: 16, borderRadius: 14, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  stars: { color: Brand.amber },
});
