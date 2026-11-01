import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { Button, EmptyState } from '@/components/ui';
import { ClassroomView } from '@/features/classroom/ClassroomView';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { LightOnly } from '@/hooks/use-theme';
import { mockData } from '@/lib/mock';

/** Inventory 25: the live classroom: teacher on stage, everyone in the class, chat, notes, transcript and work. */
export default function ClassroomScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const mock = useMemo(() => mockData(), []);
  const room = mock?.shared.classroom;

  if (!mock || !room) return <PreviewScreen title="Live class">{() => null}</PreviewScreen>;
  if (slug && slug !== room.slug) {
    return (
      <LightOnly>
        <EmptyState
          icon="live"
          title="This class isn't live"
          body="It may have ended. Check your timetable for the next one."
          action={
            <Button
              label="Go home"
              variant="secondary"
              compact
              onPress={() => router.replace('/')}
            />
          }
        />
      </LightOnly>
    );
  }

  return <ClassroomView room={room} />;
}
