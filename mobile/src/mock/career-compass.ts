/**
 * Sample data for Career Compass and the university and program directory. The institutions are
 * fictional; labour-market notes are illustrative and say so. Real entries will cite their source
 * and date, and every program carries its own accreditation check. Illustrative.
 */
import type { CareerFacts } from '@/features/learner/careers/careers';
import type { IconName } from '@/lib/icons';

import { photos } from './photos';
import { Maple } from '@/constants/maple';

export type CareerArea = 'health' | 'science' | 'engineering' | 'business' | 'education' | 'environment';

/** Career areas for browsing, in the references' order. */
export const CAREER_AREAS: readonly { id: CareerArea; label: string; icon: IconName }[] = [
  { id: 'health', label: 'Health & Life Sciences', icon: 'pulse' },
  { id: 'science', label: 'Science & Technology', icon: 'cpu' },
  { id: 'engineering', label: 'Engineering & Building', icon: 'building' },
  { id: 'business', label: 'Business & Finance', icon: 'chart' },
  { id: 'education', label: 'Education & Training', icon: 'book' },
  { id: 'environment', label: 'Environment & Agriculture', icon: 'leaf' },
];

export interface Career extends CareerFacts {
  field: string;
  area: CareerArea;
  photo: number;
  icon: IconName;
  overview: string;
  responsibilities: readonly string[];
  /** A-Level subjects most programs for this career ask for. */
  essentials: readonly string[];
  oLevel: string;
  pathways: readonly { level: 'Degree' | 'Diploma' | 'Certificate' | 'Vocational'; title: string; years: string }[];
  progression: readonly string[];
  related: readonly string[];
  programIds: readonly string[];
  market: { note: string; source: string; date: string };
  advice: { by: string; text: string };
}

const cc = photos.careerCompass;
const SAMPLE_MARKET = { source: 'Sample data (illustrative)', date: 'Nov 2026' };

