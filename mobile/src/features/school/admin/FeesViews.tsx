import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn, Card, CardHead, IconTile, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

import { AdminDesk, AdminPhone, BigButton, Cell, type Column, DataTable, Legend, ListCard, ListRow, MenuRow, MiniBtn, money, PageHead, SelectBox, type Stat, StatCard, StatGrid, StatusCell, useChoice, useSelection } from '../kit/AdminKit';
import { BarChart, Donut, DonutLabel } from '../kit/Charts';
import { Maple } from '@/constants/maple';

type Admin = MockData['schoolAdmin'];
type Fees = Admin['fees'];
type Structure = Fees['structures'][number];
type Payment = Fees['payments'][number];
type Arrear = Fees['arrears'][number];

const LEVEL_TONE: Readonly<Record<string, Tone>> = { High: 'red', Medium: 'orange', Low: 'green' };

/** Sends WhatsApp, SMS and email reminders to the families picked (or everyone in arrears). */
function useReminders(f: Fees) {
  const [sent, setSent] = useState<ReadonlySet<string>>(new Set());
  const send = (names: readonly string[]) => {
    const list = names.length ? names : f.arrears.map((a) => a.name);
    setSent((prev) => new Set([...prev, ...list]));
    toast(`Arrears reminders sent by WhatsApp to ${list.length} ${list.length === 1 ? 'family' : 'families'}, with the balance and a Mobile Money pay link.`);
  };
  return { sent, send };
}

