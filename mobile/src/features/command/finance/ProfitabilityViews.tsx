import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, RangeBox } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { segmentTable, type Totals, unitEconomics } from '@/features/command/logic/profitability';
import { profitAndLoss } from '@/features/command/logic/reports';
import { BLUE, BODY, LINE, NAVY, RED, TONES, WHITE } from '@/features/portal/tokens';
import { accountBalance } from '@/features/school/accounting/books';
import { toast } from '@/lib/toast';

import { CheckList, FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, type Mark, num, type Promo, RingLegend, ugx } from './FinKit';
import { Maple } from '@/constants/maple';

type C = CommandData['platformFinance'];
type Dim = keyof C['ops']['dimensions'];
const DIMS: readonly Dim[] = ['By Region', 'By Curriculum', 'By Subscription Plan', 'By Channel'];
const TABS = ['Overview', ...DIMS, 'By Subject', 'Unit Economics', 'Cost Breakdown'] as const;
const RING = [Maple.blue, Maple.successText, Maple.warning, Maple.blue, Maple.error, Maple.faint] as const;
const PROMO: Promo = { icon: 'chart', color: Maple.blue, title: 'Unit Economics & Profitability', body: 'Profitability by region, curriculum, subject, plan and channel.' };
const PERIODS = ['Jan 1 – Oct 31, 2026 (YTD)'];
const pct = (n: number) => `${n.toFixed(1)}%`;
/** Table money in millions, so seven columns fit. */
const mn = (n: number) => `${(n / 1e6).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M`;

function useProfit(c: C) {
  const L = c.ledger;
  const O = c.ops;
  const [tab, setTab] = useState<string>(TABS[0]);
  const [dim, setDim] = useState<Dim>('By Region');
  const bal = (code: string) => accountBalance(code, L.entries, L.accounts);
  const pl = profitAndLoss(L.accounts, L.entries);
  // Direct delivery: cost of sales plus the cloud, LiveKit, storage and AI accounts. Acquisition: marketing. The rest is shared overhead.
  const direct = pl.costOfSales + bal('6200') + bal('6210');
  const acquisition = bal('6300');
  const overhead = pl.operatingExpenses - bal('6200') - bal('6210') - acquisition;
  const totals: Totals = { revenue: pl.revenue, direct, acquisition, overhead, learners: O.learners.paying, newLearners: O.learners.newYtd, monthlyChurn: O.learners.monthlyChurn, months: O.learners.months };
  const gross = pl.revenue - direct;
  const contribution = gross - acquisition;
  const operating = contribution - overhead;
  const ue = unitEconomics(totals);
  const rows = (d: Dim) => segmentTable(totals, O.dimensions[d]);
  const shared = (acquisition + overhead) / pl.revenue;
  const courses = O.courses.map((x) => ({ ...x, margin: ((x.revenue * (1 - x.directRatio) - x.revenue * shared) / x.revenue) * 100 })).sort((a, b) => b.margin - a.margin);
  const costLines = O.costSplit.flatMap((s) => s.parts);
  const splitOk = O.costSplit.every((s) => s.parts.reduce((a, p) => a + p.amount, 0) === bal(s.account));
  const pick = (t: string) => {
    setTab(t);
    if ((DIMS as readonly string[]).includes(t)) setDim(t as Dim);
  };
  const exportAll = () => toast(`Profitability pack exported: ${DIMS.length} dimensions, subjects, unit economics and cost structure (XLSX). Shared costs allocated by revenue share.`);

  const stats: readonly Kpi[] = [
    { label: 'Total Revenue (YTD)', value: ugx(pl.revenue), caption: 'excl. interest', icon: 'layers', tone: 'green' },
    { label: 'Total Direct Costs', value: ugx(direct), icon: 'database', tone: 'orange', valueTone: 'red' },
    { label: 'Gross Profit', value: ugx(gross), caption: `Margin ${pct((gross / pl.revenue) * 100)}`, icon: 'layers', tone: 'purple' },
    { label: 'Operating Profit', value: ugx(operating), caption: `Margin ${pct((operating / pl.revenue) * 100)}`, icon: 'chart', tone: 'blue' },
    { label: 'Contribution per Learner', value: `UGX ${num(contribution / O.learners.paying)}`, icon: 'check', tone: 'green' },
    { label: 'Paying Learners', value: num(O.learners.paying), caption: `${num(O.learners.newYtd)} new this year`, icon: 'people', tone: 'blue' },
  ];
  const regions = rows('By Region');
  const curricula = rows('By Curriculum');
  const plans = rows('By Subscription Plan');
  const best = <T extends { name: string; operatingMargin: number }>(xs: readonly T[]) => [...xs].sort((a, b) => b.operatingMargin - a.operatingMargin)[0];
  const worst = <T extends { name: string; operatingMargin: number }>(xs: readonly T[]) => [...xs].sort((a, b) => a.operatingMargin - b.operatingMargin)[0];
  const infraShare = ((bal('6200') + bal('6210')) / pl.revenue) * 100;
  const insights: readonly { mark: Mark; text: string }[] = [
    { mark: 'ok', text: `Operating margin ${pct((operating / pl.revenue) * 100)}; gross margin ${pct((gross / pl.revenue) * 100)}; contribution ${pct((contribution / pl.revenue) * 100)}.` },
    { mark: 'ok', text: `Highest margin by curriculum: ${best(curricula).name} (${pct(best(curricula).operatingMargin)}).` },
    { mark: infraShare > 6 ? 'warn' : 'ok', text: `Cloud, LiveKit, storage and AI are ${pct(infraShare)} of revenue. Optimise usage.` },
    { mark: 'ok', text: `${best(plans).name} has the highest plan margin (${pct(best(plans).operatingMargin)}). Grow uptake.` },
    { mark: 'info', text: `Lowest regional margin: ${worst(regions).name} (${pct(worst(regions).operatingMargin)}). LTV:CAC ${ue.ltvToCac}x, payback ${ue.paybackMonths} months.` },
  ];
  return { L, O, tab, setTab: pick, dim, setDim, totals, pl, direct, acquisition, overhead, gross, contribution, operating, ue, rows, courses, costLines, splitOk, stats, insights, exportAll };
}
type U = ReturnType<typeof useProfit>;

