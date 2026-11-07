import { ContractsDesk, ContractsPhone } from '@/features/command/finance/ContractsViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Contracts & Commercial Agreements (`/(command)/finance/contracts`). */
export default function ContractsScreen() {
  return <CommandRoute desk={ContractsDesk} phone={ContractsPhone} title="Contracts" subtitle="School pricing, terms, commissions and renewals" />;
}
