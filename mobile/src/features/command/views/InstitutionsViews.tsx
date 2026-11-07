import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AfricaMap, ComboChart, Funnel, HeatScale } from '@/features/command/kit/CmdCharts';
import { CmdSelect, CmdStat, CountTabs, Flag, type Kpi, KpiGrid, OutlineBtn, PageStrip, Panel, PrimaryBtn, RangeBox, exportMenu } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { CHART } from '@/features/command/kit/tokens';
import { advance, isBottomUp, nextAction, type Stage, stageCounts } from '@/features/command/logic/institutions';
import { Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Search, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { SchoolRow } from '@/mock/command-center/institutions';
import { Maple } from '@/constants/maple';

type I = CommandData['institutions'];
const PER_PAGE = 10;

const STAGE_PILL: Readonly<Record<Stage, { label: string; tone: Tone; icon: 'check' | 'people' | 'clock' | 'doc' | 'sync' | 'plus' }>> = {
  'Active Tenant': { label: 'Active Tenant', tone: 'green', icon: 'check' },
  Qualified: { label: 'Bottom-Up Qualified', tone: 'purple', icon: 'people' },
  'In Negotiation': { label: 'In Negotiation', tone: 'orange', icon: 'clock' },
  'Contract Signed': { label: 'Contract Signed', tone: 'blue', icon: 'doc' },
  Onboarding: { label: 'Onboarding', tone: 'red', icon: 'sync' },
  Registered: { label: 'Registered', tone: 'blue', icon: 'plus' },
};

type TabKey = 'all' | 'bottomUp' | Stage;
const TABS: readonly { key: TabKey; label: string; tone: Tone }[] = [
  { key: 'all', label: 'All Schools', tone: 'blue' },
  { key: 'bottomUp', label: 'Bottom-Up Opportunities', tone: 'purple' },
  { key: 'In Negotiation', label: 'In Negotiation', tone: 'purple' },
  { key: 'Contract Signed', label: 'Contract Signed', tone: 'orange' },
  { key: 'Onboarding', label: 'Onboarding', tone: 'red' },
  { key: 'Active Tenant', label: 'Active Tenants', tone: 'green' },
];

function useInstitutions(i: I) {
  const [list, setList] = useState<readonly SchoolRow[]>(i.schools);
  const [used, setUsed] = useState(() => i.schools.filter((s) => s.stage === 'Active Tenant').length);
  const [tab, setTab] = useState<TabKey>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, toggle] = useSelection();
  const counts = useMemo(() => stageCounts(list), [list]);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((s) => (tab === 'all' || (tab === 'bottomUp' ? isBottomUp(s) : s.stage === tab)) && (!q || `${s.name} ${s.city} ${s.owner}`.toLowerCase().includes(q)));
  }, [list, tab, query]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const move = (s: SchoolRow) => {
    const r = advance(s, { used, quota: i.quota });
    if (r.error) return toast(r.error);
    setList((prev) => prev.map((x) => (x.id === s.id ? { ...r.school, last: 'Today' } : x)));
    setUsed(r.quotaUsed);
    toast(`${s.name}: ${nextAction(s)} done. Now ${STAGE_PILL[r.school.stage].label}.`);
  };
  const enterprise = list.filter((s) => s.plan === 'Enterprise').length;
  const stats: readonly Kpi[] = [
    { label: 'Total Registered Schools', value: counts.all.toLocaleString('en-US'), icon: 'building', tone: 'blue', ...i.kpiExtras['Total Registered Schools'] },
    { label: 'Active Tenants', value: counts['Active Tenant'].toLocaleString('en-US'), icon: 'school', tone: 'green', ...i.kpiExtras['Active Tenants'] },
    { label: 'Bottom-Up Opportunities', value: counts.bottomUp.toLocaleString('en-US'), icon: 'people', tone: 'purple', ...i.kpiExtras['Bottom-Up Opportunities'] },
    { label: 'Enterprise Contracts', value: String(enterprise), icon: 'doc', tone: 'orange', ...i.kpiExtras['Enterprise Contracts'] },
    { label: 'Onboarding (In Progress)', value: String(counts['Contract Signed'] + counts.Onboarding), icon: 'timer', tone: 'blue', ...i.kpiExtras['Onboarding (In Progress)'] },
    { label: 'Tenant Quota Used', value: `${used} / ${i.quota.toLocaleString('en-US')}`, icon: 'database', tone: 'green', progress: used / i.quota, caption: `${i.quota - used} available` },
  ];
  const pick = (k: TabKey) => {
    setTab(k);
    setPage(1);
  };
  return { list, rows, shown, counts, tab, setTab: pick, query, setQuery, page: p, pages, setPage, move, stats, selected, toggle };
}
type U = ReturnType<typeof useInstitutions>;

