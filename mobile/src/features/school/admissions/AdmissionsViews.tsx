import { Image } from 'expo-image';
import { type ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Btn, Card, CardHead, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, WHITE } from '@/features/portal/tokens';
import { conversionRate, stageShares } from '@/features/school/growth/growth';
import { toast } from '@/lib/toast';
import { todayISO } from '@/lib/today';
import type { MockData } from '@/mock';

import { AdminDesk, AdminPhone, SelectBox } from '../kit/AdminKit';
import { HubHeader, HubTabs, KpiCard, KpiRow, PrivacyNote } from '../kit/HubKit';
import { advance, contactFor, exportInquiries, type Inquiry, PIPELINE, pipeline } from './admissions';

type Admin = MockData['schoolAdmin'];
type Campaign = Admin['admissionsHub']['campaigns'][number];

const COLUMN_TINT: Readonly<Record<string, string>> = { New: '#EEF3FF', 'Contact Authorized': '#F3EEFF', Contacted: '#FFF6E8', Interested: '#EEF3FF', Applied: '#F3EEFF', Enrolled: '#ECF8F0' };
const SHOWN = 3;

function useAdmissions(a: Admin) {
  const h = a.admissionsHub;
  const g = a.schoolGrowth;
  const [tab, setTab] = useState(h.tabs[0]);
  const [term, setTerm] = useState(h.terms[0]);
  const [list, setList] = useState<readonly Inquiry[]>(h.inquiries);
  const [open, setOpen] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [campaigns, setCampaigns] = useState<readonly Campaign[]>(h.campaigns);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: '', sub: '' });
  const enrolled = g.funnel[g.funnel.length - 1].count;
  const conversion = conversionRate(enrolled, g.uniqueVisitors);
  return {
    h,
    g,
    tab,
    setTab,
    term,
    setTerm,
    list,
    board: pipeline(list),
    conversion,
    conversionDelta: Math.round((conversion - h.conversionBefore) * 10) / 10,
    inquiry: list.find((i) => i.ref === open),
    open: setOpen,
    contact: (i: Inquiry) => contactFor(i, h.viewer),
    move: (i: Inquiry) => {
      const r = advance(i);
      if ('error' in r) return toast(r.error);
      setList((l) => l.map((x) => (x.ref === i.ref ? r.inquiry : x)));
      toast(`${i.name} moved to ${r.inquiry.stage}.`);
    },
    exporting,
    setExporting,
    purpose,
    setPurpose,
    runExport: () => {
      const r = exportInquiries(list, h.viewer, purpose, todayISO());
      if ('error' in r) return toast(r.error);
      setExporting(false);
      setPurpose('');
      toast(`Exported ${r.audit.count} inquiries for “${r.audit.purpose}”. Logged under ${r.audit.by}; contact details only where families authorised them.`);
    },
    campaigns,
    creating,
    setCreating,
    draft,
    setDraft,
    createCampaign: () => {
      if (!draft.title.trim()) return toast('Give the campaign a title.');
      setCampaigns((c) => [{ id: `c${c.length + 1}`, title: draft.title.trim(), sub: draft.sub.trim() || 'Admissions announcement', status: 'Scheduled', views: 0, interested: 0, applications: 0, photo: h.campaigns[0].photo }, ...c]);
      setCreating(false);
      setDraft({ title: '', sub: '' });
      toast('Campaign scheduled. It appears on your School Network profile once published.');
    },
  };
}
type X = ReturnType<typeof useAdmissions>;

const initials = (name: string) =>
  name
    .replace(/\./g, '')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

