import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar, Badge, Button, Card, Field, Grid, Row } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';
import { formatMoney } from '@/lib/finance/fees';

/** Inventory 48 (and 5, the public view): your @teacher page, rates and promotions. */
export default function StorefrontScreen() {
  const { styles } = useStyles(makeStyles);
  const [bio, setBio] = useState('');
  return (
    <PreviewScreen title="Storefront" subtitle="Your public page, prices and promotions">
      {(m) => {
        const s = m.teacher.storefront;
        return (
          <Grid min={340}>
            <Card title="Edit" icon="person">
              <Field label="Headline" value={s.headline} editable={false} />
              <Field label="About you" value={bio || s.bio} onChangeText={setBio} multiline />
              <Field label="Tutoring rate (per hour)" value={formatMoney(s.hourlyUGX, 'UGX')} editable={false} />
              <Row icon="globe" title="Direct link, 0% commission" detail={s.directLink} />
              {s.vouchers.map((v) => (
                <Row key={v.code} icon="star" title={v.code} detail={`${v.detail} · used ${v.uses} times`} />
              ))}
              <Button label="Save" icon="check" onPress={() => undefined} />
            </Card>
            <Card title="How learners see it" icon="globe">
              <View style={styles.preview}>
                <Avatar name={s.name} size={64} />
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.handle}>{s.handle}</Text>
                {s.verified ? <Badge label="Verified educator" tone="good" /> : null}
                <Text style={styles.headline}>{s.headline}</Text>
                <Text style={styles.bio}>{bio || s.bio}</Text>
                <Button label={`Book a lesson · ${formatMoney(s.hourlyUGX, 'UGX')}/h`} onPress={() => router.push('/checkout')} />
              </View>
              {s.courses.map((c) => (
                <Row key={c} icon="book" title={c} />
              ))}
            </Card>
          </Grid>
        );
      }}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    preview: { alignItems: 'center', gap: Spacing.two, padding: Spacing.four, borderRadius: Radius.lg, backgroundColor: t.backgroundSelected },
    name: { ...Type.title, color: t.text },
    handle: { ...Type.small, color: t.textSecondary },
    headline: { ...Type.small, color: t.text, textAlign: 'center' },
    bio: { ...Type.small, color: t.textSecondary, textAlign: 'center' },
  });
}