function tabCount(u: U, k: TabKey): number {
  return k === 'all' ? u.counts.all : k === 'bottomUp' ? u.counts.bottomUp : u.counts[k];
}

function Logo({ color, name }: { color: string; name: string }) {
  return (
    <View style={[styles.logo, { backgroundColor: color }]}>
      <Text style={styles.logoText}>{name[0]}</Text>
    </View>
  );
}

function schoolCols(u: U): readonly Column<SchoolRow>[] {
  return [
    { label: '#', width: 30, render: (s) => <Cell small>{s.n}</Cell> },
    {
      label: 'School Name',
      flex: 1.6,
      render: (s) => (
        <View style={styles.inline}>
          <Logo color={s.color} name={s.name} />
          <Cell small strong>
            {s.name}
          </Cell>
        </View>
      ),
    },
    {
      label: 'Location',
      flex: 1.4,
      render: (s) => (
        <View style={styles.inline}>
          <Flag code={s.flag} size={14} />
          <Cell small>{s.city}</Cell>
        </View>
      ),
    },
    { label: 'Teachers', width: 66, align: 'center', render: (s) => <Cell small>{s.teachers}</Cell> },
    { label: 'Students', width: 66, align: 'center', render: (s) => <Cell small>{s.students}</Cell> },
    {
      label: 'Status',
      width: 150,
      render: (s) => {
        const st = STAGE_PILL[s.stage];
        return <Pill label={st.label} tone={st.tone} icon={st.icon} size={11} />;
      },
    },
    { label: 'Subscription Plan', width: 110, render: (s) => <Cell small>{s.plan || '—'}</Cell> },
    {
      label: 'Next Action',
      width: 128,
      render: (s) => {
        const next = nextAction(s);
        if (next === '—') return <Cell small>—</Cell>;
        return (
          <Pressable onPress={() => u.move(s)} accessibilityRole="button" accessibilityLabel={`${next} for ${s.name}`} hitSlop={4}>
            <Text style={styles.action} numberOfLines={1}>
              {next}
            </Text>
          </Pressable>
        );
      },
    },
    { label: 'Owner', width: 76, render: (s) => <Cell small>{s.owner}</Cell> },
    { label: 'Last Activity', width: 92, render: (s) => <Cell small>{s.last}</Cell> },
  ];
}

