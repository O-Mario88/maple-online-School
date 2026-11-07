import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  TeacherGrowSideNav,
  type TeacherMe,
  TeacherPhoneTop,
  TeacherTopBar,
} from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, INK, MUTED, Panel } from '@/features/teacher/frame/TeacherParts';
import { toast } from '@/lib/toast';
import type { StorefrontEditor, StorefrontSubjectCard } from '@/mock/teacher-storefront';
import { STOREFRONT_REF_WIDTH, s as deskS } from './StorefrontViews.styles';
import { phoneS } from './StorefrontViews.phoneStyles';
import { PhoneScroll } from '@/features/teacher/frame/PhoneScroll';

export { STOREFRONT_REF_WIDTH };

/**
 * Image 1 — Public @teacher Storefront & Growth Promotions Editor (`/(teacher)/storefront`).
 * Customize public bio, intro video, featured subjects, available tutoring hours,
 * and growth promotions with a live Public Profile Preview.
 */
export function StorefrontDesk({ sf, me, phone = false }: { sf: StorefrontEditor; me: TeacherMe; phone?: boolean }) {
  // Phones: the same page without the desktop top bar and side menu, stacked in one column.
  const s = phone ? phoneS : deskS;
  const [displayName, setDisplayName] = useState(sf.displayName);
  const [username, setUsername] = useState(sf.username);
  const [roleTitle, setRoleTitle] = useState(sf.roleTitle);
  const [bio, setBio] = useState(sf.bio);
  const [subjects, setSubjects] = useState<StorefrontSubjectCard[]>(sf.subjects);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [previewTab, setPreviewTab] = useState<
    'Overview' | 'Subjects' | 'Class Schedule' | 'Reviews'
  >('Overview');

  const toggleFeatured = (id: string) => {
    setSubjects((prev) =>
      prev.map((item) => (item.id === id ? { ...item, featured: !item.featured } : item)),
    );
  };

  return (
    <View style={s.page}>
      {phone ? null : (
        <TeacherTopBar
          active={null}
          tabsVariant="live"
          me={me}
          placeholder="Search students, classes, or resources..."
        />
      )}

      <View style={s.body}>
        {/* Two-Section Left Sidebar */}
        {phone ? null : (
          <TeacherGrowSideNav active="Storefront" growItems={sf.growNav} />
        )}

        {/* Center Editor Column */}
        <View style={s.centerCol}>
          {/* Page Header */}
          <View style={s.pageHeader}>
            <Text style={s.pageTitle}>Teacher Storefront</Text>
            <Text style={s.pageSub}>
              Customize your public profile, showcase your expertise, and attract more students.
            </Text>
          </View>

          {/* 1. Profile Basics Card */}
          <Panel style={s.card}>
            <View style={s.cardHeaderRow}>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={s.cardTitle}>Profile Basics</Text>
                <Text style={s.cardSub}>
                  This is what students and parents will see on your public profile.
                </Text>
              </View>
              <View style={s.cardHeaderBtns}>
                <Pressable
                  style={s.outlineBtn}
                  onPress={() => toast('Editing public storefront profile fields.')}>
                  <Text style={s.outlineBtnText}>Edit Profile</Text>
                </Pressable>
                <Pressable
                  style={s.primaryBtn}
                  onPress={() => toast('Saved Teacher Storefront changes!')}>
                  <Text style={s.primaryBtnText}>Save Changes</Text>
                </Pressable>
              </View>
            </View>

            <View style={s.profileBasicsBody}>
              {/* Avatar + Camera Badge */}
              <View style={s.avatarWrap}>
                <Image source={sf.avatar} style={s.bigAvatar} contentFit="cover" />
                <Pressable
                  style={s.cameraBadge}
                  onPress={() => toast('Uploading new profile portrait.')}>
                  <Icon name="camera" size={11} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Fields */}
              <View style={s.profileFieldsCol}>
                <View style={s.twoFieldsRow}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={s.fieldLabel}>
                      Display Name <Text style={s.reqStar}>*</Text>
                    </Text>
                    <TextInput
                      value={displayName}
                      onChangeText={setDisplayName}
                      style={s.textInput}
                      maxLength={50}
                    />
                    <Text style={s.charCounterRight}>{displayName.length}/50</Text>
                  </View>

                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={s.fieldLabel}>
                      @username <Text style={s.reqStar}>*</Text>
                    </Text>
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      style={s.textInput}
                      maxLength={30}
                    />
                    <View style={s.usernameMetaRow}>
                      <Text style={s.usernamePreviewUrl}>maple.school/@{username}</Text>
                      <Text style={s.charCounterRight}>{username.length + 1}/30</Text>
                    </View>
                  </View>
                </View>

                <View style={{ gap: 3 }}>
                  <Text style={s.fieldLabel}>Role / Title</Text>
                  <TextInput
                    value={roleTitle}
                    onChangeText={setRoleTitle}
                    style={s.textInput}
                    maxLength={80}
                  />
                  <Text style={s.charCounterRight}>{roleTitle.length}/80</Text>
                </View>
              </View>
            </View>
          </Panel>

          {/* 2. Bio & Introduction + Intro Video Row */}
          <View style={s.midSplitRow}>
            {/* Bio & Introduction */}
            <Panel style={[s.card, { flex: 1.45 }]}>
              <Text style={s.cardTitle}>Bio & Introduction</Text>
              <View style={s.richBox}>
                <View style={s.richToolbar}>
                  <Text style={[s.richGlyph, { fontWeight: '800' }]}>B</Text>
                  <Text style={[s.richGlyph, { fontStyle: 'italic' }]}>I</Text>
                  <Text style={[s.richGlyph, { textDecorationLine: 'underline' }]}>U</Text>
                  <View style={s.richSep} />
                  <Icon name="listBullet" size={12} color={BODY} />
                  <Icon name="listNumber" size={12} color={BODY} />
                  <View style={s.richSep} />
                  <Icon name="link" size={12} color={BODY} />
                </View>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  style={s.richInput}
                  maxLength={500}
                />
              </View>
              <Text style={s.charCounterRight}>{bio.length}/500</Text>
            </Panel>

            {/* Intro Video */}
            <Panel style={[s.card, { flex: 1 }]}>
              <Text style={s.cardTitle}>Intro Video</Text>
              <View style={s.videoFrame}>
                <Image source={sf.videoThumb} style={StyleSheet.absoluteFill} contentFit="cover" />
                <View style={s.videoCloseCircle}>
                  <Icon name="close" size={9} color="#FFFFFF" />
                </View>
                <Pressable
                  style={s.videoPlayCircle}
                  onPress={() => toast('Playing 2:15 Teacher Intro Video.')}>
                  <Icon name="playFill" size={14} color="#FFFFFF" />
                </Pressable>
                <View style={s.videoBottomBar}>
                  <View style={s.videoTimePill}>
                    <Text style={s.videoTimeText}>{sf.videoDuration}</Text>
                  </View>
                  <Icon name="expand" size={10} color="#FFFFFF" />
                </View>
              </View>

              <View style={s.videoBtnsRow}>
                <Pressable
                  style={s.videoActionBtn}
                  onPress={() => toast('Uploading new intro video (MP4/MOV).')}>
                  <Icon name="upload" size={11} color={BLUE} />
                  <Text style={s.videoActionBtnText}>Upload Video</Text>
                </Pressable>
                <Pressable
                  style={s.videoActionBtn}
                  onPress={() => toast('Opening webcam studio to record intro video.')}>
                  <Icon name="video" size={11} color={BLUE} />
                  <Text style={s.videoActionBtnText}>Record New</Text>
                </Pressable>
              </View>
            </Panel>
          </View>

          {/* 3. Featured Subjects Card */}
          <Panel style={s.card}>
            <View style={s.cardHeaderRow}>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={s.cardTitle}>Featured Subjects</Text>
                <Text style={s.cardSub}>
                  Select and arrange the subjects you want to showcase.
                </Text>
              </View>
              <Pressable
                style={s.smallOutlineBtn}
                onPress={() => toast('Added new subject card to storefront.')}>
                <Icon name="plus" size={11} color={BLUE} />
                <Text style={s.smallOutlineBtnText}>Add Subject</Text>
              </Pressable>
            </View>

            <View style={s.subjectsGrid}>
              {subjects.map((sub) => (
                <View key={sub.id} style={s.subjectCard}>
                  <View style={s.subjectTopRow}>
                    <View style={[s.subjectIconBox, { backgroundColor: sub.color }]}>
                      <Icon name={sub.icon} size={14} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={s.subjectTitleLine}>
                        <Text style={s.subjectTitle} numberOfLines={1}>
                          {sub.title}
                        </Text>
                        <Text style={s.dotsMenu}>⋮</Text>
                      </View>
                      <Text style={s.subjectDesc}>{sub.description}</Text>
                      <View style={s.tagRow}>
                        {sub.tags.map((t) => (
                          <View key={t} style={s.tagPill}>
                            <Text style={s.tagText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>

                  <View style={s.subjectFooter}>
                    <Pressable
                      style={[s.switchTrack, sub.featured && s.switchTrackOn]}
                      onPress={() => toggleFeatured(sub.id)}>
                      <View style={[s.switchThumb, sub.featured && s.switchThumbOn]} />
                    </Pressable>
                    <Text style={s.featuredSwitchLabel}>Featured</Text>
                  </View>
                </View>
              ))}
            </View>
          </Panel>

          {/* 4. Available Tutoring Hours + Growth Promotions Row */}
          <View style={s.bottomSplitRow}>
            {/* Available Tutoring Hours */}
            <Panel style={[s.card, { flex: 1.38 }]}>
              <View style={{ gap: 1 }}>
                <Text style={s.cardTitle}>Available Tutoring Hours</Text>
                <Text style={s.cardSub}>
                  Set your regular availability for 1-on-1 or small group tutoring.
                </Text>
              </View>

              <View style={{ gap: 3 }}>
                <Text style={s.fieldLabel}>Time Zone</Text>
                <View style={s.tzDropdown}>
                  <Text style={s.tzDropdownText}>{sf.timezone}</Text>
                  <Icon name="chevronDown" size={10} color={INK} />
                </View>
              </View>

              {/* Phones: the week scrolls sideways at a readable width. */}
              <PhoneScroll phone={phone}>
                  <View style={s.hoursTable}>
                  {sf.tutoringHours.map((h) => (
                    <View key={h.day} style={s.hourDayCol}>
                      <View style={s.hourDayHeader}>
                        <Text style={s.hourDayName}>{h.day}</Text>
                      </View>
                      <View style={s.hourSlotBody}>
                        {h.start && h.end ? (
                          <>
                            <Text style={s.hourSlotTime}>{h.start}</Text>
                            <Text style={s.hourSlotTime}>{h.end}</Text>
                          </>
                        ) : (
                          <Text style={s.hourUnavailable}>Unavailable</Text>
                        )}
                      </View>
                      <Pressable
                        style={s.hourPlusBtn}
                        onPress={() => toast(`Added tutoring slot on ${h.day}.`)}>
                        <Text style={s.hourPlusText}>+</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </PhoneScroll>
            </Panel>

            {/* Growth Promotions */}
            <Panel style={[s.card, { flex: 1 }]}>
              <View style={s.cardHeaderRow}>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={s.cardTitle}>Growth Promotions</Text>
                  <Text style={s.cardSub}>
                    Create special offers to attract new students.
                  </Text>
                </View>
                <Pressable
                  style={s.smallOutlineBtn}
                  onPress={() => toast('Opened New Growth Promotion modal.')}>
                  <Icon name="plus" size={10} color={BLUE} />
                  <Text style={s.smallOutlineBtnText}>New Promotion</Text>
                </Pressable>
              </View>

              <View style={s.promoInnerCard}>
                <View style={s.promoTopRow}>
                  <View style={s.activePill}>
                    <View style={s.activeDot} />
                    <Text style={s.activePillText}>{sf.promotion.status}</Text>
                  </View>
                  <Text style={s.dotsMenu}>⋮</Text>
                </View>

                <View style={s.promoBodyRow}>
                  <View style={s.promoPercentTile}>
                    <Text style={s.promoPercentText}>%</Text>
                  </View>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={s.promoTitle}>{sf.promotion.title}</Text>
                    <Text style={s.promoDesc}>{sf.promotion.description}</Text>
                    <Text style={s.promoDates}>{sf.promotion.validRange}</Text>
                  </View>
                </View>
              </View>
            </Panel>
          </View>
        </View>

        {/* Right Column: Public Profile Preview */}
        <Panel style={s.rightCol}>
          <View style={s.previewHeaderRow}>
            <View style={{ flex: 1, gap: 1 }}>
              <Text style={s.cardTitle}>Public Profile Preview</Text>
              <Text style={s.cardSub}>
                This is how your storefront looks to students and parents.
              </Text>
            </View>
            <View style={s.deviceToggle}>
              <Pressable
                style={[
                  s.deviceBtn,
                  previewDevice === 'desktop' && s.deviceBtnOn,
                ]}
                onPress={() => setPreviewDevice('desktop')}>
                <Text
                  style={[
                    s.deviceBtnText,
                    previewDevice === 'desktop' && s.deviceBtnTextOn,
                  ]}>
                  Desktop
                </Text>
              </Pressable>
              <Pressable
                style={[
                  s.deviceBtn,
                  previewDevice === 'mobile' && s.deviceBtnOn,
                ]}
                onPress={() => setPreviewDevice('mobile')}>
                <Text
                  style={[
                    s.deviceBtnText,
                    previewDevice === 'mobile' && s.deviceBtnTextOn,
                  ]}>
                  Mobile
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Storefront Preview Canvas */}
          <View style={s.previewCanvas}>
            {/* Dark Blue Hero Banner */}
            <View style={s.heroBanner}>
              <Text style={s.heroMathDecorLeft}>∑   π   √x</Text>
              <Text style={s.heroMathDecorRight}>x² + y² = r²</Text>
              <View style={s.heroTextCol}>
                <Text style={s.heroHeadline}>
                  Let&apos;s Make{'\n'}Mathematics Simple
                </Text>
                <Text style={s.heroTagline}>
                  Build skills. Gain confidence. Achieve more.
                </Text>
              </View>
              <Image
                source={sf.bannerTeacher}
                style={s.heroTeacherImg}
                contentFit="cover"
              />
            </View>

            {/* Profile Identity Strip */}
            <View style={s.previewProfileStrip}>
              <Image
                source={sf.avatar}
                style={s.previewProfileAvatar}
                contentFit="cover"
              />
              <View style={{ flex: 1, gap: 1 }}>
                <View style={s.previewNameRow}>
                  <Text style={s.previewName}>{displayName}</Text>
                  <View style={s.verifiedCheckBadge}>
                    <Text style={s.verifiedCheckMark}>✓</Text>
                  </View>
                </View>
                <Text style={s.previewHandle}>@{username}</Text>
                <Text style={s.previewRole} numberOfLines={1}>
                  {roleTitle}
                </Text>
                <View style={s.ratingRow}>
                  <Text style={s.starGlyph}>★</Text>
                  <Text style={s.ratingStrong}>{sf.rating}</Text>
                  <Text style={s.ratingCount}>({sf.reviewsCount} reviews)</Text>
                </View>
              </View>

              <View style={s.previewCtaBtns}>
                <Pressable
                  style={s.bookClassBtn}
                  onPress={() => toast('Opened 1-on-1 Class Booking modal.')}>
                  <Text style={s.bookClassBtnText}>Book a Class</Text>
                </Pressable>
                <Pressable
                  style={s.messageBtn}
                  onPress={() => toast(`Direct messaging ${displayName}.`)}>
                  <Text style={s.messageBtnText}>Message</Text>
                </Pressable>
              </View>
            </View>

            {/* Preview Navigation Tabs */}
            <View style={s.previewTabsBar}>
              {(['Overview', 'Subjects', 'Class Schedule', 'Reviews'] as const).map(
                (t) => {
                  const on = previewTab === t;
                  return (
                    <Pressable
                      key={t}
                      style={[s.previewTab, on && s.previewTabOn]}
                      onPress={() => setPreviewTab(t)}>
                      <Text style={[s.previewTabText, on && s.previewTabTextOn]}>
                        {t}
                      </Text>
                    </Pressable>
                  );
                },
              )}
            </View>

            {/* About Me Section */}
            <View style={s.aboutMeRow}>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={s.previewSectionHeading}>About Me</Text>
                <Text style={s.aboutMeText} numberOfLines={4}>
                  {bio}
                </Text>
                <Text style={s.showMoreLink}>Show More</Text>
              </View>

              <View style={s.miniVideoBox}>
                <Image
                  source={sf.videoThumb}
                  style={StyleSheet.absoluteFill}
                  contentFit="cover"
                />
                <View style={s.miniPlayCircle}>
                  <Icon name="playFill" size={11} color="#FFFFFF" />
                </View>
                <View style={s.miniDurationPill}>
                  <Text style={s.miniDurationText}>{sf.videoDuration}</Text>
                </View>
              </View>
            </View>

            {/* Featured Subjects Preview */}
            <View style={{ gap: 6 }}>
              <View style={s.previewSectionHeaderRow}>
                <Text style={s.previewSectionHeading}>Featured Subjects</Text>
                <Text style={s.seeAllLink}>See All Subjects →</Text>
              </View>

              <View style={s.previewSubjectsRow}>
                {subjects.map((sub) => (
                  <View key={sub.id} style={s.previewSubjectCard}>
                    <View style={s.previewSubCardTop}>
                      <View
                        style={[
                          s.previewSubIcon,
                          { backgroundColor: sub.color },
                        ]}>
                        <Icon name={sub.icon} size={11} color="#FFFFFF" />
                      </View>
                      <Text style={s.dotsMenu}>⋮</Text>
                    </View>
                    <Text style={s.previewSubTitle} numberOfLines={1}>
                      {sub.previewTitle}
                    </Text>
                    <Text style={s.previewSubDesc} numberOfLines={2}>
                      {sub.description}
                    </Text>
                    <View style={s.tagRow}>
                      {sub.tags.map((t) => (
                        <View key={t} style={s.tagPillSmall}>
                          <Text style={s.tagTextSmall}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Available Tutoring Hours Preview */}
            <View style={{ gap: 6 }}>
              <View style={s.previewSectionHeaderRow}>
                <Text style={s.previewSectionHeading}>
                  Available Tutoring Hours (EAT)
                </Text>
                <Text style={s.seeAllLink}>View Full Schedule →</Text>
              </View>

              <View style={s.previewHoursStrip}>
                {sf.tutoringHours.map((h) => (
                  <View
                    key={h.day}
                    style={[
                      s.previewHourChip,
                      !h.start && { backgroundColor: '#F1F5F9' },
                    ]}>
                    <Text style={s.previewHourDay}>{h.day}</Text>
                    <Text
                      style={[
                        s.previewHourRange,
                        !h.start && { color: MUTED, fontWeight: '500' },
                      ]}>
                      {h.compact}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bottom Pink Promotion Banner */}
            <View style={s.claimBanner}>
              <View style={s.claimPercentBox}>
                <Text style={s.claimPercentText}>%</Text>
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text style={s.claimBannerTitle}>{sf.promotion.title}</Text>
                <Text style={s.claimBannerSub} numberOfLines={1}>
                  {sf.promotion.description}
                </Text>
                <Text style={s.claimBannerValid}>
                  🏷 Valid {sf.promotion.validRange}
                </Text>
              </View>
              <Pressable
                style={s.claimOfferBtn}
                onPress={() =>
                  toast('Applied 10% Off First Class voucher to booking!')
                }>
                <Text style={s.claimOfferBtnText}>Claim Offer</Text>
              </Pressable>
            </View>
          </View>
        </Panel>
      </View>
    </View>
  );
}

export function StorefrontPhone({ sf, me }: { sf: StorefrontEditor; me: TeacherMe }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#EAF1FB' }}>
      <TeacherPhoneTop me={me} />
      <StorefrontDesk sf={sf} me={me} phone />
    </ScrollView>
  );
}
