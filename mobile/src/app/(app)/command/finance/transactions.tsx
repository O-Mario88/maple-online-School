import { TransactionsDesk, TransactionsPhone } from '@/features/command/finance/TransactionsViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Payment Transactions Centre (`/(command)/finance/transactions`). */
export default function TransactionsScreen() {
  return <CommandRoute desk={TransactionsDesk} phone={TransactionsPhone} title="Payment Transactions Centre" subtitle="Payments across every provider" />;
}
