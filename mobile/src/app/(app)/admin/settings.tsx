import { SettingsDesk, SettingsPhone } from '@/features/school/admin/SettingsViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Tenant Roles, Permissions, Subscription & Audit Log (`/(school-admin)/settings`). */
export default function AdminSettingsScreen() {
  return <AdminRoute desk={SettingsDesk} phone={SettingsPhone} title="Settings" subtitle="Staff roles and permissions, your plan and the activity log" />;
}
