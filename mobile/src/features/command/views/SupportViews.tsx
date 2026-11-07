import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { AreaChart } from '@/features/command/kit/CmdCharts';
import { CmdSelect, CmdStat, CountTabs, DetailRow, KpiGrid, OutlineBtn, PageStrip, Panel, PersonCell, PhotoDot, PrimaryBtn, RangeBox, exportMenu } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { ReasonModal, type ReasonAsk } from '@/features/command/kit/ReasonModal';
import { closeTicket, escalate, slaState } from '@/features/command/logic/security';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BODY, GREEN, LINE, NAVY, RED, type Tone, WHITE } from '@/features/portal/tokens';
import { Donut, DonutLabel } from '@/features/school/kit/Charts';
import { Cell, type Column, DataTable, PageHead, Search, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { TicketRow } from '@/mock/command-center/security';
import { Maple } from '@/constants/maple';
import { Palette } from '@/constants/palette';

type S = CommandData['security'];
const PER_PAGE = 10;
const PRIORITY_TONE: Readonly<Record<TicketRow['priority'], Tone>> = { High: 'red', Medium: 'orange', Low: 'green' };
const STATUS_TONE: Readonly<Record<TicketRow['status'], Tone>> = { Open: 'red', 'In Progress': 'blue', 'Under Review': 'orange', 'Awaiting Customer': 'purple', Escalated: 'red', Resolved: 'green' };

function useSupport(s: S) {
  const ME = s.supportAgent;
  const [list, setList] = useState<readonly TicketRow[]>(s.tickets);
  const [tab, setTab] = useState(s.supportTabs[0].label);
  const [query, setQuery] = useState('');
  const [category, setCategory, categories] = useChoice(['All Categories', 'Technical Issue', 'Billing & Payments', 'AI Copilot', 'Account & Access', 'Safety & Policy', 'Content & Curriculum', 'Data Request']);
  const [priority, setPriority, priorities] = useChoice(['All Priorities', 'High', 'Medium', 'Low']);
  const [status, setStatus, statuses] = useChoice(['All Status', 'Open', 'In Progress', 'Under Review', 'Awaiting Customer', 'Escalated', 'Resolved']);
  const [assignee, setAssignee, assignees] = useChoice(['All Assignees', ...s.assignees, 'Unassigned']);
  const [sort, setSort, sorts] = useChoice(['Newest First', 'Oldest First', 'SLA Soonest']);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(s.tickets[0].id);
  const [ask, setAsk] = useState<ReasonAsk | null>(null);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const inTab = (t: TicketRow) =>
      tab === 'All Tickets' ||
      (tab === 'My Tickets' && t.assignee === ME) ||
      (tab === 'Open' && t.status === 'Open') ||
      (tab === 'Escalated' && t.status === 'Escalated') ||
      (tab === 'Unassigned' && t.assignee === 'Unassigned') ||
      (tab === 'Awaiting Customer' && t.status === 'Awaiting Customer') ||
      (tab === 'Resolved' && t.status === 'Resolved');
    const q = query.trim().toLowerCase();
    const l = list.filter(
      (t) =>
        inTab(t) &&
        (category === 'All Categories' || t.category === category) &&
        (priority === 'All Priorities' || t.priority === priority) &&
        (status === 'All Status' || t.status === status) &&
        (assignee === 'All Assignees' || t.assignee === assignee) &&
        (!q || `${t.id} ${t.subject} ${t.user} ${t.email}`.toLowerCase().includes(q)),
    );
    if (sort === 'Oldest First') return [...l].reverse();
    if (sort === 'SLA Soonest') return [...l].sort((a, b) => slaState(a, s.NOW).minutesLeft - slaState(b, s.NOW).minutesLeft);
    return l;
  }, [list, tab, query, category, priority, status, assignee, sort, s.NOW, ME]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const open = list.find((t) => t.id === openId) ?? null;
  const update = (t: TicketRow) => setList((prev) => prev.map((x) => (x.id === t.id ? t : x)));

  const escalateTo = (t: TicketRow, level: 'L2' | 'Trust & Safety') => {
    update(escalate(t, level, s.escalator, level === 'L2' ? s.l2Lead : 'Trust & Safety'));
    toast(`${t.id} escalated to ${level}. ${level === 'Trust & Safety' ? 'The safeguarding lead is paged.' : `${s.l2Lead} (L2) is notified.`}`);
  };
  const addNote = (t: TicketRow) =>
    setAsk({ title: 'Add internal note', body: 'Only staff see internal notes. They are kept with the ticket and in the audit log.', confirm: 'Add Note', tone: 'blue', onConfirm: (note) => {
      update({ ...t, notes: [note, ...t.notes] });
      toast('Note added.');
    } });
  const reassign = (t: TicketRow) => {
    const next = s.assignees[(s.assignees.indexOf(t.assignee ?? '') + 1) % s.assignees.length];
    update({ ...t, assignee: next, status: t.status === 'Open' ? 'In Progress' : t.status, notes: [`Reassigned to ${next}.`, ...t.notes] });
    toast(`${t.id} reassigned to ${next}.`);
  };
  const close = (t: TicketRow) =>
    setAsk({ title: `Close ${t.id}?`, body: 'Write the resolution. The user gets it with a satisfaction survey.', confirm: 'Close Ticket', tone: 'green', onConfirm: (note) => {
      const r = closeTicket(t, note);
      if (r.error) return toast(r.error);
      update(r.ticket);
      toast(`${t.id} resolved. CSAT survey sent to ${t.user}.`);
    } });
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  const counts = (label: string, base: number) => {
    const live: Readonly<Record<string, number>> = {
      Open: list.filter((t) => t.status === 'Open').length - s.tickets.filter((t) => t.status === 'Open').length,
      Escalated: list.filter((t) => t.status === 'Escalated').length - s.tickets.filter((t) => t.status === 'Escalated').length,
      Resolved: list.filter((t) => t.status === 'Resolved').length - s.tickets.filter((t) => t.status === 'Resolved').length,
      Unassigned: list.filter((t) => t.assignee === 'Unassigned').length - s.tickets.filter((t) => t.assignee === 'Unassigned').length,
    };
    return base + (live[label] ?? 0);
  };
  return { list, rows, shown, tab, setTab: pick, query, setQuery, category, setCategory, categories, priority, setPriority, priorities, status, setStatus, statuses, assignee, setAssignee, assignees, sort, setSort, sorts, page: p, pages, setPage, open, setOpenId, escalateTo, addNote, reassign, close, ask, setAsk, counts, selected, toggle };
}
type U = ReturnType<typeof useSupport>;

