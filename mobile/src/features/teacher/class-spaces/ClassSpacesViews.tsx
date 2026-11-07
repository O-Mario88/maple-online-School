import { Image } from '@/components/picture';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import {
  type TeacherMe,
  TeacherPhoneTop,
  TeacherSideNav,
  TeacherTopBar,
} from '@/features/teacher/frame/TeacherFrame';
import { BLUE, BODY, INK, MUTED, Panel, StepBadge } from '@/features/teacher/frame/TeacherParts';
import { shareText } from '@/lib/save-text';
import { toast } from '@/lib/toast';
import type { ClassSpaceRow, ClassSpacesManager } from '@/mock/teacher-class-spaces';
import { CLASS_SPACES_REF_WIDTH, s, s as deskS } from './ClassSpacesViews.styles';
import { phoneS } from './ClassSpacesViews.phoneStyles';
import { PhoneScroll } from '@/features/teacher/frame/PhoneScroll';
import { Maple } from '@/constants/maple';

export { CLASS_SPACES_REF_WIDTH };

/**
 * "Bottom-Up" Free School Class Space Manager (`/(teacher)/class-spaces`).
 * Lets any school teacher create a class roster in 2 minutes via a 6-digit join code
 * or WhatsApp invite link — and includes the "Invite Principal to Upgrade School" referral banner.
 */
