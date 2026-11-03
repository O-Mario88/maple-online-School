import { ForecastDesk, ForecastPhone } from '@/features/command/finance/ForecastViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Financial Forecasting & Treasury Planning (`/(command)/finance/forecast`). */
export default function ForecastScreen() {
  return <CommandRoute desk={ForecastDesk} phone={ForecastPhone} title="Forecasting" subtitle="Revenue, costs, cash and runway" />;
}
