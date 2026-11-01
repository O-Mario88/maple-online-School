/** Sample data for the teacher home reference: Sarah N., Mon 26 Oct 2026, week 4 of term. */
import type { IconName } from '@/lib/icons';
import type { TeacherDest } from '@/lib/teacher-home';

import { photos } from './photos';

const p = photos.teacherHome;

export type Tone = 'red' | 'amber' | 'green' | 'blue' | 'purple';

export interface QueueItem {
  title: string;
  /** The phone reference's shorter title, when it uses one. */
  phoneTitle?: string;
  detail: string;
  phoneDetail: string;
  tag: string;
  tone: Tone;
  icon: IconName;
  color: string;
  go: TeacherDest;
}

export interface Flagged {
  name: string;
  course: string;
  score: number;
  reason: string;
  photo: number;
}

export interface Slot {
  time: string;
  title: string;
  kind: string;
  icon: IconName;
  color: string;
  live?: string;
  now?: boolean;
  go: TeacherDest;
}

export const teacherHome = {
  firstName: 'Sarah',
  date: new Date(2026, 9, 26),
  week: 4,
  weeks: 13,
  me: { name: 'Sarah N.', avatar: p.sarah, notifications: 5, mode: 'Teacher Mode' },
  nextClass: {
    subject: 'O-Level Mathematics',
    startsInMinutes: 25,
    time: '10:00 AM – 11:00 AM (1 hour)',
    enrolled: 24,
    topic: 'Quadratic Equations – Solving by Factorization',
    shortTopic: 'Quadratic Equations',
    thumb: p.live,
  },
  ungraded: { count: 12, overdue: 3 },
  struggling: 5,
  earnings: {
    week: 420_000,
    change: 12,
    month: 1_680_000,
    allTime: 4_950_000,
    days: [
      { day: 'Mon', amount: 150_000 },
      { day: 'Tue', amount: 120_000 },
      { day: 'Wed', amount: 180_000 },
      { day: 'Thu', amount: 220_000 },
      { day: 'Fri', amount: 190_000 },
      { day: 'Sat', amount: 0 },
      { day: 'Sun', amount: 0 },
    ],
  },
  queueTotal: 24,
  queue: [
    { title: 'Grade 8 submissions', detail: '12 submissions waiting', phoneDetail: '12 waiting (3 overdue)', tag: '3 overdue', tone: 'red', icon: 'notes', color: '#F08C00', go: '/teach/grading' },
    { title: 'Students needing support', detail: '5 students struggling', phoneDetail: '5 students', tag: 'High Priority', tone: 'red', icon: 'people', color: '#E5484D', go: 'analytics' },
    { title: 'Respond to student questions', phoneTitle: 'Respond to questions', detail: '8 new messages', phoneDetail: '8 new messages', tag: '8 new', tone: 'red', icon: 'chat', color: '#F08C00', go: '/messages' },
    { title: 'Prepare tomorrow’s lesson', detail: 'O-Level Science: Photosynthesis', phoneDetail: 'O-Level Science', tag: 'Due today', tone: 'red', icon: 'notes', color: '#12A58C', go: '/learn/live' },
  ] as QueueItem[],
  flagged: [
    { name: 'Emmanuel K.', course: 'O-Level Mathematics', score: 42, reason: 'Missed 3 assignments', photo: p.emmanuel },
    { name: 'Grace A.', course: 'O-Level Science', score: 48, reason: 'Low quiz scores', photo: p.grace },
    { name: 'Peter M.', course: 'O-Level English', score: 50, reason: 'Not attending live classes', photo: p.peter },
    { name: 'Aisha N.', course: 'O-Level Mathematics', score: 38, reason: 'Needs extra practice', photo: p.aisha },
    { name: 'Daniel O.', course: 'O-Level Science', score: 45, reason: 'Falling behind this week', photo: p.daniel },
  ] as Flagged[],
  schedule: [
    { time: '10:00 AM – 11:00 AM', title: 'O-Level Mathematics', kind: 'Live class', icon: 'video', color: '#1463F3', live: 'Live in 25 min', now: true, go: '/teach/host' },
    { time: '11:30 AM – 12:30 PM', title: 'Homework Help Session', kind: '1-on-1 Tutoring', icon: 'help', color: '#22A35A', go: '/teach/calendar' },
    { time: '2:00 PM – 3:00 PM', title: 'O-Level Science', kind: 'Live class', icon: 'notes', color: '#7C4DDB', live: 'Live Class', go: '/teach/calendar' },
    { time: '4:00 PM – 5:00 PM', title: 'Study Squad Support', kind: 'Group Session', icon: 'people', color: '#F08C00', go: '/teach/calendar' },
    { time: '6:00 PM – 6:30 PM', title: 'Parent Check-in', kind: 'Video Call', icon: 'phone', color: '#12A58C', go: '/teach/calendar' },
  ] as Slot[],
  quick: [
    { label: 'Create\nAssignment', icon: 'notes', color: '#7C4DDB', go: '/new-assignment' },
    { label: 'Send\nMessage', icon: 'chat', color: '#1463F3', go: '/messages/new' },
    { label: 'Open\nResources', icon: 'book', color: '#22A35A', go: '/learn/library' },
    { label: 'View\nAnalytics', icon: 'chart', color: '#F08C00', go: 'analytics' },
  ] as { label: string; icon: IconName; color: string; go: TeacherDest }[],
};

export type TeacherHome = typeof teacherHome;
