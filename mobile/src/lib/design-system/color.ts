/**
 * Colour maths for the design system: WCAG contrast and hue, used by the
 * token tests and the source guards that keep pages on Maple's palette.
 */

export interface Hsl {
  hue: number;
  saturation: number;
  lightness: number;
}

/** Parses #RGB, #RRGGBB or #RRGGBBAA (alpha ignored) into 0-255 channels. */
export function parseHex(hex: string): [number, number, number] {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw.slice(0, 6);
  if (!/^[0-9a-fA-F]{6}$/.test(full)) {
    throw new Error(`Not a hex colour: ${hex}`);
  }
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number];
}

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** WCAG 2.2 contrast ratio between two colours (1 to 21). */
export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function toHsl(hex: string): Hsl {
  const [r, g, b] = parseHex(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return { hue: 0, saturation: 0, lightness };
  const d = max - min;
  const saturation = lightness > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue: number;
  if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  return { hue: hue * 60, saturation, lightness };
}

/** Purple, violet or lavender: the hues Maple no longer uses. */
export function isPurple(hex: string): boolean {
  const { hue, saturation } = toHsl(hex);
  return hue >= 245 && hue <= 320 && saturation > 0.25;
}

/** A saturated mid blue that could pass for a primary accent. */
export function isAccentBlue(hex: string): boolean {
  const { hue, saturation, lightness } = toHsl(hex);
  return hue >= 205 && hue < 245 && saturation > 0.6 && lightness > 0.35 && lightness < 0.65;
}
