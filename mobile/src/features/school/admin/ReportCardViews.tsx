import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn, Card, CardHead, IconTile, Pill, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { MarkRow, MarkStatus } from '@/mock/school-admin';

import { AdminDesk, AdminPhone, BigButton, Cell, type Column, DataTable, ListCard, ListRow, MenuRow, MiniBtn, PageHead, Pager, Search, SelectBox, type Stat, StatRow, StatusCell, Steps, useChoice, useSelection } from '../kit/AdminKit';

type Admin = MockData['schoolAdmin'];
type RC = Admin['reportCards'];

const LEAF = require('@/assets/images/maple-leaf.png') as number;
const NAVY_DARK = '#13235C';
const GOLD = '#E3B341';
const STATUS_TONE: Readonly<Record<MarkStatus, Tone>> = { Submitted: 'green', 'Needs Review': 'red', Pending: 'orange' };

/** The term's workflow: which approvals are done and whether reports went out. */
function useWorkflow(rc: RC) {
  const [done, setDone] = useState<readonly string[]>([]);
  const [published, setPublished] = useState(false);
  const [picked, setPicked] = useState(rc.marks[0].adm);
  const approve = (title: string) => {
    setDone((prev) => (prev.includes(title) ? prev : [...prev, title]));
    toast(`${title} signed off.`);
  };
  const ready = rc.moderation.every((m) => done.includes(m.title));
  const publish = () => {
    if (!ready) return toast('Finish moderation, class teacher and head teacher approval first.');
    setPublished(true);
    toast('42 report cards published. Parents are notified and each card is signed into the Maple Learning Passport.');
  };
  const step = published ? 3 : ready ? 3 : done.length ? Math.min(2, done.length) : 0;
  const finished = [0, 1, 2, 3].filter((i) => i < step || (published && i === 3));
  return { done, approve, ready, publish, published, step, finished, picked, setPicked };
}

