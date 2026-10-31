import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { EmptyState } from '@/components/ui';
import { CatalogueCard } from '@/features/public/explore/CatalogueCard';
import { type ExploreGroup, ExploreFilters, SearchBox } from '@/features/public/explore/ExploreFilters';
import { RefScale } from '@/features/public/home/RefScale';
import { EXPLORE_LINKS, HomeNav } from '@/features/public/HomeNav';
import { Brand } from '@/features/public/palette';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { type CatalogueFilters, type CatalogueSort, EMPTY_FILTERS, facetCounts, filterCatalogue, sortCatalogue } from '@/lib/catalogue';
import { mockData } from '@/lib/mock';
import type { CatalogueEntry, catalogueFacets } from '@/mock/public';
import { LightOnly } from '@/hooks/use-theme';

const SORTS: readonly { value: CatalogueSort; label: string }[] = [
  { value: 'popular', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'priceLow', label: 'Price: low to high' },
  { value: 'priceHigh', label: 'Price: high to low' },
];
/** From this width the page is the reference itself, scaled to fit. */
const DESKTOP_MIN = 1200;
/** Below this width the two-per-row cards use the compact size. */
const TWO_COLUMNS = 600;
const PHONE_GAP = 14;
// The reference's grid: 4 columns of 262.5px with 26px gaps inside the 1128px results column.
const DESK_COLUMNS = 4;
const DESK_CARD = 262.5;
const NO_ITEMS: readonly CatalogueEntry[] = [];

type Facets = typeof catalogueFacets;

function groupsFor(facets: Facets, items: readonly CatalogueEntry[]): ExploreGroup[] {
  const subjects = facetCounts(items, 'subject');
  return [
    { key: 'kinds', title: 'Content Type', options: facets.kinds, shown: 5, toggle: 'minus' },
    { key: 'boards', title: 'Curriculum', options: facets.boards, shown: 6, toggle: 'minus' },
    { key: 'levels', title: 'Grade / Level', options: facets.levels, shown: 4, toggle: 'chevron' },
    { key: 'subjects', title: 'Subject', options: Object.keys(subjects).map((s) => ({ value: s, label: s })), shown: 5, toggle: 'chevron' },
  ];
}

function isUnfiltered(f: CatalogueFilters): boolean {
  return f.query === '' && f.kinds.length + f.boards.length + f.levels.length + f.subjects.length + f.countries.length === 0 && f.price === 'any';
}

function countLine(facets: Facets, filters: CatalogueFilters, found: number): string {
  // With no filters, the reference's whole-catalogue line; once filtered, what is actually shown.
  if (isUnfiltered(filters)) return `Showing 1–${facets.perPage} of ${facets.total.toLocaleString('en-US')} results`;
  return `Showing ${found} ${found === 1 ? 'result' : 'results'}`;
}

interface ControlsProps {
  list: boolean;
  setList: (v: boolean) => void;
  sort: CatalogueSort;
  setSort: (s: CatalogueSort) => void;
}

