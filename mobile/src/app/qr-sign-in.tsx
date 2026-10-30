import { StyleSheet, Text, View } from 'react-native';

import { Body, Button, Card, Row } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';

const GRID = 11;
const CELL = 18;
// A QR code stays black on white in both themes so phone cameras can read it.
const QR_PAPER = '#ffffff';
const QR_INK = '#111111';

/** A stand-in QR pattern: three corner squares and scattered dots. */
function isDark(i: number): boolean {
  const r = Math.floor(i / GRID);
  const c = i % GRID;
  const corner = (r < 3 && c < 3) || (r < 3 && c >= GRID - 3) || (r >= GRID - 3 && c < 3);
  if (corner) return !(r % (GRID - 2) === 1 && c % (GRID - 2) === 1);
  return ((i * 2654435761) >>> 0) % 7 < 3;
}

/** Inventory 4: sign in on a shared computer by scanning a code with your phone, no password typed. */
export default function QrSignInScreen() {
  const { styles } = useStyles(makeStyles);
  return (
    <PreviewScreen back title="Sign in with your phone" subtitle="No password typed on a shared computer" width="narrow">
      {(m) => {
        const q = m.publicPages.qrSignIn;
        return (
          <>
            <Card title={q.device} icon="qr">
              <View style={styles.qr} accessibilityLabel={`Sign-in code ${q.code}`} accessible>
                {Array.from({ length: GRID * GRID }, (_, i) => (
                  <View key={i} style={[styles.cell, isDark(i) && styles.on]} />
                ))}
              </View>
              <Text style={styles.code}>{q.code}</Text>
              <Body muted>{`Open Maple on your phone, tap Scan, and point it here. The code changes in ${q.expiresInSeconds} seconds.`}</Body>
            </Card>
            <Card title="Signing in on a phone?" icon="lock">
              <Row icon="person" title="Use your email and password instead" />
              <Button label="Back to sign in" variant="secondary" compact onPress={() => undefined} />
            </Card>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    qr: { width: GRID * CELL + Spacing.two * 2, height: GRID * CELL + Spacing.two * 2, flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', padding: Spacing.two, borderRadius: Radius.lg, backgroundColor: QR_PAPER },
    cell: { width: CELL, height: CELL },
    on: { backgroundColor: QR_INK },
    code: { ...Type.title, color: t.text, textAlign: 'center', letterSpacing: 4 },
  });
}
