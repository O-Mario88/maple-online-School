import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { CompassDesk, CompassPhone } from '@/features/learner/careers/CompassViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** Career Compass (Premium): interests, careers, a roadmap, counselor sessions, programs, scholarships, applications, events and communities. */
export default function CareerCompassScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  // Real builds show the preview placeholder until the API serves Career Compass.
  if (!mock) return <PreviewScreen title="Career Compass">{() => null}</PreviewScreen>;
  const props = { cc: mock.learner.careerCompass, avatar: mock.learner.learnerHome.avatar, tab: typeof tab === 'string' ? tab : undefined };
  return wide ? <CompassDesk {...props} /> : <CompassPhone {...props} />;
}
