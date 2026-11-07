import { ExpensesDesk, ExpensesPhone } from '@/features/command/finance/ExpensesViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Corporate Expenses & Accounts Payable (`/(command)/finance/expenses`). */
export default function ExpensesScreen() {
  return <CommandRoute desk={ExpensesDesk} phone={ExpensesPhone} title="Corporate Expenses" subtitle="Operating costs and accounts payable" />;
}
