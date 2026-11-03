import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Bar, Btn, Card, CardHead, IconTile, Pill, UnderTabs } from '@/features/portal/PortalParts';
import { BLUE, BODY, LINE, MUTED, NAVY, SELECT, SOFT, TONES, type Tone, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { LibraryRequest, Resource, ResourceKind } from '@/mock/school-admin';

import { AdminDesk, AdminPhone, ListCard, ListRow, MenuRow, PageHead, Search, SelectBox, Segments, useChoice } from '../kit/AdminKit';

type Admin = MockData['schoolAdmin'];
type Lib = Admin['library'];

const KIND_TONE: Readonly<Record<ResourceKind, Tone>> = {
  Textbook: 'green',
  'Past Paper': 'orange',
  'Lesson Plan': 'orange',
  'Scheme of Work': 'red',
  Video: 'purple',
  'Question Bank': 'blue',
};

const TABS = ['School Library', 'Maple Public Library', 'Other Schools', 'Access Requests'] as const;

/** The library's working state: recommendations, access requests and their conversations. */
function useLibrary(lib: Lib) {
  const [recommended, setRecommended] = useState<Readonly<Record<string, string>>>({});
  const [requests, setRequests] = useState<readonly LibraryRequest[]>(lib.requests);
  const [openReq, setOpenReq] = useState(lib.requests[0].id);
  const recommend = (r: Resource) => {
    const current = recommended[r.id];
    const next = lib.recommendTo[(current ? lib.recommendTo.indexOf(current) + 1 : 0) % lib.recommendTo.length];
    setRecommended((prev) => ({ ...prev, [r.id]: next }));
    toast(`“${r.title}” recommended to ${next}. Their teachers can add it to lessons and learners see it in their library.`);
  };
  const requestAccess = (r: Resource) => {
    if (requests.some((q) => q.resource === r.title)) return toast('You have already asked for this resource.');
    const q: LibraryRequest = {
      id: `q-${r.id}`,
      direction: 'outgoing',
      resource: r.title,
      kind: r.kind,
      school: r.owner ?? 'Another school',
      status: 'With Maple Admin',
      when: 'Today',
      thread: [{ from: lib.school, text: `We would like our learners to use “${r.title}” this term.`, when: 'Just now' }],
    };
    setRequests((prev) => [q, ...prev]);
    setOpenReq(q.id);
    toast(`Request sent. A Maple admin will contact ${q.school} and keep you both in the conversation.`);
  };
  const reply = (id: string, text: string) =>
    setRequests((prev) => prev.map((q) => (q.id === id ? { ...q, thread: [...q.thread, { from: lib.school, text, when: 'Just now' }] } : q)));
  const decide = (id: string, approve: boolean) => {
    setRequests((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: approve ? 'Approved' : 'Declined',
              thread: [...q.thread, { from: lib.school, text: approve ? 'Approved until Dec 18, 2026, view-only for learners.' : 'Declined for now, thank you for asking.', when: 'Just now' }],
            }
          : q,
      ),
    );
    toast(approve ? 'Access approved. The Maple admin will set it up for the other school.' : 'Request declined. The other school has been told.');
  };
  return { recommended, recommend, requests, requestAccess, openReq, setOpenReq, reply, decide };
}

