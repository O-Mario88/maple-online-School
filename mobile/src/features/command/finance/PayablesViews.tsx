import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, PageStrip, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { adjust, awaiting, batchFor, disburse, type Eligibility, eligibility, type EntryLine, liability, MIN_PAYOUT, openDispute, owed, recordEarning, releaseReserve, resolveDispute, withdrawable } from '@/features/command/logic/payables';
import { Pill } from '@/features/portal/PortalParts';
import { BODY, LINE, NAVY, RED, TONES, type Tone } from '@/features/portal/tokens';
import { type Column, DataTable, Search, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { PayableRow } from '@/mock/command-center/pf-commercial';

import { amount, type FormAsk, FormModal } from './FinForm';
import { FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, RingLegend, SumLine, ugx } from './FinKit';

type D = CommandData['platformFinance']['commercial'];
const PER_PAGE = 10;
const TABS = ['Overview', 'Teacher Payables', 'Payouts', 'Reserves & Holds', 'Disputes', 'Liability Register', 'Reports', 'Settings'] as const;
const STATUS_TONE: Readonly<Record<Eligibility, Tone>> = { Eligible: 'green', 'Below Minimum': 'grey', 'On Hold': 'orange', Dispute: 'red' };
const PROMO: Promo = { icon: 'people', color: '#1E6BF0', title: 'Teacher Payables', body: 'Track teacher earnings, payouts, reserves, disputes and liabilities.' };
const RANGES = ['Last 10 Months', 'This Quarter', 'Year to Date'];
const FILTERS = { subject: ['All Subjects', 'Mathematics', 'Physics', 'English', 'Chemistry', 'Biology', 'ICT', 'Primary'], status: ['All Statuses', 'Eligible', 'Below Minimum', 'On Hold', 'Dispute'] } as const;
const PARTS = [
  { key: 'awaiting', label: 'Awaiting Release', color: '#2563EB' },
  { key: 'reserve', label: 'Reserves / Holds', color: '#F5B731' },
  { key: 'dispute', label: 'Disputes', color: '#E5484D' },
] as const;

const journalText = (e: readonly EntryLine[]) => e.map((l) => `${l.debit ? 'Dr' : 'Cr'} ${l.account} ${num(l.debit || l.credit)}`).join(', ');

function usePayables(d: D, approvers: readonly string[]) {
  const [list, setList] = useState<readonly PayableRow[]>(d.teachers);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [subject, setSubject] = useState<string>(FILTERS.subject[0]);
  const [status, setStatus] = useState<string>(FILTERS.status[0]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [processed, setProcessed] = useState(false);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inTab = (t: PayableRow) => {
      if (tab === 'Payouts') return withdrawable(t) > 0;
      if (tab === 'Reserves & Holds') return t.reserve > 0 || Boolean(t.hold);
      if (tab === 'Disputes') return t.dispute > 0;
      if (tab === 'Liability Register') return owed(t) > 0;
      return true;
    };
    return list.filter((t) => inTab(t) && (subject === FILTERS.subject[0] || t.subject === subject) && (status === FILTERS.status[0] || eligibility(t) === status) && (!q || `${t.name} ${t.id} ${t.subject}`.toLowerCase().includes(q)));
  }, [list, tab, subject, status, query]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const update = (t: PayableRow) => setList((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  const find = (label: string | undefined) => list.find((t) => label?.endsWith(t.id));
  const pickList = (xs: readonly PayableRow[]) => xs.map((t) => `${t.name} • ${t.id}`);

  const adjustment = (only?: PayableRow) =>
    setAsk({
      title: 'Record adjustment',
      body: 'Adjustments go through a journal entry against 2300 Teacher Payables. Use a negative amount to reduce earnings.',
      fields: [
        { key: 'teacher', label: 'Teacher', kind: 'choice', options: pickList(only ? [only] : list) },
        { key: 'amount', label: 'Amount (UGX, negative to reduce)', kind: 'text', placeholder: '-600000' },
        { key: 'reason', label: 'Reason', kind: 'text', placeholder: 'Class refunded to the parent' },
      ],
      confirm: 'Post Adjustment',
      onSubmit: (v) => {
        const t = find(v.teacher);
        if (!t) return 'Choose a teacher.';
        const raw = (v.amount ?? '').trim();
        const n = raw.startsWith('-') ? -amount(raw.slice(1)) : amount(raw);
        const r = adjust(t, n, v.reason ?? '');
        if (r.error || !r.payable) return r.error;
        update(r.payable);
        toast(`Adjustment posted for ${t.name}: ${journalText(r.entry ?? [])}.`);
        return undefined;
      },
    });
  const payBatch = (targets: readonly PayableRow[], label: string) => {
    const b = batchFor(targets);
    if (!b.teachers) return toast('Nobody in this selection can be paid: they are on hold, in dispute or below the minimum payout.');
    setAsk({
      title: label,
      body: `${b.teachers} teacher${b.teachers > 1 ? 's' : ''} • ${ugx(b.total)}. ${b.skipped ? `${b.skipped} skipped (hold, dispute or below ${ugx(MIN_PAYOUT)}). ` : ''}Payouts above UGX 2,000,000 need a second approver.`,
      fields: [
        { key: 'channel', label: 'Pay by', kind: 'choice', options: ['Mobile Money (MTN / Airtel)', 'Bank Transfer'] },
        { key: 'second', label: 'Second approver', kind: 'choice', options: ['Choose approver', ...approvers] },
      ],
      confirm: 'Approve & Pay',
      onSubmit: (v) => {
        if (b.total > 2_000_000 && v.second === 'Choose approver') return 'Choose the second approver for this batch.';
        const paid = targets.map((t) => {
          const r = disburse(t, withdrawable(t));
          return r.payable ?? t;
        });
        setList((prev) => prev.map((x) => paid.find((y) => y.id === x.id) ?? x));
        setProcessed(true);
        toast(`${ugx(b.total)} sent to ${b.teachers} teachers by ${v.channel}. Journal: Dr 2300 Teacher Payables, Cr 1100 Bank – Payouts.`);
        return undefined;
      },
    });
  };
  const bulk = () => payBatch(selected.size ? list.filter((t) => selected.has(t.id)) : shown, selected.size ? `Pay ${selected.size} selected teachers` : 'Bulk payout (this view)');
  const processAll = () => payBatch(list, 'Process payouts • Batch #PB-2026-041');
  const manage = (t: PayableRow) => {
    const s = eligibility(t);
    const options = [
      ...(s === 'Eligible' ? ['Pay out now'] : []),
      ...(t.dispute ? ['Resolve dispute: teacher is right', 'Resolve dispute: reverse earnings'] : awaiting(t) ? ['Open dispute'] : []),
      ...(t.hold ? ['Requirement received: clear hold'] : []),
      ...(t.reserve ? ['Release reserve'] : []),
      'Record earning',
      'Record adjustment',
    ];
    setAsk({
      title: `${t.name} • ${t.id}`,
      body: `${t.subject}, ${t.sessions} sessions. Earned ${ugx(t.earned)}, paid ${ugx(t.paid)}. Owed ${ugx(owed(t))}: awaiting ${ugx(awaiting(t))}, reserve ${ugx(t.reserve)}, dispute ${ugx(t.dispute)}. Can withdraw now: ${ugx(withdrawable(t))}${t.hold ? ` (on hold: ${t.hold})` : ''}.`,
      fields: [
        { key: 'action', label: 'Action', kind: 'choice', options },
        { key: 'amount', label: 'Amount (UGX, for payouts, earnings, disputes and reserves)', kind: 'number', placeholder: String(awaiting(t) || 1_000_000) },
      ],
      confirm: 'Apply',
      onSubmit: (v) => {
        const n = amount(v.amount);
        if (v.action === 'Pay out now') {
          const r = disburse(t, n || withdrawable(t));
          if (r.error || !r.payable) return r.error;
          update(r.payable);
          toast(`${ugx(n || withdrawable(t))} paid to ${t.name}. ${journalText(r.entry ?? [])}.`);
          return undefined;
        }
        if (v.action === 'Open dispute') {
          const r = openDispute(t, n);
          if (r.error || !r.payable) return r.error;
          update(r.payable);
          toast(`${ugx(n)} of ${t.name}'s earnings held in dispute. It stays in the liability register.`);
          return undefined;
        }
        if (v.action?.startsWith('Resolve dispute')) {
          const wins = v.action.endsWith('teacher is right');
          const r = resolveDispute(t, wins);
          update(r.payable);
          toast(wins ? `Dispute closed in ${t.name}'s favour; ${ugx(t.dispute)} is payable again.` : `Dispute closed; ${ugx(t.dispute)} reversed. ${journalText(r.entry ?? [])}.`);
          return undefined;
        }
        if (v.action === 'Requirement received: clear hold') {
          update({ ...t, hold: undefined });
          toast(`${t.name}'s hold is cleared (${t.hold}). ${ugx(awaiting(t))} is now eligible.`);
          return undefined;
        }
        if (v.action === 'Release reserve') {
          const next = releaseReserve(t, n || t.reserve);
          update(next);
          toast(`${ugx(t.reserve - next.reserve)} of reserve released to ${t.name}'s payable balance.`);
          return undefined;
        }
        if (v.action === 'Record earning') {
          if (!n) return 'Enter the earning amount.';
          const r = recordEarning(t, n);
          update(r.payable);
          toast(`Earning of ${ugx(n)} recorded for ${t.name}; ${ugx(r.payable.reserve - t.reserve)} held in reserve. ${journalText(r.entry)}.`);
          return undefined;
        }
        setTimeout(() => adjustment(t), 0);
        return undefined;
      },
    });
  };
  const exportList = () => toast(`Teacher liability register exported: ${shown.length} teachers (CSV).`);

  // Platform totals plus what this session changed on the sample teachers.
  const live = liability(list);
  const seed = liability(d.teachers);
  const t0 = d.tpTotals;
  const sums = { awaiting: t0.awaiting + live.awaiting - seed.awaiting, reserve: t0.reserve + live.reserve - seed.reserve, dispute: t0.dispute + live.dispute - seed.dispute };
  const total = sums.awaiting + sums.reserve + sums.dispute;
  const sum = (xs: readonly PayableRow[], f: (t: PayableRow) => number) => xs.reduce((s, t) => s + f(t), 0);
  const earnedDelta = sum(list, (t) => t.earned) - sum(d.teachers, (t) => t.earned);
  const paidDelta = sum(list, (t) => t.paid) - sum(d.teachers, (t) => t.paid);
  const stats: readonly Kpi[] = [
    { ...d.tpStats[0], value: ugx(3_486_750_000 + earnedDelta) },
    { ...d.tpStats[1], value: ugx(2_764_600_000 + paidDelta) },
    { ...d.tpStats[2], value: ugx(sums.awaiting) },
    { ...d.tpStats[3], value: ugx(sums.reserve) },
    { ...d.tpStats[4], value: ugx(sums.dispute) },
    { ...d.tpStats[5], value: ugx(total) },
  ];
  const count = (xs: readonly PayableRow[], s: Eligibility | Eligibility[]) => xs.filter((t) => (Array.isArray(s) ? s : [s]).includes(eligibility(t))).length;
  const elig = {
    eligible: t0.eligible + count(list, 'Eligible') - count(d.teachers, 'Eligible'),
    pending: t0.pending + count(list, 'Below Minimum') - count(d.teachers, 'Below Minimum'),
    onHold: t0.onHold + count(list, ['On Hold', 'Dispute']) - count(d.teachers, ['On Hold', 'Dispute']),
  };
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  return { d, rows, shown, tab, setTab: pick, subject, setSubject, status, setStatus, query, setQuery, page: p, pages, setPage, ask, setAsk, manage, adjustment, bulk, processAll, exportList, processed, stats, sums, total, elig, selected, toggle };
}
type U = ReturnType<typeof usePayables>;

function cols(): readonly Column<PayableRow>[] {
  const money = (n: number, red = false) => <Text style={[styles.cell, styles.right, red && n > 0 && styles.red]} numberOfLines={1}>{num(n)}</Text>;
  return [
    {
      label: 'Teacher',
      flex: 1,
      render: (t) => (
        <View style={styles.inline}>
          <Image source={t.photo} style={styles.avatar} contentFit="cover" accessibilityIgnoresInvertColors />
          <View style={styles.flex}>
            <Text style={styles.cellStrong} numberOfLines={1}>{t.name}</Text>
            <Text style={styles.cell} numberOfLines={1}>{t.subject}</Text>
          </View>
        </View>
      ),
    },
    { label: 'Teacher ID', width: 80, render: (t) => <Text style={styles.cell} numberOfLines={1}>{t.id}</Text> },
    { label: 'Classes', width: 56, align: 'center', render: (t) => <Text style={[styles.cell, styles.center]}>{t.sessions}</Text> },
    { label: 'Earned (YTD)', width: 82, align: 'right', render: (t) => money(t.earned) },
    { label: 'Paid (YTD)', width: 82, align: 'right', render: (t) => money(t.paid) },
    { label: 'Awaiting Release', width: 82, align: 'right', render: (t) => money(awaiting(t)) },
    { label: 'Reserve / Hold', width: 76, align: 'right', render: (t) => money(t.reserve) },
    { label: 'Dispute', width: 70, align: 'right', render: (t) => money(t.dispute, true) },
    { label: 'Balance (Liability)', width: 86, align: 'right', render: (t) => <Text style={[styles.cellStrong, styles.right]} numberOfLines={1}>{num(owed(t))}</Text> },
    { label: 'Status', width: 84, align: 'center', render: (t) => <Pill label={eligibility(t)} tone={STATUS_TONE[eligibility(t)]} size={10} /> },
  ];
}

function Trend({ d, phone = false }: { d: D; phone?: boolean }) {
  const f = d.tpTrend;
  const [range, setRange] = useState(RANGES[0]);
  return (
    <FinPanel icon="chart" title="Teacher Earnings & Payouts Trend" style={!phone && styles.trend} right={phone ? undefined : <RangeBox value={range} options={RANGES} onChange={setRange} width={176} />}>
      <ComboChart
        labels={f.labels}
        bars={[
          { name: 'Earnings', color: '#3B82F6', values: f.earnings },
          { name: 'Payouts', color: '#A78BFA', values: f.payouts },
        ]}
        line={{ name: 'Outstanding Payables', color: '#22A55A', values: f.outstanding, dots: true }}
        max={400}
        lineMax={400}
        rightAxis={false}
        every={phone ? 2 : 1}
        height={phone ? 190 : 162}
        format={(v) => (v ? `${Math.round(v)}M` : '0')}
      />
      <View style={styles.legend}>
        {(
          [
            ['Earnings', '#3B82F6'],
            ['Payouts', '#A78BFA'],
            ['Outstanding Payables', '#22A55A'],
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

function StatusRing({ u, phone = false }: { u: U; phone?: boolean }) {
  return (
    <FinPanel icon="poll" title="Payable Status (UGX)" style={!phone && styles.flex}>
      <RingLegend phone={phone} size={150} center={`UGX ${(u.total / 1e6).toFixed(1)}M`} caption="Total Liability" parts={PARTS.map((x) => ({ label: x.label, value: u.sums[x.key], color: x.color, display: `UGX ${(u.sums[x.key] / 1e6).toFixed(1)}M` }))} />
    </FinPanel>
  );
}

function EligibilityPanel({ u }: { u: U }) {
  const rows: readonly { icon: IconName; tone: Tone; label: string; value: number }[] = [
    { icon: 'check', tone: 'green', label: 'Eligible for Payout', value: u.elig.eligible },
    { icon: 'clock', tone: 'orange', label: 'Pending Requirements', value: u.elig.pending },
    { icon: 'close', tone: 'red', label: 'On Hold (Reserve / Dispute)', value: u.elig.onHold },
  ];
  return (
    <FinPanel icon="people" title="Payout Eligibility">
      {rows.map((r) => (
        <View key={r.label} style={styles.line}>
          <Icon name={r.icon} size={17} color={TONES[r.tone].solid} />
          <Text style={[styles.td, styles.flex]}>{r.label}</Text>
          <Text style={styles.tdStrong}>{`${num(r.value)} teachers`}</Text>
        </View>
      ))}
      <PrimaryBtn label="View Eligible Teachers" icon="arrowRight" onPress={() => u.setTab('Payouts')} />
    </FinPanel>
  );
}

function Batches({ u }: { u: U }) {
  return (
    <FinPanel icon="calendar" title="Upcoming Payout Batches" onAll={() => u.setTab('Payouts')}>
      {u.d.tpBatches.map((b, i) => {
        const done = i === 0 && u.processed;
        return (
          <View key={b.id} style={styles.line}>
            <Icon name="calendar" size={18} color={TONES.blue.solid} />
            <View style={styles.flex}>
              <Text style={styles.tdStrong}>{`Batch #${b.id}`}</Text>
              <Text style={styles.cell}>{`${num(b.teachers)} teachers • ${ugx(b.amount)}`}</Text>
            </View>
            <View style={styles.batchEnd}>
              <Pill label={done ? 'Paid' : b.status} tone={done ? 'green' : b.status === 'Scheduled' ? 'blue' : 'orange'} size={10.5} />
              <Text style={styles.cell}>{b.date}</Text>
            </View>
          </View>
        );
      })}
    </FinPanel>
  );
}

function Breakdown({ u }: { u: U }) {
  const pct = (n: number) => `${((n / u.total) * 100).toFixed(1)}%`;
  return (
    <FinPanel icon="layers" title="Liability Breakdown">
      <SumLine icon="clock" tone="blue" label={`Awaiting Release (Earnings Due) • ${pct(u.sums.awaiting)}`} value={ugx(u.sums.awaiting)} />
      <SumLine icon="shield" tone="orange" label={`Reserves / Withholding • ${pct(u.sums.reserve)}`} value={ugx(u.sums.reserve)} />
      <SumLine icon="alert" tone="red" label={`Disputes (Under Review) • ${pct(u.sums.dispute)}`} value={ugx(u.sums.dispute)} />
      <SumLine icon="layers" tone="orange" strong label="Total Teacher Liability" value={ugx(u.total)} />
    </FinPanel>
  );
}

function Filters({ u }: { u: U }) {
  const cycle = (xs: readonly string[], v: string) => xs[(xs.indexOf(v) + 1) % xs.length];
  return (
    <View style={styles.inline}>
      <OutlineBtn small chevron label={u.subject} onPress={() => u.setSubject(cycle(FILTERS.subject, u.subject))} />
      <OutlineBtn small chevron label={u.status} onPress={() => u.setStatus(cycle(FILTERS.status, u.status))} />
      <Search placeholder="Search by teacher, ID or subject..." value={u.query} onChange={u.setQuery} style={styles.search} />
    </View>
  );
}

/** Maple Command › Finance › Teacher Payables & Liability Register on the desktop reference. */
export function PayablesDesk({ c }: { c: CommandData }) {
  const u = usePayables(c.platformFinance.commercial, c.platformFinance.corporate.approvers);
  return (
    <FinDesk c={c} sub="Teacher Payables" search="Search by teacher, class, course, payout, or reference..." promo={PROMO}>
      <FinHead
        icon="people"
        title="Teacher Payables & Liability Register"
        subtitle="Detailed record of teacher earnings, pending payouts, reserves, eligibility, disputes and total liabilities."
        right={
          <>
            <OutlineBtn label="Record Adjustment" icon="plus" onPress={() => u.adjustment()} />
            <OutlineBtn label="Bulk Payout" icon="wallet" onPress={u.bulk} />
            <OutlineBtn label="Export" icon="download" chevron onPress={u.exportList} />
            <PrimaryBtn label="Process Payouts" icon="send" onPress={u.processAll} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <Trend d={u.d} />
        <StatusRing u={u} />
        <View style={styles.side}>
          <EligibilityPanel u={u} />
        </View>
      </View>
      <View style={styles.row}>
        <FinPanel icon="people" title={`Teacher Payables (${num(u.d.tpTotals.teachers)})`} right={<Filters u={u} />} style={styles.flex}>
          <DataTable columns={cols()} rows={u.rows} rowKey={(t) => t.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.manage} onRowPress={u.manage} />
          {u.rows.length ? null : <Text style={styles.cell}>No teachers on this tab.</Text>}
          <PageStrip label={`Showing 1 – ${u.rows.length} of ${num(u.d.tpTotals.teachers)} teachers`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </FinPanel>
        <View style={styles.side}>
          <Batches u={u} />
          <Breakdown u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: liability tiles, eligibility, the register as cards. */
export function PayablesPhone({ c }: { c: CommandData }) {
  const u = usePayables(c.platformFinance.commercial, c.platformFinance.corporate.approvers);
  return (
    <FinPhone c={c} title="Teacher Payables" subtitle="Earnings, payouts, reserves, disputes and liability.">
      <FinStats items={u.stats} phone title="Liability at a Glance" />
      <View style={styles.inline}>
        <PrimaryBtn label="Process Payouts" icon="send" onPress={u.processAll} style={styles.flex} />
        <OutlineBtn label="Adjust" icon="plus" onPress={() => u.adjustment()} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <EligibilityPanel u={u} />
      <Breakdown u={u} />
      {u.rows.map((t) => (
        <PhoneRow
          key={t.id}
          lead={<Image source={t.photo} style={styles.avatarLg} contentFit="cover" />}
          title={t.name}
          sub={`${t.subject} • owed ${ugx(owed(t))} • can withdraw ${ugx(withdrawable(t))}${t.dispute ? ` • dispute ${ugx(t.dispute)}` : ''}`}
          pill={<Pill label={eligibility(t)} tone={STATUS_TONE[eligibility(t)]} size={11} />}
          onPress={() => u.manage(t)}
        />
      ))}
      <StatusRing u={u} phone />
      <Batches u={u} />
      <Trend d={u.d} phone />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  side: { width: 360, gap: 12 },
  trend: { flex: 1.25 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  search: { width: 240 },
  cell: { fontSize: 10.5, color: BODY },
  cellStrong: { flexShrink: 1, fontSize: 11, fontWeight: '700', color: NAVY },
  td: { fontSize: 12, color: NAVY },
  tdStrong: { fontSize: 12, fontWeight: '800', color: NAVY },
  red: { color: RED },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
  batchEnd: { alignItems: 'flex-end', gap: 4 },
  avatar: { width: 28, height: 28, borderRadius: 14 },
  avatarLg: { width: 38, height: 38, borderRadius: 19 },
});
