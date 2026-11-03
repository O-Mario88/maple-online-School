/** Sample data for Image 1: Student Dashboard (`/` in learner portal) — Daniel O., Senior 2, This Week: 20 – 26 Oct 2026. */
import type { Href } from 'expo-router';

import type { IconName } from '@/lib/icons';
import type { TaskKind } from '@/lib/learner-home';

import { photos } from './photos';

const h = (n: string): number => photos.learnerHome[n];

export interface StudentKpiItem {
  id: string;
  value: string;
  label: string;
  delta?: string;
  deltaSub?: string;
  icon: IconName;
  color: string;
  bg: string;
  href: Href;
}

export interface StudentSubjectCard {
  id: string;
  subject: string;
  score: string;
  delta: string;
  bg: string;
  iconBg: string;
  color: string;
  icon: IconName;
  href: Href;
}

export interface StudentLiveClassRow {
  id: string;
  badge?: string;
  liveSoon?: boolean;
  dayDow?: string;
  dayDate?: string;
  title: string;
  time: string;
  href: Href;
}

export type AssignmentProjectTab = 'All (7)' | 'Assignments (4)' | 'Projects (1)' | 'Tests (2)';

export interface StudentAssignmentProjectRow {
  id: string;
  title: string;
  sub: string;
  status: string;
  tone: 'danger' | 'good';
  tab: Exclude<AssignmentProjectTab, 'All (7)'>;
  icon: IconName;
  color: string;
  bg: string;
  href: Href;
}

export interface StudentRecentWorkRow {
  id: string;
  title: string;
  sub: string;
  status: 'Graded' | 'Submitted';
  score: string;
  icon: IconName;
  color: string;
  bg: string;
  href: Href;
}

export interface StudentJourneyStep {
  id: string;
  title: string;
  sub: string;
  state: 'done' | 'current' | 'todo';
  icon: IconName;
}

