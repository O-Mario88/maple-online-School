import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { AreaChart, ShareBars } from '@/features/command/kit/CmdCharts';
import { CmdSelect, CmdStat, HBarRow, type Kpi, KpiGrid, OutlineBtn, Panel } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone, LivePill } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { advanceIncident, apiHealth, classQuality, poolHealth, retryFailed, severityCounts, type Severity } from '@/features/command/logic/ops';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, RED, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Segments, useChoice } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { IncidentRow } from '@/mock/command-center/ops';
import { Maple } from '@/constants/maple';
import { Palette } from '@/constants/palette';

type O = CommandData['ops'];
const SEV_TONE: Readonly<Record<Severity, Tone>> = { Critical: 'red', Warning: 'orange', Info: 'blue' };
const STATUS_TONE = { Investigating: 'orange', Monitoring: 'blue', Resolved: 'green' } as const;
const Q_TONE = { Good: 'green', Fair: 'orange', Poor: 'red' } as const;

function useOps(o: O) {
  const [incidents, setIncidents] = useState<readonly IncidentRow[]>(o.incidents);
  const [sev, setSev] = useState<'All' | Severity>('All');
  const [pct, setPct] = useState<'p50' | 'p95' | 'p99'>('p95');
  const [river, setRiver] = useState(o.river);
  const counts = severityCounts(incidents);
  const shown = sev === 'All' ? incidents : incidents.filter((i) => i.severity === sev);
  const step = (i: IncidentRow) => {
    const next = advanceIncident(i);
    setIncidents((prev) => prev.map((x) => (x.id === i.id ? next : x)));
    toast(next.status === i.status ? `${i.id} is already resolved.` : `${i.id}: ${next.status}. The on-call channel is updated.`);
  };
  const retry = () => {
    if (!river.failed) return toast('No failed jobs to retry.');
    setRiver((r) => ({ ...r, ...retryFailed(r) }));
    toast(`${river.failed} failed jobs requeued with backoff.`);
  };
  const values = o.latency[pct];
  const now = values[values.length - 1];
  const stats: readonly Kpi[] = o.stats.map((k) => {
    if (k.label === 'Active Incidents') return { ...k, value: String(counts.open), caption: counts.open ? `${counts.open} open • ${counts.Critical} critical` : 'No open incidents' };
    if (k.label === 'Go API Latency (p95)') return { ...k, value: `${o.latency.p95[o.latency.p95.length - 1]} ms`, valueTone: apiHealth(o.latency.p95[o.latency.p95.length - 1]) === 'Healthy' ? undefined : 'orange' };
    if (k.label === 'PostgreSQL') return { ...k, value: poolHealth(o.pg.active, o.pg.max), valueTone: poolHealth(o.pg.active, o.pg.max) === 'Healthy' ? 'green' : 'orange' };
    return k;
  });
  return { incidents, shown, counts, sev, setSev, pct, setPct, values, now, step, river, retry, stats };
}
type U = ReturnType<typeof useOps>;

function Mini({ value, label, delta, down = false, phone = false }: { value: string; label: string; delta?: string; down?: boolean; phone?: boolean }) {
  return (
    <View style={[styles.mini, phone && styles.miniPhone]}>
      <Text style={styles.miniValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.miniLabel} numberOfLines={2}>
        {label}
      </Text>
      {delta ? (
        <View style={styles.inline}>
          <Icon name={down ? 'arrowDown' : 'arrowUp'} size={11} color={GREEN} />
          <Text style={styles.miniDelta}>{delta}</Text>
        </View>
      ) : null}
    </View>
  );
}

function Charts({ o, u, phone = false }: { o: O; u: U; phone?: boolean }) {
  return (
    <View style={[styles.row, phone && styles.column]}>
      <Panel title="Go API Performance" badge={<Icon name="info" size={15} color={BODY} />} right={<Segments items={['p50', 'p95', 'p99']} active={u.pct} onChange={(v) => u.setPct(v as 'p50' | 'p95' | 'p99')} size={12.5} />} style={[styles.block, !phone && styles.colWide]}>
        <View style={styles.chartWrap}>
          <View style={styles.flex}>
            <AreaChart labels={o.hours} series={[{ name: u.pct, color: Maple.blue, values: u.values, fill: true }]} max={u.pct === 'p99' ? 400 : u.pct === 'p95' ? 400 : 100} height={phone ? 150 : 140} format={(v) => `${Math.round(v)} ms`} />
          </View>
          <View style={styles.chartFigure}>
            <Text style={styles.figure}>{`${u.now} ms`}</Text>
            <View style={styles.inline}>
              <Icon name="arrowDown" size={13} color={GREEN} />
              <Text style={styles.figureDelta}>32%</Text>
            </View>
            <Text style={styles.small}>{`${u.pct} latency`}</Text>
          </View>
        </View>
      </Panel>
      <Panel title="Request Throughput" style={[styles.block, styles.flex]}>
        <View style={styles.inline}>
          <Text style={styles.figure}>2,460 req/s</Text>
          <Icon name="arrowUp" size={14} color={GREEN} />
          <Text style={styles.figureDelta}>18%</Text>
        </View>
        <AreaChart labels={o.hours} series={[{ name: 'req/s', color: GREEN, values: o.throughput, fill: true, dots: true }]} max={4000} height={phone ? 140 : 128} format={(v) => (v ? `${v / 1000}K` : '0')} />
      </Panel>
      <Panel title="Error Rate" style={[styles.block, styles.flex]}>
        <View style={styles.inline}>
          <Text style={styles.figure}>0.12%</Text>
          <Icon name="arrowDown" size={14} color={GREEN} />
          <Text style={styles.figureDelta}>64%</Text>
        </View>
        <AreaChart labels={o.hours} series={[{ name: 'errors', color: RED, values: o.errorRate, fill: true, dots: true }]} max={2} height={phone ? 140 : 128} format={(v) => `${v.toFixed(1)}%`} />
      </Panel>
    </View>
  );
}

