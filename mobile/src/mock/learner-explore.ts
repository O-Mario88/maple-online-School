/** The learner's Explore & Learn page sample data. Illustrative. */
import type { Href } from 'expo-router';

import type { Curriculum, Goal, Kind, Offering, Session } from '@/features/learner/explore/explore';
import type { IconName } from '@/lib/icons';

import { photos } from './photos';

export const NOW = '2026-10-31T10:30';

export interface ExploreCourse extends Offering {
  teacher: string;
  photo: number;
  face: number;
  lessons: number;
  href: Href;
}

const course = (c: Omit<ExploreCourse, 'href'>): ExploreCourse => ({ ...c, href: c.kind === 'Past Papers' ? '/learn/past-papers' : c.kind === 'Live Classes' ? '/learn/live' : c.kind === 'Practice' ? '/learn/paper' : '/learn/course' });

export const catalogue: readonly ExploreCourse[] = [
  course({ id: 'x1', title: 'Mathematics: Algebra & Functions', kind: 'Courses', curriculum: 'UNEB', subject: 'Mathematics', level: 'S3', teacher: 'Mr. James Kato', rating: 4.8, learners: 12_400, priceUGX: 120_000, progress: 0.42, lessons: 36, photo: photos.explore[0], face: photos.exploreTeachers[0] }),
  course({ id: 'x2', title: 'Biology: Genetics & Evolution', kind: 'Courses', curriculum: 'UNEB', subject: 'Biology', level: 'S4', teacher: 'Dr. Grace Njeri', rating: 4.8, learners: 9_800, priceUGX: 90_000, progress: 0.15, lessons: 28, photo: photos.explore[3], face: photos.exploreTeachers[3] }),
  course({ id: 'x3', title: 'English: Composition & Comprehension', kind: 'Courses', curriculum: 'UNEB', subject: 'English', level: 'S3', teacher: 'Ms. Aisha Bello', rating: 4.9, learners: 8_700, priceUGX: 60_000, progress: 0, lessons: 24, photo: photos.explore[1], face: photos.exploreTeachers[1] }),
  course({ id: 'x4', title: 'Physics: Mechanics Made Simple', kind: 'Courses', curriculum: 'UNEB', subject: 'Physics', level: 'S3', teacher: 'Mr. Peter Okiror', rating: 4.7, learners: 7_900, priceUGX: 80_000, progress: 0, lessons: 30, photo: photos.explore[5], face: photos.exploreTeachers[5] }),
  course({ id: 'x5', title: 'UNEB Chemistry Past Papers (2015–2025)', kind: 'Past Papers', curriculum: 'UNEB', subject: 'Chemistry', level: 'S4', teacher: 'Maple Editorial Team', rating: 4.7, learners: 15_200, priceUGX: 30_000, progress: 0, lessons: 22, photo: photos.explore[2], face: photos.exploreTeachers[2] }),
  course({ id: 'x6', title: 'Chemistry Revision Bootcamp', kind: 'Live Classes', curriculum: 'UNEB', subject: 'Chemistry', level: 'S4', teacher: 'Dr. Ruth Namusoke', rating: 4.8, learners: 4_100, priceUGX: 70_000, progress: 0, lessons: 12, photo: photos.explore[4], face: photos.exploreTeachers[4] }),
  course({ id: 'x7', title: 'Mathematics Speed Practice (S3)', kind: 'Practice', curriculum: 'UNEB', subject: 'Mathematics', level: 'S3', teacher: 'Maple Practice', rating: 4.6, learners: 11_300, priceUGX: 0, progress: 0, lessons: 400, photo: photos.explore[6], face: photos.exploreTeachers[6] }),
  course({ id: 'x8', title: 'KCSE Mathematics Complete', kind: 'Courses', curriculum: 'KCSE', subject: 'Mathematics', level: 'Form 3', teacher: 'Mr. Brian Otieno', rating: 4.8, learners: 10_600, priceUGX: 110_000, progress: 0, lessons: 40, photo: photos.explore[7], face: photos.exploreTeachers[7] }),
  course({ id: 'x9', title: 'WAEC Biology – Human Systems', kind: 'Courses', curriculum: 'WAEC', subject: 'Biology', level: 'SS2', teacher: 'Dr. Grace Njeri', rating: 4.8, learners: 6_200, priceUGX: 90_000, progress: 0, lessons: 32, photo: photos.explore[3], face: photos.exploreTeachers[3] }),
  course({ id: 'x10', title: 'IGCSE English Literature', kind: 'Courses', curriculum: 'IGCSE', subject: 'English', level: 'Year 10', teacher: 'Ms. Aisha Bello', rating: 4.9, learners: 5_400, priceUGX: 95_000, progress: 0, lessons: 26, photo: photos.explore[1], face: photos.exploreTeachers[1] }),
  course({ id: 'x11', title: 'IB Physics HL: Waves & Fields', kind: 'Courses', curriculum: 'IB', subject: 'Physics', level: 'DP1', teacher: 'Dr. Michael Tan', rating: 4.7, learners: 2_900, priceUGX: 150_000, progress: 0, lessons: 34, photo: photos.explore[5], face: photos.exploreTeachers[4] }),
  course({ id: 'x12', title: 'Common Core Algebra I', kind: 'Courses', curriculum: 'Common Core', subject: 'Mathematics', level: 'Grade 9', teacher: 'Ms. Sarah Lee', rating: 4.6, learners: 3_300, priceUGX: 85_000, progress: 0, lessons: 30, photo: photos.explore[0], face: photos.exploreTeachers[6] }),
];

