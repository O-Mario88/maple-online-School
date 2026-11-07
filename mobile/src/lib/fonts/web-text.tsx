/**
 * On the web, the app's `Text` import (rewritten by Expo to react-native-web's own file) lands here; see metro.config.js.
 *
 * React Native Web ignores `adjustsFontSizeToFit`, so a one-line label that fits on a phone's
 * native text engine gets cut off with "…" in the browser. Here a one-line Text that asks to fit
 * measures itself and scales its font down (no further than `minimumFontScale`), as iOS and Android do.
 */
import { type ComponentProps, type ElementRef, forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, type Text as RNText } from 'react-native';

import { Text as MapleText } from './text';
import { fitProps, fitScale, headingLevel } from './type';

type TextProps = ComponentProps<typeof RNText>;
type TextRef = ElementRef<typeof RNText>;

/** Below this change in scale the text is left alone, so measuring never loops. */
const SCALE_STEP = 0.01;
/** React Native Web's default font size when a style sets none. */
const DEFAULT_FONT_SIZE = 14;

const FitText = forwardRef<TextRef, TextProps>(function FitText({ style, ...props }, ref) {
  const node = useRef<HTMLElement | null>(null);
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);
  const flat = StyleSheet.flatten(style) ?? {};
  const fontSize = typeof flat.fontSize === 'number' ? flat.fontSize : DEFAULT_FONT_SIZE;
  const { minimumFontScale } = props;

  const setNode = useCallback(
    (el: TextRef | null) => {
      node.current = el as unknown as HTMLElement | null;
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  useLayoutEffect(() => {
    const el = node.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const measure = () => {
      // Padding doesn't scale with the font, so compare the content box only.
      const cs = getComputedStyle(el);
      const padding = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      // The width the text needs at its full size, from what it needs at the current scale.
      const needed = (el.scrollWidth - padding) / scaleRef.current;
      const next = fitScale(el.clientWidth - padding, needed, minimumFontScale);
      if (Math.abs(next - scaleRef.current) < SCALE_STEP) return;
      scaleRef.current = next;
      setScale(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [props.children, fontSize, minimumFontScale]);

  return <MapleText ref={setNode} {...props} style={scale < 1 ? [style, { fontSize: fontSize * scale }] : style} />;
});

const Text = forwardRef<TextRef, TextProps>(function WebText(given, ref) {
  // A one-line figure ("UGX 185.6M") fits itself (see fitProps); a header is an h2 unless it asks for h1.
  const level = headingLevel(given as Parameters<typeof headingLevel>[0]);
  const props = { ...given, ...fitProps(given), ...(level === undefined ? null : { 'aria-level': level }) };
  if (props.adjustsFontSizeToFit && props.numberOfLines === 1) return <FitText ref={ref} {...props} />;
  return <MapleText ref={ref} {...props} />;
}) as unknown as typeof RNText;

export default Text;
