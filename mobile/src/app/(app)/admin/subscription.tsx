import { SubscriptionDesk, SubscriptionPhone } from '@/features/school/subscription/SubscriptionViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Settings › Subscription & Billing (`/(school-admin)/subscription`): plan, learner capacity, usage, invoices and billing settings. */
export default function AdminSubscriptionScreen() {
  return <AdminRoute desk={SubscriptionDesk} phone={SubscriptionPhone} title="Subscription & Billing" subtitle="Your plan, learner capacity, usage, invoices and payments" />;
}
