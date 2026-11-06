import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { CounselingCall } from '@/features/learner/careers/CounselingCall';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** A one-to-one counseling call (`/counseling/:session`), full screen, outside the app shell. */
export default function CounselingCallScreen() {
  const { session } = useLocalSearchParams<{ session: string }>();
  const mock = useMemo(() => mockData(), []);
  // Real builds show the preview placeholder until the API issues counseling rooms.
  if (!mock) return <PreviewScreen title="Counseling session">{() => null}</PreviewScreen>;
  return <CounselingCall cc={mock.learner.careerCompass} sessionId={String(session)} />;
}
