import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Icon } from '@/components/icon';
import { PremiumTiles } from '@/features/portal/Premium';
import { LanguageMenu } from '@/components/shell/LanguageMenu';
import { Bar } from '@/features/learner/dashboard/DashParts';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';
import { ProgressRing } from '@/features/learner/exam/ExamNav';
import { distinctChildSchools } from '@/lib/family/links';
import { useSwitcher } from '@/lib/switcher-context';
import { toast } from '@/lib/toast';
import type { MockData } from '@/mock';
import type { ParentChildProfile } from '@/mock/family';
import { BLUE, BODY, GREEN, INK, PARENT_HOME_REF_WIDTH } from './ParentHomeViews.styles';
import { phoneStyles } from './ParentHomeViews.phoneStyles';
import { ParentSheetContext, useParentSheet } from './ParentSheet';
import { AddChildClaimModal } from './ParentClaimModal';

export { PARENT_HOME_REF_WIDTH };

export type ParentHomeData = MockData['family']['parentHome'];

/** The parent dashboard reference's desktop width (1280 wide, sidebar included). */

const LEAF = require('@/assets/images/maple-leaf.png') as number;
const WAVE_BARS = [6, 12, 9, 16, 20, 13, 8, 15, 22, 18, 10, 14, 19, 11, 7, 14, 17, 10, 13, 8, 5, 9];

