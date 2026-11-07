import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CmdSelect, CmdStat, DetailRow, Flag, KpiGrid, OutlineBtn, PageStrip, Panel, PersonCell, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { ReasonModal, type ReasonAsk } from '@/features/command/kit/ReasonModal';
import { buildChain, canExport, type Chained, maskEmail, maskIp, verifyChain } from '@/features/command/logic/security';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, RED, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Search, useChoice } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { AuditEvent, Severity } from '@/mock/command-center/security';
import { Maple } from '@/constants/maple';

type S = CommandData['security'];
const PER_PAGE = 15;
type Ev = Chained<AuditEvent>;
const SEV_TONE: Readonly<Record<Severity, Tone>> = { Critical: 'red', High: 'orange', Medium: 'orange', Low: 'green', Info: 'blue' };

function useAudit(s: S, me: { name: string; role: string }) {
  // The chain is built oldest first; the screen shows newest first.
  const [raw, setRaw] = useState<readonly AuditEvent[]>(() => [...s.events].reverse());
  const chain = useMemo(() => buildChain(raw), [raw]);
  const list = useMemo(() => [...chain].reverse(), [chain]);
  const [query, setQuery] = useState('');
  const [type, setType, types] = useChoice(['All Event Types', 'User Management', 'Authentication', 'Data Export', 'Data Access', 'Security', 'Payments', 'Curriculum']);
  const [user, setUser, users] = useChoice(['All Users', ...s.auditUsers]);
  const [tenant, setTenant, tenants] = useChoice(['All Tenants', ...s.auditTenants]);
  const [severity, setSeverity, severities] = useChoice(['All Severity', 'Critical', 'High', 'Medium', 'Low', 'Info']);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(s.events[0].id);
  const [unmasked, setUnmasked] = useState(false);
  const [ask, setAsk] = useState<ReasonAsk | null>(null);
  const [integrity, setIntegrity] = useState<string>('');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (e) =>
        (type === 'All Event Types' || e.type === type) &&
        (user === 'All Users' || e.user === user) &&
        (tenant === 'All Tenants' || e.tenant === tenant) &&
        (severity === 'All Severity' || e.severity === severity) &&
        (!q || `${e.user} ${e.email} ${e.ip} ${e.action} ${e.id} ${e.resource}`.toLowerCase().includes(q)),
    );
  }, [list, query, type, user, tenant, severity]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const open = list.find((e) => e.id === openId) ?? null;

  /** Every sensitive view or export is itself an audit event, appended to the chain. */
  const record = (action: string, resource: string) => {
    setRaw((prev) => {
      const n = prev.length + 1;
      return [...prev, { n, id: `log_${n}`, at: new Date().toISOString(), when: 'Just now', user: me.name, email: 'mary.n@maple.com', role: 'Global Admin', tenant: '-', type: 'Security', action, resource, ip: '197.210.12.5', severity: 'High', avatar: s.events[0].avatar }];
    });
  };
  const clear = () => {
    setQuery('');
    setType('All Event Types');
    setUser('All Users');
    setTenant('All Tenants');
    setSeverity('All Severity');
    setPage(1);
  };
  const verify = () => {
    const r = verifyChain(chain);
    setIntegrity(r.ok ? `Chain verified: ${chain.length} records, last hash ${chain[chain.length - 1].hash}.` : `Chain broken at ${r.brokenAt}. Records from there on cannot be trusted.`);
    toast(r.ok ? 'Integrity check passed. No record has been changed or removed.' : `Tampering detected at ${r.brokenAt}.`);
  };
  const reveal = () => {
    if (unmasked) return setUnmasked(false);
    setAsk({
      title: 'Show unmasked emails and IP addresses?',
      body: 'Personal data is masked by default. Revealing it is logged with your reason and visible to other Security admins.',
      confirm: 'Reveal',
      tone: 'orange',
      onConfirm: (reason) => {
        setUnmasked(true);
        record('Viewed unmasked audit data', reason);
      },
    });
  };
  const exportLogs = () =>
    setAsk({
      title: 'Export audit logs',
      body: 'Exports are restricted, masked, watermarked with your name and expire in 24 hours. Say why you need it.',
      confirm: 'Export',
      tone: 'blue',
      onConfirm: (reason) => {
        const ok = canExport(me.role, reason);
        if (!ok.ok) return toast(ok.why ?? 'Export not allowed.');
        record('Exported audit logs', `${shown.length} events`);
        toast(`Export of ${shown.length} events is being prepared. The download link expires in 24 hours.`);
      },
    });
  const email = (e: string) => (unmasked ? e : maskEmail(e));
  const ip = (x: string) => (unmasked ? x : maskIp(x));
  return { list, rows, shown, query, setQuery, type, setType, types, user, setUser, users, tenant, setTenant, tenants, severity, setSeverity, severities, clear, page: p, pages, setPage, open, setOpenId, unmasked, reveal, exportLogs, ask, setAsk, verify, integrity, email, ip };
}
type U = ReturnType<typeof useAudit>;

