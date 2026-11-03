import { LibraryDesk, LibraryPhone } from '@/features/school/admin/LibraryViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Institutional Private Library & Curriculum Repository, with the public library and school-to-school sharing (`/(school-admin)/library`). */
export default function LibraryScreen() {
  return <AdminRoute desk={LibraryDesk} phone={LibraryPhone} title="Library" subtitle="Your school's textbooks, past papers and lesson plans" />;
}
