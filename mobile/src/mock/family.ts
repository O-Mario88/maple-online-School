/** Parent fixtures (design builds only; never bundled in deployment). */
import type { Href } from 'expo-router';

import type { IconName } from '@/lib/icons';

import { photos } from './photos';

export interface ParentChildSubject {
  id: string;
  subject: string;
  score: string;
  delta: string;
  color: string;
  bg: string;
  icon: IconName;
}

export interface ParentUpcomingActivity {
  id: string;
  dow: string;
  date: string;
  title: string;
  time: string;
  dotColor: string;
  rightIcon: IconName;
  rightColor: string;
  rightBg: string;
  href: Href;
}

export interface ParentRecentWork {
  id: string;
  title: string;
  subject: string;
  status: 'Graded' | 'Submitted';
  score: string;
  iconColor: string;
  iconBg: string;
  href: Href;
}

export interface ParentAchievementItem {
  id: string;
  title: string;
  sub: string;
  icon: IconName;
  color: string;
  bg: string;
}

export interface ParentChildProfile {
  id: string;
  tabName: string;
  tabGrade: string;
  firstName: string;
  fullName: string;
  grade: string;
  school: string;
  gradeAndSchool: string;
  claimSource: 'QR Code Claim' | 'Platform Login Claim';
  claimToken: string;
  admissionNo: string;
  avatar: number;
  heroPhoto: number;
  statusBadge: string;
  weekSummaryTitle: string;
  weekSummaryBody: string;
  overallCompletion: number;
  achievementsCount: number;
  weeklyDelta: string;
  subjects: readonly ParentChildSubject[];
  teacherMessage: {
    heading: string;
    teacherName: string;
    teacherRole: string;
    avatar: number;
    duration: string;
    quote: string;
  };
  upcomingActivities: readonly ParentUpcomingActivity[];
  recentWork: readonly ParentRecentWork[];
  achievements: readonly ParentAchievementItem[];
  homeTips: {
    subtitle: string;
    items: readonly string[];
  };
  continueReading: {
    title: string;
    meta: string;
    progress: number;
    percentLabel: string;
    thumb: number;
  };
  completedReading: readonly {
    id: string;
    title: string;
    meta: string;
    thumb: number;
  }[];
}

