import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, PageStrip, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { approveClose, bankRec, bookItem, canPostOn, type Period, requestClose, statements, trialBalance } from '@/features/command/logic/ledger';
import { Pill } from '@/features/portal/PortalParts';
import { BODY, LINE, NAVY, TONES, type Tone } from '@/features/portal/tokens';
import { accountBalance, entryTotals, postEntry, reverseEntry, validateEntry } from '@/features/school/accounting/books';
import { type Column, DataTable, Search, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { LedgerEntry } from '@/mock/command-center/pf-ledger';

import { amount, type FormAsk, FormModal } from './FinForm';
import { ActionGrid, FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, RingLegend, SumLine, ugx } from './FinKit';

type D = CommandData['platformFinance']['ledger'];
const PER_PAGE = 5;
const TABS = ['Overview', 'Chart of Accounts', 'Journals', 'General Ledger', 'Trial Balance', 'Bank Reconciliation', 'Financial Periods', 'Reports', 'Settings'] as const;
const STATUS_TONE: Readonly<Record<LedgerEntry['status'], Tone>> = { Draft: 'grey', Posted: 'green', Reversing: 'orange' };
const PERIOD_TONE: Readonly<Record<Period['status'], Tone>> = { Open: 'green', Closing: 'orange', Closed: 'grey' };
const TB_LABEL = { Asset: 'Assets', Liability: 'Liabilities', Equity: 'Equity (opening)', Income: 'Revenue', Expense: 'Expenses' } as const;
const PROMO: Promo = { icon: 'book', color: '#1E6BF0', title: 'General Ledger', body: 'Chart of accounts, journals, ledger, trial balance, bank reconciliation and financial periods.' };
const RANGES = ['Last 10 Months', 'Year to Date'];
const FILTERS = { source: ['All Journals', 'Manual', 'Auto', 'Subscriptions', 'Payables', 'Expenses', 'Payroll', 'Bank'] } as const;

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const shortM = (n: number) => `${(n / 1e6).toLocaleString('en-US', { maximumFractionDigits: 1 })}M`;

function useLedger(d: D, me: string, preparer: string, approvers: readonly string[]) {
  const today = d.TODAY;
  const [list, setList] = useState<readonly LedgerEntry[]>(d.entries);
  const [periods, setPeriods] = useState<readonly Period[]>(d.periods);
  const [items, setItems] = useState(d.bankItems);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [source, setSource] = useState<string>(FILTERS.source[0]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [selected, toggle] = useSelection();
  const acctName = (code: string) => d.accounts.find((x) => x.code === code)?.name ?? code;
  const label = (code: string) => `${code} – ${acctName(code)}`;
  const nextId = (xs: readonly LedgerEntry[], offset = 0) => `JRN-${String(10_249 + xs.length - d.entries.length + offset).padStart(6, '0')}`;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...list]
      .filter((e) => e.source !== 'Opening' && (source === FILTERS.source[0] || e.source === source) && (!q || `${e.id} ${e.description} ${e.lines.map((l) => l.account).join(' ')}`.toLowerCase().includes(q)))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [list, source, query]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);

  const tb = trialBalance(d.accounts, list);
  const st = statements(d.accounts, list);
  const book = accountBalance(d.bank.code, list, d.accounts);
  const rec = bankRec(d.bank.statement, book, items);
  const drafts = list.filter((e) => e.status === 'Draft').length;
  const current = periods.find((x) => x.status !== 'Closed') ?? periods[periods.length - 1];

  const newJournal = (draftOnly = false) =>
    setAsk({
      title: draftOnly ? 'Import journals' : 'New journal',
      body: `Maple corporate ledger (${d.LEDGER}) only; school ledgers are separate. Debits must equal credits. Posted journals cannot be edited, only reversed.`,
      fields: [
        { key: 'date', label: 'Date (YYYY-MM-DD)', kind: 'text', initial: today },
        { key: 'narration', label: 'Narration', kind: 'text', placeholder: draftOnly ? 'Imported accruals – Oct (CSV)' : 'Accrue October audit fees' },
        { key: 'debit', label: 'Debit account', kind: 'choice', options: d.accounts.map((x) => label(x.code)) },
        { key: 'credit', label: 'Credit account', kind: 'choice', options: [label('2100'), ...d.accounts.filter((x) => x.code !== '2100').map((x) => label(x.code))] },
        { key: 'amount', label: 'Amount (UGX)', kind: 'number', placeholder: '1200000' },
        { key: 'post', label: 'Save as', kind: 'choice', options: draftOnly ? ['Draft (review before posting)'] : ['Post now', 'Draft (review before posting)'] },
      ],
      confirm: draftOnly ? 'Import' : 'Save Journal',
      onSubmit: (v) => {
        const when = (v.date ?? '').trim();
        const locked = canPostOn(when, periods);
        if (locked) return locked;
        const n = amount(v.amount);
        const debit = (v.debit ?? '').slice(0, 4);
        const credit = (v.credit ?? '').slice(0, 4);
        if (debit === credit) return 'Debit and credit accounts must be different.';
        const draft: LedgerEntry = { id: nextId(list), date: when, description: (v.narration ?? '').trim() || 'Manual journal', source: 'Manual', status: 'Draft', createdBy: me, lines: [{ account: debit, debit: n, credit: 0 }, { account: credit, debit: 0, credit: n }] };
        const errors = validateEntry(draft, d.accounts);
        if (errors.length) return errors[0];
        if ((v.post ?? '').startsWith('Post')) {
          const r = postEntry(draft, d.accounts, me, today);
          if (r.error) return r.error;
          setList((prev) => [...prev, r.entry]);
          toast(`${draft.id} posted: Dr ${label(debit)}, Cr ${label(credit)} ${ugx(n)}.`);
          return undefined;
        }
        setList((prev) => [...prev, draft]);
        toast(`${draft.id} saved as a draft. Post it before closing ${current.name}.`);
        return undefined;
      },
    });
  const manage = (e: LedgerEntry) => {
    const options = [...(e.status === 'Draft' ? ['Post journal'] : []), ...(e.status === 'Posted' && !e.reversedBy ? ['Reverse journal'] : []), ...(e.route ? [`Open source (${e.source})`] : []), 'Show lines'];
    setAsk({
      title: `${e.id} • ${date(e.date)}`,
      body: `${e.description}. ${e.status}${e.reversedBy ? `, reversed by ${e.reversedBy}` : ''}${e.reverses ? `, reverses ${e.reverses}` : ''}. Source: ${e.source}. Created by ${e.createdBy}${e.postedBy ? `, posted by ${e.postedBy}` : ''}.`,
      fields: [
        { key: 'action', label: 'Action', kind: 'choice', options },
        { key: 'reason', label: 'Reason (for reversals)', kind: 'text', placeholder: 'Posted to the wrong cost account' },
      ],
      confirm: 'Apply',
      onSubmit: (v) => {
        if (v.action === 'Post journal') {
          const locked = canPostOn(e.date, periods);
          if (locked) return locked;
          const r = postEntry(e, d.accounts, me, today);
          if (r.error) return r.error;
          setList((prev) => prev.map((x) => (x.id === e.id ? r.entry : x)));
          toast(`${e.id} posted.`);
          return undefined;
        }
        if (v.action === 'Reverse journal') {
          if (!(v.reason ?? '').trim()) return 'Give the reason for the reversal; it stays on the audit trail.';
          const locked = canPostOn(today, periods);
          if (locked) return locked;
          const r = reverseEntry(e, nextId(list), today, me);
          if (r.error || !r.reversal) return r.error;
          const reversal: LedgerEntry = { ...r.reversal, source: 'Manual', route: undefined, description: `${r.reversal.description} (${(v.reason ?? '').trim()})` };
          setList((prev) => [...prev.map((x) => (x.id === e.id ? r.original : x)), reversal]);
          toast(`${e.id} reversed by ${reversal.id}. The original stays posted and unchanged.`);
          return undefined;
        }
        if (v.action?.startsWith('Open source') && e.route) {
          router.push(e.route as never);
          return undefined;
        }
        toast(e.lines.map((l) => `${l.debit ? 'Dr' : 'Cr'} ${label(l.account)} ${num(l.debit || l.credit)}`).join(' • '));
        return undefined;
      },
    });
  };
  const runTb = () => {
    setTab('Trial Balance');
    toast(`Trial balance: debits ${ugx(tb.debit)}, credits ${ugx(tb.credit)} – ${tb.balanced ? 'balanced' : 'OUT OF BALANCE'}.`);
  };
  const reconcile = () => {
    const open = items.filter((i) => !i.booked);
    if (!open.length) return toast(rec.status === 'Reconciled' ? `${d.bank.account} is reconciled.` : 'Every statement item is booked; the remaining difference needs investigating.');
    setAsk({
      title: 'Reconcile bank • Oct 2026',
      body: `Bank statement ${ugx(d.bank.statement)}, books ${ugx(book)}, difference ${ugx(rec.difference)}. Booking these items posts a journal for each: ${open.map((i) => `${i.description} (${ugx(i.amount)})`).join('; ')}.`,
      fields: [{ key: 'ok', label: 'Confirm', kind: 'choice', options: ['Book all outstanding items'] }],
      confirm: 'Book & Reconcile',
      onSubmit: () => {
        if (canPostOn(today, periods)) return canPostOn(today, periods);
        const posted = open.map((i, k): LedgerEntry => ({ id: nextId(list, k), date: today, description: i.description, source: 'Bank', status: 'Posted', createdBy: me, postedBy: me, postedAt: today, lines: bookItem(i, d.bank.code, d.bank.income, d.bank.charges) }));
        setList((prev) => [...prev, ...posted]);
        setItems((prev) => prev.map((i) => ({ ...i, booked: true })));
        toast(`${posted.length} items booked. Books now ${ugx(book + rec.explained)} = bank ${ugx(d.bank.statement)}. Reconciled.`);
        return undefined;
      },
    });
  };
  const closePeriod = () => {
    const pd = current;
    const checks = { tbBalanced: tb.balanced, bankReconciled: rec.status === 'Reconciled', drafts };
    setAsk({
      title: `Close ${pd.name}`,
      body: `Status: ${pd.status}${pd.requestedBy ? ` (requested by ${pd.requestedBy})` : ''}. Checks – trial balance ${checks.tbBalanced ? 'balanced' : 'NOT balanced'}; bank ${checks.bankReconciled ? 'reconciled' : `not reconciled (${rec.outstanding} items)`}; ${drafts} draft journal${drafts === 1 ? '' : 's'}. A close needs a request and a different approver; nothing can post into a closed period.`,
      fields: [
        { key: 'action', label: 'Action', kind: 'choice', options: pd.status === 'Open' ? ['Request close'] : ['Approve close'] },
        { key: 'as', label: 'Acting as', kind: 'choice', options: pd.status === 'Open' ? [preparer, me] : [me, preparer, ...approvers] },
      ],
      confirm: 'Continue',
      onSubmit: (v) => {
        const who = (v.as ?? me).replace(/ \(.*\)$/, '');
        const r = v.action === 'Request close' ? requestClose(pd, who) : approveClose(pd, who, checks);
        if (r.error || !r.period) return r.error;
        const next = r.period;
        setPeriods((prev) => prev.map((x) => (x.name === pd.name ? next : x)));
        toast(next.status === 'Closed' ? `${pd.name} closed by ${who}. It is locked for posting.` : `Close of ${pd.name} requested by ${who}. Awaiting a second person's approval.`);
        return undefined;
      },
    });
  };
  const exportGl = () => toast(`General ledger exported: ${shown.length} journals with lines and audit fields (CSV).`);

  const stats: readonly Kpi[] = [
    { label: 'Total Assets', value: ugx(st.assets), delta: '11.9%', icon: 'layers', tone: 'green' },
    { label: 'Total Liabilities', value: ugx(st.liabilities), icon: 'layers', tone: 'red', valueTone: 'red' },
    { label: 'Total Equity', value: ugx(st.equity), icon: 'shield', tone: 'blue' },
    { label: 'Total Revenue (YTD)', value: ugx(st.revenue), delta: '18.2%', icon: 'chart', tone: 'purple' },
    { label: 'Total Expenses (YTD)', value: ugx(st.expenses), delta: '14.6%', icon: 'database', tone: 'orange', valueTone: 'red' },
    { label: 'Net Surplus (YTD)', value: ugx(st.surplus), delta: '27.8%', icon: 'chart', tone: 'green' },
  ];
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  return { d, rows, shown, tab, setTab: pick, source, setSource, query, setQuery, page: p, pages, setPage, ask, setAsk, manage, newJournal, runTb, reconcile, closePeriod, exportGl, stats, tb, st, book, rec, periods, label, acctName, list, selected, toggle };
}
type U = ReturnType<typeof useLedger>;

