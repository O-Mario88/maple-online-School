import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar, Btn, Card, CardHead, IconTile, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, RED, TONES, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

import { AdminDesk, AdminPhone, BigButton, Cell, type Column, DataTable, Face, Legend, ListCard, ListRow, PageHead, SelectBox, Segments, type Stat, StatGrid, useChoice } from '../kit/AdminKit';
import { Donut, DonutLabel, LineChart } from '../kit/Charts';
import { ScannerPanel } from './Scanner';

type Admin = MockData['schoolAdmin'];
type Att = Admin['attendance'];
type ClassRow = Att['byClass'][number];

const goScan = () => router.push('/admin/scan' as never);

/** A tinted stat tile from the top row. */
function TopStat({ s }: { s: Att['stats'][number] }) {
  const t = TONES[s.tone];
  return (
    <View style={styles.top}>
      <View style={styles.topHead}>
        <View style={[styles.topIcon, { backgroundColor: t.soft }]}>
          <Icon name={s.icon} size={28} color={t.solid} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.topValue}>{s.value}</Text>
          <Text style={styles.topLabel}>{s.label}</Text>
        </View>
      </View>
      <Text style={[styles.topSub, s.subTone && { color: TONES[s.subTone].text }]} numberOfLines={1}>
        {s.sub}
      </Text>
    </View>
  );
}

