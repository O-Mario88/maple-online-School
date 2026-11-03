import { LedgerDesk, LedgerPhone } from '@/features/command/finance/LedgerViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Corporate General Ledger (`/(command)/finance/accounting`). */
export default function AccountingScreen() {
  return <CommandRoute desk={LedgerDesk} phone={LedgerPhone} title="General Ledger" subtitle="Maple's own books, trial balance and periods" />;
}