function Growth({ i, phone = false }: { i: I; phone?: boolean }) {
  const g = i.growth;
  const [win, setWin, wins] = useChoice(g.windows);
  const series = [
    { name: 'Total Registered', color: CHART.blue, values: g.total },
    { name: 'Active Tenants', color: CHART.green, values: g.active },
    { name: 'Bottom-Up Opportunities', color: Maple.blueLine, values: g.bottomUp },
    { name: 'Enterprise', color: CHART.orange, values: g.enterprise.map((v) => v * 6) },
  ];
  return (
    <Panel title="School Growth Trend" right={<CmdSelect value={win} options={wins} onChange={setWin} width={136} label="Window" />} style={[styles.block, !phone && styles.colGrowth]}>
      <View style={styles.legendRow}>
        {series.map((s) => (
          <View key={s.name} style={styles.legend}>
            <View style={[styles.dot, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.name}</Text>
          </View>
        ))}
      </View>
      <ComboChart labels={g.months} bars={series} max={1500} ticks={5} height={phone ? 190 : 214} format={(v) => v.toLocaleString('en-US')} />
    </Panel>
  );
}

function Pipeline({ i, phone = false }: { i: I; phone?: boolean }) {
  const [region, setRegion, regions] = useChoice(i.regionsFilter);
  return (
    <Panel title="Onboarding Pipeline" right={<CmdSelect value={region} options={regions} onChange={setRegion} width={128} label="Region" />} style={[styles.block, !phone && styles.colFunnel]}>
      <View style={styles.funnelRow}>
        <Funnel stages={i.funnel.map((f) => ({ value: f.value, color: f.color }))} width={phone ? 150 : 160} band={34} gap={6} />
        <View style={styles.funnelLegend}>
          {i.funnel.map((f) => (
            <View key={f.label} style={styles.funnelItem}>
              <View style={[styles.dot, { backgroundColor: f.color }]} />
              <View>
                <Text style={styles.funnelLabel}>{f.label}</Text>
                <Text style={styles.funnelSub}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Panel>
  );
}

function ByRegion({ i, phone = false }: { i: I; phone?: boolean }) {
  const values = Object.fromEntries(i.byRegion.map((r) => [r.code, r.schools]));
  return (
    <Panel title="Bottom-Up Opportunities by Region" onAll={() => toast('Every region, with the schools behind each number.')} style={[styles.block, !phone && styles.flex]}>
      <View style={[styles.regionBody, phone && styles.regionBodyPhone]}>
        <View style={styles.mapCol}>
          <AfricaMap values={values} width={phone ? 240 : 165} />
        </View>
        <View style={styles.flex}>
          <View style={styles.regionRow}>
            <Text style={[styles.regionHead, styles.flex]}>Region</Text>
            <Text style={[styles.regionHead, styles.num]}>Schools</Text>
            <Text style={[styles.regionHead, styles.num]}>Growth</Text>
          </View>
          {i.byRegion.map((r) => (
            <View key={r.country} style={styles.regionRow}>
              <Flag code={r.code} size={14} />
              <Text style={[styles.regionName, styles.flex]}>{r.country}</Text>
              <Text style={[styles.regionName, styles.num]}>{r.schools}</Text>
              <Text style={[styles.regionGrowth, styles.num]}>{r.growth}</Text>
            </View>
          ))}
        </View>
      </View>
      <HeatScale low="Fewer" high="More opportunities" />
    </Panel>
  );
}

/** Maple Command › Institutions & School Onboarding Pipeline on the desktop reference. */
export function InstitutionsDesk({ c }: { c: CommandData }) {
  const i = c.institutions;
  const u = useInstitutions(i);
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search schools, contacts, regions, or reference numbers..." active="Institutions">
      <CmdHead
        icon="building"
        title="Institutions & School Onboarding Pipeline"
        subtitle="Monitor registered schools, identify bottom-up opportunities, manage enterprise contracts and track tenant growth."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="Add School" icon="plus" chevron onPress={() => toast('Add a school: name, country, admin email and plan. Or import a list.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {u.stats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <Growth i={i} />
        <Pipeline i={i} />
        <ByRegion i={i} />
      </View>
      <View style={styles.tableCard}>
        <View style={styles.tabsRow}>
          <CountTabs tabs={TABS.map((x) => ({ label: x.label, count: tabCount(u, x.key), tone: x.tone }))} active={TABS.find((x) => x.key === u.tab)?.label ?? ''} onChange={(l) => u.setTab(TABS.find((x) => x.label === l)?.key ?? 'all')} size={12.5} dense style={[styles.flex, styles.noWrap]} />
          <Search placeholder="Search schools by name, contact, or reference..." value={u.query} onChange={u.setQuery} style={styles.search} />
          <OutlineBtn label="Filters" icon="filter" onPress={() => toast('Filter by country, plan, owner, teachers and last activity.')} />
        </View>
        <DataTable columns={schoolCols(u)} rows={u.rows} rowKey={(s) => s.id} check selected={u.selected} onToggle={u.toggle} menu onMenu={(s) => u.move(s)} compact />
        <View style={styles.footer}>
          <View style={styles.flex}>
            <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length.toLocaleString('en-US')} schools`} page={u.page} pages={u.pages} onPage={u.setPage} />
          </View>
          <OutlineBtn label="Export CSV" icon="download" onPress={() => exportMenu('Schools')} />
        </View>
      </View>
    </CommandDesk>
  );
}

/** The phone version: counts, charts stacked, then the schools as cards. */
export function InstitutionsPhone({ c }: { c: CommandData }) {
  const i = c.institutions;
  const u = useInstitutions(i);
  return (
    <CommandPhone me={c.me}>
      <PageHead title="Institutions" subtitle="Schools, bottom-up opportunities, contracts and tenant growth." phone />
      <PrimaryBtn label="Add School" icon="plus" onPress={() => toast('Add a school: name, country, admin email and plan.')} />
      <KpiGrid items={u.stats} />
      <Growth i={i} phone />
      <Pipeline i={i} phone />
      <ByRegion i={i} phone />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={TABS.map((x) => ({ label: x.label, count: tabCount(u, x.key), tone: x.tone }))} active={TABS.find((x) => x.key === u.tab)?.label ?? ''} onChange={(l) => u.setTab(TABS.find((x) => x.label === l)?.key ?? 'all')} size={13} style={styles.noWrap} />
      </ScrollView>
      <Search placeholder="Search schools" value={u.query} onChange={u.setQuery} />
      {u.rows.map((s) => {
        const st = STAGE_PILL[s.stage];
        const next = nextAction(s);
        return (
          <View key={s.id} style={styles.card}>
            <View style={styles.inline}>
              <Logo color={s.color} name={s.name} />
              <View style={styles.flex}>
                <Text style={styles.cardTitle}>{s.name}</Text>
                <View style={styles.inline}>
                  <Flag code={s.flag} size={12} />
                  <Text style={styles.small}>{`${s.city} • ${s.teachers} teachers • ${s.students} students`}</Text>
                </View>
              </View>
            </View>
            <View style={styles.inline}>
              <Pill label={st.label} tone={st.tone} icon={st.icon} size={11.5} />
              <Text style={styles.small}>{s.plan || 'No plan'}</Text>
              {next !== '—' ? (
                <Pressable style={styles.pushRight} onPress={() => u.move(s)} accessibilityRole="button" accessibilityLabel={`${next} for ${s.name}`}>
                  <Text style={styles.action}>{`${next} ›`}</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        );
      })}
      <PageStrip label={`${u.shown.length.toLocaleString('en-US')} schools`} page={u.page} pages={u.pages} onPage={u.setPage} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  block: { gap: 10 },
  small: { fontSize: 11.5, color: BODY },
  pushRight: { marginLeft: 'auto' },
  noWrap: { flexWrap: 'nowrap' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  colGrowth: { flex: 1.3 },
  colFunnel: { flex: 0.95 },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendText: { fontSize: 11.5, color: BODY },
  dot: { width: 9, height: 9, borderRadius: 5 },
  funnelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  funnelLegend: { flex: 1, gap: 6 },
  funnelItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  funnelLabel: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  funnelSub: { fontSize: 11.5, color: BODY },
  regionBody: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  regionBodyPhone: { flexDirection: 'column', alignItems: 'stretch' },
  mapCol: { alignItems: 'center' },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 7, height: 23 },
  regionHead: { fontSize: 12, fontWeight: '700', color: NAVY },
  num: { width: 44, textAlign: 'right' },
  regionName: { fontSize: 12.5, color: NAVY },
  regionGrowth: { fontSize: 12.5, fontWeight: '600', color: GREEN },
  tableCard: { gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  tabsRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  search: { width: 230 },
  logo: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 11, fontWeight: '800', color: WHITE },
  action: { fontSize: 12, fontWeight: '600', color: BLUE },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  card: { gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cardTitle: { fontSize: 14, fontWeight: '700', color: NAVY },
});

