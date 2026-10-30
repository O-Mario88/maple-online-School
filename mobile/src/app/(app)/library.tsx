import { useState } from 'react';

import { ErrorText, Screen } from '@/components/ui';
import { AddItemCard, AssignedCard, BrowseCard, ContinueCard, ShareCard } from '@/features/library/LibraryCards';
import { useMe } from '@/lib/auth/auth-context';
import { libraryChoices } from '@/lib/library/library';
import { isStaff } from '@/lib/roles';

/** The library (playbook section 5): assigned reading, continue, search, and for staff, adding and sharing. */
export default function LibraryScreen() {
  const me = useMe();
  const [openError, setOpenError] = useState<string | null>(null);
  const role = me.data?.role;
  const staff = me.data ? isStaff(me.data.memberships) || role === 'teacher' || role === 'admin' : false;
  const choices = me.data ? libraryChoices(me.data.memberships) : [];

  return (
    <Screen width="wide" title="Library" subtitle="Notes, guides and links for your classes">
      <ErrorText message={openError} />
      {role === 'student' || role === 'parent' ? <AssignedCard isStudent={role === 'student'} onError={setOpenError} /> : null}
      {role === 'student' ? <ContinueCard onError={setOpenError} /> : null}
      <BrowseCard onError={setOpenError} />
      {staff ? <AddItemCard choices={choices} /> : null}
      {staff ? <ShareCard /> : null}
    </Screen>
  );
}
