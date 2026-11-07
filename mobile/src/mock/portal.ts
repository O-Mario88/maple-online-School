/**
 * Sample data for the parent Academics, Messages and Settings pages and the school admin
 * Onboarding and Academics pages, copied from Edwin's references (November 2026).
 * Photos are cut from those references.
 */
import { ACADEMICS_NAV, ACADEMICS_QUICK_ACTIONS, ACADEMICS_SECTIONS, ACADEMICS_TABLES, ACADEMICS_TABS } from '@/features/school/academics/academicsShape';
import type { IconName } from '@/lib/icons';

type Photo = number;

const face = {
  daniel: require('./images/pp-daniel.png') as Photo,
  grace: require('./images/pp-grace.png') as Photo,
  samuel: require('./images/pp-samuel.png') as Photo,
  mary: require('./images/pp-mary.png') as Photo,
  john: require('./images/pp-john.png') as Photo,
  esther: require('./images/pp-esther.png') as Photo,
  sarah: require('./images/pp-sarah.png') as Photo,
  okello: require('./images/pp-okello.png') as Photo,
  nakato: require('./images/pp-nakato.png') as Photo,
  kato: require('./images/pp-kato.png') as Photo,
};

/** The colours the references give each subject. */
export type SubjectTone = 'blue' | 'red' | 'orange' | 'purple' | 'green';

export interface PortalChild {
  id: string;
  name: string;
  level: string;
  school: string;
  avatar: Photo;
}

export interface Homework {
  title: string;
  topic: string;
  subject: string;
  due: string;
  date: string;
  status: 'Due Today' | 'Upcoming';
  tone: SubjectTone;
  icon: IconName;
}

export interface GradeRow {
  assessment: string;
  title: string;
  topic: string;
  subject: string;
  score: number;
  grade: string;
  date: string;
  tone: SubjectTone;
  icon: IconName;
}

