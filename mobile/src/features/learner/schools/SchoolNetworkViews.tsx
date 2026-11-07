import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { L, LightFrame } from '@/features/learner/frame/LightFrame';
import { Picker } from '@/features/learner/lessons/LessonParts';
import type { IconName } from '@/lib/icons';

import type { Category, ListTab, SchoolSort } from './schoolNetwork';
import { ExamsTab, InstitutionsTab, JourneyCard, LinkCard, PricingCard, RecsTab, VacanciesTab } from './SchoolPanels';
import { BRAND_SOFT, PrefsSheet, ProfileSheet, BRAND_BLUE, SchoolCardView } from './SchoolParts';
import { type Net, type NetActions, type NetTab, type SN, useSchoolNetwork } from './useSchoolNetwork';
import { Maple, Radii } from '@/constants/maple';
import { PAGE_TITLE } from '@/lib/fonts/type';

const TABS: readonly { key: NetTab; label: string; icon: IconName }[] = [
  { key: 'discover', label: 'Discover Schools', icon: 'building' },
  { key: 'recs', label: 'Recommendations', icon: 'sparkle' },
  { key: 'exams', label: 'Exam Centres', icon: 'trophy' },
  { key: 'vacancies', label: 'Teaching Vacancies', icon: 'briefcase' },
  { key: 'institutions', label: 'For Institutions', icon: 'layers' },
];
const CATEGORIES: readonly { key: Category; label: string; icon: IconName; color?: string }[] = [
  { key: 'all', label: 'All Schools', icon: 'cap' },
  { key: 'near', label: 'Near Me', icon: 'pin' },
  { key: 'top', label: 'Top Performing', icon: 'chart' },
  { key: 'online', label: 'Online Schools', icon: 'screen' },
  { key: 'boarding', label: 'Boarding Schools', icon: 'building' },
  { key: 'scholarships', label: 'Scholarships', icon: 'award', color: Maple.warning },
];
const LISTS: readonly { key: ListTab; label: string }[] = [
  { key: 'recommended', label: 'Recommended for You' },
  { key: 'popular', label: 'Popular Schools' },
  { key: 'recent', label: 'Recently Added' },
];
const SORTS: readonly { value: SchoolSort; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'rating', label: 'Rating' },
  { value: 'distance', label: 'Distance' },
  { value: 'passRate', label: 'Pass rate' },
];
const any = (label: string, values: readonly string[]) => [{ value: 'all', label }, ...values.map((v) => ({ value: v, label: v }))];