/** School Finance Command & Fee Structures on the desktop reference. */
export function FeesDesk({ a }: { a: Admin }) {
  const f = a.fees;
  const r = useReminders(f);
  const [year, setYear, years] = useChoice(a.years);
  const [term, setTerm, terms] = useChoice(a.terms);
  const [campus, setCampus, campuses] = useChoice(a.campuses);
  const [tab, setTab] = useState(f.tabs[0]);
  const [trendTerm, setTrendTerm, trendTerms] = useChoice(['Term 1, 2026', 'Term 3, 2025']);
  const [gradeAll, setGradeAll, gradeAlls] = useChoice(['All Grades', 'Primary', 'Secondary']);
  const [level, setLevel, levels] = useChoice(['All Grades', 'Primary 1', 'Secondary 1']);
  const [instTerm, setInstTerm, instTerms] = useChoice(['Term 1, 2026', 'Term 2, 2026']);
  const [selFees, toggleFee] = useSelection();
  const [selPay, togglePay] = useSelection();
  const structCols: readonly Column<Structure>[] = [
    { label: '#', width: 26, render: (x) => <Cell>{x.n}</Cell> },
    { label: 'Fee Item', flex: 1.3, render: (x) => <Cell strong>{x.item}</Cell> },
    { label: 'Grade / Stream', flex: 1.1, render: (x) => <Cell>{x.grade}</Cell> },
    { label: 'Amount (UGX)', flex: 1, align: 'right', render: (x) => <Cell strong>{money(x.amount)}</Cell> },
    { label: 'Frequency', flex: 0.9, render: (x) => <Cell>{x.freq}</Cell> },
    { label: 'Applicable To', flex: 1.3, render: (x) => <Cell>{x.to}</Cell> },
    { label: 'Status', flex: 0.8, render: () => <StatusCell label="Active" tone="green" icon="check" /> },
  ];
  const payCols: readonly Column<Payment>[] = [
    { label: '#', width: 24, render: (x) => <Cell>{x.n}</Cell> },
    { label: 'Date', flex: 1, render: (x) => <Cell>{x.date}</Cell> },
    { label: 'Student Name', flex: 1.3, render: (x) => <Cell strong>{x.name}</Cell> },
    { label: 'Grade', flex: 0.6, render: (x) => <Cell>{x.grade}</Cell> },
    { label: 'Amount (UGX)', flex: 1, align: 'right', render: (x) => <Cell strong>{money(x.amount)}</Cell> },
    { label: 'Method', flex: 1.1, render: (x) => <Cell>{x.method}</Cell> },
    { label: 'Reference', flex: 1.1, render: (x) => <Cell>{x.ref}</Cell> },
    { label: 'Status', flex: 1, render: () => <StatusCell label="Completed" tone="green" /> },
  ];
  const arrCols: readonly Column<Arrear>[] = [
    { label: '#', width: 24, render: (x) => <Cell>{x.n}</Cell> },
    { label: 'Student Name', flex: 1.3, render: (x) => <Cell strong>{x.name}</Cell> },
    { label: 'Grade', flex: 0.6, render: (x) => <Cell>{x.grade}</Cell> },
    { label: 'Outstanding (UGX)', flex: 1.2, align: 'right', render: (x) => <Cell strong color={RED}>{money(x.amount)}</Cell> },
    { label: 'Days Overdue', flex: 0.9, align: 'center', render: (x) => <Cell color={RED}>{x.days}</Cell> },
    { label: 'Status', flex: 1, render: (x) => (r.sent.has(x.name) ? <StatusCell label="Reminded" tone="blue" icon="check" /> : <StatusCell label={x.level} tone={LEVEL_TONE[x.level]} />) },
  ];
  const stats: readonly Stat[] = f.stats.map((s) => ({ value: s.value, label: s.label, sub: s.sub, subTone: s.subTone, icon: s.icon, tone: s.tone, progress: s.progress }));
  const statusTotal = f.status.full + f.status.partial + f.status.arrears;
  return (
    <AdminDesk me={a.me} search="Search students, payments, or reports..." active="Fees & Finance">
      <PageHead
        title="Fees & Finance"
        subtitle="Manage fee structures, collections, arrears and financial reports."
        right={
          <>
            <SelectBox label="Academic Year" value={year} options={years} onChange={setYear} />
            <SelectBox label="Term" value={term} options={terms} onChange={setTerm} />
            <SelectBox label="Campus" value={campus} options={campuses} onChange={setCampus} />
          </>
        }
      />
      <View style={styles.statRow}>
        {stats.map((s) => (
          <StatCard key={s.label} s={s} style={styles.flex} />
        ))}
      </View>
      <Card style={styles.tabCard}>
        <UnderTabs items={f.tabs} active={tab} onChange={setTab} size={15} style={styles.tabs} />
      </Card>
      {tab === 'Overview' || tab === 'Fee Structures' || tab === 'Payments' || tab === 'Arrears' ? null : (
        <Card style={styles.block}>
          <CardHead title={tab} subtitle={tab === 'Scholarships & Bursaries' ? 'Financial support awarded this term.' : 'Collections, arrears and ledgers, ready to export.'} />
          {tab === 'Scholarships & Bursaries'
            ? f.scholarships.map((s, i) => (
                <ListRow key={s.name} last={i === f.scholarships.length - 1} lead={<IconTile icon="cap" tone="green" size={40} radius={10} />} title={s.name} body={`${s.covers}  •  ${s.learners} learners`} right={<Text style={styles.strong}>{s.budget}</Text>} />
              ))
            : ['Collections by grade', 'Arrears ageing', 'Daily cash book', 'Mobile Money settlements'].map((x, i) => (
                <ListRow key={x} last={i === 3} lead={<IconTile icon="doc" tone="blue" size={40} radius={10} />} title={x} body="PDF or CSV" onPress={() => toast(`${x} report is downloading…`)} right={<Icon name="download" size={18} color={BLUE} />} />
              ))}
        </Card>
      )}
      {tab === 'Overview' ? (
        <View style={styles.row}>
          <Card style={[styles.block, styles.colTrend]}>
            <CardHead title="Collection Trend" right={<SelectBox value={trendTerm} options={trendTerms} onChange={setTrendTerm} width={140} />} />
            <View style={styles.legendRow}>
              <Legend color={Maple.successText} label="Collected" />
              <Legend color={Maple.error} label="Outstanding" />
            </View>
            <BarChart
              labels={f.trend.labels}
              series={[
                { name: 'Collected', color: Maple.successText, values: f.trend.collected },
                { name: 'Outstanding', color: Maple.error, values: f.trend.outstanding },
              ]}
              mode="stacked"
              max={100}
              height={190}
              format={(n) => (n ? `UGX ${n}M` : '0')}
            />
          </Card>
          <Card style={[styles.block, styles.colStatus]}>
            <CardHead title="Payment Status" right={<SelectBox value={gradeAll} options={gradeAlls} onChange={setGradeAll} width={124} />} />
            <View style={styles.statusRow}>
              <Donut
                slices={[
                  { value: f.status.full, color: Maple.successText },
                  { value: f.status.partial, color: Maple.warning },
                  { value: f.status.arrears, color: Maple.error },
                ]}
                size={160}
                stroke={22}>
                <DonutLabel value={money(statusTotal)} caption="Students" />
              </Donut>
              <View style={styles.flex}>
                {[
                  { c: Maple.successText, l: 'Paid in Full', v: f.status.full },
                  { c: Maple.warning, l: 'Partially Paid', v: f.status.partial },
                  { c: Maple.error, l: 'In Arrears', v: f.status.arrears },
                ].map((x) => (
                  <View key={x.l} style={styles.statusItem}>
                    <Legend color={x.c} label={x.l} />
                    <Text style={styles.statusPct}>{`${Math.round((x.v / statusTotal) * 100)}% (${x.v})`}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
          <Card style={[styles.block, styles.colQuick]}>
            <CardHead title="Quick Actions" />
            <View style={styles.quickGrid}>
              {f.quick.map((q) => (
                <Pressable
                  key={q.label}
                  style={styles.quick}
                  onPress={() => (q.label === 'Send Arrears Reminders' ? r.send([]) : q.label === 'Configure Fee Structures' ? setTab('Fee Structures') : q.label === 'Manage Scholarships' ? setTab('Scholarships & Bursaries') : toast(`${q.label}: the form opens here.`))}
                  accessibilityRole="button"
                  accessibilityLabel={q.label}>
                  <IconTile icon={q.icon} tone={q.label.includes('Reminders') ? 'green' : 'blue'} solid size={34} radius={9} />
                  <Text style={styles.quickText}>{q.label}</Text>
                </Pressable>
              ))}
            </View>
          </Card>
        </View>
      ) : null}
      {tab === 'Overview' || tab === 'Fee Structures' ? (
        <View style={styles.row}>
          <Card style={[styles.block, styles.colStruct]}>
            <CardHead
              title="Fee Structures"
              subtitle="Configure tuition, boarding, exam and other fee items by grade."
              right={
                <View style={styles.tools}>
                  <SelectBox label="Grade Level" value={level} options={levels} onChange={setLevel} />
                  <Btn label="Add Fee Item" icon="plus" onPress={() => toast('Name the fee, its amount, which grades pay it and how often.')} height={42} />
                </View>
              }
            />
            <DataTable columns={structCols} rows={f.structures} rowKey={(x) => String(x.n)} check menu dense selected={selFees} onToggle={toggleFee} />
          </Card>
          <Card style={[styles.block, styles.colInst]}>
            <CardHead title="Installment Schedule" right={<SelectBox value={instTerm} options={instTerms} onChange={setInstTerm} width={136} />} />
            {f.installments.map((x) => (
              <View key={x.n} style={styles.inst}>
                <View style={[styles.instNum, { backgroundColor: TONES[x.tone].solid }]}>
                  <Text style={styles.instNumText}>{x.n}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.strong}>{x.title}</Text>
                  <Text style={styles.meta}>{x.due}</Text>
                </View>
                <Text style={styles.instPct}>{x.pct}</Text>
                <Pressable style={styles.instMenu} onPress={() => toast(`Change the ${x.title.toLowerCase()} date or share.`)} accessibilityRole="button" accessibilityLabel={`Edit ${x.title}`}>
                  <Icon name="more" size={18} color={BLUE} />
                </Pressable>
              </View>
            ))}
          </Card>
        </View>
      ) : null}
      {tab === 'Overview' || tab === 'Payments' || tab === 'Arrears' ? (
        <View style={styles.row}>
          {tab !== 'Arrears' ? (
            <Card style={[styles.block, tab === 'Overview' ? styles.colPay : styles.flex]}>
              <CardHead title="Recent Payments" link="View All" onLink={() => setTab('Payments')} />
              <DataTable columns={payCols} rows={f.payments} rowKey={(x) => String(x.n)} check dense selected={selPay} onToggle={togglePay} />
            </Card>
          ) : null}
          {tab !== 'Payments' ? (
            <Card style={[styles.block, styles.flex]}>
              <CardHead title="Arrears & Reminders" right={<MiniBtn label="Send Reminders" icon="chat" onPress={() => r.send([])} />} />
              <DataTable columns={arrCols} rows={f.arrears} rowKey={(x) => String(x.n)} dense />
            </Card>
          ) : null}
        </View>
      ) : null}
    </AdminDesk>
  );
}

/** The phone reference: term, the four totals, the main sections and recent payments. */
export function FeesPhone({ a }: { a: Admin }) {
  const f = a.fees;
  const r = useReminders(f);
  const [term, setTerm, terms] = useChoice(['Term 1, 2026', 'Term 2, 2026', 'Term 3, 2026']);
  const stats: readonly Stat[] = f.stats.map((s) => ({ value: s.short, label: s.label.replace('Total ', '').replace('Students with Arrears', 'With Arrears').replace('Total Students', 'Students'), sub: s.sub, subTone: s.subTone, icon: s.icon, tone: s.tone }));
  const run = (title: string) => {
    if (title === 'Automated Reminders') return r.send([]);
    if (title === 'Payment Records') return router.push('/admin/finance/ledger' as never);
    toast(`${title}: open on a computer for the full editor, or review it here.`);
  };
  return (
    <AdminPhone me={a.me}>
      <PageHead title="Fees & Finance" subtitle="Manage fee structures, payments and arrears." phone />
      <SelectBox value={term} options={terms} onChange={setTerm} />
      <StatGrid stats={stats} />
      <BigButton label="View Collection Details" onPress={() => toast('UGX 185.6M collected of UGX 237.9M target. 78% this term.')} />
      {f.phoneMenu.map((m) => (
        <MenuRow key={m.title} icon={m.icon} tone={m.tone} title={m.title} body={m.body} onPress={() => run(m.title)} />
      ))}
      <ListCard title="Recent Payments" onAll={() => router.push('/admin/finance/ledger' as never)}>
        {f.payments.slice(0, 3).map((p, i) => (
          <ListRow
            key={p.ref}
            last={i === 2}
            lead={<IconTile icon="check" tone="green" solid size={30} radius={15} />}
            title={p.name}
            body={p.cls}
            right={
              <View style={styles.payRight}>
                <Text style={styles.payAmount}>{`UGX ${money(p.amount)}`}</Text>
                <Text style={styles.meta}>{p.when}</Text>
              </View>
            }
          />
        ))}
      </ListCard>
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  // Recent payments has nine columns to the arrears table's six.
  colPay: { flex: 1.75, minWidth: 0 },
  flex: { flex: 1, minWidth: 0 },
  strong: { fontSize: 14.5, fontWeight: '700', color: NAVY },
  meta: { marginTop: 2, fontSize: 12.5, color: BODY },
  statRow: { flexDirection: 'row', gap: 14 },
  tabCard: { marginTop: 16, paddingVertical: 0, paddingHorizontal: 14 },
  tabs: { borderBottomWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 16 },
  block: { gap: 12, padding: 16 },
  colTrend: { flex: 1.15 },
  colStatus: { flex: 1.05 },
  colQuick: { flex: 1.1 },
  colStruct: { flex: 1.9 },
  colInst: { flex: 1 },
  legendRow: { flexDirection: 'row', gap: 18, justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 18, paddingVertical: 6 },
  statusItem: { gap: 2, marginBottom: 12 },
  statusPct: { marginLeft: 19, fontSize: 13.5, color: BODY },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quick: { flexBasis: '46%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 56, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  quickText: { flex: 1, fontSize: 13, fontWeight: '500', color: NAVY },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inst: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: LINE },
  instNum: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  instNumText: { fontSize: 15, fontWeight: '700', color: WHITE },
  instPct: { fontSize: 16, fontWeight: '700', color: NAVY },
  instMenu: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: LINE },
  payRight: { alignItems: 'flex-end' },
  payAmount: { fontSize: 14.5, fontWeight: '700', color: GREEN },
});

