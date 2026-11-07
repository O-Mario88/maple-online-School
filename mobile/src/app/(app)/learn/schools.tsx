import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { SchoolNetworkDesk, SchoolNetworkPhone } from '@/features/learner/schools/SchoolNetworkViews';
import { mockData } from '@/lib/mock';
import { NetworkStatus, useLiveNetwork } from '@/lib/network/live';

/** The designed School Network on the API: listed schools, and the learner's own saves and applications. */
function LiveSchoolNetwork({ profile }: { profile?: string }) {
  const { wide } = useShell();
  const live = useLiveNetwork();
  if (!live.net) return <NetworkStatus pending={live.pending} error={live.error} />;
  const props = { net: live.net, profile, actions: live.network };
  return wide ? <SchoolNetworkDesk {...props} /> : <SchoolNetworkPhone {...props} />;
}

/** School Network: verified Maple schools to discover, compare and apply to, with exam centres, teaching vacancies and institution plans. */
export default function SchoolNetworkScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { profile: param } = useLocalSearchParams<{ profile?: string }>();
  const profile = typeof param === 'string' ? param : undefined;
  // Real builds run on the API; design builds keep the sample schools.
  if (!mock) return <LiveSchoolNetwork profile={profile} />;
  const props = { net: mock.learner.schoolNetwork, avatar: mock.learner.learnerHome.avatar, profile };
  return wide ? <SchoolNetworkDesk {...props} /> : <SchoolNetworkPhone {...props} />;
}
