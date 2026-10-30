import { router } from 'expo-router';

import { Button, Heading, Screen } from '@/components/ui';
import { FamilyInvoicesCard, SchoolFeesCards } from '@/features/finance/FeesCards';
import { useMe } from '@/lib/auth/auth-context';
import { financeSchools } from '@/lib/finance/fees';

/** School fees (playbook section 11A): families pay; the school bills and records payments. */
export default function FeesScreen() {
  const me = useMe();
  const role = me.data?.role;
  const schools = me.data ? financeSchools(me.data.memberships) : [];

  return (
    <Screen>
      <Button label="Back" variant="secondary" onPress={() => router.back()} />
      <Heading>Fees</Heading>
      {role === 'student' || role === 'parent' ? <FamilyInvoicesCard /> : null}
      {schools.map((s) => (
        <SchoolFeesCards key={s.id} school={s} />
      ))}
    </Screen>
  );
}
