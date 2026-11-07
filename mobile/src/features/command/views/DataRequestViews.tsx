import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CmdSelect, CmdStat, CountTabs, DetailRow, Flag, KpiGrid, OutlineBtn, PageStrip, PersonCell, PrimaryBtn, RangeBox, exportMenu } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { ReasonModal, type ReasonAsk } from '@/features/command/kit/ReasonModal';
import { canRelease, decideRequest, deletionPlan, dueState } from '@/features/command/logic/security';
import { Card, IconTile, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, RED, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Search, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { RequestRow } from '@/mock/command-center/security';
import { Maple } from '@/constants/maple';
import { Palette } from '@/constants/palette';

type S = CommandData['security'];
const PER_PAGE = 12;
const TYPE_STYLE: Readonly<Record<RequestRow['type'], { tone: Tone; icon: 'download' | 'trash' | 'key' | 'edit' }>> = {
  Export: { tone: 'blue', icon: 'download' },
  Deletion: { tone: 'red', icon: 'trash' },
  Access: { tone: 'green', icon: 'key' },
  Correction: { tone: 'purple', icon: 'edit' },
};
const STATUS_TONE: Readonly<Record<RequestRow['status'], Tone>> = { Pending: 'orange', Processing: 'blue', 'Under Review': 'red', Completed: 'green', Rejected: 'red' };

function useRequests(s: S) {
  const [list, setList] = useState<readonly RequestRow[]>(s.requests);
  const [tab, setTab] = useState(s.requestTabs[0].label);
  const [query, setQuery] = useState('');
  const [type, setType, types] = useChoice(['All Request Types', 'Export', 'Deletion', 'Access', 'Correction']);
  const [status, setStatus, statuses] = useChoice(['All Status', 'Pending', 'Processing', 'Under Review', 'Completed', 'Rejected']);
  const [tenant, setTenant, tenants] = useChoice(['All Tenants / Schools', ...s.requestTenants]);
  const [country, setCountry, countries] = useChoice(['All Countries', 'Uganda', 'Kenya', 'Nigeria', 'Ghana', 'Zambia']);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(s.requests[0].id);
  const [ask, setAsk] = useState<ReasonAsk | null>(null);
  const [selected, toggle] = useSelection();
  const tabType = s.requestTabs.find((t) => t.label === tab)?.type;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter(
      (r) =>
        (tab === 'All Requests' || (tab === 'Other' ? false : r.type === tabType)) &&
        (type === 'All Request Types' || r.type === type) &&
        (status === 'All Status' || r.status === status) &&
        (tenant === 'All Tenants / Schools' || r.tenant === tenant) &&
        (country === 'All Countries' || r.country === country) &&
        (!q || `${r.name} ${r.email} ${r.tenant} ${r.id} ${r.reason}`.toLowerCase().includes(q)),
    );
  }, [list, tab, tabType, query, type, status, tenant, country]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const open = list.find((r) => r.id === openId) ?? null;
  const update = (r: RequestRow) => setList((prev) => prev.map((x) => (x.id === r.id ? r : x)));

  const approve = (r: RequestRow) => {
    const res = decideRequest(r, 'approve', { now: s.NOW });
    if (res.error) return toast(res.error);
    update(res.request);
    toast(
      res.request.status === 'Completed'
        ? `${r.id} done. Secure download link sent to ${r.email}; it expires ${new Date(res.request.linkExpires ?? s.NOW).toUTCString().slice(5, 22)} UTC.`
        : `${r.id}: deletion started. Kept by law: ${(res.request.retained ?? []).join(', ') || 'nothing'}.`,
    );
  };
  const reject = (r: RequestRow) =>
    setAsk({ title: `Reject ${r.id}?`, body: 'The requester is told your reason. Use this for requests that fail verification or policy.', confirm: 'Reject Request', tone: 'red', onConfirm: (note) => {
      const res = decideRequest(r, 'reject', { now: s.NOW, note });
      if (res.error) return toast(res.error);
      update(res.request);
      toast(`${r.id} rejected; ${r.name} has been told why.`);
    } });
  const moreInfo = (r: RequestRow) =>
    setAsk({ title: `Ask ${r.name} for more information`, body: 'Say what you need (ID document, proof of guardianship). The deadline pauses until they reply where the law allows.', confirm: 'Send Request', tone: 'blue', onConfirm: (note) => {
      const res = decideRequest(r, 'requestInfo', { now: s.NOW, note });
      update(res.request);
      toast(`Request sent to ${r.email}.`);
    } });
  const verify = (r: RequestRow, what: 'identity' | 'guardian') => {
    update(what === 'identity' ? { ...r, identityVerified: true } : { ...r, guardianVerified: true });
    toast(what === 'identity' ? `${r.name}'s identity verified against their ID and account.` : `${r.name} verified as parent or guardian of the learner (birth certificate and school record).`);
  };
  const pick = (t: string) => {
    setTab(t);
    setPage(1);
  };
  const clear = () => {
    setQuery('');
    setType('All Request Types');
    setStatus('All Status');
    setTenant('All Tenants / Schools');
    setCountry('All Countries');
  };
  return { list, rows, shown, tab, setTab: pick, query, setQuery, type, setType, types, status, setStatus, statuses, tenant, setTenant, tenants, country, setCountry, countries, clear, page: p, pages, setPage, open, setOpenId, approve, reject, moreInfo, verify, ask, setAsk, selected, toggle };
}
type U = ReturnType<typeof useRequests>;

