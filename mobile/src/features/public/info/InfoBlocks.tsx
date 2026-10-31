import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CYCLES, type Cycle, planPrice } from '@/lib/billing';
import { formatMoney } from '@/lib/finance/fees';
import type { MockData } from '@/mock';
import type { InfoBlock } from '@/mock/public-info';

import { Brand } from '../palette';

type Plans = MockData['publicPages']['pricingPlans'];

const go = (href: string) => router.push(href as Href);

function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <View style={styles.heading}>
      <Text style={styles.h2} accessibilityRole="header">
        {title}
      </Text>
      {sub ? <Text style={styles.body}>{sub}</Text> : null}
    </View>
  );
}

/** The study passes with a Monthly / Term / Annual switch; prices come from the billing rules. */
function PlanCards({ plans, wide }: { plans: Plans; wide: boolean }) {
  const [cycle, setCycle] = useState<Cycle>('monthly');
  return (
    <View style={styles.gap}>
      <View style={styles.cycles} accessibilityRole="tablist">
        {(Object.keys(CYCLES) as Cycle[]).map((c) => (
          <Pressable key={c} style={[styles.cycle, c === cycle && styles.cycleOn]} onPress={() => setCycle(c)} accessibilityRole="tab" accessibilityState={{ selected: c === cycle }}>
            <Text style={[styles.cycleText, c === cycle && styles.cycleTextOn]}>{CYCLES[c].saving ? `${CYCLES[c].label} · save ${CYCLES[c].saving}%` : CYCLES[c].label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.row, !wide && styles.column]}>
        {plans.map((p) => {
          const price = planPrice(p.monthly, cycle);
          return (
            <View key={p.id} style={[styles.card, wide && styles.flex, p.popular && styles.popular]}>
              {p.popular ? <Text style={styles.badge}>Most popular</Text> : null}
              <Text style={styles.h3}>{p.name}</Text>
              <Text style={styles.price}>{formatMoney(price.total, 'UGX')}</Text>
              <Text style={styles.muted}>{CYCLES[cycle].unit}</Text>
              <Text style={styles.body}>{p.blurb}</Text>
              {p.features.map((f) => (
                <View key={f.label} style={styles.feature}>
                  <Icon name={f.on ? 'check' : 'minus'} size={15} color={f.on ? Brand.green : Brand.muted} />
                  <Text style={[styles.body, !f.on && styles.off]}>{f.label}</Text>
                </View>
              ))}
              <Pressable style={[styles.button, p.popular ? styles.primary : styles.outline]} onPress={() => go('/sign-up')} accessibilityRole="button" accessibilityLabel={`Choose ${p.name}`}>
                <Text style={[styles.buttonText, p.popular && styles.primaryText]}>{`Choose ${p.name}`}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <View style={styles.card}>
      {items.map((it, i) => {
        const on = open === it.q;
        return (
          <View key={it.q} style={i > 0 && styles.rule}>
            <Pressable style={styles.faqRow} onPress={() => setOpen(on ? null : it.q)} accessibilityRole="button" accessibilityState={{ expanded: on }}>
              <Text style={[styles.h3, styles.flex]}>{it.q}</Text>
              <Icon name={on ? 'minus' : 'plus'} size={16} color={Brand.ink} />
            </Pressable>
            {on ? <Text style={[styles.body, styles.answer]}>{it.a}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

/** One section of an information page. */
export function InfoSection({ block, wide, plans }: { block: InfoBlock; wide: boolean; plans: Plans }) {
  switch (block.kind) {
    case 'plans':
      return (
        <View style={styles.gap}>
          <Heading title={block.title} sub={block.sub} />
          <PlanCards plans={plans} wide={wide} />
        </View>
      );
    case 'cards':
      return (
        <View style={styles.gap}>
          <Heading title={block.title} sub={block.sub} />
          <View style={[styles.row, styles.wrap, !wide && styles.column]}>
            {block.cards.map((c) => (
              <View key={c.title} style={[styles.card, wide && styles.cardWide]}>
                <View style={styles.iconBox}>
                  <Icon name={c.icon} size={20} color={Brand.blue} />
                </View>
                <Text style={styles.h3}>{c.title}</Text>
                <Text style={styles.body}>{c.body}</Text>
                {c.href ? (
                  <Pressable onPress={() => go(c.href ?? '/explore')} accessibilityRole="link" hitSlop={6}>
                    <Text style={styles.link}>{`${c.link ?? 'Learn more'} →`}</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      );
    case 'steps':
      return (
        <View style={styles.gap}>
          <Heading title={block.title} />
          <View style={[styles.row, !wide && styles.column]}>
            {block.steps.map((s, i) => (
              <View key={s.title} style={[styles.card, wide && styles.flex]}>
                <Text style={styles.step}>{String(i + 1)}</Text>
                <Text style={styles.h3}>{s.title}</Text>
                <Text style={styles.body}>{s.body}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    case 'stats':
      return (
        <View style={[styles.card, styles.row, styles.wrap]}>
          {block.stats.map((s) => (
            <View key={s.label} style={styles.stat}>
              <Text style={styles.price}>{s.value}</Text>
              <Text style={styles.muted}>{s.label}</Text>
            </View>
          ))}
        </View>
      );
    case 'faq':
      return (
        <View style={styles.gap}>
          <Heading title={block.title} />
          <Faq items={block.items} />
        </View>
      );
    case 'legal':
      return (
        <View style={[styles.card, styles.legal]}>
          <Text style={styles.muted}>{`Last updated ${block.updated}`}</Text>
          {block.sections.map((s, i) => (
            <View key={s.title} style={styles.gapSmall}>
              <Text style={styles.h3} accessibilityRole="header">{`${i + 1}. ${s.title}`}</Text>
              <Text style={styles.body}>{s.body}</Text>
            </View>
          ))}
        </View>
      );
  }
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 16 },
  gapSmall: { gap: 6 },
  heading: { gap: 6 },
  h2: { fontSize: 24, fontWeight: '800', color: Brand.ink, letterSpacing: -0.4 },
  h3: { fontSize: 16, fontWeight: '700', color: Brand.ink },
  body: { fontSize: 14, lineHeight: 21, color: Brand.body },
  muted: { fontSize: 12.5, color: Brand.muted },
  off: { color: Brand.muted },
  link: { fontSize: 14, fontWeight: '600', color: Brand.blue },
  row: { flexDirection: 'row', gap: 16 },
  wrap: { flexWrap: 'wrap' },
  column: { flexDirection: 'column' },
  card: { gap: 10, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: Brand.line, backgroundColor: Brand.surface },
  cardWide: { flexBasis: 240, flexGrow: 1 },
  popular: { borderColor: Brand.blue, borderWidth: 2 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99, overflow: 'hidden', fontSize: 11.5, fontWeight: '700', color: Brand.blue, backgroundColor: Brand.blueSoft },
  price: { fontSize: 26, fontWeight: '800', color: Brand.ink },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  button: { height: 44, marginTop: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  primary: { backgroundColor: Brand.blue },
  outline: { borderWidth: 1, borderColor: Brand.line },
  buttonText: { fontSize: 14, fontWeight: '600', color: Brand.ink },
  primaryText: { color: Brand.surface },
  cycles: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'flex-start', gap: 4, padding: 4, borderRadius: 12, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  cycle: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9 },
  cycleOn: { backgroundColor: Brand.blueSoft },
  cycleText: { fontSize: 13, fontWeight: '600', color: Brand.muted },
  cycleTextOn: { color: Brand.blue },
  iconBox: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: Brand.blueSoft },
  step: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden', textAlign: 'center', lineHeight: 30, fontSize: 14, fontWeight: '800', color: Brand.surface, backgroundColor: Brand.blue },
  stat: { flexBasis: 140, flexGrow: 1, gap: 2 },
  faqRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  answer: { paddingBottom: 12 },
  rule: { borderTopWidth: 1, borderTopColor: Brand.line },
  legal: { gap: 16 },
});
