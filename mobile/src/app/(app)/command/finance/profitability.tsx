import { ProfitabilityDesk, ProfitabilityPhone } from '@/features/command/finance/ProfitabilityViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Unit Economics & Profitability (`/(command)/finance/profitability`). */
export default function ProfitabilityScreen() {
  return <CommandRoute desk={ProfitabilityDesk} phone={ProfitabilityPhone} title="Profitability" subtitle="Unit economics by region, curriculum and plan" />;
}
