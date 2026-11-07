import { type FontRule, scaleFonts } from './scale-fonts';

/** Text on desktop pages drawn for a scaled canvas, shown 1:1 on a phone. */
const PHONE_TEXT: FontRule = { factor: 1.15, min: 11, max: 24 };

/** A copy of `style` without the `drop` keys, plus `add`: e.g. swap `flex: 1` for a flex-basis that can wrap. */
export function restyle<T extends object>(style: T, drop: readonly string[], add: object = {}): object {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) if (!drop.includes(key)) out[key] = value;
  return { ...out, ...add };
}

/**
 * The phone version of a desktop page's style sheet: every font scaled for 1:1 viewing, and the
 * `overrides` replacing whole styles (so no desktop width, flex or fixed size leaks through).
 */
export function phoneSheet<T extends Record<string, object>>(desk: T, overrides: Partial<Record<keyof T, object>>): T {
  const scaled = scaleFonts(desk, PHONE_TEXT);
  // A text style with a fixed width (a time or number column) widens with its text, so it doesn't break onto two lines.
  const widened: Record<string, object> = {};
  for (const [key, style] of Object.entries(scaled)) {
    const before = (desk[key] as { fontSize?: number }).fontSize;
    const { fontSize, width, height } = style as { fontSize?: number; width?: unknown; height?: unknown };
    if (typeof before !== 'number' || typeof fontSize !== 'number') {
      widened[key] = style;
      continue;
    }
    // A fixed height (an input's box) grows too, so the text isn't clipped; Android adds its own padding.
    const ratio = fontSize / before;
    widened[key] = {
      ...style,
      ...(typeof width === 'number' ? { width: Math.ceil(width * ratio) } : {}),
      ...(typeof height === 'number' ? { height: Math.ceil(height * ratio), paddingVertical: 0 } : {}),
    };
  }
  return { ...widened, ...overrides } as T;
}

/** A row turned into a column whose children fill its width. */
export const stacked = (style: object): object => restyle(style, ['flexDirection', 'flexWrap', 'alignItems']);

/** A row whose children move onto a new line when they run out of room. */
export const wrapped = (style: object, rowGap = 8): object => restyle(style, ['flexWrap'], { flexWrap: 'wrap', rowGap });

/** A child that takes its natural size in a stacked column (no desktop flex or fixed width). */
export const fill = (style: object): object => restyle(style, ['flex', 'width', 'minWidth']);

/** A child that takes half a wrapped row (two per line). */
export const half = (style: object): object => restyle(style, ['flex', 'width', 'minWidth'], { flexGrow: 1, flexBasis: '45%', minWidth: 0 });

/** A column hidden on phones (e.g. a table column that has no room). */
export const hidden = { display: 'none' } as const;
