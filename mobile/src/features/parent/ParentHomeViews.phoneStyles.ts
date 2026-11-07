import { fill, half, hidden, phoneSheet, restyle, stacked, wrapped } from '@/lib/phone-sheet';

import { styles as s } from './ParentHomeViews.styles';

/** Room kept beside the welcome text for the child's round photo. */
const HERO_PHOTO = 64;
const HERO_PHOTO_GUTTER = HERO_PHOTO + 14;

/** ParentHomeViews on phones: one column, nothing wider than the screen, text sized for 1:1 viewing. */
export const phoneStyles = phoneSheet(s, {
  phoneScroll: { gap: 14, padding: 16, paddingBottom: 110 },
  card: { ...s.card, padding: 16, borderRadius: 16 },

  // Hero: welcome text with the child's photo beside it, then the week picker and child switcher.
  hero: restyle(s.hero, ['flexDirection', 'alignItems', 'paddingRight', 'minHeight'], { borderRadius: 18 }),
  heroChildPhoto: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: HERO_PHOTO,
    height: HERO_PHOTO,
    borderRadius: HERO_PHOTO / 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  heroBody: restyle(s.heroBody, ['flex', 'paddingVertical', 'paddingLeft'], {
    padding: 16,
    gap: 10,
  }),
  heroTopRow: restyle(stacked(s.heroTopRow), [], { gap: 14 }),
  heroWelcome: {
    ...s.heroWelcome,
    fontSize: 24,
    lineHeight: 29,
    paddingRight: HERO_PHOTO_GUTTER,
  },
  heroSub: {
    ...s.heroSub,
    fontSize: 14,
    lineHeight: 19,
    paddingRight: HERO_PHOTO_GUTTER,
  },
  weekRightCol: restyle(s.weekRightCol, ['alignItems']),
  weekDropdown: {
    ...s.weekDropdown,
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 10,
  },
  weekText: { flex: 1, minWidth: 0 },
  heroBooksImg: hidden,
  myChildrenLabel: { ...s.myChildrenLabel, fontSize: 13 },
  childPill: { ...s.childPill, height: 46 },
  addChildPill: { ...s.addChildPill, height: 46 },

  // Profile: who, this week's highlight, then the completion ring and stats.
  profileTopRow: restyle(stacked(s.profileTopRow), [], { gap: 14 }),
  profileBigAvatar: {
    ...s.profileBigAvatar,
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  profileTextCol: { ...s.profileTextCol, flex: 1, minWidth: 0 },
  greatWeekBox: fill(s.greatWeekBox),
  completionCluster: {
    ...s.completionCluster,
    gap: 24,
    justifyContent: 'center',
  },
  subjectsRow: wrapped(s.subjectsRow, 10),
  subjectCard: { ...half(s.subjectCard), gap: 9, paddingHorizontal: 11 },
  subjectIconTile: { ...s.subjectIconTile, width: 34, height: 34 },

  // Teacher's voice note: who, then the player, then the quote, each on its own line.
  voiceMeta: restyle(s.voiceMeta, ['width'], { flex: 1, minWidth: 0 }),
  voicePlayer: { ...s.voicePlayer, width: '100%' },
  quoteBubble: restyle(s.quoteBubble, ['flex', 'minWidth'], { width: '100%' }),

  twoColRow: stacked(s.twoColRow),
  halfCard: fill(s.halfCard),
  achievementsGrid: wrapped(s.achievementsGrid, 8),
  achievementTile: half(s.achievementTile),

  // Add Child: one claim method per line, then the token input, then the matched child.
  claimModal: { ...s.claimModal, padding: 16, gap: 12 },
  claimMethodRow: restyle(s.claimMethodRow, ['flexDirection']),
  claimMethodBtn: { ...fill(s.claimMethodBtn), height: 42, justifyContent: 'flex-start', paddingHorizontal: 12 },
  claimBodyRow: stacked(s.claimBodyRow),
  claimInputCol: {},
  matchedCard: fill(s.matchedCard),

  // The desktop right rail sits under everything else.
  rightCol: restyle(fill(s.rightCol), ['gap'], { gap: 14 }),
});
