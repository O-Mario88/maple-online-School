import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar, Btn, Card, CardHead, IconTile, Pill, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

import { AdminDesk, AdminPhone, BigButton, Cell, type Column, DataTable, Legend, ListCard, ListRow, money, PageHead, SelectBox, StatusCell, useChoice } from '../kit/AdminKit';
import { BarChart, Donut, DonutLabel, Spark } from '../kit/Charts';

type Admin = MockData['schoolAdmin'];
type Acc = Admin['accounting'];
type Journal = Acc['journal'][number];
type Bill = Acc['bills'][number];
type Account = Acc['accounts'][number];

const BILL_TONE: Readonly<Record<string, Tone>> = { Pending: 'orange', Approved: 'green', Draft: 'grey', Paid: 'blue' };

/** Bills can be approved (Pending → Approved) and the bank account reconciled. */
function useBooks(acc: Acc) {
  const [bills, setBills] = useState<readonly Bill[]>(acc.bills);
  const [reconciled, setReconciled] = useState(false);
  const approve = (id: string) => {
    setBills((prev) => prev.map((b) => (b.id === id ? { ...b, status: b.status === 'Pending' ? 'Approved' : b.status === 'Approved' ? 'Paid' : b.status } : b)));
    const b = bills.find((x) => x.id === id);
    if (b) toast(b.status === 'Pending' ? `${b.vendor} bill approved. It is queued for payment on ${b.due}.` : b.status === 'Approved' ? `${b.vendor} paid: UGX ${money(b.amount)} posted to Accounts Payable.` : `${b.vendor}: ${b.status}`);
  };
  const reconcile = () => {
    setReconciled(true);
    toast('Matched 214 bank lines to the books. The UGX 300,000 gap is a deposit in transit, now flagged for next month.');
  };
  return { bills, approve, reconciled, reconcile };
}

/** The four headline stats with their trend sparks. */
function HeadStats({ acc }: { acc: Acc }) {
  return (
    <View style={styles.statRow}>
      {acc.stats.map((s) => {
        const t = TONES[s.tone];
        return (
          <View key={s.label} style={[styles.stat, { backgroundColor: t.soft + '80', borderColor: t.soft }]}>
            <IconTile icon={s.icon} tone={s.tone} size={44} radius={12} />
            <View style={styles.flex}>
              <Text style={styles.statValue} numberOfLines={1}>
                {s.value}
              </Text>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statSub, s.subTone && { color: TONES[s.subTone].text }]}>{s.sub}</Text>
              {s.progress !== undefined ? <Bar value={s.progress} color={t.solid} height={6} style={styles.statBar} /> : null}
            </View>
            {s.progress === undefined ? <Spark color={t.solid} values={[5, 8, 11, 14]} /> : null}
          </View>
        );
      })}
    </View>
  );
}

