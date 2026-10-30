import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Grid } from '@/components/ui';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { PreviewScreen } from '@/features/preview/PreviewScreen';
import { useStyles } from '@/hooks/use-styles';

/** Inventory 23: 60-second revision clips from verified teachers. */
export default function ShortsScreen() {
  const { theme, styles } = useStyles(makeStyles);
  return (
    <PreviewScreen title="Maple Shorts" subtitle="One idea in 60 seconds, from verified teachers">
      {(m) => (
        <Grid min={220}>
          {m.learner.shorts.map((s) => (
            <View key={s.id} style={styles.card} accessible accessibilityLabel={`${s.title} by ${s.teacher}, ${s.seconds} seconds`}>
              <View style={styles.video}>
                <Icon name="play" size={40} color={theme.sidebarText} />
                <Text style={styles.duration}>0:{String(s.seconds).padStart(2, '0')}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.subject}>{s.subject}</Text>
                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.teacher}>
                  {s.teacher} · {s.likes.toLocaleString()} likes
                </Text>
                <View style={styles.actions}>
                  <Button label="Save to flashcards" compact variant="secondary" onPress={() => undefined} />
                  <Button label="Full course" compact variant="ghost" onPress={() => undefined} />
                </View>
              </View>
            </View>
          ))}
        </Grid>
      )}
    </PreviewScreen>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: { borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: t.border, backgroundColor: t.backgroundElement },
    video: { aspectRatio: 9 / 12, backgroundColor: t.sidebar, alignItems: 'center', justifyContent: 'center' },
    duration: { position: 'absolute', right: Spacing.two, bottom: Spacing.two, ...Type.caption, color: t.sidebarText },
    body: { padding: Spacing.three, gap: Spacing.one },
    subject: { ...Type.overline, color: t.accentText },
    title: { ...Type.bodyStrong, color: t.text },
    teacher: { ...Type.caption, color: t.textSecondary },
    actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.two },
  });
}
