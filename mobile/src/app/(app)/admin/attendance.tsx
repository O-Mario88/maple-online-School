import { AttendanceDesk, AttendancePhone } from '@/features/school/admin/AttendanceViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';
import { LiveAttendanceMonitor } from '@/features/school/live/LiveAttendanceMonitor';

export default function AttendanceScreen() {
  return <AdminRoute desk={AttendanceDesk} phone={AttendancePhone} live={LiveAttendanceMonitor} title="Attendance & QR" subtitle="Gate check-in and check-out, lesson punctuality and exceptions" />;
}
