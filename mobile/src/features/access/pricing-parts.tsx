import { type Href, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { useAccess } from '@/lib/access/access-context';
import { type PaywallState, paywallCopy } from '@/lib/access/paywall-copy';
import { dayLabel, planOverride } from '@/lib/access/trial';
import { useMe } from '@/lib/auth/auth-context';
import { formatMoney } from '@/lib/finance/fees';
import { DESIGN_DATA, mockData } from '@/lib/mock';
import { navFor, PORTAL_LABELS } from '@/lib/navigation';
import { usePortal } from '@/lib/portal-context';
import { toast } from '@/lib/toast';
import type { PayPlan } from '@/mock/access';

/** The student on both designs, cut from the reference with soft edges. */
export const STUDENT = require('@/assets/images/paywall-student.png') as number;
export const LOGO = require('@/assets/images/maple-leaf.png') as number;

/** The reference's colours. */
export const C = {
  navy: '#0B1A3F',
  ink: '#1E293B',
  body: '#475569',
  muted: '#64748B',
  blue: '#0063EA',
  blueDeep: '#0B4FD6',
  line: '#E6EBF3',
  canvas: '#F9FAFE',
  white: '#FFFFFF',
  gold: '#E9A23B',
  goldLine: '#E9B04A',
  goldSoft: '#FFF8EC',
  green: '#16A34A',
  soft: '#F0F5FF',
  softLine: '#DFE8FA',
} as const;
const TONES = { red: { bg: '#FDE9E4', fg: '#A3261C' }, blue: { bg: '#EAF1FF', fg: C.blue }, green: { bg: '#E6F6EC', fg: C.green } } as const;

export const ugx = (n: number) => formatMoney(n, 'UGX');
export const per = (school: boolean) => (school ? '/ learner a month' : '/ month');

/** Everything both layouts need: the state, the words, the plans and what the buttons do. */
export function usePricing() {
  const a = useAccess();
  const { portal } = usePortal();
  const me = useMe();
  const mock = mockData();
  const sample = mock?.shared.access;
  // ?need= says which plan a locked feature needs (an upgrade link sends people here with it).
  const { need } = useLocalSearchParams<{ need?: string }>();
  const needs = planOverride(typeof need === 'string' ? `plan=${need}` : '');
  const needed = needs ? a.plans.find((p) => p.tier === needs) : undefined;
  const current = a.access?.phase === 'paid' ? a.plans.find((p) => p.tier === a.access?.tier) : undefined;
  const state: PaywallState =
    a.access?.phase === 'locked'
      ? { kind: 'ended' }
      : needed && needs && a.access?.phase === 'paid'
        ? { kind: 'upgrade', plan: needed.name, tier: needs }
        : a.access?.phase === 'paid'
          ? { kind: 'paid', plan: current?.name ?? 'your plan' }
          : { kind: 'trial', daysLeft: a.access?.daysLeft ?? 0, ends: dayLabel(a.access?.trialEnds ?? '') };
  // The Free plan, for learners: the card under the title on desktop, the first plan row on phones.
  const learner = portal === 'learner';
  const freePlan = learner ? sample?.freePlan : undefined;
  const onFree = learner && a.access?.phase === 'locked';
  const freeCard = freePlan
    ? { title: onFree ? 'You still have free access to:' : 'The Free plan includes:', sub: onFree ? 'Your plan now: Free · UGX 0 / month · with ads' : 'Free · UGX 0 / month · with ads', items: freePlan.items }
    : null;
  const modeBody = current ? 'Carry on with everything in your plan.' : 'Browse, explore and use free resources while you decide.';
  const popular = a.plans.find((p) => p.popular)?.id ?? a.plans[0]?.id ?? '';
  const [chosen, setChosen] = useState(needed?.id ?? popular);
  const pay = (planId: string) => toast(`${a.pay(planId)} Everything is open again. (Sample payment.)`);
  const browseFree = () => router.replace((learner ? '/learn/explore' : '/') as Href);
  const extension = () => toast('We’ve asked for a short extension. You’ll hear back by email within a day. (Sample.)');
  return {
    copy: paywallCopy(state),
    plans: a.plans,
    school: a.payer === 'school',
    chosen,
    setChosen,
    /** The plan they are on: a paid one, or Free once the free month is over. */
    currentId: current?.id ?? (onFree ? freePlan?.id : undefined),
    /** Every plan to choose from on phones, Free first. */
    phonePlans: freePlan ? [freePlan, ...a.plans] : a.plans,
    pay,
    browseFree,
    extension,
    modeLabel: `Continue in ${PORTAL_LABELS[portal]} Mode`,
    name: me.data?.full_name ?? 'Guest',
    avatar: learner ? mock?.learner.learnerHome.avatar : undefined,
    /** The design's short learner menu; other modes keep their own. */
    nav: learner && sample ? sample.deskNav : navFor(portal, DESIGN_DATA).map((i) => ({ key: i.key, label: i.label, icon: i.icon, href: String(i.href) })),
    freeCard,
    modeBody,
    /** The free shelf is a learner's, so it links only in Learner Mode. */
    learner,
    brings: sample?.planBrings ?? [],
    promises: sample?.promises ?? [],
    promisesPhone: sample?.promisesPhone ?? [],
    accepts: sample?.accepts ?? [],
  };
}
export type Pricing = ReturnType<typeof usePricing>;

/** The state badge above the title ("Access Paused" once the month is over). */
export function Pill({ p, size, height }: { p: Pricing; size: number; height: number }) {
  const tone = TONES[p.copy.tone];
  return (
    <View style={[s.pill, { height, paddingHorizontal: height * 0.42, gap: size * 0.5, backgroundColor: tone.bg }]}>
      <Icon name={p.copy.tone === 'red' ? 'lock' : p.copy.tone === 'green' ? 'check' : 'sparkle'} size={size * 1.15} color={tone.fg} />
      <Text style={[s.pillText, { fontSize: size, color: tone.fg }]}>{p.copy.pill}</Text>
    </View>
  );
}

/** A plan's icon on its tinted tile. */
export function PlanIcon({ plan, size }: { plan: PayPlan; size: number }) {
  return (
    <View style={[s.planIcon, { width: size, height: size, borderRadius: size * 0.24, backgroundColor: `${plan.tint}1F` }]}>
      <Icon name={plan.icon} size={size * 0.56} color={plan.tint} />
    </View>
  );
}

/** The gold "Most Popular" badge. */
export function Popular({ size, height }: { size: number; height: number }) {
  return (
    <View style={[s.popular, { height, paddingHorizontal: height * 0.55, borderRadius: height / 2 }]}>
      <Icon name="crown" size={size * 1.1} color={C.white} />
      <Text style={[s.popularText, { fontSize: size }]}>Most Popular</Text>
    </View>
  );
}

const s = StyleSheet.create({
  pill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 999 },
  pillText: { fontWeight: '600' },
  planIcon: { alignItems: 'center', justifyContent: 'center' },
  popular: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.gold },
  popularText: { fontWeight: '600', color: C.white },
});