function cols(u: U): readonly Column<LedgerEntry>[] {
  const side = (e: LedgerEntry, debit: boolean) => {
    const ls = e.lines.filter((l) => (debit ? l.debit : l.credit));
    if (!ls[0]) return <Text style={styles.cell}>—</Text>;
    return (
      <View>
        <Text style={styles.cellStrong}>{ls.length > 1 ? `${ls[0].account} + ${ls.length - 1} more` : ls[0].account}</Text>
        <Text style={styles.small} numberOfLines={1}>{u.acctName(ls[0].account)}</Text>
      </View>
    );
  };
  return [
    { label: 'Date', width: 78, render: (e) => <Text style={styles.cell} numberOfLines={1}>{date(e.date)}</Text> },
    { label: 'Journal No.', width: 84, render: (e) => <Text style={styles.cellStrong} numberOfLines={1}>{e.id}</Text> },
    { label: 'Narration / Description', flex: 1, render: (e) => <Text style={styles.cell} numberOfLines={1}>{e.description}</Text> },
    { label: 'Account (Dr)', width: 130, render: (e) => side(e, true) },
    { label: 'Account (Cr)', width: 130, render: (e) => side(e, false) },
    { label: 'Amount (UGX)', width: 90, align: 'right', render: (e) => <Text style={[styles.cell, styles.right]}>{num(entryTotals(e).debit)}</Text> },
    { label: 'Source', width: 74, align: 'center', render: (e) => <Text style={[styles.cell, styles.center]}>{e.source}</Text> },
    { label: 'Status', width: 74, align: 'center', render: (e) => <Pill label={e.reversedBy ? 'Reversed' : e.status} tone={e.reversedBy ? 'orange' : STATUS_TONE[e.status]} size={10} /> },
  ];
}

