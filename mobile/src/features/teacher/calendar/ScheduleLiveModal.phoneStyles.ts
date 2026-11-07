import { StyleSheet } from 'react-native';

import { scaleFonts } from '@/lib/scale-fonts';

import { styles } from './ScheduleLiveModal.styles';
import { Maple } from '@/constants/maple';

// The desktop pop-up is drawn on a scaled-down calendar, so its text is small. Shown 1:1 on a phone it needs larger text.
const PHONE_TEXT = { factor: 1.2, min: 11, max: 22 };

const scaled = scaleFonts(styles, PHONE_TEXT);

/** Whole styles (not overrides) for the phone sheet, so no desktop size, scale or flex value leaks through. */
const layout = StyleSheet.create({
  modalCard: {
    width: '100%',
    borderRadius: 16,
    backgroundColor: Maple.surface,
    borderWidth: 1,
    borderColor: Maple.border,
    overflow: 'hidden',
  },
  // One column: the form, then the conflict check and the buttons, each as tall as its content.
  modalBody: { flexDirection: 'column', gap: 14, padding: 12, backgroundColor: Maple.blueSoft },
  leftCol: { gap: 10 },
  rightCol: { gap: 10 },
  // The Date & Time heading and its One-time / Recurring switch share a row only when they fit.
  stepHeadBetween: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', rowGap: 8, columnGap: 8 },
  // Date, start time, length and timezone: two to a row.
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 10, columnGap: 8 },
  dateColWide: { flexGrow: 1, flexShrink: 0, flexBasis: '45%', gap: 4 },
  dateCol: { flexGrow: 1, flexShrink: 0, flexBasis: '45%', gap: 4 },
  dateColTz: { flexGrow: 1, flexShrink: 0, flexBasis: '45%', gap: 4 },
  selectBox: { ...styles.selectBox, height: 40 },
  // Taller boxes for the larger text; Android's own vertical padding would otherwise clip it.
  textInput: { ...scaled.textInput, height: 44, paddingVertical: 0 },
  textArea: { height: 72, paddingTop: 8, paddingBottom: 8, textAlignVertical: 'top' },
  phoneSheet: { flex: 1, backgroundColor: Maple.blueSoft },
  phoneScroll: { flex: 1 },
  phoneOverlayScroll: { padding: 12, paddingBottom: 24 },
});

export const phoneStyles = { ...scaled, ...layout };
