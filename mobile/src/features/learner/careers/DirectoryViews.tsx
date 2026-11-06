import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { Picker } from '@/features/learner/lessons/LessonParts';
import type { University } from '@/mock/career-compass';

import { cs, BRAND_SOFT, ProgramRow, BRAND_BLUE, Tag } from './CareerParts';
import { ProgramSheet } from './CareerSheets';
import { type DirSort, FEE_HIGH, FEE_LOW, INSTITUTION_TYPES, STUDY_LEVELS } from './directory';
import { type Dir, useDirectory } from './useDirectory';
import type { CC } from './useCompass';
import { Maple, Radii } from '@/constants/maple';

const CHECKS = ['Verified Institutions', 'Accredited Programs', 'Entry Requirements', 'Scholarships', 'Open Days & Events'];
const LEVEL_INFO: Readonly<Record<string, { sub: string; icon: 'people' | 'building' | 'doc' | 'award'; tint: string }>> = {
  Undergraduate: { sub: 'Bachelor’s degrees and equivalent', icon: 'people', tint: Maple.blueSoft },
  Postgraduate: { sub: 'Master’s and other advanced degrees', icon: 'building', tint: Maple.blueSelected },
  'Diploma & Certificate': { sub: 'Professional and short-cycle programs', icon: 'doc', tint: Maple.successSoft },
  'Vocational & Technical': { sub: 'Skills-based and industry-focused training', icon: 'award', tint: Maple.warningSoft },
};
const SORTS: readonly { value: DirSort; label: string }[] = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'programs', label: 'Most Programs' },
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const any = (label: string, values: readonly string[]) => [{ value: 'all', label }, ...values.map((v) => ({ value: v, label: v }))];
const million = (n: number) => `${n / 1_000_000}M`;
const profileHref = (id: string, programs = false) => (programs ? `/universities/${id}?view=programs` : `/universities/${id}`) as Href;

