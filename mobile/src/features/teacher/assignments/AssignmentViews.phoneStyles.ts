import { fill, half, phoneSheet, restyle, stacked, wrapped } from '@/lib/phone-sheet';

import { s } from './AssignmentViews.styles';

/** AssignmentViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneS = phoneSheet(s, {
  page: restyle(s.page, ['width']),
  body: stacked(s.body),
  main: fill(s.main),
  headerRow: restyle(stacked(s.headerRow), ['justifyContent'], { alignItems: 'flex-start' }),
  // Type, settings and preview columns one under another.
  cols: stacked(s.cols),
  leftCol: fill(s.leftCol),
  centerCol: fill(s.centerCol),
  rightCol: fill(s.rightCol),
  previewStatsRow: wrapped(s.previewStatsRow),
  previewStatBox: half(s.previewStatBox),
});