/** Attendance & QR Access on the desktop reference. */
export function AttendanceDesk({ a }: { a: Admin }) {
  const at = a.attendance;
  const [who, setWho] = useState('All');
  const [campus, setCampus, campuses] = useChoice(a.campuses);
  const [weeks, setWeeks, weekOpts] = useChoice(['Last 4 Weeks', 'This Term']);
  const o = at.overview;
  const cCols: readonly Column<ClassRow>[] = [
    { label: 'Grade', flex: 1.3, render: (x) => <Cell strong>{x.grade}</Cell> },
    { label: 'Total', flex: 0.7, align: 'center', render: (x) => <Cell>{x.enrolled}</Cell> },
    { label: 'Present', flex: 1.05, align: 'center', render: (x) => <Cell strong color={GREEN}>{x.present}</Cell> },
    { label: 'Late', flex: 0.6, align: 'center', render: (x) => <Cell strong color="#D97F06">{x.late}</Cell> },
    { label: 'Absent', flex: 1, align: 'center', render: (x) => <Cell strong color={RED}>{x.absent}</Cell> },
    { label: 'Rate', flex: 1, align: 'center', render: (x) => <Pill label={x.rate} tone="green" size={12.5} /> },
  ];
  return (
    <AdminDesk me={a.me} search="Search students, teachers, classes, or reports..." active="Attendance">
      <PageHead
        title="Attendance & QR Access"
        subtitle="Real-time attendance, punctuality, and campus entry/exit tracking for students and teachers."
        right={
          <>
            <Segments items={['All', 'Students', 'Teachers']} active={who} onChange={setWho} />
            <SelectBox value={campus} options={campuses} onChange={setCampus} width={170} />
            <SelectBox value={at.date} options={[at.date, 'Mon, Mar 9, 2026']} onChange={() => toast('Showing Monday, Mar 9, 2026.')} width={180} />
          </>
        }
      />
      <View style={styles.tops}>
        {at.stats.map((s) => (
          <TopStat key={s.label} s={s} />
        ))}
      </View>
      <View style={styles.row}>
        <View style={styles.main}>
          <View style={styles.row}>
            <Card style={[styles.block, styles.flex]}>
              <CardHead title="Today's Attendance Overview" size={17} />
              <View style={styles.overview}>
                <Donut
                  slices={[
                    { value: o.present, color: '#22A55A' },
                    { value: o.late, color: '#F7A21B' },
                    { value: o.absent, color: '#EF3B4D' },
                  ]}
                  size={128}
                  stroke={18}>
                  <DonutLabel value={o.rate} caption="Present" size={21} />
                </Donut>
                <View style={styles.flex}>
                  <Legend color="#22A55A" label="Present" value={o.present.toLocaleString('en-US')} style={styles.ovRow} />
                  <Legend color="#F7A21B" label="Late" value={String(o.late)} style={styles.ovRow} />
                  <Legend color="#EF3B4D" label="Absent" value={String(o.absent)} style={styles.ovRow} />
                  <View style={styles.ovTotal}>
                    <Text style={styles.ovTotalText}>Total</Text>
                    <Text style={styles.ovTotalNum}>{o.total.toLocaleString('en-US')}</Text>
                  </View>
                </View>
              </View>
            </Card>
            <Card style={[styles.block, styles.flex]}>
              <CardHead title="Attendance Trend" size={17} right={<SelectBox value={weeks} options={weekOpts} onChange={setWeeks} width={150} />} />
              <LineChart
                labels={at.trend.labels}
                series={[
                  { name: 'Students', color: '#1E6BF0', values: at.trend.students },
                  { name: 'Teachers', color: '#8B3CF0', values: at.trend.teachers },
                ]}
                min={90}
                max={100}
                height={160}
                format={(n) => `${Math.round(n)}%`}
              />
              <View style={styles.legendRow}>
                <Legend color="#1E6BF0" label="Students (Avg. 94.2%)" />
                <Legend color="#8B3CF0" label="Teachers (Avg. 97.6%)" />
              </View>
            </Card>
            <Card style={[styles.block, styles.flex]}>
              <CardHead title="Punctuality (On-Time Rate)" size={17} />
              {at.punctuality.map((p) => (
                <View key={p.who} style={styles.punct}>
                  <IconTile icon={p.icon} tone={p.tone} size={44} radius={10} />
                  <View style={styles.flex}>
                    <View style={styles.punctHead}>
                      <Text style={styles.punctWho}>{p.who}</Text>
                      <Text style={styles.punctPct}>{`${p.pct}%`}</Text>
                    </View>
                    <View style={styles.punctBar}>
                      <Bar value={p.pct / 100} color={TONES[p.tone].solid} height={10} style={styles.flex} />
                      <Text style={styles.delta}>{p.delta}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          </View>
          <View style={styles.row}>
            <Card style={[styles.block, styles.colClass]}>
              <CardHead title="Attendance by Grade/Class" size={17} link="View All" onLink={() => toast('Every class, with this week and term-to-date.')} />
              <DataTable columns={cCols} rows={at.byClass} rowKey={(x) => x.grade} dense />
            </Card>
            <Card style={[styles.block, styles.flex]}>
              <CardHead title="Teacher Attendance & Punctuality" size={17} link="View All" onLink={() => toast('Gate arrival, lesson starts and leave, by teacher.')} />
              {at.teachers.map((t) => (
                <View key={t.status} style={styles.tRow}>
                  <IconTile icon={t.icon} tone={t.tone} solid size={26} radius={13} iconSize={15} />
                  <Text style={styles.tStatus}>{t.status}</Text>
                  <Text style={styles.tCount}>{t.count}</Text>
                  <Text style={styles.tPct}>{t.pct}</Text>
                  <Bar value={t.value} color={TONES[t.tone].solid} height={8} style={styles.tBar} />
                </View>
              ))}
            </Card>
            <Card style={[styles.block, styles.colGate]}>
              <CardHead title="Gate & Campus Activity" size={17} />
              {at.gate.map((g) => (
                <View key={g.label} style={styles.gRow}>
                  <Icon name={g.icon} size={20} color={TONES[g.tone].solid} />
                  <Text style={styles.gLabel}>{g.label}</Text>
                  <Text style={styles.gValue}>{g.value}</Text>
                </View>
              ))}
            </Card>
          </View>
          <View style={styles.row}>
            <Card style={[styles.block, styles.colAlerts]}>
              <CardHead title="Recent Alerts & Actions" size={17} link="View All" onLink={() => toast('All exceptions: lateness, missed scans, early exits and corrections.')} />
              {at.alerts.map((x, i) => (
                <ListRow key={x.title} last={i === at.alerts.length - 1} lead={<IconTile icon={x.icon} tone={x.tone} size={34} radius={17} />} title={x.title} body={x.body} right={<Text style={styles.when}>{x.when}</Text>} />
              ))}
            </Card>
            <Card style={[styles.block, styles.flex]}>
              <CardHead title="Other Tracking & Insights" size={17} />
              <View style={styles.insights}>
                {at.insights.map((x) => (
                  <View key={x.label} style={styles.insight}>
                    <Icon name={x.icon} size={28} color={TONES[x.tone].solid} />
                    <Text style={styles.insightLabel}>{x.label}</Text>
                    <Text style={styles.insightValue}>{x.value}</Text>
                    <Text style={[styles.delta, x.delta.includes('Absent') && { color: RED }]}>{x.delta}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        </View>
        <View style={styles.side}>
          <ScannerPanel a={a} />
          <Card style={styles.block}>
            <CardHead title="Live Gate Activity" size={17} right={<Pill label="Live" tone="green" icon="live" size={12} />} />
            {at.live.map((p, i) => (
              <ListRow
                key={p.name}
                last={i === at.live.length - 1}
                lead={<Face source={p.avatar} size={42} />}
                title={p.name}
                body={p.detail}
                right={
                  <View style={styles.liveRight}>
                    <Text style={styles.when}>{p.time}</Text>
                    <Pill label={p.status} tone={p.status === 'Late' ? 'orange' : 'green'} size={12} />
                  </View>
                }
              />
            ))}
          </Card>
          <Card style={styles.block}>
            <CardHead title="Communication" size={17} />
            {at.comms.map((c) => (
              <View key={c.title} style={styles.comm}>
                <Icon name={c.icon} size={22} color={TONES[c.tone].solid} />
                <View style={styles.flex}>
                  <Text style={styles.commTitle}>{c.title}</Text>
                  <Text style={styles.commBody}>{c.body}</Text>
                </View>
                <IconTile icon="check" tone="green" solid size={24} radius={12} iconSize={14} />
              </View>
            ))}
          </Card>
        </View>
      </View>
    </AdminDesk>
  );
}

/** The phone dashboard: today's counts, Start Scanning, then the overview, alerts and live gate feed. */
export function AttendancePhone({ a }: { a: Admin }) {
  const at = a.attendance;
  const [who, setWho] = useState('All');
  const o = at.overview;
  const stats: readonly Stat[] = at.stats.slice(0, 4).map((s) => ({ value: s.value, label: s.label, sub: s.short, subTone: s.subTone, icon: s.icon, tone: s.tone }));
  return (
    <AdminPhone me={a.me}>
      <PageHead title="Attendance & QR" subtitle={`${at.date}  •  Main Campus`} phone />
      <Segments items={['All', 'Students', 'Teachers']} active={who} onChange={setWho} stretch />
      <StatGrid stats={stats} />
      <BigButton label="Start Scanning" icon="scan" onPress={goScan} />
      <View style={styles.phoneQuick}>
        {[
          { label: 'Manual Check-in', icon: 'userPlus' as const, run: () => toast('Search a learner or teacher and record why they had no badge.') },
          { label: 'Print QR IDs', icon: 'qr' as const, run: () => toast('Printing signed QR badges for 12 new learners…') },
          { label: 'Notify Parents', icon: 'bell' as const, run: () => toast('Late-arrival alerts sent to 23 families by WhatsApp.') },
        ].map((q) => (
          <Pressable key={q.label} style={styles.phoneQuickBtn} onPress={q.run} accessibilityRole="button" accessibilityLabel={q.label}>
            <Icon name={q.icon} size={24} color={BLUE} />
            <Text style={styles.phoneQuickText} numberOfLines={2}>
              {q.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Card style={styles.block}>
        <CardHead title="Today's Attendance" size={18} />
        <View style={styles.overview}>
          <Donut
            slices={[
              { value: o.present, color: '#22A55A' },
              { value: o.late, color: '#F7A21B' },
              { value: o.absent, color: '#EF3B4D' },
            ]}
            size={130}
            stroke={18}>
            <DonutLabel value={o.rate} caption="Present" size={21} />
          </Donut>
          <View style={styles.flex}>
            <Legend color="#22A55A" label="Present" value={o.present.toLocaleString('en-US')} style={styles.ovRow} />
            <Legend color="#F7A21B" label="Late" value={String(o.late)} style={styles.ovRow} />
            <Legend color="#EF3B4D" label="Absent" value={String(o.absent)} style={styles.ovRow} />
          </View>
        </View>
      </Card>
      <ListCard title="Live Gate Activity" right={<Pill label="Live" tone="green" icon="live" size={12} />}>
        {at.live.map((p, i) => (
          <ListRow key={p.name} last={i === at.live.length - 1} lead={<Face source={p.avatar} size={40} />} title={p.name} body={`${p.detail}  •  ${p.time}`} right={<Pill label={p.status} tone={p.status === 'Late' ? 'orange' : 'green'} size={12} />} />
        ))}
      </ListCard>
      <ListCard title="Alerts & Exceptions" onAll={() => toast('All exceptions this week.')}>
        {at.alerts.map((x, i) => (
          <ListRow key={x.title} last={i === at.alerts.length - 1} lead={<IconTile icon={x.icon} tone={x.tone} size={34} radius={17} />} title={x.title} body={`${x.body}  •  ${x.when}`} />
        ))}
      </ListCard>
      <Card style={styles.block}>
        <CardHead title="On-Time Rate" size={18} />
        {at.punctuality.map((p) => (
          <View key={p.who} style={styles.punctBar}>
            <Text style={styles.punctWho}>{p.who}</Text>
            <Bar value={p.pct / 100} color={TONES[p.tone].solid} height={10} style={styles.flex} />
            <Text style={styles.punctPct}>{`${p.pct}%`}</Text>
          </View>
        ))}
      </Card>
      <Btn label="Attendance Reports" icon="doc" kind="outline" onPress={() => toast('Daily, weekly and termly reports by learner, teacher, class or campus.')} height={50} />
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  main: { flex: 1, minWidth: 0, gap: 14 },
  side: { width: 330, gap: 14 },
  block: { gap: 10, padding: 14 },
  tops: { flexDirection: 'row', gap: 14 },
  top: { flex: 1, minWidth: 0, gap: 6, padding: 12, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  topHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  topValue: { fontSize: 22, fontWeight: '800', color: NAVY },
  topLabel: { fontSize: 12.5, color: BODY },
  topSub: { fontSize: 11.5, color: BODY },
  overview: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  ovRow: { marginBottom: 12 },
  ovTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, borderTopWidth: 1, borderColor: LINE },
  ovTotalText: { fontSize: 13.5, color: NAVY },
  ovTotalNum: { fontSize: 13.5, fontWeight: '700', color: NAVY },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  punct: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  punctHead: { flexDirection: 'row', justifyContent: 'space-between' },
  punctWho: { fontSize: 14.5, fontWeight: '600', color: NAVY },
  punctPct: { fontSize: 16, fontWeight: '800', color: NAVY },
  punctBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  delta: { fontSize: 12, fontWeight: '600', color: GREEN },
  colClass: { flex: 1.45 },
  colGate: { flex: 0.8 },
  colAlerts: { flex: 1 },
  tRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderColor: LINE },
  tStatus: { flex: 1, minWidth: 0, fontSize: 13.5, color: NAVY },
  tCount: { width: 28, fontSize: 13.5, fontWeight: '700', color: NAVY, textAlign: 'center' },
  tPct: { width: 44, fontSize: 13, color: BODY },
  tBar: { width: 44 },
  gRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  gLabel: { flex: 1, fontSize: 13.5, color: NAVY },
  gValue: { fontSize: 15, fontWeight: '800', color: NAVY },
  when: { fontSize: 12.5, color: BODY },
  insights: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  insight: { flexBasis: '31%', flexGrow: 1, minWidth: 0, alignItems: 'center', gap: 3, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1, borderColor: LINE },
  insightLabel: { fontSize: 12.5, fontWeight: '600', color: NAVY, textAlign: 'center' },
  insightValue: { fontSize: 16, fontWeight: '800', color: NAVY, textAlign: 'center' },
  liveRight: { alignItems: 'flex-end', gap: 4 },
  comm: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  commTitle: { fontSize: 14, fontWeight: '600', color: NAVY },
  commBody: { fontSize: 12.5, color: BODY },
  phoneQuick: { flexDirection: 'row', gap: 10 },
  phoneQuickBtn: { flex: 1, minWidth: 0, alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  phoneQuickText: { fontSize: 12.5, fontWeight: '500', color: BLUE, textAlign: 'center' },
});
