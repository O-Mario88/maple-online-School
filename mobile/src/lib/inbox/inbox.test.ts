import { appLink, timeAgo } from './inbox';

describe('timeAgo', () => {
  const now = new Date('2026-10-30T12:00:00Z');
  it.each([
    ['2026-10-30T11:59:40Z', 'Just now'],
    ['2026-10-30T11:55:00Z', '5 min ago'],
    ['2026-10-30T09:00:00Z', '3 h ago'],
    ['2026-10-29T10:00:00Z', 'Yesterday'],
  ])('%s reads as "%s"', (iso, want) => {
    expect(timeAgo(iso, now)).toBe(want);
  });

  it('shows a date for anything older', () => {
    expect(timeAgo('2026-10-20T10:00:00Z', now)).toMatch(/20/);
  });
});

describe('appLink', () => {
  it('keeps paths inside the app', () => {
    expect(appLink('/fees')).toBe('/fees');
    expect(appLink('/')).toBe('/');
  });

  it('refuses anything that could leave the app', () => {
    expect(appLink('https://evil.example')).toBe('/');
    expect(appLink('//evil.example/x')).toBe('/');
    expect(appLink('javascript:alert(1)')).toBe('/');
    expect(appLink('')).toBe('/');
  });
});
