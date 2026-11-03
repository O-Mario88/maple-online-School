import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CmdSelect, CmdStat, CountTabs, DetailRow, type Kpi, OutlineBtn, PageStrip, Panel, PrimaryBtn } from '@/features/command/kit/CmdParts';
import { ReasonModal, type ReasonAsk } from '@/features/command/kit/ReasonModal';
import { Card, Pill } from '@/features/portal/PortalParts';
import { PremiumTiles } from '@/features/portal/Premium';
import { BLUE, BODY, GREEN, LINE, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { AdminPhone, Cell, type Column, DataTable, PageHead, Search, SelectBox, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import { type BookEntry, dayLabel } from '@/mock/school-books';

import { canEdit, type EntryStatus, entryTotals, type JournalLine, nextEntryId, postEntry, reverseEntry } from './books';
import { BooksDesk, BooksHead } from './BooksFrame';
import { EntryModal } from './BooksModals';

type Admin = MockData['schoolAdmin'];
const PER_PAGE = 10;
const STATUS_TONE: Readonly<Record<EntryStatus, Tone>> = { Posted: 'green', Draft: 'grey', Reversing: 'red' };
type TabKey = 'all' | 'Draft' | 'Posted' | 'Reversing' | 'Recurring';
const TABS: readonly { label: string; key: TabKey }[] = [
  { label: 'All Entries', key: 'all' },
  { label: 'Draft', key: 'Draft' },
  { label: 'Posted', key: 'Posted' },
  { label: 'Reversing', key: 'Reversing' },
  { label: 'Recurring', key: 'Recurring' },
];
const ugx = (n: number) => n.toLocaleString('en-US');
const nowLabel = () => `Oct 26, 2026, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

const inTab = (e: BookEntry, key: TabKey) => (key === 'all' ? true : key === 'Recurring' ? !!e.recurring : e.status === key);

type Editor = { mode: 'new' } | { mode: 'edit' | 'copy'; from: BookEntry };

function useJournal(a: Admin) {
  const b = a.books;
  const ME = a.me.name;
  const [list, setList] = useState<readonly BookEntry[]>(b.entries);
  const [tab, setTab] = useState(TABS[0].label);
  const [query, setQuery] = useState('');
  const [dates, setDates, dateOptions] = useChoice(['All Dates', 'Last 7 Days', 'This Month']);
  const [kind, setKind, kinds] = useChoice(['All Types', 'Manual Entry', 'Recurring Entry']);
  const [status, setStatus, statuses] = useChoice(['All Statuses', 'Posted', 'Draft', 'Reversing']);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(b.entries[0]?.id ?? null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [ask, setAsk] = useState<ReasonAsk | null>(null);
  const [activity, setActivity] = useState<readonly { who: string; what: string; when: string; icon: IconName }[]>(() =>
    b.entries.slice(0, 4).map((e) => ({ who: e.createdBy, what: e.status === 'Draft' ? `created ${e.id} (Draft)` : `posted ${e.id}`, when: e.postedAt ?? e.createdAt, icon: e.status === 'Draft' ? 'cart' : 'arrowUp' })),
  );
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const key = TABS.find((t) => t.label === tab)?.key ?? 'all';
    const q = query.trim().toLowerCase();
    const inDates = (e: BookEntry) => dates === 'All Dates' || (dates === 'Last 7 Days' ? e.date >= '2026-10-20' : e.date.startsWith('2026-10'));
    return list.filter(
      (e) =>
        inTab(e, key) &&
        inDates(e) &&
        (kind === 'All Types' || e.source === kind) &&
        (status === 'All Statuses' || e.status === status) &&
        (!q || `${e.id} ${e.description} ${e.createdBy} ${e.date} ${e.lines.map((l) => l.account).join(' ')}`.toLowerCase().includes(q)),
    );
  }, [list, tab, query, dates, kind, status]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const open = list.find((e) => e.id === openId) ?? null;
  const nextId = nextEntryId(list);
  const accounts = b.accounts;
  const name = (code: string) => accounts.find((x) => x.code === code)?.name ?? code;
  const note = (what: string, icon: IconName) => setActivity((prev) => [{ who: ME, what, when: nowLabel(), icon }, ...prev]);
  const update = (e: BookEntry) => setList((prev) => prev.map((x) => (x.id === e.id ? e : x)));

  const save = (d: { description: string; lines: readonly JournalLine[]; post: boolean }): string | undefined => {
    const editing = editor?.mode === 'edit' ? editor.from : null;
    const base: BookEntry = editing
      ? { ...editing, description: d.description, lines: d.lines }
      : { id: nextId, date: b.today, description: d.description, lines: d.lines, status: 'Draft', createdBy: ME, createdAt: nowLabel(), source: 'Manual Entry', notes: d.description, attachments: [] };
    const r = d.post ? postEntry(base, accounts, ME, nowLabel()) : { entry: base };
    if ('error' in r && r.error) return r.error;
    if (editing) update(r.entry);
    else setList((prev) => [r.entry, ...prev]);
    setOpenId(r.entry.id);
    note(`${d.post ? 'posted' : editing ? 'edited' : 'created'} ${r.entry.id}${d.post ? '' : ' (Draft)'}`, d.post ? 'arrowUp' : 'edit');
    toast(d.post ? `${r.entry.id} posted to the general ledger.` : `${r.entry.id} saved as a draft.`);
    return undefined;
  };
  const post = (e: BookEntry) => {
    const r = postEntry(e, accounts, ME, nowLabel());
    if (r.error) return toast(r.error);
    update(r.entry);
    note(`posted ${e.id}`, 'arrowUp');
    toast(`${e.id} posted. Debits and credits are equal.`);
  };
  const edit = (e: BookEntry) => (canEdit(e) ? setEditor({ mode: 'edit', from: e }) : toast(`${e.id} is ${e.status.toLowerCase()} and locked. Reverse it and post a corrected entry.`));
  const reverse = (e: BookEntry) =>
    setAsk({
      title: `Reverse ${e.id}?`,
      body: 'A new entry with every debit and credit swapped is posted today. The original stays in the ledger.',
      confirm: 'Reverse Entry',
      tone: 'red',
      onConfirm: (reason) => {
        const r = reverseEntry(e, nextId, b.today, ME);
        if (r.error || !r.reversal) return toast(r.error ?? 'Could not reverse this entry.');
        const reversal: BookEntry = { ...r.reversal, createdAt: nowLabel(), postedAt: nowLabel(), source: 'Reversal', notes: reason, attachments: [] };
        setList((prev) => [reversal, ...prev.map((x) => (x.id === e.id ? r.original : x))]);
        setOpenId(reversal.id);
        note(`reversed ${e.id} with ${reversal.id}`, 'undo');
        toast(`${reversal.id} reverses ${e.id}.`);
      },
    });
  const counts = (key: TabKey) => {
    const live = (l: readonly BookEntry[]) => l.filter((e) => inTab(e, key)).length;
    return b.entryTotals[key] + live(list) - live(b.entries);
  };
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  return { b, list, rows, shown, tab, setTab: pick, query, setQuery, dates, setDates, dateOptions, kind, setKind, kinds, status, setStatus, statuses, page: p, pages, setPage, open, setOpenId, editor, setEditor, save, post, edit, reverse, ask, setAsk, activity, counts, name, nextId, selected, toggle };
}
type U = ReturnType<typeof useJournal>;

function kpis(u: U): readonly Kpi[] {
  return [
    { label: 'Total Entries', value: String(u.counts('all')), icon: 'doc', tone: 'blue', delta: '12%', caption: 'vs. last term' },
    { label: 'Posted Entries', value: String(u.counts('Posted')), icon: 'doc', tone: 'green', delta: '15%' },
    { label: 'Draft Entries', value: String(u.counts('Draft')), icon: 'doc', tone: 'orange', delta: '5%', down: true },
    { label: 'Reversing Entries', value: String(u.counts('Reversing')), icon: 'undo', tone: 'red', delta: '20%', down: true },
    { label: 'Awaiting Approval', value: '0', icon: 'clock', tone: 'purple', caption: 'No change' },
  ];
}

/** An icon for what the entry does: money in, money out, a purchase or a transfer. */
function entryLook(e: BookEntry): { icon: IconName; tone: Tone } {
  const dr = e.lines.find((l) => l.debit > 0)?.account ?? '';
  const cr = e.lines.find((l) => l.credit > 0)?.account ?? '';
  if (dr.startsWith('1') && cr.startsWith('4')) return { icon: 'arrowDown', tone: 'green' };
  if (dr.startsWith('1') && cr.startsWith('1')) return { icon: 'building', tone: 'green' };
  if (dr.startsWith('1')) return { icon: 'cart', tone: 'purple' };
  if (dr.startsWith('5') && e.description.toLowerCase().includes('salar')) return { icon: 'people', tone: 'blue' };
  if (dr.startsWith('5')) return { icon: 'receipt', tone: 'red' };
  return { icon: 'undo', tone: 'orange' };
}

const COLS: readonly Column<BookEntry>[] = [
  { label: 'Date', width: 84, render: (e) => <Cell small>{dayLabel(e.date)}</Cell> },
  { label: 'Reference No.', width: 96, render: (e) => <Cell small>{e.id}</Cell> },
  { label: 'Description', flex: 1.4, render: (e) => <Cell small>{e.description}</Cell> },
  { label: 'Debit (UGX)', width: 84, render: (e) => <Cell small>{ugx(entryTotals(e).debit)}</Cell> },
  { label: 'Credit (UGX)', width: 84, render: (e) => <Cell small>{ugx(entryTotals(e).credit)}</Cell> },
  { label: 'Status', width: 80, render: (e) => <Pill label={e.status} tone={STATUS_TONE[e.status]} size={10.5} /> },
  { label: 'Created By', width: 74, render: (e) => <Cell small>{e.createdBy}</Cell> },
];

function LinesTable({ e, u }: { e: BookEntry; u: U }) {
  const t = entryTotals(e);
  return (
    <View style={styles.lines}>
      <View style={[styles.lineRow, styles.lineHead]}>
        <Text style={[styles.th, styles.num]}>#</Text>
        <Text style={[styles.th, styles.flex]}>Account</Text>
        <Text style={[styles.th, styles.amt]}>Debit (UGX)</Text>
        <Text style={[styles.th, styles.amt]}>Credit (UGX)</Text>
      </View>
      {e.lines.map((l, i) => (
        <View key={`${l.account}-${i}`} style={styles.lineRow}>
          <Text style={[styles.td, styles.num]}>{i + 1}</Text>
          <Text style={[styles.td, styles.flex]}>{`${l.account} - ${u.name(l.account)}`}</Text>
          <Text style={[styles.td, styles.amt]}>{l.debit ? ugx(l.debit) : '-'}</Text>
          <Text style={[styles.td, styles.amt]}>{l.credit ? ugx(l.credit) : '-'}</Text>
        </View>
      ))}
      <View style={[styles.lineRow, styles.lineTotal]}>
        <Text style={[styles.totalText, styles.flex]}>Total</Text>
        <Text style={[styles.totalText, styles.amt]}>{ugx(t.debit)}</Text>
        <Text style={[styles.totalText, styles.amt]}>{ugx(t.credit)}</Text>
      </View>
    </View>
  );
}

function DetailsPanel({ u, onClose }: { u: U; onClose?: () => void }) {
  const e = u.open;
  const [tab, setTab] = useState('Lines');
  if (!e)
    return (
      <Card style={styles.panel}>
        <Text style={styles.small}>Pick an entry to see it.</Text>
      </Card>
    );
  const look = entryLook(e);
  const tabs = ['Details', `Lines (${e.lines.length})`, `Attachments (${e.attachments.length})`, 'History'];
  return (
    <Card style={styles.panel}>
      <View style={styles.inline}>
        <Text style={[styles.panelTitle, styles.flex]}>Journal Entry Details</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close details" hitSlop={8}>
            <Icon name="close" size={18} color={BODY} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.inline}>
        <View style={[styles.lead, { backgroundColor: TONES[look.tone].solid }]}>
          <Icon name={look.icon} size={20} color={WHITE} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.entryId}>{e.id}</Text>
          <Text style={styles.small}>{e.description}</Text>
          <Text style={styles.small}>{e.createdAt}</Text>
        </View>
        <Pill label={e.status} tone={STATUS_TONE[e.status]} size={11} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={tabs.map((label) => ({ label }))} active={tabs.find((x) => x.startsWith(tab)) ?? tabs[1]} onChange={(l) => setTab(l.split(' (')[0])} size={12.5} dense style={styles.noWrap} />
      </ScrollView>
      {tab === 'Lines' || tab === 'Details' ? <LinesTable e={e} u={u} /> : null}
      {tab === 'Attachments' ? (
        e.attachments.length ? (
          e.attachments.map((f) => (
            <Pressable key={f} style={styles.attach} onPress={() => toast(`Opening ${f}…`)} accessibilityRole="button" accessibilityLabel={`Open ${f}`}>
              <Icon name="doc" size={18} color={RED} />
              <Text style={[styles.td, styles.flex]}>{f}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.small}>No attachments.</Text>
        )
      ) : null}
      {tab === 'History' ? <Text style={styles.small}>{[`Created by ${e.createdBy} • ${e.createdAt}`, e.postedAt ? `Posted by ${e.postedBy} • ${e.postedAt}` : 'Not posted yet', e.reverses ? `Reverses ${e.reverses}` : '', e.reversedBy ? `Reversed by ${e.reversedBy}` : ''].filter(Boolean).join('\n')}</Text> : null}
      <DetailRow label="Reference No." value={e.id} />
      <DetailRow label="Date" value={dayLabel(e.date)} />
      <DetailRow label="Description" value={e.description} />
      <DetailRow label="Source" value={e.source} />
      <DetailRow label="Status">
        <Pill label={e.status} tone={STATUS_TONE[e.status]} size={10.5} style={styles.pillStart} />
      </DetailRow>
      <DetailRow label="Created By" value={e.createdBy} />
      <DetailRow label="Created At" value={e.createdAt} />
      <DetailRow label="Posted At" value={e.postedAt ?? '—'} />
      <DetailRow label="Notes" value={e.notes} />
      {e.status === 'Draft' ? <PrimaryBtn label="Post Entry" icon="check" onPress={() => u.post(e)} /> : null}
      <View style={styles.inline}>
        <OutlineBtn label="Edit Entry" icon="edit" small onPress={() => u.edit(e)} style={styles.flex} />
        <OutlineBtn label="Copy Entry" icon="layers" small onPress={() => u.setEditor({ mode: 'copy', from: e })} style={styles.flex} />
        <Pressable style={styles.reverse} onPress={() => u.reverse(e)} accessibilityRole="button" accessibilityLabel="Reverse Entry">
          <Icon name="undo" size={14} color={RED} />
          <Text style={styles.reverseText}>Reverse Entry</Text>
        </Pressable>
      </View>
      <View style={styles.inline}>
        <OutlineBtn label="View in General Ledger" icon="doc" small onPress={() => toast(`General ledger: ${e.lines.map((l) => `${l.account} ${u.name(l.account)}`).join(' and ')}.`)} style={styles.flex} />
        <OutlineBtn label="Download PDF" icon="download" small onPress={() => toast(`${e.id}.pdf with lines, totals and approvals.`)} style={styles.flex} />
      </View>
    </Card>
  );
}

function QuickActions({ u }: { u: U }) {
  const items: readonly [IconName, Tone, string, string, () => void][] = [
    ['plus', 'blue', 'New Journal Entry', 'Record a new transaction', () => u.setEditor({ mode: 'new' })],
    ['doc', 'green', 'Import from Excel', 'Bulk import entries', () => toast('Import entries from Excel: each row is a line; entries must balance to import.')],
    ['sync', 'purple', 'Recurring Entries', 'Set up auto entries', () => u.setTab('Recurring')],
    ['undo', 'red', 'Reverse Entry', 'Create reversing entry', () => (u.open ? u.reverse(u.open) : toast('Pick a posted entry first.'))],
  ];
  return (
    <Panel title="Quick Actions" style={[styles.block, styles.flex]}>
      <View style={styles.quick}>
        {items.map(([icon, tone, title, body, fn]) => (
          <Pressable key={title} style={({ hovered }) => [styles.quickBtn, hovered && styles.hover]} onPress={fn} accessibilityRole="button" accessibilityLabel={title}>
            <View style={[styles.quickIcon, { backgroundColor: TONES[tone].solid }]}>
              <Icon name={icon} size={16} color={WHITE} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.quickTitle}>{title}</Text>
              <Text style={styles.small}>{body}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Panel>
  );
}

function Recent({ u }: { u: U }) {
  return (
    <Panel title="Recent Activity" onAll={() => u.setTab('All Entries')} style={[styles.block, styles.flex]}>
      {u.activity.slice(0, 4).map((x, i) => (
        <View key={`${x.what}-${i}`} style={styles.activity}>
          <Icon name={x.icon} size={16} color={BLUE} />
          <View style={styles.flex}>
            <Text style={styles.td}>{`${x.who} ${x.what}`}</Text>
            <Text style={styles.small}>{x.when}</Text>
          </View>
        </View>
      ))}
    </Panel>
  );
}

function Editors({ u }: { u: U }) {
  const ed = u.editor;
  const key = ed ? `${ed.mode}-${ed.mode === 'new' ? '' : ed.from.id}` : 'none';
  return (
    <>
      <EntryModal key={key} visible={!!ed} onClose={() => u.setEditor(null)} accounts={u.b.accounts} id={ed?.mode === 'edit' ? ed.from.id : u.nextId} onSave={u.save} initial={ed && ed.mode !== 'new' ? { description: ed.mode === 'copy' ? `${ed.from.description} (Copy)` : ed.from.description, lines: ed.from.lines } : undefined} editing={ed?.mode === 'edit'} />
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </>
  );
}

/** School admin › Accounting › Journal Entries on the desktop reference. */
export function JournalDesk({ a }: { a: Admin }) {
  const u = useJournal(a);
  return (
    <BooksDesk a={a} sub="Journal Entries" search="Search accounts, transactions, vendors, or reports...">
      <BooksHead
        a={a}
        icon="doc"
        title="Journal Entries"
        subtitle="Record, review, and manage all financial transactions for your school. Ensure accurate and compliant accounting."
        actions={
          <>
            <OutlineBtn label="Import" icon="upload" onPress={() => toast('Import entries from Excel or CSV.')} />
            <OutlineBtn label="Export" chevron onPress={() => toast('Journal export: CSV, XLSX or PDF.')} />
            <PrimaryBtn label="New Journal Entry" icon="plus" onPress={() => u.setEditor({ mode: 'new' })} />
          </>
        }
      />
      <View style={styles.kpis}>
        {kpis(u).map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <View style={[styles.flex, styles.stack]}>
          <Card style={styles.tableCard}>
            <CountTabs tabs={TABS.map((t) => ({ label: t.label, count: u.counts(t.key), tone: t.key === 'Posted' ? ('green' as const) : t.key === 'all' ? ('blue' as const) : ('red' as const) }))} active={u.tab} onChange={u.setTab} size={13} dense style={styles.noWrap} />
            <View style={styles.inline}>
              <Search placeholder="Search by reference, description, account, or user..." value={u.query} onChange={u.setQuery} style={styles.flex} />
              <CmdSelect value={u.dates} options={u.dateOptions} onChange={u.setDates} width={110} label="Dates" />
              <CmdSelect value={u.kind} options={u.kinds} onChange={u.setKind} width={130} label="Type" />
              <CmdSelect value={u.status} options={u.statuses} onChange={u.setStatus} width={120} label="Status" />
            </View>
            <DataTable columns={COLS} rows={u.rows} rowKey={(e) => e.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={(e) => u.setOpenId(e.id)} onRowPress={(e) => u.setOpenId(e.id)} activeKey={u.open?.id} />
            <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} entries`} page={u.page} pages={u.pages} onPage={u.setPage} />
          </Card>
          <View style={styles.row}>
            <QuickActions u={u} />
            <Recent u={u} />
          </View>
        </View>
        <View style={styles.side}>
          <DetailsPanel u={u} onClose={() => u.setOpenId(null)} />
        </View>
      </View>
      <Editors u={u} />
    </BooksDesk>
  );
}

