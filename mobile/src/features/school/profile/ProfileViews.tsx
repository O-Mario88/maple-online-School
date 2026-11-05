import { Image } from 'expo-image';
import { type Href, router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Field, Row, SectionHead, Select } from '@/features/learner/schools/ApplyParts';
import { Bar, Btn, Card, Pill } from '@/features/portal/PortalParts';
import { BLUE, BODY, GREEN, LINE, NAVY, WHITE } from '@/features/portal/tokens';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';

import { AdminDesk, AdminPhone } from '../kit/AdminKit';
import { HubHeader, HubTabs } from '../kit/HubKit';
import { type BasicInfo, canPublish, DESCRIPTION_MAX, profileCompletion, PROFILE_SECTIONS, validateBasic } from './profile';

type Admin = MockData['schoolAdmin'];
type P = Admin['schoolProfile'];

const PURPLE = '#5B3FD9';
const thisYear = () => new Date().getFullYear();

function useProfile(a: Admin) {
  const p = a.schoolProfile;
  const [tab, setTab] = useState(p.tabs[0]);
  const [basic, setBasic] = useState<BasicInfo>(p.basic);
  const [programs, setPrograms] = useState<readonly string[]>(p.academics.programs);
  const [levels, setLevels] = useState<readonly string[]>(p.academics.levels);
  const [facilities, setFacilities] = useState<readonly string[]>(p.facilities);
  const [admissions, setAdmissions] = useState(p.admissions);
  const [exams, setExams] = useState(p.exams);
  const [contact, setContact] = useState(p.contact);
  const [device, setDevice] = useState<'desktop' | 'phone'>('desktop');
  const [showErrors, setShowErrors] = useState(false);
  const errors = validateBasic(basic, thisYear());
  const done = p.done.filter((k) => k !== 'basic' || Object.keys(errors).length === 0);
  const toggle = (list: readonly string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  return {
    p,
    tab,
    setTab,
    basic,
    set: (patch: Partial<BasicInfo>) => setBasic((b) => ({ ...b, ...patch })),
    errors: showErrors ? errors : {},
    done,
    completion: profileCompletion(done),
    programs,
    toggleProgram: (v: string) => setPrograms((l) => toggle(l, v)),
    levels,
    toggleLevel: (v: string) => setLevels((l) => toggle(l, v)),
    facilities,
    toggleFacility: (v: string) => setFacilities((l) => toggle(l, v)),
    admissions,
    setAdmissions: (patch: Partial<P['admissions']>) => setAdmissions((x) => ({ ...x, ...patch })),
    exams,
    setExams: (patch: Partial<P['exams']>) => setExams((x) => ({ ...x, ...patch })),
    contact,
    setContact: (patch: Partial<P['contact']>) => setContact((x) => ({ ...x, ...patch })),
    device,
    setDevice,
    save: () => {
      setShowErrors(true);
      toast(Object.keys(errors).length ? 'Saved as a draft. Fix the highlighted fields before publishing.' : 'Draft saved. Changes go live when you publish.');
    },
    publish: () => {
      setShowErrors(true);
      const r = canPublish({ basic, policyAccepted: p.policyAccepted, performanceVerified: p.performanceVerified }, thisYear());
      toast(r.ok ? 'Published. Your School Network profile is updated.' : r.reasons.join(' '));
    },
    viewPublic: () => router.push('/learn/schools?profile=riverside' as Href),
  };
}
type X = ReturnType<typeof useProfile>;

function Chips({ options, on, onPress }: { options: readonly string[]; on: readonly string[]; onPress: (v: string) => void }) {
  return (
    <View style={s.chips}>
      {options.map((o) => (
        <Pressable key={o} style={[s.chip, on.includes(o) && s.chipOn]} onPress={() => onPress(o)} accessibilityRole="checkbox" accessibilityState={{ checked: on.includes(o) }}>
          <Text style={[s.chipText, on.includes(o) && s.chipTextOn]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Completion({ x }: { x: X }) {
  return (
    <View style={s.stack}>
      <Card style={s.card}>
        <Text style={s.cardTitle}>Profile Completion</Text>
        <Text style={s.pct}>{`${x.completion}%`}</Text>
        <Bar value={x.completion / 100} color={GREEN} height={8} />
        {PROFILE_SECTIONS.map((sec) => {
          const ok = x.done.includes(sec.key);
          return (
            <View key={sec.key} style={s.checkRow}>
              <Icon name="tick" size={15} color={ok ? GREEN : '#C3CADB'} />
              <Text style={[s.body, s.flex]}>{sec.label}</Text>
              <Icon name={ok ? 'check' : 'clock'} size={15} color={ok ? GREEN : '#C3CADB'} />
            </View>
          );
        })}
      </Card>
      <View style={s.tip}>
        <Icon name="bulb" size={18} color={PURPLE} />
        <Text style={[s.body, s.flex]}>Complete your profile to improve your visibility and recommendations on the School Network.</Text>
      </View>
    </View>
  );
}

function Description({ x }: { x: X }) {
  const n = x.basic.description.length;
  return (
    <View style={s.field}>
      <Text style={s.label}>
        School Description<Text style={s.star}> *</Text>
      </Text>
      <View style={[s.area, !!x.errors.description && s.areaError]}>
        <TextInput style={s.areaInput} multiline value={x.basic.description} onChangeText={(v) => x.set({ description: v })} maxLength={DESCRIPTION_MAX + 50} accessibilityLabel="School description" />
        <Text style={[s.counter, n > DESCRIPTION_MAX && s.over]}>{`${n} / ${DESCRIPTION_MAX}`}</Text>
      </View>
      {x.errors.description ? <Text style={s.error}>{x.errors.description}</Text> : null}
    </View>
  );
}

function Overview({ x, phone }: { x: X; phone: boolean }) {
  const b = x.basic;
  const e = x.errors;
  const o = x.p.options;
  return (
    <Card style={s.card}>
      <SectionHead icon="building" title="Basic Information" sub="Provide essential details about your institution." />
      <Row phone={phone}>
        <Field label="School Name" required value={b.name} onChange={(v) => x.set({ name: v })} error={e.name} flex={1.5} />
        <Select label="School Type" required value={b.type} options={o.types} onChange={(v) => x.set({ type: v })} error={e.type} />
      </Row>
      <Row phone={phone}>
        <Select label="Ownership" required value={b.ownership} options={o.ownership} onChange={(v) => x.set({ ownership: v })} error={e.ownership} />
        <Field label="Establishment Year" required icon="calendar" keyboardType="number-pad" value={b.established} onChange={(v) => x.set({ established: v })} error={e.established} />
        <Field label="Registration No. (Optional)" value={b.registration} onChange={(v) => x.set({ registration: v })} />
      </Row>
      <Description x={x} />
      <View style={s.divider} />
      <SectionHead icon="pin" title="Location" sub="Where families can find you." />
      <Row phone={phone}>
        <Select label="Country" required value={b.country} options={o.countries} onChange={(v) => x.set({ country: v })} error={e.country} />
        <Select label="District" required value={b.district} options={o.districts} onChange={(v) => x.set({ district: v })} error={e.district} />
        <Field label="Town / City" required value={b.town} onChange={(v) => x.set({ town: v })} error={e.town} />
      </Row>
      <Row phone={phone}>
        <Field label="Physical Address" required icon="pin" value={b.address} onChange={(v) => x.set({ address: v })} error={e.address} flex={2} />
        <View style={s.mapCol}>
          <Text style={s.label}>Map Location</Text>
          <Pressable style={s.map} onPress={() => toast('Drop a pin on the map to set your exact location.')} accessibilityRole="button">
            <Text style={s.link}>Set on Map</Text>
            <Icon name="pin" size={18} color={PURPLE} />
          </Pressable>
        </View>
      </Row>
    </Card>
  );
}

function Academics({ x }: { x: X }) {
  return (
    <Card style={s.card}>
      <SectionHead icon="cap" title="Academics & Programs" sub="What your school teaches. Learners are matched on these." />
      <Text style={s.label}>Curriculum</Text>
      <Chips options={['UNEB', 'Cambridge', 'IB']} on={x.p.academics.curricula} onPress={() => toast('Curricula are verified by Maple. Ask support to add one.')} />
      <Text style={s.label}>Levels</Text>
      <Chips options={['Primary', 'O-Level', 'A-Level']} on={x.levels} onPress={x.toggleLevel} />
      <Text style={s.label}>Programs</Text>
      <Chips options={x.p.academics.allPrograms} on={x.programs} onPress={x.toggleProgram} />
    </Card>
  );
}

function Performance({ x }: { x: X }) {
  const pf = x.p.performance;
  return (
    <Card style={s.card}>
      <SectionHead icon="chart" title="Performance" sub="Published results, with their source and year." />
      <View style={s.row}>
        <Text style={s.big}>{`${pf.passRate}%`}</Text>
        <Text style={s.body}>{`${pf.exam} pass rate, ${pf.year}`}</Text>
        <Pill label={pf.verified ? 'Verified by Maple' : 'Awaiting verification'} tone={pf.verified ? 'green' : 'orange'} size={12} />
      </View>
      <Text style={s.small}>{`Source: ${pf.source}. New results stay hidden until Maple has checked them against the official results; Maple never ranks schools across different exam systems.`}</Text>
      <Btn label="Submit new results for verification" kind="outline" height={40} onPress={() => toast('Upload the official results; Maple checks them before they appear.')} />
    </Card>
  );
}

function Admissions({ x, phone }: { x: X; phone: boolean }) {
  const ad = x.admissions;
  return (
    <Card style={s.card}>
      <SectionHead icon="people" title="Admissions" sub="Dates, fees and what families need to apply." />
      <Row phone={phone}>
        <Field label="Applications open" value={ad.opens} onChange={(v) => x.setAdmissions({ opens: v })} />
        <Field label="Deadline" value={ad.deadline} onChange={(v) => x.setAdmissions({ deadline: v })} />
      </Row>
      <Row phone={phone}>
        <Field label="Fees per term from (UGX)" keyboardType="number-pad" value={ad.feeMin} onChange={(v) => x.setAdmissions({ feeMin: v })} />
        <Field label="Fees per term to (UGX)" keyboardType="number-pad" value={ad.feeMax} onChange={(v) => x.setAdmissions({ feeMax: v })} />
      </Row>
      <Text style={s.label}>Requirements</Text>
      {ad.requirements.map((r) => (
        <View key={r} style={s.checkRow}>
          <Icon name="doc" size={15} color={BODY} />
          <Text style={s.body}>{r}</Text>
        </View>
      ))}
    </Card>
  );
}

function Facilities({ x }: { x: X }) {
  return (
    <Card style={s.card}>
      <SectionHead icon="image" title="Facilities & Gallery" sub="Approved photos of your campus and facilities." />
      <Chips options={['Robotics lab', 'Computer labs', 'Science laboratories', 'Library', 'Boarding houses', 'Sports field', 'Music room', 'Chapel']} on={x.facilities} onPress={x.toggleFacility} />
      <View style={s.gallery}>
        {x.p.gallery.map((g, i) => (
          <Image key={i} source={g} style={s.galleryPhoto} contentFit="cover" />
        ))}
        <Pressable style={[s.galleryPhoto, s.addPhoto]} onPress={() => toast('Photos are checked by Maple before they appear on your profile.')} accessibilityRole="button" accessibilityLabel="Add photos">
          <Icon name="plus" size={22} color={PURPLE} />
        </Pressable>
      </View>
    </Card>
  );
}

function Exams({ x }: { x: X }) {
  const ex = x.exams;
  return (
    <Card style={s.card}>
      <SectionHead icon="trophy" title="Examination Services" sub="Only verified centres appear as exam centres on the School Network." />
      <View style={s.row}>
        <Pill label={ex.centre ? `Verified ${ex.boards.join(', ')} centre` : 'Not an exam centre'} tone={ex.centre ? 'green' : 'grey'} size={12} />
        <Text style={s.body}>{ex.exams.join(' · ')}</Text>
      </View>
      <Pressable style={s.checkRow} onPress={() => x.setExams({ external: !ex.external })} accessibilityRole="switch" accessibilityState={{ checked: ex.external }}>
        <View style={[s.box, ex.external && s.boxOn]}>{ex.external ? <Icon name="tick" size={13} color={WHITE} /> : null}</View>
        <Text style={s.body}>Accept external (private) candidates</Text>
      </Pressable>
      <Text style={s.small}>Your exam-board authorisation is checked by Maple. Registration is always confirmed by your centre, never by Maple.</Text>
    </Card>
  );
}

function Contact({ x, phone }: { x: X; phone: boolean }) {
  const c = x.contact;
  return (
    <Card style={s.card}>
      <SectionHead icon="chat" title="Public Contact" sub="Shown on your profile. Families who browse stay anonymous." />
      <Row phone={phone}>
        <Field label="Admissions phone" value={c.phone} onChange={(v) => x.setContact({ phone: v })} />
        <Field label="Admissions email" value={c.email} onChange={(v) => x.setContact({ email: v })} />
        <Field label="Website" value={c.website} onChange={(v) => x.setContact({ website: v })} />
      </Row>
    </Card>
  );
}

function Preview({ x }: { x: X }) {
  const pv = x.p.preview;
  const phoneView = x.device === 'phone';
  return (
    <View style={s.stack}>
      <Card style={s.previewHead}>
        <Icon name="eye" size={22} color={PURPLE} />
        <View style={s.flex}>
          <Text style={s.cardTitle}>Public Profile Preview</Text>
          <Text style={s.small}>How your school appears on the School Network.</Text>
        </View>
        {(['desktop', 'phone'] as const).map((d) => (
          <Pressable key={d} style={[s.device, x.device === d && s.deviceOn]} onPress={() => x.setDevice(d)} accessibilityRole="button" accessibilityState={{ selected: x.device === d }} accessibilityLabel={`Preview on ${d}`}>
            <Icon name={d === 'desktop' ? 'screen' : 'phone'} size={17} color={x.device === d ? BLUE : BODY} />
          </Pressable>
        ))}
      </Card>
      <Card style={[s.preview, phoneView && s.previewPhone]}>
        <View>
          <Image source={pv.photo} style={s.previewPhoto} contentFit="cover" />
          <View style={s.verified}>
            <Icon name="check" size={13} color={GREEN} />
            <Text style={s.verifiedText}>Verified Institution</Text>
          </View>
          <View style={s.crest}>
            <Image source={pv.crest} style={s.crestImg} contentFit="contain" />
          </View>
        </View>
        <View style={s.previewBody}>
          <View style={s.nameRow}>
            <Text style={s.previewName} numberOfLines={1}>
              {x.basic.name || 'Your school'}
            </Text>
            <Icon name="sealCheck" size={18} color={BLUE} />
          </View>
          <Text style={s.small}>{`${x.basic.town}, ${x.basic.district}, ${x.basic.country}   ·   Est. ${x.basic.established}`}</Text>
          <View style={s.previewTabs}>
            {['Overview', 'Programs', 'Admissions', 'More'].map((t, i) => (
              <Text key={t} style={[s.previewTab, i === 0 && s.previewTabOn]}>
                {t}
              </Text>
            ))}
          </View>
          <Text style={s.body} numberOfLines={3}>
            {x.basic.description}
          </Text>
          <View style={s.highlights}>
            {pv.highlights.map((h) => (
              <View key={h.label} style={s.highlight}>
                <Icon name={h.icon} size={20} color={PURPLE} />
                <Text style={s.highlightText}>{h.label}</Text>
              </View>
            ))}
          </View>
          <View style={s.row}>
            <View style={[s.previewBtn, s.previewBtnGhost]}>
              <Text style={s.link}>Save School</Text>
            </View>
            <View style={[s.previewBtn, s.previewBtnBlue]}>
              <Text style={s.previewBtnText}>Apply / Inquire</Text>
            </View>
          </View>
        </View>
      </Card>
    </View>
  );
}

function Body({ x, phone }: { x: X; phone: boolean }) {
  const forms: Record<string, ReactNode> = {
    Overview: <Overview x={x} phone={phone} />,
    'Academics & Programs': <Academics x={x} />,
    Performance: <Performance x={x} />,
    Admissions: <Admissions x={x} phone={phone} />,
    'Facilities & Gallery': <Facilities x={x} />,
    'Examination Services': <Exams x={x} />,
    'Contact & Location': <Contact x={x} phone={phone} />,
  };
  if (phone) {
    return (
      <View style={s.stack}>
        <Completion x={x} />
        {forms[x.tab]}
        <Preview x={x} />
      </View>
    );
  }
  return (
    <View style={s.cols}>
      <View style={s.left}>
        <Completion x={x} />
      </View>
      <View style={s.mid}>{forms[x.tab]}</View>
      <View style={s.right}>
        <Preview x={x} />
      </View>
    </View>
  );
}

function Page({ x, phone }: { x: X; phone: boolean }) {
  return (
    <>
      <HubHeader
        icon="building"
        title="School Profile Management"
        subtitle="Create and manage your school’s public profile on the Maple School Network."
        phone={phone}
        right={
          <>
            <Btn label="View Public Profile" icon="eye" kind="outline" height={40} onPress={x.viewPublic} />
            <Btn label="Save Changes" kind="outline" height={40} onPress={x.save} />
            <Btn label="Publish Updates" icon="send" height={40} onPress={x.publish} style={s.publish} />
          </>
        }
      />
      <HubTabs items={x.p.tabs} icons={x.p.tabIcons} active={x.tab} onChange={x.setTab} phone={phone} />
      <Body x={x} phone={phone} />
    </>
  );
}

/** School Profile Management on the desktop. */
export function SchoolProfileDesk({ a }: { a: Admin }) {
  const x = useProfile(a);
  return (
    <AdminDesk me={a.me} search="Search for learners, classes, resources, or school network..." active="School Profile">
      <Page x={x} phone={false} />
    </AdminDesk>
  );
}

/** School Profile Management on phones. */
export function SchoolProfilePhone({ a }: { a: Admin }) {
  const x = useProfile(a);
  return (
    <AdminPhone me={a.me}>
      <Page x={x} phone />
    </AdminPhone>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  cols: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  left: { width: 230 },
  mid: { flex: 1, minWidth: 0 },
  right: { width: 420 },
  card: { gap: 14, padding: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  pct: { fontSize: 26, fontWeight: '800', color: NAVY },
  body: { fontSize: 13.5, lineHeight: 19, color: NAVY },
  small: { fontSize: 12.5, lineHeight: 17, color: BODY },
  label: { fontSize: 14, fontWeight: '500', color: NAVY },
  star: { color: '#DC2626' },
  big: { fontSize: 26, fontWeight: '800', color: NAVY },
  link: { fontSize: 14, fontWeight: '600', color: BLUE },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 26 },
  tip: { flexDirection: 'row', gap: 10, padding: 16, borderRadius: 14, backgroundColor: '#F1EDFE' },
  field: { gap: 6 },
  area: { borderRadius: 8, borderWidth: 1, borderColor: '#D5DCE7', backgroundColor: WHITE },
  areaError: { borderColor: '#DC2626' },
  areaInput: { minHeight: 110, padding: 12, fontSize: 14, lineHeight: 20, color: NAVY, textAlignVertical: 'top' },
  counter: { alignSelf: 'flex-end', padding: 8, fontSize: 12, color: BODY },
  over: { color: '#DC2626' },
  error: { fontSize: 12, color: '#DC2626' },
  divider: { height: 1, backgroundColor: LINE },
  mapCol: { flex: 1, gap: 6 },
  map: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, borderWidth: 1, borderColor: '#D5DCE7', backgroundColor: '#F7F8FF' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: '#D5DCE7', backgroundColor: WHITE },
  chipOn: { borderColor: PURPLE, backgroundColor: '#F1EDFE' },
  chipText: { fontSize: 13, color: NAVY },
  chipTextOn: { fontWeight: '600', color: PURPLE },
  gallery: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  galleryPhoto: { width: 140, height: 92, borderRadius: 10 },
  addPhoto: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#C9BFF4' },
  box: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 5, borderWidth: 1.5, borderColor: '#B6C0CF' },
  boxOn: { borderColor: BLUE, backgroundColor: BLUE },
  previewHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  device: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: LINE },
  deviceOn: { borderColor: BLUE, backgroundColor: '#EEF4FF' },
  preview: { overflow: 'hidden', padding: 0 },
  previewPhone: { alignSelf: 'center', width: 300 },
  previewPhoto: { width: '100%', height: 130 },
  verified: { position: 'absolute', top: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, backgroundColor: WHITE },
  verifiedText: { fontSize: 11.5, fontWeight: '600', color: NAVY },
  crest: { position: 'absolute', left: 16, bottom: -30, width: 72, height: 68, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: WHITE, shadowColor: NAVY, shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  crestImg: { width: 52, height: 52 },
  previewBody: { gap: 10, padding: 16, paddingTop: 8 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 86 },
  previewName: { flexShrink: 1, fontSize: 17, fontWeight: '800', color: NAVY },
  previewTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  previewTab: { overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, fontSize: 13, color: NAVY, backgroundColor: '#F5F7FC' },
  previewTabOn: { color: BLUE, fontWeight: '600', backgroundColor: '#E8F0FF' },
  highlights: { flexDirection: 'row', gap: 8 },
  highlight: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: LINE },
  highlightText: { fontSize: 11.5, fontWeight: '600', color: NAVY, textAlign: 'center' },
  previewBtn: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  previewBtnGhost: { borderWidth: 1.5, borderColor: '#9DB4F2' },
  previewBtnBlue: { backgroundColor: BLUE },
  previewBtnText: { fontSize: 14, fontWeight: '600', color: WHITE },
  publish: { backgroundColor: PURPLE },
});
