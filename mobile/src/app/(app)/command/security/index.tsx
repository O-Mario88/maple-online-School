import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { SecurityDesk, SecurityPhone } from '@/features/command/views/SecurityViews';

/** Maple Command › Security: incidents, RLS tenant audit and escalations (`/(command)/security`). */
export default function SecurityScreen() {
  return <CommandRoute desk={SecurityDesk} phone={SecurityPhone} title="Security" subtitle="Privileged actions, cross-tenant alerts, privacy requests and escalations" />;
}
