import { Redirect } from 'expo-router';

import { FeesDesk, FeesPhone } from '@/features/school/admin/FeesViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Real builds run fees on the live Fees page: fee items, invoicing classes and recording payments. */
function LiveFees() {
  return <Redirect href="/fees" />;
}

/** School Finance Command & Fee Structures, Section 11A Tier 1 (`/(school-admin)/finance/fees`). */
export default function FeesScreen() {
  return <AdminRoute desk={FeesDesk} phone={FeesPhone} live={LiveFees} title="Fees & Finance" subtitle="Fee structures, collections, scholarships and arrears" />;
}
