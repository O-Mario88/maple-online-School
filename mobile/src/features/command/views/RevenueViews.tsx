import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ComboChart } from '@/features/command/kit/CmdCharts';
import { CmdSelect, CmdStat, CountTabs, KpiGrid, OutlineBtn, PageStrip, Panel, PrimaryBtn, RangeBox, exportMenu } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone, LivePill } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { CHART } from '@/features/command/kit/tokens';
import { reconcile, summarise } from '@/features/command/logic/finance';
import { Card, IconTile, Pill } from '@/features/portal/PortalParts';
import { BODY, LINE, NAVY, type Tone, WHITE } from '@/features/portal/tokens';
import { Donut, DonutLabel } from '@/features/school/kit/Charts';
import { Cell, type Column, DataTable, PageHead, Search, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { BatchRow, Provider } from '@/mock/command-center/finance';
import { Maple } from '@/constants/maple';

type F = CommandData['finance'];
const PER_PAGE = 10;
const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString('en-US')}`;

const PROVIDER: Readonly<Record<Provider, { bg: string; fg: string; mark: string }>> = {
  Stripe: { bg: Maple.blue, fg: WHITE, mark: 'stripe' },
  Flutterwave: { bg: Maple.warningSoft, fg: Maple.warning, mark: 'FW' },
  Paystack: { bg: '#0BA4DB', fg: WHITE, mark: '≡' },
  'MTN MoMo': { bg: Maple.warning, fg: Maple.navy, mark: 'MTN' },
  'Airtel Money': { bg: Maple.error, fg: WHITE, mark: 'a' },
};

const STATUS_TONE: Readonly<Record<BatchRow['status'], Tone>> = { Settled: 'green', Settling: 'orange', Mismatch: 'red' };

function ProviderCell({ p }: { p: Provider }) {
  const s = PROVIDER[p];
  return (
    <View style={styles.inline}>
      <View style={[styles.providerMark, { backgroundColor: s.bg }]}>
        <Text style={[styles.providerMarkText, { color: s.fg }]}>{s.mark}</Text>
      </View>
      <Cell small>{p}</Cell>
    </View>
  );
}

function useRevenue(f: F) {
  const [list, setList] = useState<readonly BatchRow[]>(f.batches);
  const [tab, setTab] = useState(f.revenueTabs[0]);
  const [query, setQuery] = useState('');
  const [provider, setProvider, providers] = useChoice(['All Providers', 'Stripe', 'Flutterwave', 'Paystack', 'MTN MoMo', 'Airtel Money']);
  const [status, setStatus, statuses] = useChoice(['All Statuses', 'Settled', 'Settling', 'Mismatch']);
  const [page, setPage] = useState(1);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((b) => (provider === 'All Providers' || b.provider === provider) && (status === 'All Statuses' || b.status === status) && (!q || `${b.id} ${b.provider}`.toLowerCase().includes(q)));
  }, [list, query, provider, status]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const check = (b: BatchRow) => {
    const r = reconcile(b);
    setList((prev) => prev.map((x) => (x.id === b.id ? r.batch : x)));
    toast(r.balanced ? `${b.id} balances: ${ugx(b.gross - b.fees)} = escrow + Maple revenue. Marked Settled.` : `${b.id} is off by ${ugx(Math.abs(r.diff))}. Held as a mismatch for the finance team.`);
  };
  const reconcileLatest = () => {
    const next = list.find((b) => b.status === 'Settling');
    if (!next) return toast('Every batch is reconciled.');
    check(next);
  };
  const settling = list.filter((b) => b.status === 'Settling').length;
  const mismatches = list.filter((b) => b.status === 'Mismatch').length;
  const search = (q: string) => {
    setPage(1);
    setQuery(q);
  };
  return { list, rows, shown, tab, setTab, query, setQuery: search, provider, setProvider, providers, status, setStatus, statuses, page: p, pages, setPage, selected, toggle, check, reconcileLatest, settling, mismatches };
}
type U = ReturnType<typeof useRevenue>;

function batchCols(u: U): readonly Column<BatchRow>[] {
  return [
    { label: '#', width: 26, render: (b) => <Cell small>{b.n}</Cell> },
    { label: 'Batch ID', width: 128, render: (b) => <Cell small>{b.id}</Cell> },
    { label: 'Provider', width: 112, render: (b) => <ProviderCell p={b.provider} /> },
    { label: 'Settlement Date', width: 86, render: (b) => <Cell small>{b.date}</Cell> },
    { label: 'Txns', width: 50, align: 'center', render: (b) => <Cell small>{b.txns.toLocaleString('en-US')}</Cell> },
    { label: 'Gross (UGX)', flex: 1, align: 'right', render: (b) => <Cell small>{b.gross.toLocaleString('en-US')}</Cell> },
    { label: 'Fees (UGX)', flex: 0.85, align: 'right', render: (b) => <Cell small>{b.fees.toLocaleString('en-US')}</Cell> },
    { label: 'Escrow (UGX)', flex: 1, align: 'right', render: (b) => <Cell small>{b.escrow.toLocaleString('en-US')}</Cell> },
    { label: 'Maple (UGX)', flex: 1, align: 'right', render: (b) => <Cell small strong>{b.maple.toLocaleString('en-US')}</Cell> },
    { label: 'Status', width: 92, align: 'center', render: (b) => <Pill label={b.status} tone={STATUS_TONE[b.status]} icon={b.status === 'Settled' ? 'check' : b.status === 'Mismatch' ? 'alert' : 'clock'} size={11} /> },
  ];
}

/** The other ledger tabs, computed from the batches. */
function OtherTab({ u, f }: { u: U; f: F }) {
  if (u.tab === 'Teacher Payouts') {
    return (
      <View style={styles.other}>
        <Text style={styles.body}>Teacher payouts are approved and disbursed on their own page, with dual approval for large amounts.</Text>
        <PrimaryBtn label="Open Payout Approvals" onPress={() => router.push('/command/finance/payouts' as never)} />
      </View>
    );
  }
  const byProvider = (['Stripe', 'Flutterwave', 'Paystack', 'MTN MoMo', 'Airtel Money'] as const).map((p) => {
    const list = u.list.filter((b) => b.provider === p);
    return { p, ...summarise(list), count: list.length };
  });
  const rows =
    u.tab === 'Platform Fees'
      ? byProvider.map((x) => [x.p, `${x.count} batches`, ugx(x.fees), `${((x.fees / x.gross) * 100).toFixed(1)}% of gross`])
      : u.tab === 'Escrow & Teacher Liabilities'
        ? byProvider.map((x) => [x.p, `${x.count} batches`, ugx(x.escrow), 'Held until teacher payout'])
        : u.tab === 'Maple Revenue Ledger'
          ? u.list.slice(0, 8).map((b) => [b.date, b.id, ugx(b.maple), b.status])
          : byProvider.map((x) => [x.p, `${x.count} batches`, ugx(x.gross), `${f.october.marketplaceTxns.toLocaleString('en-US')} marketplace txns this month`]);
  return (
    <View style={styles.other}>
      {rows.map((r) => (
        <View key={r.join('|')} style={styles.otherRow}>
          {r.map((cell, i) => (
            <Text key={i} style={[styles.otherCell, i === 2 && styles.strong]} numberOfLines={1}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function Breakdown({ f, phone = false }: { f: F; phone?: boolean }) {
  const b = f.breakdown;
  const [win, setWin, wins] = useChoice(['Last 6 Months', 'Last 12 Months']);
  const series = [
    { name: 'Teacher Escrow', color: CHART.blue, values: b.escrow },
    { name: 'Maple Commission', color: CHART.green, values: b.maple },
    { name: 'Payment Fees', color: CHART.orange, values: b.fees },
    { name: 'BYOS (0%)', color: Maple.borderStrong, values: b.byos },
  ];
  return (
    <Panel title="Revenue Breakdown" right={<CmdSelect value={win} options={wins} onChange={setWin} width={128} label="Window" />} style={[styles.block, !phone && styles.flex]}>
      <ComboChart labels={b.months} bars={series} mode="stacked" max={2.5} ticks={5} height={phone ? 170 : 160} format={(v) => (v >= 1 ? `${v.toFixed(1)}B` : v ? `${Math.round(v * 1000)}M` : '0')} />
      <Legend items={series.map((s) => [s.name, s.color])} />
    </Panel>
  );
}

function Legend({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <View style={styles.legendRow}>
      {items.map(([l, c]) => (
        <View key={l} style={styles.inline}>
          <View style={[styles.sq, { backgroundColor: c }]} />
          <Text style={styles.legendText}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

function Methods({ f, phone = false }: { f: F; phone?: boolean }) {
  return (
    <Panel title="Payment Methods" style={[styles.block, !phone && styles.flex]}>
      <View style={styles.methods}>
        <Donut slices={f.methods.map((m) => ({ value: m.pct, color: m.color }))} size={phone ? 150 : 168} stroke={26}>
          <DonutLabel value="UGX 2.48B" caption="Total GMV" size={phone ? 17 : 19} />
        </Donut>
        <View style={styles.flex}>
          {f.methods.map((m) => (
            <View key={m.label} style={styles.methodRow}>
              <View style={[styles.dot, { backgroundColor: m.color }]} />
              <Text style={[styles.methodLabel, styles.flex]}>{m.label}</Text>
              <Text style={styles.methodPct}>{`${m.pct}%`}</Text>
            </View>
          ))}
        </View>
      </View>
    </Panel>
  );
}

function MarketVsByos({ f, phone = false }: { f: F; phone?: boolean }) {
  const m = f.marketVsByos;
  const [win, setWin, wins] = useChoice(['Last 6 Months', 'Last 12 Months']);
  return (
    <Panel title="Marketplace vs. BYOS" right={<CmdSelect value={win} options={wins} onChange={setWin} width={128} label="Window" />} style={[styles.block, !phone && styles.flex]}>
      <ComboChart
        labels={m.months}
        bars={[
          { name: 'Marketplace GMV', color: CHART.blue, values: m.market },
          { name: 'BYOS GMV (0%)', color: Maple.blueLine, values: m.byos },
        ]}
        max={2}
        ticks={4}
        line={{ name: 'Commission %', color: CHART.green, values: m.commission }}
        lineMax={100}
        height={phone ? 170 : 160}
        barWidth={22}
        format={(v) => (v >= 1 ? `${v.toFixed(1)}B` : v ? `${Math.round(v * 1000)}M` : '0')}
      />
      <Legend
        items={[
          ['Marketplace GMV', CHART.blue],
          ['BYOS GMV (0%)', Maple.blueLine],
          ['Commission %', CHART.green],
        ]}
      />
    </Panel>
  );
}

function SidePanels({ f, u }: { f: F; u: U }) {
  const o = f.october;
  const net = o.gross - o.fees - o.escrow;
  const sumRows: readonly [string, string, 'wallet' | 'receipt' | 'shield' | 'chart', Tone, boolean][] = [
    ['Gross Merchandise Value (GMV)', ugx(o.gross), 'wallet', 'blue', false],
    ['Payment Processing Fees', `- ${ugx(o.fees)}`, 'receipt', 'red', false],
    ['Teacher Escrow Liability', `- ${ugx(o.escrow)}`, 'shield', 'orange', false],
    ['Maple Net Revenue', ugx(net), 'chart', 'blue', true],
  ];
  const [period, setPeriod, periods] = useChoice(['This Month', 'Last Month']);
  return (
    <>
      <Panel title="Revenue Summary (Oct 2026)" onAll={() => toast('Monthly statement with each batch, fee and escrow movement.')} allLabel="Details" style={styles.block}>
        {sumRows.map(([l, v, icon, tone, strong]) => (
          <View key={l} style={styles.sumRow}>
            <IconTile icon={icon} tone={tone} size={26} radius={7} iconSize={14} />
            <Text style={[styles.sumLabel, strong && styles.strong]}>{l}</Text>
            <Text style={[styles.sumValue, strong && styles.strong]}>{v}</Text>
          </View>
        ))}
      </Panel>
      <Panel title="Commission Breakdown" right={<CmdSelect value={period} options={periods} onChange={setPeriod} width={114} label="Period" />} style={styles.block}>
        {(
          [
            ['Marketplace Commission (Avg.)', `${o.commissionRate}%`, 'percent', 'blue'],
            ['Marketplace Revenue', ugx(net), 'percent', 'orange'],
            ['BYOS Revenue (0%)', 'UGX 0', 'cap', 'green'],
            ['Number of Marketplace Transactions', o.marketplaceTxns.toLocaleString('en-US'), 'doc', 'blue'],
            ['Number of BYOS Transactions', o.byosTxns.toLocaleString('en-US'), 'doc', 'grey'],
          ] as const
        ).map(([l, v, icon, tone]) => (
          <View key={l} style={styles.sumRow}>
            <IconTile icon={icon} tone={tone} size={26} radius={7} iconSize={14} />
            <Text style={styles.sumLabel}>{l}</Text>
            <Text style={styles.sumValue}>{v}</Text>
          </View>
        ))}
      </Panel>
      <Panel title="Quick Actions" style={styles.block}>
        <View style={styles.quick}>
          <PrimaryBtn label="Reconcile Latest Batch" onPress={u.reconcileLatest} style={styles.quickBtn} />
          <OutlineBtn label="Export Ledger (CSV)" onPress={() => exportMenu('Revenue ledger')} style={styles.quickBtn} />
          <OutlineBtn label="Generate Payout Report" onPress={() => toast('Payout report for October queued; you will get a signed PDF in a minute.')} style={styles.quickBtn} />
          <OutlineBtn label="View Tax Report" onPress={() => toast('VAT and withholding tax on commission, by country, for October.')} style={styles.quickBtn} />
        </View>
        {u.settling || u.mismatches ? <Text style={styles.note}>{`${u.settling} settling, ${u.mismatches} mismatched batch${u.mismatches === 1 ? '' : 'es'}.`}</Text> : null}
      </Panel>
    </>
  );
}

/** Maple Command › Platform Revenue, Escrow & Commission Ledger on the desktop reference. */
export function RevenueDesk({ c }: { c: CommandData }) {
  const f = c.finance;
  const u = useRevenue(f);
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search transactions, schools, teachers, or reference numbers..." active="Finance" sub="Revenue & Escrow">
      <CmdHead
        icon="database"
        title="Platform Revenue, Escrow & Commission Ledger"
        subtitle="Reconcile payment settlement batches, track escrowed teacher liabilities, and monitor Maple net revenue."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <LivePill />
            <PrimaryBtn label="Export" chevron onPress={() => exportMenu('Revenue')} />
            <OutlineBtn icon="sync" onPress={() => toast('Settlement feeds refreshed from Stripe, Flutterwave, Paystack and MoMo.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {f.revenueStats.map((k) => (
          <CmdStat key={k.label} k={k.label === 'Marketplace Commission' ? { ...k, delta: `${f.october.commissionRate}%`, good: true } : k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <Breakdown f={f} />
        <Methods f={f} />
        <MarketVsByos f={f} />
      </View>
      <View style={styles.row}>
        <Card style={[styles.tableCard, styles.flex]}>
          <CountTabs tabs={f.revenueTabs.map((label) => ({ label }))} active={u.tab} onChange={u.setTab} size={13} dense style={styles.noWrap} />
          {u.tab === 'Settlement Batches' ? (
            <>
              <View style={styles.inline}>
                <Search placeholder="Search by batch ID, provider, or reference..." value={u.query} onChange={u.setQuery} style={styles.flex} />
                <CmdSelect value={u.provider} options={u.providers} onChange={u.setProvider} width={150} label="Provider" />
                <CmdSelect value={u.status} options={u.statuses} onChange={u.setStatus} width={150} label="Status" />
                <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
              </View>
              <DataTable columns={batchCols(u)} rows={u.rows} rowKey={(b) => b.id} check selected={u.selected} onToggle={u.toggle} menu onMenu={u.check} compact />
              <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} batches`} page={u.page} pages={u.pages} onPage={u.setPage} />
            </>
          ) : (
            <OtherTab u={u} f={f} />
          )}
        </Card>
        <View style={styles.side}>
          <SidePanels f={f} u={u} />
        </View>
      </View>
    </CommandDesk>
  );
}