function IncomeChart({ d, phone = false }: { d: D; phone?: boolean }) {
  const f = d.incomeTrend;
  const [range, setRange] = useState(RANGES[0]);
  return (
    <FinPanel icon="chart" title="Income vs Expenses" style={!phone && styles.flex} right={phone ? undefined : <RangeBox value={range} options={RANGES} onChange={setRange} width={180} />}>
      <ComboChart
        labels={f.labels}
        bars={[
          { name: 'Revenue', color: '#3B82F6', values: f.revenue },
          { name: 'Expenses', color: '#A78BFA', values: f.expenses },
        ]}
        max={1200}
        rightAxis={false}
        every={phone ? 2 : 1}
        height={phone ? 190 : 150}
        format={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}B` : v ? `${Math.round(v)}M` : '0')}
      />
      <View style={styles.legend}>
        {(
          [
            ['Revenue', '#3B82F6'],
            ['Expenses', '#A78BFA'],
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

function Snapshot({ u, phone = false }: { u: U; phone?: boolean }) {
  const s = u.st;
  return (
    <FinPanel icon="layers" title="Balance Sheet Snapshot" style={!phone && styles.flex}>
      <RingLegend
        phone={phone}
        size={140}
        pct={false}
        center={`UGX ${(s.assets / 1e9).toFixed(2)}B`}
        caption="Total Assets"
        parts={[
          { label: 'Liabilities', value: s.liabilities, color: '#E5484D', display: `${num(s.liabilities)} (${((s.liabilities / s.assets) * 100).toFixed(1)}%)` },
          { label: 'Equity', value: s.equity, color: '#2563EB', display: `${num(s.equity)} (${((s.equity / s.assets) * 100).toFixed(1)}%)` },
        ]}
      />
      <SumLine icon={s.assets === s.liabilities + s.equity ? 'check' : 'alert'} tone={s.assets === s.liabilities + s.equity ? 'green' : 'red'} label="Assets = Liabilities + Equity" value={ugx(s.assets)} />
    </FinPanel>
  );
}

function Chart({ u }: { u: U }) {
  const bal = (prefix: string) => u.d.accounts.filter((x) => x.code.startsWith(prefix)).reduce((s, x) => s + accountBalance(x.code, u.list, u.d.accounts), 0);
  return (
    <FinPanel icon="clipboard" title="Chart of Accounts (Maple)" onAll={() => u.setTab('Chart of Accounts')} allLabel="Manage">
      {u.d.groups.map((g) => (
        <View key={g.code} style={styles.line}>
          <Icon name="folder" size={16} color={TONES.orange.solid} />
          <Text style={[styles.td, styles.code]}>{g.code}</Text>
          <Text style={[styles.td, styles.flex]} numberOfLines={1}>{g.name}</Text>
          <Text style={styles.cell}>{shortM(bal(g.code[0]))}</Text>
          <Pill label={g.type} tone={g.tone} size={10} />
        </View>
      ))}
    </FinPanel>
  );
}

function Periods({ u }: { u: U }) {
  return (
    <FinPanel icon="calendar" title="Financial Periods" onAll={u.closePeriod} allLabel="Manage">
      {u.periods.slice(0, 2).map((x) => (
        <View key={x.name} style={styles.line}>
          <Text style={[styles.td, styles.flex]}>{x.name}</Text>
          <Text style={styles.cell}>{`${date(x.start)} – ${date(x.end)}`}</Text>
          <Pill label={x.status} tone={PERIOD_TONE[x.status]} size={10.5} />
        </View>
      ))}
      <View style={styles.line}>
        <Text style={[styles.td, styles.flex]}>Financial Year</Text>
        <Text style={styles.cell}>{u.d.financialYear}</Text>
        <Pill label="FY2026" tone="blue" size={10.5} />
      </View>
    </FinPanel>
  );
}

function Quick({ u }: { u: U }) {
  const items: readonly { icon: IconName; label: string; onPress: () => void }[] = [
    { icon: 'plus', label: 'New Journal', onPress: () => u.newJournal() },
    { icon: 'chart', label: 'Run Trial Balance', onPress: u.runTb },
    { icon: 'building', label: 'Reconcile Bank', onPress: u.reconcile },
    { icon: 'lock', label: 'Lock Period', onPress: u.closePeriod },
    { icon: 'layers', label: 'Chart of Accounts', onPress: () => u.setTab('Chart of Accounts') },
    { icon: 'doc', label: 'Financial Reports', onPress: () => router.push('/command/finance/reports' as never) },
  ];
  return (
    <FinPanel icon="sparkle" title="Quick Accounting Actions">
      <ActionGrid items={items} columns={3} />
    </FinPanel>
  );
}

function Trial({ u, phone = false }: { u: U; phone?: boolean }) {
  return (
    <FinPanel icon="clipboard" title="Trial Balance (Oct 2026)" style={!phone && styles.flex} onAll={u.runTb} allLabel="Run Again">
      <View style={styles.tbHead}>
        <Text style={[styles.th, styles.flex]}>Account Type</Text>
        <Text style={[styles.th, styles.amt, phone && styles.amtPhone]}>Debit (UGX)</Text>
        <Text style={[styles.th, styles.amt, phone && styles.amtPhone]}>Credit (UGX)</Text>
      </View>
      {u.tb.rows.map((r) => (
        <View key={r.type} style={styles.tbRow}>
          <Text style={[styles.td, styles.flex]}>{TB_LABEL[r.type]}</Text>
          <Text style={[styles.td, styles.amt, phone && styles.amtPhone]}>{r.debit ? num(r.debit) : '–'}</Text>
          <Text style={[styles.td, styles.amt, phone && styles.amtPhone]}>{r.credit ? num(r.credit) : '–'}</Text>
        </View>
      ))}
      <View style={[styles.tbRow, styles.tbTotal, !u.tb.balanced && styles.tbBad]}>
        <Text style={[styles.tdStrong, styles.flex]}>{u.tb.balanced ? 'Total (balanced)' : 'Total – out of balance'}</Text>
        <Text style={[styles.tdStrong, styles.amt, phone && styles.amtPhone]}>{num(u.tb.debit)}</Text>
        <Text style={[styles.tdStrong, styles.amt, phone && styles.amtPhone]}>{num(u.tb.credit)}</Text>
      </View>
      <Text style={styles.cell}>{`Equity shows opening equity; this year's surplus of ${ugx(u.st.surplus)} is the difference between revenue and expenses.`}</Text>
    </FinPanel>
  );
}

