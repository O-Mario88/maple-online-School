import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { CmdSelect, type Kpi, OutlineBtn, PageStrip, PhotoDot, PrimaryBtn, exportMenu } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { recordManual, refund, type TxnStatus, txnSummary } from '@/features/command/logic/payments';
import { Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, NAVY, TONES, type Tone } from '@/features/portal/tokens';
import { type Column, DataTable, Search, SelectBox, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { TxnRow } from '@/mock/command-center/pf-payments';

import { amount, type FormAsk, FormModal } from './FinForm';
import { CheckList, FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, ProviderBadge, RingLegend, short, ugx } from './FinKit';
import { Maple } from '@/constants/maple';

type D = CommandData['platformFinance']['payments'];
const PER_PAGE = 10;
const TABS = ['Overview', 'All Transactions', 'Collections', 'Refunds', 'Chargebacks', 'Settlements', 'Reconciliation', 'Provider Reports'] as const;
const STATUS_TONE: Readonly<Record<TxnStatus, Tone>> = { Successful: 'green', Pending: 'orange', Failed: 'red', Refunded: 'purple', Chargeback: 'red' };
const TYPE_TONE: Readonly<Record<string, Tone>> = { Subscription: 'purple', 'Learner Plan': 'blue', 'Subject Purchase': 'purple', 'School Fee': 'blue', 'Manual Payment': 'green' };
const PROMO: Promo = { icon: 'wallet', color: Maple.blue, title: 'Payment Operations', body: 'Track, reconcile and manage all payments across providers.' };
const PROVIDER_COLORS = [Maple.blue, Maple.warning, '#0BA4DB', Maple.warning, Maple.blue, Maple.successText, Maple.faint];
const CURRENCY = ['UGX (All)', 'UGX', 'KES', 'USD'];

function useTxns(d: D) {
  const [list, setList] = useState<readonly TxnRow[]>(d.txns);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [query, setQuery] = useState('');
  const [range, setRange, ranges] = useChoice(['Oct 1 – Oct 31, 2026', 'Last 7 Days', 'Today']);
  const [provider, setProvider, providers] = useChoice(['All Providers', 'Stripe', 'Flutterwave', 'Paystack', 'Pesapal', 'Mobile Money', 'Airtel Money', 'Bank Transfer']);
  const [type, setType, types] = useChoice(['All Types', 'Subscription', 'Learner Plan', 'Subject Purchase', 'School Fee', 'Manual Payment']);
  const [customer, setCustomer, customers] = useChoice(['All Customers', 'Institution', 'Learner', 'Parent']);
  const [status, setStatus, statuses] = useChoice(['All Statuses', 'Successful', 'Pending', 'Failed', 'Refunded', 'Chargeback']);
  const [currency, setCurrency] = useChoice(CURRENCY);
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inTab = (t: TxnRow) => (tab === 'Collections' ? t.status === 'Successful' : tab === 'Refunds' ? t.refunded > 0 : tab === 'Chargebacks' ? t.status === 'Chargeback' : true);
    const recent = (t: TxnRow) => range === 'Oct 1 – Oct 31, 2026' || (range === 'Today' ? t.at.startsWith('Oct 31') : /Oct (2[5-9]|3[01])/.test(t.at));
    return list.filter(
      (t) =>
        inTab(t) &&
        recent(t) &&
        (provider === 'All Providers' || t.provider === provider) &&
        (type === 'All Types' || t.type === type) &&
        (customer === 'All Customers' || t.kind === customer) &&
        (status === 'All Statuses' || t.status === status) &&
        (!q || `${t.id} ${t.customer} ${t.ref} ${t.amount}`.toLowerCase().includes(q)),
    );
  }, [list, tab, query, range, provider, type, customer, status]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const update = (t: TxnRow) => setList((prev) => prev.map((x) => (x.id === t.id ? t : x)));

  const manage = (t: TxnRow) =>
    setAsk({
      title: t.id,
      body: `${t.customer} • ${t.type} via ${t.provider} • ${ugx(t.amount)} • ${t.status}${t.refunded ? ` • refunded ${ugx(t.refunded)}` : ''}`,
      fields: [
        { key: 'action', label: 'Action', kind: 'choice', options: ['Refund', 'Retry payment', 'Send receipt'] },
        { key: 'amount', label: 'Refund amount (UGX)', kind: 'number', initial: String(t.amount - t.refunded) },
        { key: 'reason', label: 'Reason', kind: 'text', placeholder: 'Duplicate charge' },
      ],
      confirm: 'Apply',
      onSubmit: (v) => {
        if (v.action === 'Refund') {
          const r = refund(t, amount(v.amount), v.reason);
          if (r.error) return r.error;
          update(r.txn);
          toast(`${ugx(amount(v.amount))} refunded to ${t.customer} via ${t.provider}. Deferred revenue and bank entries posted.`);
          return undefined;
        }
        if (v.action === 'Retry payment') {
          if (t.status !== 'Failed') return 'Only failed payments can be retried.';
          update({ ...t, status: 'Pending' });
          toast(`Retry sent to ${t.provider}. ${t.customer} gets a payment prompt.`);
          return undefined;
        }
        toast(`Receipt for ${t.id} sent to ${t.customer}.`);
        return undefined;
      },
    });
  const manual = () =>
    setAsk({
      title: 'Record manual payment',
      body: 'For money received outside the gateways, such as a bank deposit or cash at the office. It is matched against the bank statement later.',
      fields: [
        { key: 'reference', label: 'Reference', kind: 'text', placeholder: 'BNK-20261031-118' },
        { key: 'customer', label: 'Received from', kind: 'text', placeholder: 'Hope Primary School' },
        { key: 'amount', label: 'Amount (UGX)', kind: 'number', placeholder: '2500000' },
        { key: 'provider', label: 'Method', kind: 'choice', options: ['Bank Transfer', 'Cash', 'Mobile Money', 'Cheque'] },
      ],
      confirm: 'Record Payment',
      onSubmit: (v) => {
        const r = recordManual(list, { reference: v.reference, customer: v.customer, amount: amount(v.amount), provider: v.provider, at: 'Oct 31, 2026, 10:30 AM' });
        if (r.error) return r.error;
        const row = r.list[0];
        setList([{ ...row, ref: 'Manual', kind: 'Institution', settlement: '—', currency: 'UGX' }, ...list]);
        toast(`${ugx(row.amount)} from ${row.customer} recorded. Auto Accountant posted Dr Bank, Cr Accounts Receivable.`);
        return undefined;
      },
    });
  const live = txnSummary(list);
  const seed = txnSummary(d.txns);
  const t0 = d.txnTotals;
  const count = t0.count + live.count - seed.count;
  const ok = t0.successful + live.successful - seed.successful;
  const pct = (n: number) => `${((n / count) * 100).toFixed(1)}%`;
  const failed = t0.failed + live.failed - seed.failed;
  const pending = t0.pending + live.pending - seed.pending;
  const stats: readonly Kpi[] = [
    { ...d.txnStats[0], value: ugx(t0.value + live.value - seed.value) },
    { ...d.txnStats[1], value: num(ok), caption: pct(ok) },
    { ...d.txnStats[2], value: num(pending), caption: pct(pending) },
    { ...d.txnStats[3], value: num(failed), caption: pct(failed) },
    { ...d.txnStats[4], value: num(t0.refunded + live.refunded - seed.refunded), caption: ugx(t0.refundedValue + live.refundedValue - seed.refundedValue) },
    { ...d.txnStats[5], value: num(t0.chargebacks + live.chargebacks - seed.chargebacks), caption: ugx(t0.chargebackValue + live.chargebackValue - seed.chargebackValue) },
  ];
  const pick = (t: string) => {
    if (t === 'Settlements' || t === 'Reconciliation') return router.push('/command/finance/settlements' as never);
    if (t === 'Provider Reports') return router.push('/command/finance/integrations' as never);
    setTab(t);
    setPage(1);
  };
  const clear = () => {
    setProvider('All Providers');
    setType('All Types');
    setCustomer('All Customers');
    setStatus('All Statuses');
    setRange('Oct 1 – Oct 31, 2026');
    setQuery('');
  };
  return { d, rows, shown, tab, setTab: pick, query, setQuery, range, setRange, ranges, provider, setProvider, providers, type, setType, types, customer, setCustomer, customers, status, setStatus, statuses, currency, setCurrency, page: p, pages, setPage, ask, setAsk, manage, manual, stats, clear, selected, toggle, ok, count, failed, live };
}
type U = ReturnType<typeof useTxns>;

