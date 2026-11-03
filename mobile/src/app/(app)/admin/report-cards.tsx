import { ReportCardsDesk, ReportCardsPhone } from '@/features/school/admin/ReportCardViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Term Examinations, Moderation & Report Card Publisher (`/(school-admin)/report-cards`). */
export default function ReportCardsScreen() {
  return <AdminRoute desk={ReportCardsDesk} phone={ReportCardsPhone} title="Report Cards" subtitle="Marks, moderation, approval and signed term transcripts" />;
}
