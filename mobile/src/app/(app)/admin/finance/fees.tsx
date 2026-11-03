import { FeesDesk, FeesPhone } from '@/features/school/admin/FeesViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** School Finance Command & Fee Structures, Section 11A Tier 1 (`/(school-admin)/finance/fees`). */
export default function FeesScreen() {
  return <AdminRoute desk={FeesDesk} phone={FeesPhone} title="Fees & Finance" subtitle="Fee structures, collections, scholarships and arrears" />;
}
