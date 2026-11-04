import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CheckDot, CmdSelect, CmdStat, CountTabs, Flag, KpiGrid, OutlineBtn, PageStrip, PersonCell, PhotoDot, PrimaryBtn, RangeBox, exportMenu } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { ReasonModal, type ReasonAsk } from '@/features/command/kit/ReasonModal';
import { type CaseAction, caseDecide, caseNeedsReason, type Risk } from '@/features/command/logic/trust';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Search, useChoice } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { HubCase, HubTeacher } from '@/mock/command-center/trust';

import { RiskPill, StatusPill, useReview } from './TrustParts';

type T = CommandData['trust'];
const PER_PAGE = 10;
const TEACHERS = 'Teacher Verification';
/** The tab counts on the reference; they fall as cases are decided. */
const BASE_COUNTS: Readonly<Record<string, number>> = { [TEACHERS]: 28, 'Subject Quality': 17, 'Copyright & IP': 9, 'Minor Safeguarding': 5, 'Reported Content': 7, Appeals: 4 };
const TAB_TONE: Readonly<Record<string, Tone>> = { [TEACHERS]: 'blue', 'Subject Quality': 'red', 'Copyright & IP': 'red', 'Minor Safeguarding': 'red', 'Reported Content': 'red', Appeals: 'red' };
const OPEN_TEACHER = ['ready', 'review', 'escalated', 'info'];
const CLOSED_CASE = ['Resolved', 'Removed', 'Upheld', 'Overturned'];

/** Each case tab's four decisions: label, action, tone. */
const CASE_ACTIONS: Readonly<Record<string, readonly [string, CaseAction, Tone][]>> = {
  'Subject Quality': [['Unpublish Subject', 'remove', 'red'], ['Ask Teacher to Fix', 'fix', 'orange'], ['Dismiss Flag', 'dismiss', 'grey'], ['Mark Resolved', 'resolve', 'green']],
  'Copyright & IP': [['Remove Content', 'remove', 'red'], ['Request Licence Proof', 'requestInfo', 'orange'], ['Escalate to Legal', 'escalate', 'grey'], ['Dismiss (Fair Use)', 'dismiss', 'green']],
  'Minor Safeguarding': [['Restrict Account', 'restrict', 'red'], ['Request Statement', 'requestInfo', 'orange'], ['Escalate to Safeguarding Lead', 'escalate', 'grey'], ['Close Case', 'resolve', 'green']],
  'Reported Content': [['Hide Content', 'remove', 'red'], ['Warn Account', 'fix', 'orange'], ['Escalate', 'escalate', 'grey'], ['Dismiss Report', 'dismiss', 'green']],
  Appeals: [['Uphold Decision', 'uphold', 'red'], ['Request More Info', 'requestInfo', 'orange'], ['Escalate', 'escalate', 'grey'], ['Overturn Decision', 'overturn', 'green']],
};

const CASE_TONE: Readonly<Record<HubCase['status'], Tone>> = {
  Open: 'orange',
  'Needs Review': 'orange',
  'Under Investigation': 'red',
  Resolved: 'green',
  Removed: 'red',
  Upheld: 'grey',
  Overturned: 'green',
};

const SORTS = ['Newest First', 'Oldest First', 'Highest Risk'];
const STATUS_OF: Readonly<Record<string, string>> = { Pending: 'ready', 'Needs Review': 'review', 'Under Investigation': 'escalated', Blocked: 'blocked' };
const RISK_ORDER: Readonly<Record<Risk, number>> = { High: 0, Medium: 1, Low: 2 };

