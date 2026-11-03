import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CmdStat, CountTabs, DetailRow, KpiGrid, OutlineBtn, PageStrip, PrimaryBtn, RangeBox, exportMenu } from '@/features/command/kit/CmdParts';
import { CmdHead, CommandDesk, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { formatMoney, invoiceStatus, type InvoiceStatus, invoiceTotals, issueCreditNote, nextInvoiceNumber, paymentLink, recordPayment, sendReminder } from '@/features/command/logic/invoices';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Search, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import { dateLabel, type InvoiceRow } from '@/mock/command-center/billing';

import { CreateInvoiceModal, type MoneyAsk, MoneyModal, type NewInvoice } from './InvoiceModals';

type B = CommandData['billing'];
const PER_PAGE = 12;
const STATUS_TONE: Readonly<Record<InvoiceStatus, Tone>> = { Paid: 'green', Pending: 'orange', 'Partially Paid': 'blue', Overdue: 'red', Draft: 'grey' };
type TabKey = 'all' | 'Institution' | 'Student' | 'Draft' | 'Overdue' | 'Recurring';
const TABS: readonly { label: string; key: TabKey }[] = [
  { label: 'All Invoices', key: 'all' },
  { label: 'Institutions (Schools)', key: 'Institution' },
  { label: 'Independent Students', key: 'Student' },
  { label: 'Drafts', key: 'Draft' },
  { label: 'Overdue', key: 'Overdue' },
  { label: 'Recurring', key: 'Recurring' },
];

function inTab(i: InvoiceRow, key: TabKey, today: string): boolean {
  if (key === 'all') return true;
  if (key === 'Institution' || key === 'Student') return i.type === key;
  if (key === 'Recurring') return i.recurring;
  return invoiceStatus(i, today) === key;
}

function useInvoices(b: B, ME: string) {
  const today = b.TODAY;
  const [list, setList] = useState<readonly InvoiceRow[]>(b.invoices);
  const [tab, setTab] = useState<string>(TABS[0].label);
  const [query, setQuery] = useState('');
  const [type, setType, types] = useChoice(['All Types', 'Institution', 'Student']);
  const [status, setStatus, statuses] = useChoice(['All Statuses', 'Paid', 'Pending', 'Partially Paid', 'Overdue', 'Draft']);
  const [school, setSchool, schools] = useChoice(['All Schools / Institutions', ...b.institutionCustomers]);
  const [range, setRange, ranges] = useChoice(['All Date Ranges', 'This Month', 'Last Month']);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(b.featuredInvoice);
  const [money, setMoney] = useState<MoneyAsk | null>(null);
  const [creating, setCreating] = useState(false);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const key = TABS.find((t) => t.label === tab)?.key ?? 'all';
    const q = query.trim().toLowerCase();
    const month = (i: InvoiceRow) => (range === 'All Date Ranges' ? true : range === 'This Month' ? i.issueDate.startsWith('2026-10') : i.issueDate.startsWith('2026-09'));
    return list.filter(
      (i) =>
        inTab(i, key, today) &&
        (type === 'All Types' || i.type === type) &&
        (status === 'All Statuses' || invoiceStatus(i, today) === status) &&
        (school === 'All Schools / Institutions' || i.customer === school) &&
        month(i) &&
        (!q || `${i.number} ${i.customer} ${i.description} ${i.contact}`.toLowerCase().includes(q)),
    );
  }, [list, tab, query, type, status, school, range, today]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const open = list.find((i) => i.id === openId) ?? null;
  const update = (i: InvoiceRow) => setList((prev) => prev.map((x) => (x.id === i.id ? i : x)));
  const stamp = dateLabel(today);

  const remind = (i: InvoiceRow) => {
    const r = sendReminder(i, today, ME);
    if (r.error) return toast(r.error);
    update({ ...r.invoice, audit: r.invoice.audit.map((a, n) => (n === 0 ? { ...a, at: stamp } : a)) });
    toast(`Reminder sent by email, SMS and WhatsApp to ${i.contact}. "${r.message}"`);
  };
  const askPayment = (i: InvoiceRow) =>
    setMoney({
      mode: 'payment',
      number: i.number,
      currency: i.currency,
      balance: invoiceTotals(i).balance,
      onConfirm: (amount, method) => {
        const r = recordPayment(i, { amount, date: stamp, method, by: ME });
        if (r.error) return r.error;
        update(r.invoice);
        const left = invoiceTotals(r.invoice).balance;
        toast(`${r.invoice.payments.at(-1)?.receipt} issued. ${left ? `${formatMoney(left, i.currency)} still due.` : 'Invoice paid in full.'}`);
        return undefined;
      },
    });
  const askCredit = (i: InvoiceRow) =>
    setMoney({
      mode: 'credit',
      number: i.number,
      currency: i.currency,
      balance: invoiceTotals(i).balance,
      onConfirm: (amount, reason) => {
        const r = issueCreditNote(i, { amount, reason, date: stamp, by: ME });
        if (r.error) return r.error;
        update(r.invoice);
        toast(`${r.invoice.credits.at(-1)?.number} issued to ${i.customer}.`);
        return undefined;
      },
    });
  const create = (n: NewInvoice) => {
    const number = nextInvoiceNumber(
      list.map((x) => x.number),
      today,
    );
    const due = new Date(Date.parse(today) + 14 * 86_400_000).toISOString().slice(0, 10);
    const row: InvoiceRow = {
      id: number,
      n: list.length + 1,
      number,
      type: n.type,
      customer: n.customer,
      place: n.type === 'Institution' ? 'Uganda' : 'Individual',
      description: n.item,
      currency: n.currency,
      issueDate: today,
      dueDate: due,
      lines: [{ description: n.item, qty: n.qty, unitPrice: n.unitPrice }],
      discount: 0,
      taxRate: 0,
      payments: [],
      credits: [],
      audit: [{ at: stamp, by: ME, action: n.draft ? 'Draft created' : 'Invoice created and sent with payment link and QR code' }],
      draft: n.draft,
      learnerAge: n.age,
      guardian: n.guardian ? { name: n.guardian, verified: true } : undefined,
      terms: 'Net 14',
      contact: n.guardian ?? (n.type === 'Institution' ? 'Bursar' : n.customer),
      notes: n.item,
      recurring: false,
    };
    setList((prev) => [row, ...prev]);
    setOpenId(number);
    setTab(TABS[0].label);
    toast(n.draft ? `${number} saved as a draft.` : `${number} sent to ${row.contact} with a payment link.`);
  };
  const issueDraft = (i: InvoiceRow) => {
    update({ ...i, draft: false, audit: [{ at: stamp, by: ME, action: 'Draft issued and sent' }, ...i.audit] });
    toast(`${i.number} issued and sent to ${i.contact}.`);
  };
  const counts = (key: TabKey) => {
    const live = (l: readonly InvoiceRow[]) => l.filter((i) => inTab(i, key, today)).length;
    return b.invoiceTotals[key] + live(list) - live(b.invoices);
  };
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  const nextNumber = nextInvoiceNumber(
    list.map((x) => x.number),
    today,
  );
  return { today, rows, shown, tab, setTab: pick, query, setQuery, type, setType, types, status, setStatus, statuses, school, setSchool, schools, range, setRange, ranges, page: p, pages, setPage, open, setOpenId, remind, askPayment, askCredit, issueDraft, create, creating, setCreating, nextNumber, money, setMoney, counts, selected, toggle };
}
type U = ReturnType<typeof useInvoices>;

