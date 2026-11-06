import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Radius, Spacing, type Theme } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import type { Tier } from '@/lib/access/trial';
import { Radii } from '@/constants/maple';

/** The plan each level is sold as. */
export const TIER_NAMES: Readonly<Record<Tier, string>> = { basic: 'Basic', pro: 'Pro Study Pass', premium: 'Premium + Tutoring' };

/** Where a feature above someone's plan would be: what it is, the plan that opens it, and a way to get that plan. */
export function UpgradeNote({ what, needs, compact = false }: { what: string; needs: Tier; compact?: boolean }) {
  const { styles, theme } = useStyles(makeStyles);
  const go = () => router.push(`/plans?need=${needs}` as Href);
  return (
    <View style={[styles.note, compact && styles.compact]} accessibilityRole="summary">
      <Icon name="lock" size={compact ? 16 : 20} color={theme.accentText} />
      <Text style={[styles.text, compact && styles.textCompact]}>
        <Text style={styles.strong}>{what}</Text>
        {` comes with ${TIER_NAMES[needs]}${needs === 'premium' ? '' : ' and above'}.`}
      </Text>
      <Pressable style={styles.button} onPress={go} accessibilityRole="button" accessibilityLabel={`Upgrade to ${TIER_NAMES[needs]}`}>
        <Text style={styles.buttonText}>Upgrade</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    note: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, padding: Spacing.three, borderRadius: Radius.md, borderWidth: 1, borderColor: t.border, backgroundColor: t.accentSoft },
    compact: { gap: Spacing.two, padding: Spacing.two },
    text: { flex: 1, fontSize: 14, lineHeight: 20, color: t.text },
    textCompact: { fontSize: 12.5, lineHeight: 17 },
    strong: { fontWeight: '600' },
    button: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radii.control, backgroundColor: t.accent },
    buttonText: { fontSize: 13, fontWeight: '600', color: t.onAccent },
  });
}
