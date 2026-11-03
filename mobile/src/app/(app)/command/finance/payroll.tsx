import { PayrollDesk, PayrollPhone } from '@/features/command/finance/PayrollViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Corporate Payroll (`/(command)/finance/payroll`). */
export default function PayrollScreen() {
  return <CommandRoute desk={PayrollDesk} phone={PayrollPhone} title="Corporate Payroll" subtitle="Salaries, deductions, approvals and statutory payments" />;
}
