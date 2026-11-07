/** Sample data for My Personalized Learning Plan: the goal, the journey, this week's focus, each subject, advice and what to watch next. Illustrative. */
import type { Href } from 'expo-router';

import type { IconName } from '@/lib/icons';

import { photos } from './photos';

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
    { title: 'Build Foundations', from: 1, to: 6 },
    { title: 'Strengthen Skills', from: 7, to: 12 },
    { title: 'Exam Practice', from: 13, to: 20 },
    { title: 'Final Revision', from: 21, to: 24 },
  ],
  focus: [
    { id: 'f1', text: 'Complete 3 lessons in Mathematics', done: true, href: '/learn/lessons?subject=Mathematics' as Href },
    { id: 'f2', text: 'Watch: Forces and Motion (Physics)', done: false, href: '/learn/lesson?id=vl-p1' as Href },
    { id: 'f3', text: 'Practice 10 past paper questions (Chemistry)', done: false, href: '/learn/past-papers' as Href },
    { id: 'f4', text: 'Submit assignment: Essay Writing (English)', done: false, href: '/learn/assignments' as Href },
  ],
  subjects: [
    { name: 'Mathematics', icon: 'sigma' as IconName, tint: '#1463F3', progress: 0.75, next: 'Quadratic equations' },
    { name: 'Physics', icon: 'atom' as IconName, tint: '#7C3AED', progress: 0.58, next: 'Motion and forces' },
    { name: 'Chemistry', icon: 'flask' as IconName, tint: '#0F9D58', progress: 0.7, next: 'Chemical bonding' },
    { name: 'Biology', icon: 'leaf' as IconName, tint: '#16A34A', progress: 0.88, next: 'Human physiology' },
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
  milestones: [
    { title: 'Finish Build Foundations', due: 'Week 6', done: true },
    { title: 'Score 70% in a Mathematics paper', due: 'Week 10', done: false },
    { title: 'Complete all Physics mechanics lessons', due: 'Week 12', done: false },
    { title: 'Sit three full mock papers', due: 'Week 20', done: false },
    { title: 'Final revision of every subject', due: 'Week 24', done: false },
  ],
  tips: [
    'Watch one Physics lesson a day this week: Forces and Motion is a good start.',
    'Try ten Chemistry past paper questions before Thursday’s session.',
    'Biology is strong: one review lesson a week is enough to keep it there.',
  ],
};
