import { Image } from '@/components/picture';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Funnel } from '@/features/command/kit/CmdCharts';
import { Bar, Btn, Card, CardHead, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, NAVY } from '@/features/portal/tokens';
import { LineChart } from '@/features/school/kit/Charts';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

import { AdminDesk, AdminPhone, SelectBox } from '../kit/AdminKit';
import { HubHeader, HubTabs, KpiCard, KpiRow, PrivacyNote } from '../kit/HubKit';
import { conversionRate, ctr, reasonShares, stageShares } from './growth';
import { Maple } from '@/constants/maple';
import { Palette } from '@/constants/palette';

type Admin = MockData['schoolAdmin'];

const BRAND_BLUE = Maple.blue;
const BANDS = [Maple.blueLine, Maple.blueLine, Maple.blueLine, Maple.blueLine, Maple.blueSelected, Maple.blueSelected];
const PRIVACY = 'Totals only: Maple never shows you who viewed, liked, saved or was recommended your school. Groups under 10 people are merged or withheld.';
const openProfile = () => router.push('/admin/school-profile' as Href);

function useGrowth(a: Admin) {
  const g = a.schoolGrowth;
  const [tab, setTab] = useState(g.tabs[0]);
  const [term, setTerm] = useState(g.terms[0]);
  const funnel = stageShares(g.funnel);
  const impressions = g.funnel[0].count;
  const enrolled = g.funnel[g.funnel.length - 1].count;
  return {
    g,
    tab,
    setTab,
    term,
    setTerm,
    funnel,
    conversion: conversionRate(enrolled, g.uniqueVisitors),
    ctr: ctr(g.kpis.find((k) => k.key === 'clicks')?.now ?? 0, impressions),
    reasons: reasonShares(g.reasons).map((r) => ({ ...r, icon: g.reasons.find((x) => x.label === r.label)?.icon ?? 'more' })),
    campaigns: a.admissionsHub.campaigns,
    exportReport: () => toast(`School Growth report for ${term} exported: totals only, no visitor details.`),
  };
}
type X = ReturnType<typeof useGrowth>;