function Hero({ phone, photo }: { phone: boolean; photo: number }) {
  return (
    <View style={[s.hero, phone && s.heroP]}>
      <LinearGradient colors={[Maple.blueSoft, Maple.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {!phone ? (
        <View style={s.heroPhoto} pointerEvents="none">
          <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={[Maple.blueSoft, 'rgba(247,244,255,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 0.5, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </View>
      ) : null}
      <View style={[s.heroHead, !phone && s.heroHeadD]}>
        <LinearGradient colors={[Maple.blue, Maple.blue]} style={[s.heroIcon, phone && s.heroIconP]}>
          <Icon name="building" size={phone ? 22 : 30} color={L.white} />
        </LinearGradient>
        <View style={s.flex}>
          <Text style={[s.heroTitle, phone && s.heroTitleP]} accessibilityRole="header">
            Universities & Programs Directory
          </Text>
          <Text style={[s.heroSub, phone && s.heroSubP]}>Explore verified universities, colleges and vocational institutions, and discover programs that match your interests and goals.</Text>
        </View>
      </View>
      <View style={[s.checks, !phone && s.checksD]}>
        {CHECKS.map((c) => (
          <View key={c} style={s.check}>
            <Icon name="sealCheck" size={15} color={Maple.successText} />
            <Text style={s.checkText}>{c}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function SearchRow({ d }: { d: Dir }) {
  return (
    <View style={s.search}>
      <Icon name="search" size={18} color={L.body} />
      <TextInput
        style={s.searchInput}
        value={d.draft}
        onChangeText={d.setDraft}
        onSubmitEditing={d.search}
        returnKeyType="search"
        placeholder="Search universities or programs (e.g. Nursing, Computer Science, Gulu)..."
        placeholderTextColor={L.body}
        accessibilityLabel="Search universities or programs"
      />
      <Pressable style={s.searchBtn} onPress={d.search} accessibilityRole="button">
        <Text style={s.searchBtnText}>Search</Text>
      </Pressable>
    </View>
  );
}

function Filters({ d, phone }: { d: Dir; phone: boolean }) {
  const f = d.filters;
  const row = (
    <View style={[s.filters, phone && s.filtersP]}>
      <Picker compact label="Study Level" icon="cap" value={f.level} options={any('Study Level', STUDY_LEVELS)} onChange={(v) => d.set({ level: v })} />
      <Picker compact label="Study Area" icon="grid" value={f.area} options={any('Study Area', d.areas)} onChange={(v) => d.set({ area: v })} />
      <Picker compact label="Location" icon="pin" value={f.town} options={any('Location', d.towns)} onChange={(v) => d.set({ town: v })} />
      <Picker compact label="Study Mode" icon="screen" value={f.mode} options={any('Study Mode', ['Full-time', 'Part-time', 'Blended'])} onChange={(v) => d.set({ mode: v })} />
      <Picker
        compact
        label="Fees"
        icon="wallet"
        value={f.fees}
        options={[
          { value: 'all', label: 'Fees (a semester)' },
          { value: 'low', label: `Under UGX ${million(FEE_LOW)}` },
          { value: 'mid', label: `UGX ${million(FEE_LOW)}–${million(FEE_HIGH)}` },
          { value: 'high', label: `Over UGX ${million(FEE_HIGH)}` },
        ]}
        onChange={(v) => d.set({ fees: v })}
      />
      <Picker
        compact
        label="Accreditation"
        icon="shield"
        value={f.accreditation}
        options={[
          { value: 'all', label: 'Accreditation' },
          { value: 'verified', label: 'Accredited' },
          { value: 'review-due', label: 'Check due for review' },
          { value: 'unverified', label: 'Not yet verified' },
        ]}
        onChange={(v) => d.set({ accreditation: v })}
      />
    </View>
  );
  return (
    <View style={s.stackSm}>
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {row}
        </ScrollView>
      ) : (
        row
      )}
      <Pressable style={s.clearAll} onPress={d.clear} accessibilityRole="button">
        <Text style={s.clearText}>Clear All</Text>
      </Pressable>
    </View>
  );
}

function TypeTabs({ d, phone }: { d: Dir; phone: boolean }) {
  const row = (
    <View style={s.types} accessibilityRole="tablist">
      {INSTITUTION_TYPES.map((t) => {
        const on = d.filters.type === t.type;
        return (
          <Pressable key={t.type} style={[s.typeTab, phone && s.typeTabP]} onPress={() => d.set({ type: t.type })} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={t.icon} size={phone ? 16 : 20} color={on ? BRAND_BLUE : L.ink} />
            <Text style={[s.typeText, phone && s.typeTextP, on && s.typeOn]}>{`${t.plural} (${d.counts[t.type] ?? 0})`}</Text>
            {on ? <View style={s.typeLine} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
  return phone ? (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {row}
    </ScrollView>
  ) : (
    row
  );
}

function Stat({ icon, value, label }: { icon: 'person' | 'people' | 'cap'; value: string; label: string }) {
  return (
    <View style={s.stat}>
      <Icon name={icon} size={17} color={L.ink} />
      <View>
        <Text style={s.statValue}>{value}</Text>
        <Text style={s.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function InstitutionCard({ u, d, phone }: { u: University; d: Dir; phone: boolean }) {
  const saved = d.saves.institutions.includes(u.id);
  return (
    <View style={[s.card, phone ? s.cardP : s.cardD]}>
      <Image source={u.photo} style={s.cardPhoto} contentFit="cover" />
      <Pressable style={s.heart} onPress={() => d.toggleInstitution(u.id)} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: saved }} accessibilityLabel={saved ? `Remove ${u.name} from saved` : `Save ${u.name}`}>
        <Icon name={saved ? 'heartFill' : 'heart'} size={17} color={saved ? '#E5487F' : BRAND_BLUE} />
      </Pressable>
      <View style={s.crestBox}>
        <Image source={u.crest} style={s.crest} contentFit="contain" />
      </View>
      <View style={s.cardBody}>
        <View style={s.nameRow}>
          <Text style={s.name} numberOfLines={2}>
            {u.name}
          </Text>
          {u.verification.status === 'verified' ? <Icon name="verified" size={16} color={L.blue} /> : null}
        </View>
        <View style={s.place}>
          <Icon name="pin" size={13} color={L.body} />
          <Text style={cs.small}>{`${u.town}, Uganda · ${u.ownership}`}</Text>
        </View>
        {u.verification.status !== 'verified' ? <Tag text="Verification pending" tone="amber" /> : null}
        <Text style={[cs.small, s.about]} numberOfLines={2}>
          {u.about}
        </Text>
        <View style={s.stats}>
          <Stat icon="person" value={String(d.programCount(u.id))} label="Programs" />
          <Stat icon="people" value={u.students.toLocaleString('en-US')} label="Students" />
          <Stat icon="cap" value={String(u.faculties)} label="Faculties" />
        </View>
        <View style={s.btns}>
          <Pressable style={s.solid} onPress={() => router.push(profileHref(u.id, true))} accessibilityRole="link">
            <Text style={s.solidText}>View Programs</Text>
            <Icon name="arrowRight" size={13} color={L.white} />
          </Pressable>
          <Pressable style={s.outline} onPress={() => router.push(profileHref(u.id))} accessibilityRole="link">
            <Text style={s.outlineText}>View Profile</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function Pager({ d }: { d: Dir }) {
  const p = d.pageInfo;
  const plural = INSTITUTION_TYPES.find((t) => t.type === d.filters.type)?.plural.toLowerCase() ?? 'institutions';
  return (
    <View style={s.pager}>
      <Text style={cs.small}>{`Showing ${p.from} – ${p.to} of ${p.total} ${plural}`}</Text>
      {p.pages > 1 ? (
        <View style={s.pages}>
          <Pressable style={s.pageBtn} onPress={() => d.setPage(p.page - 1)} disabled={p.page === 1} accessibilityRole="button" accessibilityLabel="Previous page">
            <Icon name="chevronLeft" size={16} color={L.ink} />
          </Pressable>
          {Array.from({ length: p.pages }, (_, i) => i + 1).map((n) => (
            <Pressable key={n} style={[s.pageBtn, n === p.page && s.pageOn]} onPress={() => d.setPage(n)} accessibilityRole="button" accessibilityState={{ selected: n === p.page }} accessibilityLabel={`Page ${n}`}>
              <Text style={[s.pageText, n === p.page && s.pageTextOn]}>{n}</Text>
            </Pressable>
          ))}
          <Pressable style={s.pageBtn} onPress={() => d.setPage(p.page + 1)} disabled={p.page === p.pages} accessibilityRole="button" accessibilityLabel="Next page">
            <Icon name="chevronRight" size={16} color={L.ink} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Side({ d, onCareerPaths }: { d: Dir; onCareerPaths: () => void }) {
  return (
    <View style={s.stack}>
      <View style={s.sideCard}>
        <View style={s.sideHead}>
          <Icon name="cap" size={26} color={BRAND_BLUE} />
          <View style={s.flex}>
            <Text style={s.sideTitle}>Explore Programs</Text>
            <Text style={cs.small}>Find the right program for your goals.</Text>
          </View>
        </View>
        {STUDY_LEVELS.map((lv) => {
          const info = LEVEL_INFO[lv];
          return (
            <Pressable key={lv} style={[s.level, d.filters.level === lv && s.levelOn]} onPress={() => d.set({ level: d.filters.level === lv ? 'all' : lv })} accessibilityRole="button" accessibilityState={{ selected: d.filters.level === lv }}>
              <View style={[s.levelIcon, { backgroundColor: info.tint }]}>
                <Icon name={info.icon} size={18} color={BRAND_BLUE} />
              </View>
              <View style={s.flex}>
                <Text style={s.levelTitle}>{`${lv} Programs`}</Text>
                <Text style={cs.small}>{`${info.sub} · ${d.levelCount(lv)}`}</Text>
              </View>
              <Icon name="chevronRight" size={15} color={L.ink} />
            </Pressable>
          );
        })}
      </View>
      <View style={s.unsure}>
        <LinearGradient colors={[Maple.blueSelected, Maple.blueSoft]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={s.sideHead}>
          <View style={s.compass}>
            <Icon name="map" size={22} color={L.white} />
          </View>
          <View style={s.flex}>
            <Text style={s.sideTitle}>Not sure what to study?</Text>
            <Text style={cs.small}>Explore careers, match your interests and get program suggestions.</Text>
          </View>
        </View>
        <Pressable style={s.unsureBtn} onPress={onCareerPaths} accessibilityRole="link">
          <Text style={s.unsureText}>Explore Career Paths</Text>
          <Icon name="arrowRight" size={14} color={BRAND_BLUE} />
        </Pressable>
      </View>
      <View style={s.sideCard}>
        <View style={s.sideHead}>
          <Icon name="calendar" size={22} color={BRAND_BLUE} />
          <Text style={[s.sideTitle, s.flex]}>Upcoming University Events</Text>
        </View>
        {d.events.slice(0, 4).map((e) => {
          const [, m, day] = e.date.split('-').map(Number);
          return (
            <View key={e.id} style={s.event}>
              <View style={s.date}>
                <Text style={s.dateMonth}>{MONTHS[m - 1]}</Text>
                <Text style={s.dateDay}>{day}</Text>
              </View>
              <View style={s.flex}>
                <Text style={s.levelTitle}>{e.title}</Text>
                <Text style={cs.small}>{`${e.time} · ${e.place}`}</Text>
                {e.sponsored ? <Tag text="Sponsored" tone="amber" /> : null}
              </View>
            </View>
          );
        })}
      </View>
      <Text style={cs.note}>The directory is free for everyone. Institutions can’t pay to change this order, and they never see who viewed or saved them.</Text>
    </View>
  );
}

function Results({ d, phone }: { d: Dir; phone: boolean }) {
  const plural = INSTITUTION_TYPES.find((t) => t.type === d.filters.type)?.plural ?? 'Institutions';
  return (
    <View style={s.stack}>
      <View style={[s.listHead, phone && s.listHeadP]}>
        <Text style={s.count}>{`${d.pageInfo.total} ${plural}`}</Text>
        <View style={s.sortRow}>
          <Text style={cs.small}>Sort by:</Text>
          <Picker compact label="Sort by" icon="filter" value={d.sort} options={SORTS} onChange={d.setSort} />
        </View>
      </View>
      {d.pageInfo.items.length ? (
        <View style={s.grid}>
          {d.pageInfo.items.map((u) => (
            <InstitutionCard key={u.id} u={u} d={d} phone={phone} />
          ))}
        </View>
      ) : (
        <View style={s.empty}>
          <Text style={s.sideTitle}>{`No ${plural.toLowerCase()} match`}</Text>
          <Text style={cs.small}>Try another search or clear the filters.</Text>
        </View>
      )}
      <Pager d={d} />
      {d.matchingPrograms.length ? (
        <View style={s.sideCard}>
          <Text style={s.sideTitle}>{`${d.matchingPrograms.length} matching programs`}</Text>
          {d.matchingPrograms.map((p) => (
            <ProgramRow key={p.id} p={p} u={d.uni(p.universityId)} status={d.status(p)} fit={d.fit(p)} saved={d.saves.programs.includes(p.id)} onSave={() => d.toggleProgram(p.id)} onOpen={() => d.openProgram(p.id)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

/** The University & Programs Directory (its reference): free for everyone, in Career Compass and on its public page. */
export function DirectoryView({ cc, phone, onCareerPaths }: { cc: CC; phone: boolean; onCareerPaths: () => void }) {
  const d = useDirectory(cc);
  const p = d.program;
  const sheet = p ? (
    <ProgramSheet
      p={p}
      u={d.uni(p.universityId)}
      status={d.status(p)}
      fit={d.fit(p)}
      scholarships={d.scholarshipsFor(p)}
      saved={d.saves.programs.includes(p.id)}
      onSave={() => d.toggleProgram(p.id)}
      onUniversity={() => {
        d.openProgram(null);
        router.push(profileHref(p.universityId));
      }}
      onClose={() => d.openProgram(null)}
    />
  ) : null;
  const hero = <Hero phone={phone} photo={cc.photos.directoryHero} />;
  if (phone)
    return (
      <View style={s.stack}>
        {hero}
        <SearchRow d={d} />
        <Filters d={d} phone />
        <TypeTabs d={d} phone />
        <Results d={d} phone />
        <Side d={d} onCareerPaths={onCareerPaths} />
        {sheet}
      </View>
    );
  return (
    <View style={s.stack}>
      <View style={s.cols}>
        <View style={[s.flex, s.stack]}>
          {hero}
          <SearchRow d={d} />
          <Filters d={d} phone={false} />
          <TypeTabs d={d} phone={false} />
          <Results d={d} phone={false} />
        </View>
        <View style={s.side}>
          <Side d={d} onCareerPaths={onCareerPaths} />
        </View>
      </View>
      {sheet}
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  stackSm: { gap: 6 },
  cols: { flexDirection: 'row', gap: 22, alignItems: 'flex-start' },
  side: { width: 340 },
  hero: { overflow: 'hidden', gap: 14, padding: 22, borderRadius: 18, borderWidth: 1, borderColor: Maple.blueSelected },
  heroP: { padding: 16 },
  heroPhoto: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 380 },
  heroHead: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroHeadD: { width: 600 },
  heroIcon: { width: 64, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 16 },
  heroIconP: { width: 46, height: 46, borderRadius: 12 },
  heroTitle: { fontSize: 31, lineHeight: 37, fontWeight: '800', color: L.navy, letterSpacing: -0.6 },
  heroTitleP: { fontSize: 21, lineHeight: 26 },
  heroSub: { marginTop: 4, fontSize: 14.5, lineHeight: 20, color: L.ink },
  heroSubP: { fontSize: 13, lineHeight: 18 },
  checks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checksD: { width: 680 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  checkText: { fontSize: 12.5, fontWeight: '600', color: L.navy },
  search: { height: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 16, paddingRight: 5, borderRadius: 25, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  searchInput: { flex: 1, height: 46, fontSize: 14, color: L.ink },
  searchBtn: { height: 40, justifyContent: 'center', paddingHorizontal: 26, borderRadius: Radii.control, backgroundColor: BRAND_BLUE },
  searchBtnText: { fontSize: 14, fontWeight: '700', color: L.white },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filtersP: { flexWrap: 'nowrap' },
  clearAll: { alignSelf: 'flex-end' },
  clearText: { fontSize: 13, fontWeight: '600', color: L.blue },
  types: { flexDirection: 'row', gap: 6, borderBottomWidth: 1, borderBottomColor: L.line },
  typeTab: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14 },
  typeTabP: { height: 42, paddingHorizontal: 10 },
  typeText: { fontSize: 14.5, fontWeight: '500', color: L.ink },
  typeTextP: { fontSize: 13 },
  typeOn: { fontWeight: '700', color: BRAND_BLUE },
  typeLine: { position: 'absolute', left: 6, right: 6, bottom: -1, height: 3, borderRadius: 2, backgroundColor: BRAND_BLUE },
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  listHeadP: { flexWrap: 'wrap' },
  count: { fontSize: 22, fontWeight: '800', color: L.navy },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  card: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardD: { width: '31.8%' },
  cardP: { width: '100%' },
  cardPhoto: { width: '100%', height: 124 },
  heart: { position: 'absolute', top: 10, right: 10, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: L.white },
  crestBox: { position: 'absolute', top: 92, left: 14, width: 58, height: 58, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  crest: { width: 46, height: 46 },
  cardBody: { gap: 6, paddingHorizontal: 14, paddingTop: 34, paddingBottom: 14 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { flexShrink: 1, fontSize: 15.5, fontWeight: '800', color: L.navy },
  place: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  about: { minHeight: 34 },
  stats: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, paddingVertical: 6 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statValue: { fontSize: 13.5, fontWeight: '800', color: L.navy },
  statLabel: { fontSize: 11, color: L.body },
  btns: { flexDirection: 'row', gap: 8 },
  solid: { flex: 1, height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 18, backgroundColor: BRAND_BLUE },
  solidText: { fontSize: 12.5, fontWeight: '700', color: L.white },
  outline: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.control, borderWidth: 1.5, borderColor: Maple.blueLine },
  outlineText: { fontSize: 12.5, fontWeight: '700', color: BRAND_BLUE },
  pager: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  pages: { flexDirection: 'row', gap: 6 },
  pageBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  pageOn: { backgroundColor: BRAND_BLUE },
  pageText: { fontSize: 14, fontWeight: '600', color: L.ink },
  pageTextOn: { color: L.white },
  empty: { alignItems: 'center', gap: 6, padding: 26, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  sideCard: { gap: 10, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  sideHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sideTitle: { fontSize: 17, fontWeight: '800', color: L.navy },
  level: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: Maple.blueSelected },
  levelOn: { borderColor: BRAND_BLUE, backgroundColor: Maple.blueSoft },
  levelIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  levelTitle: { fontSize: 13.5, fontWeight: '700', color: L.navy },
  unsure: { overflow: 'hidden', gap: 14, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: Maple.blueSelected },
  compass: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: BRAND_BLUE },
  unsureBtn: { alignSelf: 'flex-start', height: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, borderRadius: Radii.control, backgroundColor: L.white },
  unsureText: { fontSize: 14, fontWeight: '700', color: BRAND_BLUE },
  event: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Maple.blueSelected },
  date: { width: 52, height: 54, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: BRAND_SOFT },
  dateMonth: { fontSize: 12, fontWeight: '600', color: L.navy },
  dateDay: { fontSize: 20, fontWeight: '800', color: L.navy },
});