function TypePill({ type }: { type: InvoiceRow['type'] }) {
  return <Pill label={type === 'Institution' ? 'Institution' : 'Student'} tone={type === 'Institution' ? 'blue' : 'purple'} icon={type === 'Institution' ? 'building' : 'cap'} size={10.5} />;
}

function cols(today: string): readonly Column<InvoiceRow>[] {
  return [
    { label: '#', width: 26, render: (i) => <Cell small>{i.n}</Cell> },
    { label: 'Invoice No.', width: 120, render: (i) => <Cell small>{i.number}</Cell> },
    { label: 'Type', width: 84, render: (i) => <TypePill type={i.type} /> },
    { label: 'Customer', flex: 1.25, render: (i) => <Cell small>{`${i.customer}\n${i.place === 'Individual' ? '(Individual)' : i.place}`}</Cell> },
    { label: 'Description', flex: 1, render: (i) => <Cell small>{i.description}</Cell> },
    { label: 'Issue Date', width: 82, render: (i) => <Cell small>{dateLabel(i.issueDate)}</Cell> },
    { label: 'Due Date', width: 82, render: (i) => <Cell small>{dateLabel(i.dueDate)}</Cell> },
    { label: 'Amount (UGX)', width: 80, render: (i) => <Cell small>{i.currency === 'UGX' ? invoiceTotals(i).total.toLocaleString('en-US') : formatMoney(invoiceTotals(i).total, i.currency)}</Cell> },
    { label: 'Status', width: 94, render: (i) => <Pill label={invoiceStatus(i, today)} tone={STATUS_TONE[invoiceStatus(i, today)]} size={10.5} /> },
  ];
}

