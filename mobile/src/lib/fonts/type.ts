/**
 * Maple's type: Inter on every device, in the standard four weights —
 * 700 for headings, 600 for subheadings, 500 for labels and buttons, 400 for body text. Pages keep their
 * own sizes and any font they set on purpose (monospace, serif, handwriting);
 * these rules only pick the family and even out the weights.
 */

/** The family every text starts in (loaded at start-up, see inter.ts). */
export const INTER = 'Inter';

/** From this size, semibold or heavier text is a heading. */
const HEADING_SIZE = 24;
/** From this size up to a heading, semibold or heavier text is a subheading; below it, a label. */
const SUBHEADING_SIZE = 16;
/** The weight from which text counts as set heavy (semibold and up). */
const HEAVY = 600;

const HEADING = '700';
const SUBHEADING = '600';
const LABEL = '500';
const BODY = '400';

/** The weights text is drawn in. */
export type DrawnWeight = typeof HEADING | typeof SUBHEADING | typeof LABEL | typeof BODY;

type Weight = string | number | undefined;

function weightValue(weight: Weight): number {
  if (weight === undefined || weight === 'normal') return 400;
  if (weight === 'bold') return 700;
  const n = Number(weight);
  return Number.isFinite(n) ? n : 400;
}

/** The weight text is drawn at, or undefined to keep the one it set (medium stays medium). */
export function typeWeight(weight: Weight, size: number | undefined): DrawnWeight | undefined {
  const w = weightValue(weight);
  if (w <= 400) return BODY;
  if (w < HEAVY) return undefined;
  const s = size ?? 0;
  if (s >= HEADING_SIZE) return HEADING;
  if (s >= SUBHEADING_SIZE) return SUBHEADING;
  return LABEL;
}

/** A word set heavy inside a sentence: 600, so it stands out against 400 body text (700 at heading sizes). */
function emphasis(weight: Weight, size: number | undefined): DrawnWeight | undefined {
  if (weight === undefined) return undefined;
  if (weightValue(weight) < HEAVY) return typeWeight(weight, size);
  return (size ?? 0) >= HEADING_SIZE ? HEADING : SUBHEADING;
}

interface FlatText {
  fontFamily?: string;
  fontWeight?: Weight;
  fontSize?: number;
}

/**
 * What a Text adds around its own style: Inter underneath (unless it sets a font or sits
 * inside other text, which it then inherits from), and the even weight on top.
 */
export function textStyle(flat: FlatText, nested: boolean): { base: { fontFamily: string } | null; after: { fontWeight: DrawnWeight } | null } {
  const base = nested || flat.fontFamily ? null : { fontFamily: INTER };
  // Text inside other text inherits its parent's weight unless it sets one, as emphasis.
  const weight = nested ? emphasis(flat.fontWeight, flat.fontSize) : typeWeight(flat.fontWeight, flat.fontSize);
  return { base, after: weight ? { fontWeight: weight } : null };
}

/** React Native's default smallest scale for adjustsFontSizeToFit. */
const DEFAULT_MIN_FONT_SCALE = 0.5;

/**
 * How much to scale one line of text so it fits its box: 1 when it already fits, otherwise
 * just enough to fit, but never below `minimumFontScale`.
 */
export function fitScale(available: number, needed: number, minimumFontScale: number | undefined): number {
  if (available <= 0 || needed <= 0 || needed <= available) return 1;
  return Math.max(minimumFontScale ?? DEFAULT_MIN_FONT_SCALE, available / needed);
}

/** How far a figure may shrink to stay whole. */
const FIGURE_MIN_FONT_SCALE = 0.6;
/** An amount, count or percentage: an optional currency code or sign, digits, and a unit. */
const FIGURE = /^[+\-−]?(?:[A-Z]{3} ?|[$€£])?[\d][\d.,]*(?: ?[KMB%]|\s?\/\s?\d+)?$/;

/** True for text that is a figure ("UGX 185.6M", "1,200,000", "92%"), which must never be cut off. */
export function isFigure(text: string): boolean {
  return FIGURE.test(text.trim());
}

/** The text a Text's children spell, when they are only strings and numbers. */
function plainText(children: unknown): string | null {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children) && children.every((c) => typeof c === 'string' || typeof c === 'number')) return children.join('');
  return null;
}

interface FitInput {
  numberOfLines?: number;
  adjustsFontSizeToFit?: boolean;
  children?: unknown;
}

/**
 * Extra props for one line of text that is a figure: it shrinks to fit (as adjustsFontSizeToFit
 * does) instead of ending in "…". A screen that set adjustsFontSizeToFit itself keeps its choice.
 */
export function fitProps({ numberOfLines, adjustsFontSizeToFit, children }: FitInput): { adjustsFontSizeToFit?: true; minimumFontScale?: number } {
  if (numberOfLines !== 1 || adjustsFontSizeToFit !== undefined) return {};
  const text = plainText(children);
  return text !== null && isFigure(text) ? { adjustsFontSizeToFit: true, minimumFontScale: FIGURE_MIN_FONT_SCALE } : {};
}

interface HeadingInput {
  accessibilityRole?: string;
  role?: string;
  'aria-level'?: number;
}

/**
 * Props for a page's title: its one level-1 heading (an h1 on the web, a header on iOS and Android).
 * React Native's types have no `aria-level`, so it is added here once instead of cast on every page.
 */
export const PAGE_TITLE = { accessibilityRole: 'header', ...({ 'aria-level': 1 } as object) } as { accessibilityRole: 'header' };

/**
 * The heading level a Text draws on the web. React Native Web makes every header an h1, which left
 * pages with a dozen h1s; a header that names no level is a section heading (h2) instead.
 */
export function headingLevel(props: HeadingInput): number | undefined {
  const heading = props.accessibilityRole === 'header' || props.role === 'heading';
  if (!heading) return undefined;
  return props['aria-level'] ?? 2;
}
