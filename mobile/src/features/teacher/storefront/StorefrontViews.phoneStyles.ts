import { fill, phoneSheet, restyle, stacked, wrapped } from '@/lib/phone-sheet';

import { s } from './StorefrontViews.styles';

/** StorefrontViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneS = phoneSheet(s, {
  page: restyle(s.page, ['width']),
  body: stacked(s.body),
  centerCol: fill(s.centerCol),
  rightCol: fill(s.rightCol),
  cardHeaderRow: restyle(stacked(s.cardHeaderRow), ['justifyContent'], { alignItems: 'flex-start' }),
  cardHeaderBtns: wrapped(s.cardHeaderBtns),
  // Photo above the name fields.
  profileBasicsBody: restyle(stacked(s.profileBasicsBody), [], { alignItems: 'flex-start' }),
  profileFieldsCol: restyle(s.profileFieldsCol, ['flex'], { alignSelf: 'stretch' }),
  // Bio and intro video, subjects, and hours and promo: one under another.
  midSplitRow: stacked(s.midSplitRow),
  richBox: fill(s.richBox),
  subjectsGrid: stacked(s.subjectsGrid),
  subjectCard: fill(s.subjectCard),
  bottomSplitRow: stacked(s.bottomSplitRow),
  hoursTable: restyle(s.hoursTable, [], { width: 560 }),
  promoInnerCard: fill(s.promoInnerCard),
  previewCanvas: fill(s.previewCanvas),
  previewProfileStrip: wrapped(s.previewProfileStrip),
  previewCtaBtns: restyle(s.previewCtaBtns, [], { flexBasis: '100%' }),
  previewSubjectsRow: stacked(s.previewSubjectsRow),
  previewSubjectCard: fill(s.previewSubjectCard),
  previewHoursStrip: wrapped(s.previewHoursStrip),
  previewHourChip: restyle(s.previewHourChip, ['flex'], { flexGrow: 1, flexBasis: '22%' }),
});
