import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useShell } from '@/components/ui';
import { EXPLORE_REF_WIDTH, ExploreDesk, ExplorePhone } from '@/features/learner/explore/ExploreViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { HomeCanvas } from '@/features/learner/home/HomeFrame';
import { mockData } from '@/lib/mock';
import { Maple } from '@/constants/maple';
import { PageScroll } from '@/components/shell/PageScroll';

/** The learner's Explore & Learn page: courses, past papers, live classes, practice and the day's plan. */
export default function ExploreScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  // Real builds show the preview placeholder until the catalogue API lands.
  if (!mock) return <PreviewScreen title="Explore">{() => null}</PreviewScreen>;
  const d = mock.learner.explore;
  const h = mock.learner.learnerHome;
  if (!wide) return <ExplorePhone d={d} h={h} />;
  return (
    <PageScroll style={styles.deskBg}>
      <HomeCanvas refWidth={EXPLORE_REF_WIDTH}>
        <ExploreDesk d={d} h={h} />
      </HomeCanvas>
    </PageScroll>
  );
}

const styles = StyleSheet.create({ deskBg: { backgroundColor: Maple.blueSoft } });
