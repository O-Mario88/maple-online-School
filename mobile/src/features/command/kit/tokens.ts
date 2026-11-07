import { Categorical, Maple } from '@/constants/maple';

/**
 * Maple Command's own colours on top of the portal palette: the dark navy sidebar and its
 * bright blue selection (Maple Command references, November 2026).
 */
export const SIDEBAR = Maple.navyDeep;
export const SIDEBAR_ACTIVE = Maple.blue;
export const SIDEBAR_TEXT = Maple.blueLine;

/** Chart colours the command references reuse across pages. */
export const CHART = {
  blue: Categorical.blue,
  lightBlue: Maple.blueLine,
  paleBlue: Maple.blueLine,
  green: Categorical.green,
  teal: Categorical.teal,
  /** Was purple; kept as a name so charts still get a distinct series. */
  purple: Categorical.navy,
  orange: Categorical.amber,
  red: Categorical.red,
  grey: Maple.blueLine,
} as const;
