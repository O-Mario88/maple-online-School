import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { REF_WIDTH } from './types';
import { useUiScaleRef } from '@/lib/ui-scale';

/**
 * Lays its children out at the reference design's width (1536px unless given) and scales the
 * result to `width`, so desktop pages keep the reference's exact proportions
 * on any screen from about 1200px up.
 */
export function RefScale({ width, refWidth = REF_WIDTH, children }: { width: number; refWidth?: number; children: ReactNode }) {
  const [height, setHeight] = useState(0);
  const scale = width / refWidth;
  const scaled = useUiScaleRef(scale);
  return (
    // Until the content is measured the box keeps its natural height: a clipped box of no height is never drawn on phones, so it would never be measured.
    <View style={[styles.outer, { width, height: height ? height * scale : undefined }]}>
      <View ref={scaled} style={[styles.inner, { width: refWidth, transform: [{ scale }] }]} onLayout={(e) => setHeight(e.nativeEvent.layout.height)}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Centred in the room it is given (a page wider than the content width shows margins either side).
  outer: { overflow: 'hidden', alignSelf: 'center' },
  inner: { width: REF_WIDTH, transformOrigin: 'top left' },
});
