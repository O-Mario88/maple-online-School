import { Image } from 'expo-image';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { CREDIT_MINUTES, type Cycle, CYCLES, packSaving, planPrice } from '@/lib/billing';
import { formatMoney } from '@/lib/finance/fees';
import type { IconName } from '@/lib/icons';

import type { BillingState, Plan } from './useBilling';

const NAVY = '#0F1B3D';
const BODY = '#4A5263';
const BLUE = '#1463F3';
const GREEN = '#16A34A';
const ugx = (n: number) => formatMoney(n, 'UGX');

export function Card({ title, right, children, style }: { title?: string; right?: React.ReactNode; children: React.ReactNode; style?: object }) {
  return (
    <View style={[styles.card, style]}>
      {title ? (
        <View style={styles.cardHead}>
          <Text style={styles.cardTitle}>{title}</Text>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const ACCOUNT: readonly { label: string; icon: IconName; href: Href | null }[] = [
  { label: 'Profile', icon: 'person', href: { pathname: '/learn/account', params: { section: 'profile' } } },
  { label: 'Learning Preferences', icon: 'settings', href: { pathname: '/learn/account', params: { section: 'preferences' } } },
  { label: 'Notifications', icon: 'bell', href: '/inbox' },
  { label: 'Billing & Subscriptions', icon: 'wallet', href: null },
  { label: 'Rewards & Referrals', icon: 'trophy', href: '/learn/passport' },
  { label: 'Settings', icon: 'settings', href: { pathname: '/learn/account', params: { section: 'settings' } } },
];

export const inviteFriends = (s: BillingState) =>
  Share.share({ message: `Join me on Maple Global Online School! Use my code ${s.hub.referral.code} and we both get ${ugx(s.hub.referral.reward)} tutoring credit.` }).catch(() => undefined);

export function AccountSide({ s }: { s: BillingState }) {
  return (
    <View style={styles.side}>
      <View>
        <Text style={styles.sideTitle}>Account</Text>
        {ACCOUNT.map((a) => {
          const on = a.href == null;
          return (
            <Pressable key={a.label} style={[styles.sideItem, on && styles.sideOn]} onPress={() => (a.href ? router.push(a.href) : undefined)} accessibilityRole="link" accessibilityState={{ selected: on }}>
              <Icon name={a.icon} size={17} color={on ? BLUE : '#3B4456'} />
              <Text style={[styles.sideText, on && styles.sideTextOn]}>{a.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.flex} />
      <View style={styles.referral}>
        <Image source={s.hub.icons.gift} style={styles.gift} contentFit="contain" />
        <Text style={styles.refTitle}>{`Get ${ugx(s.hub.referral.reward)} Free Credit`}</Text>
        <Text style={styles.refText}>{`Invite a friend to join Maple and you'll both get ${ugx(s.hub.referral.reward)} tutoring credit.`}</Text>
        <Pressable style={styles.primary} onPress={() => inviteFriends(s)} accessibilityRole="button">
          <Text style={styles.primaryText}>Invite Friends</Text>
        </Pressable>
      </View>
      <View style={styles.help}>
        <View style={styles.helpHead}>
          <Icon name="help" size={22} color={NAVY} />
          <Text style={styles.helpTitle}>Need Help?</Text>
        </View>
        <Text style={styles.refText}>Visit our help center or chat with our support team.</Text>
        <Pressable style={styles.outline} onPress={() => router.push('/help')} accessibilityRole="link">
          <Text style={styles.outlineText}>Get Support</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StatusChip({ s }: { s: BillingState }) {
  const on = s.current.autoRenew;
  return <Text style={[styles.chip, on ? styles.chipGreen : styles.chipAmber]}>{on ? 'Active' : `Ends ${s.current.renews}`}</Text>;
}

export function CurrentPlan({ s }: { s: BillingState }) {
  const p = s.currentPlan;
  const price = planPrice(p.monthly, s.current.cycle);
  return (
    <Card title="Your Current Plan" right={<StatusChip s={s} />} style={styles.planCard}>
      <View style={styles.planInner}>
        <View style={styles.trophyTile}>
          <Image source={s.hub.icons.trophy} style={styles.trophy} contentFit="contain" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.planTitle}>{p.title}</Text>
          <Text style={styles.planDesc}>{p.long}</Text>
          <Text style={styles.planPrice}>
            {ugx(price.total)}
            <Text style={styles.planUnit}>{` / ${CYCLES[s.current.cycle].unit.replace('per ', '')}`}</Text>
          </Text>
          <View style={styles.renew}>
            <Icon name="calendar" size={14} color={BODY} />
            <Text style={styles.renewText}>{s.current.autoRenew ? `Next renewal: ${s.current.renews}` : `Active until ${s.current.renews}`}</Text>
          </View>
          {s.pending ? <Text style={styles.pending}>{`Switching to ${s.plan(s.pending.plan).name} (${CYCLES[s.pending.cycle].label}) on ${s.current.renews}`}</Text> : null}
        </View>
        <Pressable style={styles.outlineSm} onPress={() => s.open({ kind: 'manage' })} accessibilityRole="button">
          <Text style={styles.outlineText}>Manage Plan</Text>
        </Pressable>
      </View>
      <View style={styles.included}>
        {s.hub.included.map((f) => (
          <View key={f} style={styles.incItem}>
            <View style={styles.tick}>
              <Icon name="check" size={11} color="#FFFFFF" />
            </View>
            <Text style={styles.incText}>{f}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function Wallet({ s, compact = false }: { s: BillingState; compact?: boolean }) {
  const packs = s.hub.credits.packs;
  return (
    <Card
      title="Tutoring Credits Wallet"
      style={compact ? undefined : styles.walletCard}
      right={
        <Pressable style={styles.topUp} onPress={() => s.open({ kind: 'pay', what: { type: 'credits', pack: s.pack } })} accessibilityRole="button">
          <Text style={styles.primaryText}>Top Up</Text>
        </Pressable>
      }>
      <View style={styles.balanceRow}>
        <View style={styles.walletTile}>
          <Image source={s.hub.icons.wallet} style={styles.walletIcon} contentFit="contain" />
        </View>
        <View style={styles.flex}>
          <Text style={styles.balance}>{`${s.balance} Credits`}</Text>
          <Text style={styles.balanceSub}>{`Each credit = ${CREDIT_MINUTES} minutes of 1-to-1 tutoring`}</Text>
        </View>
      </View>
      <View style={styles.packs}>
        {packs.map((p, i) => {
          const on = s.pack === i;
          const save = packSaving(p, packs[0]);
          return (
            <Pressable key={p.credits} style={[styles.pack, on && styles.packOn]} onPress={() => s.setPack(i)} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={`${p.credits} credits, ${ugx(p.price)}${save ? `, save ${save}%` : ''}`}>
              <Text style={styles.packCredits}>{`${p.credits} Credits`}</Text>
              <Text style={[styles.packPrice, on && styles.blue]}>{ugx(p.price)}</Text>
              {save ? <Text style={styles.save}>{`Save ${save}%`}</Text> : null}
            </Pressable>
          );
        })}
      </View>
      <Pressable style={styles.auto} onPress={s.toggleAuto} accessibilityRole="switch" accessibilityState={{ checked: s.auto }}>
        <Image source={s.hub.icons.bolt} style={styles.bolt} contentFit="contain" />
        <View style={styles.flex}>
          <Text style={styles.autoTitle}>Auto Top-Up (Recommended)</Text>
          <Text style={styles.autoText}>{`Automatically add ${s.hub.credits.auto.add} credits when balance falls below ${s.hub.credits.auto.below} credits.`}</Text>
        </View>
        <View style={[styles.switch, s.auto && styles.switchOn]}>
          <View style={[styles.knob, s.auto && styles.knobOn]} />
        </View>
      </Pressable>
    </Card>
  );
}

const CYCLE_TABS: readonly Cycle[] = ['monthly', 'term', 'annual'];

function PlanCard({ s, p }: { s: BillingState; p: Plan }) {
  const price = planPrice(p.monthly, s.cycleTab);
  const isCurrent = s.current.plan === p.id && s.current.cycle === s.cycleTab;
  const isPending = s.pending?.plan === p.id && s.pending.cycle === s.cycleTab;
  return (
    <View style={[styles.plan, p.popular && styles.planPopular]}>
      {p.popular ? <Text style={styles.popular}>Most Popular</Text> : null}
      <View style={styles.planName}>
        <Image source={p.icon} style={styles.planIcon} contentFit="contain" />
        <Text style={styles.planNameText}>{p.name}</Text>
      </View>
      <Text style={styles.planBlurb}>{p.blurb}</Text>
      <Text style={styles.price}>{ugx(price.total)}</Text>
      <Text style={styles.per}>{s.cycleTab === 'monthly' ? 'per month' : `${CYCLES[s.cycleTab].unit} • ${ugx(price.perMonth)}/month`}</Text>
      <Pressable style={isCurrent ? styles.planBtnOn : styles.planBtn} onPress={() => s.choose(p.id, s.cycleTab)} disabled={isCurrent || isPending} accessibilityRole="button" accessibilityState={{ disabled: isCurrent || isPending }}>
        <Text style={isCurrent ? styles.primaryText : styles.planBtnText}>{isCurrent ? 'Current Plan' : isPending ? `Starts ${s.current.renews}` : 'Choose Plan'}</Text>
      </Pressable>
      <View style={styles.features}>
        {p.features.map((f) => (
          <View key={f.label} style={styles.feature}>
            <View style={[styles.tickSm, !f.on && styles.tickOff]}>
              <Icon name="check" size={9} color={f.on ? '#FFFFFF' : '#B8C0CD'} />
            </View>
            <Text style={[styles.featureText, !f.on && styles.featureOff]}>{f.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function Plans({ s, phone = false }: { s: BillingState; phone?: boolean }) {
  return (
    <Card style={phone ? undefined : styles.plansCard}>
      <View style={styles.plansHead}>
        <Text style={styles.cardTitle}>Available Plans</Text>
        <Pressable onPress={() => s.open({ kind: 'compare' })} accessibilityRole="link">
          <Text style={styles.link}>Compare Plans</Text>
        </Pressable>
      </View>
      <View style={styles.cycles} accessibilityRole="tablist">
        {CYCLE_TABS.map((c) => {
          const on = s.cycleTab === c;
          return (
            <Pressable key={c} style={[styles.cycle, phone && styles.cycleP, on && styles.cycleOn]} onPress={() => s.setCycleTab(c)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.cycleText, on && styles.cycleTextOn]}>{phone && c === 'term' ? 'Term' : CYCLES[c].label}</Text>
              {CYCLES[c].saving ? <Text style={styles.save}>{`Save ${CYCLES[c].saving}%`}</Text> : null}
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.planRow, phone && styles.planCol]}>
        {s.hub.plans.map((p) => (
          <PlanCard key={p.id} s={s} p={p} />
        ))}
      </View>
    </Card>
  );
}

function MethodRow({ s, id }: { s: BillingState; id: string }) {
  const [menu, setMenu] = useState(false);
  const m = s.method(id);
  return (
    <View style={[styles.method, menu && styles.raised]}>
      <Image source={m.logo} style={styles.logo} contentFit="contain" />
      <View style={styles.flex}>
        <Text style={styles.methodLabel}>{m.label}</Text>
        <Text style={styles.methodSub}>{m.sub}</Text>
      </View>
      {m.primary ? <Text style={[styles.chip, styles.chipGreen]}>Primary</Text> : null}
      <View>
        <Pressable onPress={() => setMenu(!menu)} accessibilityRole="button" accessibilityLabel={`Options for ${m.label}`} accessibilityState={{ expanded: menu }} hitSlop={8}>
          <Icon name="more" size={16} color={NAVY} />
        </Pressable>
        {menu ? (
          <View style={styles.menu}>
            {m.primary ? (
              <Text style={styles.menuNote}>Your primary method</Text>
            ) : (
              <>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenu(false);
                    s.makePrimary(m.id);
                  }}
                  accessibilityRole="menuitem">
                  <Text style={styles.menuText}>Make primary</Text>
                </Pressable>
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    setMenu(false);
                    s.removeMethod(m.id);
                  }}
                  accessibilityRole="menuitem">
                  <Text style={[styles.menuText, styles.danger]}>Remove</Text>
                </Pressable>
              </>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function PaymentMethods({ s, primaryOnly = false }: { s: BillingState; primaryOnly?: boolean }) {
  const list = primaryOnly ? s.methods.filter((m) => m.primary) : s.methods;
  return (
    <Card
      title={primaryOnly ? 'Payment Method' : 'Payment Methods'}
      style={styles.zTop}
      right={
        <Pressable style={styles.addMethod} onPress={() => (primaryOnly ? s.setPhoneTab('wallet') : s.open({ kind: 'method' }))} accessibilityRole="button">
          {primaryOnly ? null : <Icon name="plus" size={14} color={BLUE} />}
          <Text style={styles.link}>{primaryOnly ? 'Manage' : 'Add Method'}</Text>
        </Pressable>
      }>
      <View style={styles.methods}>
        {list.map((m) => (
          <MethodRow key={m.id} s={s} id={m.id} />
        ))}
      </View>
    </Card>
  );
}

export function Purchases({ s, limit }: { s: BillingState; limit?: number }) {
  const rows = limit ? s.purchases.slice(0, limit) : s.purchases;
  return (
    <Card
      title="Recent Purchases"
      right={
        <Pressable style={styles.pill} onPress={s.toggleAllPurchases} accessibilityRole="button">
          <Text style={styles.pillText}>{s.allPurchases ? 'Show Less' : 'See All'}</Text>
        </Pressable>
      }>
      {rows.map((r) => (
        <Pressable key={r.id} style={styles.buy} onPress={() => s.open({ kind: 'receipt', id: r.id })} accessibilityRole="button" accessibilityLabel={`${r.title}, ${ugx(r.amount)}, ${r.date}, paid. Open receipt`}>
          <Image source={r.icon} style={styles.buyIcon} contentFit="contain" />
          <View style={styles.flex}>
            <Text style={styles.buyTitle}>{r.title}</Text>
            <Text style={styles.buyDate}>{r.date}</Text>
          </View>
          <View style={styles.buyRight}>
            <Text style={styles.buyAmount}>{ugx(r.amount)}</Text>
            <Text style={[styles.chip, styles.chipGreen, styles.paid]}>Paid</Text>
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

const PHONE_FEATURES: readonly { label: string; icon: IconName }[] = [
  { label: 'Live Classes', icon: 'video' },
  { label: 'Past Papers', icon: 'notes' },
  { label: 'Digital Library', icon: 'library' },
  { label: 'Flashcards', icon: 'grid' },
];

/** The phone's compact current plan, features row and credits. */
export function PhoneOverview({ s }: { s: BillingState }) {
  const p = s.currentPlan;
  const price = planPrice(p.monthly, s.current.cycle);
  const total = s.balance + s.hub.credits.usedThisMonth;
  return (
    <>
      <Card title="Current Plan" right={<StatusChip s={s} />}>
        <Pressable style={styles.phonePlan} onPress={() => s.open({ kind: 'manage' })} accessibilityRole="button" accessibilityLabel={`${p.title}, manage plan`}>
          <View style={[styles.trophyTile, styles.trophyTileP]}>
            <Image source={s.hub.icons.trophy} style={styles.trophyP} contentFit="contain" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.phonePlanTitle}>{p.title}</Text>
            <Text style={styles.phonePlanPrice}>
              {ugx(price.total)}
              <Text style={styles.planUnitP}>{` / ${CYCLES[s.current.cycle].unit.replace('per ', '')}`}</Text>
            </Text>
            <Text style={styles.renewText}>{`Next renewal: ${s.current.renews}`}</Text>
          </View>
          <Icon name="chevronRight" size={16} color={NAVY} />
        </Pressable>
        <View style={styles.featRow}>
          {PHONE_FEATURES.map((f) => (
            <View key={f.label} style={styles.feat}>
              <View style={styles.featIcon}>
                <Icon name={f.icon} size={16} color={GREEN} />
              </View>
              <Text style={styles.featText}>{f.label}</Text>
            </View>
          ))}
        </View>
      </Card>
      <Card
        title="Tutoring Credits"
        right={
          <Pressable style={styles.topUp} onPress={() => s.open({ kind: 'pay', what: { type: 'credits', pack: s.pack } })} accessibilityRole="button">
            <Text style={styles.primaryText}>Top Up</Text>
          </Pressable>
        }>
        <View style={styles.balanceRow}>
          <Image source={s.hub.icons.credits} style={styles.coins} contentFit="contain" />
          <View style={styles.flex}>
            <Text style={styles.balance}>{`${s.balance} Credits`}</Text>
            <Bar value={s.balance / total} color={GREEN} track="#E4ECF6" height={7} />
            <Text style={styles.balanceSub}>{`Each credit = ${CREDIT_MINUTES} minutes of 1-to-1 tutoring`}</Text>
          </View>
        </View>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  blue: { color: BLUE },
  zTop: { zIndex: 5 },
  card: { gap: 12, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E8EEF6', backgroundColor: '#FFFFFF' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: NAVY, letterSpacing: -0.2 },
  side: { flex: 1, gap: 14, paddingHorizontal: 12, paddingVertical: 14 },
  sideTitle: { marginBottom: 8, marginLeft: 8, fontSize: 15, fontWeight: '700', color: NAVY },
  sideItem: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 9, borderRadius: 7 },
  sideOn: { backgroundColor: '#E3ECFB' },
  sideText: { fontSize: 12, color: '#2B3445', letterSpacing: -0.15 },
  sideTextOn: { fontWeight: '500', color: BLUE },
  referral: { gap: 8, padding: 16, borderRadius: 10, backgroundColor: '#E5EEFB' },
  gift: { alignSelf: 'center', width: 130, height: 65 },
  refTitle: { fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  refText: { fontSize: 11.5, lineHeight: 16, color: BODY },
  help: { gap: 8, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E3E9F2', backgroundColor: '#FFFFFF' },
  helpHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  helpTitle: { fontSize: 14, fontWeight: '700', color: NAVY },
  primary: { height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 6, backgroundColor: '#0B6BFF' },
  primaryText: { fontSize: 12.5, fontWeight: '600', color: '#FFFFFF' },
  outline: { height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#9BB8EC' },
  outlineSm: { height: 32, justifyContent: 'center', paddingHorizontal: 14, borderRadius: 6, borderWidth: 1, borderColor: '#9BB8EC' },
  outlineText: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  chip: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6, fontSize: 11.5, fontWeight: '600', overflow: 'hidden' },
  chipGreen: { backgroundColor: '#DDF5E5', color: '#15803D' },
  chipAmber: { backgroundColor: '#FEF3C7', color: '#92400E' },
  planCard: { height: 286 },
  planInner: { flexDirection: 'row', gap: 16, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#EAF0F7' },
  trophyTile: { width: 58, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#FFF2DC' },
  trophyTileP: { width: 46, height: 50 },
  trophy: { width: 36, height: 36 },
  trophyP: { width: 28, height: 28 },
  planTitle: { fontSize: 17, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  planDesc: { marginTop: 4, maxWidth: 270, fontSize: 12, lineHeight: 16, color: BODY },
  planPrice: { marginTop: 8, fontSize: 18, fontWeight: '800', color: '#0B4DDB' },
  planUnit: { fontSize: 15, fontWeight: '400', color: NAVY },
  renew: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  renewText: { fontSize: 12, color: BODY },
  pending: { marginTop: 6, fontSize: 11.5, fontWeight: '600', color: '#92400E' },
  included: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 10, borderWidth: 1, borderColor: '#EAF0F7' },
  incItem: { width: '25%', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 6, paddingVertical: 10 },
  tick: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 3, borderColor: '#D3F1DC', backgroundColor: GREEN },
  incText: { flex: 1, fontSize: 10.5, color: BODY, letterSpacing: -0.2 },
  walletCard: { height: 286 },
  topUp: { height: 30, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 6, backgroundColor: '#0B6BFF' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  walletTile: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: '#F1E8FD' },
  walletIcon: { width: 32, height: 32 },
  coins: { width: 42, height: 42 },
  balance: { fontSize: 18, fontWeight: '800', color: NAVY },
  balanceSub: { marginTop: 3, fontSize: 11.5, color: BODY },
  packs: { flexDirection: 'row', gap: 8 },
  pack: { flex: 1, minHeight: 72, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 8, borderWidth: 1, borderColor: '#E3E9F2' },
  packOn: { borderWidth: 1.5, borderColor: '#5B92F5', backgroundColor: '#F5F9FF' },
  packCredits: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  packPrice: { fontSize: 12, color: BODY },
  save: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: '#DDF5E5', fontSize: 10.5, fontWeight: '500', color: '#15803D', overflow: 'hidden' },
  auto: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8, backgroundColor: '#F2F6FC' },
  bolt: { width: 16, height: 26 },
  autoTitle: { fontSize: 12, fontWeight: '700', color: NAVY },
  autoText: { marginTop: 2, fontSize: 10.5, lineHeight: 14, color: BODY },
  switch: { width: 36, height: 20, justifyContent: 'center', paddingHorizontal: 2, borderRadius: 10, backgroundColor: '#D5DDEA' },
  switchOn: { backgroundColor: '#0B6BFF' },
  knob: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFFFFF' },
  knobOn: { alignSelf: 'flex-end' },
  plansCard: { height: 522 },
  plansHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { fontSize: 12, fontWeight: '500', color: BLUE },
  cycles: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E8EEF6' },
  cycle: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  cycleP: { paddingHorizontal: 8, gap: 5 },
  cycleOn: { borderBottomColor: '#0B6BFF' },
  cycleText: { fontSize: 12, color: BODY },
  cycleTextOn: { fontWeight: '600', color: BLUE },
  planRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  planCol: { flexDirection: 'column', gap: 18, marginTop: 18 },
  plan: { flex: 1, gap: 4, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E8EEF6', backgroundColor: '#FFFFFF' },
  planPopular: { borderWidth: 1.5, borderColor: '#3B82F6', borderTopLeftRadius: 0, borderTopRightRadius: 0 },
  popular: { position: 'absolute', top: -20, left: -1.5, right: -1.5, height: 20, paddingTop: 3, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: '#0B6BFF', fontSize: 10.5, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', overflow: 'hidden' },
  planName: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  planIcon: { width: 22, height: 22 },
  planNameText: { flex: 1, fontSize: 12, fontWeight: '700', color: NAVY, letterSpacing: -0.2 },
  planBlurb: { marginTop: 6, minHeight: 32, fontSize: 11, lineHeight: 16, color: BODY },
  price: { marginTop: 10, fontSize: 17, fontWeight: '800', color: NAVY },
  per: { fontSize: 11.5, color: BODY },
  planBtn: { height: 32, alignItems: 'center', justifyContent: 'center', marginVertical: 12, borderRadius: 6, borderWidth: 1.5, borderColor: '#3B82F6' },
  planBtnOn: { height: 32, alignItems: 'center', justifyContent: 'center', marginVertical: 12, borderRadius: 6, backgroundColor: '#0B6BFF' },
  planBtnText: { fontSize: 12.5, fontWeight: '600', color: BLUE },
  features: { gap: 7 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tickSm: { width: 15, height: 15, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: GREEN },
  tickOff: { borderWidth: 1.5, borderColor: '#C9D0DB', backgroundColor: '#FFFFFF' },
  featureText: { flex: 1, fontSize: 11, lineHeight: 15, color: NAVY },
  featureOff: { color: '#A4ACB9' },
  methods: { gap: 8 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#EAF0F7', backgroundColor: '#FFFFFF' },
  raised: { zIndex: 5 },
  logo: { width: 44, height: 38 },
  methodLabel: { fontSize: 12, fontWeight: '600', color: NAVY },
  methodSub: { marginTop: 2, fontSize: 11, color: BODY },
  menu: { position: 'absolute', top: 22, right: 0, width: 150, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E1E7F0', backgroundColor: '#FFFFFF', zIndex: 10 },
  menuItem: { height: 30, justifyContent: 'center', paddingHorizontal: 12 },
  menuText: { fontSize: 12, color: NAVY },
  menuNote: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 11.5, color: BODY },
  danger: { color: '#B91C1C' },
  addMethod: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#EEF4FF' },
  pillText: { fontSize: 11.5, color: BLUE },
  buy: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  buyIcon: { width: 36, height: 36 },
  buyTitle: { fontSize: 11.5, fontWeight: '500', color: NAVY },
  buyDate: { marginTop: 2, fontSize: 11, color: BODY },
  buyRight: { alignItems: 'flex-end', gap: 3 },
  buyAmount: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  paid: { paddingVertical: 1, fontSize: 10.5 },
  phonePlan: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  phonePlanTitle: { fontSize: 14, fontWeight: '700', color: NAVY },
  phonePlanPrice: { marginTop: 3, fontSize: 13.5, fontWeight: '800', color: NAVY },
  planUnitP: { fontWeight: '400' },
  featRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#EEF1F6' },
  feat: { alignItems: 'center', gap: 4 },
  featIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#DDF5E5' },
  featText: { fontSize: 10.5, color: NAVY, textAlign: 'center' },
});