function Health({ o, u, phone = false }: { o: O; u: U; phone?: boolean }) {
  const maxJobs = Math.max(...o.queues.map((q) => q.jobs));
  const pool = poolHealth(o.pg.active, o.pg.max);
  return (
    <View style={[styles.row, phone && styles.column]}>
      <Panel title="PostgreSQL Health" badge={<Pill label={pool} tone={pool === 'Healthy' ? 'green' : 'orange'} icon="check" size={11} />} style={[styles.block, !phone && styles.colWide]}>
        <View style={[styles.minis, phone && styles.minisPhone]}>
          <Mini value={`${o.pg.active} / ${o.pg.max}`} label="Active Connections" phone={phone} />
          <Mini value={`${o.pg.pool}%`} label="Connection Pool" phone={phone} />
          <Mini value={`${o.pg.queryMs} ms`} label="Query Time (avg)" phone={phone} />
          <Mini value={String(o.pg.lag)} label="Replication Lag" phone={phone} />
        </View>
        <View style={[styles.row, phone && styles.column]}>
          <View style={styles.flex}>
            <View style={styles.inline}>
              <Text style={[styles.subTitle, styles.flex]}>Connection Usage</Text>
              {(
                [
                  ['Active', Maple.blue],
                  ['Idle', Maple.successText],
                  ['Waiting', Maple.warning],
                ] as const
              ).map(([l, c]) => (
                <View key={l} style={styles.inline}>
                  <View style={[styles.dot, { backgroundColor: c }]} />
                  <Text style={styles.small}>{l}</Text>
                </View>
              ))}
            </View>
            <AreaChart
              labels={o.hours}
              series={[
                { name: 'Active', color: Maple.blue, values: o.connections.active },
                { name: 'Idle', color: Maple.successText, values: o.connections.idle },
                { name: 'Waiting', color: Maple.warning, values: o.connections.waiting },
              ]}
              stacked
              max={30}
              height={130}
              format={(v) => `${v}`}
            />
          </View>
          <View style={phone ? undefined : styles.queries}>
            <Text style={styles.subTitle}>Top Queries (avg time)</Text>
            {o.topQueries.map((q, i) => (
              <View key={q.q} style={styles.queryRow}>
                <Text style={styles.small}>{i + 1}</Text>
                <Text style={[styles.query, styles.flex]}>{q.q}</Text>
                <Text style={styles.small}>{`${q.ms} ms`}</Text>
              </View>
            ))}
          </View>
        </View>
      </Panel>
      <Panel title="River Job Queues" badge={<Pill label="Healthy" tone="green" icon="check" size={11} />} onAll={u.retry} allLabel={u.river.failed ? 'Retry failed' : 'View All'} style={[styles.block, styles.flex]}>
        <View style={[styles.minis, phone && styles.minisPhone]}>
          <Mini value={u.river.processed.toLocaleString('en-US')} label="Processed (24h)" delta="18%" phone={phone} />
          <Mini value={String(u.river.pending)} label="Pending" delta="45%" down phone={phone} />
          <Mini value={String(u.river.failed)} label="Failed" delta="78%" down phone={phone} />
          <Mini value={`${u.river.avgMin} min`} label="Avg. Duration" delta="36%" down phone={phone} />
        </View>
        <Text style={styles.subTitle}>Jobs by Queue (last 24h)</Text>
        {o.queues.map((q) => (
          <HBarRow key={q.name} label={q.name} value={q.jobs} max={maxJobs} color={q.color} />
        ))}
      </Panel>
      <Panel title="LiveKit (WebRTC) Health" badge={<Pill label="Healthy" tone="green" icon="check" size={11} />} onAll={() => toast('Every live room with RTT, loss and the server it runs on.')} style={[styles.block, styles.flex]}>
        <View style={[styles.minis, phone && styles.minisPhone]}>
          <Mini value={o.livekit.rooms.toLocaleString('en-US')} label="Live Rooms" phone={phone} />
          <Mini value={o.livekit.participants.toLocaleString('en-US')} label="Live Participants" phone={phone} />
          <Mini value={`${o.livekit.rtt} ms`} label="Avg. RTT" phone={phone} />
          <Mini value={`${o.livekit.loss}%`} label="Packet Loss" phone={phone} />
        </View>
        <View style={styles.inline}>
          <Text style={[styles.subTitle, styles.flex]}>Live Session Quality (last 24h)</Text>
          {(
            [
              ['Good', Maple.successText],
              ['Fair', Maple.warning],
              ['Poor', Maple.error],
            ] as const
          ).map(([l, c]) => (
            <View key={l} style={styles.inline}>
              <View style={[styles.dot, { backgroundColor: c }]} />
              <Text style={styles.small}>{l}</Text>
            </View>
          ))}
        </View>
        <ShareBars
          labels={o.hours}
          parts={[
            { name: 'Good', color: Maple.success, values: o.quality.good },
            { name: 'Fair', color: Maple.warning, values: o.quality.fair },
            { name: 'Poor', color: Palette.red400b, values: o.quality.poor },
          ]}
          height={phone ? 150 : 158}
        />
      </Panel>
    </View>
  );
}

