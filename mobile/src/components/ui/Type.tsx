import type { ReactNode } from 'react';
import { type StyleProp, Text, type TextStyle } from 'react-native';

import { PAGE_TITLE } from '@/lib/fonts/type';
import { type TypeRoleName, type TypeTone, typeRole } from '@/lib/design-system/type-role';

interface TypeProps {
  /** What the text is: its size, weight and colour follow (constants/maple.ts TypeScale). */
  role: TypeRoleName;
  tone?: TypeTone;
  /** Lines before it ends in "…"; leave it out to wrap freely. */
  lines?: number;
  /** Layout only (margins, alignment): never font size or colour. */
  style?: StyleProp<Omit<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight' | 'color'>>;
  children: ReactNode;
}

/**
 * Maple's text. New screens write `<Type role="body">` instead of a font size, so type stays on one
 * scale. A page title is the page's h1; section and card titles are headings.
 */
export function Type({ role, tone = 'default', lines, style, children }: TypeProps) {
  const { style: base, heading } = typeRole(role, tone);
  const a11y = heading === 1 ? PAGE_TITLE : heading === 2 ? { accessibilityRole: 'header' as const } : null;
  return (
    <Text style={[base, style]} numberOfLines={lines} {...a11y}>
      {children}
    </Text>
  );
}