function eventCols(u: U): readonly Column<Ev>[] {
  return [
    { label: '#', width: 30, render: (e) => <Cell small>{e.n}</Cell> },
    { label: 'Date & Time', width: 112, render: (e) => <Cell small>{e.when}</Cell> },
    { label: 'User', flex: 1, render: (e) => <PersonCell avatar={e.avatar} name={e.user} size={22} /> },
    { label: 'Role', flex: 0.9, render: (e) => <Cell small>{e.role}</Cell> },
    { label: 'Tenant / School', flex: 1.1, render: (e) => <Cell small>{e.tenant}</Cell> },
    { label: 'Event Type', flex: 1.05, render: (e) => <Cell small>{e.type}</Cell> },
    { label: 'Action', flex: 1.1, render: (e) => <Cell small>{e.action}</Cell> },
    { label: 'Resource', flex: 0.9, render: (e) => <Cell small>{e.resource.includes('@') ? u.email(e.resource) : e.resource}</Cell> },
    { label: 'IP Address', width: 92, render: (e) => <Cell small>{u.ip(e.ip)}</Cell> },
    { label: 'Severity', width: 78, render: (e) => <Pill label={e.severity} tone={SEV_TONE[e.severity]} size={10.5} /> },
  ];
}

function Details({ s, u, onClose }: { s: S; u: U; onClose?: () => void }) {
  const e = u.open;
  if (!e) return <Card style={styles.panel}><Text style={styles.small}>Pick an event to see its details.</Text></Card>;
  const d = s.eventDetail;
  const isRef = e.n === 1;
  return (
    <Card style={styles.panel}>
      <View style={styles.inline}>
        <Text style={[styles.panelTitle, styles.flex]}>Event Details</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close details" hitSlop={8}>
            <Icon name="close" size={18} color={BODY} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.inline}>
        <View style={[styles.sevIcon, { backgroundColor: e.severity === 'Critical' ? Maple.errorSoft : Maple.blueSoft }]}>
          <Icon name="shield" size={20} color={e.severity === 'Critical' ? RED : BLUE} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.eventTitle}>{e.action}</Text>
          <Text style={styles.small}>{e.type}</Text>
        </View>
        <Pill label={e.severity} tone={SEV_TONE[e.severity]} size={11} />
      </View>
      <DetailRow label="Date & Time" value={isRef ? d.time : `${e.when} (UTC+3)`} />
      <DetailRow label="User">
        <PersonCell avatar={e.avatar} name={`${e.user} (${u.email(e.email)})`} size={18} />
      </DetailRow>
      <DetailRow label="Role" value={e.role === 'Global Admin' ? 'Global Administrator' : e.role} />
      <DetailRow label="Tenant" value={e.tenant === '-' ? '- (Platform)' : e.tenant} />
      <DetailRow label="IP Address">
        <View style={styles.inline}>
          <Flag code="UG" size={13} />
          <Text style={styles.detailValue}>{`${u.ip(e.ip)}${isRef ? ` (${d.ipPlace})` : ''}`}</Text>
        </View>
      </DetailRow>
      <DetailRow label="Resource" value={e.resource.includes('@') ? u.email(e.resource) : e.resource} />
      <DetailRow label="Action" value={isRef ? `Changed role from ${d.change.before} to ${d.change.after}` : e.action} />
      <DetailRow label="Reference ID" value={isRef ? d.reference : `${e.id}_${e.hash}`} />
      <DetailRow label="Record hash" value={`${e.hash} (prev ${e.prevHash})`} />
      <DetailRow label="User Agent" value={d.agent} />
      {isRef ? (
        <>
          <DetailRow label="Details" value={d.details} />
          <View style={styles.diff}>
            <Text style={styles.diffHead}>{`${d.change.field}: before → after`}</Text>
            <View style={styles.inline}>
              <Text style={styles.before}>{d.change.before}</Text>
              <Icon name="arrowRight" size={14} color={BODY} />
              <Text style={styles.after}>{d.change.after}</Text>
            </View>
          </View>
          <Text style={styles.section}>Change Timeline</Text>
          {d.timeline.map((t, i) => (
            <View key={t.time} style={styles.timeline}>
              <View style={[styles.tlDot, i === d.timeline.length - 1 && styles.tlDotLast]} />
              <Text style={styles.tlTime}>{t.time}</Text>
              <View style={styles.flex}>
                <Text style={styles.tlText}>{t.text}</Text>
                <Text style={styles.tiny}>{t.by}</Text>
              </View>
            </View>
          ))}
          <View style={styles.inline}>
            <Text style={[styles.section, styles.flex]}>Related Events</Text>
            <Pressable
              onPress={() => {
                u.setQuery('john.doe');
                toast('Showing every event about John Doe.');
              }}
              accessibilityRole="link"
              accessibilityLabel="View all related events">
              <Text style={styles.link}>View All</Text>
            </Pressable>
          </View>
          {d.related.map((r) => (
            <View key={r.when} style={styles.related}>
              <Icon name="calendar" size={14} color={BLUE} />
              <Text style={styles.tiny}>{r.when}</Text>
              <View style={styles.flex}>
                <Text style={styles.tlText}>{r.text}</Text>
                <Text style={styles.tiny}>{r.who.includes('@') ? u.email(r.who) : r.who}</Text>
              </View>
              <Pill label="Info" tone="blue" size={10} />
            </View>
          ))}
        </>
      ) : null}
      <Text style={styles.lock}>Read-only. Audit records cannot be edited or deleted; corrections are new events that reference this one.</Text>
    </Card>
  );
}

