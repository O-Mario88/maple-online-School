import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { BroadcastsDesk, BroadcastsPhone } from '@/features/command/views/CommsBroadcasts';

/** Maple Command › Communications › Broadcasts (`/(command)/communications/broadcasts`). */
export default function BroadcastsScreen() {
  return <CommandRoute desk={BroadcastsDesk} phone={BroadcastsPhone} title="Broadcasts" subtitle="Targeted messages on every channel" />;
}