/** A resource card: cover, title, format and size, its type, and the right action for its library. */
function ResourceCard({ r, action, onAction, actionDone }: { r: Resource; action: 'download' | 'recommend' | 'request'; onAction: () => void; actionDone?: string }) {
  return (
    <View style={styles.res}>
      <View>
        <Image source={r.cover} style={styles.cover} contentFit="cover" accessibilityLabel={`${r.title} cover`} />
        <Pressable style={styles.resMenu} onPress={() => toast('Move, rename, share or delete this resource.')} accessibilityRole="button" accessibilityLabel={`Options for ${r.title}`} hitSlop={6}>
          <Icon name="more" size={16} color={NAVY} />
        </Pressable>
      </View>
      <Text style={styles.resTitle} numberOfLines={2}>
        {r.title}
      </Text>
      <Text style={styles.resMeta} numberOfLines={1}>
        {r.owner ? r.owner : `${r.format} • ${r.size}`}
      </Text>
      <View style={styles.resFoot}>
        <Pill label={r.kind} tone={KIND_TONE[r.kind]} size={11.5} />
        {action === 'download' ? (
          <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={`Download ${r.title}`} hitSlop={8}>
            <Icon name="download" size={19} color={BLUE} />
          </Pressable>
        ) : null}
      </View>
      {action !== 'download' ? (
        <Pressable style={[styles.resBtn, actionDone && styles.resBtnDone]} onPress={onAction} accessibilityRole="button" accessibilityLabel={action === 'recommend' ? `Recommend ${r.title}` : `Request access to ${r.title}`}>
          <Icon name={action === 'recommend' ? 'thumbUp' : 'lock'} size={15} color={actionDone ? '#16A34A' : BLUE} />
          <Text style={[styles.resBtnText, actionDone && styles.resBtnTextDone]} numberOfLines={1}>
            {action === 'recommend' ? (actionDone ? `Recommended to ${actionDone}` : 'Recommend to learners') : actionDone ? actionDone : 'Request Access'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** A grid of resource cards, four to a row. */
function ResourceGrid({ items, render }: { items: readonly Resource[]; render: (r: Resource) => ReactNode }) {
  return (
    <View style={styles.resGrid}>
      {items.map((r) => (
        <View key={r.id} style={styles.resCell}>
          {render(r)}
        </View>
      ))}
    </View>
  );
}

/** One access request: who, which resource, where it stands. */
function RequestRow({ q, on, onPress }: { q: LibraryRequest; on: boolean; onPress: () => void }) {
  const tone: Tone = q.status === 'Approved' ? 'green' : q.status === 'Declined' ? 'grey' : q.status === 'Awaiting your reply' ? 'red' : 'orange';
  return (
    <Pressable style={[styles.req, on && styles.reqOn]} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${q.resource}, ${q.school}, ${q.status}`}>
      <IconTile icon={q.direction === 'incoming' ? 'arrowLeft' : 'arrowRight'} tone={q.direction === 'incoming' ? 'purple' : 'blue'} size={38} radius={10} />
      <View style={styles.flex}>
        <Text style={styles.reqTitle} numberOfLines={1}>
          {q.resource}
        </Text>
        <Text style={styles.reqMeta} numberOfLines={1}>{`${q.direction === 'incoming' ? 'From' : 'To'} ${q.school}  •  ${q.when}`}</Text>
        <Pill label={q.status} tone={tone} size={11.5} style={styles.reqPill} />
      </View>
    </Pressable>
  );
}

/** The three-way conversation for a request, with the Maple admin mediating. */
function RequestThread({ q, school, onReply, onDecide }: { q: LibraryRequest; school: string; onReply: (text: string) => void; onDecide: (approve: boolean) => void }) {
  const [draft, setDraft] = useState('');
  const send = () => {
    if (!draft.trim()) return;
    onReply(draft.trim());
    setDraft('');
  };
  return (
    <View style={styles.thread}>
      <View style={styles.threadHead}>
        <View style={styles.flex}>
          <Text style={styles.threadTitle}>{q.resource}</Text>
          <Text style={styles.reqMeta}>{`${school}  ↔  ${q.school}`}</Text>
        </View>
        <Pill label={q.kind} tone={KIND_TONE[q.kind]} size={12} />
      </View>
      <View style={styles.mediator}>
        <Icon name="shield" size={18} color={BLUE} />
        <Text style={styles.mediatorText}>A Maple platform admin mediates every request between schools. Both schools see this whole conversation.</Text>
      </View>
      {q.thread.map((m, i) => {
        const mine = m.from === school;
        const admin = m.from === 'Maple Admin';
        return (
          <View key={i} style={[styles.bubble, mine ? styles.bubbleMine : admin ? styles.bubbleAdmin : styles.bubbleTheirs]}>
            <Text style={[styles.bubbleFrom, admin && styles.bubbleFromAdmin]}>{admin ? 'Maple Admin (mediator)' : m.from}</Text>
            <Text style={styles.bubbleText}>{m.text}</Text>
            <Text style={styles.bubbleWhen}>{m.when}</Text>
          </View>
        );
      })}
      {q.direction === 'incoming' && q.status === 'Awaiting your reply' ? (
        <View style={styles.decide}>
          <Btn label="Approve Access" icon="check" onPress={() => onDecide(true)} height={44} style={styles.flex} />
          <Btn label="Decline" kind="outline" onPress={() => onDecide(false)} height={44} style={styles.flex} />
        </View>
      ) : null}
      <View style={styles.compose}>
        <TextInput style={styles.composeInput} value={draft} onChangeText={setDraft} onSubmitEditing={send} placeholder="Write to the school and the Maple admin..." placeholderTextColor={MUTED} accessibilityLabel="Reply" />
        <Pressable style={styles.send} onPress={send} accessibilityRole="button" accessibilityLabel="Send">
          <Icon name="send" size={18} color={WHITE} />
        </Pressable>
      </View>
    </View>
  );
}

/** The school library's own content: folders and recent resources. */
function SchoolShelves({ lib }: { lib: Lib }) {
  return (
    <>
      <Card style={styles.block}>
        <CardHead title="Folders" />
        <View style={styles.folders}>
          {lib.folders.map((f) => (
            <Pressable key={f.name} style={styles.folder} onPress={() => toast(`${f.name}: ${f.count}`)} accessibilityRole="button" accessibilityLabel={`${f.name}, ${f.count}`}>
              <View style={styles.folderTop}>
                <Icon name="folder" size={34} color={TONES[f.tone].solid} />
                <Icon name="more" size={14} color={NAVY} />
              </View>
              <Text style={styles.folderName} numberOfLines={2}>
                {f.name}
              </Text>
              <Text style={styles.folderCount}>{f.count}</Text>
            </Pressable>
          ))}
        </View>
      </Card>
      <Card style={styles.block}>
        <CardHead title="Recent Resources" link="View All" onLink={() => toast('1,842 resources in your library.')} />
        <ResourceGrid
          items={lib.resources}
          render={(r) => (
            <ResourceCard r={r} action="download" onAction={() => toast(`Downloading ${r.title} (${r.size})…`)} />
          )}
        />
      </Card>
      <Text style={styles.recNote}>Teachers can recommend any of these, or Maple Public Library resources, to their classes.</Text>
    </>
  );
}

/** Institutional Private Library & Curriculum Repository on the desktop reference, with public and shared libraries. */
export function LibraryDesk({ a }: { a: Admin }) {
  const lib = a.library;
  const l = useLibrary(lib);
  const [tab, setTab] = useState<string>(TABS[0]);
  const [type, setType, types] = useChoice(['All Resource Types', 'Textbooks', 'Past Papers', 'Lesson Plans', 'Videos']);
  const [subject, setSubject, subjects] = useChoice(['All Subjects', 'Mathematics', 'English', 'Science']);
  const [grade, setGrade, grades] = useChoice(['All Grade Levels', 'Primary', 'Lower Secondary', 'Upper Secondary']);
  const [dept, setDept, depts] = useChoice(['All Departments', 'Sciences', 'Languages', 'Humanities']);
  const [sort, setSort, sorts] = useChoice(['Sort: Latest', 'Sort: A–Z', 'Sort: Most used']);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const pending = l.requests.filter((q) => q.status === 'Awaiting your reply').length;
  const tabs = TABS.map((t) => (t === 'Access Requests' && pending ? `Access Requests (${pending})` : t));
  const open = l.requests.find((q) => q.id === l.openReq) ?? l.requests[0];
  return (
    <AdminDesk me={a.me} search="Search resources, subjects, grades, or keywords..." active="Library">
      <PageHead
        title="Library"
        subtitle="Manage your school's digital textbooks, past papers, lesson plans and teaching resources."
        right={<Btn label="Upload Resource" icon="plus" iconRight="chevronDown" onPress={() => toast('Upload a file, add a link, or import from Google Drive.')} height={46} />}
      />
      <View style={styles.stats}>
        {lib.stats.map((s) => (
          <View key={s.label} style={styles.stat}>
            <IconTile icon={s.icon} tone={s.tone} size={50} radius={12} />
            <View style={styles.flex}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel} numberOfLines={2}>
                {s.label}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <UnderTabs items={tabs} active={tabs.find((t) => t.startsWith(tab)) ?? tabs[0]} onChange={(t) => setTab(t.replace(/ \(\d+\)$/, ''))} size={15} style={styles.tabs} />
      {tab === 'School Library' || tab === 'Maple Public Library' || tab === 'Other Schools' ? (
        <Card style={styles.filters}>
          <SelectBox value={type} options={types} onChange={setType} width={182} />
          <SelectBox value={subject} options={subjects} onChange={setSubject} width={140} />
          <SelectBox value={grade} options={grades} onChange={setGrade} width={164} />
          <SelectBox value={dept} options={depts} onChange={setDept} width={168} />
          <Search placeholder="Search resources..." style={styles.flex} />
          <SelectBox value={sort} options={sorts} onChange={setSort} width={140} />
          {(['grid', 'list'] as const).map((v) => (
            <Pressable key={v} style={[styles.viewBtn, layout === v && styles.viewBtnOn]} onPress={() => setLayout(v)} accessibilityRole="button" accessibilityState={{ selected: layout === v }} accessibilityLabel={`${v} view`}>
              <Icon name={v === 'grid' ? 'grid' : 'listBullet'} size={18} color={layout === v ? BLUE : BODY} />
            </Pressable>
          ))}
        </Card>
      ) : null}
      <View style={styles.row}>
        <View style={styles.main}>
          {tab === 'School Library' ? <SchoolShelves lib={lib} /> : null}
          {tab === 'Maple Public Library' ? (
            <Card style={styles.block}>
              <CardHead title="Maple Public Library" subtitle="Free, quality-checked resources for every Maple school. Recommend them to your classes alongside your own." />
              <ResourceGrid items={lib.publicResources} render={(r) => <ResourceCard r={r} action="recommend" onAction={() => l.recommend(r)} actionDone={l.recommended[r.id]} />} />
            </Card>
          ) : null}
          {tab === 'Other Schools' ? (
            <Card style={styles.block}>
              <CardHead title="Resources from Other Maple Schools" subtitle="Ask another school to share its videos, books or question papers. A Maple admin arranges it with both schools." />
              <ResourceGrid
                items={lib.networkResources}
                render={(r) => {
                  const q = l.requests.find((x) => x.resource === r.title);
                  return <ResourceCard r={r} action="request" onAction={() => (q ? (setTab('Access Requests'), l.setOpenReq(q.id)) : l.requestAccess(r))} actionDone={q?.status} />;
                }}
              />
            </Card>
          ) : null}
          {tab === 'Access Requests' ? (
            <Card style={[styles.block, styles.requests]}>
              <View style={styles.reqList}>
                <Text style={styles.sideTitle}>Requests</Text>
                {l.requests.map((q) => (
                  <RequestRow key={q.id} q={q} on={q.id === open.id} onPress={() => l.setOpenReq(q.id)} />
                ))}
              </View>
              <RequestThread q={open} school={lib.school} onReply={(t) => l.reply(open.id, t)} onDecide={(ok) => l.decide(open.id, ok)} />
            </Card>
          ) : null}
        </View>
        <View style={styles.side}>
          <Card style={styles.sideCard}>
            <Text style={styles.sideTitle}>Quick Upload</Text>
            <View style={styles.drop}>
              <Icon name="cloudUpload" size={40} color={BLUE} />
              <Text style={styles.dropTitle}>Drag & drop files here</Text>
              <Text style={styles.dropLink}>or click to browse</Text>
              <Text style={styles.dropNote}>Supports PDF, DOC, DOCX, XLSX, PPT, MP4 (Max 100MB per file)</Text>
              <Btn label="Choose Files" onPress={() => toast('Choose files to add to the school library.')} height={42} style={styles.dropBtn} />
            </View>
          </Card>
          <Card style={styles.sideCard}>
            <View style={styles.storageHead}>
              <Text style={styles.sideTitle}>Storage Usage</Text>
              <Text style={styles.storagePct}>{`${lib.storage.percent}% used`}</Text>
            </View>
            <Bar value={lib.storage.percent / 100} color="#22A55A" height={10} />
            <View style={styles.storageHead}>
              <Text style={styles.dropNote}>{`${lib.storage.used} of ${lib.storage.total}`}</Text>
              <Btn label="Manage" kind="soft" onPress={() => toast('Large files, duplicates and storage add-ons.')} height={34} style={styles.manage} />
            </View>
          </Card>
          <Card style={styles.sideCard}>
            <Text style={styles.sideTitle}>Shared With</Text>
            {lib.sharing.map((s) => (
              <Pressable key={s.title} style={styles.share} onPress={() => toast(`Share selected resources: ${s.body}.`)} accessibilityRole="button" accessibilityLabel={s.title}>
                <IconTile icon={s.icon} tone={s.tone} size={40} radius={10} />
                <View style={styles.flex}>
                  <Text style={styles.shareTitle}>{s.title}</Text>
                  <Text style={styles.shareBody} numberOfLines={1}>
                    {s.body}
                  </Text>
                </View>
              </Pressable>
            ))}
          </Card>
        </View>
      </View>
    </AdminDesk>
  );
}

/** The phone reference: search, type chips, resource groups and recent resources, plus public and shared libraries. */
export function LibraryPhone({ a }: { a: Admin }) {
  const lib = a.library;
  const l = useLibrary(lib);
  const [chip, setChip] = useState('All');
  const [view, setView] = useState<'home' | 'public' | 'schools' | 'requests' | 'thread'>('home');
  const pending = l.requests.filter((q) => q.status === 'Awaiting your reply').length;
  const open = l.requests.find((q) => q.id === l.openReq) ?? l.requests[0];
  if (view !== 'home') {
    const titles = { public: 'Maple Public Library', schools: 'Other Schools', requests: 'Access Requests', thread: 'Request' } as const;
    return (
      <AdminPhone me={a.me}>
        <PageHead title={titles[view]} subtitle={view === 'public' ? 'Recommend free Maple resources to your classes.' : view === 'schools' ? 'Ask another school to share its resources.' : 'Mediated by a Maple platform admin.'} phone onBack={() => setView(view === 'thread' ? 'requests' : 'home')} />
        {view === 'public' || view === 'schools'
          ? (view === 'public' ? lib.publicResources : lib.networkResources).map((r) => {
              const q = l.requests.find((x) => x.resource === r.title);
              return (
                <View key={r.id} style={styles.phoneRes}>
                  <Image source={r.cover} style={styles.phoneCover} contentFit="cover" />
                  <View style={styles.flex}>
                    <Text style={styles.resTitle} numberOfLines={2}>
                      {r.title}
                    </Text>
                    <Text style={styles.resMeta}>{r.owner}</Text>
                    <Pressable
                      style={[styles.resBtn, (view === 'public' ? l.recommended[r.id] : q) && styles.resBtnDone]}
                      onPress={() => (view === 'public' ? l.recommend(r) : q ? (l.setOpenReq(q.id), setView('thread')) : l.requestAccess(r))}
                      accessibilityRole="button"
                      accessibilityLabel={view === 'public' ? `Recommend ${r.title}` : `Request access to ${r.title}`}>
                      <Text style={styles.resBtnText} numberOfLines={1}>
                        {view === 'public' ? (l.recommended[r.id] ? `Recommended to ${l.recommended[r.id]}` : 'Recommend to learners') : q ? q.status : 'Request Access'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          : null}
        {view === 'requests'
          ? l.requests.map((q) => (
              <RequestRow
                key={q.id}
                q={q}
                on={false}
                onPress={() => {
                  l.setOpenReq(q.id);
                  setView('thread');
                }}
              />
            ))
          : null}
        {view === 'thread' ? (
          <Card style={styles.phoneThread}>
            <RequestThread q={open} school={lib.school} onReply={(t) => l.reply(open.id, t)} onDecide={(ok) => l.decide(open.id, ok)} />
          </Card>
        ) : null}
      </AdminPhone>
    );
  }
  return (
    <AdminPhone me={a.me}>
      <PageHead title="Library" subtitle="School digital resources, textbooks, past papers and lesson plans." phone />
      <View style={styles.searchRow}>
        <Search placeholder="Search resources..." style={styles.flex} />
        <Pressable style={styles.filterBtn} onPress={() => toast('Filter by subject, grade or department.')} accessibilityRole="button" accessibilityLabel="Filters">
          <Icon name="filter" size={20} color={BLUE} />
        </Pressable>
      </View>
      <Segments items={['All', 'Textbooks', 'Past Papers', 'Lesson Plans']} active={chip} onChange={setChip} size={13.5} stretch />
      {lib.phoneMenu.map((m) => (
        <MenuRow key={m.title} icon={m.icon} tone={m.tone} title={m.title} body={m.count} onPress={() => toast(`${m.title}: ${m.count}`)} />
      ))}
      <MenuRow icon="globe" tone="green" title="Maple Public Library" body="Recommend free resources to learners" onPress={() => setView('public')} />
      <MenuRow icon="school" tone="purple" title="Other Schools" body="Request access to another school's resources" onPress={() => setView('schools')} />
      <MenuRow icon="chat" tone="orange" title="Access Requests" body={pending ? `${pending} awaiting your reply` : 'All up to date'} onPress={() => setView('requests')} />
      <ListCard title="Recent Resources" onAll={() => toast('1,842 resources in your library.')}>
        {lib.resources.slice(0, 3).map((r, i) => (
          <ListRow
            key={r.id}
            last={i === 2}
            lead={<View style={[styles.fmt, { backgroundColor: r.format === 'PDF' ? '#E5383B' : BLUE }]}><Text style={styles.fmtText}>{r.format}</Text></View>}
            title={r.title}
            body={`${r.kind}  •  Today`}
            right={
              <Pressable onPress={() => toast(`Downloading ${r.title}…`)} accessibilityRole="button" accessibilityLabel={`Download ${r.title}`} hitSlop={8}>
                <Icon name="download" size={20} color={BLUE} />
              </Pressable>
            }
          />
        ))}
      </ListCard>
    </AdminPhone>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stats: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: WHITE, borderWidth: 1, borderColor: LINE },
  statValue: { fontSize: 21, fontWeight: '800', color: NAVY },
  statLabel: { fontSize: 13, color: BODY },
  tabs: { marginTop: 18 },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14, padding: 12 },
  viewBtn: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  viewBtnOn: { backgroundColor: SELECT, borderColor: '#BFD3F7' },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginTop: 14 },
  main: { flex: 1, minWidth: 0, gap: 16 },
  block: { gap: 14, padding: 16 },
  folders: { flexDirection: 'row', gap: 10 },
  folder: { flex: 1, minWidth: 0, gap: 4, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  folderTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  folderName: { marginTop: 6, fontSize: 12.5, fontWeight: '600', color: NAVY, textAlign: 'center' },
  folderCount: { fontSize: 11.5, color: BODY, textAlign: 'center' },
  resGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -8, rowGap: 16 },
  resCell: { width: '25%', paddingHorizontal: 8 },
  res: { gap: 5, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  cover: { width: '100%', aspectRatio: 1.35, borderRadius: 6 },
  resMenu: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.9)' },
  resTitle: { marginTop: 4, fontSize: 13.5, fontWeight: '600', color: NAVY },
  resMeta: { fontSize: 12, color: BODY },
  resFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  resBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 34, marginTop: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1, borderColor: '#C9DAF7', backgroundColor: WHITE },
  resBtnDone: { borderColor: '#BDE8CC', backgroundColor: '#F1FBF4' },
  resBtnText: { flexShrink: 1, fontSize: 12.5, fontWeight: '600', color: BLUE },
  resBtnTextDone: { color: '#16A34A' },
  recNote: { fontSize: 13, color: BODY },
  side: { width: 290, gap: 16 },
  sideCard: { gap: 12, padding: 16 },
  sideTitle: { fontSize: 17, fontWeight: '800', color: NAVY },
  drop: { alignItems: 'center', gap: 5, padding: 16, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#A9C2F0', backgroundColor: '#F8FAFF' },
  dropTitle: { marginTop: 6, fontSize: 15, fontWeight: '700', color: NAVY },
  dropLink: { fontSize: 13.5, color: BLUE },
  dropNote: { fontSize: 12, color: BODY, textAlign: 'center' },
  dropBtn: { alignSelf: 'stretch', marginTop: 8 },
  storageHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  storagePct: { fontSize: 13.5, color: NAVY },
  manage: { paddingHorizontal: 14 },
  share: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  shareTitle: { fontSize: 14, fontWeight: '600', color: NAVY },
  shareBody: { fontSize: 12, color: BODY },
  requests: { flexDirection: 'row', gap: 16 },
  reqList: { width: 280, gap: 8 },
  req: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  reqOn: { borderColor: '#9EC1F9', backgroundColor: SELECT },
  reqTitle: { fontSize: 14, fontWeight: '700', color: NAVY },
  reqMeta: { marginTop: 2, fontSize: 12.5, color: BODY },
  reqPill: { marginTop: 6 },
  thread: { flex: 1, minWidth: 0, gap: 10 },
  threadHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  threadTitle: { fontSize: 17, fontWeight: '800', color: NAVY },
  mediator: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 10, backgroundColor: SOFT },
  mediatorText: { flex: 1, fontSize: 12.5, color: BODY },
  bubble: { maxWidth: '88%', gap: 3, padding: 12, borderRadius: 12 },
  bubbleMine: { alignSelf: 'flex-end', backgroundColor: '#DCEBFF' },
  bubbleTheirs: { alignSelf: 'flex-start', backgroundColor: '#F1F4F9' },
  bubbleAdmin: { alignSelf: 'center', backgroundColor: '#FFF6E5', borderWidth: 1, borderColor: '#F8DFA8' },
  bubbleFrom: { fontSize: 12, fontWeight: '700', color: NAVY },
  bubbleFromAdmin: { color: '#B26A00' },
  bubbleText: { fontSize: 13.5, lineHeight: 19, color: '#26335F' },
  bubbleWhen: { fontSize: 11, color: MUTED },
  decide: { flexDirection: 'row', gap: 10 },
  compose: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  composeInput: { flex: 1, height: 44, paddingVertical: 0, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: LINE, fontSize: 14, color: NAVY, backgroundColor: WHITE },
  send: { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: BLUE },
  searchRow: { flexDirection: 'row', gap: 10 },
  filterBtn: { width: 46, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  fmt: { width: 34, height: 40, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  fmtText: { fontSize: 10, fontWeight: '800', color: WHITE },
  phoneRes: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: WHITE },
  phoneCover: { width: 74, height: 84, borderRadius: 6 },
  phoneThread: { padding: 14 },
});
