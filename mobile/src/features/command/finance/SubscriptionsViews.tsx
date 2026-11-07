import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { AreaChart } from '@/features/command/kit/CmdCharts';
import { CmdSelect, type Kpi, OutlineBtn, PageStrip, PhotoDot, PrimaryBtn, exportMenu } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { cancel, changePlan, dunningStep, mrr, netRecurring, recoverPayment, renewalsDue, type SubStatus } from '@/features/command/logic/subscriptions';
import { Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { type Column, DataTable, Search, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { PlanRow, SubRow } from '@/mock/command-center/pf-subscriptions';

import { amount, type FormAsk, FormModal } from './FinForm';
import { ActionGrid, FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, SumLine, ugx } from './FinKit';
import { Maple } from '@/constants/maple';

type D = CommandData['platformFinance']['subscriptions'];
const PER_PAGE = 10;
const TABS = ['Overview', 'Subscriptions', 'Plans & Pricing', 'Renewals', 'Upgrades & Downgrades', 'Trials', 'Failed Payments', 'Cancellations', 'Recurring Revenue'] as const;
const STATUS_TONE: Readonly<Record<SubStatus, Tone>> = { Active: 'green', Trial: 'purple', 'Past Due': 'red', Cancelled: 'grey' };
const PROMO: Promo = { icon: 'trophy', color: Maple.warning, title: 'Maple Platform Finance', body: 'Subscriptions, revenue, payments and financial control — all in one place.' };
const CYCLE: Readonly<Record<SubRow['billing'], number>> = { Monthly: 1, Termly: 4, Annual: 12 };
const ACTIONS = ['Change plan', 'Renew now', 'Retry payment', 'Cancel'] as const;

export const dateLabel = (iso: string): string => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const addMonths = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
};

function useSubs(d: D) {
  const [list, setList] = useState<readonly SubRow[]>(d.subs);
  const [plans, setPlans] = useState<readonly PlanRow[]>(d.plans);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [kind, setKind] = useState<'All' | 'School' | 'Learner'>('All');
  const [query, setQuery] = useState('');
  const [status, setStatus, statuses] = useChoice(['Status: All', 'Active', 'Trial', 'Past Due', 'Cancelled']);
  const [planF, setPlanF, planFs] = useChoice(['Plan: All', ...d.plans.map((p) => p.name)]);
  const [billing, setBilling, billings] = useChoice(['Billing: All', 'Monthly', 'Termly', 'Annual']);
  const [renewal, setRenewal, renewals] = useChoice(['Renewal: All', 'Next 30 Days', 'Next 90 Days']);
  const [period, setPeriod, periods] = useChoice(['Period: All Time', 'This Year']);
  const [page, setPage] = useState(1);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const [changes, setChanges] = useState({ upgrades: 0, downgrades: 0, cancellations: 0 });
  const [activity, setActivity] = useState(d.activity);
  const [selected, toggle] = useSelection();
  const planName = (id: string) => plans.find((p) => p.id === id)?.name ?? id;
  const cycleAmount = (s: SubRow) => (s.status === 'Trial' ? 0 : (plans.find((p) => p.id === s.plan)?.price ?? 0) * CYCLE[s.billing]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const nameOf = (id: string) => plans.find((x) => x.id === id)?.name ?? id;
    const due = (s: SubRow, n: number) => renewalsDue([s], d.TODAY, n).length > 0;
    const inTab = (s: SubRow) =>
      tab === 'Renewals' ? due(s, 30) : tab === 'Trials' ? s.status === 'Trial' : tab === 'Failed Payments' ? s.status === 'Past Due' : tab === 'Cancellations' ? s.status === 'Cancelled' : true;
    return list.filter(
      (s) =>
        inTab(s) &&
        (kind === 'All' || s.kind === kind) &&
        (status === 'Status: All' || s.status === status) &&
        (planF === 'Plan: All' || nameOf(s.plan) === planF) &&
        (billing === 'Billing: All' || s.billing === billing) &&
        (renewal === 'Renewal: All' || due(s, renewal === 'Next 30 Days' ? 30 : 90)) &&
        (period === 'Period: All Time' || s.start.startsWith('2026')) &&
        (!q || `${s.subscriber} ${s.ref} ${nameOf(s.plan)}`.toLowerCase().includes(q)),
    );
  }, [list, tab, kind, status, planF, billing, renewal, period, query, d.TODAY, plans]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const update = (s: SubRow) => setList((prev) => prev.map((x) => (x.id === s.id ? s : x)));
  const note = (text: string, icon: (typeof d.activity)[number]['icon']) => setActivity((a) => [{ text, when: 'Just now', icon }, ...a].slice(0, 6));

  const manage = (s: SubRow) =>
    setAsk({
      title: `Manage ${s.subscriber}`,
      body: `${planName(s.plan)} • ${s.billing} • ${s.status}. Renews ${dateLabel(s.nextRenewal)}.`,
      fields: [
        { key: 'action', label: 'Action', kind: 'choice', options: ACTIONS },
        { key: 'plan', label: 'New plan (for a plan change)', kind: 'choice', options: plans.filter((x) => x.type === s.kind).map((x) => x.name) },
        { key: 'reason', label: 'Reason (for a cancellation)', kind: 'text', placeholder: 'School merged with another campus' },
      ],
      confirm: 'Apply',
      onSubmit: (v) => {
        if (v.action === 'Change plan') {
          const target = plans.find((x) => x.name === v.plan);
          const r = changePlan(s, target?.id ?? '', plans, d.TODAY);
          if (r.error) return r.error;
          update(r.sub);
          setChanges((c) => (r.kind === 'Upgrade' ? { ...c, upgrades: c.upgrades + Math.max(0, r.proration) } : { ...c, downgrades: c.downgrades - Math.min(0, r.proration) }));
          note(`${s.subscriber} ${r.kind === 'Upgrade' ? 'upgraded' : 'downgraded'} to ${target?.name}`, r.kind === 'Upgrade' ? 'arrowUp' : 'sync');
          toast(`${r.kind} done. ${r.proration >= 0 ? `Prorated charge ${ugx(r.proration)} invoiced` : `Credit ${ugx(-r.proration)} applied`}; Auto Accountant posted the entry.`);
          return undefined;
        }
        if (v.action === 'Cancel') {
          const r = cancel(s, v.reason, d.TODAY);
          if (r.error) return r.error;
          update(r.sub);
          setChanges((c) => ({ ...c, cancellations: c.cancellations + cycleAmount(s) / CYCLE[s.billing] }));
          note(`Subscription cancelled: ${s.subscriber}`, 'close');
          toast(`${s.subscriber} keeps access until ${dateLabel(s.nextRenewal)}; unearned revenue is reversed then.`);
          return undefined;
        }
        if (v.action === 'Retry payment') {
          if (s.status !== 'Past Due') return `${s.subscriber} has no failed payment.`;
          const step = dunningStep(s.failedAttempts);
          if (step.action === 'Suspend') {
            update({ ...s, status: 'Cancelled', cancelReason: 'Suspended after 3 failed retries', endsOn: d.TODAY });
            toast(`${s.subscriber} suspended after three failed retries. A recovery email has been sent.`);
            return undefined;
          }
          update(recoverPayment(s));
          note(`Payment recovered: ${s.subscriber}`, 'sync');
          toast(`Retry succeeded for ${s.subscriber}: ${ugx(cycleAmount(s))} collected and posted.`);
          return undefined;
        }
        if (s.status === 'Cancelled') return 'Reactivate the subscription before renewing it.';
        update({ ...s, status: s.status === 'Trial' ? 'Active' : s.status, start: s.nextRenewal, nextRenewal: addMonths(s.nextRenewal, CYCLE[s.billing]) });
        note(`${s.subscriber} renewed (${s.billing})`, 'sync');
        toast(`${s.subscriber} renewed to ${dateLabel(addMonths(s.nextRenewal, CYCLE[s.billing]))}. Invoice for ${ugx(cycleAmount(s))} sent.`);
        return undefined;
      },
    });
  const createPlan = () =>
    setAsk({
      title: 'Create plan',
      fields: [
        { key: 'name', label: 'Plan name', kind: 'text', placeholder: 'School Plus' },
        { key: 'type', label: 'For', kind: 'choice', options: ['School', 'Learner'] },
        { key: 'price', label: 'Monthly price (UGX)', kind: 'number', placeholder: '750000' },
        { key: 'limit', label: 'What it includes', kind: 'text', placeholder: 'Up to 500 learners' },
      ],
      confirm: 'Create Plan',
      onSubmit: (v) => {
        const name = v.name.trim();
        const price = amount(v.price);
        if (!name) return 'Give the plan a name.';
        if (plans.some((x) => x.name.toLowerCase() === name.toLowerCase())) return `A plan called ${name} already exists.`;
        if (!price) return 'Enter a monthly price above zero.';
        setPlans((prev) => [...prev, { id: `plan-${prev.length + 1}`, name, type: v.type as PlanRow['type'], price, limit: v.limit.trim() || '—', subscribers: 0 }]);
        toast(`${name} created at ${ugx(price)} a month.`);
        return undefined;
      },
    });
  const createSub = () =>
    setAsk({
      title: 'Create subscription',
      fields: [
        { key: 'name', label: 'School or learner', kind: 'text', placeholder: 'Kampala Parents School' },
        { key: 'plan', label: 'Plan', kind: 'choice', options: plans.map((x) => x.name) },
        { key: 'billing', label: 'Billing', kind: 'choice', options: ['Monthly', 'Termly', 'Annual'] },
        { key: 'trial', label: 'Start with a 14-day trial', kind: 'choice', options: ['No', 'Yes'] },
      ],
      confirm: 'Create Subscription',
      onSubmit: (v) => {
        if (!v.name.trim()) return 'Who is subscribing?';
        const plan = plans.find((x) => x.name === v.plan);
        if (!plan) return 'Pick a plan.';
        const billing = v.billing as SubRow['billing'];
        const school = plan.type === 'School';
        const id = `${school ? 'SCH' : 'LRN'}-${String(list.length + 300).padStart(5, '0')}`;
        const row: SubRow = { id, ref: id, subscriber: v.name.trim(), kind: plan.type, plan: plan.id, billing, start: d.TODAY, nextRenewal: v.trial === 'Yes' ? '2026-11-09' : addMonths(d.TODAY, CYCLE[billing]), status: v.trial === 'Yes' ? 'Trial' : 'Active', failedAttempts: 0 };
        setList((prev) => [row, ...prev]);
        note(`New ${school ? 'school' : 'learner'} subscription: ${row.subscriber}`, 'userPlus');
        toast(v.trial === 'Yes' ? `${row.subscriber} starts a 14-day trial; the first invoice goes out on Nov 9.` : `${row.subscriber} subscribed. Invoice ${ugx(plan.price * CYCLE[billing])} sent with a payment link.`);
        return undefined;
      },
    });
  const bulk = () => {
    if (!selected.size) return toast('Tick subscriptions in the table first.');
    const picked = list.filter((s) => selected.has(s.id));
    setAsk({
      title: `Bulk actions (${picked.length})`,
      fields: [{ key: 'action', label: 'Action', kind: 'choice', options: ['Send renewal reminders', 'Retry failed payments'] }],
      confirm: 'Run',
      onSubmit: (v) => {
        if (v.action === 'Retry failed payments') {
          const due = picked.filter((s) => s.status === 'Past Due');
          if (!due.length) return 'None of the selected subscriptions has a failed payment.';
          setList((prev) => prev.map((s) => (due.some((x) => x.id === s.id) ? recoverPayment(s) : s)));
          toast(`${due.length} failed payment${due.length > 1 ? 's' : ''} retried and recovered.`);
          return undefined;
        }
        toast(`Renewal reminders sent to ${picked.length} subscriber${picked.length > 1 ? 's' : ''} by email, SMS and WhatsApp.`);
        return undefined;
      },
    });
  };

  const liveMrr = d.totals.mrr + mrr(list, plans) - mrr(d.subs, d.plans);
  const count = (l: readonly SubRow[], f: (s: SubRow) => boolean) => l.filter(f).length;
  const delta = (f: (s: SubRow) => boolean) => count(list, f) - count(d.subs, f);
  const stats: readonly Kpi[] = [
    { ...d.stats[0], value: num(d.totals.active + delta((s) => s.status === 'Active')) },
    { ...d.stats[1], value: ugx(liveMrr) },
    { ...d.stats[2], value: ugx(liveMrr * 12) },
    { ...d.stats[3], value: num(d.totals.renewals + renewalsDue(list, d.TODAY, 30).length - renewalsDue(d.subs, d.TODAY, 30).length) },
    { ...d.stats[4], value: num(d.totals.failed + delta((s) => s.status === 'Past Due')) },
    { ...d.stats[5], value: num(d.totals.cancelled + delta((s) => s.status === 'Cancelled')) },
  ];
  const pick = (t: string) => {
    setTab(t);
    setPage(1);
  };
  return { d, list, plans, planName, cycleAmount, rows, shown, tab, setTab: pick, kind, setKind, query, setQuery, status, setStatus, statuses, planF, setPlanF, planFs, billing, setBilling, billings, renewal, setRenewal, renewals, period, setPeriod, periods, page: p, pages, setPage, ask, setAsk, manage, createPlan, createSub, bulk, changes, activity, stats, selected, toggle };
}
type U = ReturnType<typeof useSubs>;

function Lead({ s, size = 30 }: { s: SubRow; size?: number }) {
  if (s.avatar) return <PhotoDot source={s.avatar} size={size} />;
  return (
    <View style={[styles.crest, { width: size, height: size, borderRadius: size / 4 }]}>
      <Icon name="building" size={size * 0.55} color={TONES.green.solid} />
    </View>
  );
}

function cols(u: U): readonly Column<SubRow>[] {
  return [
    {
      label: 'Subscriber',
      flex: 1.7,
      render: (s) => (
        <View style={styles.inline}>
          <Lead s={s} size={22} />
          <View style={styles.flex}>
            <Text style={styles.cellStrong} numberOfLines={1}>
              {s.subscriber}
            </Text>
            <Text style={styles.tiny} numberOfLines={1}>
              {s.ref}
            </Text>
          </View>
        </View>
      ),
    },
    { label: 'Type', width: 56, render: (s) => <Pill label={s.kind} tone={s.kind === 'School' ? 'blue' : 'purple'} size={10.5} /> },
    { label: 'Plan', width: 95, render: (s) => <Text style={styles.cell} numberOfLines={1}>{u.planName(s.plan)}</Text> },
    { label: 'Billing Cycle', width: 54, render: (s) => <Text style={styles.cell} numberOfLines={1}>{s.billing}</Text> },
    { label: 'Start Date', width: 79, render: (s) => <Text style={styles.cell} numberOfLines={1}>{dateLabel(s.start)}</Text> },
    { label: 'Next Renewal', width: 81, render: (s) => <Text style={styles.cell} numberOfLines={2}>{s.status === 'Cancelled' ? `Ends ${dateLabel(s.endsOn ?? s.nextRenewal)}` : dateLabel(s.nextRenewal)}</Text> },
    { label: 'Status', width: 64, render: (s) => <Pill label={s.status} tone={STATUS_TONE[s.status]} size={10.5} /> },
    { label: 'Amount', width: 95, render: (s) => <Text style={styles.cell} numberOfLines={1}>{ugx(u.cycleAmount(s))}</Text> },
  ];
}

function Trend({ d, phone = false }: { d: D; phone?: boolean }) {
  const [win, setWin, wins] = useChoice(['Last 12 Months', 'Last 6 Months']);
  const n = win === 'Last 12 Months' ? 12 : 6;
  return (
    <FinPanel icon="chart" title="Recurring Revenue Trend" right={<CmdSelect value={win} options={wins} onChange={setWin} width={136} label="Period" />} style={!phone && styles.trend}>
      <AreaChart
        labels={d.trend.labels.slice(-n)}
        series={[
          { name: 'MRR', color: Maple.blue, values: d.trend.mrr.slice(-n), fill: true, dots: true },
          { name: 'ARR ÷ 12', color: Maple.blue, values: d.trend.arr.slice(-n), fill: true, dots: true },
        ]}
        min={200}
        max={500}
        ticks={6}
        height={phone ? 190 : 196}
        format={(v) => `${Math.round(v)}M`}
      />
      <View style={styles.legend}>
        <View style={styles.inline}>
          <View style={[styles.dot, { backgroundColor: Maple.blue }]} />
          <Text style={styles.tiny}>MRR (Monthly Recurring Revenue)</Text>
        </View>
        <View style={styles.inline}>
          <View style={[styles.dot, { backgroundColor: Maple.blue }]} />
          <Text style={styles.tiny}>ARR (Annual Recurring Revenue, ÷12)</Text>
        </View>
      </View>
      <Text style={styles.note}>MRR and ARR are contracted recurring value, not cash collected or revenue earned.</Text>
    </FinPanel>
  );
}

function Plans({ u, phone = false }: { u: U; phone?: boolean }) {
  return (
    <FinPanel icon="layers" title="Subscription Plans" onAll={() => u.setTab('Plans & Pricing')} allLabel="Manage Plans" style={!phone && styles.plans}>
      {phone ? null : (
        <View style={[styles.planRow, styles.planHead]}>
          <Text style={[styles.th, styles.flex]}>Plan</Text>
          <Text style={[styles.th, styles.pType]}>Type</Text>
          <Text style={[styles.th, styles.pPrice]}>Price (Monthly)</Text>
          <Text style={[styles.th, styles.pSubs]}>Subscribers</Text>
          <Text style={[styles.th, styles.pRev]}>Revenue / Month</Text>
        </View>
      )}
      {u.plans.map((pl) => (
        <View key={pl.id} style={styles.planRow}>
          <Icon name={pl.type === 'School' ? 'building' : 'person'} size={20} color={pl.type === 'School' ? TONES.green.solid : TONES.orange.solid} />
          <View style={styles.flex}>
            <Text style={styles.strong}>{pl.name}</Text>
            <Text style={styles.tiny}>{phone ? `${ugx(pl.price)}/mo • ${num(pl.subscribers)} subscribers` : pl.limit}</Text>
          </View>
          {phone ? (
            <Text style={styles.strong}>{ugx(pl.price * pl.subscribers)}</Text>
          ) : (
            <>
              <View style={styles.pType}>
                <Pill label={pl.type} tone={pl.type === 'School' ? 'blue' : 'purple'} size={10.5} />
              </View>
              <Text style={[styles.td, styles.pPrice]}>{ugx(pl.price)}</Text>
              <Text style={[styles.td, styles.pSubs]}>{num(pl.subscribers)}</Text>
              <Text style={[styles.td, styles.pRev]}>{ugx(pl.price * pl.subscribers)}</Text>
            </>
          )}
        </View>
      ))}
    </FinPanel>
  );
}

function SubsTable({ u }: { u: U }) {
  const d = u.d;
  return (
    <FinPanel icon="people" title={`Subscriptions (${num(d.totals.active)})`} style={styles.flex}>
      <View style={styles.inline}>
        {(
          [
            ['All', `All (${num(d.totals.active)})`],
            ['School', `Schools (${num(d.totals.schools)})`],
            ['Learner', `Learners (${num(d.totals.learners)})`],
          ] as const
        ).map(([k, l]) => (
          <Pressable key={k} style={[styles.seg, u.kind === k && styles.segOn]} onPress={() => u.setKind(k)} accessibilityRole="tab" accessibilityState={{ selected: u.kind === k }} accessibilityLabel={l}>
            <Text style={[styles.segText, u.kind === k && styles.segTextOn]}>{l}</Text>
          </Pressable>
        ))}
        <Search placeholder="Search by school, learner, plan or ID..." value={u.query} onChange={u.setQuery} style={styles.flex} />
      </View>
      <View style={styles.inline}>
        <CmdSelect value={u.status} options={u.statuses} onChange={u.setStatus} width={104} label="Status" />
        <CmdSelect value={u.planF} options={u.planFs} onChange={u.setPlanF} width={118} label="Plan" />
        <CmdSelect value={u.billing} options={u.billings} onChange={u.setBilling} width={104} label="Billing" />
        <CmdSelect value={u.renewal} options={u.renewals} onChange={u.setRenewal} width={118} label="Renewal" />
        <CmdSelect value={u.period} options={u.periods} onChange={u.setPeriod} width={138} label="Period" />
      </View>
      <DataTable columns={cols(u)} rows={u.rows} rowKey={(s) => s.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.manage} onRowPress={u.manage} />
      <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0} – ${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} subscriptions`} page={u.page} pages={u.pages} onPage={u.setPage} />
    </FinPanel>
  );
}

function Alerts({ u }: { u: U }) {
  const live = (base: number, f: (s: SubRow) => boolean) => base + u.list.filter(f).length - u.d.subs.filter(f).length;
  const items: readonly [IconName, string, string, string, () => void][] = [
    ['bell', Maple.warning, u.stats[3].value, 'subscriptions renew in next 30 days', () => u.setTab('Renewals')],
    ['bell', Maple.error, `${live(u.d.totals.failed, (s) => s.status === 'Past Due')}`, 'failed payments (action required)', () => u.setTab('Failed Payments')],
    ['bell', NAVY, `${live(u.d.totals.cancelled, (s) => s.status === 'Cancelled')}`, 'cancellation requests', () => u.setTab('Cancellations')],
    ['bell', BLUE, `${live(u.d.totals.trialsEnding, (s) => s.status === 'Trial')}`, 'trial periods ending in 7 days', () => u.setTab('Trials')],
  ];
  return (
    <FinPanel icon="calendar" title="Renewals & Alerts" onAll={() => u.setTab('Renewals')}>
      {items.map(([icon, color, n, text, fn]) => (
        <Pressable key={text} style={styles.alert} onPress={fn} accessibilityRole="button" accessibilityLabel={`${n} ${text}`}>
          <Icon name={icon} size={17} color={color} />
          <Text style={styles.td}>
            <Text style={styles.strong}>{n}</Text>
            {` ${text}`}
          </Text>
        </Pressable>
      ))}
    </FinPanel>
  );
}

const ACT_ICON: Readonly<Record<string, { icon: IconName; color: string }>> = {
  arrowUp: { icon: 'arrowUp', color: TONES.green.solid },
  sync: { icon: 'sync', color: TONES.green.solid },
  userPlus: { icon: 'userPlus', color: BLUE },
  close: { icon: 'close', color: TONES.red.solid },
};

function Activity({ u }: { u: U }) {
  return (
    <FinPanel icon="clock" title="Recent Activity" onAll={() => toast('Full activity log with filters by school, plan and change type.')}>
      {u.activity.map((a, i) => (
        <View key={`${a.text}-${i}`} style={styles.alert}>
          <Icon name={ACT_ICON[a.icon].icon} size={16} color={ACT_ICON[a.icon].color} />
          <Text style={[styles.td, styles.flex]}>{a.text}</Text>
          <Text style={styles.tiny}>{a.when}</Text>
        </View>
      ))}
    </FinPanel>
  );
}

function RevenueSummary({ u }: { u: U }) {
  const [p, setP] = useState<'This Month' | 'Year to Date'>('This Month');
  const r = u.d.revenue[p];
  const live = p === 'This Month' ? { ...r, upgrades: r.upgrades + u.changes.upgrades, downgrades: r.downgrades + u.changes.downgrades, cancellations: r.cancellations + u.changes.cancellations } : r;
  return (
    <FinPanel icon="poll" title="Revenue Summary">
      <View style={styles.inline}>
        {(['This Month', 'Year to Date'] as const).map((x) => (
          <Pressable key={x} style={[styles.seg, styles.flex, p === x && styles.segOn]} onPress={() => setP(x)} accessibilityRole="tab" accessibilityState={{ selected: p === x }} accessibilityLabel={x}>
            <Text style={[styles.segText, p === x && styles.segTextOn]}>{x}</Text>
          </Pressable>
        ))}
      </View>
      <SumLine label="Subscription Revenue" value={ugx(live.base)} />
      <SumLine label="Upgrades (Net)" value={ugx(live.upgrades)} />
      <SumLine label="Downgrades (Net)" value={ugx(-live.downgrades)} tone="red" />
      <SumLine label="Cancellations (Lost)" value={ugx(-live.cancellations)} tone="red" />
      <SumLine label="Net Recurring Revenue" value={ugx(netRecurring(live))} strong />
    </FinPanel>
  );
}

function Quick({ u }: { u: U }) {
  return (
    <FinPanel icon="bolt" title="Quick Actions">
      <ActionGrid
        columns={2}
        items={[
          { icon: 'plus', label: 'Create Subscription', onPress: u.createSub },
          { icon: 'calendar', label: 'Manage Renewals', tone: 'green', onPress: () => u.setTab('Renewals') },
          { icon: 'alert', label: 'Handle Failed Payments', tone: 'red', onPress: () => u.setTab('Failed Payments') },
          { icon: 'close', label: 'View Cancelled Subscriptions', tone: 'purple', onPress: () => u.setTab('Cancellations') },
        ]}
      />
    </FinPanel>
  );
}

/** Maple Command › Finance › Subscription Management on the desktop reference. */
export function SubscriptionsDesk({ c }: { c: CommandData }) {
  const u = useSubs(c.platformFinance.subscriptions);
  return (
    <FinDesk c={c} sub="Subscriptions" search="Search schools, learners, subscriptions, invoices, or transactions..." promo={PROMO}>
      <FinHead
        icon="layers"
        title="Subscription Management"
        subtitle="Manage plans, school subscriptions and learner plans, renewals, upgrades, downgrades and cancellations."
        right={
          <>
            <OutlineBtn label="Create Plan" icon="plus" onPress={u.createPlan} />
            <OutlineBtn label="Bulk Actions" chevron onPress={u.bulk} />
            <OutlineBtn label="Export" icon="download" chevron onPress={() => exportMenu('Subscriptions')} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <Trend d={u.d} />
        <Plans u={u} />
      </View>
      <View style={styles.row}>
        <SubsTable u={u} />
        <View style={styles.col}>
          <Alerts u={u} />
          <Activity u={u} />
        </View>
        <View style={styles.col}>
          <RevenueSummary u={u} />
          <Quick u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: tiles, the trend, plans, subscription cards and the summaries. */
export function SubscriptionsPhone({ c }: { c: CommandData }) {
  const u = useSubs(c.platformFinance.subscriptions);
  return (
    <FinPhone c={c} title="Subscriptions" subtitle="Plans, renewals, upgrades, failed payments and recurring revenue.">
      <FinStats items={u.stats} phone title="Subscription Metrics" />
      <View style={styles.inline}>
        <PrimaryBtn label="Create Subscription" icon="plus" onPress={u.createSub} style={styles.flex} />
        <OutlineBtn label="Plan" icon="plus" onPress={u.createPlan} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      <Trend d={u.d} phone />
      <Plans u={u} phone />
      <Search placeholder="Search subscriptions..." value={u.query} onChange={u.setQuery} />
      {u.rows.map((s) => (
        <PhoneRow key={s.id} lead={<Lead s={s} size={40} />} title={s.subscriber} sub={`${u.planName(s.plan)} • ${s.billing} • renews ${dateLabel(s.nextRenewal)}`} right={ugx(u.cycleAmount(s))} pill={<Pill label={s.status} tone={STATUS_TONE[s.status]} size={11} />} onPress={() => u.manage(s)} />
      ))}
      {!u.rows.length ? <Text style={styles.tiny}>No subscriptions match.</Text> : null}
      <PageStrip label={`${u.shown.length} subscriptions`} page={u.page} pages={u.pages} onPage={u.setPage} />
      <Alerts u={u} />
      <RevenueSummary u={u} />
      <Activity u={u} />
      <Quick u={u} />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  col: { width: 290, gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trend: { flex: 1.12 },
  plans: { flex: 1 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  note: { fontSize: 11.5, color: BODY },
  tiny: { fontSize: 11.5, color: BODY },
  strong: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  td: { fontSize: 12, color: NAVY },
  cell: { fontSize: 11, color: BODY },
  cellStrong: { fontSize: 11.5, fontWeight: '700', color: NAVY },
  th: { fontSize: 11, fontWeight: '700', color: NAVY },
  crest: { alignItems: 'center', justifyContent: 'center', backgroundColor: TONES.green.soft },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5, borderBottomWidth: 1, borderColor: LINE },
  planHead: { paddingLeft: 30 },
  pType: { width: 60, alignItems: 'flex-start' },
  pPrice: { width: 92, textAlign: 'right' },
  pSubs: { width: 78, textAlign: 'right' },
  pRev: { width: 106, textAlign: 'right' },
  seg: { height: 30, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  segOn: { borderColor: BLUE, backgroundColor: BLUE },
  segText: { fontSize: 11.5, fontWeight: '600', color: NAVY },
  segTextOn: { color: WHITE },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 4 },
});