function useHub(t: T, by: string) {
  const review = useReview<HubTeacher>(t.hubTeachers, by);
  const [tab, setTab] = useState(TEACHERS);
  const [query, setQuery] = useState('');
  const [status, setStatus, statuses] = useChoice(['All Status', 'Pending', 'Needs Review', 'Under Investigation', 'Blocked']);
  const [risk, setRisk, risks] = useChoice(['All Risk Levels', 'Low', 'Medium', 'High']);
  const [country, setCountry, countries] = useChoice(['All Countries', 'UG', 'KE', 'TZ', 'ZM']);
  const [sort, setSort] = useChoice(SORTS);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(t.hubTeachers[3].id);
  const [cases, setCases] = useState(t.hubCases);
  const [openCase, setOpenCase] = useState<string>('');
  const [caseAsk, setCaseAsk] = useState<ReasonAsk | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = review.apps.filter(
      (a) =>
        (status === 'All Status' || a.status === STATUS_OF[status]) &&
        (risk === 'All Risk Levels' || a.risk === risk) &&
        (country === 'All Countries' || a.flag === country) &&
        (!q || `${a.name} ${a.email} ${a.appId} ${a.subjects}`.toLowerCase().includes(q)),
    );
    if (sort === 'Oldest First') return [...list].reverse();
    if (sort === 'Highest Risk') return [...list].sort((x, y) => RISK_ORDER[x.risk] - RISK_ORDER[y.risk]);
    return list;
  }, [review.apps, query, status, risk, country, sort]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const open = review.apps.find((a) => a.id === openId) ?? review.apps[0];

  const decidedTeachers = t.hubTeachers.filter((a) => OPEN_TEACHER.includes(a.status)).length - review.apps.filter((a) => OPEN_TEACHER.includes(a.status)).length;
  const counts: Record<string, number> = { [TEACHERS]: Math.max(0, BASE_COUNTS[TEACHERS] - decidedTeachers) };
  for (const [k, list] of Object.entries(cases)) {
    const closedNow = list.filter((x) => CLOSED_CASE.includes(x.status)).length - (t.hubCases[k] ?? []).filter((x) => CLOSED_CASE.includes(x.status)).length;
    counts[k] = Math.max(0, BASE_COUNTS[k] - closedNow);
  }

  const caseList = cases[tab] ?? [];
  const current = caseList.find((x) => x.id === openCase) ?? caseList[0];
  const applyCase = (c: HubCase, action: CaseAction, label: string, note?: string) => {
    const r = caseDecide(c, action, note);
    if (r.error) return toast(r.error);
    setCases((prev) => ({ ...prev, [tab]: (prev[tab] ?? []).map((x) => (x.id === c.id ? r.item : x)) }));
    toast(`${c.id}: ${label}. ${r.item.status === 'Under Investigation' ? 'The lead is paged now.' : 'The owner is notified.'}`);
  };
  const actCase = (c: HubCase, action: CaseAction, label: string) => {
    if (!caseNeedsReason(c, action)) return applyCase(c, action, label);
    setCaseAsk({ title: `${label}: ${c.id}`, body: `${c.title}. Explain the decision; the owner sees it and it goes in the audit log.`, confirm: label, tone: action === 'dismiss' || action === 'overturn' ? 'green' : 'red', onConfirm: (note) => applyCase(c, action, label, note) });
  };
  const pickTab = (k: string) => {
    setTab(k);
    setPage(1);
    setOpenCase('');
  };

  return {
    ...review,
    tab,
    setTab: pickTab,
    query,
    setQuery,
    filters: { status, setStatus, statuses, risk, setRisk, risks, country, setCountry, countries, sort, setSort },
    page: p,
    setPage,
    pages,
    rows,
    shown,
    open,
    setOpenId,
    counts,
    caseList,
    current,
    setOpenCase,
    actCase,
    caseAsk,
    setCaseAsk,
  };
}
type H = ReturnType<typeof useHub>;

const RESULT_TEXT = { ok: '#16A34A', warn: '#D97F06', fail: '#E0283E' } as const;

