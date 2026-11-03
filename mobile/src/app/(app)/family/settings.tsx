import { router } from 'expo-router';
import { useMemo } from 'react';

import { Body, Button, Card, Loading, Row, Screen, useShell } from '@/components/ui';
import { ChildrenCard } from '@/features/parent/ChildrenCard';
import { SettingsDesk, SettingsPhone } from '@/features/parent/settings/SettingsViews';
import { useMe } from '@/lib/auth/auth-context';
import { mockData } from '@/lib/mock';

/** Settings on the real API: the family's children and how to link another. Digest and privacy switches wait for the API. */
function LiveFamilySettings() {
  const me = useMe();
  return (
    <Screen title="Settings" subtitle="Your children, and how to link another">
      {me.data ? <ChildrenCard user={me.data} /> : <Loading label="Loading your family" />}
      <Card title="Add a child" icon="qr">
        <Body muted>Scan the Parent Claim card from your child’s school, or type its 8-character code. The school confirms the link.</Body>
        <Button label="Link a child" icon="qr" onPress={() => router.push('/claim-child')} />
      </Card>
      <Card title="Privacy" icon="lock">
        <Row icon="lock" title="Privacy Policy" detail="What we keep about your family and why" onPress={() => router.push('/privacy')} />
      </Card>
    </Screen>
  );
}

/** Inventory 58 and 52: children, the Sunday digest and privacy. */
export default function FamilySettingsScreen() {
  const mock = useMemo(() => mockData(), []);
  const { wide } = useShell();
  if (!mock) return <LiveFamilySettings />;
  // Design builds show Verified Children & Guardian Notification Settings (`/(parent)/settings`).
  const p = mock.portal.parent;
  return wide ? <SettingsDesk p={p} /> : <SettingsPhone p={p} />;
}
