import { IntegrationsDesk, IntegrationsPhone } from '@/features/command/finance/IntegrationsViews';
import { CommandRoute } from '@/features/command/kit/CommandRoute';

/** Maple Command › Finance › Financial Integrations (`/(command)/finance/integrations`). */
export default function IntegrationsScreen() {
  return <CommandRoute desk={IntegrationsDesk} phone={IntegrationsPhone} title="Financial Integrations" subtitle="Banks, gateways, exports and webhooks" />;
}
