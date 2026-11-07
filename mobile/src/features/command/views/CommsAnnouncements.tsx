import { Image } from '@/components/picture';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CmdStat, CountTabs, KpiGrid, OutlineBtn, PageStrip, PrimaryBtn, RangeBox } from '@/features/command/kit/CmdParts';
import { CmdHead, CommandDesk, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { ReasonModal, type ReasonAsk } from '@/features/command/kit/ReasonModal';
import { archive, duplicate, publish, schedule } from '@/features/command/logic/comms';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Search, SelectBox, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { AnnouncementRow, Audience } from '@/mock/command-center/comms';
import { Maple } from '@/constants/maple';

type M = CommandData['comms'];
type Status = AnnouncementRow['status'];
const PER_PAGE = 10;
export const AUDIENCE_TONE: Readonly<Record<Audience, Tone>> = { Students: 'blue', 'All Users': 'grey', Parents: 'purple', Teachers: 'orange' };
export const AUDIENCE_ICON: Readonly<Record<Audience, IconName>> = { Students: 'people', 'All Users': 'person', Parents: 'people', Teachers: 'cap' };
const STATUS_TONE: Readonly<Record<Status, Tone>> = { Published: 'green', Scheduled: 'blue', Draft: 'grey', Archived: 'grey' };
const TABS: readonly { label: string; status?: Status }[] = [{ label: 'All Announcements' }, { label: 'Published', status: 'Published' }, { label: 'Scheduled', status: 'Scheduled' }, { label: 'Drafts', status: 'Draft' }, { label: 'Archived', status: 'Archived' }];
/** When "Schedule" puts a draft out: the next Friday morning, 09:00 EAT. */
const NEXT_SLOT = '2026-10-30T06:00:00Z';
const NEXT_SLOT_LABEL = 'Oct 30, 2026\n09:00 AM';

const stamp = () => {
  const d = new Date();
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}\n${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
};
const oneLine = (s: string) => s.replace('\n', ', ');

function useAnnouncements(m: M, me: string) {
  const [list, setList] = useState<readonly AnnouncementRow[]>(m.announcements);
  const [tab, setTab] = useState(TABS[0].label);
  const [query, setQuery] = useState('');
  const [audience, setAudience, audiences] = useChoice(['All', 'Students', 'All Users', 'Parents', 'Teachers']);
  const [category, setCategory, categories] = useChoice(['All', ...Array.from(new Set(m.announcements.map((a) => a.category)))]);
  const [status, setStatus, statuses] = useChoice(['All', 'Published', 'Scheduled', 'Draft', 'Archived']);
  const [range, setRange, ranges] = useChoice(['All', 'Last 7 Days']);
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(m.announcements[0].id);
  const [ask, setAsk] = useState<ReasonAsk | null>(null);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const st = TABS.find((t) => t.label === tab)?.status;
    const q = query.trim().toLowerCase();
    const inRange = (a: AnnouncementRow) => range === 'All' || /Oct (19|2\d|3[01]),/.test(a.date) || a.date === '—';
    return list.filter(
      (a) =>
        (!st || a.status === st) &&
        (audience === 'All' || a.audience === audience) &&
        (category === 'All' || a.category === category) &&
        (status === 'All' || a.status === status) &&
        inRange(a) &&
        (!q || `${a.title} ${a.preview} ${a.category}`.toLowerCase().includes(q)),
    );
  }, [list, tab, query, audience, category, status, range]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const open = list.find((a) => a.id === openId) ?? null;
  const update = (a: AnnouncementRow) => setList((prev) => prev.map((x) => (x.id === a.id ? a : x)));

  const publishNow = (a: AnnouncementRow) => {
    const at = stamp();
    update({ ...publish(a, `${oneLine(at)} by ${me}`), date: at, reach: a.reach ?? 0, engagement: a.engagement ?? 0, clicks: a.clicks ?? 0 });
    toast(`"${a.title}" is live for ${a.audience}. In-app and push notifications are on their way.`);
  };
  const scheduleIt = (a: AnnouncementRow) => {
    const r = schedule(a, NEXT_SLOT, m.NOW);
    if (r.error) return toast(r.error);
    update({ ...r.announcement, date: NEXT_SLOT_LABEL });
    toast(`"${a.title}" scheduled for Oct 30, 2026 at 09:00 AM (EAT).`);
  };
  const archiveIt = (a: AnnouncementRow) => {
    update(archive(a));
    toast(`"${a.title}" archived. It no longer shows to ${a.audience}.`);
  };
  const copy = (a: AnnouncementRow) => {
    const id = `ann-copy-${Date.now()}`;
    setList((prev) => [{ ...duplicate(a, id), n: prev.length + 1, date: '—', reach: null, engagement: null, clicks: null }, ...prev]);
    setOpenId(id);
    toast(`Draft copy of "${a.title}" created.`);
  };
  const edit = (a: AnnouncementRow) =>
    setAsk({
      title: 'Edit title',
      body: `Current title: "${a.title}". Readers of a published announcement see that it was edited.`,
      confirm: 'Save',
      tone: 'blue',
      placeholder: a.title,
      onConfirm: (title) => {
        update({ ...a, title });
        toast('Announcement updated.');
      },
    });
  const create = () =>
    setAsk({
      title: 'New announcement',
      body: 'Give it a title. It is saved as a draft for All Users; set the audience, body and schedule before publishing.',
      confirm: 'Create Draft',
      tone: 'blue',
      placeholder: 'Term 3 exam timetable released',
      onConfirm: (title) => {
        const id = `ann-new-${Date.now()}`;
        const base = m.announcements[7];
        setList((prev) => [{ ...base, id, n: prev.length + 1, title, preview: 'Write the announcement...', body: '', status: 'Draft', date: '—', reach: null, engagement: null, clicks: null, audience: 'All Users', category: 'Platform', categoryIcon: 'screen', priority: 'Normal', attachment: undefined }, ...prev]);
        setTab(TABS[0].label);
        setOpenId(id);
        toast(`Draft "${title}" created.`);
      },
    });
  const counts = (label: string) => {
    const st = TABS.find((t) => t.label === label)?.status;
    const base = st ? m.announcementTotals[st] : m.announcementTotals.all;
    const live = (l: readonly AnnouncementRow[]) => (st ? l.filter((a) => a.status === st).length : l.length);
    return base + live(list) - live(m.announcements);
  };
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  const clear = () => {
    setAudience('All');
    setCategory('All');
    setStatus('All');
    setRange('All');
    setQuery('');
  };
  return { me, rows, shown, tab, setTab: pick, query, setQuery, audience, setAudience, audiences, category, setCategory, categories, status, setStatus, statuses, range, setRange, ranges, clear, page: p, pages, setPage, open, setOpenId, publishNow, scheduleIt, archiveIt, copy, edit, create, counts, ask, setAsk, selected, toggle };
}
type U = ReturnType<typeof useAnnouncements>;

