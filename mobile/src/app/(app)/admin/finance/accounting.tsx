import { AccountingDesk, AccountingPhone } from '@/features/school/admin/AccountingViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Full Institutional Accounting ERP Suite, Section 11A Tier 2 (`/(school-admin)/finance/accounting`). */
export default function AccountingScreen() {
  return <AdminRoute desk={AccountingDesk} phone={AccountingPhone} title="Accounting" subtitle="Chart of accounts, journals, payables, bank reconciliation and reports" />;
}
