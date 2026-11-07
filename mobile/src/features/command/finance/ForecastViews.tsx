import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { applyScenario, cashFlow, type Line, liquidityRatio, runway, type Scenario, SCENARIOS, totals } from '@/features/command/logic/forecast';
import { balanceSheet } from '@/features/command/logic/reports';
import { BLUE, BODY, LINE, NAVY, RED, TONES, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';

import { type FormAsk, FormModal } from './FinForm';
import { CheckList, FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, type Mark, type Promo, SumLine, ugx } from './FinKit';
import { Maple } from '@/constants/maple';
import { Palette } from '@/constants/palette';

type C = CommandData['platformFinance'];
type Key = 'base' | 'high' | 'low' | 'custom';
const TABS = ['Overview', 'Revenue Forecast', 'Cost Forecast', 'Cash & Liquidity', 'Treasury Plan', 'Scenarios & What-If', 'Assumptions', 'Reports'] as const;
const STREAM_COLORS = [Maple.blue, Maple.blue, Maple.warning, Palette.lime600] as const;
const PROMO: Promo = { icon: 'chart', color: Maple.blue, title: 'Financial Forecasting', body: 'Predict revenue, costs, cash and liquidity to plan and grow Maple.' };
const PERIODS = ['Nov 2026 – Oct 2027'];
const M = 1_000_000;

const mm = (n: number) => `${Math.round(n / M).toLocaleString('en-US')}M`;
const bb = (n: number) => `UGX ${(n / 1e9).toFixed(2)}B`;
const months = (n: number) => `${n.toFixed(1)} months`;

function project(plan: readonly Line[], s: Scenario, t: C['planning']['treasury'], collected: number) {
  const lines = applyScenario(plan, s);
  const sum = totals(lines);
  const cash = cashFlow(sum.monthly, { opening: t.opening, collectedInMonth: collected, lastRevenue: t.lastRevenue, capex: t.capex, financing: t.financing });
  const outTotal = cash.outflow.reduce((a, v) => a + v, 0);
  const inTotal = cash.inflow.reduce((a, v) => a + v, 0);
  return { lines, sum, cash, inTotal, outTotal, closing: cash.closing[cash.closing.length - 1], low: Math.min(...cash.closing), runway: runway(t.opening, cash.outflow) };
}

function useForecast(c: C) {
  const p = c.planning;
  const [key, setKey] = useState<Key>('base');
  const [custom, setCustom] = useState<Scenario>({ name: 'Custom', note: '+10% rev, −5% fixed', revenue: 1.1, fixed: 0.95 });
  const [collected, setCollected] = useState(p.treasury.collectedInMonth);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [ranAt, setRanAt] = useState<string | null>(null);
  const scenarios: Readonly<Record<Key, Scenario>> = { ...SCENARIOS, custom };
  const all = useMemo(() => ({ base: project(p.plan, SCENARIOS.base, p.treasury, collected), high: project(p.plan, SCENARIOS.high, p.treasury, collected), low: project(p.plan, SCENARIOS.low, p.treasury, collected), custom: project(p.plan, custom, p.treasury, collected) }), [p, custom, collected]);
  const f = all[key];
  const bs = balanceSheet(c.ledger.accounts, c.ledger.entries);
  const ratio = liquidityRatio(bs.currentAssets, bs.currentLiabilities);
  const growth = (now: number, then: number) => `${(((now - then) / then) * 100).toFixed(1)}%`;

  const run = () => {
    setRanAt('Oct 31, 2026 10:24');
    toast(`${scenarios[key].name} forecast run: revenue ${bb(f.sum.revenue)}, surplus ${bb(f.sum.surplus)}, closing cash ${bb(f.closing)}, runway ${months(f.runway)}.`);
  };
  const editScenario = () =>
    setAsk({
      title: 'Custom what-if scenario',
      body: 'Revenue changes also move the costs that follow it (teacher payouts, cloud and AI usage). Fixed costs move only by the fixed-cost change.',
      fields: [
        { key: 'rev', label: 'Revenue change (%)', kind: 'text', initial: String(Math.round((custom.revenue - 1) * 100)) },
        { key: 'fixed', label: 'Fixed-cost change (%)', kind: 'text', initial: String(Math.round(((custom.fixed ?? 1) - 1) * 100)) },
      ],
      confirm: 'Apply Scenario',
      onSubmit: (v) => {
        const r = Number(v.rev);
        const fx = Number(v.fixed);
        if (Number.isNaN(r) || r < -50 || r > 100) return 'Use a revenue change between −50% and +100%.';
        if (Number.isNaN(fx) || fx < -50 || fx > 50) return 'Use a fixed-cost change between −50% and +50%.';
        setCustom({ name: 'Custom', note: `${r >= 0 ? '+' : ''}${r}% rev, ${fx >= 0 ? '+' : ''}${fx}% fixed`, revenue: 1 + r / 100, fixed: 1 + fx / 100 });
        setKey('custom');
        toast(`Custom scenario applied: ${r}% revenue, ${fx}% fixed costs.`);
        return undefined;
      },
    });
  const editAssumptions = () =>
    setAsk({
      title: 'Cash assumptions',
      body: `Share of each month's billing collected in the same month; the rest arrives the month after. Loan repayments of ${ugx(p.treasury.financing[0])} a month and planned capex stay in cash outflow but are not expenses.`,
      fields: [{ key: 'collected', label: 'Collected in month (%)', kind: 'text', initial: String(Math.round(collected * 100)) }],
      confirm: 'Save Assumptions',
      onSubmit: (v) => {
        const n = Number(v.collected);
        if (Number.isNaN(n) || n < 10 || n > 100) return 'Use a collection rate between 10% and 100%.';
        setCollected(n / 100);
        toast(`Collection rate set to ${n}%. Cash flow and runway updated; profit is unchanged.`);
        return undefined;
      },
    });
  const exportPlan = () => toast(`${scenarios[key].name} forecast exported: 12 months × ${f.lines.length} lines with assumptions (XLSX).`);

  const stats: readonly Kpi[] = [
    { label: 'Revenue (FY2027)', value: ugx(f.sum.revenue), delta: growth(f.sum.revenue, p.treasury.lastYear.revenue), icon: 'layers', tone: 'blue' },
    { label: 'Expenses (FY2027)', value: ugx(f.sum.expenses), delta: growth(f.sum.expenses, p.treasury.lastYear.expenses), icon: 'database', tone: 'orange', valueTone: 'red' },
    { label: 'Net Surplus (FY2027)', value: ugx(f.sum.surplus), icon: 'shield', tone: 'blue', valueTone: f.sum.surplus < 0 ? 'red' : undefined },
    { label: 'Closing Cash (Oct 2027)', value: ugx(f.closing), icon: 'wallet', tone: 'purple' },
    { label: 'Cash Runway', value: months(f.runway), caption: 'at current cash spend', icon: 'calendar', tone: f.runway >= p.treasury.runwayTarget ? 'green' : 'orange', valueTone: f.runway >= p.treasury.runwayTarget ? 'green' : 'orange' },
    { label: 'Liquidity Ratio', value: `${ratio.toFixed(2)}x`, caption: `Target ≥ ${p.treasury.liquidityTarget}x`, icon: 'chart', tone: 'green' },
  ];
  const payoutShare = f.lines.filter((l) => l.name.startsWith('Teacher')).flatMap((l) => l.values).reduce((a, v) => a + v, 0) / f.sum.revenue;
  const infra = f.lines.find((l) => l.name.startsWith('Cloud'))?.values ?? [1];
  const infraGrowth = ((infra[infra.length - 1] - infra[0]) / infra[0]) * 100;
  const reserve = (f.outTotal / 12) * p.treasury.reserveMonths;
  const insights: readonly { mark: Mark; text: string }[] = [
    { mark: f.sum.revenue >= p.treasury.lastYear.revenue ? 'ok' : 'warn', text: `Revenue ${growth(f.sum.revenue, p.treasury.lastYear.revenue)} on FY2026 (annualised), led by subscriptions.` },
    { mark: f.runway >= p.treasury.runwayTarget ? 'ok' : 'warn', text: `Runway ${months(f.runway)} at today's cash and spend: ${f.runway >= p.treasury.runwayTarget ? 'above' : 'below'} the ${p.treasury.runwayTarget}-month target. Growth does not extend it; cash does.` },
    { mark: infraGrowth > 25 ? 'warn' : 'ok', text: `Cloud, LiveKit & AI costs rise ${infraGrowth.toFixed(1)}% over the year. Review usage.` },
    { mark: payoutShare <= 0.3 ? 'ok' : 'warn', text: `Teacher payouts are ${(payoutShare * 100).toFixed(1)}% of revenue (target ≤ 30%).` },
    { mark: f.low >= reserve ? 'ok' : 'fail', text: `Lowest month-end cash ${bb(f.low)} against a ${p.treasury.reserveMonths}-month reserve of ${bb(reserve)}.` },
    { mark: 'info', text: `Profit and cash differ: surplus ${bb(f.sum.surplus)} vs cash change ${bb(f.closing - p.treasury.opening)} (collection lag, capex, loan repayments).` },
  ];
  return { p, key, setKey, scenarios, all, f, tab, setTab, ask, setAsk, run, ranAt, editScenario, editAssumptions, exportPlan, stats, insights, collected };
}
type U = ReturnType<typeof useForecast>;

function Streams({ u, phone = false }: { u: U; phone?: boolean }) {
  const rev = u.f.lines.filter((l) => l.kind === 'revenue');
  const top = Math.max(...u.f.sum.monthly.revenue) / M;
  return (
    <FinPanel icon="chart" title="Revenue Forecast by Stream" style={!phone && styles.flex}>
      <ComboChart labels={u.p.months.map((x) => x.slice(0, 3))} mode="stacked" bars={rev.map((l, i) => ({ name: l.name, color: STREAM_COLORS[i], values: l.values.map((v) => v / M) }))} max={Math.ceil(top / 200) * 200} rightAxis={false} every={phone ? 2 : 1} height={phone ? 190 : 156} format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}B` : v ? `${Math.round(v)}M` : '0')} />
      <View style={styles.legend}>
        {rev.map((l, i) => (
          <View key={l.name} style={styles.inline}>
            <View style={[styles.dot, { backgroundColor: STREAM_COLORS[i] }]} />
            <Text style={styles.cell}>{l.name.replace(/ \(.*\)$/, '')}</Text>
          </View>
        ))}
      </View>
    </FinPanel>
  );
}

function CashChart({ u, phone = false }: { u: U; phone?: boolean }) {
  const c = u.f.cash;
  const top = Math.max(...c.inflow, ...c.outflow) / M;
  const cashTop = Math.max(...c.closing) / M;
  return (
    <FinPanel icon="layers" title="Cash Flow Forecast" style={!phone && styles.flex}>
      <ComboChart
        labels={u.p.months.map((x) => x.slice(0, 3))}
        bars={[
          { name: 'Cash Inflow', color: Maple.successText, values: c.inflow.map((v) => v / M) },
          { name: 'Cash Outflow', color: Palette.red400b, values: c.outflow.map((v) => v / M) },
        ]}
        line={{ name: 'Closing Cash', color: BLUE, values: c.closing.map((v) => v / M), dots: true }}
        max={Math.ceil(top / 200) * 200}
        lineMax={Math.ceil(cashTop / 1000) * 1000}
        every={phone ? 2 : 1}
        height={phone ? 190 : 156}
        format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}B` : v ? `${Math.round(v)}M` : '0')}
        lineFormat={(v) => `${(v / 1000).toFixed(1)}B`}
      />
      <View style={styles.legend}>
        {(
          [
            ['Cash Inflow', Maple.successText],
            ['Cash Outflow', Palette.red400b],
            ['Closing Cash', BLUE],
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

function Treasury({ u }: { u: U }) {
  return (
    <FinPanel icon="building" title="Treasury & Liquidity Plan" onAll={u.editAssumptions} allLabel="Assumptions">
      <SumLine icon="calendar" label={u.p.treasury.openingLabel} value={ugx(u.p.treasury.opening)} />
      <SumLine icon="plus" tone="green" label="Total Forecast Cash Inflow" value={ugx(u.f.inTotal)} />
      <SumLine icon="minus" tone="red" label="Total Forecast Cash Outflow" value={`(${ugx(u.f.outTotal)})`} />
      <SumLine icon="layers" tone="green" strong label={`Closing Cash (${u.p.months[u.p.months.length - 1]})`} value={ugx(u.f.closing)} />
      <Text style={styles.cell}>{`Collections: ${Math.round(u.collected * 100)}% in month • capex and loan repayments are cash, not expenses.`}</Text>
    </FinPanel>
  );
}

function Scenarios({ u }: { u: U }) {
  const keys: readonly Key[] = ['base', 'high', 'low', 'custom'];
  const row = (label: string, pick: (k: Key) => string) => (
    <View style={styles.scRow}>
      <Text style={[styles.scLabel]}>{label}</Text>
      {keys.map((k) => (
        <Text key={k} style={[styles.scCell, k === u.key && styles.scOn]} numberOfLines={1}>
          {pick(k)}
        </Text>
      ))}
    </View>
  );
  return (
    <FinPanel icon="layers" title="Scenarios (What-If)" onAll={u.editScenario} allLabel="Edit Custom">
      <View style={styles.scRow}>
        <View style={styles.scLabel} />
        {keys.map((k) => (
          <Pressable key={k} style={[styles.scHead, k === u.key && styles.scHeadOn]} onPress={() => u.setKey(k)} accessibilityRole="radio" accessibilityState={{ selected: k === u.key }} accessibilityLabel={u.scenarios[k].name}>
            {k === u.key ? <Icon name="check" size={13} color={BLUE} /> : <View style={styles.radio} />}
            <Text style={styles.scName} numberOfLines={2}>{u.scenarios[k].name}</Text>
            <Text style={styles.scNote} numberOfLines={2}>{u.scenarios[k].note}</Text>
          </Pressable>
        ))}
      </View>
      {row('Revenue', (k) => bb(u.all[k].sum.revenue).replace('UGX ', ''))}
      {row('Expenses', (k) => bb(u.all[k].sum.expenses).replace('UGX ', ''))}
      {row('Net Surplus', (k) => bb(u.all[k].sum.surplus).replace('UGX ', ''))}
      {row('Closing Cash', (k) => bb(u.all[k].closing).replace('UGX ', ''))}
      {row('Runway', (k) => `${u.all[k].runway.toFixed(1)} mo`)}
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

function Category({ u }: { u: U }) {
  const [open, setOpen] = useState({ revenue: true, expenses: true });
  const rev = u.f.lines.filter((l) => l.kind === 'revenue');
  const exp = u.f.lines.filter((l) => l.kind !== 'revenue');
  const sum = (xs: readonly number[]) => xs.reduce((a, v) => a + v, 0);
  const line = (name: string, values: readonly number[], style?: object, tone?: string) => (
    <View key={name} style={[styles.tRow, style]}>
      <Text style={[styles.tName, tone ? { color: tone } : null]} numberOfLines={1}>{name}</Text>
      {values.map((v, i) => (
        <Text key={u.p.months[i]} style={[styles.tNum, tone ? { color: tone } : null]}>{mm(v)}</Text>
      ))}
      <Text style={[styles.tTotal, tone ? { color: tone } : null]}>{mm(sum(values))}</Text>
    </View>
  );
  const group = (label: string, k: 'revenue' | 'expenses', color: string) => (
    <Pressable style={[styles.tGroup, { backgroundColor: color }]} onPress={() => setOpen((o) => ({ ...o, [k]: !o[k] }))} accessibilityRole="button" accessibilityState={{ expanded: open[k] }}>
      <Icon name={open[k] ? 'chevronDown' : 'chevronRight'} size={13} color={NAVY} />
      <Text style={styles.tGroupText}>{label}</Text>
    </Pressable>
  );
  return (
    <FinPanel icon="grid" title={`Financial Forecast by Category (UGX) • ${u.scenarios[u.key].name}`}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={[styles.tRow, styles.tHead]}>
            <Text style={[styles.tName, styles.th]}>Category</Text>
            {u.p.months.map((x) => (
              <Text key={x} style={[styles.tNum, styles.th]}>{x.replace(' 20', ' ')}</Text>
            ))}
            <Text style={[styles.tTotal, styles.th]}>Total</Text>
          </View>
          {group('Revenue (Cash Inflow)', 'revenue', TONES.green.soft)}
          {open.revenue ? rev.map((l) => line(l.name, l.values)) : null}
          {line('Total Revenue', u.f.sum.monthly.revenue, styles.tSumGreen)}
          {group('Expenses (Cash Outflow)', 'expenses', TONES.red.soft)}
          {open.expenses ? exp.map((l) => line(l.name, l.values)) : null}
          {line('Total Expenses', u.f.sum.monthly.expenses, styles.tSumRed)}
          {line('Net Surplus (Revenue – Expenses)', u.f.sum.monthly.surplus, styles.tSumGreen, u.f.sum.surplus < 0 ? RED : undefined)}
        </View>
      </ScrollView>
    </FinPanel>
  );
}

/** Maple Command › Finance › Financial Forecasting & Treasury Planning on the desktop reference. */
export function ForecastDesk({ c }: { c: CommandData }) {
  const u = useForecast(c.platformFinance);
  const [period, setPeriod] = useState(PERIODS[0]);
  return (
    <FinDesk c={c} sub="Forecasting" search="Search by metric, forecast, scenario, or financial plan..." promo={PROMO}>
      <FinHead
        icon="chart"
        title="Financial Forecasting & Treasury Planning"
        subtitle={`Revenue, costs, teacher payouts, liquidity and cash runway.${u.ranAt ? ` Last run ${u.ranAt}.` : ''}`}
        right={
          <>
            <RangeBox value={period} options={PERIODS} onChange={setPeriod} width={220} />
            <PrimaryBtn label="Run Forecast" icon="play" onPress={u.run} />
            <OutlineBtn label="Scenarios" icon="layers" onPress={u.editScenario} />
            <OutlineBtn label="Export" icon="download" chevron onPress={u.exportPlan} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <View style={[styles.flex, styles.stack]}>
          <View style={styles.row}>
            <Streams u={u} />
            <CashChart u={u} />
          </View>
          <Category u={u} />
        </View>
        <View style={styles.side}>
          <Treasury u={u} />
          <Scenarios u={u} />
          <Insights u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: tiles, scenarios, treasury, charts and insights. */
export function ForecastPhone({ c }: { c: CommandData }) {
  const u = useForecast(c.platformFinance);
  return (
    <FinPhone c={c} title="Forecasting" subtitle="Revenue, costs, cash and runway for FY2027.">
      <FinStats items={u.stats} phone title="Forecast at a Glance" />
      <View style={styles.inline}>
        <PrimaryBtn label="Run Forecast" icon="play" onPress={u.run} style={styles.flex} />
        <OutlineBtn label="What-If" onPress={u.editScenario} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <Scenarios u={u} />
      <Treasury u={u} />
      <Insights u={u} />
      <CashChart u={u} phone />
      <Streams u={u} phone />
      <Category u={u} />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stack: { gap: 12 },
  side: { width: 410, gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cell: { fontSize: 10.5, color: BODY },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 14, rowGap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  scRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
  scLabel: { width: 74, fontSize: 10.5, fontWeight: '700', color: NAVY },
  scCell: { flex: 1, textAlign: 'center', fontSize: 10.5, color: NAVY },
  scOn: { fontWeight: '800', color: BLUE },
  scHead: { flex: 1, minWidth: 0, alignItems: 'center', gap: 2, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  scHeadOn: { borderColor: BLUE, backgroundColor: TONES.blue.soft },
  scName: { fontSize: 10.5, fontWeight: '800', textAlign: 'center', color: NAVY },
  radio: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5, borderColor: BODY },
  scNote: { fontSize: 9, color: BODY, textAlign: 'center' },
  table: { minWidth: '100%' },
  tRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 6 },
  tHead: { borderBottomWidth: 1, borderBottomColor: LINE },
  th: { fontWeight: '700', color: BODY },
  tName: { width: 214, fontSize: 10.5, color: NAVY },
  tNum: { width: 50, textAlign: 'right', fontSize: 10.5, color: NAVY },
  tTotal: { width: 68, textAlign: 'right', fontSize: 10.5, fontWeight: '800', color: NAVY },
  tGroup: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 6, borderRadius: 6, marginTop: 4 },
  tGroupText: { fontSize: 11, fontWeight: '800', color: NAVY },
  tSumGreen: { backgroundColor: TONES.green.soft, borderRadius: 6 },
  tSumRed: { backgroundColor: TONES.red.soft, borderRadius: 6 },
});
