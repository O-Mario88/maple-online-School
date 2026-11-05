import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar, Btn, Card, IconTile, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, WHITE } from '@/features/portal/tokens';
import type { IconName } from '@/lib/icons';

import { longDate, type SubState, ugx } from './useSubscription';

const PURPLE = '#5B3FD9';

export function Head({ icon, title, right, sub }: { icon: IconName; title: string; right?: ReactNode; sub?: string }) {
  return (
    <View style={s.head}>
      <Icon name={icon} size={19} color={PURPLE} />
      <Text style={s.headTitle}>
        {title}
        {sub ? <Text style={s.headSub}>{` ${sub}`}</Text> : null}
      </Text>
      <View style={s.flex} />
      {right}
    </View>
  );
}

/** A warning once learners pass 80%, 90% or 100% of the plan; learners are never removed. */
export function CapacityBanner({ x }: { x: SubState }) {
  if (x.alert === null) return null;
  const full = x.alert >= 100;
  return (
    <View style={[s.banner, full && s.bannerFull]} accessibilityLiveRegion="polite">
      <Icon name="alert" size={18} color={full ? '#B91C1C' : '#B45309'} />
      <Text style={s.bannerText}>{full ? `You’ve reached ${x.current.learners} learners. Everyone keeps learning; add seats or upgrade to enrol more.` : `You’re at ${x.learnerPct}% of your ${x.current.learners} learners.`}</Text>
      <Btn label="See options" kind="soft" height={34} onPress={() => x.setTab('Plans & Upgrades')} />
    </View>
  );
}