function TypePill({ t }: { t: RequestRow['type'] }) {
  const st = TYPE_STYLE[t];
  return <Pill label={t} tone={st.tone} icon={st.icon} size={10.5} />;
}

function requestCols(u: U, s: S): readonly Column<RequestRow>[] {
  return [
    { label: '#', width: 26, render: (r) => <Cell small>{r.n}</Cell> },
    { label: 'Requester', flex: 1.7, render: (r) => <PersonCell avatar={r.avatar} name={r.name} sub={r.email} size={26} /> },
    { label: 'Type', width: 90, render: (r) => <TypePill t={r.type} /> },
    { label: 'Subject / Scope', flex: 0.9, render: (r) => <Cell small lines={2}>{r.subject}</Cell> },
    { label: 'Reason', flex: 0.9, render: (r) => <Cell small lines={2}>{r.reason}</Cell> },
    { label: 'Tenant / School', flex: 0.95, render: (r) => <Cell small lines={2}>{r.tenant}</Cell> },
    {
      label: 'Submitted',
      width: 82,
      render: (r) => (
        <View>
          <Cell small>{r.submitted.slice(0, 12)}</Cell>
          <Cell small>{r.submitted.slice(13)}</Cell>
        </View>
      ),
    },
    {
      label: 'Due Date',
      width: 80,
      render: (r) => {
        const d = dueState(r.due, s.TODAY);
        return <Cell small color={d.overdue ? RED : undefined}>{new Date(`${r.due}T00:00:00Z`).toUTCString().slice(5, 16).replace(/^0/, '')}</Cell>;
      },
    },
    { label: 'Status', width: 96, render: (r) => <Pill label={r.status} tone={STATUS_TONE[r.status]} size={10.5} /> },
    { label: 'Actions', width: 62, render: (r) => <OutlineBtn label="View" small onPress={() => u.setOpenId(r.id)} /> },
  ];
}

