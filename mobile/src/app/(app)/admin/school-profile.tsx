import { AdminRoute } from '@/features/school/kit/AdminRoute';
import { SchoolProfileDesk, SchoolProfilePhone } from '@/features/school/profile/ProfileViews';

/** School Profile Management (`/(school-admin)/school-profile`): the school's public School Network profile, edited, previewed and published. */
export default function AdminSchoolProfileScreen() {
  return <AdminRoute desk={SchoolProfileDesk} phone={SchoolProfilePhone} title="School Profile" subtitle="Your public profile on the Maple School Network" />;
}
