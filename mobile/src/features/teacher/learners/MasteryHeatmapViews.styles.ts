import { StyleSheet } from 'react-native';

import { BLUE, BODY, INK, LINE } from '@/features/teacher/frame/TeacherParts';
import { Maple } from '@/constants/maple';

/** Styles for MasteryHeatmapViews (kept apart so the view file stays readable). */
export const MASTERY_REF_WIDTH = 1220;

export const s = StyleSheet.create({
  page: {
    width: MASTERY_REF_WIDTH,
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
    width: 174,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: LINE,
    padding: 10,
    gap: 8,
  },
  sideHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: INK,
    paddingHorizontal: 6,
  },
  sideList: {
    gap: 2,
  },
  sideItem: {
    height: 32,
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
  sideDivider: {
    height: 1,
    backgroundColor: LINE,
    marginVertical: 4,
  },
  myClassesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  myClassesTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: INK,
  },
  myClassesList: {
    gap: 3,
  },
  myClassRow: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderRadius: 7,
  },
  myClassRowOn: {
    backgroundColor: Maple.blueSelected,
  },
  classDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  myClassText: {
    flex: 1,
    fontSize: 10.5,
    color: BODY,
  },
  myClassTextOn: {
    color: BLUE,
    fontWeight: '700',
  },
  addClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addClassText: {
    fontSize: 11,
    fontWeight: '600',
    color: BLUE,
  },

  /* Center Main Column */
  centerCol: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  pageSub: {
    fontSize: 11.5,
    color: BODY,
  },
  headerFilters: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  filterCol: {
    gap: 3,
  },
  filterLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: BODY,
  },
  filterSelect: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.surface,
  },
  filterSelectText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: INK,
  },
  exportBtn: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.surface,
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: INK,
  },

  /* KPI Row */
  kpiRow: {
    flexDirection: 'row',
    gap: 8,
  },
  kpiCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Maple.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  kpiIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
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

  /* Matrix Card */
  // The grid inside the matrix card: as is on desktop, a fixed width that scrolls on phones.
  matrixGrid: {},
  matrixGridPhone: { width: 720 },
  matrixCard: {
    padding: 0,
    overflow: 'hidden',
  },
  matrixTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  matrixTabs: {
    flexDirection: 'row',
    gap: 14,
  },
  matrixTab: {
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  matrixTabOn: {
    borderBottomColor: BLUE,
  },
  matrixTabText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: BODY,
  },
  matrixTabTextOn: {
    color: BLUE,
    fontWeight: '700',
  },
  matrixSearchCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  searchBox: {
    width: 140,
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.blueSoft,
  },
  searchInput: {
    flex: 1,
    fontSize: 9.5,
    color: INK,
    paddingVertical: 0,
  },
  filterPillBtn: {
    height: 26,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.surface,
  },
  filterPillText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: INK,
  },

  /* Heatmap Table */
  thRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: Maple.blueSoft,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  colCheck: { width: 22, alignItems: 'center' },
  colStudent: { width: 106 },
  colComp: { flex: 1, paddingHorizontal: 2 },
  colOverall: { width: 88, paddingLeft: 6 },

  thStudent: {
    fontSize: 9.5,
    fontWeight: '700',
    color: INK,
  },
  thComp: {
    fontSize: 8.5,
    lineHeight: 10.5,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
  },
  thOverall: {
    fontSize: 9.5,
    fontWeight: '700',
    color: INK,
  },
  trRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    backgroundColor: Maple.surface,
  },
  trRowSelected: {
    backgroundColor: Maple.blueSoft,
  },
  checkbox: {
    width: 13,
    height: 13,
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
    fontSize: 8,
    fontWeight: '800',
    color: Maple.surface,
  },
  studentCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  studentName: {
    flex: 1,
    fontSize: 10,
    fontWeight: '700',
    color: INK,
  },
  heatCell: {
    height: 26,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatCellText: {
    fontSize: 10,
    fontWeight: '700',
  },
  overallCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  overallPct: {
    width: 28,
    fontSize: 10,
    fontWeight: '800',
  },
  overallTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: Maple.border,
    overflow: 'hidden',
  },
  overallFill: {
    height: '100%',
    borderRadius: 3,
  },

  /* Class Average Row */
  avgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: Maple.blueSoft,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  avgLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: INK,
  },
  avgCell: {
    height: 24,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avgCellText: {
    fontSize: 9.5,
    fontWeight: '800',
  },

  /* Legend */
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendSquare: {
    width: 10,
    height: 10,
    borderRadius: 2.5,
  },
  legendText: {
    fontSize: 9,
    color: BODY,
  },

  /* AI Insights Panel */
  insightsPanel: {
    padding: 10,
    gap: 8,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiSparkle: {
    fontSize: 15,
    color: BLUE,
  },
  insightsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  insightCard: {
    flex: 1,
    borderRadius: 9,
    borderWidth: 1,
    padding: 9,
    gap: 7,
    justifyContent: 'space-between',
  },
  insightCardRed: {
    backgroundColor: Maple.errorSoft,
    borderColor: Maple.errorSoft,
  },
  insightCardAmber: {
    backgroundColor: Maple.warningSoft,
    borderColor: '#FDE68A',
  },
  insightCardGreen: {
    backgroundColor: Maple.successSoft,
    borderColor: '#BBF7D0',
  },
  insightTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  insightBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Maple.surface,
  },
  insightHeading: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  insightBody: {
    fontSize: 8.5,
    lineHeight: 11.5,
    color: BODY,
  },
  insightBtn: {
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: Maple.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightBtnText: {
    fontSize: 9,
    fontWeight: '700',
  },

  /* Right Column: Student Detail & 1-Click Intervention Centre */
  rightCol: {
    width: 284,
    padding: 10,
    gap: 9,
  },
  studentDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  drawerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  drawerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerName: {
    fontSize: 14,
    fontWeight: '800',
    color: INK,
  },
  drawerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerMeta: {
    fontSize: 10,
    color: BODY,
  },
  drawerStatusPill: {
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  drawerStatusText: {
    fontSize: 8.5,
    fontWeight: '700',
  },
  drawerTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
    gap: 8,
  },
  drawerTab: {
    paddingVertical: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  drawerTabOn: {
    borderBottomColor: BLUE,
  },
  drawerTabText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: BODY,
  },
  drawerTabTextOn: {
    color: BLUE,
    fontWeight: '700',
  },

  /* Competency Breakdown */
  breakdownSection: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: INK,
  },
  breakdownList: {
    gap: 5,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakdownLabel: {
    width: 112,
    fontSize: 9.5,
    color: BODY,
  },
  breakdownPct: {
    width: 26,
    fontSize: 9.5,
    fontWeight: '700',
    color: INK,
  },
  breakdownTrack: {
    flex: 1,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: Maple.border,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 3,
  },

  /* Intervention Actions */
  interventionsSection: {
    gap: 7,
  },
  packCard: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Maple.blueSelected,
    backgroundColor: Maple.blueSoft,
    padding: 9,
    gap: 7,
  },
  actionCard: {
    borderRadius: 9,
    borderWidth: 1,
    borderColor: LINE,
    backgroundColor: Maple.surface,
    padding: 9,
    gap: 7,
  },
  packHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  actionIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: INK,
  },
  oneClickPill: {
    backgroundColor: Maple.successSoft,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  oneClickText: {
    fontSize: 8,
    fontWeight: '700',
    color: Maple.successText,
  },
  actionSub: {
    fontSize: 8.5,
    lineHeight: 11.5,
    color: BODY,
  },
  packChecklist: {
    gap: 4,
  },
  packCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packCheckLabel: {
    fontSize: 9.5,
    color: INK,
  },
  sendPackBtn: {
    height: 28,
    borderRadius: 7,
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  sendPackBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: Maple.surface,
  },
  outlineActionBtn: {
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Maple.blueLine,
    backgroundColor: Maple.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineActionBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: BLUE,
  },
});