function RequestPanel({ s, u, onClose }: { s: S; u: U; onClose?: () => void }) {
  const r = u.open;
  const [tab, setTab] = useState('Overview');
  if (!r) return <Card style={styles.panel}><Text style={styles.small}>Pick a request to review it.</Text></Card>;
  const due = dueState(r.due, s.TODAY);
  const release = canRelease(r);
  const done = r.status === 'Completed' || r.status === 'Rejected';
  const plan = r.type === 'Deletion' ? deletionPlan(r.scope) : null;
  return (
    <Card style={styles.panel}>
      <View style={styles.inline}>
        <Text style={[styles.panelTitle, styles.flex]}>Request Details</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close details" hitSlop={8}>
            <Icon name="close" size={18} color={BODY} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.who}>
        <PersonCell avatar={r.avatar} name={r.name} sub={r.email} size={54} />
        <Pill label={r.status} tone={STATUS_TONE[r.status]} size={11} />
      </View>
      <View style={styles.inline}>
        <Flag code={r.flag} size={13} />
        <Text style={styles.small}>{r.country}</Text>
        <Text style={[styles.small, styles.pushRight]}>{`Request ID: ${r.id}`}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={['Overview', 'Data Scope', 'Verification', 'Activity', 'Notes'].map((label) => ({ label }))} active={tab} onChange={setTab} size={12} dense style={styles.noWrap} />
      </ScrollView>
      {tab === 'Overview' ? (
        <>
          <Text style={styles.section}>Request Information</Text>
          <DetailRow label="Type">
            <TypePill t={r.type} />
          </DetailRow>
          <DetailRow label="Submitted" value={`${r.submitted} (UTC+3)`} />
          <DetailRow label="Due Date" value={`${new Date(`${r.due}T00:00:00Z`).toUTCString().slice(5, 16)} (${due.label})`} valueColor={due.overdue ? RED : undefined} />
          <DetailRow label="Reason" value={r.reason} />
          <DetailRow label="Tenant / School" value={r.tenant} />
          <DetailRow label="Requested By" value={r.requestedBy} />
          <DetailRow label="IP Address" value={r.ip} />
          <DetailRow label="Reference" value={r.reference} />
          {r.notes ? <DetailRow label="Notes" value={r.notes} /> : null}
        </>
      ) : null}
      {tab === 'Overview' || tab === 'Data Scope' ? (
        <>
          <Text style={styles.section}>Request Scope</Text>
          <View style={styles.scope}>
            {r.scope.map((item, i) => {
              const kept = plan?.retain.find((x) => x.item === item);
              return (
                <View key={item} style={styles.scopeItem}>
                  <IconTile icon={['person', 'people', 'cap', 'chat', 'wallet'][i % 5] as 'person'} tone={kept ? 'grey' : (['orange', 'green', 'purple', 'blue'] as const)[i % 4]} size={28} radius={8} iconSize={15} />
                  <View style={styles.flex}>
                    <Text style={styles.scopeTitle}>{item}</Text>
                    <Text style={styles.tiny}>{kept ? `Kept: ${kept.why}` : s.scopeInfo[item] ?? ''}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      ) : null}
      {tab === 'Verification' ? (
        <View style={styles.checks}>
          <View style={styles.inline}>
            <Icon name={r.identityVerified ? 'verified' : 'alert'} size={16} color={r.identityVerified ? GREEN : RED} />
            <Text style={[styles.body, styles.flex]}>{r.identityVerified ? 'Requester identity verified' : 'Requester identity not verified'}</Text>
            {!r.identityVerified ? <OutlineBtn label="Verify" small onPress={() => u.verify(r, 'identity')} /> : null}
          </View>
          {r.minor ? (
            <View style={styles.inline}>
              <Icon name={r.guardianVerified ? 'verified' : 'alert'} size={16} color={r.guardianVerified ? GREEN : RED} />
              <Text style={[styles.body, styles.flex]}>{r.guardianVerified ? 'Parent / guardian verified' : 'Involves a minor: guardian not yet verified'}</Text>
              {!r.guardianVerified ? <OutlineBtn label="Verify guardian" small onPress={() => u.verify(r, 'guardian')} /> : null}
            </View>
          ) : (
            <Text style={styles.small}>No minors involved.</Text>
          )}
        </View>
      ) : null}
      {tab === 'Activity' ? <Text style={styles.small}>{`Submitted ${r.submitted}. Identity check ${r.identityVerified ? 'passed' : 'pending'}. ${r.linkExpires ? `Download link expires ${new Date(r.linkExpires).toUTCString().slice(5, 22)} UTC.` : ''}`}</Text> : null}
      {tab === 'Notes' ? <Text style={styles.small}>{r.note ?? r.notes ?? 'No notes yet.'}</Text> : null}
      {!done && !release.ok ? (
        <View style={styles.blocker}>
          <Icon name="lock" size={15} color={Maple.warningText} />
          <Text style={styles.blockerText}>{release.reason}</Text>
        </View>
      ) : null}
      {done ? (
        <Text style={styles.decided}>{r.status === 'Completed' ? `Completed${r.linkExpires ? `. The secure link expires ${new Date(r.linkExpires).toUTCString().slice(5, 22)} UTC` : ''}.` : `Rejected${r.note ? `: “${r.note}”` : ''}.`}</Text>
      ) : (
        <View style={styles.decide}>
          <PrimaryBtn label={r.type === 'Deletion' ? 'Approve & Delete' : r.type === 'Export' ? 'Approve & Process Export' : 'Approve'} tone="green" onPress={() => u.approve(r)} style={styles.approve} />
          <OutlineBtn label="Request More Info" small onPress={() => u.moreInfo(r)} style={styles.flex} />
          <Pressable style={styles.rejectBtn} onPress={() => u.reject(r)} accessibilityRole="button" accessibilityLabel="Reject Request">
            <Text style={styles.rejectText}>Reject Request</Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}

function Filters({ u, range, setRange, ranges }: { u: U; range: string; setRange: (v: string) => void; ranges: readonly string[] }) {
  return (
    <View style={styles.filters}>
      <Search placeholder="Search by name, email, school, request ID, or reason..." value={u.query} onChange={u.setQuery} style={styles.flex} />
      <CmdSelect value={u.type} options={u.types} onChange={u.setType} width={152} label="Type" />
      <CmdSelect value={u.status} options={u.statuses} onChange={u.setStatus} width={110} label="Status" />
      <CmdSelect value={u.tenant} options={u.tenants} onChange={u.setTenant} width={172} label="Tenant" />
      <CmdSelect value={u.country} options={u.countries} onChange={u.setCountry} width={124} label="Country" />
      <RangeBox value={range} options={ranges} onChange={setRange} width={250} />
      <Pressable onPress={u.clear} accessibilityRole="button" accessibilityLabel="Clear filters" hitSlop={6}>
        <Text style={styles.link}>Clear</Text>
      </Pressable>
    </View>
  );
}

/** Maple Command › Security › Data Requests on the desktop reference. */
export function DataRequestsDesk({ c }: { c: CommandData }) {
  const s = c.security;
  const u = useRequests(s);
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search users, schools, incidents, data requests, or reference IDs..." active="Security" sub="Data Requests">
      <CmdHead
        icon="doc"
        section="Security"
        title="Data Requests"
        subtitle="Manage user data access, export, deletion, and other privacy requests (GDPR, local data protection, and platform policies)."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="Export" chevron onPress={() => exportMenu('Data requests register')} />
            <OutlineBtn icon="sync" onPress={() => toast('Requests refreshed.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {s.requestStats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <Card style={styles.filterCard}>
        <CountTabs tabs={s.requestTabs.map((t) => ({ label: t.label, count: t.count, tone: 'red' as const }))} active={u.tab} onChange={u.setTab} size={13} dense style={styles.noWrap} />
        <Filters u={u} range={range} setRange={setRange} ranges={c.ranges} />
      </Card>
      <View style={styles.row}>
        <Card style={[styles.tableCard, styles.flex]}>
          <View style={styles.inline}>
            <Text style={[styles.panelTitle, styles.flex]}>{`Data Requests (${u.shown.length})`}</Text>
            <OutlineBtn label="Columns" icon="columns" small onPress={() => toast('Choose columns: verification, retention holds, link expiry.')} />
          </View>
          <DataTable columns={requestCols(u, s)} rows={u.rows} rowKey={(r) => r.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={(r) => u.setOpenId(r.id)} onRowPress={(r) => u.setOpenId(r.id)} activeKey={u.open?.id} />
          <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} requests`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </Card>
        <View style={styles.side}>
          <RequestPanel s={s} u={u} onClose={() => u.setOpenId(null)} />
        </View>
      </View>
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandDesk>
  );
}

/** The phone version: counts, request tabs, the requests as cards; tapping one opens its review. */
export function DataRequestsPhone({ c }: { c: CommandData }) {
  const s = c.security;
  const u = useRequests(s);
  const [view, setView] = useState<'list' | 'request'>('list');
  if (view === 'request') {
    return (
      <CommandPhone key="request" me={c.me}>
        <PageHead title="Data Request" subtitle="Verify, check the scope, then decide." phone onBack={() => setView('list')} />
        <RequestPanel s={s} u={u} />
        <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Data Requests" subtitle="Privacy requests: export, access, correction and deletion." phone />
      <KpiGrid items={s.requestStats.slice(0, 4)} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={s.requestTabs.map((t) => ({ label: t.label, count: t.count, tone: 'red' as const }))} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      <Search placeholder="Search name, school or ID" value={u.query} onChange={u.setQuery} />
      {u.rows.map((r) => {
        const d = dueState(r.due, s.TODAY);
        return (
          <Pressable
            key={r.id}
            style={styles.card}
            onPress={() => {
              u.setOpenId(r.id);
              setView('request');
            }}
            accessibilityRole="button"
            accessibilityLabel={`${r.name}, ${r.type} request, ${r.status}, ${d.label}`}>
            <View style={styles.inline}>
              <View style={styles.flex}>
                <PersonCell avatar={r.avatar} name={r.name} sub={r.tenant} size={38} />
              </View>
              <TypePill t={r.type} />
            </View>
            <Text style={styles.small}>{`${r.subject} • ${r.reason}`}</Text>
            <View style={styles.inline}>
              <Pill label={r.status} tone={STATUS_TONE[r.status]} size={11} />
              <Text style={[styles.small, styles.pushRight, d.overdue && styles.red]}>{d.label}</Text>
            </View>
          </Pressable>
        );
      })}
      <PageStrip label={`${u.shown.length} requests`} page={u.page} pages={u.pages} onPage={u.setPage} />
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  pushRight: { marginLeft: 'auto' },
  noWrap: { flexWrap: 'nowrap' },
  small: { fontSize: 12, color: BODY },
  tiny: { fontSize: 10.5, color: BODY },
  body: { fontSize: 12.5, color: NAVY },
  red: { color: RED },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  panelTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  section: { marginTop: 4, fontSize: 14, fontWeight: '800', color: NAVY },
  filterCard: { gap: 8, padding: 10 },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tableCard: { gap: 10, padding: 12 },
  side: { width: 356 },
  panel: { gap: 6, padding: 14 },
  who: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  scope: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  scopeItem: { width: '50%', flexDirection: 'row', alignItems: 'center', gap: 7, paddingRight: 6 },
  scopeTitle: { fontSize: 12, fontWeight: '600', color: NAVY },
  checks: { gap: 10 },
  blocker: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 9, borderRadius: 8, backgroundColor: Maple.warningSoft },
  blockerText: { flex: 1, fontSize: 12, color: Palette.orange800b },
  decided: { padding: 10, borderRadius: 8, backgroundColor: Maple.blueSoft, fontSize: 12.5, color: NAVY },
  decide: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  approve: { flex: 1.5, minWidth: 0, height: 36, paddingHorizontal: 6 },
  rejectBtn: { flex: 1, minHeight: 32, paddingVertical: 4, paddingHorizontal: 4, borderRadius: 8, borderWidth: 1, borderColor: Palette.red300e, alignItems: 'center', justifyContent: 'center', backgroundColor: Maple.errorSoft },
  rejectText: { fontSize: 12, fontWeight: '600', color: RED, textAlign: 'center' },
  card: { gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
});
