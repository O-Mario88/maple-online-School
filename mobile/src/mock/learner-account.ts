/** Sample data for the learner's Account pages: profile, learning preferences and settings for Amina (Primary 6). */
export const learnerAccount = {
  profile: { name: 'Amina Nakato', grade: 'Primary 6', school: 'Kampala Hill School', learnerId: 'MLP-UG-2026-004812', guardian: 'Grace Nakato (Mum) · approved', phone: '+256 772 ••• 418' },
  grades: ['Primary 5', 'Primary 6', 'Primary 7', 'S1', 'S2'],
  curriculum: 'UNEB · Uganda competency-based curriculum',
  subjects: ['Mathematics', 'English', 'Integrated Science', 'Social Studies', 'Religious Education', 'Kiswahili'],
  chosen: ['Mathematics', 'English', 'Integrated Science', 'Social Studies'],
  goals: [15, 30, 45, 60],
  goal: 30,
  studyTimes: ['Before school', 'After school', 'Evening', 'Weekends'],
  studyTime: 'After school',
  settings: [
    { label: 'Low-data mode', detail: 'Audio and whiteboard only in live classes', on: true },
    { label: 'Download lessons on Wi-Fi only', detail: 'Saves your mobile data', on: true },
    { label: 'Study reminders', detail: 'A nudge at your study time', on: true },
    { label: 'Show me on squad leaderboards', detail: 'Squad mates see your weekly points', on: true },
    { label: 'Messages from teachers by SMS', detail: 'When you have no internet', on: false },
  ],
};