const careers: readonly Career[] = [
  {
    id: 'nurse',
    title: 'Nurse',
    field: 'Health',
    area: 'health',
    photo: cc.careers['nurse'],
    icon: 'pulse',
    overview: 'Nurses care for patients, give treatments, and support families in hospitals, clinics and communities.',
    responsibilities: ['Assess and monitor patients', 'Give medicines and treatments safely', 'Teach patients and families about health'],
    interests: ['working with people', 'science'],
    strengths: ['Biology', 'Chemistry'],
    environments: ['hospital', 'community'],
    essentials: ['Biology', 'Chemistry'],
    oLevel: 'Do well in Biology, Chemistry and English at UCE.',
    pathways: [
      { level: 'Certificate', title: 'Certificate in Nursing', years: '2.5 years' },
      { level: 'Diploma', title: 'Diploma in Nursing', years: '3 years' },
      { level: 'Degree', title: 'Bachelor of Nursing Science', years: '4 years' },
    ],
    progression: ['Enrolled nurse', 'Registered nurse', 'Nurse specialist', 'Nurse manager'],
    related: ['Midwife', 'Clinical officer', 'Public health officer'],
    programIds: ['klu-bns', 'mih-dn'],
    market: { note: 'Nurses are needed in hospitals and community health services across the country.', ...SAMPLE_MARKET },
    advice: { by: 'A registered nurse (sample)', text: 'Volunteer at a health centre in your holidays to see if the work suits you.' },
  },
  {
    id: 'doctor',
    title: 'Medical Doctor',
    field: 'Health',
    area: 'health',
    photo: cc.careers['doctor'],
    icon: 'heart',
    overview: 'Doctors diagnose and treat illness, and many go on to specialise in areas like surgery or children’s health.',
    responsibilities: ['Examine and diagnose patients', 'Plan and give treatment', 'Lead health teams'],
    interests: ['science', 'working with people', 'reading and research'],
    strengths: ['Biology', 'Chemistry', 'Physics'],
    environments: ['hospital', 'lab'],
    essentials: ['Biology', 'Chemistry'],
    oLevel: 'Strong Biology, Chemistry, Physics and Mathematics at UCE.',
    pathways: [{ level: 'Degree', title: 'Bachelor of Medicine and Bachelor of Surgery (MBChB)', years: '5 years + internship' }],
    progression: ['Intern doctor', 'Medical officer', 'Specialist (after a master’s)', 'Consultant'],
    related: ['Pharmacist', 'Clinical officer', 'Dentist'],
    programIds: ['klu-mbchb'],
    market: { note: 'Medicine is competitive to enter and takes many years of study.', ...SAMPLE_MARKET },
    advice: { by: 'A medical officer (sample)', text: 'Keep a plan B in health sciences; many great careers start the same way.' },
  },
  {
    id: 'pharmacist',
    title: 'Pharmacist',
    field: 'Health',
    area: 'health',
    photo: cc.careers['pharmacist'],
    icon: 'flask',
    overview: 'Pharmacists prepare and supply medicines and advise patients and doctors on using them safely.',
    responsibilities: ['Check and dispense prescriptions', 'Advise on safe medicine use', 'Manage medicine stock'],
    interests: ['science', 'reading and research'],
    strengths: ['Chemistry', 'Biology'],
    environments: ['hospital', 'lab'],
    essentials: ['Chemistry', 'Biology'],
    oLevel: 'Strong Chemistry and Biology at UCE.',
    pathways: [{ level: 'Degree', title: 'Bachelor of Pharmacy', years: '4 years' }],
    progression: ['Intern pharmacist', 'Pharmacist', 'Senior or hospital pharmacist'],
    related: ['Laboratory scientist', 'Medical doctor'],
    programIds: ['klu-bpharm'],
    market: { note: 'Pharmacists work in hospitals, community pharmacies and the medicines industry.', ...SAMPLE_MARKET },
    advice: { by: 'A community pharmacist (sample)', text: 'Chemistry matters most: practise calculations every week.' },
  },
  {
    id: 'civil-engineer',
    title: 'Civil Engineer',
    field: 'Engineering',
    area: 'engineering',
    photo: cc.careers['civil-engineer'],
    icon: 'building',
    overview: 'Civil engineers design and build roads, bridges, buildings and water systems.',
    responsibilities: ['Design structures and plans', 'Manage building sites', 'Check safety and quality'],
    interests: ['design and building', 'technology'],
    strengths: ['Mathematics', 'Physics'],
    environments: ['field', 'office'],
    essentials: ['Mathematics', 'Physics'],
    oLevel: 'Strong Mathematics and Physics at UCE.',
    pathways: [
      { level: 'Diploma', title: 'Diploma in Civil Engineering', years: '3 years' },
      { level: 'Degree', title: 'Bachelor of Science in Civil Engineering', years: '4 years' },
    ],
    progression: ['Graduate engineer', 'Site engineer', 'Registered engineer', 'Project manager'],
    related: ['Surveyor', 'Architect', 'Water engineer'],
    programIds: ['nti-dce', 'klu-bsce'],
    market: { note: 'Roads, housing and water projects need engineers and technicians.', ...SAMPLE_MARKET },
    advice: { by: 'A site engineer (sample)', text: 'A diploma first is a real route into engineering, not a lesser one.' },
  },
  {
    id: 'developer',
    title: 'Software Developer',
    field: 'ICT',
    area: 'science',
    photo: cc.careers['developer'],
    icon: 'code',
    overview: 'Developers build the apps, websites and systems people use every day.',
    responsibilities: ['Write and test code', 'Fix problems in software', 'Work with designers and users'],
    interests: ['technology', 'design and building'],
    strengths: ['Mathematics'],
    environments: ['office'],
    essentials: ['Mathematics'],
    oLevel: 'Mathematics and Computer Studies help.',
    pathways: [
      { level: 'Certificate', title: 'Certificate in Software Development', years: '1 year' },
      { level: 'Diploma', title: 'Diploma in Computer Science', years: '2 years' },
      { level: 'Degree', title: 'Bachelor of Science in Computer Science', years: '3 years' },
    ],
    progression: ['Junior developer', 'Developer', 'Senior developer', 'Tech lead'],
    related: ['Data analyst', 'Network engineer', 'UX designer'],
    programIds: ['nti-dcs', 'klu-bscs'],
    market: { note: 'Many developers also work remotely or freelance; a portfolio matters as much as a certificate.', ...SAMPLE_MARKET },
    advice: { by: 'A software developer (sample)', text: 'Start building small projects now; free coding lessons are a good first step.' },
  },
  {
    id: 'teacher',
    title: 'Teacher',
    field: 'Education',
    area: 'education',
    photo: cc.careers['teacher'],
    icon: 'cap',
    overview: 'Teachers plan lessons, teach classes and help learners grow, in schools or online.',
    responsibilities: ['Plan and teach lessons', 'Assess and give feedback', 'Support each learner'],
    interests: ['working with people', 'reading and research'],
    strengths: ['English'],
    environments: ['classroom'],
    essentials: [],
    oLevel: 'Do well in the subjects you’d like to teach.',
    pathways: [
      { level: 'Diploma', title: 'Diploma in Secondary Education', years: '2 years' },
      { level: 'Degree', title: 'Bachelor of Education', years: '3 years' },
    ],
    progression: ['Teacher', 'Head of department', 'Deputy head', 'Head teacher'],
    related: ['Career counselor', 'Education officer', 'Online tutor'],
    programIds: ['vce-bed'],
    market: { note: 'Teachers of science and mathematics are often in demand.', ...SAMPLE_MARKET },
    advice: { by: 'A secondary teacher (sample)', text: 'Help classmates revise; explaining things is the heart of the job.' },
  },
  {
    id: 'agronomist',
    title: 'Agronomist',
    field: 'Agriculture',
    area: 'environment',
    photo: cc.careers['agronomist'],
    icon: 'leaf',
    overview: 'Agronomists help farmers grow more and better crops while caring for the soil and environment.',
    responsibilities: ['Advise farmers on crops and soil', 'Run field trials', 'Help prevent crop disease'],
    interests: ['the environment', 'science'],
    strengths: ['Biology', 'Agriculture'],
    environments: ['outdoors', 'field'],
    essentials: ['Biology'],
    oLevel: 'Biology and Agriculture at UCE.',
    pathways: [
      { level: 'Diploma', title: 'Diploma in Agriculture', years: '2 years' },
      { level: 'Degree', title: 'Bachelor of Science in Agriculture', years: '4 years' },
    ],
    progression: ['Extension officer', 'Agronomist', 'Farm manager', 'Researcher'],
    related: ['Veterinary officer', 'Food scientist', 'Environmental officer'],
    programIds: ['eac-bsag'],
    market: { note: 'Agriculture is a large part of the economy, with roles in farming, research and business.', ...SAMPLE_MARKET },
    advice: { by: 'An extension officer (sample)', text: 'Visit farms near you and ask what problems they face.' },
  },
  {
    id: 'accountant',
    title: 'Accountant',
    field: 'Business',
    area: 'business',
    photo: cc.careers['accountant'],
    icon: 'calculator',
    overview: 'Accountants keep and check financial records and help organisations plan their money.',
    responsibilities: ['Prepare financial statements', 'Check records and taxes', 'Advise on budgets'],
    interests: ['business'],
    strengths: ['Mathematics', 'Economics'],
    environments: ['office'],
    essentials: ['Mathematics'],
    oLevel: 'Mathematics and Commerce or Entrepreneurship help.',
    pathways: [
      { level: 'Diploma', title: 'Diploma in Accounting', years: '2 years' },
      { level: 'Degree', title: 'Bachelor of Commerce (Accounting)', years: '3 years' },
    ],
    progression: ['Accounts assistant', 'Accountant', 'Certified accountant', 'Finance manager'],
    related: ['Auditor', 'Banker', 'Tax officer'],
    programIds: ['klu-bcom'],
    market: { note: 'Professional certification after a degree or diploma opens most senior roles.', ...SAMPLE_MARKET },
    advice: { by: 'A certified accountant (sample)', text: 'Keep a small budget of your own money; it’s good practice.' },
  },
  {
    id: 'lab-scientist',
    title: 'Laboratory Scientist',
    field: 'Health',
    area: 'health',
    photo: cc.careers['lab-scientist'],
    icon: 'flask',
    overview: 'Laboratory scientists run medical and scientific tests that help diagnose, monitor and prevent disease.',
    responsibilities: ['Test blood, tissue and other samples', 'Keep equipment and results accurate', 'Report findings to doctors and health teams'],
    interests: ['science', 'reading and research', 'technology'],
    strengths: ['Biology', 'Chemistry'],
    environments: ['lab', 'hospital'],
    essentials: ['Biology', 'Chemistry'],
    oLevel: 'Biology, Chemistry and Mathematics at UCE keep this open.',
    pathways: [
      { level: 'Diploma', title: 'Diploma in Medical Laboratory Science', years: '3 years' },
      { level: 'Degree', title: 'Bachelor of Biomedical Laboratory Technology', years: '3–4 years' },
    ],
    progression: ['Laboratory technician', 'Laboratory scientist', 'Senior scientist', 'Laboratory manager'],
    related: ['Microbiologist', 'Public health officer', 'Research assistant'],
    programIds: ['mih-dmls'],
    market: { note: 'Hospital, research and public health laboratories all employ laboratory staff.', ...SAMPLE_MARKET },
    advice: { by: 'A laboratory scientist (sample)', text: 'Care about accuracy: one careful result can change a patient’s treatment.' },
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    field: 'ICT',
    area: 'science',
    photo: cc.careers['data-scientist'],
    icon: 'chart',
    overview: 'Data scientists turn data into answers that help organisations, health services and governments make better decisions.',
    responsibilities: ['Collect and clean data', 'Find patterns with statistics and code', 'Explain findings clearly to others'],
    interests: ['technology', 'reading and research', 'business'],
    strengths: ['Mathematics', 'Economics'],
    environments: ['office'],
    essentials: ['Mathematics'],
    oLevel: 'Mathematics and Computer Studies help a lot.',
    pathways: [
      { level: 'Diploma', title: 'Diploma in Computer Science', years: '2 years' },
      { level: 'Degree', title: 'Bachelor of Science in Computer Science or Statistics', years: '3 years' },
    ],
    progression: ['Data analyst', 'Data scientist', 'Senior data scientist', 'Head of data'],
    related: ['Statistician', 'Software developer', 'Economist'],
    programIds: ['klu-bscs', 'nti-dcs'],
    market: { note: 'Banks, telecoms, health programs and start-ups increasingly hire people who can work with data.', ...SAMPLE_MARKET },
    advice: { by: 'A data analyst (sample)', text: 'Start with spreadsheets: sort and chart something you care about.' },
  },
];

