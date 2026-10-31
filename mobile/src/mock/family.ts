/** Parent fixtures (design builds only; never bundled in deployment). */

export const children = [
  { id: 'k1', name: 'Amina Nakato', school: 'Kampala Hill School', class: 'S3 East', attendance: '18 of 20 days', average: 78 },
  { id: 'k2', name: 'Joseph Nakato', school: 'Mengo Primary School', class: 'P5 Blue', attendance: '20 of 20 days', average: 84 },
];

export const weekly = {
  child: 'Amina Nakato',
  week: 'Week of 26 Oct',
  summary: 'Amina mastered factorising this week and handed in all her work. She missed Tuesday with a fever.',
  voiceNote: { from: 'Mr. Daniel Ssempala', seconds: 20, transcript: 'Amina is flying in algebra. Please help her practise ten minutes of quadratics on Saturday.' },
  tips: ['Ask Amina to explain one maths problem to you over supper', 'Twenty minutes of reading before bed, three times a week'],
};

export const attendanceFeed = [
  { day: 'Fri 30 Oct', status: 'present', detail: 'Arrived 07:42' },
  { day: 'Thu 29 Oct', status: 'present', detail: 'Arrived 07:50' },
  { day: 'Wed 28 Oct', status: 'late', detail: 'Arrived 08:21 · bus delay' },
  { day: 'Tue 27 Oct', status: 'excused', detail: 'Sick · excused by you' },
  { day: 'Mon 26 Oct', status: 'present', detail: 'Arrived 07:38' },
];

export const approvals = [
  { id: 'ap1', child: 'Amina Nakato', item: 'Homework rescue: Physics (30 min)', teacher: 'Mr. Isaac Mugisha', verified: true, rating: 4.9, priceUGX: 10000, requested: 'Today 17:05' },
  { id: 'ap2', child: 'Amina Nakato', item: 'UCE Biology revision bootcamp', teacher: 'Ms. Grace Atim', verified: true, rating: 4.9, priceUGX: 35000, requested: 'Yesterday' },
];

export const officeHours = [
  { teacher: 'Mr. Daniel Ssempala', slot: 'Wed 4 Nov · 16:30', place: 'Video call' },
  { teacher: 'Mrs. Harriet Akello', slot: 'Thu 5 Nov · 15:00', place: 'At school' },
];

export const settings = {
  digestPhone: '+256 772 *** 481',
  digestDay: 'Sunday 18:00',
  channels: [{ label: 'WhatsApp weekly digest', on: true }, { label: 'SMS when my child is absent', on: true }, { label: 'Email report cards', on: false }],
  privacy: [{ label: 'Show my child on class leaderboards', on: false }, { label: 'Let teachers share my child’s work in class', on: true }],
};
