import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { RevenueDesk, RevenuePhone } from '@/features/command/views/RevenueViews';

/** Maple Command › Platform Revenue, Escrow & Commission Ledger, Section 11B (`/(command)/finance/revenue`). */
export default function RevenueScreen() {
  return <CommandRoute desk={RevenueDesk} phone={RevenuePhone} title="Revenue" subtitle="Settlement batches, teacher escrow and Maple net revenue" />;
}