export interface University {
  id: string;
  name: string;
  type: 'University' | 'College' | 'Technical Institute' | 'Vocational Provider';
  ownership: 'Public' | 'Private';
  students: number;
  faculties: number;
  town: string;
  photo: number;
  crest: number;
  about: string;
  campuses: readonly string[];
  facilities: readonly string[];
  /** The institution's recognition check (separate from each program's accreditation). */
  verification: { status: 'verified' | 'pending'; source: string; on: string };
}

const sn = photos.schoolNetwork;
const dir = photos.directory;
const universities: readonly University[] = [
  { id: 'kampala-lakes-university', name: 'Kampala Lakes University', type: 'University', ownership: 'Private', students: 18400, faculties: 7, town: 'Kampala', photo: sn.campus.lakeview, crest: sn.crest.lakeview, about: 'A public-private university with faculties of health sciences, engineering, computing and business.', campuses: ['Main campus, Kampala', 'Health sciences campus, Mulago'], facilities: ['Teaching hospital links', 'Engineering labs', 'Library', 'Hostels'], verification: { status: 'verified', source: 'NCHE recognised institutions directory', on: '2026-06-10' } },
  { id: 'mbarara-institute-of-health', name: 'Mbarara Institute of Health Sciences', type: 'College', ownership: 'Private', students: 2100, faculties: 3, town: 'Mbarara', photo: sn.campus.stmarys, crest: photos.crests.greenhill, about: 'A health sciences college training nurses, midwives and laboratory technicians.', campuses: ['Mbarara'], facilities: ['Skills labs', 'Partner hospitals'], verification: { status: 'verified', source: 'NCHE recognised institutions directory', on: '2026-04-22' } },
  { id: 'nile-technical-institute', name: 'Nile Technical Institute', type: 'Technical Institute', ownership: 'Public', students: 3600, faculties: 4, town: 'Jinja', photo: sn.campus.greenhill, crest: sn.crest.greenhill, about: 'Practical diplomas in engineering, building and computing, with workshops and industry placements.', campuses: ['Jinja'], facilities: ['Workshops', 'Computer labs', 'Industry placements'], verification: { status: 'verified', source: 'NCHE recognised institutions directory', on: '2026-02-15' } },
  { id: 'victoria-college-of-education', name: 'Victoria College of Education', type: 'College', ownership: 'Public', students: 2800, faculties: 2, town: 'Entebbe', photo: sn.campus.riverside, crest: sn.crest.riverside, about: 'Teacher education for secondary schools, including in-service upgrading for working teachers.', campuses: ['Entebbe'], facilities: ['Practice school', 'Library', 'Online learning'], verification: { status: 'verified', source: 'NCHE recognised institutions directory', on: '2026-05-30' } },
  { id: 'elgon-agricultural-college', name: 'Elgon Agricultural College', type: 'College', ownership: 'Private', students: 1200, faculties: 2, town: 'Mbale', photo: sn.campus.kigezi, crest: photos.crests.aisu, about: 'Agriculture and agribusiness training with a working demonstration farm.', campuses: ['Mbale'], facilities: ['Demonstration farm', 'Soil lab'], verification: { status: 'pending', source: 'NCHE recognised institutions directory', on: '2026-10-28' } },
  { id: 'rwenzori-university', name: 'Rwenzori University of Science and Technology', type: 'University', ownership: 'Public', students: 9600, faculties: 5, town: 'Fort Portal', photo: dir.campus.lakeview, crest: dir.crest.lakeview, about: 'A public university for science, technology and health, with research stations in the Rwenzori region.', campuses: ['Fort Portal'], facilities: ['Science labs', 'Innovation hub', 'Hostels'], verification: { status: 'verified', source: 'NCHE recognised institutions directory', on: '2026-07-02' } },
  { id: 'ankole-metropolitan-university', name: 'Ankole Metropolitan University', type: 'University', ownership: 'Private', students: 7300, faculties: 4, town: 'Mbarara', photo: dir.campus.riverside, crest: dir.crest.riverside, about: 'A private university known for business, law and postgraduate study for working professionals.', campuses: ['Mbarara city campus'], facilities: ['Evening and weekend classes', 'Moot court', 'Library'], verification: { status: 'verified', source: 'NCHE recognised institutions directory', on: '2026-05-18' } },
  { id: 'acholi-plains-university', name: 'Acholi Plains University', type: 'University', ownership: 'Public', students: 11200, faculties: 6, town: 'Gulu', photo: dir.campus.greenhill, crest: dir.crest.greenhill, about: 'A public university for education, health, agriculture and peace studies in northern Uganda.', campuses: ['Gulu main campus', 'Lira campus'], facilities: ['Teaching farm', 'Health centre', 'Library'], verification: { status: 'verified', source: 'NCHE recognised institutions directory', on: '2026-03-09' } },
  { id: 'teso-university-of-agriculture', name: 'Teso University of Agriculture', type: 'University', ownership: 'Public', students: 4800, faculties: 3, town: 'Soroti', photo: dir.campus.kigezi, crest: sn.crest.greenhill, about: 'Agriculture, agribusiness and food science, with farms and agro-processing labs.', campuses: ['Soroti'], facilities: ['Research farm', 'Food science lab'], verification: { status: 'pending', source: 'NCHE recognised institutions directory', on: '2026-10-30' } },
  { id: 'masaka-polytechnic', name: 'Masaka Polytechnic', type: 'Technical Institute', ownership: 'Public', students: 2600, faculties: 3, town: 'Masaka', photo: dir.campus.stmarys, crest: sn.crest.riverside, about: 'Diplomas and certificates in electrical, mechanical and building trades with industry placements.', campuses: ['Masaka'], facilities: ['Electrical workshop', 'Building yard'], verification: { status: 'verified', source: 'NCHE recognised institutions directory', on: '2026-06-21' } },
  { id: 'kampala-skills-academy', name: 'Kampala Skills Academy', type: 'Vocational Provider', ownership: 'Private', students: 1400, faculties: 2, town: 'Kampala', photo: dir.campus.online, crest: sn.crest.lakeview, about: 'Short, practical courses in fashion, beauty, catering and ICT support, with job placement help.', campuses: ['Kampala'], facilities: ['Studios', 'Training kitchen'], verification: { status: 'verified', source: 'Directorate of Industrial Training register', on: '2026-08-04' } },
  { id: 'lira-vocational-centre', name: 'Lira Vocational Training Centre', type: 'Vocational Provider', ownership: 'Public', students: 900, faculties: 2, town: 'Lira', photo: sn.campus.online, crest: photos.crests.aisu, about: 'Hands-on training in motor vehicle mechanics, welding and solar installation.', campuses: ['Lira'], facilities: ['Motor workshop', 'Welding bay', 'Solar lab'], verification: { status: 'verified', source: 'Directorate of Industrial Training register', on: '2026-04-14' } },
];

