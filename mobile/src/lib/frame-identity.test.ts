import { frameIdentity } from './frame-identity';

const fixture = { name: 'Mary N.', role: 'School Administrator', avatar: 7, initial: 'A', notifications: 3 };

describe('who a designed frame shows as signed in', () => {
  it('shows the signed-in person, with their initial and no one else’s photo', () => {
    expect(frameIdentity(fixture, 'Dr. James Mukasa')).toEqual({ ...fixture, name: 'Dr. James Mukasa', initial: 'J', avatar: undefined });
  });

  it('keeps the photo when the signed-in person is the one pictured', () => {
    expect(frameIdentity(fixture, 'Mary N.')).toEqual({ ...fixture, initial: 'M' });
  });

  it('falls back to the sample person when nobody is signed in', () => {
    expect(frameIdentity(fixture, undefined)).toEqual(fixture);
    expect(frameIdentity(fixture, '   ')).toEqual(fixture);
  });

  it('skips titles when choosing the initial', () => {
    expect(frameIdentity(fixture, 'Mrs. Grace Achieng').initial).toBe('G');
  });
});
