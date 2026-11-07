import { GrowthDesk, GrowthPhone } from '@/features/school/growth/GrowthViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** School Growth (`/(school-admin)/growth`): privacy-safe School Network totals, recommendations and admissions conversions. */
export default function AdminGrowthScreen() {
  return <AdminRoute desk={GrowthDesk} phone={GrowthPhone} title="School Growth" subtitle="Your School Network visibility, recommendations and conversions" />;
}
