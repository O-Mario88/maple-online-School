import { ReportsDesk, ReportsPhone } from '@/features/command/finance/ReportsViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Platform Financial Reports (`/(command)/finance/reports`). */
export default function ReportsScreen() {
  return <CommandRoute desk={ReportsDesk} phone={ReportsPhone} title="Financial Reports" subtitle="Auditable statements built from the ledger" />;
}
