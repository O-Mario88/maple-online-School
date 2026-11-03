import { RosterDesk, RosterPhone } from '@/features/school/admin/RosterViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';
import { LiveRosters } from '@/features/school/live/LiveRosters';

/** Inventory 62: Smart CSV/Excel Bulk Roster Manager for students, teachers and parents (`/(school-admin)/rosters`). */
export default function RostersScreen() {
  return <AdminRoute desk={RosterDesk} phone={RosterPhone} live={LiveRosters} title="Roster Manager" subtitle="Import students, teachers and parents from a spreadsheet" />;
}
