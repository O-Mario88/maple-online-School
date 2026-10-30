import { router } from 'expo-router';
import { useMemo } from 'react';

import { Badge, Body, Button, Card, ProgressBar } from '@/components/ui';
import { mockData } from '@/lib/mock';

/**
 * Inventory 18 (learner home): "your next 20 minutes", the one thing to do
 * now and why. Design builds only; renders nothing without mock data.
 */
export function NextUpHero() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) return null;
  const n = mock.learner.nextUp;
  const s = mock.learner.streak;
  return (
    <Card title={`Your next ${n.minutes} minutes`} subtitle={`${n.subject} · ${n.title}`} icon="sparkle">
      <Body muted>{n.reason}</Body>
      <ProgressBar label={`${s.minutesToday} of ${s.goalMinutes} minutes today · ${s.days}-day streak`} value={s.minutesToday / s.goalMinutes} tone="good" />
      <Button label="Start now" icon="play" onPress={() => router.push(`/learn/lesson?id=${n.lessonId}`)} />
      <Badge label="Design preview · sample data" tone="info" />
    </Card>
  );
}
