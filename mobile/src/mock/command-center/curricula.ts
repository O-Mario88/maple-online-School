/** Maple Command › Global Curriculum & Living Past-Paper Master Taxonomies sample data. */
import type { Subject } from '@/features/command/logic/curricula';

import type { KpiData, Photo } from './shared';

export const stats: readonly KpiData[] = [
  { label: 'Curriculum Frameworks', value: '6', caption: 'UNEB, KCSE, WAEC, IGCSE, IB...', icon: 'layers', tone: 'blue' },
  { label: 'Subjects', value: '142', caption: 'Across all frameworks', icon: 'book', tone: 'green' },
  { label: 'Grade/Level Nodes', value: '1,620', caption: 'With learning objectives', icon: 'layers', tone: 'purple' },
  { label: 'Past Papers', value: '85,430', caption: 'Digitized & tagged', icon: 'doc', tone: 'orange' },
  { label: 'Schools Using Templates', value: '12,480', delta: '28% from last term', icon: 'people', tone: 'red' },
];

export interface Framework {
  id: string;
  short: string;
  name: string;
  board: string;
  crest: Photo;
  subjects: number;
  grades: number;
  gradeRange: string;
  schools: number;
  teachers: number;
  papers: number;
  paperYears: string;
  region: string;
  description: string;
  version: number;
  clones: number;
  active: boolean;
}

export const frameworks: readonly Framework[] = [
  { id: 'uneb', short: 'UNEB', name: 'UNEB – Uganda', board: 'Uganda National Examinations Board', crest: require('../images/crest-uneb.jpg') as Photo, subjects: 24, grades: 13, gradeRange: 'P1 – S6', schools: 12480, teachers: 18560, papers: 9832, paperYears: '1990 – 2024', region: 'East Africa', description: 'Official national curriculum used by primary and secondary schools in Uganda. Includes subject syllabi, learning objectives, assessment frameworks, and past papers.', version: 3, clones: 12480, active: true },
  { id: 'kcse', short: 'KCSE', name: 'KCSE – Kenya', board: 'Kenya Certificate of Secondary Education', crest: require('../images/crest-kcse.jpg') as Photo, subjects: 24, grades: 12, gradeRange: 'Grade 1 – Form 4', schools: 9120, teachers: 14210, papers: 8410, paperYears: '1989 – 2024', region: 'East Africa', description: 'The Kenyan 8-4-4 and CBC tracks with KNEC syllabi, competencies and past papers.', version: 2, clones: 9120, active: true },
  { id: 'waec', short: 'WAEC', name: 'WAEC – West Africa', board: 'West African Examinations Council', crest: require('../images/crest-waec.jpg') as Photo, subjects: 24, grades: 13, gradeRange: 'JSS1 – SS3', schools: 7340, teachers: 11020, papers: 12650, paperYears: '1988 – 2024', region: 'West Africa', description: 'WASSCE syllabi shared by Nigeria, Ghana, Sierra Leone, Liberia and The Gambia.', version: 4, clones: 7340, active: true },
  { id: 'igcse', short: 'IGCSE', name: 'IGCSE – Cambridge', board: 'Cambridge International General Certificate', crest: require('../images/crest-igcse.jpg') as Photo, subjects: 70, grades: 14, gradeRange: 'Stage 1 – A Level', schools: 2130, teachers: 4980, papers: 31200, paperYears: '1995 – 2024', region: 'International', description: 'Cambridge Primary, Lower Secondary, IGCSE and A Level, mapped to Maple lessons.', version: 5, clones: 2130, active: true },
  { id: 'ib', short: 'IB', name: 'IB – International Baccalaureate', board: 'International Baccalaureate (PYP, MYP, DP)', crest: require('../images/crest-ib.jpg') as Photo, subjects: 90, grades: 12, gradeRange: 'PYP – DP2', schools: 640, teachers: 2140, papers: 14380, paperYears: '2000 – 2024', region: 'International', description: 'PYP, MYP and Diploma Programme frameworks with approaches to learning.', version: 2, clones: 640, active: true },
  { id: 'cc', short: 'Common Core', name: 'Common Core – USA', board: 'Common Core State Standards', crest: require('../images/crest-common-core.jpg') as Photo, subjects: 60, grades: 12, gradeRange: 'K – Grade 12', schools: 410, teachers: 1320, papers: 8958, paperYears: '2010 – 2024', region: 'Americas', description: 'English Language Arts and Mathematics standards, K–12, with state variations.', version: 1, clones: 410, active: true },
];

