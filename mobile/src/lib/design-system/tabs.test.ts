import { nextTabKey } from './tabs';

const tabs = [{ key: 'plan' }, { key: 'subjects' }, { key: 'schedule' }] as const;

describe('tab keyboard movement', () => {
  it('moves to the next tab with the right arrow', () => {
    expect(nextTabKey(tabs, 'plan', 'ArrowRight')).toBe('subjects');
  });

  it('wraps from the last tab to the first', () => {
    expect(nextTabKey(tabs, 'schedule', 'ArrowRight')).toBe('plan');
  });

  it('wraps from the first tab to the last with the left arrow', () => {
    expect(nextTabKey(tabs, 'plan', 'ArrowLeft')).toBe('schedule');
  });

  it('jumps to the ends with Home and End', () => {
    expect(nextTabKey(tabs, 'subjects', 'Home')).toBe('plan');
    expect(nextTabKey(tabs, 'subjects', 'End')).toBe('schedule');
  });

  it('ignores other keys', () => {
    expect(nextTabKey(tabs, 'subjects', 'Enter')).toBeNull();
  });
});