function SlaCell({ t, s }: { t: TicketRow; s: S }) {
  const st = slaState(t, s.NOW);
  const color = st.breached ? RED : st.minutesLeft < 60 ? Maple.warning : GREEN;
  return (
    <View style={styles.inline}>
      <Icon name={st.breached ? 'alert' : 'timer'} size={13} color={color} />
      <Text style={[styles.sla, { color }]}>{t.sla}</Text>
    </View>
  );
}

function ticketCols(u: U, s: S): readonly Column<TicketRow>[] {
  return [
    { label: '#', width: 24, render: (t) => <Cell small>{t.n}</Cell> },
    {
      label: 'Subject',
      flex: 1.8,
      render: (t) => (
        <View style={styles.inline}>
          <View style={[styles.dot, { backgroundColor: t.priority === 'High' ? RED : t.priority === 'Medium' ? Maple.warning : GREEN }]} />
          <Cell small>{t.subject}</Cell>
        </View>
      ),
    },
    { label: 'Category', flex: 0.95, render: (t) => <Cell small>{t.category}</Cell> },
    { label: 'User', flex: 1.4, render: (t) => <PersonCell avatar={t.avatar} name={t.user} size={22} /> },
    { label: 'Tenant / School', flex: 1.15, render: (t) => <Cell small>{t.tenant}</Cell> },
    { label: 'Priority', width: 70, render: (t) => <Pill label={t.priority} tone={PRIORITY_TONE[t.priority]} size={10.5} /> },
    { label: 'Status', width: 116, render: (t) => <Pill label={t.status} tone={STATUS_TONE[t.status]} size={10.5} /> },
    { label: 'Created', width: 80, render: (t) => <Cell small>{t.createdLabel}</Cell> },
    { label: 'SLA', width: 52, render: (t) => <SlaCell t={t} s={s} /> },
    {
      label: 'Assignee',
      width: 104,
      render: (t) => (t.assigneeAvatar ? <PersonCell avatar={t.assigneeAvatar} name={t.assignee ?? ''} size={20} /> : <Cell small>{t.assignee}</Cell>),
    },
  ];
}

