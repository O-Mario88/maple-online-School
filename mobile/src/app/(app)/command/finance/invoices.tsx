import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { InvoicesDesk, InvoicesPhone } from '@/features/command/views/InvoicesViews';

/** Maple Command › Finance › Invoices (`/(command)/finance/invoices`). */
export default function InvoicesScreen() {
  return <CommandRoute desk={InvoicesDesk} phone={InvoicesPhone} title="Invoices" subtitle="Institution and learner billing" />;
}
