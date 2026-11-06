import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { PlanDesk, PlanPhone } from '@/features/learner/plan/PlanViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** My Personalized Learning Plan: the learner's goal, journey, subjects, career path, this week's focus and what to watch next. */
export default function LearningPlanScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  // Real builds show the preview placeholder until the API serves learning plans.
  if (!mock) return <PreviewScreen title="My learning plan">{() => null}</PreviewScreen>;
  const props = { plan: mock.learner.learnerPlan, lessons: mock.learner.videoHub.lessons, avatar: mock.learner.learnerHome.avatar, tab: typeof tab === 'string' ? tab : undefined };
  return wide ? <PlanDesk {...props} /> : <PlanPhone {...props} />;
}
