import { router } from 'expo-router';
import { useMemo } from 'react';

import { Body, Button, Card, Field, Grid, KeyValue, Loading, Row, Screen, ToggleRow } from '@/components/ui';
import { ChildrenCard } from '@/features/parent/ChildrenCard';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
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
  const design = useMemo(() => mockData() != null, []);
  return design ? <DesignSettings /> : <LiveFamilySettings />;
}

function DesignSettings() {
  return (
    <PreviewScreen title="Settings" subtitle="Your children, how we reach you, and what others can see">
      {(m) => {
        const s = m.family.settings;
        return (
          <Grid min={320}>
            <Card title="Your children" icon="people">
              {m.family.children.map((c) => (
                <Row key={c.id} icon="person" title={c.name} detail={`${c.class} · ${c.school}`} />
              ))}
              <Button label="Add a child with the school's QR code" icon="qr" variant="secondary" onPress={() => router.push('/claim-child')} />
              <Field label="Or enter the 8-character claim code" placeholder="e.g. 7KQ2-M9XA" autoCapitalize="characters" />
            </Card>
            <Card title="Sunday digest" subtitle="A weekly summary on WhatsApp" icon="bell">
              <KeyValue
                items={[
                  { label: 'Phone', value: s.digestPhone },
                  { label: 'When', value: s.digestDay },
                ]}
              />
              {s.channels.map((c) => (
                <ToggleRow key={c.label} label={c.label} initial={c.on} />
              ))}
            </Card>
            <Card title="Privacy" icon="lock">
              {s.privacy.map((c) => (
                <ToggleRow key={c.label} label={c.label} initial={c.on} />
              ))}
            </Card>
          </Grid>
        );
      }}
    </PreviewScreen>
  );
}
