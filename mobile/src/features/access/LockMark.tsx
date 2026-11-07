import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Radius, type Theme } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';

/** A small lock mark for a card that won't open, or a Free mark for one that always does. */
export function LockMark({ locked, free }: { locked: boolean; free: boolean }) {
  const { styles, theme } = useStyles(makeStyles);
  if (free) {
    return (
      <View style={[styles.mark, styles.markFree]} accessibilityLabel="Free">
        <Text style={[styles.markText, { color: theme.success }]}>Free</Text>
      </View>
    );
  }
  if (!locked) return null;
  return (
    <View style={styles.mark} accessibilityLabel="Locked">
      <Icon name="lock" size={11} color={theme.text} />
      <Text style={styles.markText}>Locked</Text>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    mark: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      alignSelf: 'flex-start',
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: Radius.pill,
      backgroundColor: 'rgba(255,255,255,0.92)',
    },
    markFree: { backgroundColor: t.successSoft },
    markText: { fontSize: 11, fontWeight: '700', color: t.text },
  });
}
