import { useLocalSearchParams } from 'expo-router';
import { type ComponentRef, useMemo, useRef, useState } from 'react';
import { type LayoutChangeEvent, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/ui';
import { CourseHero } from '@/features/public/course/CourseHero';
import { CourseOutline } from '@/features/public/course/CourseOutline';
import { FeatureStrip, Outcomes, Related, Reviews, SectionTabs, TeacherCard } from '@/features/public/course/CourseSections';
import { PriceCard } from '@/features/public/course/PriceCard';
import { SamplePreview } from '@/features/public/course/SamplePreview';
import { HomeNav } from '@/features/public/HomeNav';
import { Brand, PUBLIC_WIDE } from '@/features/public/palette';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

const MAX_WIDTH = 1440;
const SIDE = 380;

// Which section each tab scrolls to.
type Section = 'learn' | 'outline' | 'teacher' | 'reviews';
const TAB_SECTION: Readonly<Record<string, Section>> = {
  Overview: 'learn',
  Curriculum: 'outline',
  Lessons: 'outline',
  'Live Classes': 'outline',
  Assignments: 'outline',
  Reviews: 'reviews',
  Teacher: 'teacher',
  FAQs: 'reviews',
};

/** Inventory 8: a public course page anyone can open from a shared link. */
export default function CourseLandingScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const mock = useMemo(() => mockData(), []);
  const { width } = useWindowDimensions();
  const wide = width >= PUBLIC_WIDE;
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const [offsets, setOffsets] = useState<Partial<Record<Section, number>>>({});
  const [tab, setTab] = useState('Overview');

  if (!mock) {
    return <PreviewScreen title="Course">{() => null}</PreviewScreen>;
  }
  const course = mock.publicPages.coursePage;
  if (slug !== course.slug) {
    return (
      <SafeAreaView style={styles.safe}>
        <HomeNav wide={wide} active="Courses" />
        <EmptyState icon="search" title="Course not found" body="This link may be old. Search for the course instead." />
      </SafeAreaView>
    );
  }

  const mark = (s: Section) => (e: LayoutChangeEvent) => {
    const y = e.nativeEvent.layout.y;
    setOffsets((o) => ({ ...o, [s]: y }));
  };
  const jump = (t: string) => {
    setTab(t);
    const y = offsets[TAB_SECTION[t]];
    if (y !== undefined) scroll.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <HomeNav wide={wide} active="Courses" />
      <ScrollView ref={scroll} contentContainerStyle={styles.page}>
        <View style={styles.inner}>
          <View style={[styles.row, wide && styles.rowWide]}>
            <View style={[styles.main, wide && styles.flex]}>
              <CourseHero course={course} wide={wide} />
              {/* On phones the price and Enrol button come straight after the title. */}
              {wide ? null : <PriceCard course={course} />}
              <FeatureStrip course={course} />
            </View>
            {wide ? (
              <View style={styles.side}>
                <PriceCard course={course} />
              </View>
            ) : null}
          </View>
          <SectionTabs active={tab} onChange={jump} />
          <View style={[styles.row, wide && styles.rowWide]}>
            <View style={[styles.flex, styles.stack]} onLayout={mark('learn')}>
              <Outcomes course={course} wide={wide} />
            </View>
            <View style={[wide ? styles.mid : undefined, styles.stack]} onLayout={mark('teacher')}>
              <TeacherCard course={course} />
            </View>
            <View style={wide ? styles.side : undefined} onLayout={mark('reviews')}>
              <Reviews course={course} />
            </View>
          </View>
          <View style={[styles.row, wide && styles.rowWide]}>
            <View style={styles.flex} onLayout={mark('outline')}>
              <CourseOutline course={course} />
            </View>
            <View style={styles.flex}>
              <SamplePreview course={course} wide={wide} />
            </View>
            <View style={wide ? styles.side : undefined}>
              <Related course={course} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Brand.surface },
  page: { backgroundColor: Brand.canvas, paddingBottom: 48 },
  inner: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', gap: 20, paddingHorizontal: 20, paddingTop: 16 },
  row: { gap: 20 },
  rowWide: { flexDirection: 'row', alignItems: 'flex-start' },
  flex: { flex: 1 },
  main: { gap: 20 },
  stack: { gap: 20 },
  mid: { flex: 0.8 },
  side: { width: SIDE },
});