export function AudiencePill({ a }: { a: Audience }) {
  return <Pill label={a} tone={AUDIENCE_TONE[a]} icon={AUDIENCE_ICON[a]} size={10.5} />;
}

const COLS: readonly Column<AnnouncementRow>[] = [
  {
    label: 'Title',
    flex: 2.3,
    render: (a) => (
      <View style={styles.inline}>
        <Image decorative source={a.thumb} style={styles.thumb} contentFit="cover" />
        <View style={styles.flex}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {a.title}
          </Text>
          <Text style={styles.tiny} numberOfLines={1}>
            {a.preview}
          </Text>
        </View>
      </View>
    ),
  },
  { label: 'Audience', width: 96, render: (a) => <AudiencePill a={a.audience} /> },
  {
    label: 'Category',
    width: 92,
    render: (a) => (
      <View style={styles.inline}>
        <Icon name={a.categoryIcon} size={14} color={BLUE} />
        <Cell small>{a.category}</Cell>
      </View>
    ),
  },
  { label: 'Status', width: 90, render: (a) => <Pill label={a.status} tone={STATUS_TONE[a.status]} size={10.5} /> },
  { label: 'Publish Date', width: 90, render: (a) => <Cell small>{a.date}</Cell> },
  { label: 'Reach', width: 62, render: (a) => <Cell small>{a.reach === null ? '—' : a.reach.toLocaleString('en-US')}</Cell> },
  { label: 'Engagement', width: 86, render: (a) => <Cell small>{a.engagement === null ? '—' : `${a.engagement}%`}</Cell> },
];

