import { TimetableDesk, TimetablePhone } from '@/features/school/admin/TimetableViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';
import { LiveTimetable } from '@/features/school/live/LiveTimetable';

/** Master School Timetable & Zero-Collision Scheduler (`/(school-admin)/timetable`). */
export default function TimetableScreen() {
  return <AdminRoute desk={TimetableDesk} phone={TimetablePhone} live={LiveTimetable} title="Timetable" subtitle="Teachers, classes and rooms across the week, with no collisions" />;
}
