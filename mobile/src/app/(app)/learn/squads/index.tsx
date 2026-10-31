import { useMemo } from 'react';

import { SquadRoom } from '@/features/learner/squad/SquadRoom';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** The learner's study squads: opens on their first squad. */
export default function SquadsScreen() {
  const mock = useMemo(() => mockData(), []);
  if (!mock) return <PreviewScreen title="Study squads">{() => null}</PreviewScreen>;
  const room = mock.learner.squadRoom;
  return <SquadRoom key={room.squads[0].id} room={room} squad={room.squads[0]} avatar={mock.learner.dashboard.avatar} />;
}
