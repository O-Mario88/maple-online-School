/** Text size rule: multiply by `factor`, then keep within `min` and `max`. */
export interface FontRule {
  factor: number;
  min: number;
  max: number;
}

interface TextStyle {
  fontSize?: number;
  lineHeight?: number;
}

/**
 * A copy of a style sheet with every font size (and its line height) scaled by the rule.
 * Used where a layout drawn for a scaled-down desktop canvas is shown 1:1 on a phone,
 * so its small text stays readable. Styles without text are returned as they were.
 */
export function scaleFonts<T extends Record<string, object>>(sheet: T, rule: FontRule): T {
  const out: Record<string, object> = {};
  for (const [key, style] of Object.entries(sheet)) {
    const { fontSize, lineHeight } = style as TextStyle;
    if (typeof fontSize !== 'number') {
      out[key] = style;
      continue;
    }
    const size = Math.min(Math.max(fontSize * rule.factor, rule.min), rule.max);
    const ratio = size / fontSize;
    out[key] = {
      ...style,
      fontSize: Math.round(size * 10) / 10,
      ...(typeof lineHeight === 'number' ? { lineHeight: Math.round(lineHeight * ratio * 10) / 10 } : {}),
    };
  }
  return out as T;
}
