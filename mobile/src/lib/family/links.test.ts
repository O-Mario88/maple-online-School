import { linkStatus, relationshipLabel } from './links';

describe('linkStatus', () => {
  it.each([
    ['pending', 'Waiting for the school', 'warning'],
    ['approved', 'Confirmed', 'good'],
    ['declined', 'Declined', 'danger'],
  ] as const)('labels %s links', (status, label, tone) => {
    expect(linkStatus(status)).toEqual({ label, tone });
  });
});

describe('relationshipLabel', () => {
  it('capitalises the relationship', () => {
    expect(relationshipLabel('mother')).toBe('Mother');
    expect(relationshipLabel('')).toBe('Guardian');
  });
});