function TicketPanel({ s, u, onClose }: { s: S; u: U; onClose?: () => void }) {
  const t = u.open;
  const [tab, setTab] = useState('Details');
  if (!t) return <Card style={styles.panel}><Text style={styles.small}>Pick a ticket to work on it.</Text></Card>;
  const sla = slaState(t, s.NOW);
  const resolved = t.status === 'Resolved';
  return (
    <Card style={styles.panel}>
      <View style={styles.inline}>
        <Text style={[styles.ticketId, styles.flex]}>{`#${t.id}`}</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close ticket panel" hitSlop={8}>
            <Icon name="close" size={18} color={BODY} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.inline}>
        <Text style={[styles.ticketTitle, styles.flex]}>{t.subject}</Text>
        <Pill label={t.status} tone={STATUS_TONE[t.status]} size={11} />
      </View>
      <Text style={styles.small}>{t.description}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={[{ label: 'Details' }, { label: `Conversation (4)` }, { label: `Internal Notes (${t.notes.length})` }, { label: 'Activity' }]} active={tab} onChange={setTab} size={12} dense style={styles.noWrap} />
      </ScrollView>
      {tab === 'Details' ? (
        <>
          <View style={styles.userCard}>
            <PhotoDot source={t.avatar} size={40} />
            <View style={styles.flex}>
              <Text style={styles.userName}>{t.user}</Text>
              <Text style={styles.tiny}>{t.email}</Text>
            </View>
            <OutlineBtn label="View User" small onPress={() => toast(`${t.user}: profile, classes, devices and past tickets.`)} />
          </View>
          <DetailRow label="Tenant / School" value={t.tenant} />
          <DetailRow label="Category" value={t.category} />
          <DetailRow label="Priority" value={t.priority} />
          <DetailRow label="Created" value={`${t.createdLabel}, 2026 (UTC+3)`} />
          <DetailRow label="SLA" value={`${t.slaHours} hour${t.slaHours === 1 ? '' : 's'} (${sla.breached ? sla.label : `Breached in ${sla.label.replace(' left', '')}`})`} valueColor={sla.breached || sla.minutesLeft < 90 ? RED : undefined} />
          <DetailRow label="Assignee" value={t.assignee === 'Unassigned' ? 'Unassigned' : `${t.assignee} (${t.level ?? 'Support'})`} />
          <DetailRow label="Status" value={t.status} />
          <Text style={styles.section}>Related Information</Text>
          <DetailRow label="Class" value={t.room ?? '—'} />
          <DetailRow label="Device" value="Chrome 118.0 (Mac OS)" />
          <DetailRow label="IP Address" value="197.210.12.5 (Kampala, Uganda)" />
        </>
      ) : null}
      {tab.startsWith('Conversation') ? <Text style={styles.small}>{`${t.user}: ${t.description}\n${s.supportAgent}: Thanks — we're looking into it now. Could you try again in 5 minutes?`}</Text> : null}
      {tab.startsWith('Internal Notes') ? (t.notes.length ? t.notes.map((n, i) => <Text key={i} style={styles.note}>{n}</Text>) : <Text style={styles.small}>No internal notes yet.</Text>) : null}
      {tab === 'Activity' ? <Text style={styles.small}>{`Created ${t.createdLabel}. ${t.level ? `Escalated to ${t.level}.` : ''} ${t.notes.length} notes.`}</Text> : null}
      {resolved ? (
        <Text style={styles.decided}>{t.notes[0] ?? 'Resolved.'}</Text>
      ) : (
        <>
          <Text style={styles.section}>Escalate</Text>
          <View style={styles.inline}>
            <OutlineBtn label="Escalate to L2" icon="arrowUp" small onPress={() => u.escalateTo(t, 'L2')} style={styles.flex} />
            <Pressable style={styles.tsBtn} onPress={() => u.escalateTo(t, 'Trust & Safety')} accessibilityRole="button" accessibilityLabel="Escalate to Trust & Safety">
              <Icon name="alert" size={14} color={RED} />
              <Text style={styles.tsText}>Escalate to Trust & Safety</Text>
            </Pressable>
          </View>
          <Text style={styles.section}>Actions</Text>
          <View style={styles.inline}>
            <OutlineBtn label="Add Note" icon="edit" small onPress={() => u.addNote(t)} style={styles.flex} />
            <OutlineBtn label="Reassign" icon="people" small onPress={() => u.reassign(t)} style={styles.flex} />
            <OutlineBtn label="Close Ticket" icon="check" small onPress={() => u.close(t)} style={styles.flex} />
          </View>
        </>
      )}
    </Card>
  );
}