function Metric({ icon, tone, label, value }: { icon: IconName; tone: Tone; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: TONES[tone].soft }]}>
        <Icon name={icon} size={17} color={TONES[tone].solid} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.metricLabel} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

function Overview({ a }: { a: AnnouncementRow }) {
  return (
    <>
      <View style={styles.bodyBox}>
        <Text style={styles.body}>{a.body || 'No body yet. Use Edit to write it.'}</Text>
      </View>
      <View style={styles.facts}>
        <View style={styles.fact}>
          <Text style={styles.tiny}>Audience</Text>
          <Text style={styles.factValue}>{a.audience}</Text>
          <Text style={styles.tiny}>{a.reach === null ? 'Not sent yet' : `${a.reach.toLocaleString('en-US')} reached`}</Text>
        </View>
        <View style={styles.fact}>
          <Text style={styles.tiny}>Category</Text>
          <Text style={styles.factValue}>{a.category}</Text>
        </View>
        <View style={styles.fact}>
          <Text style={styles.tiny}>Priority</Text>
          <Pill label={a.priority} tone={a.priority === 'High' ? 'red' : 'grey'} size={11} />
        </View>
      </View>
      <View style={styles.facts}>
        <View style={styles.fact}>
          <Text style={styles.tiny}>Publish Date</Text>
          <Text style={styles.factValue}>{oneLine(a.date)}</Text>
        </View>
        <View style={styles.fact}>
          <Text style={styles.tiny}>Expiry Date</Text>
          <Text style={styles.factValue}>—</Text>
        </View>
      </View>
      {a.attachment ? (
        <>
          <Text style={styles.tiny}>Attachments (1)</Text>
          <Pressable style={styles.attach} onPress={() => toast(`Downloading ${a.attachment?.name}…`)} accessibilityRole="button" accessibilityLabel={`Download ${a.attachment.name}`}>
            <Icon name="doc" size={20} color={RED} />
            <View style={styles.flex}>
              <Text style={styles.rowTitle}>{a.attachment.name}</Text>
              <Text style={styles.tiny}>{a.attachment.size}</Text>
            </View>
            <Icon name="download" size={18} color={BLUE} />
          </Pressable>
        </>
      ) : null}
    </>
  );
}

function DetailsPanel({ u, m, onClose }: { u: U; m: M; onClose?: () => void }) {
  const a = u.open;
  const [tab, setTab] = useState('Overview');
  const [more, setMore] = useState(false);
  if (!a)
    return (
      <Card style={styles.panel}>
        <Text style={styles.small}>Pick an announcement to see it.</Text>
      </Card>
    );
  const sizes = m.audienceSizes;
  const audienceSize = a.audience === 'All Users' ? Object.values(sizes).reduce((s, n) => s + n, 0) : sizes[a.audience];
  const n = (v: number | null) => (v === null ? '—' : v.toLocaleString('en-US'));
  const history = a.status === 'Published' ? `Published ${a.publishedAt ?? oneLine(a.date)}` : a.status === 'Scheduled' ? `Scheduled for ${oneLine(a.date)}` : a.status;
  return (
    <Card style={styles.panel}>
      <View style={styles.inline}>
        <Text style={[styles.panelTitle, styles.flex]}>Announcement Details</Text>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close details" hitSlop={8}>
            <Icon name="close" size={18} color={BODY} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.inline}>
        <Image decorative source={a.thumb} style={styles.hero} contentFit="cover" />
        <View style={styles.flex}>
          <Text style={styles.detailTitle}>{a.title}</Text>
          <Text style={styles.tiny}>{a.publishedAt ?? oneLine(a.date)}</Text>
        </View>
        <Pill label={a.status} tone={STATUS_TONE[a.status]} size={11} />
      </View>
      <CountTabs tabs={['Overview', 'Audience', 'Engagement', 'History'].map((label) => ({ label }))} active={tab} onChange={setTab} size={12.5} dense style={styles.noWrap} />
      {tab === 'Overview' ? <Overview a={a} /> : null}
      {tab === 'Audience' ? <Text style={styles.small}>{`${a.audience}: ${audienceSize.toLocaleString('en-US')} people across 158 institutions and independent learners. Guardians of learners under 18 get a copy.`}</Text> : null}
      {tab === 'Engagement' ? <Text style={styles.small}>{a.reach === null ? 'Engagement shows once it is published.' : `${n(a.reach)} reached • ${a.engagement}% engaged • ${n(a.clicks)} link clicks.`}</Text> : null}
      {tab === 'History' ? <Text style={styles.small}>{`Created by ${u.me}\n${history}`}</Text> : null}
      <View style={styles.metrics}>
        <Metric icon="chart" tone="green" label="Reach" value={n(a.reach)} />
        <Metric icon="poll" tone="purple" label="Engagement" value={a.engagement === null ? '—' : `${a.engagement}%`} />
        <Metric icon="link" tone="blue" label="Clicks" value={n(a.clicks)} />
      </View>
      <View style={styles.inline}>
        <OutlineBtn label="Edit" icon="edit" onPress={() => u.edit(a)} style={styles.flex} />
        <OutlineBtn label="Duplicate" icon="layers" onPress={() => u.copy(a)} style={styles.flex} />
        <OutlineBtn label="More" chevron onPress={() => setMore((x) => !x)} style={styles.flex} />
      </View>
      {more ? (
        <View style={styles.inline}>
          {a.status !== 'Published' && a.status !== 'Archived' ? <PrimaryBtn label="Publish Now" icon="send" onPress={() => u.publishNow(a)} style={styles.flex} /> : null}
          {a.status === 'Draft' ? <OutlineBtn label="Schedule" icon="clock" onPress={() => u.scheduleIt(a)} style={styles.flex} /> : null}
          {a.status !== 'Archived' ? <OutlineBtn label="Archive" icon="folder" onPress={() => u.archiveIt(a)} style={styles.flex} /> : null}
        </View>
      ) : null}
    </Card>
  );
}