function ItemsTable({ i }: { i: InvoiceRow }) {
  const t = invoiceTotals(i);
  const m = (n: number) => formatMoney(n, i.currency).replace(`${i.currency} `, '');
  return (
    <View style={styles.items}>
      <View style={[styles.itemRow, styles.itemHead]}>
        <Text style={[styles.th, styles.numCol]}>#</Text>
        <Text style={[styles.th, styles.flex]}>Description</Text>
        <Text style={[styles.th, styles.qty]}>Qty</Text>
        <Text style={[styles.th, styles.money]}>{`Unit Price (${i.currency})`}</Text>
        <Text style={[styles.th, styles.money]}>{`Total (${i.currency})`}</Text>
      </View>
      {i.lines.map((l, n) => (
        <View key={l.description} style={styles.itemRow}>
          <Text style={[styles.td, styles.numCol]}>{n + 1}</Text>
          <Text style={[styles.td, styles.flex]}>{l.description}</Text>
          <Text style={[styles.td, styles.qty]}>{l.qty}</Text>
          <Text style={[styles.td, styles.money]}>{m(l.unitPrice)}</Text>
          <Text style={[styles.td, styles.money]}>{m(l.qty * l.unitPrice)}</Text>
        </View>
      ))}
      <View style={styles.sums}>
        <SumRow label="Subtotal" value={m(t.subtotal)} />
        {t.discount ? <SumRow label="Discount" value={`−${m(t.discount)}`} /> : null}
        <SumRow label={`Tax (${Math.round(i.taxRate * 100)}%)`} value={m(t.tax)} />
        <SumRow label="Total Amount" value={formatMoney(t.total, i.currency)} strong />
        {t.paid ? <SumRow label="Paid" value={`−${m(t.paid)}`} /> : null}
        {t.credited ? <SumRow label="Credit notes" value={`−${m(t.credited)}`} /> : null}
        {t.paid || t.credited ? <SumRow label="Balance Due" value={formatMoney(t.balance, i.currency)} strong /> : null}
      </View>
    </View>
  );
}

function SumRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.sumRow}>
      <Text style={[styles.sumLabel, strong && styles.sumStrong]}>{label}</Text>
      <Text style={[styles.sumValue, strong && styles.sumBig]}>{value}</Text>
    </View>
  );
}

