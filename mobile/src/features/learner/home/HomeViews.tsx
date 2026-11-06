import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FuturePathCard } from '@/features/learner/careers/CareerLinks';
import { LearnerPhoneTop } from '@/features/learner/dashboard/DashPhone';

import {
  AssignmentsProjectsCard,
  Hero,
  KpiRow,
  LearningJourneyCard,
  MySubjectsCard,
  RecentWorkCard,
  RecommendedCard,
  TeacherVoiceCard,
  UpcomingLiveClassesCard,
  WeekAchievementsCard,
} from './HomeCards';
import { type Home } from './HomeFrame';
import {
  CompletedReadingCard,
  ContinueReadingCard,
  LearningTipsCard,
  MyTodoWeekCard,
  ThisWeekCard,
} from './HomeSide';
import { Maple } from '@/constants/maple';

/** The learner home reference's desktop (1280 wide, sidebar included). */
export const HOME_REF_WIDTH = 1280;

function Card({ style, children }: { style?: object; children: ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function HomeDesk({ h }: { h: Home; now?: Date }) {
  return (
    <View style={styles.canvas}>
      <View style={styles.body}>
        {/* Main Center Column */}
        <View style={styles.centerCol}>
          <Hero h={h} />
          <KpiRow h={h} />

          {/* Middle 2-Column Section: Left (My Subjects + Teacher Voice), Right (Upcoming Live Classes) */}
          <View style={styles.row}>
            <View style={styles.midLeftCol}>
              <Card>
                <MySubjectsCard h={h} />
              </Card>
              <Card>
                <TeacherVoiceCard h={h} />
              </Card>
            </View>
            <Card style={styles.midRightCol}>
              <UpcomingLiveClassesCard h={h} />
            </Card>
          </View>

          {/* Lower Middle 3-Column Section: Assignments & Projects | Recent Work | This Week's Achievements */}
          <View style={styles.row}>
            <Card style={styles.colAssignments}>
              <AssignmentsProjectsCard h={h} />
            </Card>
            <Card style={styles.colRecentWork}>
              <RecentWorkCard h={h} />
            </Card>
            <Card style={styles.colAchievements}>
              <WeekAchievementsCard h={h} />
            </Card>
          </View>

          {/* Bottom 2-Column Section: My Learning Journey | Recommended for You */}
          <View style={styles.row}>
            <Card style={styles.colJourney}>
              <LearningJourneyCard h={h} />
            </Card>
            <Card style={styles.colRecommended}>
              <RecommendedCard h={h} />
            </Card>
          </View>
        </View>

        {/* Right Column Rail */}
        <View style={styles.rightCol}>
          <Card>
            <ThisWeekCard h={h} />
          </Card>
          <Card>
            <FuturePathCard />
          </Card>
          <Card>
            <MyTodoWeekCard h={h} />
          </Card>
          <Card>
            <ContinueReadingCard h={h} />
          </Card>
          <Card>
            <CompletedReadingCard h={h} />
          </Card>
          <Card>
            <LearningTipsCard h={h} />
          </Card>
        </View>
      </View>
    </View>
  );
}

export function HomePhone({ h }: { h: Home; now?: Date }) {
  return (
    <View style={styles.phoneRoot}>
      <LearnerPhoneTop avatar={h.avatar} globe />
      <ScrollView contentContainerStyle={styles.phone}>
        <Hero h={h} phone />
        <KpiRow h={h} phone />
        <Card>
          <ThisWeekCard h={h} />
        </Card>
        <Card>
          <FuturePathCard />
        </Card>
        <Card>
          <MySubjectsCard h={h} phone />
        </Card>
        <Card>
          <TeacherVoiceCard h={h} phone />
        </Card>
        <Card>
          <UpcomingLiveClassesCard h={h} />
        </Card>
        <Card>
          <MyTodoWeekCard h={h} />
        </Card>
        <Card>
          <AssignmentsProjectsCard h={h} />
        </Card>
        <Card>
          <RecentWorkCard h={h} />
        </Card>
        <Card>
          <WeekAchievementsCard h={h} />
        </Card>
        <Card>
          <ContinueReadingCard h={h} />
        </Card>
        <Card>
          <CompletedReadingCard h={h} />
        </Card>
        <Card>
          <LearningJourneyCard h={h} phone />
        </Card>
        <Card>
          <RecommendedCard h={h} />
        </Card>
        <Card>
          <LearningTipsCard h={h} />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    width: HOME_REF_WIDTH,
    minHeight: 865,
    backgroundColor: Maple.blueSoft,
  },
  body: {
    marginLeft: 187,
    marginTop: 54,
    padding: 12,
    flexDirection: 'row',
    gap: 11,
    alignItems: 'flex-start',
  },
  centerCol: {
    flex: 1,
    gap: 10,
    minWidth: 0,
  },
  rightCol: {
    width: 246,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  midLeftCol: {
    flex: 1.75,
    gap: 10,
    minWidth: 0,
  },
  midRightCol: {
    flex: 1,
    minWidth: 0,
  },
  colAssignments: {
    flex: 1.22,
    minWidth: 0,
  },
  colRecentWork: {
    flex: 1.15,
    minWidth: 0,
  },
  colAchievements: {
    flex: 0.95,
    minWidth: 0,
  },
  colJourney: {
    flex: 1.15,
    minWidth: 0,
  },
  colRecommended: {
    flex: 1.15,
    minWidth: 0,
  },
  card: {
    padding: 12,
    borderRadius: 11,
    backgroundColor: Maple.surface,
    borderWidth: 1,
    borderColor: Maple.blueSelected,
  },
  phoneRoot: {
    flex: 1,
    backgroundColor: Maple.blueSoft,
  },
  phone: {
    gap: 12,
    padding: 12,
    paddingBottom: 110,
  },
});
