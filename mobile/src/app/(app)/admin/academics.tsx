import { useMemo } from 'react';

import { useShell } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { AdminAcademicsDesk, AdminAcademicsPhone } from '@/features/school/academics/AdminAcademicsViews';
import { mockData } from '@/lib/mock';

/** Inventory 61 and 60: Academic Structure, Terms, Grades & Subject Matrix (`/(school-admin)/academics`). */
export default function AcademicsScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  if (!mock) {
    return (
      <PreviewScreen title="Academics" subtitle="Campuses, academic years, terms, grade streams, subjects, grading and competencies">
        {() => null}
      </PreviewScreen>
    );
  }
  const a = mock.portal.school.academics;
  return wide ? <AdminAcademicsDesk a={a} /> : <AdminAcademicsPhone a={a} />;
}
