import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { EmptyState } from '@/components/ui';
import { CheckGroup } from '@/features/public/explore/FilterPanel';
import { HomeNav } from '@/features/public/HomeNav';
import { Brand, PUBLIC_WIDE } from '@/features/public/palette';
import { ShortCard } from '@/features/public/shorts/ShortCard';
import { ShortPlayer } from '@/features/public/shorts/ShortPlayer';
import { ShortsHero } from '@/features/public/shorts/ShortsHero';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';
import { EMPTY_SHORT_FILTERS, filterShorts, formatCount, type ShortFilters } from '@/lib/shorts';
import type { ShortEntry } from '@/mock/public';
import { LightOnly } from '@/hooks/use-theme';

type ListKey = 'boards' | 'levels' | 'subjects' | 'types' | 'languages';

const GROUPS: readonly { key: ListKey; title: string; field: keyof ShortEntry }[] = [
  { key: 'boards', title: 'Curriculum', field: 'board' },
  { key: 'levels', title: 'Grade / Level', field: 'level' },
  { key: 'subjects', title: 'Subject', field: 'subject' },
  { key: 'types', title: 'Video type', field: 'type' },
  { key: 'languages', title: 'Language', field: 'language' },
];
const SHELF = [
  { label: 'Shorts Home', icon: 'play' },
  { label: 'Trending', icon: 'chart' },
  { label: 'New', icon: 'sparkle' },
  { label: 'My Bookmarks', icon: 'star' },
  { label: 'Watched', icon: 'clock' },
  { label: 'My Learning', icon: 'book' },
] as const;
const SIDEBAR = 240;
const PLAYER = 400;
const NO_CLIPS: readonly ShortEntry[] = [];

function valuesOf(clips: readonly ShortEntry[], field: keyof ShortEntry): string[] {
  return [...new Set(clips.map((c) => String(c[field])))];
}

