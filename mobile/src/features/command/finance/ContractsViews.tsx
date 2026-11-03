import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ComboChart } from '@/features/command/kit/CmdCharts';
import { type Kpi, OutlineBtn, PageStrip, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { acv, advanceStage, type Billing, commission, type ContractStatus, contractStatus, type ContractType, createContract, daysToEnd, lifecycle, renew, setDiscount, terminate } from '@/features/command/logic/contracts';
import { Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, TONES, type Tone } from '@/features/portal/tokens';
import { type Column, DataTable, Search, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { ContractRow } from '@/mock/command-center/pf-commercial';

import { amount, type FormAsk, FormModal } from './FinForm';
import { CheckList, FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, RingLegend, ugx } from './FinKit';

type D = CommandData['platformFinance']['commercial'];
const TODAY = '2026-10-31';
const PER_PAGE = 10;
const TABS = ['Overview', 'Contracts', 'Pricing & Discounts', 'Billing Milestones', 'Commissions', 'Renewals', 'Amendments', 'Templates'] as const;
const TYPES: readonly ContractType[] = ['Enterprise', 'School Plan', 'Content License', 'Service'];
const BILLING: readonly Billing[] = ['Annual', 'Termly', 'Milestone'];
const TYPE_TONE: Readonly<Record<ContractType, Tone>> = { Enterprise: 'blue', 'School Plan': 'blue', 'Content License': 'purple', Service: 'orange' };
const STATUS_TONE: Readonly<Record<ContractStatus, Tone>> = { Draft: 'grey', Negotiation: 'blue', Active: 'green', 'Renewal Due': 'orange', Expiring: 'red', Expired: 'red', Terminated: 'grey' };
const LIFE: readonly { key: 'Draft' | 'Negotiation' | 'Active' | 'Renewal Due' | 'Expired'; icon: IconName; tone: Tone }[] = [
  { key: 'Draft', icon: 'check', tone: 'green' },
  { key: 'Negotiation', icon: 'doc', tone: 'blue' },
  { key: 'Active', icon: 'edit', tone: 'purple' },
  { key: 'Renewal Due', icon: 'undo', tone: 'orange' },
  { key: 'Expired', icon: 'close', tone: 'red' },
];
const TEMPLATES: readonly { name: string; type: ContractType; billing: Billing; years: number; discount: number }[] = [
  { name: 'Single School – Termly Plan', type: 'School Plan', billing: 'Termly', years: 1, discount: 0 },
  { name: 'Enterprise / Multi-School (3 years)', type: 'Enterprise', billing: 'Annual', years: 3, discount: 10 },
  { name: 'Content Licence – Annual', type: 'Content License', billing: 'Annual', years: 1, discount: 0 },
  { name: 'Implementation & Training Services', type: 'Service', billing: 'Milestone', years: 1, discount: 0 },
];
const PROMO: Promo = { icon: 'doc', color: '#1E6BF0', title: 'Contracts & Agreements', body: 'Manage school contracts, pricing, commissions, discounts and renewals.' };
const RANGES = ['Last 10 Months', 'This Quarter', 'Year to Date'];
const FILTERS = { type: ['All Contract Types', ...TYPES], status: ['All Statuses', 'Draft', 'Negotiation', 'Active', 'Renewal Due', 'Expiring', 'Expired', 'Terminated'] } as const;

const date = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const discountValue = (c: ContractRow) => Math.round((acv(c) * c.discount) / 100);

function useContracts(d: D, me: string) {
  const [list, setList] = useState<readonly ContractRow[]>(d.contracts);
  const [changed, setChanged] = useState<readonly string[]>([]);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [type, setType] = useState<string>(FILTERS.type[0]);
  const [status, setStatus] = useState<string>(FILTERS.status[0]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [selected, toggle] = useSelection();
  const statusOf = (c: ContractRow) => contractStatus(c, TODAY);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inTab = (c: ContractRow) => {
      const s = contractStatus(c, TODAY);
      if (tab === 'Pricing & Discounts') return c.discount > 0;
      if (tab === 'Renewals') return s === 'Renewal Due' || s === 'Expiring' || s === 'Expired';
      if (tab === 'Amendments') return changed.includes(c.id);
      return true;
    };
    const rows = list.filter((c) => inTab(c) && (type === FILTERS.type[0] || c.type === type) && (status === FILTERS.status[0] || contractStatus(c, TODAY) === status) && (!q || `${c.id} ${c.institution} ${c.ref}`.toLowerCase().includes(q)));
    if (tab === 'Billing Milestones') return [...rows].sort((a, b) => a.milestoneDate.localeCompare(b.milestoneDate));
    if (tab === 'Commissions') return [...rows].sort((a, b) => commission(b) - commission(a));
    return rows;
  }, [list, changed, tab, type, status, query]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const update = (c: ContractRow) => {
    setList((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    setChanged((prev) => (prev.includes(c.id) ? prev : [...prev, c.id]));
  };

  const create = (template?: (typeof TEMPLATES)[number]) =>
    setAsk({
      title: template ? `New contract • ${template.name}` : 'New contract',
      body: 'The contract starts as a draft. It is billed and counted in ACV once signed. Discounts above 15% need your approval.',
      fields: [
        { key: 'institution', label: 'Institution', kind: 'text', placeholder: 'Kololo Secondary School' },
        { key: 'type', label: 'Contract type', kind: 'choice', options: template ? [template.type, ...TYPES.filter((x) => x !== template.type)] : TYPES },
        { key: 'value', label: 'Total contract value (UGX)', kind: 'number', placeholder: '240000000' },
        { key: 'discount', label: 'Discount (%)', kind: 'number', initial: String(template?.discount ?? 0) },
        { key: 'start', label: 'Start date (YYYY-MM-DD)', kind: 'text', initial: '2027-01-01' },
        { key: 'years', label: 'Term (years)', kind: 'choice', options: template ? [String(template.years), ...['1', '2', '3'].filter((y) => y !== String(template.years))] : ['1', '2', '3'] },
        { key: 'billing', label: 'Billing mode', kind: 'choice', options: template ? [template.billing, ...BILLING.filter((x) => x !== template.billing)] : BILLING },
      ],
      confirm: 'Create Draft',
      onSubmit: (v) => {
        const id = `CON-2026-${String(153 + list.length - d.contracts.length).padStart(4, '0')}`;
        const r = createContract({ institution: v.institution ?? '', type: v.type as ContractType, value: amount(v.value), discount: Number(v.discount) || 0, start: (v.start ?? '').trim(), years: Number(v.years), billing: v.billing as Billing }, id);
        if (r.error || !r.contract) return r.error;
        const c: ContractRow = { ...r.contract, ref: 'SCH-NEW', milestone: 'Send proposal', milestoneDate: TODAY };
        setList((prev) => [c, ...prev]);
        setChanged((prev) => [...prev, c.id]);
        toast(`${c.id} drafted for ${c.institution}: ${ugx(c.value)} over ${v.years} year${v.years === '1' ? '' : 's'}, ends ${date(c.end)}.`);
        return undefined;
      },
    });
  const renewIt = (c: ContractRow) =>
    setAsk({
      title: `Renew ${c.id}`,
      body: `${c.institution} • ends ${date(c.end)}. Annual value today ${ugx(acv(c))}. The renewal starts the day after the end date.`,
      fields: [
        { key: 'years', label: 'Renewal term (years)', kind: 'choice', options: ['1', '2', '3'] },
        { key: 'uplift', label: 'Price uplift (%)', kind: 'number', initial: '5' },
      ],
      confirm: 'Renew Contract',
      onSubmit: (v) => {
        const uplift = Number(v.uplift);
        if (Number.isNaN(uplift) || uplift < 0 || uplift > 20) return 'Use an uplift between 0 and 20%.';
        const next = renew(c, Number(v.years), uplift);
        update({ ...next, milestone: 'First renewal invoice', milestoneDate: next.start });
        toast(`${c.id} renewed to ${date(next.end)} at ${ugx(next.value)} (${ugx(acv(next))} a year).`);
        return undefined;
      },
    });
  const discountIt = (c: ContractRow) =>
    setAsk({
      title: `Change discount • ${c.id}`,
      body: `Current discount ${c.discount}% (${ugx(discountValue(c))} a year). Changes are logged as an amendment.`,
      fields: [
        { key: 'discount', label: 'New discount (%)', kind: 'number', initial: String(c.discount) },
        { key: 'approved', label: 'Finance Director approval', kind: 'choice', options: ['Not approved', `Approved by ${me}`] },
      ],
      confirm: 'Save Amendment',
      onSubmit: (v) => {
        const r = setDiscount(c, Number(v.discount), v.approved !== 'Not approved');
        if (r.error || !r.contract) return r.error;
        update({ ...c, ...r.contract });
        toast(`${c.id} discount set to ${r.contract.discount}%.`);
        return undefined;
      },
    });
  const endIt = (c: ContractRow) =>
    setAsk({
      title: `End ${c.id}`,
      body: 'Open invoices stay due. Unearned prepayments are reversed on the Revenue Recognition page.',
      fields: [{ key: 'reason', label: 'Reason', kind: 'text', placeholder: 'School merged with another trust' }],
      confirm: 'End Contract',
      onSubmit: (v) => {
        const r = terminate(c, v.reason ?? '');
        if (r.error || !r.contract) return r.error;
        update({ ...c, ...r.contract });
        toast(`${c.id} ended. Reason logged: ${(v.reason ?? '').trim()}.`);
        return undefined;
      },
    });
  const manage = (c: ContractRow) => {
    const s = statusOf(c);
    const options = c.stage === 'Draft' || c.stage === 'Negotiation' ? [c.stage === 'Draft' ? 'Send for negotiation' : 'Mark as signed', 'Change discount'] : c.stage === 'Terminated' ? ['Open receivables'] : ['Renew', 'Change discount', 'Open receivables', 'End contract'];
    setAsk({
      title: `${c.id} • ${c.institution}`,
      body: `${c.type}, ${c.billing} billing. ${ugx(c.value)} from ${date(c.start)} to ${date(c.end)} (${s}${c.stage === 'Signed' && daysToEnd(c, TODAY) >= 0 ? `, ${daysToEnd(c, TODAY)} days left` : ''}). Commission ${ugx(commission(c))}.`,
      fields: [{ key: 'action', label: 'Action', kind: 'choice', options }],
      confirm: 'Continue',
      onSubmit: (v) => {
        if (v.action === 'Open receivables') {
          router.push('/command/finance/receivables');
          return undefined;
        }
        if (v.action === 'Send for negotiation' || v.action === 'Mark as signed') {
          const next = advanceStage(c);
          update({ ...c, ...next });
          toast(`${c.id} is now ${next.stage === 'Signed' ? 'signed and active' : 'in negotiation'}.`);
          return undefined;
        }
        // Close this dialog first, then open the next one.
        setTimeout(() => (v.action === 'Renew' ? renewIt(c) : v.action === 'Change discount' ? discountIt(c) : endIt(c)), 0);
        return undefined;
      },
    });
  };
  const bulk = () =>
    setAsk({
      title: 'Contract actions',
      body: `${selected.size ? `${selected.size} selected contracts.` : 'No rows selected: actions apply to every contract on this tab.'}`,
      fields: [{ key: 'action', label: 'Action', kind: 'choice', options: ['Send renewal notices', 'Export selected to PDF', 'Assign account manager'] }],
      confirm: 'Run',
      onSubmit: (v) => {
        const target = selected.size ? list.filter((c) => selected.has(c.id)) : shown;
        if (v.action === 'Send renewal notices') {
          const due = target.filter((c) => ['Renewal Due', 'Expiring'].includes(statusOf(c)));
          toast(due.length ? `Renewal notices sent to ${due.map((c) => c.institution).join(', ')}.` : 'None of these contracts is due for renewal.');
          return undefined;
        }
        toast(`${v.action}: ${target.length} contract${target.length === 1 ? '' : 's'}.`);
        return undefined;
      },
    });
  const exportList = () => toast(`Contract register exported: ${shown.length} contracts (CSV).`);

  // Platform totals plus what this session changed on the sample contracts.
  const signed = (xs: readonly ContractRow[]) => xs.filter((c) => ['Active', 'Renewal Due', 'Expiring'].includes(contractStatus(c, TODAY)));
  const tally = (xs: readonly ContractRow[]) => ({ n: signed(xs).length, tcv: signed(xs).reduce((s, c) => s + c.value, 0), acv: signed(xs).reduce((s, c) => s + acv(c), 0), disc: signed(xs).reduce((s, c) => s + discountValue(c), 0), comm: signed(xs).reduce((s, c) => s + commission(c), 0) });
  const live = tally(list);
  const seed = tally(d.contracts);
  const t = d.conTotals;
  const n = t.contracts + live.n - seed.n;
  const acvNow = t.acv + live.acv - seed.acv;
  const disc = t.discounts + live.disc - seed.disc;
  const comm = t.commissions + live.comm - seed.comm;
  const stats: readonly Kpi[] = [
    { ...d.conStats[0], value: num(n) },
    { ...d.conStats[1], value: ugx(t.tcv + live.tcv - seed.tcv) },
    { ...d.conStats[2], value: ugx(acvNow) },
    d.conStats[3],
    { ...d.conStats[4], value: ugx(disc), caption: `${((disc / acvNow) * 100).toFixed(1)}% of ACV` },
    { ...d.conStats[5], value: ugx(comm) },
  ];
  const l0 = lifecycle(d.contracts, TODAY);
  const l1 = lifecycle(list, TODAY);
  const life = LIFE.map((x) => ({ ...x, count: t.lifecycle[x.key] + l1[x.key] - l0[x.key] }));
  const renewals = [...list].filter((c) => ['Renewal Due', 'Expiring'].includes(statusOf(c))).sort((a, b) => a.end.localeCompare(b.end));
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  return { d, rows, shown, tab, setTab: pick, type, setType, status, setStatus, query, setQuery, page: p, pages, setPage, ask, setAsk, manage, create, bulk, exportList, stats, life, renewals, statusOf, comm, disc, acvNow, n, selected, toggle };
}
type U = ReturnType<typeof useContracts>;

function Crest({ size = 22 }: { size?: number }) {
  return <Icon name="shield" size={size} color="#B7791F" />;
}

function cols(u: U): readonly Column<ContractRow>[] {
  return [
    { label: 'Contract / Reference', width: 100, render: (c) => <Text style={styles.idCell} numberOfLines={1}>{c.id}</Text> },
    {
      label: 'Institution',
      flex: 1,
      render: (c) => (
        <View style={styles.inline}>
          <Crest />
          <View style={styles.flex}>
            <Text style={styles.cellStrong} numberOfLines={1}>{c.institution}</Text>
            <Text style={styles.cell} numberOfLines={1}>{c.ref}</Text>
          </View>
        </View>
      ),
    },
    { label: 'Type', width: 90, align: 'center', render: (c) => <Pill label={c.type} tone={TYPE_TONE[c.type]} size={10} /> },
    { label: 'Value (UGX)', width: 88, align: 'right', render: (c) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{num(c.value)}</Text> },
    { label: 'Disc.', width: 44, align: 'center', render: (c) => <Text style={[styles.cell, styles.center]}>{`${c.discount}%`}</Text> },
    { label: 'Comm.', width: 74, align: 'right', render: (c) => <Text style={[styles.cell, styles.right]} numberOfLines={1}>{num(commission(c))}</Text> },
    { label: 'Start Date', width: 80, align: 'center', render: (c) => <Text style={[styles.cell, styles.center]} numberOfLines={1}>{date(c.start)}</Text> },
    { label: 'End Date', width: 80, align: 'center', render: (c) => <Text style={[styles.cell, styles.center]} numberOfLines={1}>{date(c.end)}</Text> },
    { label: 'Billing', width: 56, align: 'center', render: (c) => <Text style={[styles.cell, styles.center]}>{c.billing}</Text> },
    { label: 'Status', width: 84, align: 'center', render: (c) => <Pill label={u.statusOf(c)} tone={STATUS_TONE[u.statusOf(c)]} size={10} /> },
    {
      label: 'Next Milestone',
      width: 86,
      align: 'center',
      render: (c) => (
        <View>
          <Text style={[styles.cell, styles.center]} numberOfLines={1}>{c.milestone}</Text>
          <Text style={[styles.cell, styles.center]} numberOfLines={1}>{date(c.milestoneDate)}</Text>
        </View>
      ),
    },
  ];
}

function Trend({ d, phone = false }: { d: D; phone?: boolean }) {
  const f = d.conTrend;
  const [range, setRange] = useState(RANGES[0]);
  return (
    <FinPanel icon="chart" title="Contract Value Trend" style={!phone && styles.flex} right={phone ? undefined : <RangeBox value={range} options={RANGES} onChange={setRange} width={176} />}>
      <ComboChart labels={f.labels} bars={[{ name: 'Revenue Billed', color: '#4F86F7', values: f.billed }]} line={{ name: 'Contracted Value', color: '#8B5CF6', values: f.contracted, dots: true }} max={600} lineMax={600} rightAxis={false} every={phone ? 2 : 1} barWidth={phone ? 14 : 28} height={phone ? 190 : 160} format={(v) => (v ? `${Math.round(v)}M` : '0')} />
      <View style={styles.legend}>
        {(
          [
            ['Revenue Billed', '#4F86F7'],
            ['Contracted Value', '#8B5CF6'],
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

function ByType({ u, phone = false }: { u: U; phone?: boolean }) {
  const total = u.d.conByType.reduce((s, x) => s + x.value, 0);
  return (
    <FinPanel icon="layers" title="Contracts by Type" style={!phone && styles.flex}>
      <RingLegend phone={phone} size={150} center={num(total)} caption="Contracts" parts={u.d.conByType.map((x) => ({ ...x, display: num(x.value) }))} />
    </FinPanel>
  );
}

function Lifecycle({ u }: { u: U }) {
  return (
    <FinPanel icon="doc" title="Contract Lifecycle">
      <View style={styles.life}>
        {u.life.map((x) => (
          <View key={x.key} style={[styles.lifeTile, { backgroundColor: TONES[x.tone].soft }]} accessible accessibilityLabel={`${x.key}: ${x.count}`}>
            <Icon name={x.icon} size={22} color={TONES[x.tone].solid} />
            <Text style={styles.lifeLabel} numberOfLines={2}>{x.key}</Text>
            <Text style={styles.lifeValue}>{x.count}</Text>
          </View>
        ))}
      </View>
    </FinPanel>
  );
}

function Renewals({ u }: { u: U }) {
  return (
    <FinPanel icon="calendar" title={`Upcoming Renewals (${u.life[3].count})`} onAll={() => u.setTab('Renewals')}>
      {u.renewals.slice(0, 4).map((c) => {
        const days = daysToEnd(c, TODAY);
        return (
          <View key={c.id} style={styles.line}>
            <Crest size={24} />
            <View style={styles.flex}>
              <Text style={styles.tdStrong} numberOfLines={1}>{c.institution}</Text>
              <Text style={styles.cell}>{`${ugx(c.value)} • ends ${date(c.end)}`}</Text>
            </View>
            <Pill label={`${days} days`} tone={days <= 30 ? 'red' : 'orange'} size={10.5} />
          </View>
        );
      })}
      {u.renewals.length ? null : <Text style={styles.cell}>No contracts end in the next 90 days.</Text>}
    </FinPanel>
  );
}

function Insights({ u }: { u: U }) {
  const renewValue = u.renewals.reduce((s, c) => s + c.value, 0);
  return (
    <FinPanel icon="chart" title="Contract Insights">
      <CheckList
        items={[
          { mark: 'ok', text: `${u.life[3].count} contracts due for renewal (sample value ${ugx(renewValue)})` },
          { mark: 'ok', text: `Average discount: ${((u.disc / u.acvNow) * 100).toFixed(1)}% of ACV` },
          { mark: 'ok', text: `Commissions due: ${ugx(u.comm)}` },
          { mark: 'ok', text: `Active contracts: ${num(u.n)} (ACV ${ugx(u.acvNow)})` },
          { mark: 'ok', text: 'Contracted revenue growth: +14.8%', right: '▲', rightTone: 'green' },
        ]}
      />
    </FinPanel>
  );
}

function Templates({ u }: { u: U }) {
  return (
    <FinPanel icon="doc" title="Contract Templates">
      {TEMPLATES.map((t) => (
        <View key={t.name} style={styles.line}>
          <Icon name="doc" size={18} color={BLUE} />
          <View style={styles.flex}>
            <Text style={styles.tdStrong}>{t.name}</Text>
            <Text style={styles.cell}>{`${t.type} • ${t.billing} billing • ${t.years} year${t.years > 1 ? 's' : ''}${t.discount ? ` • ${t.discount}% discount` : ''}`}</Text>
          </View>
          <OutlineBtn small label="Use Template" icon="plus" onPress={() => u.create(t)} />
        </View>
      ))}
    </FinPanel>
  );
}

function Filters({ u }: { u: U }) {
  const cycle = (xs: readonly string[], v: string) => xs[(xs.indexOf(v) + 1) % xs.length];
  return (
    <View style={styles.inline}>
      <OutlineBtn small chevron label={u.type} onPress={() => u.setType(cycle(FILTERS.type, u.type))} />
      <OutlineBtn small chevron label={u.status} onPress={() => u.setStatus(cycle(FILTERS.status, u.status))} />
      <Search placeholder="Search contracts, institutions or reference..." value={u.query} onChange={u.setQuery} style={styles.search} />
    </View>
  );
}

function Register({ u }: { u: U }) {
  if (u.tab === 'Templates') return <Templates u={u} />;
  return (
    <FinPanel icon="doc" title={`Contracts (${num(u.n)})`} right={<Filters u={u} />}>
      <DataTable columns={cols(u)} rows={u.rows} rowKey={(c) => c.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.manage} onRowPress={u.manage} />
      {u.rows.length ? null : <Text style={styles.cell}>No contracts on this tab yet.</Text>}
      <PageStrip label={`Showing 1 – ${u.rows.length} of ${num(u.n)} contracts`} page={u.page} pages={u.pages} onPage={u.setPage} />
    </FinPanel>
  );
}

/** Maple Command › Finance › Contracts & Commercial Agreements on the desktop reference. */
export function ContractsDesk({ c }: { c: CommandData }) {
  const u = useContracts(c.platformFinance.commercial, c.platformFinance.me.name);
  return (
    <FinDesk c={c} sub="Contracts" search="Search by contract, school, institution, agreement, or reference..." promo={PROMO}>
      <FinHead
        icon="doc"
        title="Contracts & Commercial Agreements"
        subtitle="Track negotiated school pricing, contract terms, commissions, discounts, billing milestones and renewals."
        right={
          <>
            <OutlineBtn label="New Contract" icon="plus" onPress={() => u.create()} />
            <OutlineBtn label="Actions" chevron onPress={u.bulk} />
            <OutlineBtn label="Export" icon="download" chevron onPress={u.exportList} />
            <OutlineBtn label="Contract Templates" icon="doc" onPress={() => u.setTab('Templates')} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <Trend d={u.d} />
        <ByType u={u} />
        <View style={styles.side}>
          <Lifecycle u={u} />
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Register u={u} />
        </View>
        <View style={styles.side}>
          <Renewals u={u} />
          <Insights u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: tiles, lifecycle, renewals and contract cards. */
export function ContractsPhone({ c }: { c: CommandData }) {
  const u = useContracts(c.platformFinance.commercial, c.platformFinance.me.name);
  return (
    <FinPhone c={c} title="Contracts" subtitle="School pricing, terms, commissions and renewals.">
      <FinStats items={u.stats} phone title="Contracts at a Glance" />
      <View style={styles.inline}>
        <PrimaryBtn label="New Contract" icon="plus" onPress={() => u.create()} style={styles.flex} />
        <OutlineBtn label="Actions" onPress={u.bulk} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <Lifecycle u={u} />
      <Renewals u={u} />
      {u.tab === 'Templates' ? (
        <Templates u={u} />
      ) : (
        u.rows.map((r) => (
          <PhoneRow key={r.id} lead={<Crest size={30} />} title={r.institution} sub={`${r.id} • ${r.type} • ${ugx(r.value)} • ends ${date(r.end)}`} pill={<Pill label={u.statusOf(r)} tone={STATUS_TONE[u.statusOf(r)]} size={11} />} onPress={() => u.manage(r)} />
        ))
      )}
      <ByType u={u} phone />
      <Trend d={u.d} phone />
      <Insights u={u} />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  side: { width: 344, gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  search: { width: 250 },
  cell: { fontSize: 10.5, color: BODY },
  idCell: { fontSize: 10.5, fontWeight: '600', color: NAVY },
  cellStrong: { flexShrink: 1, fontSize: 11, fontWeight: '700', color: NAVY },
  td: { fontSize: 11.5, color: NAVY },
  tdStrong: { fontSize: 11.5, fontWeight: '800', color: NAVY },
  right: { textAlign: 'right' },
  center: { textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  line: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
  life: { flexDirection: 'row', gap: 6 },
  lifeTile: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingVertical: 12, paddingHorizontal: 2, borderRadius: 12 },
  lifeLabel: { height: 26, fontSize: 9, fontWeight: '600', textAlign: 'center', color: BODY },
  lifeValue: { fontSize: 20, fontWeight: '800', color: NAVY },
});
