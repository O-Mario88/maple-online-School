import { Button, Card, Field, Grid, KeyValue, Row, ToggleRow } from '@/components/ui';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { router } from 'expo-router';

/** Inventory 58 and 52: children, the Sunday digest and privacy. */
export default function FamilySettingsScreen() {
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
