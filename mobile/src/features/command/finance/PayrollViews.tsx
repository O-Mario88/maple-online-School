import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, PageStrip, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { approveRun, changeSalary, payrollJournal, payslip, type Run, runTotals, statutory, variance } from '@/features/command/logic/payroll';
import { Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, TONES, type Tone } from '@/features/portal/tokens';
import { type Column, DataTable, Search, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { StaffRow } from '@/mock/command-center/pf-corporate';

import { amount, type FormAsk, FormModal } from './FinForm';
import { FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, RingLegend, SumLine, ugx } from './FinKit';

type D = CommandData['platformFinance']['corporate'];
type PayRun = D['runs'][number];
const PER_PAGE = 10;
const TABS = ['Overview', 'Payroll Runs', 'Employees', 'Earnings & Benefits', 'Deductions', 'Statutory Obligations', 'Payroll Journals', 'Reports', 'Settings'] as const;
const RUN_TONE: Readonly<Record<Run['status'], Tone>> = { Draft: 'grey', Pending: 'orange', Approved: 'green', Paid: 'blue' };
const DEPT_TONE: readonly Tone[] = ['blue', 'purple', 'green', 'orange', 'red', 'purple', 'green', 'blue'];
const PROMO: Promo = { icon: 'people', color: '#1E6BF0', title: 'Corporate Payroll', body: 'Manage staff salaries, benefits, deductions, statutory payments and payroll journals.' };
const RANGES = ['Last 12 Months', 'This Year'];
const FILTERS = { employment: ['All Employment Types', 'Permanent', 'Contract'] } as const;
const MASK = '••••••';

function usePayroll(d: D, me: string) {
  const [list, setList] = useState<readonly StaffRow[]>(d.staff);
  const [runs, setRuns] = useState<readonly PayRun[]>(d.runs);
  const [statPaid, setStatPaid] = useState(false);
  const [masked, setMasked] = useState(false);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [employment, setEmployment] = useState<string>(FILTERS.employment[0]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = list.filter((s) => (employment === FILTERS.employment[0] || s.employment === employment) && (!q || `${s.name} ${s.id} ${s.department}`.toLowerCase().includes(q)));
    if (tab === 'Deductions') return [...rows].sort((a, b) => payslip(b).deductions - payslip(a).deductions);
    if (tab === 'Earnings & Benefits') return [...rows].sort((a, b) => b.gross - a.gross);
    return rows;
  }, [list, employment, query, tab]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const updateRun = (r: PayRun) => setRuns((prev) => prev.map((x) => (x.period === r.period ? r : x)));

  // Company totals plus what this session changed on the sample staff.
  const live = runTotals(list);
  const seed = runTotals(d.staff);
  const t0 = d.payTotals;
  const tot = {
    gross: t0.gross + live.gross - seed.gross,
    paye: t0.paye + live.paye - seed.paye,
    nssfEmployee: t0.nssfEmployee + live.nssfEmployee - seed.nssfEmployee,
    wht: t0.wht + live.wht - seed.wht,
    deductions: t0.deductions + live.deductions - seed.deductions,
    net: t0.net + live.net - seed.net,
    nssfEmployer: t0.nssfEmployer + live.nssfEmployer - seed.nssfEmployer,
    benefits: t0.benefits + live.benefits - seed.benefits,
    cost: t0.cost + live.cost - seed.cost,
  };
  const stat = statutory(tot);
  const checks = variance(list, d.previousGross);

  const runPayroll = () => {
    const nov = runs.find((r) => r.period === 'Nov 2026');
    if (!nov || nov.status !== 'Draft') return toast(`Nov 2026 payroll is already ${nov?.status.toLowerCase() ?? 'submitted'}.`);
    const flagged = checks.map((v) => `${list.find((s) => s.id === v.id)?.name ?? v.id}: ${v.reason}`);
    setAsk({
      title: 'Run payroll • Nov 2026',
      body: `${num(t0.employees)} employees. Gross ${ugx(tot.gross)}, deductions ${ugx(tot.deductions)}, net pay ${ugx(tot.net)}, total cost ${ugx(tot.cost)}. Variance check against October: ${flagged.length ? flagged.join('; ') : 'no changes above 10%'}.`,
      fields: [{ key: 'confirm', label: 'Variance reviewed', kind: 'choice', options: flagged.length ? ['Reviewed – changes are expected', 'Not yet reviewed'] : ['No variances to review'] }],
      confirm: 'Submit for Approval',
      onSubmit: (v) => {
        if (v.confirm === 'Not yet reviewed') return 'Review each flagged change before submitting the run.';
        updateRun({ ...nov, amount: tot.cost, status: 'Pending' });
        toast(`Nov 2026 payroll (${ugx(tot.cost)}) prepared by ${nov.preparedBy} and sent for two approvals.`);
        return undefined;
      },
    });
  };
  const approvals = () => {
    const open = runs.filter((r) => r.status === 'Pending' || r.status === 'Draft');
    if (!open.length) return toast('No payroll runs are waiting for approval.');
    setAsk({
      title: 'Payroll approvals',
      body: 'Each run needs two different approvers, and the person who prepared it cannot approve it.',
      fields: [
        { key: 'run', label: 'Payroll run', kind: 'choice', options: open.map((r) => `${r.label} • ${ugx(r.amount)}`) },
        { key: 'as', label: 'Approve as', kind: 'choice', options: [me, ...d.approvers, d.preparer] },
      ],
      confirm: 'Approve',
      onSubmit: (v) => {
        const r = open.find((x) => v.run?.startsWith(x.label));
        if (!r) return 'Choose a run.';
        if (r.status === 'Draft') return `${r.label} has not been run yet. Use Run Payroll first.`;
        const res = approveRun(r, v.as ?? me);
        if (res.error || !res.run) return res.error;
        const next = { ...r, ...res.run };
        updateRun(next);
        toast(next.status === 'Approved' ? `${r.label} approved by ${next.approvals.join(' and ')}. Journal ready: ${payrollJournal(tot).filter((l) => l.debit || l.credit).length} lines, balanced at ${ugx(tot.cost)}.` : `${r.label}: first approval by ${v.as}. One more approver is needed.`);
        return undefined;
      },
    });
  };
  const payStatutory = () =>
    setAsk({
      title: 'Statutory payments • Oct 2026',
      body: `Due by Nov 15, 2026. PAYE ${ugx(stat.paye)} and WHT ${ugx(stat.wht)} to URA; NSSF ${ugx(stat.nssf)} (employee 5% + employer 10%).`,
      fields: [{ key: 'ref', label: 'Payment reference (PRN)', kind: 'text', placeholder: '2260001234567' }],
      confirm: 'Record Payment',
      onSubmit: (v) => {
        if (!(v.ref ?? '').trim()) return 'Enter the URA / NSSF payment reference.';
        setStatPaid(true);
        toast(`Statutory payments of ${ugx(stat.total)} recorded (ref ${(v.ref ?? '').trim()}). Dr 2200/2210/2220 payables, Cr 1100 Bank.`);
        return undefined;
      },
    });
  const showPayslip = (s: StaffRow) => {
    const ps = payslip(s);
    setAsk({
      title: `Payslip • ${s.name} • Oct 2026`,
      body: `Confidential. ${s.id}, ${s.department}, ${s.employment}. Gross ${ugx(ps.gross)} − PAYE ${ugx(ps.paye)} − NSSF ${ugx(ps.nssfEmployee)}${ps.wht ? ` − WHT ${ugx(ps.wht)}` : ''} = net ${ugx(ps.net)}. Employer adds NSSF ${ugx(ps.nssfEmployer)} and benefits ${ugx(ps.benefits)}. Salary history: ${s.history.map((h) => `${h.effective} ${num(h.gross)} (${h.reason})`).join('; ')}.`,
      fields: [{ key: 'action', label: 'Action', kind: 'choice', options: ['Close', 'Change salary', 'Email payslip to employee'] }],
      confirm: 'Continue',
      onSubmit: (v) => {
        if (v.action === 'Change salary') {
          setTimeout(() => salary(s), 0);
          return undefined;
        }
        if (v.action === 'Email payslip to employee') toast(`Payslip sent to ${s.name} as a password-protected PDF.`);
        return undefined;
      },
    });
    toast(`Payslip view by ${me} logged to the audit trail.`);
  };
  const salary = (s: StaffRow) =>
    setAsk({
      title: `Change salary • ${s.name}`,
      body: `Current gross ${ugx(s.gross)}. Every change is kept in salary history; rises above 20% need Finance Director approval.`,
      fields: [
        { key: 'gross', label: 'New gross salary (UGX)', kind: 'number', initial: String(s.gross) },
        { key: 'effective', label: 'Effective (YYYY-MM-DD)', kind: 'text', initial: '2026-11-01' },
        { key: 'reason', label: 'Reason', kind: 'text', placeholder: 'Promotion to Lead Engineer' },
        { key: 'approved', label: 'Director approval (for rises above 20%)', kind: 'choice', options: ['Not needed', `Approved by ${me}`] },
      ],
      confirm: 'Save Change',
      onSubmit: (v) => {
        const r = changeSalary(s, amount(v.gross), (v.effective ?? '').trim(), v.reason ?? '', v.approved === 'Not needed' ? undefined : me);
        if (r.error || !r.staff) return r.error;
        const next = r.staff;
        setList((prev) => prev.map((x) => (x.id === s.id ? next : x)));
        toast(`${s.name}: gross ${ugx(s.gross)} → ${ugx(next.gross)} from ${v.effective}. Net pay now ${ugx(payslip(next).net)}.`);
        return undefined;
      },
    });
  const reveal = () => {
    setMasked((m) => !m);
    toast(masked ? `Salaries shown. View by ${me} logged.` : 'Salaries hidden for screen sharing.');
  };
  const exportList = () => toast(`Payroll register exported without salary columns (${shown.length} employees). Salary exports need Director approval.`);

  const stats: readonly Kpi[] = [
    { ...d.payStats[0], value: ugx(tot.cost) },
    d.payStats[1],
    { ...d.payStats[2], value: ugx(tot.gross) },
    { ...d.payStats[3], value: ugx(tot.deductions) },
    { ...d.payStats[4], value: ugx(tot.benefits) },
    { ...d.payStats[5], value: ugx(stat.total) },
    { ...d.payStats[6], value: ugx(tot.net) },
  ];
  return { d, rows, shown, tab, setTab, employment, setEmployment, query, setQuery, page: p, pages, setPage, ask, setAsk, runs, runPayroll, approvals, payStatutory, statPaid, showPayslip, masked, reveal, exportList, stats, tot, stat, checks, selected, toggle };
}
type U = ReturnType<typeof usePayroll>;

function cols(u: U): readonly Column<StaffRow>[] {
  const money = (n: number, strong = false) => <Text style={[strong ? styles.cellStrong : styles.cell, styles.right]} numberOfLines={1}>{u.masked ? MASK : num(n)}</Text>;
  const tone = (s: StaffRow) => DEPT_TONE[u.d.staff.findIndex((x) => x.id === s.id) % DEPT_TONE.length] ?? 'blue';
  return [
    {
      label: 'Employee',
      flex: 1,
      render: (s) => (
        <View style={styles.inline}>
          <Image source={s.photo} style={styles.avatar} contentFit="cover" accessibilityIgnoresInvertColors />
          <Text style={styles.cellStrong} numberOfLines={1}>{s.name}</Text>
        </View>
      ),
    },
    { label: 'Staff ID', width: 66, render: (s) => <Text style={styles.cell}>{s.id}</Text> },
    { label: 'Department', width: 140, align: 'center', render: (s) => <Pill label={s.department} tone={tone(s)} size={9.5} /> },
    { label: 'Type', width: 70, align: 'center', render: (s) => <Text style={[styles.cell, styles.center]}>{s.employment}</Text> },
    { label: 'Gross (UGX)', width: 84, align: 'right', render: (s) => money(s.gross) },
    { label: 'Deductions', width: 80, align: 'right', render: (s) => money(payslip(s).deductions) },
    { label: 'Net Pay (UGX)', width: 86, align: 'right', render: (s) => money(payslip(s).net, true) },
    { label: 'Employer Cost', width: 86, align: 'right', render: (s) => money(payslip(s).cost) },
    {
      label: 'Check',
      width: 64,
      align: 'center',
      render: (s) => {
        const flag = u.checks.find((v) => v.id === s.id);
        return <Pill label={flag ? `${flag.change > 0 ? '+' : ''}${flag.change}%` : 'OK'} tone={flag ? 'orange' : 'green'} size={10} />;
      },
    },
  ];
}

function Trend({ d, phone = false }: { d: D; phone?: boolean }) {
  const f = d.payTrend;
  const [range, setRange] = useState(RANGES[0]);
  return (
    <FinPanel icon="chart" title="Payroll Trend (Total Cost)" style={!phone && styles.trend} right={phone ? undefined : <RangeBox value={range} options={RANGES} onChange={setRange} width={176} />}>
      <ComboChart labels={f.labels} bars={[{ name: 'Net Pay', color: '#3B82F6', values: f.net }]} line={{ name: 'Total Payroll Cost', color: '#8B5CF6', values: f.total, dots: true }} max={400} lineMax={400} rightAxis={false} every={phone ? 2 : 1} barWidth={phone ? 12 : 24} height={phone ? 190 : 160} format={(v) => (v ? `${Math.round(v)}M` : '0')} />
      <View style={styles.legend}>
        {(
          [
            ['Net Pay', '#3B82F6'],
            ['Total Payroll Cost', '#8B5CF6'],
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

function Breakdown({ u, phone = false }: { u: U; phone?: boolean }) {
  const t = u.tot;
  return (
    <FinPanel icon="poll" title="Payroll Cost Breakdown (Oct 2026)" style={!phone && styles.flex}>
      <RingLegend
        phone={phone}
        size={150}
        center={`UGX ${(t.cost / 1e6).toFixed(1)}M`}
        caption="Total Cost"
        parts={[
          { label: 'Gross Salaries', value: t.gross, color: '#2563EB', display: `UGX ${(t.gross / 1e6).toFixed(1)}M` },
          { label: 'Employer NSSF (10%)', value: t.nssfEmployer, color: '#F5B731', display: `UGX ${(t.nssfEmployer / 1e6).toFixed(1)}M` },
          { label: 'Benefits (Employer)', value: t.benefits, color: '#22A55A', display: `UGX ${(t.benefits / 1e6).toFixed(1)}M` },
        ]}
      />
    </FinPanel>
  );
}

function Approvals({ u }: { u: U }) {
  return (
    <FinPanel icon="check" title="Payroll Approvals" onAll={u.approvals}>
      {u.runs.map((r) => (
        <View key={r.period} style={styles.line}>
          <Icon name={r.status === 'Approved' ? 'check' : r.status === 'Pending' ? 'clock' : 'calendar'} size={17} color={TONES[RUN_TONE[r.status]].solid} />
          <View style={styles.flex}>
            <Text style={styles.td} numberOfLines={1}>{r.label}</Text>
            <Text style={styles.cell}>{r.approvals.length ? `Approved by ${r.approvals.join(', ')}` : `Prepared by ${r.preparedBy}`}</Text>
          </View>
          <Text style={styles.td}>{ugx(r.amount)}</Text>
          <Pill label={r.status} tone={RUN_TONE[r.status]} size={10} />
        </View>
      ))}
      <PrimaryBtn label="Go to Approvals" icon="arrowRight" onPress={u.approvals} />
    </FinPanel>
  );
}

function Statutory({ u }: { u: U }) {
  const tone = u.statPaid ? 'green' : 'orange';
  const label = u.statPaid ? 'Paid' : 'Due Nov 15';
  return (
    <FinPanel icon="building" title="Statutory Due (Oct 2026)" onAll={u.payStatutory} allLabel={u.statPaid ? 'View' : 'Pay Now'}>
      {(
        [
          ['NSSF (Employer & Employee)', u.stat.nssf],
          ['PAYE (Income Tax)', u.stat.paye],
          ['WHT (Contract Staff, 6%)', u.stat.wht],
        ] as const
      ).map(([l, v]) => (
        <View key={l} style={styles.line}>
          <Text style={[styles.td, styles.flex]}>{l}</Text>
          <Text style={styles.td}>{ugx(v)}</Text>
          <Pill label={label} tone={tone} size={10} />
        </View>
      ))}
      <SumLine icon="layers" tone="orange" strong label="Total Statutory Obligations" value={ugx(u.stat.total)} />
    </FinPanel>
  );
}

function Calendar({ u }: { u: U }) {
  return (
    <FinPanel icon="calendar" title="Upcoming Payroll Calendar">
      {u.d.calendar.map((x) => (
        <View key={x.label} style={styles.line}>
          <View style={[styles.dot, { backgroundColor: x.color }]} />
          <Text style={[styles.td, styles.flex]}>{x.label}</Text>
          <Text style={styles.cell}>{`Run: ${x.run}`}</Text>
          <Pill label={`In ${x.inDays} days`} tone="blue" size={10} />
        </View>
      ))}
    </FinPanel>
  );
}

function Journal({ u }: { u: U }) {
  const lines = payrollJournal(u.tot);
  const dr = lines.reduce((s, l) => s + l.debit, 0);
  const cr = lines.reduce((s, l) => s + l.credit, 0);
  return (
    <FinPanel icon="doc" title="Payroll Journal • Oct 2026 (Corporate Ledger)">
      {lines.map((l) => (
        <View key={l.account} style={styles.line}>
          <Text style={[styles.td, styles.flex]}>{l.account}</Text>
          <Text style={[styles.td, styles.amountCol]}>{l.debit ? num(l.debit) : ''}</Text>
          <Text style={[styles.td, styles.amountCol]}>{l.credit ? num(l.credit) : ''}</Text>
        </View>
      ))}
      <SumLine icon="check" tone={dr === cr ? 'green' : 'red'} strong label={dr === cr ? 'Balanced: debits equal credits' : 'Out of balance'} value={`${num(dr)} / ${num(cr)}`} />
    </FinPanel>
  );
}

function Filters({ u }: { u: U }) {
  const cycle = (xs: readonly string[], v: string) => xs[(xs.indexOf(v) + 1) % xs.length];
  return (
    <View style={styles.inline}>
      <OutlineBtn small chevron label={u.employment} onPress={() => u.setEmployment(cycle(FILTERS.employment, u.employment))} />
      <Pressable style={styles.mask} onPress={u.reveal} accessibilityRole="switch" accessibilityState={{ checked: u.masked }} accessibilityLabel="Hide salaries">
        <Icon name={u.masked ? 'eyeOff' : 'eye'} size={14} color={BLUE} />
        <Text style={styles.maskText}>{u.masked ? 'Show Salaries' : 'Hide Salaries'}</Text>
      </Pressable>
      <Search placeholder="Search by name, staff ID or department..." value={u.query} onChange={u.setQuery} style={styles.search} />
    </View>
  );
}

/** Maple Command › Finance › Corporate Payroll on the desktop reference. */
export function PayrollDesk({ c }: { c: CommandData }) {
  const u = usePayroll(c.platformFinance.corporate, c.platformFinance.me.name.replace(/^Mr\.\s*/, ''));
  return (
    <FinDesk c={c} sub="Payroll" search="Search by staff, payroll period, department, or reference..." promo={PROMO}>
      <FinHead
        icon="people"
        title="Corporate Payroll"
        subtitle="Staff salaries, benefits, deductions, payroll approvals, statutory obligations and payroll journals."
        right={
          <>
            <PrimaryBtn label="Run Payroll" icon="plus" onPress={u.runPayroll} />
            <OutlineBtn label="Payroll Approvals" icon="check" onPress={u.approvals} />
            <OutlineBtn label="Statutory Payments" icon="building" onPress={u.payStatutory} />
            <OutlineBtn label="Export" icon="download" chevron onPress={u.exportList} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <Trend d={u.d} />
        <Breakdown u={u} />
        <View style={styles.side}>
          <Approvals u={u} />
        </View>
      </View>
      <View style={styles.row}>
        {u.tab === 'Payroll Journals' ? (
          <View style={styles.flex}>
            <Journal u={u} />
          </View>
        ) : (
          <FinPanel icon="people" title={`Payroll Register (${num(u.d.payTotals.employees)} Employees)`} right={<Filters u={u} />} style={styles.flex}>
            <DataTable columns={cols(u)} rows={u.rows} rowKey={(s) => s.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.showPayslip} onRowPress={u.showPayslip} />
            <PageStrip label={`Showing 1 – ${u.rows.length} of ${num(u.d.payTotals.employees)} employees`} page={u.page} pages={u.pages} onPage={u.setPage} />
          </FinPanel>
        )}
        <View style={styles.side}>
          <Statutory u={u} />
          <Calendar u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: payroll tiles, approvals, statutory and staff cards. */
export function PayrollPhone({ c }: { c: CommandData }) {
  const u = usePayroll(c.platformFinance.corporate, c.platformFinance.me.name.replace(/^Mr\.\s*/, ''));
  return (
    <FinPhone c={c} title="Payroll" subtitle="Salaries, deductions, approvals and statutory payments.">
      <FinStats items={u.stats} phone title="Payroll at a Glance" />
      <View style={styles.inline}>
        <PrimaryBtn label="Run Payroll" icon="plus" onPress={u.runPayroll} style={styles.flex} />
        <OutlineBtn label="Approvals" onPress={u.approvals} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <Approvals u={u} />
      <Statutory u={u} />
      {u.rows.map((s) => (
        <PhoneRow key={s.id} lead={<Image source={s.photo} style={styles.avatarLg} contentFit="cover" />} title={s.name} sub={`${s.id} • ${s.department} • ${s.employment} • net ${u.masked ? MASK : ugx(payslip(s).net)}`} onPress={() => u.showPayslip(s)} />
      ))}
      {u.tab === 'Payroll Journals' ? <Journal u={u} /> : null}
      <Breakdown u={u} phone />
      <Trend d={u.d} phone />
      <Calendar u={u} />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  side: { width: 400, gap: 12 },
  trend: { flex: 1.1 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  search: { width: 210 },
  cell: { fontSize: 10.5, color: BODY },
  cellStrong: { flexShrink: 1, fontSize: 11, fontWeight: '700', color: NAVY },
  td: { fontSize: 11.5, color: NAVY },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
  avatar: { width: 26, height: 26, borderRadius: 13 },
  avatarLg: { width: 38, height: 38, borderRadius: 19 },
  amountCol: { width: 96, textAlign: 'right' },
  mask: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 32, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  maskText: { fontSize: 11.5, fontWeight: '700', color: BLUE },
});
