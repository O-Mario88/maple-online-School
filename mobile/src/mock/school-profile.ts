/**
 * Sample data for School Profile Management: Riverside High School's editable public profile
 * (the draft its admins change before publishing to the School Network). Illustrative.
 */
import type { BasicInfo, SectionKey } from '@/features/school/profile/profile';
import type { IconName } from '@/lib/icons';

import { photos } from './photos';

export const schoolProfile = {
  tabs: ['Overview', 'Academics & Programs', 'Performance', 'Admissions', 'Facilities & Gallery', 'Examination Services', 'Contact & Location'],
  tabIcons: ['home', 'cap', 'chart', 'people', 'image', 'trophy', 'pin'] as readonly IconName[],
  done: ['basic', 'academics', 'performance', 'admissions', 'facilities', 'exams', 'contact'] as readonly SectionKey[],
  policyAccepted: true,
  performanceVerified: true,
  basic: {
    name: 'Riverside High School',
    type: 'Secondary School',
    ownership: 'Private',
    established: '2012',
    registration: 'PSS/3421/2012',
    description:
      'Riverside High School is a leading secondary school in Entebbe, committed to academic excellence, character development and holistic learner growth. We offer both day and boarding, with strong performance in national and international examinations.',
    country: 'Uganda',
    district: 'Wakiso',
    town: 'Entebbe',
    address: 'Plot 45, Airport Road, Entebbe',
  } as BasicInfo,
  options: {
    types: ['Primary School', 'Secondary School', 'Primary & Secondary', 'Tertiary Institution'],
    ownership: ['Private', 'Government', 'Government-aided', 'Faith-based', 'Community'],
    countries: ['Uganda', 'Kenya', 'Tanzania', 'Rwanda'],
    districts: ['Wakiso', 'Kampala', 'Mukono', 'Jinja', 'Entebbe Municipality'],
  },
  academics: {
    curricula: ['UNEB'],
    levels: ['O-Level', 'A-Level'],
    programs: ['STEM', 'Sciences', 'Arts', 'Business'],
    allPrograms: ['STEM', 'Sciences', 'Arts', 'Business', 'ICT', 'Agriculture', 'Music', 'Sports'],
  },
  performance: { exam: 'UCE', year: '2025', passRate: '96', source: 'UNEB UCE 2025 results', verified: true },
  admissions: { opens: '15 Oct 2026', deadline: '20 Dec 2026', feeMin: '1,400,000', feeMax: '1,900,000', requirements: ['UCE results slip', 'Latest report card', 'Birth certificate'] },
  facilities: ['Robotics lab', 'Computer labs', 'Science laboratories', 'Library', 'Boarding houses', 'Sports field'],
  gallery: [photos.schoolNetwork.campus.riverside, photos.schoolNetwork.campus.lakeview, photos.schoolHub.stem[0], photos.schoolHub.campaigns[1]],
  exams: { centre: true, boards: ['UNEB'], exams: ['UCE', 'UACE'], external: false },
  contact: { phone: '+256 414 320 112', email: 'admissions@riverside.example', website: 'riverside.maple.school' },
  preview: {
    photo: photos.schoolNetwork.campus.riverside,
    crest: photos.schoolNetwork.crest.riverside,
    highlights: [
      { icon: 'cap' as IconName, label: 'O-Level\nA-Level' },
      { icon: 'people' as IconName, label: 'Day &\nBoarding' },
      { icon: 'trophy' as IconName, label: 'Strong\nPerformance' },
      { icon: 'building' as IconName, label: 'Modern\nFacilities' },
    ],
  },
};
