import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { type Kpi, OutlineBtn, PrimaryBtn } from '@/features/command/kit/CmdParts';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { canUseFeed, ingest, maskSecret, nextRetry, resolveException, rotationDue, webhookHealth } from '@/features/command/logic/integrations';
import { Pill } from '@/features/portal/PortalParts';
import { BODY, LINE, NAVY, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { type Column, DataTable } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { Integration, IntegrationType, IntException } from '@/mock/command-center/pf-ops';

import { type FormAsk, FormModal } from './FinForm';
import { ActionGrid, FinDesk, FinHead, FinPanel, FinPhone, FinStats, FinTabs, num, PhoneRow, type Promo, RingLegend } from './FinKit';
import { Maple } from '@/constants/maple';

type O = CommandData['platformFinance']['ops'];
const TODAY = '2026-10-31';
const TABS = ['Overview', 'Bank Feeds', 'Payment Gateways', 'Accounting Export', 'Transaction Imports', 'Webhooks', 'Exceptions', 'Settings'] as const;
const TYPES: readonly IntegrationType[] = ['Bank Feed', 'Payment Gateway', 'Accounting Export', 'Webhook'];
const STATUS_TONE: Readonly<Record<Integration['status'], Tone>> = { Connected: 'green', Paused: 'orange', Error: 'red' };
const EX_TONE: Readonly<Record<IntException['status'], Tone>> = { Open: 'red', 'In Progress': 'orange', Retrying: 'blue', Resolved: 'green' };
const PROMO: Promo = { icon: 'link', color: Maple.blue, title: 'Financial Integrations', body: 'Connect banks, payment gateways, accounting tools and webhooks for reliable, automated operations.' };
const NOW = 'Oct 31, 2026, 10:45 AM';

function useIntegrations(o: O, me: string) {
  const [list, setList] = useState<readonly Integration[]>(o.integrations);
  const [exceptions, setExceptions] = useState<readonly IntException[]>(o.exceptions);
  const [log, setLog] = useState(o.syncLog);
  const [audit, setAudit] = useState<readonly string[]>([]);
  const [seen, setSeen] = useState<ReadonlySet<string>>(new Set(['mtn:MM-784532', 'stanbic:SB-20261031-0099']));
  const [imports, setImports] = useState(o.imports);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [ask, setAsk] = useState<FormAsk | null>(null);
  const note = (line: string) => setAudit((a) => [`${NOW} • ${me} • ${line}`, ...a]);
  const update = (i: Integration) => setList((prev) => prev.map((x) => (x.id === i.id ? i : x)));

  const sync = (only?: Integration) => {
    const targets = (only ? [only] : list).filter((i) => i.status === 'Connected' && i.type !== 'Accounting Export');
    // Each feed re-sends its last reference plus new ones; the idempotency key stops double posting.
    const batch = targets.flatMap((i, k) => {
      const p = i.name.split(' ')[0].toLowerCase();
      return [{ provider: p, ref: k === 1 ? 'MM-784532' : `${p.toUpperCase()}-${9100 + k}`, amount: 50_000 }, { provider: p, ref: `${p.toUpperCase()}-${9200 + k}`, amount: 75_000 }];
    });
    const r = ingest(batch, seen);
    setSeen(r.seen);
    setImports((x) => ({ ...x, ok: x.ok + r.accepted.length }));
    setList((prev) => prev.map((x) => (targets.some((t) => t.id === x.id) ? { ...x, lastSync: NOW, today: x.today + r.accepted.filter((a) => a.provider === x.name.split(' ')[0].toLowerCase()).length } : x)));
    setLog((l) => [{ at: NOW, integration: only?.name ?? 'All integrations', activity: 'Manual sync', records: r.accepted.length }, ...l]);
    note(`manual sync: ${r.accepted.length} imported, ${r.duplicates} duplicate${r.duplicates === 1 ? '' : 's'} skipped`);
    toast(`Synced ${targets.length} integration${targets.length === 1 ? '' : 's'}: ${r.accepted.length} new transactions imported; ${r.duplicates} already-seen reference${r.duplicates === 1 ? '' : 's'} skipped (idempotency key).`);
  };
  const add = () =>
    setAsk({
      title: 'Add integration',
      body: 'Option C – Hybrid accounting: Maple corporate books take live bank and gateway feeds; schools upload their bank statements by hand. Credentials are stored encrypted and only the last four characters are ever shown.',
      fields: [
        { key: 'name', label: 'Name', kind: 'text', placeholder: 'Centenary Bank (UG)' },
        { key: 'type', label: 'Type', kind: 'choice', options: TYPES },
        { key: 'entity', label: 'Books', kind: 'choice', options: ['Maple corporate', 'A school (institution ledger)'] },
        { key: 'secret', label: 'API key / client secret', kind: 'text', placeholder: 'Paste the key from the provider' },
      ],
      confirm: 'Connect',
      onSubmit: (v) => {
        const entity = (v.entity ?? '').startsWith('A school') ? 'school' : 'corporate';
        if (!canUseFeed(entity)) return 'Option C: schools do not connect live feeds. They upload bank statements on the school accounting page.';
        if (!(v.name ?? '').trim()) return 'Name the integration.';
        if ((v.secret ?? '').trim().length < 12) return 'Paste the full API key (at least 12 characters).';
        const i: Integration = { id: `INT-${String(list.length + 1).padStart(2, '0')}`, name: (v.name ?? '').trim(), type: v.type as IntegrationType, badge: (v.name ?? '?').trim().slice(0, 2).toUpperCase(), color: Maple.blue, status: 'Connected', lastSync: 'Never', today: 0, secret: (v.secret ?? '').trim(), lastRotated: TODAY };
        setList((prev) => [...prev, i]);
        note(`connected ${i.name} (${i.type}); key ${maskSecret(i.secret)}`);
        toast(`${i.name} connected. Key stored as ${maskSecret(i.secret)}. First sync runs on the next schedule.`);
        return undefined;
      },
    });
  const manage = (i: Integration) =>
    setAsk({
      title: `${i.name} • ${i.type}`,
      body: `Status ${i.status}. Last sync ${i.lastSync}. Credential ${maskSecret(i.secret)}, rotated ${i.lastRotated}${rotationDue(i.lastRotated, TODAY) ? ' – rotation due (over 90 days)' : ''}.`,
      fields: [{ key: 'action', label: 'Action', kind: 'choice', options: [...(i.status === 'Connected' ? ['Sync now', 'Pause'] : ['Resume']), 'Rotate credential', 'Show audit log'] }],
      confirm: 'Apply',
      onSubmit: (v) => {
        if (v.action === 'Sync now') {
          setTimeout(() => sync(i), 0);
          return undefined;
        }
        if (v.action === 'Pause' || v.action === 'Resume') {
          update({ ...i, status: v.action === 'Pause' ? 'Paused' : 'Connected' });
          note(`${v.action.toLowerCase()}d ${i.name}`);
          toast(`${i.name} ${v.action === 'Pause' ? 'paused; incoming data queues until resumed' : 'resumed'}.`);
          return undefined;
        }
        if (v.action === 'Rotate credential') {
          const secret = `${i.secret.slice(0, i.secret.length - 4)}${String(Math.floor(1000 + ((i.today * 7) % 9000)))}`;
          update({ ...i, secret, lastRotated: TODAY });
          note(`rotated the ${i.name} credential; now ${maskSecret(secret)}`);
          toast(`${i.name} credential rotated. The old key is revoked; the new one is ${maskSecret(secret)}.`);
          return undefined;
        }
        const lines = audit.filter((a) => a.includes(i.name));
        toast(lines.length ? lines.slice(0, 3).join(' • ') : `No changes to ${i.name} this session. Every sync, rotation and pause is logged.`);
        return undefined;
      },
    });
  const handle = (e: IntException) =>
    setAsk({
      title: `${e.id} • ${e.source}`,
      body: `${e.issue}. Raised ${e.at}. Attempts so far: ${e.attempts}.${e.log.length ? ` History: ${e.log.join('; ')}.` : ''}`,
      fields: [
        { key: 'action', label: 'Action', kind: 'choice', options: ['Review', 'Resolve', 'Retry'] },
        { key: 'note', label: 'Resolution note', kind: 'text', placeholder: 'Matched to the bank deposit of Oct 31' },
      ],
      confirm: 'Apply',
      onSubmit: (v) => {
        const action = v.action === 'Resolve' ? 'resolve' : v.action === 'Retry' ? 'retry' : 'review';
        const r = resolveException(e, action, v.note ?? '', me, '10:45');
        if (r.error || !r.exception) return r.error;
        let next = r.exception;
        if (action === 'retry') {
          const step = nextRetry(e.attempts + 1);
          next = { ...next, attempts: e.attempts + 1, status: step.status === 'Exception' ? 'Open' : 'Retrying' };
          toast(step.status === 'Exception' ? `${e.id}: last automatic attempt used. It stays open for manual handling.` : `${e.id} queued: retry ${e.attempts + 1} in ${step.waitMinutes} minute${step.waitMinutes === 1 ? '' : 's'}.`);
        } else toast(action === 'resolve' ? `${e.id} resolved and logged.` : `${e.id} is in review by ${me}.`);
        setExceptions((prev) => prev.map((x) => (x.id === e.id ? next : x)));
        note(`${e.id}: ${v.action}`);
        return undefined;
      },
    });
  const health = () => {
    const due = list.filter((i) => rotationDue(i.lastRotated, TODAY));
    const paused = list.filter((i) => i.status !== 'Connected');
    const open = exceptions.filter((e) => e.status !== 'Resolved');
    toast(`Health check: ${list.length - paused.length}/${list.length} connected • ${due.length} credential${due.length === 1 ? '' : 's'} due for rotation${due.length ? ` (${due.map((i) => i.name).join(', ')})` : ''} • ${open.length} open exceptions on this page • webhooks ${webhookHealth(o.webhooks).healthy}/${o.webhooks.length} healthy.`);
  };
  const schedule = () =>
    setAsk({
      title: 'Sync schedule',
      body: 'Bank feeds and gateways sync on this interval; QuickBooks exports the general ledger daily at 23:00.',
      fields: [{ key: 'every', label: 'Sync every', kind: 'choice', options: ['15 minutes', '5 minutes', '1 hour'] }],
      confirm: 'Save',
      onSubmit: (v) => {
        note(`sync schedule set to every ${v.every}`);
        toast(`Feeds now sync every ${v.every}.`);
        return undefined;
      },
    });
  const wh = webhookHealth(o.webhooks);
  const count = (xs: readonly Integration[], t: IntegrationType) => xs.filter((i) => i.type === t).length;
  const live = (t: IntegrationType, base: number) => base + count(list, t) - count(o.integrations, t);
  const open = o.intStats.exceptions - o.exceptions.filter((e) => e.status !== 'Resolved').length + exceptions.filter((e) => e.status !== 'Resolved').length;
  const stats: readonly Kpi[] = [
    { label: 'Sync Transactions (YTD)', value: num(o.intStats.syncedYtd + imports.ok - o.imports.ok), delta: '18.6%', icon: 'layers', tone: 'green' },
    { label: 'Connected Banks', value: String(live('Bank Feed', o.intStats.banks)), caption: 'All Active', icon: 'building', tone: 'blue' },
    { label: 'Payment Gateways', value: String(live('Payment Gateway', o.intStats.gateways)), caption: 'Healthy', icon: 'wallet', tone: 'purple' },
    { label: 'Accounting Exports', value: String(live('Accounting Export', o.intStats.exports)), caption: 'Scheduled', icon: 'doc', tone: 'blue' },
    { label: 'Webhooks', value: String(wh.total), caption: `${wh.healthy} Healthy`, icon: 'link', tone: 'green' },
    { label: 'Integration Exceptions', value: String(open), caption: open ? 'Needs Attention' : 'All clear', icon: 'alert', tone: 'red', valueTone: 'red' },
  ];
  const allOk = list.every((i) => i.status === 'Connected');
  return { o, list, exceptions, log, audit, imports, tab, setTab, ask, setAsk, sync, add, manage, handle, health, schedule, stats, wh, allOk, open };
}
type U = ReturnType<typeof useIntegrations>;

function Badge({ i, size = 26 }: { i: Integration; size?: number }) {
  return (
    <View style={[styles.badge, { width: size + 8, height: size * 0.8, backgroundColor: i.color }]}>
      <Text style={styles.badgeText}>{i.badge}</Text>
    </View>
  );
}

function cols(): readonly Column<Integration>[] {
  return [
    {
      label: 'Integration',
      flex: 1,
      render: (i) => (
        <View style={styles.inline}>
          <Badge i={i} />
          <Text style={styles.cellStrong} numberOfLines={1}>{i.name}</Text>
        </View>
      ),
    },
    { label: 'Type', width: 112, render: (i) => <Text style={styles.cell}>{i.type}</Text> },
    { label: 'Status', width: 96, align: 'center', render: (i) => <Pill label={i.status} tone={STATUS_TONE[i.status]} size={10} icon={i.status === 'Connected' ? 'check' : undefined} /> },
    {
      label: 'Credential',
      width: 150,
      render: (i) => (
        <View>
          <Text style={styles.cell} numberOfLines={1}>{maskSecret(i.secret)}</Text>
          {rotationDue(i.lastRotated, TODAY) ? <Text style={[styles.small, styles.warn]}>Rotation due</Text> : null}
        </View>
      ),
    },
    { label: 'Last Sync', width: 136, render: (i) => <Text style={styles.cell} numberOfLines={1}>{i.lastSync}</Text> },
    { label: "Today's Txns", width: 80, align: 'right', render: (i) => <Text style={[styles.cell, styles.right]}>{i.today ? num(i.today) : '—'}</Text> },
  ];
}

function Imports({ u, phone = false }: { u: U; phone?: boolean }) {
  const t = u.imports.ok + u.imports.warnings + u.imports.failed;
  return (
    <FinPanel icon="download" title="Transaction Imports (Today)" style={!phone && styles.imports}>
      <RingLegend phone={phone} size={150} center={num(t)} caption="Transactions" parts={[{ label: 'Imported Successfully', value: u.imports.ok, color: Maple.successText, display: num(u.imports.ok) }, { label: 'Imported with Warnings', value: u.imports.warnings, color: Maple.warning, display: num(u.imports.warnings) }, { label: 'Failed / Exceptions', value: u.imports.failed, color: Maple.error, display: num(u.imports.failed) }]} />
      <View style={styles.note}>
        <Icon name="info" size={15} color={TONES.blue.solid} />
        <Text style={[styles.cell, styles.flex]}>Imports are validated, de-duplicated by provider reference and posted to Maple&apos;s corporate ledger. Schools upload statements instead (Option C – hybrid accounting).</Text>
      </View>
    </FinPanel>
  );
}

function Webhooks({ u, phone = false }: { u: U; phone?: boolean }) {
  const tiles = [
    { icon: 'check' as const, big: `${u.wh.healthy} / ${u.wh.total}`, small: 'Webhooks Healthy', tone: 'green' as const },
    { icon: 'clock' as const, big: `${u.wh.avgMs} ms`, small: 'Avg. Response Time', tone: 'blue' as const },
    { icon: 'chart' as const, big: `${u.wh.successRate}%`, small: 'Success Rate', tone: 'green' as const },
  ];
  return (
    <FinPanel icon="link" title="Webhook Health" onAll={() => u.setTab('Webhooks')} allLabel="View Webhooks">
      <View style={[styles.tiles, phone && styles.tilesPhone]}>
        {tiles.map((x) => (
          <View key={x.small} style={[styles.tile, { backgroundColor: TONES[x.tone].soft }]}>
            <Icon name={x.icon} size={20} color={TONES[x.tone].solid} />
            <View>
              <Text style={styles.tileBig}>{x.big}</Text>
              <Text style={styles.cell}>{x.small}</Text>
            </View>
          </View>
        ))}
      </View>
    </FinPanel>
  );
}

function SyncLog({ u, phone = false }: { u: U; phone?: boolean }) {
  return (
    <FinPanel icon="sync" title="Recent Sync Activity" onAll={() => toast(`${u.log.length} sync runs today. Full logs are kept for 7 years.`)} allLabel="View Sync Logs">
      {u.log.slice(0, 5).map((s, k) => (
        <View key={`${s.at}-${k}`} style={styles.line}>
          {phone ? null : <Text style={[styles.cell, styles.when]}>{s.at.replace('Oct 31, 2026, ', '')}</Text>}
          <View style={styles.flex}>
            <Text style={styles.td} numberOfLines={2}>{`${s.integration} – ${s.activity}`}</Text>
            {phone ? <Text style={styles.cell}>{s.at.replace('Oct 31, 2026, ', '')}</Text> : null}
          </View>
          <Text style={[styles.cell, styles.recs]}>{s.records === null ? '—' : num(s.records)}</Text>
          <Pill label="Success" tone="green" size={10} />
        </View>
      ))}
    </FinPanel>
  );
}

function Exceptions({ u, phone = false }: { u: U; phone?: boolean }) {
  return (
    <FinPanel icon="alert" title={`Integration Exceptions (${u.open})`} onAll={() => u.setTab('Exceptions')}>
      {u.exceptions.map((e) =>
        phone ? (
          <View key={e.id} style={styles.line}>
            <View style={styles.flex}>
              <Text style={styles.cellStrong}>{`${e.source} • ${e.at.replace('Oct 31, 2026, ', '')}`}</Text>
              <Text style={styles.td}>{e.issue}</Text>
              <Pill label={e.status} tone={EX_TONE[e.status]} size={10} style={styles.start} />
            </View>
            <OutlineBtn small label={e.status === 'Resolved' ? 'View' : e.issue.includes('failed') ? 'Retry' : 'Review'} onPress={() => u.handle(e)} />
          </View>
        ) : (
        <View key={e.id} style={styles.line}>
          <Text style={[styles.cell, styles.when]}>{e.at.replace('Oct 31, 2026, ', '')}</Text>
          <Text style={[styles.cellStrong, styles.src]}>{e.source}</Text>
          <Text style={[styles.td, styles.flex]} numberOfLines={2}>{e.issue}</Text>
          <Pill label={e.status} tone={EX_TONE[e.status]} size={10} />
          <OutlineBtn small label={e.status === 'Resolved' ? 'View' : e.issue.includes('failed') ? 'Retry' : 'Review'} onPress={() => u.handle(e)} />
        </View>
        ),
      )}
    </FinPanel>
  );
}

function Controls({ u }: { u: U }) {
  return (
    <FinPanel icon="settings" title="Automation & Integration Controls">
      <ActionGrid
        columns={3}
        items={[
          { icon: 'sync', label: 'Run Manual Sync', onPress: () => u.sync() },
          { icon: 'calendar', label: 'Sync Schedule', onPress: u.schedule },
          { icon: 'doc', label: 'Accounting Export', onPress: () => toast('QuickBooks Online: daily GL export at 23:00, mapped by account code (1100 → Bank, 4000 → Subscription Revenue…). School ledgers are never exported.') },
          { icon: 'link', label: 'Webhook Endpoints', onPress: () => toast(u.o.webhooks.map((w) => `${w.name} (${w.ms} ms)`).join(' • ')) },
          { icon: 'layers', label: 'Data Mapping & Rules', onPress: () => toast('Mapping: provider reference → idempotency key; provider fees → 5200; settlements → 1150 Provider Clearing; unmatched → exceptions.') },
          { icon: 'shield', label: 'Integration Health Check', onPress: u.health },
        ]}
      />
    </FinPanel>
  );
}

/** Maple Command › Finance › Financial Integrations on the desktop reference. */
export function IntegrationsDesk({ c }: { c: CommandData }) {
  const u = useIntegrations(c.platformFinance.ops, c.platformFinance.me.name.replace(/^Mr\.\s*/, ''));
  return (
    <FinDesk c={c} sub="Integrations" search="Search integrations, transactions, syncs, or exceptions..." promo={PROMO}>
      <FinHead
        icon="link"
        title="Financial Integrations"
        subtitle="Connect and monitor banks, payment gateways, accounting exports, webhooks and transaction imports."
        right={
          <>
            <Pill label={u.allOk ? 'All Systems Operational' : 'Some Integrations Paused'} tone={u.allOk ? 'green' : 'orange'} icon={u.allOk ? 'check' : 'alert'} size={12} />
            <PrimaryBtn label="Add Integration" icon="plus" onPress={u.add} />
            <OutlineBtn label="Health Check" icon="shield" onPress={u.health} />
          </>
        }
      />
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} />
      <FinStats items={u.stats} />
      <View style={styles.row}>
        <FinPanel icon="link" title="Connected Integrations" onAll={u.add} allLabel="Add" style={styles.flex}>
          <DataTable columns={cols()} rows={u.list} rowKey={(i) => i.id} compact menu onMenu={u.manage} onRowPress={u.manage} />
        </FinPanel>
        <Imports u={u} />
      </View>
      <View style={styles.row}>
        <View style={[styles.left, styles.stack]}>
          <Webhooks u={u} />
          <SyncLog u={u} />
        </View>
        <View style={[styles.flex, styles.stack]}>
          <Exceptions u={u} />
          <Controls u={u} />
        </View>
      </View>
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinDesk>
  );
}

