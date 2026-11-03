import { ChartDesk, ChartPhone } from '@/features/school/accounting/ChartViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** School admin › Accounting › Chart of Accounts (`/(school-admin)/finance/chart-of-accounts`). */
export default function ChartOfAccountsScreen() {
  return <AdminRoute desk={ChartDesk} phone={ChartPhone} title="Chart of Accounts" subtitle="Income, expense, asset, liability and equity accounts" />;
}