function Tabs({ x, phone = false }: { x: SN; phone?: boolean }) {
  const row = (
    <View style={[s.tabs, phone && s.tabsP]} accessibilityRole="tablist">
      {TABS.map((t) => {
        const on = x.tab === t.key;
        return (
          <Pressable key={t.key} style={[s.tab, phone && s.tabP]} onPress={() => x.setTab(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
            <Icon name={t.icon} size={phone ? 16 : 19} color={on ? L.blue : L.ink} />
            <Text style={[s.tabText, phone && s.tabTextP, on && s.tabOn]}>{t.label}</Text>
            {on ? <View style={s.tabLine} /> : null}
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
    <View style={s.tabsCard}>{row}</View>
  );
}

function SearchBox({ x }: { x: SN }) {
  return (
    <View style={s.searchBox}>
      <Icon name="search" size={19} color={L.body} />
      <TextInput
        style={s.searchInput}
        value={x.draft}
        onChangeText={x.setDraft}
        onSubmitEditing={x.search}
        returnKeyType="search"
        placeholder="Search by school name, program, curriculum, or location..."
        placeholderTextColor={L.body}
        accessibilityLabel="Search schools"
      />
    </View>
  );
}

function FilterRow({ x }: { x: SN }) {
  return (
    <View style={s.filterRow}>
      <Picker compact label="Location" icon="pin" value={x.district} options={any('Location', x.net.districts)} onChange={x.setDistrict} />
      <Picker compact label="Curriculum" icon="layers" value={x.curriculum} options={any('Curriculum', x.net.curricula)} onChange={x.setCurriculum} />
      <Picker compact label="Level" icon="cap" value={x.level} options={any('Level', x.net.levels)} onChange={x.setLevel} />
      <Pressable style={s.more} onPress={() => x.setFilters(true)} accessibilityRole="button">
        <Icon name="filter" size={16} color={L.ink} />
        <Text style={s.moreText}>More Filters</Text>
      </Pressable>
      <Pressable style={s.searchBtn} onPress={x.search} accessibilityRole="button">
        <Text style={s.searchBtnText}>Search</Text>
      </Pressable>
    </View>
  );
}

function Banner({ x, phone = false }: { x: SN; phone?: boolean }) {
  return (
    <View style={[s.banner, phone && s.bannerP]}>
      <LinearGradient colors={[Maple.blue, Maple.blue, Maple.blueLine]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={phone ? undefined : s.bannerText}>
        <Text style={[s.bannerTitle, phone && s.bannerTitleP]}>{'Find the Right School\nFor Your Learning Journey'}</Text>
        <Text style={s.bannerSub}>Explore Maple-powered schools, compare them and apply with confidence.</Text>
      </View>
      <View style={s.bannerForm}>
        <SearchBox x={x} />
        <FilterRow x={x} />
      </View>
    </View>
  );
}

function Categories({ x, phone = false }: { x: SN; phone?: boolean }) {
  const row = (
    <View style={s.cats}>
      {CATEGORIES.map((c) => {
        const on = x.category === c.key;
        return (
          <Pressable key={c.key} style={[s.cat, phone ? s.catP : s.catD, on && s.catOn]} onPress={() => x.setCategory(c.key)} accessibilityRole="button" accessibilityState={{ selected: on }}>
            <Icon name={c.icon} size={24} color={c.color ?? BRAND_BLUE} />
            <Text style={s.catTitle}>{c.label}</Text>
            <Text style={s.catCount}>{`${x.net.categoryCounts[c.key]} schools`}</Text>
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

function ListBar({ x, phone = false }: { x: SN; phone?: boolean }) {
  return (
    <View style={[s.listBar, phone && s.listBarP]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.listTabs}>
        {LISTS.map((t) => {
          const on = x.list === t.key;
          return (
            <Pressable key={t.key} style={s.listTab} onPress={() => x.setList(t.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[s.listText, on && s.listOn]}>{t.label}</Text>
              {on ? <View style={s.tabLine} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
      <Picker label="Sort" icon="sync" value={x.sort} options={SORTS} onChange={x.setSort} width={phone ? undefined : 200} />
    </View>
  );
}

function Grid({ x, phone = false }: { x: SN; phone?: boolean }) {
  if (!x.shown.length) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyTitle}>No schools match yet</Text>
        <Text style={s.small}>Try another filter or category, or browse all schools.</Text>
        <Pressable style={s.outline} onPress={() => x.setCategory('all')} accessibilityRole="button">
          <Text style={s.outlineText}>Show all schools</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View style={[s.grid, phone && s.gridP]}>
      {x.shown.map((c) => (
        <SchoolCardView key={c.id} c={c} phone={phone} saved={x.isSaved(c.id)} reason={x.reasonFor(c)} onSave={() => x.toggleSave(c.id)} onView={() => x.setProfile(c.id)} onApply={() => x.apply(c.id)} />
      ))}
    </View>
  );
}

/** From discovery to enrolment: the steps, and where this learner's own application stands. */
function Funnel({ x, phone = false }: { x: SN; phone?: boolean }) {
  const app = x.application;
  const school = x.applicationSchool;
  return (
    <View style={[s.funnel, phone && s.funnelP]}>
      <View style={s.flex}>
        <Text style={s.cardTitle}>From Discovery to Enrolment</Text>
        <Text style={s.small}>Your journey, step by step. Schools see only totals for each step.</Text>
        <View style={[s.steps, phone && s.stepsP]}>
          {x.net.funnel.map((f, i) => (
            <View key={f.title} style={s.stepWrap}>
              {i > 0 && !phone ? <Icon name="chevronRight" size={16} color={L.muted} /> : null}
              <View style={s.step}>
                <View style={[s.stepIcon, i === x.net.funnel.length - 1 && s.stepDone]}>
                  <Icon name={f.icon} size={20} color={i === x.net.funnel.length - 1 ? L.green : BRAND_BLUE} />
                </View>
                <Text style={s.stepTitle}>{f.title}</Text>
                <Text style={s.small}>{f.sub}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      <View style={[s.mine, phone ? s.mineP : s.mineD]}>
        <View style={s.mineHead}>
          <Text style={s.mineTitle}>Your Progress</Text>
          <Icon name="info" size={14} color={L.muted} />
        </View>
        {app && school ? (
          <>
            <View style={s.mineRow}>
              <Text style={s.small} numberOfLines={1}>
                {app.submitted ? `Submitted to ${school.name}` : `Application to ${school.name}`}
              </Text>
              <Text style={s.minePct}>{`${app.pct}%`}</Text>
            </View>
            <View style={s.bar}>
              <View style={[s.barFill, { width: `${app.pct}%` }]} />
            </View>
            <Pressable style={s.continue} onPress={() => x.apply(school.id)} accessibilityRole="button">
              <Text style={s.outlineText}>{app.submitted ? 'View Application' : 'Continue Application'}</Text>
              <Icon name="arrowRight" size={15} color={BRAND_BLUE} />
            </Pressable>
          </>
        ) : (
          <Text style={s.small}>No application yet. Choose a school and tap Apply Now.</Text>
        )}
      </View>
    </View>
  );
}

function Body({ x, phone }: { x: SN; phone: boolean }) {
  if (x.tab === 'recs') return <RecsTab x={x} />;
  if (x.tab === 'exams') return <ExamsTab x={x} />;
  if (x.tab === 'vacancies') return <VacanciesTab x={x} />;
  if (x.tab === 'institutions') return <InstitutionsTab x={x} phone={phone} />;
  return (
    <View style={s.stack}>
      <Banner x={x} phone={phone} />
      <Categories x={x} phone={phone} />
      <ListBar x={x} phone={phone} />
      <Grid x={x} phone={phone} />
      <Funnel x={x} phone={phone} />
    </View>
  );
}

function Side({ x, phone = false }: { x: SN; phone?: boolean }) {
  return (
    <View style={s.stack}>
      <JourneyCard net={x.net} />
      <LinkCard title="Find Exam Centres" sub="Register for national or international examinations at approved centres." icon="trophy" tone="green" onPress={() => x.setTab('exams')} />
      <LinkCard title="Teaching Vacancies" sub="Explore teaching opportunities at Maple-powered schools." icon="briefcase" tone="purple" onPress={() => x.setTab('vacancies')} />
      {x.tab === 'institutions' ? null : <PricingCard net={x.net} phone={phone} onCompare={() => x.setTab('institutions')} />}
    </View>
  );
}

function Sheets({ x }: { x: SN }) {
  const p = x.profile;
  return (
    <>
      {p ? <ProfileSheet c={p} saved={x.isSaved(p.id)} onSave={() => x.toggleSave(p.id)} onApply={() => x.apply(p.id)} onClose={() => x.setProfile(null)} /> : null}
      {x.filters ? <PrefsSheet prefs={x.prefs} onChange={x.setPrefs} onClear={x.clearPrefs} onClose={() => x.setFilters(false)} /> : null}
    </>
  );
}

interface Props {
  net: Net;
  avatar?: number;
  /** A school whose profile opens straight away (from the form's back link). */
  profile?: string;
  /** Real builds pass the API actions; design builds keep everything on the page. */
  actions?: NetActions;
}

/** School Network on wide screens: the reference, in the light learner frame. */
export function SchoolNetworkDesk({ net, avatar, profile, actions }: Props) {
  const x = useSchoolNetwork(net, profile, actions);
  return (
    <LightFrame>
      {net.hero ? (
        <View style={s.heroPhoto} pointerEvents="none">
          <Image decorative source={net.hero} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient colors={[L.canvas, 'rgba(246,248,253,0)']} start={{ x: 0, y: 0.5 }} end={{ x: 0.3, y: 0.5 }} style={StyleSheet.absoluteFill} />
        </View>
      ) : null}
      <View style={s.head}>
        <View style={s.headIcon}>
          <Icon name="building" size={28} color={BRAND_BLUE} />
        </View>
        <View>
          <Text style={s.title} {...PAGE_TITLE}>
            {net.title}
          </Text>
          <Text style={s.sub}>{net.sub}</Text>
        </View>
      </View>
      <Tabs x={x} />
      <View style={s.cols}>
        <View style={s.left}>
          <Body x={x} phone={false} />
        </View>
        <View style={s.right}>
          <Side x={x} />
        </View>
      </View>
      <Sheets x={x} />
    </LightFrame>
  );
}

/** School Network on phones: the same page, stacked. */
export function SchoolNetworkPhone({ net, avatar, profile, actions }: Props) {
  const x = useSchoolNetwork(net, profile, actions);
  return (
    <View style={s.phoneRoot}>
      <LearnerPhoneTop avatar={avatar} />
      <ScrollView contentContainerStyle={s.phone}>
        <View style={s.headP}>
          <View style={[s.headIcon, s.headIconP]}>
            <Icon name="building" size={22} color={BRAND_BLUE} />
          </View>
          <View style={s.flex}>
            <Text style={s.titleP} {...PAGE_TITLE}>
              {net.title}
            </Text>
            <Text style={s.small}>Verified schools, exam centres and teaching vacancies.</Text>
          </View>
        </View>
        <Tabs x={x} phone />
        <Body x={x} phone />
        <Side x={x} phone />
      </ScrollView>
      <Sheets x={x} />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  small: { fontSize: 12.5, lineHeight: 17, color: L.body },
  heroPhoto: { position: 'absolute', top: -20, right: -16, width: 470, height: 138, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16, height: 70 },
  headIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: BRAND_SOFT },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: L.navy },
  sub: { marginTop: 2, fontSize: 15, color: L.ink },
  tabsCard: { alignSelf: 'flex-start', marginTop: 4, borderRadius: 12, backgroundColor: L.white, shadowColor: Maple.navyDeep, shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  tabs: { flexDirection: 'row', paddingHorizontal: 8 },
  tabsP: { paddingHorizontal: 0 },
  tab: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 16 },
  tabP: { height: 42, paddingHorizontal: 10 },
  tabText: { fontSize: 14.5, fontWeight: '500', color: L.ink },
  tabTextP: { fontSize: 13 },
  tabOn: { fontWeight: '700', color: L.blue },
  tabLine: { position: 'absolute', left: 6, right: 6, bottom: 0, height: 3, borderRadius: 2, backgroundColor: L.blue },
  cols: { flexDirection: 'row', gap: 22, marginTop: 16, alignItems: 'flex-start' },
  left: { width: 920 },
  right: { flex: 1 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 20, minHeight: 134, paddingHorizontal: 26, paddingVertical: 20, overflow: 'hidden', borderRadius: 16 },
  bannerP: { flexDirection: 'column', alignItems: 'stretch', gap: 14, padding: 18 },
  bannerText: { width: 268 },
  bannerTitle: { fontSize: 21.5, lineHeight: 27, fontWeight: '800', color: L.white },
  bannerTitleP: { fontSize: 20, lineHeight: 25 },
  bannerSub: { marginTop: 6, fontSize: 13.5, lineHeight: 18, color: Maple.blueSoft },
  bannerForm: { flex: 1, gap: 12 },
  searchBox: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 21, backgroundColor: L.white },
  searchInput: { flex: 1, height: 40, fontSize: 13.5, color: L.ink },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  more: { height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: L.white },
  moreText: { fontSize: 13, color: L.ink },
  searchBtn: { height: 38, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.control, borderWidth: 2, borderColor: L.white, backgroundColor: BRAND_BLUE },
  searchBtnText: { fontSize: 14, fontWeight: '600', color: L.white },
  cats: { flexDirection: 'row', gap: 10 },
  cat: { height: 84, alignItems: 'center', justifyContent: 'center', gap: 3, borderRadius: 12, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  catD: { flex: 1 },
  catP: { width: 118 },
  catOn: { borderColor: L.blue, backgroundColor: L.soft },
  catTitle: { fontSize: 13.5, fontWeight: '600', color: L.navy },
  catCount: { fontSize: 12, color: L.body },
  listBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  listBarP: { flexDirection: 'column', alignItems: 'stretch', paddingVertical: 8 },
  listTabs: { gap: 6 },
  listTab: { height: 46, justifyContent: 'center', paddingHorizontal: 10 },
  listText: { fontSize: 14.5, fontWeight: '500', color: L.ink },
  listOn: { fontWeight: '700', color: L.blue },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  gridP: { flexDirection: 'column' },
  empty: { alignItems: 'center', gap: 8, padding: 28, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: L.navy },
  outline: { paddingHorizontal: 14, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1.5, borderColor: BRAND_BLUE },
  outlineText: { fontSize: 13, fontWeight: '600', color: BRAND_BLUE },
  funnel: { flexDirection: 'row', gap: 22, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  funnelP: { flexDirection: 'column' },
  cardTitle: { fontSize: 18.5, fontWeight: '700', color: L.navy },
  steps: { flexDirection: 'row', marginTop: 14 },
  stepsP: { flexWrap: 'wrap', rowGap: 12 },
  stepWrap: { flex: 1, minWidth: 96, flexDirection: 'row', alignItems: 'center' },
  step: { flex: 1, alignItems: 'center', gap: 3 },
  stepIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: BRAND_SOFT },
  stepDone: { backgroundColor: Maple.successSoft },
  stepTitle: { fontSize: 12.5, fontWeight: '600', color: L.navy, textAlign: 'center' },
  mine: { gap: 10, justifyContent: 'center' },
  mineD: { width: 250, paddingLeft: 22, borderLeftWidth: 1, borderLeftColor: L.line },
  mineP: { paddingTop: 14, borderTopWidth: 1, borderTopColor: L.line },
  mineHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  mineTitle: { fontSize: 14.5, fontWeight: '700', color: L.navy },
  mineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  minePct: { fontSize: 13, fontWeight: '700', color: L.navy },
  bar: { height: 6, borderRadius: 3, backgroundColor: Maple.blueSelected },
  barFill: { height: 6, borderRadius: 3, backgroundColor: L.blue },
  continue: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radii.control, borderWidth: 1.5, borderColor: BRAND_BLUE },
  phoneRoot: { flex: 1, backgroundColor: L.canvas },
  phone: { gap: 16, padding: 16, paddingBottom: 110 },
  headP: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headIconP: { width: 46, height: 46 },
  titleP: { fontSize: 24, lineHeight: 30, fontWeight: '800', color: L.navy },
});
