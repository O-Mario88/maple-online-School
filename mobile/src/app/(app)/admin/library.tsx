import { Redirect } from 'expo-router';

import { LibraryDesk, LibraryPhone } from '@/features/school/admin/LibraryViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** Real builds keep one library for everyone: staff add items to the school's private library there. */
function LiveLibrary() {
  return <Redirect href="/learn/library" />;
}

/** Institutional Private Library & Curriculum Repository, with the public library and school-to-school sharing (`/(school-admin)/library`). */
export default function LibraryScreen() {
  return <AdminRoute desk={LibraryDesk} phone={LibraryPhone} live={LiveLibrary} title="Library" subtitle="Your school's textbooks, past papers and lesson plans" />;
}
