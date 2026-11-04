import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import { mockData } from '@/lib/mock';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

type Course = MockData['publicPages']['coursePage'];

/** What a subject page offers instead of a price: it comes with every study pass, from the cheapest plan's monthly price. */
export function PriceCard({ course }: { course: Course }) {
  const from = mockData()?.shared.access.plans.learner[0];
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>Included in every study pass</Text>
      {from ? (
        <View style={styles.priceRow}>
          <Text style={styles.from}>From</Text>
          <Text style={styles.price}>{formatMoney(from.monthly, 'UGX')}</Text>
          <Text style={styles.per}>/ month</Text>
        </View>
      ) : null}
      <Text style={styles.note}>Pro adds live classes and step-by-step past paper solutions; Premium adds a private tutor and video explainers.</Text>
      <View style={styles.includes}>
        {course.includes.map((i) => (
          <View key={i} style={styles.include}>
            <Icon name="check" size={16} color={Brand.green} />
            <Text style={styles.includeText}>{i}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.enrol} accessibilityRole="button" onPress={() => router.push('/pricing')}>
        <Icon name="wallet" size={18} color={Brand.surface} />
        <Text style={styles.enrolText}>See study passes</Text>
      </Pressable>
      <Pressable style={styles.group} accessibilityRole="button" onPress={() => router.push('/sign-up')}>
        <Icon name="sparkle" size={18} color={Brand.ink} />
        <Text style={styles.groupText}>Start free</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  kicker: { fontSize: 13, fontWeight: '700', color: Brand.blue },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', gap: 6 },
  from: { fontSize: 14, color: Brand.muted },
  per: { fontSize: 14, color: Brand.muted },
  price: { fontSize: 28, fontWeight: '800', color: Brand.ink, letterSpacing: -0.5 },
  note: { fontSize: 12, color: Brand.muted },
  includes: { gap: 9 },
  include: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  includeText: { fontSize: 13, color: Brand.body },
  enrol: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 10, backgroundColor: Brand.blue },
  enrolText: { fontSize: 16, fontWeight: '600', color: Brand.surface },
  group: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: Brand.line },
  groupText: { fontSize: 15, fontWeight: '600', color: Brand.ink },
});
