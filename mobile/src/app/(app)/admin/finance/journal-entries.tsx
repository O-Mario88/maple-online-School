import { JournalDesk, JournalPhone } from '@/features/school/accounting/JournalViews';
import { AdminRoute } from '@/features/school/kit/AdminRoute';

/** School admin › Accounting › Journal Entries (`/(school-admin)/finance/journal-entries`). */
export default function JournalEntriesScreen() {
  return <AdminRoute desk={JournalDesk} phone={JournalPhone} title="Journal Entries" subtitle="Double-entry transactions for the school" />;
}