/** Inventory 10: the public Maple Shorts feed, each clip with its own shareable link. */
export default function ShortsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;
  const [filters, setFilters] = useState<ShortFilters>(EMPTY_SHORT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const feed = mock?.publicPages.shortsFeed;
  const clips = feed?.clips ?? NO_CLIPS;
  const shown = useMemo(() => filterShorts(clips, filters), [clips, filters]);

  if (!mock || !feed) {
    return <PreviewScreen title="Maple Shorts">{() => null}</PreviewScreen>;
  }

  // The clip in the link (?id=) plays; otherwise the first one.
  const current = clips.find((c) => c.id === id) ?? clips[0];
  const select = (clipId: string) => router.setParams({ id: clipId });
  const toggle = (key: ListKey, value: string) =>
    setFilters((f) => ({ ...f, [key]: f[key].includes(value) ? f[key].filter((v) => v !== value) : [...f[key], value] }));

  const filterPanel = (
    <View style={styles.filters}>
      <View style={styles.between}>
        <Text style={styles.filtersTitle}>Filters</Text>
        <Pressable onPress={() => setFilters((f) => ({ ...EMPTY_SHORT_FILTERS, topic: f.topic }))} accessibilityRole="button">
          <Text style={styles.link}>Reset</Text>
        </Pressable>
      </View>
      {GROUPS.map((g) => (
        <CheckGroup
          key={g.key}
          group={{ title: g.title, options: valuesOf(clips, g.field).map((v) => ({ value: v, label: v })) }}
          selected={filters[g.key]}
          onToggle={(v) => toggle(g.key, v)}
        />
      ))}
    </View>
  );

  return (
    <LightOnly>
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <HomeNav wide={wide} active="Shorts" />
      <View style={[styles.body, wide && styles.bodyWide]}>
        {wide ? (
          <ScrollView style={styles.sidebar} contentContainerStyle={styles.sidebarInner}>
            {SHELF.map((s, i) => (
              <Pressable key={s.label} style={[styles.shelf, i === 0 && styles.shelfOn]} accessibilityRole="link">
                <Icon name={s.icon} size={18} color={i === 0 ? Brand.blue : Brand.body} />
                <Text style={[styles.shelfText, i === 0 && styles.shelfTextOn]}>{s.label}</Text>
              </Pressable>
            ))}
            <View style={styles.rule} />
            {filterPanel}
          </ScrollView>
        ) : null}
        <ScrollView style={styles.flex} contentContainerStyle={styles.main}>
          {wide ? null : <ShortPlayer clip={current} courseSlug={feed.courseSlug} />}
          <ShortsHero promises={feed.promises} wide={wide} photo={feed.heroPhoto} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {feed.topics.map((t) => {
              const on = filters.topic === t;
              return (
                <Pressable key={t} style={[styles.chip, on && styles.chipOn]} onPress={() => setFilters((f) => ({ ...f, topic: t }))} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{t}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {wide ? null : (
            <Pressable style={styles.filterBtn} onPress={() => setShowFilters((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: showFilters }}>
              <Text style={styles.chipText}>{showFilters ? 'Hide filters' : 'Filters'}</Text>
            </Pressable>
          )}
          {!wide && showFilters ? <View style={styles.mobilePanel}>{filterPanel}</View> : null}
          {shown.length === 0 ? (
            <EmptyState icon="search" title="No shorts match" body="Try another topic or fewer filters." />
          ) : (
            <View style={styles.grid}>
              {shown.map((c) => (
                <ShortCard key={c.id} clip={c} active={c.id === current.id} onPress={() => select(c.id)} />
              ))}
            </View>
          )}
          <Text style={styles.trendingTitle} accessibilityRole="header">
            Trending This Week ›
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trending}>
            {feed.trending.map((t) => (
              <View key={t.title} style={styles.trend}>
                <View style={styles.trendThumb}>
                  <Icon name="play" size={18} color={Brand.surface} />
                </View>
                <View>
                  <Text style={styles.trendText}>{t.title}</Text>
                  <Text style={styles.muted}>{`${formatCount(t.views)} views`}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </ScrollView>
        {wide ? (
          <ScrollView style={styles.player} contentContainerStyle={styles.playerInner}>
            <ShortPlayer clip={current} courseSlug={feed.courseSlug} />
          </ScrollView>
        ) : null}
      </View>
    </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  body: { flex: 1, backgroundColor: Brand.canvas },
  bodyWide: { flexDirection: 'row' },
  flex: { flex: 1 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sidebar: { width: SIDEBAR, flexGrow: 0, backgroundColor: Brand.surface, borderRightWidth: 1, borderRightColor: Brand.line },
  sidebarInner: { padding: 16, gap: 4 },
  shelf: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  shelfOn: { backgroundColor: Brand.blueSoft },
  shelfText: { fontSize: 14, color: Brand.body },
  shelfTextOn: { color: Brand.blue, fontWeight: '600' },
  rule: { height: 1, backgroundColor: Brand.line, marginVertical: 12 },
  filters: { gap: 16 },
  filtersTitle: { fontSize: 15, fontWeight: '700', color: Brand.ink },
  link: { fontSize: 13, fontWeight: '600', color: Brand.blue },
  main: { padding: 20, gap: 16 },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  chipOn: { backgroundColor: Brand.blue, borderColor: Brand.blue },
  chipText: { fontSize: 13, fontWeight: '500', color: Brand.ink },
  chipTextOn: { color: Brand.surface, fontWeight: '600' },
  filterBtn: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: Brand.line, backgroundColor: Brand.surface },
  mobilePanel: { padding: 16, borderRadius: 12, backgroundColor: Brand.surface, borderWidth: 1, borderColor: Brand.line },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  trendingTitle: { fontSize: 17, fontWeight: '700', color: Brand.ink, marginTop: 8 },
  trending: { gap: 20 },
  trend: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trendThumb: { width: 64, height: 44, borderRadius: 6, backgroundColor: '#1E3A8A', alignItems: 'center', justifyContent: 'center' },
  trendText: { fontSize: 13, fontWeight: '600', color: Brand.ink },
  muted: { fontSize: 12, color: Brand.muted },
  player: { width: PLAYER, flexGrow: 0, backgroundColor: Brand.surface, borderLeftWidth: 1, borderLeftColor: Brand.line },
  playerInner: { padding: 20 },
});
