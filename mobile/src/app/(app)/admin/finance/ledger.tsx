import { LedgerDesk, LedgerPhone } from '@/features/school/admin/LedgerViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';
import { LiveLedger } from '@/features/school/live/LiveLedger';

/** Immutable Student Fee Sub-Ledger & Mobile-Money Reconciliation, Tier 1 (`/(school-admin)/finance/ledger`). */
export default function LedgerScreen() {
  return <AdminRoute desk={LedgerDesk} phone={LedgerPhone} live={LiveLedger} title="Student Ledger" subtitle="Each student's invoices, payments, adjustments and balance" />;
}