function Card({ style, children }: { style?: object; children: ReactNode }) {
  const styles = useParentSheet();
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Left dark navy sidebar for the Parent Dashboard (Image 2). */
function ParentSidebar({ p }: { p: ParentHomeData }) {
  const styles = useParentSheet();
  return (
    <LinearGradient colors={['#0A1B3D', '#07122B']} style={styles.side}>
      <Pressable style={styles.logo} onPress={() => router.push('/')} accessibilityRole="link" accessibilityLabel="Maple home">
        <Image source={LEAF} style={styles.leaf} contentFit="contain" />
        <View>
          <Text style={styles.brand}>Maple</Text>
          <Text style={styles.brandSub}>Global Online School</Text>
        </View>
      </Pressable>
      <View style={styles.nav}>
        {p.nav.map((n) => {
          const on = n.label === 'Home';
          return (
            <Pressable
              key={n.label}
              style={[styles.navItem, on && styles.navOn]}
              onPress={() => router.push(n.href)}
              accessibilityRole="link"
              accessibilityState={{ selected: on }}>
              <Icon name={n.icon} size={16} color="#FFFFFF" />
              <Text style={[styles.navText, on && styles.navTextOn]} numberOfLines={1}>
                {n.label}
              </Text>
              {n.badge ? (
                <View style={styles.navBadge}>
                  <Text style={styles.navBadgeText}>{n.badge}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <LinearGradient colors={['#122B5E', '#1E3A8A', '#3B4278']} style={styles.explorePromo}>
        <Image source={p.sidebarBooksArt} style={styles.promoArt} contentFit="cover" />
        <Text style={styles.promoTitle}>{'Explore. Learn.\nGrow.'}</Text>
        <Text style={styles.promoSub}>{'New subjects, books\nand live sessions\navailable now.'}</Text>
        <Pressable
          style={styles.promoBtn}
          onPress={() => router.push('/learn/explore')}
          accessibilityRole="button"
          accessibilityLabel="Explore Now">
          <Text style={styles.promoBtnText}>Explore Now</Text>
          <Icon name="arrowRight" size={12} color={INK} />
        </Pressable>
      </LinearGradient>
    </LinearGradient>
  );
}

/** Top header bar for the Parent Dashboard, displaying the active child's name/grade on the right and allowing portal switching. */
function ParentHeader({ p, child }: { p: ParentHomeData; child: ParentChildProfile }) {
  const styles = useParentSheet();
  const switcher = useSwitcher();
  return (
    <View style={styles.header}>
      <Pressable
        style={styles.listBtn}
        onPress={() => router.push('/learn/explore')}
        accessibilityRole="button"
        accessibilityLabel="Navigation menu">
        <Icon name="list" size={19} color={BLUE} />
      </Pressable>
      <View style={styles.search}>
        <Icon name="search" size={15} color={BLUE} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search classes, assignments, resources, teachers, or topics..."
          placeholderTextColor="#6B7385"
          accessibilityLabel="Search"
        />
      </View>
      <View style={styles.flex} />
      <LanguageMenu style={styles.lang}>
        <Icon name="globe" size={17} color={INK} />
        <Text style={styles.langText}>English</Text>
        <Icon name="chevronDown" size={12} color={INK} />
      </LanguageMenu>
      <Pressable
        style={styles.bell}
        onPress={() => router.push('/messages')}
        accessibilityRole="button"
        accessibilityLabel={`Notifications, ${p.unreadNotifications} unread`}
        hitSlop={8}>
        <Icon name="bell" size={21} color={INK} />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{p.unreadNotifications}</Text>
        </View>
      </Pressable>
      <Pressable
        style={styles.me}
        onPress={switcher?.open}
        accessibilityRole="button"
        accessibilityLabel={`${child.fullName}, ${child.tabGrade}. Switch mode`}>
        <Image source={child.avatar} style={styles.avatar} />
        <View>
          <Text style={styles.meName}>{child.fullName}</Text>
          <View style={styles.meSubRow}>
            <Text style={styles.meGrade}>{child.tabGrade}</Text>
            <Icon name="chevronDown" size={10} color={BODY} />
          </View>
        </View>
        <Icon name="chevronDown" size={13} color={INK} />
      </Pressable>
    </View>
  );
}

/**
 * Hero Banner with "My Children" switcher bar:
 * Toggling any child immediately brings up that student's profile (even across different schools on the platform).
 */
function ParentHeroBanner({
  p,
  childrenList,
  selectedId,
  onSelect,
  onOpenAddModal,
}: {
  p: ParentHomeData;
  childrenList: readonly ParentChildProfile[];
  selectedId: string;
  onSelect: (id: string) => void;
  onOpenAddModal: () => void;
}) {
  const styles = useParentSheet();
  const activeChild = childrenList.find((c) => c.id === selectedId) ?? childrenList[0];
  return (
    <LinearGradient colors={['#C6DDFB', '#DCEBFC', '#EAF3FE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
      <Image
        source={activeChild.heroPhoto}
        style={styles.heroChildPhoto}
        contentFit="cover"
        accessibilityLabel={`${activeChild.fullName} smiling`}
      />
      <View style={styles.heroBody}>
        <View style={styles.heroTopRow}>
          <View style={styles.flex}>
            <Text style={styles.heroWelcome}>{`Welcome back, ${activeChild.firstName}!`}</Text>
            <Text style={styles.heroSub}>{"Here's how your learning is going this week."}</Text>
          </View>
          <View style={styles.weekRightCol}>
            <Pressable
              style={styles.weekDropdown}
              onPress={() => toast(`Showing learning report for ${p.weekRange}`)}
              accessibilityRole="button"
              accessibilityLabel={`This Week ${p.weekRange}`}>
              <View style={styles.weekCalIcon}>
                <Icon name="calendar" size={15} color={BLUE} />
              </View>
              <View style={styles.weekText}>
                <Text style={styles.weekTitle}>This Week</Text>
                <Text style={styles.weekDate}>{p.weekRange}</Text>
              </View>
              <Icon name="chevronDown" size={13} color={INK} />
            </Pressable>
            <Image source={p.heroBooksArt} style={styles.heroBooksImg} contentFit="cover" />
          </View>
        </View>

        <Text style={styles.myChildrenLabel}>My Children</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.childrenBar}>
          {childrenList.map((c) => {
            const on = c.id === activeChild.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.childPill, on && styles.childPillOn]}
                onPress={() => onSelect(c.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${c.tabName}, ${c.tabGrade}, ${c.school}`}>
                <Image source={c.avatar} style={styles.childPillAvatar} />
                <View>
                  <Text style={[styles.childPillName, on && styles.childPillNameOn]}>{c.tabName}</Text>
                  <Text style={styles.childPillGrade}>{c.tabGrade}</Text>
                </View>
              </Pressable>
            );
          })}
          <Pressable
            style={styles.addChildPill}
            onPress={onOpenAddModal}
            accessibilityRole="button"
            accessibilityLabel="Add Child via QR code or platform claim">
            <Icon name="plus" size={13} color={BLUE} />
            <Text style={styles.addChildText}>Add Child</Text>
          </Pressable>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

/** Active child profile summary card + 4 separate subject cards row below it (updates dynamically when toggled!). */
function StudentProfileOverviewCard({ child, phone = false }: { child: ParentChildProfile; phone?: boolean }) {
  const styles = useParentSheet();
  return (
    <>
      <Card>
        <View style={styles.profileTopRow}>
          {/* Student Avatar + Name + Grade/School + Active Learner Badge */}
          <View style={styles.profileIdentity}>
            <Image source={child.avatar} style={styles.profileBigAvatar} contentFit="cover" />
            <View style={styles.profileTextCol}>
              <Text style={styles.profileName}>{child.fullName}</Text>
              <Text style={styles.profileSchool}>{child.gradeAndSchool}</Text>
              <View style={styles.activeLearnerBadge}>
                <View style={styles.activeCheckDot}>
                  <Icon name="check" size={9} color="#FFFFFF" />
                </View>
                <Text style={styles.activeLearnerText}>{child.statusBadge}</Text>
              </View>
            </View>
          </View>

          {/* Green Weekly Highlight Box */}
          <View style={styles.greatWeekBox}>
            <View style={styles.greatWeekStar}>
              <Icon name="star" size={16} color="#FFFFFF" />
            </View>
            <View style={styles.flex}>
              <Text style={styles.greatWeekTitle}>{child.weekSummaryTitle}</Text>
              <Text style={styles.greatWeekBody}>{child.weekSummaryBody}</Text>
            </View>
          </View>

          {/* Circular Completion Ring + Achievements & Weekly Delta */}
          <View style={styles.completionCluster}>
            <View style={styles.ringWrap}>
              <ProgressRing value={child.overallCompletion / 100} size={78} stroke={7} color={GREEN} track="#DCFCE7" labelSize={15} />
              <Text style={styles.ringSubLabel}>{'Overall\nCompletion'}</Text>
            </View>
            <View style={styles.clusterStatsCol}>
              <View style={styles.clusterStatItem}>
                <Icon name="star" size={18} color="#F59E0B" />
                <View>
                  <Text style={styles.clusterStatNum}>{child.achievementsCount}</Text>
                  <Text style={styles.clusterStatLabel}>Achievements</Text>
                </View>
              </View>
              <View style={styles.clusterStatItem}>
                <View style={styles.upArrowBox}>
                  <Icon name="chart" size={12} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={[styles.clusterStatNum, { color: GREEN }]}>{child.weeklyDelta}</Text>
                  <Text style={styles.clusterStatLabel}>vs. last week</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Card>

      {/* 4 Separate White Subject Cards Row (matching Image 2); premium tiles on phones */}
      {phone ? (
        <PremiumTiles
          title="Subject Performance"
          subtitle="This term's scores by subject."
          minHeight={140}
          items={child.subjects.map((s) => ({ label: s.subject, value: s.score, icon: s.icon, tone: 'blue' as const, color: s.color, delta: s.delta, caption: 'this term', onPress: () => router.push('/learn/progress') }))}
        />
      ) : (
      <View style={styles.subjectsRow}>
        {child.subjects.map((s) => (
          <Pressable
            key={s.id}
            style={styles.subjectCard}
            onPress={() => router.push('/learn/progress')}
            accessibilityRole="link"
            accessibilityLabel={`${s.subject}: ${s.score}, up ${s.delta}`}>
            <View style={[styles.subjectIconTile, { backgroundColor: s.color }]}>
              <Icon name={s.icon} size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.subjectCardName}>{s.subject}</Text>
              <View style={styles.subjectCardScoreRow}>
                <Text style={styles.subjectCardScore}>{s.score}</Text>
                <Text style={styles.subjectCardDelta}>{`↑${s.delta}`}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      )}
    </>
  );
}

/** Voice note card from the active child's teacher. */
function ParentTeacherVoiceCard({ child }: { child: ParentChildProfile }) {
  const styles = useParentSheet();
  const [playing, setPlaying] = useState(false);
  const m = child.teacherMessage;
  return (
    <Card>
      <View style={styles.voiceRow}>
        <Image source={m.avatar} style={styles.teacherAvatar} contentFit="cover" />
        <View style={styles.voiceMeta}>
          <Text style={styles.voiceTitle}>{m.heading}</Text>
          <Text style={styles.voiceSub}>{m.teacherName}</Text>
          <Text style={styles.voiceSub}>{m.teacherRole}</Text>
        </View>
        <View style={styles.voicePlayer}>
          <Pressable
            style={styles.playCircle}
            onPress={() => {
              setPlaying((prev) => !prev);
              toast(playing ? 'Paused teacher voice message.' : `Playing ${m.teacherName}'s voice update...`);
            }}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause voice message' : 'Play voice message'}>
            <Icon name={playing ? 'pause' : 'playFill'} size={13} color="#FFFFFF" />
          </Pressable>
          <View style={styles.waveWrap}>
            {WAVE_BARS.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.waveBar,
                  {
                    height: h,
                    backgroundColor: playing || i < 12 ? BLUE : '#CBD5E1',
                  },
                ]}
              />
            ))}
          </View>
          <Text style={styles.voiceDuration}>{playing ? '0:07 / 0:20' : m.duration}</Text>
        </View>
        <View style={styles.quoteBubble}>
          <Text style={styles.quoteGlyph}>“</Text>
          <Text style={styles.quoteBody}>{m.quote}</Text>
        </View>
      </View>
    </Card>
  );
}

/** Upcoming Activities + Recent Work side-by-side cards for the active child. */
function ActivitiesAndRecentRow({ child }: { child: ParentChildProfile }) {
  const styles = useParentSheet();
  return (
    <View style={styles.twoColRow}>
      {/* Left: Upcoming Activities */}
      <Card style={styles.halfCard}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.headerIconTile, { backgroundColor: '#EAF3FF' }]}>
            <Icon name="calendar" size={15} color={BLUE} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardHeaderTitle}>Upcoming Activities</Text>
            <Text style={styles.cardHeaderSub}>Classes, assignments and important dates.</Text>
          </View>
          <Pressable style={styles.viewAllLink} onPress={() => router.push('/learn/live')} accessibilityRole="link">
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="chevronRight" size={11} color={BLUE} />
          </Pressable>
        </View>
        <View style={styles.listStack}>
          {child.upcomingActivities.map((a) => (
            <Pressable
              key={a.id}
              style={styles.activityItem}
              onPress={() => router.push(a.href)}
              accessibilityRole="link"
              accessibilityLabel={`${a.dow} ${a.date}: ${a.title}, ${a.time}`}>
              <View style={styles.activityDateBadge}>
                <Text style={styles.activityDow}>{a.dow}</Text>
                <Text style={styles.activityDate}>{a.date}</Text>
              </View>
              <View style={[styles.activityDot, { backgroundColor: a.dotColor }]} />
              <View style={styles.flex}>
                <Text style={styles.activityTitle} numberOfLines={1}>
                  {a.title}
                </Text>
                <Text style={styles.activityTime}>{a.time}</Text>
              </View>
              <View style={[styles.activityRightIcon, { backgroundColor: a.rightBg }]}>
                <Icon name={a.rightIcon} size={13} color={a.rightColor} />
              </View>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Right: Recent Work */}
      <Card style={styles.halfCard}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.headerIconTile, { backgroundColor: '#F3EEFF' }]}>
            <Icon name="clipboard" size={15} color="#7C3AED" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardHeaderTitle}>Recent Work</Text>
            <Text style={styles.cardHeaderSub}>Detailed status, submissions and feedback.</Text>
          </View>
          <Pressable style={styles.viewAllLink} onPress={() => router.push('/learn/assignments')} accessibilityRole="link">
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="chevronRight" size={11} color={BLUE} />
          </Pressable>
        </View>
        <View style={styles.listStack}>
          {child.recentWork.map((w) => {
            const graded = w.status === 'Graded';
            return (
              <Pressable
                key={w.id}
                style={styles.workItem}
                onPress={() => router.push(w.href)}
                accessibilityRole="link"
                accessibilityLabel={`${w.title}, ${w.subject}, ${w.status} ${w.score}`}>
                <View style={[styles.workIconBox, { backgroundColor: w.iconBg }]}>
                  <Icon name="clipboard" size={14} color={w.iconColor} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {w.title}
                  </Text>
                  <Text style={styles.activityTime}>{w.subject}</Text>
                </View>
                <View style={[styles.statusBadge, graded ? styles.statusGraded : styles.statusSubmitted]}>
                  <Text style={[styles.statusBadgeText, graded ? styles.statusGradedText : styles.statusSubmittedText]}>{w.status}</Text>
                </View>
                <Text style={styles.workScore}>{w.score}</Text>
                <Icon name="chevronRight" size={12} color={BODY} />
              </Pressable>
            );
          })}
        </View>
      </Card>
    </View>
  );
}

/** Bottom "This Week's Achievements" 4-tile card. */
function ParentAchievementsCard({ child }: { child: ParentChildProfile }) {
  const styles = useParentSheet();
  return (
    <Card>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.headerIconTile, { backgroundColor: '#EAFBF0' }]}>
          <Icon name="trophy" size={15} color={GREEN} />
        </View>
        <View style={styles.flex}>
          <Text style={styles.cardHeaderTitle}>{"This Week's Achievements"}</Text>
          <Text style={styles.cardHeaderSub}>{`Celebrate ${child.firstName}'s progress!`}</Text>
        </View>
        <Pressable style={styles.viewAllLink} onPress={() => router.push('/learn/passport')} accessibilityRole="link">
          <Text style={styles.viewAllText}>View All</Text>
          <Icon name="chevronRight" size={11} color={BLUE} />
        </Pressable>
      </View>
      <View style={styles.achievementsGrid}>
        {child.achievements.map((a) => (
          <View key={a.id} style={styles.achievementTile}>
            <View style={[styles.achievementIconBox, { backgroundColor: a.bg }]}>
              <Icon name={a.icon} size={17} color={a.color} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.achievementTitle}>{a.title.replace(/\n/g, ' ')}</Text>
              {a.sub ? <Text style={styles.achievementSub}>{a.sub}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </Card>
  );
}

/** Right column rail for the Parent Dashboard: Home Learning Tips, Continue Reading, Completed, Quick Links. */
function ParentRightRail({ p, child }: { p: ParentHomeData; child: ParentChildProfile }) {
  const styles = useParentSheet();
  const cr = child.continueReading;
  return (
    <View style={styles.rightCol}>
      {/* Home Learning Tips */}
      <Card style={styles.tipsCard}>
        <View style={styles.cardHeaderRow}>
          <View style={[styles.headerIconTile, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="sparkle" size={16} color="#D97706" />
          </View>
          <View style={styles.flex}>
            <Text style={styles.cardHeaderTitle}>Home Learning Tips</Text>
            <Text style={styles.cardHeaderSub}>{child.homeTips.subtitle}</Text>
          </View>
        </View>
        <View style={styles.tipsList}>
          {child.homeTips.items.map((tip) => (
            <View key={tip} style={styles.tipItem}>
              <View style={styles.tipCheckCircle}>
                <Icon name="check" size={9} color="#FFFFFF" />
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
        <Pressable
          style={styles.moreTipsBtn}
          onPress={() => toast(`Showing more home learning tips for ${child.firstName}.`)}
          accessibilityRole="button"
          accessibilityLabel="View More Tips">
          <Icon name="book" size={13} color={BLUE} />
          <Text style={styles.moreTipsText}>View More Tips</Text>
        </Pressable>
      </Card>

      {/* Continue Reading */}
      <Card>
        <View style={styles.cardHeaderRow}>
          <Icon name="book" size={15} color={BLUE} />
          <Text style={styles.cardHeaderTitle}>Continue Reading</Text>
          <View style={styles.flex} />
          <Pressable style={styles.viewAllLink} onPress={() => router.push('/learn/library')} accessibilityRole="link">
            <Text style={styles.viewAllText}>See All</Text>
            <Icon name="chevronRight" size={11} color={BLUE} />
          </Pressable>
        </View>
        <Pressable
          style={styles.readingRow}
          onPress={() => router.push('/learn/library')}
          accessibilityRole="link"
          accessibilityLabel={`${cr.title}, ${cr.meta}, ${cr.percentLabel}`}>
          <Image source={cr.thumb} style={styles.readingThumb} contentFit="cover" />
          <View style={styles.flex}>
            <Text style={styles.readingTitle} numberOfLines={1}>
              {cr.title}
            </Text>
            <Text style={styles.readingMeta}>{cr.meta}</Text>
            <View style={styles.readingBarRow}>
              <View style={styles.flex}>
                <Bar value={cr.progress} color={BLUE} track="#E2E8F0" height={6} />
              </View>
              <Text style={styles.readingPct}>{cr.percentLabel}</Text>
            </View>
          </View>
          <View style={styles.readingPlayBtn}>
            <Icon name="playFill" size={10} color={BLUE} />
          </View>
        </Pressable>
      </Card>

      {/* Completed */}
      <Card>
        <View style={styles.cardHeaderRow}>
          <View style={styles.completedHeaderDot}>
            <Icon name="check" size={10} color="#FFFFFF" />
          </View>
          <Text style={styles.cardHeaderTitle}>Completed</Text>
          <View style={styles.flex} />
          <Pressable style={styles.viewAllLink} onPress={() => router.push('/learn/library')} accessibilityRole="link">
            <Text style={styles.viewAllText}>See All</Text>
            <Icon name="chevronRight" size={11} color={BLUE} />
          </Pressable>
        </View>
        <View style={styles.completedList}>
          {child.completedReading.map((b) => (
            <Pressable
              key={b.id}
              style={styles.completedRow}
              onPress={() => router.push('/learn/library')}
              accessibilityRole="link"
              accessibilityLabel={`${b.title}, ${b.meta}`}>
              <Image source={b.thumb} style={styles.completedThumb} contentFit="cover" />
              <View style={styles.flex}>
                <Text style={styles.readingTitle} numberOfLines={1}>
                  {b.title}
                </Text>
                <Text style={styles.readingMeta} numberOfLines={1}>
                  {b.meta}
                </Text>
              </View>
              <View style={styles.completedGreenCheck}>
                <Icon name="check" size={10} color="#FFFFFF" />
              </View>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Quick Links */}
      <Card>
        <View style={styles.cardHeaderRow}>
          <Icon name="bolt" size={15} color="#F59E0B" />
          <Text style={styles.cardHeaderTitle}>Quick Links</Text>
        </View>
        <View style={styles.quickGrid}>
          {p.quickLinks.map((q) => (
            <Pressable
              key={q.id}
              style={styles.quickTile}
              onPress={() => router.push(q.href)}
              accessibilityRole="link"
              accessibilityLabel={q.label.replace('\n', ' ')}>
              <View style={[styles.quickIconCircle, { backgroundColor: q.bg }]}>
                <Icon name={q.icon} size={16} color={q.color} />
              </View>
              <Text style={styles.quickTileLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>
    </View>
  );
}

/** Desktop Parent Dashboard (`ParentHomeDesk`) matching Image 2. */
export function ParentHomeDesk({ p }: { p: ParentHomeData }) {
  const styles = useParentSheet();
  const [childrenList, setChildrenList] = useState<readonly ParentChildProfile[]>(p.childrenProfiles);
  const [selectedId, setSelectedId] = useState<string>(p.childrenProfiles[0].id);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeChild = childrenList.find((c) => c.id === selectedId) ?? childrenList[0];
  const schools = distinctChildSchools(childrenList);
  const alreadyLinked = childrenList.some((c) => c.id === p.claimableChild.id);

  const handleLinkChild = (claimed: ParentChildProfile) => {
    if (!childrenList.some((c) => c.id === claimed.id)) {
      setChildrenList((prev) => [...prev, claimed]);
    }
    setSelectedId(claimed.id);
    setShowAddModal(false);
    toast(`Linked ${claimed.fullName} (${claimed.school}) to your family dashboard!`);
  };

  return (
    <View style={styles.canvas}>
      <ParentSidebar p={p} />
      <ParentHeader p={p} child={activeChild} />
      <View style={styles.body}>
        <View style={styles.centerCol}>
          <ParentHeroBanner
            p={p}
            childrenList={childrenList}
            selectedId={selectedId}
            onSelect={(id) => {
              setSelectedId(id);
              const found = childrenList.find((c) => c.id === id);
              if (found) toast(`Switched to ${found.fullName} (${found.gradeAndSchool})`);
            }}
            onOpenAddModal={() => setShowAddModal((v) => !v)}
          />
          {showAddModal ? (
            <AddChildClaimModal
              claimable={p.claimableChild}
              alreadyLinked={alreadyLinked}
              schools={schools}
              onClose={() => setShowAddModal(false)}
              onLinkChild={handleLinkChild}
            />
          ) : null}
          <StudentProfileOverviewCard child={activeChild} />
          <ParentTeacherVoiceCard child={activeChild} />
          <ActivitiesAndRecentRow child={activeChild} />
          <ParentAchievementsCard child={activeChild} />
        </View>
        <ParentRightRail p={p} child={activeChild} />
      </View>
    </View>
  );
}

/** Mobile Parent Dashboard (`ParentHomePhone`) with full multi-child switching and cross-school QR/login claiming. */
export function ParentHomePhone({ p }: { p: ParentHomeData }) {
  const styles = useParentSheet();
  const [childrenList, setChildrenList] = useState<readonly ParentChildProfile[]>(p.childrenProfiles);
  const [selectedId, setSelectedId] = useState<string>(p.childrenProfiles[0].id);
  const [showAddModal, setShowAddModal] = useState(false);

  const activeChild = childrenList.find((c) => c.id === selectedId) ?? childrenList[0];
  const schools = distinctChildSchools(childrenList);
  const alreadyLinked = childrenList.some((c) => c.id === p.claimableChild.id);

  const handleLinkChild = (claimed: ParentChildProfile) => {
    if (!childrenList.some((c) => c.id === claimed.id)) {
      setChildrenList((prev) => [...prev, claimed]);
    }
    setSelectedId(claimed.id);
    setShowAddModal(false);
    toast(`Linked ${claimed.fullName} (${claimed.school}) to your family dashboard!`);
  };

  return (
    <ParentSheetContext.Provider value={phoneStyles}>
      <View style={styles.phoneRoot}>
        <LearnerPhoneTop avatar={activeChild.avatar} globe />
        <ScrollView contentContainerStyle={styles.phoneScroll}>
          <ParentHeroBanner
            p={p}
            childrenList={childrenList}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onOpenAddModal={() => setShowAddModal((v) => !v)}
          />
          {showAddModal ? (
            <AddChildClaimModal
              claimable={p.claimableChild}
              alreadyLinked={alreadyLinked}
              schools={schools}
              onClose={() => setShowAddModal(false)}
              onLinkChild={handleLinkChild}
            />
          ) : null}
          <StudentProfileOverviewCard child={activeChild} phone />
          <ParentTeacherVoiceCard child={activeChild} />
          <ActivitiesAndRecentRow child={activeChild} />
          <ParentAchievementsCard child={activeChild} />
          <ParentRightRail p={p} child={activeChild} />
        </ScrollView>
      </View>
    </ParentSheetContext.Provider>
  );
}
