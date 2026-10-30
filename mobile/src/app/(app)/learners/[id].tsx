import { useLocalSearchParams } from 'expo-router';

import { Body, Screen } from '@/components/ui';
import { ClassInsightView } from '@/features/insights/ClassInsightView';

/** A class's learners, most in need first (inventory screen 46). */
export default function LearnersScreen() {
  const { id, title } = useLocalSearchParams<{ id: string; title?: string }>();
  const classId = Number(id);
  return (
    <Screen
      back
      width="wide"
      eyebrow={title ?? 'Your class'}
      title="Learners who need you"
      subtitle="From the last 30 days of attendance, work handed in and marks.">
      {Number.isInteger(classId) && classId > 0 ? <ClassInsightView classId={classId} /> : <Body muted>That class link isn't valid.</Body>}
    </Screen>
  );
}
