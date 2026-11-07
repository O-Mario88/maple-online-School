import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

import { useShell } from '@/components/ui';
import { AcademicsDesk, AcademicsPhone, AcademicsTablet } from '@/features/parent/academics/AcademicsViews';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { mockData } from '@/lib/mock';

/** Below this width a wide screen gets the tablet reference (no sidebar). */
const DESK_FROM = 1280;

/** Child Assignments, Grades & Digital Report Cards (`/(parent)/academics`). */
export default function FamilyAcademicsScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  const { width } = useWindowDimensions();
  if (!mock) {
    return (
      <PreviewScreen title="Academics" subtitle="Homework, released marks, teacher feedback and report cards">
        {() => null}
      </PreviewScreen>
    );
  }
  const p = mock.portal.parent;
  if (!wide) return <AcademicsPhone p={p} />;
  return width >= DESK_FROM ? <AcademicsDesk p={p} /> : <AcademicsTablet p={p} />;
}
