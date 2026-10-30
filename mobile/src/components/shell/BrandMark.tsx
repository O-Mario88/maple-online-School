import { StyleSheet, Text, View } from 'react-native';

import { Radius } from '@/constants/theme';
import { useStyles } from '@/hooks/use-styles';
import type { Theme } from '@/constants/theme';

/** Maple's mark: a maple-red tile with the M. Decorative. */
export function BrandMark({ size = 32 }: { size?: number }) {
  const { styles } = useStyles(makeStyles);
  return (
    <View style={[styles.mark, { width: size, height: size }]} accessible={false}>
      <Text style={[styles.letter, { fontSize: Math.round(size * 0.55) }]}>M</Text>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    mark: { borderRadius: Radius.md, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' },
    letter: { color: t.onAccent, fontWeight: '800', letterSpacing: -0.5 },
  });
}