/** The official term report card, as parents receive it. */
export function ReportCard({ rc, student }: { rc: RC; student: MarkRow }) {
  const p = rc.preview;
  const info: readonly (readonly [string, string])[] = [
    ['Student Name:', student.name],
    ['Admission No:', student.adm],
    ['Class:', 'Primary 1A'],
    ['Term:', 'Term 1, 2026'],
  ];
  return (
    <View style={styles.rc}>
      <View style={styles.rcInner}>
        <Image source={LEAF} style={styles.rcLeaf} contentFit="contain" />
        <Text style={styles.rcSchool}>{p.school}</Text>
        <Text style={styles.rcTitle}>{p.title}</Text>
        <Text style={styles.rcYear}>{p.year}</Text>
        <View style={styles.rcInfo}>
          {info.map(([k, v]) => (
            <View key={k} style={styles.rcInfoRow}>
              <Text style={styles.rcKey}>{k}</Text>
              <Text style={styles.rcVal}>{v}</Text>
            </View>
          ))}
        </View>
        <View style={styles.rcTable}>
          <View style={[styles.rcRow, styles.rcHead]}>
            <Text style={[styles.rcHeadText, styles.rcSubj]}>SUBJECT</Text>
            <Text style={[styles.rcHeadText, styles.rcNum]}>MARK (%)</Text>
            <Text style={[styles.rcHeadText, styles.rcNum]}>GRADE</Text>
            <Text style={[styles.rcHeadText, styles.rcComment]}>COMMENT</Text>
          </View>
          {p.rows.map((r) => (
            <View key={r[0]} style={styles.rcRow}>
              <Text style={[styles.rcCell, styles.rcSubj]}>
                {r[0]}
              </Text>
              <Text style={[styles.rcCell, styles.rcNum]}>{r[0] === 'Mathematics' ? String(student.marks) : r[1]}</Text>
              <Text style={[styles.rcCell, styles.rcNum]}>{r[0] === 'Mathematics' ? student.grade : r[2]}</Text>
              <Text style={[styles.rcCell, styles.rcComment]}>
                {r[3]}
              </Text>
            </View>
          ))}
          <View style={[styles.rcRow, styles.rcHead]}>
            <Text style={[styles.rcHeadText, styles.rcSubj]}>Overall Average</Text>
            <Text style={[styles.rcHeadText, styles.rcNum]}>{p.average[0]}</Text>
            <Text style={[styles.rcHeadText, styles.rcNum]}>{p.average[1]}</Text>
            <View style={styles.rcComment} />
          </View>
          <View style={styles.rcRow}>
            <Text style={[styles.rcCellStrong, styles.flex]}>Position in Class</Text>
            <Text style={styles.rcCellStrong}>{p.position}</Text>
          </View>
        </View>
        <View style={styles.rcCommentBox}>
          <Text style={styles.rcCellStrong}>{"Class Teacher's Comment"}</Text>
          <Text style={styles.rcCell}>{p.comment.replace('Daniel', student.name.split(' ')[0])}</Text>
        </View>
        <View style={styles.rcSigs}>
          {[
            ['Class Teacher', p.teacher],
            ['Head Teacher', p.head],
          ].map(([label, who]) => {
            const w = who as typeof p.teacher;
            return (
              <View key={label as string} style={styles.rcSig}>
                <Text style={styles.rcCell}>{label as string}</Text>
                <Image source={w.sig} style={styles.rcSigImg} contentFit="contain" />
                <Text style={styles.rcCellStrong}>{w.name}</Text>
                <Text style={styles.rcCell}>{`Date: ${w.date}`}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.rcFoot}>
          <Image source={p.seal} style={styles.rcSeal} contentFit="contain" />
          <View style={styles.flex}>
            <Text style={styles.rcFootTitle}>Maple Learning Passport</Text>
            <Text style={styles.rcCell}>This report card is digitally signed and verifiable on the Maple Learning Passport.</Text>
            <Text style={styles.rcCell}>{`Verification ID: ${p.verification.replace('001', student.adm.slice(-3))}`}</Text>
          </View>
          <Image source={p.qr} style={styles.rcQr} contentFit="contain" />
        </View>
      </View>
    </View>
  );
}

/** Subject moderation, class teacher and head teacher sign-off. */
function Moderation({ rc, w }: { rc: RC; w: ReturnType<typeof useWorkflow> }) {
  return (
    <Card style={styles.sideCard}>
      <CardHead title="Moderation & Approval" />
      {rc.moderation.map((m, i) => {
        const done = w.done.includes(m.title);
        const can = i === 0 || w.done.includes(rc.moderation[i - 1].title);
        return (
          <View key={m.title} style={[styles.flowRow, i > 0 && styles.line]}>
            <IconTile icon={done ? 'check' : m.icon} tone={done ? 'green' : m.iconTone} solid size={36} radius={18} />
            <View style={styles.flex}>
              <Text style={styles.flowTitle}>{m.title}</Text>
              <Text style={styles.flowBody}>{m.body}</Text>
            </View>
            {done ? (
              <Pill label="Approved" tone="green" size={13} />
            ) : can ? (
              <Pressable onPress={() => w.approve(m.title)} accessibilityRole="button" accessibilityLabel={`Approve: ${m.title}`}>
                <Pill label={i === 0 ? 'Complete' : 'Approve'} tone="blue" size={13} />
              </Pressable>
            ) : (
              <Pill label={m.status} tone={m.tone} size={13} />
            )}
          </View>
        );
      })}
    </Card>
  );
}

/** Generate the PDFs, sign them into the Learning Passport and tell parents. */
function Publish({ rc, w }: { rc: RC; w: ReturnType<typeof useWorkflow> }) {
  return (
    <Card style={styles.sideCard}>
      <CardHead title="Publish Report Cards" />
      {rc.publish.map((p, i) => (
        <View key={p.title} style={[styles.flowRow, i > 0 && styles.line]}>
          <IconTile icon={p.icon} tone="blue" size={36} radius={9} />
          <View style={styles.flex}>
            <Text style={styles.flowTitle}>{p.title}</Text>
            <Text style={styles.flowBody}>{p.body}</Text>
          </View>
          {w.published ? <Icon name="check" size={20} color="#16A34A" /> : null}
        </View>
      ))}
      <Btn label={w.published ? 'Published to 42 Parents' : 'Publish Report Cards'} onPress={w.publish} height={50} style={w.ready || w.published ? undefined : styles.dim} />
    </Card>
  );
}

function useStats(rc: RC, published: boolean): readonly Stat[] {
  return [
    { value: '42', label: 'Students', sub: '100% roster', subTone: 'green', icon: 'people', tone: 'green' },
    { value: '6', label: 'Subjects', sub: 'All subjects', icon: 'book', tone: 'purple' },
    { value: '28', label: 'Submitted', sub: '67% complete', subTone: 'blue', icon: 'doc', tone: 'blue' },
    { value: '10', label: 'Pending', sub: '24% complete', subTone: 'orange', icon: 'clock', tone: 'orange' },
    { value: '3', label: 'Needs Review', sub: '7% of marks', subTone: 'red', icon: 'person', tone: 'red' },
    { value: published ? '42' : '0', label: 'Published', sub: published ? 'Sent to parents' : 'Not yet published', icon: 'clock', tone: 'blue' },
  ];
}

/** Term Examinations, Moderation & Report Card Publisher on the desktop reference. */
export function ReportCardsDesk({ a }: { a: Admin }) {
  const rc = a.reportCards;
  const w = useWorkflow(rc);
  const [year, setYear, years] = useChoice(a.years);
  const [term, setTerm, terms] = useChoice(a.terms);
  const [grade, setGrade, grades] = useChoice(rc.grades);
  const [cls, setCls, classes] = useChoice(rc.classes);
  const [subject, setSubject, subjects] = useChoice(rc.subjects);
  const [by, setBy, bys] = useChoice(['By Class', 'By Subject', 'By Teacher']);
  const [tab, setTab] = useState(rc.tabs[0]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, toggle] = useSelection();
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? rc.marks.filter((m) => `${m.name} ${m.adm}`.toLowerCase().includes(q)) : rc.marks;
  }, [rc.marks, query]);
  const student = rc.marks.find((m) => m.adm === w.picked) ?? rc.marks[0];
  const columns: readonly Column<MarkRow>[] = [
    { label: '#', width: 30, render: (m) => <Cell>{m.n}</Cell> },
    { label: 'Student Name', flex: 1.7, render: (m) => <Cell strong color={m.status === 'Needs Review' ? RED : undefined}>{m.name}</Cell> },
    { label: 'Adm. No.', flex: 1, render: (m) => <Cell>{m.adm}</Cell> },
    { label: 'Class', flex: 0.7, render: (m) => <Cell>{m.cls}</Cell> },
    { label: 'Marks (100)', flex: 1, align: 'center', render: (m) => <Cell strong color={m.marks < 50 ? RED : undefined}>{m.marks}</Cell> },
    { label: 'Grade', flex: 0.7, align: 'center', render: (m) => <Cell strong color={m.marks < 50 ? RED : undefined}>{m.grade}</Cell> },
    { label: 'Status', flex: 1.3, render: (m) => <StatusCell label={m.status} tone={STATUS_TONE[m.status]} /> },
  ];
  return (
    <AdminDesk me={a.me} search="Search students, classes, teachers, or reports..." active="Report Cards">
      <PageHead
        title="Report Cards"
        subtitle="Manage term examinations, moderation and publish official transcripts."
        right={
          <>
            <SelectBox label="Academic Year" value={year} options={years} onChange={setYear} />
            <SelectBox label="Term" value={term} options={terms} onChange={setTerm} />
            <SelectBox label="Grade" value={grade} options={grades} onChange={setGrade} />
            <SelectBox label="Class" value={cls} options={classes} onChange={setCls} />
          </>
        }
      />
      <Steps steps={rc.steps} current={w.step} done={w.finished} />
      <View style={styles.stats}>
        <StatRow stats={useStats(rc, w.published)} />
      </View>
      <View style={styles.row}>
        <View style={styles.main}>
          <Card style={styles.marksCard}>
            <UnderTabs items={rc.tabs} active={tab} onChange={setTab} size={15} />
            {tab === 'Marks Entry' ? (
              <>
                <View style={styles.tools}>
                  <SelectBox value={subject} options={subjects} onChange={setSubject} width={150} />
                  <SelectBox value={by} options={bys} onChange={setBy} width={120} />
                  <Search placeholder="Search by student name or admission no..." value={query} onChange={setQuery} style={styles.flex} />
                  <MiniBtn label="Import CSV" icon="download" onPress={() => toast(`Upload ${subject} marks for ${cls} from a spreadsheet.`)} />
                  <MiniBtn label="Export" icon="upload" onPress={() => toast(`Exported ${subject} marks for ${cls} (CSV).`)} />
                </View>
                <DataTable
                  columns={columns}
                  rows={rows}
                  rowKey={(m) => m.adm}
                  check
                  menu
                  selected={selected}
                  onToggle={toggle}
                  rowStyle={(m) => [m.status === 'Needs Review' && styles.rowAlert, m.adm === w.picked && styles.rowPicked]}
                  onMenu={(m) => {
                    w.setPicked(m.adm);
                    toast(m.status === 'Needs Review' ? `${m.name} scored ${m.marks}: below the pass mark. Moderate or ask the teacher to re-check.` : `Showing ${m.name}'s report card.`);
                  }}
                />
                <View style={styles.pagerWrap}>
                  <Pager pages={5} page={page} onPage={setPage} label="Showing 1–8 of 42 students" />
                </View>
              </>
            ) : tab === 'Learning Passport' ? (
              <View style={styles.passport}>
                <Image source={rc.preview.seal} style={styles.passportSeal} contentFit="contain" />
                <View style={styles.flex}>
                  <Text style={styles.flowTitle}>Cryptographically signed term transcripts</Text>
                  <Text style={styles.flowBody}>Each published report card is signed with the school’s key and recorded on the learner’s Maple Learning Passport. Anyone with the verification ID or QR code can confirm it is genuine and unchanged.</Text>
                  <Text style={[styles.flowBody, styles.passportState]}>{w.published ? '42 transcripts signed for Term 1, 2026.' : 'Nothing signed yet for Term 1, 2026.'}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.tabBody}>{tab === 'Publish' ? <Publish rc={rc} w={w} /> : <Moderation rc={rc} w={w} />}</View>
            )}
          </Card>
          <View style={styles.bottom}>
            <View style={styles.flex}>
              <Moderation rc={rc} w={w} />
            </View>
            <View style={styles.flex}>
              <Publish rc={rc} w={w} />
            </View>
          </View>
        </View>
        <Card style={styles.previewCard}>
          <CardHead title="Report Card Preview" size={16} right={<MiniBtn label="Download PDF" icon="download" onPress={() => toast(`Downloading ${student.name}'s Term 1 report card (PDF)…`)} />} />
          <ReportCard rc={rc} student={student} />
        </Card>
      </View>
    </AdminDesk>
  );
}

