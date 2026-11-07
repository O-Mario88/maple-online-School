import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { OverviewDesk, OverviewPhone } from '@/features/command/views/OverviewViews';

/** Maple Command › Executive Overview: the North-Star metrics, retention, live classes and growth (`/(command)/overview`). */
export default function CommandOverviewScreen() {
  return <CommandRoute desk={OverviewDesk} phone={OverviewPhone} title="Executive Overview" subtitle="North-Star metrics, retention, live classes and growth" />;
}