function Filters({ u }: { u: U }) {
  return (
    <View style={styles.filters}>
      <SelectBox label="Audience" value={u.audience} options={u.audiences} onChange={u.setAudience} width={160} />
      <SelectBox label="Category" value={u.category} options={u.categories} onChange={u.setCategory} width={160} />
      <SelectBox label="Status" value={u.status} options={u.statuses} onChange={u.setStatus} width={160} />
      <SelectBox label="Date Range" value={u.range} options={u.ranges} onChange={u.setRange} width={160} />
      <Pressable style={styles.clear} onPress={u.clear} accessibilityRole="button" accessibilityLabel="Clear filters">
        <Text style={styles.link}>Clear Filters</Text>
      </Pressable>
    </View>
  );
}

/** Maple Command › Communications › Announcements on the desktop reference. */
export function AnnouncementsDesk({ c }: { c: CommandData }) {
  const m = c.comms;
  const u = useAnnouncements(m, c.me.name);
  const [range, setRange] = useState(c.ranges[0]);
  return (
    <CommandDesk me={c.me} search="Search users, schools, classes, messages, or reference IDs..." active="Communications" sub="Announcements">
      <CmdHead
        icon="megaphone"
        section="Communications"
        title="Announcements"
        subtitle="Create and manage important announcements for teachers, students, parents, and schools."
        right={
          <>
            <RangeBox value={range} options={c.ranges} onChange={setRange} width={250} />
            <PrimaryBtn label="New Announcement" onPress={u.create} />
            <OutlineBtn icon="chevronDown" onPress={() => toast('New from a template, or import announcements from CSV.')} />
          </>
        }
      />
      <View style={styles.kpis}>
        {m.announcementStats.map((k) => (
          <CmdStat key={k.label} k={k} style={styles.flex} />
        ))}
      </View>
      <View style={styles.row}>
        <Card style={[styles.tableCard, styles.flex]}>
          <View style={styles.inline}>
            <View style={styles.flex}>
              <CountTabs tabs={TABS.map((t) => ({ label: t.label, count: u.counts(t.label), tone: t.status === 'Published' ? ('green' as const) : ('blue' as const) }))} active={u.tab} onChange={u.setTab} size={13} dense style={styles.noWrap} />
            </View>
            <Search placeholder="Search announcements..." value={u.query} onChange={u.setQuery} style={styles.searchBox} />
          </View>
          <Filters u={u} />
          <DataTable columns={COLS} rows={u.rows} rowKey={(a) => a.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={(a) => u.setOpenId(a.id)} onRowPress={(a) => u.setOpenId(a.id)} activeKey={u.open?.id} />
          <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} announcements`} page={u.page} pages={u.pages} onPage={u.setPage} />
        </Card>
        <View style={styles.side}>
          <DetailsPanel u={u} m={m} onClose={() => u.setOpenId(null)} />
        </View>
      </View>
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandDesk>
  );
}

/** The phone version: counts, tabs and announcement cards; tapping one opens its details. */
export function AnnouncementsPhone({ c }: { c: CommandData }) {
  const m = c.comms;
  const u = useAnnouncements(m, c.me.name);
  const [view, setView] = useState<'list' | 'detail'>('list');
  if (view === 'detail') {
    return (
      <CommandPhone key="detail" me={c.me}>
        <PageHead title="Announcement" subtitle="Details, reach and actions." phone onBack={() => setView('list')} />
        <DetailsPanel u={u} m={m} />
        <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Announcements" subtitle="Important news for teachers, students, parents and schools." phone />
      <KpiGrid items={m.announcementStats} />
      <PrimaryBtn label="New Announcement" icon="plus" onPress={u.create} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={TABS.map((t) => ({ label: t.label, count: u.counts(t.label) }))} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      <Search placeholder="Search announcements..." value={u.query} onChange={u.setQuery} />
      {u.rows.map((a) => (
        <Pressable
          key={a.id}
          style={styles.card}
          onPress={() => {
            u.setOpenId(a.id);
            setView('detail');
          }}
          accessibilityRole="button"
          accessibilityLabel={`${a.title}, ${a.status}, ${a.audience}`}>
          <Image decorative source={a.thumb} style={styles.cardThumb} contentFit="cover" />
          <View style={[styles.flex, styles.cardBody]}>
            <Text style={styles.rowTitle}>{a.title}</Text>
            <Text style={styles.tiny} numberOfLines={2}>
              {a.preview}
            </Text>
            <View style={styles.wrap}>
              <AudiencePill a={a.audience} />
              <Pill label={a.status} tone={STATUS_TONE[a.status]} size={10.5} />
            </View>
            <Text style={styles.tiny}>{`${oneLine(a.date)}${a.reach === null ? '' : ` • ${a.reach.toLocaleString('en-US')} reached • ${a.engagement}%`}`}</Text>
          </View>
        </Pressable>
      ))}
      {!u.rows.length ? <Text style={styles.small}>No announcements match.</Text> : null}
      <PageStrip label={`${u.shown.length} announcements`} page={u.page} pages={u.pages} onPage={u.setPage} />
      <ReasonModal ask={u.ask} onClose={() => u.setAsk(null)} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  noWrap: { flexWrap: 'nowrap' },
  small: { fontSize: 12.5, lineHeight: 19, color: BODY },
  tiny: { fontSize: 11.5, color: BODY },
  link: { fontSize: 13, fontWeight: '600', color: BLUE },
  tableCard: { gap: 10, padding: 12 },
  searchBox: { width: 250 },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clear: { marginLeft: 'auto', paddingHorizontal: 6 },
  thumb: { width: 40, height: 40, borderRadius: 6 },
  rowTitle: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  side: { width: 360 },
  panel: { gap: 10, padding: 14 },
  panelTitle: { fontSize: 15.5, fontWeight: '800', color: NAVY },
  hero: { width: 72, height: 58, borderRadius: 8 },
  detailTitle: { fontSize: 14.5, fontWeight: '800', color: NAVY },
  bodyBox: { padding: 12, borderRadius: 10, backgroundColor: Maple.blueSoft },
  body: { fontSize: 12.5, lineHeight: 20, color: NAVY },
  facts: { flexDirection: 'row', gap: 10 },
  fact: { flex: 1, minWidth: 0, gap: 3 },
  factValue: { fontSize: 12.5, fontWeight: '600', color: NAVY },
  attach: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  metrics: { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1, borderColor: LINE },
  metric: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 5 },
  metricIcon: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { fontSize: 11, color: BODY },
  metricValue: { fontSize: 15, fontWeight: '800', color: NAVY },
  card: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cardThumb: { width: 64, height: 64, borderRadius: 10 },
  cardBody: { gap: 5 },
});
