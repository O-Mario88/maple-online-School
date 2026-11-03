import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CheckDot, CheckLine, CmdSelect, CmdStat, CountTabs, Flag, KpiGrid, MiniBars, OutlineBtn, PageStrip, PersonCell, PhotoDot, PrimaryBtn, ScoreRing, exportMenu } from '@/features/command/kit/CmdParts';
import { CommandDesk, CmdHead, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { ReasonModal } from '@/features/command/kit/ReasonModal';
import { blockers, bulkApprove, countByStatus, filterApps, type QueueTab } from '@/features/command/logic/trust';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, TONES, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Search, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import { toast } from '@/lib/toast';
import type { QueueApp } from '@/mock/command-center/trust';

import { SafeguardPill, StatusPill, useReview } from './TrustParts';

type T = CommandData['trust'];
const PER_PAGE = 10;

const TABS: readonly { key: QueueTab; label: string; tone: 'blue' | 'green' | 'orange' | 'red' | 'grey' }[] = [
  { key: 'all', label: 'All Applications', tone: 'blue' },
  { key: 'ready', label: 'Ready for Review', tone: 'grey' },
  { key: 'review', label: 'In Review', tone: 'grey' },
  { key: 'flagged', label: 'Flagged', tone: 'red' },
  { key: 'approved', label: 'Approved', tone: 'green' },
  { key: 'rejected', label: 'Rejected', tone: 'red' },
];

/** The queue's state: applications, tab, search, page, ticks and the one open in the panel. */
function useQueue(t: T, by: string) {
  const review = useReview<QueueApp>(t.queue, by);
  const [tab, setTab] = useState<QueueTab>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(t.queue[0].id);
  const [selected, toggle, clear] = useSelection();
  const counts = useMemo(() => countByStatus(review.apps), [review.apps]);
  const shown = useMemo(() => filterApps(review.apps, tab, query), [review.apps, tab, query]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const rows = shown.slice((Math.min(page, pages) - 1) * PER_PAGE, Math.min(page, pages) * PER_PAGE);
  const open = review.apps.find((a) => a.id === openId) ?? review.apps[0];
  const approveSelected = () => {
    if (!selected.size) return toast('Tick the applications to approve first.');
    const r = bulkApprove(review.apps, selected, by);
    review.setApps(r.apps);
    clear();
    toast(`${r.approved.length} approved.${r.skipped.length ? ` ${r.skipped.length} skipped: they have open checks and need a person to look.` : ''}`);
  };
  const pickTab = (k: QueueTab) => {
    setTab(k);
    setPage(1);
  };
  const search = (text: string) => {
    setQuery(text);
    setPage(1);
  };
  return { ...review, tab, setTab: pickTab, query, setQuery: search, page: Math.min(page, pages), setPage, pages, rows, shown, counts, open, setOpenId, selected, toggle, clear, approveSelected };
}
type Q = ReturnType<typeof useQueue>;

/** The AI read for one applicant: Sarah's from the reference, others from their own checks. */
function summaryFor(t: T, a: QueueApp) {
  if (a.n === 1) return t.summary.rows.map((r) => ({ ...r, state: 'ok' as const }));
  const st = (i: number) => a.checks[i]?.state ?? 'ok';
  const word = (s: string, okWord: string) => (s === 'ok' ? okWord : s === 'warn' ? 'Pending' : 'Failed');
  return [
    { label: 'Identity Verification', result: word(st(0), 'Verified'), pct: st(0) === 'ok' ? 97 : st(0) === 'warn' ? 74 : 41, state: st(0) },
    { label: 'Document Authenticity', result: word(st(1), 'Clear'), pct: st(1) === 'ok' ? 93 : st(1) === 'warn' ? 70 : 38, state: st(1) },
    { label: 'Qualification Verification', result: word(st(2), 'Valid'), pct: st(2) === 'ok' ? 90 : st(2) === 'warn' ? 66 : 35, state: st(2) },
    { label: 'Course Content Quality', result: a.score >= 80 ? 'Good' : 'Fair', pct: a.score, state: a.score >= 70 ? ('ok' as const) : ('warn' as const) },
    { label: 'Copyright & Plagiarism Check', result: 'Clean', pct: 92, state: 'ok' as const },
    { label: 'Safeguarding Screening', result: a.safeguarding === 'clear' ? 'Clear' : 'Alert', pct: a.safeguarding === 'clear' ? 95 : 52, state: a.safeguarding === 'clear' ? ('ok' as const) : ('fail' as const) },
  ];
}

const RESULT_TONE = { ok: 'green', warn: 'orange', fail: 'red' } as const;

/** The applicant panel: who, the AI summary, quality fit, documents and the decision buttons. */
function Applicant({ t, q, phone = false }: { t: T; q: Q; phone?: boolean }) {
  const a = q.open;
  const [tab, setTab] = useState('Overview');
  const rows = summaryFor(t, a);
  const open = blockers(a);
  const confidence = open.length ? 'Needs Review' : t.summary.confidence;
  const decided = a.status === 'approved' || a.status === 'rejected' || a.status === 'blocked';
  const fit = t.summary.fit.map((f, i) => ({ ...f, value: a.n === 1 ? f.value : Math.max(55, Math.min(98, a.score + [2, -2, -4, 0][i])) }));
  return (
    <Card style={[styles.side, phone && styles.sidePhone]}>
      <View style={styles.appHead}>
        {a.avatar !== undefined ? <PhotoDot source={a.avatar} size={64} /> : null}
        <View style={styles.flex}>
          <Text style={styles.appName}>{a.name}</Text>
          <View style={styles.appPill}>
            <StatusPill status={a.status} />
          </View>
          <Text style={styles.small}>{`Applicant ID: ${a.id}`}</Text>
          <View style={styles.appWhere}>
            <Flag code={a.flag} size={13} />
            <Text style={styles.small}>{`${a.country}  •  Applied ${a.submitted}`}</Text>
          </View>
        </View>
        {phone ? null : (
          <View style={styles.filters}>
            <OutlineBtn label="Filters" icon="filter" small onPress={() => toast('Filter the queue by country, subject, level, score and AI confidence.')} />
          </View>
        )}
      </View>
      <CountTabs tabs={['Overview', 'Documents', 'Qualifications', 'Courses', 'History'].map((label) => ({ label }))} active={tab} onChange={setTab} size={11.5} dense style={styles.noWrap} />
      {tab === 'Overview' ? (
        <>
          <View style={styles.sectionHead}>
            <Text style={styles.section}>AI Verification Summary</Text>
            <Pill label={confidence} tone={open.length ? 'orange' : 'green'} icon={open.length ? 'alert' : 'check'} size={11.5} />
          </View>
          {rows.map((r) => (
            <View key={r.label} style={styles.sumRow}>
              <CheckDot state={r.state} size={17} />
              <Text style={[styles.sumLabel, styles.flex]}>{r.label}</Text>
              <View style={[styles.sumResult, { backgroundColor: TONES[RESULT_TONE[r.state]].soft }]}>
                <Text style={[styles.sumResultText, { color: TONES[RESULT_TONE[r.state]].text }]}>{r.result}</Text>
              </View>
              <Text style={styles.sumPct}>{`${r.pct}%`}</Text>
            </View>
          ))}
          <Text style={styles.section}>Quality & Teaching Fit</Text>
          <View style={styles.fit}>
            <View style={styles.fitRing}>
              <ScoreRing score={a.score} size={84} stroke={8} label="Quality score" />
              <Text style={styles.fitCaption}>Quality Score</Text>
            </View>
            <View style={styles.flex}>
              {fit.map((f) => (
                <View key={f.label} style={styles.fitRow}>
                  <Text style={[styles.fitLabel, styles.flex]}>{f.label}</Text>
                  <View style={styles.fitTrack}>
                    <View style={[styles.fitFill, { width: `${f.value}%` }]} />
                  </View>
                  <Text style={styles.fitValue}>{f.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      ) : null}
      {tab === 'Overview' || tab === 'Documents' ? (
        <>
          <View style={styles.sectionHead}>
            <Text style={styles.section}>Submitted Documents</Text>
            <Pressable onPress={() => setTab('Documents')} accessibilityRole="link" accessibilityLabel="View all documents" hitSlop={6}>
              <Text style={styles.link}>View All</Text>
            </Pressable>
          </View>
          {t.summary.documents.map((d, i) => {
            const bad = (i === 0 && a.checks[0]?.state === 'fail') || (i === 1 && a.checks[1]?.state === 'fail');
            const file = i === 0 ? `${a.name.split(' ')[0].toLowerCase()}_${d.file}` : d.file;
            return (
              <Pressable key={d.title} style={styles.doc} onPress={() => toast(`Opening ${file} in the secure viewer. Downloads are watermarked and logged.`)} accessibilityRole="button" accessibilityLabel={`${d.title}, ${file}, ${bad ? 'needs review' : 'verified'}`}>
                <View style={styles.docIcon}>
                  <Icon name="doc" size={18} color={BLUE} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.docTitle}>{d.title}</Text>
                  <Text style={styles.small}>{file}</Text>
                </View>
                <Pill label={bad ? 'Needs Review' : 'Verified'} tone={bad ? 'red' : 'green'} icon={bad ? 'alert' : 'check'} size={11.5} />
              </Pressable>
            );
          })}
        </>
      ) : null}
      {tab === 'Qualifications' ? a.checks.map((c) => <CheckLine key={c.label} state={c.state} text={c.label} size={13} />) : null}
      {tab === 'Courses' ? <Text style={styles.small}>{`Sample lesson reviewed: ${a.subjects}, ${a.level}. Content quality ${a.score}/100; no copyright matches found.`}</Text> : null}
      {tab === 'History' ? (
        <View style={styles.history}>
          {a.history.map((h, i) => (
            <Text key={i} style={styles.small}>{`${h.action} by ${h.by}${h.note ? `: “${h.note}”` : ''}`}</Text>
          ))}
          <Text style={styles.small}>{`Submitted ${a.submitted}, ${a.time}. AI pre-screen finished 4 minutes later.`}</Text>
        </View>
      ) : null}
      {decided ? (
        <Text style={styles.decided}>{`Decided: ${a.status}. Changes need an appeal, so the audit record stays intact.`}</Text>
      ) : (
        <>
          <View style={styles.decide}>
            <PrimaryBtn label="Approve & Activate" tone="green" onPress={() => q.act(a, 'approve')} style={styles.approve} />
            <PrimaryBtn label="Reject" tone="red" onPress={() => q.act(a, 'reject')} style={styles.flex} />
          </View>
          <OutlineBtn label="Request More Information" onPress={() => q.act(a, 'requestInfo')} />
        </>
      )}
    </Card>
  );
}

function Stats({ t }: { t: T }) {
  return (
    <View style={styles.kpis}>
      {t.queueStats.map((k) => (
        <CmdStat key={k.label} k={k} style={styles.flex} aside={<MiniBars color={TONES[k.bars].solid} />} />
      ))}
    </View>
  );
}

/** Maple Command › Trust, Safety & Teacher Verification Queue on the desktop reference. */
export function TrustQueueDesk({ c }: { c: CommandData }) {
  const t = c.trust;
  const q = useQueue(t, c.me.name);
  const [when, setWhen, whens] = useChoice(['All Time', 'This Month', 'This Week']);
  const cols: readonly Column<QueueApp>[] = [
    { label: '#', width: 22, render: (a) => <Cell small>{a.n}</Cell> },
    { label: 'Applicant', flex: 1.45, render: (a) => <PersonCell avatar={a.avatar} name={a.name} sub={a.country} flag={a.flag} size={32} /> },
    {
      label: 'Subjects',
      flex: 1.05,
      render: (a) => (
        <View>
          <Cell small strong>
            {a.subjects}
          </Cell>
          <Cell small>{a.level}</Cell>
        </View>
      ),
    },
    {
      label: 'AI Verification Status',
      flex: 1.55,
      render: (a) => (
        <View style={styles.checks}>
          {a.checks.map((k) => (
            <CheckLine key={k.label} state={k.state} text={k.label} size={11} />
          ))}
        </View>
      ),
    },
    { label: 'Quality Score', width: 62, align: 'center', render: (a) => <ScoreRing score={a.score} size={38} /> },
    { label: 'Safeguarding', width: 90, align: 'center', render: (a) => <SafeguardPill state={a.safeguarding} size={11} /> },
    { label: 'Overall', width: 80, align: 'center', render: (a) => <StatusPill status={a.status} size={11} /> },
    {
      label: 'Submitted',
      width: 84,
      render: (a) => (
        <View>
          <Cell small>{a.submitted}</Cell>
          <Cell small>{a.time}</Cell>
        </View>
      ),
    },
    {
      label: 'Actions',
      width: 98,
      render: (a) => (
        <View style={styles.actions}>
          <OutlineBtn label="Review" small onPress={() => q.setOpenId(a.id)} />
          <OutlineBtn icon="more" small onPress={() => toast(`More for ${a.name}: assign to me, add note, open audit trail.`)} />
        </View>
      ),
    },
  ];
  return (
    <CommandDesk me={c.me} search="Search teachers, schools, applications, or reference numbers..." active="Trust & Safety" sub="Verification Queue">
      <CmdHead
        icon="verified"
        title="Trust, Safety & Teacher Verification Queue"
        subtitle="Review AI pre-screened teacher applications, course quality, copyright checks and safeguarding alerts."
        right={
          <>
            <CmdSelect value={when} options={whens} onChange={setWhen} width={170} label="Period" />
            <PrimaryBtn label="Export" chevron onPress={() => exportMenu('Verification queue')} />
          </>
        }
      />
      <Stats t={t} />
      <View style={styles.row}>
        <Card style={[styles.tableCard, styles.flex]}>
          <CountTabs tabs={TABS.map((x) => ({ label: x.label, count: q.counts[x.key], tone: x.tone }))} active={TABS.find((x) => x.key === q.tab)?.label ?? ''} onChange={(l) => q.setTab(TABS.find((x) => x.label === l)?.key ?? 'all')} />
          <View style={styles.tools}>
            <Search placeholder="Search by name, ID, country or subject..." value={q.query} onChange={q.setQuery} style={styles.flex} />
            {q.selected.size ? (
              <>
                <Text style={styles.small}>{`${q.selected.size} selected`}</Text>
                <PrimaryBtn label="Approve Selected" tone="green" onPress={q.approveSelected} />
                <OutlineBtn label="Clear" onPress={q.clear} />
              </>
            ) : null}
          </View>
          <DataTable columns={cols} rows={q.rows} rowKey={(a) => a.id} check selected={q.selected} onToggle={q.toggle} compact onRowPress={(a) => q.setOpenId(a.id)} activeKey={q.open.id} />
          <PageStrip label={q.shown.length ? `Showing ${(q.page - 1) * PER_PAGE + 1}–${Math.min(q.page * PER_PAGE, q.shown.length)} of ${q.shown.length} applications` : 'No applications match'} page={q.page} pages={q.pages} onPage={q.setPage} />
        </Card>
        <View style={styles.sideCol}>
          <Applicant t={t} q={q} />
        </View>
      </View>
      <ReasonModal ask={q.ask} onClose={() => q.setAsk(null)} />
    </CommandDesk>
  );
}

/** The phone version: counts, tabs, the list as cards; tapping one opens the review. */
export function TrustQueuePhone({ c }: { c: CommandData }) {
  const t = c.trust;
  const q = useQueue(t, c.me.name);
  const [view, setView] = useState<'list' | 'review'>('list');
  if (view === 'review') {
    return (
      <CommandPhone key="review" me={c.me}>
        <PageHead title="Review Application" subtitle="AI pre-screen, documents and your decision." phone onBack={() => setView('list')} />
        <Applicant t={t} q={q} phone />
        <ReasonModal ask={q.ask} onClose={() => q.setAsk(null)} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Verification Queue" subtitle="AI pre-screened teacher applications for one-tap human sign-off." phone />
      <KpiGrid items={t.queueStats} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={TABS.map((x) => ({ label: x.label, count: q.counts[x.key], tone: x.tone }))} active={TABS.find((x) => x.key === q.tab)?.label ?? ''} onChange={(l) => q.setTab(TABS.find((x) => x.label === l)?.key ?? 'all')} style={styles.noWrap} />
      </ScrollView>
      <Search placeholder="Search name, ID, country or subject" value={q.query} onChange={q.setQuery} />
      {q.rows.map((a) => (
        <Pressable
          key={a.id}
          style={styles.appCard}
          onPress={() => {
            q.setOpenId(a.id);
            setView('review');
          }}
          accessibilityRole="button"
          accessibilityLabel={`${a.name}, ${a.subjects}, score ${a.score}. Review`}>
          <View style={styles.appCardTop}>
            <View style={styles.flex}>
              <PersonCell avatar={a.avatar} name={a.name} sub={`${a.country} • ${a.subjects}`} flag={a.flag} size={42} />
            </View>
            <ScoreRing score={a.score} size={42} />
          </View>
          <View style={styles.appCardChecks}>
            {a.checks.map((k) => (
              <CheckLine key={k.label} state={k.state} text={k.label} size={12} />
            ))}
          </View>
          <View style={styles.appCardFoot}>
            <SafeguardPill state={a.safeguarding} />
            <StatusPill status={a.status} />
            <Text style={[styles.small, styles.pushRight]}>{a.submitted}</Text>
          </View>
        </Pressable>
      ))}
      <PageStrip label={`${q.shown.length} applications`} page={q.page} pages={q.pages} onPage={q.setPage} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  kpis: { flexDirection: 'row', gap: 14 },
  small: { fontSize: 11.5, color: BODY },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  pushRight: { marginLeft: 'auto' },
  noWrap: { flexWrap: 'nowrap' },
  tableCard: { padding: 12, gap: 10 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checks: { gap: 3, paddingVertical: 6 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sideCol: { width: 366 },
  side: { padding: 14, gap: 10 },
  sidePhone: { padding: 14 },
  appHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  appName: { paddingRight: 84, fontSize: 18, fontWeight: '800', color: NAVY },
  filters: { position: 'absolute', top: 0, right: 0 },
  approve: { flex: 1.35, minWidth: 0 },
  appPill: { flexDirection: 'row', marginVertical: 4 },
  appWhere: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  section: { fontSize: 15, fontWeight: '800', color: NAVY },
  sumRow: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingVertical: 2 },
  sumLabel: { fontSize: 12.5, color: NAVY },
  sumResult: { minWidth: 62, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignItems: 'center' },
  sumResultText: { fontSize: 11.5, fontWeight: '600' },
  sumPct: { width: 34, textAlign: 'right', fontSize: 12.5, fontWeight: '600', color: NAVY },
  fit: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  fitRing: { alignItems: 'center', gap: 4 },
  fitCaption: { fontSize: 11.5, color: BODY },
  fitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  fitLabel: { fontSize: 11.5, color: NAVY },
  fitTrack: { width: 58, height: 6, borderRadius: 3, backgroundColor: '#E6ECF6', overflow: 'hidden' },
  fitFill: { height: 6, borderRadius: 3, backgroundColor: '#22A55A' },
  fitValue: { width: 22, textAlign: 'right', fontSize: 12, fontWeight: '600', color: NAVY },
  doc: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderColor: LINE },
  docIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAF1FF' },
  docTitle: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  history: { gap: 6 },
  decide: { flexDirection: 'row', gap: 10, marginTop: 4 },
  decided: { padding: 10, borderRadius: 10, backgroundColor: '#F1F5FB', fontSize: 12.5, color: NAVY },
  appCard: { gap: 8, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  appCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between' },
  appCardChecks: { gap: 3 },
  appCardFoot: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

