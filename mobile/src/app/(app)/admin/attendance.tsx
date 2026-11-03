import { AttendanceDesk, AttendancePhone } from '@/features/school/admin/AttendanceViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

export default function AttendanceScreen() {
  return <AdminRoute desk={AttendanceDesk} phone={AttendancePhone} title="Attendance & QR" subtitle="Gate check-in and check-out, lesson punctuality and exceptions" />;
}
