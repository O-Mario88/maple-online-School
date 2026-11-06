import { type ReactNode, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CmdSelect, CmdStat, CountTabs, KpiGrid, OutlineBtn, PageStrip, Panel, PersonCell, PrimaryBtn, RangeBox, Sparkline, exportMenu } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { approvePayout, DUAL_LIMIT, MAX_ATTEMPTS, needsTwo, retryJob } from '@/features/command/logic/finance';
import { Btn, Card, Pill, Toggle } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { PayoutRow } from '@/mock/command-center/finance';
import { Maple } from '@/constants/maple';

type F = CommandData['finance'];
const PER_PAGE = 10;
const RISK_TONE: Readonly<Record<PayoutRow['risk'], Tone>> = { Low: 'green', Med: 'orange', High: 'red' };
const STATUS_TONE: Readonly<Record<PayoutRow['status'], Tone>> = { Pending: 'grey', 'Awaiting 2nd': 'orange', Approved: 'green', Held: 'orange', Rejected: 'red' };
const DISPUTE_NEXT = { Open: 'Under Review', 'Under Review': 'Investigating', Investigating: 'Resolved', Resolved: 'Resolved' } as const;
const DISPUTE_TONE = { Open: 'red', 'Under Review': 'orange', Investigating: 'blue', Resolved: 'green' } as const;