function Charts({ s, phone = false }: { s: S; phone?: boolean }) {
  const v = s.volume;
  const total = s.categories.reduce((n, c) => n + c.count, 0);
  const slaPct = Math.round((s.sla.within / (s.sla.within + s.sla.breached)) * 100);
  return (
    <View style={[styles.row, phone && styles.column]}>
      <Panel
        title="Ticket Volume"
        right={
          <View style={styles.inline}>
            {(
              [
                ['Created', Maple.blue],
                ['Resolved', Maple.successText],
                ['Escalated', Maple.error],
              ] as const
            ).map(([l, c]) => (
              <View key={l} style={styles.inline}>
                <View style={[styles.dot, { backgroundColor: c }]} />
                <Text style={styles.tiny}>{l}</Text>
              </View>
            ))}
          </View>
        }
        style={[styles.block, !phone && styles.colVolume]}>
        <AreaChart
          labels={v.labels}
          series={[
            { name: 'Created', color: Maple.blue, values: v.created, fill: true, dots: true },
            { name: 'Resolved', color: Maple.successText, values: v.resolved, fill: true, dots: true },
            { name: 'Escalated', color: Maple.error, values: v.escalated, fill: true, dots: true },
          ]}
          max={40}
          height={phone ? 160 : 150}
        />
      </Panel>
      <Panel title="Tickets by Category" style={[styles.block, styles.flex]}>
        <View style={styles.donutRow}>
          <Donut slices={s.categories.map((c) => ({ value: c.count, color: c.color }))} size={phone ? 130 : 136} stroke={24}>
            <DonutLabel value={String(total)} caption="Tickets" size={20} />
          </Donut>
          <View style={styles.flex}>
            {s.categories.map((c) => (
              <View key={c.label} style={styles.catRow}>
                <View style={[styles.dot, { backgroundColor: c.color }]} />
                <Text style={[styles.catLabel, styles.flex]}>{c.label}</Text>
                <Text style={styles.catPct}>{`${c.pct}%`}</Text>
                <Text style={styles.catCount}>{c.count}</Text>
              </View>
            ))}
          </View>
        </View>
      </Panel>
      <Panel title="SLA Compliance" style={[styles.block, styles.flex]}>
        <View style={styles.donutRow}>
          <Donut
            slices={[
              { value: s.sla.within, color: Maple.successText },
              { value: s.sla.breached, color: Maple.error },
            ]}
            size={phone ? 130 : 140}
            stroke={18}>
            <DonutLabel value={`${slaPct}%`} caption="Within SLA" size={22} />
          </Donut>
          <View style={styles.flex}>
            <View style={styles.catRow}>
              <View style={[styles.dot, { backgroundColor: Maple.successText }]} />
              <Text style={[styles.catLabel, styles.flex]}>Within SLA</Text>
              <Text style={styles.slaNum}>{s.sla.within}</Text>
            </View>
            <View style={styles.catRow}>
              <View style={[styles.dot, { backgroundColor: Maple.error }]} />
              <Text style={[styles.catLabel, styles.flex]}>Breached</Text>
              <Text style={styles.slaNum}>{s.sla.breached}</Text>
            </View>
          </View>
        </View>
      </Panel>
    </View>
  );
}

function Filters({ u }: { u: U }) {
  return (
    <View style={styles.filters}>
      <Search placeholder="Search by ticket ID, user, email, subject, or keyword..." value={u.query} onChange={u.setQuery} style={styles.flex} />
      <CmdSelect value={u.category} options={u.categories} onChange={u.setCategory} width={136} label="Category" />
      <CmdSelect value={u.priority} options={u.priorities} onChange={u.setPriority} width={118} label="Priority" />
      <CmdSelect value={u.status} options={u.statuses} onChange={u.setStatus} width={110} label="Status" />
      <CmdSelect value={u.assignee} options={u.assignees} onChange={u.setAssignee} width={124} label="Assignee" />
      <CmdSelect value={u.sort} options={u.sorts} onChange={u.setSort} width={120} label="Sort" />
    </View>
  );
}

