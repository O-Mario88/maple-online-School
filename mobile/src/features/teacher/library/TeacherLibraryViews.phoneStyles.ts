import { fill, half, hidden, phoneSheet, restyle, stacked, wrapped } from '@/lib/phone-sheet';

import { s } from './TeacherLibraryViews.styles';

/** TeacherLibraryViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneS = phoneSheet(s, {
  page: restyle(s.page, ['width']),
  body: stacked(s.body),
  centerCol: fill(s.centerCol),
  rightCol: fill(s.rightCol),
  headerRow: restyle(stacked(s.headerRow), ['justifyContent'], { alignItems: 'flex-start' }),
  headerBtns: wrapped(s.headerBtns),
  // Categories, sub-folders and files two to a row.
  categoriesRow: wrapped(s.categoriesRow),
  categoryTile: half(s.categoryTile),
  explorerSplit: stacked(s.explorerSplit),
  // The folder tree is a desktop side panel; the sub-folder cards cover it on phones.
  foldersPanel: hidden,
  filesGridPanel: fill(s.filesGridPanel),
  gridControlsRow: wrapped(s.gridControlsRow),
  searchBox: restyle(s.searchBox, ['flex'], { flexGrow: 1, flexBasis: '100%' }),
  fourColRow: wrapped(s.fourColRow),
  subFolderCard: half(s.subFolderCard),
  fileCard: half(s.fileCard),
  collectionsHeader: restyle(stacked(s.collectionsHeader), ['justifyContent'], { alignItems: 'flex-start' }),
  collectionsRow: stacked(s.collectionsRow),
  collectionCard: fill(s.collectionCard),
});
