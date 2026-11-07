import { requestStatus } from './requests';

describe('career requests', () => {
  test('each status reads as a plain answer from the career team', () => {
    expect(requestStatus('received')).toEqual({ label: 'Sent to the career team', tone: 'grey' });
    expect(requestStatus('planned')).toEqual({ label: 'Planned', tone: 'green' });
    expect(requestStatus('declined')).toEqual({ label: 'Not planned for now', tone: 'amber' });
  });
});
