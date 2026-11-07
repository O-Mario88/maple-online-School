import { SettlementsDesk, SettlementsPhone } from '@/features/command/finance/SettlementsViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Settlement Reconciliation (`/(command)/finance/settlements`). */
export default function SettlementsScreen() {
  return <CommandRoute desk={SettlementsDesk} phone={SettlementsPhone} title="Settlement Reconciliation" subtitle="Provider batches matched to bank deposits" />;
}
