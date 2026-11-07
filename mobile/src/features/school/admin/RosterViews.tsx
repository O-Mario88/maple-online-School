import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn, Card, CardHead, IconTile, Pill, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, MUTED, NAVY, RED, SOFT, type Tone, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { RosterRow, RosterStatus } from '@/mock/school-admin';

import { AdminDesk, AdminPhone, Cell, type Column, DataTable, ListCard, ListRow, MiniBtn, PageHead, Search, Segments, StatusCell, Steps, useSelection } from '../kit/AdminKit';
import { Donut, DonutLabel } from '../kit/Charts';

type Admin = MockData['schoolAdmin'];
type Roster = Admin['roster'];

const AUDIENCES = ['Students', 'Teachers', 'Parents'] as const;
const STATUS_TONE: Readonly<Record<RosterStatus, Tone>> = { Ready: 'green', 'Missing email': 'red', Duplicate: 'orange' };
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/** The import's working state: edited rows, the review tab and what's ticked. */
function useImport(r: Roster) {
  const [rows, setRows] = useState<readonly RosterRow[]>(r.rows);
  const [tab, setTab] = useState('All');
  const [selected, toggle, clear] = useSelection();
  const fixEmail = (n: number, email: string) =>
    setRows((prev) => prev.map((x) => (x.n === n ? { ...x, email, status: x.status === 'Missing email' && isEmail(email) ? 'Ready' : x.status } : x)));
  const remove = (keys: ReadonlySet<string>) => setRows((prev) => prev.filter((x) => !keys.has(String(x.n))));
  const fixed = r.rows.filter((x) => x.status === 'Missing email').length - rows.filter((x) => x.status === 'Missing email').length;
  const counts = { ready: r.summary.ready + fixed, review: r.summary.review - fixed, duplicates: r.summary.duplicates };
  const shown = rows.filter((x) => (tab === 'All' ? true : tab === 'Ready' ? x.status === 'Ready' : tab === 'Needs Review' ? x.status === 'Missing email' : x.status === 'Duplicate'));
  return { rows, shown, tab, setTab, selected, toggle, clear, fixEmail, remove, counts };
}

