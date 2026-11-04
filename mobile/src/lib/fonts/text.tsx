/**
 * Text and TextInput that start in Inter and take Maple's heading, subheading and body weights
 * (see type.ts). The app gets them through react-native.js (iOS and Android) and web-text*.tsx
 * (web) without importing anything new; see metro.config.js.
 */
import { type ComponentProps, createContext, type ElementRef, forwardRef, useContext } from 'react';
import { Text as RNText, TextInput as RNTextInput, StyleSheet } from 'react-native';

import { textStyle } from './type';

/** True inside a Text, so nested text inherits its parent's font instead of resetting to Inter. */
const InsideText = createContext(false);

type Flat = { fontFamily?: string; fontWeight?: string | number; fontSize?: number };

export const Text = forwardRef<ElementRef<typeof RNText>, ComponentProps<typeof RNText>>(function MapleText({ style, ...props }, ref) {
  const nested = useContext(InsideText);
  const { base, after } = textStyle((StyleSheet.flatten(style) ?? {}) as Flat, nested);
  const text = <RNText ref={ref} {...props} style={base || after ? [base, style, after] : style} />;
  return nested ? text : <InsideText.Provider value>{text}</InsideText.Provider>;
}) as unknown as typeof RNText;

export const TextInput = forwardRef<ElementRef<typeof RNTextInput>, ComponentProps<typeof RNTextInput>>(function MapleTextInput({ style, ...props }, ref) {
  const { base, after } = textStyle((StyleSheet.flatten(style) ?? {}) as Flat, false);
  return <RNTextInput ref={ref} {...props} style={base || after ? [base, style, after] : style} />;
}) as unknown as typeof RNTextInput;
