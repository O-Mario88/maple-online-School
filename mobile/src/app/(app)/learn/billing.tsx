import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useShell } from '@/components/ui';
import { AccountSide, CurrentPlan, PaymentMethods, PhoneOverview, Plans, Purchases, Wallet } from '@/features/learner/billing/BillingCards';
import { BillingDialogs } from '@/features/learner/billing/BillingDialogs';
import { type BillingState, type Hub, type PhoneTab, useBilling } from '@/features/learner/billing/useBilling';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { RefScale } from '@/features/public/home/RefScale';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** The billing reference's desktop panel (x 16–1170 of 1536), laid out in its pixels. */
const BILLING_REF_WIDTH = 1154;
const MAX_DESK_WIDTH = 1400;
const NAVY = '#0F1B3D';
const BODY = '#4A5263';

function Desktop({ s }: { s: BillingState }) {
  return (
    <View style={styles.canvas}>
      <View style={styles.left}>
        <AccountSide s={s} />
      </View>
      <View style={styles.main}>
        <Text style={styles.title} accessibilityRole="header">
          Billing & Subscriptions
        </Text>
        <Text style={styles.sub}>Manage your study passes, tutoring credits, payment methods and purchase history.</Text>
        <View style={styles.row}>
          <View style={styles.colA}>
            <CurrentPlan s={s} />
          </View>
          <View style={styles.flex}>
            <Wallet s={s} />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.colA}>
            <Plans s={s} />
          </View>
          <View style={[styles.flex, styles.gap]}>
            <PaymentMethods s={s} />
            <Purchases s={s} />
          </View>
        </View>
      </View>
    </View>
  );
}

const TABS: readonly { key: PhoneTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'wallet', label: 'Wallet' },
  { key: 'history', label: 'History' },
];

function Phone({ s, avatar }: { s: BillingState; avatar: number }) {
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={avatar} />
      <ScrollView contentContainerStyle={styles.phone}>
        <Text style={styles.titleP} accessibilityRole="header">
          Billing & Subscriptions
        </Text>
        <View style={styles.tabs} accessibilityRole="tablist">
          {TABS.map((t) => {
            const on = s.phoneTab === t.key;
            return (
              <Pressable key={t.key} style={[styles.tab, on && styles.tabOn]} onPress={() => s.setPhoneTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                <Text style={[styles.tabText, on && styles.tabTextOn]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {s.phoneTab === 'overview' ? (
          <>
            <PhoneOverview s={s} />
            <PaymentMethods s={s} primaryOnly />
            <Purchases s={s} limit={4} />
          </>
        ) : s.phoneTab === 'wallet' ? (
          <>
            <Wallet s={s} compact />
            <PaymentMethods s={s} />
            <Plans s={s} phone />
          </>
        ) : (
          <Purchases s={s} />
        )}
      </ScrollView>
    </View>
  );
}

function BillingView({ hub, avatar }: { hub: Hub; avatar: number }) {
  const s = useBilling(hub);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  return (
    <View style={styles.flex}>
      {wide ? (
        <ScrollView style={styles.deskBg} contentContainerStyle={styles.deskWrap}>
          <RefScale width={Math.min(width - 32, MAX_DESK_WIDTH)} refWidth={BILLING_REF_WIDTH}>
            <Desktop s={s} />
          </RefScale>
        </ScrollView>
      ) : (
        <Phone s={s} avatar={avatar} />
      )}
      {s.toastText ? (
        <View style={styles.toast} pointerEvents="none" accessibilityLiveRegion="polite">
          <Text style={styles.toastText}>{s.toastText}</Text>
        </View>
      ) : null}
      <BillingDialogs s={s} />
    </View>
  );
}

/** Billing & Subscriptions: study passes, tutoring credits, payment methods and receipts. */
export default function BillingScreen() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) return <PreviewScreen title="Billing & Subscriptions">{() => null}</PreviewScreen>;
  return <BillingView hub={mock.learner.billingHub} avatar={mock.learner.dashboard.avatar} />;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gap: { gap: 12 },
  deskBg: { backgroundColor: '#EEF3FB' },
  deskWrap: { alignItems: 'center', paddingVertical: 16 },
  canvas: { width: BILLING_REF_WIDTH, flexDirection: 'row', borderRadius: 12, backgroundColor: '#F6F9FD', overflow: 'hidden' },
  left: { width: 206, backgroundColor: '#EFF4FB' },
  main: { flex: 1, gap: 14, padding: 14, paddingLeft: 14 },
  title: { marginTop: 10, fontSize: 29, fontWeight: '800', color: NAVY, letterSpacing: -0.6 },
  sub: { marginTop: -8, fontSize: 14, color: BODY },
  row: { flexDirection: 'row', gap: 10 },
  colA: { width: 566 },
  phoneRoot: { flex: 1, backgroundColor: '#F6F9FD' },
  phone: { gap: 12, padding: 14, paddingBottom: 110 },
  titleP: { fontSize: 22, fontWeight: '800', color: NAVY, letterSpacing: -0.4 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E6ECF5' },
  tab: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: '#0B6BFF' },
  tabText: { fontSize: 13, color: NAVY },
  tabTextOn: { fontWeight: '600', color: '#1463F3' },
  toast: { position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center' },
  toastText: { maxWidth: 520, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: 'rgba(11,20,36,0.92)', fontSize: 13, color: '#FFFFFF', textAlign: 'center', overflow: 'hidden' },
});