function usePayouts(f: F, me: string) {
  const [list, setList] = useState<readonly PayoutRow[]>(f.payouts);
  const [tab, setTab] = useState(f.payoutTabs[0]);
  const [mine, setMine] = useState(false);
  const [page, setPage] = useState(1);
  const [selected, toggle, clear] = useSelection();
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [actingAs, setActingAs] = useState(me);
  const [retries, setRetries] = useState(f.retries.map((r) => ({ ...r, status: 'Scheduled' as 'Scheduled' | 'Manual Review' })));
  const [disputes, setDisputes] = useState(f.disputes);
  const pending = list.filter((p) => p.status === 'Pending' || p.status === 'Awaiting 2nd');
  const shown = useMemo(() => (mine ? pending.filter((p) => !p.approvals.includes(me)) : pending), [pending, mine, me]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const pg = Math.min(page, pages);
  const rows = shown.slice((pg - 1) * PER_PAGE, pg * PER_PAGE);
  const approved = list.filter((p) => p.status === 'Approved');

  const approve = (p: PayoutRow, by = actingAs) => {
    const r = approvePayout(p, by);
    if (r.error) return toast(r.error);
    setList((prev) => prev.map((x) => (x.id === p.id ? r.payout : x)));
    toast(r.payout.status === 'Approved' ? `${p.teacher}: UGX ${p.amount.toLocaleString('en-US')} approved and queued for disbursement.` : `${p.teacher}: first approval recorded. A second admin must approve (≥ UGX ${DUAL_LIMIT.toLocaleString('en-US')} or high risk).`);
  };
  const setStatus = (p: PayoutRow, status: PayoutRow['status']) => {
    setList((prev) => prev.map((x) => (x.id === p.id ? { ...x, status } : x)));
    toast(`${p.teacher}'s payout ${status === 'Held' ? 'is on hold; the teacher is told it is under review' : 'was rejected; funds stay in escrow'}.`);
  };
  const approveSelected = () => {
    if (!selected.size) return toast('Tick the payouts to approve first.');
    let full = 0;
    let waiting = 0;
    let refused = 0;
    const next = list.map((p) => {
      if (!selected.has(p.id)) return p;
      const r = approvePayout(p, actingAs);
      if (r.error) {
        refused++;
        return p;
      }
      if (r.payout.status === 'Approved') full++;
      else waiting++;
      return r.payout;
    });
    setList(next);
    clear();
    toast(`${full} approved, ${waiting} waiting for a second admin${refused ? `, ${refused} skipped (you already approved them)` : ''}.`);
  };
  const retry = (id: string) => {
    const r = retries.find((x) => x.id === id);
    if (!r) return;
    const n = retryJob(r);
    setRetries((prev) => prev.map((x) => (x.id === id ? { ...x, attempts: n.attempts, status: n.status, next: n.status === 'Manual Review' ? 'Manual review' : `in ${n.waitMinutes} min` } : x)));
    toast(n.status === 'Manual Review' ? `${id} failed ${MAX_ATTEMPTS} times; moved to manual review.` : `${id} retry ${n.attempts}/${MAX_ATTEMPTS} scheduled in ${n.waitMinutes} minutes.`);
  };
  const advanceDispute = (id: string) => {
    const d = disputes.find((x) => x.id === id);
    if (!d) return;
    const status = DISPUTE_NEXT[d.status];
    setDisputes((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    toast(`${id}: ${status}.`);
  };
  const pick = (t: string) => {
    setTab(t);
    setPage(1);
  };
  return { list, tab, setTab: pick, mine, setMine, page: pg, pages, setPage, rows, shown, pending, approved, selected, toggle, approve, setStatus, approveSelected, reviewId, setReviewId, actingAs, setActingAs, retries, retry, disputes, advanceDispute };
}
type U = ReturnType<typeof usePayouts>;

function MethodCell({ m }: { m: PayoutRow['method'] }) {
  const icon = m === 'Bank Transfer' ? 'building' : m === 'Stripe' ? 'wallet' : 'phone';
  return (
    <View style={styles.inline}>
      <Icon name={icon} size={14} color={m === 'Stripe' ? Maple.blue : m === 'Bank Transfer' ? BLUE : Maple.warning} />
      <Cell small>{m}</Cell>
    </View>
  );
}

function payoutCols(u: U): readonly Column<PayoutRow>[] {
  return [
    { label: '#', width: 28, render: (p) => <Cell small>{p.n}</Cell> },
    { label: 'Teacher', flex: 1.3, render: (p) => <Cell small strong>{p.teacher}</Cell> },
    { label: 'School', flex: 1.4, render: (p) => <Cell small>{p.school}</Cell> },
    { label: 'Amount (UGX)', width: 100, align: 'right', render: (p) => <Cell small strong>{p.amount.toLocaleString('en-US')}</Cell> },
    { label: 'Payment Method', width: 118, render: (p) => <MethodCell m={p.method} /> },
    { label: 'Risk', width: 70, render: (p) => <Pill label={p.risk} tone={RISK_TONE[p.risk]} icon={p.risk === 'Low' ? 'check' : 'alert'} size={11} /> },
    { label: 'Submitted', width: 120, render: (p) => <Cell small>{p.submitted}</Cell> },
    {
      label: 'Actions',
      width: 150,
      render: (p) => (
        <View style={styles.inline}>
          <OutlineBtn label="Review" small onPress={() => u.setReviewId(p.id)} />
          {p.status === 'Awaiting 2nd' ? <Pill label="1 of 2" tone="orange" size={10.5} /> : needsTwo(p) ? <Pill label="Dual" tone="blue" size={10.5} /> : null}
        </View>
      ),
    },
  ];
}

/** The payout review dialog: details, the approval rule, who has approved, and the decision. */
function ReviewModal({ u, f }: { u: U; f: F }) {
  const p = u.list.find((x) => x.id === u.reviewId);
  return (
    <Modal visible={!!p} transparent animationType="fade" onRequestClose={() => u.setReviewId(null)}>
      <View style={styles.backdrop}>
        {p ? (
          <View style={styles.modal} accessibilityViewIsModal>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>Review payout</Text>
              <Pressable onPress={() => u.setReviewId(null)} accessibilityRole="button" accessibilityLabel="Close" hitSlop={10}>
                <Icon name="close" size={22} color={NAVY} />
              </Pressable>
            </View>
            <PersonCell avatar={p.avatar} name={p.teacher} sub={p.school} size={44} />
            <View style={styles.facts}>
              {[
                ['Amount', `UGX ${p.amount.toLocaleString('en-US')}`],
                ['Method', p.method],
                ['Risk', p.risk],
                ['Submitted', p.submitted],
                ['Status', p.status],
              ].map(([l, v]) => (
                <View key={l} style={styles.fact}>
                  <Text style={styles.factLabel}>{l}</Text>
                  <Text style={styles.factValue}>{v}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.rule}>{needsTwo(p) ? `Needs two different admins: UGX ${DUAL_LIMIT.toLocaleString('en-US')} or more, or high risk.` : 'One admin approval is enough for this payout.'}</Text>
            <Text style={styles.small}>{p.approvals.length ? `Approved by: ${p.approvals.join(', ')}` : 'No approvals yet.'}</Text>
            <View style={styles.inline}>
              <Text style={styles.small}>Approving as</Text>
              <CmdSelect value={u.actingAs} options={f.admins} onChange={u.setActingAs} width={130} label="Approving as" />
            </View>
            <View style={styles.modalBtns}>
              <Btn
                label="Hold"
                kind="outline"
                onPress={() => {
                  u.setStatus(p, 'Held');
                  u.setReviewId(null);
                }}
                height={44}
                style={styles.flex}
              />
              <Btn
                label="Reject"
                kind="outline"
                onPress={() => {
                  u.setStatus(p, 'Rejected');
                  u.setReviewId(null);
                }}
                height={44}
                style={styles.flex}
              />
              <Btn
                label="Approve"
                onPress={() => {
                  u.approve(p);
                  u.setReviewId(null);
                }}
                height={44}
                style={styles.flex}
              />
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function Summary({ f, u }: { f: F; u: U }) {
  return (
    <>
      <Panel title="Payout Summary" icon={<Icon name="chart" size={20} color={BLUE} />} style={styles.block}>
        {f.summary.map((s) => (
          <View key={s.label} style={styles.sumRow}>
            <View style={styles.flex}>
              <Text style={styles.sumLabel}>{s.label}</Text>
              <View style={styles.inline}>
                <Text style={styles.sumValue}>{s.value}</Text>
                <Icon name="arrowUp" size={13} color={GREEN} />
                <Text style={styles.sumDelta}>{s.delta}</Text>
              </View>
            </View>
            <Sparkline color={s.color} values={s.values} width={110} height={42} />
          </View>
        ))}
      </Panel>
      <Panel title="Quick Actions" icon={<Icon name="bolt" size={20} color={BLUE} />} style={styles.block}>
        <PrimaryBtn label={`Approve Selected (${u.selected.size})`} onPress={u.approveSelected} />
        <OutlineBtn label="Schedule Disbursement" onPress={() => toast(u.approved.length ? `${u.approved.length} approved payouts scheduled for the 6:00 PM MoMo and bank runs.` : 'Nothing approved yet to disburse.')} />
        <OutlineBtn label="Process Refund" onPress={() => toast('Refunds come out of teacher escrow first; pick a dispute or transaction to refund.')} />
      </Panel>
    </>
  );
}

function SmallTable({ head, rows, weights, phone = false }: { head: readonly string[]; rows: readonly (readonly (string | ReactNode)[])[]; weights?: readonly number[]; phone?: boolean }) {
  if (phone) {
    return (
      <View style={styles.phoneRows}>
        {rows.map((r, i) => (
          <View key={i} style={styles.phoneRow}>
            {r.map((cell, k) =>
              typeof cell === 'string' ? (
                <Text key={k} style={k === 0 ? styles.phoneRowMain : styles.stCell}>
                  {k === 0 ? cell : `${head[k]}: ${cell}`}
                </Text>
              ) : (
                <View key={k} style={styles.phoneCell}>
                  {cell}
                </View>
              ),
            )}
          </View>
        ))}
      </View>
    );
  }
  const w = (k: number) => ({ flex: weights?.[k] ?? 1, minWidth: 0 });
  return (
    <View style={styles.small_table}>
      <View style={[styles.stRow, styles.stHead]}>
        {head.map((h, k) => (
          <Text key={h} style={[styles.stHeadText, w(k)]} numberOfLines={2}>
            {h}
          </Text>
        ))}
      </View>
      {rows.map((r, i) => (
        <View key={i} style={styles.stRow}>
          {r.map((cell, k) => (
            <View key={k} style={w(k)}>
              {typeof cell === 'string' ? (
                <Text style={styles.stCell} numberOfLines={2}>
                  {cell}
                </Text>
              ) : (
                cell
              )}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function Bottom({ f, u, phone = false }: { f: F; u: U; phone?: boolean }) {
  return (
    <View style={[styles.row, phone && styles.column]}>
      <Panel title="Recent Disbursements" icon={<Icon name="check" size={20} color={GREEN} />} onAll={() => u.setTab('Disbursement Tracking')} style={[styles.block, styles.flex]}>
        <SmallTable phone={phone} weights={[1.25, 0.95, 0.95, 1, 1.45]} head={['Date & Time', 'Amount (UGX)', 'Method', 'Status', 'Reference']} rows={f.disbursements.map((d) => [d.when, d.amount.toLocaleString('en-US'), d.method, <Pill key="s" label={d.status} tone="green" size={10.5} />, d.ref])} />
      </Panel>
      <Panel title="Retry Queue" icon={<Icon name="sync" size={20} color={BLUE} />} onAll={() => u.setTab('Retry Queue')} style={[styles.block, styles.flex]}>
        <SmallTable
          phone={phone}
          weights={[1.2, 1, 0.75, 1.3]}
          head={['Transaction ID', 'Amount (UGX)', 'Attempts', 'Next Retry']}
          rows={u.retries.map((r) => [
            r.id,
            r.amount.toLocaleString('en-US'),
            `${r.attempts}/${MAX_ATTEMPTS}`,
            r.status === 'Manual Review' ? (
              <Pill key="m" label="Manual review" tone="red" size={10.5} />
            ) : (
              <Pressable key="r" onPress={() => u.retry(r.id)} accessibilityRole="button" accessibilityLabel={`Retry ${r.id} now`}>
                <Text style={styles.link}>{`${r.next} · Retry`}</Text>
              </Pressable>
            ),
          ])}
        />
      </Panel>
      <Panel title="Active Disputes" icon={<Icon name="shield" size={20} color={BLUE} />} onAll={() => u.setTab('Disputes')} style={[styles.block, styles.flex]}>
        <SmallTable
          phone={phone}
          weights={[1.45, 1.25, 1.05, 1]}
          head={['Case ID', 'Issue', 'Status', 'Opened']}
          rows={u.disputes.map((d) => [
            d.id,
            d.issue,
            <Pressable key="d" onPress={() => u.advanceDispute(d.id)} accessibilityRole="button" accessibilityLabel={`${d.id}: ${d.status}. Move to next step`}>
              <Pill label={d.status} tone={DISPUTE_TONE[d.status]} size={10.5} />
            </Pressable>,
            d.opened,
          ])}
        />
      </Panel>
    </View>
  );
}

function QueueCard({ u, f }: { u: U; f: F }) {
  return (
    <Card style={[styles.queue, styles.flex]}>
      <View style={styles.queueHead}>
        <Icon name="balance" size={30} color={BLUE} />
        <View style={styles.flex}>
          <Text style={styles.queueTitle}>Dual-Admin Approval Queue</Text>
          <Text style={styles.small}>High-value and sensitive payouts require two authorized approvals.</Text>
        </View>
        <Text style={styles.mineLabel}>Show only mine</Text>
        <Toggle value={u.mine} onChange={u.setMine} label="Show only payouts waiting for my approval" />
      </View>
      <DataTable columns={payoutCols(u)} rows={u.rows} rowKey={(p) => p.id} check selected={u.selected} onToggle={u.toggle} compact />
      <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} approvals`} page={u.page} pages={u.pages} onPage={u.setPage} />
      <ReviewModal u={u} f={f} />
    </Card>
  );
}

function TabBody({ u, f }: { u: U; f: F }) {
  if (u.tab === 'Approval Queue') return <QueueCard u={u} f={f} />;
  const lines: readonly string[] =
    u.tab === 'Disbursement Tracking'
      ? [...u.approved.map((p) => `${p.teacher} • UGX ${p.amount.toLocaleString('en-US')} • ${p.method} • approved by ${p.approvals.join(' & ')}`), ...f.disbursements.map((d) => `${d.ref} • UGX ${d.amount.toLocaleString('en-US')} • ${d.method} • ${d.status}`)]
      : u.tab === 'Retry Queue'
        ? u.retries.map((r) => `${r.id} • UGX ${r.amount.toLocaleString('en-US')} • attempt ${r.attempts}/${MAX_ATTEMPTS} • ${r.status === 'Manual Review' ? 'manual review' : `next ${r.next}`}`)
        : u.tab === 'Disputes'
          ? u.disputes.map((d) => `${d.id} • ${d.issue} • ${d.status} • opened ${d.opened}`)
          : u.tab === 'Refunds'
            ? ['42 refunds this month: 31 completed, 8 processing, 3 waiting on the bank.', 'Refunds come out of teacher escrow before Maple revenue.']
            : ['Monthly payout statement (PDF)', 'Withholding tax by country (CSV)', 'Escrow ageing report (XLSX)'];
  return (
    <Card style={[styles.queue, styles.flex]}>
      {lines.length ? lines.map((l) => <Text key={l} style={styles.line}>{l}</Text>) : <Text style={styles.small}>Nothing here yet.</Text>}
    </Card>
  );
}

/** Maple Command › Teacher Payout Approvals, Disbursals & Dispute Center on the desktop reference. */
export function PayoutsDesk({ c }: { c: CommandData }) {
  const f = c.finance;
  const u = usePayouts(f, c.me.name);
  const [range, setRange] = useState(c.ranges[0]);
  const counts: Readonly<Record<string, number | undefined>> = { 'Approval Queue': u.pending.length, 'Disbursement Tracking': 11872 + u.approved.length, 'Retry Queue': 187, Refunds: 42, Disputes: 24 };
  return (
    <CommandDesk me={c.me} search="Search payouts, teachers, or transaction IDs..." active="Finance" sub="Payouts">
      <CmdHead
        icon="wallet"
        title="Teacher Payout Approvals, Disbursals & Dispute Center"
        subtitle="Approve high-value payouts, track disbursals, manage refunds and disputes, and ensure secure teacher payments."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="Export" icon="download" chevron onPress={() => exportMenu('Payouts')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {f.payoutStats.map((k) => (
          <CmdStat key={k.label} k={k.label === 'Pending Approvals' ? { ...k, value: u.pending.length.toLocaleString('en-US') } : k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.bigTabs}>
        {f.payoutTabs.map((t) => {
          const on = t === u.tab;
          const n = counts[t];
          return (
            <Pressable key={t} style={[styles.bigTab, on && styles.bigTabOn]} onPress={() => u.setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={n !== undefined ? `${t}, ${n}` : t}>
              <Text style={[styles.bigTabText, on && styles.bigTabTextOn]}>{t === 'Approval Queue' || n === undefined ? t : `${t} (${n.toLocaleString('en-US')})`}</Text>
              {t === 'Approval Queue' ? (
                <View style={styles.redBadge}>
                  <Text style={styles.redBadgeText}>{n}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <View style={styles.row}>
        <TabBody u={u} f={f} />
        <View style={styles.side}>
          <Summary f={f} u={u} />
        </View>
      </View>
      <Bottom f={f} u={u} />
    </CommandDesk>
  );
}

/** The phone version: counts, the queue as cards with Approve, summary and the three small lists. */
export function PayoutsPhone({ c }: { c: CommandData }) {
  const f = c.finance;
  const u = usePayouts(f, c.me.name);
  return (
    <CommandPhone me={c.me}>
      <PageHead title="Teacher Payouts" subtitle="Dual-admin approvals, disbursals, retries and disputes." phone />
      <KpiGrid items={f.payoutStats.map((k) => (k.label === 'Pending Approvals' ? { ...k, value: u.pending.length.toLocaleString('en-US') } : k))} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={f.payoutTabs.map((label) => ({ label, count: label === 'Approval Queue' ? u.pending.length : undefined, tone: 'red' }))} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      {u.tab === 'Approval Queue' ? (
        <>
          <View style={styles.inline}>
            <Text style={[styles.small, styles.flex]}>Two admins must approve payouts of UGX 2,000,000+ or high risk.</Text>
            <Toggle value={u.mine} onChange={u.setMine} label="Show only mine" />
          </View>
          {u.rows.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.inline}>
                <View style={styles.flex}>
                  <PersonCell avatar={p.avatar} name={p.teacher} sub={p.school} size={40} />
                </View>
                <Text style={styles.amount}>{`UGX ${p.amount.toLocaleString('en-US')}`}</Text>
              </View>
              <View style={styles.inline}>
                <MethodCell m={p.method} />
                <Pill label={p.risk} tone={RISK_TONE[p.risk]} size={11} />
                <Pill label={p.status} tone={STATUS_TONE[p.status]} size={11} />
              </View>
              <View style={styles.inline}>
                <OutlineBtn label="Review" small onPress={() => u.setReviewId(p.id)} style={styles.flex} />
                <PrimaryBtn label="Approve" onPress={() => u.approve(p)} style={[styles.flex, styles.smallBtn]} />
              </View>
            </View>
          ))}
          <PageStrip label={`${u.shown.length} waiting`} page={u.page} pages={u.pages} onPage={u.setPage} />
          <ReviewModal u={u} f={f} />
        </>
      ) : (
        <TabBody u={u} f={f} />
      )}
      <Summary f={f} u={u} />
      <Bottom f={f} u={u} phone />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  kpis: { flexDirection: 'row', gap: 12 },
  block: { gap: 10 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  noWrap: { flexWrap: 'nowrap' },
  small: { fontSize: 12, color: BODY },
  link: { fontSize: 11.5, fontWeight: '600', color: BLUE },
  line: { paddingVertical: 8, borderBottomWidth: 1, borderColor: LINE, fontSize: 13, color: NAVY },
  bigTabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: LINE },
  bigTab: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderWidth: 1, borderBottomWidth: 0, borderColor: 'transparent' },
  bigTabOn: { borderColor: LINE, backgroundColor: WHITE, borderBottomWidth: 3, borderBottomColor: BLUE },
  bigTabText: { fontSize: 15, color: NAVY },
  bigTabTextOn: { fontSize: 16, fontWeight: '700', color: BLUE },
  redBadge: { paddingHorizontal: 7, paddingVertical: 1, borderRadius: 10, backgroundColor: Maple.error },
  redBadgeText: { fontSize: 12, fontWeight: '700', color: WHITE },
  queue: { gap: 10, padding: 12 },
  queueHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  queueTitle: { fontSize: 17, fontWeight: '800', color: NAVY },
  mineLabel: { fontSize: 13, color: BLUE },
  side: { width: 316, gap: 14 },
  sumRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: 1, borderColor: LINE },
  sumLabel: { fontSize: 13, color: NAVY },
  sumValue: { fontSize: 19, fontWeight: '800', color: NAVY },
  sumDelta: { fontSize: 13, fontWeight: '700', color: GREEN },
  small_table: { borderRadius: 8, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  stRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32, paddingHorizontal: 8, borderBottomWidth: 1, borderColor: LINE },
  stHead: { backgroundColor: Maple.blueSoft },
  stHeadText: { fontSize: 11, fontWeight: '700', color: NAVY },
  stCell: { fontSize: 11, color: NAVY },
  phoneRows: { gap: 8 },
  phoneRow: { gap: 3, paddingBottom: 8, borderBottomWidth: 1, borderColor: LINE },
  phoneRowMain: { fontSize: 13, fontWeight: '700', color: NAVY },
  phoneCell: { flexDirection: 'row' },
  card: { gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  amount: { fontSize: 14, fontWeight: '800', color: NAVY },
  smallBtn: { height: 32 },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(10,20,50,0.45)' },
  modal: { width: '100%', maxWidth: 460, gap: 10, padding: 20, borderRadius: 16, backgroundColor: WHITE },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: NAVY },
  facts: { borderRadius: 10, borderWidth: 1, borderColor: LINE, paddingHorizontal: 12, paddingVertical: 4 },
  fact: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  factLabel: { fontSize: 13, color: BODY },
  factValue: { fontSize: 13, fontWeight: '600', color: NAVY },
  rule: { padding: 10, borderRadius: 8, backgroundColor: Maple.blueSoft, fontSize: 12.5, color: NAVY },
  modalBtns: { flexDirection: 'row', gap: 8 },
});
