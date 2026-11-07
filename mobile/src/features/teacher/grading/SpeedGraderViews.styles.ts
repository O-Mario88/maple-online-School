import { StyleSheet } from 'react-native';

import { BLUE, BODY, INK, LINE, MUTED } from '@/features/teacher/frame/TeacherParts';

/** Styles for SpeedGraderViews (kept apart so the view file stays readable). */
export const SPEED_GRADER_REF_WIDTH = 1220;

export const s = StyleSheet.create({
  page: {
    width: SPEED_GRADER_REF_WIDTH,
    padding: 12,
    gap: 10,
    backgroundColor: '#EAF1FB',
  },

  /* Sub-Header */
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  backBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: BLUE,
  },
  titleBlock: {
    gap: 1,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  assignTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: INK,
  },
  assignMeta: {
    fontSize: 10,
    color: BODY,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  counterArrow: {
    width: 28,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBox: {
    paddingHorizontal: 10,
    height: 32,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: LINE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    fontSize: 11,
    fontWeight: '600',
    color: INK,
  },
  studentViewBtn: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
  },
  studentViewText: {
    fontSize: 11,
    fontWeight: '600',
    color: INK,
  },
  postGradesBtn: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: BLUE,
  },
  postGradesText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* 3-Column Studio */
  cols: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },

  /* Left Column */
  leftCol: {
    width: 242,
    padding: 8,
    gap: 7,
  },
  queueTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    gap: 4,
  },
  queueTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  queueTabOn: {
    borderBottomColor: BLUE,
  },
  queueTabText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: BODY,
  },
  queueTabTextOn: {
    color: BLUE,
    fontWeight: '700',
  },
  queueFilterRow: {
    flexDirection: 'row',
    gap: 5,
  },
  queueSearchBox: {
    flex: 1,
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#F8FAFC',
  },
  queueSearchInput: {
    flex: 1,
    fontSize: 9.5,
    color: INK,
    paddingVertical: 0,
  },
  statusFilterBtn: {
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
  },
  statusFilterText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: INK,
  },
  subList: {
    gap: 5,
  },
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    padding: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
  },
  subCardActive: {
    backgroundColor: '#EBF3FF',
    borderColor: BLUE,
    borderWidth: 1.5,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxOn: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  checkboxActiveOutline: {
    borderColor: BLUE,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  handFractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedFrac: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  stackedFracText: {
    fontSize: 10.5,
    lineHeight: 11,
    color: '#1E293B',
    fontFamily: 'Georgia',
  },
  stackedFracBar: {
    width: 11,
    height: 1.2,
    backgroundColor: '#1E293B',
    marginVertical: 0.5,
  },
  checkboxTick: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  subTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subName: {
    fontSize: 10.5,
    fontWeight: '700',
    color: INK,
  },
  subTime: {
    fontSize: 8.5,
    color: MUTED,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  scorePillStrong: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  scorePillMax: {
    fontSize: 9,
    color: BODY,
  },
  statusTag: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
  },
  statusTagText: {
    fontSize: 8.5,
    fontWeight: '700',
  },

  /* Center Column: Paper & Screen-Draw Studio */
  centerCol: {
    flex: 1,
    padding: 10,
    gap: 8,
    minWidth: 0,
  },
  pdfTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pdfRedIcon: {
    width: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfRedIconText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pdfName: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
  },
  pdfPageMeta: {
    fontSize: 9,
    color: MUTED,
  },
  pdfControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pdfCtrlBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomSelect: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#F8FAFC',
  },
  zoomSelectText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: INK,
  },

  /* Draw Toolbar */
  drawToolbar: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#F8FAFC',
  },
  drawToolBtn: {
    width: 26,
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawToolBtnOn: {
    backgroundColor: '#DBEAFE',
  },
  pointerGlyph: {
    fontSize: 12,
    fontWeight: '800',
    color: BODY,
  },
  penStack: {
    alignItems: 'center',
    gap: 1,
  },
  penUnderline: {
    width: 12,
    height: 2.5,
    borderRadius: 1,
  },
  shapeSquare: {
    width: 11,
    height: 11,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 2,
  },
  shapeCircle: {
    width: 11,
    height: 11,
    borderWidth: 1.5,
    borderColor: INK,
    borderRadius: 6,
  },
  textToolGlyph: {
    fontSize: 12,
    fontWeight: '800',
    color: INK,
  },
  toolDivider: {
    width: 1,
    height: 16,
    backgroundColor: LINE,
    marginHorizontal: 2,
  },
  clearBtn: {
    height: 22,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: INK,
  },
  aiToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiToggleLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: INK,
  },
  switchTrack: {
    width: 30,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#94A3B8',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: BLUE,
  },
  switchThumb: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#FFFFFF',
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },

  /* Scanned Paper + Thumbnails */
  paperBodyRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  paperSheet: {
    flex: 1,
    backgroundColor: '#FDFDFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    justifyContent: 'space-between',
  },
  qPrompt: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    fontFamily: 'serif',
  },
  partBlock: {
    gap: 4,
    paddingLeft: 8,
  },
  partTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: INK,
    fontFamily: 'serif',
  },
  handLine: {
    fontSize: 13.5,
    color: '#1E293B',
    fontStyle: 'italic',
    marginLeft: 18,
  },
  annotatedFactorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
  },
  redOvalWrap: {
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  redHandNote: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#DC2626',
    fontStyle: 'italic',
    transform: [{ rotate: '-5deg' }],
  },
  annotatedAnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
    marginTop: 2,
  },
  greenAnsBox: {
    borderWidth: 1.5,
    borderColor: '#16A34A',
    backgroundColor: '#F0FDF4',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  greenHandNote: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
    fontStyle: 'italic',
  },
  greenCheckBig: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
  },
  partBRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yellowHighlightBand: {
    backgroundColor: '#FEF08A',
    borderRadius: 4,
    paddingVertical: 2,
    paddingRight: 8,
    alignSelf: 'flex-start',
  },
  yellowStickyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yellowArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
  },
  yellowSticky: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
    borderRadius: 6,
    padding: 8,
    gap: 1,
  },
  yellowStickyText: {
    fontSize: 10.5,
    fontStyle: 'italic',
    color: '#854D0E',
    fontWeight: '600',
  },
  extraStampPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  extraStampText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BLUE,
  },

  /* Page Thumbnails Strip */
  thumbsStrip: {
    width: 60,
    gap: 10,
    alignItems: 'center',
  },
  thumbItem: {
    alignItems: 'center',
    gap: 4,
  },
  thumbFrame: {
    width: 54,
    height: 70,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: LINE,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  thumbFrameOn: {
    borderColor: BLUE,
    borderWidth: 2,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  thumbNumPill: {
    minWidth: 18,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  thumbNumPillOn: {
    backgroundColor: BLUE,
  },
  thumbNumText: {
    fontSize: 9,
    fontWeight: '700',
    color: BODY,
  },
  thumbNumTextOn: {
    color: '#FFFFFF',
  },

  /* Right Column: Rubric & Voice Studio */
  rightCol: {
    width: 344,
    padding: 10,
    gap: 8,
  },
  rightTopTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    gap: 10,
  },
  rightTopTab: {
    paddingVertical: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  rightTopTabOn: {
    borderBottomColor: BLUE,
  },
  rightTopTabText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: BODY,
  },
  rightTopTabTextOn: {
    color: BLUE,
    fontWeight: '700',
  },
  aiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF5FF',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CFE0FF',
    padding: 9,
  },
  aiSparkle: {
    fontSize: 16,
    color: BLUE,
  },
  aiBannerTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: INK,
  },
  aiBannerSub: {
    fontSize: 8.5,
    lineHeight: 11.5,
    color: BODY,
  },
  aiSuggestedScore: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
  },
  aiSuggestedMax: {
    fontSize: 10.5,
    fontWeight: '600',
    color: BODY,
  },
  aiSuggestedLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#D97706',
  },

  /* Criteria List */
  criteriaList: {
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 8,
    overflow: 'hidden',
  },
  criterionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    backgroundColor: '#FFFFFF',
  },
  crTitle: {
    width: 84,
    fontSize: 10,
    fontWeight: '700',
    color: INK,
  },
  crDesc: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 11.5,
    color: BODY,
  },
  crScoreCol: {
    width: 68,
    gap: 4,
  },
  crScoreTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  crScoreStrong: {
    fontSize: 10,
    fontWeight: '800',
    color: INK,
  },
  crScoreMax: {
    fontWeight: '500',
    color: BODY,
  },
  crBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  crBarFill: {
    height: '100%',
    borderRadius: 2,
  },

  /* Final Score & Grade */
  finalScoreRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: INK,
  },
  finalScoreInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  finalScoreBox: {
    flex: 1,
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  finalScoreVal: {
    fontSize: 12,
    fontWeight: '800',
    color: INK,
  },
  finalScoreOut: {
    fontSize: 11,
    color: BODY,
  },
  gradeDropdown: {
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  gradeBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  gradeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },

  /* Voice Studio */
  voiceStudioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#F8FAFC',
  },
  micOuterRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFE4E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micOuterRingActive: {
    backgroundColor: '#FECDD3',
    transform: [{ scale: 1.06 }],
  },
  micCoralCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF5A5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  waveformBars: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2.5,
  },
  waveBar: {
    width: 2.5,
    borderRadius: 1.5,
  },
  holdToRecordLabel: {
    fontSize: 9,
    color: BODY,
  },
  voiceTimerText: {
    fontSize: 10,
    fontWeight: '600',
    color: INK,
  },

  /* Quick Comments */
  quickChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  quickChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: '#F8FAFC',
  },
  quickChipOn: {
    borderColor: BLUE,
    backgroundColor: '#EEF5FF',
  },
  quickChipText: {
    fontSize: 9.5,
    color: INK,
  },
  quickChipTextOn: {
    color: BLUE,
    fontWeight: '700',
  },

  /* Share Toggle & Bottom Buttons */
  shareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  shareLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: INK,
  },
  bottomBtnsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  saveDraftBtn: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDraftText: {
    fontSize: 11,
    fontWeight: '600',
    color: INK,
  },
  saveNextBtn: {
    flex: 1.25,
    height: 34,
    borderRadius: 8,
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveNextText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

