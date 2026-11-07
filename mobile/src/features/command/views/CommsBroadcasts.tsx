import { Image } from '@/components/picture';
import { type ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { CmdStat, CountTabs, KpiGrid, OutlineBtn, PageStrip, PrimaryBtn } from '@/features/command/kit/CmdParts';
import { CmdHead, CommandDesk, CommandPhone } from '@/features/command/kit/CommandFrame';
import type { CommandData } from '@/features/command/kit/CommandRoute';
import { type BroadcastForm, type Group, reachEstimate, smsSegments, validateBroadcast } from '@/features/command/logic/comms';
import { Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, MUTED, NAVY, RED, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { Cell, type Column, DataTable, PageHead, Search, SelectBox, useChoice, useSelection } from '@/features/school/kit/AdminKit';
import type { IconName } from '@/lib/icons';
import { toast } from '@/lib/toast';
import type { BroadcastRow, BroadcastStatus, Channel } from '@/mock/command-center/comms';

import { AudiencePill } from './CommsAnnouncements';
import { Maple } from '@/constants/maple';

type M = CommandData['comms'];
type TabKey = 'all' | 'Scheduled' | 'Sending' | 'Completed' | 'Failed';
const PER_PAGE = 10;
const STATUS_TONE: Readonly<Record<BroadcastStatus, Tone>> = { Sent: 'green', Completed: 'green', Scheduled: 'blue', Sending: 'orange', Draft: 'grey', Failed: 'red' };
const CHANNEL_ICON: Readonly<Record<Channel, [IconName, string]>> = { Email: ['mail', BLUE], 'In-App Notification': ['bell', RED], SMS: ['chat', BLUE], WhatsApp: ['phone', GREEN] };
const TABS: readonly { label: string; match?: readonly BroadcastStatus[]; key: TabKey }[] = [
  { label: 'All Broadcasts', key: 'all' },
  { label: 'Scheduled', match: ['Scheduled'], key: 'Scheduled' },
  { label: 'Sending', match: ['Sending'], key: 'Sending' },
  { label: 'Completed', match: ['Sent', 'Completed'], key: 'Completed' },
  { label: 'Failed', match: ['Failed'], key: 'Failed' },
];
const GROUPS: readonly Group[] = ['Students', 'Parents', 'Teachers', 'School Administrators'];
/** Delivery dates on offer; times are East Africa Time (UTC+3). */
const DAYS: readonly (readonly [string, string])[] = [
  ['Oct 26, 2026', '2026-10-26'],
  ['Oct 27, 2026', '2026-10-27'],
  ['Oct 28, 2026', '2026-10-28'],
  ['Oct 30, 2026', '2026-10-30'],
  ['Nov 2, 2026', '2026-11-02'],
];
const TIMES: readonly (readonly [string, string])[] = [
  ['07:00 AM', '07:00'],
  ['10:00 AM', '10:00'],
  ['02:00 PM', '14:00'],
  ['06:00 PM', '18:00'],
];
const EMPTY: BroadcastForm = { audience: 'All Users', groups: [], schools: [], title: '', content: '', channels: ['In-App Notification'], when: 'now' };
/** The table draws these four channels; push and banners show as in-app. */
const TABLE_CHANNELS: readonly Channel[] = ['Email', 'In-App Notification', 'SMS', 'WhatsApp'];

const toggleIn = <T,>(list: readonly T[], x: T): readonly T[] => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
const people = (n: number) => `${n.toLocaleString('en-US')} ${n === 1 ? 'person' : 'people'}`;

function tableChannels(chosen: readonly string[]): readonly Channel[] {
  return TABLE_CHANNELS.filter((c) => chosen.includes(c) || (c === 'In-App Notification' && chosen.some((x) => x.startsWith('Push') || x === 'App Banner')));
}

function useBroadcasts(m: M) {
  const [list, setList] = useState<readonly BroadcastRow[]>(m.broadcasts);
  const [tab, setTab] = useState(TABS[0].label);
  const [query, setQuery] = useState('');
  const [audience, setAudience, audiences] = useChoice(['All', 'Students', 'All Users', 'Parents', 'Teachers']);
  const [channel, setChannel, channels] = useChoice(['All', ...TABLE_CHANNELS]);
  const [status, setStatus, statuses] = useChoice(['All', 'Sent', 'Completed', 'Scheduled', 'Sending', 'Draft']);
  const [range, setRange, ranges] = useChoice(['All', 'Last 7 Days']);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<BroadcastForm>(EMPTY);
  const [day, setDay] = useState(DAYS[2]);
  const [time, setTime] = useState(TIMES[1]);
  const [schoolQuery, setSchoolQuery] = useState('');
  const [errors, setErrors] = useState<readonly string[]>([]);
  const [template, setTemplate] = useState(0);
  const [selected, toggle] = useSelection();
  const shown = useMemo(() => {
    const match = TABS.find((t) => t.label === tab)?.match;
    const q = query.trim().toLowerCase();
    return list.filter(
      (b) =>
        (!match || match.includes(b.status)) &&
        (audience === 'All' || b.audience === audience) &&
        (channel === 'All' || b.channels.includes(channel as Channel)) &&
        (status === 'All' || b.status === status) &&
        (range === 'All' || !/Oct ([1-9]|1[0-8]),/.test(b.when)) &&
        (!q || `${b.title} ${b.preview}`.toLowerCase().includes(q)),
    );
  }, [list, tab, query, audience, channel, status, range]);
  const pages = Math.max(1, Math.ceil(shown.length / PER_PAGE));
  const p = Math.min(page, pages);
  const rows = shown.slice((p - 1) * PER_PAGE, p * PER_PAGE);
  const full: BroadcastForm = { ...form, at: form.when === 'later' ? `${day[1]}T${time[1]}:00+03:00` : undefined };
  const reach = reachEstimate(full, m.audienceSizes);

  const set = (patch: Partial<BroadcastForm>) => {
    setForm((f) => ({ ...f, ...patch }));
    setErrors([]);
  };
  const applyTemplate = () => {
    const t = m.templates[template % m.templates.length];
    setTemplate((n) => n + 1);
    set({ title: t.title, content: t.content });
    toast(`Template "${t.title}" loaded.`);
  };
  const reset = () => {
    setForm(EMPTY);
    setErrors([]);
    setSchoolQuery('');
  };
  /** Sends or schedules the form; returns whether it went. */
  const send = (): boolean => {
    const errs = validateBroadcast(full, m.NOW);
    setErrors(errs);
    if (errs.length) {
      toast(errs[0]);
      return false;
    }
    const later = form.when === 'later';
    const single = form.audience === 'Specific Groups' && form.groups.length === 1 && form.groups[0] !== 'School Administrators' ? form.groups[0] : null;
    const row: BroadcastRow = {
      n: list.length + 1,
      id: `bc-new-${Date.now()}`,
      title: form.title.trim(),
      preview: `${form.content.trim().slice(0, 44)}...`,
      audience: single ?? 'All Users',
      channels: tableChannels(form.channels),
      status: later ? 'Scheduled' : 'Sending',
      when: later ? `${day[0]}\n${time[0]}` : 'Sending now',
      reach: later ? null : reach,
      open: null,
      click: null,
      thumb: m.broadcasts[(list.length + 3) % m.broadcasts.length].thumb,
    };
    setList((prev) => [row, ...prev]);
    setTab(TABS[0].label);
    setPage(1);
    const segments = smsSegments(form.content);
    const sms = form.channels.includes('SMS') ? ` SMS uses ${segments} message${segments > 1 ? 's' : ''} per person.` : '';
    toast(later ? `Scheduled for ${day[0]} at ${time[0]} (EAT) to about ${people(reach)}.${sms}` : `Sending to about ${people(reach)} on ${form.channels.length} channel${form.channels.length > 1 ? 's' : ''}.${sms}`);
    reset();
    return true;
  };
  const loadRow = (b: BroadcastRow) => {
    set({ title: b.title, content: b.preview.replace('...', '.'), channels: [...b.channels] });
    toast(`"${b.title}" loaded into Create Broadcast to edit or resend.`);
  };
  const counts = (key: TabKey) => {
    const match = TABS.find((t) => t.key === key)?.match;
    const live = (l: readonly BroadcastRow[]) => (match ? l.filter((b) => match.includes(b.status)).length : l.length);
    return m.broadcastTotals[key] + live(list) - live(m.broadcasts);
  };
  const pick = (x: string) => {
    setTab(x);
    setPage(1);
  };
  return { rows, shown, tab, setTab: pick, query, setQuery, audience, setAudience, audiences, channel, setChannel, channels, status, setStatus, statuses, range, setRange, ranges, page: p, pages, setPage, form, set, day, setDay, time, setTime, schoolQuery, setSchoolQuery, errors, reach, applyTemplate, reset, send, loadRow, counts, selected, toggle };
}
type U = ReturnType<typeof useBroadcasts>;

function ChannelIcons({ list }: { list: readonly Channel[] }) {
  return (
    <View style={styles.inline} accessible accessibilityLabel={list.join(', ')}>
      {list.map((c) => (
        <Icon key={c} name={CHANNEL_ICON[c][0]} size={15} color={CHANNEL_ICON[c][1]} />
      ))}
    </View>
  );
}

const pct = (n: number | null) => (n === null ? '—' : `${n}%`);

const COLS: readonly Column<BroadcastRow>[] = [
  {
    label: 'Title',
    flex: 2.2,
    render: (b) => (
      <View style={styles.inline}>
        <Image decorative source={b.thumb} style={styles.thumb} contentFit="cover" />
        <View style={styles.flex}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {b.title}
          </Text>
          <Text style={styles.tiny} numberOfLines={1}>
            {b.preview}
          </Text>
        </View>
      </View>
    ),
  },
  { label: 'Audience', width: 88, render: (b) => <AudiencePill a={b.audience} /> },
  { label: 'Channels', width: 78, render: (b) => <ChannelIcons list={b.channels} /> },
  { label: 'Status', width: 86, render: (b) => <Pill label={b.status} tone={STATUS_TONE[b.status]} size={10.5} /> },
  { label: 'Scheduled / Sent', width: 90, render: (b) => <Cell small>{b.when}</Cell> },
  { label: 'Reach', width: 56, render: (b) => <Cell small>{b.reach === null ? '—' : b.reach.toLocaleString('en-US')}</Cell> },
  { label: 'Open Rate', width: 58, render: (b) => <Cell small>{pct(b.open)}</Cell> },
  { label: 'Click Rate', width: 58, render: (b) => <Cell small>{pct(b.click)}</Cell> },
];

function Radio({ on, label, onPress }: { on: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.choice} onPress={onPress} accessibilityRole="radio" accessibilityState={{ checked: on }} accessibilityLabel={label}>
      <View style={[styles.radio, on && styles.radioOn]}>{on ? <View style={styles.radioDot} /> : null}</View>
      <Text style={styles.choiceText}>{label}</Text>
    </Pressable>
  );
}

function Check({ on, label, onPress, icon }: { on: boolean; label: string; onPress: () => void; icon?: readonly [IconName, string] }) {
  return (
    <Pressable style={[styles.choice, icon && styles.half]} onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label}>
      <View style={[styles.box, on && styles.boxOn]}>{on ? <Icon name="check" size={11} color={WHITE} /> : null}</View>
      {icon ? <Icon name={icon[0]} size={15} color={icon[1]} /> : null}
      <Text style={[styles.choiceText, icon && styles.choiceSmall, styles.flex]}>{label}</Text>
    </Pressable>
  );
}

