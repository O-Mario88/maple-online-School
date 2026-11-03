import { useMemo, useState } from 'react';
import { Pressable, ScrollView, type StyleProp, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { CmdSelect, CmdStat, CountTabs, DetailRow, type Kpi, KpiGrid, OutlineBtn, PageStrip, Panel, PrimaryBtn, RangeBox, exportMenu } from '@/features/command/kit/CmdParts';
import { CmdHead, CommandDesk, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { complianceStatus, type EfrisStatus, type Filing, filingState, fileReturn, resendToEfris, TAX_RATES, taxFor, totalWithTax, type TaxType } from '@/features/command/logic/tax';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { Donut, DonutLabel } from '@/features/school/kit/Charts';
import { Cell, type Column, DataTable, PageHead, Search, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import { dateLabel, type TaxRow } from '@/mock/command-center/billing';

type B = CommandData['billing'];
const PER_PAGE = 10;
const TAX_LABEL: Readonly<Record<TaxType, string>> = { VAT: 'VAT (18%)', WHT: 'Withholding (6%)', DST: 'Digital Services (2%)' };
const SHORT: Readonly<Record<TaxType, string>> = { VAT: 'VAT (18%)', WHT: 'WHT (6%)', DST: 'DST (2%)' };
const STATUS: Readonly<Record<EfrisStatus, { label: string; tone: Tone }>> = { Submitted: { label: 'Collected', tone: 'green' }, Pending: { label: 'Pending', tone: 'orange' }, Failed: { label: 'eFRIS Failed', tone: 'red' } };
const COLORS = { VAT: '#1E6BF0', WHT: '#22A55A', DST: '#EC4899', Other: '#F59E0B' } as const;
const FILING_ICON: Readonly<Record<Tone, IconName>> = { red: 'alert', orange: 'alert', blue: 'clock', green: 'check', purple: 'clock', grey: 'clock' };
const ugx = (n: number) => n.toLocaleString('en-US');

function useTax(b: B, ME: string) {
  const today = b.TODAY;
  const [txns, setTxns] = useState<readonly TaxRow[]>(b.taxTxns);
  const [filings, setFilings] = useState<readonly Filing[]>(b.filings);
  const [audit, setAudit] = useState<readonly string[]>(b.taxAudit);
  const [tab, setTab] = useState(b.taxTabs[0]);
  const [query, setQuery] = useState('');
  const [taxType, setTaxType, taxTypes] = useChoice(['All Tax Types', 'VAT', 'WHT', 'DST']);
  const [status, setStatus, statuses] = useChoice(['All Statuses', 'Collected', 'Pending', 'eFRIS Failed']);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(b.taxTxns[0].id);
  const [seq, setSeq] = useState(7800);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return txns.filter(
      (t) =>
        (tab !== 'Withholding Tax' || t.taxType === 'WHT') &&
        (taxType === 'All Tax Types' || t.taxType === taxType) &&
        (status === 'All Statuses' || STATUS[t.efris].label === status) &&
        (!q || `${t.id} ${t.invoice} ${t.customer}`.toLowerCase().includes(q)),
    );
  }, [txns, tab, query, taxType, status]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const open = txns.find((t) => t.id === openId) ?? null;
  const note = (line: string) => setAudit((prev) => [`${dateLabel(today)} • ${line}`, ...prev]);

  const resend = (t: TaxRow) => {
    const r = resendToEfris(t, seq);
    if (r.error) return toast(r.error);
    setSeq((n) => n + 1);
    setTxns((prev) => prev.map((x) => (x.id === t.id ? r.txn : x)));
    note(`${ME} resent ${t.id} to eFRIS (${r.txn.efrisReceipt})`);
    toast(`URA eFRIS accepted ${t.id}. Fiscal receipt ${r.txn.efrisReceipt}.`);
  };
  const file = (f: Filing) => {
    const r = fileReturn(f, dateLabel(today));
    if (r.error) return toast(r.error);
    setFilings((prev) => prev.map((x) => (x.id === f.id ? r.filing : x)));
    note(`${ME} filed ${f.title} on the URA portal`);
    toast(`${f.title} filed with URA. Acknowledgement saved to Compliance Documents.`);
  };
  const compliance = complianceStatus(filings, today);
  const waiting = txns.filter((t) => t.efris !== 'Submitted').length;
  const stats: readonly Kpi[] = [
    ...b.taxStats.map((k) => (k.label === 'Pending Filings' ? { ...k, value: String(filings.filter((f) => !f.done).length) } : k)),
    { label: 'Compliance Status', value: compliance, valueTone: compliance === 'Compliant' ? 'green' : 'red', icon: 'shield', tone: compliance === 'Compliant' ? 'green' : 'red', caption: compliance === 'Compliant' ? 'All requirements met' : 'A return is overdue' },
    { label: 'eFRIS Integration', value: 'Connected', valueTone: 'green', icon: 'link', tone: 'green', caption: waiting ? `${waiting} receipt${waiting === 1 ? '' : 's'} to resend` : 'Last sync: Oct 26, 2026' },
  ];
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  return { today, txns, rows, shown, tab, setTab: pick, query, setQuery, taxType, setTaxType, taxTypes, status, setStatus, statuses, page: p, pages, setPage, open, setOpenId, resend, filings, file, audit, stats, selected, toggle };
}
type U = ReturnType<typeof useTax>;

const COLS: readonly Column<TaxRow>[] = [
  { label: '#', width: 22, render: (t) => <Cell small>{t.n}</Cell> },
  { label: 'Date', width: 86, render: (t) => <Cell small>{dateLabel(t.date)}</Cell> },
  { label: 'Reference No.', width: 124, render: (t) => <Cell small>{t.id}</Cell> },
  { label: 'Customer', flex: 1.2, render: (t) => <Cell small>{t.customer}</Cell> },
  { label: 'Type', width: 84, render: (t) => <Pill label={t.kind} tone={t.kind === 'Institution' ? 'blue' : 'purple'} size={10.5} /> },
  { label: 'Tax Type', flex: 0.9, render: (t) => <Cell small>{`${t.type}\n${SHORT[t.taxType]}`}</Cell> },
  { label: 'Taxable (UGX)', width: 92, render: (t) => <Cell small>{ugx(t.taxable)}</Cell> },
  { label: 'Tax (UGX)', width: 80, render: (t) => <Cell small>{ugx(taxFor(t.taxable, t.taxType))}</Cell> },
  { label: 'Status', width: 96, render: (t) => <Pill label={STATUS[t.efris].label} tone={STATUS[t.efris].tone} size={10.5} /> },
];

function Charts({ b, phone = false }: { b: B; phone?: boolean }) {
  const tr = b.taxTrend;
  const o = b.octoberTax;
  const total = o.VAT + o.WHT + o.DST + o.Other;
  const parts = [
    { label: 'VAT (18%)', value: o.VAT, color: COLORS.VAT },
    { label: 'Withholding Tax', value: o.WHT, color: COLORS.WHT },
    { label: 'Digital Services Tax', value: o.DST, color: COLORS.DST },
    { label: 'Other', value: o.Other, color: COLORS.Other },
  ];
  const [period, setPeriod] = useState('Last 6 Months');
  return (
    <>
      <Panel title="Tax Collection Trend" right={<CmdSelect value={period} options={['Last 6 Months', 'Last 3 Months']} onChange={setPeriod} width={130} label="Period" />} style={[styles.block, !phone && styles.flex]}>
        <ComboChart
          labels={period === 'Last 6 Months' ? tr.labels : tr.labels.slice(3)}
          bars={[
            { name: 'VAT (18%)', color: COLORS.VAT, values: period === 'Last 6 Months' ? tr.vat : tr.vat.slice(3) },
            { name: 'Withholding Tax', color: COLORS.WHT, values: period === 'Last 6 Months' ? tr.wht : tr.wht.slice(3) },
            { name: 'Other Taxes', color: COLORS.Other, values: period === 'Last 6 Months' ? tr.other : tr.other.slice(3) },
          ]}
          mode="stacked"
          max={500}
          height={phone ? 170 : 160}
          format={(n) => (n ? `${n}M` : '0')}
        />
        <View style={styles.legend}>
          {(
            [
              ['VAT (18%)', COLORS.VAT],
              ['Withholding Tax', COLORS.WHT],
              ['Other Taxes', COLORS.Other],
            ] as const
          ).map(([l, color]) => (
            <View key={l} style={styles.inline}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.tiny}>{l}</Text>
            </View>
          ))}
        </View>
      </Panel>
      <Panel title="Tax Breakdown (Oct 2026)" style={[styles.block, !phone && styles.flex]}>
        <View style={[styles.donutRow, phone && styles.donutPhone]}>
          <Donut slices={parts.map((x) => ({ value: x.value, color: x.color }))} size={phone ? 140 : 150} stroke={22}>
            <DonutLabel value="UGX 412.6M" caption="Total Tax" size={15} />
          </Donut>
          <View style={[styles.flex, styles.block]}>
            {parts.map((x) => (
              <View key={x.label} style={styles.inline}>
                <View style={[styles.dot, { backgroundColor: x.color }]} />
                <Text style={[styles.small, styles.flex]}>{x.label}</Text>
                <Text style={styles.amt}>{`${(x.value / 1e6).toFixed(1)}M`}</Text>
                <Text style={styles.pct}>{`${((x.value / total) * 100).toFixed(1)}%`}</Text>
              </View>
            ))}
          </View>
        </View>
      </Panel>
    </>
  );
}

function FilingCalendar({ u, style }: { u: U; style?: StyleProp<ViewStyle> }) {
  const [span, setSpan] = useState('Next 6 Months');
  return (
    <Panel title="Filing Calendar" right={<CmdSelect value={span} options={['Next 6 Months', 'Next 3 Months']} onChange={setSpan} width={130} label="Span" />} style={[styles.block, style]}>
      {u.filings.map((f) => {
        const st = filingState(f, u.today);
        return (
          <View key={f.id} style={styles.filing}>
            <View style={[styles.filingIcon, { backgroundColor: TONES[st.tone].solid }]}>
              <Icon name={FILING_ICON[st.tone]} size={13} color={WHITE} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.filingTitle}>{f.title}</Text>
              <Text style={styles.tiny}>{f.done ? `Completed ${f.filedOn ?? ''}` : `Due ${dateLabel(f.due)}`}</Text>
            </View>
            {f.done ? (
              <Pill label={st.label} tone={st.tone} size={11} />
            ) : (
              <Pressable onPress={() => u.file(f)} accessibilityRole="button" accessibilityLabel={`${st.label}. File ${f.title} now`}>
                <Pill label={st.label} tone={st.tone} size={11} />
              </Pressable>
            )}
          </View>
        );
      })}
      <Text style={styles.tiny}>Tap a due date to file that return.</Text>
    </Panel>
  );
}

