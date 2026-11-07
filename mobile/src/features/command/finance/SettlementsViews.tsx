import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, PageStrip, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { expected, matchDeposit, type ReconStatus, reconStatus, reconSummary, resolveDifference, variance } from '@/features/command/logic/payments';
import { Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { type Column, DataTable, Search, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { BatchRow } from '@/mock/command-center/pf-payments';

import { amount, type FormAsk, FormModal } from './FinForm';
import { CheckList, FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, ProviderBadge, RingLegend, ugx } from './FinKit';

type D = CommandData['platformFinance']['payments'];
const PER_PAGE = 10;
const TABS = ['Overview', 'Provider Settlements', 'Reconciliation', 'Differences & Exceptions', 'Payout Batches', 'Refunds & Chargebacks', 'Bank Deposits', 'History'] as const;
const STATUS_TONE: Readonly<Record<ReconStatus, Tone>> = { Reconciled: 'green', Difference: 'orange', Investigate: 'red', 'Pending Match': 'blue' };
const PROMO: Promo = { icon: 'building', color: '#1E6BF0', title: 'Settlement & Reconciliation', body: 'Match platform payments, fees, refunds and bank deposits.' };
const RANGES = ['Oct 1 – Oct 31, 2026', 'Sep 1 – Sep 30, 2026'];

function useSettlements(d: D) {
  const [list, setList] = useState<readonly BatchRow[]>(d.batches);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [provider, setProvider] = useState('All Providers');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [synced, setSynced] = useState(false);
  const [log, setLog] = useState<readonly string[]>([]);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inTab = (b: BatchRow) => (tab === 'Differences & Exceptions' || tab === 'Reconciliation' ? reconStatus(b) !== 'Reconciled' : tab === 'Bank Deposits' ? b.deposit !== null : true);
    return list.filter((b) => inTab(b) && (provider === 'All Providers' || b.provider === provider) && (!q || `${b.id} ${b.provider} ${b.period}`.toLowerCase().includes(q)));
  }, [list, tab, provider, query]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const update = (b: BatchRow) => setList((prev) => prev.map((x) => (x.id === b.id ? b : x)));
  const note = (line: string) => setLog((l) => [`Oct 31, 2026 • ${line}`, ...l]);

  const manage = (b: BatchRow) =>
    setAsk({
      title: b.id,
      body: `${b.provider} • ${b.period}. Expected ${ugx(expected(b))}; bank deposit ${b.deposit === null ? 'not matched yet' : ugx(b.deposit)}; variance ${ugx(variance(b))}.`,
      fields: [
        { key: 'action', label: 'Action', kind: 'choice', options: ['Match bank deposit', 'Resolve difference', 'Escalate to provider'] },
        { key: 'amount', label: 'Deposit amount (UGX, for matching)', kind: 'number', initial: b.deposit === null ? '' : String(b.deposit) },
        { key: 'note', label: 'Explanation (for resolving)', kind: 'text', placeholder: 'MTN late fee deducted at source' },
      ],
      confirm: 'Apply',
      onSubmit: (v) => {
        if (v.action === 'Match bank deposit') {
          const n = amount(v.amount);
          if (!n) return 'Enter the amount that reached the bank.';
          const next = matchDeposit(b, n);
          update(next);
          note(`${b.id} matched to a deposit of ${ugx(n)}`);
          toast(reconStatus(next) === 'Reconciled' ? `${b.id} reconciled.` : `${b.id} matched with a variance of ${ugx(variance(next))}: ${reconStatus(next)}.`);
          return undefined;
        }
        if (v.action === 'Resolve difference') {
          const r = resolveDifference(b, v.note);
          if (r.error) return r.error;
          update(r.batch);
          note(`${b.id} resolved: ${v.note.trim()}`);
          toast(`${b.id} reconciled. Journal posted: Dr ${r.entry?.[0].account}, Cr ${r.entry?.[1].account} (${ugx(Math.abs(variance(b)))}).`);
          return undefined;
        }
        if (variance(b) === 0 && b.deposit !== null) return `${b.id} has nothing to escalate.`;
        note(`${b.id} escalated to ${b.provider}`);
        toast(`Ticket opened with ${b.provider} settlement support for ${b.id}. Replies land in Differences & Exceptions.`);
        return undefined;
      },
    });
  const upload = () => {
    const pending = list.filter((b) => b.deposit === null);
    setAsk({
      title: 'Upload bank statement',
      body: 'Each statement line is matched to a provider batch by amount and reference. Unmatched lines become exceptions.',
      fields: [
        { key: 'account', label: 'Bank account', kind: 'choice', options: d.bankAccounts },
        { key: 'batch', label: 'Batch to match', kind: 'choice', options: pending.length ? pending.map((b) => b.id) : ['No unmatched batches'] },
        { key: 'amount', label: 'Deposit on the statement (UGX)', kind: 'number', placeholder: '9250000' },
      ],
      confirm: 'Upload & Match',
      onSubmit: (v) => {
        const b = pending.find((x) => x.id === v.batch);
        if (!b) return 'Every batch is already matched.';
        const n = amount(v.amount);
        if (!n) return 'Enter the deposit amount from the statement.';
        const next = matchDeposit(b, n);
        update(next);
        note(`Statement from ${v.account} matched to ${b.id}`);
        toast(`${b.id} ${reconStatus(next) === 'Reconciled' ? 'reconciled' : `matched with a ${ugx(variance(next))} variance`}.`);
        return undefined;
      },
    });
  };
  const sync = () => {
    setSynced(true);
    note('Provider data synced: 6 providers, 24 batches');
    toast('Synced Stripe, Flutterwave, Paystack, MTN MoMo, Airtel Money and Pesapal. 24 batches are current.');
  };
  const live = reconSummary(list);
  const seed = reconSummary(d.batches);
  const t0 = d.settlementTotals;
  const exp = t0.expected;
  const deposits = t0.deposits + live.deposits - seed.deposits;
  const reconciled = t0.reconciled + live.reconciled - seed.reconciled;
  const unreconciled = Math.max(0, t0.unreconciled + live.unreconciled - seed.unreconciled);
  const exceptions = Math.max(0, t0.exceptions + live.exceptions - seed.exceptions);
  const pct = (n: number) => `${((n / exp) * 100).toFixed(1)}%`;
  const stats: readonly Kpi[] = [d.settlementStats[0], { ...d.settlementStats[1], value: ugx(deposits), caption: `${pct(deposits)} of expected` }, { ...d.settlementStats[2], value: ugx(reconciled), caption: pct(reconciled) }, { ...d.settlementStats[3], value: ugx(unreconciled) }, d.settlementStats[4], d.settlementStats[5]];
  const pick = (t: string) => {
    setTab(t);
    setPage(1);
  };
  return { d, list, rows, shown, tab, setTab: pick, provider, setProvider, query, setQuery, page: p, pages, setPage, ask, setAsk, manage, upload, sync, synced, log, stats, reconciled, exp, unreconciled, exceptions, selected, toggle };
}
type U = ReturnType<typeof useSettlements>;

const money = (n: number) => num(n);

function cols(d: D): readonly Column<BatchRow>[] {
  return [
    { label: 'Settlement Batch', width: 118, render: (b) => <Text style={styles.linkCell} numberOfLines={1}>{b.id}</Text> },
    {
      label: 'Provider',
      width: 116,
      render: (b) => (
        <View style={styles.inline}>
          <ProviderBadge name={b.provider} color={d.providerColor[b.provider] ?? '#8792B0'} size={20} />
          <Text style={styles.cellStrong} numberOfLines={1}>
            {b.provider}
          </Text>
        </View>
      ),
    },
    { label: 'Period', width: 92, render: (b) => <Text style={styles.cell} numberOfLines={1}>{b.period}</Text> },
    { label: 'Transactions', width: 70, align: 'center', render: (b) => <Text style={[styles.cell, styles.center]}>{num(b.transactions)}</Text> },
    { label: 'Gross Amount', flex: 1, align: 'right', render: (b) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{money(b.gross)}</Text> },
    { label: 'Provider Fees', width: 74, align: 'right', render: (b) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{money(b.fees)}</Text> },
    { label: 'Refunds', width: 66, align: 'right', render: (b) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{money(b.refunds)}</Text> },
    { label: 'Net (Expected)', flex: 1, align: 'right', render: (b) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{money(expected(b))}</Text> },
    { label: 'Deposit (Actual)', flex: 1, align: 'right', render: (b) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{b.deposit === null ? '—' : money(b.deposit)}</Text> },
    { label: 'Variance', width: 96, align: 'right', render: (b) => <Text style={[styles.cell, styles.right, variance(b) < 0 && styles.red]} numberOfLines={1}>{variance(b) ? `${variance(b) < 0 ? '−' : '+'}${num(Math.abs(variance(b)))}` : '0'}</Text> },
    { label: 'Status', width: 88, align: 'center', render: (b) => <Pill label={reconStatus(b)} tone={STATUS_TONE[reconStatus(b)]} size={10.5} /> },
  ];
}

function Flow({ d, phone = false }: { d: D; phone?: boolean }) {
  const f = d.flow;
  return (
    <FinPanel icon="chart" title="Settlement Flow" style={!phone && styles.flow}>
      <ComboChart
        labels={f.labels}
        bars={[
          { name: 'Expected Settlement', color: '#4F86F7', values: f.expected },
          { name: 'Actual Bank Deposit', color: '#A78BFA', values: f.deposit },
        ]}
        line={{ name: 'Reconciled Value', color: '#22A55A', values: f.reconciled, dots: true }}
        max={600}
        lineMax={600}
        rightAxis={false}
        every={phone ? 2 : 1}
        height={phone ? 190 : 176}
        format={(v) => (v ? `${Math.round(v)}M` : '0')}
      />
      <View style={styles.legend}>
        {(
          [
            ['Expected Settlement', '#4F86F7'],
            ['Actual Bank Deposit', '#A78BFA'],
            ['Reconciled Value', '#22A55A'],
          ] as const
        ).map(([l, c]) => (
          <View key={l} style={styles.inline}>
            <View style={[styles.dot, { backgroundColor: c }]} />
            <Text style={styles.cell}>{l}</Text>
          </View>
        ))}
      </View>
    </FinPanel>
  );
}

function Status({ u, phone = false }: { u: U; phone?: boolean }) {
  const parts = u.d.reconParts;
  const rate = ((u.reconciled / u.exp) * 100).toFixed(1);
  return (
    <FinPanel icon="layers" title="Reconciliation Status" style={!phone && styles.status}>
      <RingLegend phone={phone} size={150} center={`${rate}%`} caption="Reconciled" parts={parts.map((p) => ({ ...p, display: num(p.value) }))} />
      <View style={styles.variance}>
        <Icon name="check" size={16} color={TONES.green.solid} />
        <Text style={[styles.cell, styles.flex]}>Variance (Expected vs Actual):</Text>
        <Text style={styles.cellStrong}>{`${ugx(u.unreconciled)} (${((u.unreconciled / u.exp) * 100).toFixed(1)}%)`}</Text>
      </View>
    </FinPanel>
  );
}

function Progress({ u }: { u: U }) {
  const t = u.d.settlementTotals;
  return (
    <FinPanel icon="clipboard" title="Reconciliation Progress">
      <CheckList
        items={[
          { mark: 'ok', text: 'Imported provider settlements', right: u.synced ? '✓ 6 providers · just now' : '✓ 6 providers', rightTone: 'green' },
          { mark: 'ok', text: 'Uploaded bank deposits', right: '✓ 3 bank accounts', rightTone: 'green' },
          { mark: 'ok', text: 'Auto-matched transactions', right: `✓ ${num(t.autoMatched)} (${t.matchedPct}%)`, rightTone: 'green' },
          { mark: u.exceptions ? 'warn' : 'ok', text: 'Exceptions to review', right: `${u.exceptions} (${((u.exceptions / t.autoMatched) * 100).toFixed(1)}%)` },
        ]}
      />
      <PrimaryBtn label="Review Exceptions" icon="arrowRight" onPress={() => u.setTab('Differences & Exceptions')} />
    </FinPanel>
  );
}

function Differences({ u }: { u: U }) {
  const icons: Readonly<Record<string, IconName>> = { building: 'building', undo: 'undo', help: 'help' };
  return (
    <FinPanel icon="alert" title="Top Settlement Differences" onAll={() => u.setTab('Differences & Exceptions')}>
      {u.d.topDifferences.map((x, i) => (
        <View key={`${x.label}-${i}`} style={styles.diff}>
          <Icon name={icons[x.icon]} size={17} color={BLUE} />
          <Text style={[styles.td, styles.flex]}>{x.label}</Text>
          <Text style={[styles.td, styles.red, styles.bold]}>{ugx(x.amount)}</Text>
        </View>
      ))}
      {u.log.slice(0, 3).map((l) => (
        <Text key={l} style={styles.cell}>
          {l}
        </Text>
      ))}
    </FinPanel>
  );
}

function Breakdown({ u, phone = false }: { u: U; phone?: boolean }) {
  return (
    <FinPanel icon="poll" title="Settlement Breakdown (This Month)">
      <RingLegend phone={phone} size={150} center="UGX 4.86B" caption="Settlements" parts={u.d.breakdown.map((b) => ({ label: b.label, value: b.pct, color: b.color }))} />
    </FinPanel>
  );
}

function ProviderChips({ u }: { u: U }) {
  const chips = [{ label: 'All Providers', count: u.d.settlementTotals.batches }, ...u.d.providerCounts];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.chips}>
        {chips.map((c) => {
          const on = u.provider === c.label;
          return (
            <Pressable key={c.label} style={[styles.chip, on && styles.chipOn]} onPress={() => u.setProvider(c.label)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={`${c.label}, ${c.count}`}>
              {c.label !== 'All Providers' ? <ProviderBadge name={c.label} color={u.d.providerColor[c.label] ?? '#8792B0'} size={20} /> : null}
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{`${c.label} (${c.count})`}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

/** Maple Command › Finance › Settlement Reconciliation on the desktop reference. */
export function SettlementsDesk({ c }: { c: CommandData }) {
  const u = useSettlements(c.platformFinance.payments);
  const [range, setRange] = useState(RANGES[0]);
  return (
    <FinDesk c={c} sub="Settlements" search="Search settlements, batch ID, provider, reference or amount..." promo={PROMO}>
      <FinHead
        icon="layers"
        title="Settlement Reconciliation"
        subtitle="Match provider transactions, fees, refunds, chargebacks, payout batches and bank deposits."
        right={
          <>
            <RangeBox value={range} options={RANGES} onChange={setRange} width={220} />
            <OutlineBtn label="Sync Provider Data" icon="sync" onPress={u.sync} />
            <OutlineBtn label="Upload Bank Statement" icon="upload" onPress={u.upload} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <Flow d={u.d} />
        <Status u={u} />
        <View style={styles.side}>
          <Progress u={u} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={[styles.tableCard, styles.flex]}>
          <ProviderChips u={u} />
          <FinPanel icon="people" title={`Settlement Batches (${u.d.settlementTotals.batches})`} right={<Search placeholder="Search by batch ID, provider or reference..." value={u.query} onChange={u.setQuery} style={styles.search} />} style={styles.plain}>
            <DataTable columns={cols(u.d)} rows={u.rows} rowKey={(b) => b.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.manage} onRowPress={u.manage} />
            <PageStrip label={`Showing 1 – ${u.rows.length} of ${u.d.settlementTotals.batches} settlement batches`} page={u.page} pages={u.pages} onPage={u.setPage} />
          </FinPanel>
        </View>
        <View style={styles.side}>
          <Differences u={u} />
          <Breakdown u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: tiles, reconciliation status and progress, the chart and batch cards. */
export function SettlementsPhone({ c }: { c: CommandData }) {
  const u = useSettlements(c.platformFinance.payments);
  return (
    <FinPhone c={c} title="Settlements" subtitle="Match provider batches, fees, refunds and bank deposits.">
      <FinStats items={u.stats} phone title="Settlement Metrics" />
      <View style={styles.inline}>
        <PrimaryBtn label="Upload Statement" icon="upload" onPress={u.upload} style={styles.flex} />
        <OutlineBtn label="Sync" icon="sync" onPress={u.sync} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <Status u={u} phone />
      <Progress u={u} />
      <Flow d={u.d} phone />
      <ProviderChips u={u} />
      {u.rows.map((b) => (
        <PhoneRow
          key={b.id}
          lead={<ProviderBadge name={b.provider} color={u.d.providerColor[b.provider] ?? '#8792B0'} size={36} />}
          title={b.id}
          sub={`${b.provider} • ${b.period} • expected ${ugx(expected(b))}${variance(b) ? ` • variance ${ugx(variance(b))}` : ''}`}
          pill={<Pill label={reconStatus(b)} tone={STATUS_TONE[reconStatus(b)]} size={11} />}
          onPress={() => u.manage(b)}
        />
      ))}
      <Differences u={u} />
      <Breakdown u={u} phone />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stack: { gap: 12 },
  side: { width: 340, gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  flow: { flex: 1.1 },
  status: { flex: 1 },
  tableCard: { gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  plain: { padding: 0, borderWidth: 0 },
  search: { width: 300 },
  cell: { fontSize: 10.5, color: BODY },
  cellStrong: { flexShrink: 1, fontSize: 11.5, fontWeight: '700', color: NAVY },
  linkCell: { fontSize: 11, fontWeight: '600', color: BLUE },
  td: { fontSize: 12.5, color: NAVY },
  bold: { fontWeight: '800' },
  red: { color: RED },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  variance: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  diff: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 7, height: 36, paddingHorizontal: 14, borderRadius: 9, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  chipOn: { borderColor: BLUE, backgroundColor: BLUE },
  chipText: { fontSize: 13, fontWeight: '600', color: NAVY },
  chipTextOn: { color: WHITE },
});
