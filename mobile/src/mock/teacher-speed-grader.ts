/** Sample data for Image 3: Rapid Speed-Grader (/(teacher)/grading/[assignmentId]). */
import { photos } from './photos';

export type SubmissionStatus = 'Needs Review' | 'AI Scored' | 'Graded';

export interface SpeedGraderSubmission {
  id: string;
  name: string;
  submittedAt: string;
  photo: number;
  score: number | null;
  maxScore: number;
  status: SubmissionStatus;
  filename: string;
}

export interface SpeedGraderCriterion {
  id: string;
  title: string;
  description: string;
  score: number;
  max: number;
  color: string;
}

export const speedGrader = {
  assignmentId: 'quadratic-problem-set-2',
  title: 'Quadratic Equations – Problem Set 2',
  dueLabel: 'Due: 31 Oct 2026, 11:59 PM',
  totalSubmissions: 28,
  toGradeCount: 14,
  gradedCount: 10,
  currentIndex: 14,
  submissions: [
    {
      id: 'sub-1',
      name: 'Amina K.',
      submittedAt: 'Submitted 28 Oct, 10:14 AM',
      photo: photos.teacherHome.aisha,
      score: null,
      maxScore: 100,
      status: 'Needs Review',
      filename: 'Amina_K_Answer.pdf',
    },
    {
      id: 'sub-2',
      name: 'Daniel O.',
      submittedAt: 'Submitted 28 Oct, 9:52 AM',
      photo: photos.teacherHome.daniel,
      score: 92,
      maxScore: 100,
      status: 'AI Scored',
      filename: 'Daniel_O_Answer.pdf',
    },
    {
      id: 'sub-3',
      name: 'Grace A.',
      submittedAt: 'Submitted 28 Oct, 11:20 AM',
      photo: photos.teacherHome.grace,
      score: null,
      maxScore: 100,
      status: 'Needs Review',
      filename: 'Grace_A_Answer.pdf',
    },
    {
      id: 'sub-4',
      name: 'James T.',
      submittedAt: 'Submitted 27 Oct, 4:15 PM',
      photo: photos.teacherHome.emmanuel,
      score: 88,
      maxScore: 100,
      status: 'AI Scored',
      filename: 'James_T_Answer.pdf',
    },
    {
      id: 'sub-5',
      name: 'Mary N.',
      submittedAt: 'Submitted 28 Oct, 8:03 AM',
      photo: photos.classTiles[4],
      score: null,
      maxScore: 100,
      status: 'Needs Review',
      filename: 'Mary_N_Answer.pdf',
    },
    {
      id: 'sub-6',
      name: 'Peter K.',
      submittedAt: 'Submitted 28 Oct, 10:48 AM',
      photo: photos.teacherHome.peter,
      score: 76,
      maxScore: 100,
      status: 'Graded',
      filename: 'Peter_K_Answer.pdf',
    },
    {
      id: 'sub-7',
      name: 'Sarah L.',
      submittedAt: 'Submitted 28 Oct, 9:44 AM',
      photo: photos.classTiles[2],
      score: null,
      maxScore: 100,
      status: 'Needs Review',
      filename: 'Sarah_L_Answer.pdf',
    },
    {
      id: 'sub-8',
      name: 'David M.',
      submittedAt: 'Submitted 27 Oct, 6:21 PM',
      photo: photos.classTiles[1],
      score: 81,
      maxScore: 100,
      status: 'Graded',
      filename: 'David_M_Answer.pdf',
    },
    {
      id: 'sub-9',
      name: 'Esther W.',
      submittedAt: 'Submitted 28 Oct, 9:10 AM',
      photo: photos.classFaces[2],
      score: null,
      maxScore: 100,
      status: 'Needs Review',
      filename: 'Esther_W_Answer.pdf',
    },
    {
      id: 'sub-10',
      name: 'Isaac R.',
      submittedAt: 'Submitted 28 Oct, 11:03 AM',
      photo: photos.classTiles[3],
      score: 84,
      maxScore: 100,
      status: 'AI Scored',
      filename: 'Isaac_R_Answer.pdf',
    },
  ] as SpeedGraderSubmission[],
  pageThumbs: [
    photos.feedback['thumb-1'],
    photos.feedback['thumb-2'],
    photos.feedback['thumb-3'],
  ],
  aiSuggestedScore: 78,
  gradeLabel: 'B (Good)',
  criteria: [
    {
      id: 'cr-1',
      title: 'Correctness',
      description: 'Accurate solutions final\nanswers.',
      score: 32,
      max: 40,
      color: '#16A34A',
    },
    {
      id: 'cr-2',
      title: 'Working and Method',
      description: 'Clear and logical working\nsteps.',
      score: 26,
      max: 30,
      color: '#16A34A',
    },
    {
      id: 'cr-3',
      title: 'Communication',
      description: 'Clear explanation and\nmathematical notation.',
      score: 14,
      max: 20,
      color: '#F59E0B',
    },
    {
      id: 'cr-4',
      title: 'Presentation',
      description: 'Neat, organized and easy\nto follow.',
      score: 6,
      max: 10,
      color: '#F59E0B',
    },
  ] as SpeedGraderCriterion[],
  quickComments: [
    'Great effort!',
    'Check this step',
    'Show more working',
    'Well done!',
    'Review the method',
    'Presentation can be neater',
  ],
  waveformHeights: [
    0.2, 0.35, 0.55, 0.8, 0.45, 0.95, 0.7, 0.4, 0.85, 1.0, 0.65, 0.9, 0.5, 0.75, 0.95, 0.6, 0.45,
    0.8, 0.5, 0.3, 0.2,
  ],
};

export type SpeedGrader = typeof speedGrader;

