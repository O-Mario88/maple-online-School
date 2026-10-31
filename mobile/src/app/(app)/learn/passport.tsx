import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Badge, Button, Card, Grid, Row, Table } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import { saveText, sharePage } from '@/lib/save-text';

/** Inventory 33: the lifetime learning passport, verified records apart from self-study. */
export default function PassportScreen() {
  const { theme, styles } = useStyles(makeStyles);
  return (
    <PreviewScreen title="Learning Passport" subtitle="Your record for life: verified by schools, plus what you learned on your own">
      {(m) => {
        const p = m.learner.passport;
        return (
          <>
            <View style={styles.pass}>
              <View style={styles.flex}>
                <Text style={styles.over}>Maple Learning Passport</Text>
                <Text style={styles.name}>{p.learner}</Text>
                <Text style={styles.id}>{p.id}</Text>
              </View>
              <View style={styles.qr} accessibilityLabel="QR code to verify this passport">
                <Icon name="qr" size={64} color={theme.sidebar} />
              </View>
            </View>
            <View style={styles.actions}>
              <Button label="Share with QR" icon="qr" compact onPress={() => sharePage('My Maple Learning Passport')} />
              <Button label="Download PDF" icon="download" variant="secondary" compact onPress={() => saveText(`learning-passport-${p.id}.txt`, `Maple Learning Passport\n${p.learner}\n${p.id}`)} />
            </View>
            <Card title="Verified school records" subtitle="Signed by the school; can't be edited" icon="check">
              <Table
                rows={p.records}
                rowKey={(r) => r.term}
                columns={[
                  { key: 'term', label: 'Term', render: (r) => r.term },
                  { key: 'school', label: 'School', flex: 1.5, render: (r) => r.school },
                  { key: 'class', label: 'Class', render: (r) => r.class },
                  { key: 'avg', label: 'Average', align: 'right', render: (r) => `${r.average}%` },
                  { key: 'v', label: 'Status', align: 'right', render: () => <Badge label="Verified" tone="good" /> },
                ]}
              />
            </Card>
            <Grid min={320}>
              <Card title="Certificates" icon="star">
                {p.certificates.map((c) => (
                  <Row key={c.credential} icon="star" title={c.title} detail={`${c.issuer} · ${c.date} · ${c.credential}`} />
                ))}
              </Card>
              <Card title="Self-study" subtitle="Not verified by a school" icon="book">
                {p.selfStudy.map((s) => (
                  <Row key={s.title} icon="book" title={s.title} detail={`${s.hours} hours`} badge={s.completed ? <Badge label="Completed" tone="good" /> : <Badge label="In progress" />} />
                ))}
              </Card>
            </Grid>
          </>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    pass: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four, padding: Spacing.four, borderRadius: 20, backgroundColor: t.sidebar },
    over: { ...Type.overline, color: t.accent },
    name: { ...Type.title, color: t.sidebarText },
    id: { ...Type.small, color: t.sidebarMuted, fontVariant: ['tabular-nums'] },
    qr: { width: 96, height: 96, borderRadius: Radius.md, backgroundColor: t.sidebarText, alignItems: 'center', justifyContent: 'center' },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  });
}
