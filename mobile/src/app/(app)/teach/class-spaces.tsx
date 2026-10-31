import { StyleSheet, Text, View } from 'react-native';

import { Badge, Banner, Button, Card, Grid } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import { toast } from '@/lib/toast';
import { shareText } from '@/lib/save-text';

/** Inventory 47: free class spaces a teacher sets up with a 6-digit code. */
export default function ClassSpacesScreen() {
  const { styles } = useStyles(makeStyles);
  return (
    <PreviewScreen
      title="Class spaces"
      subtitle="Set up a free class in two minutes and invite learners with a code"
      actions={<Button label="New class space" icon="plus" compact onPress={() => toast('New class space created. Add learners with a code or QR.')} />}>
      {(m) => (
        <>
          <Grid min={300}>
            {m.teacher.classSpaces.map((c) => (
              <Card key={c.id} title={c.name} subtitle={c.school} icon="people" action={c.pending ? <Badge label={`${c.pending} to approve`} tone="warning" /> : undefined}>
                <View style={styles.code}>
                  <Text style={styles.codeLabel}>Join code</Text>
                  <Text style={styles.codeValue}>{c.code}</Text>
                </View>
                <Text style={styles.members}>{c.members} learners</Text>
                <View style={styles.actions}>
                  <Button label="Share on WhatsApp" compact onPress={() => shareText('Join my class on Maple')} />
                  <Button label="Show QR" icon="qr" compact variant="secondary" onPress={() => toast('Showing the join QR full screen for learners to scan.')} />
                </View>
              </Card>
            ))}
          </Grid>
          <Banner tone="info" title="Invite your headteacher" body="When three teachers at a school use class spaces, the school can upgrade and keep every class." />
        </>
      )}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    code: { padding: Spacing.three, borderRadius: Radius.md, backgroundColor: t.backgroundSelected, alignItems: 'center', gap: 2 },
    codeLabel: { ...Type.caption, color: t.textMuted },
    codeValue: { ...Type.display, color: t.text, letterSpacing: 4, fontVariant: ['tabular-nums'] },
    members: { ...Type.small, color: t.textSecondary },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  });
}
