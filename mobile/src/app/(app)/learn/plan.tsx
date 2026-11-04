import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { PlanDesk, PlanPhone } from '@/features/learner/plan/PlanViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** My Personalized Learning Plan: the learner's goal, journey, subjects, this week's focus and what to watch next. */
export default function LearningPlanScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  // Real builds show the preview placeholder until the API serves learning plans.
  if (!mock) return <PreviewScreen title="My learning plan">{() => null}</PreviewScreen>;
  const props = { plan: mock.learner.learnerPlan, lessons: mock.learner.videoHub.lessons, avatar: mock.learner.learnerHome.avatar };
  return wide ? <PlanDesk {...props} /> : <PlanPhone {...props} />;
}