function Trend({ u, phone = false }: { u: U; phone?: boolean }) {
  const f = u.O.profitTrend;
  const share = (u.acquisition + u.overhead) / u.pl.revenue;
  const op = f.revenue.map((v, i) => Math.round(v - f.direct[i] - v * share));
  return (
    <FinPanel icon="chart" title="Revenue, Cost & Profit Trend" style={!phone && styles.flex}>
      <ComboChart
        labels={f.labels}
        bars={[
          { name: 'Revenue', color: Maple.blue, values: f.revenue },
          { name: 'Direct Costs', color: Maple.blueLine, values: f.direct },
        ]}
        line={{ name: 'Operating Profit', color: Maple.successText, values: op, dots: true }}
        max={1200}
        lineMax={1200}
        rightAxis={false}
        every={phone ? 2 : 1}
        height={phone ? 190 : 156}
        format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}B` : v ? `${Math.round(v)}M` : '0')}
      />
      <View style={styles.legend}>
        {(
          [
            ['Revenue', Maple.blue],
            ['Direct Costs', Maple.blueLine],
            ['Operating Profit', Maple.successText],
          ] as const
        ).map(([l, col]) => (
          <View key={l} style={styles.inline}>
            <View style={[styles.dot, { backgroundColor: col }]} />
            <Text style={styles.cell}>{l}</Text>
          </View>
        ))}
      </View>
    </FinPanel>
  );
}

function ByCurriculum({ u, phone = false }: { u: U; phone?: boolean }) {
  const rows = u.rows('By Curriculum');
  return (
    <FinPanel icon="poll" title="Revenue by Curriculum" style={!phone && styles.flex}>
      <RingLegend phone={phone} size={150} center={`UGX ${(u.pl.revenue / 1e9).toFixed(2)}B`} caption="Total Revenue" parts={rows.map((r, i) => ({ label: r.name, value: r.revenue, color: RING[i % RING.length] }))} />
    </FinPanel>
  );
}

function CostStructure({ u }: { u: U }) {
  return (
    <FinPanel icon="layers" title="Platform Cost Structure (YTD)">
      <View style={[styles.cRow, styles.cHead]}>
        <Text style={[styles.th, styles.flex]}>Cost Category</Text>
        <Text style={[styles.th, styles.cAmt]}>Amount (UGX)</Text>
        <Text style={[styles.th, styles.cPct]}>% of Rev.</Text>
      </View>
      {u.costLines.map((x) => (
        <View key={x.name} style={styles.cRow}>
          <Icon name={x.icon} size={15} color={BLUE} />
          <Text style={[styles.td, styles.flex]} numberOfLines={2}>{x.name}</Text>
          <Text style={[styles.td, styles.cAmt]}>{num(x.amount)}</Text>
          <Text style={[styles.td, styles.cPct]}>{pct((x.amount / u.pl.revenue) * 100)}</Text>
        </View>
      ))}
      <View style={[styles.cRow, styles.cTotal]}>
        <Text style={[styles.tdStrong, styles.flex]}>{u.splitOk ? 'Total Direct Costs (ties to ledger)' : 'Total Direct Costs – does not tie to ledger'}</Text>
        <Text style={[styles.tdStrong, styles.cAmt]}>{num(u.direct)}</Text>
        <Text style={[styles.tdStrong, styles.cPct]}>{pct((u.direct / u.pl.revenue) * 100)}</Text>
      </View>
    </FinPanel>
  );
}

function Dimension({ u }: { u: U }) {
  const rows = u.rows(u.dim);
  const sum = (k: 'revenue' | 'direct' | 'grossProfit' | 'contribution' | 'operatingProfit') => rows.reduce((s, r) => s + r[k], 0);
  const cell = (v: string, w: object, bold = false, red = false) => <Text style={[styles.dNum, w, bold && styles.bold, red && styles.red]}>{v}</Text>;
  return (
    <FinPanel icon="grid" title="Profitability by Dimension">
      <View style={styles.dimTabs}>
        {DIMS.map((d) => (
          <Pressable key={d} style={[styles.dimTab, d === u.dim && styles.dimTabOn]} onPress={() => u.setDim(d)} accessibilityRole="tab" accessibilityState={{ selected: d === u.dim }}>
            <Text style={[styles.dimText, d === u.dim && styles.dimTextOn]}>{d.replace('By ', '').replace('Subscription ', '')}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.dRow, styles.cHead]}>
        <Text style={[styles.th, styles.dName]}>{u.dim.replace('By ', '')}</Text>
        {['Revenue', 'Direct', 'Gross Profit', 'GM %', 'Contribution', 'Op. Profit', 'OM %'].map((h, i) => (
          <Text key={h} style={[styles.th, styles.dNum, i === 3 || i === 6 ? styles.dPct : styles.dMoney]}>{h}</Text>
        ))}
      </View>
      {rows.map((r) => (
        <View key={r.name} style={styles.dRow}>
          <Text style={[styles.td, styles.dName]} numberOfLines={1}>{r.name}</Text>
          {cell(mn(r.revenue), styles.dMoney)}
          {cell(mn(r.direct), styles.dMoney)}
          {cell(mn(r.grossProfit), styles.dMoney)}
          {cell(pct(r.grossMargin), styles.dPct)}
          {cell(mn(r.contribution), styles.dMoney)}
          {cell(mn(r.operatingProfit), styles.dMoney, false, r.operatingProfit < 0)}
          {cell(pct(r.operatingMargin), styles.dPct, false, r.operatingMargin < 0)}
        </View>
      ))}
      <View style={[styles.dRow, styles.cTotalGreen]}>
        <Text style={[styles.tdStrong, styles.dName]}>Total Platform</Text>
        {cell(mn(sum('revenue')), styles.dMoney, true)}
        {cell(mn(sum('direct')), styles.dMoney, true)}
        {cell(mn(sum('grossProfit')), styles.dMoney, true)}
        {cell(pct((sum('grossProfit') / sum('revenue')) * 100), styles.dPct, true)}
        {cell(mn(sum('contribution')), styles.dMoney, true)}
        {cell(mn(sum('operatingProfit')), styles.dMoney, true)}
        {cell(pct((sum('operatingProfit') / sum('revenue')) * 100), styles.dPct, true)}
      </View>
      <Text style={styles.cell}>Amounts in UGX millions. Shared costs (marketing and overheads) are allocated by revenue share in every dimension, so each one adds back to the platform total.</Text>
    </FinPanel>
  );
}

function UnitEconomics({ u, phone = false }: { u: U; phone?: boolean }) {
  const e = u.ue;
  const line = (label: string, value: string, tone?: 'green' | 'red', strong = false) => (
    <View style={[styles.uRow, strong && { backgroundColor: TONES.green.soft }]}>
      <Text style={[styles.td, styles.flex, strong && styles.bold]}>{label}</Text>
      <Text style={[styles.td, strong && styles.bold, tone === 'red' && styles.red, tone === 'green' && { color: TONES.green.text }]}>{value}</Text>
    </View>
  );
  return (
    <FinPanel icon="people" title="Unit Economics (per Paying Learner)" style={!phone && styles.ue}>
      {line('Average Revenue per Learner (ARPU, YTD)', `UGX ${num(e.arpu)}`)}
      {line('Direct Delivery Cost per Learner', `(UGX ${num(e.directPerLearner)})`, 'red')}
      {line('Gross Profit per Learner', `UGX ${num(e.grossPerLearner)}`, 'green', true)}
      {line('Gross Margin', pct(e.grossMargin))}
      {line('Operating Profit per Learner', `UGX ${num(e.operatingPerLearner)}`, 'green', true)}
      {line('Customer Acquisition Cost (CAC)', `UGX ${num(e.cac)}`)}
      {line('Lifetime Value (LTV)', `UGX ${num(e.ltv)}`)}
      {line('LTV : CAC', `${e.ltvToCac}x`)}
      {line('CAC Payback', `${e.paybackMonths} months`)}
    </FinPanel>
  );
}

function Plans({ u }: { u: U }) {
  const rows = u.rows('By Subscription Plan');
  return (
    <FinPanel icon="ticket" title="Profitability by Subscription Plan" style={styles.flex}>
      <View style={[styles.dRow, styles.cHead]}>
        <Text style={[styles.th, styles.dName]}>Plan</Text>
        {['Learners', 'Revenue', 'Direct', 'GM %', 'OM %'].map((h, i) => (
          <Text key={h} style={[styles.th, styles.dNum, i >= 3 ? styles.dPct : styles.dMoney]}>{h}</Text>
        ))}
      </View>
      {rows.map((r) => (
        <View key={r.name} style={styles.dRow}>
          <Text style={[styles.td, styles.dName]} numberOfLines={2}>{r.name}</Text>
          <Text style={[styles.dNum, styles.dMoney]}>{num(r.learners)}</Text>
          <Text style={[styles.dNum, styles.dMoney]}>{mn(r.revenue)}</Text>
          <Text style={[styles.dNum, styles.dMoney]}>{mn(r.direct)}</Text>
          <Text style={[styles.dNum, styles.dPct]}>{pct(r.grossMargin)}</Text>
          <Text style={[styles.dNum, styles.dPct]}>{pct(r.operatingMargin)}</Text>
        </View>
      ))}
    </FinPanel>
  );
}

function Courses({ u }: { u: U }) {
  return (
    <FinPanel icon="book" title="Top Performing Subjects (by Operating Margin)" style={styles.flex}>
      <View style={[styles.dRow, styles.cHead]}>
        <Text style={[styles.th, styles.dName]}>Subject</Text>
        <Text style={[styles.th, styles.dNum, styles.dMoney]}>Learners</Text>
        <Text style={[styles.th, styles.dNum, styles.dMoney]}>Revenue</Text>
        <Text style={[styles.th, styles.dNum, styles.dPct]}>OM %</Text>
      </View>
      {u.courses.map((x) => (
        <View key={x.name} style={styles.dRow}>
          <Text style={[styles.td, styles.dName]} numberOfLines={1}>{x.name}</Text>
          <Text style={[styles.dNum, styles.dMoney]}>{num(x.learners)}</Text>
          <Text style={[styles.dNum, styles.dMoney]}>{mn(x.revenue)}</Text>
          <Text style={[styles.dNum, styles.dPct]}>{pct(x.margin)}</Text>
        </View>
      ))}
    </FinPanel>
  );
}

function Insights({ u }: { u: U }) {
  return (
    <FinPanel icon="sparkle" title="Key Insights & Actions">
      <CheckList items={u.insights} />
    </FinPanel>
  );
}

/** Maple Command › Finance › Unit Economics & Profitability on the desktop reference. */
export function ProfitabilityDesk({ c }: { c: CommandData }) {
  const u = useProfit(c.platformFinance);
  const [period, setPeriod] = useState(PERIODS[0]);
  return (
    <FinDesk c={c} sub="Profitability" search="Search by region, curriculum, institution, subject, or plan..." promo={PROMO}>
      <FinHead
        icon="chart"
        title="Unit Economics & Profitability"
        subtitle="Profitability by region, curriculum, subject, subscription plan and delivery channel."
        right={
          <>
            <RangeBox value={period} options={PERIODS} onChange={setPeriod} width={250} />
            <OutlineBtn label="Export" icon="download" chevron onPress={u.exportAll} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <View style={[styles.flex, styles.stack]}>
          <View style={styles.row}>
            <Trend u={u} />
            <ByCurriculum u={u} />
          </View>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Dimension u={u} />
            </View>
            <UnitEconomics u={u} />
          </View>
          <View style={styles.row}>
            <Plans u={u} />
            <Courses u={u} />
          </View>
        </View>
        <View style={styles.side}>
          <CostStructure u={u} />
          <Insights u={u} />
        </View>
      </View>
    </FinDesk>
  );
}

/** The phone version: profit tiles, unit economics, cost structure and segment cards. */
export function ProfitabilityPhone({ c }: { c: CommandData }) {
  const u = useProfit(c.platformFinance);
  const rows = u.rows(u.dim);
  return (
    <FinPhone c={c} title="Profitability" subtitle="Unit economics by region, curriculum and plan.">
      <FinStats items={u.stats} phone title="Profit at a Glance" />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <UnitEconomics u={u} phone />
      <FinPanel icon="grid" title={`Profitability ${u.dim.toLowerCase()}`}>
        <View style={styles.dimTabs}>
          {DIMS.map((d) => (
            <Pressable key={d} style={[styles.dimTab, d === u.dim && styles.dimTabOn]} onPress={() => u.setDim(d)} accessibilityRole="tab" accessibilityState={{ selected: d === u.dim }}>
              <Text style={[styles.dimText, d === u.dim && styles.dimTextOn]}>{d.replace('By ', '').replace('Subscription ', '')}</Text>
            </Pressable>
          ))}
        </View>
        {rows.map((r) => (
          <View key={r.name} style={styles.uRow}>
            <View style={styles.flex}>
              <Text style={styles.tdStrong}>{r.name}</Text>
              <Text style={styles.cell}>{`Revenue ${ugx(r.revenue)} • gross ${pct(r.grossMargin)}`}</Text>
            </View>
            <Text style={[styles.tdStrong, r.operatingMargin < 0 && styles.red]}>{pct(r.operatingMargin)}</Text>
          </View>
        ))}
      </FinPanel>
      <CostStructure u={u} />
      <ByCurriculum u={u} phone />
      <Trend u={u} phone />
      <Insights u={u} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stack: { gap: 12 },
  side: { width: 400, gap: 12 },
  ue: { width: 330 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cell: { fontSize: 10.5, color: BODY },
  td: { fontSize: 11.5, color: NAVY },
  tdStrong: { fontSize: 12, fontWeight: '800', color: NAVY },
  th: { fontSize: 10.5, fontWeight: '700', color: BODY },
  bold: { fontWeight: '800' },
  red: { color: RED },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  cRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, paddingHorizontal: 4 },
  cHead: { borderBottomWidth: 1, borderBottomColor: LINE },
  cAmt: { width: 104, textAlign: 'right' },
  cPct: { width: 58, textAlign: 'right' },
  cTotal: { borderRadius: 8, backgroundColor: TONES.orange.soft },
  cTotalGreen: { borderRadius: 8, backgroundColor: TONES.green.soft },
  dimTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  dimTab: { height: 28, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  dimTabOn: { borderColor: BLUE, backgroundColor: BLUE },
  dimText: { fontSize: 11, fontWeight: '700', color: NAVY },
  dimTextOn: { color: WHITE },
  dRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 4 },
  dName: { flex: 1, minWidth: 0 },
  dNum: { fontSize: 10.5, color: NAVY, textAlign: 'right' },
  dMoney: { width: 74 },
  dPct: { width: 56 },
  uRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, paddingHorizontal: 6, borderRadius: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
});
