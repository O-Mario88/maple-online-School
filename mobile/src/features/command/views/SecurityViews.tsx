import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AreaChart } from '@/features/command/kit/CmdCharts';
import { CmdStat, KpiGrid, OutlineBtn, Panel, PersonCell, PrimaryBtn, RangeBox, exportMenu } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { ReasonModal, type ReasonAsk } from '@/features/command/kit/ReasonModal';
import { advanceAlert, dueState, runRlsAudit } from '@/features/command/logic/security';
import { Pill } from '@/features/portal/PortalParts';
import { BODY, LINE, NAVY, RED, type Tone } from '@/features/portal/tokens';
import { PageHead } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { CrossTenantAlert } from '@/mock/command-center/security';
import { Maple } from '@/constants/maple';

type S = CommandData['security'];
const SEV_TONE: Readonly<Record<string, Tone>> = { Critical: 'red', High: 'orange', Medium: 'orange', Low: 'green', Info: 'blue' };
const ALERT_TONE: Readonly<Record<CrossTenantAlert['status'], Tone>> = { Open: 'red', Contained: 'orange', Resolved: 'green' };

function useDash(s: S) {
  const [alerts, setAlerts] = useState<readonly CrossTenantAlert[]>(s.alerts);
  const [audit, setAudit] = useState(() => runRlsAudit(s.policies));
  const [ranAt, setRanAt] = useState('Today, 06:00 (scheduled)');
  const [ask, setAsk] = useState<ReasonAsk | null>(null);
  const step = (a: CrossTenantAlert) => {
    if (a.status === 'Contained') {
      return setAsk({
        title: `Resolve ${a.id}?`,
        body: 'Say what was fixed (policy patched, token revoked, tenants told). The note goes to both tenants’ admins and the audit log.',
        confirm: 'Resolve',
        tone: 'green',
        onConfirm: (note) => {
          const r = advanceAlert(a, note);
          if (r.error) return toast(r.error);
          setAlerts((prev) => prev.map((x) => (x.id === a.id ? r.alert : x)));
          toast(`${a.id} resolved.`);
        },
      });
    }
    const r = advanceAlert(a);
    setAlerts((prev) => prev.map((x) => (x.id === a.id ? r.alert : x)));
    toast(a.status === 'Open' ? `${a.id} contained: sessions revoked and the affected query blocked.` : `${a.id} is already resolved.`);
  };
  const runAudit = () => {
    const r = runRlsAudit(s.policies);
    setAudit(r);
    setRanAt('Just now (manual run)');
    const fails = r.filter((x) => x.result === 'Fail');
    toast(fails.length ? `${fails.length} table${fails.length === 1 ? '' : 's'} failed: ${fails.map((f) => f.table).join(', ')}. A cross-tenant alert was opened.` : 'All tenant tables passed.');
  };
  const open = alerts.filter((a) => a.status !== 'Resolved').length;
  return { alerts, step, audit, runAudit, ranAt, ask, setAsk, open };
}
type U = ReturnType<typeof useDash>;

function Alerts({ u }: { u: U }) {
  return (
    <Panel title="Cross-Tenant Security Alerts" badge={<Pill label={`${u.open} open`} tone={u.open ? 'red' : 'green'} size={11} />} style={styles.block}>
      {u.alerts.map((a) => (
        <View key={a.id} style={styles.alert}>
          <View style={styles.inline}>
            <Pill label={a.severity} tone={SEV_TONE[a.severity]} size={10.5} />
            <Text style={[styles.alertTitle, styles.flex]}>{a.title}</Text>
            <Pill label={a.status} tone={ALERT_TONE[a.status]} size={10.5} />
          </View>
          <Text style={styles.small}>{a.detail}</Text>
          <View style={styles.inline}>
            <Text style={[styles.tiny, styles.flex]}>{`${a.id} • ${a.tenants} • ${a.when}`}</Text>
            {a.status === 'Resolved' ? (
              <Text style={styles.tiny}>{a.note ? `“${a.note}”` : 'Resolved'}</Text>
            ) : (
              <OutlineBtn label={a.status === 'Open' ? 'Contain' : 'Resolve'} small onPress={() => u.step(a)} />
            )}
          </View>
        </View>
      ))}
    </Panel>
  );
}