/** The review panel for one teacher application: AI results, the AI summary and four decisions. */
function TeacherReview({ h, phone = false, onClose }: { h: H; phone?: boolean; onClose?: () => void }) {
  const a = h.open;
  const [tab, setTab] = useState('AI Analysis');
  const final = a.status === 'approved' || a.status === 'rejected' || a.status === 'blocked';
  return (
    <Card style={styles.side}>
      <View style={styles.sideHead}>
        <Text style={styles.sideTitle}>Teacher Application Review</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close review" hitSlop={8}>
            <Icon name="close" size={20} color={NAVY} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.who}>
        <PhotoDot source={a.avatar} size={phone ? 58 : 66} />
        <View style={styles.flex}>
          <View style={styles.whoTop}>
            <Text style={styles.whoName}>{a.name}</Text>
            <RiskPill risk={a.risk} suffix=" Risk" size={11} />
            <StatusPill status={a.status} hub size={11} />
          </View>
          <Text style={styles.small}>{a.email}</Text>
          <View style={styles.whoWhere}>
            <Flag code={a.flag} size={13} />
            <Text style={styles.tiny} numberOfLines={1}>
              {a.city}
            </Text>
            <Text style={[styles.tiny, styles.pushRight]} numberOfLines={2}>{`App ID: ${a.appId}`}</Text>
          </View>
        </View>
      </View>
      <CountTabs tabs={['AI Analysis', 'Documents', 'Background Check', 'Activity'].map((label) => ({ label }))} active={tab} onChange={setTab} size={12} dense style={styles.noWrap} />
      {tab === 'AI Analysis' ? (
        <>
          <View style={styles.resultsHead}>
            <Text style={styles.section}>AI Verification Results</Text>
            <View style={styles.overall}>
              <Text style={styles.small}>Overall Risk:</Text>
              <RiskPill risk={a.risk} size={11.5} />
            </View>
          </View>
          <View style={styles.results}>
            {a.results.map((r) => (
              <View key={r.label} style={styles.result}>
                <View style={[styles.resultIcon, { backgroundColor: TONES[r.state === 'ok' ? 'blue' : r.state === 'warn' ? 'orange' : 'red'].soft }]}>
                  <Icon name="shield" size={13} color={TONES[r.state === 'ok' ? 'blue' : r.state === 'warn' ? 'orange' : 'red'].solid} />
                </View>
                <Text style={styles.resultLabel}>{r.label}</Text>
                <CheckDot state={r.state} size={14} />
                <Text style={[styles.resultText, { color: r.state === 'ok' ? NAVY : RESULT_TEXT[r.state] }]} numberOfLines={2}>
                  {r.text}
                </Text>
                {r.view ? <OutlineBtn label="View" small onPress={() => toast(`${r.label}: opening the source record and the AI's evidence.`)} /> : null}
              </View>
            ))}
          </View>
          <View style={styles.summary}>
            <View style={styles.summaryHead}>
              <Icon name="sparkle" size={15} color={BLUE} />
              <Text style={styles.summaryTitle}>AI Summary</Text>
            </View>
            <Text style={styles.summaryBody}>{a.aiSummary}</Text>
          </View>
        </>
      ) : null}
      {tab === 'Documents' ? <Text style={styles.small}>National ID, degree certificate, teaching licence and police clearance. Open each in the secure viewer; downloads are watermarked.</Text> : null}
      {tab === 'Background Check' ? <Text style={styles.small}>{a.results.find((r) => r.label === 'Criminal Record Check')?.text ?? ''}. Sanctions and watchlists: {a.results.find((r) => r.label === 'Sanctions & Watchlists')?.text}.</Text> : null}
      {tab === 'Activity' ? (
        <View style={styles.history}>
          {a.history.map((d, i) => (
            <Text key={i} style={styles.small}>{`${d.action} by ${d.by}${d.note ? `: “${d.note}”` : ''}`}</Text>
          ))}
          <Text style={styles.small}>{`Applied ${a.date}, ${a.time}. AI review finished 3 minutes later.`}</Text>
        </View>
      ) : null}
      <Text style={styles.section}>Review Decision</Text>
      {final ? (
        <Text style={styles.decided}>{`Decided: ${a.status}. The record is locked; a change needs an appeal.`}</Text>
      ) : (
        <View style={styles.decisions}>
          <DecisionBtn label="Block Application" icon="close" tone="red" onPress={() => h.act(a, 'block')} />
          <DecisionBtn label="Request More Info" icon="info" tone="orange" onPress={() => h.act(a, 'requestInfo')} />
          <DecisionBtn label="Escalate to Safeguarding Team" icon="person" tone="blue" onPress={() => h.act(a, 'escalate')} />
          <DecisionBtn label="Approve Application" icon="check" tone="green" solid onPress={() => h.act(a, 'approve')} />
        </View>
      )}
    </Card>
  );
}

