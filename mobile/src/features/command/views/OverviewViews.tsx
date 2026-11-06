import { Image } from '@/components/picture';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { AfricaMap, ComboChart, HeatScale } from '@/features/command/kit/CmdCharts';
import { CmdSelect, Flag, OutlineBtn, Panel, RangeBox } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone, LivePill } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { CHART } from '@/features/command/kit/tokens';
import { carouselPage, conversionRate, retentionShade } from '@/features/command/logic/overview';
import { IconTile } from '@/features/portal/PortalParts';
import { PremiumTile } from '@/features/portal/Premium';
import { BLUE, BODY, GREEN, LINE, NAVY, TONES, WHITE } from '@/features/portal/tokens';
import { PageHead, useChoice } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { Cohort } from '@/mock/command-center/overview';
import { Maple } from '@/constants/maple';

type O = CommandData['overview'];
const fmtK = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`);
const refresh = () => toast('Overview refreshed. Figures are at most 2 minutes old.');

/** One North-Star tile: tinted card, icon, two-line label, the value in its colour, the change and where it came from. */
function NorthTile({ k }: { k: O['northStar'][number] }) {
  const t = TONES[k.tone];
  return (
    <View style={[styles.north, { backgroundColor: t.soft + 'B0', borderColor: t.soft }]} accessible accessibilityLabel={`${k.label}: ${k.value}, up ${k.delta}, ${k.from}`}>
      <Icon name={k.icon} size={30} color={t.solid} />
      <Text style={[styles.northLabel, { color: t.text }]} numberOfLines={2}>
        {k.label}
      </Text>
      <Text style={[styles.northValue, { color: t.text }, k.value.length > 8 && styles.northValueLong]} numberOfLines={1}>
        {k.value}
      </Text>
      <View style={styles.northDelta}>
        <Icon name="arrowUp" size={14} color={GREEN} />
        <Text style={styles.northDeltaText}>{k.delta}</Text>
      </View>
      <Text style={styles.northFrom}>{k.from}</Text>
    </View>
  );
}

function NorthStar({ o, phone = false }: { o: O; phone?: boolean }) {
  const [period, setPeriod, periods] = useChoice(o.periods);
  return (
    <Panel
      title="North-Star Metrics"
      badge={phone ? undefined : <Icon name="info" size={16} color={BODY} />}
      right={
        phone ? undefined : (
          <View style={styles.updated}>
            <Text style={styles.muted}>{`Last updated: ${o.updated}`}</Text>
            <View style={styles.greenDot} />
            <CmdSelect value={period} options={periods} onChange={setPeriod} width={112} label="Period" />
          </View>
        )
      }
      style={styles.block}>
      <Text style={styles.subtle}>The 8 key metrics we track to measure sustainable growth and long-term success.</Text>
      <View style={[styles.northRow, phone && styles.northGrid]}>
        {o.northStar.map((k) => (
          <View key={k.label} style={phone ? styles.half : styles.flex}>
            {phone ? <PremiumTile item={{ label: k.label, value: k.value, icon: k.icon, tone: k.tone, delta: k.delta, caption: k.from }} /> : <NorthTile k={k} />}
          </View>
        ))}
      </View>
    </Panel>
  );
}

function Signups({ o, phone = false }: { o: O; phone?: boolean }) {
  const s = o.signups;
  const [win, setWin, wins] = useChoice(s.windows);
  const nums = [
    { v: s.visited.toLocaleString('en-US'), l: 'Visited' },
    { v: s.started.toLocaleString('en-US'), l: 'Started Signup' },
    { v: s.completed.toLocaleString('en-US'), l: 'Completed' },
    { v: conversionRate(s.started, s.completed), l: 'Conversion', green: true },
  ];
  return (
    <Panel title="User Signups & Conversion" right={<CmdSelect value={win} options={wins} onChange={setWin} width={128} label="Window" />} style={[styles.block, !phone && styles.colSignups]}>
      <View style={[styles.signNums, phone && styles.signNumsPhone]}>
        {nums.map((n) => (
          <View key={n.l} style={phone ? styles.half : styles.flex}>
            <Text style={[styles.bigNum, n.green && styles.greenText]}>{n.v}</Text>
            <Text style={styles.muted}>{n.l}</Text>
          </View>
        ))}
      </View>
      <ComboChart
        labels={Array.from({ length: s.visitors.length }, (_, i) => (i % 5 === 0 || i === s.visitors.length - 1 ? `Oct ${i + 1}` : ''))}
        bars={[
          { name: 'Visitors', color: CHART.paleBlue, values: s.visitors.map((v) => v * 1.4) },
          { name: 'Started Signup', color: CHART.lightBlue, values: s.startedDaily.map((v) => v * 1.6) },
          { name: 'Completed Signup', color: CHART.blue, values: s.completedDaily.map((v) => v * 2) },
        ]}
        max={10000}
        line={{ name: 'Conversion Rate', color: CHART.green, values: s.conversion }}
        lineMax={52}
        rightAxis={false}
        format={fmtK}
        height={phone ? 150 : 132}
      />
      <View style={styles.legendRow}>
        {[
          ['Visitors', CHART.paleBlue],
          ['Started Signup', CHART.lightBlue],
          ['Completed Signup', CHART.blue],
          ['Conversion Rate', CHART.green],
        ].map(([l, c]) => (
          <View key={l} style={styles.legend}>
            <View style={[styles.legendSq, { backgroundColor: c }]} />
            <Text style={styles.legendText}>{l}</Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}

function CohortCell({ v }: { v: number | null }) {
  const s = retentionShade(v);
  return (
    <View style={[styles.heat, { backgroundColor: s.bg }]}>
      <Text style={[styles.heatText, { color: s.text }]}>{v === null ? '–' : `${v}%`}</Text>
    </View>
  );
}

function Cohorts({ o, phone = false }: { o: O; phone?: boolean }) {
  const [win, setWin, wins] = useChoice(o.cohortWindows);
  const head = ['Cohort', 'Size', 'Day 1', 'Day 7', 'Day 30'];
  return (
    <Panel title="Retention Cohorts" right={phone ? undefined : <CmdSelect value={win} options={wins} onChange={setWin} width={190} label="Cohorts" />} style={[styles.block, !phone && styles.flex]}>
      <View style={styles.cohortTable}>
        <View style={[styles.cohortRow, styles.cohortHeadRow]}>
          {head.map((h, i) => (
            <Text key={h} style={[styles.cohortHead, i === 0 ? styles.cohortFirst : styles.cohortCol]}>
              {h}
            </Text>
          ))}
        </View>
        {o.cohorts.map((c: Cohort) => (
          <View key={c.cohort} style={styles.cohortRow} accessible accessibilityLabel={`${c.cohort}: ${c.size} signups, day 1 ${c.d1}%, day 7 ${c.d7}%, day 30 ${c.d30 ?? 'not yet'}`}>
            <Text style={[styles.cohortName, styles.cohortFirst]}>{c.cohort}</Text>
            <Text style={[styles.cohortSize, styles.cohortCol]}>{c.size.toLocaleString('en-US')}</Text>
            <View style={styles.cohortCol}>
              <CohortCell v={c.d1} />
            </View>
            <View style={styles.cohortCol}>
              <CohortCell v={c.d7} />
            </View>
            <View style={styles.cohortCol}>
              <CohortCell v={c.d30} />
            </View>
          </View>
        ))}
      </View>
    </Panel>
  );
}

function ClassCard({ k, width }: { k: O['live']['classes'][number]; width: number }) {
  return (
    <Pressable style={[styles.classCard, { width }]} onPress={() => toast(`Joining ${k.title} with ${k.teacher} as a silent observer.`)} accessibilityRole="button" accessibilityLabel={`${k.title} with ${k.teacher}, ${k.students} students, live`}>
      <View>
        <Image source={k.photo} style={styles.classPhoto} contentFit="cover" />
        <View style={styles.liveBadge}>
          <View style={styles.liveBadgeDot} />
          <Text style={styles.liveBadgeText}>LIVE</Text>
        </View>
        <View style={styles.studentsBadge}>
          <Icon name="people" size={12} color={WHITE} />
          <Text style={styles.studentsText}>{k.students}</Text>
        </View>
      </View>
      <Text style={styles.classTitle} numberOfLines={1}>
        {k.title}
      </Text>
      <Text style={styles.classTeacher} numberOfLines={1}>
        {k.teacher}
      </Text>
      <View style={styles.classBar}>
        <View style={[styles.classBarFill, { width: `${k.progress * 100}%` }]} />
      </View>
    </Pressable>
  );
}

function LiveNow({ o, phone = false }: { o: O; phone?: boolean }) {
  const l = o.live;
  const [page, setPage] = useState(0);
  const cards = carouselPage(l.classes, page, 3);
  const legend: readonly [number, string, string][] = [
    [l.teaching, 'Teaching now', Maple.success],
    [l.upcoming, 'Upcoming (next 30 min)', BLUE],
    [l.ended, 'Ended (last 30 min)', Maple.borderStrong],
  ];
  return (
    <Panel title="Live Classes Now" onAll={() => router.push('/command/ops' as never)} style={[styles.block, !phone && styles.colLive]}>
      <View style={styles.liveTop}>
        <View>
          <Text style={styles.liveNum}>{l.inProgress.toLocaleString('en-US')}</Text>
          <Text style={styles.muted}>classes in progress</Text>
        </View>
        <View style={styles.liveLegend}>
          {legend.map(([n, t, color]) => (
            <View key={t} style={styles.legend}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text style={styles.liveLegendNum}>{n}</Text>
              <Text style={styles.legendText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classRow}>
          {l.classes.map((k) => (
            <ClassCard key={k.title} k={k} width={128} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.classRow}>
          {cards.map((k) => (
            <ClassCard key={k.title} k={k} width={104} />
          ))}
          <Pressable style={styles.next} onPress={() => setPage((p) => p + 1)} accessibilityRole="button" accessibilityLabel="More live classes">
            <Icon name="chevronRight" size={18} color={BLUE} />
          </Pressable>
        </View>
      )}
    </Panel>
  );
}

function Regions({ o, phone = false }: { o: O; phone?: boolean }) {
  const values = Object.fromEntries(o.regions.map((r) => [r.code, r.users]));
  return (
    <Panel title="Regional Growth" style={[styles.block, !phone && styles.colRegions]}>
      <Text style={styles.subtle}>New users by country/region (last 30 days)</Text>
      <View style={[styles.regionBody, phone && styles.regionBodyPhone]}>
        <View style={styles.mapCol}>
          <AfricaMap values={values} width={phone ? 260 : 250} />
        </View>
        <View style={styles.flex}>
          <View style={styles.regionRow}>
            <Text style={[styles.regionHead, styles.flex]}>Top Regions</Text>
            <Text style={[styles.regionHead, styles.regionNum]}>Users</Text>
            <Text style={[styles.regionHead, styles.regionNum]}>Growth</Text>
          </View>
          {o.regions.map((r) => (
            <View key={r.country} style={styles.regionRow}>
              <Flag code={r.code} size={15} />
              <Text style={[styles.regionName, styles.flex]}>{r.country}</Text>
              <Text style={[styles.regionVal, styles.regionNum]}>{r.users.toLocaleString('en-US')}</Text>
              <Text style={[styles.regionGrowth, styles.regionNum]}>{r.growth}</Text>
            </View>
          ))}
        </View>
      </View>
      <HeatScale low="Fewer users" high="More users" />
    </Panel>
  );
}

function Gmv({ o, phone = false }: { o: O; phone?: boolean }) {
  const g = o.gmv;
  const [win, setWin, wins] = useChoice(g.windows);
  const legend: readonly [string, string][] = [
    ['Tuition Fees', CHART.blue],
    ['Resources', CHART.teal],
    ['Other', Maple.blueLine],
  ];
  return (
    <Panel title="GMV Trend" right={<CmdSelect value={win} options={wins} onChange={setWin} width={134} label="Window" />} style={[styles.block, !phone && styles.flex]}>
      <Text style={styles.gmvTotal}>{`UGX ${g.total.toLocaleString('en-US')}`}</Text>
      <View style={styles.legend}>
        <Icon name="arrowUp" size={15} color={GREEN} />
        <Text style={styles.gmvDelta}>{`${g.delta} from last month`}</Text>
      </View>
      <ComboChart
        labels={g.months}
        bars={[
          { name: 'Tuition Fees', color: CHART.blue, values: g.tuition },
          { name: 'Resources', color: CHART.teal, values: g.resources },
          { name: 'Other', color: Maple.blueLine, values: g.other },
        ]}
        mode="stacked"
        max={200}
        format={(v) => (v ? `${v}M` : '0')}
        height={phone ? 160 : 150}
      />
      <View style={styles.legendRow}>
        {legend.map(([l, color]) => (
          <View key={l} style={styles.legend}>
            <View style={[styles.legendSq, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{l}</Text>
          </View>
        ))}
      </View>
    </Panel>
  );
}

function Activity({ o, phone = false }: { o: O; phone?: boolean }) {
  return (
    <Panel title="Recent Activity" onAll={() => router.push('/command/security/audit-logs' as never)} style={[styles.block, !phone && styles.colActivity]}>
      {o.activity.map((a) => (
        <View key={a.title} style={styles.act}>
          <IconTile icon={a.icon} tone={a.tone} size={34} radius={9} iconSize={18} />
          <View style={styles.flex}>
            <Text style={styles.actTitle} numberOfLines={1}>
              {a.title}
            </Text>
            <Text style={styles.actBody} numberOfLines={2}>
              {a.body}
            </Text>
          </View>
          <Text style={styles.actWhen}>{a.when}</Text>
        </View>
      ))}
    </Panel>
  );
}

/** Maple Command › Executive Overview on the desktop reference. */
export function OverviewDesk({ c }: { c: CommandData }) {
  const o = c.overview;
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search users, schools, classes, payments, or reports..." active="Overview">
      <CmdHead
        icon="home"
        title="Executive Overview"
        subtitle="Real-time performance, user engagement, and growth across the Maple Global Online School platform."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={252} />
            <LivePill />
            <OutlineBtn icon="sync" onPress={refresh} />
          </>
        }
      />
      <NorthStar o={o} />
      <View style={styles.row}>
        <Signups o={o} />
        <Cohorts o={o} />
        <LiveNow o={o} />
      </View>
      <View style={styles.row}>
        <Regions o={o} />
        <Gmv o={o} />
        <Activity o={o} />
      </View>
    </CommandDesk>
  );
}

/** The phone version: the same sections stacked, live classes as a sideways strip. */
export function OverviewPhone({ c }: { c: CommandData }) {
  const o = c.overview;
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandPhone me={c.me}>
      <PageHead title="Executive Overview" subtitle="Real-time performance, engagement and growth across Maple." phone />
      <View style={styles.phoneControls}>
        <View style={styles.flex}>
          <RangeBox value={range} options={c.ranges} onChange={setRange} />
        </View>
        <OutlineBtn icon="sync" onPress={refresh} />
      </View>
      <NorthStar o={o} phone />
      <Signups o={o} phone />
      <Cohorts o={o} phone />
      <LiveNow o={o} phone />
      <Regions o={o} phone />
      <Gmv o={o} phone />
      <Activity o={o} phone />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  half: { width: '50%', paddingHorizontal: 5 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  block: { gap: 10 },
  muted: { fontSize: 13, color: BODY },
  subtle: { marginTop: -6, fontSize: 12.5, color: BODY },
  greenText: { color: GREEN },
  updated: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Maple.success },
  northRow: { flexDirection: 'row', gap: 10 },
  northGrid: { flexWrap: 'wrap', marginHorizontal: -5, gap: 0, rowGap: 10 },
  north: { alignItems: 'center', gap: 4, minHeight: 178, paddingVertical: 14, paddingHorizontal: 6, borderRadius: 12, borderWidth: 1 },
  northPhone: { minHeight: 160 },
  northLabel: { minHeight: 34, fontSize: 13, fontWeight: '600', textAlign: 'center' },
  northValue: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  northValuePhone: { fontSize: 24 },
  northValueLong: { fontSize: 22 },
  northDelta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  northDeltaText: { fontSize: 14, fontWeight: '700', color: GREEN },
  northFrom: { fontSize: 12.5, color: BODY },
  colSignups: { flex: 1.3 },
  colLive: { flex: 0.95 },
  colRegions: { flex: 1.3 },
  colActivity: { flex: 0.95 },
  signNums: { flexDirection: 'row', gap: 10 },
  signNumsPhone: { flexWrap: 'wrap', marginHorizontal: -5, gap: 0, rowGap: 8 },
  bigNum: { fontSize: 20, fontWeight: '800', color: NAVY },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSq: { width: 12, height: 12, borderRadius: 3 },
  legendText: { fontSize: 12.5, color: NAVY },
  cohortTable: { borderRadius: 10, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  cohortRow: { flexDirection: 'row', alignItems: 'center', height: 36, borderBottomWidth: 1, borderColor: LINE },
  cohortHeadRow: { backgroundColor: Maple.blueSoft },
  cohortHead: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  cohortFirst: { width: 86, paddingLeft: 10 },
  cohortCol: { flex: 1, alignItems: 'stretch', textAlign: 'center' },
  cohortName: { fontSize: 12.5, color: NAVY },
  cohortSize: { fontSize: 12.5, color: BODY },
  heat: { height: 35, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderColor: WHITE },
  heatText: { fontSize: 12.5, fontWeight: '600' },
  // Wraps on narrow phones so the legend moves under the number instead of running off the edge.
  liveTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', gap: 10 },
  liveNum: { fontSize: 26, fontWeight: '800', color: NAVY },
  liveLegend: { marginLeft: 'auto', gap: 4, flexShrink: 1 },
  liveLegendNum: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  dot: { width: 9, height: 9, borderRadius: 5 },
  classRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  classCard: { gap: 4 },
  classPhoto: { width: '100%', height: 66, borderRadius: 8 },
  liveBadge: { position: 'absolute', top: 5, right: 5, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4, backgroundColor: Maple.error },
  liveBadgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: WHITE },
  liveBadgeText: { fontSize: 9.5, fontWeight: '800', color: WHITE },
  studentsBadge: { position: 'absolute', bottom: 5, right: 5, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 5, paddingVertical: 1.5, borderRadius: 4, backgroundColor: 'rgba(15,23,42,0.55)' },
  studentsText: { fontSize: 11, fontWeight: '700', color: WHITE },
  classTitle: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  classTeacher: { fontSize: 11.5, color: BODY },
  classBar: { height: 5, borderRadius: 3, backgroundColor: Maple.blueSelected, overflow: 'hidden' },
  classBarFill: { height: 5, borderRadius: 3, backgroundColor: Maple.success },
  next: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: LINE, alignItems: 'center', justifyContent: 'center', backgroundColor: WHITE },
  regionBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  regionBodyPhone: { flexDirection: 'column', alignItems: 'stretch' },
  mapCol: { alignItems: 'center' },
  regionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 22 },
  regionHead: { fontSize: 12, fontWeight: '700', color: NAVY },
  regionNum: { width: 46, textAlign: 'right' },
  regionName: { fontSize: 12.5, color: NAVY },
  regionVal: { fontSize: 12.5, color: NAVY },
  regionGrowth: { fontSize: 12.5, fontWeight: '600', color: GREEN },
  gmvTotal: { marginTop: -2, fontSize: 24, fontWeight: '800', color: NAVY },
  gmvDelta: { fontSize: 13.5, fontWeight: '600', color: GREEN },
  act: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  actTitle: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  actBody: { fontSize: 11.5, color: BODY },
  actWhen: { fontSize: 11.5, color: BODY },
  phoneControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
