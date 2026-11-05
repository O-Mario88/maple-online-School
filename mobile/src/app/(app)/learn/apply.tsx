import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { ApplyDesk, ApplyPhone } from '@/features/learner/schools/ApplyViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';
import { NetworkStatus, useLiveNetwork } from '@/lib/network/live';

/** The designed application form on the API: the school's own form, sent only when the learner submits. */
function LiveApply({ id }: { id?: string }) {
  const { wide } = useShell();
  const live = useLiveNetwork();
  if (!live.net) return <NetworkStatus pending={live.pending} error={live.error} />;
  const school = live.net.schools.find((c) => c.id === id);
  if (!school) return <NetworkStatus pending={false} error={new Error('This school isn’t taking applications through the School Network.')} />;
  const props = { net: live.net, school, actions: live.apply };
  return wide ? <ApplyDesk key={school.id} {...props} /> : <ApplyPhone key={school.id} {...props} />;
}

/** Apply to a school in the School Network (`/learn/apply?school=`): four steps, saved as a draft until submitted. */
export default function ApplyScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { school: param } = useLocalSearchParams<{ school?: string }>();
  const id = typeof param === 'string' ? param : undefined;
  // Real builds run on the API; design builds keep the sample schools.
  if (!mock) return <LiveApply id={id} />;
  const net = mock.learner.schoolNetwork;
  const school = net.schools.find((c) => c.id === id) ?? net.schools.find((c) => c.id === net.apply.draft?.schoolId);
  if (!school) return <PreviewScreen title="Apply to a school">{() => null}</PreviewScreen>;
  const props = { net, school, avatar: mock.learner.learnerHome.avatar };
  return wide ? <ApplyDesk key={school.id} {...props} /> : <ApplyPhone key={school.id} {...props} />;
}
