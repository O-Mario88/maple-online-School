import { useMemo } from 'react';

import { ClassroomView } from '@/features/classroom/ClassroomView';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** Inventory 25: Learner Live Session Interface (active live lesson or bootcamp using LiveKit). */
export default function LiveRoomScreen() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) {
    return (
      <PreviewScreen
        title="Live class"
        subtitle="Teacher on stage, live whiteboard, lesson notes, transcript, assignments, participants and class chat">
        {() => null}
      </PreviewScreen>
    );
  }
  return <ClassroomView room={mock.shared.classroom} />;
}
