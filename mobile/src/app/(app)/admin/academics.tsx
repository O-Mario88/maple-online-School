import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { AdminAcademicsDesk, AdminAcademicsPhone } from '@/features/school/academics/AdminAcademicsViews';
import { LiveAcademics } from '@/features/school/live/LiveAcademics';
import { mockApi } from '@/lib/mock';

/**
 * Inventory 61 and 60: Academic Structure, Terms, Grades & Subject Matrix (`/(school-admin)/academics`).
 * On the real API the design shows the school's own set-up; design builds (faked API) show its sample data.
 */
export default function AcademicsScreen() {
  const fake = useMemo(() => mockApi(), []);
  const { wide } = useShell();
  if (!fake) return <LiveAcademics />;
  const a = fake.portal.school.academics;
  return wide ? <AdminAcademicsDesk a={a} /> : <AdminAcademicsPhone a={a} />;
}
