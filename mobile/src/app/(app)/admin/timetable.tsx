import { TimetableDesk, TimetablePhone } from '@/features/school/admin/TimetableViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Master School Timetable & Zero-Collision Scheduler (`/(school-admin)/timetable`). */
export default function TimetableScreen() {
  return <AdminRoute desk={TimetableDesk} phone={TimetablePhone} title="Timetable" subtitle="Teachers, classes and rooms across the week, with no collisions" />;
}
