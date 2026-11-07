import { ReceivablesDesk, ReceivablesPhone } from '@/features/command/finance/ReceivablesViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Enterprise Accounts Receivable (`/(command)/finance/receivables`). */
export default function ReceivablesScreen() {
  return <CommandRoute desk={ReceivablesDesk} phone={ReceivablesPhone} title="Enterprise Receivables" subtitle="Institutional contracts, invoices and collections" />;
}