function incidentCols(u: U): readonly Column<IncidentRow>[] {
  return [
    { label: '#', width: 24, render: (i) => <Cell small>{i.n}</Cell> },
    {
      label: 'Severity',
      width: 92,
      render: (i) => (
        <View style={styles.inline}>
          <Icon name={i.severity === 'Info' ? 'info' : 'alert'} size={14} color={i.severity === 'Info' ? BLUE : i.severity === 'Warning' ? Maple.warning : RED} />
          <Cell small>{i.severity}</Cell>
        </View>
      ),
    },
    { label: 'Title', flex: 2, render: (i) => <Cell small>{i.title}</Cell> },
    { label: 'Service', flex: 1, render: (i) => <Cell small>{i.service}</Cell> },
    { label: 'Time', width: 96, render: (i) => <Cell small>{i.time}</Cell> },
    {
      label: 'Status',
      width: 106,
      render: (i) => (
        <Pressable onPress={() => u.step(i)} accessibilityRole="button" accessibilityLabel={`${i.id}: ${i.status}. Move to next step`}>
          <Pill label={i.status} tone={STATUS_TONE[i.status]} size={11} />
        </Pressable>
      ),
    },
  ];
}

const roomCols: readonly Column<O['rooms'][number]>[] = [
  { label: 'Room ID', width: 86, render: (r) => <Cell small>{r.room}</Cell> },
  { label: 'Class Title', flex: 1.4, render: (r) => <Cell small>{r.title}</Cell> },
  { label: 'Teacher', flex: 1, render: (r) => <Cell small>{r.teacher}</Cell> },
  { label: 'Students', width: 62, align: 'center', render: (r) => <Cell small>{r.students}</Cell> },
  { label: 'Region', flex: 1, render: (r) => <Cell small>{r.region}</Cell> },
  {
    label: 'Quality',
    width: 76,
    render: (r) => {
      const q = classQuality(r.rtt, r.loss);
      return <Pill label={q} tone={Q_TONE[q]} icon="check" size={11} />;
    },
  },
];

function Tables({ o, u, phone = false }: { o: O; u: U; phone?: boolean }) {
  const chips: readonly ['All' | Severity, number, Tone][] = [
    ['All', u.counts.all, 'blue'],
    ['Critical', u.counts.Critical, 'red'],
    ['Warning', u.counts.Warning, 'orange'],
    ['Info', u.counts.Info, 'blue'],
  ];
  return (
    <View style={[styles.row, phone && styles.column]}>
      <Panel
        title="Active Incidents & Alerts"
        badge={
          <View style={styles.chips}>
            {chips.map(([l, n, tone]) => (
              <Pressable key={l} onPress={() => u.setSev(l)} accessibilityRole="button" accessibilityState={{ selected: u.sev === l }} accessibilityLabel={`${l}, ${n}`}>
                <Pill label={`${l} (${n})`} tone={u.sev === l ? tone : 'grey'} size={11} />
              </Pressable>
            ))}
          </View>
        }
        onAll={() => toast('Incident history with timelines and post-mortems.')}
        style={[styles.block, styles.flex]}>
        <DataTable columns={incidentCols(u)} rows={u.shown} rowKey={(i) => i.id} compact menu onMenu={(i) => toast(`${i.id}: open timeline, page on-call, or write post-mortem.`)} />
      </Panel>
      <Panel title="Live Classes (Recent)" badge={<LivePill small />} onAll={() => toast('Every live room right now.')} style={[styles.block, styles.flex]}>
        <DataTable columns={roomCols} rows={o.rooms} rowKey={(r) => r.room} compact menu onMenu={(r) => toast(`${r.room}: join silently, view network stats, or end room.`)} />
      </Panel>
    </View>
  );
}