/** Full Institutional Accounting ERP Suite on the desktop reference. */
export function AccountingDesk({ a }: { a: Admin }) {
  const acc = a.accounting;
  const b = useBooks(acc);
  const [year, setYear, years] = useChoice(a.years);
  const [term, setTerm, terms] = useChoice(a.terms);
  const [campus, setCampus, campuses] = useChoice(a.campuses);
  const [tab, setTab] = useState(acc.tabs[0]);
  const [period, setPeriod, periods] = useChoice(['This Year', 'Last Year']);
  const [bank, setBank, banks] = useChoice(acc.bank.accounts);
  const [month, setMonth, months] = useChoice(acc.bank.months);
  const jCols: readonly Column<Journal>[] = [
    { label: '#', flex: 0.85, render: (x) => <Cell strong>{x.id}</Cell> },
    { label: 'Date', flex: 1.15, render: (x) => <Cell>{x.date}</Cell> },
    { label: 'Description', flex: 1.6, render: (x) => <Cell lines={2}>{x.desc}</Cell> },
    { label: 'Debit (UGX)', flex: 1.05, align: 'right', render: (x) => <Cell>{x.debit ? money(x.debit) : '-'}</Cell> },
    { label: 'Credit (UGX)', flex: 1.05, align: 'right', render: (x) => <Cell>{money(x.credit)}</Cell> },
    { label: 'Status', flex: 0.8, align: 'center', render: (x) => <StatusCell label={x.status} tone="green" /> },
  ];
  const bCols: readonly Column<Bill>[] = [
    { label: '#', flex: 0.8, render: (x) => <Cell strong>{x.id}</Cell> },
    { label: 'Vendor', flex: 1.4, render: (x) => <Cell>{x.vendor}</Cell> },
    { label: 'Amount (UGX)', flex: 1.1, align: 'right', render: (x) => <Cell>{money(x.amount)}</Cell> },
    { label: 'Due Date', flex: 1, render: (x) => <Cell>{x.due}</Cell> },
    {
      label: 'Status',
      flex: 0.9,
      align: 'center',
      render: (x) => (
        <Pressable onPress={() => b.approve(x.id)} accessibilityRole="button" accessibilityLabel={`${x.vendor}: ${x.status}. Tap to move it on`}>
          <StatusCell label={x.status} tone={BILL_TONE[x.status] ?? 'grey'} />
        </Pressable>
      ),
    },
  ];
  const aCols: readonly Column<Account>[] = [
    { label: 'Code', flex: 0.6, render: (x) => <Cell strong>{x.code}</Cell> },
    { label: 'Account', flex: 1.8, render: (x) => <Cell strong>{x.name}</Cell> },
    { label: 'Type', flex: 0.9, render: (x) => <Cell>{x.type}</Cell> },
    { label: 'Balance (UGX)', flex: 1.2, align: 'right', render: (x) => <Cell>{money(x.balance)}</Cell> },
  ];
  const showAll = tab === 'Overview';
  return (
    <AdminDesk me={a.me} search="Search accounts, transactions, vendors, or reports..." active="Accounting">
      <PageHead
        title="Accounting & Financial Management"
        subtitle="Complete accounting suite for your school – from daily transactions to statutory financial reports."
        right={
          <>
            <SelectBox label="Academic Year" value={year} options={years} onChange={setYear} />
            <SelectBox label="Term" value={term} options={terms} onChange={setTerm} />
            <SelectBox label="Campus" value={campus} options={campuses} onChange={setCampus} />
          </>
        }
      />
      <Card style={styles.tabCard}>
        <UnderTabs items={acc.tabs} active={tab} onChange={setTab} size={15} style={styles.tabs} />
      </Card>
      <HeadStats acc={acc} />
      {tab === 'Chart of Accounts' ? (
        <Card style={[styles.block, styles.mt]}>
          <CardHead title="Chart of Accounts" subtitle="Your accounts and their balances." right={<Btn label="Add Account" icon="plus" onPress={() => toast('Add an account under assets, liabilities, equity, income or expenses.')} height={42} />} />
          <DataTable columns={aCols} rows={acc.accounts} rowKey={(x) => x.code} menu dense />
        </Card>
      ) : null}
      {showAll ? (
        <View style={styles.row}>
          <Card style={[styles.block, styles.colTrend]}>
            <CardHead title="Income vs Expenses Trend" right={<SelectBox value={period} options={periods} onChange={setPeriod} width={130} />} />
            <View style={styles.legendRow}>
              <Legend color="#22A55A" label="Income" />
              <Legend color="#EF3B4D" label="Expenses" />
            </View>
            <BarChart
              labels={acc.trend.labels}
              series={[
                { name: 'Income', color: '#22A55A', values: acc.trend.income },
                { name: 'Expenses', color: '#EF3B4D', values: acc.trend.expenses },
              ]}
              max={300}
              ticks={6}
              height={210}
              format={(n) => (n ? `UGX ${n}M` : '0')}
            />
          </Card>
          <Card style={[styles.block, styles.colBal]}>
            <CardHead title="Account Balances (Top Level)" link="View All" onLink={() => setTab('Chart of Accounts')} />
            <View style={styles.balRow}>
              <Donut slices={acc.balances.map((x) => ({ value: x.pct, color: x.color }))} size={170} stroke={24}>
                <DonutLabel value="UGX 482.5M" caption="Total Assets" size={19} />
              </Donut>
              <View style={styles.flex}>
                {acc.balances.map((x) => (
                  <Legend key={x.label} color={x.color} label={x.label} value={`${x.pct}%`} style={styles.balLegend} />
                ))}
              </View>
            </View>
          </Card>
        </View>
      ) : null}
      {showAll || tab === 'Journal Entries' || tab === 'Accounts Payable' ? (
        <View style={styles.row}>
          {showAll || tab === 'Journal Entries' ? (
            <Card style={[styles.block, styles.flex]}>
              <CardHead title="Recent Journal Entries" link="View All" onLink={() => setTab('Journal Entries')} right={tab === 'Journal Entries' ? <Btn label="New Journal" icon="plus" onPress={() => toast('Debits must equal credits before you can post.')} height={40} /> : undefined} />
              <DataTable columns={jCols} rows={acc.journal} rowKey={(x) => x.id} dense />
            </Card>
          ) : null}
          {showAll || tab === 'Accounts Payable' ? (
            <Card style={[styles.block, styles.flex]}>
              <CardHead title="Accounts Payable (Vendor Bills)" link="View All" onLink={() => setTab('Accounts Payable')} />
              <DataTable columns={bCols} rows={b.bills} rowKey={(x) => x.id} dense />
              <Text style={styles.hint}>Tap a status to approve a bill, then again to record its payment.</Text>
            </Card>
          ) : null}
        </View>
      ) : null}
      {showAll || tab === 'Financial Reports' || tab === 'Bank Reconciliation' ? (
        <View style={styles.row}>
          {showAll || tab === 'Financial Reports' ? (
            <Card style={[styles.block, styles.colReports]}>
              <CardHead title="Financial Reports" />
              <View style={styles.reportGrid}>
                {acc.reports.map((r) => (
                  <Pressable key={r.title} style={styles.report} onPress={() => toast(`${r.title} for Term 1, 2026 is ready (PDF and Excel).`)} accessibilityRole="button" accessibilityLabel={r.title}>
                    <IconTile icon={r.icon} tone={r.tone} solid size={40} radius={10} />
                    <View style={styles.flex}>
                      <Text style={styles.reportTitle}>{r.title}</Text>
                      <Text style={styles.reportBody}>{r.body}</Text>
                    </View>
                    <Icon name="chevronRight" size={18} color={BLUE} />
                  </Pressable>
                ))}
              </View>
            </Card>
          ) : null}
          {showAll || tab === 'Bank Reconciliation' ? (
            <Card style={[styles.block, styles.colBank]}>
              <CardHead title="Bank Reconciliation" link="View All" onLink={() => setTab('Bank Reconciliation')} />
              <View style={styles.bankSelects}>
                <SelectBox value={bank} options={banks} onChange={setBank} style={styles.flex} />
                <SelectBox value={month} options={months} onChange={setMonth} width={120} />
              </View>
              <View style={styles.bankTiles}>
                <View style={[styles.bankTile, { backgroundColor: TONES.green.soft }]}>
                  <Text style={[styles.bankValue, { color: GREEN }]}>{`UGX ${money(acc.bank.bank)}`}</Text>
                  <Text style={styles.reportBody}>Bank Balance</Text>
                </View>
                <View style={[styles.bankTile, { backgroundColor: TONES.blue.soft }]}>
                  <Text style={[styles.bankValue, { color: NAVY }]}>{`UGX ${money(acc.bank.book)}`}</Text>
                  <Text style={styles.reportBody}>Book Balance</Text>
                </View>
                <View style={[styles.bankTile, { backgroundColor: TONES.red.soft }]}>
                  <Text style={[styles.bankValue, { color: RED }]}>{b.reconciled ? 'UGX 0' : `UGX ${money(acc.bank.unreconciled)}`}</Text>
                  <Text style={styles.reportBody}>Unreconciled</Text>
                </View>
              </View>
              <View style={styles.reconRow}>
                <Bar value={b.reconciled ? 1 : acc.bank.pct / 100} color="#22A55A" height={10} style={styles.flex} />
                <Text style={styles.reconPct}>{b.reconciled ? '100% Reconciled' : `${acc.bank.pct}% Reconciled`}</Text>
              </View>
              <Btn label={b.reconciled ? 'Reconciled' : 'Reconcile Transactions'} iconRight={b.reconciled ? undefined : 'arrowRight'} icon={b.reconciled ? 'check' : undefined} onPress={b.reconcile} height={50} />
            </Card>
          ) : null}
        </View>
      ) : null}
    </AdminDesk>
  );
}

