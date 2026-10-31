import { clockOf, filterParticipants, searchTranscript, type Participant } from './classroom';

const people: Participant[] = [
  { name: 'Ms. Sarah Kimani', role: 'teacher', mic: 'on', hand: false },
  { name: 'Daniel Okello', role: 'student', mic: 'off', hand: true },
  { name: 'Aisha Bello', role: 'student', mic: 'on', hand: false },
];

describe('clockOf', () => {
  it('shows minutes and seconds under an hour, and hours once past one', () => {
    expect(clockOf(42 * 60 + 18)).toBe('42:18');
    expect(clockOf(2 * 3600)).toBe('2:00:00');
    expect(clockOf(3600 + 65)).toBe('1:01:05');
  });
});

describe('filterParticipants', () => {
  it('filters by name and by the All, Raised hand and Teachers chips', () => {
    expect(filterParticipants(people, '', 'all').length).toBe(3);
    expect(filterParticipants(people, '', 'hand').map((p) => p.name)).toEqual(['Daniel Okello']);
    expect(filterParticipants(people, '', 'teachers').map((p) => p.name)).toEqual(['Ms. Sarah Kimani']);
    expect(filterParticipants(people, 'aish', 'all').map((p) => p.name)).toEqual(['Aisha Bello']);
  });
});

describe('searchTranscript', () => {
  it('keeps lines containing every search word, ignoring case', () => {
    const lines = [
      { at: '10:12', who: 'Ms. Sarah Kimani', text: 'Today we add and subtract fractions.' },
      { at: '10:18', who: '', text: 'First we need a common denominator.' },
    ];
    expect(searchTranscript(lines, 'COMMON denominator').map((l) => l.at)).toEqual(['10:18']);
    expect(searchTranscript(lines, '').length).toBe(2);
  });
});
