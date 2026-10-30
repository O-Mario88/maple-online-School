import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { EmptyState } from '@/components/ui';
import { CatalogueCard } from '@/features/public/explore/CatalogueCard';
import { type FilterGroup, FilterPanel } from '@/features/public/explore/FilterPanel';
import { HomeNav } from '@/features/public/HomeNav';
import { Brand, PUBLIC_WIDE } from '@/features/public/palette';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { type CatalogueFilters, type CatalogueSort, EMPTY_FILTERS, facetCounts, filterCatalogue, sortCatalogue } from '@/lib/catalogue';
import { mockData } from '@/lib/mock';
import type { CatalogueEntry } from '@/mock/public';
import { LightOnly } from '@/hooks/use-theme';

const KIND_LABELS: Readonly<Record<string, string>> = { course: 'Courses', live: 'Live classes', paper: 'Past papers', bootcamp: 'Exam bootcamps', short: 'Short lessons' };
const SORTS: readonly { value: CatalogueSort; label: string }[] = [
  { value: 'popular', label: 'Popularity' },
  { value: 'rating', label: 'Rating' },
  { value: 'priceLow', label: 'Price: low to high' },
  { value: 'priceHigh', label: 'Price: high to low' },
];
const SIDEBAR = 260;
const MAX_WIDTH = 1440;
const NO_ITEMS: readonly CatalogueEntry[] = [];

function groupsFor(items: readonly CatalogueEntry[]): FilterGroup[] {
  const make = (key: FilterGroup['key'], field: 'kind' | 'board' | 'level' | 'subject' | 'country', title: string, label = (v: string) => v): FilterGroup => {
    const counts = facetCounts(items, field);
    return { key, title, options: Object.keys(counts).map((value) => ({ value, label: label(value), count: counts[value] })) };
  };
  return [
    make('kinds', 'kind', 'Content type', (v) => KIND_LABELS[v] ?? v),
    make('boards', 'board', 'Curriculum and exam board'),
    make('levels', 'level', 'Grade / level'),
    make('subjects', 'subject', 'Subject'),
    make('countries', 'country', 'Country'),
  ];
}

/** Inventory 7: search and filter courses, live classes, past papers and bootcamps. */
export default function ExploreScreen() {
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;
  const [filters, setFilters] = useState<CatalogueFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<CatalogueSort>('popular');
  const [list, setList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const items = mock?.publicPages.catalogue ?? NO_ITEMS;
  const groups = useMemo(() => groupsFor(items), [items]);
  const results = useMemo(() => sortCatalogue(filterCatalogue(items, filters), sort), [items, filters, sort]);

  if (!mock) {
    return <PreviewScreen title="Explore">{() => null}</PreviewScreen>;
  }

  const panel = <FilterPanel filters={filters} groups={groups} onChange={setFilters} />;
  const sortIndex = SORTS.findIndex((s) => s.value === sort);

  return (
    <LightOnly>
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <HomeNav wide={wide} active="Courses" />
      <View style={[styles.body, wide && styles.bodyWide]}>
        {wide ? (
          <ScrollView style={styles.sidebar} contentContainerStyle={styles.sidebarInner}>
            {panel}
          </ScrollView>
        ) : null}
        <ScrollView style={styles.flex} contentContainerStyle={styles.main}>
          <View style={styles.head}>
            <View style={styles.flexShrink}>
              <Text style={styles.title} accessibilityRole="header">
                Explore Courses, Live Classes & Past Papers
              </Text>
              <Text style={styles.sub}>Find the right learning resources for your goals.</Text>
            </View>
            <Text style={styles.count} accessibilityLiveRegion="polite">{`Showing ${results.length} of ${items.length} results`}</Text>
          </View>
          <View style={styles.controls}>
            {wide ? null : (
              <Pressable style={styles.control} onPress={() => setShowFilters((s) => !s)} accessibilityRole="button" accessibilityState={{ expanded: showFilters }}>
                <Icon name="search" size={14} color={Brand.ink} />
                <Text style={styles.controlText}>{showFilters ? 'Hide filters' : 'Filters'}</Text>
              </Pressable>
            )}
            <View style={styles.toggle} accessibilityRole="tablist">
              {(['Grid', 'List'] as const).map((v) => {
                const on = (v === 'List') === list;
                return (
                  <Pressable key={v} style={[styles.toggleBtn, on && styles.toggleOn]} onPress={() => setList(v === 'List')} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                    <Text style={[styles.controlText, on && styles.toggleTextOn]}>{v}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable style={styles.control} onPress={() => setSort(SORTS[(sortIndex + 1) % SORTS.length].value)} accessibilityRole="button" accessibilityLabel={`Sort by ${SORTS[sortIndex].label}. Tap to change.`}>
              <Text style={styles.muted}>Sort by</Text>
              <Text style={styles.controlText}>{SORTS[sortIndex].label}</Text>
              <Icon name="chevronDown" size={14} color={Brand.body} />
            </Pressable>
          </View>
          {!wide && showFilters ? <View style={styles.mobilePanel}>{panel}</View> : null}
          {results.length === 0 ? (
            <EmptyState icon="search" title="Nothing matches those filters" body="Try fewer filters or a shorter search." />
          ) : (
            <View style={[styles.grid, list && styles.listGrid]}>
              {results.map((i) => (
                <CatalogueCard key={i.id} item={i} coursePage={mock.publicPages.catalogueCoursePage} list={list} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  body: { flex: 1, backgroundColor: Brand.canvas },
  bodyWide: { flexDirection: 'row', width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  flex: { flex: 1 },
  flexShrink: { flexShrink: 1 },
  sidebar: { width: SIDEBAR, flexGrow: 0, backgroundColor: Brand.surface, borderRightWidth: 1, borderRightColor: Brand.line },
  sidebarInner: { padding: 20 },
  main: { padding: 20, gap: 16 },
  head: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title: { fontSize: 26, fontWeight: '800', color: Brand.ink, letterSpacing: -0.5 },
  sub: { fontSize: 14, color: Brand.body, marginTop: 4 },
  count: { fontSize: 12, color: Brand.muted },
  controls: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 10 },
  control: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 38, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: Brand.line, backgroundColor: Brand.surface },
  controlText: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  muted: { fontSize: 12, color: Brand.muted },
  toggle: { flexDirection: 'row', padding: 3, borderRadius: 8, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  toggleOn: { backgroundColor: Brand.blue },
  toggleTextOn: { color: Brand.surface },
  mobilePanel: { padding: 16, borderRadius: 12, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  listGrid: { flexDirection: 'column' },
});