/** The phone reference: term, the three totals, the report tiles, recent transactions and pending approvals. */
export function AccountingPhone({ a }: { a: Admin }) {
  const acc = a.accounting;
  const b = useBooks(acc);
  const [term, setTerm, terms] = useChoice(['Term 1, 2026', 'Term 2, 2026']);
  const totals = [
    { value: 'UGX 185.6M', label: 'Total Income', delta: '↑ 12%', tone: 'green' as Tone },
    { value: 'UGX 123.4M', label: 'Total Expenses', delta: '↑ 5%', tone: 'red' as Tone },
    { value: 'UGX 62.2M', label: 'Surplus', delta: '↑ 28%', tone: 'blue' as Tone },
  ];
  const pending = b.bills.filter((x) => x.status === 'Pending');
  return (
    <AdminPhone me={a.me}>
      <View style={styles.phoneHead}>
        <Text style={styles.phoneTitle} accessibilityRole="header">
          Accounting
        </Text>
        <SelectBox value={term} options={terms} onChange={setTerm} width={150} />
      </View>
      <View style={styles.phoneTotals}>
        {totals.map((t) => (
          <View key={t.label} style={[styles.phoneTotal, { backgroundColor: TONES[t.tone].soft }]}>
            <Text style={[styles.phoneTotalValue, { color: t.tone === 'blue' ? BLUE : TONES[t.tone].text }]} numberOfLines={1}>
              {t.value}
            </Text>
            <Text style={styles.phoneLabel} numberOfLines={1}>
              {t.label}
            </Text>
            <Text style={[styles.phoneDelta, { color: TONES[t.tone === 'blue' ? 'green' : t.tone].text }]}>{t.delta}</Text>
          </View>
        ))}
      </View>
      <BigButton label="View Financial Reports" onPress={() => toast('Trial balance, income & expenditure and balance sheet for Term 1, 2026.')} />
      <View style={styles.tiles}>
        {acc.phoneTiles.map((t) => (
          <Pressable key={t.label} style={styles.tile} onPress={() => toast(`${t.label} for Term 1, 2026.`)} accessibilityRole="button" accessibilityLabel={t.label}>
            <IconTile icon={t.icon} tone={t.tone} solid size={34} radius={9} />
            <Text style={styles.tileText} numberOfLines={2}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <ListCard title="Recent Transactions" onAll={() => toast('All transactions this term.')}>
        {acc.recent.map((r, i) => (
          <ListRow
            key={r.title}
            last={i === acc.recent.length - 1}
            lead={<IconTile icon={r.icon} tone={r.in ? 'green' : 'red'} size={40} radius={20} />}
            title={r.title}
            body={`${r.body}\n${r.when}`}
            right={<Text style={[styles.amount, { color: r.in ? GREEN : RED }]}>{r.amount}</Text>}
          />
        ))}
      </ListCard>
      <ListCard title="Pending Approvals" onAll={() => toast('Approvals waiting for you.')}>
        <ListRow
          lead={<IconTile icon="clock" tone="orange" solid size={40} radius={20} />}
          title={`${pending.length} Vendor Bills`}
          body={`Total: UGX ${money(pending.reduce((s, x) => s + x.amount, 0))}`}
          onPress={() => (pending[0] ? b.approve(pending[0].id) : toast('No bills waiting.'))}
          right={<Icon name="chevronRight" size={20} color={BLUE} />}
        />
        <ListRow last lead={<IconTile icon={acc.approvals[1].icon} tone="red" solid size={40} radius={20} />} title={acc.approvals[1].title} body={acc.approvals[1].body} onPress={() => toast('3 journal adjustments approved and posted.')} right={<Icon name="chevronRight" size={20} color={BLUE} />} />
      </ListCard>
      <Pill label={b.reconciled ? 'Bank reconciled' : `${acc.bank.pct}% of the bank account reconciled`} tone={b.reconciled ? 'green' : 'orange'} size={13} />
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  mt: { marginTop: 16 },
  tabCard: { marginBottom: 16, paddingVertical: 0, paddingHorizontal: 14 },
  tabs: { borderBottomWidth: 0 },
  statRow: { flexDirection: 'row', gap: 14 },
  stat: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1 },
  statValue: { fontSize: 18, fontWeight: '800', color: NAVY, letterSpacing: -0.3 },
  statLabel: { marginTop: 2, fontSize: 14, color: NAVY },
  statSub: { marginTop: 4, fontSize: 12.5, fontWeight: '500', color: BODY },
  statBar: { marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 16, marginTop: 16 },
  block: { gap: 12, padding: 16 },
  colTrend: { flex: 1.25 },
  colBal: { flex: 1 },
  colReports: { flex: 1.35 },
  colBank: { flex: 1 },
  legendRow: { flexDirection: 'row', gap: 18, justifyContent: 'center' },
  balRow: { flexDirection: 'row', alignItems: 'center', gap: 22, paddingVertical: 8 },
  balLegend: { marginBottom: 14 },
  hint: { fontSize: 12.5, color: BODY },
  reportGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  report: { flexBasis: '31%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 70, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  reportTitle: { fontSize: 14, fontWeight: '600', color: NAVY },
  reportBody: { marginTop: 2, fontSize: 12.5, color: BODY },
  bankSelects: { flexDirection: 'row', gap: 10 },
  bankTiles: { flexDirection: 'row', gap: 8 },
  bankTile: { flex: 1, minWidth: 0, gap: 2, padding: 12, borderRadius: 10 },
  bankValue: { fontSize: 14.5, fontWeight: '800' },
  reconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  reconPct: { fontSize: 13, color: BODY },
  phoneHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  phoneTitle: { fontSize: 27, fontWeight: '800', color: NAVY, letterSpacing: -0.5 },
  phoneTotals: { flexDirection: 'row', gap: 8 },
  phoneTotal: { flex: 1, minWidth: 0, gap: 2, paddingVertical: 12, paddingHorizontal: 9, borderRadius: 12 },
  phoneTotalValue: { fontSize: 14.5, fontWeight: '800' },
  phoneLabel: { fontSize: 12, color: BODY },
  phoneDelta: { fontSize: 12, fontWeight: '600' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, rowGap: 8 },
  tile: { width: '25%', paddingHorizontal: 4, alignItems: 'center', gap: 8 },
  tileText: { fontSize: 12, color: NAVY, textAlign: 'center' },
  amount: { fontSize: 14, fontWeight: '700' },
});