export interface Thread {
  id: string;
  kind: 'teacher' | 'announcements' | 'support';
  name: string;
  avatar?: Photo;
  subject?: string;
  child?: string;
  preview: string;
  previewLong: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface ChatMessage {
  from: 'teacher' | 'me';
  text: string;
  time: string;
  voice?: string;
  file?: { name: string; size: string };
}

export interface SubjectScore {
  subject: string;
  score: number;
  delta: number;
  tone: SubjectTone;
  icon: IconName;
}

const children: readonly PortalChild[] = [
  { id: 'daniel', name: 'Daniel', level: 'O-Level', school: 'Maple Online School', avatar: face.daniel },
  { id: 'grace', name: 'Grace', level: 'Primary 6', school: 'Green Valley School', avatar: face.grace },
  { id: 'samuel', name: 'Samuel', level: 'S.2', school: 'Sunrise Secondary', avatar: face.samuel },
];

export const parent = {
  me: { name: 'Mary N.', mode: 'Parent Mode', avatar: face.mary, notifications: 3, unreadMessages: 3 },
  children,
  term: 'Term 2, 2026',
  academics: {
    subjects: [
      { subject: 'Mathematics', score: 86, delta: 12, tone: 'blue', icon: 'calculator' },
      { subject: 'English', score: 82, delta: 8, tone: 'red', icon: 'book' },
      { subject: 'Science', score: 78, delta: 5, tone: 'orange', icon: 'flask' },
      { subject: 'Social Studies', score: 91, delta: 10, tone: 'purple', icon: 'globe' },
    ] as readonly SubjectScore[],
    homework: [
      { title: 'Maths Worksheet', topic: 'Algebra – Fractions', subject: 'Mathematics', due: 'Today', date: 'Today', status: 'Due Today', tone: 'blue', icon: 'doc' },
      { title: 'English Essay', topic: 'My Community', subject: 'English', due: 'Tomorrow', date: '28 Oct', status: 'Upcoming', tone: 'red', icon: 'doc' },
      { title: 'Science Lab Report', topic: 'Plants and Growth', subject: 'Science', due: 'Wed, 29 Oct', date: '29 Oct', status: 'Upcoming', tone: 'orange', icon: 'doc' },
      { title: 'Social Studies Quiz', topic: 'Chapter 4', subject: 'Social Studies', due: '31 Oct', date: '31 Oct', status: 'Upcoming', tone: 'purple', icon: 'globe' },
    ] as readonly Homework[],
    grades: [
      { assessment: 'Mathematics Test 1', title: 'Mathematics Test', topic: 'Algebra', subject: 'Mathematics', score: 92, grade: 'A', date: '24 Oct', tone: 'blue', icon: 'doc' },
      { assessment: 'Essay: My Community', title: 'English Essay', topic: 'My Community', subject: 'English', score: 85, grade: 'B+', date: '22 Oct', tone: 'red', icon: 'doc' },
      { assessment: 'Science Quiz', title: 'Science Quiz', topic: 'Plants and Growth', subject: 'Science', score: 78, grade: 'B', date: '20 Oct', tone: 'orange', icon: 'flask' },
      { assessment: 'Chapter 3 Test', title: 'Social Studies', topic: 'Chapter 3', subject: 'Social Studies', score: 91, grade: 'A', date: '18 Oct', tone: 'purple', icon: 'globe' },
    ] as readonly GradeRow[],
    teacherNotes: [
      { teacher: 'Ms. Sarah N.', role: 'Mathematics Teacher', avatar: face.sarah, duration: '0:20', text: 'Great work on the algebra test! Keep practicing the new concepts.', date: '24 Oct' },
      { teacher: 'Mr. Okello J.', role: 'Science Teacher', avatar: face.okello, duration: '0:18', text: 'Well done on your lab report. Your observations were clear and detailed.', date: '22 Oct' },
    ],
    feedback: {
      title: 'Mathematics Test 1',
      topic: 'Algebra – Fractions',
      status: 'Graded',
      score: '92%',
      date: '24 Oct',
      duration: '0:20',
      text: 'Good understanding of fractions. Watch the video on mixed numbers for extra practice.',
      paper: require('./images/pp-paper.png') as Photo,
    },
    reportCard: { title: 'Term 1 Report Card', year: 'Academic Year 2026', status: 'Published', date: '15 Sept 2026' },
    pastReports: [
      { term: 'Term 3, 2025', size: '2.1 MB' },
      { term: 'Term 2, 2025', size: '1.8 MB' },
      { term: 'Term 1, 2025', size: '1.9 MB' },
    ],
  },
  messages: {
    threads: [
      {
        id: 'sarah',
        kind: 'teacher',
        name: 'Ms. Sarah N.',
        avatar: face.sarah,
        subject: 'Mathematics',
        child: 'Daniel (O-Level)',
        preview: "Great progress this week! I've shared...",
        previewLong: "Great progress this week! I've shared some feedback on Daniel's test.",
        time: '10:24 AM',
        unread: 2,
        online: true,
      },
      {
        id: 'okello',
        kind: 'teacher',
        name: 'Mr. Okello J.',
        avatar: face.okello,
        subject: 'Science',
        child: 'Daniel (O-Level)',
        preview: 'Here is the lab report feedback...',
        previewLong: 'Here is the lab report feedback...',
        time: 'Yesterday',
        unread: 0,
        online: true,
      },
      {
        id: 'nakato',
        kind: 'teacher',
        name: 'Mrs. A. Nakato',
        avatar: face.nakato,
        subject: 'English',
        child: 'Grace (Primary 6)',
        preview: "Grace did well in her essay. I've...",
        previewLong: "Grace did well in her essay. I've attached her marked script.",
        time: '24 Oct',
        unread: 0,
        online: true,
      },
      {
        id: 'announcements',
        kind: 'announcements',
        name: 'School Announcements',
        preview: 'Term 2 assessments begin next week...',
        previewLong: 'Term 2 assessments begin next week...',
        time: '23 Oct',
        unread: 1,
        online: false,
      },
      {
        id: 'kato',
        kind: 'teacher',
        name: 'Mr. Kato P.',
        avatar: face.kato,
        subject: 'Class Teacher',
        child: 'Samuel (S.2)',
        preview: 'Samuel has shown great improvement...',
        previewLong: 'Samuel has shown great improvement...',
        time: '21 Oct',
        unread: 0,
        online: true,
      },
      {
        id: 'support',
        kind: 'support',
        name: 'Guidance & Support',
        preview: 'Mental wellness webinar for parents...',
        previewLong: 'Mental wellness webinar for parents...',
        time: '20 Oct',
        unread: 0,
        online: false,
      },
    ] as readonly Thread[],
    chat: [
      {
        from: 'teacher',
        text: "Hello Mrs. Mary,\nDaniel did very well in this week's algebra test. He showed good understanding of fractions and solved the problems confidently.",
        time: '10:12 AM',
      },
      {
        from: 'teacher',
        voice: '0:20',
        text: "I've recorded a short voice note with more details about his progress and a few tips for home practice.",
        time: '10:15 AM',
      },
      {
        from: 'me',
        text: 'Thank you so much, Ms. Sarah! We are proud of his progress. Are there any areas he still needs to work on?',
        time: '10:18 AM',
      },
      {
        from: 'teacher',
        text: "Overall he's doing great. He just needs a bit more practice with word problems. I've attached a short worksheet you can work on together.",
        file: { name: 'Algebra_Practice_Worksheet.pdf', size: '1.2 MB' },
        time: '10:20 AM',
      },
    ] as readonly ChatMessage[],
    booking: {
      teacher: 'Ms. Sarah N.',
      types: ['Parent–Teacher Meeting', 'Progress Review', 'Wellbeing Check-in'],
      range: 'Oct 27 – Oct 31, 2026',
      days: [
        { dow: 'Mon', date: '27 Oct', slots: ['10:00 AM', '11:00 AM', '2:00 PM'] },
        { dow: 'Tue', date: '28 Oct', slots: ['3:00 PM', '4:00 PM'] },
        { dow: 'Wed', date: '29 Oct', slots: ['10:00 AM', '1:00 PM'] },
        { dow: 'Thu', date: '30 Oct', slots: ['11:00 AM', '3:00 PM'] },
        { dow: 'Fri', date: '31 Oct', slots: ['10:00 AM', '2:00 PM'] },
      ],
      modes: [
        { key: 'video', label: 'Video Call', icon: 'video' },
        { key: 'phone', label: 'Phone Call', icon: 'phone' },
        { key: 'person', label: 'In-Person\n(at school)', icon: 'inPerson' },
      ] as readonly { key: string; label: string; icon: IconName }[],
    },
    meetings: [
      { teacher: 'Ms. Sarah N.', subject: 'Mathematics', child: 'Daniel (O-Level)', when: 'Tue, 28 Oct 2026 • 3:00 PM', status: 'Confirmed', avatar: face.sarah },
    ],
    announcements: [
      {
        title: 'Term 2 Assessments Begin',
        body: 'All learners will begin Term 2 assessments next week. Please check the school calendar for details.',
        date: '23 Oct 2026',
        icon: 'clock',
        tone: 'orange',
      },
      {
        title: 'Parent Webinar: Supporting Learning at Home',
        body: "Join us for a webinar on practical ways to support your child's learning journey.",
        date: '20 Oct 2026',
        icon: 'chat',
        tone: 'green',
      },
      {
        title: 'School Closure – Independence Day',
        body: 'The school will be closed on Monday, 12 October in observance of Independence Day.',
        date: '18 Oct 2026',
        icon: 'calendar',
        tone: 'red',
      },
    ] as readonly { title: string; body: string; date: string; icon: IconName; tone: SubjectTone }[],
    teachers: [
      { name: 'Ms. Sarah N.', detail: 'Mathematics • Daniel (O-Level)', avatar: face.sarah },
      { name: 'Mr. Okello J.', detail: 'Science • Daniel (O-Level)', avatar: face.okello },
      { name: 'Mrs. A. Nakato', detail: 'English • Grace (Primary 6)', avatar: face.nakato },
      { name: 'Mr. Kato P.', detail: 'Class Teacher • Samuel (S.2)', avatar: face.kato },
    ],
    helpArt: require('./images/pp-help-art.png') as Photo,
  },
  settings: {
    howTo: [
      { title: 'Get the QR code or 6-digit code', body: "Ask your child's school for a parent QR code or join code.", icon: 'clipboard' },
      { title: 'Scan or enter the code', body: 'Use your phone camera to scan the QR code, or enter the 6-digit code manually.', icon: 'scan' },
      { title: 'Confirm child details', body: "Verify the child's name and school, then add them to your account.", icon: 'userPlus' },
    ] as readonly { title: string; body: string; icon: IconName }[],
    qrPhone: require('./images/pp-qr-phone.png') as Photo,
    guardians: [
      { name: 'Mary N. (You)', role: 'Parent (Primary)', access: 'Full Access', you: true, avatar: face.mary },
      { name: 'John O.', role: 'Guardian (Father)', access: 'View Only', you: false, avatar: face.john },
      { name: 'Esther A.', role: 'Guardian (Aunt)', access: 'View Only', you: false, avatar: face.esther },
    ],
    privacy: [
      { key: 'photos', title: 'Allow photos and videos', body: 'Allow school to share photos/videos of my child (e.g. class activities).', icon: 'image' },
      { key: 'names', title: 'Allow name in class lists', body: "Show my child's name to other parents in the same class.", icon: 'people' },
      { key: 'contact', title: 'Allow use for school communications', body: 'Allow school to contact me via email, SMS or WhatsApp.', icon: 'mail' },
    ] as readonly { key: string; title: string; body: string; icon: IconName }[],
    digest: {
      title: 'Sunday WhatsApp Digest',
      body: "Receive a weekly summary of your child's progress, upcoming activities, and announcements.",
      phone: '+256 772 345 678',
      note: 'Weekly digest will be sent every Sunday at 7:00 PM.',
      whatsapp: require('./images/consent-whatsapp.png') as Photo,
      flag: require('./images/consent-flag-ug.png') as Photo,
    },
    alerts: [
      { key: 'announcements', title: 'Important Announcements', body: 'School news, closures and important updates.', icon: 'megaphone' },
      { key: 'reminders', title: 'Assignment Reminders', body: 'Reminders for upcoming homework and deadlines.', icon: 'doc' },
      { key: 'grades', title: 'Grades & Report Cards', body: 'When new marks or report cards are released.', icon: 'chart' },
      { key: 'messages', title: 'Teacher Messages', body: 'Notifications for new messages from teachers.', icon: 'chat' },
    ] as readonly { key: string; title: string; body: string; icon: IconName }[],
    account: [
      { label: 'Name', value: 'Mary N.', icon: 'person' },
      { label: 'Email', value: 'mary.n@example.com', icon: 'mail' },
      { label: 'Phone Number', value: '+256 772 345 678', icon: 'phone' },
      { label: 'Change Password', value: '', icon: 'lock' },
    ] as readonly { label: string; value: string; icon: IconName }[],
  },
};

export type ParentPortal = typeof parent;

export interface NavItem {
  label: string;
  icon: IconName;
  href: string;
}

export interface TableColumn {
  label: string;
  /** Share of the table's width (flex). */
  flex: number;
}

export interface AdminTable {
  key: string;
  title: string;
  subtitle: string;
  icon: IconName;
  tone: SubjectTone;
  actions: readonly string[];
  columns: readonly TableColumn[];
  rows: readonly (readonly string[])[];
}

/** Sample values for the Academics design; its layout lives in features/school/academics/academicsShape. */
const ACADEMICS_COUNTS: Readonly<Record<string, number>> = { campuses: 3, years: 2, terms: 6, streams: 12, subjects: 48, grading: 4, competency: 5 };
const ACADEMICS_ROWS: Readonly<Record<string, readonly (readonly string[])[]>> = {
  campuses: [
          ['1', 'Main Campus', 'Kampala', 'Primary & Secondary', '845', 'Active'],
          ['2', 'West Campus', 'Entebbe', 'Primary', '320', 'Active'],
          ['3', 'North Campus', 'Gulu', 'Secondary', '280', 'Active'],
        ],
  years: [
          ['1', '2026', 'Jan 5, 2026', 'Dec 18, 2026', '3', 'Current'],
          ['2', '2025', 'Jan 6, 2025', 'Dec 19, 2025', '3', 'Closed'],
        ],
  terms: [
          ['1', 'Term 1', '2026', 'Jan 5, 2026', 'Apr 16, 2026', 'Current'],
          ['2', 'Term 2', '2026', 'May 4, 2026', 'Aug 13, 2026', 'Upcoming'],
          ['3', 'Term 3', '2026', 'Aug 31, 2026', 'Dec 18, 2026', 'Upcoming'],
        ],
  streams: [
          ['1', 'Nursery', 'Main', '60', 'Active'],
          ['2', 'Primary 1', 'A, B', '120', 'Active'],
          ['3', 'Primary 2', 'A, B', '118', 'Active'],
          ['4', 'Primary 3', 'A, B', '125', 'Active'],
        ],
  subjects: [
          ['1', 'English', 'ENG', 'P1 – S6', 'Core', 'Active'],
          ['2', 'Mathematics', 'MATH', 'P1 – S6', 'Core', 'Active'],
          ['3', 'Science', 'SCI', 'P1 – S6', 'Core', 'Active'],
          ['4', 'Social Studies', 'SST', 'P1 – S6', 'Core', 'Active'],
          ['5', 'Christian Religious Ed.', 'CRE', 'P1 – S6', 'Core', 'Active'],
        ],
  grading: [
          ['1', 'UNEB (U–9)', 'National', 'P1 – S4', 'Active'],
          ['2', 'KCSE', 'National', 'S5 – S6', 'Active'],
          ['3', 'IGCSE (A–G)', 'International', 'S1 – S6', 'Active'],
          ['4', 'Custom (Percent)', 'Custom', 'All Grades', 'Active'],
        ],
  competency: [
          ['1', 'UNESCO 4C', '4', 'Active'],
          ['2', 'Uganda CBC', '5', 'Active'],
          ['3', 'IGCSE Competencies', '5', 'Active'],
          ['4', 'Custom School Framework', '5', 'Active'],
        ],
};

export const school = {
  onboarding: {
    me: { name: 'Admin User', role: 'School Administrator', initial: 'A', notifications: 3 },
    nav: [
      { label: 'Dashboard', icon: 'home', href: '/' },
      { label: 'Onboarding', icon: 'scan', href: '/admin/onboarding' },
      { label: 'School Profile', icon: 'people', href: '/admin/settings' },
      { label: 'Classes', icon: 'columns', href: '/admin/rosters' },
      { label: 'Teachers', icon: 'people', href: '/admin/rosters' },
      { label: 'Students', icon: 'people', href: '/admin/rosters' },
      { label: 'Calendar', icon: 'calendar', href: '/admin/timetable' },
      { label: 'Reports', icon: 'chart', href: '/admin/attendance' },
      { label: 'Billing', icon: 'wallet', href: '/admin/accounting' },
      { label: 'Settings', icon: 'settings', href: '/admin/settings' },
    ] as readonly NavItem[],
    steps: [
      { title: 'School Profile & Branding', short: 'School Profile & Branding', body: 'Add your school details and customize your profile.' },
      { title: 'Curriculum Template', short: 'Curriculum Template', body: 'Choose and configure your national curriculum.' },
      { title: 'Import Students & Teachers', short: 'Import Students & Teachers', body: 'Use our smart CSV import to add your school roster.' },
      { title: 'Activate Subscription', short: 'Activate Subscription', body: 'Start your plan or claim existing teacher class spaces.' },
    ],
    profile: {
      name: 'Green Valley Primary School',
      type: 'Primary School',
      types: ['Primary School', 'Secondary School', 'Primary & Secondary', 'Nursery School'],
      country: 'Uganda',
      countries: ['Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Nigeria', 'Ghana'],
      city: 'Kampala',
      address: '123 Acacia Road, Kampala',
      motto: 'Learning Today, Leading Tomorrow',
      website: 'https://www.greenvalley.edu.ug',
      primary: '#1E40AF',
      secondary: '#F59E0B',
      crest: require('./images/sa-crest.png') as Photo,
      banner: require('./images/sa-banner.png') as Photo,
    },
    curricula: [
      { key: 'uneb', name: 'UNEB', body: 'Uganda National Curriculum\n(Primary & Secondary)', flag: require('./images/sa-flag-uneb.png') as Photo },
      { key: 'kcse', name: 'KCSE', body: 'Kenya National Curriculum\n(Primary & Secondary)', flag: require('./images/sa-flag-kcse.png') as Photo },
      { key: 'waec', name: 'WAEC', body: 'West African Examinations Council\n(Primary & Secondary)', flag: require('./images/sa-flag-waec.png') as Photo },
      { key: 'igcse', name: 'IGCSE', body: 'Cambridge International\n(Primary & Secondary)', flag: require('./images/sa-flag-igcse.png') as Photo },
      { key: 'ib', name: 'IB', body: 'International Baccalaureate\n(Primary & Secondary)', flag: require('./images/sa-flag-ib.png') as Photo },
      { key: 'custom', name: 'Custom', body: 'Create your own\ncurriculum structure', flag: null },
    ] as readonly { key: string; name: string; body: string; flag: Photo | null }[],
    importTabs: ['Students', 'Teachers', 'Classes (Optional)'],
    importChecks: [
      'Include at least: first name, last name, class',
      'Optional: admission number, gender, date of birth',
      'Our system will validate and detect errors',
      'You can review and edit before final import',
    ],
    plans: [
      {
        key: 'school',
        name: 'School Plan',
        body: 'Full access for your school with unlimited classes, teachers and students.',
        yearly: 199,
        monthly: 19,
        recommended: true,
        features: ['Unlimited classes', 'Unlimited teachers', 'Unlimited students', 'Reports and analytics', 'Priority support'],
      },
      {
        key: 'starter',
        name: 'Starter Plan',
        body: 'For small schools getting started.',
        yearly: 49,
        monthly: 5,
        recommended: false,
        features: ['Up to 10 classes', 'Up to 5 teachers', 'Up to 300 students', 'Basic reports', 'Email support'],
      },
    ],
    art: require('./images/sa-school-art.png') as Photo,
  },
  academics: {
    me: { name: 'Mary N.', role: 'School Administrator', avatar: face.mary, initial: 'A', notifications: 3 },
    school: 'Grace Point Christian School',
    matrices: 6,
    nav: ACADEMICS_NAV,
    sections: ACADEMICS_SECTIONS.map((s) => ({ ...s, count: ACADEMICS_COUNTS[s.key] ?? 0 })),
    tabs: ACADEMICS_TABS,
    quickActions: ACADEMICS_QUICK_ACTIONS,
    tables: ACADEMICS_TABLES.map((t): AdminTable => ({ ...t, rows: ACADEMICS_ROWS[t.key] ?? [] })),
  },
};

export type SchoolAdmin = typeof school;
