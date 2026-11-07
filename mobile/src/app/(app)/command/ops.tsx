import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { OpsDesk, OpsPhone } from '@/features/command/views/OpsViews';

/** Maple Command › System Operations, LiveKit Health & River Job Queues (`/(command)/ops`). */
export default function OpsScreen() {
  return <CommandRoute desk={OpsDesk} phone={OpsPhone} title="Operations" subtitle="API latency, database, job queues and live class quality" />;
}