/** The phone reference: term and class, the four steps, the counts, then each stage as a row. */
export function ReportCardsPhone({ a }: { a: Admin }) {
  const rc = a.reportCards;
  const w = useWorkflow(rc);
  const [term, setTerm, terms] = useChoice(['Term 1, 2026', 'Term 2, 2026', 'Term 3, 2026']);
  const [cls, setCls, classes] = useChoice(rc.classes);
  const [view, setView] = useState<'home' | 'marks' | 'card'>('home');
  const student = rc.marks.find((m) => m.adm === w.picked) ?? rc.marks[0];
  const tiles: readonly { value: string; label: string; icon: 'people' | 'book' | 'check' | 'clock'; tone: Tone }[] = [
    { value: '42', label: 'Students', icon: 'people', tone: 'blue' },
    { value: '6', label: 'Subjects', icon: 'book', tone: 'purple' },
    { value: '28', label: 'Submitted', icon: 'check', tone: 'green' },
    { value: '14', label: 'Pending', icon: 'clock', tone: 'orange' },
  ];
  if (view !== 'home') {
    return (
      <AdminPhone me={a.me}>
        <PageHead title={view === 'marks' ? 'Marks' : 'Report Card'} subtitle={view === 'marks' ? `Mathematics • ${cls}` : `${student.name} • Term 1, 2026`} phone onBack={() => setView('home')} />
        {view === 'marks'
          ? rc.marks.map((m) => (
              <Pressable
                key={m.adm}
                style={[styles.markCard, m.status === 'Needs Review' && styles.rowAlert]}
                onPress={() => {
                  w.setPicked(m.adm);
                  setView('card');
                }}
                accessibilityRole="button"
                accessibilityLabel={`${m.name}: ${m.marks}, grade ${m.grade}, ${m.status}`}>
                <View style={styles.flex}>
                  <Text style={styles.flowTitle}>{m.name}</Text>
                  <Text style={styles.flowBody}>{`${m.adm}  •  ${m.cls}`}</Text>
                </View>
                <Text style={[styles.markNum, m.marks < 50 && styles.red]}>{m.marks}</Text>
                <Text style={[styles.markGrade, m.marks < 50 && styles.red]}>{m.grade}</Text>
                <StatusCell label={m.status} tone={STATUS_TONE[m.status]} />
              </Pressable>
            ))
          : <ReportCard rc={rc} student={student} />}
        {view === 'card' ? <Btn label="Download PDF" icon="download" onPress={() => toast(`Downloading ${student.name}'s report card (PDF)…`)} height={52} /> : null}
      </AdminPhone>
    );
  }
  return (
    <AdminPhone me={a.me}>
      <PageHead title="Report Cards" subtitle="View marks, moderation status and publish term reports." phone />
      <View style={styles.phoneSelects}>
        <SelectBox value={term} options={terms} onChange={setTerm} style={styles.flex} />
        <SelectBox value={cls} options={classes} onChange={setCls} style={styles.flex} />
      </View>
      <Steps steps={rc.steps.map((s) => ({ title: s.title.replace(' Entry', '') }))} current={w.step} done={w.finished} compact />
      <View style={styles.tiles}>
        {tiles.map((t) => (
          <View key={t.label} style={[styles.tile, { backgroundColor: TONES[t.tone].soft }]}>
            <Icon name={t.icon} size={30} color={TONES[t.tone].solid} />
            <Text style={styles.tileValue}>{t.value}</Text>
            <Text style={styles.tileLabel}>{t.label}</Text>
          </View>
        ))}
      </View>
      <BigButton label="Review Marks" onPress={() => setView('marks')} />
      <MenuRow icon="edit" tone="blue" title="Enter / Edit Marks" body="View and edit student marks" onPress={() => setView('marks')} />
      <MenuRow icon="check" tone="green" title="Moderation" body={w.done.includes('Subject Moderation') ? 'Completed' : 'Review and moderate marks'} onPress={() => w.approve('Subject Moderation')} />
      <MenuRow
        icon="clock"
        tone="orange"
        title="Approval"
        body={w.ready ? 'Approved by class and head teacher' : 'Submit for school approval'}
        onPress={() => {
          w.approve('Class Teacher Approval');
          w.approve('Head Teacher Approval');
        }}
      />
      <MenuRow icon="book" tone="purple" title="Publish Report Cards" body="Issue to parents (PDF + Learning Passport)" onPress={w.publish} />
      <MenuRow icon="doc" tone="blue" title="View Published Reports" body="Track downloads and parent access" onPress={() => setView('card')} />
      <ListCard title="Recent Activity" onAll={() => toast('All report card activity this term.')}>
        {rc.activity.map((x, i) => (
          <ListRow key={x.title} last={i === rc.activity.length - 1} lead={<IconTile icon={x.icon} tone={x.tone} solid size={34} radius={17} />} title={x.title} body={x.when} />
        ))}
      </ListCard>
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  dim: { opacity: 0.55 },
  red: { color: RED },
  stats: { marginTop: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 16 },
  main: { flex: 1, minWidth: 0, gap: 16 },
  marksCard: { gap: 14, padding: 14 },
  tools: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowAlert: { backgroundColor: '#FFF4F5' },
  rowPicked: { backgroundColor: '#EEF4FF' },
  pagerWrap: { marginTop: -4 },
  tabBody: { gap: 12 },
  passport: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 16, borderRadius: 12, backgroundColor: '#F7F9FE' },
  passportSeal: { width: 54, height: 56 },
  passportState: { marginTop: 8, color: NAVY, fontWeight: '600' },
  bottom: { flexDirection: 'row', gap: 16 },
  sideCard: { gap: 6, padding: 16 },
  flowRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  line: { borderTopWidth: 1, borderColor: LINE },
  flowTitle: { fontSize: 15, fontWeight: '600', color: BLUE },
  flowBody: { marginTop: 2, fontSize: 13, color: BODY },
  previewCard: { width: 372, gap: 12, padding: 14 },
  rc: { padding: 5, borderRadius: 4, borderWidth: 2, borderColor: GOLD, backgroundColor: '#FFFDF7' },
  rcInner: { alignItems: 'center', gap: 4, padding: 12, borderWidth: 1, borderColor: '#EAD9A8', backgroundColor: WHITE },
  rcLeaf: { width: 34, height: 36 },
  rcSchool: { fontSize: 15, fontWeight: '700', color: NAVY_DARK, textAlign: 'center' },
  rcTitle: { fontSize: 13, fontWeight: '800', color: NAVY_DARK },
  rcYear: { fontSize: 10.5, color: BODY },
  rcInfo: { alignSelf: 'stretch', gap: 2, marginVertical: 8 },
  rcInfoRow: { flexDirection: 'row' },
  rcKey: { width: 92, fontSize: 10.5, color: BODY },
  rcVal: { flex: 1, fontSize: 10.5, fontWeight: '600', color: NAVY_DARK },
  rcTable: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#C9CFDD' },
  rcRow: { flexDirection: 'row', alignItems: 'center', minHeight: 21, paddingHorizontal: 5, borderBottomWidth: 1, borderColor: '#DCE1EB' },
  rcHead: { backgroundColor: NAVY_DARK },
  rcHeadText: { fontSize: 9.5, fontWeight: '700', color: WHITE },
  rcSubj: { flex: 1.5, minWidth: 0 },
  rcNum: { width: 54, textAlign: 'center' },
  rcComment: { flex: 1.5, minWidth: 0 },
  rcCell: { fontSize: 9.5, color: '#2A3352' },
  rcCellStrong: { fontSize: 9.5, fontWeight: '700', color: NAVY_DARK },
  rcCommentBox: { alignSelf: 'stretch', gap: 3, marginTop: 8, padding: 7, borderWidth: 1, borderColor: '#DCE1EB' },
  rcSigs: { alignSelf: 'stretch', flexDirection: 'row', gap: 10, marginTop: 8 },
  rcSig: { flex: 1, gap: 1 },
  rcSigImg: { width: 80, height: 34 },
  rcFoot: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderColor: '#EAD9A8' },
  rcFootTitle: { fontSize: 11, fontWeight: '700', color: NAVY_DARK },
  rcSeal: { width: 34, height: 36 },
  rcQr: { width: 46, height: 48 },
  phoneSelects: { flexDirection: 'row', gap: 10 },
  tiles: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, minWidth: 0, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: 14 },
  tileValue: { fontSize: 24, fontWeight: '800', color: NAVY },
  tileLabel: { fontSize: 12.5, color: BODY },
  markCard: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  markNum: { fontSize: 17, fontWeight: '800', color: NAVY },
  markGrade: { width: 28, fontSize: 15, fontWeight: '700', color: NAVY, textAlign: 'center' },
});