function DetailsPanel({ u, onClose }: { u: U; onClose?: () => void }) {
  const i = u.open;
  const [tab, setTab] = useState('Details');
  if (!i)
    return (
      <Card style={styles.panel}>
        <Text style={styles.small}>Pick an invoice to see it.</Text>
      </Card>
    );
  const st = invoiceStatus(i, u.today);
  const t = invoiceTotals(i);
  const minor = i.type === 'Student' && (i.learnerAge ?? 18) < 18;
  const tabs = ['Details', `Items (${i.lines.length})`, `Payments (${i.payments.length + i.credits.length})`, `Activity (${i.audit.length})`];
  return (
    <>
      <Card style={styles.panel}>
        <View style={styles.inline}>
          <Text style={[styles.panelTitle, styles.flex]}>Invoice Details</Text>
          {onClose ? (
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close details" hitSlop={8}>
              <Icon name="close" size={18} color={BODY} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.inline}>
          <View style={[styles.docIcon, { backgroundColor: TONES.blue.soft }]}>
            <Icon name="receipt" size={22} color={BLUE} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.number}>{i.number}</Text>
            <Text style={styles.small}>{i.type === 'Institution' ? 'Institution Invoice' : 'Independent Learner Invoice'}</Text>
          </View>
          <Pill label={st} tone={STATUS_TONE[st]} size={11} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <CountTabs tabs={tabs.map((label) => ({ label }))} active={tabs.find((l) => l.startsWith(tab)) ?? tabs[0]} onChange={(l) => setTab(l.split(' (')[0])} size={12.5} dense style={styles.noWrap} />
        </ScrollView>
        {tab === 'Details' ? (
          <>
            <View style={styles.custCard}>
              <Icon name={i.type === 'Institution' ? 'building' : 'person'} size={22} color={BLUE} />
              <View style={styles.flex}>
                <Text style={styles.custName}>{i.customer}</Text>
                <Text style={styles.small}>{i.place === 'Individual' ? 'Independent learner' : `${i.place}, Uganda`}</Text>
              </View>
              <OutlineBtn label="View Customer" small onPress={() => toast(`${i.customer}: invoices, payments, learners and contacts.`)} />
            </View>
            <DetailRow label="Invoice Number" value={i.number} />
            <DetailRow label="Issue Date" value={dateLabel(i.issueDate)} />
            <DetailRow label="Due Date" value={`${dateLabel(i.dueDate)} (14 days)`} />
            <DetailRow label="Payment Terms" value={i.terms} />
            <DetailRow label={minor ? 'Billed To' : 'Billing Contact'} value={minor ? `${i.guardian?.name ?? '—'} (verified guardian)` : i.contact} />
            <DetailRow label="Currency" value={i.currency} />
            <DetailRow label="Balance" value={formatMoney(t.balance, i.currency)} />
            <DetailRow label="Notes" value={i.notes} />
            <Pressable style={styles.linkRow} onPress={() => toast(`Payment link copied: ${paymentLink(i)}`)} accessibilityRole="button" accessibilityLabel="Copy payment link">
              <Icon name="qr" size={30} color={NAVY} />
              <View style={styles.flex}>
                <Text style={styles.custName}>Payment link and QR code</Text>
                <Text style={styles.small} numberOfLines={1}>
                  {paymentLink(i)}
                </Text>
              </View>
              <Icon name="link" size={16} color={BLUE} />
            </Pressable>
          </>
        ) : null}
        {tab.startsWith('Items') ? <ItemsTable i={i} /> : null}
        {tab.startsWith('Payments') ? (
          <View style={styles.block}>
            {i.payments.map((pm) => (
              <Text key={pm.id} style={styles.small}>{`${pm.receipt} • ${formatMoney(pm.amount, i.currency)} • ${pm.method} • ${pm.date}`}</Text>
            ))}
            {i.credits.map((c) => (
              <Text key={c.id} style={styles.small}>{`${c.number} • −${formatMoney(c.amount, i.currency)} • ${c.reason}`}</Text>
            ))}
            {!i.payments.length && !i.credits.length ? <Text style={styles.small}>No payments yet.</Text> : null}
            <OutlineBtn label="Issue Credit Note" icon="undo" small onPress={() => u.askCredit(i)} />
          </View>
        ) : null}
        {tab.startsWith('Activity') ? (
          <View style={styles.block}>
            {i.audit.map((a, n) => (
              <Text key={`${a.at}-${n}`} style={styles.small}>{`${a.at} • ${a.by}: ${a.action}`}</Text>
            ))}
          </View>
        ) : null}
      </Card>
      <Card style={styles.panel}>
        <Text style={styles.panelTitle}>Invoice Items</Text>
        <ItemsTable i={i} />
        {i.draft ? <PrimaryBtn label="Issue Invoice" icon="send" onPress={() => u.issueDraft(i)} /> : <PrimaryBtn label="Record Payment" icon="wallet" tone="green" onPress={() => u.askPayment(i)} />}
        <View style={styles.actions}>
          <OutlineBtn label="Send Reminder" icon="mail" onPress={() => u.remind(i)} style={styles.flex} />
          <OutlineBtn label="Download PDF" icon="download" onPress={() => toast(`${i.number}.pdf: Maple-branded, with the QR code, payment link and URA TIN.`)} style={styles.flex} />
        </View>
      </Card>
    </>
  );
}

