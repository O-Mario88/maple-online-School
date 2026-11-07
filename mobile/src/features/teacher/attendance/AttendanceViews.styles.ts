import { StyleSheet } from 'react-native';

import { BLUE, BODY, INK, LINE, MUTED } from '@/features/teacher/frame/TeacherParts';
import { Maple } from '@/constants/maple';

/** Styles for AttendanceViews (kept apart so the view file stays readable). */
export const ATTENDANCE_REF_WIDTH = 1220;

export const s = StyleSheet.create({
  page: {
    width: ATTENDANCE_REF_WIDTH,
    padding: 12,
    gap: 10,
    backgroundColor: Maple.blueSelected,
  },
  body: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },

  /* Left Sidebar */
  leftSide: {
    width: 182,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: LINE,
    padding: 10,
    gap: 10,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 11,
    fontWeight: '600',
    color: BLUE,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 7,
    borderRadius: 8,
    backgroundColor: Maple.surface,
    borderWidth: 1,
    borderColor: LINE,
  },
  courseThumb: {
    width: 36,
    height: 36,
    borderRadius: 7,
  },
  courseTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: INK,
  },
  courseSub: {
    fontSize: 9,
    lineHeight: 11.5,
    color: BODY,
  },
  sideList: {
    gap: 2,
  },
  sideItem: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  sideItemOn: {
    backgroundColor: Maple.blueSelected,
  },
  sideText: {
    flex: 1,
    fontSize: 11.5,
    color: Maple.navy,
  },
  sideTextOn: {
    color: BLUE,
    fontWeight: '700',
  },

  /* Center Main Column */
  centerCol: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 11.5,
    color: BODY,
  },
  completedPill: {
    backgroundColor: Maple.successSoft,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  completedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Maple.successText,
  },
  headerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  outlineBtn: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Maple.surface,
    borderWidth: 1,
    borderColor: Maple.borderStrong,
  },
  outlineBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: INK,
  },
  saveBtn: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Maple.surface,
  },

  /* KPI Row */
  kpiRow: {
    flexDirection: 'row',
    gap: 7,
  },
  kpiCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: Maple.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 9,
    paddingVertical: 8,
  },
  kpiIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiVal: {
    fontSize: 16,
    fontWeight: '800',
    color: INK,
    lineHeight: 18,
  },
  kpiLabel: {
    fontSize: 9,
    color: BODY,
  },

  /* Main Table Card */
  tableCard: {
    flex: 1,
    padding: 0,
    overflow: 'hidden',
  },
  tableTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    gap: 8,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  tabBtn: {
    paddingVertical: 11,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabBtnOn: {
    borderBottomColor: BLUE,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: BODY,
  },
  tabBtnTextOn: {
    color: BLUE,
    fontWeight: '700',
  },
  tableControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  searchBox: {
    width: 136,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.blueSoft,
  },
  searchInput: {
    flex: 1,
    fontSize: 10,
    color: INK,
    paddingVertical: 0,
  },
  filterBtn: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.surface,
  },
  filterBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: INK,
  },

  /* Table Columns */
  thRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: Maple.blueSoft,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  thText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: BODY,
  },
  trRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6.5,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    backgroundColor: Maple.surface,
  },
  trRowHighlighted: {
    backgroundColor: Maple.blueSoft,
  },
  colCheck: { width: 24, alignItems: 'center' },
  colNum: { width: 22 },
  colStudent: { flex: 1.35 },
  colStatus: { width: 132, paddingRight: 8 },
  colEngage: { width: 104 },
  colTime: { width: 58 },
  colDur: { width: 52 },
  colAct: { width: 38 },

  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: Maple.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Maple.surface,
  },
  checkboxOn: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  checkboxTick: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Maple.surface,
  },
  tdNum: {
    fontSize: 10.5,
    color: BODY,
  },
  studentCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  studentName: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
  },
  studentCohort: {
    fontSize: 9,
    color: MUTED,
  },
  statusPill: {
    height: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
  },
  statusGlyphCircle: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusGlyphText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: Maple.surface,
  },
  statusPillText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  engageCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  signalWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
  },
  signalBar: {
    width: 3,
    borderRadius: 1,
  },
  engageLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: INK,
    width: 40,
  },
  engagePct: {
    fontSize: 10,
    color: BODY,
  },
  tdText: {
    fontSize: 10.5,
    color: INK,
  },
  tdMuted: {
    fontSize: 10.5,
    color: MUTED,
  },
  dotsMenu: {
    fontSize: 13,
    fontWeight: '800',
    color: BODY,
  },

  /* Pagination */
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  paginationInfo: {
    fontSize: 10,
    color: BODY,
  },
  pageBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pageBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnOn: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  pageBtnText: {
    fontSize: 10,
    fontWeight: '600',
    color: INK,
  },
  pageBtnTextOn: {
    color: Maple.surface,
    fontWeight: '700',
  },
  rowsPerPage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowsSelect: {
    height: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.surface,
  },
  rowsSelectText: {
    fontSize: 10,
    fontWeight: '600',
    color: INK,
  },

  /* Right Column */
  rightCol: {
    width: 266,
    gap: 10,
  },
  rightCard: {
    padding: 11,
    gap: 8,
  },
  rightCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: INK,
  },
  videoBox: {
    height: 126,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: Maple.navy,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoBoardOverlay: {
    position: 'absolute',
    right: 8,
    top: 10,
    alignItems: 'flex-end',
  },
  videoBoardEq: {
    fontSize: 11,
    fontWeight: '700',
    color: Maple.navy,
  },
  videoBoardSub: {
    fontSize: 9.5,
    color: Maple.body,
  },
  playOverlayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15,23,42,0.68)',
    borderWidth: 1.5,
    borderColor: Maple.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoControlsBar: {
    position: 'absolute',
    left: 6,
    right: 6,
    bottom: 6,
    gap: 5,
    backgroundColor: 'rgba(15,23,42,0.82)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  videoScrubberTrack: {
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
    justifyContent: 'center',
  },
  videoScrubberDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Maple.surface,
  },
  videoControlsBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  videoTimeText: {
    fontSize: 9,
    fontWeight: '600',
    color: Maple.surface,
  },
  speedChip: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  speedChipText: {
    fontSize: 8,
    fontWeight: '700',
    color: Maple.surface,
  },
  chaptersSubTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: INK,
  },
  chaptersList: {
    gap: 6,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  chapterTime: {
    width: 28,
    fontSize: 9.5,
    fontWeight: '600',
    color: BODY,
  },
  chapterThumb: {
    width: 38,
    height: 24,
    borderRadius: 4,
  },
  chapterTitle: {
    fontSize: 9.5,
    lineHeight: 12,
    fontWeight: '600',
    color: INK,
  },
  chapterDur: {
    fontSize: 8.5,
    color: MUTED,
  },

  /* Manual Override */
  overrideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overrideStudentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overrideAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  overrideName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: INK,
  },
  overrideCohort: {
    fontSize: 9.5,
    color: MUTED,
  },
  overrideSelectsRow: {
    flexDirection: 'row',
    gap: 7,
  },
  overrideFieldLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: INK,
  },
  overrideDropdown: {
    height: 28,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.blueSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 7,
  },
  overrideDropdownText: {
    flex: 1,
    fontSize: 9.5,
    fontWeight: '600',
    color: INK,
  },
  overrideNotesInput: {
    minHeight: 46,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.surface,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 9.5,
    lineHeight: 13.5,
    color: INK,
    textAlignVertical: 'top',
  },
  overrideBtnsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  overrideCancelBtn: {
    flex: 1,
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Maple.borderStrong,
    backgroundColor: Maple.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overrideCancelText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: INK,
  },
  overrideUpdateBtn: {
    flex: 1,
    height: 30,
    borderRadius: 7,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overrideUpdateText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Maple.surface,
  },
});

