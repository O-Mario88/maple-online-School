/** Sample data for the learner's live classes hub: the week of Mon 19 – Sun 25 Oct 2026, seen at 9:20 AM on Wed 21. */
import type { SessionKind } from '@/lib/live-hub';

import { photos } from './photos';

const lh = (n: string): number => photos.liveHub[n];

export type IconKey = 'math' | 'english' | 'science' | 'qa' | 'ict' | 'paper';

export interface HubSession {
  id: string;
  day: string;
  start: string;
  end: string;
  kind: SessionKind;
  title: string;
  /** The phone's shorter title. */
  short: string;
  teacher: string;
  context: string;
  icon: IconKey;
  attended?: boolean;
  recording?: boolean;
}

const s = (id: string, day: string, start: string, end: string, kind: SessionKind, title: string, short: string, teacher: string, icon: IconKey, extra: Partial<HubSession> = {}): HubSession => ({
  id,
  day,
  start,
  end,
  kind,
  title,
  short,
  teacher,
  context: kind === 'school' ? 'School Class' : kind === 'bootcamp' ? 'Enrolled Bootcamp' : 'Live Session',
  icon,
  ...extra,
});

const sessions: HubSession[] = [
  s('mon-camp', '2026-10-19', '16:00', '17:00', 'bootcamp', 'UCE Mathematics Exam Prep: Session 8', 'Maths Exam Prep', 'Ms. Achieng', 'math', { attended: true, recording: true }),
  s('tue-eng', '2026-10-20', '10:00', '10:45', 'school', 'English - Poetry and Imagery', 'English - Poetry', 'Mr. Okello', 'english', { attended: false, recording: true }),
  s('tue-math', '2026-10-20', '14:00', '14:45', 'school', 'Mathematics - Ratios and Rates', 'Mathematics - Ratios', 'Ms. Achieng', 'math', { attended: true, recording: true }),
  s('wed-math', '2026-10-21', '09:00', '09:45', 'school', 'Mathematics - Fractions and Decimals', 'Mathematics - Fractions', 'Ms. Achieng', 'math'),
  s('wed-eng', '2026-10-21', '11:00', '11:45', 'school', 'English - Reading Comprehension', 'English - Reading', 'Mr. Okello', 'english'),
  s('wed-sci', '2026-10-21', '14:00', '15:00', 'bootcamp', 'Science Bootcamp: Exam Techniques', 'Science Bootcamp', 'Ms. Nambasa', 'science'),
  s('wed-qa', '2026-10-21', '16:00', '16:30', 'tutor', 'Q&A Session: Ask a Teacher', 'Q&A: Ask a Teacher', 'Multiple Teachers', 'qa'),
  s('thu-math', '2026-10-22', '09:00', '09:45', 'school', 'Mathematics - Percentages', 'Mathematics - Percentages', 'Ms. Achieng', 'math'),
  s('thu-sci', '2026-10-22', '11:00', '11:45', 'school', 'Biology - Cells and Tissues', 'Biology - Cells', 'Ms. Nambasa', 'science'),
  s('fri-eng', '2026-10-23', '10:00', '10:45', 'school', 'English - Sentence Structure', 'English - Grammar', 'Mr. Okello', 'english'),
  s('sat-camp', '2026-10-24', '10:00', '12:00', 'bootcamp', 'UCE Mathematics Exam Prep: Session 9', 'Maths Exam Prep', 'Ms. Achieng', 'math'),
  s('sun-camp', '2026-10-25', '15:00', '16:00', 'bootcamp', 'UCE Mathematics Exam Prep: Revision Clinic', 'Maths Revision Clinic', 'Ms. Achieng', 'math'),
];

/** Sessions on offer this week that are not in the learner's calendar until they add them. */
const thisWeek: HubSession[] = [
  s('thu-ict', '2026-10-22', '16:00', '17:00', 'school', 'ICT: Spreadsheets Basics', 'ICT: Spreadsheets', 'Mr. Okello', 'ict'),
  s('fri-paper', '2026-10-23', '15:00', '16:00', 'tutor', 'Past Paper Walkthrough', 'Past Paper Walkthrough', 'Ms. Achieng', 'paper'),
];

export const liveHub = {
  now: { day: '2026-10-21', time: '09:20' },
  title: 'Live Classes & Tutoring',
  sub: 'Join live classes, expert bootcamps, or get instant help from verified tutors.',
  phoneSub: 'Join live classes or get instant 1-on-1 help.',
  hero: lh('hero'),
  nowIcon: lh('now'),
  icons: { math: lh('icon-math'), english: lh('icon-english'), science: lh('icon-science'), qa: lh('icon-qa'), ict: lh('week-1'), paper: lh('week-2') } as Record<IconKey, number>,
  sessions,
  thisWeek,
  liveClasses: [
    { id: 'lc-math', subject: 'Mathematics', title: 'Fractions in Real Life', day: '2026-10-21', start: '09:00', end: '09:45', teacher: 'Ms. Achieng', face: lh('face-1'), thumb: lh('class-1'), domain: 'skills' as const },
    { id: 'lc-eng', subject: 'English', title: 'Reading Strategies', day: '2026-10-21', start: '11:00', end: '11:45', teacher: 'Mr. Okello', face: lh('face-2'), thumb: lh('class-2'), domain: 'skills' as const },
    { id: 'lc-sci', subject: 'Science', title: 'The Human Body', day: '2026-10-21', start: '15:00', end: '16:00', teacher: 'Ms. Nambasa', face: lh('face-3'), thumb: lh('class-3'), domain: 'knowledge' as const },
    { id: 'lc-tips', subject: 'Exam Tips', title: 'Time Management', day: '2026-10-22', start: '10:00', end: '10:45', teacher: 'Mr. Tumusiime', face: lh('face-4'), thumb: lh('class-4'), domain: 'values' as const },
  ],
  tutors: [
    { id: 't-achieng', name: 'Ms. Achieng', subject: 'Mathematics', short: 'Math', rating: 4.9, reviews: 320, levels: 'Primary – O-Level', priceUGX: 8000, photo: lh('tutor-1'), icon: 'math' as IconKey },
    { id: 't-okello', name: 'Mr. Okello', subject: 'Science', short: 'Science', rating: 4.8, reviews: 274, levels: 'Primary – A-Level', priceUGX: 8000, photo: lh('tutor-2'), icon: 'science' as IconKey },
    { id: 't-nambasa', name: 'Ms. Nambasa', subject: 'English', short: 'English', rating: 4.9, reviews: 198, levels: 'Primary – O-Level', priceUGX: 8000, photo: lh('tutor-3'), icon: 'english' as IconKey },
    { id: 't-mugisha', name: 'Mr. Mugisha', subject: 'ICT', short: 'ICT', rating: 4.7, reviews: 156, levels: 'O-Level – A-Level', priceUGX: 10000, photo: lh('tutor-4'), icon: 'ict' as IconKey },
  ],
  sessionMinutes: 15,
  walletUGX: 42000,
  bootcamps: [
    { id: 'b-maths', title: 'UCE Mathematics Exam Prep', status: 'Ongoing', done: 8, total: 12, icon: lh('camp-1'), slug: 'p7-maths-revision-bootcamp' },
    { id: 'b-science', title: 'Science Practical Skills Bootcamp', starts: 'Starts 2 Nov 2026', meta: '12 sessions • With certificates', icon: lh('camp-2'), slug: 'p7-maths-revision-bootcamp' },
  ],
};
