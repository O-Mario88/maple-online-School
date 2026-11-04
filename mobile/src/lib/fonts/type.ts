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
