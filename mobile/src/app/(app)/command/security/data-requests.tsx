import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { DataRequestsDesk, DataRequestsPhone } from '@/features/command/views/DataRequestViews';

/** Maple Command › Security › Data Requests Management (`/(command)/security/data-requests`). */
export default function DataRequestsScreen() {
  return <CommandRoute desk={DataRequestsDesk} phone={DataRequestsPhone} title="Data Requests" subtitle="Privacy requests: export, access, correction and deletion" />;
}
