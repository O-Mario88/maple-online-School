/** Sample data for the learner home (sidebar design): Amina, Primary 6, on Mon 26 Oct 2026. */
import type { Href } from 'expo-router';

import type { IconName } from '@/lib/icons';
import type { TaskKind } from '@/lib/learner-home';

import { photos } from './photos';

const h = (n: string): number => photos.learnerHome[n];

export const learnerHome = {
  name: 'Amina',
  grade: 'Primary 6',
  avatar: h('avatar'),
  gift: h('gift'),
  kid: h('kid'),
  nav: [
    { label: 'Home', icon: 'home', href: '/' },
    { label: 'My Learning', icon: 'book', href: '/learn/explore' },
    { label: 'Assignments', icon: 'clipboard', href: '/learn/assignments' },
    { label: 'Tests & Quizzes', icon: 'check', href: '/learn/paper' },
    { label: 'Classes', icon: 'person', href: '/learn/live' },
    { label: 'Live Sessions', icon: 'live', href: '/learn/live-room' },
    { label: 'Projects', icon: 'folder', href: '/learn/projects' },
    { label: 'Library', icon: 'library', href: '/learn/library' },
    { label: 'Progress', icon: 'chart', href: '/learn/progress' },
    { label: 'Results', icon: 'clipboard', href: '/learn/passport' },
    { label: 'Goals', icon: 'clock', href: '/learn/progress' },
    { label: 'Messages', icon: 'mail', href: '/inbox' },
    { label: 'Rewards', icon: 'star', href: '/learn/passport' },
  ] as { label: string; icon: IconName; href: Href }[],
  hero: {
    image: h('hero'),
    sub: 'Ready to learn something amazing today?',
    phoneSub: 'Ready to learn today?',
    quote: '“You are capable\nof more than you know.”',
    level: 6,
    xp: 320,
    xpNext: 500,
    streak: 7,
    fire: h('fire'),
    crown: h('crownsmall'),
  },
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
    { subject: 'Mathematics', short: 'Math', value: 0.85, color: '#14A37F' },
    { subject: 'English', short: 'English', value: 0.7, color: '#7C5CF5' },
    { subject: 'Science', short: 'Science', value: 0.78, color: '#22A35A' },
    { subject: 'Social Studies', short: 'Social', value: 0.65, color: '#F0475B' },
  ],
  results: [
    { title: 'Math Quiz 5.2', date: 'Oct 20, 2026', percent: 92, icon: h('res-1') },
    { title: 'English Assignment', date: 'Oct 18, 2026', percent: 86, icon: h('res-2') },
    { title: 'Science Test – Living Things', date: 'Oct 15, 2026', percent: 78, icon: h('res-3') },
    { title: 'Social Studies Quiz', date: 'Oct 12, 2026', percent: 90, icon: h('res-4') },
  ],
  library: {
    'Continue Reading': [
      { title: 'Wildlife Around Us', meta: 'Last read: Oct 24', thumb: h('book-1') },
      { title: 'Amazing Inventors', meta: 'Last read: Oct 18', thumb: h('book-2') },
      { title: 'The Solar System', meta: 'Last read: Oct 15', thumb: h('book-3') },
    ],
    Completed: [{ title: 'The Solar System', meta: 'Finished Oct 15', thumb: h('book-3') }],
    Saved: [
      { title: 'Amazing Inventors', meta: 'Saved Oct 2', thumb: h('book-2') },
      { title: 'Wildlife Around Us', meta: 'Saved Sep 28', thumb: h('book-1') },
    ],
  },
  projects: [
    { title: 'Ecosystem Poster', subject: 'Science', due: 'Due Oct 30', progress: 0.5, color: '#14B88A' },
    { title: 'My Community', subject: 'Social Studies', due: 'Due Nov 5', progress: 0.2, color: '#1463F3' },
    { title: 'Digital Story', subject: 'English', due: 'Due Nov 10', progress: 0, color: '#1463F3' },
  ],
  today: '2026-10-26',
  schedule: {
    '2026-10-23': [
      { time: '10:00 AM', title: 'English – Live Class', sub: 'Story Writing', color: '#F28C28' },
      { time: '03:00 PM', title: 'Library Hour', sub: 'Reading Club', color: '#22A35A' },
    ],
    '2026-10-26': [
      { time: '09:00 AM', title: 'Mathematics – Live Class', short: 'Math – Live Class', sub: 'Fractions and Decimals', color: '#E5484D', join: true },
      { time: '11:00 AM', title: 'English Assignment', sub: 'Story Writing', color: '#F28C28', task: true },
      { time: '02:00 PM', title: 'Live Tutoring', sub: 'With Ms. Grace', color: '#7C3AED', join: true },
      { time: '04:00 PM', title: 'Science Project Work', short: 'Science Project', sub: 'Ecosystem Poster', color: '#22A35A' },
    ],
    '2026-10-27': [
      { time: '09:00 AM', title: 'Science – Live Class', sub: 'Living Things', color: '#22A35A', join: true },
      { time: '01:00 PM', title: 'Social Studies Quiz', sub: 'Our Community', color: '#E5484D' },
    ],
  } as Record<string, { time: string; title: string; short?: string; sub: string; color: string; join?: boolean; task?: boolean }[]>,
  tasks: [
    { id: 't1', title: 'Math Worksheet 5.3', due: 'Due Today, 11:59 PM', urgent: true, done: true, kind: 'assignment' as TaskKind, href: '/learn/assignments/a5' as Href },
    { id: 't2', title: 'English Story Draft', due: 'Due Tomorrow', kind: 'assignment' as TaskKind, href: '/learn/assignments' as Href },
    { id: 't3', title: 'Science Quiz', due: 'Due Oct 28', kind: 'test' as TaskKind, href: '/learn/paper' as Href },
    { id: 't4', title: 'Community Project Plan', due: 'Due Oct 30', kind: 'project' as TaskKind, href: '/learn/projects' as Href },
    { id: 't5', title: 'Read Chapter 4 – Wildlife', due: 'Due Oct 31', kind: 'reading' as TaskKind, href: '/learn/library' as Href },
  ],
  goals: [
    { title: 'Improve my Math score to 90%', value: 0.7, label: '70%', icon: h('goal-1') },
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