function Filters({ u }: { u: U }) {
  return (
    <View style={styles.filters}>
      <Search placeholder="Search by user, email, IP address, action, or reference ID..." value={u.query} onChange={u.setQuery} style={styles.flex} />
      <CmdSelect value={u.type} options={u.types} onChange={u.setType} width={140} label="Event type" />
      <CmdSelect value={u.user} options={u.users} onChange={u.setUser} width={120} label="User" />
      <CmdSelect value={u.tenant} options={u.tenants} onChange={u.setTenant} width={140} label="Tenant" />
      <CmdSelect value={u.severity} options={u.severities} onChange={u.setSeverity} width={120} label="Severity" />
      <Pressable onPress={u.clear} accessibilityRole="button" accessibilityLabel="Clear filters" hitSlop={6}>
        <Text style={styles.link}>Clear</Text>
      </Pressable>
    </View>
  );
}

/** Maple Command › Security › Audit Logs on the desktop reference. */
export function AuditDesk({ c }: { c: CommandData }) {
  const s = c.security;
  const u = useAudit(s, c.me);
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search users, schools, incidents, audit logs, or reference IDs..." active="Security" sub="Audit Logs">
      <CmdHead
        icon="verified"
        section="Security"
        title="Audit Logs"
        subtitle="Complete, immutable record of all privileged actions, data access, and system events across the platform."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="Export" chevron onPress={u.exportLogs} />
            <OutlineBtn icon="sync" onPress={u.verify} />
          </>
        }
      />
      <View style={styles.kpis}>
        {s.auditStats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <Card style={styles.filterCard}>
        <Filters u={u} />
      </Card>
      <View style={styles.row}>
        <Card style={[styles.tableCard, styles.flex]}>
          <View style={styles.inline}>
            <Text style={[styles.panelTitle, styles.flex]}>{`Audit Events (${u.shown.length.toLocaleString('en-US')})`}</Text>
            <OutlineBtn label={u.unmasked ? 'Mask data' : 'Unmask'} icon={u.unmasked ? 'eyeOff' : 'eye'} small onPress={u.reveal} />
            <OutlineBtn label="Verify integrity" icon="verified" small onPress={u.verify} />
            <OutlineBtn label="Columns" icon="columns" small onPress={() => toast('Choose columns: user agent, reference ID, correlation ID, hash.')} />
          </View>
          {u.integrity ? (
            <View style={[styles.banner, u.integrity.startsWith('Chain verified') ? styles.bannerOk : styles.bannerBad]}>
              <Icon name={u.integrity.startsWith('Chain verified') ? 'verified' : 'alert'} size={15} color={u.integrity.startsWith('Chain verified') ? GREEN : RED} />
              <Text style={styles.bannerText}>{u.integrity}</Text>
            </View>
          ) : null}
          <DataTable columns={eventCols(u)} rows={u.rows} rowKey={(e) => e.id} check compact menu onMenu={(e) => u.setOpenId(e.id)} onRowPress={(e) => u.setOpenId(e.id)} activeKey={u.open?.id} />
          <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} events`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </Card>
        <View style={styles.side}>
          <Details s={s} u={u} onClose={() => u.setOpenId(null)} />
        </View>
      </View>
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandDesk>
  );
}

/** The phone version: counts, search, the events as rows; tapping one shows its details. */
export function AuditPhone({ c }: { c: CommandData }) {
  const s = c.security;
  const u = useAudit(s, c.me);
  const [view, setView] = useState<'list' | 'event'>('list');
  if (view === 'event') {
    return (
      <CommandPhone key="event" me={c.me}>
        <PageHead title="Audit Event" subtitle="Read-only record with its change history." phone onBack={() => setView('list')} />
        <Details s={s} u={u} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Audit Logs" subtitle="Immutable record of privileged actions and data access." phone />
      <KpiGrid items={s.auditStats.slice(0, 4)} />
      <Search placeholder="Search user, IP, action or ID" value={u.query} onChange={u.setQuery} />
      <View style={styles.inline}>
        <View style={styles.flex}>
          <CmdSelect value={u.type} options={u.types} onChange={u.setType} label="Event type" />
        </View>
        <View style={styles.flex}>
          <CmdSelect value={u.severity} options={u.severities} onChange={u.setSeverity} label="Severity" />
        </View>
      </View>
      <View style={styles.inline}>
        <OutlineBtn label="Verify integrity" icon="verified" small onPress={u.verify} style={styles.flex} />
        <OutlineBtn label="Export" icon="download" small onPress={u.exportLogs} style={styles.flex} />
      </View>
      {u.integrity ? <Text style={styles.small}>{u.integrity}</Text> : null}
      <Panel title={`Events (${u.shown.length})`} style={styles.listPanel}>
        {u.rows.map((e) => (
          <Pressable
            key={e.id}
            style={styles.eventRow}
            onPress={() => {
              u.setOpenId(e.id);
              setView('event');
            }}
            accessibilityRole="button"
            accessibilityLabel={`${e.action} by ${e.user}, ${e.severity}`}>
            <View style={styles.flex}>
              <Text style={styles.tlText}>{e.action}</Text>
              <Text style={styles.tiny}>{`${e.user} • ${e.type} • ${e.when}`}</Text>
            </View>
            <Pill label={e.severity} tone={SEV_TONE[e.severity]} size={10.5} />
          </Pressable>
        ))}
      </Panel>
      <PageStrip label={`${u.shown.length} events`} page={u.page} pages={u.pages} onPage={u.setPage} />
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  small: { fontSize: 12, color: BODY },
  tiny: { fontSize: 10.5, color: BODY },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  panelTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  section: { marginTop: 4, fontSize: 14, fontWeight: '800', color: NAVY },
  filterCard: { padding: 10 },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tableCard: { gap: 10, padding: 12 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8 },
  bannerOk: { backgroundColor: Maple.successSoft },
  bannerBad: { backgroundColor: Maple.errorSoft },
  bannerText: { flex: 1, fontSize: 12, color: NAVY },
  side: { width: 356 },
  panel: { gap: 6, padding: 14 },
  sevIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  eventTitle: { fontSize: 15, fontWeight: '800', color: NAVY },
  detailValue: { fontSize: 12.5, color: NAVY },
  diff: { gap: 4, padding: 10, borderRadius: 8, backgroundColor: Maple.blueSoft },
  diffHead: { fontSize: 11.5, fontWeight: '700', color: BODY },
  before: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: Maple.errorSoft, fontSize: 12, color: Maple.error, textDecorationLine: 'line-through' },
  after: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: Maple.successSoft, fontSize: 12, fontWeight: '600', color: Maple.successText },
  timeline: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 3 },
  tlDot: { width: 10, height: 10, marginTop: 3, borderRadius: 5, borderWidth: 2, borderColor: BLUE, backgroundColor: WHITE },
  tlDotLast: { borderColor: Maple.blue },
  tlTime: { width: 56, fontSize: 11.5, color: BODY },
  tlText: { fontSize: 12, fontWeight: '600', color: NAVY },
  related: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, borderBottomWidth: 1, borderColor: LINE },
  lock: { marginTop: 6, padding: 8, borderRadius: 8, backgroundColor: Maple.blueSoft, fontSize: 11.5, color: BODY },
  listPanel: { gap: 4 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: LINE },
});
