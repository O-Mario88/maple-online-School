import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { REF_WIDTH } from './types';

/**
 * Lays its children out at the reference design's width (1536px unless given) and scales the
 * result to `width`, so desktop pages keep the reference's exact proportions
 * on any screen from about 1200px up.
 */
export function RefScale({ width, refWidth = REF_WIDTH, children }: { width: number; refWidth?: number; children: ReactNode }) {
  const [height, setHeight] = useState(0);
  const scale = width / refWidth;
  return (
    <View style={[styles.outer, { width, height: height * scale }]}>
      <View style={[styles.inner, { width: refWidth, transform: [{ scale }] }]} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { overflow: 'hidden' },
  inner: { width: REF_WIDTH, transformOrigin: 'top left' },
});
