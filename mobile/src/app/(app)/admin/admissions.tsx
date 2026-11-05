import { AdmissionsDesk, AdmissionsPhone } from '@/features/school/admissions/AdmissionsViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Admissions & Leads (`/(school-admin)/admissions`): consent-based inquiries, the pipeline, applications, enrolments and campaigns. */
export default function AdminAdmissionsScreen() {
  return <AdminRoute desk={AdmissionsDesk} phone={AdmissionsPhone} title="Admissions & Leads" subtitle="Inquiries, applications, enrolments and campaigns" />;
}