export function CurrentPlan({ x }: { x: SubState }) {
  return (
    <Card style={s.planCard}>
      <View style={s.planTop}>
        <LinearGradient colors={['#ECE7FE', '#DCD3FB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={s.planIcon}>
          <Icon name="layers" size={24} color={WHITE} />
        </View>
        <View style={s.flex}>
          <Text style={s.small}>Current Plan</Text>
          <View style={s.row}>
            <Text style={s.planName}>{x.current.name}</Text>
            <Pill label={x.sub.status} tone="green" size={12} />
          </View>
          <Text style={s.planLine}>{x.current.planId === 'launch' ? 'A complete digital school for smaller institutions.' : x.current.planId === 'growth' ? 'Everything in Launch, with more capacity and automation.' : 'Everything in Growth, with enterprise intelligence.'}</Text>
        </View>
      </View>
      <View style={s.planBody}>
        <View style={s.pair}>
          <Fact icon="calendar" label="Billing Period" value={x.sub.term.label} />
          <Fact icon="clock" label="Renewal Date" value={longDate(x.sub.renewal)} />
        </View>
        <View style={[s.pair, s.divider]}>
          <Fact icon="receipt" label="Amount per Term" value={ugx(x.priceUGX)} />
          <Pressable style={s.linkRow} onPress={() => x.setTab('Plans & Upgrades')} accessibilityRole="link">
            <Text style={s.link}>View Plan Details</Text>
            <Icon name="arrowRight" size={14} color={BLUE} />
          </Pressable>
        </View>
        {x.pending ? <Text style={s.pending}>{`Changing to ${x.versions.find((v) => v.planId === x.pending?.planId)?.name} on ${longDate(x.pending.at)}.`}</Text> : null}
        <View style={s.pair}>
          <Btn label="Upgrade Plan" icon="arrowUp" onPress={x.upgrade} style={s.flex} height={42} />
          <Btn label="Manage Plan" icon="settings" kind="outline" onPress={() => x.setTab('Plans & Upgrades')} style={s.flex} height={42} />
        </View>
      </View>
    </Card>
  );
}

function Fact({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={s.fact}>
      <Icon name={icon} size={20} color={PURPLE} />
      <View>
        <Text style={s.small}>{label}</Text>
        <Text style={s.factValue}>{value}</Text>
      </View>
    </View>
  );
}

export function Capacity({ x }: { x: SubState }) {
  return (
    <Card style={s.card}>
      <Head icon="people" title="Learner Capacity" />
      <View style={s.row}>
        <Text style={s.big}>
          {x.learners}
          <Text style={s.bigOf}>{` / ${x.current.learners}`}</Text>
        </Text>
        <View style={s.flex} />
        <Pill label={`${x.learnerPct}% Used`} tone={x.alert === null ? 'green' : x.alert >= 100 ? 'red' : 'orange'} size={12} />
      </View>
      <Text style={s.body}>Active learners</Text>
      <Bar value={Math.min(1, x.learners / x.current.learners)} color={BLUE} height={8} />
    </Card>
  );
}

export function Usage({ x, title = 'Usage & Allowances' }: { x: SubState; title?: string }) {
  return (
    <Card style={s.card}>
      <Head icon="chart" title={title} sub="(This Term)" />
      {x.usage.map((u) => (
        <View key={u.key} style={s.usageRow}>
          <Icon name={u.icon} size={18} color={NAVY} />
          <Text style={[s.body, s.usageLabel]}>{u.label}</Text>
          <View style={s.usageBar}>
            <View style={s.row}>
              <Text style={s.small}>{`${u.used} / ${u.allowance} ${u.unit}`}</Text>
              <View style={s.flex} />
              <Text style={s.usagePct}>{`${u.pct}%`}</Text>
            </View>
            <Bar value={Math.min(1, u.pct / 100)} color={u.pct >= 90 ? '#EF4444' : BLUE} height={6} />
          </View>
        </View>
      ))}
    </Card>
  );
}

export function BillingSummary({ x }: { x: SubState }) {
  const rows: readonly [string, ReactNode][] = [
    ['Plan', x.current.name],
    ['Amount per Term', ugx(x.priceUGX)],
    ['Next Renewal', longDate(x.sub.renewal)],
    ['Status', <Pill key="s" label={x.sub.status} tone="green" size={12} />],
  ];
  return (
    <Card style={s.card}>
      <Head icon="receipt" title="Billing Summary" />
      {rows.map(([k, v]) => (
        <View key={k} style={s.sumRow}>
          <Text style={s.body}>{k}</Text>
          {typeof v === 'string' ? <Text style={s.sumValue}>{v}</Text> : v}
        </View>
      ))}
    </Card>
  );
}

export function Invoices({ x, all = false }: { x: SubState; all?: boolean }) {
  const list = all ? x.sub.invoices : x.sub.invoices.slice(0, 3);
  return (
    <Card style={s.card}>
      <Head icon="doc" title={all ? 'Invoices & Payments' : 'Recent Invoices'} right={all ? null : <Pressable onPress={() => x.setTab('Invoices & Payments')} accessibilityRole="link"><Text style={s.link}>View All →</Text></Pressable>} />
      <View style={[s.invRow, s.invHead]}>
        <Text style={[s.th, s.invNo]}>Invoice No.</Text>
        <Text style={[s.th, s.flex]}>Period</Text>
        <Text style={[s.th, s.invAmt]}>Amount</Text>
        <Text style={[s.th, s.invStatus]}>Status</Text>
        <View style={s.invDl} />
      </View>
      {list.map((i) => (
        <View key={i.id} style={s.invRow}>
          <Text style={[s.td, s.invNo]}>{i.id}</Text>
          <Text style={[s.td, s.flex]} numberOfLines={1}>
            {i.period}
          </Text>
          <Text style={[s.td, s.invAmt]}>{ugx(i.amountUGX)}</Text>
          <View style={s.invStatus}>
            <Pill label={i.status} tone="green" size={11} />
          </View>
          <Pressable style={s.invDl} onPress={() => x.download(i.id)} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Download ${i.id}`}>
            <Icon name="download" size={17} color={BLUE} />
          </Pressable>
        </View>
      ))}
    </Card>
  );
}

/** Before any plan change: the new price, what's charged now, when it applies, and anything over the new limits. */
export function ChangeSheet({ x }: { x: SubState }) {
  const t = x.target;
  const c = x.change;
  if (!t || !c) return null;
  const up = c.kind === 'upgrade';
  const rows: readonly [string, string][] = [
    ['New price per term', ugx(t.priceUGX)],
    ['Learners included', t.learners.toLocaleString('en-US')],
    ['Charged now', up ? `${ugx(c.chargeNowUGX)} (rest of ${x.sub.term.label})` : 'Nothing'],
    ['Takes effect', up ? 'As soon as you confirm' : `At renewal, ${longDate(x.sub.renewal)}`],
  ];
  return (
    <Modal visible transparent animationType="fade" onRequestClose={x.closeChange}>
      <View style={s.scrim}>
        <View style={s.sheet}>
          <View style={s.row}>
            <IconTile icon={up ? 'arrowUp' : 'arrowDown'} tone="purple" size={40} radius={10} />
            <Text style={s.sheetTitle}>{up ? `Upgrade to ${t.name}` : `Move to ${t.name}`}</Text>
          </View>
          {rows.map(([k, v]) => (
            <View key={k} style={s.sumRow}>
              <Text style={s.body}>{k}</Text>
              <Text style={s.sumValue}>{v}</Text>
            </View>
          ))}
          {c.issues.map((i) => (
            <View key={i} style={s.issue}>
              <Icon name="alert" size={16} color="#B45309" />
              <Text style={s.issueText}>{i}</Text>
            </View>
          ))}
          <Text style={s.small}>All your school’s records, content and settings are kept whatever plan you choose.</Text>
          <View style={s.pair}>
            <Btn label="Cancel" kind="outline" onPress={x.closeChange} style={s.flex} height={42} />
            <Btn label={up ? 'Confirm upgrade' : 'Schedule change'} onPress={x.confirmChange} style={s.flex} height={42} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  small: { fontSize: 12.5, color: BODY },
  body: { fontSize: 13.5, color: NAVY },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 },
  headTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  headSub: { fontSize: 14, fontWeight: '500', color: BODY },
  card: { gap: 10, padding: 18 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FCD9A8', backgroundColor: '#FFF8EC' },
  bannerFull: { borderColor: '#FBC6C6', backgroundColor: '#FFF4F4' },
  bannerText: { flex: 1, fontSize: 13.5, color: NAVY },
  planCard: { overflow: 'hidden', padding: 0 },
  planTop: { flexDirection: 'row', gap: 14, padding: 18 },
  planIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: PURPLE },
  planName: { fontSize: 22, fontWeight: '800', color: NAVY },
  planLine: { marginTop: 4, fontSize: 13, lineHeight: 18, color: NAVY },
  planBody: { gap: 14, padding: 18 },
  pair: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divider: { paddingTop: 14, borderTopWidth: 1, borderTopColor: LINE },
  fact: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  factValue: { marginTop: 2, fontSize: 15.5, fontWeight: '700', color: NAVY },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  pending: { fontSize: 13, color: '#B45309' },
  big: { fontSize: 26, fontWeight: '800', color: NAVY },
  bigOf: { fontSize: 18, fontWeight: '500', color: BODY },
  usageRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  usageLabel: { width: 150 },
  usageBar: { flex: 1, gap: 6 },
  usagePct: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  sumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#EEF2F8' },
  sumValue: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  invRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 36, borderBottomWidth: 1, borderBottomColor: '#EEF2F8' },
  invHead: { minHeight: 30 },
  th: { fontSize: 12, fontWeight: '600', color: BODY },
  td: { fontSize: 12.5, color: NAVY },
  invNo: { width: 78 },
  invAmt: { width: 102 },
  invStatus: { width: 50 },
  invDl: { width: 24, alignItems: 'center' },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(17,28,78,0.35)' },
  sheet: { width: '100%', maxWidth: 480, gap: 12, padding: 22, borderRadius: 16, backgroundColor: WHITE },
  sheetTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: NAVY },
  issue: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, backgroundColor: '#FFF8EC' },
  issueText: { flex: 1, fontSize: 13, lineHeight: 18, color: NAVY },
});
