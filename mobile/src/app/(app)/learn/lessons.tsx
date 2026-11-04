import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { VideoLessonsDesk, VideoLessonsPhone } from '@/features/learner/lessons/VideoLessonsViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** Video Lessons: every video lesson by subject, with what to continue, progress and the topic's learning path. ?subject= opens a subject. */
export default function VideoLessonsScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { subject } = useLocalSearchParams<{ subject?: string }>();
  // Real builds show the preview placeholder until the API serves video lessons.
  if (!mock) return <PreviewScreen title="Video lessons">{() => null}</PreviewScreen>;
  const props = { hub: mock.learner.videoHub, avatar: mock.learner.learnerHome.avatar, subject: typeof subject === 'string' ? subject : undefined };
  return wide ? <VideoLessonsDesk {...props} /> : <VideoLessonsPhone {...props} />;
}