/** Maple Command › Security › Support & Escalations on the desktop reference. */
export function SupportDesk({ c }: { c: CommandData }) {
  const s = c.security;
  const u = useSupport(s);
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search users, schools, tickets, or reference IDs..." active="Security" sub="Support Escalations">
      <CmdHead
        icon="verified"
        section="Security"
        title="Support & Escalations"
        subtitle="Track, manage, and escalate user, teacher, school, and AI Copilot support requests with full visibility and SLA monitoring."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="Export" chevron onPress={() => exportMenu('Support tickets')} />
            <OutlineBtn icon="sync" onPress={() => toast('Tickets refreshed.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {s.supportStats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <Charts s={s} />
      <View style={styles.row}>
        <Card style={[styles.tableCard, styles.flex]}>
          <CountTabs tabs={s.supportTabs.map((t) => ({ label: t.label, count: u.counts(t.label, t.count), tone: t.label === 'Resolved' ? ('green' as const) : ('red' as const) }))} active={u.tab} onChange={u.setTab} size={12.5} dense style={styles.noWrap} />
          <Filters u={u} />
          <DataTable columns={ticketCols(u, s)} rows={u.rows} rowKey={(t) => t.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={(t) => u.setOpenId(t.id)} onRowPress={(t) => u.setOpenId(t.id)} activeKey={u.open?.id} />
          <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} tickets`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </Card>
        <View style={styles.side}>
          <TicketPanel s={s} u={u} onClose={() => u.setOpenId(null)} />
        </View>
      </View>
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandDesk>
  );
}

/** The phone version: counts, charts, the tickets as cards; tapping one opens it. */
export function SupportPhone({ c }: { c: CommandData }) {
  const s = c.security;
  const u = useSupport(s);
  const [view, setView] = useState<'list' | 'ticket'>('list');
  if (view === 'ticket') {
    return (
      <CommandPhone key="ticket" me={c.me}>
        <PageHead title="Ticket" subtitle="Details, SLA and escalation." phone onBack={() => setView('list')} />
        <TicketPanel s={s} u={u} />
        <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Support & Escalations" subtitle="Tickets, SLAs and escalations across Maple." phone />
      <KpiGrid items={s.supportStats} />
      <Charts s={s} phone />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={s.supportTabs.map((t) => ({ label: t.label, count: u.counts(t.label, t.count), tone: 'red' as const }))} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      <Search placeholder="Search tickets" value={u.query} onChange={u.setQuery} />
      {u.rows.map((t) => {
        const sla = slaState(t, s.NOW);
        return (
          <Pressable
            key={t.id}
            style={styles.card}
            onPress={() => {
              u.setOpenId(t.id);
              setView('ticket');
            }}
            accessibilityRole="button"
            accessibilityLabel={`${t.subject}, ${t.priority} priority, ${t.status}`}>
            <View style={styles.inline}>
              <Text style={[styles.userName, styles.flex]}>{t.subject}</Text>
              <Pill label={t.priority} tone={PRIORITY_TONE[t.priority]} size={11} />
            </View>
            <Text style={styles.small}>{`${t.user} • ${t.tenant} • ${t.category}`}</Text>
            <View style={styles.inline}>
              <Pill label={t.status} tone={STATUS_TONE[t.status]} size={11} />
              <Text style={[styles.small, styles.pushRight, sla.breached && { color: RED }]}>{sla.label}</Text>
            </View>
          </Pressable>
        );
      })}
      <PageStrip label={`${u.shown.length} tickets`} page={u.page} pages={u.pages} onPage={u.setPage} />
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  kpis: { flexDirection: 'row', gap: 12 },
  block: { gap: 10 },
  colVolume: { flex: 1.25 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pushRight: { marginLeft: 'auto' },
  noWrap: { flexWrap: 'nowrap' },
  small: { fontSize: 12, color: BODY },
  tiny: { fontSize: 11, color: BODY },
  section: { marginTop: 4, fontSize: 13.5, fontWeight: '800', color: NAVY },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sla: { fontSize: 12, fontWeight: '600' },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  catLabel: { fontSize: 12, color: NAVY },
  catPct: { width: 34, textAlign: 'right', fontSize: 12, color: BODY },
  catCount: { width: 30, textAlign: 'right', fontSize: 12, fontWeight: '600', color: NAVY },
  slaNum: { fontSize: 15, fontWeight: '800', color: NAVY },
  tableCard: { gap: 10, padding: 12 },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  side: { width: 320 },
  panel: { gap: 6, padding: 14 },
  ticketId: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  ticketTitle: { fontSize: 17, fontWeight: '800', color: NAVY },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  userName: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  note: { padding: 8, borderRadius: 8, backgroundColor: Maple.warningSoft, fontSize: 12, color: NAVY },
  decided: { padding: 10, borderRadius: 8, backgroundColor: Maple.successSoft, fontSize: 12.5, color: NAVY },
  tsBtn: { flex: 1.25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, height: 32, borderRadius: 8, borderWidth: 1, borderColor: Palette.red300e, backgroundColor: Maple.errorSoft },
  tsText: { fontSize: 12, fontWeight: '600', color: RED },
  card: { gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
});