function FunnelCard({ x, phone }: { x: X; phone: boolean }) {
  return (
    <Card style={s.card}>
      <CardHead title="Admissions Conversion Funnel" size={16} right={<Pill label={`Conversion Rate: ${x.conversion}%`} tone="green" size={12} />} />
      <View style={[s.funnelRow, phone && s.funnelRowP]}>
        <Funnel stages={x.funnel.map((f, i) => ({ value: f.count, color: BANDS[i] }))} width={phone ? 150 : 140} band={28} gap={4} />
        <View style={s.flex}>
          {x.funnel.map((f, i) => (
            <View key={f.key} style={s.funnelLine}>
              <View style={[s.dot, { backgroundColor: BANDS[i] }]} />
              <Text style={[s.body, s.flex]} numberOfLines={1}>
                {f.label}
              </Text>
              <Text style={s.strong}>{f.count.toLocaleString('en-US')}</Text>
              <Text style={s.share}>{f.ofPrevious === null ? '' : `(${f.ofPrevious.toFixed(1)}%)`}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={s.small}>{`Conversion = confirmed enrolments ÷ ${x.g.uniqueVisitors.toLocaleString('en-US')} unique profile visitors. Applications are never counted as enrolments.`}</Text>
    </Card>
  );
}

function TrendCard({ x }: { x: X }) {
  const t = x.g.trend;
  return (
    <Card style={s.card}>
      <CardHead title="Engagement Trend" size={16} />
      <View style={s.legend}>
        <View style={[s.dot, { backgroundColor: BLUE }]} />
        <Text style={s.small}>Profile Views</Text>
        <View style={[s.dot, { backgroundColor: BRAND_BLUE }]} />
        <Text style={s.small}>Applications</Text>
      </View>
      <LineChart
        labels={t.labels}
        series={[
          { name: 'Profile Views', color: BLUE, values: t.views },
          { name: 'Applications', color: BRAND_BLUE, values: t.applications },
        ]}
        min={0}
        max={10_000}
        height={190}
        format={(n) => (n >= 1000 ? `${n / 1000}K` : `${n}`)}
      />
    </Card>
  );
}

function ReasonsCard({ x }: { x: X }) {
  return (
    <Card style={s.card}>
      <CardHead title="Top Recommendation Reasons" size={16} />
      {x.reasons.length ? (
        x.reasons.map((r) => (
          <View key={r.label} style={s.reason}>
            <Icon name={r.icon} size={16} color={BRAND_BLUE} />
            <Text style={[s.body, s.reasonLabel]} numberOfLines={1}>
              {r.label}
            </Text>
            <Bar value={r.pct / 100} color={r.label === 'Other' ? Palette.blue300 : Maple.blue} height={8} style={s.flex} />
            <Text style={s.strong}>{`${r.pct}%`}</Text>
          </View>
        ))
      ) : (
        <Text style={s.small}>Not enough recommendations yet to show a breakdown.</Text>
      )}
      <Text style={s.small}>Reasons with fewer than 10 people are grouped as Other.</Text>
    </Card>
  );
}

function InsightsCard({ x, all = false }: { x: X; all?: boolean }) {
  return (
    <Card style={s.card}>
      <CardHead title="Growth Insights" size={16} icon={<Icon name="sparkle" size={18} color={BRAND_BLUE} />} />
      {x.g.insights.map((i) => (
        <View key={i.text} style={s.insight}>
          <Icon name={i.done ? 'tick' : 'alert'} size={16} color={i.done ? GREEN : Maple.warning} />
          <Text style={[s.body, s.flex]}>{i.text}</Text>
          {all && !i.done ? <Btn label="Fix" kind="soft" height={30} onPress={openProfile} /> : null}
        </View>
      ))}
      {all ? null : <Btn label="View All Recommendations" kind="outline" iconRight="arrowRight" height={38} onPress={() => x.setTab('Insights & Actions')} />}
    </Card>
  );
}

function SectionsCard({ x }: { x: X }) {
  const top = x.g.sections[0].views;
  return (
    <Card style={s.card}>
      <CardHead title="Profile Performance" subtitle="Views of each part of your public profile" size={16} />
      {x.g.sections.map((sec) => (
        <View key={sec.label} style={s.reason}>
          <Text style={[s.body, s.reasonLabel]}>{sec.label}</Text>
          <Bar value={sec.views / top} color={BLUE} height={8} style={s.flex} />
          <Text style={s.strong}>{sec.views.toLocaleString('en-US')}</Text>
        </View>
      ))}
      <Btn label="Improve your profile" kind="soft" height={38} onPress={openProfile} />
    </Card>
  );
}

function RecsCard({ x }: { x: X }) {
  const imp = x.g.kpis.find((k) => k.key === 'impressions')?.now ?? 0;
  const clk = x.g.kpis.find((k) => k.key === 'clicks')?.now ?? 0;
  const visits = x.g.funnel.find((f) => f.key === 'visits')?.count ?? 0;
  return (
    <Card style={s.card}>
      <CardHead title="Recommendation Performance" size={16} />
      {(
        [
          ['Impressions', imp.toLocaleString('en-US')],
          ['Clicks', clk.toLocaleString('en-US')],
          ['Click-through rate', `${x.ctr}%`],
          ['Profile visits from recommendations', visits.toLocaleString('en-US')],
        ] as const
      ).map(([k, v]) => (
        <View key={k} style={s.sumRow}>
          <Text style={s.body}>{k}</Text>
          <Text style={s.strong}>{v}</Text>
        </View>
      ))}
      <Text style={s.small}>Recommendations rank by educational fit. Paying Maple never changes where your school appears.</Text>
    </Card>
  );
}

function CampaignsCard({ x }: { x: X }) {
  return (
    <Card style={s.card}>
      <CardHead title="Campaign Performance" size={16} link="Manage in Admissions" onLink={() => router.push('/admin/admissions' as Href)} />
      {x.campaigns.map((c) => (
        <View key={c.id} style={s.campaign}>
          <Image decorative source={c.photo} style={s.campaignPhoto} contentFit="cover" />
          <View style={s.flex}>
            <Text style={s.strong}>{c.title}</Text>
            <Text style={s.small}>{c.sub}</Text>
          </View>
          <Text style={s.metric}>{`${c.views.toLocaleString('en-US')} views`}</Text>
          <Text style={s.metric}>{`${c.interested.toLocaleString('en-US')} interested`}</Text>
          <Text style={s.metric}>{`${c.applications.toLocaleString('en-US')} applications`}</Text>
          <Text style={s.metric}>{`${((c.applications / c.views) * 100).toFixed(1)}%`}</Text>
        </View>
      ))}
    </Card>
  );
}

function Body({ x, phone }: { x: X; phone: boolean }) {
  switch (x.tab) {
    case 'Profile Performance':
      return <SectionsCard x={x} />;
    case 'Recommendations':
      return (
        <View style={phone ? s.stack : s.cols2}>
          <RecsCard x={x} />
          <ReasonsCard x={x} />
        </View>
      );
    case 'Admissions Conversions':
      return (
        <View style={phone ? s.stack : s.cols2}>
          <FunnelCard x={x} phone={phone} />
          <TrendCard x={x} />
        </View>
      );
    case 'Campaign Performance':
      return <CampaignsCard x={x} />;
    case 'Insights & Actions':
      return <InsightsCard x={x} all />;
    default:
      return (
        <View style={phone ? s.stack : s.cols4}>
          <View style={phone ? undefined : s.wide}>
            <FunnelCard x={x} phone={phone} />
          </View>
          <View style={phone ? undefined : s.mid}>
            <TrendCard x={x} />
          </View>
          <View style={phone ? undefined : s.mid}>
            <ReasonsCard x={x} />
          </View>
          <View style={phone ? undefined : s.mid}>
            <InsightsCard x={x} />
          </View>
        </View>
      );
  }
}

function Page({ x, phone }: { x: X; phone: boolean }) {
  return (
    <>
      <HubHeader
        icon="chart"
        title="School Growth"
        subtitle="Your visibility, engagement, recommendations and admissions conversions on the Maple School Network."
        phone={phone}
        right={
          <>
            <SelectBox value={x.term} options={x.g.terms} onChange={x.setTerm} width={160} />
            <Btn label="Export Report" icon="download" kind="outline" height={40} onPress={x.exportReport} />
            <Btn label="Grow Your School" icon="rocket" height={40} onPress={openProfile} style={s.grow} />
          </>
        }
      />
      <HubTabs items={x.g.tabs} icons={x.g.tabIcons} active={x.tab} onChange={x.setTab} phone={phone} />
      <KpiRow>
        {x.g.kpis.map((k) => (
          <KpiCard key={k.key} label={k.label} icon={k.icon} tone={k.tone} now={k.now} before={k.before} />
        ))}
      </KpiRow>
      <Body x={x} phone={phone} />
      <PrivacyNote text={PRIVACY} />
    </>
  );
}

/** School Growth on the desktop: privacy-safe totals from the School Network. */
export function GrowthDesk({ a }: { a: Admin }) {
  const x = useGrowth(a);
  return (
    <AdminDesk me={a.me} search="Search schools, learners, resources..." active="School Growth">
      <Page x={x} phone={false} />
    </AdminDesk>
  );
}

/** School Growth on phones. */
export function GrowthPhone({ a }: { a: Admin }) {
  const x = useGrowth(a);
  return (
    <AdminPhone me={a.me}>
      <Page x={x} phone />
    </AdminPhone>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  cols2: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  cols4: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', marginBottom: 12 },
  wide: { flexGrow: 1.6, flexBasis: 470 },
  mid: { flexGrow: 1, flexBasis: 300 },
  card: { flex: 1, gap: 10, padding: 18 },
  body: { fontSize: 12.5, color: NAVY },
  strong: { fontSize: 13, fontWeight: '700', color: NAVY },
  small: { fontSize: 12, lineHeight: 17, color: BODY },
  share: { width: 50, fontSize: 11.5, color: BODY, textAlign: 'right' },
  funnelRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  funnelRowP: { flexDirection: 'column', alignItems: 'stretch' },
  funnelLine: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 32 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 30 },
  reasonLabel: { width: 170 },
  insight: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 26 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  campaign: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected, flexWrap: 'wrap' },
  campaignPhoto: { width: 72, height: 48, borderRadius: 8 },
  metric: { minWidth: 110, fontSize: 12.5, color: NAVY },
  grow: { backgroundColor: BRAND_BLUE },
});