/** Maple Command › System Operations, LiveKit Health & River Job Queues on the desktop reference. */
export function OpsDesk({ c }: { c: CommandData }) {
  const o = c.ops;
  const u = useOps(o);
  const [win, setWin, wins] = useChoice(o.windows);
  return (
    <CommandDesk me={c.me} search="Search users, classes, jobs, services, or trace IDs..." active="Operations" sub="System Operations">
      <CmdHead
        icon="building"
        title="System Operations, LiveKit Health & River Job Queues"
        subtitle="Monitor platform health, API performance, database, background jobs, and live class quality in real time."
        right={
          <>
            <CmdSelect value={win} options={wins} onChange={setWin} width={160} label="Window" />
            <OutlineBtn icon="sync" onPress={() => toast('Metrics refreshed from Prometheus and LiveKit.')} />
            <OutlineBtn label="Incident Playbook" icon="doc" onPress={() => toast('Playbook: who to page, how to fail over LiveKit, how to drain River queues.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {u.stats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <Charts o={o} u={u} />
      <Health o={o} u={u} />
      <Tables o={o} u={u} />
    </CommandDesk>
  );
}

/** The phone version: status tiles, then each panel stacked. */
export function OpsPhone({ c }: { c: CommandData }) {
  const o = c.ops;
  const u = useOps(o);
  return (
    <CommandPhone me={c.me}>
      <PageHead title="System Operations" subtitle="API, database, job queues and live class quality." phone />
      <KpiGrid items={u.stats} />
      <Charts o={o} u={u} phone />
      <Health o={o} u={u} phone />
      <Card style={styles.phoneList}>
        <Text style={styles.subTitle}>Incidents</Text>
        {u.incidents.map((i) => (
          <Pressable key={i.id} style={styles.phoneRow} onPress={() => u.step(i)} accessibilityRole="button" accessibilityLabel={`${i.title}, ${i.status}. Move to next step`}>
            <Pill label={i.severity} tone={SEV_TONE[i.severity]} size={11} />
            <View style={styles.flex}>
              <Text style={styles.query}>{i.title}</Text>
              <Text style={styles.small}>{`${i.service} • ${i.time}`}</Text>
            </View>
            <Pill label={i.status} tone={STATUS_TONE[i.status]} size={11} />
          </Pressable>
        ))}
      </Card>
      <Card style={styles.phoneList}>
        <Text style={styles.subTitle}>Live Classes</Text>
        {o.rooms.map((r) => {
          const q = classQuality(r.rtt, r.loss);
          return (
            <View key={r.room} style={styles.phoneRow}>
              <View style={styles.flex}>
                <Text style={styles.query}>{r.title}</Text>
                <Text style={styles.small}>{`${r.teacher} • ${r.students} students • ${r.region}`}</Text>
              </View>
              <Pill label={q} tone={Q_TONE[q]} size={11} />
            </View>
          );
        })}
      </Card>
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  column: { flexDirection: 'column', alignItems: 'stretch' },
  kpis: { flexDirection: 'row', gap: 12 },
  block: { gap: 10 },
  colWide: { flex: 1.15 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  small: { fontSize: 11.5, color: BODY },
  chartWrap: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chartFigure: { width: 92, alignItems: 'flex-end' },
  figure: { fontSize: 20, fontWeight: '800', color: NAVY },
  figureDelta: { fontSize: 13, fontWeight: '700', color: GREEN },
  minis: { flexDirection: 'row', gap: 8 },
  minisPhone: { flexWrap: 'wrap' },
  miniPhone: { flexBasis: '45%' },
  mini: { flex: 1, minWidth: 0, padding: 9, borderRadius: 9, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  miniValue: { fontSize: 17, fontWeight: '800', color: NAVY },
  miniLabel: { marginTop: 2, fontSize: 10.5, color: BODY },
  miniDelta: { fontSize: 11, fontWeight: '700', color: GREEN },
  subTitle: { fontSize: 13, fontWeight: '700', color: NAVY },
  dot: { width: 8, height: 8, borderRadius: 4 },
  queries: { width: 170, gap: 2 },
  queryRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, borderBottomWidth: 1, borderColor: LINE },
  query: { fontSize: 12, color: NAVY },
  chips: { flexDirection: 'row', gap: 6, marginLeft: 6 },
  phoneList: { gap: 8, padding: 14 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderColor: LINE },
});
