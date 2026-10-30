import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

type Course = MockData['publicPages']['coursePage'];

export const COURSE_TABS = ['Overview', 'Curriculum', 'Lessons', 'Live Classes', 'Assignments', 'Reviews', 'Teacher', 'FAQs'] as const;

function initials(name: string): string {
  return name
    .replace(/^(Mr|Ms|Mrs|Dr)\.\s*/, '')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2);
}

/** Five reasons to trust the course, in a row. */
export function FeatureStrip({ course }: { course: Course }) {
  return (
    <View style={styles.strip}>
      {course.features.map((f) => (
        <View key={f.title} style={styles.feature}>
          <View style={styles.featureIcon}>
            <Icon name={f.icon} size={20} color={Brand.blue} />
          </View>
          <View>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.muted}>{f.detail}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

/** The section tabs under the hero. */
export function SectionTabs({ active, onChange }: { active: string; onChange: (tab: string) => void }) {
  return (
    <View style={styles.tabs} accessibilityRole="tablist">
      {COURSE_TABS.map((t) => {
        const on = t === active;
        return (
          <Pressable key={t} onPress={() => onChange(t)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Text style={[styles.tabText, on && styles.tabOn]}>{t}</Text>
            {on ? <View style={styles.tabLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

/** "What you will learn": the course outcomes. */
export function Outcomes({ course, wide }: { course: Course; wide: boolean }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle} accessibilityRole="header">
        What you will learn
      </Text>
      <View style={styles.outcomes}>
        {course.outcomes.map((o) => (
          <View key={o.title} style={[styles.outcome, wide && styles.outcomeWide]}>
            <View style={styles.outcomeIcon}>
              <Icon name={o.icon} size={20} color={Brand.purple} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.strong}>{o.title}</Text>
              <Text style={styles.body}>{o.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

/** The teacher's profile card. */
export function TeacherCard({ course }: { course: Course }) {
  const t = course.teacher;
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle} accessibilityRole="header">
        Meet your teacher
      </Text>
      <View style={styles.teacherRow}>
        <View style={styles.teacherAvatar}>
          <Text style={styles.teacherInitials}>{initials(t.name)}</Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.strong}>{`${t.name}${t.verified ? '  ✓' : ''}`}</Text>
          <Text style={styles.body}>{t.title}</Text>
          <View style={styles.teacherStats}>
            {t.stats.map((s) => (
              <View key={s.label}>
                <Text style={styles.stat}>{s.value}</Text>
                <Text style={styles.muted}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      <Text style={styles.body}>{t.bio}</Text>
      <Pressable style={styles.outline} accessibilityRole="button">
        <Text style={styles.link}>View full profile →</Text>
      </Pressable>
    </View>
  );
}

/** Rating summary, the star breakdown and recent reviews. */
export function Reviews({ course }: { course: Course }) {
  return (
    <View style={styles.card}>
      <View style={styles.between}>
        <Text style={styles.cardTitle} accessibilityRole="header">
          Student reviews
        </Text>
        <Pressable style={styles.outlineSmall} accessibilityRole="button">
          <Text style={styles.link}>Write a review</Text>
        </Pressable>
      </View>
      <Text style={styles.bigRating}>
        {String(course.rating)}
        <Text style={styles.muted}> out of 5</Text>
      </Text>
      <Text style={styles.stars}>★★★★★</Text>
      <Text style={styles.muted}>{`Based on ${course.reviews.toLocaleString('en-US')} reviews`}</Text>
      {course.ratingBars.map((share, i) => (
        <View key={i} style={styles.barRow}>
          <Text style={styles.barLabel}>{`${5 - i} stars`}</Text>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${Math.max(share * 100, 1)}%` }]} />
          </View>
          <Text style={styles.barPct}>{`${Math.round(share * 100)}%`}</Text>
        </View>
      ))}
      {course.reviewList.map((r) => (
        <View key={r.name} style={styles.review}>
          <Text style={styles.strong}>{`${r.name} · ${'★'.repeat(r.stars)}`}</Text>
          <Text style={styles.body}>{r.text}</Text>
          <Text style={styles.muted}>{r.when}</Text>
        </View>
      ))}
    </View>
  );
}

/** Related courses with price and rating. */
export function Related({ course }: { course: Course }) {
  return (
    <View style={styles.card}>
      <View style={styles.between}>
        <Text style={styles.cardTitle} accessibilityRole="header">
          Related courses
        </Text>
        <Text style={styles.link}>View all →</Text>
      </View>
      {course.related.map((r) => (
        <View key={r.title} style={styles.related}>
          <View style={styles.relatedThumb}>
            <Icon name={r.icon} size={26} color={Brand.surface} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.strong}>{r.title}</Text>
            <Text style={styles.muted}>{r.meta}</Text>
            <Text style={styles.body}>{`★ ${r.rating} (${r.reviews})`}</Text>
            <Text style={styles.strong}>{formatMoney(r.priceUGX, 'UGX')}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  muted: { fontSize: 12, color: Brand.muted },
  body: { fontSize: 13, lineHeight: 19, color: Brand.body },
  strong: { fontSize: 14, fontWeight: '600', color: Brand.ink },
  link: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  card: { gap: 12, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  cardTitle: { fontSize: 20, fontWeight: '700', color: Brand.ink },
  strip: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, padding: 16, borderRadius: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 10, flexGrow: 1, flexBasis: 170 },
  featureIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: Brand.blueSoft, alignItems: 'center', justifyContent: 'center' },
  featureTitle: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 28, rowGap: 4, borderBottomWidth: 1, borderBottomColor: Brand.line },
  tab: { paddingVertical: 12 },
  tabText: { fontSize: 14, color: Brand.ink },
  tabOn: { color: Brand.blue, fontWeight: '600' },
  tabLine: { position: 'absolute', left: 0, right: 0, bottom: -1, height: 2, backgroundColor: Brand.blue },
  outcomes: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 16, columnGap: 20 },
  outcome: { flexDirection: 'row', gap: 12, width: '100%' },
  outcomeWide: { width: '47%' },
  outcomeIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: Brand.purpleSoft, alignItems: 'center', justifyContent: 'center' },
  teacherRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  teacherAvatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#8D5524', alignItems: 'center', justifyContent: 'center' },
  teacherInitials: { fontSize: 30, fontWeight: '700', color: Brand.surface },
  teacherStats: { flexDirection: 'row', gap: 20, marginTop: 8 },
  stat: { fontSize: 18, fontWeight: '800', color: Brand.ink },
  outline: { alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Brand.line },
  outlineSmall: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Brand.blue },
  bigRating: { fontSize: 34, fontWeight: '800', color: Brand.ink },
  stars: { fontSize: 20, color: Brand.amber, letterSpacing: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barLabel: { width: 52, fontSize: 12, color: Brand.body },
  bar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Brand.canvas, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: Brand.blue },
  barPct: { width: 34, fontSize: 12, color: Brand.body, textAlign: 'right' },
  review: { gap: 2, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Brand.line },
  related: { flexDirection: 'row', gap: 12 },
  relatedThumb: { width: 96, height: 80, borderRadius: 10, backgroundColor: '#2A9D8F', alignItems: 'center', justifyContent: 'center' },
});
