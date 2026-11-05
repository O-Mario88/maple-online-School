import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { SchoolNetworkDesk, SchoolNetworkPhone } from '@/features/learner/schools/SchoolNetworkViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** School Network: verified Maple schools to discover, compare and apply to, with exam centres, teaching vacancies and institution plans. */
export default function SchoolNetworkScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { profile } = useLocalSearchParams<{ profile?: string }>();
  // Real builds show the preview placeholder until the API serves the School Network.
  if (!mock) return <PreviewScreen title="School Network">{() => null}</PreviewScreen>;
  const props = { net: mock.learner.schoolNetwork, avatar: mock.learner.learnerHome.avatar, profile: typeof profile === 'string' ? profile : undefined };
  return wide ? <SchoolNetworkDesk {...props} /> : <SchoolNetworkPhone {...props} />;
}