function Filters({ u }: { u: U }) {
  return (
    <View style={styles.inline}>
      <Search placeholder="Search invoices..." value={u.query} onChange={u.setQuery} style={styles.flex} />
      <Select u={u.type} on={u.setType} all={u.types} w={110} />
      <Select u={u.status} on={u.setStatus} all={u.statuses} w={120} />
      <Select u={u.school} on={u.setSchool} all={u.schools} w={190} />
      <Select u={u.range} on={u.setRange} all={u.ranges} w={140} />
    </View>
  );
}

function Select({ u, on, all, w }: { u: string; on: (v: string) => void; all: readonly string[]; w: number }) {
  return (
    <Pressable style={[styles.select, { width: w }]} onPress={() => on(all[(all.indexOf(u) + 1) % all.length])} accessibilityRole="button" accessibilityLabel={`${u}. Tap to change`}>
      <Text style={[styles.selectText, styles.flex]} numberOfLines={1}>
        {u}
      </Text>
      <Icon name="chevronDown" size={13} color={NAVY} />
    </Pressable>
  );
}

function Modals({ u, b }: { u: U; b: B }) {
  return (
    <>
      <MoneyModal ask={u.money} onClose={() => u.setMoney(null)} />
      <CreateInvoiceModal visible={u.creating} onClose={() => u.setCreating(false)} onCreate={u.create} catalogue={b.catalogue} schools={b.institutionCustomers} learners={b.learnerCustomers} number={u.nextNumber} />
    </>
  );
}