export const parentHome = {
  weekRange: '20 – 26 Oct 2026',
  unreadNotifications: 4,
  sidebarBooksArt: photos.learnerHome['pdash-sidebar-promo'],
  heroBooksArt: photos.learnerHome['pdash-hero-books'],
  nav: [
    { label: 'Home', icon: 'home' as IconName, href: '/' as Href },
    { label: 'Classes', icon: 'book' as IconName, href: '/learn/live' as Href },
    { label: 'Assignments', icon: 'clipboard' as IconName, href: '/learn/assignments' as Href, badge: 3 },
    { label: 'Tests & Quizzes', icon: 'sparkle' as IconName, href: '/learn/paper' as Href },
    { label: 'Projects', icon: 'folder' as IconName, href: '/learn/projects' as Href },
    { label: 'Progress', icon: 'chart' as IconName, href: '/learn/progress' as Href },
    { label: 'Results', icon: 'trophy' as IconName, href: '/learn/passport' as Href },
    { label: 'Library', icon: 'book' as IconName, href: '/learn/library' as Href },
    { label: 'Live Classes', icon: 'calendar' as IconName, href: '/learn/live' as Href },
    { label: 'Live Tutoring', icon: 'mic' as IconName, href: '/learn/live' as Href },
    { label: 'My Teachers', icon: 'people' as IconName, href: '/messages' as Href },
    { label: 'Messages', icon: 'mail' as IconName, href: '/messages' as Href, badge: 2 },
    { label: 'Settings', icon: 'settings' as IconName, href: '/family/settings' as Href },
  ],
  quickLinks: [
    { id: 'ql1', label: 'My Classes', icon: 'people' as IconName, color: '#1463F3', bg: '#EAF3FF', href: '/learn/live' as Href },
    { id: 'ql2', label: 'Assignments', icon: 'clipboard' as IconName, color: '#F59E0B', bg: '#FEF5E7', href: '/learn/assignments' as Href },
    { id: 'ql3', label: 'Tests &\nQuizzes', icon: 'sparkle' as IconName, color: '#7C3AED', bg: '#F3EEFF', href: '/learn/paper' as Href },
    { id: 'ql4', label: 'Projects', icon: 'folder' as IconName, color: '#16A34A', bg: '#EAFBF0', href: '/learn/projects' as Href },
    { id: 'ql5', label: 'Results', icon: 'chart' as IconName, color: '#16A34A', bg: '#EAFBF0', href: '/learn/passport' as Href },
    { id: 'ql6', label: 'Library', icon: 'book' as IconName, color: '#1463F3', bg: '#EAF3FF', href: '/learn/library' as Href },
    { id: 'ql7', label: 'Live Classes', icon: 'video' as IconName, color: '#0284C7', bg: '#EBF5FF', href: '/learn/live' as Href },
    { id: 'ql8', label: 'Live Tutoring', icon: 'mic' as IconName, color: '#1463F3', bg: '#EAF3FF', href: '/learn/live' as Href },
  ],
  childrenProfiles: [
    {
      id: 'mary',
      tabName: 'Mary N.',
      tabGrade: 'Primary 6',
      firstName: 'Mary',
      fullName: 'Mary N.',
      grade: 'Primary 6',
      school: 'Maple Online School',
      gradeAndSchool: 'Primary 6 • Maple Online School',
      claimSource: 'Platform Login Claim',
      claimToken: 'MPL-8821',
      admissionNo: 'MOS-2026-0184',
      avatar: photos.learnerHome['pdash-mary-avatar'],
      heroPhoto: photos.learnerHome['pdash-mary-hero'],
      statusBadge: 'Active Learner',
      weekSummaryTitle: 'A great week, Mary!',
      weekSummaryBody: 'You completed 8 out of 9 activities, showed good improvement in Mathematics, and participated actively in class.',
      overallCompletion: 89,
      achievementsCount: 3,
      weeklyDelta: '+12%',
      subjects: [
        { id: 's1', subject: 'Mathematics', score: '86%', delta: '+14%', color: '#1463F3', bg: '#EAF3FF', icon: 'grid' },
        { id: 's2', subject: 'English', score: '82%', delta: '+8%', color: '#E5484D', bg: '#FDEEEF', icon: 'book' },
        { id: 's3', subject: 'Science', score: '78%', delta: '+5%', color: '#F59E0B', bg: '#FFF6E5', icon: 'sparkle' },
        { id: 's4', subject: 'Social Studies', score: '91%', delta: '+10%', color: '#7C3AED', bg: '#F3EEFF', icon: 'globe' },
      ],
      teacherMessage: {
        heading: "A message from Mary's teacher",
        teacherName: 'Ms. Sarah N.',
        teacherRole: 'Mathematics Teacher',
        avatar: photos.teacherHome.sarah,
        duration: '0:00 / 0:20',
        quote: 'Mary has been very focused in class this week and is asking great questions. Keep encouraging her!"',
      },
      upcomingActivities: [
        {
          id: 'ua1',
          dow: 'Mon',
          date: '26 Oct',
          title: 'Mathematics Live Class',
          time: '3:00 PM – 4:00 PM',
          dotColor: '#1463F3',
          rightIcon: 'video',
          rightColor: '#1463F3',
          rightBg: '#EAF3FF',
          href: '/learn/live-room',
        },
        {
          id: 'ua2',
          dow: 'Tue',
          date: '27 Oct',
          title: 'Science Assignment Due',
          time: 'End of day',
          dotColor: '#16A34A',
          rightIcon: 'clipboard',
          rightColor: '#1463F3',
          rightBg: '#EAF3FF',
          href: '/learn/assignments',
        },
        {
          id: 'ua3',
          dow: 'Thu',
          date: '29 Oct',
          title: 'English Reading Quiz',
          time: '3:00 PM – 3:30 PM',
          dotColor: '#7C3AED',
          rightIcon: 'check',
          rightColor: '#7C3AED',
          rightBg: '#F3EEFF',
          href: '/learn/paper',
        },
      ],
      recentWork: [
        { id: 'rw1', title: 'Algebra Worksheet', subject: 'Mathematics', status: 'Graded', score: '92%', iconColor: '#16A34A', iconBg: '#EAFBF0', href: '/learn/assignments/a1/feedback' },
        { id: 'rw2', title: 'Essay: My Community', subject: 'English', status: 'Graded', score: '85%', iconColor: '#E5484D', iconBg: '#FDEEEF', href: '/learn/assignments/a1/feedback' },
        { id: 'rw3', title: 'Science Lab Report', subject: 'Science', status: 'Submitted', score: '–', iconColor: '#F59E0B', iconBg: '#FFF6E5', href: '/learn/assignments' },
      ],
      achievements: [
        { id: 'ac1', title: 'Completed all\nMaths homework', sub: '24 Oct', icon: 'star', color: '#F59E0B', bg: '#FEF5E7' },
        { id: 'ac2', title: 'Participated actively\nin Science class', sub: '22 Oct', icon: 'people', color: '#7C3AED', bg: '#F3EEFF' },
        { id: 'ac3', title: 'Improved test score\nby 15%', sub: '21 Oct', icon: 'record', color: '#E5484D', bg: '#FEECEC' },
        { id: 'ac4', title: '7-day learning streak\nKeep it up!', sub: '', icon: 'trophy', color: '#F59E0B', bg: '#FEF5E7' },
      ],
      homeTips: {
        subtitle: 'Simple ways to support Mary at home.',
        items: [
          'Practice 10 minutes of mental maths daily.',
          'Encourage reading for 15 minutes each evening.',
          'Ask Mary to explain what she learned in her own words.',
        ],
      },
      continueReading: {
        title: 'Fractions and Decimals',
        meta: 'Mathematics • Chapter 3',
        progress: 0.68,
        percentLabel: '68%',
        thumb: photos.library['c-fractions'],
      },
      completedReading: [
        { id: 'cr1', title: 'The Water Cycle', meta: 'Science • Completed Oct 20, 2026', thumb: photos.library['c-water-cycle'] },
        { id: 'cr2', title: 'Reading Comprehension', meta: 'English • Completed Oct 15, 2026', thumb: photos.library['c-reading-comp'] },
      ],
    },
    {
      id: 'daniel',
      tabName: 'Daniel',
      tabGrade: 'O-Level',
      firstName: 'Daniel',
      fullName: 'Daniel O.',
      grade: 'O-Level (S.3)',
      school: 'Kampala High School',
      gradeAndSchool: 'O-Level (S.3) • Kampala High School',
      claimSource: 'QR Code Claim',
      claimToken: 'KHS-4920',
      admissionNo: 'KHS-2026-0412',
      avatar: photos.roles['daniel'],
      heroPhoto: photos.teacherHost.daniel,
      statusBadge: 'Active Learner',
      weekSummaryTitle: 'Strong momentum, Daniel!',
      weekSummaryBody: 'Daniel completed all 6 O-Level Mathematics problem sets at Kampala High School and scored 92% on his Fractions & Quadratics test.',
      overallCompletion: 91,
      achievementsCount: 4,
      weeklyDelta: '+14%',
      subjects: [
        { id: 's1', subject: 'Mathematics', score: '89%', delta: '+14%', color: '#1463F3', bg: '#EAF3FF', icon: 'grid' },
        { id: 's2', subject: 'Physics', score: '85%', delta: '+11%', color: '#0284C7', bg: '#EBF5FF', icon: 'sparkle' },
        { id: 's3', subject: 'Chemistry', score: '81%', delta: '+7%', color: '#F59E0B', bg: '#FFF6E5', icon: 'sparkle' },
        { id: 's4', subject: 'English', score: '88%', delta: '+9%', color: '#E5484D', bg: '#FDEEEF', icon: 'book' },
      ],
      teacherMessage: {
        heading: "A message from Daniel's teacher",
        teacherName: 'Mr. David K.',
        teacherRole: 'O-Level Physics Teacher • Kampala High School',
        avatar: photos.learnerHome.david,
        duration: '0:00 / 0:24',
        quote: 'Daniel solved the quadratic kinematics challenge on the live board today. He is well on track for his UNEB mocks!"',
      },
      upcomingActivities: [
        {
          id: 'ua1',
          dow: 'Mon',
          date: '26 Oct',
          title: 'Quadratic Equations Live Lab',
          time: '4:00 PM – 5:00 PM',
          dotColor: '#1463F3',
          rightIcon: 'video',
          rightColor: '#1463F3',
          rightBg: '#EAF3FF',
          href: '/learn/live-room',
        },
        {
          id: 'ua2',
          dow: 'Wed',
          date: '28 Oct',
          title: 'Physics Practical Report',
          time: 'Due 5:00 PM',
          dotColor: '#16A34A',
          rightIcon: 'clipboard',
          rightColor: '#1463F3',
          rightBg: '#EAF3FF',
          href: '/learn/assignments',
        },
        {
          id: 'ua3',
          dow: 'Fri',
          date: '30 Oct',
          title: 'UNEB Past Paper Timed Mock',
          time: '2:00 PM – 3:30 PM',
          dotColor: '#7C3AED',
          rightIcon: 'check',
          rightColor: '#7C3AED',
          rightBg: '#F3EEFF',
          href: '/learn/paper',
        },
      ],
      recentWork: [
        { id: 'rw1', title: 'End of Topic Test – Fractions', subject: 'Mathematics', status: 'Graded', score: '92%', iconColor: '#16A34A', iconBg: '#EAFBF0', href: '/learn/assignments/a1/feedback' },
        { id: 'rw2', title: 'Kinematics Lab Sheet', subject: 'Physics', status: 'Graded', score: '88%', iconColor: '#1463F3', iconBg: '#EAF3FF', href: '/learn/assignments/a1/feedback' },
        { id: 'rw3', title: 'Organic Chemistry Quiz', subject: 'Chemistry', status: 'Submitted', score: '–', iconColor: '#F59E0B', iconBg: '#FFF6E5', href: '/learn/assignments' },
      ],
      achievements: [
        { id: 'ac1', title: 'Top 5% in O-Level\nMaths Cohort', sub: '25 Oct', icon: 'star', color: '#F59E0B', bg: '#FEF5E7' },
        { id: 'ac2', title: 'Solved live board\nchallenge', sub: '23 Oct', icon: 'people', color: '#7C3AED', bg: '#F3EEFF' },
        { id: 'ac3', title: 'Completed 4 UNEB\npast papers', sub: '21 Oct', icon: 'record', color: '#E5484D', bg: '#FEECEC' },
        { id: 'ac4', title: '12-day study streak\nKeep it up!', sub: '', icon: 'trophy', color: '#F59E0B', bg: '#FEF5E7' },
      ],
      homeTips: {
        subtitle: 'Simple ways to support Daniel at home.',
        items: [
          'Review one timed UNEB past paper section together each weekend.',
          'Check his 60-second Viva voice explanations on graded homework.',
          'Encourage a 10-minute break between evening revision blocks.',
        ],
      },
      continueReading: {
        title: 'Basic Algebra & Quadratics',
        meta: 'Mathematics • Chapter 5',
        progress: 0.82,
        percentLabel: '82%',
        thumb: photos.library['t-fractions'],
      },
      completedReading: [
        { id: 'cr1', title: 'Simple Machines & Forces', meta: 'Physics • Completed Oct 22, 2026', thumb: photos.library['c-simple-machines'] },
        { id: 'cr2', title: 'Our Environment', meta: 'Biology • Completed Oct 17, 2026', thumb: photos.library['t-our-environment'] },
      ],
    },
    {
      id: 'grace',
      tabName: 'Grace',
      tabGrade: 'Primary 6',
      firstName: 'Grace',
      fullName: 'Grace N.',
      grade: 'Primary 6',
      school: 'Greenhill Academy',
      gradeAndSchool: 'Primary 6 • Greenhill Academy',
      claimSource: 'QR Code Claim',
      claimToken: 'GHA-3104',
      admissionNo: 'GHA-2026-0891',
      avatar: photos.teacherHome.grace,
      heroPhoto: photos.teacherHost.grace,
      statusBadge: 'Active Learner',
      weekSummaryTitle: 'Wonderful creativity, Grace!',
      weekSummaryBody: 'Grace led her Science group project at Greenhill Academy this week and finished 2 digital library storybooks ahead of schedule.',
      overallCompletion: 94,
      achievementsCount: 5,
      weeklyDelta: '+9%',
      subjects: [
        { id: 's1', subject: 'Science', score: '95%', delta: '+11%', color: '#16A34A', bg: '#EAFBF0', icon: 'sparkle' },
        { id: 's2', subject: 'English', score: '92%', delta: '+9%', color: '#E5484D', bg: '#FDEEEF', icon: 'book' },
        { id: 's3', subject: 'Mathematics', score: '88%', delta: '+7%', color: '#1463F3', bg: '#EAF3FF', icon: 'grid' },
        { id: 's4', subject: 'Social Studies', score: '93%', delta: '+8%', color: '#7C3AED', bg: '#F3EEFF', icon: 'globe' },
      ],
      teacherMessage: {
        heading: "A message from Grace's teacher",
        teacherName: 'Ms. Grace A.',
        teacherRole: 'Science Teacher • Greenhill Academy',
        avatar: photos.learnerHome.grace,
        duration: '0:00 / 0:18',
        quote: 'Grace presented her Ecosystem model with great confidence today and helped her classmates understand food chains!"',
      },
      upcomingActivities: [
        {
          id: 'ua1',
          dow: 'Tue',
          date: '27 Oct',
          title: 'Science Ecosystem Showcase',
          time: '2:00 PM – 3:00 PM',
          dotColor: '#16A34A',
          rightIcon: 'video',
          rightColor: '#16A34A',
          rightBg: '#EAFBF0',
          href: '/learn/live-room',
        },
        {
          id: 'ua2',
          dow: 'Wed',
          date: '28 Oct',
          title: 'Creative Writing Story',
          time: 'End of day',
          dotColor: '#E5484D',
          rightIcon: 'clipboard',
          rightColor: '#E5484D',
          rightBg: '#FDEEEF',
          href: '/learn/assignments',
        },
        {
          id: 'ua3',
          dow: 'Fri',
          date: '30 Oct',
          title: 'PLE Top 100 Revision Quiz',
          time: '11:00 AM – 11:45 AM',
          dotColor: '#1463F3',
          rightIcon: 'check',
          rightColor: '#1463F3',
          rightBg: '#EAF3FF',
          href: '/learn/paper',
        },
      ],
      recentWork: [
        { id: 'rw1', title: 'Ecosystem Poster Project', subject: 'Science', status: 'Graded', score: '96%', iconColor: '#16A34A', iconBg: '#EAFBF0', href: '/learn/projects' },
        { id: 'rw2', title: 'Poetry & Rhymes Portfolio', subject: 'English', status: 'Graded', score: '91%', iconColor: '#E5484D', iconBg: '#FDEEEF', href: '/learn/assignments/a1/feedback' },
        { id: 'rw3', title: 'Maps of East Africa', subject: 'Social Studies', status: 'Graded', score: '93%', iconColor: '#7C3AED', iconBg: '#F3EEFF', href: '/learn/assignments/a1/feedback' },
      ],
      achievements: [
        { id: 'ac1', title: 'Science Fair\nTeam Leader', sub: '25 Oct', icon: 'star', color: '#F59E0B', bg: '#FEF5E7' },
        { id: 'ac2', title: 'Read 5 books\nthis month', sub: '23 Oct', icon: 'book', color: '#1463F3', bg: '#EAF3FF' },
        { id: 'ac3', title: '95% in Living Things\nAssessment', sub: '20 Oct', icon: 'record', color: '#16A34A', bg: '#EAFBF0' },
        { id: 'ac4', title: '10-day reading streak\nKeep it up!', sub: '', icon: 'trophy', color: '#F59E0B', bg: '#FEF5E7' },
      ],
      homeTips: {
        subtitle: 'Simple ways to support Grace at home.',
        items: [
          'Ask Grace to show you her Ecosystem poster in the Projects tab.',
          'Explore a new Science book together in the Digital Library.',
          'Celebrate her 95% Science mastery milestone this week!',
        ],
      },
      continueReading: {
        title: 'Maps of the World',
        meta: 'Social Studies • Chapter 4',
        progress: 0.76,
        percentLabel: '76%',
        thumb: photos.library['c-maps-world'],
      },
      completedReading: [
        { id: 'cr1', title: 'Children Story Collection', meta: 'English • Completed Oct 23, 2026', thumb: photos.library['c-child-story'] },
        { id: 'cr2', title: 'The Water Cycle', meta: 'Science • Completed Oct 18, 2026', thumb: photos.library['c-water-cycle'] },
      ],
    },
    {
      id: 'samuel',
      tabName: 'Samuel',
      tabGrade: 'S.2',
      firstName: 'Samuel',
      fullName: 'Samuel N.',
      grade: 'Senior 2',
      school: 'Mengo Senior School',
      gradeAndSchool: 'Senior 2 • Mengo Senior School',
      claimSource: 'Platform Login Claim',
      claimToken: 'MSS-7741',
      admissionNo: 'MSS-2026-0309',
      avatar: photos.teacherHost.peter,
      heroPhoto: photos.teacherHost.james,
      statusBadge: 'Active Learner',
      weekSummaryTitle: 'Steady progress, Samuel!',
      weekSummaryBody: 'Samuel submitted his Waste Management interdisciplinary project at Mengo Senior School and improved his ICT score by 12%.',
      overallCompletion: 84,
      achievementsCount: 3,
      weeklyDelta: '+11%',
      subjects: [
        { id: 's1', subject: 'ICT', score: '90%', delta: '+12%', color: '#0284C7', bg: '#EBF5FF', icon: 'screen' },
        { id: 's2', subject: 'Mathematics', score: '83%', delta: '+9%', color: '#1463F3', bg: '#EAF3FF', icon: 'grid' },
        { id: 's3', subject: 'Agriculture', score: '86%', delta: '+10%', color: '#16A34A', bg: '#EAFBF0', icon: 'sparkle' },
        { id: 's4', subject: 'English', score: '79%', delta: '+6%', color: '#E5484D', bg: '#FDEEEF', icon: 'book' },
      ],
      teacherMessage: {
        heading: "A message from Samuel's teacher",
        teacherName: 'Mr. Peter M.',
        teacherRole: 'ICT & Innovation Teacher • Mengo Senior School',
        avatar: photos.teacherHome.peter,
        duration: '0:00 / 0:22',
        quote: 'Samuel built an impressive spreadsheet model for his Waste Management project. Encourage him to polish his summary slides!"',
      },
      upcomingActivities: [
        {
          id: 'ua1',
          dow: 'Mon',
          date: '26 Oct',
          title: 'ICT Coding & Spreadsheets Lab',
          time: '3:30 PM – 4:30 PM',
          dotColor: '#0284C7',
          rightIcon: 'video',
          rightColor: '#0284C7',
          rightBg: '#EBF5FF',
          href: '/learn/live-room',
        },
        {
          id: 'ua2',
          dow: 'Thu',
          date: '29 Oct',
          title: 'Waste Management Project Pitch',
          time: '2:00 PM – 3:00 PM',
          dotColor: '#7C3AED',
          rightIcon: 'clipboard',
          rightColor: '#7C3AED',
          rightBg: '#F3EEFF',
          href: '/learn/projects',
        },
        {
          id: 'ua3',
          dow: 'Fri',
          date: '30 Oct',
          title: 'Agriculture Soil Types Test',
          time: '10:00 AM – 10:45 AM',
          dotColor: '#16A34A',
          rightIcon: 'check',
          rightColor: '#16A34A',
          rightBg: '#EAFBF0',
          href: '/learn/paper',
        },
      ],
      recentWork: [
        { id: 'rw1', title: 'Digital Safety & Spreadsheets', subject: 'ICT', status: 'Graded', score: '90%', iconColor: '#0284C7', iconBg: '#EBF5FF', href: '/learn/assignments/a1/feedback' },
        { id: 'rw2', title: 'Investigating Soil Types (AoI)', subject: 'Agriculture', status: 'Graded', score: '86%', iconColor: '#16A34A', iconBg: '#EAFBF0', href: '/learn/assignments/a1/feedback' },
        { id: 'rw3', title: 'Project: Waste Management', subject: 'Interdisciplinary', status: 'Submitted', score: '–', iconColor: '#7C3AED', iconBg: '#F3EEFF', href: '/learn/projects' },
      ],
      achievements: [
        { id: 'ac1', title: '90% in ICT\nPractical Lab', sub: '24 Oct', icon: 'star', color: '#0284C7', bg: '#EBF5FF' },
        { id: 'ac2', title: 'Submitted AoI\nProject on time', sub: '22 Oct', icon: 'people', color: '#7C3AED', bg: '#F3EEFF' },
        { id: 'ac3', title: 'Improved Maths\nscore by 9%', sub: '20 Oct', icon: 'record', color: '#16A34D', bg: '#EAFBF0' },
        { id: 'ac4', title: '6-day learning streak\nKeep it up!', sub: '', icon: 'trophy', color: '#F59E0B', bg: '#FEF5E7' },
      ],
      homeTips: {
        subtitle: 'Simple ways to support Samuel at home.',
        items: [
          'Ask Samuel to practice his 2-minute Waste Management presentation.',
          'Review his English comprehension vocabulary flashcards for 10 minutes.',
          'Check his upcoming Agriculture test schedule on Friday.',
        ],
      },
      continueReading: {
        title: 'Coding for Kids & Teens',
        meta: 'ICT • Module 2',
        progress: 0.74,
        percentLabel: '74%',
        thumb: photos.library['t-coding-kids'],
      },
      completedReading: [
        { id: 'cr1', title: 'Digital Safety Guide', meta: 'ICT • Completed Oct 21, 2026', thumb: photos.library['t-digital-safety'] },
        { id: 'cr2', title: 'Climate Change & Soil', meta: 'Agriculture • Completed Oct 14, 2026', thumb: photos.library['t-climate-change'] },
      ],
    },
  ] as ParentChildProfile[],
  /** Additional student profile from another Maple-powered school that can be claimed via QR code or Platform Login Claim. */
  claimableChild: {
    id: 'amina',
    tabName: 'Amina K.',
    tabGrade: 'S.1',
    firstName: 'Amina',
    fullName: 'Amina K.',
    grade: 'Senior 1',
    school: "St. Mary's College Kisubi",
    gradeAndSchool: "Senior 1 • St. Mary's College Kisubi",
    claimSource: 'QR Code Claim',
    claimToken: 'A7K9M3D2',
    admissionNo: 'SMACK-2026-1120',
    avatar: photos.teacherHost.amina,
    heroPhoto: photos.teacherHost.amina,
    statusBadge: 'Active Learner',
    weekSummaryTitle: 'Fantastic start, Amina!',
    weekSummaryBody: "Amina synced from St. Mary's College Kisubi with 92% overall mastery across her Senior 1 CBC subjects.",
    overallCompletion: 92,
    achievementsCount: 4,
    weeklyDelta: '+15%',
    subjects: [
      { id: 's1', subject: 'Mathematics', score: '92%', delta: '+15%', color: '#1463F3', bg: '#EAF3FF', icon: 'grid' },
      { id: 's2', subject: 'English', score: '89%', delta: '+10%', color: '#E5484D', bg: '#FDEEEF', icon: 'book' },
      { id: 's3', subject: 'Biology', score: '94%', delta: '+12%', color: '#16A34A', bg: '#EAFBF0', icon: 'sparkle' },
      { id: 's4', subject: 'Geography', score: '90%', delta: '+9%', color: '#7C3AED', bg: '#F3EEFF', icon: 'globe' },
    ],
    teacherMessage: {
      heading: "A message from Amina's teacher",
      teacherName: 'Mrs. Harriet A.',
      teacherRole: "Senior 1 Class Teacher • St. Mary's College Kisubi",
      avatar: photos.teacherHome.aisha,
      duration: '0:00 / 0:19',
      quote: 'Amina is a star in Biology and Mathematics. Her cross-school portfolio is now linked to your family dashboard!"',
    },
    upcomingActivities: [
      {
        id: 'ua1',
        dow: 'Tue',
        date: '27 Oct',
        title: 'S.1 Biology Cell Structure Lab',
        time: '2:00 PM – 3:00 PM',
        dotColor: '#16A34A',
        rightIcon: 'video',
        rightColor: '#16A34A',
        rightBg: '#EAFBF0',
        href: '/learn/live-room',
      },
      {
        id: 'ua2',
        dow: 'Thu',
        date: '29 Oct',
        title: 'Number Bases Problem Set',
        time: 'End of day',
        dotColor: '#1463F3',
        rightIcon: 'clipboard',
        rightColor: '#1463F3',
        rightBg: '#EAF3FF',
        href: '/learn/assignments',
      },
    ],
    recentWork: [
      { id: 'rw1', title: 'Cell Structure & Microscopy', subject: 'Biology', status: 'Graded', score: '95%', iconColor: '#16A34A', iconBg: '#EAFBF0', href: '/learn/assignments/a1/feedback' },
      { id: 'rw2', title: 'Number Bases Quiz', subject: 'Mathematics', status: 'Graded', score: '92%', iconColor: '#1463F3', iconBg: '#EAF3FF', href: '/learn/assignments/a1/feedback' },
    ],
    achievements: [
      { id: 'ac1', title: '95% in Biology\nLab Practical', sub: '25 Oct', icon: 'star', color: '#16A34A', bg: '#EAFBF0' },
      { id: 'ac2', title: 'Completed all\nMaths problem sets', sub: '23 Oct', icon: 'record', color: '#1463F3', bg: '#EAF3FF' },
      { id: 'ac3', title: 'Active participant\nin S.1 Debate', sub: '21 Oct', icon: 'people', color: '#7C3AED', bg: '#F3EEFF' },
      { id: 'ac4', title: '9-day learning streak\nKeep it up!', sub: '', icon: 'trophy', color: '#F59E0B', bg: '#FEF5E7' },
    ],
    homeTips: {
      subtitle: 'Simple ways to support Amina at home.',
      items: [
        "Check Amina's St. Mary's College Kisubi lab schedule every Tuesday.",
        'Review her Biology cell diagrams in the shared Digital Library.',
        'Encourage her to keep up her 9-day learning streak!',
      ],
    },
    continueReading: {
      title: 'Animal World & Cells',
      meta: 'Biology • Chapter 2',
      progress: 0.85,
      percentLabel: '85%',
      thumb: photos.library['t-animal-world'],
    },
    completedReading: [
      { id: 'cr1', title: 'Our Uganda in Pictures', meta: 'Geography • Completed Oct 22, 2026', thumb: photos.library['t-uganda-pictures'] },
    ],
  } as ParentChildProfile,
};