export interface Program {
  id: string;
  universityId: string;
  title: string;
  award: 'Master' | 'Bachelor' | 'Diploma' | 'Certificate';
  faculty: string;
  campus: string;
  years: string;
  mode: 'Full-time' | 'Part-time' | 'Blended';
  essentials: readonly string[];
  minimum: string;
  feesUGX: number;
  accreditation: { status: 'accredited' | 'pending' | 'not-accredited'; verifiedOn: string | null; evidence: string };
  deadline: string;
  scholarshipIds: readonly string[];
}

const p = (id: string, universityId: string, title: string, award: Program['award'], faculty: string, years: string, essentials: readonly string[], feesUGX: number, verifiedOn: string | null, over: Partial<Program> = {}): Program => ({
  id,
  universityId,
  title,
  award,
  faculty,
  campus: universities.find((u) => u.id === universityId)?.campuses[0] ?? '',
  years,
  mode: 'Full-time',
  essentials,
  minimum: award === 'Bachelor' ? 'Two principal passes at UACE' : 'One principal pass and two subsidiaries, or a relevant certificate',
  feesUGX,
  accreditation: { status: verifiedOn ? 'accredited' : 'pending', verifiedOn, evidence: verifiedOn ? `NCHE program accreditation (sample ref ${id.toUpperCase()})` : 'Awaiting NCHE accreditation' },
  deadline: '2027-02-28',
  scholarshipIds: [],
  ...over,
});

