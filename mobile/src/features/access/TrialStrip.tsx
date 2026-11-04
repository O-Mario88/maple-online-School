import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Breakpoints, Radius, Spacing, type Theme, Type } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import { useAccess } from '@/lib/access/access-context';
import { type StripState, stripMessage } from '@/lib/access/strip';
import { dayLabel } from '@/lib/access/trial';

/** A slim strip over every page: browsing free, days left of the free month, or that it has ended, with the next step. */
export function TrialStrip() {
  const { styles, theme } = useStyles(makeStyles);
  const { access, guest } = useAccess();
  const phone = useWindowDimensions().width < Breakpoints.wide;
  if (!guest && (!access || access.phase === 'paid')) return null;
  const ended = !guest && access?.phase === 'locked';
  const state: StripState = guest ? { kind: 'guest' } : ended ? { kind: 'ended' } : { kind: 'trial', daysLeft: access?.daysLeft ?? 0, ends: dayLabel(access?.trialEnds ?? '') };
  const { text, action } = stripMessage(state, phone);
  const go = () => router.push(guest ? '/sign-up' : '/plans');
  return (
    <View style={[styles.strip, ended && styles.stripEnded]} accessibilityRole="summary">
      <Icon name={guest ? 'sparkle' : ended ? 'lock' : 'clock'} size={14} color={ended ? theme.danger : theme.accentText} />
      <Text style={[styles.text, ended && styles.textEnded]} numberOfLines={2}>
        {text}
      </Text>
      <Pressable style={[styles.button, ended && styles.buttonEnded]} onPress={go} accessibilityRole="button">
        <Text style={styles.buttonText}>{action}</Text>
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