function Person({ i, onPress }: { i: Inquiry; onPress: () => void }) {
  return (
    <Pressable style={s.person} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${i.name}, ${i.level}, ${i.stage}`}>
      <View style={s.avatar}>
        <Text style={s.avatarText}>{initials(i.name)}</Text>
      </View>
      <View style={s.flex}>
        <Text style={s.strong} numberOfLines={1}>
          {i.name}
        </Text>
        <Text style={s.small} numberOfLines={1}>
          {i.level}
        </Text>
      </View>
    </Pressable>
  );
}

function Pipeline({ x, phone }: { x: X; phone: boolean }) {
  const board = (
    <View style={s.board}>
      {x.board.map((c) => {
        const total = x.h.stageTotals[c.stage] ?? c.items.length;
        return (
          <View key={c.stage} style={[s.column, phone ? s.columnP : s.columnD, { backgroundColor: COLUMN_TINT[c.stage] }]}>
            <View style={s.columnHead}>
              <Text style={s.columnTitle} numberOfLines={1}>
                {c.stage === 'New' ? 'New Inquiries' : c.stage}
              </Text>
              <Icon name={c.stage === 'Enrolled' ? 'check' : 'chevronRight'} size={14} color={NAVY} />
            </View>
            <Text style={s.columnTotal}>{total.toLocaleString('en-US')}</Text>
            <View style={s.people}>
              {c.items.slice(0, SHOWN).map((i) => (
                <Person key={i.ref} i={i} onPress={() => x.open(i.ref)} />
              ))}
            </View>
            {total > SHOWN ? <Text style={s.more}>{`+${(total - Math.min(SHOWN, c.items.length)).toLocaleString('en-US')} more`}</Text> : null}
          </View>
        );
      })}
    </View>
  );
  return (
    <Card style={s.card}>
      <CardHead title="Admissions Pipeline" size={16} subtitle="Names are shown only when a family gave them with their inquiry." />
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {board}
        </ScrollView>
      ) : (
        board
      )}
    </Card>
  );
}

function Campaigns({ x }: { x: X }) {
  return (
    <Card style={s.card}>
      <CardHead title={`Active Campaigns (${x.campaigns.filter((c) => c.status === 'Active').length})`} size={16} link="View All" onLink={() => x.setTab('Campaigns')} />
      {x.campaigns.map((c) => (
        <View key={c.id} style={s.campaign}>
          <Image source={c.photo} style={s.campaignPhoto} contentFit="cover" />
          <View style={s.flex}>
            <View style={s.row}>
              <Text style={[s.strong, s.flex]} numberOfLines={1}>
                {c.title}
              </Text>
              <Pill label={c.status} tone={c.status === 'Active' ? 'green' : 'orange'} size={11} />
            </View>
            <Text style={s.small}>{c.sub}</Text>
            <View style={s.row}>
              <Icon name="eye" size={13} color={BODY} />
              <Text style={s.small}>{c.views.toLocaleString('en-US')}</Text>
              <Icon name="people" size={13} color={BODY} />
              <Text style={s.small}>{c.interested.toLocaleString('en-US')}</Text>
              <Icon name="doc" size={13} color={BODY} />
              <Text style={s.small}>{c.applications.toLocaleString('en-US')}</Text>
            </View>
          </View>
        </View>
      ))}
      <Text style={s.small}>Campaigns appear on your School Network profile. Maple never sends them to people who haven’t asked to hear from you.</Text>
    </Card>
  );
}

function InquiryTable({ x, stages }: { x: X; stages?: readonly string[] }) {
  const rows = stages ? x.list.filter((i) => stages.includes(i.stage)) : x.list;
  return (
    <Card style={s.card}>
      <CardHead title={stages ? stages.join(' & ') : 'Inquiries'} size={16} right={<Btn label="Export" icon="download" kind="outline" height={36} onPress={() => x.setExporting(true)} />} />
      <View style={[s.tr, s.th]}>
        <Text style={[s.thText, s.colRef]}>Reference</Text>
        <Text style={[s.thText, s.flex]}>Name</Text>
        <Text style={[s.thText, s.colLevel]}>Level</Text>
        <Text style={[s.thText, s.colStage]}>Stage</Text>
        <Text style={[s.thText, s.colConsent]}>Contact</Text>
      </View>
      {rows.map((i) => (
        <Pressable key={i.ref} style={s.tr} onPress={() => x.open(i.ref)} accessibilityRole="button" accessibilityLabel={`${i.name}, ${i.stage}`}>
          <Text style={[s.td, s.colRef]}>{i.ref}</Text>
          <Text style={[s.td, s.flex]}>{i.name}</Text>
          <Text style={[s.td, s.colLevel]}>{i.level}</Text>
          <Text style={[s.td, s.colStage]}>{i.stage}</Text>
          <View style={s.colConsent}>
            <Pill label={x.contact(i) ? 'Authorised' : 'Not shared'} tone={x.contact(i) ? 'green' : 'grey'} size={11} />
          </View>
        </Pressable>
      ))}
    </Card>
  );
}

function Reports({ x }: { x: X }) {
  const rows = stageShares(x.g.funnel);
  return (
    <Card style={s.card}>
      <CardHead title="Conversion Reports" size={16} subtitle="Totals only. Each stage counts a clearly defined event." />
      {rows.map((r) => (
        <View key={r.key} style={s.sumRow}>
          <Text style={[s.td, s.flex]}>{r.label}</Text>
          <Text style={s.strong}>{r.count.toLocaleString('en-US')}</Text>
          <Text style={[s.small, s.colShare]}>{r.ofPrevious === null ? '' : `${r.ofPrevious.toFixed(1)}% of previous`}</Text>
        </View>
      ))}
      <Text style={s.small}>{`Overall conversion: ${x.conversion}% of unique profile visitors went on to a confirmed enrolment. Applications and offers are never counted as enrolments.`}</Text>
    </Card>
  );
}

function Body({ x, phone }: { x: X; phone: boolean }) {
  switch (x.tab) {
    case 'Inquiries':
      return <InquiryTable x={x} />;
    case 'Applications':
      return <InquiryTable x={x} stages={['Applied']} />;
    case 'Enrolments':
      return <InquiryTable x={x} stages={['Enrolled']} />;
    case 'Campaigns':
      return <Campaigns x={x} />;
    case 'Conversion Reports':
      return <Reports x={x} />;
    default:
      return (
        <View style={phone ? s.stack : s.cols}>
          <View style={phone ? undefined : s.main}>
            <Pipeline x={x} phone={phone} />
          </View>
          <View style={phone ? undefined : s.side}>
            <Campaigns x={x} />
          </View>
        </View>
      );
  }
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={s.scrim}>
        <View style={s.sheet}>
          <View style={s.row}>
            <Text style={[s.sheetTitle, s.flex]}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="close" size={20} color={NAVY} />
            </Pressable>
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

function Sheets({ x }: { x: X }) {
  const i = x.inquiry;
  const c = i ? x.contact(i) : null;
  const next = i ? PIPELINE[PIPELINE.indexOf(i.stage as (typeof PIPELINE)[number]) + 1] : undefined;
  return (
    <>
      {i ? (
        <Sheet title={i.name} onClose={() => x.open(null)}>
          {(
            [
              ['Reference', i.ref],
              ['Level', i.level],
              ['Program of interest', i.program],
              ['Inquiry date', i.date],
              ['Stage', i.stage],
            ] as const
          ).map(([k, v]) => (
            <View key={k} style={s.sumRow}>
              <Text style={s.td}>{k}</Text>
              <Text style={s.strong}>{v}</Text>
            </View>
          ))}
          <View style={[s.consent, c ? s.consentOn : null]}>
            <Icon name={c ? 'shield' : 'lock'} size={16} color={c ? GREEN : BODY} />
            <View style={s.flex}>
              {c ? (
                <>
                  <Text style={s.strong}>{`Contact authorised for: ${i.consent?.purpose}`}</Text>
                  {c.phone ? <Text style={s.td}>{c.phone}</Text> : null}
                  {c.email ? <Text style={s.td}>{c.email}</Text> : null}
                </>
              ) : (
                <Text style={s.td}>Contact details aren’t shared: this family hasn’t authorised contact from your school.</Text>
              )}
            </View>
          </View>
          {next && c ? <Btn label={`Move to ${next}`} iconRight="arrowRight" height={42} onPress={() => x.move(i)} /> : null}
          {next && !c ? <Text style={s.small}>Waiting for the family to authorise contact. They do this themselves from Maple; it moves to Contact Authorized when they do.</Text> : null}
        </Sheet>
      ) : null}
      {x.exporting ? (
        <Sheet title="Export inquiries" onClose={() => x.setExporting(false)}>
          <Text style={s.td}>Exports carry only contact details families authorised, and every export is logged with its purpose.</Text>
          <TextInput style={s.input} value={x.purpose} onChangeText={x.setPurpose} placeholder="Why are you exporting? e.g. Follow-up calls" placeholderTextColor={BODY} accessibilityLabel="Export purpose" />
          <Btn label="Export" icon="download" height={42} onPress={x.runExport} />
        </Sheet>
      ) : null}
      {x.creating ? (
        <Sheet title="Create campaign" onClose={() => x.setCreating(false)}>
          <TextInput style={s.input} value={x.draft.title} onChangeText={(v) => x.setDraft({ ...x.draft, title: v })} placeholder="Title, e.g. Term 1, 2027 Admissions" placeholderTextColor={BODY} accessibilityLabel="Campaign title" />
          <TextInput style={s.input} value={x.draft.sub} onChangeText={(v) => x.setDraft({ ...x.draft, sub: v })} placeholder="What it’s about, e.g. Scholarships, open day" placeholderTextColor={BODY} accessibilityLabel="Campaign details" />
          <Text style={s.small}>Campaigns are published on your School Network profile; they are never sent to people who haven’t asked to hear from you.</Text>
          <Btn label="Schedule campaign" height={42} onPress={x.createCampaign} />
        </Sheet>
      ) : null}
    </>
  );
}

function Page({ x, phone }: { x: X; phone: boolean }) {
  return (
    <>
      <HubHeader
        icon="people"
        title="Admissions & Leads"
        subtitle="Manage inquiries, applications, enrolments and admissions campaigns with privacy-first, consent-based leads."
        phone={phone}
        right={
          <>
            <SelectBox value={x.term} options={x.h.terms} onChange={x.setTerm} width={160} />
            <Btn label="Export" icon="download" kind="outline" height={40} onPress={() => x.setExporting(true)} />
            <Btn label="Create Campaign" icon="plus" height={40} onPress={() => x.setCreating(true)} />
          </>
        }
      />
      <HubTabs items={x.h.tabs} icons={x.h.tabIcons} active={x.tab} onChange={x.setTab} phone={phone} />
      <KpiRow>
        {x.h.kpis.map((k) => (
          <KpiCard key={k.key} label={k.label} icon={k.icon} tone={k.tone} now={k.now} before={k.before} />
        ))}
        <Card style={s.conv}>
          <Text style={s.strong}>Overall Conversion</Text>
          <Text style={s.small}>(Visitor → Enrolment)</Text>
          <View style={s.row}>
            <Text style={s.convValue}>{`${x.conversion}%`}</Text>
            <Pill label={`${x.conversionDelta >= 0 ? '+' : ''}${x.conversionDelta} pp`} tone={x.conversionDelta >= 0 ? 'green' : 'red'} size={12} />
          </View>
        </Card>
      </KpiRow>
      <Body x={x} phone={phone} />
      <PrivacyNote text="You only see families who deliberately contacted your school. People who just viewed, liked or saved your profile stay anonymous." />
      <Sheets x={x} />
    </>
  );
}

/** Admissions & Leads on the desktop. */
export function AdmissionsDesk({ a }: { a: Admin }) {
  const x = useAdmissions(a);
  return (
    <AdminDesk me={a.me} search="Search inquiries, applications or campaigns..." active="Admissions">
      <Page x={x} phone={false} />
    </AdminDesk>
  );
}

/** Admissions & Leads on phones. */
export function AdmissionsPhone({ a }: { a: Admin }) {
  const x = useAdmissions(a);
  return (
    <AdminPhone me={a.me}>
      <Page x={x} phone />
    </AdminPhone>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stack: { gap: 16 },
  cols: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginBottom: 12 },
  main: { flex: 2.6 },
  side: { flex: 1, minWidth: 300 },
  card: { gap: 10, padding: 18 },
  small: { fontSize: 12, lineHeight: 16, color: BODY },
  strong: { fontSize: 13, fontWeight: '700', color: NAVY },
  td: { fontSize: 13, color: NAVY },
  conv: { flexGrow: 1, flexBasis: 200, gap: 2, padding: 16 },
  convValue: { marginTop: 4, fontSize: 24, fontWeight: '800', color: NAVY },
  board: { flexDirection: 'row', gap: 10 },
  column: { gap: 6, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: LINE },
  columnD: { flex: 1, minWidth: 0 },
  columnP: { width: 170 },
  columnHead: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  columnTitle: { flex: 1, fontSize: 12.5, fontWeight: '700', color: NAVY },
  columnTotal: { fontSize: 17, fontWeight: '800', color: NAVY },
  people: { gap: 8, marginTop: 4 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 6, borderRadius: 8, backgroundColor: WHITE },
  avatar: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: '#E6EEFF' },
  avatarText: { fontSize: 11.5, fontWeight: '700', color: BLUE },
  more: { marginTop: 4, fontSize: 12, color: BODY, textAlign: 'center' },
  campaign: { flexDirection: 'row', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EEF2F8' },
  campaignPhoto: { width: 74, height: 54, borderRadius: 8 },
  tr: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40, borderBottomWidth: 1, borderBottomColor: '#EEF2F8' },
  th: { minHeight: 32 },
  thText: { fontSize: 12, fontWeight: '600', color: BODY },
  colRef: { width: 90 },
  colLevel: { width: 130 },
  colStage: { width: 130 },
  colConsent: { width: 100 },
  colShare: { width: 140, textAlign: 'right' },
  sumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#EEF2F8' },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(17,28,78,0.35)' },
  sheet: { width: '100%', maxWidth: 460, gap: 12, padding: 22, borderRadius: 16, backgroundColor: WHITE },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: NAVY },
  consent: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 10, backgroundColor: '#F3F5FA' },
  consentOn: { backgroundColor: '#ECF8F0' },
  input: { height: 42, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: LINE, fontSize: 14, color: NAVY },
});