/** Maple Command › Finance › Invoices on the desktop reference. */
export function InvoicesDesk({ c }: { c: CommandData }) {
  const b = c.billing;
  const u = useInvoices(b, c.me.name);
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search invoices, institutions, students, or reference numbers..." active="Finance" sub="Invoices">
      <CmdHead
        icon="receipt"
        section="Finance"
        title="Invoices"
        subtitle="Create, manage and track invoices for institutions (schools) and independent students. Supports one-time payments, subscriptions and bulk invoicing."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="Create Invoice" chevron onPress={() => u.setCreating(true)} />
            <PrimaryBtn label="Export" chevron onPress={() => exportMenu('Invoices')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {b.invoiceStats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <Card style={[styles.tableCard, styles.flex]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <CountTabs tabs={TABS.map((t) => ({ label: t.label, count: u.counts(t.key), tone: 'red' as const }))} active={u.tab} onChange={u.setTab} size={12.5} dense style={styles.noWrap} />
          </ScrollView>
          <Filters u={u} />
          <DataTable columns={cols(u.today)} rows={u.rows} rowKey={(i) => i.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={(i) => u.setOpenId(i.id)} onRowPress={(i) => u.setOpenId(i.id)} activeKey={u.open?.id} />
          <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} invoices`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </Card>
        <View style={styles.side}>
          <DetailsPanel u={u} onClose={() => u.setOpenId(null)} />
        </View>
      </View>
      <Modals u={u} b={b} />
    </CommandDesk>
  );
}

/** The phone version: totals, tabs and invoice cards; tapping one opens it. */
export function InvoicesPhone({ c }: { c: CommandData }) {
  const b = c.billing;
  const u = useInvoices(b, c.me.name);
  const [view, setView] = useState<'list' | 'detail'>('list');
  if (view === 'detail') {
    return (
      <CommandPhone key="detail" me={c.me}>
        <PageHead title={u.open?.number ?? 'Invoice'} subtitle={u.open?.customer ?? ''} phone onBack={() => setView('list')} />
        <DetailsPanel u={u} />
        <Modals u={u} b={b} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Invoices" subtitle="Institutions and independent learners, with payments and reminders." phone />
      <KpiGrid items={b.invoiceStats} />
      <PrimaryBtn label="Create Invoice" icon="plus" onPress={() => u.setCreating(true)} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={TABS.map((t) => ({ label: t.label, count: u.counts(t.key) }))} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      <Search placeholder="Search invoices..." value={u.query} onChange={u.setQuery} />
      {u.rows.map((i) => {
        const st = invoiceStatus(i, u.today);
        return (
          <Pressable
            key={i.id}
            style={styles.card}
            onPress={() => {
              u.setOpenId(i.id);
              setView('detail');
            }}
            accessibilityRole="button"
            accessibilityLabel={`${i.number}, ${i.customer}, ${st}`}>
            <View style={styles.inline}>
              <Text style={[styles.custName, styles.flex]}>{i.customer}</Text>
              <Pill label={st} tone={STATUS_TONE[st]} size={11} />
            </View>
            <Text style={styles.small}>{`${i.number} • ${i.description}`}</Text>
            <View style={styles.inline}>
              <TypePill type={i.type} />
              <Text style={[styles.small, styles.flex]}>{`Due ${dateLabel(i.dueDate)}`}</Text>
              <Text style={styles.cardAmount}>{formatMoney(invoiceTotals(i).total, i.currency)}</Text>
            </View>
          </Pressable>
        );
      })}
      {!u.rows.length ? <Text style={styles.small}>No invoices match.</Text> : null}
      <PageStrip label={`${u.shown.length} invoices`} page={u.page} pages={u.pages} onPage={u.setPage} />
      <Modals u={u} b={b} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noWrap: { flexWrap: 'nowrap' },
  block: { gap: 6 },
  small: { fontSize: 12, lineHeight: 18, color: BODY },
  tableCard: { gap: 10, padding: 12 },
  side: { width: 372, gap: 14 },
  panel: { gap: 10, padding: 14 },
  panelTitle: { fontSize: 15.5, fontWeight: '800', color: NAVY },
  docIcon: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  number: { fontSize: 15, fontWeight: '800', color: NAVY },
  custCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  custName: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, backgroundColor: '#F4F7FC' },
  items: { borderRadius: 10, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderBottomWidth: 1, borderColor: LINE },
  itemHead: { backgroundColor: '#F4F7FC' },
  th: { fontSize: 11, fontWeight: '600', color: NAVY },
  td: { fontSize: 11.5, color: NAVY },
  numCol: { width: 14 },
  qty: { width: 32, textAlign: 'right' },
  money: { width: 76, textAlign: 'right' },
  sums: { gap: 4, padding: 10, alignItems: 'flex-end' },
  sumRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  sumLabel: { width: 110, fontSize: 12, color: BODY },
  sumStrong: { fontWeight: '700', color: NAVY },
  sumValue: { minWidth: 110, textAlign: 'right', fontSize: 12, color: NAVY },
  sumBig: { fontSize: 15, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 8 },
  select: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  selectText: { fontSize: 12, color: NAVY },
  card: { gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cardAmount: { fontSize: 13.5, fontWeight: '800', color: NAVY },
});