function TabBody({ u, b }: { u: U; b: B }) {
  if (u.tab === 'Tax Filings')
    return (
      <View style={styles.block}>
        {u.filings.map((f) => (
          <View key={f.id} style={styles.listRow}>
            <Text style={[styles.filingTitle, styles.flex]}>{f.title}</Text>
            <Text style={styles.small}>{filingState(f, u.today).label}</Text>
            {!f.done ? <OutlineBtn label="File Now" small onPress={() => u.file(f)} /> : null}
          </View>
        ))}
      </View>
    );
  if (u.tab === 'Exemptions & Zero-Rated')
    return (
      <View style={styles.block}>
        {b.exemptions.map((e) => (
          <View key={e.item} style={styles.listRow}>
            <Text style={[styles.filingTitle, styles.flex]}>{e.item}</Text>
            <Text style={styles.small}>{e.rule}</Text>
          </View>
        ))}
      </View>
    );
  if (u.tab === 'Compliance Documents')
    return (
      <View style={styles.block}>
        {['URA TIN Certificate.pdf', 'VAT Registration Certificate.pdf', 'eFRIS Device Registration.pdf', ...u.filings.filter((f) => f.done).map((f) => `${f.title} – Acknowledgement.pdf`)].map((d) => (
          <Pressable key={d} style={styles.listRow} onPress={() => toast(`Downloading ${d}…`)} accessibilityRole="button" accessibilityLabel={`Download ${d}`}>
            <Icon name="doc" size={18} color={RED} />
            <Text style={[styles.filingTitle, styles.flex]}>{d}</Text>
            <Icon name="download" size={16} color={BLUE} />
          </Pressable>
        ))}
      </View>
    );
  if (u.tab === 'Audit Trail')
    return (
      <View style={styles.block}>
        {u.audit.map((a) => (
          <Text key={a} style={styles.small}>
            {a}
          </Text>
        ))}
      </View>
    );
  return null;
}