function Customer({ t }: { t: TxnRow }) {
  return (
    <View style={styles.inline}>
      {t.avatar ? (
        <PhotoDot source={t.avatar} size={24} />
      ) : (
        <View style={styles.crest}>
          <Icon name="building" size={13} color={TONES.green.solid} />
        </View>
      )}
      <View style={styles.flex}>
        <Text style={styles.cellStrong} numberOfLines={1}>
          {t.customer}
        </Text>
        <Text style={styles.cell} numberOfLines={1}>
          {t.ref}
        </Text>
      </View>
    </View>
  );
}

function cols(d: D): readonly Column<TxnRow>[] {
  return [
    { label: 'Date & Time ↓', width: 136, render: (t) => <Text style={styles.cell} numberOfLines={1}>{t.at}</Text> },
    { label: 'Transaction ID', width: 98, render: (t) => <Text style={styles.cell} numberOfLines={1}>{t.id}</Text> },
    { label: 'Customer', flex: 1.4, render: (t) => <Customer t={t} /> },
    { label: 'Type', width: 112, render: (t) => <Pill label={t.type} tone={TYPE_TONE[t.type] ?? 'blue'} size={10.5} /> },
    {
      label: 'Provider',
      width: 122,
      render: (t) => (
        <View style={styles.inline}>
          <ProviderBadge name={t.provider} color={d.providerColor[t.provider] ?? Maple.faint} size={20} />
          <Text style={styles.cellStrong} numberOfLines={1}>
            {t.provider}
          </Text>
        </View>
      ),
    },
    { label: 'Amount', width: 102, align: 'right', render: (t) => <Text style={[styles.cellStrong, styles.right]} numberOfLines={1}>{ugx(t.amount)}</Text> },
    { label: 'Status', width: 90, align: 'center', render: (t) => <Pill label={t.status} tone={STATUS_TONE[t.status]} size={10.5} /> },
    { label: 'Settlement', width: 78, align: 'center', render: (t) => <Text style={[styles.cell, styles.center]}>{t.settlement}</Text> },
  ];
}

