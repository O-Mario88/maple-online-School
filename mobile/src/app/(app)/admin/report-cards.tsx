import { ReportCardsDesk, ReportCardsPhone } from '@/features/school/admin/ReportCardViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';
import { LiveReportCards } from '@/features/school/live/LiveReportCards';

/** Term Examinations, Moderation & Report Card Publisher (`/(school-admin)/report-cards`). */
export default function ReportCardsScreen() {
  return <AdminRoute desk={ReportCardsDesk} phone={ReportCardsPhone} live={LiveReportCards} title="Report Cards" subtitle="Marks, moderation, approval and signed term transcripts" />;
}