export const curricula: readonly Curriculum[] = ['UNEB', 'KCSE', 'WAEC', 'IGCSE', 'IB', 'Common Core'];
export const myCurriculum: Curriculum = 'UNEB';
/** Weakest subjects first, from the progress map. */
export const weakest: readonly string[] = ['English', 'Physics', 'Chemistry'];

export const categories: readonly { kind: Kind; icon: IconName; tone: 'blue' | 'purple' | 'red' | 'orange' | 'green' | 'grey'; note: string; href: Href }[] = [
  { kind: 'Courses', icon: 'book', tone: 'blue', note: 'Full courses by top teachers', href: '/learn/explore' },
  { kind: 'Past Papers', icon: 'clipboard', tone: 'purple', note: 'Real exams with marking', href: '/learn/past-papers' },
  { kind: 'Live Classes', icon: 'live', tone: 'red', note: 'Join teachers live', href: '/learn/live' },
  { kind: 'Shorts', icon: 'play', tone: 'orange', note: 'Learn in 60 seconds', href: '/learn/shorts' },
  { kind: 'Practice', icon: 'timer', tone: 'green', note: 'Quizzes and drills', href: '/learn/paper' },
  { kind: 'Library', icon: 'library', tone: 'grey', note: 'Books and notes', href: '/learn/library' },
];

export const subjects: readonly { name: string; icon: IconName; tone: 'blue' | 'purple' | 'red' | 'orange' | 'green' | 'grey' }[] = [
  { name: 'Mathematics', icon: 'chart', tone: 'blue' },
  { name: 'English', icon: 'book', tone: 'purple' },
  { name: 'Biology', icon: 'sparkle', tone: 'green' },
  { name: 'Chemistry', icon: 'layers', tone: 'orange' },
  { name: 'Physics', icon: 'live', tone: 'red' },
  { name: 'History', icon: 'clock', tone: 'grey' },
];

export const goals: readonly Goal[] = [
  { id: 'g1', label: 'Watch 1 lesson', done: true },
  { id: 'g2', label: 'Practise 10 questions', done: true },
  { id: 'g3', label: 'Join a live class', done: false },
];

export interface LiveSession extends Session {
  teacher: string;
  subject: string;
  photo: number;
  attendees: number;
}

export const sessions: readonly LiveSession[] = [
  { id: 'l1', title: 'Quadratic Equations Live Revision', subject: 'Mathematics', teacher: 'Mr. James Kato', start: '2026-10-31T10:00', minutes: 60, photo: photos.homeLive[0], attendees: 248 },
  { id: 'l2', title: 'Genetics: Monohybrid Crosses', subject: 'Biology', teacher: 'Dr. Grace Njeri', start: '2026-10-31T14:00', minutes: 45, photo: photos.homeLive[1], attendees: 0 },
  { id: 'l3', title: 'Essay Writing Clinic', subject: 'English', teacher: 'Ms. Aisha Bello', start: '2026-10-31T16:30', minutes: 60, photo: photos.homeLive[2], attendees: 0 },
  { id: 'l4', title: 'The Mole and Calculations', subject: 'Chemistry', teacher: 'Dr. Ruth Namusoke', start: '2026-11-01T09:00', minutes: 60, photo: photos.homeLive[3], attendees: 0 },
  { id: 'l5', title: 'Motion Graphs', subject: 'Physics', teacher: 'Mr. Peter Okiror', start: '2026-10-31T08:00', minutes: 60, photo: photos.homeLive[4], attendees: 0 },
];
