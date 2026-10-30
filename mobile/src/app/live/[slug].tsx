import { router, useLocalSearchParams } from 'expo-router';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState } from '@/components/ui';
import { LiveHero } from '@/features/public/live/LiveHero';
import { AboutLive, LiveFeatures, LiveTeacher, MoreLive, Syllabus } from '@/features/public/live/LiveSections';
import { LiveSidebar } from '@/features/public/live/LiveSidebar';
import { HomeNav } from '@/features/public/HomeNav';
import { Brand, PUBLIC_WIDE } from '@/features/public/palette';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

const MAX_WIDTH = 1440;
const SIDE = 400;
const TABS = ['Overview', 'Syllabus', 'Teacher', 'Reviews', 'FAQ'] as const;
type Tab = (typeof TABS)[number];
type Section = 'about' | 'syllabus' | 'teacher' | 'more';
const TAB_SECTION: Readonly<Record<Tab, Section>> = { Overview: 'about', Syllabus: 'syllabus', Teacher: 'teacher', Reviews: 'teacher', FAQ: 'about' };

/** Inventory 9: a public live class or bootcamp page anyone can open from a shared link. */
export default function LiveSessionScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [offsets, setOffsets] = useState<Partial<Record<Section, number>>>({});
  const [tab, setTab] = useState<Tab>('Overview');

  if (!mock) return <PreviewScreen title="Live class">{() => null}</PreviewScreen>;
  const s = mock.publicPages.liveSession;
  if (slug !== s.slug) {
    return (
      <LightOnly>
        <SafeAreaView style={styles.safe}>
          <HomeNav wide={wide} active="Live Classes" />
          <EmptyState
            icon="search"
            title="Live class not found"
            body="It may have finished or the link may be old."
            action={<Button label="See live classes" variant="secondary" compact onPress={() => router.push('/explore')} />}
          />
        </SafeAreaView>
      </LightOnly>
    );
  }

  const mark = (sec: Section) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setOffsets((o) => ({ ...o, [sec]: y }));
  };
  const jump = (t: Tab) => {
    setTab(t);
    const y = offsets[TAB_SECTION[t]];
    if (y !== undefined) scroll.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
  };
  const sidebar = <LiveSidebar s={s} />;

  return (
    <LightOnly>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <HomeNav wide={wide} active="Live Classes" />
        <ScrollView ref={scroll} contentContainerStyle={styles.page}>
          <View style={styles.inner}>
            <Text style={styles.crumbs}>
              {`${s.breadcrumb.join('  ›  ')}  ›  `}
              <Text style={styles.crumbHere}>{`${s.title.lead} ${s.title.accent}`}</Text>
            </Text>
            <View style={[styles.cols, wide && styles.colsWide]}>
              <View style={[styles.main, wide && styles.flex]}>
                <LiveHero s={s} wide={wide} />
                {wide ? null : sidebar}
                {/* On wide screens the feature strip overlaps the hero's bottom edge, as in the reference. */}
                <View style={wide ? styles.overlap : undefined}>
                  <LiveFeatures s={s} />
                </View>
                <View style={styles.tabs} accessibilityRole="tablist">
                  {TABS.map((t) => {
                    const on = t === tab;
                    return (
                      <Pressable key={t} style={[styles.tab, on && styles.tabOn]} onPress={() => jump(t)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                        <Text style={[styles.tabText, on && styles.tabTextOn]}>{t}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                <View style={[styles.cols, wide && styles.colsWide]}>
                  <View style={wide ? styles.flex : undefined} onLayout={mark('about')}>
                    <AboutLive s={s} />
                  </View>
                  <View style={wide ? styles.flex : undefined} onLayout={mark('syllabus')}>
                    <Syllabus s={s} />
                  </View>
                </View>
              </View>
              <View style={[styles.main, wide ? styles.side : null]}>
                {wide ? sidebar : null}
                <View onLayout={mark('teacher')}>
                  <LiveTeacher s={s} />
                </View>
              </View>
            </View>
            <View onLayout={mark('more')}>
              <MoreLive s={s} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LightOnly>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  page: { backgroundColor: Brand.canvas, paddingBottom: 48 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 16, paddingHorizontal: 20, paddingTop: 12 },
  crumbs: { fontSize: 12, color: Brand.muted },
  crumbHere: { color: Brand.ink, fontWeight: '500' },
  flex: { flex: 1 },
  cols: { gap: 20 },
  colsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { gap: 20 },
  side: { width: SIDE },
  overlap: { marginTop: -56, marginHorizontal: 18 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, borderBottomWidth: 1, borderBottomColor: Brand.line },
  tab: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabOn: { borderBottomColor: Brand.blue },
  tabText: { fontSize: 14, color: Brand.ink },
  tabTextOn: { color: Brand.blue, fontWeight: '600' },
});