function Filters({ u }: { u: U }) {
  return (
    <View style={styles.filters}>
      <SelectBox label="Date Range" value={u.range} options={u.ranges} onChange={u.setRange} width={202} />
      <SelectBox label="Provider" value={u.provider} options={u.providers} onChange={u.setProvider} width={122} />
      <SelectBox label="Payment Type" value={u.type} options={u.types} onChange={u.setType} width={118} />
      <SelectBox label="Customer Type" value={u.customer} options={u.customers} onChange={u.setCustomer} width={142} />
      <SelectBox label="Status" value={u.status} options={u.statuses} onChange={u.setStatus} width={118} />
      <SelectBox label="Currency" value={u.currency} options={CURRENCY} onChange={u.setCurrency} width={96} />
      <Pressable onPress={u.clear} accessibilityRole="button" accessibilityLabel="Clear filters">
        <Text style={styles.link}>Clear Filters</Text>
      </Pressable>
      <OutlineBtn label="Saved Views" chevron small onPress={() => toast('Saved views: Failed this week, Large school payments, Mobile Money only.')} />
    </View>
  );
}

function Volume({ d, phone = false }: { d: D; phone?: boolean }) {
  const [mode, setMode, modes] = useChoice(['Value (UGX)', 'Count']);
  return (
    <FinPanel icon="chart" title="Transaction Volume & Value" right={<CmdSelect value={mode} options={modes} onChange={setMode} width={122} label="Show" />}>
      <ComboChart
        labels={d.volume.labels}
        bars={[{ name: 'Transaction Value (UGX)', color: Maple.blue, values: mode === 'Count' ? d.volume.count.map((c) => c / 2) : d.volume.value }]}
        line={{ name: 'Transaction Count', color: Maple.blue, values: d.volume.count, dots: true }}
        max={500}
        lineMax={1000}
        height={phone ? 190 : 170}
        format={(v) => (v ? `${Math.round(v)}M` : '0')}
        lineFormat={(v) => num(v)}
      />
      <View style={styles.legend}>
        <View style={styles.inline}>
          <View style={[styles.dot, { backgroundColor: Maple.blue }]} />
          <Text style={styles.cell}>Transaction Value (UGX)</Text>
        </View>
        <View style={styles.inline}>
          <View style={[styles.dot, { backgroundColor: Maple.blue }]} />
          <Text style={styles.cell}>Transaction Count</Text>
        </View>
      </View>
    </FinPanel>
  );
}

function Providers({ u, phone = false }: { u: U; phone?: boolean }) {
  const total = u.d.byProvider.reduce((s, p) => s + p.value, 0);
  return (
    <FinPanel icon="layers" title="Payments by Provider">
      <RingLegend phone={phone} compact={!phone} size={112} center={short(total).replace('UGX ', 'UGX\n')} caption="Total Value" parts={u.d.byProvider.map((p, i) => ({ label: p.label, value: p.value, color: PROVIDER_COLORS[i], display: num(p.value) }))} />
    </FinPanel>
  );
}

