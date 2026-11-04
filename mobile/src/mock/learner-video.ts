/** Sample data for the learner's Video Lessons page: lessons with what each chalkboard shows, who uploaded it and how it is used. Illustrative. */
import type { VideoLessonItem } from '@/features/learner/lessons/videoLessons';

import { photos } from './photos';

const m = (s: number) => s * 60;

const lessons: readonly VideoLessonItem[] = [
  { id: 'vl-m1', n: 1, title: 'Introduction to Quadratics', subject: 'Mathematics', level: 'UACE', topic: 'Quadratics', seconds: 842, watched: 842, added: '2026-09-02', lastWatched: '2026-09-20', mine: true, board: 'x² + 5x + 6', uploader: 'Mr. James Kato', views: 18_420, rating: 4.9, likes: 2_140, comments: 186 },
  { id: 'vl-m2', n: 2, title: 'Factorising Quadratic Expressions', subject: 'Mathematics', level: 'UACE', topic: 'Quadratics', seconds: 965, watched: 965, added: '2026-09-09', lastWatched: '2026-10-02', mine: true, board: '(x + 2)(x + 3)', uploader: 'Mr. James Kato', views: 14_970, rating: 4.8, likes: 1_820, comments: 132 },
  { id: 'vl-m3', n: 3, title: 'Quadratic Functions – Graphs and Properties', subject: 'Mathematics', level: 'UACE', topic: 'Quadratics', seconds: 1458, watched: 756, added: '2026-09-16', lastWatched: '2026-10-30', mine: true, board: 'y = x²', uploader: 'Mr. James Kato', views: 12_400, rating: 4.8, likes: 1_560, comments: 98 },
  { id: 'vl-m4', n: 4, title: 'Solving Quadratic Equations', subject: 'Mathematics', level: 'UACE', topic: 'Quadratics', seconds: 1120, watched: 0, added: '2026-09-23', mine: true, board: 'ax² + bx + c = 0', uploader: 'Mr. James Kato', views: 11_830, rating: 4.9, likes: 1_490, comments: 121 },
  { id: 'vl-m5', n: 5, title: 'The Pythagorean Theorem', subject: 'Mathematics', level: 'UACE', topic: 'Geometry', seconds: 1267, watched: 0, added: '2026-09-30', mine: true, board: 'a² + b² = c²', uploader: 'Ms. Esther Akello', views: 9_640, rating: 4.7, likes: 1_105, comments: 74 },
  { id: 'vl-m6', n: 6, title: 'Trigonometric Ratios (Introduction)', subject: 'Mathematics', level: 'UACE', topic: 'Trigonometry', seconds: 1233, watched: 0, added: '2026-10-07', mine: true, board: 'sin θ = opp / hyp', uploader: 'Mr. James Kato', views: 10_210, rating: 4.8, likes: 1_230, comments: 87 },
  { id: 'vl-m7', n: 7, title: 'Graphs of Trigonometric Functions', subject: 'Mathematics', level: 'UACE', topic: 'Trigonometry', seconds: 1571, watched: 0, added: '2026-10-14', mine: true, board: 'y = sin x', uploader: 'Mr. James Kato', views: 7_380, rating: 4.7, likes: 860, comments: 52 },
  { id: 'vl-m8', n: 8, title: 'Coordinate Geometry – The Straight Line', subject: 'Mathematics', level: 'UACE', topic: 'Geometry', seconds: 1165, watched: 0, added: '2026-10-21', mine: true, board: '(x₁, y₁)  (x₂, y₂)', uploader: 'Ms. Esther Akello', views: 6_920, rating: 4.6, likes: 740, comments: 41 },
  { id: 'vl-m9', n: 9, title: 'Geometry of Circles', subject: 'Mathematics', level: 'UACE', topic: 'Geometry', seconds: 1334, watched: 0, added: '2026-10-24', mine: true, board: 'A = πr²', uploader: 'Ms. Esther Akello', views: 5_870, rating: 4.7, likes: 690, comments: 36 },
  { id: 'vl-m10', n: 10, title: 'Mensuration – Surface Area and Volume', subject: 'Mathematics', level: 'UACE', topic: 'Mensuration', seconds: 1430, watched: 0, added: '2026-10-27', mine: true, board: 'V = l × w × h', uploader: 'Mr. James Kato', views: 4_960, rating: 4.6, likes: 580, comments: 29 },
  { id: 'vl-m11', n: 11, title: 'Applications of Quadratics', subject: 'Mathematics', level: 'UACE', topic: 'Quadratics', seconds: m(22), watched: 0, added: '2026-10-29', mine: true, board: 'h = −5t² + 20t', uploader: 'Mr. James Kato', views: 3_410, rating: 4.8, likes: 420, comments: 22 },
  { id: 'vl-m12', n: 12, title: 'Revision and Practice: Quadratics', subject: 'Mathematics', level: 'UACE', topic: 'Quadratics', seconds: m(18), watched: 0, added: '2026-10-30', mine: true, board: 'b² − 4ac', uploader: 'Mr. James Kato', views: 2_180, rating: 4.9, likes: 310, comments: 18 },
  { id: 'vl-p1', n: 1, title: 'Forces and Motion', subject: 'Physics', level: 'UACE', topic: 'Mechanics', seconds: m(21), watched: m(9), added: '2026-10-05', lastWatched: '2026-10-28', mine: true, board: 'F = ma', uploader: 'Mr. Isaac Mugisha', views: 9_120, rating: 4.7, likes: 980, comments: 64 },
  { id: 'vl-p2', n: 2, title: 'Work, Energy and Power', subject: 'Physics', level: 'UACE', topic: 'Mechanics', seconds: m(19), watched: 0, added: '2026-10-19', mine: true, board: 'W = F × d', uploader: 'Mr. Isaac Mugisha', views: 6_430, rating: 4.6, likes: 702, comments: 38 },
  { id: 'vl-c1', n: 1, title: 'Chemical Bonding (Made Simple)', subject: 'Chemistry', level: 'UACE', topic: 'Bonding', seconds: m(24), watched: 0, added: '2026-10-12', mine: true, board: 'Na⁺ + Cl⁻ → NaCl', uploader: 'Dr. Ruth Namusoke', views: 8_760, rating: 4.9, likes: 1_120, comments: 91 },
  { id: 'vl-c2', n: 2, title: 'The Mole and Molar Mass', subject: 'Chemistry', level: 'UACE', topic: 'Moles', seconds: m(17), watched: m(17), added: '2026-09-21', lastWatched: '2026-10-01', mine: true, board: 'n = m / M', uploader: 'Dr. Ruth Namusoke', views: 7_310, rating: 4.7, likes: 830, comments: 47 },
  { id: 'vl-b1', n: 1, title: 'Human Physiology: The Heart', subject: 'Biology', level: 'UACE', topic: 'Physiology', seconds: m(20), watched: m(20), added: '2026-09-28', lastWatched: '2026-10-15', mine: true, board: 'Heart → Lungs → Body', uploader: 'Ms. Grace Atim', views: 10_840, rating: 4.8, likes: 1_310, comments: 102 },
  { id: 'vl-e1', n: 1, title: 'Essay Writing: Planning an Argument', subject: 'English', level: 'UCE', topic: 'Writing', seconds: m(16), watched: 0, added: '2026-10-26', mine: false, board: 'Intro → Body → Conclusion', uploader: 'Ms. Aisha Bello', views: 5_230, rating: 4.8, likes: 610, comments: 44 },
];

export const videoHub = {
  hero: photos.liveHub.hero,
  lessons,
  subjects: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'],
  levels: [
    { value: 'UACE', label: 'UACE (A’Level)' },
    { value: 'UCE', label: 'UCE (O’Level)' },
  ],
  /** What the learner downloaded or saved to watch later, to start with. */
  downloaded: ['vl-m1', 'vl-m2'],
  later: ['vl-m6', 'vl-c1'],
};