export const children = [
  { id: 'k1', name: 'Mary N.', school: 'Maple Online School', class: 'Primary 6', attendance: '19 of 20 days', average: 89 },
  { id: 'k2', name: 'Daniel O.', school: 'Kampala High School', class: 'O-Level (S.3)', attendance: '20 of 20 days', average: 91 },
  { id: 'k3', name: 'Grace N.', school: 'Greenhill Academy', class: 'Primary 6', attendance: '20 of 20 days', average: 94 },
  { id: 'k4', name: 'Samuel N.', school: 'Mengo Senior School', class: 'Senior 2', attendance: '18 of 20 days', average: 84 },
];

export const weekly = {
  child: 'Mary N.',
  week: 'Week of 20 – 26 Oct 2026',
  summary: 'Mary completed 8 out of 9 activities, showed good improvement in Mathematics, and participated actively in class.',
  voiceNote: {
    from: 'Ms. Sarah N.',
    seconds: 20,
    transcript: 'Mary has been very focused in class this week and is asking great questions. Keep encouraging her!',
  },
  tips: [
    'Practice 10 minutes of mental maths daily.',
    'Encourage reading for 15 minutes each evening.',
    'Ask Mary to explain what she learned in her own words.',
  ],
};

export const attendanceFeed = [
  { day: 'Fri 30 Oct', status: 'present', detail: 'Arrived 07:42' },
  { day: 'Thu 29 Oct', status: 'present', detail: 'Arrived 07:50' },
  { day: 'Wed 28 Oct', status: 'late', detail: 'Arrived 08:21 · bus delay' },
  { day: 'Tue 27 Oct', status: 'excused', detail: 'Sick · excused by you' },
  { day: 'Mon 26 Oct', status: 'present', detail: 'Arrived 07:38' },
];

export const approvals = [
  { id: 'ap1', child: 'Mary N.', item: 'Homework rescue: Mathematics (30 min)', teacher: 'Ms. Sarah N.', verified: true, rating: 4.9, priceUGX: 10000, requested: 'Today 17:05' },
  { id: 'ap2', child: 'Daniel O.', item: 'UCE Mathematics revision bootcamp', teacher: 'Mr. David K.', verified: true, rating: 4.9, priceUGX: 35000, requested: 'Yesterday' },
];

export const officeHours = [
  { teacher: 'Ms. Sarah N.', slot: 'Wed 4 Nov · 16:30', place: 'Video call' },
  { teacher: 'Mr. David K.', slot: 'Thu 5 Nov · 15:00', place: 'At school' },
];

export const settings = {
  digestPhone: '+256 772 *** 481',
  digestDay: 'Sunday 18:00',
  channels: [
    { label: 'WhatsApp weekly digest', on: true },
    { label: 'SMS when my child is absent', on: true },
    { label: 'Email report cards', on: false },
  ],
  privacy: [
    { label: 'Show my child on class leaderboards', on: false },
    { label: 'Let teachers share my child’s work in class', on: true },
  ],
};
