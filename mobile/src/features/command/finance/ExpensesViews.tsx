import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, PageStrip, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { apSummary, approve, budgetUse, type Category, CATEGORY_ACCOUNT, type Expense, type ExpenseStatus, pay, type Posting, recordExpense, reject } from '@/features/command/logic/expenses';
import { Pill } from '@/features/portal/PortalParts';
import { BODY, LINE, NAVY, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { type Column, DataTable, Search, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';

import { amount, type FormAsk, FormModal } from './FinForm';
import { FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, RingLegend, ugx } from './FinKit';

type D = CommandData['platformFinance']['corporate'];
const PER_PAGE = 10;
const TABS = ['Overview', 'All Expenses', 'Accounts Payable', 'Recurring Expenses', 'Vendors & Contracts', 'Cost Centers', 'Budgets', 'Reports'] as const;
const CATEGORIES = Object.keys(CATEGORY_ACCOUNT) as Category[];
const CAT_TONE: Readonly<Record<Category, Tone>> = { 'Cloud & Infra': 'blue', 'Software & AI': 'purple', 'Salaries & Benefits': 'green', 'Marketing & Growth': 'purple', 'Contractors & Services': 'orange', 'Admin & Operations': 'green' };
const STATUS_TONE: Readonly<Record<ExpenseStatus, Tone>> = { Pending: 'orange', Approved: 'blue', Paid: 'green', Rejected: 'red' };
const PROMO: Promo = { icon: 'wallet', color: '#1E6BF0', title: 'Corporate Expenses', body: "Manage Maple's operating expenses, vendors and accounts payable." };
const RANGES = ['Last 10 Months', 'This Quarter', 'Year to Date'];
const FILTERS = { category: ['All Categories', ...CATEGORIES], status: ['All Statuses', 'Pending', 'Approved', 'Paid', 'Rejected'] } as const;

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const postingText = (p: Posting) => `${p.ledger}: ${p.lines.map((l) => `${l.debit ? 'Dr' : 'Cr'} ${l.account} ${num(l.debit || l.credit)}`).join(', ')}`;

function useExpenses(d: D, me: string) {
  const today = d.TODAY;
  const [list, setList] = useState<readonly Expense[]>(d.expenses);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [category, setCategory] = useState<string>(FILTERS.category[0]);
  const [status, setStatus] = useState<string>(FILTERS.status[0]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inTab = (e: Expense) => (tab === 'Accounts Payable' ? e.status === 'Pending' || e.status === 'Approved' : tab === 'Recurring Expenses' ? ['Cloud & Infra', 'Software & AI', 'Salaries & Benefits'].includes(e.category) : true);
    const rows = list.filter((e) => inTab(e) && (category === FILTERS.category[0] || e.category === category) && (status === FILTERS.status[0] || e.status === status) && (!q || `${e.id} ${e.description} ${e.vendor} ${e.costCentre}`.toLowerCase().includes(q)));
    if (tab === 'Cost Centers') return [...rows].sort((a, b) => a.costCentre.localeCompare(b.costCentre));
    if (tab === 'Vendors & Contracts') return [...rows].sort((a, b) => a.vendor.localeCompare(b.vendor));
    return rows;
  }, [list, tab, category, status, query]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const update = (e: Expense) => setList((prev) => prev.map((x) => (x.id === e.id ? e : x)));

  const record = (invoice: boolean) =>
    setAsk({
      title: invoice ? 'Register vendor invoice' : 'Record expense',
      body: `Posts to Maple's corporate ledger only (never a school's): Dr the category's expense account, Cr 2100 Accounts Payable. Receipts are required from UGX 500,000. Bills above UGX 10,000,000 need two approvers.`,
      fields: [
        { key: 'description', label: 'Description', kind: 'text', placeholder: invoice ? 'Invoice INV-4471 – November hosting' : 'Team offsite – venue' },
        { key: 'vendor', label: 'Vendor', kind: 'text', placeholder: 'Amazon Web Services' },
        { key: 'category', label: 'Category', kind: 'choice', options: CATEGORIES },
        { key: 'costCentre', label: 'Cost centre', kind: 'choice', options: d.costCentres },
        { key: 'amount', label: 'Amount (UGX)', kind: 'number', placeholder: '9600000' },
        { key: 'due', label: 'Due date (YYYY-MM-DD)', kind: 'text', initial: '2026-11-30' },
        { key: 'receipt', label: 'Receipt / invoice attached', kind: 'choice', options: invoice ? ['Yes – invoice PDF attached', 'No'] : ['No', 'Yes – receipt photo attached'] },
      ],
      confirm: invoice ? 'Register Invoice' : 'Record Expense',
      onSubmit: (v) => {
        const id = `EXP-2026-${1843 + list.length - d.expenses.length}`;
        const r = recordExpense({ description: v.description ?? '', category: v.category as Category, vendor: v.vendor ?? '', costCentre: v.costCentre ?? '', amount: amount(v.amount), due: (v.due ?? '').trim(), receipt: (v.receipt ?? '').startsWith('Yes'), by: me, date: today }, id);
        if (r.error || !r.expense || !r.entry) return r.error;
        const e = r.expense;
        setList((prev) => [e, ...prev]);
        toast(`${id} added to accounts payable. ${postingText(r.entry)}.`);
        return undefined;
      },
    });
  const payBill = (only?: Expense) => {
    const ready = only ? [only] : list.filter((e) => e.status === 'Approved');
    if (!ready.length) return toast('No approved bills are waiting for payment. Approve a pending bill first.');
    setAsk({
      title: 'Make payment',
      body: 'Pays an approved bill from the operating account: Dr 2100 Accounts Payable, Cr 1100 Bank – Operating.',
      fields: [
        { key: 'id', label: 'Bill', kind: 'choice', options: ready.map((e) => `${e.vendor} • ${ugx(e.amount)} • ${e.id}`) },
        { key: 'method', label: 'Pay by', kind: 'choice', options: ['Bank Transfer', 'Corporate Card', 'Mobile Money'] },
      ],
      confirm: 'Pay Bill',
      onSubmit: (v) => {
        const e = ready.find((x) => v.id?.endsWith(x.id));
        if (!e) return 'Choose a bill.';
        const r = pay(e, me, today);
        if (r.error || !r.expense || !r.entry) return r.error;
        update(r.expense);
        toast(`${e.vendor} paid ${ugx(e.amount)} by ${v.method}. ${postingText(r.entry)}.`);
        return undefined;
      },
    });
  };
  const manage = (e: Expense) => {
    const options = [...(e.status === 'Pending' ? ['Approve', 'Reject'] : []), ...(e.status === 'Approved' ? ['Pay now'] : []), 'Show approval history'];
    setAsk({
      title: `${e.id} • ${e.vendor}`,
      body: `${e.description}. ${ugx(e.amount)} • ${e.category} → ${CATEGORY_ACCOUNT[e.category]} • cost centre ${e.costCentre} • due ${date(e.due)} • receipt ${e.receipt ? 'attached' : 'not attached'}. Status: ${e.status}.`,
      fields: [
        { key: 'action', label: 'Action', kind: 'choice', options },
        { key: 'as', label: 'Approve as', kind: 'choice', options: [me, ...d.approvers] },
        { key: 'reason', label: 'Reason (for rejections)', kind: 'text', placeholder: 'Duplicate of INV-4410' },
      ],
      confirm: 'Apply',
      onSubmit: (v) => {
        if (v.action === 'Approve') {
          const who = (v.as ?? me).replace(/ \(.*\)$/, '');
          const r = approve(e, who, today);
          if (r.error || !r.expense) return r.error;
          update(r.expense);
          toast(r.expense.status === 'Approved' ? `${e.id} approved by ${who}. It is ready to pay.` : `${e.id}: first approval by ${who}. A second approver is needed above UGX 10,000,000.`);
          return undefined;
        }
        if (v.action === 'Reject') {
          const r = reject(e, me, v.reason ?? '', today);
          if (r.error || !r.expense) return r.error;
          update(r.expense);
          toast(`${e.id} rejected and removed from payables. Reason kept on the audit trail.`);
          return undefined;
        }
        if (v.action === 'Pay now') {
          setTimeout(() => payBill(e), 0);
          return undefined;
        }
        toast(e.history.map((h) => `${date(h.at)} – ${h.action} by ${h.by}`).join(' • '));
        return undefined;
      },
    });
  };
  const exportList = () => toast(`Expense register exported: ${shown.length} expenses with receipts and approval history (CSV).`);

  // Company totals plus what this session changed on the sample bills.
  const t = d.expTotals;
  const newSpend = list.filter((e) => !d.expenses.some((x) => x.id === e.id) && e.status !== 'Rejected').reduce((s, e) => s + e.amount, 0);
  const rejectedSeed = list.filter((e) => e.status === 'Rejected' && d.expenses.some((x) => x.id === e.id)).reduce((s, e) => s + e.amount, 0);
  const spent = t.spent + newSpend - rejectedSeed;
  const paidOf = (xs: readonly Expense[]) => xs.filter((e) => e.status === 'Paid').reduce((s, e) => s + e.amount, 0);
  const paid = t.paid + paidOf(list) - paidOf(d.expenses);
  const ap0 = apSummary(d.expenses, today);
  const ap1 = apSummary(list, today);
  const ap = { total: t.ap.total + ap1.total - ap0.total, overdue: t.ap.overdue + ap1.overdue - ap0.overdue, dueWeek: t.ap.dueWeek + ap1.dueWeek - ap0.dueWeek, dueMonth: t.ap.dueMonth + ap1.dueMonth - ap0.dueMonth };
  const use = budgetUse(spent, t.budget);
  const stats: readonly Kpi[] = [
    { ...d.expStats[0], value: ugx(spent) },
    { ...d.expStats[1], value: ugx(paid), caption: `(${((paid / spent) * 100).toFixed(1)}%)` },
    { ...d.expStats[2], value: ugx(ap.total), caption: `(${((ap.total / spent) * 100).toFixed(1)}%)` },
    d.expStats[3],
    d.expStats[4],
    { ...d.expStats[5], value: `${use.toFixed(1)}%`, progress: Math.min(1, use / 100) },
  ];
  const pending = list.filter((e) => e.status === 'Pending' || e.status === 'Approved');
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  return { d, rows, shown, tab, setTab: pick, category, setCategory, status, setStatus, query, setQuery, page: p, pages, setPage, ask, setAsk, manage, record, payBill, exportList, stats, ap, pending, spent, selected, toggle };
}
type U = ReturnType<typeof useExpenses>;

function cols(): readonly Column<Expense>[] {
  return [
    { label: 'Date', width: 80, render: (e) => <Text style={styles.cell} numberOfLines={1}>{date(e.date)}</Text> },
    { label: 'Expense / Description', flex: 1, render: (e) => <Text style={styles.cellStrong} numberOfLines={1}>{e.description}</Text> },
    { label: 'Category', width: 144, align: 'center', render: (e) => <Pill label={e.category} tone={CAT_TONE[e.category]} size={9.5} /> },
    { label: 'Vendor', width: 120, render: (e) => <Text style={styles.cell} numberOfLines={1}>{e.vendor}</Text> },
    { label: 'Cost Center', width: 100, render: (e) => <Text style={styles.cell} numberOfLines={1}>{e.costCentre}</Text> },
    { label: 'Amount (UGX)', width: 92, align: 'right', render: (e) => <Text style={[styles.cellStrong, styles.right]} numberOfLines={1}>{num(e.amount)}</Text> },
    {
      label: 'Receipt',
      width: 54,
      align: 'center',
      render: (e) => (
        <View style={styles.center}>
          <Icon name={e.receipt ? 'check' : 'close'} size={14} color={e.receipt ? TONES.green.solid : TONES.grey.solid} />
        </View>
      ),
    },
    { label: 'Status', width: 80, align: 'center', render: (e) => <Pill label={e.status} tone={STATUS_TONE[e.status]} size={10} /> },
  ];
}

function Trend({ d, phone = false }: { d: D; phone?: boolean }) {
  const f = d.expTrend;
  const [range, setRange] = useState(RANGES[0]);
  return (
    <FinPanel icon="chart" title="Expense Trend" style={!phone && styles.trend} right={phone ? undefined : <RangeBox value={range} options={RANGES} onChange={setRange} width={176} />}>
      <ComboChart labels={f.labels} bars={[{ name: 'Actual Expenses', color: '#3B82F6', values: f.actual }]} line={{ name: 'Budget', color: '#8B5CF6', values: f.budget, dots: true }} max={400} lineMax={400} rightAxis={false} every={phone ? 2 : 1} barWidth={phone ? 14 : 28} height={phone ? 190 : 160} format={(v) => (v ? `${Math.round(v)}M` : '0')} />
      <View style={styles.legend}>
        {(
          [
            ['Actual Expenses', '#3B82F6'],
            ['Budget', '#8B5CF6'],
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

function ByCategory({ u, phone = false }: { u: U; phone?: boolean }) {
  const total = u.d.expByCategory.reduce((s, x) => s + x.value, 0);
  return (
    <FinPanel icon="poll" title="Expenses by Category (YTD)" style={!phone && styles.flex}>
      <RingLegend phone={phone} compact size={140} center={`UGX ${(total / 1e9).toFixed(2)}B`} caption="Total Expenses" parts={u.d.expByCategory.map((x) => ({ ...x, display: `UGX ${(x.value / 1e6).toFixed(1)}M` }))} />
    </FinPanel>
  );
}

function Approvals({ u }: { u: U }) {
  return (
    <FinPanel icon="clipboard" title={`Payment Approvals (${u.pending.length})`} onAll={() => u.setTab('Accounts Payable')}>
      {u.pending.slice(0, 4).map((e) => (
        <View key={e.id} style={styles.line}>
          <Icon name="calendar" size={18} color={TONES.blue.solid} />
          <View style={styles.flex}>
            <Text style={styles.tdStrong} numberOfLines={1}>{e.vendor}</Text>
            <Text style={styles.cell} numberOfLines={2}>{e.description}</Text>
          </View>
          <Text style={styles.td}>{ugx(e.amount)}</Text>
          <OutlineBtn small label={e.status === 'Approved' ? 'Pay' : 'Review'} onPress={() => u.manage(e)} />
        </View>
      ))}
      {u.pending.length ? null : <Text style={styles.cell}>Nothing waiting for approval.</Text>}
    </FinPanel>
  );
}

function Recurring({ u }: { u: U }) {
  return (
    <FinPanel icon="sync" title="Recurring Expenses (Monthly)" onAll={() => u.setTab('Recurring Expenses')}>
      {u.d.recurring.map((r) => (
        <View key={r.name} style={styles.line}>
          <View style={[styles.badge, { backgroundColor: r.color }]}>
            <Text style={styles.badgeText}>{r.badge}</Text>
          </View>
          <Text style={[styles.td, styles.flex]} numberOfLines={2}>{r.name}</Text>
          <Text style={styles.td}>{ugx(r.amount)}</Text>
          <Pill label="Active" tone="green" size={10} />
        </View>
      ))}
    </FinPanel>
  );
}

function ApSummary({ u }: { u: U }) {
  const tiles: readonly { label: string; value: number; tone: Tone; icon: IconName; tab?: string }[] = [
    { label: 'Total Payables', value: u.ap.total, tone: 'blue', icon: 'database' },
    { label: 'Overdue', value: u.ap.overdue, tone: 'red', icon: 'alert' },
    { label: '≤ 7 Days', value: u.ap.dueWeek, tone: 'orange', icon: 'clock' },
    { label: '8 – 30 Days', value: u.ap.dueMonth, tone: 'blue', icon: 'calendar' },
  ];
  return (
    <FinPanel icon="doc" title="Accounts Payable Summary">
      <View style={styles.tiles}>
        {tiles.map((x) => (
          <View key={x.label} style={[styles.tile, { backgroundColor: TONES[x.tone].soft }]} accessible accessibilityLabel={`${x.label}: ${ugx(x.value)}`}>
            <Icon name={x.icon} size={18} color={TONES[x.tone].solid} />
            <Text style={styles.tileLabel} numberOfLines={1}>{x.label}</Text>
            <Text style={[styles.tileValue, x.tone === 'red' && { color: TONES.red.text }]} numberOfLines={1}>{`${(x.value / 1e6).toFixed(1)}M`}</Text>
          </View>
        ))}
      </View>
    </FinPanel>
  );
}

function Filters({ u }: { u: U }) {
  const cycle = (xs: readonly string[], v: string) => xs[(xs.indexOf(v) + 1) % xs.length];
  return (
    <View style={styles.inline}>
      <OutlineBtn small chevron label={u.category} onPress={() => u.setCategory(cycle(FILTERS.category, u.category))} />
      <OutlineBtn small chevron label={u.status} onPress={() => u.setStatus(cycle(FILTERS.status, u.status))} />
      <Search placeholder="Search by expense, vendor or cost centre..." value={u.query} onChange={u.setQuery} style={styles.search} />
    </View>
  );
}

/** Maple Command › Finance › Corporate Expenses & Accounts Payable on the desktop reference. */
export function ExpensesDesk({ c }: { c: CommandData }) {
  const u = useExpenses(c.platformFinance.corporate, c.platformFinance.me.name.replace(/^Mr\.\s*/, ''));
  return (
    <FinDesk c={c} sub="Expenses" search="Search expenses, vendors, invoices, contracts, or cost center..." promo={PROMO}>
      <FinHead
        icon="wallet"
        title="Corporate Expenses & Accounts Payable"
        subtitle="Maple's own operating expenses, vendor bills, subscriptions, salaries and admin costs."
        right={
          <>
            <PrimaryBtn label="Record Expense" icon="plus" onPress={() => u.record(false)} />
            <OutlineBtn label="Register Invoice" icon="doc" onPress={() => u.record(true)} />
            <OutlineBtn label="Make Payment" icon="wallet" onPress={() => u.payBill()} />
            <OutlineBtn label="Export" icon="download" chevron onPress={u.exportList} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <Trend d={u.d} />
        <ByCategory u={u} />
        <View style={styles.side}>
          <Approvals u={u} />
        </View>
      </View>
      <View style={styles.row}>
        <FinPanel icon="calendar" title={`Recent Expenses (${num(u.d.expTotals.count + u.shown.length - u.d.expenses.length)})`} right={<Filters u={u} />} style={styles.flex}>
          <DataTable columns={cols()} rows={u.rows} rowKey={(e) => e.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.manage} onRowPress={u.manage} />
          {u.rows.length ? null : <Text style={styles.cell}>No expenses on this tab.</Text>}
          <PageStrip label={`Showing 1 – ${u.rows.length} of ${num(u.d.expTotals.count)} expenses`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </FinPanel>
        <View style={styles.side}>
          <Recurring u={u} />
          <ApSummary u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: tiles, approvals, payables and expense cards. */
export function ExpensesPhone({ c }: { c: CommandData }) {
  const u = useExpenses(c.platformFinance.corporate, c.platformFinance.me.name.replace(/^Mr\.\s*/, ''));
  return (
    <FinPhone c={c} title="Expenses" subtitle="Maple's operating costs and accounts payable.">
      <FinStats items={u.stats} phone title="Expenses at a Glance" />
      <View style={styles.inline}>
        <PrimaryBtn label="Record Expense" icon="plus" onPress={() => u.record(false)} style={styles.flex} />
        <OutlineBtn label="Pay" icon="wallet" onPress={() => u.payBill()} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <ApSummary u={u} />
      <Approvals u={u} />
      {u.rows.map((e) => (
        <PhoneRow key={e.id} lead={<Icon name="doc" size={26} color={NAVY} />} title={e.description} sub={`${date(e.date)} • ${e.vendor} • ${e.costCentre} • ${ugx(e.amount)}`} pill={<Pill label={e.status} tone={STATUS_TONE[e.status]} size={11} />} onPress={() => u.manage(e)} />
      ))}
      <ByCategory u={u} phone />
      <Trend d={u.d} phone />
      <Recurring u={u} />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  side: { width: 384, gap: 12 },
  trend: { flex: 0.9 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  search: { width: 230 },
  cell: { fontSize: 10.5, color: BODY },
  cellStrong: { flexShrink: 1, fontSize: 11, fontWeight: '700', color: NAVY },
  td: { fontSize: 11.5, color: NAVY },
  tdStrong: { fontSize: 11.5, fontWeight: '800', color: NAVY },
  right: { textAlign: 'right' },
  center: { alignItems: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
  badge: { width: 26, height: 20, borderRadius: 5, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 9, fontWeight: '800', color: WHITE },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingVertical: 12, borderRadius: 12 },
  tileLabel: { fontSize: 10, fontWeight: '600', color: BODY },
  tileValue: { fontSize: 14, fontWeight: '800', color: NAVY },
});
