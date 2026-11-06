import { Image } from '@/components/picture';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { L } from '@/features/learner/frame/LightFrame';
import { Picker } from '@/features/learner/lessons/LessonParts';
import type { IconName } from '@/lib/icons';
import type { Career } from '@/mock/career-compass';

import type { CareerSort } from './careers';
import { Bullets, cs, BRAND_SOFT, BRAND_BLUE, Sheet } from './CareerParts';
import { CareerListRow, PathwayBanner } from './CompassCards';
import type { Compass } from './useCompass';
import { Maple, Radii } from '@/constants/maple';

const SORTS: readonly { value: CareerSort; label: string }[] = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'name', label: 'Name A–Z' },
];
const LEVELS = ['Degree', 'Diploma', 'Certificate', 'Vocational'];
const any = (label: string, values: readonly string[]) => [{ value: 'all', label }, ...values.map((v) => ({ value: v, label: v }))];
const orAll = (v?: string | null) => v ?? 'all';
const fromAll = (v: string) => (v === 'all' ? undefined : v);

function Search({ x }: { x: Compass }) {
  return (
    <View style={s.searchRow}>
      <View style={s.search}>
        <Icon name="search" size={18} color={L.body} />
        <TextInput
          style={s.searchInput}
          value={x.draft}
          onChangeText={x.setDraft}
          onSubmitEditing={x.search}
          placeholder="Search a career (e.g. Doctor, Software Developer, Teacher)..."
          placeholderTextColor={L.body}
          returnKeyType="search"
          accessibilityLabel="Search careers"
        />
      </View>
      <Pressable style={s.searchBtn} onPress={x.search} accessibilityRole="button">
        <Icon name="search" size={16} color={L.white} />
        <Text style={s.searchBtnText}>Search</Text>
      </Pressable>
    </View>
  );
}

function Filters({ x, phone }: { x: Compass; phone: boolean }) {
  const row = (
    <View style={[s.filters, phone && s.filtersP]}>
      <Picker compact label="Career Area" icon="layers" value={orAll(x.area)} options={[{ value: 'all', label: 'Career Area' }, ...x.cc.areas.map((a) => ({ value: a.id, label: a.label }))]} onChange={(v) => x.setArea(v === 'all' ? null : v)} />
      <Picker compact label="Education Level" icon="cap" value={orAll(x.picks.level)} options={any('Education Level', LEVELS)} onChange={(v) => x.pick({ level: fromAll(v) })} />
      <Picker compact label="Work Environment" icon="building" value={orAll(x.picks.environment)} options={any('Work Environment', x.environments)} onChange={(v) => x.pick({ environment: fromAll(v) })} />
      <Picker compact label="Skills" icon="bolt" value={orAll(x.picks.subject)} options={any('Skills', x.subjects)} onChange={(v) => x.pick({ subject: fromAll(v) })} />
      <Picker compact label="Industry" icon="briefcase" value={orAll(x.picks.field)} options={any('Industry', x.industries)} onChange={(v) => x.pick({ field: fromAll(v) })} />
    </View>
  );
  return (
    <View style={s.filterBar}>
      {phone ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {row}
        </ScrollView>
      ) : (
        row
      )}
      <Pressable onPress={x.clearExplorer} accessibilityRole="button">
        <Text style={s.clear}>Clear All</Text>
      </Pressable>
    </View>
  );
}

const count = (x: Compass, area: string | null) => x.cc.careers.filter((c) => !area || c.area === area).length;

