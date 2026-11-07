import { PayablesDesk, PayablesPhone } from '@/features/command/finance/PayablesViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Teacher Payables & Liability Register (`/(command)/finance/teacher-payables`). */
export default function TeacherPayablesScreen() {
  return <CommandRoute desk={PayablesDesk} phone={PayablesPhone} title="Teacher Payables" subtitle="Earnings, payouts, reserves, disputes and liability" />;
}
