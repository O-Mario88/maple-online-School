import { type ReactNode, useState } from 'react';
import { StyleSheet, View } from 'react-native';

interface FitWidthProps {
  /** The width and height the children are laid out at, e.g. the whiteboard at its phone size. */
  refWidth: number;
  refHeight: number;
  /** Stops it growing too big on tablets; it is centred when narrower than its box. */
  maxScale?: number;
  children: ReactNode;
}

/**
 * Lays its children out at a fixed size and scales them to the width it is given.
 * The height is known up front, so it works on iOS and Android, where measuring a
 * scaled child's height never reports back.
 */
export function FitWidth({ refWidth, refHeight, maxScale = 1.2, children }: FitWidthProps) {
  const [width, setWidth] = useState(0);
  const shown = Math.min(width, refWidth * maxScale);
  const scale = shown / refWidth;
  // Scaling shrinks the box around its centre; these shifts move its top-left corner back to the origin.
  const shiftX = (refWidth * (scale - 1)) / 2;
  const shiftY = (refHeight * (scale - 1)) / 2;
  return (
    <View style={styles.row} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <View style={[styles.clip, { width: shown, height: refHeight * scale }]}>
          <View style={{ width: refWidth, height: refHeight, transform: [{ translateX: shiftX }, { translateY: shiftY }, { scale }] }}>
            {children}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center' },
  clip: { overflow: 'hidden' },
});
