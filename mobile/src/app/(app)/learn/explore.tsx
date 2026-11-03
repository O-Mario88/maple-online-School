import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { EXPLORE_REF_WIDTH, ExploreDesk, ExplorePhone } from '@/features/learner/explore/ExploreViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { RefScale } from '@/features/public/home/RefScale';
import { mockData } from '@/lib/mock';

/** The learner's Explore & Learn page: courses, past papers, live classes, practice and the day's plan. */
export default function ExploreScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  // Real builds show the preview placeholder until the catalogue API lands.
  if (!mock) return <PreviewScreen title="Explore">{() => null}</PreviewScreen>;
  const d = mock.learner.explore;
  const h = mock.learner.learnerHome;
  if (!wide) return <ExplorePhone d={d} h={h} />;
  return (
    <ScrollView style={styles.deskBg}>
      <RefScale width={width} refWidth={EXPLORE_REF_WIDTH}>
        <ExploreDesk d={d} h={h} />
      </RefScale>
    </ScrollView>
  );
}

const styles = StyleSheet.create({ deskBg: { backgroundColor: '#EEF3FA' } });
