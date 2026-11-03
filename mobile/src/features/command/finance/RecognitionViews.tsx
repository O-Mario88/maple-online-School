import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, PageStrip, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { cancelItem, type Method, nextRecognition, recognise, rollForward } from '@/features/command/logic/recognition';
import { Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, MUTED, NAVY, RED, TONES, type Tone } from '@/features/portal/tokens';
import { type Column, DataTable, Search, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { RecRow } from '@/mock/command-center/pf-revenue';

import { type FormAsk, FormModal } from './FinForm';
import { CheckList, FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, SumLine, ugx } from './FinKit';

type D = CommandData['platformFinance']['revenue'];
const PER_PAGE = 10;
const LABEL_H = 20;
const TABS = ['Overview', 'Recognition Schedule', 'Deferred Revenue', 'Earned Revenue', 'Contracts & Plans', 'Adjustments (Discounts & Cancellations)', 'Policy & Settings'] as const;
const TYPE_TONE: Readonly<Record<RecRow['type'], Tone>> = { Subscription: 'purple', 'Course Access': 'blue', 'Marketplace Commission': 'orange', Cancellation: 'red' };
type Status = 'Active' | 'Completed' | 'Recognized' | 'Cancelled';
const STATUS_TONE: Readonly<Record<Status, Tone>> = { Active: 'green', Completed: 'green', Recognized: 'blue', Cancelled: 'red' };
const METHOD_LABEL: Readonly<Record<Method, string>> = { straight: 'Straight-line', access: 'Over access period', delivery: 'At service delivery' };
const RULE_OPTIONS = ['Straight-line over contract', 'Over access period', 'At service delivery'] as const;
type Rule = (typeof RULE_OPTIONS)[number];
interface Rules {
  subscriptions: Rule;
  courses: Rule;
  commissions: Rule;
}
const PROMO: Promo = { icon: 'layers', color: '#1E6BF0', title: 'Revenue & Recognition', body: 'Track cash, earned revenue and deferred (unearned) revenue with full control.' };
const RANGES = ['Last 10 Months', 'This Quarter', 'Year to Date'];
const FILTERS = { type: ['All Revenue Types', 'Subscription', 'Course Access', 'Marketplace Commission', 'Cancellation'], status: ['All Statuses', 'Active', 'Completed', 'Recognized', 'Cancelled'] } as const;
const LEDGER = { deferred: '2400 Deferred Revenue', revenue: '4000 Subscription Revenue', commission: '4100 Marketplace Commission', refunds: '2410 Refunds Payable' } as const;

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const paren = (n: number) => `(${num(n)})`;
const methodText = (r: RecRow) => {
  if (r.cancelled) return 'Reversal (unearned)';
  if (r.method === 'delivery') return 'On delivery (completion)';
  return `${METHOD_LABEL[r.method]} (${r.periods} ${r.method === 'straight' ? 'months' : 'weeks'})`;
};

/** One schedule row as of today: earned, still deferred, status and the next recognition. */
function lineOf(r: RecRow, today: string) {
  if (r.cancelled) {
    const c = cancelItem(r, r.cancelled);
    return { recognized: c.earned, deferred: 0, reversed: c.reversed, status: 'Cancelled' as Status, next: null };
  }
  const x = recognise(r, today);
  return { recognized: x.recognized, deferred: x.deferred, reversed: 0, status: x.status as Status, next: nextRecognition(r, today) };
}

function useRecognition(d: D) {
  const [list, setList] = useState<readonly RecRow[]>(d.recItems);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [type, setType] = useState<string>(FILTERS.type[0]);
  const [status, setStatus] = useState<string>(FILTERS.status[0]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [selected, toggle] = useSelection();
  const [rules, setRules] = useState<Rules>({ subscriptions: RULE_OPTIONS[0], courses: RULE_OPTIONS[1], commissions: RULE_OPTIONS[2] });
  const today = d.TODAY;
  const line = (r: RecRow) => lineOf(r, today);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inTab = (r: RecRow) => {
      const l = lineOf(r, today);
      if (tab === 'Deferred Revenue') return l.deferred > 0;
      if (tab === 'Earned Revenue') return l.recognized > 0;
      if (tab === 'Contracts & Plans') return r.type === 'Subscription';
      if (tab === 'Adjustments (Discounts & Cancellations)') return l.status === 'Cancelled';
      return true;
    };
    return list.filter((r) => inTab(r) && (type === FILTERS.type[0] || r.type === type) && (status === FILTERS.status[0] || lineOf(r, today).status === status) && (!q || `${r.id} ${r.customer} ${r.ref}`.toLowerCase().includes(q)));
  }, [list, tab, type, status, query, today]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const update = (r: RecRow) => setList((prev) => prev.map((x) => (x.id === r.id ? r : x)));

  const journal = (r: RecRow) => {
    const l = line(r);
    const credit = r.type === 'Marketplace Commission' ? LEDGER.commission : LEDGER.revenue;
    const entries = [`Cash in: Dr 1100 Bank, Cr ${LEDGER.deferred} ${num(r.cash)}`, `Earned to date: Dr ${LEDGER.deferred}, Cr ${credit} ${num(l.recognized)}`];
    if (l.reversed) entries.push(`Cancellation: Dr ${LEDGER.deferred}, Cr ${LEDGER.refunds} ${num(l.reversed)}`);
    return entries.join(' • ');
  };
  const manage = (r: RecRow) => {
    const l = line(r);
    const actions = [...(l.status === 'Active' && r.method !== 'delivery' ? ['Cancel and reverse unearned'] : []), ...(r.method === 'delivery' && !r.delivered ? ['Mark service delivered'] : []), 'Show journal entries'];
    setAsk({
      title: `${r.id} • ${r.customer}`,
      body: `${r.type}, ${METHOD_LABEL[r.method]}. Total ${ugx(r.total)}; earned ${ugx(l.recognized)}; deferred ${ugx(l.deferred)}${l.next ? `; next ${ugx(l.next.amount)} on ${date(l.next.date)}` : ''}.`,
      fields: [
        { key: 'action', label: 'Action', kind: 'choice', options: actions },
        { key: 'reason', label: 'Reason (for cancellations)', kind: 'text', placeholder: 'School closed its second campus' },
      ],
      confirm: 'Apply',
      onSubmit: (v) => {
        if (v.action === 'Cancel and reverse unearned') {
          if (!v.reason?.trim()) return 'Give the reason for the cancellation; it goes on the audit trail.';
          const c = cancelItem(r, today);
          update({ ...r, cancelled: today });
          toast(`${r.id} cancelled. ${ugx(c.earned)} stays earned; ${ugx(c.reversed)} reversed: Dr ${c.entry[0].account}, Cr ${c.entry[1].account}.`);
          return undefined;
        }
        if (v.action === 'Mark service delivered') {
          update({ ...r, delivered: true });
          toast(`${r.id} delivered. ${ugx(r.total)} recognised: Dr ${LEDGER.deferred}, Cr ${LEDGER.commission}.`);
          return undefined;
        }
        toast(journal(r));
        return undefined;
      },
    });
  };
  const editRules = () =>
    setAsk({
      title: 'Recognition rules',
      body: 'Rules apply to new contracts and transactions. Posted recognitions stay as they are; changes are logged for audit.',
      fields: [
        { key: 'subscriptions', label: 'Subscriptions', kind: 'choice', options: [rules.subscriptions, ...RULE_OPTIONS.filter((o) => o !== rules.subscriptions)] },
        { key: 'courses', label: 'Course access', kind: 'choice', options: [rules.courses, ...RULE_OPTIONS.filter((o) => o !== rules.courses)] },
        { key: 'commissions', label: 'Marketplace commissions', kind: 'choice', options: [rules.commissions, ...RULE_OPTIONS.filter((o) => o !== rules.commissions)] },
      ],
      confirm: 'Save Rules',
      onSubmit: (v) => {
        const next: Rules = { subscriptions: v.subscriptions as Rule, courses: v.courses as Rule, commissions: v.commissions as Rule };
        const changed = (Object.keys(next) as (keyof Rules)[]).filter((k) => next[k] !== rules[k]).length;
        setRules(next);
        toast(changed ? `${changed} rule${changed > 1 ? 's' : ''} updated for new contracts. Logged to the audit trail.` : 'No rule changed.');
        return undefined;
      },
    });
  const exportSchedule = () => toast(`Recognition schedule exported: ${shown.length} records (CSV).`);

  // Platform totals plus what this session changed on the sample rows.
  const sum = (xs: readonly RecRow[]) => xs.reduce((s, r) => {
    const l = lineOf(r, today);
    return { recognized: s.recognized + l.recognized, deferred: s.deferred + l.deferred, reversed: s.reversed + l.reversed };
  }, { recognized: 0, deferred: 0, reversed: 0 });
  const live = sum(list);
  const seed = sum(d.recItems);
  const t = d.recTotals;
  const earned = t.earned + live.recognized - seed.recognized;
  const deferred = t.deferred + live.deferred - seed.deferred;
  const adjustments = t.adjustments + live.reversed - seed.reversed;
  const pos = { ...d.position, recognized: d.position.recognized + live.recognized - seed.recognized, cancellations: d.position.cancellations + live.reversed - seed.reversed };
  const closing = rollForward(pos);
  const stats: readonly Kpi[] = [
    { ...d.recStats[0], value: ugx(t.cash) },
    { ...d.recStats[1], value: ugx(earned) },
    { ...d.recStats[2], value: ugx(deferred) },
    d.recStats[3],
    { ...d.recStats[4], value: ugx(adjustments) },
  ];
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  return { d, rows, shown, tab, setTab: pick, type, setType, status, setStatus, query, setQuery, page: p, pages, setPage, ask, setAsk, manage, editRules, exportSchedule, rules, line, stats, flow: { cash: t.cash, deferred, adjustments, earned }, pos, closing, selected, toggle };
}
type U = ReturnType<typeof useRecognition>;

function Customer({ r }: { r: RecRow }) {
  return (
    <View style={styles.inline}>
      {r.avatar ? <Image source={r.avatar} style={styles.avatar} contentFit="cover" accessibilityIgnoresInvertColors /> : <Icon name="building" size={20} color={NAVY} />}
      <View style={styles.flex}>
        <Text style={styles.cellStrong} numberOfLines={1}>{r.customer}</Text>
        <Text style={styles.cell} numberOfLines={1}>{r.ref}</Text>
      </View>
    </View>
  );
}

function cols(u: U): readonly Column<RecRow>[] {
  return [
    { label: 'Contract / Invoice', width: 102, render: (r) => <Text style={styles.linkCell} numberOfLines={1}>{r.id}</Text> },
    { label: 'Institution / Customer', flex: 1, render: (r) => <Customer r={r} /> },
    { label: 'Revenue Type', width: 98, align: 'center', render: (r) => <Pill label={r.type} tone={TYPE_TONE[r.type]} size={10} /> },
    { label: 'Total Value', width: 80, align: 'right', render: (r) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{num(r.total)}</Text> },
    { label: 'Cash Received', width: 80, align: 'right', render: (r) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{num(r.cash)}</Text> },
    { label: 'Recognition Method', width: 98, render: (r) => <Text style={styles.cell} numberOfLines={2}>{methodText(r)}</Text> },
    { label: 'Recognized to Date', width: 84, align: 'right', render: (r) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{u.line(r).status === 'Cancelled' ? paren(u.line(r).recognized) : num(u.line(r).recognized)}</Text> },
    { label: 'Deferred (Remaining)', width: 84, align: 'right', render: (r) => <Text style={[styles.cell, styles.right, u.line(r).reversed > 0 && styles.red]} numberOfLines={1}>{u.line(r).reversed ? paren(u.line(r).reversed) : num(u.line(r).deferred)}</Text> },
    { label: 'Status', width: 80, align: 'center', render: (r) => <Pill label={u.line(r).status} tone={STATUS_TONE[u.line(r).status]} size={10} /> },
    { label: 'Next Recognition', width: 80, align: 'center', render: (r) => <Text style={[styles.cell, styles.center]} numberOfLines={1}>{u.line(r).next ? date(u.line(r).next?.date ?? '') : '—'}</Text> },
  ];
}

function Trend({ d, phone = false }: { d: D; phone?: boolean }) {
  const f = d.recTrend;
  const [range, setRange] = useState(RANGES[0]);
  return (
    <FinPanel icon="chart" title="Revenue Recognition Trend" style={!phone && styles.trend} right={phone ? undefined : <RangeBox value={range} options={RANGES} onChange={setRange} width={176} />}>
      <ComboChart
        labels={f.labels}
        bars={[
          { name: 'Cash Received', color: '#3B82F6', values: f.cash },
          { name: 'Revenue Earned (Recognized)', color: '#A78BFA', values: f.earned },
        ]}
        line={{ name: 'Deferred Revenue', color: '#F5B731', values: f.deferred, dots: true }}
        max={600}
        lineMax={600}
        rightAxis={false}
        every={phone ? 2 : 1}
        height={phone ? 190 : 168}
        format={(v) => (v ? `${Math.round(v)}M` : '0')}
      />
      <View style={styles.legend}>
        {(
          [
            ['Cash Received', '#3B82F6'],
            ['Revenue Earned (Recognized)', '#A78BFA'],
            ['Deferred Revenue', '#F5B731'],
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

/** Cash received, less what is still deferred and the adjustments, leaves revenue earned. */
function Waterfall({ u, phone = false }: { u: U; phone?: boolean }) {
  const f = u.flow;
  const height = phone ? 150 : 132;
  const scale = (n: number) => (n / f.cash) * height;
  const steps = [
    { label: 'Cash Received', value: `${(f.cash / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}M`, top: f.cash, size: f.cash, color: '#3B82F6' },
    { label: 'Deferred (Unearned)', value: `(${(f.deferred / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}M)`, top: f.cash, size: f.deferred, color: '#F87171', down: true },
    { label: 'Discounts & Cancellations', value: `(${(f.adjustments / 1e6).toFixed(1)}M)`, top: f.cash - f.deferred, size: f.adjustments, color: '#F87171', down: true },
    { label: 'Revenue Earned', value: `${(f.earned / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}M`, top: f.earned, size: f.earned, color: '#22A55A' },
  ];
  return (
    <FinPanel icon="layers" title="Revenue Flow (YTD)" style={!phone && styles.flex}>
      <View style={[styles.fall, { height: height + LABEL_H * 2 }]} accessible accessibilityLabel={steps.map((s) => `${s.label} ${s.value}`).join(', ')}>
        {steps.map((s) => (
          <View key={s.label} style={styles.fallCol}>
            <View style={{ height: height - scale(s.top) + (s.down ? LABEL_H : 0) }} />
            {s.down ? null : <Text style={styles.fallValue}>{s.value}</Text>}
            <View style={[styles.fallBar, { height: Math.max(3, scale(s.size)), backgroundColor: s.color }]} />
            {s.down ? <Text style={[styles.fallValue, styles.red]}>{s.value}</Text> : null}
          </View>
        ))}
      </View>
      <View style={styles.fallLabels}>
        {steps.map((s) => (
          <Text key={s.label} style={[styles.cell, styles.fallLabel]} numberOfLines={2}>
            {s.label}
          </Text>
        ))}
      </View>
    </FinPanel>
  );
}

function Position({ u }: { u: U }) {
  const p = u.pos;
  return (
    <FinPanel icon="people" title="Revenue Position">
      <SumLine icon="wallet" label="Opening Deferred Revenue" value={ugx(p.opening)} />
      <SumLine icon="plus" label="Add: New Prepayments" value={ugx(p.prepayments)} />
      <SumLine icon="minus" tone="red" label="Less: Revenue Recognized" value={`(${ugx(p.recognized)})`} />
      <SumLine icon="minus" tone="red" label="Less: Cancellations / Refunds" value={`(${ugx(p.cancellations)})`} />
      <SumLine icon="layers" tone="green" strong label="Closing Deferred Revenue" value={ugx(u.closing)} />
    </FinPanel>
  );
}

function Upcoming({ u }: { u: U }) {
  return (
    <FinPanel icon="calendar" title="Upcoming Recognitions" onAll={() => u.setTab('Recognition Schedule')}>
      {u.d.upcoming.map((x) => (
        <View key={x.date} style={styles.line}>
          <View style={[styles.dot, { backgroundColor: TONES.green.solid }]} />
          <Text style={[styles.td, styles.flex]}>{x.date}</Text>
          <Text style={styles.td}>{ugx(x.amount)}</Text>
        </View>
      ))}
    </FinPanel>
  );
}

function Policy({ u }: { u: U }) {
  return (
    <FinPanel icon="settings" title="Recognition Policy" right={<Pill label="Active" tone="green" size={11} />}>
      <CheckList items={u.d.policy.map((x) => ({ mark: 'ok' as const, text: `${x.bold}${x.text}` }))} />
      <OutlineBtn small label="View Full Policy" icon="arrowRight" onPress={u.editRules} />
    </FinPanel>
  );
}

function Filters({ u }: { u: U }) {
  const cycle = (list: readonly string[], v: string) => list[(list.indexOf(v) + 1) % list.length];
  return (
    <View style={styles.inline}>
      <OutlineBtn small chevron label={u.type} onPress={() => u.setType(cycle(FILTERS.type, u.type))} />
      <OutlineBtn small chevron label={u.status} onPress={() => u.setStatus(cycle(FILTERS.status, u.status))} />
      <Search placeholder="Search by contract, invoice or institution..." value={u.query} onChange={u.setQuery} style={styles.search} />
    </View>
  );
}

/** Maple Command › Finance › Revenue Recognition & Deferred Revenue on the desktop reference. */
export function RecognitionDesk({ c }: { c: CommandData }) {
  const u = useRecognition(c.platformFinance.revenue);
  return (
    <FinDesk c={c} sub="Revenue Recognition" search="Search by contract, invoice, plan, institution or transaction..." promo={PROMO}>
      <FinHead
        icon="layers"
        title="Revenue Recognition & Deferred Revenue"
        subtitle="Separate cash received from revenue earned. Manage prepaid subscriptions, course access, marketplace commissions, discounts and cancellations."
        right={
          <>
            <OutlineBtn label="Recognition Rules" icon="settings" onPress={u.editRules} />
            <OutlineBtn label="Export" icon="download" chevron onPress={u.exportSchedule} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <Trend d={u.d} />
        <Waterfall u={u} />
        <View style={styles.side}>
          <Position u={u} />
        </View>
      </View>
      <View style={styles.row}>
        <FinPanel icon="people" title={`Revenue Recognition Schedule (${num(u.d.recTotals.records)})`} right={<Filters u={u} />} style={styles.flex}>
          <DataTable columns={cols(u)} rows={u.rows} rowKey={(r) => r.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.manage} onRowPress={u.manage} />
          <PageStrip label={`Showing 1 – ${u.rows.length} of ${num(u.d.recTotals.records)} records`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </FinPanel>
        <View style={styles.side}>
          <Upcoming u={u} />
          <Policy u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: tiles, the revenue position, the flow and schedule cards. */
export function RecognitionPhone({ c }: { c: CommandData }) {
  const u = useRecognition(c.platformFinance.revenue);
  return (
    <FinPhone c={c} title="Revenue Recognition" subtitle="Cash received versus revenue earned.">
      <FinStats items={u.stats} phone title="Recognition at a Glance" />
      <View style={styles.inline}>
        <PrimaryBtn label="Recognition Rules" icon="settings" onPress={u.editRules} style={styles.flex} />
        <OutlineBtn label="Export" icon="download" onPress={u.exportSchedule} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <Position u={u} />
      <Waterfall u={u} phone />
      {u.rows.map((r) => {
        const l = u.line(r);
        return (
          <PhoneRow
            key={r.id}
            lead={r.avatar ? <Image source={r.avatar} style={styles.avatarLg} contentFit="cover" /> : <Icon name="building" size={26} color={NAVY} />}
            title={`${r.id} • ${r.customer}`}
            sub={`${r.type} • earned ${ugx(l.recognized)} • ${l.reversed ? `reversed ${ugx(l.reversed)}` : `deferred ${ugx(l.deferred)}`}${l.next ? ` • next ${date(l.next.date)}` : ''}`}
            pill={<Pill label={l.status} tone={STATUS_TONE[l.status]} size={11} />}
            onPress={() => u.manage(r)}
          />
        );
      })}
      <Trend d={u.d} phone />
      <Upcoming u={u} />
      <Policy u={u} />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  side: { width: 336, gap: 12 },
  trend: { flex: 1.3 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  search: { width: 250 },
  cell: { fontSize: 10.5, color: BODY },
  cellStrong: { flexShrink: 1, fontSize: 11.5, fontWeight: '700', color: NAVY },
  linkCell: { fontSize: 11, fontWeight: '600', color: BLUE },
  td: { fontSize: 12.5, color: NAVY },
  red: { color: RED },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
  avatar: { width: 26, height: 26, borderRadius: 13 },
  avatarLg: { width: 36, height: 36, borderRadius: 18 },
  fall: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, borderBottomWidth: 1, borderBottomColor: LINE },
  fallCol: { flex: 1, alignItems: 'stretch' },
  fallBar: { borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  fallValue: { height: LABEL_H, lineHeight: LABEL_H, textAlign: 'center', fontSize: 12, fontWeight: '800', color: NAVY },
  fallLabels: { flexDirection: 'row', gap: 14 },
  fallLabel: { flex: 1, textAlign: 'center', color: MUTED },
});