export const regions = ['All Regions', 'East Africa', 'West Africa', 'International', 'Americas'];
export const statuses = ['Status', 'Active', 'Draft'];

const S = (name: string, category: string, levels: string, resources: number, papers: number): Subject => ({ name, category, levels, resources, papers, active: true });

export const unebSubjects: readonly Subject[] = [
  S('Mathematics', 'STEM', 'P1 – S6', 1240, 3520),
  S('English Language', 'Languages', 'P1 – S6', 980, 2850),
  S('Physics', 'STEM', 'S1 – S6', 640, 1920),
  S('Chemistry', 'STEM', 'S1 – S6', 610, 1865),
  S('Biology', 'STEM', 'S1 – S6', 590, 1780),
  S('Integrated Science', 'STEM', 'P1 – P7', 420, 980),
  S('Social Studies', 'Humanities', 'P1 – S6', 530, 1450),
  S('Christian Religious Education', 'Humanities', 'P1 – S6', 480, 1320),
  S('Islamic Religious Education', 'Humanities', 'P1 – S6', 460, 1280),
  S('Literature in English', 'Languages', 'S1 – S6', 310, 980),
  S('Geography', 'Humanities', 'S1 – S6', 420, 1210),
  S('History', 'Humanities', 'S1 – S6', 390, 1150),
  S('Agriculture', 'STEM', 'S1 – S6', 260, 640),
  S('Computer Studies', 'STEM', 'S1 – S6', 340, 520),
  S('Entrepreneurship', 'Business', 'S1 – S6', 210, 430),
  S('Kiswahili', 'Languages', 'P4 – S4', 180, 360),
  S('French', 'Languages', 'S1 – S4', 120, 240),
  S('Fine Art', 'Arts', 'P1 – S6', 150, 310),
  S('Music', 'Arts', 'P1 – S6', 110, 260),
  S('Physical Education', 'Health', 'P1 – S6', 90, 80),
  S('Luganda', 'Languages', 'P1 – S4', 130, 210),
  S('Economics', 'Business', 'S5 – S6', 160, 420),
  S('Technical Drawing', 'STEM', 'S1 – S4', 70, 190),
  S('Nutrition & Food Technology', 'STEM', 'S1 – S4', 80, 150),
];

export const tabs = ['Subjects', 'Grade Structure', 'Learning Objectives', 'Assessment Framework', 'Past Papers', 'Resources', 'Schools Using', 'Version History'];
export const levels = ['All Levels', 'Primary', 'Secondary'];
export const categories = ['All Categories', 'STEM', 'Languages', 'Humanities', 'Business', 'Arts', 'Health'];

/** The subject preview's extra detail; Mathematics from the reference, others described from their row. */
export const preview: Readonly<Record<string, { about: string; topics: readonly string[]; schools: number; teachers: number }>> = {
  Mathematics: {
    about: 'Develops logical thinking, problem solving, and quantitative skills through number operations, algebra, geometry, statistics and more.',
    topics: ['Linear Equations and Inequalities', 'Quadratic Functions', 'Trigonometry', 'Vectors and Matrices', 'Statistics and Probability'],
    schools: 12480,
    teachers: 18560,
  },
  Physics: {
    about: 'Mechanics, waves, electricity and modern physics, with practical work assessed in Paper 3.',
    topics: ['Measurement and Motion', 'Work, Energy and Power', 'Waves and Optics', 'Current Electricity', 'Atomic Physics'],
    schools: 9840,
    teachers: 6120,
  },
};

export const versions: readonly { v: string; date: string; by: string; note: string }[] = [
  { v: 'v3', date: 'Feb 2, 2026', by: 'Curriculum Team', note: 'NCDC lower-secondary competency update' },
  { v: 'v2', date: 'Jan 10, 2025', by: 'Curriculum Team', note: 'Added 2024 past papers and marking guides' },
  { v: 'v1', date: 'Aug 1, 2023', by: 'Curriculum Team', note: 'First published template' },
];
