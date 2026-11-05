import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { ApplyDesk, ApplyPhone } from '@/features/learner/schools/ApplyViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** Apply to a school in the School Network (`/learn/apply?school=`): four steps, saved as a draft until submitted. */
export default function ApplyScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { school: id } = useLocalSearchParams<{ school?: string }>();
  // Real builds show the preview placeholder until the API serves School Network applications.
  if (!mock) return <PreviewScreen title="Apply to a school">{() => null}</PreviewScreen>;
  const net = mock.learner.schoolNetwork;
  const school = net.schools.find((c) => c.id === id) ?? net.schools.find((c) => c.id === net.apply.draft.schoolId);
  if (!school) return <PreviewScreen title="Apply to a school">{() => null}</PreviewScreen>;
  const props = { net, school, avatar: mock.learner.learnerHome.avatar };
  return wide ? <ApplyDesk key={school.id} {...props} /> : <ApplyPhone key={school.id} {...props} />;
}
