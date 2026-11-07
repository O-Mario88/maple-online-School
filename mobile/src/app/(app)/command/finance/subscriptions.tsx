import { CommandRoute } from '@/features/command/kit/CommandRoute';
import { SubscriptionsDesk, SubscriptionsPhone } from '@/features/command/finance/SubscriptionsViews';

/** Maple Command › Finance › Subscription Management (`/(command)/finance/subscriptions`). */
export default function SubscriptionsScreen() {
  return <CommandRoute desk={SubscriptionsDesk} phone={SubscriptionsPhone} title="Subscription Management" subtitle="Plans, renewals and recurring revenue" />;
}