/** The drop zone: drag a spreadsheet here or choose a file, with the three templates under it. */
function DropZone({ r, onChoose, phone = false }: { r: Roster; onChoose: () => void; phone?: boolean }) {
  return (
    <View style={[styles.drop, phone ? styles.dropPhone : styles.dropDesk]}>
      <Icon name="cloudUpload" size={phone ? 48 : 54} color={BLUE} />
      <Text style={styles.dropTitle}>Drag & drop your Excel or CSV file</Text>
      <Text style={styles.dropLink}>{phone ? 'or tap to browse' : 'or click to browse'}</Text>
      <Text style={styles.dropNote}>Supports XLSX, CSV (Max 20MB)</Text>
      <Btn label="Choose File" onPress={onChoose} height={phone ? 50 : 46} style={styles.choose} />
      {phone ? null : (
        <View style={styles.templates}>
          {r.templates.map((t) => (
            <Pressable key={t} style={styles.template} onPress={() => toast(`Downloading ${t}…`)} accessibilityRole="button" accessibilityLabel={`Download ${t}`}>
              <Icon name="download" size={17} color={BLUE} />
              <Text style={styles.templateText}>{t}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

/** The import summary ring: ready, needs review, duplicates and missing data. */
function Summary({ r, counts, onContinue }: { r: Roster; counts: { ready: number; review: number; duplicates: number }; onContinue: () => void }) {
  const items = [
    { label: 'Ready to import', value: counts.ready, color: '#22A55A' },
    { label: 'Need review', value: counts.review, color: '#F7A21B' },
    { label: 'Duplicates', value: counts.duplicates, color: '#EF3B4D' },
    { label: 'Missing required data', value: r.summary.missing, color: '#A6B0C6' },
  ];
  return (
    <View style={styles.summary}>
      <View style={styles.summaryRow}>
        <Donut slices={items.filter((i) => i.value > 0).map((i) => ({ value: i.value, color: i.color }))} size={124} stroke={16}>
          <DonutLabel value={String(r.summary.total)} caption="Total Rows" size={22} />
        </Donut>
        <View style={styles.summaryLegend}>
          {items.map((i) => (
            <View key={i.label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: i.color }]} />
              <Text style={styles.legendText}>
                <Text style={styles.legendNum}>{i.value}</Text>
                {` ${i.label}`}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <Btn label="Review & Continue" iconRight="arrowRight" onPress={onContinue} height={46} />
    </View>
  );
}

/** Map Columns: each spreadsheet column beside the Maple field it fills. */
function Mapping({ r }: { r: Roster }) {
  const [map, setMap] = useState<readonly string[]>(r.mapping.map((m) => m[1]));
  return (
    <View style={styles.flex}>
      <Text style={styles.paneTitle}>Map Columns</Text>
      <Text style={styles.paneSub}>{"Match your file columns to the required fields. We'll try to detect them automatically."}</Text>
      <View style={styles.mapTable}>
        <View style={[styles.mapRow, styles.mapHead]}>
          <Text style={[styles.mapHeadText, styles.flex]}>Your File Column</Text>
          <Text style={[styles.mapHeadText, styles.mapField]}>Map to Field</Text>
          <View style={styles.mapTick} />
        </View>
        {r.mapping.map((m, i) => {
          const value = map[i];
          const skip = value === 'Skip this column';
          return (
            <View key={m[0]} style={styles.mapRow}>
              <Text style={[styles.mapCol, styles.flex]}>{m[0]}</Text>
              <Pressable
                style={[styles.mapSelect, styles.mapField]}
                onPress={() => setMap((prev) => prev.map((v, k) => (k === i ? r.fields[(r.fields.indexOf(v) + 1) % r.fields.length] : v)))}
                accessibilityRole="button"
                accessibilityLabel={`${m[0]} maps to ${value}. Tap to change`}>
                <Text style={styles.mapValue} numberOfLines={1}>
                  {value}
                </Text>
                <Icon name="chevronDown" size={14} color={NAVY} />
              </Pressable>
              <View style={styles.mapTick}>
                <View style={[styles.tick, skip && styles.tickOff]}>
                  <Icon name={skip ? 'minus' : 'check'} size={13} color={WHITE} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** A parent email: plain text when valid, a red field to type into when missing. */
function EmailField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  if (isEmail(value)) {
    return (
      <Text style={styles.td} numberOfLines={1}>
        {value}
      </Text>
    );
  }
  return (
    <TextInput
      style={[styles.emailInput, !isEmail(draft) && styles.emailBad]}
      value={draft}
      onChangeText={(v) => {
        setDraft(v);
        if (isEmail(v)) onChange(v.trim());
      }}
      placeholder="Add parent email"
      placeholderTextColor="#E7A3AB"
      autoCapitalize="none"
      keyboardType="email-address"
      accessibilityLabel="Parent email"
    />
  );
}

/** Roster Manager on the desktop reference. */
export function RosterDesk({ a }: { a: Admin }) {
  const r = a.roster;
  const imp = useImport(r);
  const [audience, setAudience] = useState<string>('Students');
  const [query, setQuery] = useState('');
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? imp.shown.filter((x) => `${x.first} ${x.last} ${x.status} ${x.email}`.toLowerCase().includes(q)) : imp.shown;
  }, [imp.shown, query]);
  const columns: readonly Column<RosterRow>[] = [
    { label: '#', width: 34, render: (x) => <Cell>{x.n}</Cell> },
    { label: 'First Name', flex: 1, render: (x) => <Cell strong>{x.first}</Cell> },
    { label: 'Last Name', flex: 1, render: (x) => <Cell strong>{x.last}</Cell> },
    { label: 'Class', flex: 0.7, render: (x) => <Cell>{x.cls}</Cell> },
    { label: 'Date of Birth', flex: 1.05, render: (x) => <Cell>{x.dob}</Cell> },
    { label: 'Gender', flex: 0.8, render: (x) => <Cell>{x.gender}</Cell> },
    { label: 'Parent Phone', flex: 1.4, render: (x) => <Cell>{x.phone}</Cell> },
    { label: 'Parent Email', flex: 1.9, render: (x) => <EmailField key={`${x.n}-${x.status}`} value={x.email} onChange={(v) => imp.fixEmail(x.n, v)} /> },
    { label: 'Status', flex: 1.3, render: (x) => <StatusCell label={x.status} tone={STATUS_TONE[x.status]} icon={x.status === 'Ready' ? 'check' : 'alert'} /> },
  ];
  const n = imp.selected.size;
  const tabs = [`All (${r.summary.total})`, `Ready to Import (${imp.counts.ready})`, `Needs Review (${imp.counts.review})`, `Duplicates (${imp.counts.duplicates})`];
  const tabKey = (t: string) => (t.startsWith('All') ? 'All' : t.startsWith('Ready') ? 'Ready' : t.startsWith('Needs') ? 'Needs Review' : 'Duplicates');
  return (
    <AdminDesk me={a.me} search="Search students, teachers, classes, or reports..." active="Rosters">
      <PageHead title="Roster Manager" subtitle="Import and manage students, teachers and parents with smart CSV tools." />
      <View style={styles.toolbar}>
        <Segments items={AUDIENCES} active={audience} onChange={setAudience} />
        <View style={styles.flex} />
        <MiniBtn label="Download Templates" icon="download" onPress={() => toast('Student, teacher and parent templates are downloading (CSV).')} />
        <MiniBtn label="View Import History" icon="doc" onPress={() => toast('3 imports this term: 165 records added, 3 errors fixed.')} />
        <Btn label="Add Individual" icon="plus" onPress={() => toast(`Add one ${audience.slice(0, -1).toLowerCase()} by hand.`)} height={44} />
      </View>
      <Steps steps={r.steps} current={0} />
      <Card style={styles.importCard}>
        <View style={styles.dropCol}>
          <DropZone r={r} onChoose={() => toast(`Choose a CSV or XLSX of ${audience.toLowerCase()}, up to 20 MB.`)} />
        </View>
        <View style={styles.mapWrap}>
          <View style={styles.fileRow}>
            <IconTile icon="doc" tone="green" solid size={40} radius={9} />
            <View style={styles.flex}>
              <Text style={styles.fileName}>{r.file.name}</Text>
              <Text style={styles.fileMeta}>{`${r.file.size}  •  ${r.file.rows} rows`}</Text>
            </View>
            <MiniBtn label="Change File" onPress={() => toast('Choose another file to replace this one.')} />
          </View>
          <View style={styles.panes}>
            <View style={styles.mapPane}>
              <Mapping r={r} />
            </View>
            <View style={styles.sumPane}>
              <View style={styles.sumHead}>
                <Text style={styles.paneTitle}>Import Summary</Text>
                <Pressable onPress={() => toast('Mapping reset to the columns we detected.')} accessibilityRole="button" accessibilityLabel="Reset Mapping">
                  <Text style={styles.reset}>Reset Mapping</Text>
                </Pressable>
              </View>
              <Summary r={r} counts={imp.counts} onContinue={() => imp.setTab('Needs Review')} />
            </View>
          </View>
        </View>
      </Card>
      <Card style={styles.reviewCard}>
        <CardHead
          title="Review & Fix Records"
          subtitle="Check for errors, fix them directly, and choose which records to import."
          right={
            <View style={styles.reviewTools}>
              <Search placeholder="Search by name or error..." value={query} onChange={setQuery} style={styles.reviewSearch} />
              <MiniBtn label="Filters" icon="filter" onPress={() => toast('Filter by class, gender or status.')} />
              <MiniBtn label="Export Errors" icon="download" onPress={() => toast(`Exported ${imp.counts.review + imp.counts.duplicates} rows with errors (CSV).`)} />
            </View>
          }
        />
        <UnderTabs items={tabs} active={tabs.find((t) => tabKey(t) === imp.tab) ?? tabs[0]} onChange={(t) => imp.setTab(tabKey(t))} size={14} />
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(x) => String(x.n)}
          check
          menu
          selected={imp.selected}
          onToggle={imp.toggle}
          onMenu={(x) => toast(x.status === 'Duplicate' ? `${x.first} ${x.last} matches an existing learner. Merge or skip.` : `Edit ${x.first} ${x.last}.`)}
        />
        <View style={styles.footer}>
          <Text style={styles.footerText}>{`${n} of ${r.summary.total} selected`}</Text>
          <View style={styles.flex} />
          <MiniBtn
            label="Remove Selected"
            icon="trash"
            tone="red"
            onPress={() => {
              if (!n) return toast('Tick the rows to remove first.');
              imp.remove(imp.selected);
              imp.clear();
              toast(`Removed ${n} rows from this import.`);
            }}
          />
          <MiniBtn label="Print QR Codes" icon="qr" onPress={() => toast(`Printing Parent Claim QR codes for ${n || r.summary.ready} families…`)} />
          <MiniBtn label="Send via SMS" icon="chat" onPress={() => toast(`Parent claim codes sent by SMS to ${n || r.summary.ready} parents.`)} />
          <Btn
            label="Import Selected"
            onPress={() => {
              if (!n) return toast('Tick the rows you want to import.');
              toast(`Imported ${n} ${audience.toLowerCase()}.`);
              imp.clear();
            }}
            height={44}
            style={n ? undefined : styles.disabled}
          />
        </View>
      </Card>
    </AdminDesk>
  );
}

/** A record as a phone card: name, class, contact and its status; a missing email can be typed in place. */
function RecordCard({ x, onFix }: { x: RosterRow; onFix: (email: string) => void }) {
  return (
    <View style={styles.record}>
      <View style={styles.recordHead}>
        <Text style={styles.recordName}>{`${x.first} ${x.last}`}</Text>
        <StatusCell label={x.status} tone={STATUS_TONE[x.status]} icon={x.status === 'Ready' ? 'check' : 'alert'} />
      </View>
      <Text style={styles.recordMeta}>{`${x.cls}  •  ${x.gender}  •  ${x.dob}`}</Text>
      <Text style={styles.recordMeta}>{x.phone}</Text>
      <EmailField key={x.status} value={x.email} onChange={onFix} />
    </View>
  );
}

/** The phone reference: audience tabs, the drop zone, templates, recent imports and quick actions. */
export function RosterPhone({ a }: { a: Admin }) {
  const r = a.roster;
  const imp = useImport(r);
  const [audience, setAudience] = useState<string>('Students');
  const [loaded, setLoaded] = useState(false);
  const recentTone = (s: string): Tone => (s.includes('errors') ? 'orange' : 'green');
  return (
    <AdminPhone me={a.me}>
      <PageHead title="Roster Manager" subtitle="Import and manage students, teachers and parents." phone />
      <Segments items={AUDIENCES} active={audience} onChange={setAudience} stretch />
      {loaded ? (
        <>
          <Card style={styles.phoneCard}>
            <View style={styles.fileRow}>
              <IconTile icon="doc" tone="green" solid size={40} radius={9} />
              <View style={styles.flex}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {r.file.name}
                </Text>
                <Text style={styles.fileMeta}>{`${r.file.rows} rows  •  columns matched`}</Text>
              </View>
              <Pressable onPress={() => setLoaded(false)} accessibilityRole="button" accessibilityLabel="Change file" hitSlop={8}>
                <Text style={styles.reset}>Change</Text>
              </Pressable>
            </View>
            <Summary r={r} counts={imp.counts} onContinue={() => imp.setTab('Needs Review')} />
          </Card>
          <Segments items={['All', 'Ready', 'Needs Review', 'Duplicates']} active={imp.tab} onChange={imp.setTab} size={13} stretch />
          {imp.shown.map((x) => (
            <RecordCard key={x.n} x={x} onFix={(v) => imp.fixEmail(x.n, v)} />
          ))}
          <Btn label={`Import ${imp.counts.ready} Ready Records`} onPress={() => toast(`Imported ${imp.counts.ready} ${audience.toLowerCase()}. Parent claim codes are ready to send.`)} height={54} />
        </>
      ) : (
        <>
          <DropZone r={r} onChoose={() => setLoaded(true)} phone />
          <Card style={styles.phoneCard}>
            <Text style={styles.paneTitleLarge}>Or download template</Text>
            <Pressable style={styles.templatePhone} onPress={() => toast(`Downloading the ${audience.slice(0, -1)} Roster Template (CSV)…`)} accessibilityRole="button" accessibilityLabel="Download the roster template">
              <Icon name="download" size={22} color={BLUE} />
              <Text style={styles.templateTextLarge}>{`${audience.slice(0, -1)} Roster Template (CSV)`}</Text>
            </Pressable>
          </Card>
        </>
      )}
      <ListCard title="Recent Imports" onAll={() => toast('3 imports this term.')}>
        {r.recent.map((x, i) => (
          <ListRow
            key={x.name}
            last={i === r.recent.length - 1}
            lead={<IconTile icon="doc" tone="green" size={40} radius={10} />}
            title={x.name}
            body={x.when}
            right={
              <View style={styles.recentRight}>
                <Pill label={x.status} tone={recentTone(x.status)} size={11.5} />
                <Text style={[styles.recentDetail, recentTone(x.status) === 'orange' && styles.recentError]}>{x.detail}</Text>
              </View>
            }
          />
        ))}
      </ListCard>
      <Card style={styles.quick}>
        <View style={styles.quickHead}>
          <Icon name="plus" size={20} color={BLUE} />
          <Text style={styles.quickTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickRow}>
          {[
            { label: 'Import Roster', icon: 'upload' as const, run: () => setLoaded(true) },
            { label: 'Print QR Codes', icon: 'qr' as const, run: () => toast(`Printing Parent Claim QR codes for ${r.summary.ready} families…`) },
            { label: 'Send via SMS', icon: 'chat' as const, run: () => toast(`Parent claim codes sent by SMS to ${r.summary.ready} parents.`) },
          ].map((q) => (
            <Pressable key={q.label} style={styles.quickTile} onPress={q.run} accessibilityRole="button" accessibilityLabel={q.label}>
              <Icon name={q.icon} size={30} color={BLUE} />
              <Text style={styles.quickText} numberOfLines={2}>
                {q.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  disabled: { opacity: 0.45 },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  importCard: { flexDirection: 'row', gap: 16, marginTop: 18, padding: 14 },
  dropCol: { width: 290 },
  mapWrap: { flex: 1, minWidth: 0, gap: 14 },
  drop: { alignItems: 'center', gap: 6, padding: 18, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#A9C2F0', backgroundColor: '#F8FAFF' },
  dropDesk: { flex: 1 },
  dropPhone: { paddingVertical: 26, backgroundColor: WHITE },
  dropTitle: { marginTop: 8, fontSize: 16.5, fontWeight: '700', color: NAVY, textAlign: 'center' },
  dropLink: { fontSize: 14.5, color: BLUE },
  dropNote: { marginTop: 6, fontSize: 13.5, color: BODY },
  choose: { alignSelf: 'stretch', marginTop: 12 },
  templates: { alignSelf: 'stretch', marginTop: 12, gap: 6 },
  template: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  templatePhone: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  templateText: { flex: 1, fontSize: 13, color: BLUE },
  templateTextLarge: { flex: 1, fontSize: 16, color: BLUE },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12, borderBottomWidth: 1, borderColor: LINE },
  fileName: { fontSize: 15.5, fontWeight: '700', color: NAVY },
  fileMeta: { marginTop: 2, fontSize: 13, color: BODY },
  panes: { flexDirection: 'row', gap: 16 },
  mapPane: { flex: 1.45, minWidth: 0 },
  sumPane: { flex: 1, minWidth: 0, gap: 10, paddingLeft: 16, borderLeftWidth: 1, borderColor: LINE },
  paneTitle: { fontSize: 16, fontWeight: '800', color: NAVY },
  paneTitleLarge: { fontSize: 17, fontWeight: '700', color: NAVY },
  paneSub: { marginTop: 3, marginBottom: 10, fontSize: 12.5, color: BODY },
  mapTable: { borderRadius: 10, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  mapRow: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 40, paddingHorizontal: 10, borderBottomWidth: 1, borderColor: LINE },
  mapHead: { backgroundColor: '#F3F6FC' },
  mapHeadText: { fontSize: 13, fontWeight: '600', color: NAVY },
  mapCol: { fontSize: 13.5, color: NAVY },
  mapField: { width: 160 },
  mapSelect: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 30, paddingHorizontal: 10, borderRadius: 7, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  mapValue: { flex: 1, fontSize: 13, color: NAVY },
  mapTick: { width: 24, alignItems: 'center' },
  tick: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: GREEN },
  tickOff: { backgroundColor: MUTED },
  sumHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reset: { fontSize: 13.5, fontWeight: '600', color: BLUE },
  summary: { gap: 16 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  summaryLegend: { flex: 1, minWidth: 0, gap: 10 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 11, height: 11, borderRadius: 6 },
  legendText: { flex: 1, fontSize: 13, color: BODY },
  legendNum: { fontWeight: '700', color: NAVY },
  reviewCard: { gap: 14, marginTop: 18 },
  reviewTools: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewSearch: { width: 240 },
  td: { fontSize: 13.5, color: BODY },
  emailInput: { height: 32, paddingVertical: 0, paddingHorizontal: 10, borderRadius: 7, borderWidth: 1, borderColor: LINE, fontSize: 13, color: NAVY, backgroundColor: WHITE },
  emailBad: { borderColor: '#F3A1AB', backgroundColor: '#FFF6F7' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 4 },
  footerText: { fontSize: 14, color: BODY },
  phoneCard: { gap: 12, padding: 16 },
  record: { gap: 5, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  recordHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  recordName: { flex: 1, fontSize: 16, fontWeight: '700', color: NAVY },
  recordMeta: { fontSize: 13.5, color: BODY },
  recentRight: { alignItems: 'flex-end', gap: 6 },
  recentDetail: { fontSize: 13, color: BODY },
  recentError: { color: RED },
  quick: { gap: 12, padding: 14, backgroundColor: SOFT },
  quickHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  quickTitle: { fontSize: 17, fontWeight: '700', color: BLUE },
  quickRow: { flexDirection: 'row', gap: 10 },
  quickTile: { flex: 1, minWidth: 0, alignItems: 'center', gap: 8, paddingVertical: 16, paddingHorizontal: 4, borderRadius: 12, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  quickText: { fontSize: 13.5, color: BLUE },
});
