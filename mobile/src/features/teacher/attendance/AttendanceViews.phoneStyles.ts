import { fill, half, hidden, phoneSheet, restyle, stacked, wrapped } from '@/lib/phone-sheet';

import { s } from './AttendanceViews.styles';

/** AttendanceViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneS = phoneSheet(s, {
  page: restyle(s.page, ['width']),
  body: stacked(s.body),
  // The class sub-menu is a desktop side panel; on phones the page title says where you are.
  leftSide: hidden,
  centerCol: fill(s.centerCol),
  rightCol: fill(s.rightCol),
  headerRow: restyle(stacked(s.headerRow), ['justifyContent'], { alignItems: 'flex-start' }),
  metaRow: wrapped(s.metaRow),
  kpiRow: wrapped(s.kpiRow),
  kpiCard: half(s.kpiCard),
  tableCard: fill(s.tableCard),
  tableTopBar: restyle(stacked(s.tableTopBar), ['justifyContent'], { alignItems: 'stretch' }),
  // The register keeps the checkbox, student and status; the rest needs a wider screen.
  colNum: hidden,
  colEngage: hidden,
  colTime: hidden,
  colDur: hidden,
  colAct: hidden,
  colStatus: { width: 150, paddingRight: 4 },
  paginationRow: wrapped(s.paginationRow),
  overrideSelectsRow: wrapped(s.overrideSelectsRow),
  videoControlsBottomRow: wrapped(s.videoControlsBottomRow),
});