const programs: readonly Program[] = [
  p('klu-bns', 'kampala-lakes-university', 'Bachelor of Nursing Science', 'Bachelor', 'Health Sciences', '4 years', ['Biology', 'Chemistry'], 2_100_000, '2026-03-01', { scholarshipIds: ['health-futures'] }),
  p('klu-mbchb', 'kampala-lakes-university', 'Bachelor of Medicine and Bachelor of Surgery', 'Bachelor', 'Health Sciences', '5 years', ['Biology', 'Chemistry'], 3_400_000, '2026-03-01', { scholarshipIds: ['health-futures'] }),
  p('klu-bpharm', 'kampala-lakes-university', 'Bachelor of Pharmacy', 'Bachelor', 'Health Sciences', '4 years', ['Chemistry', 'Biology'], 2_800_000, '2025-08-14'),
  p('klu-bsce', 'kampala-lakes-university', 'Bachelor of Science in Civil Engineering', 'Bachelor', 'Engineering', '4 years', ['Mathematics', 'Physics'], 2_600_000, '2026-01-20', { scholarshipIds: ['women-in-stem'] }),
  p('klu-bscs', 'kampala-lakes-university', 'Bachelor of Science in Computer Science', 'Bachelor', 'Computing', '3 years', ['Mathematics'], 2_200_000, '2026-01-20', { scholarshipIds: ['women-in-stem'], mode: 'Blended' }),
  p('klu-bcom', 'kampala-lakes-university', 'Bachelor of Commerce (Accounting)', 'Bachelor', 'Business', '3 years', ['Mathematics'], 1_900_000, '2026-02-02', { mode: 'Part-time' }),
  p('rust-bse', 'rwenzori-university', 'Bachelor of Science in Software Engineering', 'Bachelor', 'Computing', '4 years', ['Mathematics'], 2_300_000, '2026-07-02', { scholarshipIds: ['women-in-stem'] }),
  p('rust-mph', 'rwenzori-university', 'Master of Public Health', 'Master', 'Health Sciences', '2 years', [], 3_600_000, '2026-07-02', { mode: 'Blended', minimum: 'A bachelor’s degree in a health-related field' }),
  p('rust-bmls', 'rwenzori-university', 'Bachelor of Biomedical Laboratory Technology', 'Bachelor', 'Laboratory Science', '4 years', ['Biology', 'Chemistry'], 2_400_000, '2026-07-02'),
  p('amu-bba', 'ankole-metropolitan-university', 'Bachelor of Business Administration', 'Bachelor', 'Business', '3 years', [], 1_800_000, '2026-05-18', { mode: 'Part-time' }),
  p('amu-mba', 'ankole-metropolitan-university', 'Master of Business Administration', 'Master', 'Business', '2 years', [], 3_200_000, '2026-05-18', { mode: 'Part-time', minimum: 'A bachelor’s degree and two years’ work experience' }),
  p('apu-bed', 'acholi-plains-university', 'Bachelor of Education (Arts)', 'Bachelor', 'Education', '3 years', [], 1_300_000, '2026-03-09', { scholarshipIds: ['teach-forward'] }),
  p('apu-bns', 'acholi-plains-university', 'Bachelor of Nursing Science', 'Bachelor', 'Health Sciences', '4 years', ['Biology', 'Chemistry'], 1_900_000, '2026-03-09', { scholarshipIds: ['health-futures'] }),
  p('apu-bsag', 'acholi-plains-university', 'Bachelor of Science in Agriculture', 'Bachelor', 'Agriculture', '4 years', ['Biology'], 1_600_000, '2025-09-01'),
  p('tua-bagb', 'teso-university-of-agriculture', 'Bachelor of Agribusiness Management', 'Bachelor', 'Agriculture', '3 years', [], 1_500_000, null, { scholarshipIds: ['green-farms'] }),
  p('mp-dee', 'masaka-polytechnic', 'Diploma in Electrical Engineering', 'Diploma', 'Engineering', '3 years', ['Mathematics', 'Physics'], 1_150_000, '2026-06-21'),
  p('mp-cbc', 'masaka-polytechnic', 'Certificate in Building and Construction', 'Certificate', 'Engineering', '2 years', [], 800_000, '2026-06-21'),
  p('ksa-cfd', 'kampala-skills-academy', 'Certificate in Fashion and Garment Design', 'Certificate', 'Creative Arts', '1 year', [], 650_000, '2026-08-04', { mode: 'Part-time', minimum: 'UCE certificate or relevant experience' }),
  p('ksa-cict', 'kampala-skills-academy', 'Certificate in ICT Support', 'Certificate', 'Computing', '6 months', [], 500_000, '2026-08-04', { minimum: 'UCE certificate' }),
  p('lvc-cmv', 'lira-vocational-centre', 'Certificate in Motor Vehicle Mechanics', 'Certificate', 'Engineering', '1 year', [], 450_000, '2026-04-14', { minimum: 'UCE certificate or relevant experience' }),
  p('lvc-csol', 'lira-vocational-centre', 'Certificate in Solar Installation', 'Certificate', 'Engineering', '6 months', [], 400_000, '2026-04-14', { minimum: 'UCE certificate or relevant experience' }),
  p('mih-dmls', 'mbarara-institute-of-health', 'Diploma in Medical Laboratory Science', 'Diploma', 'Laboratory Science', '3 years', ['Biology', 'Chemistry'], 1_350_000, '2026-04-22', { deadline: '2027-01-15' }),
  p('mih-dn', 'mbarara-institute-of-health', 'Diploma in Nursing', 'Diploma', 'Nursing', '3 years', ['Biology', 'Chemistry'], 1_400_000, '2026-04-22', { scholarshipIds: ['health-futures'] }),
  p('nti-dce', 'nile-technical-institute', 'Diploma in Civil Engineering', 'Diploma', 'Engineering', '3 years', ['Mathematics', 'Physics'], 1_200_000, '2026-02-15'),
  p('nti-dcs', 'nile-technical-institute', 'Diploma in Computer Science', 'Diploma', 'Computing', '2 years', ['Mathematics'], 1_100_000, '2026-02-15', { scholarshipIds: ['women-in-stem'] }),
  p('vce-bed', 'victoria-college-of-education', 'Bachelor of Education (Secondary)', 'Bachelor', 'Education', '3 years', [], 1_500_000, '2026-05-30', { mode: 'Blended', scholarshipIds: ['teach-forward'] }),
  p('eac-bsag', 'elgon-agricultural-college', 'Bachelor of Science in Agriculture', 'Bachelor', 'Agriculture', '4 years', ['Biology'], 1_700_000, null, { scholarshipIds: ['green-farms'] }),
];

