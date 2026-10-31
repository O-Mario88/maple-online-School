import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { formatMoney } from '@/lib/finance/fees';
import type { MockData } from '@/mock';

import { Brand } from '../palette';

type Course = MockData['publicPages']['coursePage'];

function percentOff(price: number, was: number): number {
  return was > price ? Math.round(((was - price) / was) * 100) : 0;
}

/** Plan tabs, price, what's included, and the one-tap Enrol and Buy-for-a-group buttons. */
export function PriceCard({ course }: { course: Course }) {
  const [planKey, setPlanKey] = useState(course.plans[0].key);
  const plan = course.plans.find((p) => p.key === planKey) ?? course.plans[0];
  const off = percentOff(plan.priceUGX, plan.wasUGX);
  return (
    <View style={styles.card}>
      <View style={styles.tabs} accessibilityRole="tablist">
        {course.plans.map((p) => {
          const on = p.key === planKey;
          return (
            <Pressable key={p.key} style={[styles.tab, on && styles.tabOn]} onPress={() => setPlanKey(p.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>{p.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{formatMoney(plan.priceUGX, 'UGX')}</Text>
        {plan.wasUGX ? <Text style={styles.was}>{formatMoney(plan.wasUGX, 'UGX')}</Text> : null}
        {off ? <Text style={styles.off}>{`${off}% OFF`}</Text> : null}
      </View>
      {plan.key === 'school' ? <Text style={styles.note}>Per learner, for schools enrolling 20 or more.</Text> : null}
      <View style={styles.includes}>
        {course.includes.map((i) => (
          <View key={i} style={styles.include}>
            <Icon name="check" size={16} color={Brand.green} />
            <Text style={styles.includeText}>{i}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.enrol} accessibilityRole="button" onPress={() => router.push('/checkout')}>
        <Icon name="wallet" size={18} color={Brand.surface} />
        <Text style={styles.enrolText}>Enrol now</Text>
      </Pressable>
      <Pressable style={styles.group} accessibilityRole="button" onPress={() => router.push('/checkout')}>
        <Icon name="people" size={18} color={Brand.ink} />
        <Text style={styles.groupText}>Buy for a group</Text>
      </Pressable>
      <View style={styles.guarantee}>
        <Icon name="check" size={16} color={Brand.green} />
        <Text style={styles.includeText}>30-day money back guarantee</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14, padding: 20, borderRadius: 16, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  tabs: { flexDirection: 'row', padding: 4, borderRadius: 10, backgroundColor: Brand.canvas },
  tab: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabOn: { backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  tabText: { fontSize: 13, color: Brand.body },
  tabTextOn: { color: Brand.blue, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 },
  price: { fontSize: 28, fontWeight: '800', color: Brand.ink, letterSpacing: -0.5 },
  was: { fontSize: 14, color: Brand.muted, textDecorationLine: 'line-through' },
  off: { fontSize: 11, fontWeight: '700', color: Brand.surface, backgroundColor: Brand.green, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, overflow: 'hidden' },
  note: { fontSize: 12, color: Brand.muted },
  includes: { gap: 9 },
  include: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  includeText: { fontSize: 13, color: Brand.body },
  enrol: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: 10, backgroundColor: Brand.blue },
  enrolText: { fontSize: 16, fontWeight: '600', color: Brand.surface },
  group: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: 10, borderWidth: 1, borderColor: Brand.line },
  groupText: { fontSize: 15, fontWeight: '600', color: Brand.ink },
  guarantee: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
});