/** Grid/List switch and the sort menu (each tap moves to the next sort). */
function Controls({ list, setList, sort, setSort }: ControlsProps) {
  const i = SORTS.findIndex((s) => s.value === sort);
  return (
    <View style={styles.controls}>
      <View style={styles.views} accessibilityRole="tablist">
        {(['Grid', 'List'] as const).map((v) => {
          const on = (v === 'List') === list;
          return (
            <Pressable key={v} style={[styles.view, on && styles.viewOn]} onPress={() => setList(v === 'List')} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Icon name={v === 'Grid' ? 'grid' : 'list'} size={13} color={on ? Brand.surface : '#4A5263'} />
              <Text style={[styles.viewText, on && styles.viewTextOn]}>{v}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.sortLabel}>Sort by</Text>
      <Pressable style={styles.sort} onPress={() => setSort(SORTS[(i + 1) % SORTS.length].value)} accessibilityRole="button" accessibilityLabel={`Sort by ${SORTS[i].label}. Tap to change.`}>
        <Text style={styles.sortText}>{SORTS[i].label}</Text>
        <Icon name="chevronDown" size={15} color={Brand.ink} />
      </Pressable>
    </View>
  );
}

/** Inventory 7: search and filter courses, live classes, past papers and bootcamps (the Explore reference, option 3). */
export default function ExploreScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const desktop = width >= DESKTOP_MIN;
  const [filters, setFilters] = useState<CatalogueFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CatalogueSort>('popular');
  const [list, setList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const items = mock?.publicPages.catalogue ?? NO_ITEMS;
  const results = useMemo(() => sortCatalogue(filterCatalogue(items, filters), sort), [items, filters, sort]);

  if (!mock) {
    return <PreviewScreen title="Explore">{() => null}</PreviewScreen>;
  }
  const facets = mock.publicPages.catalogueFacets;
  const groups = groupsFor(facets, items);
  const coursePage = mock.publicPages.catalogueCoursePage;
  const count = countLine(facets, filters, results.length);
  const empty = <EmptyState icon="search" title="Nothing matches those filters" body="Try fewer filters or a shorter search." />;

  if (desktop) {
    return (
      <LightOnly>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <RefScale width={width}>
            <HomeNav wide tall fullWidth links={EXPLORE_LINKS} active="Explore" />
          </RefScale>
          <ScrollView style={styles.scroll}>
            <RefScale width={width}>
              <View style={styles.deskBody}>
                <View style={styles.sidebar}>
                  <ExploreFilters filters={filters} groups={groups} onChange={setFilters} />
                </View>
                <View style={styles.main}>
                  <View style={styles.head}>
                    <Text style={styles.title} accessibilityRole="header">
                      Explore Courses, Live Classes & Past Papers
                    </Text>
                    <Text style={styles.sub}>Find the right learning resources for your goals.</Text>
                    <Text style={styles.count} accessibilityLiveRegion="polite">
                      {count}
                    </Text>
                    <View style={styles.deskControls}>
                      <Controls list={list} setList={setList} sort={sort} setSort={setSort} />
                    </View>
                  </View>
                  {results.length === 0 ? (
                    empty
                  ) : (
                    <View style={[styles.grid, list && styles.gridList]}>
                      {results.map((i) => (
                        <CatalogueCard key={i.id} item={i} coursePage={coursePage} width={list ? undefined : DESK_CARD} list={list} />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </RefScale>
          </ScrollView>
        </SafeAreaView>
      </LightOnly>
    );
  }

  // Two cards per row like the reference's grid (compact on phones); List shows one per row.
  const columns = list ? 1 : 2;
  const cardWidth = columns === 1 ? undefined : (width - 2 * PHONE_GAP - PHONE_GAP) / 2;
  const compact = columns === 2 && width < TWO_COLUMNS;
  return (
    <LightOnly>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <HomeNav wide={false} active="Explore" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.phone}>
          <Text style={styles.titlePhone} accessibilityRole="header">
            Explore Courses, Live Classes & Past Papers
          </Text>
          <Text style={styles.subPhone}>Find the right learning resources for your goals.</Text>
          <SearchBox filters={filters} onChange={setFilters} style={styles.searchPhone} />
          <View style={styles.phoneBar}>
            <Pressable style={[styles.filtersBtn, showFilters && styles.viewOn]} onPress={() => setShowFilters((s) => !s)} accessibilityRole="button" accessibilityState={{ expanded: showFilters }}>
              <Icon name="settings" size={14} color={showFilters ? Brand.surface : Brand.ink} />
              <Text style={[styles.viewText, showFilters && styles.viewTextOn]}>Filters</Text>
            </Pressable>
            <Controls list={list} setList={setList} sort={sort} setSort={setSort} />
          </View>
          {showFilters ? (
            <View style={styles.drawer}>
              <ExploreFilters filters={filters} groups={groups} onChange={setFilters} hideSearch />
            </View>
          ) : null}
          <Text style={styles.countPhone} accessibilityLiveRegion="polite">
            {count}
          </Text>
          {results.length === 0 ? (
            empty
          ) : (
            <View style={styles.gridPhone}>
              {results.map((i) => (
                <CatalogueCard key={i.id} item={i} coursePage={coursePage} width={cardWidth} compact={compact} />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  scroll: { backgroundColor: '#FAFBFD' },

  // Desktop, in the reference's pixels (body starts under the 80px bar).
  deskBody: { flexDirection: 'row', minHeight: 900 },
  sidebar: { width: 332, paddingTop: 32, paddingLeft: 35, paddingRight: 26, paddingBottom: 40, backgroundColor: Brand.surface, borderRightWidth: 1, borderRightColor: '#EDF0F5' },
  main: { width: 1204, paddingTop: 33, paddingLeft: 34, paddingRight: 42, paddingBottom: 48 },
  head: { height: 111.4 },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '700', color: Brand.ink, letterSpacing: -0.3 },
  sub: { marginTop: 12, fontSize: 16, lineHeight: 22, color: '#4A5263' },
  count: { position: 'absolute', right: 0, top: -2, fontSize: 14, lineHeight: 18, color: '#6B7385' },
  deskControls: { position: 'absolute', right: 0, top: 45 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 26, rowGap: 20, width: DESK_COLUMNS * DESK_CARD + 3 * 26 },
  gridList: { flexDirection: 'column' },

  controls: { flexDirection: 'row', alignItems: 'center' },
  views: { flexDirection: 'row', gap: 5 },
  view: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, borderRadius: 7, backgroundColor: '#F1F3F7' },
  viewOn: { backgroundColor: Brand.blue },
  viewText: { fontSize: 13.5, fontWeight: '500', color: '#4A5263' },
  viewTextOn: { color: Brand.surface },
  sortLabel: { marginLeft: 19, fontSize: 13.5, color: '#4A5263' },
  sort: { width: 143, height: 42, marginLeft: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 13, borderRadius: 8, borderWidth: 1, borderColor: '#DFE4EC', backgroundColor: Brand.surface },
  sortText: { fontSize: 13.5, fontWeight: '500', color: Brand.ink },

  // Phones and tablets.
  phone: { padding: PHONE_GAP, paddingBottom: 40 },
  titlePhone: { fontSize: 24, lineHeight: 29, fontWeight: '700', color: Brand.ink, letterSpacing: -0.3 },
  subPhone: { marginTop: 6, fontSize: 15, lineHeight: 21, color: '#4A5263' },
  searchPhone: { marginTop: 14 },
  phoneBar: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  filtersBtn: { height: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 7, backgroundColor: '#F1F3F7' },
  drawer: { marginTop: 12, padding: 14, paddingTop: 0, borderRadius: 10, backgroundColor: Brand.surface, borderWidth: 1, borderColor: '#EDF0F5' },
  countPhone: { marginTop: 12, marginBottom: 10, fontSize: 13, color: '#6B7385' },
  gridPhone: { flexDirection: 'row', flexWrap: 'wrap', gap: PHONE_GAP },
});