function Table({ u, b }: { u: U; b: B }) {
  const tableTab = ['Transactions', 'eFRIS', 'Withholding Tax'].includes(u.tab);
  return (
    <Card style={[styles.tableCard, styles.flex]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={b.taxTabs.map((label) => ({ label }))} active={u.tab} onChange={u.setTab} size={12.5} dense style={styles.noWrap} />
      </ScrollView>
      {tableTab ? (
        <>
          <View style={styles.inline}>
            <Search placeholder="Search by reference, invoice number, institution, or student..." value={u.query} onChange={u.setQuery} style={styles.flex} />
            <CmdSelect value={u.taxType} options={u.taxTypes} onChange={u.setTaxType} width={120} label="Tax type" />
            <CmdSelect value={u.status} options={u.statuses} onChange={u.setStatus} width={120} label="Status" />
          </View>
          <DataTable columns={COLS} rows={u.rows} rowKey={(t) => t.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={(t) => u.setOpenId(t.id)} onRowPress={(t) => u.setOpenId(t.id)} activeKey={u.open?.id} />
          <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} transactions`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </>
      ) : (
        <TabBody u={u} b={b} />
      )}
    </Card>
  );
}

function TxnPanel({ u, onClose }: { u: U; onClose?: () => void }) {
  const t = u.open;
  const [tab, setTab] = useState('Overview');
  if (!t)
    return (
      <Card style={styles.panel}>
        <Text style={styles.small}>Pick a transaction to see it.</Text>
      </Card>
    );
  const tax = taxFor(t.taxable, t.taxType);
  const st = STATUS[t.efris];
  return (
    <Card style={styles.panel}>
      <View style={styles.inline}>
        <Text style={[styles.panelTitle, styles.flex]}>Transaction Details</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close details" hitSlop={8}>
            <Icon name="close" size={18} color={BODY} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.inline}>
        <View style={[styles.docIcon, { backgroundColor: TONES.blue.soft }]}>
          <Icon name="receipt" size={18} color={BLUE} />
        </View>
        <Text style={[styles.txnId, styles.flex]}>{t.id}</Text>
        <Pill label={st.label} tone={st.tone} size={11} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={['Overview', 'Tax Breakdown', 'Customer', 'eFRIS', 'History'].map((label) => ({ label }))} active={tab} onChange={setTab} size={12} dense style={styles.noWrap} />
      </ScrollView>
      {tab === 'Overview' ? (
        <>
          <DetailRow label="Date" value={`${dateLabel(t.date)}, 14:32 (UTC+3)`} />
          <DetailRow label="Reference No." value={t.id} />
          <DetailRow label="Invoice No." value={t.invoice} valueColor={BLUE} />
          <DetailRow label="Customer" value={`${t.customer} (${t.kind})`} />
          <DetailRow label="Type" value={t.type} />
          <DetailRow label="Tax Type" value={TAX_LABEL[t.taxType]} />
          <DetailRow label="Taxable Amount" value={`UGX ${ugx(t.taxable)}`} />
          <DetailRow label="Tax Amount" value={`UGX ${ugx(tax)}`} />
          <DetailRow label={t.taxType === 'WHT' ? 'Net Received' : 'Total Amount'} value={`UGX ${ugx(totalWithTax(t))}`} />
          <DetailRow label="Payment Method" value={t.method} />
          <DetailRow label="eFRIS Status" value={t.efris} valueColor={TONES[st.tone].text} />
          <DetailRow label="eFRIS Receipt" value={t.efrisReceipt ?? '—'} valueColor={BLUE} />
          <DetailRow label="Notes" value={t.notes} />
        </>
      ) : null}
      {tab === 'Tax Breakdown' ? <Text style={styles.small}>{`${TAX_LABEL[t.taxType]} at ${TAX_RATES[t.taxType] * 100}% on UGX ${ugx(t.taxable)} = UGX ${ugx(tax)}. ${t.taxType === 'WHT' ? 'Withheld by the payer and credited against Maple’s income tax.' : 'Charged to the customer and paid to URA in the monthly VAT return.'}`}</Text> : null}
      {tab === 'Customer' ? <Text style={styles.small}>{`${t.customer} • ${t.kind}${t.kind === 'Institution' ? ' • TIN 1000-4521-88' : ''}`}</Text> : null}
      {tab === 'eFRIS' ? <Text style={styles.small}>{t.efrisReceipt ? `Fiscal document ${t.efrisReceipt} issued by URA eFRIS.` : `Not yet accepted by eFRIS (${t.efris}). Resend it below.`}</Text> : null}
      {tab === 'History' ? <Text style={styles.small}>{`Payment received ${dateLabel(t.date)} • Tax computed • ${t.efrisReceipt ? 'eFRIS receipt issued' : 'Waiting for eFRIS'}`}</Text> : null}
      <Text style={styles.section}>Documents</Text>
      {[`Tax Invoice ${t.invoice}.pdf`, ...(t.efrisReceipt ? ['eFRIS Submission Receipt.pdf'] : [])].map((d) => (
        <Pressable key={d} style={styles.docRow} onPress={() => toast(`Downloading ${d}…`)} accessibilityRole="button" accessibilityLabel={`Download ${d}`}>
          <Icon name="doc" size={18} color={RED} />
          <Text style={[styles.filingTitle, styles.flex]}>{d}</Text>
          <Icon name="download" size={16} color={BLUE} />
        </Pressable>
      ))}
      <View style={styles.inline}>
        <OutlineBtn label="Resend to eFRIS" icon="sync" onPress={() => u.resend(t)} style={styles.flex} />
        <OutlineBtn label="View in eFRIS" icon="arrowRight" onPress={() => toast(t.efrisReceipt ? `Opening ${t.efrisReceipt} on efris.ura.go.ug.` : 'Not in eFRIS yet. Resend it first.')} style={styles.flex} />
      </View>
    </Card>
  );
}

/** Maple Command › Finance › Tax & Compliance on the desktop reference. */
export function TaxDesk({ c }: { c: CommandData }) {
  const b = c.billing;
  const u = useTax(b, c.me.name);
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search invoices, transactions, tax filings, institutions, or reference numbers..." active="Finance" sub="Tax & Compliance">
      <CmdHead
        icon="balance"
        section="Finance"
        title="Tax & Compliance"
        subtitle="Manage VAT, withholding tax, eFRIS compliance, regulatory reports, and financial controls for institutions and independent students."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="Export" chevron onPress={() => exportMenu('Tax report')} />
            <OutlineBtn icon="sync" onPress={() => toast('Synced with URA eFRIS. 248 receipts up to date.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {u.stats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <Charts b={b} />
        <FilingCalendar u={u} style={styles.calendar} />
      </View>
      <View style={styles.row}>
        <Table u={u} b={b} />
        <View style={styles.side}>
          <TxnPanel u={u} onClose={() => u.setOpenId(null)} />
        </View>
      </View>
    </CommandDesk>
  );
}

/** The phone version: totals, charts, the filing calendar and transaction cards. */
export function TaxPhone({ c }: { c: CommandData }) {
  const b = c.billing;
  const u = useTax(b, c.me.name);
  const [view, setView] = useState<'list' | 'detail'>('list');
  if (view === 'detail') {
    return (
      <CommandPhone key="detail" me={c.me}>
        <PageHead title="Transaction" subtitle="Tax, eFRIS receipt and documents." phone onBack={() => setView('list')} />
        <TxnPanel u={u} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Tax & Compliance" subtitle="VAT, withholding tax, eFRIS and filings." phone />
      <KpiGrid items={u.stats} />
      <Charts b={b} phone />
      <FilingCalendar u={u} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={b.taxTabs.map((label) => ({ label }))} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      {['Transactions', 'eFRIS', 'Withholding Tax'].includes(u.tab) ? (
        <>
          <Search placeholder="Search transactions..." value={u.query} onChange={u.setQuery} />
          {u.rows.map((t) => (
            <Pressable
              key={t.id}
              style={styles.card}
              onPress={() => {
                u.setOpenId(t.id);
                setView('detail');
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t.id}, ${t.customer}, ${STATUS[t.efris].label}`}>
              <View style={styles.inline}>
                <Text style={[styles.filingTitle, styles.flex]}>{t.customer}</Text>
                <Pill label={STATUS[t.efris].label} tone={STATUS[t.efris].tone} size={11} />
              </View>
              <Text style={styles.small}>{`${t.id} • ${dateLabel(t.date)} • ${TAX_LABEL[t.taxType]}`}</Text>
              <Text style={styles.small}>{`Taxable UGX ${ugx(t.taxable)} • Tax UGX ${ugx(taxFor(t.taxable, t.taxType))}`}</Text>
            </Pressable>
          ))}
          <PageStrip label={`${u.shown.length} transactions`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </>
      ) : (
        <Card style={styles.panel}>
          <TabBody u={u} b={b} />
        </Card>
      )}
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noWrap: { flexWrap: 'nowrap' },
  block: { gap: 10 },
  small: { fontSize: 12, lineHeight: 18, color: BODY },
  tiny: { fontSize: 11.5, color: BODY },
  section: { marginTop: 2, fontSize: 13.5, fontWeight: '800', color: NAVY },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  donutPhone: { flexDirection: 'column', alignItems: 'stretch' },
  amt: { width: 52, textAlign: 'right', fontSize: 12, fontWeight: '600', color: NAVY },
  pct: { width: 44, textAlign: 'right', fontSize: 12, color: BODY },
  calendar: { width: 400 },
  filing: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  filingIcon: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  filingTitle: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderColor: LINE },
  tableCard: { gap: 10, padding: 12 },
  side: { width: 340 },
  panel: { gap: 8, padding: 14 },
  panelTitle: { fontSize: 15.5, fontWeight: '800', color: NAVY },
  docIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  txnId: { fontSize: 14, fontWeight: '800', color: NAVY },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 8, borderWidth: 1, borderColor: LINE },
  card: { gap: 6, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
});