function AreaList({ x }: { x: Compass }) {
  const rows: readonly { id: string | null; label: string; icon: IconName }[] = [{ id: null, label: 'All Careers', icon: 'grid' }, ...x.cc.areas];
  return (
    <View style={s.areaCard}>
      <Text style={s.cardTitle}>Browse by Career Area</Text>
      {rows.map((a) => {
        const on = x.area === a.id;
        return (
          <Pressable key={a.label} style={[s.areaRow, on && s.areaOn]} onPress={() => x.setArea(a.id)} accessibilityRole="button" accessibilityState={{ selected: on }}>
            <Icon name={a.icon} size={17} color={BRAND_BLUE} />
            <Text style={[s.areaText, on && s.areaTextOn]}>{a.label}</Text>
            <Text style={[s.areaCount, on && s.areaCountOn]}>{count(x, a.id)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AreaTiles({ x }: { x: Compass }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tiles}>
      {x.cc.areas.map((a) => {
        const on = x.area === a.id;
        return (
          <Pressable key={a.id} style={[s.tile, on && s.tileOn]} onPress={() => x.setArea(on ? null : a.id)} accessibilityRole="button" accessibilityState={{ selected: on }}>
            <Icon name={a.icon} size={24} color={BRAND_BLUE} />
            <Text style={s.tileText}>{a.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** A career card in the Explorer grid (the new desktop reference). */
function GridCard({ x, c }: { x: Compass; c: Career }) {
  const area = x.cc.areas.find((a) => a.id === c.area);
  const route = c.pathways[c.pathways.length - 1];
  const saved = x.saves.careers.includes(c.id);
  return (
    <View style={s.card}>
      <Image source={c.photo} style={s.cardPhoto} contentFit="cover" />
      <Pressable style={s.heart} onPress={() => x.toggleCareer(c.id)} hitSlop={8} accessibilityRole="button" accessibilityState={{ selected: saved }} accessibilityLabel={saved ? `Remove ${c.title} from saved` : `Save ${c.title}`}>
        <Icon name={saved ? 'heartFill' : 'heart'} size={16} color={saved ? '#E5487F' : L.navy} />
      </Pressable>
      <View style={s.cardBody}>
        <Text style={s.cardName}>{c.title}</Text>
        <View style={s.areaTag}>
          <Icon name={area?.icon ?? 'map'} size={12} color={BRAND_BLUE} />
          <Text style={s.areaTagText}>{area?.label}</Text>
        </View>
        <Text style={[cs.small, s.overview]} numberOfLines={2}>
          {c.overview}
        </Text>
        <View style={s.meta}>
          <View style={s.metaItem}>
            <Icon name="cap" size={13} color={L.navy} />
            <Text style={s.metaText}>{c.pathways.map((p) => p.level).filter((v, i, a) => a.indexOf(v) === i).slice(-2).join(' / ')}</Text>
          </View>
          <View style={s.metaItem}>
            <Icon name="clock" size={13} color={L.navy} />
            <Text style={s.metaText}>{route?.years ?? ''}</Text>
          </View>
        </View>
        <Pressable style={s.details} onPress={() => x.openCareer(c.id)} accessibilityRole="button" accessibilityLabel={`View details: ${c.title}`}>
          <Text style={s.detailsText}>View Details</Text>
          <Icon name="arrowRight" size={13} color={BRAND_BLUE} />
        </Pressable>
      </View>
    </View>
  );
}

function Pager({ x }: { x: Compass }) {
  const p = x.careerPage;
  return (
    <View style={s.pager}>
      <Text style={cs.small}>{`Showing ${p.from} – ${p.to} of ${p.total} careers`}</Text>
      {p.pages > 1 ? (
        <View style={s.pages}>
          <Pressable style={s.pageBtn} onPress={() => x.setPage(p.page - 1)} disabled={p.page === 1} accessibilityRole="button" accessibilityLabel="Previous page">
            <Icon name="chevronLeft" size={16} color={L.ink} />
          </Pressable>
          {Array.from({ length: p.pages }, (_, i) => i + 1).map((n) => (
            <Pressable key={n} style={[s.pageBtn, n === p.page && s.pageOn]} onPress={() => x.setPage(n)} accessibilityRole="button" accessibilityState={{ selected: n === p.page }} accessibilityLabel={`Page ${n}`}>
              <Text style={[s.pageText, n === p.page && s.pageTextOn]}>{n}</Text>
            </Pressable>
          ))}
          <Pressable style={s.pageBtn} onPress={() => x.setPage(p.page + 1)} disabled={p.page === p.pages} accessibilityRole="button" accessibilityLabel="Next page">
            <Icon name="chevronRight" size={16} color={L.ink} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Empty({ x }: { x: Compass }) {
  return (
    <View style={s.empty}>
      <Text style={s.cardTitle}>No careers match</Text>
      <Text style={cs.small}>Try another word or clear the filters.</Text>
      <Pressable onPress={x.clearExplorer} accessibilityRole="button">
        <Text style={s.clear}>Show all careers</Text>
      </Pressable>
    </View>
  );
}

function Hero({ x }: { x: Compass }) {
  return (
    <View style={s.hero}>
      <LinearGradient colors={[Maple.blue, BRAND_BLUE, Maple.blue]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={s.heroPhoto} pointerEvents="none">
        <Image source={x.cc.photos.directoryHero} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient colors={[Maple.blue, 'rgba(106,68,223,0.5)', 'rgba(106,68,223,0)']} locations={[0, 0.3, 0.7]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
      </View>
      <View style={s.heroText}>
        <View style={s.kicker}>
          <Icon name="map" size={18} color={L.white} />
          <Text style={s.kickerText}>Career Explorer</Text>
        </View>
        <Text style={s.heroTitle}>Explore Careers</Text>
        <Text style={s.heroSub}>Discover careers, what they involve, the skills you need, and the education paths that can take you there.</Text>
        <View style={s.heroBtns}>
          <Pressable style={s.heroBtn} onPress={() => x.setHowTo(true)} accessibilityRole="button">
            <Icon name="playFill" size={13} color={BRAND_BLUE} />
            <Text style={s.heroBtnText}>How to Use Career Explorer</Text>
          </Pressable>
          <Pressable
            style={s.heroGhost}
            onPress={() => {
              x.setTab('interests');
              x.startAssessment();
            }}
            accessibilityRole="button">
            <Text style={s.heroGhostText}>Take Interest Assessment</Text>
            <Icon name="arrowRight" size={14} color={L.white} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function SideCard({ title, icon, sub, children }: { title: string; icon: IconName; sub?: string; children: ReactNode }) {
  return (
    <View style={s.side}>
      <View style={s.sideHead}>
        <Icon name={icon} size={24} color={BRAND_BLUE} />
        <View style={s.flex}>
          <Text style={s.cardTitle}>{title}</Text>
          {sub ? <Text style={cs.small}>{sub}</Text> : null}
        </View>
      </View>
      {children}
    </View>
  );
}

function RightColumn({ x }: { x: Compass }) {
  const f = x.featured;
  const tools: readonly { label: string; icon: IconName; go: () => void }[] = [
    {
      label: 'Interest Assessment',
      icon: 'clipboard',
      go: () => {
        x.setTab('interests');
        x.startAssessment();
      },
    },
    { label: 'Education Pathways', icon: 'cap', go: x.openPlan },
    { label: 'Find Programs', icon: 'building', go: () => x.setTab('programs') },
    { label: 'Talk to a Counselor', icon: 'headset', go: () => x.setTab('counselor') },
  ];
  return (
    <View style={s.rightCol}>
      <SideCard title="Featured Career" icon="sparkle">
        <View style={s.featured}>
          <Image source={f.photo} style={s.featuredPhoto} contentFit="cover" />
          <View style={s.flex}>
            <Text style={s.featuredName}>{f.title}</Text>
            <Text style={cs.small} numberOfLines={4}>
              {f.overview}
            </Text>
            <Text style={s.topMatch}>{`Top match · ${x.strength(f.id)}%`}</Text>
          </View>
        </View>
        <Pressable style={s.outline} onPress={() => x.openCareer(f.id)} accessibilityRole="button">
          <Text style={s.outlineText}>Explore This Career</Text>
          <Icon name="arrowRight" size={14} color={BRAND_BLUE} />
        </Pressable>
      </SideCard>
      <SideCard title="Career Matches for You" icon="target" sub="Based on your interests, strengths and work style.">
        {x.areaScores.slice(0, 3).map((a) => {
          const area = x.cc.areas.find((y) => y.id === a.area);
          return (
            <Pressable key={a.area} style={s.matchRow} onPress={() => x.setArea(a.area)} accessibilityRole="button">
              <Icon name={area?.icon ?? 'map'} size={18} color={BRAND_BLUE} />
              <Text style={[s.matchText, s.flex]}>{a.label}</Text>
              <Text style={s.matchPct}>{`${a.percent}%`}</Text>
            </Pressable>
          );
        })}
        <Pressable
          style={s.link}
          onPress={() => {
            x.setView('results');
            x.setTab('interests');
          }}
          accessibilityRole="link">
          <Text style={s.linkText}>View More Matches</Text>
          <Icon name="arrowRight" size={13} color={BRAND_BLUE} />
        </Pressable>
      </SideCard>
      <View style={s.plan}>
        <LinearGradient colors={[Maple.blueSelected, Maple.blueSelected]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={s.sideHead}>
          <Icon name="map" size={26} color={BRAND_BLUE} />
          <View style={s.flex}>
            <Text style={s.cardTitle}>Build Your Career Plan</Text>
            <Text style={cs.small}>Set goals, choose subjects, explore programs and track your next steps.</Text>
          </View>
        </View>
        <Pressable style={s.planBtn} onPress={x.openPlan} accessibilityRole="button">
          <Text style={s.linkText}>Open My Plan</Text>
          <Icon name="arrowRight" size={13} color={BRAND_BLUE} />
        </Pressable>
      </View>
      <SideCard title="Quick Tools" icon="grid">
        <View style={s.tools}>
          {tools.map((t) => (
            <Pressable key={t.label} style={s.tool} onPress={t.go} accessibilityRole="button">
              <Icon name={t.icon} size={22} color={BRAND_BLUE} />
              <Text style={s.toolText}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </SideCard>
    </View>
  );
}

function HowTo({ x }: { x: Compass }) {
  if (!x.howTo) return null;
  return (
    <Sheet title="How to use Career Explorer" onClose={() => x.setHowTo(false)}>
      <Bullets
        items={[
          'Search for a career by name, or pick a career area on the left.',
          'Narrow the list by education level, work environment, the subjects you’re good at, or industry.',
          'Open a career to see what the work involves, the subjects that help, the ways in, and programs that teach it.',
          'Save the careers you like, then add one to My Plan to plan your subjects and applications.',
        ]}
      />
      <Text style={cs.note}>Most Relevant puts the careers closest to your interest answers first. Take the assessment again any time to change them.</Text>
    </Sheet>
  );
}

/** Career Explorer: every career, searchable, filterable and grouped by area, each opening its full profile. */
export function ExplorerSection({ x, phone }: { x: Compass; phone: boolean }) {
  const heading = x.area ? x.cc.areas.find((a) => a.id === x.area)?.label : 'All Careers';
  const list = x.found;
  if (phone)
    return (
      <View style={s.stack}>
        <Search x={x} />
        <Filters x={x} phone />
        <AreaTiles x={x} />
        <View style={s.listHead}>
          <Text style={s.cardTitle}>{heading}</Text>
          <Text style={cs.small}>{`${list.length} careers`}</Text>
        </View>
        {list.length ? list.map((c) => <CareerListRow key={c.id} c={c} saved={x.saves.careers.includes(c.id)} onSave={() => x.toggleCareer(c.id)} onOpen={() => x.openCareer(c.id)} />) : <Empty x={x} />}
        <PathwayBanner phone onPress={x.openPlan} />
        <HowTo x={x} />
      </View>
    );
  return (
    <View style={s.cols}>
      <View style={[s.flex, s.stack]}>
        <Hero x={x} />
        <Search x={x} />
        <Filters x={x} phone={false} />
        <View style={s.cols}>
          <AreaList x={x} />
          <View style={[s.flex, s.stack]}>
            <View style={s.listHead}>
              <Text style={s.cardTitle}>{`${heading} (${list.length})`}</Text>
              <View style={s.sortRow}>
                <Text style={cs.small}>Sort by:</Text>
                <Picker compact label="Sort by" icon="filter" value={x.sort} options={SORTS} onChange={x.setSort} />
                <View style={s.toggle}>
                  <Pressable style={[s.toggleBtn, x.grid && s.toggleOn]} onPress={() => x.setGrid(true)} accessibilityRole="button" accessibilityState={{ selected: x.grid }} accessibilityLabel="Grid view">
                    <Icon name="grid" size={16} color={x.grid ? L.white : L.ink} />
                  </Pressable>
                  <Pressable style={[s.toggleBtn, !x.grid && s.toggleOn]} onPress={() => x.setGrid(false)} accessibilityRole="button" accessibilityState={{ selected: !x.grid }} accessibilityLabel="List view">
                    <Icon name="list" size={16} color={!x.grid ? L.white : L.ink} />
                  </Pressable>
                </View>
              </View>
            </View>
            {!list.length ? (
              <Empty x={x} />
            ) : x.grid ? (
              <View style={s.grid}>
                {x.careerPage.items.map((c) => (
                  <GridCard key={c.id} x={x} c={c} />
                ))}
              </View>
            ) : (
              <View style={s.stackSm}>
                {x.careerPage.items.map((c) => (
                  <CareerListRow key={c.id} c={c} saved={x.saves.careers.includes(c.id)} onSave={() => x.toggleCareer(c.id)} onOpen={() => x.openCareer(c.id)} />
                ))}
              </View>
            )}
            <Pager x={x} />
          </View>
        </View>
      </View>
      <RightColumn x={x} />
      <HowTo x={x} />
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, minWidth: 0 },
  stack: { gap: 16 },
  stackSm: { gap: 10 },
  cols: { flexDirection: 'row', gap: 20, alignItems: 'flex-start' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: L.navy },
  hero: { height: 236, overflow: 'hidden', borderRadius: 20 },
  heroPhoto: { position: 'absolute', top: 0, right: 0, bottom: 0, width: 460 },
  heroText: { width: 560, gap: 10, paddingLeft: 32, paddingTop: 26 },
  kicker: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kickerText: { fontSize: 17, fontWeight: '700', color: L.white },
  heroTitle: { fontSize: 40, lineHeight: 46, fontWeight: '800', color: L.white, letterSpacing: -0.8 },
  heroSub: { fontSize: 15, lineHeight: 21, color: Maple.blueSoft },
  heroBtns: { flexDirection: 'row', gap: 12, marginTop: 6 },
  heroBtn: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, borderRadius: Radii.control, backgroundColor: L.white },
  heroBtnText: { fontSize: 14, fontWeight: '700', color: L.navy },
  heroGhost: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, borderRadius: Radii.control, borderWidth: 1.5, borderColor: L.white },
  heroGhostText: { fontSize: 14, fontWeight: '600', color: L.white },
  searchRow: { flexDirection: 'row', gap: 10 },
  search: { flex: 1, height: 48, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  searchInput: { flex: 1, height: 46, fontSize: 14, color: L.ink },
  searchBtn: { height: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 22, borderRadius: 12, backgroundColor: BRAND_BLUE },
  searchBtnText: { fontSize: 14.5, fontWeight: '700', color: L.white },
  filterBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, flexShrink: 1 },
  filtersP: { flexWrap: 'nowrap' },
  clear: { fontSize: 13.5, fontWeight: '600', color: L.blue },
  areaCard: { width: 260, gap: 4, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  areaRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, borderRadius: 10 },
  areaOn: { backgroundColor: BRAND_SOFT },
  areaText: { flex: 1, fontSize: 13.5, color: L.ink },
  areaTextOn: { fontWeight: '700', color: BRAND_BLUE },
  areaCount: { minWidth: 28, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, fontSize: 12, fontWeight: '700', color: L.body, textAlign: 'center', backgroundColor: Maple.blueSoft },
  areaCountOn: { color: L.white, backgroundColor: BRAND_BLUE },
  listHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggle: { flexDirection: 'row', gap: 4 },
  toggleBtn: { width: 36, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  toggleOn: { borderColor: BRAND_BLUE, backgroundColor: BRAND_BLUE },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  card: { width: '31.6%', overflow: 'hidden', borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  cardPhoto: { width: '100%', height: 108 },
  heart: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: L.white },
  cardBody: { gap: 6, padding: 12 },
  cardName: { fontSize: 15.5, fontWeight: '800', color: L.navy },
  areaTag: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, backgroundColor: Maple.blueSoft },
  areaTagText: { fontSize: 11.5, fontWeight: '600', color: BRAND_BLUE },
  overview: { minHeight: 34 },
  meta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, fontWeight: '500', color: L.navy },
  details: { height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4, borderRadius: 9, backgroundColor: Maple.blueSoft },
  detailsText: { fontSize: 13, fontWeight: '700', color: BRAND_BLUE },
  pager: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  pages: { flexDirection: 'row', gap: 6 },
  pageBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
  pageOn: { backgroundColor: BRAND_BLUE },
  pageText: { fontSize: 14, fontWeight: '600', color: L.ink },
  pageTextOn: { color: L.white },
  tiles: { gap: 10 },
  tile: { width: 108, height: 96, alignItems: 'center', justifyContent: 'center', gap: 6, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  tileOn: { borderColor: BRAND_BLUE, backgroundColor: Maple.blueSoft },
  tileText: { fontSize: 11.5, lineHeight: 14, fontWeight: '600', color: L.navy, textAlign: 'center' },
  empty: { alignItems: 'center', gap: 6, padding: 26, borderRadius: 14, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  rightCol: { width: 340, gap: 18 },
  side: { gap: 12, padding: 18, borderRadius: 16, borderWidth: 1, borderColor: L.line, backgroundColor: L.white },
  sideHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featured: { flexDirection: 'row', gap: 12 },
  featuredPhoto: { width: 130, height: 140, borderRadius: 12 },
  featuredName: { fontSize: 19, fontWeight: '800', color: L.navy, marginBottom: 4 },
  topMatch: { alignSelf: 'flex-start', marginTop: 8, overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, fontSize: 12, fontWeight: '700', color: Maple.successText, backgroundColor: Maple.successSoft },
  outline: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: Radii.control, borderWidth: 1.5, borderColor: BRAND_BLUE },
  outlineText: { fontSize: 14, fontWeight: '700', color: BRAND_BLUE },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  matchText: { fontSize: 13.5, fontWeight: '600', color: L.navy },
  matchPct: { overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7, fontSize: 12.5, fontWeight: '800', color: Maple.successText, backgroundColor: Maple.successSoft },
  link: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  linkText: { fontSize: 13.5, fontWeight: '700', color: BRAND_BLUE },
  plan: { overflow: 'hidden', gap: 14, padding: 18, borderRadius: 16 },
  planBtn: { alignSelf: 'flex-start', height: 38, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, borderRadius: Radii.control, backgroundColor: L.white },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tool: { width: '47%', minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: L.line },
  toolText: { flex: 1, fontSize: 13, fontWeight: '700', color: L.navy },
});