export function ClassSpacesDesk({ c, me, phone = false }: { c: ClassSpacesManager; me: TeacherMe; phone?: boolean }) {
  // Phones: the same page without the desktop top bar and side menu, stacked in one column.
  const s = phone ? phoneS : deskS;
  const [classes, setClasses] = useState<ClassSpaceRow[]>(c.classes);
  const [className, setClassName] = useState(c.initialForm.className);
  const [gradeIdx, setGradeIdx] = useState(0);
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [termIdx, setTermIdx] = useState(0);
  const [capacity, setCapacity] = useState(c.initialForm.capacity);
  const [joinMethod, setJoinMethod] = useState<'code' | 'whatsapp'>(c.initialForm.joinMethod);

  const [tableTab, setTableTab] = useState<'active' | 'drafts' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const grade = c.gradeOptions[gradeIdx % c.gradeOptions.length];
  const subject = c.subjectOptions[subjectIdx % c.subjectOptions.length];
  const term = c.termOptions[termIdx % c.termOptions.length];

  const handleCreateClassSpace = () => {
    const title = className.trim() || 'New Class Space';
    const randomCode = `${Math.floor(100 + Math.random() * 899)} ${Math.floor(100 + Math.random() * 899)}`;
    const newRow: ClassSpaceRow = {
      id: `cs-${Date.now()}`,
      title,
      subtitle: `${grade} • ${subject}`,
      thumb: c.classes[0].thumb,
      studentsCount: 1,
      capacity,
      joinCode: randomCode,
      termTitle: term,
      termDates: '1 Oct – 20 Dec',
      status: 'Active',
    };
    setClasses((prev) => [newRow, ...prev]);
    toast(`Created "${title}"! Join code: ${randomCode}`);
  };

  const filteredClasses = classes.filter(
    (item) =>
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
      item.joinCode.includes(searchQuery.trim()),
  );

  return (
    <View style={s.page}>
      {phone ? null : (
        <TeacherTopBar
          active="Classes"
          tabsVariant="live"
          me={me}
          placeholder="Search students, classes, or resources..."
        />
      )}

      <View style={s.body}>
        {/* Left Sidebar */}
        {phone ? null : (
          <TeacherSideNav title="My Classes" items={c.sideNav} active="Class Spaces" />
        )}

        {/* Center Main Column */}
        <View style={s.centerCol}>
          {/* Page Header */}
          <View style={s.headerRow}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.pageTitle}>Class Spaces</Text>
              <Text style={s.pageSub}>
                Create and manage your online class spaces in minutes.
              </Text>
            </View>
            <Pressable
              style={s.createNewTopBtn}
              onPress={handleCreateClassSpace}>
              <Icon name="plus" size={13} color={Maple.surface} />
              <Text style={s.createNewTopBtnText}>Create New Class</Text>
            </Pressable>
          </View>

          {/* Top 2-Column Split: Create a Class Space + Invite Principal Referral Banner */}
          <View style={s.topSplitRow}>
            {/* Left Card: Create a Class Space */}
            <Panel style={s.createCard}>
              <View style={s.createHeaderRow}>
                <View style={s.createIconTile}>
                  <Icon name="people" size={18} color={BLUE} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={s.cardHeading}>Create a Class Space</Text>
                  <Text style={s.cardSub}>
                    Set up your class in 2 minutes. Students can join using a 6-digit code or WhatsApp link.
                  </Text>
                </View>
              </View>

              {/* Form Row 1: Class Name, Grade/Level, Subject */}
              <View style={s.formRow}>
                <View style={phone ? s.fieldPhone : { flex: 1.55, gap: 4 }}>
                  <Text style={s.fieldLabel}>
                    Class Name <Text style={s.reqStar}>*</Text>
                  </Text>
                  <TextInput
                    value={className}
                    onChangeText={setClassName}
                    style={s.textInput}
                    placeholder="e.g. O-Level Mathematics"
                    placeholderTextColor={MUTED}
                  />
                </View>

                <View style={phone ? s.fieldPhone : { flex: 0.85, gap: 4 }}>
                  <Text style={s.fieldLabel}>
                    Grade/Level <Text style={s.reqStar}>*</Text>
                  </Text>
                  <Pressable
                    style={s.selectBox}
                    onPress={() => setGradeIdx((i) => i + 1)}>
                    <Text style={s.selectText} numberOfLines={1}>
                      {grade}
                    </Text>
                    <Icon name="chevronDown" size={10} color={BODY} />
                  </Pressable>
                </View>

                <View style={phone ? s.fieldPhone : { flex: 0.95, gap: 4 }}>
                  <Text style={s.fieldLabel}>
                    Subject <Text style={s.reqStar}>*</Text>
                  </Text>
                  <Pressable
                    style={s.selectBox}
                    onPress={() => setSubjectIdx((i) => i + 1)}>
                    <Text style={s.selectText} numberOfLines={1}>
                      {subject}
                    </Text>
                    <Icon name="chevronDown" size={10} color={BODY} />
                  </Pressable>
                </View>
              </View>

              {/* Form Row 2: Term (optional), Capacity */}
              <View style={s.formRow}>
                <View style={phone ? s.fieldPhone : { flex: 1.25, gap: 4 }}>
                  <Text style={s.fieldLabel}>Term (optional)</Text>
                  <Pressable
                    style={s.selectBox}
                    onPress={() => setTermIdx((i) => i + 1)}>
                    <Text style={s.selectText} numberOfLines={1}>
                      {term}
                    </Text>
                    <Icon name="chevronDown" size={10} color={BODY} />
                  </Pressable>
                </View>

                <View style={phone ? s.fieldPhone : { flex: 0.85, gap: 4 }}>
                  <Text style={s.fieldLabel}>Capacity</Text>
                  <View style={s.capacityBox}>
                    <Text style={s.selectText}>{capacity}</Text>
                    <View style={s.stepperArrows}>
                      <Pressable
                        onPress={() => setCapacity((n) => Math.min(200, n + 5))}
                        hitSlop={4}>
                        <Text style={s.stepperGlyph}>▴</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => setCapacity((n) => Math.max(10, n - 5))}
                        hitSlop={4}>
                        <Text style={s.stepperGlyph}>▾</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>

                {phone ? null : <View style={{ flex: 0.5 }} />}
              </View>

              {/* Join Settings */}
              <View style={{ gap: 5 }}>
                <Text style={s.fieldLabel}>Join Settings</Text>
                <View style={s.joinMethodsRow}>
                  {/* Option 1: 6-Digit Join Code */}
                  <Pressable
                    style={[
                      s.joinMethodCard,
                      joinMethod === 'code' && s.joinMethodCardOn,
                    ]}
                    onPress={() => setJoinMethod('code')}>
                    <View style={s.joinCodeCircle}>
                      <Icon name="grid" size={14} color={Maple.successText} />
                    </View>
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text style={s.joinMethodTitle}>6-Digit Join Code</Text>
                      <Text style={s.joinMethodSub}>Students enter a code to join</Text>
                    </View>
                    {joinMethod === 'code' ? (
                      <View style={s.radioChecked}>
                        <Text style={s.radioCheckMark}>✓</Text>
                      </View>
                    ) : (
                      <View style={s.radioUnchecked} />
                    )}
                  </Pressable>

                  {/* Option 2: WhatsApp Invite Link */}
                  <Pressable
                    style={[
                      s.joinMethodCard,
                      joinMethod === 'whatsapp' && s.joinMethodCardOn,
                    ]}
                    onPress={() => setJoinMethod('whatsapp')}>
                    <Image decorative
                      source={c.whatsappIcon}
                      style={s.whatsappMethodIcon}
                      contentFit="contain"
                    />
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text style={s.joinMethodTitle}>WhatsApp Invite Link</Text>
                      <Text style={s.joinMethodSub}>Share a direct link via WhatsApp</Text>
                    </View>
                    {joinMethod === 'whatsapp' ? (
                      <View style={s.radioChecked}>
                        <Text style={s.radioCheckMark}>✓</Text>
                      </View>
                    ) : (
                      <View style={s.radioUnchecked} />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Submit Button */}
              <Pressable
                style={s.createSpacePrimaryBtn}
                onPress={handleCreateClassSpace}>
                <Text style={s.createSpacePrimaryText}>Create Class Space</Text>
              </Pressable>
            </Panel>

            {/* Right Card: Invite Principal to Upgrade School Referral Banner */}
            {!bannerDismissed ? (
              <View style={s.principalCard}>
                <View style={s.principalTopRow}>
                  <View style={s.crownTile}>
                    <Image decorative
                      source={c.crownIcon}
                      style={s.crownImg}
                      contentFit="contain"
                    />
                  </View>
                  <Text style={s.principalTitle}>Invite Principal to Upgrade School</Text>
                  <Pressable
                    onPress={() => setBannerDismissed(true)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Dismiss referral banner">
                    <Icon name="close" size={12} color={BODY} />
                  </Pressable>
                </View>

                <Text style={s.principalDesc}>
                  Love using Maple with your class? Invite your principal to upgrade the whole school to unlock more features, school branding, and admin tools.
                </Text>

                {/* Benefits + School Building Illustration */}
                <View style={s.principalMidRow}>
                  <View style={s.benefitsList}>
                    {c.principalBenefits.map((b) => (
                      <View key={b} style={s.benefitRow}>
                        <View style={s.greenCheckCircle}>
                          <Text style={s.greenCheckGlyph}>✓</Text>
                        </View>
                        <Text style={s.benefitText}>{b}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Illustrated School Building */}
                  <SchoolBuildingIllustration />
                </View>

                {/* Amber CTA Button + Copy Invite Link */}
                <Pressable
                  style={s.principalBtn}
                  onPress={() =>
                    shareText(
                      'Join our teachers on Maple Global Online School! Upgrade our school for school-wide classes, branding, and analytics: https://maple.school/upgrade-school',
                    )
                  }>
                  <Icon name="send" size={13} color={INK} />
                  <Text style={s.principalBtnText}>Share Invite with Principal</Text>
                </Pressable>

                <Pressable
                  style={s.copyInviteLinkWrap}
                  onPress={() =>
                    toast('Copied school upgrade referral link: maple.school/upgrade?ref=sarah-n')
                  }>
                  <Text style={s.copyInviteLinkText}>Copy Invite Link</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* Bottom Table Card: Active Classes (4) */}
          <Panel style={s.tableCard}>
            {/* Table Top Bar: Tabs + Search / Filter / View Toggle */}
            <View style={s.tableTopBar}>
              <PhoneScroll phone={phone}>
                  <View style={s.tableTabs}>
                  {(
                    [
                      { key: 'active', label: `Active Classes (${classes.length})` },
                      { key: 'drafts', label: `Drafts (${c.draftsCount})` },
                      { key: 'archived', label: `Archived (${c.archivedCount})` },
                    ] as const
                  ).map((t) => {
                    const on = tableTab === t.key;
                    return (
                      <Pressable
                        key={t.key}
                        style={[s.tableTab, on && s.tableTabOn]}
                        onPress={() => setTableTab(t.key)}>
                        <Text style={[s.tableTabText, on && s.tableTabTextOn]}>
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </PhoneScroll>

              <View style={s.tableControls}>
                <View style={s.searchBox}>
                  <Icon name="search" size={11} color={MUTED} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search classes..."
                    placeholderTextColor={MUTED}
                    style={s.searchInput}
                  />
                </View>

                <Pressable
                  style={s.termsFilterBtn}
                  onPress={() => toast('Filtering by Term 3 (2026) & Holiday 2026.')}>
                  <Text style={s.termsFilterText}>All Terms</Text>
                  <Icon name="chevronDown" size={9} color={INK} />
                </Pressable>

                <View style={s.viewToggleGroup}>
                  <Pressable
                    style={[
                      s.viewToggleBtn,
                      viewMode === 'grid' && s.viewToggleBtnOn,
                    ]}
                    onPress={() => setViewMode('grid')}>
                    <Icon
                      name="grid"
                      size={11}
                      color={viewMode === 'grid' ? BLUE : BODY}
                    />
                    <Text
                      style={[
                        s.viewToggleText,
                        viewMode === 'grid' && s.viewToggleTextOn,
                      ]}>
                      Grid
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      s.viewToggleBtn,
                      viewMode === 'list' && s.viewToggleBtnOn,
                    ]}
                    onPress={() => setViewMode('list')}>
                    <Icon
                      name="list"
                      size={11}
                      color={viewMode === 'list' ? BLUE : BODY}
                    />
                    <Text
                      style={[
                        s.viewToggleText,
                        viewMode === 'list' && s.viewToggleTextOn,
                      ]}>
                      List
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Table Column Headers */}
            <View style={s.thRow}>
              <View style={s.colCheck}>
                <View style={s.checkbox} />
              </View>
              <Text style={[s.thText, s.colClass]}>Class Name</Text>
              <Text style={[s.thText, s.colStudents]}>Students</Text>
              <Text style={[s.thText, s.colJoin]}>Join Code / Link</Text>
              <Text style={[s.thText, s.colTerm]}>Term</Text>
              <Text style={[s.thText, s.colStatus]}>Status</Text>
              <Text style={[s.thText, s.colActions]}>Actions</Text>
            </View>

            {/* Table Rows */}
            {filteredClasses.map((row) => {
              const checked = Boolean(checkedIds[row.id]);
              const fillPct = Math.min(
                100,
                Math.round((row.studentsCount / row.capacity) * 100),
              );
              return (
                <View key={row.id} style={s.trRow}>
                  <Pressable
                    style={s.colCheck}
                    onPress={() =>
                      setCheckedIds((prev) => ({
                        ...prev,
                        [row.id]: !prev[row.id],
                      }))
                    }>
                    <View style={[s.checkbox, checked && s.checkboxOn]}>
                      {checked ? <Text style={s.checkboxTick}>✓</Text> : null}
                    </View>
                  </Pressable>

                  {/* Class Name + Thumbnail */}
                  <View style={[s.classCell, s.colClass]}>
                    <Image decorative source={row.thumb} style={s.classThumb} contentFit="cover" />
                    <View style={{ flex: 1, gap: 1 }}>
                      <Text style={s.classTitle}>{row.title}</Text>
                      <Text style={s.classSub}>{row.subtitle}</Text>
                    </View>
                  </View>

                  {/* Students Count + Progress Bar */}
                  <View style={[s.studentsCell, s.colStudents]}>
                    <Text style={s.studentsCountText}>
                      <Text style={{ fontWeight: '700', color: INK }}>
                        {row.studentsCount}
                      </Text>{' '}
                      / {row.capacity}
                    </Text>
                    <View style={s.studentsBarTrack}>
                      <View
                        style={[s.studentsBarFill, { width: `${fillPct}%` }]}
                      />
                    </View>
                  </View>

                  {/* Join Code Pill + Share via WhatsApp */}
                  <View style={[s.joinCell, s.colJoin]}>
                    <Pressable
                      style={s.codePill}
                      onPress={() =>
                        toast(`Copied 6-digit join code ${row.joinCode} to clipboard.`)
                      }>
                      <Text style={s.codePillText}>{row.joinCode}</Text>
                      <Icon name="clipboard" size={11} color={BLUE} />
                    </Pressable>

                    <Pressable
                      style={s.whatsappBtn}
                      onPress={() =>
                        shareText(
                          `Join ${row.title} on Maple Global Online School with code ${row.joinCode}: https://maple.school/join/${row.joinCode.replace(' ', '')}`,
                        )
                      }>
                      <Image decorative
                        source={c.whatsappIcon}
                        style={s.whatsappBtnIcon}
                        contentFit="contain"
                      />
                      <Text style={s.whatsappBtnText}>Share via WhatsApp</Text>
                    </Pressable>
                  </View>

                  {/* Term */}
                  <View style={[s.termCell, s.colTerm]}>
                    <Text style={s.termTitle}>{row.termTitle}</Text>
                    <Text style={s.termDates}>{row.termDates}</Text>
                  </View>

                  {/* Status */}
                  <View style={[s.statusCell, s.colStatus]}>
                    <View style={s.activeDotCircle}>
                      <Text style={s.activeDotCheck}>✓</Text>
                    </View>
                    <Text style={s.activeStatusText}>{row.status}</Text>
                  </View>

                  {/* Actions */}
                  <View style={[s.actionsCell, s.colActions]}>
                    <Pressable
                      style={s.manageBtn}
                      onPress={() =>
                        toast(`Managing ${row.title} (${row.studentsCount} students).`)
                      }>
                      <Text style={s.manageBtnText}>Manage</Text>
                    </Pressable>
                    <Pressable
                      style={s.moreDotsBtn}
                      onPress={() => toast(`More actions for ${row.title}`)}>
                      <Text style={s.moreDotsText}>•••</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}

            {/* Pagination Footer */}
            <View style={s.paginationRow}>
              <Text style={s.paginationInfo}>
                Showing 1–{filteredClasses.length} of {filteredClasses.length} classes
              </Text>

              <View style={s.pageBtns}>
                <Pressable style={s.pageBtn}>
                  <Icon name="chevronLeft" size={10} color={BODY} />
                </Pressable>
                <Pressable style={[s.pageBtn, s.pageBtnOn]}>
                  <Text style={[s.pageBtnText, s.pageBtnTextOn]}>1</Text>
                </Pressable>
                <Pressable style={s.pageBtn}>
                  <Icon name="chevronRight" size={10} color={BODY} />
                </Pressable>
              </View>

              <View style={s.rowsPerPage}>
                <Text style={s.paginationInfo}>Rows per page</Text>
                <View style={s.rowsSelect}>
                  <Text style={s.rowsSelectText}>10</Text>
                  <Icon name="chevronDown" size={9} color={INK} />
                </View>
              </View>
            </View>
          </Panel>
        </View>

        {/* Right Sidebar Column: How Students Join, Class Space Tips, Need Help? */}
        <View style={s.rightCol}>
          {/* Card 1: How Students Join */}
          <Panel style={s.rightCard}>
            <View style={s.rightHeaderRow}>
              <View style={s.blueHeaderIcon}>
                <Icon name="people" size={14} color={Maple.surface} />
              </View>
              <Text style={s.rightCardTitle}>How Students Join</Text>
            </View>

            <View style={s.stepsList}>
              {c.howStudentsJoin.map((st) => (
                <View key={st.step} style={s.stepRow}>
                  <StepBadge n={st.step} size={20} />
                  <View style={{ flex: 1, gap: 1 }}>
                    <Text style={s.stepRowTitle}>{st.title}</Text>
                    <Text style={s.stepRowSub}>{st.subtitle}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Phone Mockup Illustration */}
            <View style={s.phoneIllustrationWrap}>
              <View style={s.phoneMockupBezel}>
                <View style={s.phoneMockupNotch} />
                <View style={s.phoneMockupScreen}>
                  <Text style={s.phoneMockupHeader}>Join My Class</Text>
                  <View style={s.phoneMockupCodeCard}>
                    <Text style={s.phoneMockupCodeText}>{c.sampleJoinCode}</Text>
                  </View>
                </View>
              </View>
              <View style={s.floatingWhatsappBadge}>
                <Image decorative
                  source={c.whatsappIcon}
                  style={s.floatingWhatsappImg}
                  contentFit="contain"
                />
              </View>
            </View>
          </Panel>

          {/* Card 2: Class Space Tips */}
          <Panel style={s.rightCard}>
            <View style={s.rightHeaderRow}>
              <View style={s.amberHeaderIcon}>
                <Icon name="sparkle" size={14} color={Maple.surface} />
              </View>
              <Text style={s.rightCardTitle}>Class Space Tips</Text>
            </View>

            <View style={s.tipsList}>
              {c.tips.map((tip) => (
                <View key={tip} style={s.tipRow}>
                  <View style={s.greenCheckCircle}>
                    <Text style={s.greenCheckGlyph}>✓</Text>
                  </View>
                  <Text style={s.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </Panel>

          {/* Card 3: Need Help? */}
          <View style={s.helpCard}>
            <View style={s.helpTopRow}>
              <View style={s.helpQuestionCircle}>
                <Text style={s.helpQuestionMark}>?</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={s.rightCardTitle}>Need Help?</Text>
                <Text style={s.helpBodyText}>
                  Watch a 2-minute guide on creating and managing class spaces.
                </Text>
              </View>
            </View>

            <Pressable
              style={s.watchGuideBtn}
              onPress={() => toast('Playing 2-minute Class Spaces setup guide.')}>
              <View style={s.playCircleSmall}>
                <Icon name="playFill" size={8} color={BLUE} />
              </View>
              <Text style={s.watchGuideText}>Watch Guide</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export function ClassSpacesPhone({ c, me }: { c: ClassSpacesManager; me: TeacherMe }) {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: Maple.blueSelected }}>
      <TeacherPhoneTop me={me} />
      <ClassSpacesDesk c={c} me={me} phone />
    </ScrollView>
  );
}

/** Architectural school building illustration matching the referral card artwork. */
function SchoolBuildingIllustration() {
  return (
    <View style={s.schoolArtWrap}>
      {/* Flagpole + Red Flag */}
      <View style={s.flagAssembly}>
        <View style={s.flagPole} />
        <View style={s.redFlag} />
      </View>

      {/* Roof + Pediment */}
      <View style={s.schoolRoofBar} />
      <View style={s.schoolPediment}>
        <View style={s.pedimentClock} />
      </View>

      {/* Main 2-Story Building Facade */}
      <View style={s.schoolFacade}>
        {/* Left Wing Windows */}
        <View style={s.wingCol}>
          <View style={s.wingWinRow}>
            <View style={s.schoolWin} />
            <View style={s.schoolWin} />
          </View>
          <View style={s.wingWinRow}>
            <View style={s.schoolWin} />
            <View style={s.schoolWin} />
          </View>
        </View>

        {/* Center Portico + Double Doors */}
        <View style={s.centerPortico}>
          <View style={s.schoolWinWide} />
          <View style={s.schoolDoorFrame}>
            <View style={s.schoolDoorLeaf} />
            <View style={s.schoolDoorLeaf} />
          </View>
        </View>

        {/* Right Wing Windows */}
        <View style={s.wingCol}>
          <View style={s.wingWinRow}>
            <View style={s.schoolWin} />
            <View style={s.schoolWin} />
          </View>
          <View style={s.wingWinRow}>
            <View style={s.schoolWin} />
            <View style={s.schoolWin} />
          </View>
        </View>
      </View>

      {/* Trees + Lawn Base */}
      <View style={s.treeLeft} />
      <View style={s.treeRight} />
      <View style={s.schoolLawn} />
    </View>
  );
}
