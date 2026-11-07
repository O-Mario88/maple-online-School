import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar, Btn, Card, CardHead, IconTile, Pill, UnderTabs } from '@/features/portal/PortalParts';
import { BODY, GREEN, LINE, MUTED, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { LedgerTx } from '@/mock/school-admin';

import { AdminDesk, AdminPhone, BigButton, Cell, type Column, DataTable, Face, Legend, ListCard, ListRow, MiniBtn, money, PageHead, Pager, Search, SelectBox, Segments, StatusCell, useChoice, useSelection } from '../kit/AdminKit';
import { BarChart, Donut, DonutLabel } from '../kit/Charts';
import { Maple } from '@/constants/maple';

type Admin = MockData['schoolAdmin'];
type Ledger = Admin['ledger'];
type Breakdown = Ledger['breakdown'][number];

const PAY_TONE: Readonly<Record<string, Tone>> = { Paid: 'green', 'N/A': 'grey', Partial: 'orange', Unpaid: 'red' };
const TYPE_TONE: Readonly<Record<LedgerTx['type'], Tone>> = { Balance: 'grey', Invoice: 'red', Adjustment: 'purple', Payment: 'green', Reversal: 'orange' };

/** The ledger's entries: append-only, so a reversal or adjustment adds a new line and never edits an old one. */
function useLedger(l: Ledger) {
  const [txs, setTxs] = useState<readonly LedgerTx[]>(l.transactions);
  const post = (kind: 'Reversal' | 'Adjustment', ref: string, amount: number, reason: string) => {
    const last = txs[txs.length - 1];
    const credit = kind === 'Adjustment' ? amount : 0;
    const debit = kind === 'Reversal' ? amount : 0;
    const tx: LedgerTx = {
      n: txs.length + 1,
      date: 'Nov 3, 2026',
      desc: `${kind === 'Reversal' ? `Reversal of ${ref}` : 'Adjustment'}: ${reason}`,
      type: kind,
      method: '-',
      ref: `${kind === 'Reversal' ? 'REV' : 'ADJ'}-${String(txs.length + 1).padStart(3, '0')}`,
      debit,
      credit,
      balance: last.balance - debit + credit,
      by: 'Bursar',
    };
    setTxs((prev) => [...prev, tx]);
    toast(`${kind} journal ${tx.ref} posted. The original entry stays in the ledger and the audit log records who did it.`);
  };
  // New journals move the totals from the term's starting position.
  const posted = txs.slice(l.transactions.length);
  const credits = posted.reduce((sum, t) => sum + t.credit, 0);
  const debits = posted.reduce((sum, t) => sum + t.debit, 0);
  const paid = l.totals.paid;
  const outstanding = Math.max(0, l.totals.outstanding - credits + debits);
  return { txs, post, paid, outstanding };
}

/** The controlled reversal / adjustment journal: pick the entry, the amount and a required reason. */
function AdjustModal({ visible, onClose, txs, onPost }: { visible: boolean; onClose: () => void; txs: readonly LedgerTx[]; onPost: (kind: 'Reversal' | 'Adjustment', ref: string, amount: number, reason: string) => void }) {
  const payments = txs.filter((t) => t.type === 'Payment');
  const [kind, setKind] = useState<'Reversal' | 'Adjustment'>('Adjustment');
  const [ref, setRef] = useState(payments[0]?.ref ?? '');
  const [amount, setAmount] = useState('50000');
  const [reason, setReason] = useState('');
  const n = Number(amount.replace(/[^0-9]/g, ''));
  const ok = n > 0 && reason.trim().length >= 5;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Adjust / Reverse</Text>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
              <Icon name="close" size={22} color={NAVY} />
            </Pressable>
          </View>
          <Text style={styles.modalSub}>Entries are never edited or deleted. This posts a new balancing journal, and needs a second approver above UGX 500,000.</Text>
          <Segments items={['Adjustment', 'Reversal']} active={kind} onChange={(v) => setKind(v as 'Reversal' | 'Adjustment')} stretch />
          {kind === 'Reversal' ? (
            <>
              <Text style={styles.label}>Entry to reverse</Text>
              <SelectBox value={ref} options={payments.map((p) => p.ref)} onChange={setRef} />
            </>
          ) : null}
          <Text style={styles.label}>Amount (UGX)</Text>
          <TextInput style={styles.field} value={amount} onChangeText={setAmount} keyboardType="number-pad" accessibilityLabel="Amount in UGX" />
          <Text style={styles.label}>Reason (required)</Text>
          <TextInput style={[styles.field, styles.fieldTall]} value={reason} onChangeText={setReason} multiline placeholder="e.g. Sibling discount approved by the Head Teacher" placeholderTextColor={MUTED} accessibilityLabel="Reason" />
          <View style={styles.modalBtns}>
            <Btn label="Cancel" kind="outline" onPress={onClose} height={46} style={styles.flex} />
            <Btn
              label={`Post ${kind}`}
              onPress={() => {
                if (!ok) return toast('Enter an amount and a reason of at least 5 characters.');
                const amt = kind === 'Reversal' ? (payments.find((p) => p.ref === ref)?.credit ?? n) : n;
                onPost(kind, ref, amt, reason.trim());
                setReason('');
                onClose();
              }}
              height={46}
              style={[styles.flex, !ok && styles.dim]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Immutable Student Fee Sub-Ledger & Mobile-Money Reconciliation on the desktop reference. */
export function LedgerDesk({ a }: { a: Admin }) {
  const l = a.ledger;
  const g = useLedger(l);
  const [year, setYear, years] = useChoice(a.years);
  const [term, setTerm, terms] = useChoice(a.terms);
  const [grade, setGrade, grades] = useChoice(['All Grades', 'Primary', 'Secondary']);
  const [cls, setCls, classes] = useChoice(['All Classes', 'Primary 1A', 'Primary 1B']);
  const [allTerms, setAllTerms, termsAll] = useChoice(['All Terms', 'Term 1', 'Term 2']);
  const [txType, setTxType, txTypes] = useChoice(['All Transactions', 'Payments', 'Invoices', 'Adjustments']);
  const [txMethod, setTxMethod, txMethods] = useChoice(['All Payment Methods', 'Mobile Money', 'Bank Transfer', 'Card']);
  const [range, setRange, ranges] = useChoice(['Aug 1, 2026 – Dec 31, 2026', 'Jan 1, 2026 – Jul 31, 2026']);
  const [months, setMonths, monthsOpts] = useChoice(['Last 5 Months', 'This Term']);
  const [tab, setTab] = useState(l.tabs[0]);
  const [query, setQuery] = useState('');
  const [adjust, setAdjust] = useState(false);
  const [selB, toggleB] = useSelection();
  const [selT, toggleT] = useSelection();
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const byType = txType === 'All Transactions' ? g.txs : g.txs.filter((t) => `${t.type}s` === txType);
    return q ? byType.filter((t) => `${t.desc} ${t.ref}`.toLowerCase().includes(q)) : byType;
  }, [g.txs, query, txType]);
  const s = l.student;
  const bCols: readonly Column<Breakdown>[] = [
    { label: '#', width: 26, render: (x) => <Cell>{x.n}</Cell> },
    { label: 'Fee Item', flex: 1.5, render: (x) => <Cell strong>{x.item}</Cell> },
    { label: 'Amount (UGX)', flex: 1.1, align: 'right', render: (x) => <Cell>{money(x.amount)}</Cell> },
    { label: 'Paid (UGX)', flex: 1.1, align: 'right', render: (x) => <Cell>{money(x.paid)}</Cell> },
    { label: 'Balance (UGX)', flex: 1.1, align: 'right', render: (x) => <Cell color={x.amount - x.paid > 0 ? RED : undefined}>{money(x.amount - x.paid)}</Cell> },
    { label: 'Status', flex: 1, align: 'center', render: (x) => <StatusCell label={x.status} tone={PAY_TONE[x.status]} /> },
  ];
  const tCols: readonly Column<LedgerTx>[] = [
    { label: '#', width: 24, render: (x) => <Cell>{x.n}</Cell> },
    { label: 'Date', flex: 0.95, render: (x) => <Cell>{x.date}</Cell> },
    { label: 'Description', flex: 1.7, render: (x) => <Cell>{x.desc}</Cell> },
    { label: 'Type', flex: 0.95, render: (x) => <StatusCell label={x.type} tone={TYPE_TONE[x.type]} /> },
    { label: 'Payment Method', flex: 1.2, render: (x) => <Cell>{x.method}</Cell> },
    { label: 'Reference', flex: 1, render: (x) => <Cell>{x.ref}</Cell> },
    { label: 'Debit (UGX)', flex: 0.9, align: 'right', render: (x) => <Cell color={x.debit ? RED : undefined}>{money(x.debit)}</Cell> },
    { label: 'Credit (UGX)', flex: 0.9, align: 'right', render: (x) => <Cell>{money(x.credit)}</Cell> },
    { label: 'Balance (UGX)', flex: 1, align: 'right', render: (x) => <Cell>{money(x.balance)}</Cell> },
    { label: 'Created By', flex: 0.8, render: (x) => <Cell>{x.by}</Cell> },
  ];
  const totals = [
    { value: `UGX ${money(l.totals.fees)}`, label: 'Total Fees', icon: 'doc' as const, tone: 'blue' as Tone },
    { value: `UGX ${money(g.paid)}`, label: 'Paid', icon: 'check' as const, tone: 'green' as Tone, pct: '77%', progress: 0.77 },
    { value: `UGX ${money(g.outstanding)}`, label: 'Outstanding', icon: 'doc' as const, tone: 'red' as Tone, pct: '23%', progress: 0.23 },
    { value: `UGX ${money(l.totals.adjusted)}`, label: 'Adjusted', icon: 'plus' as const, tone: 'purple' as Tone, pct: '8%', progress: 0.08 },
    { value: `UGX ${money(l.totals.refunded)}`, label: 'Refunded', icon: 'alert' as const, tone: 'orange' as Tone },
  ];
  return (
    <AdminDesk me={a.me} search="Search students, payments, invoices, or reference numbers..." active="Student Ledger">
      <PageHead
        title="Student Fee Ledger"
        subtitle="View detailed ledger, payments, invoices and reconciliation for each student."
        right={
          <>
            <SelectBox label="Academic Year" value={year} options={years} onChange={setYear} />
            <SelectBox label="Term" value={term} options={terms} onChange={setTerm} />
            <Btn label="Export" iconRight="chevronDown" onPress={() => toast('Export the ledger as PDF, CSV, QuickBooks or Xero.')} height={52} />
          </>
        }
      />
      <Card style={styles.filters}>
        <Search placeholder="Search student by name or admission no..." style={styles.flex} />
        <SelectBox value={grade} options={grades} onChange={setGrade} width={140} />
        <SelectBox value={cls} options={classes} onChange={setCls} width={140} />
        <SelectBox value={allTerms} options={termsAll} onChange={setAllTerms} width={130} />
      </Card>
      <Card style={styles.studentBar}>
        <View style={styles.student}>
          <Face source={s.avatar} size={64} />
          <View>
            <Text style={styles.studentName}>{s.name}</Text>
            <Text style={styles.meta}>{`Admission No: ${s.adm}`}</Text>
            <Text style={styles.meta}>{`${s.cls}  •  ${s.type}`}</Text>
            <Pill label="Active" tone="green" icon="check" size={12} style={styles.active} />
          </View>
        </View>
        {totals.map((t) => (
          <View key={t.label} style={[styles.total, { backgroundColor: TONES[t.tone].soft + 'AA' }]}>
            <IconTile icon={t.icon} tone={t.tone} solid size={34} radius={9} />
            <View style={styles.flex}>
              <Text style={styles.totalValue} numberOfLines={1}>
                {t.value}
              </Text>
              <Text style={styles.meta}>{t.label}</Text>
              {t.pct ? (
                <View style={styles.pctRow}>
                  <Text style={[styles.pct, { color: TONES[t.tone].text }]}>{t.pct}</Text>
                  <Bar value={t.progress ?? 0} color={TONES[t.tone].solid} height={4} style={styles.flex} />
                </View>
              ) : null}
            </View>
          </View>
        ))}
      </Card>
      <Card style={styles.tabCard}>
        <UnderTabs items={l.tabs} active={tab} onChange={setTab} size={15} style={styles.tabs} />
      </Card>
      <View style={styles.row}>
        <Card style={[styles.block, styles.colBreak]}>
          <CardHead title="Fee Breakdown (Term 1, 2026)" />
          <DataTable columns={bCols} rows={l.breakdown} rowKey={(x) => String(x.n)} check dense selected={selB} onToggle={toggleB} />
        </Card>
        <Card style={[styles.block, styles.colTrend]}>
          <CardHead title="Payment Trend" right={<SelectBox value={months} options={monthsOpts} onChange={setMonths} width={140} />} />
          <View style={styles.legendRow}>
            <Legend color={Maple.successText} label="Payments" />
            <Legend color={Maple.error} label="Outstanding" />
          </View>
          <BarChart labels={l.trend.labels} series={[{ name: 'Payments', color: Maple.successText, values: l.trend.payments }]} line={{ name: 'Outstanding', color: Maple.error, values: l.trend.outstanding }} mode="grouped" max={500} height={210} format={(n) => (n ? `${n}K` : 'UGX 0')} />
        </Card>
      </View>
      <Card style={[styles.block, styles.txCard]}>
        <CardHead
          title="Ledger Transactions"
          size={19}
          right={
            <View style={styles.txTools}>
              <SelectBox value={txType} options={txTypes} onChange={setTxType} width={160} />
              <SelectBox value={txMethod} options={txMethods} onChange={setTxMethod} width={196} />
              <SelectBox value={range} options={ranges} onChange={setRange} width={232} />
              <Search placeholder="Search reference, note..." value={query} onChange={setQuery} style={styles.txSearch} />
              <Btn label="Add Transaction" icon="plus" onPress={() => toast('Record a cash, bank or Mobile Money payment. It is matched to an invoice automatically.')} height={42} />
            </View>
          }
        />
        <DataTable columns={tCols} rows={rows} rowKey={(x) => String(x.n)} check menu dense selected={selT} onToggle={toggleT} onMenu={(x) => toast(`${x.ref}: ${x.desc}. Matched automatically to ${x.type === 'Payment' ? 'INV-001' : 'the student account'}.`)} />
        <View style={styles.txFoot}>
          <Pager pages={1} page={1} onPage={() => undefined} label={`Showing 1–${rows.length} of ${g.txs.length} transactions`} />
          <View style={styles.exports}>
            <MiniBtn label="Adjust / Reverse" icon="sync" onPress={() => setAdjust(true)} />
            <MiniBtn label="Export CSV" icon="download" onPress={() => toast('Ledger exported as a CSV journal.')} />
            <MiniBtn label="Export to QuickBooks" icon="doc" tone="green" onPress={() => toast('Journal pushed to QuickBooks: 7 lines, balanced.')} />
            <MiniBtn label="Export to Xero" icon="cloud" onPress={() => toast('Journal pushed to Xero: 7 lines, balanced.')} />
          </View>
        </View>
      </Card>
      <AdjustModal visible={adjust} onClose={() => setAdjust(false)} txs={g.txs} onPost={g.post} />
    </AdminDesk>
  );
}

/** The phone reference: the student, three totals, tabs, the fee balance ring, Make Payment and recent transactions. */
export function LedgerPhone({ a }: { a: Admin }) {
  const l = a.ledger;
  const g = useLedger(l);
  const [tab, setTab] = useState('Overview');
  const [term, setTerm, terms] = useChoice(['Term 1, 2026', 'Term 2, 2026']);
  const [adjust, setAdjust] = useState(false);
  const s = l.student;
  const totals = [
    { value: money(l.totals.fees), label: 'Total Fees (UGX)', tone: 'blue' as Tone },
    { value: money(g.paid), label: 'Paid (UGX)', tone: 'green' as Tone },
    { value: money(g.outstanding), label: 'Outstanding', tone: 'red' as Tone },
  ];
  return (
    <AdminPhone me={a.me}>
      <PageHead title="Student Ledger" subtitle="View payments, balance and transactions." phone onBack={() => toast('Back to the student list.')} />
      <Card style={styles.phoneStudent}>
        <Face source={s.avatar} size={64} />
        <View style={styles.flex}>
          <Text style={styles.studentName}>{s.name}</Text>
          <Text style={styles.meta}>{`P1A  •  ${s.code}`}</Text>
        </View>
        <Pill label="Active" tone="green" icon="check" size={13} />
      </Card>
      <View style={styles.phoneTotals}>
        {totals.map((t) => (
          <View key={t.label} style={[styles.phoneTotal, { backgroundColor: TONES[t.tone].soft }]}>
            <Text style={[styles.phoneTotalValue, t.tone !== 'blue' && { color: TONES[t.tone].text }]} numberOfLines={1}>
              {t.value}
            </Text>
            <Text style={[styles.meta, t.tone !== 'blue' && { color: TONES[t.tone].text }]}>{t.label}</Text>
          </View>
        ))}
      </View>
      <UnderTabs items={['Overview', 'Transactions', 'Invoices', 'Statements']} active={tab} onChange={setTab} size={14} spread />
      {tab === 'Overview' ? (
        <>
          <Card style={styles.balance}>
            <CardHead title="Fee Balance" right={<SelectBox value={term} options={terms} onChange={setTerm} width={142} />} />
            <View style={styles.balanceRow}>
              <Donut
                slices={[
                  { value: g.paid, color: Maple.successText },
                  { value: g.outstanding, color: Maple.error },
                ]}
                size={132}
                stroke={20}>
                <DonutLabel value={`${Math.round((g.paid / (g.paid + g.outstanding)) * 100)}%`} caption="Paid" size={22} />
              </Donut>
              <View style={styles.balanceLegend}>
                <Legend color={Maple.successText} label="Paid" value={money(g.paid)} />
                <Legend color={Maple.error} label="Outstanding" value={money(g.outstanding)} />
                <Legend color={Maple.faint} label="Adjusted" value="0" />
              </View>
            </View>
          </Card>
          <BigButton label="Make Payment" icon="wallet" onPress={() => toast('Send a Mobile Money request for UGX 280,000 to the parent’s phone.')} />
          <ListCard title="Recent Transactions" onAll={() => setTab('Transactions')}>
            {l.phoneRecent.map((r, i) => (
              <ListRow
                key={r.title}
                last={i === l.phoneRecent.length - 1}
                lead={<IconTile icon={r.icon} tone={r.tone} solid size={40} radius={10} />}
                title={r.title}
                body={`${r.body}\n${r.when}`}
                right={
                  <View style={styles.txRight}>
                    <Text style={[styles.txAmount, { color: r.amount.startsWith('+') ? GREEN : RED }]}>{r.amount}</Text>
                    <Pill label={r.type} tone={TYPE_TONE[r.type as LedgerTx['type']]} size={11.5} />
                  </View>
                }
              />
            ))}
          </ListCard>
        </>
      ) : (
        <>
          {(tab === 'Transactions' ? g.txs : g.txs.filter((t) => (tab === 'Invoices' ? t.type === 'Invoice' : true))).map((t) => (
            <View key={t.n} style={styles.phoneTx}>
              <View style={styles.flex}>
                <Text style={styles.txTitle}>{t.desc}</Text>
                <Text style={styles.meta}>{`${t.date}  •  ${t.ref}`}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txAmount, { color: t.credit ? GREEN : t.debit ? RED : NAVY }]}>{t.credit ? `+ ${money(t.credit)}` : t.debit ? `- ${money(t.debit)}` : '0'}</Text>
                <Pill label={t.type} tone={TYPE_TONE[t.type]} size={11.5} />
              </View>
            </View>
          ))}
          <Btn label="Adjust / Reverse" kind="outline" icon="sync" onPress={() => setAdjust(true)} height={50} />
        </>
      )}
      <AdjustModal visible={adjust} onClose={() => setAdjust(false)} txs={g.txs} onPost={g.post} />
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  dim: { opacity: 0.5 },
  meta: { marginTop: 2, fontSize: 12.5, color: BODY },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  studentBar: { flexDirection: 'row', alignItems: 'stretch', gap: 10, marginTop: 14, padding: 12 },
  student: { width: 250, flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 10, borderRightWidth: 1, borderColor: LINE },
  studentName: { fontSize: 17, fontWeight: '800', color: NAVY },
  active: { marginTop: 6 },
  total: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  totalValue: { fontSize: 15, fontWeight: '800', color: NAVY },
  pctRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  pct: { fontSize: 11.5, fontWeight: '700' },
  tabCard: { marginTop: 14, paddingVertical: 0, paddingHorizontal: 14 },
  tabs: { borderBottomWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 14 },
  block: { gap: 12, padding: 16 },
  colBreak: { flex: 1.5 },
  colTrend: { flex: 1 },
  legendRow: { flexDirection: 'row', gap: 18, justifyContent: 'center' },
  txCard: { marginTop: 14 },
  txTools: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txSearch: { width: 180 },
  txFoot: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  exports: { flexDirection: 'row', gap: 10 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 18, backgroundColor: 'rgba(15,23,42,0.45)' },
  modal: { width: '100%', maxWidth: 480, gap: 10, padding: 22, borderRadius: 16, backgroundColor: WHITE },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: NAVY },
  modalSub: { fontSize: 13.5, lineHeight: 19, color: BODY },
  label: { marginTop: 4, fontSize: 14, fontWeight: '600', color: NAVY },
  field: { height: 46, paddingVertical: 0, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: LINE, fontSize: 15, color: NAVY },
  fieldTall: { height: 80, paddingTop: 12, textAlignVertical: 'top' },
  modalBtns: { flexDirection: 'row', gap: 10, marginTop: 8 },
  phoneStudent: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14 },
  phoneTotals: { flexDirection: 'row', gap: 8 },
  phoneTotal: { flex: 1, minWidth: 0, gap: 2, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12 },
  phoneTotalValue: { fontSize: 17, fontWeight: '800', color: NAVY },
  balance: { gap: 12, padding: 16 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  balanceLegend: { flex: 1, minWidth: 0, gap: 14 },
  txRight: { alignItems: 'flex-end', gap: 6 },
  txAmount: { fontSize: 15, fontWeight: '800' },
  phoneTx: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  txTitle: { fontSize: 14.5, fontWeight: '600', color: NAVY },
});

