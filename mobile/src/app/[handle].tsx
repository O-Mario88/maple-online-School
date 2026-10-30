import { router, useLocalSearchParams } from 'expo-router';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, EmptyState } from '@/components/ui';
import { HomeNav } from '@/features/public/HomeNav';
import { Brand, PUBLIC_WIDE } from '@/features/public/palette';
import { BookingCard } from '@/features/public/teacher/BookingCard';
import { TeacherHeader } from '@/features/public/teacher/TeacherHeader';
import { AboutCard, CoursesRow, CredentialsCard, ReviewsRow, ShortsRow } from '@/features/public/teacher/TeacherSections';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { parseHandle } from '@/lib/booking';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

const MAX_WIDTH = 1440;
const BOOKING = 420;

type Section = 'about' | 'courses' | 'shorts' | 'reviews';
const TAB_SECTION: Readonly<Record<string, Section>> = { Overview: 'about', 'Courses (8)': 'courses', 'Maple Shorts (42)': 'shorts', 'Reviews (2.3K)': 'reviews' };

function NotFound({ wide }: { wide: boolean }) {
  return (
    <LightOnly>
    <SafeAreaView style={styles.safe}>
      <HomeNav wide={wide} />
      <EmptyState
        icon="search"
        title="Page not found"
        body="Check the link, or find a teacher from the catalogue."
        action={<Button label="Explore" variant="secondary" compact onPress={() => router.push('/explore')} />}
      />
    </SafeAreaView>
    </LightOnly>
  );
}

/**
 * Inventory 11: a teacher's public storefront at /@handle. Only @handles
 * match here; any other unknown address shows "Page not found".
 */
export default function TeacherStorefrontScreen() {
  const params = useLocalSearchParams<{ handle?: string; ref?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [offsets, setOffsets] = useState<Partial<Record<Section, number>>>({});
  const [tab, setTab] = useState('Overview');
  const handle = parseHandle(params.handle);

  if (!handle) return <NotFound wide={wide} />;
  if (!mock) return <PreviewScreen title="Teacher">{() => null}</PreviewScreen>;
  const t = mock.publicPages.teacherStorefront;
  if (handle !== t.handle) return <NotFound wide={wide} />;

  const mark = (s: Section) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setOffsets((o) => ({ ...o, [s]: y }));
  };
  const jump = (label: string) => {
    setTab(label);
    const y = offsets[TAB_SECTION[label] ?? 'about'];
    if (y !== undefined) scroll.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
  };
  const booking = <BookingCard t={t} refParam={params.ref} />;

  return (
    <LightOnly>
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <HomeNav wide={wide} active="For Teachers" />
      <ScrollView ref={scroll} contentContainerStyle={styles.page}>
        <View style={styles.inner}>
          <TeacherHeader t={t} wide={wide} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
            {t.tabs.map((label) => {
              const on = label === tab;
              return (
                <Pressable key={label} style={[styles.tab, on && styles.tabOn]} onPress={() => jump(label)} accessibilityRole="tab" accessibilityState={{ selected: on }}>
                  <Text style={[styles.tabText, on && styles.tabTextOn]}>{label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={[styles.cols, wide && styles.colsWide]}>
            <View style={[styles.main, wide && styles.flex]}>
              <View style={[styles.cols, wide && styles.colsWide]} onLayout={mark('about')}>
                <View style={wide ? styles.flex : undefined}>
                  <AboutCard t={t} wide={wide} />
                </View>
                {wide ? null : booking}
                <View style={wide ? styles.flex : undefined}>
                  <CredentialsCard t={t} />
                </View>
              </View>
              <View style={[styles.cols, wide && styles.colsWide]}>
                <View style={wide ? styles.flex : undefined} onLayout={mark('courses')}>
                  <CoursesRow t={t} />
                </View>
                <View style={wide ? styles.shortsCol : undefined} onLayout={mark('shorts')}>
                  <ShortsRow t={t} />
                </View>
              </View>
            </View>
            {wide ? <View style={styles.booking}>{booking}</View> : null}
          </View>
          <View style={styles.reviews} onLayout={mark('reviews')}>
            <ReviewsRow t={t} />
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
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 20 },
  flex: { flex: 1 },
  tabs: { gap: 4, paddingHorizontal: 20 },
  tab: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabOn: { borderBottomColor: Brand.blue },
  tabText: { fontSize: 14, color: Brand.ink },
  tabTextOn: { color: Brand.blue, fontWeight: '600' },
  cols: { gap: 20, paddingHorizontal: 20 },
  colsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { gap: 20, marginHorizontal: -20 },
  shortsCol: { width: 330 },
  booking: { width: BOOKING },
  reviews: { paddingHorizontal: 20 },
});
