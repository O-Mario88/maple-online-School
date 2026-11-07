/** Sample data for Image 2: Teacher Verification & KYC Credentials Upload (/(teacher)/verification). */
import type { IconName } from '@/lib/icons';

import { photos } from './photos';

export const verificationKyc = {
  avatar: photos.teacherHome.sarah,
  name: 'Sarah N.',
  username: '@sarahn',
  roleTitle: 'Mathematics Teacher & Online Tutor',
  steps: [
    {
      num: 1,
      title: 'Identity Verification',
      subtitle: 'National ID or Passport',
      active: true,
    },
    {
      num: 2,
      title: 'Academic Qualifications',
      subtitle: 'Degrees and transcripts',
      active: false,
    },
    {
      num: 3,
      title: 'Teaching Credentials',
      subtitle: 'Certificates and licenses',
      active: false,
    },
    {
      num: 4,
      title: 'Review & Approval',
      subtitle: 'Our team will verify your\ndocuments',
      active: false,
    },
  ],
  idRequirements: [
    'Clear, full document (front and back)',
    'All text must be visible and readable',
    'Photo must be clear and unedited',
    'Accepted formats: JPG, PNG, PDF',
  ],
  academicAccepted: [
    "Bachelor's, Master's, or PhD degrees",
    'Official transcripts (if available)',
    'Clearly showing your name, institution, and date',
    'Accepted formats: JPG, PNG, PDF',
  ],
  teachingAccepted: [
    'Teaching license or registration',
    'Professional teaching certificates (e.g., TEFL)',
    'Letters of employment or experience',
    'Any relevant education credentials',
  ],
  benefits: [
    {
      title: 'Verified Educator Badge',
      subtitle: 'Show a trusted badge on your profile',
      icon: 'shield' as IconName,
    },
    {
      title: 'Higher visibility',
      subtitle: 'Be featured in search and recommendations',
      icon: 'people' as IconName,
    },
    {
      title: 'Instant payouts',
      subtitle: 'Receive earnings without delay',
      icon: 'wallet' as IconName,
    },
    {
      title: 'Access to school opportunities',
      subtitle: 'Be invited by schools to teach classes',
      icon: 'school' as IconName,
    },
    {
      title: 'Build trust with parents',
      subtitle: 'Verified credentials increase confidence',
      icon: 'shield' as IconName,
    },
  ],
  statusItems: [
    {
      id: 'vs-1',
      title: 'Identity Verification',
      subtitle: 'Document uploaded • 2 Oct 2026, 10:24 AM',
      done: true,
    },
    {
      id: 'vs-2',
      title: 'Academic Qualifications',
      subtitle: 'Not submitted',
      done: false,
    },
    {
      id: 'vs-3',
      title: 'Teaching Credentials',
      subtitle: 'Not submitted',
      done: false,
    },
    {
      id: 'vs-4',
      title: 'Review & Approval',
      subtitle: 'Pending submission',
      done: false,
    },
  ],
};

export type VerificationKyc = typeof verificationKyc;

