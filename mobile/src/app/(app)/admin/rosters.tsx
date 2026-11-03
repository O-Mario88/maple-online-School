import { RosterDesk, RosterPhone } from '@/features/school/admin/RosterViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Inventory 62: Smart CSV/Excel Bulk Roster Manager for students, teachers and parents (`/(school-admin)/rosters`). */
export default function RostersScreen() {
  return <AdminRoute desk={RosterDesk} phone={RosterPhone} title="Roster Manager" subtitle="Import students, teachers and parents from a spreadsheet" />;
}
