import { compactAmount, countdown, processingSteps, scaleBars, sourceLinkError } from './teacher-home';

describe('sourceLinkError', () => {
  test('accepts YouTube playlist and video links', () => {
    expect(sourceLinkError('youtube', 'https://www.youtube.com/playlist?list=PL123')).toBeNull();
    expect(sourceLinkError('youtube', 'https://youtu.be/abc123')).toBeNull();
  });

  test('accepts Google Classroom links', () => {
    expect(sourceLinkError('classroom', 'https://classroom.google.com/c/MTIz')).toBeNull();
  });

  test('asks for a link when the box is empty', () => {
    expect(sourceLinkError('youtube', '   ')).toBe('Paste a link first.');
  });

  test('rejects text that is not a web link', () => {
    expect(sourceLinkError('youtube', 'maths videos')).toBe('That doesn’t look like a web link. It should start with https://');
  });

  test('rejects a link from the wrong site', () => {
    expect(sourceLinkError('youtube', 'https://classroom.google.com/c/MTIz')).toBe('Use a YouTube playlist or video link.');
    expect(sourceLinkError('classroom', 'https://youtu.be/abc123')).toBe('Use a Google Classroom link.');
  });
});

const MIN = 60_000;

describe('countdown', () => {
  test('counts whole minutes up to the start, rounding up', () => {
    expect(countdown(25 * MIN, 0)).toEqual({ minutes: 25, label: 'in 25 minutes', live: false });
    expect(countdown(25 * MIN, 30_000)).toEqual({ minutes: 25, label: 'in 25 minutes', live: false });
  });

  test('says one minute in the singular', () => {
    expect(countdown(MIN, 0).label).toBe('in 1 minute');
  });

  test('is live once the start time has passed', () => {
    expect(countdown(0, 0)).toEqual({ minutes: 0, label: 'live now', live: true });
    expect(countdown(0, 5 * MIN).live).toBe(true);
  });
});

describe('compactAmount', () => {
  test('shortens thousands and millions', () => {
    expect(compactAmount(150_000)).toBe('150K');
    expect(compactAmount(1_680_000)).toBe('1.68M');
    expect(compactAmount(2_000_000)).toBe('2M');
  });

  test('leaves small amounts and zero alone', () => {
    expect(compactAmount(0)).toBe('0');
    expect(compactAmount(950)).toBe('950');
  });
});

describe('scaleBars', () => {
  test('scales each value against the largest', () => {
    expect(scaleBars([110, 220, 0])).toEqual([0.5, 1, 0]);
  });

  test('returns zeros when every value is zero', () => {
    expect(scaleBars([0, 0])).toEqual([0, 0]);
  });
});

describe('processingSteps', () => {
  const steps = [2, 8, 18];

  test('marks finished, running and waiting steps', () => {
    expect(processingSteps(steps, 9)).toEqual(['done', 'done', 'running']);
    expect(processingSteps(steps, 0)).toEqual(['running', 'waiting', 'waiting']);
  });

  test('finishes every step at or after the last step time', () => {
    expect(processingSteps(steps, 18)).toEqual(['done', 'done', 'done']);
  });
});