function Step({ n, title, sub, right }: { n: number; title: string; sub?: string; right?: ReactNode }) {
  return (
    <View style={styles.step}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.stepTitle}>{title}</Text>
        {sub ? <Text style={styles.tiny}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const CHANNEL_CHOICES: readonly (readonly [string, IconName, string])[] = [
  ['In-App Notification', 'bell', RED],
  ['Push Notification (Mobile App)', 'phone', NAVY],
  ['Email', 'mail', BLUE],
  ['WhatsApp', 'phone', GREEN],
  ['SMS', 'chat', BLUE],
  ['App Banner', 'screen', BLUE],
];
const TOOLBAR: readonly (readonly [IconName, string, string])[] = [
  ['bold', 'Bold', '**bold**'],
  ['italic', 'Italic', '_italic_'],
  ['underline', 'Underline', '__underlined__'],
  ['listBullet', 'Bulleted list', '\n• '],
  ['listNumber', 'Numbered list', '\n1. '],
  ['link', 'Link', ' https://maple.school/'],
  ['smile', 'Emoji', ' 🙂'],
];

function AudienceStep({ u, m }: { u: U; m: M }) {
  const f = u.form;
  const q = u.schoolQuery.trim().toLowerCase();
  const schools = m.schools.filter((s) => !q || s.toLowerCase().includes(q));
  return (
    <View style={styles.indent}>
      <Radio on={f.audience === 'All Users'} label="All Users" onPress={() => u.set({ audience: 'All Users' })} />
      <Radio on={f.audience === 'Specific Groups'} label="Specific Groups" onPress={() => u.set({ audience: 'Specific Groups' })} />
      {f.audience === 'Specific Groups' ? (
        <View style={styles.indent}>
          {GROUPS.map((g) => (
            <Check key={g} on={f.groups.includes(g)} label={g} onPress={() => u.set({ groups: toggleIn(f.groups, g) })} />
          ))}
        </View>
      ) : null}
      <Radio on={f.audience === 'Specific Schools'} label="Specific Schools" onPress={() => u.set({ audience: 'Specific Schools' })} />
      {f.audience === 'Specific Schools' ? (
        <View style={styles.indent}>
          <Search placeholder="Search and select schools..." value={u.schoolQuery} onChange={u.setSchoolQuery} />
          {schools.map((s) => (
            <Check key={s} on={f.schools.includes(s)} label={s} onPress={() => u.set({ schools: toggleIn(f.schools, s) })} />
          ))}
        </View>
      ) : null}
      <Text style={styles.reach}>{`About ${people(u.reach)}`}</Text>
    </View>
  );
}

function ContentStep({ u }: { u: U }) {
  const f = u.form;
  return (
    <View style={styles.indent}>
      <Text style={styles.label}>Message Title *</Text>
      <TextInput value={f.title} onChangeText={(title) => u.set({ title })} placeholder="Enter a clear and concise title..." placeholderTextColor={MUTED} style={styles.input} accessibilityLabel="Message title" />
      <Text style={styles.label}>Message Content *</Text>
      <View style={styles.editor}>
        <TextInput value={f.content} onChangeText={(content) => u.set({ content })} placeholder="Type your message here..." placeholderTextColor={MUTED} style={styles.textarea} multiline accessibilityLabel="Message content" />
        <View style={styles.toolbar}>
          {TOOLBAR.map(([icon, label, insert]) => (
            <Pressable key={label} onPress={() => u.set({ content: `${f.content}${insert}` })} accessibilityRole="button" accessibilityLabel={label} hitSlop={4}>
              <Icon name={icon} size={16} color={NAVY} />
            </Pressable>
          ))}
          <Text style={[styles.tiny, styles.pushRight]}>{`${f.content.length} chars${f.channels.includes('SMS') ? ` • ${smsSegments(f.content)} SMS` : ''}`}</Text>
        </View>
      </View>
    </View>
  );
}

function Composer({ u, m }: { u: U; m: M }) {
  const f = u.form;
  return (
    <View style={styles.form}>
      <Step n={1} title="Audience" sub="Select who will receive this broadcast." />
      <AudienceStep u={u} m={m} />
      <Step
        n={2}
        title="Content"
        right={
          <Pressable style={styles.tplBtn} onPress={u.applyTemplate} accessibilityRole="button" accessibilityLabel="Use template">
            <Icon name="doc" size={14} color={BLUE} />
            <Text style={styles.tplText}>Use Template</Text>
          </Pressable>
        }
      />
      <ContentStep u={u} />
      <Step n={3} title="Channels" sub="Select delivery channels." />
      <View style={[styles.indent, styles.wrap]}>
        {CHANNEL_CHOICES.map(([c, icon, color]) => (
          <Check key={c} on={f.channels.includes(c)} label={c} icon={[icon, color]} onPress={() => u.set({ channels: toggleIn(f.channels, c) })} />
        ))}
      </View>
      <Step n={4} title="Schedule" />
      <View style={styles.indent}>
        <View style={styles.inline}>
          <Radio on={f.when === 'now'} label="Send Now" onPress={() => u.set({ when: 'now' })} />
          <Radio on={f.when === 'later'} label="Schedule for Later" onPress={() => u.set({ when: 'later' })} />
        </View>
        {f.when === 'later' ? (
          <View style={styles.inline}>
            <SelectBox value={u.day[0]} options={DAYS.map((d) => d[0])} onChange={(v) => u.setDay(DAYS.find((d) => d[0] === v) ?? DAYS[0])} style={styles.flex} />
            <SelectBox value={u.time[0]} options={TIMES.map((t) => t[0])} onChange={(v) => u.setTime(TIMES.find((t) => t[0] === v) ?? TIMES[0])} style={styles.flex} />
          </View>
        ) : null}
      </View>
      {u.errors.length ? (
        <View style={styles.errors} accessibilityLiveRegion="polite">
          {u.errors.map((e) => (
            <Text key={e} style={styles.error}>{`• ${e}`}</Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Preview({ u }: { u: U }) {
  const f = u.form;
  const segments = smsSegments(f.content);
  return (
    <View style={styles.form}>
      <Text style={styles.label}>In-app notification</Text>
      <View style={styles.preview}>
        <View style={[styles.previewIcon, { backgroundColor: TONES.blue.soft }]}>
          <Icon name="megaphone" size={18} color={BLUE} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.rowTitle}>{f.title || 'Your title'}</Text>
          <Text style={styles.small}>{f.content || 'Your message shows here.'}</Text>
          <Text style={styles.tiny}>Maple Online School • now</Text>
        </View>
      </View>
      {f.channels.includes('SMS') ? (
        <>
          <Text style={styles.label}>{`SMS (${segments} message${segments > 1 ? 's' : ''})`}</Text>
          <View style={[styles.preview, styles.sms]}>
            <Text style={styles.small}>{`MAPLE: ${f.title ? `${f.title}. ` : ''}${f.content || '…'}`}</Text>
          </View>
        </>
      ) : null}
      <Text style={styles.small}>{`Goes to about ${people(u.reach)} on ${f.channels.length ? f.channels.join(', ') : 'no channels yet'}.`}</Text>
    </View>
  );
}

function CreatePanel({ u, m, onDone }: { u: U; m: M; onDone?: () => void }) {
  const [tab, setTab] = useState('Create Broadcast');
  const cancel = () => {
    u.reset();
    onDone?.();
  };
  const go = () => {
    if (u.send()) onDone?.();
  };
  return (
    <Card style={styles.panel}>
      <CountTabs tabs={[{ label: 'Create Broadcast' }, { label: 'Preview' }]} active={tab} onChange={setTab} size={13.5} style={styles.noWrap} />
      {tab === 'Preview' ? <Preview u={u} /> : <Composer u={u} m={m} />}
      <View style={styles.inline}>
        <OutlineBtn label="Cancel" onPress={cancel} style={styles.flex} />
        <PrimaryBtn label={u.form.when === 'later' ? 'Schedule Broadcast' : 'Send Broadcast'} icon="send" onPress={go} style={styles.flex} />
      </View>
    </Card>
  );
}

function Filters({ u }: { u: U }) {
  return (
    <View style={styles.inline}>
      <SelectBox label="Audience" value={u.audience} options={u.audiences} onChange={u.setAudience} width={140} />
      <SelectBox label="Channel" value={u.channel} options={u.channels} onChange={u.setChannel} width={150} />
      <SelectBox label="Status" value={u.status} options={u.statuses} onChange={u.setStatus} width={128} />
      <SelectBox label="Date Range" value={u.range} options={u.ranges} onChange={u.setRange} width={140} />
      <Search placeholder="Search broadcasts..." value={u.query} onChange={u.setQuery} style={styles.flex} />
    </View>
  );
}

/** Maple Command › Communications › Broadcasts on the desktop reference. */
export function BroadcastsDesk({ c }: { c: CommandData }) {
  const m = c.comms;
  const u = useBroadcasts(m);
  const fresh = () => {
    u.reset();
    toast('Fill in Create Broadcast on the right.');
  };
  return (
    <CommandDesk me={c.me} search="Search users, schools, classes, messages, or reference IDs..." active="Communications" sub="Broadcasts">
      <CmdHead icon="send" section="Communications" title="Broadcasts" subtitle="Send targeted messages to teachers, students, parents, and schools across multiple channels." right={<PrimaryBtn label="New Broadcast" icon="plus" onPress={fresh} />} />
      <View style={styles.row}>
        <View style={[styles.flex, styles.stack]}>
          <View style={styles.kpis}>
            {m.broadcastStats.map((k) => (
              <CmdStat key={k.label} k={k} style={styles.flex} />
            ))}
          </View>
          <Card style={styles.tableCard}>
            <CountTabs tabs={TABS.map((t) => ({ label: t.label, count: u.counts(t.key), tone: t.key === 'Failed' ? ('red' as const) : t.key === 'Completed' ? ('green' as const) : ('blue' as const) }))} active={u.tab} onChange={u.setTab} size={13} dense style={styles.noWrap} />
            <Filters u={u} />
            <DataTable columns={COLS} rows={u.rows} rowKey={(b) => b.id} check selected={u.selected} onToggle={u.toggle} compact menu onMenu={u.loadRow} />
            <PageStrip label={`Showing ${u.shown.length ? (u.page - 1) * PER_PAGE + 1 : 0}–${Math.min(u.page * PER_PAGE, u.shown.length)} of ${u.shown.length} broadcasts`} page={u.page} pages={u.pages} onPage={u.setPage} />
          </Card>
        </View>
        <View style={styles.side}>
          <CreatePanel u={u} m={m} />
        </View>
      </View>
    </CommandDesk>
  );
}

/** The phone version: counts and the sent list; New Broadcast opens the four-step form. */
export function BroadcastsPhone({ c }: { c: CommandData }) {
  const m = c.comms;
  const u = useBroadcasts(m);
  const [view, setView] = useState<'list' | 'create'>('list');
  if (view === 'create') {
    return (
      <CommandPhone key="create" me={c.me}>
        <PageHead title="New Broadcast" subtitle="Audience, content, channels and schedule." phone onBack={() => setView('list')} />
        <CreatePanel u={u} m={m} onDone={() => setView('list')} />
      </CommandPhone>
    );
  }
  return (
    <CommandPhone key="list" me={c.me}>
      <PageHead title="Broadcasts" subtitle="Targeted messages across in-app, push, email, SMS and WhatsApp." phone />
      <KpiGrid items={m.broadcastStats} />
      <PrimaryBtn label="New Broadcast" icon="plus" onPress={() => setView('create')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CountTabs tabs={TABS.map((t) => ({ label: t.label, count: u.counts(t.key) }))} active={u.tab} onChange={u.setTab} size={13} style={styles.noWrap} />
      </ScrollView>
      <Search placeholder="Search broadcasts..." value={u.query} onChange={u.setQuery} />
      {u.rows.map((b) => (
        <View key={b.id} style={styles.card} accessible accessibilityLabel={`${b.title}, ${b.status}, ${b.audience}`}>
          <Image decorative source={b.thumb} style={styles.cardThumb} contentFit="cover" />
          <View style={[styles.flex, styles.cardBody]}>
            <Text style={styles.rowTitle}>{b.title}</Text>
            <View style={styles.wrap}>
              <AudiencePill a={b.audience} />
              <Pill label={b.status} tone={STATUS_TONE[b.status]} size={10.5} />
              <ChannelIcons list={b.channels} />
            </View>
            <Text style={styles.tiny}>{`${b.when.replace('\n', ', ')}${b.reach === null ? '' : ` • ${b.reach.toLocaleString('en-US')} reached • ${pct(b.open)} opened`}`}</Text>
          </View>
        </View>
      ))}
      {!u.rows.length ? <Text style={styles.small}>No broadcasts match.</Text> : null}
      <PageStrip label={`${u.shown.length} broadcasts`} page={u.page} pages={u.pages} onPage={u.setPage} />
    </CommandPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stack: { gap: 14 },
  kpis: { flexDirection: 'row', gap: 12 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  noWrap: { flexWrap: 'nowrap' },
  pushRight: { marginLeft: 'auto' },
  small: { fontSize: 12.5, lineHeight: 19, color: BODY },
  tiny: { fontSize: 11.5, color: BODY },
  tableCard: { gap: 10, padding: 12 },
  thumb: { width: 40, height: 40, borderRadius: 6 },
  rowTitle: { fontSize: 12.5, fontWeight: '700', color: NAVY },
  side: { width: 364 },
  panel: { gap: 12, padding: 14 },
  form: { gap: 10 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  stepNumText: { fontSize: 12.5, fontWeight: '800', color: WHITE },
  stepTitle: { fontSize: 14, fontWeight: '800', color: NAVY },
  indent: { gap: 6, paddingLeft: 30 },
  choice: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 26 },
  half: { width: '48%' },
  choiceText: { fontSize: 12.5, color: NAVY },
  choiceSmall: { fontSize: 11.5 },
  radio: { width: 17, height: 17, borderRadius: 9, borderWidth: 1.5, borderColor: Maple.blueLine, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: BLUE },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: BLUE },
  box: { width: 16, height: 16, borderRadius: 4, borderWidth: 1.5, borderColor: Maple.blueLine, alignItems: 'center', justifyContent: 'center' },
  boxOn: { borderColor: BLUE, backgroundColor: BLUE },
  reach: { fontSize: 12, fontWeight: '600', color: BLUE },
  tplBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7, backgroundColor: Maple.blueSoft },
  tplText: { fontSize: 12, fontWeight: '600', color: BLUE },
  label: { fontSize: 12, fontWeight: '600', color: NAVY },
  input: { height: 38, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: LINE, fontSize: 13, color: NAVY, backgroundColor: WHITE },
  editor: { borderRadius: 8, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  textarea: { minHeight: 80, padding: 10, fontSize: 13, lineHeight: 19, color: NAVY, textAlignVertical: 'top' },
  toolbar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderColor: LINE },
  errors: { gap: 3, padding: 10, borderRadius: 8, backgroundColor: Maple.errorSoft },
  error: { fontSize: 12, color: RED },
  preview: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  previewIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sms: { backgroundColor: Maple.blueSoft },
  card: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cardThumb: { width: 56, height: 56, borderRadius: 10 },
  cardBody: { gap: 5 },
});