function Insights({ u }: { u: U }) {
  return (
    <FinPanel icon="sparkle" title="Quick Insights">
      <CheckList
        items={[
          { mark: 'ok', text: `${((u.ok / u.count) * 100).toFixed(1)}% payment success rate`, right: '↑ +1.6 pp', rightTone: 'green' },
          { mark: 'ok', text: 'MRR from subscriptions: UGX 468,750,000', right: '↑ +8.4%', rightTone: 'green' },
          { mark: 'fail', text: `${u.failed} failed payments need follow-up` },
          { mark: 'fail', text: `${u.stats[5].value} chargebacks under review` },
          { mark: 'fail', text: `${u.stats[4].value} refunds processed (${u.stats[4].caption})` },
        ]}
      />
    </FinPanel>
  );
}

/** Maple Command › Finance › Payment Transactions Centre on the desktop reference. */
export function TransactionsDesk({ c }: { c: CommandData }) {
  const u = useTxns(c.platformFinance.payments);
  return (
    <FinDesk c={c} sub="Transactions" search="Search by transaction ID, student, parent, school, amount or reference..." promo={PROMO}>
      <FinHead
        icon="database"
        title="Payment Transactions Centre"
        subtitle="All payment events across Stripe, Flutterwave, Paystack, Mobile Money, Pesapal, banks and more."
        right={
          <>
            <OutlineBtn label="Reconcile" icon="sync" onPress={() => router.push('/command/finance/settlements' as never)} />
            <OutlineBtn label="Export" icon="download" chevron onPress={() => exportMenu('Transactions')} />
            <OutlineBtn label="Reports" icon="chart" chevron onPress={() => router.push('/command/finance/reports' as never)} />
            <PrimaryBtn label="Record Manual Payment" icon="plus" onPress={u.manual} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <View style={styles.row}>
        <View style={[styles.flex, styles.stack]}>
          <FinStats items={u.stats} />
          <View style={styles.box}>
            <Filters u={u} />
          </View>
          <FinPanel icon="layers" title={`Transactions (${num(u.count)})`} right={<Search placeholder="Search transactions..." value={u.query} onChange={u.setQuery} style={styles.search} />}>
            <DataTable columns={cols(u.d)} rows={u.rows} rowKey={(t) => t.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.manage} onRowPress={u.manage} />
            <PageStrip label={`Showing 1 – ${u.rows.length} of ${num(u.count)} transactions`} page={u.page} pages={u.pages} onPage={u.setPage} />
          </FinPanel>
        </View>
        <View style={styles.side}>
          <Volume d={u.d} />
          <Providers u={u} />
          <Insights u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: tiles, the chart, the provider split and transaction cards. */
export function TransactionsPhone({ c }: { c: CommandData }) {
  const u = useTxns(c.platformFinance.payments);
  const d = u.d;
  return (
    <FinPhone c={c} title="Transactions" subtitle="Every payment across Stripe, Flutterwave, Paystack, Mobile Money, Pesapal and banks.">
      <FinStats items={u.stats} phone title="Payment Metrics" />
      <PrimaryBtn label="Record Manual Payment" icon="plus" onPress={u.manual} />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <Search placeholder="Search transactions..." value={u.query} onChange={u.setQuery} />
      {u.rows.map((t) => (
        <PhoneRow
          key={t.id}
          lead={<ProviderBadge name={t.provider} color={d.providerColor[t.provider] ?? Maple.faint} size={36} />}
          title={t.customer}
          sub={`${t.id} • ${t.type} • ${t.at}`}
          right={ugx(t.amount)}
          pill={<Pill label={t.status} tone={STATUS_TONE[t.status]} size={11} />}
          onPress={() => u.manage(t)}
        />
      ))}
      {!u.rows.length ? <Text style={styles.cell}>No transactions match.</Text> : null}
      <Volume d={d} phone />
      <Providers u={u} phone />
      <Insights u={u} />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stack: { gap: 12 },
  side: { width: 384, gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  box: { padding: 12, borderRadius: 14, borderWidth: 1, borderColor: Maple.blueSelected, backgroundColor: Maple.surface },
  filters: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  link: { paddingBottom: 12, fontSize: 13, fontWeight: '600', color: BLUE },
  search: { width: 360 },
  cell: { fontSize: 11, color: BODY },
  cellStrong: { flexShrink: 1, fontSize: 11.5, fontWeight: '700', color: NAVY },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  crest: { width: 24, height: 24, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: TONES.green.soft },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18 },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