export const learnerHome = {
  name: 'Daniel O.',
  firstName: 'Daniel',
  grade: 'Senior 2',
  weekRange: '20 – 26 Oct 2026',
  avatar: photos.roles['daniel'],
  gift: h('gift'),
  kid: h('kid'),
  sidebarBooks: h('sdash-sidebar-books'),
  nav: [
    { label: 'Home', icon: 'home', href: '/' },
    { label: 'Explore / Learn', icon: 'search', href: '/learn/explore' },
    { label: 'My Courses', icon: 'book', href: '/learn/course' },
    { label: 'Classes', icon: 'book', href: '/learn/live' },
    { label: 'Assignments', icon: 'clipboard', href: '/learn/assignments' },
    { label: 'Tests & Quizzes', icon: 'check', href: '/learn/paper' },
    { label: 'Projects', icon: 'folder', href: '/learn/projects' },
    { label: 'Live Classes', icon: 'live', href: '/learn/live' },
    { label: 'Library', icon: 'library', href: '/learn/library' },
    { label: 'Progress', icon: 'chart', href: '/learn/progress' },
    { label: 'Results', icon: 'clipboard', href: '/learn/passport' },
    { label: 'Messages', icon: 'chat', href: '/inbox', badge: 3 },
    { label: 'Calendar', icon: 'calendar', href: '/learn/live' },
    { label: 'Resources', icon: 'book', href: '/learn/library' },
    { label: 'Profile', icon: 'person', href: '/learn/account' },
  ] as { label: string; icon: IconName; href: Href; badge?: number }[],
  hero: {
    image: h('hero'),
    studentPhoto: h('sdash-boy'),
    mountainPhoto: h('sdash-mountain'),
    title: 'Welcome back, Daniel!',
    sub: "Here's how your learning is going this week.",
    phoneSub: "Here's how your learning is going this week.",
    weekPill: 'This Week: 20 – 26 Oct 2026',
    quote: 'Small, consistent effort\nbuilds big progress.',
    level: 6,
    xp: 320,
    xpNext: 500,
    streak: 7,
    fire: h('fire'),
    crown: h('crownsmall'),
  },
  kpis: [
    {
      id: 'progress',
      value: '89%',
      label: 'Overall Progress',
      delta: '+12%',
      deltaSub: 'vs. last week',
      icon: 'record',
      color: '#E5484D',
      bg: '#FEECEC',
      href: '/learn/progress',
    },
    {
      id: 'achievements',
      value: '3',
      label: 'Achievements',
      icon: 'star',
      color: '#F59E0B',
      bg: '#FEF5E7',
      href: '/learn/passport',
    },
    {
      id: 'classes',
      value: '6',
      label: 'Active Classes',
      icon: 'grid',
      color: '#7C3AED',
      bg: '#F3EEFF',
      href: '/learn/live',
    },
    {
      id: 'assignments',
      value: '4',
      label: 'Assignments Due',
      icon: 'clipboard',
      color: '#7C3AED',
      bg: '#F3EEFF',
      href: '/learn/assignments',
    },
    {
      id: 'tests',
      value: '2',
      label: 'Tests This Week',
      icon: 'sparkle',
      color: '#F59E0B',
      bg: '#FEF5E7',
      href: '/learn/paper',
    },
    {
      id: 'projects',
      value: '1',
      label: 'Project in Progress',
      icon: 'folder',
      color: '#F59E0B',
      bg: '#FEF5E7',
      href: '/learn/projects',
    },
  ] as StudentKpiItem[],
  subjects: [
    {
      id: 'math',
      subject: 'Mathematics',
      score: '86%',
      delta: '+14%',
      bg: '#EAF3FF',
      iconBg: '#D4E6FF',
      color: '#1463F3',
      icon: 'grid',
      href: '/learn/course',
    },
    {
      id: 'eng',
      subject: 'English',
      score: '82%',
      delta: '+8%',
      bg: '#FDEEEF',
      iconBg: '#FAD8DC',
      color: '#E5484D',
      icon: 'book',
      href: '/learn/course',
    },
    {
      id: 'sci',
      subject: 'Science',
      score: '78%',
      delta: '+5%',
      bg: '#FFF6E5',
      iconBg: '#FCE6C2',
      color: '#D97706',
      icon: 'sparkle',
      href: '/learn/course',
    },
    {
      id: 'soc',
      subject: 'Social Studies',
      score: '91%',
      delta: '+10%',
      bg: '#F3EEFF',
      iconBg: '#E3D7FF',
      color: '#7C3AED',
      icon: 'globe',
      href: '/learn/course',
    },
    {
      id: 'ict',
      subject: 'ICT',
      score: '88%',
      delta: '+12%',
      bg: '#EBF5FF',
      iconBg: '#D4EAFF',
      color: '#0284C7',
      icon: 'screen',
      href: '/learn/course',
    },
    {
      id: 'agr',
      subject: 'Agriculture',
      score: '84%',
      delta: '+7%',
      bg: '#EAFBF0',
      iconBg: '#CDF5DB',
      color: '#16A34A',
      icon: 'sparkle',
      href: '/learn/course',
    },
  ] as StudentSubjectCard[],
  teacherMessage: {
    heading: "A message from Daniel's teacher",
    teacher: 'Ms. Sarah N. • Mathematics Teacher',
    avatar: photos.teacherHome.sarah,
    duration: '0:00 / 0:20',
    quote: 'Daniel has been very focused in class this week and is asking great questions. Keep encouraging him!',
  },
  upcomingLiveClasses: [
    {
      id: 'lc1',
      badge: 'Live in 2h',
      liveSoon: true,
      title: 'Mathematics Live Class',
      time: 'Today, 3:00 PM – 4:00 PM',
      href: '/learn/live-room',
    },
    {
      id: 'lc2',
      dayDow: 'Tue',
      dayDate: '27 Oct',
      title: 'Science Revision',
      time: '10:00 AM – 11:00 AM',
      href: '/learn/live',
    },
    {
      id: 'lc3',
      dayDow: 'Thu',
      dayDate: '29 Oct',
      title: 'English Reading Clinic',
      time: '3:30 PM – 4:30 PM',
      href: '/learn/live',
    },
  ] as StudentLiveClassRow[],
  assignmentsAndProjects: [
    {
      id: 'ap1',
      title: 'Algebra Worksheet',
      sub: 'Mathematics',
      status: 'Due Tomorrow',
      tone: 'danger',
      tab: 'Assignments (4)',
      icon: 'grid',
      color: '#1463F3',
      bg: '#EAF3FF',
      href: '/learn/assignments/a5',
    },
    {
      id: 'ap2',
      title: 'Essay: My Community',
      sub: 'English',
      status: 'Due: 27 Oct',
      tone: 'danger',
      tab: 'Assignments (4)',
      icon: 'book',
      color: '#E5484D',
      bg: '#FDEEEF',
      href: '/learn/assignments',
    },
    {
      id: 'ap3',
      title: 'Science Lab Report',
      sub: 'Science',
      status: 'Due: 29 Oct',
      tone: 'danger',
      tab: 'Tests (2)',
      icon: 'sparkle',
      color: '#D97706',
      bg: '#FFF6E5',
      href: '/learn/paper',
    },
    {
      id: 'ap4',
      title: 'Project: Waste Management',
      sub: 'Interdisciplinary Project',
      status: 'In Progress',
      tone: 'good',
      tab: 'Projects (1)',
      icon: 'people',
      color: '#7C3AED',
      bg: '#F3EEFF',
      href: '/learn/projects',
    },
  ] as StudentAssignmentProjectRow[],
  recentWork: [
    {
      id: 'rw1',
      title: 'End of Topic Test – Fractions',
      sub: 'Mathematics',
      status: 'Graded',
      score: '92%',
      icon: 'clipboard',
      color: '#1463F3',
      bg: '#EAF3FF',
      href: '/learn/assignments/a1/feedback',
    },
    {
      id: 'rw2',
      title: 'Reading Comprehension',
      sub: 'English',
      status: 'Graded',
      score: '85%',
      icon: 'book',
      color: '#E5484D',
      bg: '#FDEEEF',
      href: '/learn/assignments/a1/feedback',
    },
    {
      id: 'rw3',
      title: 'Investigating Soil Types (AoI)',
      sub: 'Science',
      status: 'Graded',
      score: '88%',
      icon: 'sparkle',
      color: '#D97706',
      bg: '#FFF6E5',
      href: '/learn/assignments/a1/feedback',
    },
    {
      id: 'rw4',
      title: 'Community Health Project',
      sub: 'Project Work',
      status: 'Submitted',
      score: '–',
      icon: 'people',
      color: '#7C3AED',
      bg: '#F3EEFF',
      href: '/learn/projects',
    },
  ] as StudentRecentWorkRow[],
  weekAchievements: [
    { id: 'wa1', text: 'Completed all Mathematics\nhomework', date: '24 Oct' },
    { id: 'wa2', text: 'Participated actively in\nScience class', date: '22 Oct' },
    { id: 'wa3', text: 'Improved test score by 15%', date: '21 Oct' },
  ],
  learningJourney: [
    { id: 'lj1', title: 'Enrolled', sub: '6 Classes', state: 'done', icon: 'check' },
    { id: 'lj2', title: 'Learning', sub: 'In Progress', state: 'done', icon: 'check' },
    { id: 'lj3', title: 'Assignments', sub: '4 Due', state: 'current', icon: 'clipboard' },
    { id: 'lj4', title: 'Projects', sub: '1 Active', state: 'todo', icon: 'folder' },
    { id: 'lj5', title: 'Tests', sub: '2 This Week', state: 'todo', icon: 'sparkle' },
    { id: 'lj6', title: 'Term Results', sub: 'Coming Soon', state: 'todo', icon: 'trophy' },
  ] as StudentJourneyStep[],
  recommendedItems: [
    {
      id: 'rc1',
      title: "Uganda's People",
      sub: 'Social Studies',
      subColor: '#4A5263',
      thumb: h('sdash-rec-1'),
      href: '/learn/library' as Href,
    },
    {
      id: 'rc2',
      title: 'Basic Algebra',
      sub: 'Mathematics',
      subColor: '#4A5263',
      thumb: h('sdash-rec-2'),
      href: '/learn/course' as Href,
    },
    {
      id: 'rc3',
      title: 'Our Environment',
      sub: 'Science',
      subColor: '#4A5263',
      thumb: h('sdash-rec-3'),
      href: '/learn/library' as Href,
    },
    {
      id: 'rc4',
      title: 'Life Skills for\nTeenagers',
      sub: 'Life Skills',
      subColor: '#16A34A',
      thumb: h('sdash-rec-4'),
      href: '/learn/library' as Href,
    },
  ],
  todoWeek: [
    { id: 'td1', text: 'Finish Algebra Worksheet', done: true, href: '/learn/assignments/a5' as Href },
    { id: 'td2', text: 'Revise for Science test', done: false, href: '/learn/paper' as Href },
    { id: 'td3', text: 'Work on Waste Management Project', done: false, href: '/learn/projects' as Href },
    { id: 'td4', text: 'Read Chapter 4 – Our Environment', done: false, href: '/learn/library' as Href },
    { id: 'td5', text: 'Join Mathematics Live Class (Today, 3:00 PM)', done: false, href: '/learn/live-room' as Href },
  ],
  continueReadingBook: {
    title: 'Our Environment',
    subject: 'Social Studies',
    progress: 0.68,
    percentLabel: '68%',
    thumb: h('sdash-cont-book'),
    href: '/learn/library' as Href,
  },
  completedReadingBook: {
    title: 'The Boy Who Harnessed\nthe Wind',
    subject: 'Life Skills',
    thumb: h('sdash-comp-book'),
    href: '/learn/library' as Href,
  },
  learningTips: [
    'Study in a quiet, well-lit space.',
    'Break big tasks into smaller steps.',
    'Revise what you learn each day.',
  ],
  // Legacy properties preserved for other learner pages/components:
  quick: [
    { label: 'Continue Learning', short: 'Learn', icon: h('qa-1'), href: '/learn/course' },
    { label: 'Do Assignment', short: 'Assignment', icon: h('qa-2'), href: '/learn/assignments/a5' },
    { label: 'Join Live Class', short: 'Live Class', icon: h('qa-3'), href: '/learn/live' },
    { label: 'Take a Test', short: 'Test', icon: h('qa-4'), href: '/learn/paper' },
    { label: 'Read a Book', short: 'Book', icon: h('qa-5'), href: '/learn/library' },
    { label: 'View Progress', short: 'Progress', icon: h('qa-6'), href: '/learn/progress' },
    { label: 'See Results', short: 'Results', icon: h('qa-7'), href: '/learn/passport' },
    { label: 'Explore Library', short: 'Library', icon: h('qa-8'), href: '/learn/library' },
    { label: 'Start Project', short: 'Project', icon: h('qa-9'), href: '/learn/projects' },
  ] as { label: string; short: string; icon: number; href: Href }[],
  learning: {
    'In Progress': [
      { subject: 'Mathematics', topic: 'Fractions and Decimals', progress: 0.6, thumb: h('course-1') },
      { subject: 'English', topic: 'Story Writing', progress: 0.4, thumb: h('course-2') },
      { subject: 'Science', topic: 'Living Things', progress: 0.75, thumb: h('course-3') },
      { subject: 'Social Studies', topic: 'Our Community', progress: 0.2, thumb: h('course-4') },
      { subject: 'Computer Skills', topic: 'Digital Creativity', progress: 0.5, thumb: h('course-5') },
    ],
    Completed: [
      { subject: 'Mathematics', topic: 'Place Value', progress: 1, thumb: h('course-1') },
      { subject: 'Science', topic: 'Plants and Seeds', progress: 1, thumb: h('course-3') },
    ],
    Recommended: [
      { subject: 'English', topic: 'Poems and Rhymes', progress: 0, thumb: h('course-2') },
      { subject: 'Computer Skills', topic: 'Safe Online', progress: 0, thumb: h('course-5') },
      { subject: 'Social Studies', topic: 'Maps and Places', progress: 0, thumb: h('course-4') },
    ],
  },
  liveClass: { subject: 'Mathematics', topic: 'Fractions and Decimals', when: 'Today, Oct 26', time: '09:00 – 10:00 AM', teacher: 'Mr. David', photo: h('david') },
  tutoring: { title: 'Personal Tutoring', topic: 'Mathematics Support', when: 'Today, Oct 26', time: '02:00 – 02:30 PM', teacher: 'Ms. Grace', photo: h('grace') },
  progress: [
    { subject: 'Mathematics', short: 'Math', value: 0.86, color: '#1463F3' },
    { subject: 'English', short: 'English', value: 0.82, color: '#E5484D' },
    { subject: 'Science', short: 'Science', value: 0.78, color: '#D97706' },
    { subject: 'Social Studies', short: 'Social', value: 0.91, color: '#7C3AED' },
  ],
  results: [
    { title: 'End of Topic Test – Fractions', date: 'Oct 20, 2026', percent: 92, icon: h('res-1') },
    { title: 'Reading Comprehension', date: 'Oct 18, 2026', percent: 85, icon: h('res-2') },
    { title: 'Investigating Soil Types (AoI)', date: 'Oct 15, 2026', percent: 88, icon: h('res-3') },
    { title: 'Social Studies Quiz', date: 'Oct 12, 2026', percent: 91, icon: h('res-4') },
  ],
  library: {
    'Continue Reading': [
      { title: 'Our Environment', meta: 'Last read: Oct 24', thumb: h('book-1') },
      { title: 'Amazing Inventors', meta: 'Last read: Oct 18', thumb: h('book-2') },
      { title: 'The Solar System', meta: 'Last read: Oct 15', thumb: h('book-3') },
    ],
    Completed: [{ title: 'The Boy Who Harnessed the Wind', meta: 'Finished Oct 15', thumb: h('book-3') }],
    Saved: [
      { title: 'Amazing Inventors', meta: 'Saved Oct 2', thumb: h('book-2') },
      { title: 'Wildlife Around Us', meta: 'Saved Sep 28', thumb: h('book-1') },
    ],
  },
  projects: [
    { title: 'Waste Management', subject: 'Interdisciplinary', due: 'In Progress', progress: 0.65, color: '#14B88A' },
    { title: 'My Community', subject: 'Social Studies', due: 'Due Nov 5', progress: 0.2, color: '#1463F3' },
    { title: 'Digital Story', subject: 'English', due: 'Due Nov 10', progress: 0, color: '#1463F3' },
  ],
  today: '2026-10-26',
  schedule: {
    '2026-10-26': [
      { time: '03:00 PM', title: 'Mathematics Live Class', short: 'Math Live Class', sub: 'Today, 3:00 PM – 4:00 PM', color: '#E5484D', join: true },
    ],
  } as Record<string, { time: string; title: string; short?: string; sub: string; color: string; join?: boolean; task?: boolean }[]>,
  tasks: [
    { id: 't1', title: 'Finish Algebra Worksheet', due: 'Due Tomorrow', urgent: true, done: true, kind: 'assignment' as TaskKind, href: '/learn/assignments/a5' as Href },
    { id: 't2', title: 'Revise for Science test', due: 'Due Oct 28', kind: 'test' as TaskKind, href: '/learn/paper' as Href },
    { id: 't3', title: 'Work on Waste Management Project', due: 'In Progress', kind: 'project' as TaskKind, href: '/learn/projects' as Href },
    { id: 't4', title: 'Read Chapter 4 – Our Environment', due: 'Due Oct 30', kind: 'reading' as TaskKind, href: '/learn/library' as Href },
    { id: 't5', title: 'Join Mathematics Live Class', due: 'Today, 3:00 PM', kind: 'assignment' as TaskKind, href: '/learn/live-room' as Href },
  ],
  goals: [
    { title: 'Improve my Math score to 90%', value: 0.86, label: '86%', icon: h('goal-1') },
    { title: 'Read 5 books this term', value: 0.6, label: '3 / 5', icon: h('goal-2') },
    { title: 'Complete my Science project', value: 0.5, label: '50%', icon: h('goal-3') },
  ],
  rewards: {
    points: 320,
    crown: h('crown'),
    levelBadge: h('levelbadge'),
    badges: [
      { title: 'Bookworm', icon: h('badge-1') },
      { title: 'Quiz Star', icon: h('badge-2') },
      { title: 'Helpful', icon: h('badge-3') },
      { title: '5 Day Streak', icon: h('badge-4') },
    ],
  },
};
