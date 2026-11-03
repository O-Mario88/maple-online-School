import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAccess } from '@/lib/access/access-context';
import { dayLabel } from '@/lib/access/trial';

/** A slim strip over every page: days left of the free month, or that it has ended, with the way to pay. */
export function TrialStrip() {
  const { styles, theme } = useStyles(makeStyles);
  const { access } = useAccess();
  if (!access || access.phase === 'paid') return null;
  const ended = access.phase === 'locked';
  const text = ended
    ? 'Your free month has ended. Free resources still open.'
    : `Free trial: ${access.daysLeft} ${access.daysLeft === 1 ? 'day' : 'days'} left. Everything is open until ${dayLabel(access.trialEnds)}.`;
  return (
    <View style={[styles.strip, ended && styles.stripEnded]} accessibilityRole="summary">
      <Icon name={ended ? 'lock' : 'clock'} size={14} color={ended ? theme.danger : theme.accentText} />
      <Text style={[styles.text, ended && styles.textEnded]} numberOfLines={2}>
        {text}
      </Text>
      <Pressable style={[styles.button, ended && styles.buttonEnded]} onPress={() => router.push('/plans')} accessibilityRole="button">
        <Text style={styles.buttonText}>{ended ? 'Pay to continue' : 'Choose a plan'}</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    strip: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: 6,
      backgroundColor: t.accentSoft,
    },
    stripEnded: { backgroundColor: t.dangerSoft },
    text: { ...Type.caption, color: t.accentText, fontWeight: '600', flexShrink: 1 },
    textEnded: { color: t.danger },
    button: { paddingHorizontal: Spacing.three, paddingVertical: 4, borderRadius: Radius.pill, backgroundColor: t.accent },
    buttonEnded: { backgroundColor: t.danger },
    buttonText: { ...Type.caption, color: t.onAccent, fontWeight: '700' },
  });
}