/** The phone version: totals, charts stacked, the batches as cards. */
export function RevenuePhone({ c }: { c: CommandData }) {
  const f = c.finance;
  const u = useRevenue(f);
  return (
    <CommandPhone me={c.me}>
      <PageHead title="Revenue & Escrow" subtitle="Settlement batches, teacher escrow and Maple net revenue." phone />
      <KpiGrid items={f.revenueStats} />
      <Breakdown f={f} phone />
      <Methods f={f} phone />
      <MarketVsByos f={f} phone />
      <SidePanels f={f} u={u} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={f.revenueTabs.map((label) => ({ label }))} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      {u.tab === 'Settlement Batches' ? (
        <>
          <Search placeholder="Search batches" value={u.query} onChange={u.setQuery} />
          {u.rows.map((b) => (
            <View key={b.id} style={styles.card}>
              <View style={styles.inline}>
                <ProviderCell p={b.provider} />
                <Pill label={b.status} tone={STATUS_TONE[b.status]} size={11.5} />
              </View>
              <Text style={styles.cardTitle}>{b.id}</Text>
              <Text style={styles.small}>{`${b.date} • ${b.txns.toLocaleString('en-US')} transactions`}</Text>
              <View style={styles.cardNums}>
                <Text style={styles.small}>{`Gross ${ugx(b.gross)}`}</Text>
                <Text style={styles.small}>{`Escrow ${ugx(b.escrow)}`}</Text>
                <Text style={[styles.small, styles.strong]}>{`Maple ${ugx(b.maple)}`}</Text>
              </View>
              {b.status !== 'Settled' ? <OutlineBtn label="Reconcile" small onPress={() => u.check(b)} /> : null}
            </View>
          ))}
          <PageStrip label={`${u.shown.length} batches`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </>
      ) : (
        <Card style={styles.tableCard}>
          <OtherTab u={u} f={f} />
        </Card>
      )}
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  block: { gap: 10 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  noWrap: { flexWrap: 'nowrap' },
  small: { fontSize: 11.5, color: BODY },
  body: { fontSize: 13, color: BODY },
  strong: { fontWeight: '700', color: NAVY },
  note: { fontSize: 12, color: BODY },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  legendText: { fontSize: 11.5, color: NAVY },
  sq: { width: 11, height: 11, borderRadius: 2 },
  dot: { width: 11, height: 11, borderRadius: 6 },
  methods: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 6 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  methodLabel: { fontSize: 12.5, color: NAVY },
  methodPct: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  tableCard: { gap: 10, padding: 12 },
  providerMark: { minWidth: 20, height: 18, paddingHorizontal: 3, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  providerMarkText: { fontSize: 8.5, fontWeight: '800' },
  side: { width: 326, gap: 14 },
  sumRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  sumLabel: { flex: 1, minWidth: 0, fontSize: 12, color: NAVY },
  sumValue: { fontSize: 12, color: NAVY },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickBtn: { width: '48.5%', height: 36, paddingHorizontal: 6 },
  other: { gap: 8 },
  otherRow: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: LINE },
  otherCell: { flex: 1, minWidth: 0, fontSize: 12.5, color: BODY },
  card: { gap: 6, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cardTitle: { fontSize: 14, fontWeight: '700', color: NAVY },
  cardNums: { gap: 2 },
});

