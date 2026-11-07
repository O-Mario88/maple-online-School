/**
 * Scaled frames (RefScale, the portal bars, the sign-in fit) draw a page at its reference size and
 * shrink it with a transform. On the web they publish that scale as a CSS variable, so the
 * click-area rule in global.css can keep every control's click area 24px on screen.
 */
import { useCallback } from 'react';
import { Platform } from 'react-native';

/** The CSS variable global.css reads. */
export const UI_SCALE_VAR = '--ui-scale';

interface StyledNode {
  style?: { setProperty?(name: string, value: string): void };
}

/** Writes the scale on a frame's DOM node; does nothing without one, or for a scale that isn't positive. */
export function applyUiScale(node: StyledNode | null, scale: number): void {
  if (!Number.isFinite(scale) || scale <= 0 || typeof node?.style?.setProperty !== 'function') return;
  node.style.setProperty(UI_SCALE_VAR, String(scale));
}

/** A ref for the scaled View: on the web it publishes `scale`; on iOS and Android it does nothing. */
export function useUiScaleRef(scale: number): (node: unknown) => void {
  return useCallback(
    (node: unknown) => {
      if (Platform.OS === 'web') applyUiScale(node as StyledNode | null, scale);
    },
    [scale],
  );
}
