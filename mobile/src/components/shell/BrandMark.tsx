import { StyleSheet, Text, View } from 'react-native';

/** Maple's mark: the red maple leaf, as in the reference designs. Decorative. */
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <View style={[styles.mark, { width: size, height: size }]} accessible={false}>
      <Text style={{ fontSize: Math.round(size * 0.9), lineHeight: size }}>🍁</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
});
