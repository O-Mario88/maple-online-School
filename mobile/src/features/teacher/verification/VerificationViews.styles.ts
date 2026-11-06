import { StyleSheet } from 'react-native';

import { BLUE, BODY, INK, LINE, MUTED } from '@/features/teacher/frame/TeacherParts';
import { Maple } from '@/constants/maple';

/** Styles for VerificationViews (kept apart so the view file stays readable). */
export const VERIFICATION_REF_WIDTH = 1220;

export const s = StyleSheet.create({
  page: {
    width: VERIFICATION_REF_WIDTH,
    padding: 12,
    gap: 10,
    backgroundColor: Maple.blueSelected,
  },
  body: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  centerCol: {
    flex: 1,
    gap: 9,
    minWidth: 0,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: INK,
    letterSpacing: -0.4,
  },
  pageSub: {
    fontSize: 11,
    color: BODY,
  },

  /* Stepper Card */
  stepperCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  stepperItemGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumCircleOn: {
    backgroundColor: BLUE,
  },
  stepNumCircleIdle: {
    backgroundColor: Maple.blueSelected,
  },
  stepNumText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepNumTextOn: {
    color: Maple.surface,
  },
  stepNumTextIdle: {
    color: BLUE,
  },
  stepItemTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: INK,
  },
  stepItemSub: {
    fontSize: 8.5,
    lineHeight: 11,
    color: BODY,
  },
  stepperArrow: {
    fontSize: 12,
    color: Maple.muted,
  },

  /* Section Cards */
  card: {
    padding: 12,
    gap: 9,
  },
  // Title and subtitle beside a step badge; shrinks so the subtitle wraps instead of running off.
  secText: { gap: 1, flexShrink: 1 },
  secHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: INK,
  },
  secSub: {
    fontSize: 10,
    color: BODY,
  },
  idTabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  idTab: {
    width: 142,
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  idTabOn: {
    borderBottomColor: BLUE,
  },
  idTabText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: BODY,
  },
  idTabTextOn: {
    color: BLUE,
    fontWeight: '700',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  bigDropzone: {
    flex: 1.35,
    height: 110,
    borderRadius: 9,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Maple.blueLine,
    backgroundColor: Maple.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: 10,
  },
  uploadIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Maple.blueSelected,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  dropzoneTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: INK,
    textAlign: 'center',
  },
  dropzoneSub: {
    fontSize: 9.5,
    color: BODY,
    textAlign: 'center',
  },
  dropzoneFormats: {
    fontSize: 8.5,
    color: MUTED,
    textAlign: 'center',
  },
  twoUploadBoxes: {
    flex: 1.35,
    flexDirection: 'row',
    gap: 8,
  },
  smallDropzone: {
    flex: 1,
    height: 98,
    borderRadius: 9,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Maple.blueLine,
    backgroundColor: Maple.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    padding: 8,
  },
  plusCircleBlue: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checklistCol: {
    flex: 1,
    gap: 6,
  },
  checklistTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: INK,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenCheckCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Maple.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenCheckMark: {
    fontSize: 8.5,
    fontWeight: '800',
    color: Maple.surface,
  },
  checkItemText: {
    flex: 1,
    fontSize: 9.5,
    color: BODY,
  },

  /* Confirmation Footer */
  confirmFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  confirmCheckRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkbox: {
    width: 15,
    height: 15,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Maple.borderStrong,
    backgroundColor: Maple.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxOn: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  checkboxTick: {
    fontSize: 9,
    fontWeight: '800',
    color: Maple.surface,
  },
  confirmMainText: {
    fontSize: 10,
    fontWeight: '700',
    color: INK,
  },
  confirmSubText: {
    fontSize: 9,
    color: MUTED,
  },
  submitVerifyBtn: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitVerifyBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Maple.surface,
  },

  /* Right Column */
  rightCol: {
    width: 288,
    gap: 9,
  },
  rightCard: {
    padding: 12,
    gap: 10,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  rightAvatarWrap: {
    width: 48,
    height: 48,
    position: 'relative',
  },
  rightAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarShieldBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: BLUE,
    borderWidth: 1.5,
    borderColor: Maple.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: INK,
  },
  rightHandle: {
    fontSize: 9.5,
    color: MUTED,
  },
  rightRole: {
    fontSize: 9.5,
    color: BODY,
  },
  unverifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Maple.blueSelected,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  unverifiedPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: BLUE,
  },
  becomeCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 9,
    backgroundColor: Maple.warningSoft,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 10,
  },
  goldShieldCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Maple.warning,
    alignItems: 'center',
    justifyContent: 'center',
  },
  becomeTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: INK,
  },
  becomeDesc: {
    fontSize: 9,
    lineHeight: 12.5,
    color: BODY,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  benefitIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: Maple.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: INK,
  },
  benefitSub: {
    fontSize: 9,
    color: BODY,
  },

  /* Verification Status Card */
  statusHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: INK,
  },
  inProgressPill: {
    backgroundColor: Maple.blueSelected,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  inProgressText: {
    fontSize: 9,
    fontWeight: '700',
    color: BLUE,
  },
  timelineList: {
    gap: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  timelineTrackCol: {
    alignItems: 'center',
    width: 18,
  },
  timelineCircleDone: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineCheck: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Maple.surface,
  },
  timelineCircleIdle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: Maple.faint,
    backgroundColor: Maple.surface,
  },
  timelineVertLine: {
    width: 1.5,
    height: 18,
    backgroundColor: Maple.borderStrong,
  },
  timelineTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: INK,
  },
  timelineSub: {
    fontSize: 9,
    color: BODY,
  },

  /* Need Help Card */
  helpCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Maple.blueSelected,
    backgroundColor: Maple.blueSoft,
    padding: 12,
    gap: 10,
  },
  helpTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  helpQCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpQMark: {
    fontSize: 14,
    fontWeight: '800',
    color: Maple.surface,
  },
  helpSub: {
    fontSize: 9.5,
    color: BODY,
  },
  helpBtnsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  viewGuideBtn: {
    flex: 1,
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Maple.blueLine,
    backgroundColor: Maple.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewGuideText: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUE,
  },
  contactSupportBtn: {
    flex: 1,
    height: 30,
    borderRadius: 7,
    backgroundColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactSupportText: {
    fontSize: 10,
    fontWeight: '700',
    color: Maple.surface,
  },
});