function RlsAudit({ u }: { u: U }) {
  return (
    <Panel title="RLS Tenant Audit" right={<PrimaryBtn label="Run Audit" icon="verified" onPress={u.runAudit} style={styles.smallBtn} />} style={styles.block}>
      <Text style={styles.small}>{`Every tenant table must enforce row-level security and leak nothing across schools. Last run: ${u.ranAt}.`}</Text>
      <View style={styles.table}>
        <View style={[styles.tr, styles.th]}>
          <Text style={[styles.thText, styles.flex]}>Table</Text>
          <Text style={[styles.thText, styles.col]}>Policy</Text>
          <Text style={[styles.thText, styles.col]}>Leaked rows</Text>
          <Text style={[styles.thText, styles.col]}>Result</Text>
        </View>
        {u.audit.map((p) => (
          <View key={p.table} style={styles.tr}>
            <Text style={[styles.td, styles.flex]}>{p.table}</Text>
            <Text style={[styles.td, styles.col]}>{p.enforced ? 'Enforced' : 'Off'}</Text>
            <Text style={[styles.td, styles.col, p.crossTenantRows ? styles.red : null]}>{p.crossTenantRows}</Text>
            <View style={styles.col}>
              <Pill label={p.result} tone={p.result === 'Pass' ? 'green' : 'red'} icon={p.result === 'Pass' ? 'check' : 'alert'} size={10.5} />
            </View>
          </View>
        ))}
      </View>
    </Panel>
  );
}

function Feeds({ s }: { s: S }) {
  const privileged = s.events.filter((e) => e.severity === 'Critical' || e.severity === 'High').slice(0, 5);
  const erasure = s.requests.filter((r) => r.type === 'Deletion' || r.type === 'Export').filter((r) => r.status !== 'Completed' && r.status !== 'Rejected').slice(0, 5);
  const escalated = s.tickets.filter((t) => t.status === 'Escalated' || t.category === 'AI Copilot');
  return (
    <>
      <Panel title="Privileged Admin Actions" onAll={() => router.push('/command/security/audit-logs' as never)} style={[styles.block, styles.flex]}>
        {privileged.map((e) => (
          <View key={e.id} style={styles.feed}>
            <PersonCell avatar={e.avatar} name={e.user} sub={`${e.action} • ${e.when.slice(0, 6)} ${e.when.slice(-5)}`} size={28} />
            <Pill label={e.severity} tone={SEV_TONE[e.severity]} size={10.5} />
          </View>
        ))}
      </Panel>
      <Panel title="Erasure & Data Requests" onAll={() => router.push('/command/security/data-requests' as never)} style={[styles.block, styles.flex]}>
        {erasure.map((r) => {
          const d = dueState(r.due, s.TODAY);
          return (
            <View key={r.id} style={styles.feed}>
              <PersonCell avatar={r.avatar} name={r.name} sub={`${r.type} • ${r.subject}`} size={28} />
              <Text style={[styles.tiny, d.days <= 5 && styles.red]}>{d.label}</Text>
            </View>
          );
        })}
      </Panel>
      <Panel title="Escalated AI Copilot & Support" onAll={() => router.push('/command/security/support' as never)} style={[styles.block, styles.flex]}>
        {escalated.map((t) => (
          <View key={t.id} style={styles.feed}>
            <PersonCell avatar={t.avatar} name={t.subject} sub={`${t.category} • ${t.level ?? t.assignee}`} size={28} />
            <Pill label={t.status} tone={t.status === 'Escalated' ? 'red' : 'orange'} size={10.5} />
          </View>
        ))}
      </Panel>
    </>
  );
}

