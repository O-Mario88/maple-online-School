/** Sample data for My Personalized Learning Plan: the goal, the journey, this week's focus, each subject, advice and what to watch next. Illustrative. */
import type { Href } from 'expo-router';

import type { Session } from '@/features/learner/plan/schedule';
import type { IconName } from '@/lib/icons';

import { photos } from './photos';
import { Maple } from '@/constants/maple';

export const learnerPlan = {
  hero: photos.learnerHome['sdash-boy'],
  goal: 'Pass UNEB (UACE)',
  goals: ['Pass UNEB (UACE)', 'Pass UNEB (UCE)', 'Top grades in Sciences', 'University entry: Engineering'],
  level: 'Intermediate',
  target: 'Oct 2027',
  targets: ['Mar 2027', 'Jul 2027', 'Oct 2027', 'Nov 2027'],
  week: 7,
  weeks: 24,
  lengths: [12, 24, 36],
  style: 'Visual + Practice',
  styles: ['Visual + Practice', 'Reading + Practice', 'Listening + Practice', 'Practice first'],
  phases: [
    { title: 'Build Foundations', from: 1, to: 6, about: 'Get the core of every subject in place.' },
    { title: 'Improve Subject Mastery', from: 7, to: 12, about: 'Complete core topics and practice questions.' },
    { title: 'Mock Practice & Revision', from: 13, to: 20, about: 'Attempt full past papers and review.' },
    { title: 'Final Preparation', from: 21, to: 24, about: 'Revise all subjects, focus on weak areas and build exam confidence.' },
  ],
  /** What reaching the goal takes, in one line. */
  goalNote: 'Complete key topics, practice past papers, and achieve at least 70% overall.',
  focus: [
    { id: 'f1', text: 'Complete 3 lessons in Mathematics', done: true, href: '/learn/lessons?subject=Mathematics' as Href },
    { id: 'f2', text: 'Watch: Forces and Motion (Physics)', done: false, href: '/learn/lesson?id=vl-p1' as Href },
    { id: 'f3', text: 'Practice 10 past paper questions (Chemistry)', done: false, href: '/learn/past-papers' as Href },
    { id: 'f4', text: 'Submit assignment: Essay Writing (English)', done: false, href: '/learn/assignments' as Href },
  ],
  subjects: [
    { name: 'Mathematics', icon: 'sigma' as IconName, tint: Maple.blue, progress: 0.75, next: 'Quadratic equations' },
    { name: 'Physics', icon: 'atom' as IconName, tint: Maple.blue, progress: 0.58, next: 'Motion and forces' },
    { name: 'Chemistry', icon: 'flask' as IconName, tint: Maple.successText, progress: 0.7, next: 'Chemical bonding' },
    { name: 'Biology', icon: 'leaf' as IconName, tint: Maple.successText, progress: 0.88, next: 'Human physiology' },
    { name: 'English', icon: 'book' as IconName, tint: '#DB2777', progress: 0.62, next: 'Essay writing & comprehension' },
  ],
  advisor: {
    robot: photos.studio.robot,
    text: 'You’re doing well in Biology! To improve faster, spend more time on problem-solving in Physics and Chemistry.',
  },
  /** Video lessons picked for this learner (ids on the Video Lessons page). */
  recommended: ['vl-m4', 'vl-c1', 'vl-p1', 'vl-m6'],
  /** The study schedule: what each day of the week holds. */
  schedule: [
    { day: 'Mon', items: ['Mathematics · 45 min', 'Physics · 30 min'] },
    { day: 'Tue', items: ['Chemistry · 45 min', 'English reading · 20 min'] },
    { day: 'Wed', items: ['Live class: Mathematics · 4:00 PM', 'Biology · 30 min'] },
    { day: 'Thu', items: ['Physics · 45 min', 'Past paper: Chemistry · 30 min'] },
    { day: 'Fri', items: ['English essay · 40 min', 'Mathematics practice · 30 min'] },
    { day: 'Sat', items: ['Revision bootcamp · 2 h'] },
    { day: 'Sun', items: ['Rest, then plan next week · 15 min'] },
  ],
  /** The learner's goals on the way to the main goal. */
  milestones: [
    { id: 'g1', title: 'Finish Build Foundations', week: 6, done: true, progress: 1 },
    { id: 'g2', title: 'Score 70% in a Mathematics paper', week: 10, done: false, progress: 0.7 },
    { id: 'g3', title: 'Complete all Physics mechanics lessons', week: 12, done: false, progress: 0 },
    { id: 'g4', title: 'Sit three full mock papers', week: 20, done: false, progress: 0 },
    { id: 'g5', title: 'Final revision of every subject', week: 24, done: false, progress: 0 },
  ],
  /** This week's study sessions (the plan repeats weekly until it's adjusted). */
  sessions: [
    { day: 'Mon', start: '15:00', end: '15:45', subject: 'Mathematics', topic: 'Quadratic equations', kind: 'study' },
    { day: 'Mon', start: '15:45', end: '16:00', subject: '', topic: 'Rest, stretch or take a short walk', kind: 'break' },
    { day: 'Mon', start: '16:00', end: '16:30', subject: 'Physics', topic: 'Motion and forces', kind: 'study' },
    { day: 'Tue', start: '15:00', end: '15:45', subject: 'Chemistry', topic: 'Chemical bonding', kind: 'study' },
    { day: 'Tue', start: '16:30', end: '17:15', subject: 'Mathematics', topic: 'Quadratic equations', kind: 'study' },
    { day: 'Wed', start: '16:00', end: '17:00', subject: 'Mathematics', topic: 'Live class: Algebra', kind: 'study' },
    { day: 'Wed', start: '17:15', end: '17:45', subject: 'Biology', topic: 'Human physiology', kind: 'study' },
    { day: 'Thu', start: '15:00', end: '15:30', subject: 'Physics', topic: 'Forces review', kind: 'study' },
    { day: 'Thu', start: '15:45', end: '16:30', subject: 'Chemistry', topic: 'Past paper questions', kind: 'study' },
    { day: 'Fri', start: '15:00', end: '15:40', subject: 'English', topic: 'Essay writing', kind: 'study' },
    { day: 'Fri', start: '15:50', end: '16:20', subject: 'Biology', topic: 'Cells revision', kind: 'study' },
    { day: 'Sat', start: '09:00', end: '10:00', subject: 'Biology', topic: 'Revision bootcamp', kind: 'study' },
    { day: 'Sat', start: '10:15', end: '11:05', subject: 'English', topic: 'Comprehension practice', kind: 'study' },
  ] as Session[],
  /** What to do next, from the learner's progress. */
  tips: [
    {
      id: 't1',
      title: 'Watch one Physics lesson daily',
      sub: 'Focus on Forces and Motion to build a strong foundation.',
      subject: 'Physics',
      action: 'lesson',
      href: '/learn/lesson?id=vl-p1' as Href,
    },
    {
      id: 't2',
      title: 'Try ten Chemistry past paper questions',
      sub: 'Complete them before Thursday’s session.',
      subject: 'Chemistry',
      action: 'practice',
      href: '/learn/past-papers' as Href,
    },
    {
      id: 't3',
      title: 'Keep Biology on track',
      sub: 'You’re doing well — one review lesson a week is enough.',
      subject: 'Biology',
      action: 'review',
      href: '/learn/lessons?subject=Biology' as Href,
    },
  ] as readonly { id: string; title: string; sub: string; subject: string; action: 'lesson' | 'practice' | 'review'; href: Href }[],
  /** What each recommended video is for. */
  picks: { 'vl-p1': 'Lessons', 'vl-c1': 'Lessons', 'vl-m4': 'Practice', 'vl-m6': 'Revision' } as Readonly<
    Record<string, 'Lessons' | 'Practice' | 'Revision'>
  >,
  /** Subjects that can join the plan. */
  addable: ['ICT', 'Geography', 'History', 'Agriculture', 'Entrepreneurship'],
};
