import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { PayoutsDesk, PayoutsPhone } from '@/features/command/views/PayoutsViews';

/** Maple Command › Teacher Payout Approvals, Disbursals & Dispute Center (`/(command)/finance/payouts`). */
export default function PayoutsScreen() {
  return <CommandRoute desk={PayoutsDesk} phone={PayoutsPhone} title="Payouts" subtitle="Dual-admin payout approvals, disbursals, retries and disputes" />;
}