/** The phone version: integration cards, imports, exceptions and controls. */
export function IntegrationsPhone({ c }: { c: CommandData }) {
  const u = useIntegrations(c.platformFinance.ops, c.platformFinance.me.name.replace(/^Mr\.\s*/, ''));
  return (
    <FinPhone c={c} title="Integrations" subtitle="Banks, gateways, exports and webhooks.">
      <FinStats items={u.stats} phone title="Integrations at a Glance" />
      <View style={styles.inline}>
        <PrimaryBtn label="Run Sync" icon="sync" onPress={() => u.sync()} style={styles.flex} />
        <OutlineBtn label="Add" icon="plus" onPress={u.add} />
      </View>
      <FinTabs tabs={TABS} active={u.tab} onChange={u.setTab} phone />
      {u.list.map((i) => (
        <PhoneRow key={i.id} lead={<Badge i={i} size={30} />} title={i.name} sub={`${i.type} • ${i.lastSync} • ${maskSecret(i.secret)}`} pill={<Pill label={i.status} tone={STATUS_TONE[i.status]} size={11} />} onPress={() => u.manage(i)} />
      ))}
      <Imports u={u} phone />
      <Exceptions u={u} phone />
      <Webhooks u={u} phone />
      <Controls u={u} />
      <SyncLog u={u} phone />
      <FormModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </FinPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stack: { gap: 12 },
  left: { width: 600 },
  imports: { width: 560 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cell: { fontSize: 10.5, color: BODY },
  cellStrong: { flexShrink: 1, fontSize: 11.5, fontWeight: '700', color: NAVY },
  td: { fontSize: 11.5, color: NAVY },
  small: { fontSize: 9.5 },
  warn: { color: TONES.orange.text, fontWeight: '700' },
  right: { textAlign: 'right' },
  badge: { borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 9.5, fontWeight: '800', color: WHITE },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 10, borderRadius: 10, backgroundColor: TONES.blue.soft },
  tiles: { flexDirection: 'row', gap: 8 },
  tilesPhone: { flexDirection: 'column' },
  start: { alignSelf: 'flex-start', marginTop: 3 },
  tile: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12 },
  tileBig: { fontSize: 17, fontWeight: '800', color: NAVY },
  line: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: LINE },
  when: { width: 62 },
  src: { width: 92 },
  recs: { width: 56, textAlign: 'right' },
});