export type StudyLevelName = 'Undergraduate' | 'Postgraduate' | 'Diploma & Certificate' | 'Vocational & Technical';
export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  amount: string;
  type: 'Full tuition' | 'Partial tuition' | 'Grant';
  eligibility: string;
  deadline: string;
  level: StudyLevelName;
  area: CareerArea;
  icon: IconName;
  tint: string;
  color: string;
}

const scholarships: readonly Scholarship[] = [
  { id: 'health-futures', title: 'Health Futures Scholarship', provider: 'Kampala Lakes University', amount: 'Full tuition', type: 'Full tuition', eligibility: 'UACE with Biology and Chemistry; family income below a set level.', deadline: '2027-01-31', level: 'Undergraduate', area: 'health', icon: 'cap', tint: Maple.blueSoft, color: Maple.blue },
  { id: 'women-in-stem', title: 'Women in STEM Award', provider: 'Sample STEM Foundation', amount: 'UGX 1,000,000 a year', type: 'Partial tuition', eligibility: 'Female applicants to engineering or computing programs.', deadline: '2027-02-15', level: 'Undergraduate', area: 'science', icon: 'pin', tint: '#FDEEF4', color: '#DB2777' },
  { id: 'green-farms', title: 'Green Farms Grant', provider: 'Sample Agribusiness Trust', amount: 'UGX 600,000 a year', type: 'Grant', eligibility: 'Applicants to agriculture programs from farming families.', deadline: '2027-02-20', level: 'Diploma & Certificate', area: 'environment', icon: 'leaf', tint: Maple.successSoft, color: Maple.successText },
  { id: 'teach-forward', title: 'Teach Forward Bursary', provider: 'Victoria College of Education', amount: '50% of tuition', type: 'Partial tuition', eligibility: 'Applicants committing to teach for two years.', deadline: '2027-03-01', level: 'Undergraduate', area: 'education', icon: 'layers', tint: Maple.warningSoft, color: Maple.warning },
  { id: 'rust-stem', title: 'Rwenzori STEM Excellence Scholarship', provider: 'Rwenzori University of Science and Technology', amount: 'UGX 1,500,000 a year', type: 'Partial tuition', eligibility: 'UACE with Mathematics and Physics, from the Rwenzori region.', deadline: '2027-03-15', level: 'Undergraduate', area: 'engineering', icon: 'cpu', tint: Maple.blueSoft, color: Maple.blue },
  { id: 'northern-teachers', title: 'Northern Uganda Teacher Bursary', provider: 'Acholi Plains University', amount: '40% of tuition', type: 'Partial tuition', eligibility: 'Applicants from northern Uganda training as teachers.', deadline: '2027-04-10', level: 'Undergraduate', area: 'education', icon: 'book', tint: Maple.warningSoft, color: Maple.warning },
  { id: 'skills-start', title: 'Skills Start Grant', provider: 'Kampala Skills Academy', amount: 'Full course fees', type: 'Full tuition', eligibility: 'Learners aged 16 to 24 starting a vocational certificate.', deadline: '2027-01-15', level: 'Vocational & Technical', area: 'business', icon: 'briefcase', tint: Maple.warningSoft, color: Maple.warningText },
  { id: 'public-health-fellows', title: 'Public Health Leaders Fellowship', provider: 'Sample Health Foundation', amount: 'UGX 4,000,000', type: 'Grant', eligibility: 'Health graduates working in public service.', deadline: '2027-05-31', level: 'Postgraduate', area: 'health', icon: 'pulse', tint: Maple.blueSoft, color: Maple.blue },
];


export interface CareerEvent {
  id: string;
  title: string;
  host: string;
  /** Maple-run events share nothing; an institution's event shares only what the learner agrees to when registering. */
  hostKind: 'maple' | 'institution';
  when: string;
  date: string;
  time: string;
  place: string;
  format: 'Virtual' | 'In person';
  kind: 'Open Day' | 'Career Talk' | 'Career Fair' | 'Group Guidance';
  area: CareerArea | null;
  levels: readonly string[];
  about: string;
  photo: number;
  sponsored: boolean;
}

export interface Community {
  id: string;
  title: string;
  topic: string;
  field: string;
  members: number;
  activeThisWeek: number;
  created: string;
  /** A vetted mentor, or null when peers lead it (always moderated by Maple). */
  mentor: string | null;
  about: string;
  tags: readonly string[];
  latest: string;
  photo: number | null;
  suggested: boolean;
}

/** The interest activity's picture tiles (the phone reference): the key is what careers match on. */
export const INTEREST_TILES: readonly { key: string; label: string; photo: number }[] = [
  { key: 'science', label: 'Science & Experimentation', photo: cc.interests.science },
  { key: 'technology', label: 'Technology & Computers', photo: cc.interests.technology },
  { key: 'design and building', label: 'Design & Building', photo: cc.interests.design },
  { key: 'the arts', label: 'Creativity & The Arts', photo: cc.interests.creativity },
  { key: 'working with people', label: 'Leadership & People', photo: cc.interests.leadership },
  { key: 'business', label: 'Business & Entrepreneurship', photo: cc.interests.business },
  { key: 'sport', label: 'Sports & Physical Activity', photo: cc.interests.sports },
  { key: 'the environment', label: 'Environment & Sustainability', photo: cc.interests.environment },
  { key: 'reading and research', label: 'Reading & Research', photo: cc.interests.reading },
];

