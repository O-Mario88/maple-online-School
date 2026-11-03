import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, PageStrip, PrimaryBtn } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { agingBucket, agingSummary, balance, type Bucket, BUCKETS, type Commitment, commitmentStatus, type CommitmentStatus, nextAction, type NextAction, promise, recordCollection } from '@/features/command/logic/receivables';
import { Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, TONES, type Tone } from '@/features/portal/tokens';
import { type Column, DataTable, Search, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { ReceivableRow } from '@/mock/command-center/pf-revenue';

import { amount, type FormAsk, FormModal } from './FinForm';
import { FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, RingLegend, ugx } from './FinKit';

type D = CommandData['platformFinance']['revenue'];
const PER_PAGE = 10;
const TABS = ['Overview', 'Contracts', 'Invoices', 'Aging & Arrears', 'Collection Commitments', 'Forecast', 'Reports'] as const;
const BUCKET_TONE: Readonly<Record<Bucket, Tone>> = { Current: 'green', '31 – 60 Days': 'orange', '61 – 90 Days': 'orange', '> 90 Days': 'red' };
const BUCKET_COLOR: Readonly<Record<Bucket, string>> = { Current: '#22A55A', '31 – 60 Days': '#F5B731', '61 – 90 Days': '#F28A2E', '> 90 Days': '#E5484D' };
const PROMISE_TONE: Readonly<Record<CommitmentStatus, Tone>> = { 'On Track': 'green', 'At Risk': 'orange', Overdue: 'red', Kept: 'blue' };
const ACTION_ICON: Readonly<Record<NextAction, IconName>> = { '—': 'check', 'Send Reminder': 'send', 'Agree Payment': 'calendar', 'Follow Up': 'phone', 'Collection Plan': 'clipboard' };
const PROMO: Promo = { icon: 'building', color: '#1E6BF0', title: 'Enterprise Finance', body: 'Contracts, receivables, settlements and collections.' };
const FILTERS = { institution: ['All Institutions', 'Enterprise Plus', 'School Premium', 'School Standard'], status: ['All Statuses', ...BUCKETS] } as const;

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function useReceivables(d: D) {
  const [list, setList] = useState<readonly ReceivableRow[]>(d.receivables);
  const [promises, setPromises] = useState<readonly Commitment[]>(d.commitments);
  const [log, setLog] = useState<readonly { text: string; when: string }[]>(d.arActivity);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [plan, setPlan] = useState<string>(FILTERS.institution[0]);
  const [status, setStatus] = useState<string>(FILTERS.status[0]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [selected, toggle] = useSelection();
  const today = d.TODAY;
  const bucketOf = (r: ReceivableRow) => agingBucket(r, today);
  const promiseOf = (r: ReceivableRow) => promises.find((c) => c.receivable === r.id && !c.kept);
  const actionOf = (r: ReceivableRow) => {
    const c = promiseOf(r);
    return nextAction(bucketOf(r), c ? commitmentStatus(c, today) : undefined);
  };
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inTab = (r: ReceivableRow) => (tab === 'Aging & Arrears' ? agingBucket(r, today) !== 'Current' : tab === 'Collection Commitments' ? promises.some((c) => c.receivable === r.id) : true);
    return list.filter((r) => inTab(r) && (plan === FILTERS.institution[0] || r.plan === plan) && (status === FILTERS.status[0] || agingBucket(r, today) === status) && (!q || `${r.institution} ${r.id} ${r.plan}`.toLowerCase().includes(q)));
  }, [list, promises, tab, plan, status, query, today]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const note = (text: string) => setLog((l) => [{ text, when: 'Just now' }, ...l]);
  const owing = list.filter((r) => balance(r) > 0);

  const collect = (r?: ReceivableRow) =>
    setAsk({
      title: 'Record payment',
      body: 'Posts Dr 1100 Bank, Cr 1200 Accounts Receivable and reduces the institution balance. A matching promise to pay is marked kept.',
      fields: [
        { key: 'id', label: 'Institution', kind: 'choice', options: (r ? [r] : owing).map((x) => `${x.institution} • ${x.id}`) },
        { key: 'amount', label: 'Amount received (UGX)', kind: 'number', placeholder: '40000000' },
        { key: 'method', label: 'Method', kind: 'choice', options: ['Bank Transfer', 'MTN MoMo', 'Airtel Money', 'Cheque'] },
      ],
      confirm: 'Record Payment',
      onSubmit: (v) => {
        const target = list.find((x) => v.id?.endsWith(x.id));
        if (!target) return 'Choose an institution with a balance.';
        const n = amount(v.amount);
        const res = recordCollection(target, n);
        if (res.error) return res.error;
        setList((prev) => prev.map((x) => (x.id === target.id ? res.receivable : x)));
        setPromises((prev) => prev.map((c) => (c.receivable === target.id && !c.kept && n >= c.amount ? { ...c, kept: true } : c)));
        note(`Payment received: ${ugx(n)} – ${target.institution}`);
        toast(`${ugx(n)} recorded from ${target.institution} by ${v.method}. Balance now ${ugx(balance(res.receivable))}.`);
        return undefined;
      },
    });
  const remind = (r?: ReceivableRow) =>
    setAsk({
      title: 'Send reminder',
      body: 'The reminder goes to the institution’s finance contact with a statement of open invoices.',
      fields: [
        { key: 'id', label: 'Institution', kind: 'choice', options: (r ? [r] : owing).map((x) => `${x.institution} • ${ugx(balance(x))}`) },
        { key: 'channel', label: 'Send by', kind: 'choice', options: ['Email + SMS', 'Email', 'SMS'] },
      ],
      confirm: 'Send Reminder',
      onSubmit: (v) => {
        const target = (r ? [r] : owing).find((x) => v.id?.startsWith(x.institution));
        if (!target) return 'Choose an institution with a balance.';
        note(`Reminder sent: ${ugx(balance(target))} – ${target.institution}`);
        toast(`Reminder sent to ${target.institution} by ${v.channel}.`);
        return undefined;
      },
    });
  const pledge = (r: ReceivableRow) =>
    setAsk({
      title: `Promise to pay • ${r.institution}`,
      body: `Balance ${ugx(balance(r))}. The promise shows in Collection Commitments and moves the next action to agreed payment.`,
      fields: [
        { key: 'amount', label: 'Amount promised (UGX)', kind: 'number', initial: String(balance(r)) },
        { key: 'due', label: 'Promised date (YYYY-MM-DD)', kind: 'text', placeholder: '2026-11-20' },
      ],
      confirm: 'Save Promise',
      onSubmit: (v) => {
        const res = promise(r, amount(v.amount), (v.due ?? '').trim(), today);
        if (res.error || !res.commitment) return res.error ?? 'Enter the promise.';
        const c = res.commitment;
        setPromises((prev) => [...prev.filter((x) => x.receivable !== r.id || x.kept), c]);
        note(`Payment promise: ${ugx(c.amount)} – ${r.institution}`);
        toast(`Promise of ${ugx(c.amount)} by ${date(c.due)} saved for ${r.institution}.`);
        return undefined;
      },
    });
  const manage = (r: ReceivableRow) => {
    const act = actionOf(r);
    setAsk({
      title: r.institution,
      body: `${r.id} • ${r.plan}. Invoiced ${ugx(r.invoiced)}, paid ${ugx(r.paid)}, balance ${ugx(balance(r))} (${bucketOf(r)}). Next action: ${act}.`,
      fields: [{ key: 'action', label: 'Action', kind: 'choice', options: ['Record payment', 'Send reminder', 'Log promise to pay', 'Open invoices'] }],
      confirm: 'Continue',
      onSubmit: (v) => {
        if (v.action === 'Open invoices') {
          router.push('/command/finance/invoices');
          return undefined;
        }
        if (!balance(r)) return `${r.institution} has no balance to collect.`;
        // Close this dialog first, then open the next one.
        setTimeout(() => (v.action === 'Record payment' ? collect(r) : v.action === 'Send reminder' ? remind(r) : pledge(r)), 0);
        return undefined;
      },
    });
  };
  const doAction = (r: ReceivableRow) => {
    const act = actionOf(r);
    if (act === '—') return manage(r);
    if (act === 'Agree Payment' || act === 'Collection Plan') return pledge(r);
    if (act === 'Follow Up') {
      note(`Follow-up call logged: ${r.institution}`);
      return toast(`Follow-up logged for ${r.institution}. Their promise is due ${date(promiseOf(r)?.due ?? today)}.`);
    }
    return remind(r);
  };
  const exportAr = () => toast(`Aging report for ${shown.length} institutions exported (CSV).`);

  // KPIs: whole-platform figures plus the effect of this session's collections on the sample contracts.
  const live = agingSummary(list, today);
  const seed = agingSummary(d.receivables, today);
  const t = d.arTotals;
  const total = t.total + live.total - seed.total;
  const bucketTotal = (b: Bucket) => t[b] + (live.buckets.find((x) => x.bucket === b)?.amount ?? 0) - (seed.buckets.find((x) => x.bucket === b)?.amount ?? 0);
  const buckets = BUCKETS.map((b) => ({ bucket: b, amount: bucketTotal(b), pct: total ? (bucketTotal(b) / total) * 100 : 0 }));
  const stats: readonly Kpi[] = [{ ...d.arStats[0], value: ugx(total) }, ...buckets.map((b, i) => ({ ...d.arStats[i + 1], value: ugx(b.amount), caption: `${b.pct.toFixed(1)}%` })), d.arStats[5]];
  const debtors = [...list].sort((a, b) => balance(b) - balance(a)).filter((r) => balance(r) > 0 && bucketOf(r) !== 'Current').slice(0, 5);
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  return { d, list, rows, shown, tab, setTab: pick, plan, setPlan, status, setStatus, query, setQuery, page: p, pages, setPage, ask, setAsk, manage, collect, remind, doAction, exportAr, promises, log, stats, total, buckets, debtors, bucketOf, actionOf, selected, toggle };
}
type U = ReturnType<typeof useReceivables>;

function cols(u: U): readonly Column<ReceivableRow>[] {
  return [
    {
      label: 'Institution',
      flex: 1,
      render: (r) => (
        <View style={styles.inline}>
          <Icon name="building" size={20} color={NAVY} />
          <View style={styles.flex}>
            <Text style={styles.cellStrong} numberOfLines={1}>{r.institution}</Text>
            <Text style={styles.cell} numberOfLines={1}>{r.id}</Text>
          </View>
        </View>
      ),
    },
    { label: 'Contract / Plan', width: 122, align: 'center', render: (r) => <Pill label={r.plan} tone="blue" size={10} style={styles.nowrap} /> },
    { label: 'Contract Value', width: 94, align: 'right', render: (r) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{num(r.contractValue)}</Text> },
    { label: 'Invoiced (YTD)', width: 94, align: 'right', render: (r) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{num(r.invoiced)}</Text> },
    { label: 'Paid (YTD)', width: 88, align: 'right', render: (r) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{num(r.paid)}</Text> },
    { label: 'Balance (UGX)', width: 98, align: 'right', render: (r) => <Text style={[styles.cellStrong, styles.right]} numberOfLines={1}>{num(balance(r))}</Text> },
    { label: 'Aging', width: 96, align: 'center', render: (r) => <Pill label={u.bucketOf(r)} tone={BUCKET_TONE[u.bucketOf(r)]} size={10} style={styles.nowrap} /> },
    {
      label: 'Next Action',
      width: 128,
      align: 'center',
      render: (r) => {
        const act = u.actionOf(r);
        if (act === '—') return <Text style={[styles.cell, styles.center]}>—</Text>;
        return (
          <Pressable style={styles.act} onPress={() => u.doAction(r)} accessibilityRole="button" accessibilityLabel={`${act}: ${r.institution}`}>
            <Icon name={ACTION_ICON[act]} size={13} color={BLUE} />
            <Text style={styles.actText} numberOfLines={1}>{act}</Text>
          </Pressable>
        );
      },
    },
  ];
}

function Trend({ d, phone = false }: { d: D; phone?: boolean }) {
  const f = d.arTrend;
  return (
    <FinPanel icon="chart" title="Receivables Trend" style={!phone && styles.flex}>
      <ComboChart
        labels={f.labels}
        bars={[{ name: 'Receivables Balance', color: '#5B8DEF', values: f.balance }]}
        line={{ name: 'Collections', color: '#8B5CF6', values: f.collections, dots: true }}
        max={2}
        lineMax={2}
        rightAxis={false}
        every={phone ? 2 : 1}
        barWidth={phone ? 14 : 30}
        height={phone ? 190 : 170}
        format={(v) => `${v.toFixed(1)}B`}
      />
      <View style={styles.legend}>
        {(
          [
            ['Receivables Balance', '#5B8DEF'],
            ['Collections', '#8B5CF6'],
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

function Aging({ u, phone = false }: { u: U; phone?: boolean }) {
  const label = (b: Bucket) => (b === 'Current' ? 'Current (0 – 30 Days)' : b === '> 90 Days' ? 'Over 90 Days' : b);
  return (
    <FinPanel icon="poll" title="Aging Analysis" style={!phone && styles.flex}>
      <RingLegend
        phone={phone}
        size={150}
        center={`UGX ${(u.total / 1e9).toFixed(2)}B`}
        caption="Receivables"
        parts={u.buckets.map((b) => ({ label: label(b.bucket), value: b.amount, color: BUCKET_COLOR[b.bucket], display: `UGX ${(b.amount / 1e6).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}M` }))}
      />
    </FinPanel>
  );
}

function Debtors({ u }: { u: U }) {
  return (
    <FinPanel icon="people" title="Top Institutional Debtors" onAll={() => u.setTab('Aging & Arrears')}>
      {u.debtors.map((r) => (
        <View key={r.id} style={styles.line}>
          <Icon name="building" size={17} color={BLUE} />
          <Text style={[styles.td, styles.flex]} numberOfLines={2}>{r.institution}</Text>
          <Text style={styles.td}>{ugx(balance(r))}</Text>
          <Pill label={u.bucketOf(r)} tone={BUCKET_TONE[u.bucketOf(r)]} size={10.5} />
        </View>
      ))}
    </FinPanel>
  );
}

function Commitments({ u }: { u: U }) {
  const name = (id: string) => u.list.find((r) => r.id === id)?.institution ?? id;
  return (
    <FinPanel icon="calendar" title="Collection Commitments" onAll={() => u.setTab('Collection Commitments')}>
      {u.promises.map((c) => {
        const s = commitmentStatus(c, u.d.TODAY);
        return (
          <View key={c.id} style={styles.line}>
            <Icon name="calendar" size={18} color={BLUE} />
            <View style={styles.flex}>
              <Text style={styles.tdStrong}>{ugx(c.amount)}</Text>
              <Text style={styles.cell} numberOfLines={1}>{name(c.receivable)}</Text>
            </View>
            <Text style={styles.td}>{date(c.due)}</Text>
            <Pill label={s} tone={PROMISE_TONE[s]} size={10.5} />
          </View>
        );
      })}
    </FinPanel>
  );
}

function Activity({ u }: { u: U }) {
  return (
    <FinPanel icon="clock" title="Recent Collection Activity" onAll={() => toast(`${u.log.length} collection events this month.`)}>
      {u.log.slice(0, 4).map((a, i) => (
        <View key={`${a.text}-${i}`} style={styles.line}>
          <Icon name="check" size={16} color={TONES.green.solid} />
          <Text style={[styles.cell, styles.flex]} numberOfLines={2}>{a.text}</Text>
          <Text style={styles.cell}>{a.when}</Text>
        </View>
      ))}
    </FinPanel>
  );
}

function Filters({ u }: { u: U }) {
  const cycle = (list: readonly string[], v: string) => list[(list.indexOf(v) + 1) % list.length];
  return (
    <View style={styles.inline}>
      <OutlineBtn small chevron label={u.plan} onPress={() => u.setPlan(cycle(FILTERS.institution, u.plan))} />
      <OutlineBtn small chevron label={u.status} onPress={() => u.setStatus(cycle(FILTERS.status, u.status))} />
      <Search placeholder="Search by institution, contract or ID..." value={u.query} onChange={u.setQuery} style={styles.search} />
    </View>
  );
}

/** Maple Command › Finance › Enterprise Accounts Receivable on the desktop reference. */
export function ReceivablesDesk({ c }: { c: CommandData }) {
  const u = useReceivables(c.platformFinance.revenue);
  return (
    <FinDesk c={c} sub="Receivables" search="Search institutions, contracts, invoices, or reference..." promo={PROMO}>
      <FinHead
        icon="database"
        title="Enterprise Accounts Receivable"
        subtitle="Institutional contracts, subscription invoices, large payments and collections."
        right={
          <>
            <OutlineBtn label="Create Invoice" icon="plus" onPress={() => router.push('/command/finance/invoices')} />
            <OutlineBtn label="Record Payment" icon="wallet" onPress={() => u.collect()} />
            <OutlineBtn label="Send Reminder" icon="send" onPress={() => u.remind()} />
            <OutlineBtn label="Export" icon="download" chevron onPress={u.exportAr} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <View style={[styles.flex, styles.stack]}>
          <View style={styles.row}>
            <Trend d={u.d} />
            <Aging u={u} />
          </View>
          <FinPanel icon="building" title={`Institutional Receivables (${u.d.arTotals.contracts})`} right={<Filters u={u} />}>
            <DataTable columns={cols(u)} rows={u.rows} rowKey={(r) => r.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.manage} onRowPress={u.manage} />
            <PageStrip label={`Showing 1 – ${u.rows.length} of ${u.d.arTotals.contracts} institutions`} page={u.page} pages={u.pages} onPage={u.setPage} />
          </FinPanel>
        </View>
        <View style={styles.side}>
          <Debtors u={u} />
          <Commitments u={u} />
          <Activity u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: aging tiles, the ring, commitments and institution cards. */
export function ReceivablesPhone({ c }: { c: CommandData }) {
  const u = useReceivables(c.platformFinance.revenue);
  return (
    <FinPhone c={c} title="Receivables" subtitle="Institutional contracts, invoices and collections.">
      <FinStats items={u.stats} phone title="Receivables at a Glance" />
      <View style={styles.inline}>
        <PrimaryBtn label="Record Payment" icon="wallet" onPress={() => u.collect()} style={styles.flex} />
        <OutlineBtn label="Remind" icon="send" onPress={() => u.remind()} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <Aging u={u} phone />
      <Commitments u={u} />
      {u.rows.map((r) => (
        <PhoneRow
          key={r.id}
          lead={<Icon name="building" size={26} color={NAVY} />}
          title={r.institution}
          sub={`${r.id} • ${r.plan} • balance ${ugx(balance(r))} • ${u.actionOf(r) === '—' ? 'no action' : u.actionOf(r)}`}
          pill={<Pill label={u.bucketOf(r)} tone={BUCKET_TONE[u.bucketOf(r)]} size={11} />}
          onPress={() => u.manage(r)}
        />
      ))}
      <Trend d={u.d} phone />
      <Debtors u={u} />
      <Activity u={u} />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stack: { gap: 12 },
  side: { width: 400, gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  search: { width: 260 },
  cell: { fontSize: 10.5, color: BODY },
  cellStrong: { flexShrink: 1, fontSize: 11.5, fontWeight: '700', color: NAVY },
  td: { fontSize: 11.5, color: NAVY },
  tdStrong: { fontSize: 12.5, fontWeight: '800', color: NAVY },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  nowrap: { flexShrink: 0 },
  act: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 28, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: '#FFFFFF' },
  actText: { fontSize: 10.5, fontWeight: '700', color: BLUE },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
});
