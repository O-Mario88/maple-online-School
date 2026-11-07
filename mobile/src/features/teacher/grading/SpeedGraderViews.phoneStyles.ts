import { fill, hidden, phoneSheet, restyle, stacked, wrapped } from '@/lib/phone-sheet';

import { s } from './SpeedGraderViews.styles';

/** SpeedGraderViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneS = phoneSheet(s, {
  page: restyle(s.page, ['width']),
  subHeader: restyle(stacked(s.subHeader), [], { alignItems: 'flex-start', gap: 10 }),
  headerActions: wrapped(s.headerActions),
  // Queue, paper and rubric one under another.
  cols: stacked(s.cols),
  leftCol: fill(s.leftCol),
  centerCol: fill(s.centerCol),
  rightCol: fill(s.rightCol),
  // The queue is a sideways row of student cards.
  subList: { flexDirection: 'row', gap: 8 },
  subCard: restyle(s.subCard, [], { width: 250 }),
  paperBodyRow: restyle(s.paperBodyRow, ['flex']),
  paperSheet: restyle(s.paperSheet, ['flex'], { flexGrow: 1, flexShrink: 1, minWidth: 0 }),
  thumbsStrip: hidden,
  // The answer sheet stands in for a scanned page: it keeps its own handwriting sizes.
  qPrompt: s.qPrompt,
  partTitle: s.partTitle,
  handLine: s.handLine,
  redHandNote: s.redHandNote,
  greenHandNote: s.greenHandNote,
  greenCheckBig: s.greenCheckBig,
  yellowArrow: s.yellowArrow,
  yellowStickyText: s.yellowStickyText,
  extraStampText: s.extraStampText,
  stackedFracText: s.stackedFracText,
  drawToolbar: restyle(wrapped(s.drawToolbar), ['height']),
  // The sticky note goes under part (b)'s working instead of beside it.
  partBRow: restyle(stacked(s.partBRow), [], { alignItems: 'flex-start' }),
  pdfTopBar: wrapped(s.pdfTopBar),
});
