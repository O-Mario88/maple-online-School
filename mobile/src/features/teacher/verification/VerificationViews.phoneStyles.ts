import { fill, hidden, phoneSheet, restyle, stacked } from '@/lib/phone-sheet';

import { s } from './VerificationViews.styles';

/** VerificationViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneS = phoneSheet(s, {
  page: restyle(s.page, ['width']),
  body: stacked(s.body),
  centerCol: fill(s.centerCol),
  rightCol: fill(s.rightCol),
  // The four steps read as a vertical checklist.
  stepperCard: restyle(stacked(s.stepperCard), ['justifyContent'], { gap: 10 }),
  stepperArrow: hidden,
  // Each upload area above its requirements.
  uploadRow: stacked(s.uploadRow),
  bigDropzone: fill(s.bigDropzone),
  twoUploadBoxes: fill(s.twoUploadBoxes),
  checklistCol: fill(s.checklistCol),
  confirmFooter: restyle(stacked(s.confirmFooter), ['justifyContent'], { alignItems: 'stretch' }),
  confirmCheckRow: fill(s.confirmCheckRow),
});