export const careerCompass = {
  photos: { ...cc, directoryHero: sn.hero },
  tiles: INTEREST_TILES,
  areas: CAREER_AREAS,
  learner: { name: 'Aisha', level: 'S.5', subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'] },
  careers,
  universities,
  programs,
  scholarships,
  /** The interest activity's choices. */
  options: {
    interests: INTEREST_TILES.map((x) => x.key),
    strengths: ['Biology', 'Chemistry', 'Physics', 'Mathematics', 'English', 'Economics', 'Agriculture', 'Geography', 'Art'],
    environments: ['hospital', 'lab', 'office', 'field', 'outdoors', 'classroom', 'community', 'studio'],
  },
  /** The learner's last answers (they can change them any time). */
  answers: { interests: ['science', 'technology', 'the environment'], strengths: ['Biology', 'Chemistry'], environments: ['hospital', 'lab'] },
  /** The learner's agree/disagree answers (3 strongly agree … 0 disagree). */
  preferences: { 'real-world': 3, 'living-things': 3, creativity: 1, numbers: 2, helping: 2, outdoors: 2 } as Readonly<Record<string, number>>,
  saved: { careers: ['nurse'], programs: ['klu-bns'], scholarships: ['health-futures', 'women-in-stem'], scholarshipPlans: ['health-futures'], communities: ['g1'] },
  /** Career profiles the learner has opened. */
  viewed: ['nurse', 'doctor'],
  /** The learner's agreed career actions. */
  actions: [
    { id: 'a1', text: 'Compare the Diploma and Bachelor routes into nursing', due: '2026-11-20', done: true },
    { id: 'a2', text: 'Revise Organic Chemistry (Maple lessons)', due: '2026-11-30', done: false },
    { id: 'a3', text: 'Apply for the Health Futures Scholarship', due: '2027-01-31', done: false },
    { id: 'a4', text: 'Attend a nursing open day', due: '2026-12-05', done: false },
  ],
  /** Career events. A sponsored event is always labelled as sponsored; registering with an institution shares only what the learner agrees to. */
  events: [
    { id: 'e1', title: 'Virtual Open Day: Health Sciences', host: 'Kampala Lakes University', hostKind: 'institution', when: 'Sat, Dec 5, 2026 · 10:00 AM', date: '2026-12-05', time: '10:00 AM – 12:30 PM', place: 'Online', format: 'Virtual', kind: 'Open Day', area: 'health', levels: ['S.5', 'S.6'], about: 'Explore programs in medicine, nursing, pharmacy and other health sciences. Meet faculty and students.', photo: cc.events.health, sponsored: true },
    { id: 'e2', title: 'Choosing A-Level Subjects for Science Careers', host: 'Maple Career Guidance', hostKind: 'maple', when: 'Wed, Nov 18, 2026 · 4:00 PM', date: '2026-11-18', time: '4:00 PM – 5:30 PM', place: 'Online', format: 'Virtual', kind: 'Group Guidance', area: 'science', levels: ['S.3', 'S.4'], about: 'Get expert guidance on the best A-Level subject combinations for careers in science and technology.', photo: cc.events.alevel, sponsored: false },
    { id: 'e3', title: 'Kampala Lakes University Open Day', host: 'Kampala Lakes University', hostKind: 'institution', when: 'Sun, Jan 24, 2027 · 9:00 AM – 4:00 PM', date: '2027-01-24', time: '9:00 AM – 4:00 PM', place: 'Kampala', format: 'In person', kind: 'Open Day', area: null, levels: ['S.5', 'S.6'], about: 'Tour the campus, meet staff, explore programs and learn about scholarships and student life.', photo: cc.events.klu, sponsored: true },
    { id: 'e4', title: 'Universities Career Fair', host: 'Maple Career Guidance', hostKind: 'maple', when: 'Sun, Feb 7, 2027 · 10:00 AM – 5:00 PM', date: '2027-02-07', time: '10:00 AM – 5:00 PM', place: 'Online', format: 'Virtual', kind: 'Career Fair', area: null, levels: ['S.4', 'S.5', 'S.6'], about: 'Meet representatives from universities, explore programs, scholarships and admission pathways.', photo: cc.events.fair, sponsored: false },
    { id: 'e5', title: 'STEM Programs Info Session', host: 'Rwenzori University of Science and Technology', hostKind: 'institution', when: 'Sat, Feb 20, 2027 · 2:00 PM – 4:00 PM', date: '2027-02-20', time: '2:00 PM – 4:00 PM', place: 'Online', format: 'Virtual', kind: 'Career Talk', area: 'engineering', levels: ['S.5', 'S.6'], about: 'Learn about engineering, computer science and other STEM programs, with admission and funding tips.', photo: cc.events.stem, sponsored: true },
    { id: 'e6', title: 'Careers in Technology: Skills for the Future', host: 'Industry Experts Panel', hostKind: 'maple', when: 'Fri, Feb 26, 2027 · 4:00 PM – 5:30 PM', date: '2027-02-26', time: '4:00 PM – 5:30 PM', place: 'Online', format: 'Virtual', kind: 'Career Talk', area: 'science', levels: ['S.4', 'S.5', 'S.6'], about: 'Hear from tech professionals on in-demand skills, career paths and how to get started.', photo: cc.events.tech, sponsored: false },
  ] as readonly CareerEvent[],
  /** The learner's event registrations ("interested" saves an event without registering). */
  registrations: { e1: 'registered', e2: 'registered', e3: 'interested' } as Readonly<Record<string, 'registered' | 'interested'>>,
  /** Moderated career communities: learners exploring the same field, with vetted mentors. */
  communities: [
    { id: 'g1', title: 'Future Health Workers', topic: 'Healthcare', field: 'Health', members: 1_240, activeThisWeek: 312, created: '2025-09-01', mentor: 'Sr. Ruth Nansubuga, registered nurse', about: 'Explore healthcare careers, share study tips and get guidance from health professionals.', tags: ['Nursing', 'Medicine', 'Allied Health'], latest: 'How I chose between the nursing diploma and degree', photo: cc.communities.health, suggested: false },
    { id: 'g2', title: 'Engineers in the Making', topic: 'Engineering', field: 'Engineering', members: 860, activeThisWeek: 204, created: '2025-11-12', mentor: 'Eng. Daniel Okello, civil engineer', about: 'Discuss engineering paths, key subjects and real-world opportunities with practising engineers.', tags: ['Civil', 'Mechanical', 'Electrical', 'Software'], latest: 'Physics topics that matter most for engineering', photo: cc.communities.eng, suggested: false },
    { id: 'g3', title: 'Code Club Uganda', topic: 'Technology', field: 'ICT', members: 1_530, activeThisWeek: 401, created: '2025-08-20', mentor: 'Grace Achieng, software developer', about: 'Learn, build and grow your coding skills with fellow learners and industry mentors.', tags: ['Programming', 'Web Development', 'AI'], latest: 'Free ways to start coding before university', photo: cc.communities.code, suggested: false },
    { id: 'g4', title: 'Green Futures', topic: 'Environment', field: 'Agriculture', members: 920, activeThisWeek: 148, created: '2026-02-03', mentor: null, about: 'Discuss careers in environment, agriculture and sustainability.', tags: ['Agriculture', 'Environment', 'Climate'], latest: 'Which A-Level subjects lead to environmental science?', photo: cc.communities.green, suggested: false },
    { id: 'g5', title: 'Education Changemakers', topic: 'Education', field: 'Education', members: 780, activeThisWeek: 96, created: '2026-03-14', mentor: null, about: 'Explore teaching careers, education leadership and ways to create impact in your community.', tags: ['Teaching', 'Curriculum', 'Education Policy'], latest: 'What a day as a trainee teacher looks like', photo: cc.communities.edu, suggested: false },
    { id: 'g6', title: 'Creative Careers Hub', topic: 'Creative', field: 'Creative Arts', members: 640, activeThisWeek: 121, created: '2026-05-09', mentor: null, about: 'A space for creative minds to explore careers in media, design, film, music and digital content.', tags: ['Design', 'Media', 'Film', 'Content Creation'], latest: 'Building a portfolio while still at school', photo: cc.communities.creative, suggested: false },
    { id: 'g7', title: 'Data & AI Careers', topic: 'Technology', field: 'ICT', members: 1_120, activeThisWeek: 260, created: '2026-06-01', mentor: 'Brian Ssekandi, data analyst', about: 'Statistics, data science and AI: what the work is and how to start.', tags: ['Data', 'AI', 'Statistics'], latest: 'Do I need Further Mathematics for data science?', photo: null, suggested: true },
    { id: 'g8', title: 'Agriculture Innovators', topic: 'Environment', field: 'Agriculture', members: 680, activeThisWeek: 88, created: '2026-04-18', mentor: null, about: 'Modern farming, agribusiness and food science careers.', tags: ['Agribusiness', 'Food Science'], latest: 'Running a school farm project', photo: null, suggested: true },
    { id: 'g9', title: 'Media & Creative Arts', topic: 'Creative', field: 'Creative Arts', members: 940, activeThisWeek: 133, created: '2026-01-22', mentor: null, about: 'Journalism, broadcasting, animation and the creative industries.', tags: ['Journalism', 'Animation'], latest: 'How radio presenters got their start', photo: null, suggested: true },
  ] as readonly Community[],
  /** The next live group session in the communities. */
  groupSession: { id: 'gs1', title: 'Careers in Healthcare: Paths and Opportunities', host: 'Future Health Workers', date: '2026-11-18', time: '4:00 PM – 5:00 PM', photo: cc.art.groupSession },
  /** Verified career counselors. Sample people; credentials are checked by Maple before they can take bookings. */
  counseling: {
    included: 2,
    credits: 1,
    pricePerSessionUGX: 45_000,
    counselors: [
      { id: 'c1', name: 'Dr. Miriam Akello', title: 'Career Counselor · Health & Life Sciences', photo: cc.counselors.c1, areas: ['health', 'science'], languages: ['English', 'Luganda'], location: 'Kampala, Uganda', about: 'Helps with health careers, subject choice, university programs and scholarships.', focus: ['Healthcare', 'Subject Choice', 'Scholarships'], checked: 'Credentials verified by Maple · Sep 2026', rating: 4.9, sessions: 312 },
      { id: 'c2', name: 'Mr. Joseph Mugisha', title: 'Career Counselor · Engineering & ICT', photo: cc.counselors.c2, areas: ['engineering', 'science'], languages: ['English', 'Runyankole'], location: 'Mbarara, Uganda', about: 'Helps with engineering careers, technology pathways, university applications and study planning.', focus: ['Engineering', 'Technology & ICT', 'University Applications'], checked: 'Credentials verified by Maple · Aug 2026', rating: 4.8, sessions: 245 },
    ],
    slots: [
      { id: 's1', counselorId: 'c1', at: '2026-11-10T16:00' },
      { id: 's2', counselorId: 'c1', at: '2026-11-12T10:00' },
      { id: 's3', counselorId: 'c1', at: '2026-11-14T11:30' },
      { id: 's6', counselorId: 'c1', at: '2026-11-19T15:00' },
      { id: 's4', counselorId: 'c2', at: '2026-11-11T15:00' },
      { id: 's5', counselorId: 'c2', at: '2026-11-13T17:00' },
      { id: 's7', counselorId: 'c2', at: '2026-11-24T10:00' },
    ],
    /** The session the learner has booked (it used one of the included sessions). */
    booked: [{ id: 'session-s1', slotId: 's1', counselorId: 'c1', at: '2026-11-10T16:00', topic: 'Choosing A-Level subjects' }],
    topics: ['Exploring careers', 'Choosing A-Level subjects', 'University and program choices', 'Scholarships and funding', 'Application review'],
  },

};
