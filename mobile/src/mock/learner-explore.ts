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

const course = (c: Omit<ExploreCourse, 'href'>): ExploreCourse => ({ ...c, href: c.kind === 'Past Papers' ? '/learn/past-papers' : c.kind === 'Live Classes' ? '/learn/live' : c.kind === 'Practice' ? `/learn/paper?id=${c.id}` : `/learn/course?id=${c.id}` });

export const catalogue: readonly ExploreCourse[] = [
  course({ id: 'x1', title: 'Mathematics: Algebra & Functions', kind: 'Subjects', curriculum: 'UNEB', subject: 'Mathematics', level: 'S3', teacher: 'Mr. James Kato', rating: 4.8, learners: 12_400, progress: 0.42, lessons: 36, photo: photos.explore[0], face: photos.exploreTeachers[0], assignedBy: 'Mr. Daniel Ssempala', added: '2026-09-02' }),
  course({ id: 'x2', title: 'Biology: Genetics & Evolution', kind: 'Subjects', curriculum: 'UNEB', subject: 'Biology', level: 'S4', teacher: 'Dr. Grace Njeri', rating: 4.8, learners: 9_800, progress: 0.15, lessons: 28, photo: photos.explore[3], face: photos.exploreTeachers[3], assignedBy: 'Ms. Grace Atim', added: '2026-09-10' }),
  course({ id: 'x3', title: 'English: Composition & Comprehension', kind: 'Subjects', curriculum: 'UNEB', subject: 'English', level: 'S3', teacher: 'Ms. Aisha Bello', rating: 4.9, learners: 8_700, progress: 0, lessons: 24, photo: photos.explore[1], face: photos.exploreTeachers[1] }),
  course({ id: 'x4', title: 'Physics: Mechanics Made Simple', kind: 'Subjects', curriculum: 'UNEB', subject: 'Physics', level: 'S3', teacher: 'Mr. Peter Okiror', rating: 4.7, learners: 7_900, progress: 0, lessons: 30, photo: photos.explore[5], face: photos.exploreTeachers[5] }),
  course({ id: 'x5', title: 'UNEB Chemistry Past Papers (2015–2025)', kind: 'Past Papers', curriculum: 'UNEB', subject: 'Chemistry', level: 'S4', teacher: 'Maple Editorial Team', rating: 4.7, learners: 15_200, progress: 0, lessons: 22, photo: photos.explore[2], face: photos.exploreTeachers[2], added: '2026-10-27' }),
  course({ id: 'x6', title: 'Chemistry Revision Bootcamp', kind: 'Live Classes', curriculum: 'UNEB', subject: 'Chemistry', level: 'S4', teacher: 'Dr. Ruth Namusoke', rating: 4.8, learners: 4_100, progress: 0, lessons: 12, photo: photos.explore[4], face: photos.exploreTeachers[4] }),
  course({ id: 'x7', title: 'Mathematics Speed Practice (S3)', kind: 'Practice', curriculum: 'UNEB', subject: 'Mathematics', level: 'S3', teacher: 'Maple Practice', rating: 4.6, learners: 11_300, progress: 0, lessons: 400, photo: photos.explore[6], face: photos.exploreTeachers[6], assignedBy: 'Mr. Daniel Ssempala', added: '2026-10-29' }),
  course({ id: 'x13', title: 'Chemistry: Organic Chemistry Basics', kind: 'Subjects', curriculum: 'UNEB', subject: 'Chemistry', level: 'S4', teacher: 'Dr. Ruth Namusoke', rating: 4.9, learners: 7_400, progress: 0, lessons: 27, photo: photos.explore[4], face: photos.exploreTeachers[4], assignedBy: 'Ms. Grace Atim', added: '2026-10-30' }),
  course({ id: 'x14', title: 'UNEB Physics Past Papers (2015–2025)', kind: 'Past Papers', curriculum: 'UNEB', subject: 'Physics', level: 'S4', teacher: 'Maple Editorial Team', rating: 4.8, learners: 13_900, progress: 0, lessons: 22, photo: photos.explore[2], face: photos.exploreTeachers[2], added: '2026-10-28' }),
  course({ id: 'x15', title: 'Geography: Map Reading & Fieldwork', kind: 'Subjects', curriculum: 'UNEB', subject: 'Geography', level: 'S3', teacher: 'Ms. Esther Akello', rating: 4.7, learners: 6_800, progress: 0, lessons: 26, photo: photos.explore[7], face: photos.exploreTeachers[1], added: '2026-10-29' }),
  course({ id: 'x16', title: 'English Grammar Drills (S3)', kind: 'Practice', curriculum: 'UNEB', subject: 'English', level: 'S3', teacher: 'Maple Practice', rating: 4.7, learners: 9_100, progress: 0, lessons: 320, photo: photos.explore[6], face: photos.exploreTeachers[6], assignedBy: 'Ms. Grace Atim', added: '2026-10-12' }),
  course({ id: 'x17', title: 'Literature in English: Set Books', kind: 'Subjects', curriculum: 'UNEB', subject: 'English', level: 'S4', teacher: 'Ms. Aisha Bello', rating: 4.8, learners: 4_600, progress: 0, lessons: 20, photo: photos.explore[1], face: photos.exploreTeachers[1], added: '2026-10-30' }),
  course({ id: 'x18', title: 'Physics Practical Skills', kind: 'Live Classes', curriculum: 'UNEB', subject: 'Physics', level: 'S4', teacher: 'Mr. Isaac Mugisha', rating: 4.7, learners: 3_200, progress: 0, lessons: 10, photo: photos.explore[5], face: photos.exploreTeachers[5], assignedBy: 'Mr. Isaac Mugisha', added: '2026-10-26' }),
  course({ id: 'x19', title: 'UNEB Biology Past Papers (2015–2025)', kind: 'Past Papers', curriculum: 'UNEB', subject: 'Biology', level: 'S4', teacher: 'Maple Editorial Team', rating: 4.7, learners: 12_100, progress: 0, lessons: 22, photo: photos.explore[2], face: photos.exploreTeachers[2], assignedBy: 'Ms. Grace Atim', added: '2026-09-20' }),
  course({ id: 'x20', title: 'Mathematics: Vectors & Matrices', kind: 'Subjects', curriculum: 'UNEB', subject: 'Mathematics', level: 'S4', teacher: 'Mr. James Kato', rating: 4.9, learners: 8_300, progress: 0, lessons: 32, photo: photos.explore[0], face: photos.exploreTeachers[0], assignedBy: 'Mr. Daniel Ssempala', added: '2026-10-25' }),
  course({ id: 'x21', title: 'History: East Africa Since 1800', kind: 'Subjects', curriculum: 'UNEB', subject: 'History', level: 'S3', teacher: 'Mr. Joseph Mugisha', rating: 4.6, learners: 5_200, progress: 0, lessons: 24, photo: photos.explore[7], face: photos.exploreTeachers[7], added: '2026-08-30' }),
  course({ id: 'x22', title: 'ICT: Spreadsheets & Databases', kind: 'Subjects', curriculum: 'UNEB', subject: 'ICT', level: 'S3', teacher: 'Ms. Brenda Nansubuga', rating: 4.6, learners: 5_800, progress: 0, lessons: 22, photo: photos.explore[5], face: photos.exploreTeachers[3], added: '2026-10-29' }),
  course({ id: 'x23', title: 'Entrepreneurship Education', kind: 'Subjects', curriculum: 'UNEB', subject: 'Entrepreneurship', level: 'S3', teacher: 'Mr. Samuel Ochieng', rating: 4.5, learners: 3_900, progress: 0, lessons: 18, photo: photos.explore[4], face: photos.exploreTeachers[5], added: '2026-09-15' }),
  course({ id: 'x24', title: 'Biology Revision Live (S4)', kind: 'Live Classes', curriculum: 'UNEB', subject: 'Biology', level: 'S4', teacher: 'Ms. Grace Atim', rating: 4.8, learners: 2_800, progress: 0, lessons: 8, photo: photos.explore[3], face: photos.exploreTeachers[3], assignedBy: 'Ms. Grace Atim', added: '2026-10-27' }),
  course({ id: 'x8', title: 'KCSE Mathematics Complete', kind: 'Subjects', curriculum: 'KCSE', subject: 'Mathematics', level: 'Form 3', teacher: 'Mr. Brian Otieno', rating: 4.8, learners: 10_600, progress: 0, lessons: 40, photo: photos.explore[7], face: photos.exploreTeachers[7] }),
  course({ id: 'x9', title: 'WAEC Biology – Human Systems', kind: 'Subjects', curriculum: 'WAEC', subject: 'Biology', level: 'SS2', teacher: 'Dr. Grace Njeri', rating: 4.8, learners: 6_200, progress: 0, lessons: 32, photo: photos.explore[3], face: photos.exploreTeachers[3] }),
  course({ id: 'x10', title: 'IGCSE English Literature', kind: 'Subjects', curriculum: 'IGCSE', subject: 'English', level: 'Year 10', teacher: 'Ms. Aisha Bello', rating: 4.9, learners: 5_400, progress: 0, lessons: 26, photo: photos.explore[1], face: photos.exploreTeachers[1] }),
  course({ id: 'x11', title: 'IB Physics HL: Waves & Fields', kind: 'Subjects', curriculum: 'IB', subject: 'Physics', level: 'DP1', teacher: 'Dr. Michael Tan', rating: 4.7, learners: 2_900, progress: 0, lessons: 34, photo: photos.explore[5], face: photos.exploreTeachers[4] }),
  course({ id: 'x12', title: 'Common Core Algebra I', kind: 'Subjects', curriculum: 'Common Core', subject: 'Mathematics', level: 'Grade 9', teacher: 'Ms. Sarah Lee', rating: 4.6, learners: 3_300, progress: 0, lessons: 30, photo: photos.explore[0], face: photos.exploreTeachers[6] }),
];

export const curricula: readonly Curriculum[] = ['UNEB', 'KCSE', 'WAEC', 'IGCSE', 'IB', 'Common Core'];
export const myCurriculum: Curriculum = 'UNEB';
/** Weakest subjects first, from the progress map. */
export const weakest: readonly string[] = ['English', 'Physics', 'Chemistry'];

export const categories: readonly { kind: Kind; icon: IconName; tone: 'blue' | 'purple' | 'red' | 'orange' | 'green' | 'grey'; note: string; href: Href }[] = [
  { kind: 'Subjects', icon: 'book', tone: 'blue', note: 'Full subjects by top teachers', href: '/learn/explore' },
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
