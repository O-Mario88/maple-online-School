import { fill, hidden, phoneSheet, restyle, stacked, wrapped } from '@/lib/phone-sheet';

import { s } from './ClassSpacesViews.styles';

/** ClassSpacesViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneS = phoneSheet(s, {
  page: restyle(s.page, ['width']),
  body: stacked(s.body),
  centerCol: fill(s.centerCol),
  rightCol: fill(s.rightCol),
  headerRow: restyle(stacked(s.headerRow), ['justifyContent'], { alignItems: 'flex-start' }),
  // Create-a-class and invite-your-principal cards one under another.
  topSplitRow: stacked(s.topSplitRow),
  createCard: fill(s.createCard),
  principalCard: fill(s.principalCard),
  formRow: stacked(s.formRow),
  joinMethodsRow: stacked(s.joinMethodsRow),
  joinMethodCard: fill(s.joinMethodCard),
  tableTopBar: restyle(stacked(s.tableTopBar), ['justifyContent'], { alignItems: 'stretch' }),
  tableControls: wrapped(s.tableControls),
  searchBox: restyle(s.searchBox, ['width'], { flexGrow: 1 }),
  // The classes table keeps the class and its status; the rest needs a wider screen.
  colStudents: hidden,
  colJoin: hidden,
  colTerm: hidden,
  colActions: hidden,
  colStatus: { width: 84 },
  paginationRow: wrapped(s.paginationRow),
});