function Bank({ u, phone = false }: { u: U; phone?: boolean }) {
  const tone: Tone = u.rec.status === 'Reconciled' ? 'green' : u.rec.status === 'Partially Reconciled' ? 'orange' : 'red';
  return (
    <FinPanel icon="building" title="Bank Reconciliation" style={!phone && styles.flex}>
      <Text style={styles.td}>{u.d.bank.account}</Text>
      <View style={styles.recTiles}>
        {(
          [
            ['Bank Balance', u.d.bank.statement, 'blue'],
            ['Book Balance', u.book, 'purple'],
            ['Difference', u.rec.difference, u.rec.difference ? 'orange' : 'green'],
          ] as const
        ).map(([l, v, t]) => (
          <View key={l} style={[styles.recTile, { backgroundColor: TONES[t].soft }]}>
            <Text style={styles.cell}>{l}</Text>
            <Text style={styles.tdStrong} numberOfLines={1}>{phone ? (Math.abs(v) >= 1e9 ? `UGX ${(v / 1e9).toFixed(3)}B` : `UGX ${shortM(v)}`) : ugx(v)}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.inline, styles.wrap]}>
        <Icon name="check" size={16} color={TONES[tone].solid} />
        <Text style={styles.td}>Status:</Text>
        <Pill label={u.rec.status} tone={tone} size={10.5} />
        <Text style={styles.cell}>{`(${u.rec.outstanding} outstanding item${u.rec.outstanding === 1 ? '' : 's'})`}</Text>
        <View style={styles.flex} />
        <PrimaryBtn label="Reconcile Now" icon="arrowRight" onPress={u.reconcile} />
      </View>
    </FinPanel>
  );
}

function Filters({ u }: { u: U }) {
  const cycle = (xs: readonly string[], v: string) => xs[(xs.indexOf(v) + 1) % xs.length];
  return (
    <View style={styles.inline}>
      <OutlineBtn small chevron label={u.source} onPress={() => u.setSource(cycle(FILTERS.source, u.source))} />
      <Search placeholder="Search by reference, narration or account..." value={u.query} onChange={u.setQuery} style={styles.search} />
    </View>
  );
}

function Journals({ u }: { u: U }) {
  return (
    <FinPanel icon="doc" title={`Journal Entries (${num(u.d.journalCount + u.list.length - u.d.entries.length)})`} right={<Filters u={u} />}>
      <DataTable columns={cols(u)} rows={u.rows} rowKey={(e) => e.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.manage} onRowPress={u.manage} />
      <PageStrip label={`Showing 1 – ${u.rows.length} of ${num(u.d.journalCount)} journals`} page={u.page} pages={u.pages} onPage={u.setPage} />
    </FinPanel>
  );
}

/** Maple Command › Finance › Corporate General Ledger on the desktop reference. */
export function LedgerDesk({ c }: { c: CommandData }) {
  const u = useLedger(c.platformFinance.ledger, c.platformFinance.me.name.replace(/^Mr\.\s*/, ''), c.platformFinance.corporate.preparer, c.platformFinance.corporate.approvers);
  return (
    <FinDesk c={c} sub="Accounting" search="Search by account, journal, transaction, reference, or narration..." promo={PROMO}>
      <FinHead
        icon="book"
        title="Corporate General Ledger"
        subtitle="Maple's chart of accounts, journals, ledger, trial balance, bank reconciliation and period controls."
        right={
          <>
            <PrimaryBtn label="New Journal" icon="plus" onPress={() => u.newJournal()} />
            <OutlineBtn label="Import Journals" icon="upload" onPress={() => u.newJournal(true)} />
            <OutlineBtn label="Run Trial Balance" icon="doc" onPress={u.runTb} />
            <OutlineBtn label="Export" icon="download" chevron onPress={u.exportGl} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <View style={[styles.flex, styles.stack]}>
          <View style={styles.row}>
            <IncomeChart d={u.d} />
            <Snapshot u={u} />
          </View>
          <Journals u={u} />
          <View style={styles.row}>
            <Trial u={u} />
            <Bank u={u} />
          </View>
        </View>
        <View style={styles.side}>
          <Chart u={u} />
          <Periods u={u} />
          <Quick u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: statement tiles, trial balance, bank and journal cards. */
export function LedgerPhone({ c }: { c: CommandData }) {
  const u = useLedger(c.platformFinance.ledger, c.platformFinance.me.name.replace(/^Mr\.\s*/, ''), c.platformFinance.corporate.preparer, c.platformFinance.corporate.approvers);
  return (
    <FinPhone c={c} title="General Ledger" subtitle="Maple's own books: journals, trial balance and periods.">
      <FinStats items={u.stats} phone title="Books at a Glance" />
      <View style={styles.inline}>
        <PrimaryBtn label="New Journal" icon="plus" onPress={() => u.newJournal()} style={styles.flex} />
        <OutlineBtn label="Close" icon="lock" onPress={u.closePeriod} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <Trial u={u} phone />
      <Bank u={u} phone />
      {u.rows.map((e) => (
        <PhoneRow key={e.id} lead={<Icon name="doc" size={26} color={NAVY} />} title={`${e.id} • ${e.description}`} sub={`${date(e.date)} • ${e.source} • ${ugx(entryTotals(e).debit)}`} pill={<Pill label={e.reversedBy ? 'Reversed' : e.status} tone={e.reversedBy ? 'orange' : STATUS_TONE[e.status]} size={11} />} onPress={() => u.manage(e)} />
      ))}
      <Periods u={u} />
      <Snapshot u={u} phone />
      <IncomeChart d={u.d} phone />
      <Chart u={u} />
      <Quick u={u} />
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
  cellStrong: { fontSize: 10.5, fontWeight: '700', color: NAVY },
  small: { fontSize: 9.5, color: BODY },
  td: { fontSize: 11.5, color: NAVY },
  tdStrong: { fontSize: 12, fontWeight: '800', color: NAVY },
  th: { fontSize: 10.5, fontWeight: '700', color: BODY },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  code: { width: 40, fontWeight: '700' },
  amt: { width: 120, textAlign: 'right' },
  amtPhone: { width: 104, fontSize: 10.5 },
  wrap: { flexWrap: 'wrap' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
  tbHead: { flexDirection: 'row', paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: LINE },
  tbRow: { flexDirection: 'row', paddingVertical: 4 },
  tbTotal: { paddingHorizontal: 6, borderRadius: 8, backgroundColor: TONES.green.soft },
  tbBad: { backgroundColor: TONES.red.soft },
  recTiles: { flexDirection: 'row', gap: 8 },
  recTile: { flex: 1, minWidth: 0, gap: 3, padding: 10, borderRadius: 10 },
});
