/**
 * The Maple Design System's single source of truth: colour, type, spacing,
 * radius and control sizes. Every other token file (theme.ts, the public
 * Brand palette, the portal and Maple Command tokens) derives from this one,
 * and pages take their values from those, never from hex literals.
 *
 * This file has no imports, so plain-logic tests can load it.
 */

/**
 * Maple Blue is the only primary accent: a deep slate blue (Edwin's pick,
 * 6 Nov 2026), with white text at 9:1. Purple is not a Maple colour.
 */
export const Maple = {
  blue: '#2D4A6E',
  blueHover: '#223A58',
  /** Text and icons in blue on a light background (AA on white and blueSoft). */
  blueText: '#2D4A6E',
  blueSoft: '#EEF2F7',
  blueSelected: '#E2E9F2',
  blueLine: '#B8C6D8',
  /** Brand surfaces such as the command sidebar and hero panels. */
  navyDeep: '#0B1A3F',
  /** Secondary text on a Maple Blue panel (6:1). */
  onBlueMuted: '#C9D4E2',
  /** Hairlines and inset panels on a Maple Blue panel. */
  onBlueLine: 'rgba(255, 255, 255, 0.18)',
  onBlueTint: 'rgba(255, 255, 255, 0.08)',

  navy: '#101E45',
  body: '#253553',
  secondary: '#617089',
  /** Placeholders and quiet captions; meets AA on white for 13px and up. */
  muted: '#667085',
  /** Decorative icons, dividers and inactive dots; never for text that must be read. */
  faint: '#98A2B3',

  canvas: '#F6F8FC',
  surface: '#FFFFFF',
  subtle: '#F8FAFD',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  disabledSurface: '#E9EDF3',
  disabledText: '#98A2B3',
  disabledBorder: '#DDE3EB',

  success: '#159947',
  successText: '#0F7A38',
  successSoft: '#E7F6EC',
  warning: '#D97706',
  warningText: '#A15C07',
  warningSoft: '#FEF3E2',
  error: '#DC3545',
  errorText: '#B42318',
  errorSoft: '#FDECEE',

  // Accent: the warm gold for the one main action on a dark Maple Blue surface (a hero), and its rule.
  goldSoft: '#F5DFA9',
  goldHover: '#EDCF86',
  gold: '#C9952E',
  // The selected row in a list beside an accent (the open conversation).
  goldTint: '#FBF1DC',

  // The app store badges' own colours (their brand guidelines), used only by StoreButtons.
  storeGround: '#000000',
  storeLine: '#A6A6A6',
  playBlue: '#00A0FF',
  playGreen: '#00E676',
  playYellow: '#FFC400',
  playRed: '#FF3A44',

  white: '#FFFFFF',
  overlay: 'rgba(16, 30, 69, 0.45)',
} as const;

export type MapleColor = keyof typeof Maple;

/**
 * Categorical colours for charts and subject markers, where several series
 * must be told apart. Never use them for buttons, tabs or links.
 */
export const Categorical = {
  blue: '#2D4A6E',
  sky: '#6F93BD',
  teal: '#0E9384',
  green: '#159947',
  amber: '#D97706',
  red: '#DC3545',
  slate: '#617089',
  navy: '#101E45',
} as const;

/** 4px spacing scale. */
export const Space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

/**
 * Corner radii. Buttons, inputs and search are rounded rectangles (never
 * pills); cards are softer. `pill` is only for badges, chips and avatars.
 */
export const Radii = {
  control: 8,
  controlLarge: 10,
  card: 12,
  panel: 16,
  pill: 999,
} as const;

/** Control heights: 40 on desktop, 44-48 for touch and large actions. */
export const ControlHeight = { compact: 32, standard: 40, touch: 44, large: 48, search: 44 } as const;

/** Icon sizes and the one stroke width every interface icon uses. */
export const IconSize = { inline: 16, standard: 20, section: 24, feature: 28 } as const;
export const IconStroke = 1.85;

/** Tab indicator: blue text and a 3px blue underline. */
export const TabIndicator = { thickness: 3 } as const;

/** Semantic type roles (Inter). */
export const TypeScale = {
  pageTitle: { fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: -0.4 },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: '700', letterSpacing: -0.2 },
  cardTitle: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodySecondary: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  nav: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  button: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  kpi: { fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.4 },
  meta: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} as const;