/** The phone version: tabs, tiles and entry cards, with New Journal Entry at the bottom. */
export function JournalPhone({ a }: { a: Admin }) {
  const u = useJournal(a);
  const [view, setView] = useState<'list' | 'detail'>('list');
  const [term, setTerm, terms] = useChoice(a.books.terms);
  const phoneTabs = ['All Entries', 'Draft', 'Posted', 'Recurring'];
  if (view === 'detail') {
    return (
      <AdminPhone key="detail" me={a.me}>
        <PageHead title={u.open?.id ?? 'Entry'} subtitle={u.open?.description ?? ''} phone onBack={() => setView('list')} />
        <DetailsPanel u={u} />
        <Editors u={u} />
      </AdminPhone>
    );
  }
  return (
    <AdminPhone
      key="list"
      me={a.me}
      footer={
        <View style={styles.foot}>
          <PrimaryBtn label="New Journal Entry" icon="plus" onPress={() => u.setEditor({ mode: 'new' })} />
        </View>
      }>
      <PageHead title="Journal Entries" subtitle="Every transaction, debits equal to credits." phone right={<SelectBox value={term} options={terms} onChange={setTerm} width={140} />} />
      <View style={styles.segments}>
        {phoneTabs.map((t) => (
          <Pressable key={t} style={[styles.segment, u.tab === t && styles.segmentOn]} onPress={() => u.setTab(t)} accessibilityRole="tab" accessibilityState={{ selected: u.tab === t }} accessibilityLabel={t}>
            <Text style={[styles.segmentText, u.tab === t && styles.segmentTextOn]}>{t === 'All Entries' ? 'All' : t}</Text>
          </Pressable>
        ))}
      </View>
      <PremiumTiles title="Entries Summary" subtitle="This term's journal entries." items={kpis(u).slice(0, 4).map((k) => ({ label: k.label.replace(' Entries', ''), value: k.value, icon: k.icon, tone: k.tone, delta: k.delta, down: k.down, good: k.good, caption: k.caption }))} minHeight={140} />
      <Search placeholder="Search by reference, date, or description..." value={u.query} onChange={u.setQuery} />
      {u.rows.map((e) => {
        const look = entryLook(e);
        return (
          <Pressable
            key={e.id}
            style={styles.card}
            onPress={() => {
              u.setOpenId(e.id);
              setView('detail');
            }}
            accessibilityRole="button"
            accessibilityLabel={`${e.id}, ${e.description}, UGX ${ugx(entryTotals(e).debit)}, ${e.status}`}>
            <View style={[styles.cardIcon, { backgroundColor: TONES[look.tone].soft }]}>
              <Icon name={look.icon} size={20} color={TONES[look.tone].solid} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.small}>{dayLabel(e.date)}</Text>
              <Text style={styles.td}>{e.id}</Text>
              <Text style={styles.td}>{e.description}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardAmt}>{`UGX ${ugx(entryTotals(e).debit)}`}</Text>
              <Pill label={e.status} tone={STATUS_TONE[e.status]} size={11} />
            </View>
          </Pressable>
        );
      })}
      {!u.rows.length ? <Text style={styles.small}>No entries match.</Text> : null}
      <PageStrip label={`${u.shown.length} entries`} page={u.page} pages={u.pages} onPage={u.setPage} />
      <Editors u={u} />
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stack: { gap: 12 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noWrap: { flexWrap: 'nowrap' },
  block: { gap: 8 },
  hover: { backgroundColor: '#F3F6FC' },
  small: { fontSize: 12, lineHeight: 17, color: BODY },
  td: { fontSize: 12.5, color: NAVY },
  th: { fontSize: 11.5, fontWeight: '700', color: NAVY },
  panelTitle: { fontSize: 15, fontWeight: '800', color: NAVY },
  tableCard: { gap: 10, padding: 12 },
  side: { width: 368 },
  panel: { gap: 8, padding: 14 },
  lead: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  entryId: { fontSize: 15, fontWeight: '800', color: NAVY },
  pillStart: { alignSelf: 'flex-start' },
  lines: { borderRadius: 10, borderWidth: 1, borderColor: LINE, overflow: 'hidden' },
  lineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1, borderColor: LINE },
  lineHead: { backgroundColor: '#F4F7FC' },
  lineTotal: { borderBottomWidth: 0, backgroundColor: '#F4F7FC' },
  totalText: { fontSize: 13.5, fontWeight: '800', color: NAVY },
  num: { width: 16 },
  amt: { width: 78, textAlign: 'right' },
  attach: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  reverse: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, minHeight: 34, paddingHorizontal: 6, borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' },
  reverseText: { fontSize: 12, fontWeight: '600', color: RED },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '48%', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  quickIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickTitle: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  activity: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  foot: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: WHITE, borderTopWidth: 1, borderColor: LINE },
  segments: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: 12, backgroundColor: '#EEF3FB' },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 9 },
  segmentOn: { backgroundColor: BLUE },
  segmentText: { fontSize: 13.5, color: NAVY },
  segmentTextOn: { fontWeight: '700', color: WHITE },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cardIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardAmt: { fontSize: 14, fontWeight: '800', color: GREEN },
});
