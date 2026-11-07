import { Image } from '@/components/picture';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';

import { Bullets, cs, InstitutionPill, BRAND_SOFT, ProgramRow, BRAND_BLUE, Section, shortDate, Tag } from './CareerParts';
import { ProgramSheet } from './CareerSheets';
import { useDirectory } from './useDirectory';
import type { CC } from './useCompass';
import { Maple, Radii } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';
import { Palette } from '@/constants/palette';

type View_ = 'overview' | 'programs' | 'events';
const TABS: readonly { key: View_; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'programs', label: 'Programs' },
  { key: 'events', label: 'Open Days & Events' },
];

/** An institution's profile: who checked it and when, what it teaches (each program with its own accreditation), and its events. */
export function UniversityProfile({ cc, id, phone, start }: { cc: CC; id: string; phone: boolean; start?: string }) {
  const d = useDirectory(cc);
  const [tab, setTab] = useState<View_>(start === 'programs' ? 'programs' : 'overview');
  const u = d.uni(id);
  if (!u)
    return (
      <View style={s.empty}>
        <Text style={s.title}>Institution not found</Text>
        <Pressable onPress={() => router.replace('/universities' as Href)} accessibilityRole="link">
          <Text style={s.link}>Back to the directory</Text>
        </Pressable>
      </View>
    );
  const programs = d.programsOf(u.id);
  const events = d.events.filter((e) => e.host === u.name);
  const saved = d.saves.institutions.includes(u.id);
  const p = d.program;
  return (
    <View style={s.stack}>
      <Pressable style={s.back} onPress={() => (router.canGoBack() ? router.back() : router.replace('/universities' as Href))} accessibilityRole="link">
        <Icon name="arrowLeft" size={16} color={BRAND_BLUE} />
        <Text style={s.link}>Universities & Programs</Text>
      </Pressable>
      <View style={s.card}>
        <Image decorative source={u.photo} style={[s.photo, phone && s.photoP]} contentFit="cover" />
        <View style={[s.head, phone && s.headP]}>
          <View style={s.crestBox}>
            <Image decorative source={u.crest} style={s.crest} contentFit="contain" />
          </View>
          <View style={s.flex}>
            <View style={s.nameRow}>
              <Text style={[s.title, phone && s.titleP]} {...PAGE_TITLE}>
                {u.name}
              </Text>
              {u.verification.status === 'verified' ? <Icon name="verified" size={20} color={L.blue} /> : null}
            </View>
            <Text style={cs.small}>{`${u.type} · ${u.ownership} · ${u.town}, Uganda`}</Text>
            <View style={s.pills}>
              <InstitutionPill u={u} />
              <Tag text={`${programs.length} programs`} />
              <Tag text={`${u.students.toLocaleString('en-US')} students`} />
              <Tag text={`${u.faculties} faculties`} />
            </View>
          </View>
          <Pressable style={s.save} onPress={() => d.toggleInstitution(u.id)} accessibilityRole="button" accessibilityState={{ selected: saved }}>
            <Icon name={saved ? 'heartFill' : 'heart'} size={16} color={saved ? Palette.pink500b : BRAND_BLUE} />
            <Text style={s.saveText}>{saved ? 'Saved' : 'Save'}</Text>
          </Pressable>
        </View>
        <View style={s.tabs} accessibilityRole="tablist">
          {TABS.map((t) => (
            <Pressable key={t.key} style={s.tab} onPress={() => setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: tab === t.key }}>
              <Text style={[s.tabText, tab === t.key && s.tabOn]}>{t.key === 'programs' ? `Programs (${programs.length})` : t.label}</Text>
              {tab === t.key ? <View style={s.tabLine} /> : null}
            </Pressable>
          ))}
        </View>
        <View style={s.body}>
          {tab === 'overview' ? (
            <View style={[s.cols, phone && s.colsP]}>
              <View style={[s.stack, !phone && s.flex]}>
                <Section title="About">
                  <Text style={cs.body}>{u.about}</Text>
                </Section>
                <Section title="Campuses">
                  <Bullets items={u.campuses} />
                </Section>
                <Section title="Facilities">
                  <Bullets items={u.facilities} />
                </Section>
              </View>
              <View style={[s.verify, !phone && s.verifyD]}>
                <Text style={s.verifyTitle}>How Maple checked this institution</Text>
                <Text style={cs.small}>{`${u.verification.source}, checked ${shortDate(u.verification.on)}.`}</Text>
                <Text style={cs.small}>Each program’s accreditation is checked on its own. A verified institution doesn’t verify its programs.</Text>
                <Text style={cs.note}>Institutions never see who viewed or saved them. They only hear from you if you contact them yourself.</Text>
              </View>
            </View>
          ) : null}
          {tab === 'programs'
            ? programs.map((pr) => <ProgramRow key={pr.id} p={pr} status={d.status(pr)} fit={d.fit(pr)} saved={d.saves.programs.includes(pr.id)} onSave={() => d.toggleProgram(pr.id)} onOpen={() => d.openProgram(pr.id)} />)
            : null}
          {tab === 'events' ? (
            events.length ? (
              events.map((e) => (
                <View key={e.id} style={s.event}>
                  <Icon name="calendar" size={16} color={BRAND_BLUE} />
                  <View style={s.flex}>
                    <Text style={s.strong}>{e.title}</Text>
                    <Text style={cs.small}>{`${shortDate(e.date)} · ${e.time} · ${e.place}`}</Text>
                  </View>
                  {e.sponsored ? <Tag text="Sponsored" tone="amber" /> : null}
                </View>
              ))
            ) : (
              <Text style={cs.small}>No upcoming events listed.</Text>
            )
          ) : null}
        </View>
      </View>
      {p ? (
        <ProgramSheet p={p} u={u} status={d.status(p)} fit={d.fit(p)} scholarships={d.scholarshipsFor(p)} saved={d.saves.programs.includes(p.id)} onSave={() => d.toggleProgram(p.id)} onClose={() => d.openProgram(null)} />
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 14 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  link: { fontSize: 14, fontWeight: '600', color: BRAND_BLUE },
  card: { overflow: 'hidden', borderRadius: 18, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  photo: { width: '100%', height: 260 },
  photoP: { height: 160 },
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 20 },
  headP: { flexWrap: 'wrap', padding: 14 },
  crestBox: { width: 76, height: 76, marginTop: -46, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  crest: { width: 60, height: 60 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flexShrink: 1, fontSize: 26, fontWeight: '800', color: L.navy, letterSpacing: -0.4 },
  titleP: { fontSize: 20 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  save: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, borderRadius: Radii.control, borderWidth: 1.5, borderColor: Maple.blueLine },
  saveText: { fontSize: 13.5, fontWeight: '600', color: BRAND_BLUE },
  tabs: { flexDirection: 'row', gap: 4, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: L.line },
  tab: { height: 44, justifyContent: 'center', paddingHorizontal: 12 },
  tabText: { fontSize: 14, fontWeight: '500', color: L.ink },
  tabOn: { fontWeight: '700', color: BRAND_BLUE },
  tabLine: { position: 'absolute', left: 6, right: 6, bottom: -1, height: 3, borderRadius: 2, backgroundColor: BRAND_BLUE },
  body: { gap: 6, padding: 20 },
  cols: { flexDirection: 'row', gap: 24 },
  colsP: { flexDirection: 'column' },
  verify: { gap: 8, padding: 16, borderRadius: 14, backgroundColor: BRAND_SOFT },
  verifyD: { width: 360 },
  verifyTitle: { fontSize: 15, fontWeight: '700', color: L.navy },
  event: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  strong: { fontSize: 14, fontWeight: '700', color: L.navy },
  empty: { alignItems: 'center', gap: 10, padding: 40 },
});