function FailedLogins({ s }: { s: S }) {
  return (
    <Panel title="Failed Logins (last 24h)" style={[styles.block, styles.flex]}>
      <AreaChart labels={s.failedLogins.labels} series={[{ name: 'Failed', color: RED, values: s.failedLogins.values, fill: true, dots: true }]} max={30} height={150} />
      <Text style={styles.small}>Rate limits block an IP after 5 failures in 10 minutes; admins need 2FA to sign in.</Text>
    </Panel>
  );
}

/** Maple Command › Security Dashboard: privileged actions, cross-tenant alerts, privacy requests and escalations. */
export function SecurityDesk({ c }: { c: CommandData }) {
  const s = c.security;
  const u = useDash(s);
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search users, schools, incidents, audit logs, or reference IDs..." active="Security" sub="Security Dashboard">
      <CmdHead
        icon="shield"
        section="Security"
        title="Security Incidents, RLS Tenant Audit & Escalations"
        subtitle="Privileged admin actions, cross-tenant security alerts, data-retention and erasure requests, and escalated AI Copilot tickets."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="Export" chevron onPress={() => exportMenu('Security report')} />
            <OutlineBtn icon="sync" onPress={() => toast('Security signals refreshed.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {s.dashStats.map((k) => (
          <CmdStat key={k.label} k={k.label === 'Cross-Tenant Alerts' ? { ...k, value: String(u.open) } : k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <View style={styles.colWide}>
          <Alerts u={u} />
        </View>
        <View style={styles.flex}>
          <RlsAudit u={u} />
        </View>
      </View>
      <View style={styles.row}>
        <Feeds s={s} />
        <FailedLogins s={s} />
      </View>
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandDesk>
  );
}

export function SecurityPhone({ c }: { c: CommandData }) {
  const s = c.security;
  const u = useDash(s);
  return (
    <CommandPhone me={c.me}>
      <PageHead title="Security" subtitle="Alerts, tenant isolation, privacy requests and escalations." phone />
      <KpiGrid items={s.dashStats.map((k) => (k.label === 'Cross-Tenant Alerts' ? { ...k, value: String(u.open) } : k))} />
      <View style={styles.links}>
        <OutlineBtn label="Audit Logs" icon="doc" small onPress={() => router.push('/command/security/audit-logs' as never)} style={styles.flex} />
        <OutlineBtn label="Data Requests" icon="database" small onPress={() => router.push('/command/security/data-requests' as never)} style={styles.flex} />
        <OutlineBtn label="Support" icon="headset" small onPress={() => router.push('/command/security/support' as never)} style={styles.flex} />
      </View>
      <Alerts u={u} />
      <RlsAudit u={u} />
      <Feeds s={s} />
      <FailedLogins s={s} />
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  colWide: { flex: 1.25, minWidth: 0 },
  kpis: { flexDirection: 'row', gap: 12 },
  block: { gap: 10 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  links: { flexDirection: 'row', gap: 8 },
  small: { fontSize: 12, color: BODY },
  tiny: { fontSize: 11, color: BODY },
  red: { color: RED, fontWeight: '600' },
  smallBtn: { height: 32 },
  alert: { gap: 5, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  alertTitle: { fontSize: 13, fontWeight: '700', color: NAVY },
  table: { borderRadius: 10, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  tr: { flexDirection: 'row', alignItems: 'center', minHeight: 34, paddingHorizontal: 10, borderBottomWidth: 1, borderColor: LINE },
  th: { backgroundColor: Maple.blueSoft },
  thText: { fontSize: 12, fontWeight: '700', color: NAVY },
  td: { fontSize: 12, color: NAVY },
  col: { width: 86 },
  feed: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingVertical: 4, borderBottomWidth: 1, borderColor: LINE },
});
