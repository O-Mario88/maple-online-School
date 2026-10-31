import { useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

import { NoSquad, SquadRoom } from '@/features/learner/squad/SquadRoom';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** One study squad's room, by its id. */
export default function SquadScreen() {
  const mock = useMemo(() => mockData(), []);
  const { id } = useLocalSearchParams<{ id: string }>();
  if (!mock) return <PreviewScreen title="Study squad">{() => null}</PreviewScreen>;
  const room = mock.learner.squadRoom;
  const squad = room.squads.find((q) => q.id === id);
  if (!squad) return <NoSquad />;
  return <SquadRoom key={squad.id} room={room} squad={squad} avatar={mock.learner.dashboard.avatar} />;
}