function DecisionBtn({ label, icon, tone, onPress, solid = false }: { label: string; icon: 'close' | 'info' | 'person' | 'check' | 'alert'; tone: Tone; onPress: () => void; solid?: boolean }) {
  const t = TONES[tone];
  return (
    <Pressable style={({ hovered }) => [styles.decision, { borderColor: tone === 'blue' ? LINE : t.solid, backgroundColor: solid ? t.solid : tone === 'blue' ? WHITE : t.soft }, hovered && styles.hover]} onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Icon name={icon} size={16} color={solid ? WHITE : tone === 'blue' ? BLUE : t.text} />
      <Text style={[styles.decisionText, { color: solid ? WHITE : tone === 'blue' ? NAVY : t.text }]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

/** The review panel for a case on one of the other tabs. */
function CaseReview({ h }: { h: H }) {
  const c = h.current;
  if (!c) return null;
  const closed = CLOSED_CASE.includes(c.status);
  return (
    <Card style={styles.side}>
      <Text style={styles.sideTitle}>{`${h.tab} Review`}</Text>
      <Text style={styles.whoName}>{c.title}</Text>
      <View style={styles.whoTop}>
        <RiskPill risk={c.risk} suffix=" Risk" size={11} />
        <Pill label={c.status} tone={CASE_TONE[c.status]} size={11} />
      </View>
      <View style={styles.whoWhere}>
        <Flag code={c.flag} size={13} />
        <Text style={styles.small}>{`${c.owner}  •  ${c.id}  •  ${c.reported}`}</Text>
      </View>
      <Text style={styles.section}>Signal</Text>
      <Text style={styles.body}>{c.signal}</Text>
      <View style={styles.summary}>
        <View style={styles.summaryHead}>
          <Icon name="sparkle" size={15} color={BLUE} />
          <Text style={styles.summaryTitle}>AI Summary</Text>
        </View>
        <Text style={styles.summaryBody}>{c.ai}</Text>
      </View>
      <Text style={styles.section}>Review Decision</Text>
      {closed ? (
        <Text style={styles.decided}>{`Closed: ${c.status}${c.note ? ` — “${c.note}”` : ''}.`}</Text>
      ) : (
        <View style={styles.decisions}>
          {(CASE_ACTIONS[h.tab] ?? []).map(([label, action, tone], i) => (
            <DecisionBtn key={label} label={label} icon={i === 0 ? 'close' : i === 1 ? 'info' : i === 2 ? 'person' : 'check'} tone={tone === 'grey' ? 'blue' : tone} solid={i === 3} onPress={() => h.actCase(c, action, label)} />
          ))}
        </View>
      )}
    </Card>
  );
}

function teacherCols(h: H): readonly Column<HubTeacher>[] {
  return [
    { label: '#', width: 24, render: (a) => <Cell small>{a.n}</Cell> },
    { label: 'Teacher', flex: 2, render: (a) => <PersonCell avatar={a.avatar} name={a.name} sub={a.email} size={32} /> },
    {
      label: 'Country',
      width: 48,
      render: (a) => (
        <View style={styles.country}>
          <Flag code={a.flag} size={14} />
          <Cell small>{a.flag}</Cell>
        </View>
      ),
    },
    { label: 'Qualification', flex: 0.9, render: (a) => <Cell small>{a.qualification}</Cell> },
    { label: 'Subjects', flex: 0.9, render: (a) => <Cell small lines={2}>{a.subjects}</Cell> },
    { label: 'AI Risk', width: 82, render: (a) => <RiskPill risk={a.risk} size={11} /> },
    {
      label: 'Checks',
      width: 60,
      render: (a) => (
        <View style={styles.dots}>
          {a.checks.map((k) => (
            <CheckDot key={k.label} state={k.state} size={15} />
          ))}
        </View>
      ),
    },
    {
      label: 'Application Date',
      width: 86,
      render: (a) => (
        <View>
          <Cell small>{a.date}</Cell>
          <Cell small>{a.time}</Cell>
        </View>
      ),
    },
    { label: 'Status', width: 104, render: (a) => <StatusPill status={a.status} hub size={11} /> },
    {
      label: 'Actions',
      width: 80,
      render: (a) => (
        <View style={styles.actions}>
          <PrimaryBtn label="Review" onPress={() => h.setOpenId(a.id)} style={styles.reviewBtn} />
          <OutlineBtn icon="more" small onPress={() => toast(`More for ${a.name}: assign, add internal note, view audit trail.`)} />
        </View>
      ),
    },
  ];
}

function caseCols(h: H): readonly Column<HubCase>[] {
  return [
    { label: '#', width: 24, render: (c) => <Cell small>{c.n}</Cell> },
    {
      label: 'Case',
      flex: 1.8,
      render: (c) => (
        <View>
          <Cell small strong>
            {c.title}
          </Cell>
          <Cell small>{c.id}</Cell>
        </View>
      ),
    },
    {
      label: 'Owner',
      flex: 1,
      render: (c) => (
        <View style={styles.country}>
          <Flag code={c.flag} size={14} />
          <Cell small>{c.owner}</Cell>
        </View>
      ),
    },
    { label: 'Signal', flex: 1.6, render: (c) => <Cell small lines={2}>{c.signal}</Cell> },
    { label: 'AI Risk', width: 82, render: (c) => <RiskPill risk={c.risk} size={11} /> },
    { label: 'Reported', width: 92, render: (c) => <Cell small>{c.reported}</Cell> },
    { label: 'Status', width: 124, render: (c) => <Pill label={c.status} tone={CASE_TONE[c.status]} size={11} /> },
    { label: 'Actions', width: 80, render: (c) => <PrimaryBtn label="Review" onPress={() => h.setOpenCase(c.id)} style={styles.reviewBtn} /> },
  ];
}

function Filters({ h }: { h: H }) {
  const f = h.filters;
  return (
    <View style={styles.filtersRow}>
      <Search placeholder="Search by name, email, ID, or application number..." value={h.query} onChange={h.setQuery} style={styles.flex} />
      <CmdSelect value={f.status} options={f.statuses} onChange={f.setStatus} width={128} label="Status" />
      <CmdSelect value={f.risk} options={f.risks} onChange={f.setRisk} width={128} label="Risk" />
      <CmdSelect value={f.country} options={f.countries} onChange={f.setCountry} width={128} label="Country" />
      <CmdSelect value={f.sort} options={SORTS} onChange={f.setSort} width={120} label="Sort" />
      <OutlineBtn label="Columns" icon="columns" small onPress={() => toast('Choose columns: email, qualification, subjects, risk, checks, dates.')} />
    </View>
  );
}

/** Maple Command › Trust & Safety on the desktop reference. */
export function TrustHubDesk({ c }: { c: CommandData }) {
  const t = c.trust;
  const h = useHub(t, c.me.name);
  const [range, setRange] = useState(c.ranges[0]);
  const teachers = h.tab === TEACHERS;
  return (
    <CommandDesk me={c.me} search="Search teachers, schools, students, incidents, or reference IDs..." active="Trust & Safety">
      <CmdHead
        icon="verified"
        section="Security"
        title="Trust & Safety"
        subtitle="Ensure a safe, high-quality learning environment through AI-assisted review and human oversight."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={252} />
            <PrimaryBtn label="Export" chevron onPress={() => exportMenu('Trust & Safety cases')} />
            <OutlineBtn icon="sync" onPress={() => toast('Queues refreshed.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {t.hubStats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <Card style={[styles.tableCard, styles.flex]}>
          <CountTabs tabs={t.hubTabs.map((label) => ({ label, count: h.counts[label], tone: TAB_TONE[label] }))} active={h.tab} onChange={h.setTab} size={13} dense style={styles.noWrap} />
          {teachers ? <Filters h={h} /> : null}
          {teachers ? (
            <>
              <DataTable columns={teacherCols(h)} rows={h.rows} rowKey={(a) => a.id} check compact onRowPress={(a) => h.setOpenId(a.id)} activeKey={h.open.id} />
              <PageStrip label={`Showing ${h.shown.length ? (h.page - 1) * PER_PAGE + 1 : 0}–${Math.min(h.page * PER_PAGE, h.shown.length)} of ${h.shown.length} applications`} page={h.page} pages={h.pages} onPage={h.setPage} />
            </>
          ) : (
            <DataTable columns={caseCols(h)} rows={h.caseList} rowKey={(x) => x.id} compact onRowPress={(x) => h.setOpenCase(x.id)} activeKey={h.current?.id} />
          )}
        </Card>
        <View style={styles.sideCol}>{teachers ? <TeacherReview h={h} onClose={() => toast('The panel stays open on desktop; pick another row to switch.')} /> : <CaseReview h={h} />}</View>
      </View>
      <ReasonModal ask={h.ask} onClose={() => h.setAsk(null)} />
      <ReasonModal ask={h.caseAsk} onClose={() => h.setCaseAsk(null)} />
    </CommandDesk>
  );
}

/** The phone version: the six counts, the case tabs, a list and a full-screen review. */
export function TrustHubPhone({ c }: { c: CommandData }) {
  const t = c.trust;
  const h = useHub(t, c.me.name);
  const [view, setView] = useState<'list' | 'review'>('list');
  const teachers = h.tab === TEACHERS;
  if (view === 'review') {
    return (
      <CommandPhone key="review" me={c.me}>
        <PageHead title={teachers ? 'Application Review' : 'Case Review'} subtitle="The AI's read, then your decision." phone onBack={() => setView('list')} />
        {teachers ? <TeacherReview h={h} phone /> : <CaseReview h={h} />}
        <ReasonModal ask={h.ask} onClose={() => h.setAsk(null)} />
        <ReasonModal ask={h.caseAsk} onClose={() => h.setCaseAsk(null)} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Trust & Safety" subtitle="AI-assisted review with human oversight." phone />
      <KpiGrid items={t.hubStats} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={t.hubTabs.map((label) => ({ label, count: h.counts[label], tone: TAB_TONE[label] }))} active={h.tab} onChange={h.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      {teachers ? <Search placeholder="Search name, email or ID" value={h.query} onChange={h.setQuery} /> : null}
      {teachers
        ? h.rows.map((a) => (
            <Pressable
              key={a.id}
              style={styles.card}
              onPress={() => {
                h.setOpenId(a.id);
                setView('review');
              }}
              accessibilityRole="button"
              accessibilityLabel={`${a.name}, ${a.risk} risk. Review`}>
              <View style={styles.cardTop}>
                <PersonCell avatar={a.avatar} name={a.name} sub={`${a.qualification} • ${a.subjects.replace('\n', ', ')}`} flag={a.flag} size={42} />
              </View>
              <View style={styles.cardFoot}>
                <RiskPill risk={a.risk} />
                <StatusPill status={a.status} hub />
                <Text style={[styles.small, styles.pushRight]}>{a.date}</Text>
              </View>
            </Pressable>
          ))
        : h.caseList.map((x) => (
            <Pressable
              key={x.id}
              style={styles.card}
              onPress={() => {
                h.setOpenCase(x.id);
                setView('review');
              }}
              accessibilityRole="button"
              accessibilityLabel={`${x.title}, ${x.risk} risk, ${x.status}. Review`}>
              <Text style={styles.whoName}>{x.title}</Text>
              <Text style={styles.small}>{`${x.owner} • ${x.signal}`}</Text>
              <View style={styles.cardFoot}>
                <RiskPill risk={x.risk} />
                <Pill label={x.status} tone={CASE_TONE[x.status]} size={12} />
              </View>
            </Pressable>
          ))}
      {teachers ? <PageStrip label={`${h.shown.length} applications`} page={h.page} pages={h.pages} onPage={h.setPage} /> : null}
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  small: { fontSize: 11.5, color: BODY },
  tiny: { fontSize: 11, color: BODY },
  body: { fontSize: 13, color: NAVY },
  pushRight: { marginLeft: 'auto' },
  noWrap: { flexWrap: 'nowrap' },
  hover: { opacity: 0.9 },
  tableCard: { padding: 12, gap: 10 },
  filtersRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  country: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dots: { flexDirection: 'row', gap: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reviewBtn: { height: 30, paddingHorizontal: 10, borderRadius: 7 },
  sideCol: { width: 360 },
  side: { padding: 12, gap: 10 },
  sideHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sideTitle: { fontSize: 15.5, fontWeight: '800', color: NAVY },
  who: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  whoTop: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  whoName: { fontSize: 16, fontWeight: '800', color: NAVY },
  whoWhere: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  section: { marginTop: 2, fontSize: 14.5, fontWeight: '800', color: NAVY },
  resultsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  overall: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  results: { borderRadius: 10, borderWidth: 1, borderColor: LINE, paddingHorizontal: 10, paddingVertical: 4 },
  result: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 30 },
  resultIcon: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  resultLabel: { width: 132, fontSize: 11, color: NAVY },
  resultText: { flex: 1, minWidth: 0, fontSize: 11 },
  summary: { gap: 4, padding: 10, borderRadius: 10, backgroundColor: '#F1F4FE' },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: NAVY },
  summaryBody: { fontSize: 12, lineHeight: 17, color: BODY },
  history: { gap: 6 },
  decided: { padding: 10, borderRadius: 10, backgroundColor: '#F1F5FB', fontSize: 12.5, color: NAVY },
  decisions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  decision: { width: '48.5%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, paddingHorizontal: 8, borderRadius: 9, borderWidth: 1 },
  decisionText: { flexShrink: 1, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  card: { gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardFoot: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
